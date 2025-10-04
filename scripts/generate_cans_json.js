import fs from "fs";
import path from "path";

const PHOTO_DIR = path.resolve("assets/img/cans");
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

function main() {
  const files = fs.readdirSync(PHOTO_DIR)
    .filter(f => /\.(jpe?g|png|webp)$/i.test(f))
    .sort();

  const photos = files.map(filename => {
    const takenAt = parseDateFromFilename(filename);
    return {
      filename,
      caption: "",
      description: "",
      alt: "",
      takenAt: takenAt
    };
  });

  fs.mkdirSync(path.dirname(OUTPUT), { recursive: true });
  fs.writeFileSync(OUTPUT, JSON.stringify(photos, null, 2), "utf-8");

  console.log(`Wrote ${photos.length} items to ${OUTPUT}`);
}

main();