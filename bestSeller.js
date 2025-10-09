// best-sellers.js
import { db, auth } from "./db.js";
import {
  collection,
  query,
  where,
  getDocs,
  doc,
  getDoc,
  setDoc
} from "https://www.gstatic.com/firebasejs/12.2.1/firebase-firestore.js";

const carouselContainer = document.querySelector(".bs-cards");
const dotsContainer = document.querySelector(".bs-dots.bs-dots");
const slideshowWrapper = document.querySelector(".product-slideshow");

if (!carouselContainer || !dotsContainer || !slideshowWrapper) {
  console.warn("Best-sellers: required DOM nodes not found.");
}

async function loadBestSellers() {
  if (!carouselContainer || !dotsContainer) return;

  try {
    const q = query(collection(db, "products"), where("bestSeller", "==", true));
    const snapshot = await getDocs(q);

    if (snapshot.empty) {
      carouselContainer.innerHTML = `<p class="no-data">No best sellers found.</p>`;
      dotsContainer.innerHTML = "";
      return;
    }

    carouselContainer.innerHTML = "";
    dotsContainer.innerHTML = "";

    const created = [];

    snapshot.forEach((docSnap, i) => {
      const data = docSnap.data();
      const product = { id: docSnap.id, ...data };
      const stocks = product.stocks ?? 0;
      const outOfStock = stocks <= 0;

      const card = document.createElement("div");
      card.className = `product-card${i === 0 ? " active" : ""}`;
      card.innerHTML = `
        <img src="${product.image || "images/placeholder.png"}" alt="${escapeHtml(product.name || "")}">
        <h3>${escapeHtml(product.name || "Unnamed")}</h3>
        <p>₱${(Number(product.price) || 0).toFixed(2)}</p>
        <p><strong>Stocks:</strong> ${stocks}</p>
        <button class="add-to-cart" ${outOfStock ? "disabled style='background:#ccc;cursor:not-allowed;'" : ""}>
          ${outOfStock ? "OUT OF STOCK" : "ADD TO CART"}
        </button>
      `;

      carouselContainer.appendChild(card);

      const dot = document.createElement("span");
      dot.className = `dot${i === 0 ? " active" : ""}`;
      dotsContainer.appendChild(dot);

      created.push({ card, dot, product, outOfStock });
    });

    setupCarousel(created);
  } catch (err) {
    console.error("Error loading best sellers:", err);
    carouselContainer.innerHTML = `<p class="no-data">Failed to load best sellers.</p>`;
    dotsContainer.innerHTML = "";
  }
}

function setupCarousel(items) {
  if (!items || items.length === 0) return;

  const cards = Array.from(carouselContainer.querySelectorAll(".product-card"));
  const dots = Array.from(dotsContainer.querySelectorAll(".dot"));
  let current = 0;
  let autoInterval = null;

  function showSlide(index) {
    if (!cards.length) return;
    current = ((index % cards.length) + cards.length) % cards.length;
    cards.forEach((c, i) => c.classList.toggle("active", i === current));
    dots.forEach((d, i) => d.classList.toggle("active", i === current));
  }

  dots.forEach((dot, i) => {
    dot.addEventListener("click", () => {
      showSlide(i);
      restartAuto();
    });
  });

  if (!slideshowWrapper.querySelector(".bs-btn.prev")) {
    const prevBtn = document.createElement("button");
    prevBtn.className = "bs-btn prev";
    prevBtn.type = "button";
    prevBtn.innerText = "‹";
    prevBtn.addEventListener("click", () => {
      showSlide(current - 1);
      restartAuto();
    });

    const nextBtn = document.createElement("button");
    nextBtn.className = "bs-btn next";
    nextBtn.type = "button";
    nextBtn.innerText = "›";
    nextBtn.addEventListener("click", () => {
      showSlide(current + 1);
      restartAuto();
    });

    slideshowWrapper.appendChild(prevBtn);
    slideshowWrapper.appendChild(nextBtn);
  }

  items.forEach(({ card, product, outOfStock }) => {
    const btn = card.querySelector(".add-to-cart");
    if (!btn) return;

    btn.addEventListener("click", async () => {
      const user = auth.currentUser;
      if (!user) {
        alert("Please log in to add items to your cart.");
        return;
      }

      const userDoc = await getDoc(doc(db, "users", user.uid));
      if (userDoc.exists() && userDoc.data().role === "admin") {
        alert("Admins cannot add items to the cart.");
        return;
      }

      if (outOfStock) {
        alert("This item is out of stock.");
        return;
      }

      const cartItemRef = doc(db, "carts", user.uid, "items", product.id);
      const cartSnap = await getDoc(cartItemRef);

      if (cartSnap.exists()) {
        const currentQty = (cartSnap.data().quantity || 1) + 1;
        await setDoc(cartItemRef, { quantity: currentQty }, { merge: true });
      } else {
        await setDoc(cartItemRef, {
          productId: product.id,
          name: product.name || "",
          price: Number(product.price) || 0,
          image: product.image || "",
          quantity: 1
        });
      }

      alert(`${product.name} added to cart!`);
    });
  });

  function startAuto() {
    if (autoInterval) clearInterval(autoInterval);
    if (cards.length <= 1) return;
    autoInterval = setInterval(() => showSlide(current + 1), 5000);
  }

  function restartAuto() {
    if (autoInterval) clearInterval(autoInterval);
    startAuto();
  }

  slideshowWrapper.addEventListener("mouseenter", () => clearInterval(autoInterval));
  slideshowWrapper.addEventListener("mouseleave", startAuto);

  showSlide(0);
  startAuto();
}

function escapeHtml(str) {
  return String(str)
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#039;");
}

loadBestSellers();
