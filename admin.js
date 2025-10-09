import { db, auth } from "./db.js";
import {
  collection,
  getDocs,
  updateDoc,
  doc,
  getDoc,
  addDoc,
  query,
  orderBy
} from "https://www.gstatic.com/firebasejs/12.2.1/firebase-firestore.js";
import { onAuthStateChanged } from "https://www.gstatic.com/firebasejs/12.2.1/firebase-auth.js";

const ordersContainer = document.getElementById("orders-container");
const filterSelect = document.getElementById("order-filter");

let allOrders = [];

async function loadOrders() {
  const q = query(collection(db, "orders"), orderBy("createdAt", "desc"));
  const snapshot = await getDocs(q);
  allOrders = snapshot.docs.map(docSnap => ({
    id: docSnap.id,
    ...docSnap.data(),
  }));

  renderOrders(filterSelect.value);
}

function renderOrders(filter) {
  ordersContainer.innerHTML = "";

  let filtered = allOrders;
  if (filter !== "all") filtered = allOrders.filter(order => order.status === filter);

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
            <img src="${item.image}" alt="${item.name}">
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

        // 🔹 Email trigger for user
        await addDoc(collection(db, "mail"), {
          to: orderData.userEmail,
          message: {
            subject: "📦 Order Status Update",
            text: `Your order ${orderId} status is now: ${newStatus}. Thank you for shopping at Ahjoomma’s K-Mart!`,
          },
        });
      }

      loadOrders();
    });
  });
}

filterSelect.addEventListener("change", () => {
  renderOrders(filterSelect.value);
});

onAuthStateChanged(auth, async (user) => {
  if (!user) {
    alert("You must be logged in.");
    window.location.href = "index.html";
    return;
  }

  try {
    const userRef = doc(db, "users", user.uid);
    const userSnap = await getDoc(userRef);

    if (!userSnap.exists()) {
      alert("You are not authorized to view this page.");
      window.location.href = "index.html";
      return;
    }

    const userData = userSnap.data();
    if (userData.role !== "admin") {
      alert("You are not authorized to view this page.");
      window.location.href = "index.html";
      return;
    }

    loadOrders();
  } catch (error) {
    console.error("Error checking role:", error);
    alert("You are not authorized to view this page.");
    window.location.href = "index.html";
  }
});

// 🔍 Search functionality for Orders
const orderSearch = document.getElementById("order-search");
orderSearch.addEventListener("input", () => {
  const query = orderSearch.value.toLowerCase();
  document.querySelectorAll(".order-card").forEach(card => {
    const user = card.querySelector("p:nth-child(2)").textContent.toLowerCase();
    const orderId = card.querySelector("p:nth-child(1)").textContent.toLowerCase();
    card.style.display = (user.includes(query) || orderId.includes(query)) ? "block" : "none";
  });
});
