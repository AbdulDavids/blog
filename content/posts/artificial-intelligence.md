---
title: 'All aboard the AI hype train!'
date: 2024-04-29T20:53:45+02:00
tags: ["Opinion"]

draft: false
showToc: false
TocOpen: false
hidemeta: false
comments: false
description: ""
disableShare: false
disableHLJS: false
hideSummary: false
searchHidden: true
ShowReadingTime: true
ShowBreadCrumbs: true
ShowPostNavLinks: false
ShowWordCount: true
ShowRssButtonInSectionTermList: true
UseHugoToc: true
cover:
  image: "https://substackcdn.com/image/fetch/f_auto,q_auto:good,fl_progressive:steep/https%3A%2F%2Fsubstack-post-media.s3.amazonaws.com%2Fpublic%2Fimages%2F3010177d-a7b0-4013-9dfe-cacd3aa64592_600x360.jpeg"
  imageWidth: 40
  imageHeight: 40
  alt: "meme"
  caption: ""
  responsiveImages: true
  relative: true # To use relative path for cover image, used in hugo Page-bundles
---

> "Any sufficiently advanced technology is indistinguishable from magic"
-Arthur Clarke, a man who would be out of a job had Claude been a thing in his day

### Artificial Intelligence. 

Where do I begin? Perhaps by asking if it'll steal my job? Or will it overthrow the government? Or maybe have it simply write this blog for me?

> Disclaimer: Yes this post is 100% made by a human, source: trust me bro

Well I think the best way to look at artificial intelligence is through the lens of an immense force. I'm talking about hype.

![](/openai/hype.png)

Oxford Dictionary describes hype as the act of "promoting or publicizing a product and exaggerating its benefits (paraphasing but you can see the source above).

When it comes to AI, boy has there been hype. 
The sheer amount of noise surrounding AI has translated into a whole lot of funding for tons of AI startups. Just look at Hugging Face, an AI startup that's currently valued at $4 Billion. Or Mistral, a French startup that raised the largest seed round in European history last year (2023). Despite being 4 weeks old.

Or even CharacterAI, a $1 Billion startup that creates.... AI digital characters for you to talk to? What the-

So this begs the question, is the hype valid and is the technology truly revolutionary? Or is this just another carriage at the end of the extremely long hype train? 

![](/openai/carriges.png)

#### The Tech 

Behind all the buzzwords, at it's core Artificial Intelligence is really just a bunch of math. A lot of math. 

![Look at this cool diagram I made](/openai/diagram.png)

Most AI tools and services have a Large Language Model (or LLM) at their core. While this may sound like some magical tech thing, in reality it's really just super fancy autocomplete. An AI takes in a prompt from a user and looks through its dataset to find the words that are most likely to come next. For example, a dataset could have an explanation of dark clouds: 

```...grey clouds usually mean rainfall is expected... ```

Should a user ask a question such as: ```"Why are the clouds grey?"``` . the LLM looks through it's dataset to find the most likely sentence to match this and "autocompletes" the answer to the question.

```The clouds are grey because...rainfall is expected```

Pretty neat right? Well this is the basis behind EVERY SINGLE ONE of the hundreds of booming AI start-ups, and all this isnt without its' faults either. LLMs can also suffer from a phenomenon known as "hallucinations". This sounds complicated but in reality it's just a case of the LLM being unable to predict the next word as nothing exists in it's dataset that could complete it's answer. 

At the end of the day that's the main limitation of AI. It simply cannot create new information. 