This is my personal website, built with Hugo. It's a static site that lives at [kwon.nyc](https://kwon.nyc/).

## Stack

- **Hugo** - static site generator
- **Netlify** - hosting
- **Node.js** - Build-time data fetching scripts

## Setup

```bash
# Clone the repo
git clone https://github.com/rjkwon/blog.git

# Install dependencies
npm install

# Run local dev server
hugo server
```

## Homepage sections (media logs)

### Currently reading

Displays one book I'm currently reading, tracked at literal.club. Uses the literal.club API. 

- **Template:** `layouts/partials/literal.html`
- **Updates:** Fetched directly at build time using Hugo's `resources.GetRemote`

### Recently watched 

Displays recent movie watches, tracked at Letterboxd. Letterboxd doesn't give access to their API for personal projects, so this approach uses a script to fetch the RSS feed for my data and convert it to JSON, then Hugo uses the data file to generate the section on my homepage.

- **Script:** `scripts/fetch_letterboxd.js` 
- **Data:** `assets/letterboxd.json`
- **Template:** `layouts/partials/letterboxd.html`
- **Updates:** Runs automatically at build time

### Links of interest ("Meanwhile, on the internet...")

Displays 9 recent links of interest, tracked in [this Google Sheet](https://docs.google.com/spreadsheets/d/1r13l2GHJVEU4pMHouyU1q8DaAOV0UZCytaHAd3eoy5M/edit?gid=1699290178#gid=1699290178). Uses a Google Apps Script endpoint 

- **Script:** `assets/js/links.js`
- **Data:** [Google Sheet](https://docs.google.com/spreadsheets/d/1r13l2GHJVEU4pMHouyU1q8DaAOV0UZCytaHAd3eoy5M/edit?gid=1699290178#gid=1699290178)
- **Updates:** Google Apps Script endpoint, fetches at page load

## Content sections

### /notes

Notes (blog posts) written in Markdown.

- **Content:** `content/notes/`
- **Template:** `layouts/_default/single.html`

### /about

My bio and other stuff about me

- **Content:** `content/about/`
- **Template:** `layouts/about/single.html`

### /colophon

How this site is built, less technical than this README.

- **Content:** `content/colophon/`
- **Template:** `layouts/colophon/single.html`

## Microsites and special features

### /bike

Microsite about my bike. I "manually" traced each bike part from a photo to create an SVG with each part as a group, then animated it using [GSAP](https://gsap.com/)/ScrollTrigger. 

- **Content:** `content/bike/` (just the blurb)
- **Layout:** `layouts/bike/` 
- **CSS:** `static/css/bike.css` 
- **Animation:** GSAP + ScrollTrigger (loaded via CDN in `layouts/bike/baseof.html`)
- **Related notes:** auto-lists any post from /notes tagged `bike` via `{{ range .Site.Taxonomies.tags.bike }}` in `single.html` 
- **SVG:** created in Figma and optimized with [svgo](https://svgo.dev/). If I edit the source SVG, re-run the following:
  ```
  npx svgo@3 bike.svg -o bike.svg --config svgo.config.js --pretty --indent 4 --final-newline
  ```

### /cans

An ongoing stream of photos of craft beer cans with neat designs. Images are processed locally using ImageMagick and ImageOptim, then a script generates per-can info into a JSON file that Hugo uses to create the page. 

TODO 
* [ ] Add alt text and captions
* [ ] Update pipeline to generate smaller, webp images

- **Content:** `content/cans/`
- **Data:** 
  - `data/cans.json` 
  - `static/cans` 
- **Scripts:** 
  - `scripts/process_can_photos.sh` - processes original photos (run locally)
  - `scripts/generate_cans_json.js` - generates JSON from photos (runs as part of `npm run build`)
- **Template:** `layouts/cans/list.html`

### /dad-hats

My dad's hats.

TODO
* [ ] Add alt text
* [ ] Consider displaying captions
* [ ] Finish writing descriptions and consider displaying them

  - **Content:** `content/dad-hats/` (just a blurb about why I made this)
  - **Data:** `data/hats.json`, with the following keys per hat:
    — `image`: image url
    - `caption`: image caption (usually just whatever text is on the hat)
    - `description`: a personal note about the hat and its significance
    - `alt`: alt text
    - `bg_color` (not in use): custom background color, used for a different version of this page
    - `text_color` (not  in use): custom text color, used for a different version of this page
  - **Images:** `static/hats/`
  - **Layout:** `layouts/hats/` 

### /december-adventure-2025

Microsite for December Adventure, a challenge stewarded by [eli_oat](https://eli.li/), with daily updates for the month of December.

- **Content:** `content/december-adventure-2025/`
- **Layout:** `layouts/decadv/`

### curl detector

Bare bones, CLI version of the site, via `curl`. Uses a Netlify edge function. Inspired by [elle](https://ellesho.me/page/).

- **Edge function:** `netlify/edge-functions/curl-detector.js`
- **Config:** Mapped to `/` in `netlify.toml`

## Directory structure

```
├── assets/
│   ├── css/                 # Additional stylesheets
│   ├── js/                  # JavaScript (links.js)
│   └── *.json               # Generated data (letterboxd.json)
├── content/
│   ├── about/
│   ├── blank/               # A blank page, just for fun
│   ├── cans/                
│   ├── colophon/
│   ├── december-adventure-2025/
│   ├── notes/               # Blog posts
│   └── ...
├── data/
│   ├── cans.json
│   ├── hats.json
│   └── links.json           
├── netlify/
│   └── edge-functions/      # curl-detector.js
├── scripts/
│   ├── fetch_letterboxd.js
│   └── generate_cans_json.js
├── static/
│   ├── cans/                # craft beer can image files
│   ├── decadv/              # December Adventure image files
│   ├── hats/                # dad-hats image files
│   └── images/
├── themes/
│   └── kwon-theme/
│       ├── assets/css/      # main stylesheets
│       └── layouts/         # Hugo templates
├── hugo.toml                # Hugo config
├── netlify.toml             # Netlify config
└── package.json             # npm scripts
```

## Build & deployment

```bash
npm run build
```

This runs:
1. `npm run prebuild` - Fetches Letterboxd and generates cans JSON
2. `hugo --gc` - Builds the static site

Pushes to `main` trigger a Netlify build automatically. Hugo version and build settings are in `netlify.toml`.
