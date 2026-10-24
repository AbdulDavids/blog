---
title: "Context engineering is memory management"
date: 2026-10-24
draft: false
tags: ["opinion"]
description: "An agent is a computer, in the hardware sense. The model is the CPU, the context window is RAM, tools are peripherals and your files are storage. Context engineering is the memory part of that build, and it's where most agents fall over."
---

Say you give an agent your team's documentation. All of it, pasted straight
into the context window, because it fits. Two hundred pages, about 300,000
tokens. You ask how refunds work on annual plans, and it gets the answer wrong.
The right page was in there, sitting somewhere in the middle. The model just
didn't use it.

The instinct is to fix the prompt. Add "read the documentation carefully", put
it in capitals, move it to the end. That rarely helps, because the prompt was
never the problem. The problem was everything around it: what the model could
see, how much of it there was, and where the right page sat.

This is the shift people mean by **context engineering**.[^tobi] Prompt
engineering asks _how should I phrase this?_ Context engineering asks _what can
the model see right now, and how did it get there?_ The first is a writing
problem. The second is a **systems** problem.

I think even that undersells it, though. Zoom out, and an agent isn't a prompt
with some tools attached. It's a **computer**, in the hardware sense. The model
is a processor. The context window is its RAM. Tools are peripherals, your files
are storage, and the harness that runs the whole thing is the motherboard
connecting it all.[^llmos]

Most people treat that as a cute metaphor. I want to take it literally, because
when you do, it keeps predicting the right engineering answer. Building with LLMs
starts to look less like writing messages and more like building a machine: you
pick parts, decide how they connect, and live with the bottlenecks.

In that picture, context engineering is **memory management**. It's the part
that bites hardest, so it's most of this post. But it's worth seeing the whole
machine first.

## An agent is a computer

Here's the machine, laid out like a block diagram.

{{< diagram src="llm-os.svg" >}}

And here's the parts list, with what each part means for an agent and what you
actually get to decide about it:

| Part | In an agent | What you decide |
| ---- | ----------- | --------------- |
| CPU | The model | Speed, capability and price per token |
| Firmware | The weights | Nothing. It ships with the chip and is frozen at its training date |
| Cache | The KV or prompt cache | What stays identical between calls |
| RAM | The context window | What's loaded right now |
| Storage | Files and knowledge bases | How it's laid out, so the agent can find things |
| Peripherals | Tools | Which devices to plug in, and what they send back |
| Network card | Web, APIs, other models | What the agent can reach outside the box |
| Clock | The agent loop | How many steps it runs, and when it stops |
| Cores | Subagents | Whether to split work across separate contexts |
| Motherboard | The harness | How all of the above is wired together |

What I like about this picture is that it shows where the work is. Most of us
don't build CPUs. We buy them from Anthropic, OpenAI or Google, and swap them
when a better one comes out. Everything else on that list is ours.

Anyone who has built a PC knows what follows from that. A fast CPU in a machine
with too little RAM and a slow disk is a slow machine. A benchmark of the chip
on its own doesn't tell you how the computer will perform. In my experience the
same is true of agents: the same model can feel brilliant in one harness and
useless in another, and the difference is almost never the model.

There's one more hardware fact worth knowing up front. On every tick of the
clock, every step of the agent loop, the CPU reads **all of RAM** from the start
and produces a small amount of output. Agents read far more than they write.
Like most real computers, they're limited by memory, not by compute. That's why
memory is where we start.

## RAM is smaller than the spec sheet says

The obvious objection is that context windows are huge now. Hundreds of
thousands of tokens, sometimes a million. Why not just load everything?

Because the advertised size isn't the usable size. Real RAM works the same
whether it's 10% full or 90% full. Context doesn't.

In 2023, researchers at Stanford showed that models are best at using
information at the **start or end** of their input, and noticeably worse when
it sits in the middle, even with models built for long contexts.[^middle] In
July 2025, Chroma tested 18 models, including Claude, GPT, Gemini and Qwen, and
found that "performance grows increasingly unreliable as input length grows",
even on very simple tasks.[^rot] A few of their results stuck with me:

- **One irrelevant but similar passage hurts.** Adding a single distractor
  reduced accuracy compared with giving the model only the relevant text. Four
  distractors made it worse.
- **Focused beats full, everywhere.** On a long-memory benchmark, they gave
  models either the full conversation history, about 113,000 tokens, or just the
  roughly 300 tokens that were relevant. Every model did better with the
  focused version.
- **Even copying gets worse.** Asked to repeat a long sequence of words with one
  odd word inserted, every model degraded as the sequence got longer.

Anthropic describes this as an "attention budget": every token you add draws a
little from a fixed pool of attention, so each token makes the others slightly
harder to see.[^anthropic] Loosely, that's what attention is. Every token's weight
is relative to all the others, so adding noise dilutes the signal.

So the right mental model is a machine whose RAM gets **slower and less reliable
the fuller it is**. On that machine, "can I fit it?" is the wrong question. The
question is "what's the smallest working set that does the job?"

## The cache: why layout order matters

Real CPUs have a small, fast cache that saves them from going back to RAM for
data they've just used. Agents have one too.

When a model processes your input, it builds an internal representation of each
token called the KV cache. If the next request starts with **exactly the same
prefix**, the provider can reuse that work instead of redoing it. This is what
prompt caching is, and the discount is large.

{{< diagram src="cache.svg" >}}

The Manus team wrote one of the best pieces on this. They argue that "the KV-cache
hit rate is the single most important metric for a production-stage AI agent."[^manus]
Their numbers show why. In Manus, the average ratio of input to output tokens is
around 100:1, because every tick re-reads the whole history. And with Claude
Sonnet at the time, "cached input tokens cost 0.30 USD/MTok, while uncached ones
cost 3 USD/MTok", a 10x difference. On a memory-bound machine, the cache is
where the money is.

That turns context layout into a cache design problem:

- **Keep the prefix stable.** One changed token invalidates the cache from that
  point on. Their example of a classic mistake is a timestamp, precise to the
  second, at the top of the system prompt.
- **Make context append-only.** Don't go back and edit earlier steps. Even JSON
  serialisation with unstable key order can silently break the cache.
- **Don't swap tools mid-task.** Tool definitions sit near the front of the
  context, so changing them invalidates everything after. Manus keeps every tool
  defined and constrains which ones the model can choose instead.

The general rule I take from this: **order your context from most stable to
least stable.** System instructions, then tool definitions, then the
always-loaded index of your knowledge base, then the task, then the volatile
stuff that changes every step. That isn't a writing choice, it's a performance
decision.

## Paging: moving data in and out

If RAM is small and unreliable, you need paging: bring data in from storage when
you need it, and push it out when you're done.

MemGPT, a 2023 paper from Berkeley, built exactly this, and called itself
"Towards LLMs as Operating Systems."[^memgpt] It splits memory into a main
context, which is the prompt, and an external context, which is a database the
model can search. The model manages its own memory through function calls. When
the prompt passes a warning threshold, around 70% full in their example, the
system tells the model it's under memory pressure so it can save anything
important. When it fills up, the oldest messages are evicted and replaced with a
running summary.

You've probably seen the same thing in coding agents. Claude Code compacts the
conversation, summarising it, when it gets close to the limit.[^langchain]

The part I find most useful is what Manus calls **restorable compression**. When
they compact, they don't just summarise and hope. "The content of a web page
can be dropped from the context as long as the URL is preserved, and a
document's contents can be omitted if its path remains available."[^manus]

That's a page table. The body of the page is evicted from RAM, but its address
stays, so the model can fault it back in later if it turns out to matter.

{{< diagram src="paging.svg" >}}

The hardware framing makes the asymmetry obvious. A summary is lossy and
permanent. A path is tiny and lossless. Whenever you're about to drop something
from context, the question is whether you're keeping its address. If the data
lives in storage with a stable path, eviction is almost free.

This is why **a file path is one of the most valuable things you can put in
context**. It's a pointer. Ten tokens that stand in for ten thousand.

## Storage: how to lay out a knowledge base

So far this is all about RAM. But the part I most want to talk about is storage,
because that's where I see the biggest gap between what people build and what
works.

The default way to give an agent knowledge is retrieval-augmented generation,
or RAG. You split your documents into chunks, embed them, and at query time you
paste in the chunks that look most similar to the question.

RAG is useful, but as a storage design it's odd. It reads the disk in random
500-token fragments, picked by how similar they _sound_ to the question rather
than by what the task needs. Each chunk arrives without its surroundings, so the
model doesn't know what document it came from or what's next to it. And it's the
same retrieval every time. Karpathy puts this well: with RAG, "the LLM is
rediscovering knowledge from scratch on every question."[^wiki]

Coding agents went a different way. Boris Cherny, who created Claude Code, has
said the team started with a vector database for retrieval and then tried agentic
search, letting the model use glob and grep to find files itself, and that it
"outperformed everything else by a lot."[^cherny] He's been open that the
evidence was mostly internal vibes, not a rigorous benchmark. But nearly every
coding agent has ended up in the same place, which tells you something.

The difference is that agentic search uses the **structure** of the disk. Code
already has a hierarchy: directories, files, functions. Names mean something.
The agent can look at a folder, decide what's relevant, and go deeper. That's
progressive disclosure, and it's what I think every knowledge base should copy.

### Progressive disclosure

Progressive disclosure means showing the agent a small summary first and
letting it ask for more. Thoughtworks put it on their Technology Radar as
"progressive context disclosure":[^radar] a light discovery step first, then
detailed material only once it's relevant.

{{< diagram src="progressive-disclosure.svg" >}}

Anthropic's Agent Skills are the cleanest example I know of.[^skills] They load
in three levels:

1. **Metadata.** Every skill's name and a one-line description sit in the system
   prompt from the start. This is enough for the model to know when a skill
   might be useful.
2. **The skill file.** If a skill looks relevant, the model reads its full
   `SKILL.md`.
3. **Linked files.** If the skill points to more detail, such as a reference
   for one specific form, the model reads that only when it needs it.

Anthropic says that because of this, "the amount of context that can be bundled
into a skill is effectively unbounded." That's the promise of good storage. RAM
stays small, and the disk can be as big as you like, as long as the hierarchy is
good.

### Fan-out: your knowledge base is a B-tree

Here's where I think the hardware view pays off most.

Databases store indexes on disk as B-trees. A B-tree is a very wide, very
shallow tree. Each node holds many keys, and the tree stays only a few levels
deep, because every level means another slow disk read. The design goal is to
**reach any record in as few reads as possible**, where each read is a whole
block.

An agent reading a knowledge base has exactly that cost model. Every hop is a
tool call, so it adds latency. Every file it opens costs tokens, roughly in
proportion to its size. So you want few hops, and each hop should be cheap.

Some rough numbers make this concrete. Say you have 200 pages of documentation
at about 1,500 tokens each:

| Approach | What the agent reads | Tokens |
| -------- | -------------------- | ------ |
| Load everything | All 200 pages | ~300,000 |
| Walk the tree | Top index, one section index, one page | ~2,300 |

That's over a hundred times less, and the 2,300 tokens are almost all signal.
Better still, the cost barely grows. With 20 entries per index and three levels,
you can reach 8,000 pages and the agent still reads only three indexes and a
page. Like a B-tree, the cost grows with the **depth** of the tree, not its
size.

The B-tree also tells you the trade-off. Wider indexes mean fewer hops, but each
index costs more tokens to read and gets harder to scan. Narrower indexes are
cheap to read, but the agent has to make more hops. In practice I've found that
something like 10 to 30 entries per index, two or three levels deep, is a good
range, but it depends on your content.

### Information scent

The tree only works if the agent picks the right branch at each level. How does
it decide?

There's an idea from human-computer interaction research that explains this
well. In the 1990s, Peter Pirolli and Stuart Card at Xerox PARC proposed
**information foraging theory**.[^foraging] Their observation was that people
look for information the way animals look for food. They follow cues that
suggest a path leads somewhere useful, and they called those cues **information
scent**. A link labelled "Refund policy" has strong scent for someone trying to
get a refund. A link labelled "Resources" has almost none.

An agent walking your knowledge base is foraging in exactly this sense. The
index descriptions are the only scent it has. If they're vague, it either guesses
or opens several branches to check, and both cost you.

So the most important writing in a knowledge base isn't the pages. It's the
**one-line descriptions** in each index. Compare:

```text
- billing/      Billing docs
```

```text
- billing/      Refunds, invoices, failed payments and changing plans.
                Read this for anything about money a customer has paid
                or owes. Not for pricing questions (see sales/).
```

The second one costs about thirty more tokens. In exchange, the agent knows
what's inside, when to go in, and when not to. That's the same job as the
`description` field on a skill. It decides whether anything below it ever gets
read.

### Locality and thrashing

Two more ideas from memory design map across neatly.

The first is **locality**. Programs tend to use data that's stored near other
data they just used, and hardware is designed around that. In a knowledge base,
it means putting things that are used together **in the same place**. If
answering a refund question always needs the refund policy and the payment
provider's quirks, put them in the same folder, or even the same page. The
agent's reads then stay inside one branch.

The second is **thrashing**. In 1968, Peter Denning described what happens when a
program's working set, the pages it actively needs, doesn't fit in memory.[^denning]
The system spends all its time swapping pages in and out and gets almost no real
work done.

Agents thrash too, and once you know the symptom it's easy to spot. The agent
opens a file, decides it's not quite right, opens a sibling, then another, then
goes back to the first one. Or it reads the same file twice in one task, because
the first copy was compacted away. That's almost always a structure problem,
not a model problem. Usually the scent was weak, so it couldn't pick a branch, or
the information it needed was split across too many pages, so the working set
didn't fit.

The fixes are the classic ones: improve the descriptions so it picks right the
first time, or merge pages that are always read together so the working set
shrinks.

### Pinned memory

Some things should always be in RAM. Hardware and operating systems call this
pinned memory: data that's never swapped out.

The agent equivalent is the always-loaded file: `CLAUDE.md`, `AGENTS.md`, or the
skill metadata. Claude Code loads `CLAUDE.md` up front and uses glob and grep for
everything else.[^anthropic] That hybrid is right, but the pinned set has to stay
small. Every line in it is paid for on every tick, and it competes for attention
with everything else.

It's also worth getting right, because a file the agent always has seems to beat
the same guidance typed into the chat. A paper from April 2026 tracked 200
interactions with AI tools and found that a standing "authority" document, given
as a file, got 89% of outputs accepted first time. The same guidance given in the
chat got 64%. None got 29%.[^calboreanu] It's one person scoring their own work
against a baseline that wasn't randomised, so I wouldn't lean on the exact
numbers. But the direction matches what I see.

My rule is that the pinned file holds only two things: rules that apply to
nearly every task, and the top-level index of where everything else is. If
something applies to one kind of task, it belongs in storage, behind a
description good enough that the agent finds it when it needs it.

### Who writes to storage?

Everything so far is about reading. But knowledge bases rot because nobody
maintains them. Pages go stale, indexes stop matching the files, and two pages
quietly say different things.

In April 2026, Karpathy posted an idea he called an **LLM Wiki** that tackles
exactly this.[^wiki] The pattern has three layers:

- **Raw sources** that never change: articles, papers, notes.
- **A wiki** of interlinked markdown pages that the LLM writes and maintains.
- **A schema file**, like `CLAUDE.md` or `AGENTS.md`, that tells the LLM how
  the wiki is organised and how to work on it.

Two special files hold it together. `index.md` lists every page with a link and a
one-line summary, and the LLM reads it first when answering a question. `log.md`
is an append-only record of what changed and when. He says the index alone
"works surprisingly well at moderate scale (~100 sources, ~hundreds of pages)",
without any embedding infrastructure.

What I like most is his explanation of why human wikis die: "The tedious part of
maintaining a knowledge base is not the reading or the thinking — it's the
bookkeeping." Humans abandon wikis because the maintenance grows faster than the
value. LLMs "don't get bored, don't forget to update a cross-reference, and can
touch 15 files in one pass."

He describes three operations, and they map neatly onto storage:

| Operation | What happens | Storage equivalent |
| --------- | ------------ | ------------------ |
| Ingest | Read a new source, update the pages and index it affects | Writing to disk |
| Query | Read the index, open the right pages, answer, file good answers back | Reading, with write-back |
| Lint | Look for contradictions, stale claims, orphan pages and missing links | `fsck` |

The write-back part is underrated. When a question takes real work to answer,
that answer becomes a new page. The next time, it's one read, not a re-derivation.
That's a cache, built on disk.

The same idea works within a single task. Manus has its agent keep a `todo.md`
and rewrite it as it goes.[^manus] The rewritten plan always lands at the end of
the context, which is where the lost-in-the-middle research says the model pays
most attention. It's a scratchpad in storage, copied back into the part of RAM
the CPU reads best.

## Peripherals: every device costs memory

Tools are the agent's peripherals. A terminal, a code runner, a browser, a
database client. They're how the CPU touches anything outside itself.

The industry has even settled on a standard port. The Model Context Protocol
describes itself this way: "Think of MCP like a USB-C port for AI
applications."[^mcp] That's a good thing. But the hardware view points at two
costs that are easy to miss when plugging things in is this easy.

**Every device takes memory at boot.** Each tool's name, description and input
schema sits in RAM from the very first call, on every tick, whether it's used
or not. Plug in fifty tools and a real chunk of the context is gone before the
task starts, and the CPU has to choose between fifty options every step. The fix
is the same progressive disclosure as storage. Load short descriptions first and
the full definitions on demand, which is exactly what Skills do. LangChain cites
research where retrieving tool descriptions this way roughly tripled how often
the model picked the right tool.[^langchain]

**Every device writes straight into RAM.** Whatever a tool returns lands in the
context and stays there. A tool that dumps a 20,000-line log, or a whole web page,
fills memory with one call. Good drivers return small, shaped results, with a
path or an ID to fetch more if it's needed. That's the same page-table trick from
earlier: return the address, not the whole page.

## More cores: subagents

When one processor isn't enough, you add cores. The agent version is
subagents: separate model instances, each with its own context window, that a
lead agent hands work to.

{{< diagram src="cores.svg" >}}

Anthropic built their research feature this way, and the numbers are striking.[^multiagent]
A lead agent with subagents "outperformed single-agent Claude Opus 4 by 90.2%" on
their internal research evaluation. Their explanation is about memory, not
intelligence: "Subagents facilitate compression by operating in parallel with
their own context windows." Each subagent reads widely in its own clean RAM and
sends back a short result, so the lead agent's RAM stays small.

The cost is just as hardware-shaped. Multi-agent systems "use about 15× more
tokens than chats." On one benchmark, Anthropic found that "token usage by
itself explains 80% of the variance" in performance. More cores means more total
RAM, and more total RAM mostly means better answers, at a price.

Cognition, who build the coding agent Devin, published the opposite advice the
day before: don't build multi-agent systems.[^cognition] Their argument is about
what the cores _don't_ share. "Actions carry implicit decisions, and conflicting
decisions carry bad results." In their example, two subagents are asked to build
parts of a Flappy Bird clone. One builds a background in the style of Super Mario,
and the other builds a bird that doesn't look or move like the original. Each did
something reasonable. Neither could see what the other had decided.

I don't think these two actually disagree, and the hardware framing shows why.
It's the oldest problem in multicore design: **cores with separate memory don't
see each other's writes**. Work that's mostly reading and independent, like
researching ten sources, splits well, because the cores don't need to agree on
anything. Work where every step depends on earlier decisions, like writing one
codebase, doesn't, because the decisions are the shared state. So I use extra
cores for reading and keep writing on one core.

## Where the analogy breaks

I've pushed the analogy hard, so it's worth being clear about where it stops
working.

- **Real RAM doesn't degrade when it fills up.** Context does. That makes the
  agent version stricter than real hardware. You don't just avoid running out,
  you avoid getting close.
- **The CPU manages its own memory.** In a real computer, the operating system
  decides what to page. In an agent, the model mostly decides for itself what
  to read, which is why the scent in your indexes matters so much. You're not
  writing the paging algorithm. You're building storage so a fairly smart, fairly
  distractible reader pages well.
- **Reads aren't free to undo.** Once a page is read into context, it stays
  there until compaction. There's no way to unread something mid-step, so a bad
  read costs you for the rest of the task.
- **Nothing is deterministic.** The same agent can walk the same tree
  differently twice. Good structure makes good paths likely, not guaranteed.

## My build sheet

When I put an agent together now, I think about it the way I'd spec a machine:

- **CPU:** pick the model last, not first. Most problems I've blamed on the
  model turned out to be somewhere else on this list.
- **RAM:** load the smallest working set that does the job. Pin very little: a
  short always-loaded file with global rules and the top-level index.
- **Cache:** order context from most stable to least stable, and never put a
  timestamp at the top.
- **Paging:** evict to a path, not a summary. If something can be re-read, drop
  it and keep the address.
- **Storage:** a shallow, wide tree with an index in every folder and small pages
  about one thing each. Spend real effort on the one-line descriptions. Keep
  things that are used together, together, and let the agent maintain it.
- **Peripherals:** plug in fewer tools, load their definitions on demand, and
  make them return small results with pointers.
- **Cores:** use subagents for wide, independent reading. Keep decisions that
  depend on each other on one core.

Prompt engineering was about writing a good message to one chip. LLM engineering
is about building the whole machine around it, and most of that machine is
memory. That's why I think context engineering is the right name for the hardest
part of the job, and why I think of it as memory management. We already know a
lot about how to do that.

[^tobi]: The term took off after [Tobi Lütke tweeted](https://x.com/tobi/status/1935533422589399127) in June 2025 that he preferred it to prompt engineering, describing it as "the art of providing all the context for the task to be plausibly solvable by the LLM."
[^llmos]: Andrej Karpathy calls this the "LLM OS", with the model as the CPU and the context window as RAM. He sketched it in late 2023 and covers it in his [Intro to Large Language Models](https://www.youtube.com/watch?v=zjkBMFhNj_g) talk. The parts list and diagrams here are my extension of his picture.
[^langchain]: LangChain, [Context engineering for agents](https://www.langchain.com/blog/context-engineering-for-agents). This covers Claude Code's auto-compaction behaviour at the time of writing and the research on retrieving tool descriptions.
[^middle]: Liu et al., [Lost in the Middle: How Language Models Use Long Contexts](https://arxiv.org/abs/2307.03172), 2023.
[^rot]: Hong, Troynikov and Huber, [Context Rot: How Increasing Input Tokens Impacts LLM Performance](https://www.trychroma.com/research/context-rot), Chroma, July 2025.
[^anthropic]: Anthropic, [Effective context engineering for AI agents](https://www.anthropic.com/engineering/effective-context-engineering-for-ai-agents).
[^manus]: Yichao 'Peak' Ji, [Context Engineering for AI Agents: Lessons from Building Manus](https://manus.im/blog/Context-Engineering-for-AI-Agents-Lessons-from-Building-Manus), July 2025.
[^memgpt]: Packer et al., [MemGPT: Towards LLMs as Operating Systems](https://arxiv.org/abs/2310.08560), 2023.
[^wiki]: Andrej Karpathy, [LLM Wiki](https://gist.github.com/karpathy/442a6bf555914893e9891c11519de94f), April 2026.
[^cherny]: As reported by [OfficeChai](https://officechai.com/ai/claude-researcher-explains-how-agentic-search-performed-better-than-rag-for-code-generation/), from Cherny's podcast appearances in 2025.
[^radar]: Thoughtworks Technology Radar, [Progressive context disclosure](https://www.thoughtworks.com/radar/techniques/progressive-context-disclosure).
[^skills]: Anthropic, [Equipping agents for the real world with Agent Skills](https://www.anthropic.com/engineering/equipping-agents-for-the-real-world-with-agent-skills), October 2025.
[^foraging]: Pirolli and Card, "Information Foraging", _Psychological Review_ 106(4), 1999.
[^denning]: Peter Denning, "The Working Set Model for Program Behavior", _Communications of the ACM_, 1968.
[^calboreanu]: Elias Calboreanu, [Context Engineering: A Methodology for Structured Human-AI Collaboration](https://arxiv.org/html/2604.04258v1), April 2026.
[^mcp]: Model Context Protocol, [What is MCP?](https://modelcontextprotocol.io/docs/getting-started/intro)
[^multiagent]: Anthropic, [How we built our multi-agent research system](https://www.anthropic.com/engineering/multi-agent-research-system), June 2025.
[^cognition]: Walden Yan, [Don't Build Multi-Agents](https://cognition.com/blog/dont-build-multi-agents), Cognition, June 2025.
