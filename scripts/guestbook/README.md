# Guestbook + receipt printer

Would you like a receipt for your visit to kwon.nyc? Kind visitors to my website can sign the guestbook at [kwon.nyc/guestbook](https://kwon.nyc/guestbook/), and each message prints on a thermal receipt printer that lives in my [studio](https://kwon.space). The printer is connected to a Raspberry Pi 4 that's only online when I'm in the studio (about once or twice a week), so messages wait in a queue until then.

## How it works

* Visitor submits message
* Message and data are stored in Firestore (NoSQL database)
* Kwon goes to studio and turns on Raspberry Pi
* Poller script on Pi runs on bootup
* Thermal receipt printer prints queued messages then deletes data from Firestore
* Kwon separates tickets and scans them to pdf using iPhone
* Processing scripts convert pdf to webp, redact email, and posts to kwon.nyc/guestbook

## Physical components

![Hand-drawn schematic of my guestbook printer setup, showing the thermal printer connected to wall power on one end and to a UART adapter on the other. The UART is connected to a Raspberry Pi 4.](guestbook-printer-schematic.jpg "Schematic of the printer <> Pi setup. Not pictured: Pi has a separate power supply that also goes to wall power.")


**Printer stuff**
* Receipt printer - Cashino CSN-A2 thermal printer
* 58 mm thermal printer paper
* Compatible power cord - check the printer for voltage requirements; mine says 5-9VDC so I use a 9V 2A power cord
* Screw-terminal adapter - for connecting bare red/black wires to power

**Computer + converter stuff**
* Raspberry Pi 4, USB power cord, SD card
* USB-to-TTL Serial Bridge (USB-C UART converter)
* Breadboard wires

**Tools**
* Tiny philips head screwdriver (for screwing in wires to screw-terminal adapter)

(I had originally bought [this starter pack](https://www.adafruit.com/product/600) in 2019 that conveniently included all of the Printer stuff, but it looks like it's not stocked anymore. The product page is still pretty useful for more detailed specs than I've listed here, though.)

## Files

Copies of relevant files in Firestore and on my actual Pi are in this repo for reference:

| Artifact                | Where it lives                                                | Copy in this repo                                                                                                                                                                                                                                                                                                                                             |
| ----------------------- | ------------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Guestbook page          | This repo                                                     | [`list.html`](../../themes/kwon-theme/layouts/guestbook/list.html), [`_index.md`](../../content/guestbook/_index.md), [`guestbook-form.js`](../../themes/kwon-theme/assets/js/guestbook-form.js), [`guestbook-tickets.js`](../../themes/kwon-theme/assets/js/guestbook-tickets.js), [`guestbook.css`](../../themes/kwon-theme/assets/css/pages/guestbook.css) |
| Firestore rules         | Firebase console → Firestore → Rules                          | [`copyof_firestore.rules`](copyof_firestore.rules)                                                                                                                                                                                                                                                                                                            |
| Poller script           | Raspberry Pi: `/home/<user>/guestbook/firebase_poller.py`     | [`copyof_firebase_poller.py`](copyof_firebase_poller.py)                                                                                                                                                                                                                                                                                                      |
| systemd service         | Raspberry Pi: `/etc/systemd/system/guestbook-printer.service` | [`copyof_guestbook-printer.service`](copyof_guestbook-printer.service)                                                                                                                                                                                                                                                                                        |
| Scan processing scripts | This repo                                                     | [`process_scans.sh`](process_scans.sh)<br>[`process_scans.swift`](process_scans.swift)                                                                                                                                                                                                                                                                                                                   |
| Image files             | This repo                                                     | [`content/guestbook/tickets/`](../../content/guestbook/tickets/)                                                                                                                                                                                                                                                                                                                                  |

## Workflow: print tickets from queue

1. **Plug in printer.** Not the end of the world but if Pi starts first, the poller just waits until the printer appears, but printer first is simpler.
2. **Plug in the Pi.** The `guestbook-printer` service starts the poller on bootup.
3. **Connect to WiFi.** Pi joins automatically to my saved network and starts printing queued notes within a few seconds, oldest first.
4. **Finish printing.** Pi enables printing for a limited number of notes per boot as a spam backstop (`MAX_PER_SESSION` in the poller). If there are more, reboot the Pi to print the next batch (manually or `sudo systemctl restart guestbook-printer`)
5. **Shut down and unplug:** SSH in and run `sudo shutdown now`. Wait ~10 seconds until the green light has stopped flickering, then unplug.

TODO
* [ ] Add a physical shutdown button
* [ ] Build plywood housing for the setup

## Workflow: post scanned tickets to website

1. Use iPhone to scan ticket(s) directly into Files
2. Save in iCloud Drive
3. Run the script: ```npm run guestbook:scans```. It
   * names the image by its ticket number 
   * redacts email addresses for privacy
   * saves file as webp (requires ImageMagick - `brew install imagemagick`)
   * pdf of `GUEST #28` ticket → `ticket-028.webp`
1. Review flags and resolve manually
   * "no ticket number found": the file is saved as `unknown-<pdf>-p<page>.webp`. Rename it to `ticket-###.webp`
   * "no Contact line found": usually the visitor just didn't leave one, but open it and make sure nothing private shows
   * inspect images for any weird redaction behavior
5. Commit and push
   * final webp images live in `content/guestbook/tickets/`, and data in`data/guestbook.json`.

Other useful commands:
* `npm run guestbook:scans`
 * `npm run guestbook:scans -- --force` --> redo every image (e.g. if you change the script)
 * `npm run guestbook:scans -- --show-contact 25` --> show a contact line that was covered because it isn't clearly a URL
 * `npm run guestbook:scans -- --show-contact 25,31` --> same as above but for multiple tickets

## Resources 
* https://cdn-learn.adafruit.com/downloads/pdf/networked-thermal-printer-using-cups-and-raspberry-pi.pdf
* https://www.youtube.com/watch?v=r6KvQShmRJg
* https://simon-says.info/2014/2014-05-28-cashinotech-csn-a2-t-thermal-printer
* https://github.com/exciting-io/printer/wiki/Making-your-own-printer-with-a-Raspberry-Pi
* https://developer.apple.com/documentation/vision/recognizing-text-in-images