const { google } = require("googleapis");
const fs = require("fs");
require("dotenv").config();

const SHEET_ID = process.env.GOOGLE_SHEET_ID;
const API_KEY = process.env.GOOGLE_API_KEY; // Store this as a GitHub Secret

async function fetchTVLog() {
    const sheets = google.sheets({ version: "v4", auth: API_KEY });

    const res = await sheets.spreadsheets.values.get({
        spreadsheetId: SHEET_ID,
        range: "Shows!A:B",
    });

    const rows = res.data.values;
    if (!rows || rows.length === 0) {
        console.log("No data found.");
        return;
    }

    let markdown = "# TV Log\n\n";
    rows.forEach(row => {
        markdown += `## ${row[0]} - ${row[1]}\n\n`;
    });

    fs.writeFileSync("content/tv.md", markdown);
    console.log("✅ TV Log updated!");
}

fetchTVLog().catch(console.error);
