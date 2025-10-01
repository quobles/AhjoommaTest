import { db, auth } from "./db.js";
import {
  collection,
  query,
  where,
  getDocs,
  doc,
  setDoc,
  getDoc,
} from "https://www.gstatic.com/firebasejs/12.2.1/firebase-firestore.js";

async function loadCatalog(selectedCategory = "") {
  const catalogContainer = document.getElementById("catalog");
  catalogContainer.innerHTML = "<p>Loading products...</p>"; // loading products text

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

    querySnapshot.forEach((docSnap) => {
      const product = { id: docSnap.id, ...docSnap.data() };

      const item = document.createElement("div");
      item.classList.add("catalog-card");
      item.innerHTML = `
        <img src="${product.image || "images/placeholder.png"}" alt="${product.name}">
        <h3>${product.name}</h3>
        <p>₱${product.price}</p>
        <p><strong>Stocks:</strong> ${product.stocks ?? "N/A"}</p>
        <button class="add-to-cart">ADD TO CART</button>
      `;

      // Attach add-to-cart handler
      item.querySelector(".add-to-cart").addEventListener("click", () => {
        addToCart(product);
      });

      catalogContainer.appendChild(item);
    });
  } catch (err) {
    console.error("Error loading catalog:", err);
    catalogContainer.innerHTML = "<p>Failed to load products.</p>";
  }
}

// Add to Cart function
async function addToCart(product) {
  const user = auth.currentUser;
  if (!user) {
    alert("Please log in to add items to your cart.");
    return;
  }

  const cartItemRef = doc(db, "carts", user.uid, "items", product.id);

  try {
    const docSnap = await getDoc(cartItemRef);
    if (docSnap.exists()) {
      const currentQty = docSnap.data().quantity || 1;
      await setDoc(cartItemRef, {
        ...product,
        quantity: currentQty + 1,
      });
    } else {
      await setDoc(cartItemRef, {
        ...product,
        quantity: 1,
      });
    }

    alert(`${product.name} added to cart!`);
  } catch (err) {
    console.error("Error adding to cart:", err);
    alert("Failed to add to cart.");
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
  loadCatalog(selectedCategory).then(() => {
    setupSearchFilter();
  });

  // Update catalog when dropdown changes
  categorySelect.addEventListener("change", (e) => {
    loadCatalog(e.target.value).then(() => {
      setupSearchFilter(); 
    });
  });
});

// Search filter logic
function setupSearchFilter() {
  const searchInput = document.getElementById("catalogSearch");
  const catalogContainer = document.getElementById("catalog");

  searchInput?.addEventListener("input", () => {
    const query = searchInput.value.toLowerCase();
    const cards = catalogContainer.querySelectorAll(".catalog-card");

    cards.forEach(card => {
      const text = card.textContent.toLowerCase();
      card.style.display = text.includes(query) ? "block" : "none";
    });
  });
}