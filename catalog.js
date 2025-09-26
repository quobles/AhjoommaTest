import { db } from "./db.js";
import {
  collection,
  getDocs
} from "https://www.gstatic.com/firebasejs/12.2.1/firebase-firestore.js";

async function loadCatalog() {
  const catalogContainer = document.getElementById("catalog");
  catalogContainer.innerHTML = "<p>Loading products...</p>";

  try {
    const querySnapshot = await getDocs(collection(db, "products"));

    if (querySnapshot.empty) {
      catalogContainer.innerHTML = "<p>No products found.</p>";
      return;
    }

    catalogContainer.innerHTML = ""; // clear loading text

    querySnapshot.forEach((doc) => {
      const product = doc.data();

      const item = document.createElement("div");
      item.classList.add("product-card");
      item.innerHTML = `
        <img src="${product.image || 'images/placeholder.png'}" alt="${product.name}">
        <h3>${product.name}</h3>
        <p>₱${product.price}</p>
        <p><strong>Stock:</strong> ${product.stock ?? "N/A"}</p>
      `;
      catalogContainer.appendChild(item);
    });
  } catch (err) {
    console.error("Error loading catalog:", err);
    catalogContainer.innerHTML = "<p>Failed to load products.</p>";
  }
}

document.addEventListener("DOMContentLoaded", loadCatalog);
