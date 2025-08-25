document.addEventListener("DOMContentLoaded", function () {
  // FAQ modals
  var faqBtns = document.querySelectorAll(".faq-btn");
  faqBtns.forEach(function (btn) {
    btn.addEventListener("click", function () {
      var modalId = this.getAttribute("data-modal");
      document.getElementById(modalId).style.display = "block";
    });
  });

  var closeBtns = document.querySelectorAll(".modal .close");
  closeBtns.forEach(function (closeBtn) {
    closeBtn.addEventListener("click", function () {
      this.closest(".modal").style.display = "none";
    });
  });

  window.addEventListener("click", function (e) {
    if (e.target.classList.contains("modal")) {
      e.target.style.display = "none";
    }
  });
