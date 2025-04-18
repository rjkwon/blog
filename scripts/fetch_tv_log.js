const { google } = require("googleapis");
const fs = require("fs");

const SHEET_ID = process.env.TV_SHEET_ID;
const API_KEY = process.env.SHEETS_API_KEY; 

async function fetchTVLog() {
    const sheets = google.sheets({ version: "v4" });
    
    const res = await sheets.spreadsheets.values.get({
        spreadsheetId: SHEET_ID,
        range: "Shows!A1:H10",
        key: API_KEY,
    });

    const rows = res.data.values;
    if (!rows || rows.length === 0) {
        console.log("No data found.");
        return;
    }

    let markdown = `---
title: "TV Log"
description: "Television I've consumed recently"
type: media
draft: true
---

# TV Log
`;

    rows.forEach(row => {
        markdown += `${row[1]} (${row[3]}) - last watched ${row[6]}\n\n`;
    });

    fs.writeFileSync("content/tv/_index.md", markdown);
    console.log("TV Log updated!");
}

fetchTVLog().catch(console.error);
