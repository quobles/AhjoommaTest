document.addEventListener("DOMContentLoaded", function () {
  // Get category from URL
  const params = new URLSearchParams(window.location.search);
  const category = params.get("category") || "All";
  document.getElementById("catalog-title").innerText = category;

  // Placeholder products (later: fetch from Firebase)
  const products = [
    { name: "Shin Ramyun", price: "₱50", img: "images/noodles.jpg", category: "Noodles" },
    { name: "Samyang Spicy", price: "₱70", img: "images/noodles.jpg", category: "Noodles" },
    { name: "Corned Beef", price: "₱85", img: "images/canned.jpg", category: "Canned" },
    { name: "Milk Tea", price: "₱40", img: "images/beverages.jpg", category: "Beverages" },
  ];

  const grid = document.getElementById("product-grid");
  grid.innerHTML = "";

  products
    .filter(p => category === "All" || p.category === category)
    .forEach(product => {
      const card = document.createElement("div");
      card.classList.add("product-card");
      card.innerHTML = `
        <img src="${product.img}" alt="${product.name}">
        <div class="info">
          <h3>${product.name}</h3>
          <p>${product.price}</p>
        </div>
      `;
      grid.appendChild(card);
    });
});
