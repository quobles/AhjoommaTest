// catalog.js
import { db } from "./db.js";
import { collection, getDocs } from "https://www.gstatic.com/firebasejs/12.2.1/firebase-firestore.js";

async function loadProducts() {
  const catalogContainer = document.getElementById("catalog");
  catalogContainer.innerHTML = "";

  try {
    const querySnapshot = await getDocs(collection(db, "products"));
    querySnapshot.forEach((doc) => {
      const product = doc.data();

      const card = document.createElement("div");
      card.classList.add("product-card");
      card.innerHTML = `
        <img src="${product.image}" alt="${product.name}">
        <h3>${product.name}</h3>
        <p>${product.category}</p>
        <p>₱${product.price}</p>
      `;
      catalogContainer.appendChild(card);
    });
  } catch (err) {
    console.error("Error loading products:", err);
  }
}

loadProducts();
