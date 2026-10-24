// Runs the image optimizer (see lib/images.js) over every image in content/notes,
// or just the folder given. notes:finalize already does this for new notes; this
// is for existing notes or images added after publishing.
//
// Usage: npm run notes:images [-- <folder>]

import fs from 'fs';
import path from 'path';
import { NOTES_DIR } from './lib/notes.js';
import { checkImageTools, isImage, optimizeImage } from './lib/images.js';

const rel = (p) => path.relative(process.cwd(), p);
const dir = path.resolve(process.argv[2] ?? NOTES_DIR);

try {
  checkImageTools();
} catch (err) {
  console.error(`✗ ${err.message}`);
  process.exit(1);
}

const files = fs
  .readdirSync(dir, { recursive: true })
  .map((f) => path.join(dir, f))
  // Drafts are left for notes:finalize
  .filter((f) => isImage(f) && !path.relative(NOTES_DIR, f).split(path.sep).some((part) => part === '_templates' || part.startsWith('draft-')));

let changed = 0;
for (const file of files) {
  const before = fs.statSync(file).size;
  try {
    const out = optimizeImage(file);
    if (!out) continue;
    const after = fs.statSync(out).size;
    console.log(`  ${rel(out)}  ${(before / 1e6).toFixed(1)} MB → ${(after / 1e6).toFixed(1)} MB`);
    if (out !== file) console.warn(`! Converted ${rel(file)} to ${path.basename(out)}; update the note that uses it.`);
    changed++;
  } catch (err) {
    console.warn(`! ${rel(file)}: ${err.message}`);
  }
}

console.log(`✓ Optimized ${changed} of ${files.length} images`);
