// Shared helpers for notes:new and notes:finalize scripts.

import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));

export const NOTES_DIR = path.join(__dirname, '..', '..', 'content', 'notes');
export const TEMPLATE_PATH = path.join(NOTES_DIR, '_templates', 'note.md');

export function isoNow(d = new Date()) {
  const pad = (n) => String(Math.abs(n)).padStart(2, '0');
  const offset = -d.getTimezoneOffset();
  const sign = offset >= 0 ? '+' : '-';
  return (
    `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}` +
    `T${pad(d.getHours())}:${pad(d.getMinutes())}:${pad(d.getSeconds())}` +
    `${sign}${pad(Math.floor(Math.abs(offset) / 60))}:${pad(Math.abs(offset) % 60)}`
  );
}

// Change title ("Title of My Post") to slug ("title-of-my-post")
export function slugify(title) {
  return title
    .normalize('NFKD')
    .replace(/[̀-ͯ]/g, '')
    .toLowerCase()
    .replace(/['’]/g, '')
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '');
}

// Split note into frontmatter lines and body
export function splitFrontmatter(text) {
  const match = text.match(/^---\r?\n([\s\S]*?)\r?\n---\r?\n?([\s\S]*)$/);
  if (!match) return null;
  return { lines: match[1].split(/\r?\n/), body: match[2] };
}

export function joinFrontmatter(lines, body) {
  return `---\n${lines.join('\n')}\n---\n${body}`;
}

// Value of a top-level scalar field like `title: "Foo"`, unquoted. '' if missing/empty.
export function getField(lines, key) {
  const line = lines.find((l) => l.startsWith(`${key}:`));
  if (!line) return '';
  return line
    .slice(key.length + 1)
    .trim()
    .replace(/^(["'])(.*)\1$/, '$2');
}

export function setField(lines, key, value) {
  const i = lines.findIndex((l) => l.startsWith(`${key}:`));
  const line = `${key}: ${value}`;
  if (i === -1) lines.push(line);
  else lines[i] = line;
  return lines;
}

// Tags as a list, from either `tags: [a, b]` or a YAML list below `tags:`
export function getTags(lines) {
  const i = lines.findIndex((l) => l.startsWith('tags:'));
  if (i === -1) return [];
  const inline = lines[i].slice(5).trim();
  if (inline) {
    return inline
      .replace(/^\[|\]$/g, '')
      .split(',')
      .map((t) => t.trim())
      .filter(Boolean);
  }
  const tags = [];
  for (const l of lines.slice(i + 1)) {
    const m = l.match(/^\s*-\s*(.*)$/);
    if (!m) break;
    if (m[1].trim()) tags.push(m[1].trim());
  }
  return tags;
}
