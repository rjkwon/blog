---
title: "December Adventure"
type: "decadv"
---

# 09

# 08

<h1 id="07">07</h1>

I made the calendar on this page interactive. Also, I changed it from using flexbox, which was somewhat convoluted, to using `<table>`. I remember that `<table>` started getting a lot of hate for a time because people (me, I was people too) were using and abusing it for grid layouts. But calendars actually ARE tables, so this feels right.

I'll be traveling for work this week, so won't plan to update this page, but I'll see what I can do to continue this daily practice and document manually, then share the updates when I'm back.

<h1 id="06">06</h1>

Wasn't feeling like doing too much today so I just did some more cleanup and deleted some old files. 

<h1 id="05">05</h1>

I made a [blank page](https://kwon.nyc/blank/).

<h1 id="04">04</h1>

Today I figured out how to automate the process I use to pull movie data from my Letterboxd into a JSON file that I can then use to display recent movies I've watched on my homepage ([kwon.nyc](https://kwon.nyc)). I 
* [added a line](https://github.com/rjkwon/blog/commit/421dcfb98a0385760103c30acd840b8534ccc80c) to my Netlify configuration to run a script at build time that fetches the data and dumps it into a JSON, which I'd previously been running manually, then
* created a [Github Action](https://github.com/rjkwon/blog/actions/runs/19931196947/workflow) to automatically trigger a Hugo build every morning at 8 am New York time. 

I also realized from days 1-3 that waiting until the end of the workday to do decadv stuff meant I was using my tired brain (my evening brain), so this morning I spent some of my good brain (my morning brain) on it, which was a really nice start to the day. I'll try it again tomorrow morning.

<h1 id="03">03</h1> 

I had a long workday and then went to a late (for me) dinner, so I didn't have as much time as I hoped for to work on Dec Adventure. Today, I fixed the mobile view for this page. Also, randomly, while waiting for my seat at the restaurant, I saw the actor Wallace Shawn come in, talk to the host (checking wait time?), and then leave. Inconceivable.

<h1 id="02">02</h1>

I have this micro-site, [kwon.nyc/cans](https://kwon.nyc/cans/), that I put together somewhat shoddily several weeks ago. It's a series of photos of craft beer cans with neat designs in reverse chronological order. Today I did some unglamorous code cleanup, including fixing a weird datetime issue where the "Last updated" date was referring to the date of the last site build -- now it refers to the date of the last can photo added, as desired. (Cue applause.)

<h1 id="01">01</h1>

**Goal for day 1 is to build this log.** I stumbled upon this December Adventure thing on Mastodon, and it feels like a nice way to make some progress on things with minimal pressure, which is the level I'm on these days. 

I built it as a custom micro-site within my existing Hugo site, which is somewhat against the spirit of Hugo sites (I think) but is super easy and fast to spin up by just creating a new content folder with `hugo new`, a baseof.html and list.html in a custom layout, and custom css.

This is also an interesting exercise in GOOD ENOUGH because it is not conducive to navel-gazing pixel pushing (unless said navel-gazing pixel pushing ends up as something tangible).