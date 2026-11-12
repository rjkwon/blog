// Local-only editor for cans.json
// node scripts/edit_cans.js

import fs from "fs";
import http from "http";
import path from "path";

const PHOTO_DIR = path.resolve("content/cans");
const DATA_FILE = path.resolve("data/cans.json");
const PORT = 4455;
const HOST = `127.0.0.1:${PORT}`;
const ALLOWED_HOSTS = [HOST, `localhost:${PORT}`];
const EDITABLE = ["caption", "alt", "location"];
const MAX_BODY_BYTES = 100_000;

function readPhotos() {
  return JSON.parse(fs.readFileSync(DATA_FILE, "utf-8"));
}

function writePhotos(photos) {
  const temp = `${DATA_FILE}.tmp`;
  fs.writeFileSync(temp, JSON.stringify(photos, null, 2), "utf-8");
  fs.renameSync(temp, DATA_FILE);
}

function send(res, status, type, body) {
  res.writeHead(status, { "Content-Type": type });
  res.end(body);
}

function sendText(res, status, message) {
  send(res, status, "text/plain; charset=utf-8", message);
}

function readBody(req) {
  return new Promise((resolve, reject) => {
    let body = "";
    req.on("data", chunk => {
      body += chunk;
      if (body.length > MAX_BODY_BYTES) reject(new Error("Body too large"));
    });
    req.on("end", () => resolve(body));
    req.on("error", reject);
  });
}

function servePhoto(res, filename) {
  // Only names listed in cans.json are served, so a path can't escape the folder.
  if (!readPhotos().some(photo => photo.filename === filename)) {
    return sendText(res, 404, "Unknown photo");
  }
  fs.readFile(path.join(PHOTO_DIR, filename), (error, data) => {
    if (error) return sendText(res, 404, "Photo file not found");
    send(res, 200, "image/jpeg", data);
  });
}

async function save(req, res) {
  // Blocks other websites from posting to this server while it's running.
  if (req.headers.origin !== `http://${req.headers.host}`) {
    return sendText(res, 403, "Forbidden");
  }

  const { filename, ...changes } = JSON.parse(await readBody(req));
  const photos = readPhotos();
  const photo = photos.find(p => p.filename === filename);
  if (!photo) return sendText(res, 404, "Unknown photo");

  for (const [field, value] of Object.entries(changes)) {
    if (!EDITABLE.includes(field) || typeof value !== "string") {
      return sendText(res, 400, `Invalid field: ${field}`);
    }
    photo[field] = value.trim();
  }

  writePhotos(photos);
  sendText(res, 200, "Saved");
}

const server = http.createServer(async (req, res) => {
  try {
    if (!ALLOWED_HOSTS.includes(req.headers.host)) return sendText(res, 403, "Forbidden");

    const { pathname } = new URL(req.url, `http://${HOST}`);

    if (req.method === "GET" && pathname === "/") {
      return send(res, 200, "text/html; charset=utf-8", PAGE);
    }
    if (req.method === "GET" && pathname === "/photos") {
      return send(res, 200, "application/json", JSON.stringify(readPhotos()));
    }
    if (req.method === "GET" && pathname.startsWith("/photo/")) {
      return servePhoto(res, decodeURIComponent(pathname.slice("/photo/".length)));
    }
    if (req.method === "POST" && pathname === "/save") {
      return await save(req, res);
    }
    sendText(res, 404, "Not found");
  } catch (error) {
    console.error(error);
    sendText(res, 500, error.message);
  }
});

const PAGE = `<!doctype html>
<html lang="en">
<meta charset="utf-8">
<title>Edit cans</title>

<h1>cans.json editor</h1>
<p><span id="progress"></span></p>
<p><label><input type="checkbox" id="only-missing">Blank fields only</label></p>
<datalist id="locations"></datalist>
<div id="photos"></div>

<script>
  var FIELDS = ["caption", "alt", "location"];
  var LABELS = { caption: "Caption", alt: "Alt text", location: "Location" };
  var photos = [];
  var unsaved = new Set();

  function isMissing(photo) {
    return FIELDS.some(function (field) { return !photo[field]; });
  }

  function updateProgress() {
    var done = photos.filter(function (photo) { return !isMissing(photo); }).length;
    document.getElementById("progress").textContent = done + " of " + photos.length + " complete";
  }

  function updateLocations() {
    var names = new Set(photos.map(function (photo) { return photo.location; }).filter(Boolean));
    var list = document.getElementById("locations");
    list.replaceChildren();
    Array.from(names).sort().forEach(function (name) {
      var option = document.createElement("option");
      option.value = name;
      list.appendChild(option);
    });
  }

  async function saveField(photo, field, input, status) {
    var change = { filename: photo.filename };
    change[field] = input.value;
    status.textContent = "Saving...";
    try {
      var response = await fetch("/save", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(change)
      });
      if (!response.ok) throw new Error(await response.text());
      photo[field] = input.value.trim();
      unsaved.delete(input);
      status.textContent = "Saved";
      updateProgress();
      updateLocations();
    } catch (error) {
      status.textContent = "NOT SAVED: " + error.message;
    }
  }

  function buildField(photo, field, status) {
    var label = document.createElement("label");
    label.style.display = "block";
    label.append(LABELS[field], document.createElement("br"));

    var input;
    if (field === "location") {
      input = document.createElement("input");
      input.setAttribute("list", "locations");
      input.size = 30;
    } else {
      input = document.createElement("textarea");
      input.rows = 3;
      input.cols = 50;
    }
    input.value = photo[field] || "";
    input.addEventListener("input", function () {
      unsaved.add(input);
      status.textContent = "Unsaved";
    });
    input.addEventListener("change", function () {
      saveField(photo, field, input, status);
    });
    label.appendChild(input);
    return label;
  }

  function buildRow(photo) {
    var row = document.createElement("div");
    row.style.cssText = "display:flex;gap:1em;margin-bottom:2em";

    var src = "/photo/" + encodeURIComponent(photo.filename);
    var link = document.createElement("a");
    link.href = src;
    link.target = "_blank";
    var image = document.createElement("img");
    image.src = src;
    image.alt = "";
    image.loading = "lazy";
    image.style.cssText = "width:320px;aspect-ratio:3/4;object-fit:contain;display:block";
    link.appendChild(image);

    var form = document.createElement("div");
    var title = document.createElement("p");
    title.textContent = photo.filename;
    var status = document.createElement("p");
    form.appendChild(title);
    FIELDS.forEach(function (field) {
      form.appendChild(buildField(photo, field, status));
    });
    form.appendChild(status);

    row.append(link, form);
    photo.row = row;
    return row;
  }

  document.getElementById("only-missing").addEventListener("change", function (event) {
    photos.forEach(function (photo) {
      photo.row.style.display = event.target.checked && !isMissing(photo) ? "none" : "flex";
    });
  });

  window.addEventListener("beforeunload", function (event) {
    if (unsaved.size) event.preventDefault();
  });

  fetch("/photos").then(function (response) { return response.json(); }).then(function (data) {
    photos = data.reverse();
    var container = document.getElementById("photos");
    photos.forEach(function (photo) { container.appendChild(buildRow(photo)); });
    updateProgress();
    updateLocations();
  });
</script>
</html>
`;

server.listen(PORT, "127.0.0.1", () => {
  console.log(`Editing ${DATA_FILE}`);
  console.log(`Open http://${HOST}`);
});
