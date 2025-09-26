import { auth } from "./db.js";
import {
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  onAuthStateChanged,
  signOut
} from "https://www.gstatic.com/firebasejs/12.2.1/firebase-auth.js";

// Helpers
function $(sel) { return document.querySelector(sel); }
function show(el) { el?.classList.remove("hidden"); }
function hide(el) { el?.classList.add("hidden"); }

// Error mapping
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

// DOM Ready
document.addEventListener("DOMContentLoaded", () => {
  const loginForm = $("#login-form");
  const registerForm = $("#register-form");
  const formTitle = $("#form-title");
  const logoutBtn = $("#logout-btn");

  // Toggle forms
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

  // Register
  registerForm?.addEventListener("submit", async (e) => {
    e.preventDefault();
    const email = $("#register-email").value;
    const pass = $("#register-password").value;

    try {
      await createUserWithEmailAndPassword(auth, email, pass);
      alert("Registration successful!");
    } catch (err) {
      alert(friendlyAuthError(err));
    }
  });

  // Login
  loginForm?.addEventListener("submit", async (e) => {
    e.preventDefault();
    const email = $("#login-email").value;
    const pass = $("#login-password").value;

    try {
      await signInWithEmailAndPassword(auth, email, pass);
      alert("Login successful!");
    } catch (err) {
      alert(friendlyAuthError(err));
    }
  });

  // Logout
  logoutBtn?.addEventListener("click", async () => {
    await signOut(auth);
  });

  // Track state
  onAuthStateChanged(auth, (user) => {
    if (user) {
      console.log("Logged in:", user.email);
      show(logoutBtn);
    } else {
      console.log("Logged out");
      hide(logoutBtn);
    }
  });
});
