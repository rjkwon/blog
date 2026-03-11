This is my personal website, built with Hugo. It's a static site and you can see it live at [kwon.nyc](https://kwon.nyc/).

## Stack

- **Hugo** - Static site generator
- **Netlify** - Hosting
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

## Homepage Sections


### Recently Watched (Letterboxd)

Displays recent movie watches from Letterboxd.

- **Data:** `assets/letterboxd.json`
- **Script:** `scripts/fetch_letterboxd.js` (fetches RSS, converts to JSON)
- **Template:** `layouts/partials/letterboxd.html`
- **Updates:** Runs automatically at build time via `npm run prebuild`

### Currently Reading (Literal)

Displays the current book from Literal Club.

- **Template:** `layouts/partials/literal.html`
- **Updates:** Fetched directly at build time using Hugo's `resources.GetRemote` (no intermediate JSON file)

### Linkroll

Displays the 9 most recent bookmarks.

- **Script:** `assets/js/links.js`
- **Data source:** Google Apps Script endpoint (fetched client-side at page load)

## Content Sections

### /notes

Blog posts written in Markdown.

- **Content:** `content/notes/`
- **Template:** `layouts/_default/single.html`

### /links

Full archive of bookmarks.

- **Content:** `content/links/_index.md`
- **Data:** `data/links.json` (all bookmarks with title, url, date, description, tags)
- **Template:** `layouts/links/list.html`
- **Note:** This is separate from the homepage linkroll—the archive uses static JSON, the homepage fetches live from Google Apps Script

### /cans

Craft beer can photography.

- **Content:** `content/cans/`
- **Data:** `data/cans.json`
- **Script:** `scripts/generate_cans_json.js` (generates JSON from photos)
- **Template:** `layouts/cans/list.html`

## Special Features

### curl Detector

When someone visits the site via `curl`, they see ASCII art instead of HTML.

- **Edge function:** `netlify/edge-functions/curl-detector.js`
- **Config:** Mapped to `/` in `netlify.toml`

### December Adventure

A custom micro-site for daily December updates with its own layout.

- **Content:** `content/december-adventure-2025/`
- **Layout:** `layouts/decadv/`

## Directory Structure

```
├── assets/
│   ├── css/                 # Additional stylesheets
│   ├── js/                  # JavaScript (links.js)
│   └── *.json               # Generated data (letterboxd.json)
├── content/
│   ├── about/
│   ├── blank/
│   ├── cans/                # Beer can photos
│   ├── colophon/
│   ├── december-adventure-2025/
│   ├── links/
│   ├── notes/               # Blog posts
│   └── ...
├── data/
│   ├── cans.json
│   ├── hats.json
│   └── links.json           # Full bookmarks archive
├── netlify/
│   └── edge-functions/      # curl-detector.js
├── scripts/
│   ├── fetch_letterboxd.js
│   └── generate_cans_json.js
├── static/
│   ├── cans/                # Can images
│   ├── decadv/              # December Adventure images
│   ├── hats/
│   └── images/
├── themes/
│   └── kwon-theme/
│       ├── assets/css/      # Main stylesheets
│       └── layouts/         # Hugo templates
├── hugo.toml                # Hugo config
├── netlify.toml             # Netlify config
└── package.json             # npm scripts
```

## Build & Deployment

```bash
npm run build
```

This runs:
1. `npm run prebuild` - Fetches Letterboxd and generates cans JSON
2. `hugo --gc` - Builds the static site

Pushes to `main` trigger a Netlify build automatically. Hugo version and build settings are in `netlify.toml`.
