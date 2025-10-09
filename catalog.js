import { db, auth } from "./db.js";
import {
  collection,
  query,
  where,
  getDocs,
  doc,
  setDoc,
  getDoc
} from "https://www.gstatic.com/firebasejs/12.2.1/firebase-firestore.js";
import { onAuthStateChanged } from "https://www.gstatic.com/firebasejs/12.2.1/firebase-auth.js";

let isAdmin = false;

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

    catalogContainer.innerHTML = "";

    querySnapshot.forEach((docSnap) => {
      const product = { id: docSnap.id, ...docSnap.data() };
      const stocks = product.stocks ?? 0;
      const outOfStock = stocks <= 0;

      const item = document.createElement("div");
      item.classList.add("catalog-card");

      let buttonHTML = "";

      if (isAdmin) {
        buttonHTML = `<p><em>Admins cannot add to cart</em></p>`;
      } else if (outOfStock) {
        buttonHTML = `<button class="add-to-cart" disabled style="background:#ccc;cursor:not-allowed;">OUT OF STOCK</button>`;
      } else {
        buttonHTML = `<button class="add-to-cart">ADD TO CART</button>`;
      }

      item.innerHTML = `
        <img src="${product.image || "images/placeholder.png"}" alt="${product.name}">
        <h3>${product.name}</h3>
        <p>₱${product.price}</p>
        <p><strong>Stocks:</strong> ${stocks}</p>
        ${buttonHTML}
      `;

      if (!isAdmin && !outOfStock) {
        item.querySelector(".add-to-cart").addEventListener("click", () => {
          addToCart(product);
        });
      }

      catalogContainer.appendChild(item);
    });
  } catch (err) {
    console.error("Error loading catalog:", err);
    catalogContainer.innerHTML = "<p>Failed to load products.</p>";
  }
}

async function addToCart(product) {
  const user = auth.currentUser;
  if (!user) {
    alert("Please log in to add items to your cart.");
    return;
  }

  if (isAdmin) {
    alert("Admins cannot add items to the cart.");
    return;
  }

  if (!product.stocks || product.stocks <= 0) {
    alert("This item is out of stock.");
    return;
  }

  const cartItemRef = doc(db, "carts", user.uid, "items", product.id);

  try {
    const docSnap = await getDoc(cartItemRef);
    if (docSnap.exists()) {
      const currentQty = docSnap.data().quantity || 1;
      await setDoc(cartItemRef, { ...product, quantity: currentQty + 1 });
    } else {
      await setDoc(cartItemRef, { ...product, quantity: 1 });
    }
    alert(`${product.name} added to cart!`);
  } catch (err) {
    console.error("Error adding to cart:", err);
    alert("Failed to add to cart.");
  }
}

// --- Auth listener ensures role is ready before loading catalog ---
onAuthStateChanged(auth, async (user) => {
  const params = new URLSearchParams(window.location.search);
  const selectedCategory = params.get("category") || "";

  if (user) {
    const userDoc = await getDoc(doc(db, "users", user.uid));
    isAdmin = userDoc.exists() && userDoc.data().role === "admin";
  } else {
    isAdmin = false;
  }

  loadCatalog(selectedCategory).then(() => {
    setupSearchFilter();
  });

  const categorySelect = document.getElementById("category-select");

  if (selectedCategory) {
    categorySelect.value = selectedCategory;
  }

  categorySelect.addEventListener("change", (e) => {
    loadCatalog(e.target.value).then(() => {
      setupSearchFilter();
    });
  });
});

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
