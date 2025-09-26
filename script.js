document.addEventListener("DOMContentLoaded", function () {
  // Notifications dropdown
  var notifBtn = document.querySelector(".notification-btn");
  var notifDropdown = document.querySelector(".notification-dropdown");

  if (notifBtn && notifDropdown) {
    notifBtn.addEventListener("click", function (e) {
      e.stopPropagation();
      notifDropdown.classList.toggle("show");
    });

    document.addEventListener("click", function (e) {
      if (!notifDropdown.contains(e.target) && !notifBtn.contains(e.target)) {
        notifDropdown.classList.remove("show");
      }
    });
  }

  // Search button toggle
  var searchBtn = document.querySelector(".search-button");
  var searchInput = document.querySelector(".search-input");

  if (searchBtn && searchInput) {
    searchBtn.addEventListener("click", function () {
      searchInput.classList.toggle("active");
      searchInput.focus();
    });
  }

  // Profile dropdown toggle
  const profileBtn = document.querySelector(".profile-btn");
  const profileDropdown = document.querySelector(".profile-dropdown");

  if (profileBtn && profileDropdown) {
    profileBtn.addEventListener("click", (e) => {
      e.stopPropagation(); // prevent clicks from bubbling up
      profileDropdown.classList.toggle("show");
    });

    // Close dropdown when clicking outside
    document.addEventListener("click", (e) => {
      if (!profileBtn.contains(e.target) && !profileDropdown.contains(e.target)) {
        profileDropdown.classList.remove("show");
      }
    });
  }

});
