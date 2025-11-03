---
title: "computer science in the intelligence age"
date: 2025-11-03
draft: false
tags: ["opinion"]
description: "universities are still teaching recall. they should be teaching how to build. thoughts from someone stuck in both worlds."
---

> wrote this on a plane [using freewrite I built for ipad}(https://github.com/AbdulDavids/freewrite-ipad). cleaned it up with claude. [original outline here](https://gist.github.com/AbdulDavids/23bb8ddaecbbb16a563d848268ff77c8).

i'm finishing my final year of cs while working part-time as a software engineer.

i write python professionally. ship features to production. debug production issues. integrate apis. architect new systems. real stuff people actually use.

then i walk into an exam hall and they ask me to handwrite bubble sort on paper.

no ide. no documentation. no ai. just me and a pen trying to remember syntax i haven't typed manually in years.

the disconnect is insane.

last week i was optimizing database queries for a Slack used by thousands of users. this week i'm being tested on whether i memorized the exact implementation of quicksort.

nobody in industry does this. nobody.

## the problem

university cs is built on one thing: testing your ability to recall information and fill requirements in an assignment brief.

that's it. that's the entire model.

memorize algorithms. recall syntax. regurgitate on exam day. move on.

forget it all a week later because you'll never use it again.

this breaks into two parts: theory and practical work.

both are broken. just in different ways.

but the theory side? that's where things get really bad.

### theory is dead (aka the death of the age of reason)

the theory side changed the most.

any "general knowledge" question about algorithms, data structures, computational theory—llms answer it at a human level. often better.

want to understand how dijkstra's algorithm works? ask chatgpt. need to know the time complexity of different sorting algorithms? ask claude. trying to figure out the best data structure for your use case? ai will explain it better than your professor.

and it won't just give you the textbook answer. it'll explain why. give you examples. help you understand the tradeoffs.

humans need to reason now. draw conclusions. make decisions based on information.

the recall part? the compilation of information? that's 100% handled by ai today.

traditional cs theory, as it's taught and tested, is dead.

think about it. question-answer tests are measuring a skill that's been commoditized to zero.

go poll any dev team on slack. ask what percentage of their university knowledge they actively recall.

i'd bet 90% of working devs couldn't pass their own uni exams without studying.

not because they're bad developers. because none of that recall matters in actual work.

you have stack overflow. documentation. ai assistants. the entire internet.

when i'm working, i'm not recalling algorithms from memory. i'm looking up best practices. reading docs. asking ai to explain concepts i'm fuzzy on. then making architectural decisions based on that information.

that's the actual skill. knowing what to look for. knowing what questions to ask. knowing how to evaluate solutions.

not memorizing implementations.

### practical isn't much better

even practical assignments are stuck in rigid frameworks.

"implement X using Y, must include features A, B, C."

you get marks for following the spec. lose marks for doing anything creative or different.

doesn't matter if you found a better approach. doesn't matter if you learned a new framework that's more suitable. doesn't matter if you built something more interesting.

you followed the spec? you get the marks. you didn't? you fail.

you're not learning to solve problems. you're learning to follow instructions.

there's no room for initiative. no teaching students to think outside the box. no encouraging them to make architectural decisions or explore different approaches.

in real work, the best developers are the ones who can take a vague requirement and turn it into a working solution. who can push back on bad ideas. who can suggest better approaches.

university teaches the opposite. be a good little code monkey. do exactly what you're told.

## the shift nobody talks about

ai isn't replacing developers.

it's shifting the entire hierarchy.

this is the part everyone gets wrong. they think ai is coming for developer jobs. that we'll all be replaced by chatgpt.

not how it works.

**before ai:**
- bad devs → unemployed
- normal devs → employed
- 10x devs → leading teams

**with ai:**
- bad devs → normal devs
- normal devs → 10x devs
- 10x devs → 100x devs

ai is a massive multiplier.

a bad dev with ai can produce what a normal dev used to. they can scaffold projects. implement features. ship code that works.

a normal dev with ai can do what only the best could before. build complex systems. architect scalable solutions. move fast without breaking things.

10x devs? they build entire products solo now. things that used to take a team of five? one person with good ai workflows can do it.

i've seen this firsthand. features that would've taken me a week now take two days. not because ai writes all my code. because it handles the boring stuff while i focus on the interesting problems.

but here's the catch.

if you don't know how to use ai properly, you're stuck at the bottom.

most students would be lazy. copy-paste code without understanding it. wouldn't iterate. wouldn't learn. stay bad.

with ai they might become "normal" developers. but they won't make the jump to 10x.

because being 10x isn't about using ai to do everything for you. it's about using ai to multiply your own capabilities.

unis should teach students how to make that jump. normal → 10x.

they're not.

they're punishing ai use instead of teaching ai mastery.

they're running plagiarism detectors on code. failing students for using chatgpt. treating ai like cheating instead of like the tool it is.

it's insane.

## what cs should actually teach

cs needs to become end-to-end. not just programming.

here's what a modern cs education should look like.

**give students real problems**

no rigid briefs. no detailed specifications. real, messy problems.

"build something that helps students find study partners." not "build a web app using react and node that implements these exact features in this exact way."

let them figure out solutions. let them decide what to build. let them research approaches. let them fail and iterate.

teach thinking outside the box. understanding business use-cases. talking to users. figuring out what people actually need vs what they say they need.

teach optimizing systems. designing solutions for non-technical requirements. making tradeoffs. deciding what to prioritize.

the value isn't following instructions. it's deciding what to build and why.

this is what separates good developers from code monkeys. the ability to think.

**embrace ai**

stop punishing ai use. teach how to use it effectively.

make it part of the curriculum. show students how to plan projects with ai. how to iterate on ideas. how to validate outputs. how to catch when ai is wrong.

because ai is wrong a lot. especially with complex stuff.

here's the thing: ai is terrible at understanding complex ecosystems. try asking chatgpt to help you debug an aws infrastructure issue. or explain how your legacy codebase's authentication flow works. or figure out why your microservices are talking to each other wrong.

it'll give you generic advice. hallucinate solutions. confidently tell you things that don't apply to your specific situation.

that's where humans shine. understanding context. knowing the history. seeing the big picture.

teach students to be architects. to own the system design. to understand how all the pieces fit together.

let ai handle implementation. boilerplate. the boring stuff.

show students that ai gets you 80% of the way there. fast. but that last 20%—the edge cases, the production concerns, the stuff that makes it actually work—that's where the real engineering happens.

**turn cs into product development**

cs shouldn't just be about writing code. it should be about building complete products.

add ui/ux design to the curriculum. teach students how real people interact with software. what makes interfaces intuitive vs confusing. how to design for accessibility. how to make things that feel good to use.

because here's the reality: most software fails because of bad ux, not bad code. users don't care if your algorithm is optimal. they care if the thing works and doesn't make them want to throw their laptop.

teach entrepreneurship. how to identify problems worth solving. how to validate ideas before spending months building them. how to talk to users and actually listen to what they're saying. how to iterate based on real feedback, not assumptions.

teach rapid iteration. mvp thinking. shipping something small and learning from real usage instead of building in a vacuum for six months trying to make it perfect.

software engineers can focus on the human aspects now: ux, functionality, design, user experience. the things ai genuinely can't do because they require understanding humans.

everyone should be a devops expert. understanding deployment, monitoring, debugging production issues. not just "works on my machine" and throwing it over the fence to ops.

everyone should be a system designer. able to architect solutions that scale. that handle failure gracefully. that don't fall over when you get a traffic spike.

everyone should be a product thinker. understanding why you're building something. what success actually looks like. how to measure impact beyond "we shipped the feature."

let ai handle mundane coding. the implementation details. the boilerplate that every project needs but nobody wants to write.

**teach modern tech stacks**

back in the day knowing java deeply could carry your entire career.

one language. one framework. maybe a database. you could become an expert and stay relevant for years.

today? companies use massive, complex tech stacks.

frontend framework. backend framework. message queues. containerization. orchestration. ci/cd pipelines. monitoring. logging. cloud infrastructure. cdn. database. cache. search engine.

and that's just to build a basic modern web app.

the learning curve for junior developers is absolutely vertical. they're expected to know all of this on day one. it's overwhelming.

universities should embrace this complexity. encourage using varied tech stacks across different projects. don't force everyone to use the same java spring boot setup for every assignment.

let students explore. build one project in react and node. another in svelte and go. another in vue and rust. whatever they want.

this is where ai becomes clutch. students don't need to memorize syntax intricacies anymore. they don't need to spend weeks learning the quirks of a new language before they can be productive.

they should learn architectures. how microservices communicate. how to design apis. when to use which database. how to structure frontends. how different pieces connect.

ai handles the boilerplate and syntax. students focus on system design and architectural thinking.

the ability to rapidly pick up new technologies matters infinitely more than deep expertise in one.

**ship first, ship often**

from first year, students should be shipping actual products.

not toy assignments that get deleted after grading. not exercises that only the professor sees. real products that real people could actually use.

give students saas-worthy open-ended assignments. "build something people want" not "implement this algorithm."

any tech stack they want. as many features as they can build. judge them on shipping something that works and getting it in front of users.

did anyone actually use what you built? did you get feedback? did you iterate based on that feedback? that's what matters.

teach kids to ship. to get comfortable with putting work out there before it's perfect. to learn from real usage instead of theoretical scenarios.

most students graduate having never deployed anything to production. never dealt with real users. never experienced the terror and excitement of watching people actually use something you built.

that's insane.

the curriculum should be: basic cs concepts → cloud fundamentals → practical assignments → web-first development (js frameworks, modern tooling) → ai integration → open-ended saas projects.

focus on building complete products. not textbook exercises that get thrown away.

students should graduate with portfolios full of shipped projects. things they can point to and say "i built this, people used it, here's what i learned."

not "i got an A on data structures."

## the saas reality

ai is creating a gold rush in software. but not the kind everyone thinks.

companies are hiring less. not because they need fewer developers. because each developer can do exponentially more.

a team of three with good ai workflows can build what used to require fifteen. a solo developer can ship products that used to need a whole team.

we have more 10x and 100x developers today. each person does more. ships faster. handles complexity that used to require coordination across multiple people.

this means fewer traditional junior roles. companies don't need as many people who can "just code." they need people who can think, architect, and ship.

unis should be preparing students for this reality.

teach them to build their own products. start their own companies. be force multipliers who can go from idea to deployed product.

not just compete for shrinking numbers of traditional jobs where they're code monkey #47 on a team.

the barrier to entry for creating software has never been lower. you don't need venture capital. you don't need a team. you don't need an office.

you need a laptop, an idea, and the ability to ship.

look around. solo developers are building profitable saas products. tiny teams are competing with established companies. people are shipping side projects that turn into real businesses.

the opportunity to build profitable products solo or with tiny teams has never been higher.

but only if you know how to actually build and ship. not just write code.

## how to actually use ai (my method)

thanks to figuring this out, i can juggle part-time engineering work while in my final year of uni.

not because ai does everything for me. because i learned how to use it as a force multiplier.

here's the key: don't use ai to do everything.

**use it to plan.**

before writing any code, i talk through the problem with ai. what am i trying to build? what are the constraints? what are different approaches? what are the tradeoffs?

this is where ai is genuinely helpful. it's a rubber duck that talks back. that suggests things you haven't thought of. that challenges your assumptions.

**use it to iterate.**

when i'm stuck on a problem, i don't just ask ai for the answer. i explain what i've tried. why it didn't work. what i'm thinking about next.

ai helps me think through solutions. not replaces my thinking.

**use it to validate.**

after i write code, i ask ai to review it. "what edge cases am i missing?" "where could this break?" "how could this be more efficient?"

sometimes it catches things i missed. sometimes it's wrong. but it forces me to think through my code more critically.

**but maintain control. maintain understanding.**

never copy-paste code without understanding what it does. never ship something you couldn't explain or debug.

have architectural discussions with ai. let it generate boilerplate so you focus on business logic and interesting problems. ask it to review for edge cases and potential issues.

but you're the architect. you're in control. you understand the system.

ai is a force multiplier for your thinking. a tool that makes you more effective.

it's not a replacement for thinking.

## leetcode and the disconnect

leetcode is another perfect example of this entire disconnect.

companies make you grind hundreds of algorithm problems. reverse linked lists. find the kth largest element. implement dijkstra's from scratch.

you spend months preparing. memorizing patterns. practicing on a whiteboard.

then you get the job.

and the actual work? gluing apis together. debugging cors errors. figuring out why the staging environment works but prod doesn't. writing docs. reviewing prs. debugging why the cache invalidation is broken.

zero algorithm questions. zero "implement a binary tree" moments.

the skills being tested have almost nothing to do with the skills being used.

it's the same problem as university. we're optimizing for recall and theoretical knowledge. while the actual job requires system thinking, debugging, communication, and shipping.

we're optimizing for the wrong skills everywhere.

at every level of cs education and hiring.

## bottom line

universities teach for a world that doesn't exist.

they teach recall when they should teach reasoning. punish ai when they should teach ai mastery. create code monkeys when we need builders.

either they adapt—teach students to leverage ai, build complete products, think at system level, ship fast.

or they become expensive certification mills producing graduates who are obsolete on day one.
