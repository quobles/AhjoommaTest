import { db } from "./db.js";
import { collection, query, where, getDocs } from "https://www.gstatic.com/firebasejs/12.2.1/firebase-firestore.js";

async function loadCatalog(selectedCategory = "") {
  const catalogContainer = document.getElementById("catalog");
  catalogContainer.innerHTML = "<p>Loading products...</p>";

  try {
    let q = collection(db, "products");
    if (selectedCategory) {
      q = query(q, where("category", "==", selectedCategory));
    }

    const querySnapshot = await getDocs(q);

    if (querySnapshot.empty) {
      catalogContainer.innerHTML = "<p>No products found.</p>";
      return;
    }

    catalogContainer.innerHTML = ""; // clear loading text

    querySnapshot.forEach((doc) => {
      const product = doc.data();
      const item = document.createElement("div");
      item.classList.add("catalog-card");
      item.innerHTML = `
        <img src="${product.image || 'images/placeholder.png'}" alt="${product.name}">
        <h3>${product.name}</h3>
        <p>₱${product.price}</p>
        <p><strong>Stocks:</strong> ${product.stocks ?? "N/A"}</p>
        <button class="add-to-cart">ADD TO CART</button>
      `;
      catalogContainer.appendChild(item);
    });
  } catch (err) {
    console.error("Error loading catalog:", err);
    catalogContainer.innerHTML = "<p>Failed to load products.</p>";
  }
}

document.addEventListener("DOMContentLoaded", () => {
  // Check for ?category=... in URL
  const params = new URLSearchParams(window.location.search);
  const selectedCategory = params.get("category") || "";

  // Set dropdown value
  const categorySelect = document.getElementById("category-select");
  if (selectedCategory) {
    categorySelect.value = selectedCategory;
  }

  // Load catalog with selected category
  loadCatalog(selectedCategory);

  // Update catalog when dropdown changes
  categorySelect.addEventListener("change", (e) => {
    loadCatalog(e.target.value);
  });
});
