document.addEventListener("DOMContentLoaded", function () {
  var modals = {
    hours: document.getElementById("store-hours-modal"),
    parking: document.getElementById("parking-modal"),
    expect: document.getElementById("expect-modal"),
    franchise: document.getElementById("franchise-modal")
  };

  var buttons = {
    hours: document.getElementById("hours"),
    parking: document.getElementById("parking"),
    expect: document.getElementById("expect"),
    franchise: document.getElementById("franchise")
  };

  var closeButtons = document.querySelectorAll(".modal .close");

  Object.keys(buttons).forEach(function (key) {
    if (buttons[key]) {
      buttons[key].onclick = function () {
        if (modals[key]) {
          modals[key].style.display = "block";
        }
      };
    }
  });

  closeButtons.forEach(function (btn) {
    btn.onclick = function () {
      btn.closest(".modal").style.display = "none";
    };
  });

  window.onclick = function (event) {
    Object.values(modals).forEach(function (modal) {
      if (event.target === modal) {
        modal.style.display = "none";
      }
    });
  };
});
