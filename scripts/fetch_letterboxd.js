import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";
import { XMLParser } from "fast-xml-parser";
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const RSS_URL = "https://letterboxd.com/kwon/rss/";

const fetchAndSave = async () => {
  try {
    const res = await fetch(RSS_URL);
    const xml = await res.text();

    const parser = new XMLParser({
      ignoreAttributes: false,
      removeNSPrefix: true,
    });

    const data = parser.parse(xml);
    const items = data.rss.channel.item;

    const reviews = items.map(item => {
      const fullTitle = item.title || "Untitled";
      const [title, rating] = fullTitle.split(" - ");
      const pubDate = item.pubDate;
      const rawDescription = item.description || "";

      // Strip <img> and extract the second <p> (the review)
      const reviewMatch = rawDescription
        .replace(/<p><img[^>]*><\/p>/i, "")
        .match(/<p>(.*?)<\/p>/i);
      const review = reviewMatch ? reviewMatch[1].trim() : "";

      return {
        title: title?.trim(),
        rating: rating?.trim() || "",
        link: item.link,
        pubDate,
        review,
      };
    });

    const outputPath = path.join(__dirname, "..", "assets", "letterboxd.json");
    fs.writeFileSync(outputPath, JSON.stringify(reviews, null, 2));
    console.log(`Saved ${reviews.length} reviews to assets/letterboxd.json`);
  } catch (err) {
    console.error("Error:", err);
  }
};

fetchAndSave();