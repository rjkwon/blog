---
title: "Spring tune-up + ride"
date: 2024-05-18T08:51:55-04:00
draft: false
tag: bike
---

Since transitioning to a more or less Monday-thru-Friday, 9-to-5 work week, I often feel my brain is pretty fried on Fridays (fried-days?), as well as a general depletion of energy for socializing, so for the last several years I have kept Friday evenings open for myself. I try to spend that time doing something chill, by myself, and mostly screen-free, and then I go to bed at a reasonable hour. 

Yesterday I took my bike apart for a moderate tune-up and brought the parts up to the rooftop to work on them along with a can of Makku (a trendy✨ brand of makgeolli a.k.a. Korean rice wine which is freely available in Brooklyn bodegas, lol). 

It was really nice to just zone out with my bike! I focused on the drivetrain (basically the [parts labeled #7-11](https://kwon.nyc/bike/)), removing the lockring, rear cog, and chainring, and cleaning off as much accumulated sludge as I could. I discovered not one but TWO (of five) bolts missing from the chainring (oops) and ordered a  replacement set online. I also found a brand new chain in my bike toolbox that I had forgotten about, so I installed that too. It felt good to disassemble everything and get it squeaky clean and then put it back together. (I wish I could do that with my bones sometimes, hehe.)

Today I took the bike out for a spin—a lot of spins, actually, about 26 miles' worth—and took a long ride around the city. I loosely planned a route around the goal of covering multiple boroughs, and ended up hitting four of the five[^1]. 

{{< rawhtml >}}
<div id="map" style="width: 100%; height: 500px; border: none; border-radius: 20px;"></div>
<link href="https://api.mapbox.com/mapbox-gl-js/v3.2.0/mapbox-gl.css" rel="stylesheet">
<script src="https://api.mapbox.com/mapbox-gl-js/v3.2.0/mapbox-gl.js"></script>
<script>
    mapboxgl.accessToken = 'pk.eyJ1Ijoicmprd29uIiwiYSI6ImNrbnB5aTg2NDA2ZXgyb21uZjh0ZmQ0aDEifQ.wcihEO5lNGrSgDcgtldHag';
    var map = new mapboxgl.Map({
        container: 'map',
        style: 'mapbox://styles/rjkwon/cluc39fpj005001qlhqm6cm9m',
        center: [-73.96480182263512, 40.75592468460507], // Initial center coordinates
        zoom: 10.5
    });

    map.on('load', function () {
        map.addSource('route-may19', {
            'type': 'vector',
            'url': 'mapbox://rjkwon.clwcyaepqbm051zljpa0h4w10-2ajdn' // Replace with your tileset URL
        });

        map.addLayer({
            'id': 'route',
            'type': 'line',
            'source': 'route-may19',
            'source-layer': 'route-may19', // Replace with your source layer name if different
            'layout': {
                'line-join': 'round',
                'line-cap': 'round'
            },
            'paint': {
                'line-color': 'white',
                'line-width': 4
            }
        });
    });
</script>
{{< /rawhtml >}}

I started on the earlier side, around 8:30 in the morning, because I don't like being on the roads with other people. (Why do I voluntarily live in the most crowded city in America when I hate crowds? Idk.) I kicked it off in Brooklyn, making my way through downtown Brooklyn (gloriously quiet, even near the Brooklyn and Manhattan bridge on-ramps), Williamsburg, and Greenpoint.

{{< figure src="IMG_1313.jpeg" caption="Kent Ave in south Williamsburg" alt="Two-way bicycle path with some light greenery on either side. The sky is blue with many white clouds." class="full" >}}

Next I crossed into Queens on the Pulaski Bridge. It isn't the most scenic of crossings, but it does have a nice separated two-way bike path. I don't know why I always think Queens is so far away, because it took me about 20 minutes to get to this bridge. Of the four bridges I crossed on this ride, this one was the shortest and had the lowest elevation grade, which was a good way to ease in to the ride.

{{< figure src="IMG_1316.jpeg" caption="Pulaski Bridge into Queens" alt="Two-way bicycle lane adjacent to a highway on a bridge. There's lots of concrete but the sky is still blue with many white clouds." class="full" >}}

I took a short detour in a nice green park, which turned out to be Queensbridge Park. It was pretty quiet, other than a person playing catch with their dog, a few joggers, and a family setting up for what appeared to be a quinceañera. 

{{< figure src="IMG_1323.jpeg" caption="Queensbridge Park facing Roosevelt Island and Manhattan" alt="Green track bike against a fence in the foreground, the East River and various buildings on Roosevelt Island in the background, with the Queensboro bridge stretching out on the left" class="full" >}}

The next bridge I crossed was the Robert F. Kennedy bridge, which goes through Randall's Island. This next leg was probably the most interesting part of my ride, because it didn't even feel like New York City. 

{{< figure src="IMG_1329.jpeg" caption="The bridge was totally empty of pedestrians, so I didn't feel too bad being That Guy riding a bike and snapping this pic 😎" alt="" class="full" >}}

Randall's Island is technically part of the borough of Manhattan. It has a park and a wastewater treatment facility. I always get it mixed up with Roosevelt Island in my mind, which is the one where people live and the F train has a stop there. 

{{< figure src="IMG_1340.jpeg" caption="Bike path on Randall's Island" alt="Another two-way bike path, with some pretty purple flowers on the left side" class="full" >}}

Randall's Island was nice and quiet, almost felt suburban, although unfortunately there is a fairly obvious stench of sewage, which is maybe why it is not residential. There was a stretch of bike/ped path under the bridge which was unlike anything I've ever encountered in New York City.

{{< figure src="IMG_1344.jpeg" caption="Nice long-ish bike path under the bridge with dramatic archways" alt="" class="full" >}}

After my brief (~10 min) jaunt on Randall's Island, I found myself in the Bronx. I assumed I would take another long bridge, but after a short path (I don't even remember crossing water), I was in South Bronx.

I got very lost and confused trying to find the right bridge to cross back into Manhattan (I kept going in circles around the Third Avenue Bridge, which almost looked like a highway, and it triggered a memory I'd forgotten about from this one time when I lived in Chicago about 15 years ago when I was much more risk tolerant and adventurous on the bicycle and I accidentally got on Lake Shore Drive which is basically a highway and does NOT have bike lanes). 

{{< figure src="IMG_1350.jpeg" caption="Bronx love" alt="" class="full" >}}

I found a coffee shop and decided to treat myself to a second espresso (I had had one at home to start my day as I do every day) while I figured it out. When I ordered, the barista (a tall Black guy with wire-rimmed glasses and a cream colored beanie, what we would call a hipster ten years ago but is now just a guy lol) said, "Oh man, I KNEW you were gonna ask for that! You're on your bike _[I was carrying my helmet]_, you probably just need a quick burst of caffeine, and I was like 'she probably wants an espresso'!" It was pretty sweet and wholesome.

{{< figure src="IMG_1352.jpeg" caption="Espresso stop" alt="" class="full" >}}

I sat outside in the sun and enjoyed my espresso. There were a couple of kids pushing each other on what appeared to be an ergonomic office chair on the sidewalk outside an auto body shop next door. They were having a good time One kid was wearing a Steph Curry jersey (although weirdly it didn't have "Curry" on it, just a Warriors #30 jersey).

I kept it moving and rode into Manhattan on the Willis Avenue Bridge. It had a nice wide path for both pedestrians and cyclists, although it was just me and a bunch of delivery drivers, probably making their way into Manhattan for their workday (it was around 10:30 am at this point). I landed in Harlem on the other side of the bridge and was glad to be back on the familiar grid, although I always forget where to get onto the bike path on the west side. I wandered in Riverside Park a bit.

{{< figure src="IMG_1360.jpeg" caption="Riverside Park" alt="" class="full" >}}

Once I made it to the Hudson River Greenway, it was a pretty straight shot downtown ~100 blocks or so. By this time more people were out since it was a non-rainy Saturday late morning. 

{{< figure src="IMG_1364.jpeg" caption="Hudson River Greenway, along the west side of Manhattan" alt="" class="full" >}}

I made it downtown in pretty good time, although I was starting to get a little tired, annoyed by people, and hungry. 

{{< figure src="IMG_1372.jpeg" caption="One World Trade Center, facing downtown" alt="" class="full" >}}

I stopped for a Taiwanese pork chop in Chinatown. There was a food festival happening on Pell Street, which is one of the smaller off-the-grid streets in Manhattan Chinatown. 

{{< figure src="IMG_1376.jpeg" caption="Pell Street, Manhattan Chinatown" alt="" class="full" >}}

I hopped back on my bike and rode across the Manhattan Bridge back to Brooklyn to complete my ~26 mile loop. All told, it was a great ride! And as I was crossing the bridge, it started drizzling, so my timing was pretty good. If I hadn't made any stops, it could have taken about two and a half hours, but I enjoyed doing it a little bit more slowly and appreciating the journey.

<hr />

**Epilogue**

Also! I have also been meaning to put together something like the customized map above to document and share my rides for a while now so I am kinda proud that I finally did it! The high level steps were:
1. Track ride in an app called MapMyRide (it's made by UnderArmour and is similar to Strava)
2. Export ride data (basically a bunch of longitude, latitude pairs) as GPX
3. Convert to GPX to GeoJSON
4. Import GeoJSON data to Mapbox Studio
5. Create tileset (which as far as I can tell is essentially a dataset that can be used as a Mapbox layer) in Mapbox Studio
6. Create style (or use an existing style) in Mapbox Studio
7. Embed into this webpage with javascript

I got it to work but don't look under the hood; it's held together with duct tape right now 😅

[^1]: Nothing against Staten Island, which often gets dumped on even though parts of it are very beautiful and it's ethnically diverse and has beaches and a nice Chinese Scholar Garden and is also the only borough I know of with good affordable Sri Lankan food — but it would have added over 10 miles and/or a ferry to my journey, so I left it out for simplicity this time.