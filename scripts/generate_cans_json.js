import fs from "fs";
import path from "path";

const PHOTO_DIR = path.resolve("content/cans");
const OUTPUT = path.resolve("data/cans.json");

function parseDateFromFilename(filename) {
  const base = filename.replace(path.extname(filename), ""); 
  const match = base.match(
    /^(\d{4})-(\d{2})-(\d{2})_(\d{2})-(\d{2})-(\d{2})$/
  );
  if (!match) return null;

  const [_, year, month, day] = match;
  return `${year}-${month}-${day}`; 
}

function readExisting() {
  if (!fs.existsSync(OUTPUT)) return new Map();
  const entries = JSON.parse(fs.readFileSync(OUTPUT, "utf-8"));
  return new Map(entries.map(entry => [entry.filename, entry]));
}

function main() {
  const files = fs.readdirSync(PHOTO_DIR)
    .filter(f => /\.(jpe?g|png|webp)$/i.test(f))
    .sort();

  const existing = readExisting();

  const photos = files.map(filename => ({
    filename,
    caption: "",
    alt: "",
    location: "",
    ...existing.get(filename),
    takenAt: parseDateFromFilename(filename)
  }));

  fs.mkdirSync(path.dirname(OUTPUT), { recursive: true });
  fs.writeFileSync(OUTPUT, JSON.stringify(photos, null, 2), "utf-8");

  console.log(`Wrote ${photos.length} items to ${OUTPUT}`);
}

main();