// Sends guestbook submission to Firestore collection. See scripts/guestbook/README.md for full setup.

const FIREBASE_URL = "https://www.gstatic.com/firebasejs/10.12.0";

const firebaseConfig = {
  apiKey: "AIzaSyDPCbBJNvHR-J98iYFKvijUFSuFxEryWaI",
  authDomain: "kwon-space-guestbook.firebaseapp.com",
  projectId: "kwon-space-guestbook",
  storageBucket: "kwon-space-guestbook.firebasestorage.app",
  messagingSenderId: "1075470678054",
  appId: "1:1075470678054:web:8868637eb1db543b360ee7"
};

const form = document.getElementById("guestbook-form");

if (form) {
  let firestore;
  const loadFirestore = () => firestore ??= Promise.all([
    import(`${FIREBASE_URL}/firebase-app.js`),
    import(`${FIREBASE_URL}/firebase-firestore.js`)
  ]).then(
    ([app, fs]) => ({ fs, db: fs.getFirestore(app.initializeApp(firebaseConfig)) }),
    (err) => { firestore = null; throw err; } 
  );
  form.addEventListener("focusin", () => loadFirestore().catch(() => {}), { once: true });

  const button = form.querySelector("button[type=submit]");
  let sending = false;

  form.addEventListener("submit", async (e) => {
    e.preventDefault();
    if (sending) return; // ignore double-clicks while a note is already sending
    const name = document.getElementById("name").value.trim() || "Anonymous";
    const contact = document.getElementById("contact").value.trim();
    const message = document.getElementById("message").value.trim();

    if (!message) {
      alert("You have to say something!");
      return;
    }

    // Honeypot for spambots
    if (document.getElementById("extra-info").value) {
      form.reset();
      return;
    }

    sending = true;
    button.disabled = true;
    button.textContent = "Traveling thru the intertubes...";

    try {
      const { fs, db } = await loadFirestore();
      await fs.addDoc(fs.collection(db, "guestbook"), {
        name: name,
        contact: contact,
        message: message,
        createdAt: fs.serverTimestamp()
      });
      alert("Thank you! Your submission is in the print queue and will print the next time the printer is online.");
      form.reset();
    } catch (err) {
      console.error(err);
      alert("Sorry, your note couldn't be sent :( Please try again later.");
    } finally {
      sending = false;
      button.disabled = false;
      button.textContent = "Submit";
    }
  });
}
