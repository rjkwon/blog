// Creates a new draft note from the Obsidian template (content/notes/_templates/note.md)
// in a placeholder folder, e.g. content/notes/draft-20261011-1432/index.md.
// Write it, set the title, then run `npm run notes:finalize` to rename the folder.

import fs from 'fs';
import path from 'path';
import { NOTES_DIR, TEMPLATE_PATH, isoNow } from './lib/notes.js';

const now = new Date();
const stamp = isoNow(now).slice(0, 16).replace(/[-:]/g, '').replace('T', '-'); // 20261011-1432

let folder = `draft-${stamp}`;
for (let n = 2; fs.existsSync(path.join(NOTES_DIR, folder)); n++) {
  folder = `draft-${stamp}-${n}`;
}

// Fill in Obsidian's {{date...}} placeholders. The template only uses the full timestamp.
const template = fs.readFileSync(TEMPLATE_PATH, 'utf8');
const content = template.replace(/\{\{date(:[^}]*)?\}\}/g, isoNow(now));

const notePath = path.join(NOTES_DIR, folder, 'index.md');
fs.mkdirSync(path.dirname(notePath));
fs.writeFileSync(notePath, content);

console.log(`Created ${path.relative(process.cwd(), notePath)}`);
