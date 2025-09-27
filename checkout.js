import { db, auth } from "./db.js";
import { collection, getDocs } from "https://www.gstatic.com/firebasejs/12.2.1/firebase-firestore.js";
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

  function updateTotals() {
    grandTotalEl.textContent = itemsTotal + deliveryFee;
  }

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

  deliveryArea.addEventListener("change", () => {
    const selected = deliveryArea.options[deliveryArea.selectedIndex];
    deliveryFee = parseInt(selected.dataset.fee, 10);
    deliveryFeeEl.textContent = deliveryFee;
    updateTotals();
  });

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

      snapshot.forEach((docSnap) => {
        const item = docSnap.data();
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
    } catch (err) {
      console.error("Error loading checkout:", err);
      checkoutItems.innerHTML = "<p>Failed to load checkout.</p>";
    }
  });
});
