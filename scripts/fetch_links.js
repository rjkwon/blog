// fetches links of interest from google sheet, calls appscript endpoint, and saves 9 most recent links to data/linkroll.json

import { fetchOK, saveData, run } from "./lib/feeds.js";

const FEED_URL = "https://script.google.com/macros/s/AKfycbzjyQRiPiz2ejXyBD-68th_q-Mqe-oVQ4925VHfKsCCv7ROimh3fmNVbPujCF0F9nn0/exec?key=x5DA7Gxf8FnCFnDe";

const fetchAndSave = async () => {
  const res = await fetchOK(FEED_URL);
  const data = await res.json();

  const links = data
    .sort((a, b) => new Date(b.dateAdded) - new Date(a.dateAdded))
    .slice(0, 9)
    .map(({ title, url, description, dateAdded }) => ({ title, url, description, dateAdded }));

  saveData("linkroll", links, "links");
};

run(fetchAndSave);
