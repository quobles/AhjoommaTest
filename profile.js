import { db, auth } from "./db.js";
import {
  doc,
  getDoc,
  setDoc,
  collection,
  addDoc,
  getDocs,
  query,
  where,
  deleteDoc
} from "https://www.gstatic.com/firebasejs/12.2.1/firebase-firestore.js";
import { onAuthStateChanged } from "https://www.gstatic.com/firebasejs/12.2.1/firebase-auth.js";

// Sidebar navigation
document.querySelectorAll(".nav-link").forEach(link => {
  link.addEventListener("click", e => {
    e.preventDefault();
    document.querySelectorAll(".nav-link").forEach(l => l.classList.remove("active"));
    link.classList.add("active");

    const sectionId = link.dataset.section;
    document.querySelectorAll(".section").forEach(sec => sec.classList.remove("active"));
    document.getElementById(sectionId).classList.add("active");
  });
});

const firstNameInput = document.getElementById("firstName");
const lastNameInput = document.getElementById("lastName");
const accountForm = document.getElementById("account-form");
const ordersBody = document.getElementById("orders-body");
const orderSummary = document.getElementById("order-summary");
const orderFilter = document.getElementById("orderFilter");
const addressesList = document.getElementById("addresses-list");
const newAddressInput = document.getElementById("newAddress");
const addAddressBtn = document.getElementById("addAddressBtn");

onAuthStateChanged(auth, async user => {
  if (!user) {
    window.location.href = "index.html";
    return;
  }

  const userRef = doc(db, "users", user.uid);
  const userSnap = await getDoc(userRef);

  if (userSnap.exists()) {
    const userData = userSnap.data();
    firstNameInput.value = userData.firstName || "";
    lastNameInput.value = userData.lastName || "";
  }

  // Save profile changes
  accountForm.addEventListener("submit", async e => {
    e.preventDefault();
    await setDoc(userRef, {
      firstName: firstNameInput.value,
      lastName: lastNameInput.value,
      email: user.email
    }, { merge: true });
    alert("Profile updated!");
  });

  // Load orders
  const q = query(collection(db, "orders"), where("userId", "==", user.uid));
  const orderSnap = await getDocs(q);
  let allOrders = [];
  orderSnap.forEach(docSnap => {
    allOrders.push({ id: docSnap.id, ...docSnap.data() });
  });

  allOrders.sort((a, b) => {
    const dateA = a.date ? new Date(a.date) : new Date(0);
    const dateB = b.date ? new Date(b.date) : new Date(0);
    return dateB - dateA; // latest on top
  });


  function renderOrders(filter = "all") {
    if (!ordersBody) return;
    ordersBody.innerHTML = `<tr><td colspan="4">Loading orders...</td></tr>`;
    orderSummary.innerHTML = "";

    const filtered = allOrders.filter(order => {
      if (filter === "all") return true;
      if (filter === "pending") return order.status !== "completed";
      if (filter === "completed") return order.status === "completed";
    });

    if (filtered.length === 0) {
      ordersBody.innerHTML = `<tr><td colspan="4" class="no-data">No orders found.</td></tr>`;
      orderSummary.innerHTML = "";
      return;
    }

    let totalForUser = 0;
    let rowsHTML = "";

    filtered.forEach(order => {
      // Try to detect product names dynamically
      let productList = "";

      if (Array.isArray(order.products) && order.products.length > 0) {
        productList = order.products
          .map(p => `${p.name || p.productName || "Unnamed"} (x${p.quantity || 1})`)
          .join("<br>");
      } else if (order.productName) {
        productList = `${order.productName} (x${order.quantity || 1})`;
      } else if (order.items && Array.isArray(order.items)) {
        productList = order.items
          .map(i => `${i.name || i.productName || "Unnamed"} (x${i.quantity || 1})`)
          .join("<br>");
      } else {
        productList = "—";
      }

      const total = order.totalPrice || order.total || 0;
      totalForUser += total;

      rowsHTML += `
      <tr>
        <td>${order.id}</td>
        <td>${productList}</td>
        <td>${order.status || "Pending"}</td>
        <td>₱${total.toFixed(2)}</td>
      </tr>
    `;
    });

    ordersBody.innerHTML = rowsHTML;
    orderSummary.innerHTML = `
    <div class="order-summary"><span>Total Spent: ₱${totalForUser.toFixed(2)}</span></div>
  `;
  }


  renderOrders();
  orderFilter.addEventListener("change", e => renderOrders(e.target.value));

  // Load addresses
  const addressRef = collection(db, "users", user.uid, "addresses");
  const addrSnap = await getDocs(addressRef);

  async function renderAddresses() {
    addressesList.innerHTML = "";

    const freshSnap = await getDocs(addressRef);
    if (freshSnap.empty) {
      addressesList.innerHTML = "<p>No saved addresses.</p>";
      return;
    }

    freshSnap.forEach(docSnap => {
      const addr = docSnap.data();
      const addrEl = document.createElement("div");
      addrEl.classList.add("address-item");
      addrEl.innerHTML = `
        <span>${addr.address}</span>
        <button class="delete-address" data-id="${docSnap.id}">✖</button>
      `;
      addressesList.appendChild(addrEl);
    });

    document.querySelectorAll(".delete-address").forEach(btn => {
      btn.addEventListener("click", async () => {
        const addrId = btn.dataset.id;
        try {
          await deleteDoc(doc(db, "users", user.uid, "addresses", addrId));
          renderAddresses();
        } catch (err) {
          console.error("Failed to delete address:", err);
          alert("Could not delete address. Try again.");
        }
      });
    });
  }

  renderAddresses();

  addAddressBtn.addEventListener("click", async () => {
    const newAddr = newAddressInput.value.trim();
    if (!newAddr) return;

    try {
      await addDoc(addressRef, { address: newAddr });
      newAddressInput.value = "";
      renderAddresses();
    } catch (err) {
      console.error("Failed to add address:", err);
      alert("Could not add address.");
    }
  });

  // Auto-open the "My Addresses" tab if ?tab=addresses is in the URL
  const urlParams = new URLSearchParams(window.location.search);
  const tab = urlParams.get("tab");
  if (tab === "addresses") {
    // Remove active from all
    document.querySelectorAll(".nav-link").forEach(link => link.classList.remove("active"));
    document.querySelectorAll(".section").forEach(sec => sec.classList.remove("active"));

    // Activate the addresses tab + section
    const addressLink = document.querySelector('.nav-link[data-section="addresses"]');
    const addressSection = document.getElementById("addresses");
    if (addressLink && addressSection) {
      addressLink.classList.add("active");
      addressSection.classList.add("active");
    }
  }


});
