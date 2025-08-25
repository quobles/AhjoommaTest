document.addEventListener("DOMContentLoaded", function () {
  var faqButtons = document.querySelectorAll(".faq-btn");
  for (var i = 0; i < faqButtons.length; i++) {
    faqButtons[i].addEventListener("click", function () {
      var modalId = this.getAttribute("data-modal");
      document.getElementById(modalId).style.display = "block";
    });
  }

  var closeButtons = document.querySelectorAll(".modal .close");
  for (var j = 0; j < closeButtons.length; j++) {
    closeButtons[j].addEventListener("click", function () {
      this.closest(".modal").style.display = "none";
    });
  }

  window.addEventListener("click", function (e) {
    if (e.target.classList.contains("modal")) {
      e.target.style.display = "none";
    }
  });
});
