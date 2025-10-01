import { db, auth } from "./db.js";
import {
  collection,
  getDocs,
  doc,
  addDoc,
  deleteDoc,
  serverTimestamp
} from "https://www.gstatic.com/firebasejs/12.2.1/firebase-firestore.js";
import { onAuthStateChanged } from "https://www.gstatic.com/firebasejs/12.2.1/firebase-auth.js";

document.addEventListener("DOMContentLoaded", () => {
  const checkoutItems = document.getElementById("checkout-items");
  const itemsTotalEl = document.getElementById("items-total");
  const deliveryOption = document.getElementById("delivery-option");
  const deliveryAreaContainer = document.getElementById("delivery-area-container");
  const deliveryArea = document.getElementById("delivery-area");
  const deliveryFeeEl = document.getElementById("delivery-fee");
  const grandTotalEl = document.getElementById("grand-total");
  const placeOrderBtn = document.getElementById("place-order");

  let itemsTotal = 0;
  let deliveryFee = 0;
  let cartItems = [];

  function updateTotals() {
    grandTotalEl.textContent = itemsTotal + deliveryFee;
  }

  // Handle delivery option change
  deliveryOption.addEventListener("change", () => {
    if (deliveryOption.value === "delivery") {
      deliveryAreaContainer.classList.remove("hidden");
    } else {
      deliveryAreaContainer.classList.add("hidden");
      deliveryFee = 0;
      deliveryFeeEl.textContent = deliveryFee;
      updateTotals();
    }
  });

  // Handle delivery area fee
  deliveryArea.addEventListener("change", () => {
    const selected = deliveryArea.options[deliveryArea.selectedIndex];
    deliveryFee = parseInt(selected.dataset.fee, 10) || 0;
    deliveryFeeEl.textContent = deliveryFee;
    updateTotals();
  });

  // When user is logged in
  onAuthStateChanged(auth, async (user) => {
    if (!user) {
      checkoutItems.innerHTML = "<p>Please log in to proceed with checkout.</p>";
      placeOrderBtn.classList.add("disabled");
      placeOrderBtn.setAttribute("disabled", "true");
      return;
    }

    try {
      const snapshot = await getDocs(collection(db, "carts", user.uid, "items"));

      if (snapshot.empty) {
        checkoutItems.innerHTML = "<p>Your cart is empty.</p>";
        itemsTotalEl.textContent = "0";
        grandTotalEl.textContent = "0";
        placeOrderBtn.classList.add("disabled");
        placeOrderBtn.setAttribute("disabled", "true");
        return;
      }

      checkoutItems.innerHTML = "";
      itemsTotal = 0;
      cartItems = [];

      snapshot.forEach((docSnap) => {
        const item = docSnap.data();
        cartItems.push(item); // store for order
        const itemEl = document.createElement("div");
        itemEl.classList.add("checkout-item");

        itemEl.innerHTML = `
          <img src="${item.image || "images/placeholder.png"}" alt="${item.name}">
          <div>
            <h4>${item.name}</h4>
            <p>₱${item.price} × ${item.quantity}</p>
          </div>
        `;

        itemsTotal += item.price * item.quantity;
        checkoutItems.appendChild(itemEl);
      });

      itemsTotalEl.textContent = itemsTotal;
      updateTotals();

      placeOrderBtn.classList.remove("disabled");
      placeOrderBtn.removeAttribute("disabled");

      // PLACE ORDER FUNCTION
      placeOrderBtn.onclick = async () => {
        const orderData = {
          userId: user.uid,
          userEmail: user.email || "unknown",
          items: cartItems,
          itemsTotal,
          deliveryOption: deliveryOption.value,
          deliveryArea: deliveryArea.value || null,
          deliveryFee,
          total: itemsTotal + deliveryFee,
          status: "pending",
          createdAt: serverTimestamp(),
        };

        try {
          // Create the order
          const orderRef = await addDoc(collection(db, "orders"), orderData);

          // Notify admins
          await addDoc(collection(db, "notifications"), {
            type: "new_order",
            message: `🛒 New order placed by ${user.email || "a user"} (₱${orderData.total})`,
            forRole: "admin",
            orderId: orderRef.id,
            createdAt: serverTimestamp(),
            read: false,
          });

          // Clear user's cart
          const cartRef = collection(db, "carts", user.uid, "items");
          const cartSnap = await getDocs(cartRef);
          cartSnap.forEach(async (docItem) => {
            await deleteDoc(doc(db, "carts", user.uid, "items", docItem.id));
          });

          alert("Order placed successfully!");
          window.location.href = "index.html";
        } catch (err) {
          console.error("Order failed:", err);
          alert("Failed to place order. Please try again.");
        }
      };
    } catch (err) {
      console.error("Error loading checkout:", err);
      checkoutItems.innerHTML = "<p>Failed to load checkout.</p>";
    }
  });
});
