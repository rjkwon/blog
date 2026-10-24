// Turns a draft note into a published page bundle named after its title:
//   content/notes/Untitled.md          (Obsidian)       -> content/notes/<slug>/index.md
//   content/notes/draft-<stamp>/       (notes:new)      -> content/notes/<slug>/
// Also sets `draft: false`, updates `date` to now, and, for loose Obsidian files,
// moves any images the note references into the new folder. Referenced images
// are then resized and stripped of metadata (see lib/images.js).
//
// Usage: npm run notes:finalize [-- <path to draft>]
// path to draft is optional

import fs from 'fs';
import path from 'path';
import readline from 'readline/promises';
import {
  NOTES_DIR,
  isoNow,
  slugify,
  splitFrontmatter,
  joinFrontmatter,
  getField,
  setField,
  getTags,
} from './lib/notes.js';
import { checkImageTools, isImage, optimizeImage } from './lib/images.js';

const rel = (p) => path.relative(process.cwd(), p);

function fail(message) {
  console.error(`✗ ${message}`);
  process.exit(1);
}

// Loose .md files at the vault root (except _index.md) and draft-* folders
function findDrafts() {
  const drafts = [];
  for (const entry of fs.readdirSync(NOTES_DIR, { withFileTypes: true })) {
    if (entry.isFile() && entry.name.endsWith('.md') && !entry.name.startsWith('_')) {
      drafts.push(path.join(NOTES_DIR, entry.name));
    } else if (entry.isDirectory() && entry.name.startsWith('draft-')) {
      const index = path.join(NOTES_DIR, entry.name, 'index.md');
      if (fs.existsSync(index)) drafts.push(index);
    }
  }
  return drafts;
}

async function pickDraft() {
  const arg = process.argv[2];
  if (arg) {
    let p = path.resolve(arg);
    if (fs.existsSync(p) && fs.statSync(p).isDirectory()) p = path.join(p, 'index.md');
    if (!fs.existsSync(p)) fail(`No such note: ${arg}`);
    return p;
  }

  const drafts = findDrafts();
  if (drafts.length === 0) fail('No drafts found (loose .md files or draft-* folders in content/notes).');
  if (drafts.length === 1) return drafts[0];

  console.log('Which draft?');
  drafts.forEach((d, i) => {
    const fm = splitFrontmatter(fs.readFileSync(d, 'utf8'));
    const title = fm ? getField(fm.lines, 'title') : '';
    console.log(`  ${i + 1}. ${rel(d)}${title ? `  "${title}"` : ''}`);
  });
  const rl = readline.createInterface({ input: process.stdin, output: process.stdout });
  const answer = await rl.question('> ');
  rl.close();
  const choice = drafts[Number(answer) - 1];
  if (!choice) fail('No draft selected.');
  return choice;
}

// Local image files referenced by the note: {{< figure src="..." link="..." >}},
// ![alt](file) and Obsidian's ![[file]]
function referencedImages(body) {
  const refs = new Set();
  for (const m of body.matchAll(/\b(?:src|link)="([^"]+)"/g)) refs.add(m[1]);
  for (const m of body.matchAll(/!\[[^\]]*\]\(<?([^)>]+?)>?(?:\s+"[^"]*")?\)/g)) refs.add(m[1]);
  for (const m of body.matchAll(/!\[\[([^\]|#]+)/g)) refs.add(m[1]);
  return [...refs].filter((r) => !/^[a-z]+:|^\//i.test(r)).map(decodeURI);
}

const draftPath = await pickDraft();
const isLoose = path.basename(draftPath) !== 'index.md';
const fm = splitFrontmatter(fs.readFileSync(draftPath, 'utf8'));
if (!fm) fail(`${rel(draftPath)} has no frontmatter.`);

const title = getField(fm.lines, 'title');
if (!title) fail(`${rel(draftPath)} has no title yet. Set one in the frontmatter, then run this again.`);
if (getTags(fm.lines).length === 0) console.warn('! No tags set (continuing anyway).');

const slug = slugify(title);
if (!slug) fail(`Couldn't make a folder name from the title "${title}".`);
const targetDir = path.join(NOTES_DIR, slug);
if (fs.existsSync(targetDir)) fail(`${rel(targetDir)} already exists. Change the title or rename that folder.`);

try {
  checkImageTools();
} catch (err) {
  fail(err.message);
}

setField(fm.lines, 'draft', 'false');
setField(fm.lines, 'date', isoNow());

// Resize and strip each referenced image in imageDir; HEIC files become .jpg,
// so their references in the note are updated too
function optimizeImages(imageDir) {
  for (const img of referencedImages(fm.body)) {
    const file = path.join(imageDir, img);
    if (!fs.existsSync(file) || !isImage(file)) continue;
    try {
      const out = optimizeImage(file);
      if (!out) continue;
      console.log(`  optimized ${img}`);
      if (out !== file) fm.body = fm.body.replaceAll(img, path.relative(imageDir, out));
    } catch (err) {
      console.warn(`! Couldn't optimize ${img}: ${err.message}`);
    }
  }
}

if (isLoose) {
  fs.mkdirSync(targetDir);
  for (const img of referencedImages(fm.body)) {
    const from = path.join(path.dirname(draftPath), img);
    if (!fs.existsSync(from)) {
      console.warn(`! Image not found next to the draft, not moved: ${img}`);
      continue;
    }
    const to = path.join(targetDir, img);
    fs.mkdirSync(path.dirname(to), { recursive: true });
    fs.renameSync(from, to);
    console.log(`  moved ${img}`);
  }
  optimizeImages(targetDir);
  fs.writeFileSync(path.join(targetDir, 'index.md'), joinFrontmatter(fm.lines, fm.body));
  fs.unlinkSync(draftPath);
} else {
  optimizeImages(path.dirname(draftPath));
  fs.writeFileSync(draftPath, joinFrontmatter(fm.lines, fm.body));
  fs.renameSync(path.dirname(draftPath), targetDir);
}

console.log(`✓ Published "${title}" → ${rel(path.join(targetDir, 'index.md'))}`);
