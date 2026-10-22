// Guestbook form: sends a note to the Firestore "guestbook" collection, where it's stored until studio printer picks it up.
// See scripts/guestbook/README.md for the whole setup. Loaded as a module (for the Firebase imports).

import { initializeApp } from "https://www.gstatic.com/firebasejs/10.12.0/firebase-app.js";
import { getFirestore, collection, addDoc, serverTimestamp } from "https://www.gstatic.com/firebasejs/10.12.0/firebase-firestore.js";

// Intentionally public (Firestore rules are what protect the db)
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
  const db = getFirestore(initializeApp(firebaseConfig));
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

    sending = true;
    button.disabled = true;
    button.textContent = "Traveling thru the intertubes...";

    try {
      // These fields have to match Firestore rules exactly (see copyof_firestore.rules)
      await addDoc(collection(db, "guestbook"), {
        name: name,
        contact: contact,
        message: message,
        createdAt: serverTimestamp()
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
