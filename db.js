// --- Firebase (modular CDN) ---
import { initializeApp } from "https://www.gstatic.com/firebasejs/12.2.1/firebase-app.js";
import { getAuth, createUserWithEmailAndPassword, signInWithEmailAndPassword, onAuthStateChanged } from "https://www.gstatic.com/firebasejs/12.2.1/firebase-auth.js";
import { getFirestore, doc, setDoc, serverTimestamp } from "https://www.gstatic.com/firebasejs/12.2.1/firebase-firestore.js";

// --- Your Firebase config ---
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

// --- Helpers ---
function $(sel) { return document.querySelector(sel); }
function show(el) { el?.classList.remove("hidden"); }
function hide(el) { el?.classList.add("hidden"); }

function friendlyAuthError(err) {
  const map = {
    "auth/email-already-in-use": "That email is already registered.",
    "auth/invalid-email": "Please enter a valid email.",
    "auth/weak-password": "Password is too weak (min 6–8 chars).",
    "auth/user-not-found": "No account found with that email.",
    "auth/wrong-password": "Incorrect password.",
    "auth/network-request-failed": "Network error. Check your connection."
  };
  return map[err.code] || err.message;
}

// --- DOM ready ---
document.addEventListener("DOMContentLoaded", () => {
  const loginForm = $("#login-form");
  const registerForm = $("#register-form");
  const formTitle = $("#form-title");

  if (loginForm && registerForm && formTitle) {
    // Toggle Login/Register
    $("#show-register")?.addEventListener("click", (e) => {
      e.preventDefault();
      hide(loginForm);
      show(registerForm);
      formTitle.innerText = "Register";
    });

    $("#show-login")?.addEventListener("click", (e) => {
      e.preventDefault();
      hide(registerForm);
      show(loginForm);
      formTitle.innerText = "Login";
    });

    // Register handler
    registerForm.addEventListener("submit", async (e) => {
      e.preventDefault();

    if (!termsCheckbox.checked) {
      alert("You must accept the Terms and Conditions to register.");
      return;
    }

    const email = registerForm.querySelector('input[type="email"]').value.trim();
    const pwInputs = registerForm.querySelectorAll('input[type="password"]');
    const password = pwInputs[0].value;
    const confirmPassword = pwInputs[1].value;
    const firstName = registerForm.querySelector('input[placeholder="First Name"]').value.trim();
    const lastName = registerForm.querySelector('input[placeholder="Last Name"]').value.trim();

    if (password !== confirmPassword) {
      alert("Passwords do not match!");
      return;
    }

    try {
      const cred = await createUserWithEmailAndPassword(auth, email, password);
      const user = cred.user;

      // Create user profile doc
      await setDoc(doc(db, "users", user.uid), {
        firstName,
        lastName,
        email,
        createdAt: serverTimestamp()
      });

      alert("Registration successful!");
      // Optional: redirect
      // window.location.href = "index.html";
    } catch (err) {
      alert(friendlyAuthError(err));
    }
  });

    // Login handler
    loginForm.addEventListener("submit", async (e) => {
      e.preventDefault();
    const email = loginForm.querySelector('input[type="email"]').value.trim();
    const password = loginForm.querySelector('input[type="password"]').value;

    try {
      const cred = await signInWithEmailAndPassword(auth, email, password);
      alert("Welcome back, " + cred.user.email);
      // Optional: redirect
      // window.location.href = "index.html";
    } catch (err) {
      alert(friendlyAuthError(err));
    }
  });
  }

  // Terms modal (only runs if those elements exist)
  const termsLabel = $("#termsLabel");
  const termsCheckbox = $("#termsCheckbox");
  const termsModal = $("#termsModal");
  if (termsLabel && termsCheckbox && termsModal) {
    const closeBtn = termsModal.querySelector(".close");
    const acceptBtn = $("#acceptTermsBtn");

    termsLabel.addEventListener("click", (e) => {
      e.preventDefault();
      termsModal.style.display = "block";
    });

    termsCheckbox.addEventListener("click", (e) => {
      e.preventDefault();
      termsModal.style.display = "block";
    });

    acceptBtn?.addEventListener("click", () => {
      termsCheckbox.checked = true;
      termsModal.style.display = "none";
    });

    closeBtn?.addEventListener("click", () => {
      termsCheckbox.checked = false;
      termsModal.style.display = "none";
    });

    window.addEventListener("click", (e) => {
      if (e.target === termsModal) {
        termsCheckbox.checked = false;
        termsModal.style.display = "none";
      }
    });
  }
});

// --- Export for other scripts ---
export { db, auth };
