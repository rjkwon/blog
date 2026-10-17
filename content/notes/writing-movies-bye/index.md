---
title: Writing, movies, bye
date: 2026-10-17T11:04:43-04:00
draft: false
tags:
  - writing
  - movies
  - site-updates
---

Hi, I added a little density heatmap thingy on my [Notes index](/notes) to visually display how frequently (or _infrequently_, as it were) I publish here. 

{{< figure src="notes-map.png" caption="Heatmap for /notes (ignore inconsistent width, done is better than perfect)" alt="Screenshot of the visual density of my posts" class="border-dotted small" >}}

I used to have a similar visual element on my old website (see screenshot below) and wanted to bring it back, although the scale as you see is different now. I used to write on the order of four times a month and now I barely write four times a year. 

{{< figure src="journal-archive.png" caption="Calendar view from my old website, 20(!) years ago" alt="Screenshot of a monthly calendar view from October 2006 showing 4 posts written that month" class="border-dotted small">}}

I am not as prolific as I used to be, I guess. I _would_ like to write more, maybe at least once a month? I think my approach to writing in general is pretty different. Back then I was very emo and I also didn’t have that many close IRL friends that I was comfortable sharing certain things with but it felt easier to share them with The Internet. Now I am much better at recognizing, naming, and communicating my feelings (thank you psychotherapy) and my body also cannot physically handle some of the less healthy coping mechanisms I used to employ (thank you middle age), which are both good things, positive reasons why I may write less online. But also now I feel more pressure to have a POINT or an IMPORTANT MESSAGE to get across in my writing. 

Also time feels like it moves more quickly (but also slowly? Days are long, years are short kinda vibes[^1]) as I get older. 

I think the proliferation of generative AI in writing has also made me less enthused about writing online. I don't want to get into all things AI right now[^2] and dump another half baked opinion on the pile (pls just let the potato rest for 5 mins), but I will say the best compliment I've received all year at work, from someone senior to me whose opinion I care about deeply, was "I can always tell that your documents were written by a human." I felt very seen. 

I did upgrade my notes-writing workflow recently to make it incrementally easier to start. I am good at making excuses for not writing anything so this was me trying to help me help myself. My old workflow was:
1. Sit down at computer with idea[^4]
2. Create a new note file by entering `hugo new notes/new-note-title/index.md` in a Terminal window, or creating a new folder and index file directly in Obsidian
3. Get annoyed by workflow step 2 because it requires me to have a title before I've even written the thing
4. Get over step 3 and just write the thing
5. Lightly edit the thing
6. Commit and push the thing

Step 2 was becoming more of a roadblock than just a speed bump, not in the least because it also required me to copy-paste the frontmatter fields (title, datetime, tags, etc) *from an existing note*, because even though I have known that templates are a thing, I was too lazy to actually look into how they worked and how to set them up. 

Anyway, I don't know how I motivated myself to actually fix this (I think my irritability just reached the tipping point to overcome my laziness, which is often what happens), but I did, so now my new workflow is
1. Sit down at computer **or phone** with idea
2. Create a new note file by entering `npm run notes:new`, which **creates a new draft file with a placeholder name** like draft-20261013-0845/index.md and **automagically drops in a template with the frontmatter fields**
3. Write the thing
4. Lightly edit the thing
5. **Add the title** to the frontmatter
6. Run `npm run notes:finalize`, which creates a slug based on the title created in step 5, updates the datetime to now, and changes it from a draft
7. Commit and push the thing 

Writing it out, I guess it is actually one additional step compared to the old workflow, but instead of step 2 being a seemingly insurmountable uphill hike on foot in inclement weather, it feels more like a slightly downhill graded bike ride on smooth pavement, which is a significant improvement (I _think_ -- this is the first note I've tried publishing with this workflow).

--- 

I've been re-watching older movies more than I've been watching new ones lately. It seems like most "new" movies these days are a remake or a reboot or a continuation of another movie series anyway, or a bestselling book, or otherwise some existing story that has already proven popular enough to sell tickets if turned into a movie. 

I re-watched the Christopher Nolan Batman trilogy[^3] on a rainy weekend a few weeks ago. Still good, although I guess it is technically a reimagining of a previous movie series that itself was based on a comic book so it falls into the category of thing I was just complaining about. 

I went to see the new Resident Evil in theaters which I enjoyed (despite it also technically being a reimagining of a previous movie series that itself was based on a video game... maybe I need to think more about what it is that actually bothers me), and now am making my way through the "original" movie series, of which I thought there were two (Resident Evil and Resident Evil: Apocalypse) but turns out there are 6, so I should be sufficiently occupied for a couple of weekends.

One nice thing about having brain fog is that for these movies that I watched 20+ years ago, I have since forgotten the twists and also general plotlines, so it's like watching them anew. Lol. 

--- 

Anyway, I guess that's it for now. I never know how to end a note. I also never know how to gracefully leave a social situation, although lately I've been inspired by my older friends (the ones in their 70s and 80s) who literally just leave whenever they want to. No need for "...well, what are you up to after this?..." or any other buffer statements to gracefully lead into a soft "...I think I might take off soon..." and then ten more minutes of standing around nodding politely. It's just "I'm going home now" or "I'm tired, bye" and then they leave. Iconic.

[^1]: I just googled this to see who originally said this and apparently it's attributed to Gretchen Rubin and the context was parenting lol... I'm very happily child free but this is also my experience as an adult human woman in America in 2026
[^2]: Closest thing I've seen to what I think are my principles around using AI for writing online: https://arun.is/blog/ai-enhanced-writing/ (1) don't use AI to write the words (2) don't use AI to do the thinking. I aspire to have this much structure and transparency in my writing process but tbh I kind of just start a markdown file when I feel like it, lightly copy edit, commit and publish. And lately I don't even copy edit (or care about copyediting mistakes in other people's writing online) because it feels more human 😭 As I write that I see how ridiculous it sounds, that I purposely ignore potential mistakes because I'd rather betray my own intelligence than have it be accused of being artificial
[^3]: Random Kwon fact: I was an extra in The Dark Knight lol. They filmed part of it in Chicago on a weekend in 2007 and I was a medical student who had the weekend off and really wanted to be part of a movie because I loved movies. I remember the code name was Rory's First Kiss and it was a lot of waiting around. It kinda felt like jury duty (which I recently served for the first time, will write about that later) where you basically just stand around a lot waiting to be told what to do, punctuated with moments of excitement like seeing Gary Oldman smoke a cigarette between takes although not being allowed to talk to or interact with him (for the movie, not for jury duty). They gave us lunch. Heath Ledger died shortly after the filming and I remember texting one of the people I had stood around with, who kind of became my friend after that, on my Cingular brick phone, about how sad it was.
[^4]: Ideas either "just come to me" or, more likely, are drawn from a running list of idea stubs I have in Obsidian, sync'd to a remote vault so I can access on the go, in a markdown file called "Stubs". It's where I store interesting things I learn or think about that I don't know what to do with yet, like the fact that Kelis (of "Milkshake" fame) stepped away from music to train at Le Cordon Bleu to become a saucier and is now a farmer in Kenya, or random complaints I have about life (example: "I’m tired of QR code menus. Why do I have to scroll with my thumb when I could just scan with my eyes")
