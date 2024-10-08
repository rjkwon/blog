---
title: "Artificially intelligent thoughts"
date: 2023-07-17T20:07:23-04:00
draft: false
tags: 
- generative AI
- technology

---

I am reading and hearing a lot of discourse about AI, machine learning, and more specifically, ChatGPT. It seems like a lot of people have a lot of opinions and things to say, and, like ChatGPT itself, they seem to be often wrong but never in doubt[^1]. From what I can tell it seems like a lot of it is noise (generally when people make blanket statements about AI being bad and dangerous) but there is some real signal (generally when people use more precise verbiage, detailed use cases, and less sensationalized/more nuanced thoughts and conclusions such as potential for bias at a large scale with large language models and generative AI causing harm[^2]).

I'm in an information gathering stage right now (if the knowledge contained in the brain of the world's leading expert on generative AI were represented by a complicated, elaborate, structurally sound bridge, my level of knowledge is a piece of rough lumber slapped between two puddles) so I don't have much to add to the discourse that is of consequence. 

(But I'm going to, anyway, because this is the internet!) Based on my observations, it seems that many laypeople have made a lot of assumptions about ChatGPT without ever having used it or read any of the materials from OpenAI. I know because I did that. I heard about it and saw some of the more ridiculous examples on social media and some news sites and such, and rolled my eyes a bit.

Then I figured if I'm going to be skeptical and pooh-pooh an emerging technology, it would probably be good for me to try it out so I can REALLY knock it. So I did!

The first thing I asked ChatGPT was what happened to the [hole in the ozone layer](https://chat.openai.com/share/6e40c218-8229-4d0f-9dd6-705927f72254)[^3]. Its response _seemed_ right, and I used Wikipedia as the source of truth to verify facts, like confirming that the Montreal Protocol was in fact adopted in 1987. Because if ChatGPT had told me it was 1989, I would have believed it.

Basically, it behaved mostly as I expected it to, and it was kind of useful, even with what I think is a healthy level of skepticism. I also appreciated that it's pretty clear from the various disclaimers that it can be wrong, dangerous, biased, etc. 

I've used it a lot more since then, asking for guidance on gift ideas for my notoriously hard-to-shop-for parents (I ended up going with my own initial idea, a gifted trip to the Korean spa, which actually was on ChatGPT's list as well), something thoughtful to say to a coworker about to go off on parental leave (I mostly used my own words except one suggestion from ChatGPT to encourage them to take care of themselves in addition to the baby), and, what has become a pretty frequent use case for me at work lately, debugging SQL queries.

My early conclusion based on this limited experience (since May I have used ChatGPT approximately once a day on average) is that ChatGPT is mostly like any other tool—if it's used for the right scenario in the right way, it can be incredibly useful, and if not, it can either just not add much value (best case scenario) or actively cause harm (worst case scenario). If I need a flathead screwdriver and all I have is a Philips head, the best decision I can make is to not use an inadequate and ineffective tool for my use case. Even if it's the fanciest, most technologically advanced Philips head screwdriver, powered by drill with wifi connectivity, rainbow LED lighting, and adorned with sparkles, it doesn't really matter if it's not the tool that I need.

What about disclosing use of ChatGPT as a tool? I think it depends. When I use it to debug a query, I don't necessarily report that out when reporting on whatever finding I was investigating in the first place. (I _have_ been excitedly telling anyone who will listen to me that I've been using ChatGPT to debug my SQL queries (and then the cleaning staff are like, please, lady, I just want to mop this floor, okay?), for whatever that's worth.) If it were being used for looking up and reporting on facts more quickly and easily (such as in publishing content), such as my ozone layer question, I would say it should absolutely be made explicitly clear that the content was generated using a tool developed based on a large language model and list the known limitations. 

(I had a flashback to working with this one thoracic surgeon who was really adept with the surgical robot and kind of took issue at the operating room staff for insisting that his patients' informed consent documentation state SPECIFIC permission to do a robotic-assisted wedge resection of left lung or whatever, instead of just wedge resection of left lung, and his argument was that he doesn't have to get permission from the patient or even tell them if he were using a 11-blade versus a 15-blade; the robot was just a tool at his disposal and he as the surgeon had a responsibility to use the right tool for the job. I could see his point, but at the same time, it also didn't seem totally right to not have a documented conversation with the patient that the robot would be used—and of course he had had that conversation, but the OR staff didn't know that, so in that case maybe the informed consent was a tool being incorrectly used to represent all communication with the patient.)

ChatGPT seems to have the most potential for harm when there isn't reliable feedback on its accuracy (or if the user does not care to actively seek feedback). With a prompt like "debug my SQL," I can immediately judge the quality of the response because either my SQL runs or it doesn't. For that lawyer who didn't verify that the case law ChatGPT quoted was real before submitting it in a court filing... oy.

Anyway, obviously we need to learn more, but with the right guardrails and oversight, we shouldn't fear technology. If anything, we should fear unchecked capitalism, because that's what has ruined and snuffed out a lot of the exciting potential that technology offers, but that's another story for another day.

[^1]: That is a joke about surgeons, the original gangsters in perfecting the art of being confidently wrong.
[^2]: I'm thinking of experts like Joy Buolamwini, Timnit Gebru, etc.
[^3]: The context is that I was talking to someone in their 20s and mentioned something about Aqua Net and CFCs and how we made a hole in the ozone layer real bad in the 1980s but then we fixed it, and they were like, "What is the ozone layer?" After I recovered from a mild generation gap-induced heart attack, I turned to the internet for help.