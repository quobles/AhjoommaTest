import { auth, db } from "./db.js";
import {
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  onAuthStateChanged,
  signOut,
  sendEmailVerification
} from "https://www.gstatic.com/firebasejs/12.2.1/firebase-auth.js";

import {
  doc,
  setDoc,
  getDoc
} from "https://www.gstatic.com/firebasejs/12.2.1/firebase-firestore.js";

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
    const firstName = $("#regFirstName").value.trim();
    const lastName = $("#regLastName").value.trim();
    const email = $("#regEmail").value.trim();
    const pass = $("#regPassword").value;
    const confirmPass = $("#regConfirmPassword").value;
    const termsChecked = $("#termsCheckbox").checked;

    if (pass !== confirmPass) {
      alert("Passwords do not match.");
      return;
    }

    if (!termsChecked) {
      alert("You must accept the Terms and Conditions.");
      return;
    }

    try {
  const cred = await createUserWithEmailAndPassword(auth, email, pass);

  // Save extra info + role into Firestore
  await setDoc(doc(db, "users", cred.user.uid), {
    firstName,
    lastName,
    email,
    role: "user" // default role
  });

  // ✅ Send email verification
  await sendEmailVerification(cred.user);

  alert(`Welcome ${firstName}! A verification email has been sent to ${email}. Please verify before logging in.\nalso check spam/junk folder.`);
  await signOut(auth); // force logout until they verify
  window.location.href = "auth.html";
} catch (err) {
  alert(friendlyAuthError(err));
}

  });

  // Terms and conditions modal
  const modal = document.getElementById("termsModal");
  const closeBtn = document.querySelector(".modal .close");
  const acceptBtn = document.getElementById("acceptTermsBtn");

  $("#termsLabel")?.addEventListener("click", (e) => {
    e.preventDefault();
    modal.style.display = "block";
  });

  closeBtn?.addEventListener("click", () => {
    modal.style.display = "none";
  });

  acceptBtn?.addEventListener("click", () => {
    $("#termsCheckbox").checked = true;
    modal.style.display = "none";
  });

  window.addEventListener("click", (e) => {
    if (e.target === modal) modal.style.display = "none";
  });

  // Login
  loginForm?.addEventListener("submit", async (e) => {
    e.preventDefault();
    const email = $("#loginEmail").value;
    const pass = $("#loginPassword").value;

    try {
  const cred = await signInWithEmailAndPassword(auth, email, pass);

  if (!cred.user.emailVerified) {
    alert("Please verify your email before logging in. Check your inbox.\nalso check spam/junk folder.");
    await sendEmailVerification(cred.user);
    await signOut(auth);
    return;
  }

  alert("Login successful!");
  window.location.href = "index.html";
} catch (err) {
  alert(friendlyAuthError(err));
}

  });

  // Logout
  logoutBtn?.addEventListener("click", async () => {
    await signOut(auth);
    window.location.href = "index.html"; // redirect after logout
  });

  // Track state + check role
  onAuthStateChanged(auth, async (user) => {
    const emailEl = document.getElementById("user-email");
    const loginLink = document.getElementById("login-link");
    const logoutBtn = document.getElementById("logout-btn");

    if (user) {
      if (emailEl) {
        emailEl.textContent = user.email;
        emailEl.classList.remove("hidden");
      }
      if (loginLink) loginLink.classList.add("hidden");
      if (logoutBtn) logoutBtn.classList.remove("hidden");

      // Fetch role from Firestore
      const userRef = doc(db, "users", user.uid);
      const snap = await getDoc(userRef);
      if (snap.exists()) {
        const data = snap.data();
        document.body.classList.remove("admin", "user");
        if (data.role === "admin") {
          console.log("Admin logged in");
          document.body.classList.add("admin");
        } else {
          console.log("Regular user logged in");
          document.body.classList.add("user");
        }
      }
    } else {
      if (emailEl) {
        emailEl.textContent = "";
        emailEl.classList.add("hidden");
      }
      if (loginLink) loginLink.classList.remove("hidden");
      if (logoutBtn) logoutBtn.classList.add("hidden");
      document.body.classList.remove("admin", "user");
    }
  });

  // Show/hide password toggles
  const loginPassword = document.getElementById("loginPassword");
  const toggleLoginPassword = document.getElementById("toggle-login-password");

  const regPassword = document.getElementById("regPassword");
  const toggleRegPassword = document.getElementById("toggle-register-password");

  const regConfirmPassword = document.getElementById("regConfirmPassword");
  const toggleRegConfirmPassword = document.getElementById("toggle-register-confirm");

  toggleLoginPassword?.addEventListener("click", () => {
    loginPassword.type = toggleLoginPassword.checked ? "text" : "password";
  });
toggleRegPassword?.addEventListener("change", () => {
  regPassword.type = toggleRegPassword.checked ? "text" : "password";
});
toggleRegConfirmPassword?.addEventListener("change", () => {
  regConfirmPassword.type = toggleRegConfirmPassword.checked ? "text" : "password";
});
});
