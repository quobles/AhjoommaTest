import { db, auth } from "./db.js";
import {
  collection,
  getDocs,
  doc,
  addDoc,
  deleteDoc,
  serverTimestamp,
  getDoc,
  updateDoc,
  query,
  where
} from "https://www.gstatic.com/firebasejs/12.2.1/firebase-firestore.js";
import { onAuthStateChanged } from "https://www.gstatic.com/firebasejs/12.2.1/firebase-auth.js";

document.addEventListener("DOMContentLoaded", () => {
  const checkoutItems = document.getElementById("checkout-items");
  const itemsTotalEl = document.getElementById("items-total");
  const deliveryOption = document.getElementById("delivery-option");
  const pickupContainer = document.getElementById("pickup-datetime-container");
  const pickupDateInput = document.getElementById("pickup-date");
  const pickupTimeInput = document.getElementById("pickup-time");

  const deliveryAreaContainer = document.getElementById("delivery-area-container");
  const deliveryArea = document.getElementById("delivery-area");
  const deliveryFeeEl = document.getElementById("delivery-fee");
  const grandTotalEl = document.getElementById("grand-total");
  const placeOrderBtn = document.getElementById("place-order");
  const paymentMethodSelect = document.getElementById("payment-option");

  let itemsTotal = 0;
  let deliveryFee = 0;
  let cartItems = [];
  let selectedAddress = null;

  // 🧱 Create modal dynamically
  const modalHTML = `
    <div id="checkout-modal" class="checkout-modal hidden">
      <div class="checkout-overlay"></div>
      <div class="checkout-modal-box">
        <div class="checkout-modal-content">
          <h2>Select Delivery Address</h2>
          <div class="checkout-address-list">
            <p>Loading addresses...</p>
          </div>
          <div class="checkout-modal-actions">
            <button id="cancel-checkout">Cancel</button>
          </div>
        </div>
      </div>
    </div>
  `;
  document.body.insertAdjacentHTML("beforeend", modalHTML);

  const modal = document.getElementById("checkout-modal");
  const overlay = modal.querySelector(".checkout-overlay");
  const modalList = modal.querySelector(".checkout-address-list");
  const cancelBtn = modal.querySelector("#cancel-checkout");

  function openModal() {
    modal.classList.remove("hidden");
    modal.classList.add("show");
  }
  function closeModal() {
    modal.classList.remove("show");
    setTimeout(() => modal.classList.add("hidden"), 150);
  }

  overlay.addEventListener("click", closeModal);
  cancelBtn.addEventListener("click", closeModal);

  // Prevent selecting past dates
  const today = new Date();
  const yyyy = today.getFullYear();
  const mm = String(today.getMonth() + 1).padStart(2, "0");
  const dd = String(today.getDate()).padStart(2, "0");
  pickupDateInput.min = `${yyyy}-${mm}-${dd}`;

  function updateTotals() {
    grandTotalEl.textContent = itemsTotal + deliveryFee;
  }

  function validateCheckoutConditions() {
    let enable = false;

    if (deliveryOption.value === "pickup") {
      const hasDate = pickupDateInput.value.trim() !== "";
      const hasTime = pickupTimeInput.value.trim() !== "";
      enable = hasDate && hasTime;
    } else if (deliveryOption.value === "delivery") {
      const hasArea = deliveryArea.value.trim() !== "";
      enable = hasArea && !!selectedAddress;
    }

    if (enable) {
      placeOrderBtn.classList.remove("disabled");
      placeOrderBtn.removeAttribute("disabled");
    } else {
      placeOrderBtn.classList.add("disabled");
      placeOrderBtn.setAttribute("disabled", "true");
    }
  }


  // Event listeners
  deliveryOption.addEventListener("change", () => {
    if (deliveryOption.value === "delivery") {
      deliveryAreaContainer.classList.remove("hidden");
      pickupContainer.classList.add("hidden");
    } else {
      deliveryAreaContainer.classList.add("hidden");
      pickupContainer.classList.remove("hidden");
      deliveryFee = 0;
      deliveryFeeEl.textContent = deliveryFee;
      updateTotals();
    }
    validateCheckoutConditions();
  });

  pickupDateInput.addEventListener("change", validateCheckoutConditions);
  pickupTimeInput.addEventListener("change", validateCheckoutConditions);

  // Restrict pickup times 10 AM – 9 PM
  pickupTimeInput.addEventListener("change", () => {
    const time = pickupTimeInput.value;
    if (time < "10:00" || time > "21:00") {
      alert("Please select a time between 10:00 AM and 9:00 PM.");
      pickupTimeInput.value = "";
    }
  });

  deliveryArea.addEventListener("change", async () => {
    const selected = deliveryArea.options[deliveryArea.selectedIndex];
    deliveryFee = parseInt(selected.dataset.fee, 10) || 0;
    deliveryFeeEl.textContent = deliveryFee;
    updateTotals();

    // Open modal automatically after choosing delivery area (only if not already chosen)
    if (!selectedAddress && deliveryOption.value === "delivery") {
      const user = auth.currentUser;
      if (user) {
        await loadAddresses(user.uid);
        openModal();
      }
    }

    validateCheckoutConditions();
  });


  async function loadAddresses(userId) {
    try {
      const modalList = modal.querySelector(".checkout-address-list");
      modalList.innerHTML = "<p>Loading addresses...</p>";

      const addressRef = collection(db, "users", userId, "addresses");
      const addressSnap = await getDocs(addressRef);

      modalList.innerHTML = ""; // Clear loading text

      if (addressSnap.empty) {
        modalList.innerHTML = `
        <div class="no-address-msg">
          <p><strong>No saved addresses found.</strong></p>
          <p>Add an address <a href="profile.html?tab=addresses" class="btn">here</a></p>
        </div>
      `;
        return;
      }

      // Create a button for each address
      addressSnap.forEach((docSnap) => {
        const address = docSnap.data();
        const button = document.createElement("button");
        button.className = "address-option";
        button.textContent = address.address || "Unnamed Address";

        button.addEventListener("click", () => {
          selectedAddress = address;

          // Close modal
          closeModal();

          // Immediately enable checkout now that an address exists
          validateCheckoutConditions();

          // Optional: visually confirm selection
          alert(`Selected address: ${address.address}`);
        });

        modalList.appendChild(button);
      });
    } catch (err) {
      console.error("Failed to load addresses:", err);
      modal.querySelector(".checkout-address-list").innerHTML =
        "<p>Error loading addresses.</p>";
    }
  }


  // Deduct stock after order
  async function deductStock(orderItems, orderId, userEmail) {
    for (const item of orderItems) {
      if (!item.id) continue;
      const productRef = doc(db, "products", item.id);
      const productSnap = await getDoc(productRef);
      if (productSnap.exists()) {
        const productData = productSnap.data();
        const currentStock = productData.stocks || 0;
        const newStock = Math.max(0, currentStock - item.quantity);
        await updateDoc(productRef, { stocks: newStock });
        await addDoc(collection(db, "stockLogs"), {
          productId: item.id,
          productName: productData.name || item.name || "Unnamed Product",
          change: -item.quantity,
          previousStock: currentStock,
          newStock,
          orderId,
          userEmail: userEmail || "unknown",
          createdAt: serverTimestamp(),
        });
      }
    }
  }

  onAuthStateChanged(auth, async (user) => {
    if (!user) {
      checkoutItems.innerHTML = "<p>Please log in to proceed with checkout.</p>";
      placeOrderBtn.classList.add("disabled");
      placeOrderBtn.setAttribute("disabled", "true");
      return;
    }

    const userRef = doc(db, "users", user.uid);
    const userSnap = await getDoc(userRef);
    const userData = userSnap.exists() ? userSnap.data() : {};

    if (userData.role === "admin") {
      checkoutItems.innerHTML = "<p>Admins cannot place orders.</p>";
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
        cartItems.push(item);
        const itemEl = document.createElement("div");
        itemEl.classList.add("checkout-item");

        itemEl.innerHTML = `
          <img src="${item.image}" alt="${item.name}">
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

      // Place order logic
      placeOrderBtn.onclick = async () => {
        if (deliveryOption.value === "delivery" && !selectedAddress) {
          await loadAddresses(user.uid);
          openModal();
          return;
        }

        const paymentMethod = paymentMethodSelect ? paymentMethodSelect.value : "Not specified";

        const orderData = {
          userId: user.uid,
          userEmail: user.email || "unknown",
          items: cartItems,
          itemsTotal,
          deliveryOption: deliveryOption.value,
          deliveryArea: deliveryArea.value || null,
          deliveryFee,
          total: itemsTotal + deliveryFee,
          paymentMethod,
          selectedAddress: selectedAddress || null,
          status: "pending",
          createdAt: serverTimestamp(),
          pickupDate: pickupDateInput.value || null,
          pickupTime: pickupTimeInput.value || null,
        };

        

        try {
          const orderRef = await addDoc(collection(db, "orders"), orderData);
          await deductStock(cartItems, orderRef.id, user.email);

          // Notify admins
          await addDoc(collection(db, "notifications"), {
            type: "new_order",
            message: `🛒 New order placed by ${user.email || "a user"} (₱${orderData.total})`,
            forRole: "admin",
            orderId: orderRef.id,
            createdAt: serverTimestamp(),
            read: false,
          });

          // ✉️ Send detailed email to admins
          const adminsQuery = query(collection(db, "users"), where("role", "==", "admin"));
          const adminsSnapshot = await getDocs(adminsQuery);

          let deliveryDetails = "";
          if (orderData.deliveryOption === "pickup") {
            deliveryDetails = `
              <p><b>Pickup Date:</b> ${orderData.pickupDate || "N/A"}</p>
              <p><b>Pickup Time:</b> ${orderData.pickupTime || "N/A"}</p>
            `;
          } else if (orderData.deliveryOption === "delivery") {
            if (orderData.selectedAddress) {
              deliveryDetails = `
                <p><b>Delivery Address:</b><br>
                ${orderData.selectedAddress.address || "N/A"}
                </p>
              `;
            } else {
              deliveryDetails = `<p><b>Delivery Address:</b> N/A</p>`;
            }
          }

          const emailHTML = `
            <h2>🛍️ New Order Received</h2>
            <p><b>Customer:</b> ${orderData.userEmail}</p>
            <p><b>Order Type:</b> ${orderData.deliveryOption.toUpperCase()}</p>
            ${deliveryDetails}
            <p><b>Payment Method:</b> ${orderData.paymentMethod}</p>
            <p><b>Total Amount:</b> ₱${orderData.total}</p>
            <hr>
            <p>You can view and manage this order in your admin dashboard.</p>
          `;

          for (const adminDoc of adminsSnapshot.docs) {
            const adminData = adminDoc.data();
            if (adminData.email) {
              await addDoc(collection(db, "mail"), {
                to: adminData.email,
                message: {
                  subject: "🛒 New Order Placed",
                  html: emailHTML,
                },
              });
            }
          }

          // Clear cart
          const cartRef = collection(db, "carts", user.uid, "items");
          const cartSnap = await getDocs(cartRef);
          const deletePromises = cartSnap.docs.map((item) =>
            deleteDoc(doc(db, "carts", user.uid, "items", item.id))
          );
          await Promise.all(deletePromises);

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
