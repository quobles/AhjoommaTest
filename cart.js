import { db, auth } from "./db.js";
import {
  collection,
  getDocs,
  doc,
  updateDoc,
  deleteDoc
} from "https://www.gstatic.com/firebasejs/12.2.1/firebase-firestore.js";
import { onAuthStateChanged } from "https://www.gstatic.com/firebasejs/12.2.1/firebase-auth.js";

async function loadCart(user) {
  const cartContainer = document.getElementById("cart-container");
  const totalEl = document.getElementById("cart-total");
  const checkoutBtn = document.querySelector(".checkout-btn");

  cartContainer.innerHTML = "<p>Loading cart...</p>";

  try {
    const itemsRef = collection(db, "carts", user.uid, "items");
    const snapshot = await getDocs(itemsRef);

    if (snapshot.empty) {
      cartContainer.innerHTML = "<p>Your cart is empty.</p>";
      totalEl.textContent = "0";

      // Disable checkout
      if (checkoutBtn) {
        checkoutBtn.classList.add("disabled");
        checkoutBtn.setAttribute("disabled", "true");
        checkoutBtn.onclick = null; // remove redirect
      }
      return;
    }

    cartContainer.innerHTML = "";
    let total = 0;

    snapshot.forEach((docSnap) => {
      const item = docSnap.data();
      const itemEl = document.createElement("div");
      itemEl.classList.add("cart-item");

      total += item.price * item.quantity;

      itemEl.innerHTML = `
        <img src="${item.image || "images/placeholder.png"}" alt="${item.name}">
        <div class="cart-info">
          <h4>${item.name}</h4>
          <p>₱${item.price}</p>
          <div class="quantity-control">
            <button class="decrease">-</button>
            <span>${item.quantity}</span>
            <button class="increase">+</button>
          </div>
        </div>
        <button class="remove-btn">❌</button>
      `;

      // Quantity controls
      itemEl.querySelector(".increase").addEventListener("click", async () => {
        await updateDoc(doc(db, "carts", user.uid, "items", docSnap.id), {
          quantity: item.quantity + 1,
        });
        loadCart(user);
      });

      itemEl.querySelector(".decrease").addEventListener("click", async () => {
        if (item.quantity > 1) {
          await updateDoc(doc(db, "carts", user.uid, "items", docSnap.id), {
            quantity: item.quantity - 1,
          });
        } else {
          await deleteDoc(doc(db, "carts", user.uid, "items", docSnap.id));
        }
        loadCart(user);
      });

      itemEl.querySelector(".remove-btn").addEventListener("click", async () => {
        await deleteDoc(doc(db, "carts", user.uid, "items", docSnap.id));
        loadCart(user);
      });

      cartContainer.appendChild(itemEl);
    });

    totalEl.textContent = total;

    // ✅ Enable checkout + add redirect
    if (checkoutBtn) {
      checkoutBtn.classList.remove("disabled");
      checkoutBtn.removeAttribute("disabled");
      checkoutBtn.onclick = () => {
        window.location.href = "checkout.html";
      };
    }
  } catch (err) {
    console.error("Error loading cart:", err);
    cartContainer.innerHTML = "<p>Failed to load cart.</p>";
  }
}

onAuthStateChanged(auth, (user) => {
  const checkoutBtn = document.querySelector(".checkout-btn");

  if (user) {
    loadCart(user);
  } else {
    document.getElementById("cart-container").innerHTML =
      "<p>Please log in to view your cart.</p>";
    document.getElementById("cart-total").textContent = "0";

    if (checkoutBtn) {
      checkoutBtn.classList.add("disabled");
      checkoutBtn.setAttribute("disabled", "true");
      checkoutBtn.onclick = null;
    }
  }
});


onAuthStateChanged(auth, (user) => {
  const checkoutBtn = document.querySelector(".checkout-btn");

  if (user) {
    loadCart(user);
  } else {
    document.getElementById("cart-container").innerHTML =
      "<p>Please log in to view your cart.</p>";
    document.getElementById("cart-total").textContent = "0";

    if (checkoutBtn) {
      checkoutBtn.classList.add("disabled");
      checkoutBtn.setAttribute("disabled", "true");
    }
  }
});



onAuthStateChanged(auth, (user) => {
 const checkoutBtn = document.querySelector(".checkout-btn");

  if (user) {
    loadCart(user);
  } else {
    document.getElementById("cart-container").innerHTML =
      "<p>Please log in to view your cart.</p>";

    document.getElementById("cart-total").textContent = "0";

    if (checkoutBtn) {
      checkoutBtn.classList.add("disabled");
    }
  }
});
