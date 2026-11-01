// fetches links of interest from google sheet, calls appscript endpoint, and saves 9 most recent links to assets/linkroll.json

import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const FEED_URL = "https://script.google.com/macros/s/AKfycbzjyQRiPiz2ejXyBD-68th_q-Mqe-oVQ4925VHfKsCCv7ROimh3fmNVbPujCF0F9nn0/exec?key=x5DA7Gxf8FnCFnDe";

const fetchAndSave = async () => {
  try {
    const res = await fetch(FEED_URL);
    if (!res.ok) throw new Error(`HTTP error! Status: ${res.status}`);
    const data = await res.json();
    if (!Array.isArray(data) || data.length === 0) throw new Error("Feed returned no links");

    const links = data
      .sort((a, b) => new Date(b.dateAdded) - new Date(a.dateAdded))
      .slice(0, 9)
      .map(({ title, url, description, dateAdded }) => ({ title, url, description, dateAdded }));

    const outputPath = path.join(__dirname, "..", "assets", "linkroll.json");
    fs.writeFileSync(outputPath, JSON.stringify(links, null, 2));
    console.log(`Saved ${links.length} links to assets/linkroll.json`);
  } catch (err) {
    console.error("Error:", err);
  }
};

fetchAndSave();
