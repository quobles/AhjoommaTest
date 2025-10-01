// cart.js
import { db, auth } from "./db.js";
import {
  collection,
  getDocs,
  doc,
  updateDoc,
  deleteDoc
} from "https://www.gstatic.com/firebasejs/12.2.1/firebase-firestore.js";
import { onAuthStateChanged } from "https://www.gstatic.com/firebasejs/12.2.1/firebase-auth.js";

let currentUser = null; // tracked by onAuthStateChanged
let lastSnapshotDocs = []; // keep doc snapshots to use ids when clearing cart

async function getCartItemsForUser(uid) {
  const itemsRef = collection(db, "carts", uid, "items");
  const snapshot = await getDocs(itemsRef);
  return snapshot; // caller can iterate
}

async function loadCart(user) {
  currentUser = user;
  const cartContainer = document.getElementById("cart-container");
  const totalEl = document.getElementById("cart-total");
  const checkoutBtn = document.querySelector(".checkout-btn");

  cartContainer.innerHTML = "<p>Loading cart...</p>";

  try {
    const snapshot = await getCartItemsForUser(user.uid);

    // store snapshot docs (so we can delete by id later)
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

      // Quantity controls
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

      // Remove button
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

// Confirm modal logic
function openConfirmModal(user) {
  const modal = document.getElementById("confirmModal");
  const itemsDiv = document.getElementById("confirm-items");
  const subtotalEl = document.getElementById("confirm-subtotal");
  const proceedBtn = document.getElementById("confirm-proceed");
  const cancelBtn = document.getElementById("confirm-cancel");
  const closeBtn = document.getElementById("confirmModalClose");

  itemsDiv.innerHTML = "<p>Loading...</p>";
  subtotalEl.textContent = "₱0";

  // load items again for fresh data
  getCartItemsForUser(user.uid).then(snapshot => {
    if (snapshot.empty) {
      itemsDiv.innerHTML = "<p>Your cart is empty.</p>";
      subtotalEl.textContent = "₱0";
      proceedBtn.disabled = true;
      proceedBtn.classList.add("disabled");
    } else {
      itemsDiv.innerHTML = "";
      let subtotal = 0;
      snapshot.forEach(s => {
        const it = s.data();
        subtotal += it.price * it.quantity;
        const el = document.createElement("div");
        el.style.display = "flex";
        el.style.justifyContent = "space-between";
        el.style.marginBottom = "8px";
        el.innerHTML = `<div>${it.name} x ${it.quantity}</div><div>₱${it.price * it.quantity}</div>`;
        itemsDiv.appendChild(el);
      });
      subtotalEl.textContent = `₱${subtotal}`;
      proceedBtn.disabled = false;
      proceedBtn.classList.remove("disabled");
    }
  }).catch(err => {
    console.error("Error loading confirm items:", err);
    itemsDiv.innerHTML = "<p>Unable to load items.</p>";
    proceedBtn.disabled = true;
  });

  // show modal
  modal.style.display = "block";

  // handler: proceed -> open checkout.html
  proceedBtn.onclick = function () {
    modal.style.display = "none";
    // navigate to checkout page — checkout page will re-load the cart from Firestore
    window.location.href = "checkout.html";
  };

  // cancel / close
  const closeModal = function () {
    modal.style.display = "none";
  };
  cancelBtn.onclick = closeModal;
  closeBtn.onclick = closeModal;
  window.onclick = function (e) {
    if (e.target === modal) closeModal();
  };
}

// single onAuthStateChanged to track current user and load cart
onAuthStateChanged(auth, (user) => {
  const checkoutBtn = document.querySelector(".checkout-btn");
  if (user) {
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
