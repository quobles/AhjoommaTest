import { db } from "./db.js";
import { collection, getDocs } from "https://www.gstatic.com/firebasejs/12.2.1/firebase-firestore.js";

async function loadProducts() {
  try {
    console.log("📡 Fetching products from Firestore...");

    const productsRef = collection(db, "products"); // 👈 must be lowercase
    const snap = await getDocs(productsRef);

    if (snap.empty) {
      console.warn("⚠️ No products found in Firestore.");
      document.getElementById("catalog").innerHTML = "<p>No products found.</p>";
      return;
    }

    const catalog = document.getElementById("catalog");
    catalog.innerHTML = ""; // clear old content

    snap.forEach((doc) => {
      const product = doc.data();
      console.log("✅ Product found:", doc.id, product); // debug log

      const item = document.createElement("div");
      item.classList.add("product-card");
      item.innerHTML = `
        <img src="${product.image}" alt="${product.name}">
        <h3>${product.name}</h3>
        <p>₱${product.price}</p>
        <p>Stocks: ${product.stocks}</p>
        <small>Category: ${product.category}</small>
      `;
      catalog.appendChild(item);
    });
  } catch (err) {
    console.error("❌ Error loading products:", err);
    document.getElementById("catalog").innerHTML = `<p>Error: ${err.message}</p>`;
  }
}

document.addEventListener("DOMContentLoaded", loadProducts);
