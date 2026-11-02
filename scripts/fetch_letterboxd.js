import { fetchOK, saveData, run } from "./lib/feeds.js";
import { XMLParser } from "fast-xml-parser";

const RSS_URL = "https://letterboxd.com/kwon/rss/";

const fetchAndSave = async () => {
  const res = await fetchOK(RSS_URL);
  const xml = await res.text();

  const parser = new XMLParser({
    ignoreAttributes: false,
    removeNSPrefix: true,
  });

  const data = parser.parse(xml);
  const items = data.rss.channel.item;

  const decodeEntities = str =>
    str
      .replace(/&#0*39;/g, "'")
      .replace(/&amp;/g, "&")
      .replace(/&quot;/g, '"')
      .replace(/&lt;/g, "<")
      .replace(/&gt;/g, ">");

  const reviews = items.map(item => {
    const fullTitle = decodeEntities(item.title || "Untitled");
    const [title, rating] = fullTitle.split(" - ");
    const pubDate = item.pubDate;
    const rawDescription = item.description || "";

    // Strip <img> and extract the second <p> (the review)
    const reviewMatch = rawDescription
      .replace(/<p><img[^>]*><\/p>/i, "")
      .match(/<p>(.*?)<\/p>/i);
    const review = reviewMatch ? decodeEntities(reviewMatch[1].trim()) : "";

    return {
      title: title?.trim(),
      rating: rating?.trim() || "",
      link: item.link,
      pubDate,
      review,
    };
  });

  saveData("letterboxd", reviews, "reviews");
};

run(fetchAndSave);
