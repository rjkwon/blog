import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const ACCOUNT_ID = "107080280562182704";
const API_URL = `https://mastodon.social/api/v1/accounts/${ACCOUNT_ID}/statuses?limit=40&exclude_reblogs=true`;

const stripHtml = str => str.replace(/<[^>]+>/g, "").trim();

const fetchAndSave = async () => {
  try {
    const res = await fetch(API_URL);
    const statuses = await res.json();

    // exclude replies to other people
    const filtered = statuses.filter(
      s => s.in_reply_to_id === null || s.in_reply_to_account_id === ACCOUNT_ID
    );

    const latest = filtered.slice(0, 6);

    const reordered = [];
    let i = 0;
    while (i < latest.length) {
      let j = i;
      while (j + 1 < latest.length && latest[j].in_reply_to_id === latest[j + 1].id) {
        j++;
      }
      const group = latest.slice(i, j + 1);
      const isComplete = j > i && latest[j].in_reply_to_id === null;
      reordered.push(...(isComplete ? [...group].reverse() : group));
      i = j + 1;
    }

    // show toots within threads in chronological order
    const connectedAbove = i => reordered[i]?.in_reply_to_id === reordered[i - 1]?.id;
    const connectedBelow = i => reordered[i + 1]?.in_reply_to_id === reordered[i]?.id;

    const posts = reordered.map((s, i) => {
      const above = i > 0 && connectedAbove(i);
      const below = i < reordered.length - 1 && connectedBelow(i);
      const thread =
        above && below ? "middle" :
        above          ? "end"    :
        below          ? "start"  :
                         "none";

      return {
        id: s.id,
        content: stripHtml(s.content),
        url: s.url,
        created_at: s.created_at,
        thread,
        media_attachments: s.media_attachments.map(m => ({
          type: m.type,
          url: m.url,
          preview_url: m.preview_url,
          description: m.description,
        })),
      };
    });

    const outputPath = path.join(__dirname, "..", "assets", "mastodon.json");
    fs.writeFileSync(outputPath, JSON.stringify(posts, null, 2));
    console.log(`Saved ${posts.length} toots to assets/mastodon.json`);
  } catch (err) {
    console.error("Error:", err);
  }
};

fetchAndSave();
