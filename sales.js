import { db, auth } from "./db.js";
import {
  collection,
  query,
  orderBy,
  getDocs
} from "https://www.gstatic.com/firebasejs/12.2.1/firebase-firestore.js";
import { onAuthStateChanged } from "https://www.gstatic.com/firebasejs/12.2.1/firebase-auth.js";

const reportDateInput = document.getElementById("report-date");
const loadButton = document.getElementById("load-report");
const salesBody = document.getElementById("sales-body");
const salesSummary = document.getElementById("sales-summary");
const salesTable = document.getElementById("sales-table");
const today = new Date().toISOString().split("T")[0];


reportDateInput.value = today;

let currentLogs = []; // store loaded logs for sorting

async function getProductPriceByName(productName) {
  const productsSnapshot = await getDocs(collection(db, "products"));
  const product = productsSnapshot.docs.find(
    (d) => d.data().name === productName
  );
  return product ? product.data().price : 0;
}

async function loadLogs(selectedDate = null) {
  try {
    const q = query(collection(db, "stockLogs"), orderBy("createdAt", "desc"));
    const snapshot = await getDocs(q);

    if (snapshot.empty) {
      salesBody.innerHTML = `<tr><td colspan="7" class="no-data">No logs found.</td></tr>`;
      salesSummary.innerHTML = "";
      return;
    }

    const filteredLogs = [];
    snapshot.forEach((doc) => {
      const log = doc.data();
      const logDate = log.createdAt?.toDate();
      if (!logDate) return;

      const formatted = logDate.toISOString().split("T")[0];
      if (!selectedDate || formatted === selectedDate) {
        filteredLogs.push(log);
      }
    });

    salesBody.innerHTML = "";
    salesSummary.innerHTML = "";

    if (filteredLogs.length === 0) {
      salesBody.innerHTML = `<tr><td colspan="7" class="no-data">No logs found for that date.</td></tr>`;
      return;
    }

    filteredLogs.sort((a, b) => {
      const nameA = (a.productName || "").toLowerCase();
      const nameB = (b.productName || "").toLowerCase();
      return nameA.localeCompare(nameB);
    });


    let dailyTotal = 0;
    currentLogs = [];

    for (const log of filteredLogs) {
      let price = Number(log.price) || 0;
      if (!price && log.productName) {
        price = await getProductPriceByName(log.productName);
      }

      const quantity = Number(log.change) * -1 || 0;
      const totalPrice = price * quantity;
      dailyTotal += totalPrice;

      currentLogs.push({
        productName: log.productName || "Unknown product",
        stockChange: `${log.previousStock} → ${log.newStock}`,
        quantity,
        price,
        totalPrice
      });
    }

    renderTable(currentLogs);
    salesSummary.innerHTML = `
      Total Sales for the Day: <span>₱${dailyTotal.toFixed(2)}</span>
    `;
  } catch (err) {
    console.error("Error loading sales report:", err);
    salesBody.innerHTML = `<tr><td colspan="7" class="no-data">Failed to load sales report.</td></tr>`;
  }
}

function renderTable(logs) {
  salesBody.innerHTML = "";
  logs.forEach((log) => {
    const row = `
      <tr>
        <td>${log.productName}</td>
        <td>${log.stockChange}</td>
        <td>${log.quantity}</td>
        <td>₱${log.price.toFixed(2)}</td>
        <td>₱${log.totalPrice.toFixed(2)}</td>
      </tr>
    `;
    salesBody.insertAdjacentHTML("beforeend", row);
  });
}

// Sorting feature
let sortDirection = {};
document.querySelectorAll("#sales-table th.sortable").forEach((th) => {
  th.addEventListener("click", () => {
    const key = th.dataset.key;
    sortDirection[key] = !sortDirection[key];
    const direction = sortDirection[key] ? 1 : -1;

    currentLogs.sort((a, b) => {
      if (typeof a[key] === "string") {
        return a[key].localeCompare(b[key]) * direction;
      } else {
        return (a[key] - b[key]) * direction;
      }
    });

    renderTable(currentLogs);
  });
});

loadButton.addEventListener("click", () => {
  const selectedDate = reportDateInput.value;
  if (!selectedDate) {
    alert("Please select a date first.");
    return;
  }
  salesBody.innerHTML = `<tr><td colspan="7" class="no-data">Loading...</td></tr>`;
  loadLogs(selectedDate);
});

onAuthStateChanged(auth, async (user) => {
  if (!user) {
    alert("You must be logged in.");
    window.location.href = "index.html";
    return;
  }

  const usersSnapshot = await getDocs(collection(db, "users"));
  const currentUser = usersSnapshot.docs.find((d) => d.id === user.uid)?.data();

  if (!currentUser || currentUser.role !== "admin") {
    alert("You are not authorized to access this page.");
    window.location.href = "index.html";
    return;
  }

  loadLogs(today);
});
