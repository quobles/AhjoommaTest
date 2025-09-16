// --- Firebase (modular CDN) ---
import { initializeApp } from "https://www.gstatic.com/firebasejs/12.2.1/firebase-app.js";
import { getAuth, createUserWithEmailAndPassword } from "https://www.gstatic.com/firebasejs/12.2.1/firebase-auth.js";
import { getFirestore, doc, setDoc, serverTimestamp } from "https://www.gstatic.com/firebasejs/12.2.1/firebase-firestore.js";

// --- Firebase config ---
const firebaseConfig = {
  apiKey: "AIzaSyA5uPZtGvRC1VaqINKcVAWUWC9VyA1-b_s",
  authDomain: "ahjoommakmart.firebaseapp.com",
  projectId: "ahjoommakmart",
  storageBucket: "ahjoommakmart.firebasestorage.app",
  messagingSenderId: "1098456404389",
  appId: "1:1098456404389:web:7b057cc99258e122bf584c",
  measurementId: "G-DNLHP8DS8Y"
};

// --- Init Firebase ---
const app = initializeApp(firebaseConfig);
const auth = getAuth(app);
const db = getFirestore(app);

// --- Helper for friendlier errors ---
function friendlyAuthError(err) {
  const map = {
    "auth/email-already-in-use": "That email is already registered.",
    "auth/invalid-email": "Please enter a valid email.",
    "auth/weak-password": "Password is too weak (min 6–8 chars).",
    "auth/network-request-failed": "Network error. Check your connection."
  };
  return map[err.code] || err.message;
}

// --- DOM ready ---
document.addEventListener("DOMContentLoaded", function () {
  // grab the footer form
  const footerForm = document.querySelector("footer form");

  if (!footerForm) {
    console.error("Footer form not found!");
    return;
  }

  footerForm.addEventListener("submit", async function (e) {
    e.preventDefault();

    // get input values
    const email = footerForm.querySelector('input[type="email"]').value.trim();
    const contactNo = footerForm.querySelector('input[placeholder="Contact No."]').value.trim();
    const password = footerForm.querySelector('input[type="password"]').value;

    try {
      // create Firebase Auth user
      const cred = await createUserWithEmailAndPassword(auth, email, password);

      // save extra info to Firestore
      await setDoc(doc(db, "users", cred.user.uid), {
        email: email,
        contactNo: contactNo,
        createdAt: serverTimestamp()
      });

      alert("Registration successful!");
      footerForm.reset();
    } catch (err) {
      alert(friendlyAuthError(err));
    }
  });
});
