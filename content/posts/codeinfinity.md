---
title: 'My Experience as a SDE Intern at Codeinfinity'
date: 2024-02-24T12:53:45+02:00
tags: ["Internship"]

draft: true
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
  image: "/codeinfinity.jpg"
  imageWidth: 40
  imageHeight: 40
  alt: "Code Infinity Logo"
  caption: ""
  responsiveImages: true
  relative: true # To use relative path for cover image, used in hugo Page-bundles
---

_Disclaimer:_

> I did have to sign an [NDA](https://en.wikipedia.org/wiki/Non-disclosure_agreement), so I can't go too in depth on certain things. But I'll do my best to capture the essence of it and my feelings.

After my first year at university and countless personal projects under my belt, I was eager to secure a software development internship to "get my foot in the door" of the industry. However, the reality in South Africa is that student internships are less common compared to other countries, and even experienced graduates face challenges finding jobs. Regardless of these obstacles, I persevered in my search for an opportunity to gain valuable experience. I started by applying to the few companies that advertised student internships and after a couple of rejected interviews and a fail on the AWS OA, I felt discouraged. 

It was at this point that I stumbled upon the South African Slack community [ZATech](https://zatech.co.za/) and I decided as a last ditch attempt to post my CV on the #jobseekers channel. To my surprise, I was reached out to by CodeInfinity's CTO, Andre. After a chat on the phone he gave me a take-home proficiency test which I was to finish by the following week. This test consisted of two tasks designed to assess my problem-solving skills and knowledge of databases.

Crucially, the test required using PHP and MongoDB, two technologies I had never used before. After struggling with installing PHP and getting XAMPP to work, I finally began coding.  Within four days, I finished the first task, and the second one was completed by the end of the week.

After submitting my solutions, I was offered an internship position that included weekly mentorship and an open-source project to work on. The internship was scheduled to start in mid-November after I completed my finals. After reviewing the contract, I accepted the offer.

### Tina4Python

So my project was to work on an open-source lightweight routing and templating (not a) framework called [Tina4Python](https://github.com/tina4stack/tina4-python), which was based on a PHP framework called [Tina4](https://github.com/tina4stack/tina4-php). The basis for the system had been already completed by Andre and my task was to develop and implement new features in order to match the capabilities of the systems PHP equivalent. Sounds easy enough, I thought to myself. So I got to work on the first task which was to implement parameterized routing, which looks a bit like this: 

```python {lineos=true}
@get("/hello/{name}")
async def greet(**params):
   
    name = params['name']
   
    return Response(f"Hello, {name}!")
```

So for example this code creates a route for a GET request to `/hello/{name}`, where `name` is a parameter in the URL. The function `greet` accepts this parameter and responds with a personalized greeting.

So:
- Visiting `/hello/John` will respond with "Hello, John!"
- Visiting `/hello/Alice` will respond with "Hello, Alice!"
    
I was pretty chuffed with this as a week before concepts like routing and GET and POST requests were completely alien to me. So I opened my first pull request and after a quick code review, Andre was happy and merged my changes. I then went on to implement several other features such as serving files, localization, and handling templates, all of which were brand new concepts to me and I'm grateful for having been able to learn these. A huge thanks to Andre for mentoring me and helping me through all my silly mistakes as well as the training sessions which were incredibly informative.

### Technical Research

My next project involved technical research on several substantial new features for a client. My primary goal was to determine the feasibility of creating a Google Chrome extension to streamline the user experience while integrating with Gmail. Additionally, I had to develop a sample application and write detailed technical specifications (engineering specs) to guide other developers in implementing the extension.


![Original plan](/OGPlanGmail.png#center "My initial (failed) plan")

My initial proposal was to simply allow the user to access the Gmail API from the extension itself, however this plan fell through as it turned out that OAuth, for unspecified reasons, didnt provide access scope to Gmail from within Google App Scripting. 

Undeterred, I revisited the Gmail API documentation and spent several hours exploring resources on Stack Overflow, eventually settling on a viable alternative. My revised plan involved constructing a backend endpoint that would authorize individual user extensions and manage all user Gmail settings adjustments within the backend, rather than directly from the extension.  I wrote a basic example app which would showcase this and presented it to the client, which was seen as satisfactory. I then completed the rest of the implementation documentation and created the cards in Basecamp. 

This was a good learning experience in dealing with clients and took me quite a bit out of my comfort zone as I had to develop systems analysis and design skills. It also gave me an opportunity to be experiment in finding different ways to solve problems, and I had to learn new technologies quite quickly in order to meet my deadlines.

Overall my main takeaway was that being a software engineer is not only about the coding side of things, it demands the ability to continuously learn, think creatively when encountering challenges, and persevere when solutions don't unfold exactly as planned.


### Langchain

My experience using Langchain

### PHP 

After a month, I was tasked with overhauling a fullstack webapp written in the Tina4PHP framework. Having previously worked with Python's ORM, I initially felt confident due to my familiarity with the concept. However, I quickly realized I had no prior experience with Tina4PHP's specific implementation. Thankfully, with my mentor Justin's guidance, I navigated the codebase, got things running, and started developing features and refactoring old code.

 One of the coolest features about [Tina4PHP](https://github.com/tina4stack/tina4-php) is its ORM functionality. 

![ORM Example](/ORM.png#center "Basically this but in PHP")

An ORM ([Object Relational Mapping](https://en.wikipedia.org/wiki/Object%E2%80%93relational_mapping)) is a programming technique that allows you to work with a database using the concepts of object-oriented programming (OOP). This means you interact with your database using objects and classes, rather than writing raw SQL queries, which significantly improves readability and maintainability.

Pretty cool not gonna lie.

So I refactored the frontend and added new backend routes to implement additional features. I also learnt about using [AJAX](https://en.wikipedia.org/wiki/Ajax_(programming)) in order to refresh parts of the page without fully reloading, sort of like a React DOM, which significantly improved performance. I was also thrown head first into working with databases and while I was initially out of my depth, after some Youtube videos I learnt how to utilize relational databases. Overall the overhaul really tested me and the learning curve was quite steep, however nothing beats the feeling of something finally working after 16 iterations. 

### Conclusion

To end things off

