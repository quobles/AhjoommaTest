import { db } from "./db.js";
import { collection, getDocs } from "https://www.gstatic.com/firebasejs/12.2.1/firebase-firestore.js";

async function loadProducts() {
  const productsContainer = document.querySelector("#products-container");
  if (!productsContainer) return;

  const querySnapshot = await getDocs(collection(db, "products"));
  querySnapshot.forEach((doc) => {
    const product = doc.data();
    const card = document.createElement("div");
    card.className = "product-card";
    card.innerHTML = `
      <h3>${product.name}</h3>
      <p>${product.description || ""}</p>
      <strong>₱${product.price}</strong>
    `;
    productsContainer.appendChild(card);
  });
}

document.addEventListener("DOMContentLoaded", loadProducts);
