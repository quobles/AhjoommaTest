import { db, auth } from "./db.js";
import {
    collection,
    query,
    where,
    getDocs,
    limit,
    doc,
    setDoc,
    getDoc
} from "https://www.gstatic.com/firebasejs/12.2.1/firebase-firestore.js";
import { onAuthStateChanged } from "https://www.gstatic.com/firebasejs/12.2.1/firebase-auth.js";

let isAdmin = false;

onAuthStateChanged(auth, async (user) => {
    if (user) {
        const userRef = doc(db, "users", user.uid);
        const userSnap = await getDoc(userRef);
        if (userSnap.exists()) {
            const data = userSnap.data();
            isAdmin = data.role === "admin";
        }
    } else {
        isAdmin = false;
    }
});

async function loadNewArrivals() {
    const newArrivalsGrid = document.getElementById("new-arrivals");
    newArrivalsGrid.innerHTML = "<p>Loading...</p>";

    try {
        const q = query(
            collection(db, "products"),
            where("isNew", "==", true),
            limit(8)
        );

        const querySnapshot = await getDocs(q);

        if (querySnapshot.empty) {
            newArrivalsGrid.innerHTML = "<p>No new arrivals found.</p>";
            return;
        }

        newArrivalsGrid.innerHTML = "";

        querySnapshot.forEach((docSnap) => {
            const product = { id: docSnap.id, ...docSnap.data() };
            const stocks = product.stocks ?? 0;
            const outOfStock = stocks <= 0;

            const card = document.createElement("div");
            card.classList.add("promo-card");
            card.innerHTML = `
                <img src="${product.image}" alt="${product.name}">
                <h3>${product.name}</h3>
                <p class="price">₱${product.price}</p>
                <p><strong>Stocks:</strong> ${stocks}</p>
                <button class="quick-view" 
                    data-id="${product.id}"
                    data-name="${product.name}"
                    data-price="${product.price}"
                    data-image="${product.image}"
                    data-description="${product.description ?? "No description available."}"
                    data-nutrition="${product.nutrition ?? "Not provided."}"
                    data-stocks="${stocks}"
                >
                    QUICK VIEW
                </button>
            `;

            newArrivalsGrid.appendChild(card);
        });

        attachQuickViewHandlers();
    } catch (err) {
        console.error("Error loading new arrivals:", err);
        newArrivalsGrid.innerHTML = "<p>Error loading products.</p>";
    }
}

async function addToCart(product) {
    const user = auth.currentUser;
    if (!user) {
        alert("Please log in to add items to your cart.");
        return;
    }

    if (isAdmin) {
        alert("Admins cannot add items to cart.");
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

function attachQuickViewHandlers() {
    const buttons = document.querySelectorAll(".quick-view");
    const modal = document.getElementById("quickViewModal");
    const closeBtn = modal.querySelector(".close");

    buttons.forEach((btn) => {
        btn.addEventListener("click", () => {
            const stocks = Number(btn.dataset.stocks) || 0;
            const outOfStock = stocks <= 0;

            modal.querySelector("img").src = btn.dataset.image;
            modal.querySelector(".modal-title").textContent = btn.dataset.name;
            modal.querySelector(".modal-description").textContent = btn.dataset.description;
            modal.querySelector(".nutrition").textContent = btn.dataset.nutrition;
            modal.querySelector(".modal-price").textContent = "₱" + btn.dataset.price;
            modal.style.display = "flex";

            const addBtn = modal.querySelector("#addToCartBtn");

            if (isAdmin) {
                addBtn.disabled = true;
                addBtn.textContent = "Admins cannot add to cart";
            } else if (outOfStock) {
                addBtn.disabled = true;
                addBtn.textContent = "Out of Stock";
            } else {
                addBtn.disabled = false;
                addBtn.textContent = "Add to Cart";
            }

            addBtn.onclick = () => {
                if (!outOfStock && !isAdmin) {
                    const product = {
                        id: btn.dataset.id,
                        name: btn.dataset.name,
                        price: Number(btn.dataset.price),
                        image: btn.dataset.image,
                        description: btn.dataset.description,
                        nutrition: btn.dataset.nutrition,
                        stocks
                    };
                    addToCart(product);
                }
                modal.style.display = "none";
            };
        });
    });

    closeBtn.addEventListener("click", () => {
        modal.style.display = "none";
    });

    window.addEventListener("click", (e) => {
        if (e.target === modal) {
            modal.style.display = "none";
        }
    });
}

document.addEventListener("DOMContentLoaded", loadNewArrivals);
