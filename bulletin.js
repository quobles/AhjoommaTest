document.addEventListener("DOMContentLoaded", function () {
  var faqButtons = document.querySelectorAll(".faq-btn");
  for (var i = 0; i < faqButtons.length; i++) {
    faqButtons[i].addEventListener("click", function () {
      var modalId = this.getAttribute("data-modal");
      document.getElementById(modalId).style.display = "block";
    });
  }

  var closeButtons = document.querySelectorAll(".faq-modal .faq-close");
  for (var j = 0; j < closeButtons.length; j++) {
    closeButtons[j].addEventListener("click", function () {
      this.closest(".faq-modal").style.display = "none";
    });
  }

  window.addEventListener("click", function (e) {
    if (e.target.classList.contains("faq-modal")) {
      e.target.style.display = "none";
    }
  });
});
