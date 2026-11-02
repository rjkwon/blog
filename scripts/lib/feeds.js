// Shared helpers for the *:fetch scripts that save feed data to data/ at build time.

import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));

export const DATA_DIR = path.join(__dirname, "..", "..", "data");

// fetch that throws on non-2xx responses
export async function fetchOK(url, options) {
  const res = await fetch(url, options);
  if (!res.ok) throw new Error(`HTTP ${res.status} from ${url}`);
  return res;
}

// Writes data/<name>.json. Refuses to write empty results so a bad fetch keeps the last good file.
export function saveData(name, items, label = "items") {
  if (!Array.isArray(items) || items.length === 0) {
    throw new Error(`No ${label} to save, keeping existing data/${name}.json`);
  }
  fs.writeFileSync(path.join(DATA_DIR, `${name}.json`), JSON.stringify(items, null, 2));
  console.log(`Saved ${items.length} ${label} to data/${name}.json`);
}

// Runs a fetch script's main function, logging errors without failing the build
export function run(main) {
  main().catch(err => console.error("Error:", err.message));
}
