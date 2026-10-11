---
title: "Treat your prompts like code"
date: 2026-10-11
draft: false
tags: ["opinion"]
description: "Prompt engineering is testing, not magic phrases. "
---

For a long time, my approach to prompting was basically vibes.[^vibes] I'd write some
instructions, look at what came back, tweak a word or two, and stop when the
output _looked_ right. Sometimes that worked. More often it worked right up
until it didn't, and when it broke I had no idea why.

Mitchell Hashimoto has a name for this: [blind prompting](https://mitchellh.com/writing/prompt-engineering-vs-blind-prompting).
His argument is that guessing at instructions and hoping they hold up is
**not** the same thing as engineering a reliable feature. Real prompt
engineering looks a lot more like normal software work: you define the problem,
build test cases, compare candidates, measure, and iterate.

That framing stuck with me, because it turns prompting from something you
_feel_ your way through into something you can actually _reason_ about. The
difference looks roughly like this:

| Blind prompting                     | Prompt engineering                |
| ----------------------------------- | --------------------------------- |
| Guess what instructions might work  | Define the exact problem          |
| Try prompts until one looks good    | Test multiple prompt versions     |
| Judge a few outputs by eye          | Measure correctness on test cases |
| Assume the prompt will keep working | Check failures and improve it     |
| Focus only on answer quality        | Balance accuracy, cost, and speed |

In the rest of this post I want to walk through how I approach this now, using
one small and deliberately boring example. I'm not going to claim it's the only
way to do it, and I'm sure my approach will keep changing. But it's been a
**huge** improvement over vibes.

---

## Step 1: Pick One Specific Problem

Let's say you're building a university calendar app. Students type events in
plain English, and the app needs to pull out the date.

Input:

```
Study session with Sarah tomorrow at 14:00
```

Expected output:

```
tomorrow
```

The temptation here is to ask the model to extract _everything_ at once: the
event name, date, time, location, and attendees. I'd resist that. **Start with
one task.**

The reason is simple. When a single-task prompt fails, you know exactly what
failed. When a five-task prompt fails, you have five suspects, and you'll spend
your afternoon interrogating all of them.[^suspects]

---

## Step 2: Write Several Candidates

Once the problem is narrow, the next instinct is to write _the_ prompt. But at
risk of stating the obvious, your first prompt is probably not your best one.
So instead of writing one, write a few reasonable alternatives up front:

```python
prompts = [
    "Find the date in the text.",
    "Extract the date or day mentioned in the event.",
    "Return only the date phrase from the event description.",
]
```

To a person, these look nearly identical. To a model, they might not be. I've
been surprised more than once by which phrasing wins, and it is _not_ reliably
the longest or most detailed one.[^pattern] **Don't assume. Test.**

---

## Step 3: Build a Test Dataset

Of course, "test" only means something if you have something to test
_against_. That's where a test dataset comes in. It's just a list of inputs
paired with the answers you expect:

```python
test_cases = [
    {"input": "Dinner next Tuesday", "expected": "next Tuesday"},
    {"input": "Meeting on 11/04", "expected": "11/04"},
    {"input": "Call tomorrow at 10 AM", "expected": "tomorrow"},
    {"input": "Finish assignment by Friday", "expected": "Friday"},
]
```

**This is the step that actually separates engineering from guessing.** A
prompt can nail one example and fall over on the next. With a shared dataset,
every candidate sees the same inputs, so the comparison is finally fair.

Hashimoto suggests starting small and growing the set as you discover edge
cases, and I agree. You don't need a thousand examples on day one. You need
enough to cover the different ways people _actually_ phrase things, including
the sloppy ways.[^sloppy]

---

## Step 4: Let Code Do the Testing

Now you have candidates and a dataset, and you could run every combination by
hand. I tried that. Past a handful of examples it's _excruciating_,[^excruciating] and you
start cutting corners without noticing. So automate it.

The Python below is simplified. It assumes an `ask_ai()` function that sends a
prompt to your model and returns the text response.

```python
def normalize(text):
    return text.strip().rstrip(".").lower()


def evaluate_prompt(prompt, test_cases):
    correct = 0
    for case in test_cases:
        question = (
            f"{prompt}\n"
            f"Event: {case['input']}\n"
            "Answer:"
        )
        actual = ask_ai(question)
        if normalize(actual) == normalize(case["expected"]):
            correct += 1
    accuracy = correct / len(test_cases) * 100
    return accuracy
```

Then compare the candidates:

```python
for prompt in prompts:
    score = evaluate_prompt(prompt, test_cases)
    print(f"{score:.1f}% — {prompt}")
```

This isn't a complete program, and you'll need to implement `ask_ai()` against
whatever model provider you use. But the code isn't really the point. The point
is that every prompt runs against the same dataset, and you come away with
**a number instead of an impression**.

---

## Step 5: Improve Using Evidence

And once you have numbers, things get a lot more interesting. Suppose your
results look something like this:

| Prompt                                                 | Accuracy |
| ------------------------------------------------------ | -------- |
| "Find the date in the text."                           | 60%      |
| "Extract the date phrase. Return only that phrase."    | 80%      |
| "Return the date phrase, or `NONE` if no date exists." | 90%      |

These numbers are made up,[^numbers] but they show the shift I care about. _"Which
prompt feels better?"_ becomes a question with an actual answer.

One thing worth reiterating: **test the ugly cases too.** Events with no date,
ambiguous dates, weird wording. A prompt that only ever sees easy examples will
score beautifully in testing and then quietly fail in real use.

### Add Examples When Necessary

If a prompt keeps tripping over the same kind of input, one of the first things
I reach for is few-shot prompting. That just means putting example inputs and
outputs directly in the prompt:

```python
prompt = """Extract the date phrase from the event description.
Return only the phrase. If no date exists, return NONE.

Example:
Input: Dinner next Tuesday
Output: next Tuesday

Example:
Input: Call tomorrow at 10 AM
Output: tomorrow

Example:
Input: Discuss project progress
Output: NONE

Now process this event:
Input: {event}
Output:"""
```

This often helps. But every example adds tokens to _every single request_, and
that adds up. So I treat a few-shot prompt like any other candidate: it goes
through the same test harness, and **it has to earn its place**.

---

## Step 6: Weigh Accuracy Against Cost

That last point generalizes. Accuracy is only one axis, and the most accurate
prompt isn't automatically the right one. Consider:

- **Prompt A:** 90% accuracy, low cost.
- **Prompt B:** 93% accuracy, twice the cost.

For a low-stakes task, I'd probably take Prompt A and not think about it
again. If mistakes actually hurt users, those extra three points might be
worth paying for. There's no universal answer here, and I'm _very_ suspicious
of anyone who claims there is.[^course]

While you're at it, measure response time and token usage too. And **test on
the model you actually plan to ship with.** A prompt that works well on one
model can behave noticeably differently on another.

---

## Step 7: Verify the Output and Keep Going

Even after all of this, a prompt that tests well will _still_ produce wrong
answers sometimes. That's just the nature of these tools. So the last step is
to stop trusting the model blindly and build checks into the application
itself.

If the model should return a date phrase, make sure the output isn't empty and
looks the way you expect. If it generates code, parse it or run tests against
it.

```python
result = ask_ai(prompt.format(event=user_event))

if not result.strip():
    raise ValueError("AI returned an empty result")

if result.strip() not in {"NONE"} and len(result) > 100:
    raise ValueError("Unexpected output")

# Continue with further validation before using the result.
```

These checks only catch output that's _obviously_ broken. Passing them doesn't
mean the answer is right. If the output affects real users, you'll want
stronger validation than this.

And when a failure does slip through, that's not a dead end. It's new test
data. Save the input, add it to your dataset, and test your fix against it.
Over time the dataset becomes **a record of every way the prompt has ever
failed**, which is honestly one of the more useful things you'll end up with.[^museum]
(Just be careful not to store private user data while doing this.)

---

## Where I've Landed

Put together, the loop looks like this:

1. **Define the problem.** Be specific about what the model must do.
2. **Build test cases.** Inputs and their correct outputs.
3. **Test prompt versions.** Every candidate against the same examples.
4. **Measure and choose.** Balance correctness, speed, and cost.
5. **Verify and iterate.** Catch failures in production and feed them back
   into your tests.

I don't think prompt engineering is a collection of magic phrases, and I've
mostly stopped looking for them.[^expert] It's an _experimental process_. Define what
success looks like, test against it, and improve based on what you see.

This matters most when AI is wired into an actual application. **A prompt that
looks great in a demo is not necessarily one I'd trust in production**, and the
only way I've found to tell the difference is to test it.

[^vibes]: Vibes-driven development. I'm told it scales beautifully, right up
    until the first user shows up.

[^suspects]: Under a single desk lamp. The model never cracks. It just
    apologizes and confidently tells you something new.

[^pattern]: I'd love to tell you there's a pattern. If there is one, the model
    is keeping it to itself.

[^sloppy]: "dinner tmrw?? or thurs idk" is a real input you will receive,
    probably within the first hour.

[^excruciating]: Somewhere around the fortieth copy-paste you start to
    question your career, the model, and the concept of dates in general.

[^numbers]: Hypothetical, for illustration. Your numbers will depend on your
    model, your data, and probably the phase of the moon.

[^course]: Especially if they're also selling a course.

[^museum]: A small museum of failures, lovingly curated. Admission is free,
    but you have to promise not to laugh at the early exhibits.

[^expert]: "You are a world-class expert" remains undefeated in my heart, if
    not in my test results.
