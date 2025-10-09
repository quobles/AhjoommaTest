// cart.js
import { db, auth } from "./db.js";
import {
  collection,
  getDocs,
  doc,
  updateDoc,
  deleteDoc,
  getDoc
} from "https://www.gstatic.com/firebasejs/12.2.1/firebase-firestore.js";
import { onAuthStateChanged } from "https://www.gstatic.com/firebasejs/12.2.1/firebase-auth.js";

let currentUser = null;
let lastSnapshotDocs = [];
let isAdmin = false; // track role

async function getCartItemsForUser(uid) {
  const itemsRef = collection(db, "carts", uid, "items");
  const snapshot = await getDocs(itemsRef);
  return snapshot;
}

async function loadCart(user) {
  currentUser = user;
  const cartContainer = document.getElementById("cart-container");
  const totalEl = document.getElementById("cart-total");
  const checkoutBtn = document.querySelector(".checkout-btn");

  cartContainer.innerHTML = "<p>Loading cart...</p>";

  try {
    if (isAdmin) {
      cartContainer.innerHTML = "<p>Admins cannot use the cart.</p>";
      totalEl.textContent = "0";
      if (checkoutBtn) {
        checkoutBtn.classList.add("disabled");
        checkoutBtn.setAttribute("disabled", "true");
        checkoutBtn.onclick = null;
      }
      return;
    }

    const snapshot = await getCartItemsForUser(user.uid);
    lastSnapshotDocs = [];
    snapshot.forEach(s => lastSnapshotDocs.push(s));

    if (snapshot.empty) {
      cartContainer.innerHTML = "<p>Your cart is empty.</p>";
      totalEl.textContent = "0";
      if (checkoutBtn) {
        checkoutBtn.classList.add("disabled");
        checkoutBtn.setAttribute("disabled", "true");
        checkoutBtn.onclick = null;
      }
      return;
    }

    cartContainer.innerHTML = "";
    let total = 0;

    snapshot.forEach((docSnap) => {
      const item = docSnap.data();
      const itemEl = document.createElement("div");
      itemEl.classList.add("cart-item");

      total += item.price * item.quantity;

      itemEl.innerHTML = `
        <img src="${item.image || "images/placeholder.png"}" alt="${item.name}">
        <div class="cart-info">
          <h4>${item.name}</h4>
          <p>₱${item.price}</p>
          <div class="quantity-control">
            <button class="decrease">-</button>
            <span>${item.quantity}</span>
            <button class="increase">+</button>
          </div>
        </div>
        <button class="remove-btn">❌</button>
      `;

      itemEl.querySelector(".increase").addEventListener("click", async () => {
        await updateDoc(doc(db, "carts", user.uid, "items", docSnap.id), {
          quantity: item.quantity + 1,
        });
        loadCart(user);
      });

      itemEl.querySelector(".decrease").addEventListener("click", async () => {
        if (item.quantity > 1) {
          await updateDoc(doc(db, "carts", user.uid, "items", docSnap.id), {
            quantity: item.quantity - 1,
          });
        } else {
          await deleteDoc(doc(db, "carts", user.uid, "items", docSnap.id));
        }
        loadCart(user);
      });

      itemEl.querySelector(".remove-btn").addEventListener("click", async () => {
        await deleteDoc(doc(db, "carts", user.uid, "items", docSnap.id));
        loadCart(user);
      });

      cartContainer.appendChild(itemEl);
    });

    totalEl.textContent = total;

    if (checkoutBtn) {
      checkoutBtn.classList.remove("disabled");
      checkoutBtn.removeAttribute("disabled");
      checkoutBtn.onclick = () => {
        window.location.href = "checkout.html";
      };
    }

  } catch (err) {
    console.error("Error loading cart:", err);
    cartContainer.innerHTML = "<p>Failed to load cart.</p>";
  }
}

// --- onAuthStateChanged ---
onAuthStateChanged(auth, async (user) => {
  const checkoutBtn = document.querySelector(".checkout-btn");
  if (user) {
    // Check role
    const userDoc = await getDoc(doc(db, "users", user.uid));
    isAdmin = userDoc.exists() && userDoc.data().role === "admin";

    loadCart(user);
  } else {
    document.getElementById("cart-container").innerHTML = "<p>Please log in to view your cart.</p>";
    document.getElementById("cart-total").textContent = "0";
    if (checkoutBtn) {
      checkoutBtn.classList.add("disabled");
      checkoutBtn.setAttribute("disabled", "true");
      checkoutBtn.onclick = null;
    }
  }
});
