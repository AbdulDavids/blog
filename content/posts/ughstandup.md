---
title: 'About Ugh Standup'
date: 2024-06-10T15:00:00+02:00
tags: ["Side Project"]

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
  image: ""
  imageWidth: 40
  imageHeight: 40
  alt: ""
  caption: ""
  responsiveImages: true
  relative: true # To use relative path for cover image, used in hugo Page-bundles
---

# Standups

Have you ever been stuck in a standup where you dont know what to say or how to say it? 

Or you're just not in the mood to talk about what you did yesterday and what you're going to do today?

Well I have a solution for you!

> [Check out Ugh Standup](https://standup.abduldavids.co.za/)

This is a standup script generator that tells you what to say in your morning catchups. Just enter your Wins and Blockers and Gemini will generate a standup script for you.

# How to use

1. Go to the [Ugh Standup](https://standup.abduldavids.co.za/) website

2. Sign in with your Google account
    - This is so that I can enforce rate limits so [I dont go broke](https://x.com/zemotion/status/1798558292681343039).
3. Enter your Wins and Blockers.
4. Hit Generate
5. Boom! You no longer have to go "uhmm" and "hmm" when its your turn to speak.
    - You can also view old scripts by going to the "History" page.

# How it works

I built this thing using [React](https://react.dev/) and [Supabase](https://supabase.com/). The frontend is hosted on Cloudflare Pages and the backend is just a couple of Google Cloud functions. For the database, I'm using Postgres and for the actual standup script generation, I'm using a GCP Cloud Function to access the [Gemini API](https://ai.google.dev/pricing).