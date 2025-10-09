const tabButtons = document.querySelectorAll(".tab-btn");
const tabPanes = document.querySelectorAll(".tab-pane");

tabButtons.forEach(btn => {
  btn.addEventListener("click", () => {
    tabButtons.forEach(b => b.classList.remove("active"));
    btn.classList.add("active");

    tabPanes.forEach(p => p.classList.remove("active"));
    document.getElementById(btn.dataset.tab).classList.add("active");
  });
});
