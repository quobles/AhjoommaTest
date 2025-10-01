import { db, auth } from "./db.js";
import {
  collection,
  query,
  where,
  onSnapshot,
  orderBy,
  updateDoc,
  doc,
  getDoc
} from "https://www.gstatic.com/firebasejs/12.2.1/firebase-firestore.js";
import { onAuthStateChanged } from "https://www.gstatic.com/firebasejs/12.2.1/firebase-auth.js";

const notifBtn = document.querySelector(".notification-btn");
const notifDropdown = document.querySelector(".notification-dropdown");

let notifList = notifDropdown?.querySelector("ul");
if (notifDropdown && !notifList) {
  notifList = document.createElement("ul");
  notifDropdown.appendChild(notifList);
}

// Counter badge
let notifCounter = document.createElement("span");
notifCounter.classList.add("notif-counter");
notifCounter.style.position = "absolute";
notifCounter.style.top = "0";
notifCounter.style.right = "0";
notifCounter.style.background = "red";
notifCounter.style.color = "white";
notifCounter.style.fontSize = "0.7rem";
notifCounter.style.fontWeight = "bold";
notifCounter.style.padding = "2px 5px";
notifCounter.style.borderRadius = "50%";
notifCounter.style.display = "none";
notifBtn.style.position = "relative";
notifBtn.appendChild(notifCounter);

// Toggle dropdown
if (notifBtn && notifDropdown) {
  notifBtn.addEventListener("click", function (e) {
    e.stopPropagation();
    notifDropdown.classList.toggle("show");
  });

  document.addEventListener("click", function (e) {
    if (!notifDropdown.contains(e.target) && !notifBtn.contains(e.target)) {
      notifDropdown.classList.remove("show");
    }
  });
}

// Load notifications
onAuthStateChanged(auth, async (user) => {
  if (!user || !notifList) return;

  const notifRef = collection(db, "notifications");

  // Check if user is admin
  const userDoc = await getDoc(doc(db, "users", user.uid));
  const userData = userDoc.exists() ? userDoc.data() : {};
  const isAdmin = userData.role === "admin";

  // Query based on role
  let q;
  if (isAdmin) {
    q = query(notifRef, where("forRole", "==", "admin"), orderBy("createdAt", "desc"));
  } else {
    q = query(notifRef, where("forUser", "==", user.uid), orderBy("createdAt", "desc"));
  }

  onSnapshot(q, (snapshot) => {
    notifList.innerHTML = "";
    let unreadCount = 0;
    let shownCount = 0;

    snapshot.forEach((docSnap) => {
      if (shownCount >= 5) return; // show only latest 5

      const notif = docSnap.data();
      const notifId = docSnap.id;

      const li = document.createElement("li");
      li.textContent = notif.message;

      if (!notif.read) {
        li.style.fontWeight = "bold";
        unreadCount++;
      }

      // Mark as read on click
      li.addEventListener("click", async () => {
        const notifDoc = doc(db, "notifications", notifId);
        await updateDoc(notifDoc, { read: true });
      });

      notifList.appendChild(li);
      shownCount++;
    });

    // Counter badge
    if (unreadCount > 0) {
      notifCounter.style.display = "block";
      notifCounter.textContent = unreadCount >= 10 ? "9+" : unreadCount;
    } else {
      notifCounter.style.display = "none";
    }
  });
});
