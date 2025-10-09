import { db, auth } from "./db.js";
import {
  collection,
  getDocs,
  updateDoc,
  doc,
  getDoc
} from "https://www.gstatic.com/firebasejs/12.2.1/firebase-firestore.js";
import { onAuthStateChanged } from "https://www.gstatic.com/firebasejs/12.2.1/firebase-auth.js";

const inventoryList = document.getElementById("inventory-list");

async function loadInventory() {
  inventoryList.innerHTML = "<p>Loading inventory...</p>";

  const snapshot = await getDocs(collection(db, "products"));
  if (snapshot.empty) {
    inventoryList.innerHTML = "<p>No products found.</p>";
    return;
  }

  inventoryList.innerHTML = "";

  snapshot.forEach((docSnap) => {
    const product = docSnap.data();

    const itemDiv = document.createElement("div");
    itemDiv.classList.add("inventory-item");

    itemDiv.innerHTML = `
      <div class="inventory-details">
        <img src="${product.image}" alt="${product.name}">
        <p><strong>${product.name}</strong> (₱${product.price})</p>
      </div>
      <div class="inventory-actions">
        <label>Stock:</label>
        <input type="number" value="${product.stocks}" min="0" data-id="${docSnap.id}">
      </div>
    `;

    inventoryList.appendChild(itemDiv);
  });

  attachListeners();
}

function attachListeners() {
  document.querySelectorAll(".inventory-actions input").forEach((input) => {
    input.addEventListener("change", async () => {
      const productId = input.getAttribute("data-id");
      const newStock = parseInt(input.value, 10);

      const productRef = doc(db, "products", productId);
      await updateDoc(productRef, { stocks: newStock });

      alert("Stock updated!");
    });
  });
}

// Restrict to admins only
onAuthStateChanged(auth, async (user) => {
  if (!user) {
    alert("You must be logged in.");
    window.location.href = "index.html";
    return;
  }

  const userRef = doc(db, "users", user.uid);
  const userSnap = await getDoc(userRef);

  if (!userSnap.exists() || userSnap.data().role !== "admin") {
    alert("You are not authorized.");
    window.location.href = "index.html";
    return;
  }

  loadInventory();
});

// Search functionality for Inventory
const searchInput = document.getElementById("inventory-search");
searchInput.addEventListener("input", () => {
  const query = searchInput.value.toLowerCase();
  document.querySelectorAll(".inventory-item").forEach(item => {
    const name = item.querySelector("p strong").textContent.toLowerCase();
    item.style.display = name.includes(query) ? "flex" : "none";
  });
});
