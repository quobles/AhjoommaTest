document.addEventListener("DOMContentLoaded", function () {
  const moreBtn = document.querySelector(".more-btn");

if (moreBtn) {
  // Create wrapper and dropdown dynamically
  const wrapper = document.createElement("div");
  wrapper.classList.add("more-wrapper");

  // Insert wrapper in place of the button
  moreBtn.parentNode.insertBefore(wrapper, moreBtn);
  wrapper.appendChild(moreBtn);

 // Create dropdown
const dropdown = document.createElement("div");
dropdown.classList.add("more-dropdown");
dropdown.innerHTML = `
  <ul>
    <li><a href="admin.html">📦 Manage Orders</a></li>
    <li><a href="inventory.html">📋 Inventory</a></li>
    <li><a href="sales.html">📊 Inventory Report</a></li>
    <li><a href="accounts.html">👥 User/Role Management</a></li>
  </ul>
`;
wrapper.appendChild(dropdown);


  // Toggle dropdown on click
  moreBtn.addEventListener("click", (e) => {
    e.stopPropagation();
    dropdown.classList.toggle("show");
  });

  // Close on outside click
  document.addEventListener("click", (e) => {
    if (!dropdown.contains(e.target) && !moreBtn.contains(e.target)) {
      dropdown.classList.remove("show");
    }
  });
}

  
  // Profile dropdown toggle
  const profileBtn = document.querySelector(".profile-btn");
  const profileDropdown = document.querySelector(".profile-dropdown");
  const email = document.querySelector("#user-email");

  if (profileBtn && profileDropdown) {
    profileBtn.addEventListener("click", (e) => {
      e.stopPropagation();
      profileDropdown.classList.toggle("show");
    });

    if (email) {
      email.addEventListener("click", (e) => {
        e.stopPropagation();
        window.location.href = "profile.html";
      });
    }

    // Close dropdown 
    document.addEventListener("click", (e) => {
      if (!profileBtn.contains(e.target) && !profileDropdown.contains(e.target)) {
        profileDropdown.classList.remove("show");
      }
    });
  }

  
  var cartBtn = document.querySelector(".icon-btn.cart-btn");
  if (cartBtn) {
    cartBtn.addEventListener("click", function (e) {
      e.stopPropagation();
      window.location.href = "cart.html";
    });
  }

});