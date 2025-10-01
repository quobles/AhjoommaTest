import { db, auth } from "./db.js";
import {
  collection,
  getDocs,
  updateDoc,
  doc,
  addDoc
} from "https://www.gstatic.com/firebasejs/12.2.1/firebase-firestore.js";
import { onAuthStateChanged } from "https://www.gstatic.com/firebasejs/12.2.1/firebase-auth.js";

const ordersContainer = document.getElementById("orders-container");
const filterSelect = document.getElementById("order-filter");

let allOrders = [];

// Load orders
async function loadOrders() {
  const snapshot = await getDocs(collection(db, "orders"));
  allOrders = snapshot.docs.map(docSnap => ({
    id: docSnap.id,
    ...docSnap.data(),
  }));

  renderOrders(filterSelect.value);
}

// Filter
function renderOrders(filter) {
  ordersContainer.innerHTML = "";

  let filtered = allOrders;
  if (filter !== "all") {
    filtered = allOrders.filter(order => order.status === filter);
  }

  if (filtered.length === 0) {
    ordersContainer.innerHTML = "<p>No orders found.</p>";
    return;
  }

  filtered.forEach(order => {
    const orderDiv = document.createElement("div");
    orderDiv.classList.add("order-card");

    orderDiv.innerHTML = `
      <p><strong>Order ID:</strong> ${order.id}</p>
      <p><strong>User:</strong> ${order.userEmail || "Unknown"}</p>
      <p><strong>Total:</strong> ₱${order.total}</p>
      <p><strong>Status:</strong> ${order.status}</p>
      <div class="order-items">
        ${order.items.map(item => `
          <div class="order-item">
            <img src="${item.image || "images/placeholder.png"}" alt="${item.name}">
            <div>
              <p>${item.name}</p>
              <p>Qty: ${item.quantity}</p>
            </div>
          </div>
        `).join("")}
      </div>
      <button data-id="${order.id}" data-status="approved">Approve</button>
      <button data-id="${order.id}" data-status="delivering">Deliver</button>
      <button data-id="${order.id}" data-status="completed">Complete</button>
    `;

    ordersContainer.appendChild(orderDiv);
  });

  attachListeners();
}

// Update status + notify user
function attachListeners() {
  document.querySelectorAll(".order-card button").forEach((btn) => {
    btn.addEventListener("click", async () => {
      const orderId = btn.getAttribute("data-id");
      const newStatus = btn.getAttribute("data-status");

      const orderRef = doc(db, "orders", orderId);
      await updateDoc(orderRef, { status: newStatus });

      const orderData = allOrders.find(o => o.id === orderId);
      if (orderData) {
        await addDoc(collection(db, "notifications"), {
          type: "order_update",
          message: `Your order ${orderId} status is now: ${newStatus}`,
          forUser: orderData.userId,
          orderId,
          createdAt: new Date(),
          read: false,
        });
      }

      loadOrders(); // refresh orders listt
    });
  });
}

// Filter change event
filterSelect.addEventListener("change", () => {
  renderOrders(filterSelect.value);
});

// Auth check
onAuthStateChanged(auth, (user) => {

  if (!user) {
    alert("You must be logged in as admin.");
    window.location.href = "index.html";
    return;
  }
  loadOrders();
});
