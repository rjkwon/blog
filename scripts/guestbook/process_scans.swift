// Turns scanned guestbook ticket PDFs into one web image per ticket.
// Run it via process_scans.sh, which compiles and runs this file.
//
// For every page of every PDF in the input folder:
// 1. Renders the page to a grayscale image IMAGE_WIDTH pixels wide
// 2. Reads the ticket with macOS's built-in text recognition (Vision)
// 3. Names the file by its ticket number: "GUESTBOOK #28" -> ticket-028
// 4. Covers the "Contact:" line with white if it's an email (or anything that isn't clearly a URL),
//    so visitors' email addresses never end up on the site. Website URLs stay visible.
// 5. Skips tickets that already have an image, so re-running is safe and
//    overlapping scans (e.g. 24-27.pdf and 26-28.pdf) don't create duplicates
//
// 6. Saves each ticket's text (number, date, name, website, message) to a JSON data file, for links
//    and alt text on the page, plus where the printed website sits on the image (url_box). New tickets are added; existing entries are left alone (unless --force),
//    so hand-fixed OCR typos survive re-runs.
//
// Writes lossless PNGs to the staging folder; process_scans.sh converts them to WebP in the output folder.
//
// Usage: process_scans <input folder> <output folder> <staging folder> <data file> [--force] [--show-contact 25,31]
//
// --show-contact: show these tickets' contact lines even though they don't look like a website
// (e.g. a bare "remimercier.com"), after checking by eye that they really are websites. Remakes
// those tickets' images and updates their url in the data file, leaving everything else alone.

import Foundation
import PDFKit
import Vision
import ImageIO

let IMAGE_WIDTH: CGFloat = 900
let OUTPUT_EXTENSION = "webp"

let args = CommandLine.arguments
guard args.count >= 5 else {
    print("Usage: process_scans <input folder> <output folder> <staging folder> <data file> [--force] [--show-contact 25,31]")
    exit(1)
}
let inputDir = URL(fileURLWithPath: args[1])
let outputDir = URL(fileURLWithPath: args[2])
let stagingDir = URL(fileURLWithPath: args[3])
let dataFile = URL(fileURLWithPath: args[4])
let force = args.contains("--force")
var showContact = Set<Int>()
if let i = args.firstIndex(of: "--show-contact"), i + 1 < args.count {
    for part in args[i + 1].split(separator: ",") {
        if let n = Int(part.trimmingCharacters(in: .whitespaces)) { showContact.insert(n) }
    }
}

try? FileManager.default.createDirectory(at: outputDir, withIntermediateDirectories: true)
try? FileManager.default.createDirectory(at: stagingDir, withIntermediateDirectories: true)

func recognizeLines(_ image: CGImage) -> [VNRecognizedTextObservation] {
    let request = VNRecognizeTextRequest()
    request.recognitionLevel = .accurate
    request.usesLanguageCorrection = false
    try? VNImageRequestHandler(cgImage: image, options: [:]).perform([request])
    // Top of the page first (Vision's y axis points up)
    let results = (request.results as? [VNRecognizedTextObservation]) ?? []
    return results.sorted { $0.boundingBox.maxY > $1.boundingBox.maxY }
}

func text(_ obs: VNRecognizedTextObservation) -> String {
    return obs.topCandidates(1).first?.string ?? ""
}

// The Contact line, plus lines directly under it with no blank-line gap (a long URL that wrapped).
// Returns what it says (without "Contact:") and the area it takes up, padded but never
// reaching into the line above or below.
func findContact(_ lines: [VNRecognizedTextObservation]) -> (text: String, area: CGRect, lastLine: Int)? {
    guard let start = lines.firstIndex(where: {
        text($0).range(of: #"^\s*contact\s*:"#, options: [.regularExpression, .caseInsensitive]) != nil
    }) else { return nil }

    var area = lines[start].boundingBox
    let lineHeight = area.height
    // Line spacing on this scan: "From:" and "Contact:" are always on consecutive lines.
    // A wrapped URL continues one line-spacing below; the message starts after a blank line (about two).
    let spacing = start > 0 ? lines[start - 1].boundingBox.midY - area.midY : lineHeight * 1.2
    var contact = text(lines[start])
    var end = start
    var previousMid = area.midY
    for i in (start + 1)..<lines.count {
        if previousMid - lines[i].boundingBox.midY > spacing * 1.5 { break }
        area = area.union(lines[i].boundingBox)
        contact += text(lines[i])
        previousMid = lines[i].boundingBox.midY
        end = i
    }

    // Pad generously sideways, but only up to the neighbouring lines vertically ("From:" sits right above)
    let pad = lineHeight * 0.3
    let top = min(area.maxY + pad, start > 0 ? lines[start - 1].boundingBox.minY : 1)
    let bottom = max(area.minY - pad, end + 1 < lines.count ? lines[end + 1].boundingBox.maxY : 0)
    let value = contact.replacingOccurrences(of: #"^\s*contact\s*:\s*"#, with: "", options: [.regularExpression, .caseInsensitive])
    return (value, CGRect(x: area.minX - pad, y: bottom, width: area.width + pad * 2, height: top - bottom), end)
}

// Only show contact info that's clearly a website. Anything else (an email, or a bare "name.com"
// that might really be an email the OCR misread the @ in) gets covered, to be safe.
func isWebsite(_ contact: String) -> Bool {
    let c = contact.trimmingCharacters(in: .whitespaces).lowercased()
    let looksLikeURL = c.hasPrefix("http://") || c.hasPrefix("https://") || c.hasPrefix("www.")
    // A URL can contain @ in its path (mastodon.social/@name), but never before the domain
    let atBeforePath = c.components(separatedBy: "//").last?.split(separator: "/").first?.contains("@") ?? true
    return looksLikeURL && !atBeforePath
}

// The title reads "GUESTBOOK #28", but the OCR sometimes returns "#28" as its own piece, so accept either
func ticketNumber(_ lines: [VNRecognizedTextObservation]) -> Int? {
    let patterns = [#"GUESTBOOK\s*#\s*\d+"#, #"^\s*#\s*\d+\s*$"#]
    for pattern in patterns {
        for obs in lines {
            let s = text(obs)
            if let r = s.range(of: pattern, options: [.regularExpression, .caseInsensitive]) {
                return Int(s[r].filter { $0.isNumber })
            }
        }
    }
    return nil
}

func firstMatch(_ lines: [VNRecognizedTextObservation], _ pattern: String) -> (index: Int, value: String)? {
    for (i, obs) in lines.enumerated() {
        let s = text(obs)
        if let r = s.range(of: pattern, options: [.regularExpression, .caseInsensitive]) { return (i, String(s[r])) }
    }
    return nil
}

// Everything below the From/Contact lines. Lines the printer wrapped are joined with a space;
// a bigger gap (a blank line on the ticket) becomes a paragraph break.
func messageText(_ lines: [VNRecognizedTextObservation], after index: Int, spacing: CGFloat) -> String {
    var message = ""
    var previousMid: CGFloat? = nil
    for obs in lines[(index + 1)...] {
        let s = text(obs).trimmingCharacters(in: .whitespaces)
        // Skip the dashed separator line, if the OCR picked it up
        if s.isEmpty || s.range(of: #"^[-_.~\s]+$"#, options: .regularExpression) != nil { continue }
        if let prev = previousMid {
            message += (prev - obs.boundingBox.midY > spacing * 1.5) ? "\n\n" : " "
        }
        message += s
        previousMid = obs.boundingBox.midY
    }
    return message
}

// The OCR sometimes gets capitals wrong (paulcapewell.coM); hostnames are case-insensitive, so lowercase them
func tidyURL(_ url: String) -> String {
    let trimmed = url.trimmingCharacters(in: .whitespaces)
    guard var parts = URLComponents(string: trimmed.contains("://") ? trimmed : "https://" + trimmed) else { return trimmed }
    parts.host = parts.host?.lowercased()
    return parts.string ?? trimmed
}

func writePNG(_ image: CGImage, to url: URL) -> Bool {
    guard let dest = CGImageDestinationCreateWithURL(url as CFURL, "public.png" as CFString, 1, nil) else { return false }
    CGImageDestinationAddImage(dest, image, nil)
    return CGImageDestinationFinalize(dest)
}

let pdfs = ((try? FileManager.default.contentsOfDirectory(at: inputDir, includingPropertiesForKeys: nil)) ?? [])
    .filter { $0.pathExtension.lowercased() == "pdf" }
    .sorted { $0.lastPathComponent.localizedStandardCompare($1.lastPathComponent) == .orderedAscending }

if pdfs.isEmpty {
    print("No PDFs found in \(inputDir.path)")
    exit(0)
}

var saved = 0, skipped = 0, needsCheck: [String] = []

// Existing entries in the data file, by ticket number
var entries: [Int: [String: Any]] = [:]
if let data = try? Data(contentsOf: dataFile),
   let list = try? JSONSerialization.jsonObject(with: data) as? [[String: Any]] {
    for e in list { if let n = e["number"] as? Int { entries[n] = e } }
}
var handledThisRun = Set<Int>()
var newEntries = 0

for pdfURL in pdfs {
    guard let doc = PDFDocument(url: pdfURL) else {
        print("✗ Couldn't open \(pdfURL.lastPathComponent) (is it downloaded from iCloud?)")
        continue
    }
    for i in 0..<doc.pageCount {
        guard let page = doc.page(at: i) else { continue }
        let where_ = "\(pdfURL.lastPathComponent) page \(i + 1)"

        // Render the page onto a white background, in grayscale (the tickets are black and white anyway)
        let bounds = page.bounds(for: .mediaBox)
        let scale = IMAGE_WIDTH / bounds.width
        let width = Int(IMAGE_WIDTH), height = Int(bounds.height * scale)
        guard let ctx = CGContext(data: nil, width: width, height: height, bitsPerComponent: 8, bytesPerRow: 0,
                                  space: CGColorSpaceCreateDeviceGray(),
                                  bitmapInfo: CGImageAlphaInfo.none.rawValue) else { continue }
        ctx.setFillColor(.white)
        ctx.fill(CGRect(x: 0, y: 0, width: width, height: height))
        ctx.saveGState()
        ctx.scaleBy(x: scale, y: scale)
        page.draw(with: .mediaBox, to: ctx)
        ctx.restoreGState()
        guard let rendered = ctx.makeImage() else { continue }

        let lines = recognizeLines(rendered)
        let number = ticketNumber(lines)
        let base = number.map { String(format: "ticket-%03d", $0) }
            ?? "unknown-\(pdfURL.deletingPathExtension().lastPathComponent)-p\(i + 1)"
        let name = "\(base).\(OUTPUT_EXTENSION)"
        let outURL = outputDir.appendingPathComponent(name)
        let contact = findContact(lines)
        let forceShow = number.map { showContact.contains($0) } ?? false
        let covered = contact.map { !isWebsite($0.text) && !forceShow } ?? false

        // Save the ticket's text to the data file (first scan of each ticket wins, like the images)
        // A ticket named in --show-contact keeps its other (possibly hand-edited) fields; just add the url
        if let n = number, forceShow, !handledThisRun.contains(n), var entry = entries[n], let c = contact {
            entry["url"] = tidyURL(c.text)
            entries[n] = entry
        }
        if let n = number, !handledThisRun.contains(n), entries[n] == nil || force {
            let from = firstMatch(lines, #"^\s*from\s*:.*"#)
            let visitor = from.map { $0.value.replacingOccurrences(of: #"^\s*from\s*:\s*"#, with: "", options: [.regularExpression, .caseInsensitive]) } ?? ""
            let spacing = from.flatMap { f in f.index + 1 < lines.count ? lines[f.index].boundingBox.midY - lines[f.index + 1].boundingBox.midY : nil } ?? 0.04
            var entry: [String: Any] = [
                "number": n,
                "image": name,
                "date": firstMatch(lines, #"\d{4}-\d{2}-\d{2}\s+\d{2}:\d{2}"#)?.value ?? "",
                "name": visitor,
                "message": messageText(lines, after: contact?.lastLine ?? from?.index ?? 1, spacing: spacing),
            ]
            if let c = contact, !covered { entry["url"] = tidyURL(c.text) }
            entries[n] = entry
            newEntries += 1
        }
        // Where the printed URL sits on the image, so the page can make it clickable. It's worked out
        // from the scan, not typed by hand, so it's refreshed on every run (other fields are left alone).
        // Percentages from the top-left, like CSS.
        if let n = number, !handledThisRun.contains(n), var entry = entries[n], entry["url"] != nil, let c = contact, !covered {
            let pct = { (v: CGFloat) in (Double(v) * 1000).rounded() / 10 }
            entry["url_box"] = ["left": pct(c.area.minX), "top": pct(1 - c.area.maxY), "width": pct(c.area.width), "height": pct(c.area.height)]
            entries[n] = entry
        }
        if let n = number { handledThisRun.insert(n) }

        // Already posted (unless --force), or already handled earlier in this run (a duplicate scan)
        let stagedURL = stagingDir.appendingPathComponent("\(base).png")
        if (FileManager.default.fileExists(atPath: outURL.path) && !force && !forceShow) || FileManager.default.fileExists(atPath: stagedURL.path) {
            print("· \(where_): already have \(name), skipping")
            skipped += 1
            continue
        }

        // Cover the contact info unless it's a website. Vision boxes are 0–1 with the origin bottom-left, same as CGContext.
        if let c = contact?.area, covered {
            ctx.setFillColor(.white)
            ctx.fill(CGRect(x: c.minX * CGFloat(width), y: c.minY * CGFloat(height),
                            width: c.width * CGFloat(width), height: c.height * CGFloat(height)))
        }
        guard let final = ctx.makeImage(), writePNG(final, to: stagedURL) else {
            print("✗ \(where_): couldn't write \(name)")
            continue
        }
        saved += 1

        var notes: [String] = []
        if number == nil { notes.append("no ticket number found, rename it by hand") }
        if contact == nil { notes.append("no Contact line found, check nothing private is showing") }
        let contactNote = contact.map { covered ? "  (contact covered)" : "  (showing \($0.text))" } ?? ""
        print("✓ \(where_) → \(name)\(contactNote)\(notes.isEmpty ? "" : "  ⚠ " + notes.joined(separator: "; "))")
        if !notes.isEmpty { needsCheck.append(name) }
    }
}

// Newest first, so the page can list them in order as-is
let sorted = entries.values.sorted { ($0["number"] as? Int ?? 0) > ($1["number"] as? Int ?? 0) }
if let json = try? JSONSerialization.data(withJSONObject: sorted, options: [.prettyPrinted, .sortedKeys]) {
    try? json.write(to: dataFile)
}

print("\nSaved \(saved), skipped \(skipped) already done.")
if newEntries > 0 {
    print("Added \(newEntries) ticket(s) to \(dataFile.lastPathComponent). Check the new names, URLs and messages for OCR typos.")
}
if !needsCheck.isEmpty {
    print("Look over by hand: \(needsCheck.joined(separator: ", "))")
}
