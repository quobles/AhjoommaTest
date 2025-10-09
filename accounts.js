import { db, auth } from "./db.js";
import {
    collection,
    getDocs,
    setDoc,
    updateDoc,
    deleteDoc,
    doc,
} from "https://www.gstatic.com/firebasejs/12.2.1/firebase-firestore.js";
import {
    createUserWithEmailAndPassword,
    signInWithEmailAndPassword,
    onAuthStateChanged,
} from "https://www.gstatic.com/firebasejs/12.2.1/firebase-auth.js";

const userList = document.getElementById("user-list");
const createBtn = document.getElementById("create-user-btn");
let currentAdminEmail = null;

onAuthStateChanged(auth, async (user) => {
    if (!user) {
        alert("Please log in as admin.");
        window.location.href = "index.html";
        return;
    }

    currentAdminEmail = user.email;

    const usersRef = collection(db, "users");
    const snapshot = await getDocs(usersRef);
    let currentUserData = null;

    snapshot.forEach((docSnap) => {
        if (docSnap.data().email === user.email) {
            currentUserData = docSnap.data();
        }
    });

    if (!currentUserData || currentUserData.role !== "admin") {
        alert("Access denied. Admins only.");
        window.location.href = "index.html";
        return;
    }

    loadUsers();
});

async function loadUsers() {
    userList.innerHTML = "<tr><td colspan='6'>Loading...</td></tr>";

    const snapshot = await getDocs(collection(db, "users"));
    userList.innerHTML = "";

    snapshot.forEach((docSnap) => {
        const u = docSnap.data();
        const fullName = `${u.firstName || ""} ${u.lastName || ""}`.trim() || "(No name set)";
        const isSelf = u.email === currentAdminEmail;

        const row = document.createElement("tr");
        row.innerHTML = `
      <td>${fullName}</td>
      <td>${u.email}</td>
      <td>
        <select data-id="${docSnap.id}" ${isSelf ? "disabled" : ""}>
          <option value="user" ${u.role === "user" ? "selected" : ""}>User</option>
          <option value="admin" ${u.role === "admin" ? "selected" : ""}>Admin</option>
        </select>
      </td>
      <td>
        ${isSelf
                ? "<button disabled class='update-role disabled'>N/A</button>"
                : `<button class="update-role" data-id="${docSnap.id}">Update</button>`
            }
      </td>
      <td>
        ${isSelf
                ? "<button disabled class='delete-user disabled'>N/A</button>"
                : `<button class="delete-user" data-id="${docSnap.id}" data-email="${u.email}">Delete</button>`
            }
      </td>
    `;
        userList.appendChild(row);
    });

    attachRoleListeners();
    attachDeleteListeners();
}

function attachRoleListeners() {
    document.querySelectorAll(".update-role").forEach((btn) => {
        btn.addEventListener("click", async () => {
            const userId = btn.getAttribute("data-id");
            const newRole = btn.parentElement.parentElement.querySelector("select").value;

            const userRef = doc(db, "users", userId);
            await updateDoc(userRef, { role: newRole });
            alert("User role updated!");
        });
    });
}

function attachDeleteListeners() {
    document.querySelectorAll(".delete-user").forEach((btn) => {
        btn.addEventListener("click", async () => {
            const userId = btn.getAttribute("data-id");
            const email = btn.getAttribute("data-email");

            if (email === currentAdminEmail) {
                alert("You cannot delete your own account.");
                return;
            }

            if (!confirm(`Are you sure you want to delete ${email}? This cannot be undone.`)) return;

            try {
                const userRef = doc(db, "users", userId);
                await deleteDoc(userRef);
                alert(`User ${email} deleted successfully.`);
                loadUsers();
            } catch (err) {
                console.error("Error deleting user:", err);
                alert("Failed to delete user: " + err.message);
            }
        });
    });
}

createBtn.addEventListener("click", async () => {
    const firstName = document.getElementById("new-firstname").value.trim();
    const lastName = document.getElementById("new-lastname").value.trim();
    const email = document.getElementById("new-email").value.trim();
    const password = document.getElementById("new-password").value.trim();
    const role = document.getElementById("new-role").value;

    if (!firstName || !lastName || !email || !password) {
        alert("Please fill out all fields.");
        return;
    }

    try {
        const adminEmail = auth.currentUser.email;
        const adminPassword = prompt("Please re-enter your admin password to continue:");

        if (!adminPassword) {
            alert("Admin password is required.");
            return;
        }

        const newUser = await createUserWithEmailAndPassword(auth, email, password);

        await setDoc(doc(db, "users", newUser.user.uid), {
            firstName,
            lastName,
            email,
            role,
            createdAt: new Date(),
        });

        alert("User created successfully!");

        await signInWithEmailAndPassword(auth, adminEmail, adminPassword);

        // Load the user list
        loadUsers();

    } catch (error) {
        console.error("Error creating user:", error);
        alert("Failed to create user. " + error.message);
    }
});

// 🔍 Search functionality for Users
const userSearch = document.getElementById("user-search");
userSearch.addEventListener("input", () => {
  const query = userSearch.value.toLowerCase();
  document.querySelectorAll("#user-list tr").forEach(row => {
    const name = row.querySelector("td:nth-child(1)")?.textContent.toLowerCase() || "";
    const email = row.querySelector("td:nth-child(2)")?.textContent.toLowerCase() || "";
    row.style.display = (name.includes(query) || email.includes(query)) ? "" : "none";
  });
});

