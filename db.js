import { initializeApp } from "https://www.gstatic.com/firebasejs/12.2.1/firebase-app.js";
import { getAuth, onAuthStateChanged, signOut } from "https://www.gstatic.com/firebasejs/12.2.1/firebase-auth.js";
import { getFirestore, doc, getDoc } from "https://www.gstatic.com/firebasejs/12.2.1/firebase-firestore.js";

const firebaseConfig = {
  apiKey: "AIzaSyA5uPZtGvRC1VaqINKcVAWUWC9VyA1-b_s",
  authDomain: "ahjoommakmart.firebaseapp.com",
  projectId: "ahjoommakmart",
  storageBucket: "ahjoommakmart.firebasestorage.app",
  messagingSenderId: "1098456404389",
  appId: "1:1098456404389:web:7b057cc99258e122bf584c",
  measurementId: "G-DNLHP8DS8Y"
};

const app = initializeApp(firebaseConfig);
const auth = getAuth(app);
const db = getFirestore(app);

document.addEventListener("DOMContentLoaded", function () {
  const profileBtn = document.querySelector("icon-btn.profile-btn");
  if (!profileBtn) return;

  const profileDropdown = document.createElement("div");
  profileDropdown.className = "profile-dropdown";
  document.body.appendChild(profileDropdown);

  onAuthStateChanged(auth, async function (user) {
    if (user) {
      let name = user.email;
      try {
        const snap = await getDoc(doc(db, "users", user.uid));
        if (snap.exists() && snap.data().contactNo) {
          name = snap.data().contactNo;
        }
      } catch (err) {
        console.error("Could not fetch user data:", err);
      }

      profileBtn.onclick = function (e) {
        e.stopPropagation();
        profileDropdown.innerHTML = `
          <p>${name}</p>
          <button id="logout-btn">Log out</button>
        `;
        profileDropdown.classList.toggle("show");

        const logoutBtn = document.getElementById("logout-btn");
        logoutBtn.onclick = async function () {
          await signOut(auth);
          profileDropdown.classList.remove("show");
          alert("Logged out!");
        };
      };
    } else {
      profileBtn.onclick = function () {
        window.location.href = "auth.html";
      };
    }
  });

  document.addEventListener("click", function (e) {
    if (!profileBtn.contains(e.target) && !profileDropdown.contains(e.target)) {
      profileDropdown.classList.remove("show");
    }
  });
});
