import { db } from "./db.js";
import { collection, getDocs } from "https://www.gstatic.com/firebasejs/12.2.1/firebase-firestore.js";

// Grab the catalog grid container
const catalogEl = document.getElementById("catalog");

async function loadCatalog() {
  try {
    // Fetch all products
    const querySnapshot = await getDocs(collection(db, "products"));

    if (querySnapshot.empty) {
      catalogEl.innerHTML = "<p>No products found.</p>";
      return;
    }

    // Render products
    querySnapshot.forEach((doc) => {
      const product = doc.data();

      console.log("Loaded product:", product); // 🔍 debug log

      const item = document.createElement("div");
      item.classList.add("product-card");
      item.innerHTML = `
        <img src="${product.image || "images/placeholder.png"}" alt="${product.name}">
        <h3>${product.name}</h3>
        <p>₱${product.price}</p>
        <p>Stocks: ${product.stocks}</p>
        <p class="category">Category: ${product.category}</p>
        <button>Add to Cart</button>
      `;

      catalogEl.appendChild(item);
    });
  } catch (err) {
    console.error("Error loading products:", err);
    catalogEl.innerHTML = "<p>Failed to load products.</p>";
  }
}

// Run when DOM is ready
document.addEventListener("DOMContentLoaded", loadCatalog);
