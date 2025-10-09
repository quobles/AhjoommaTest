import { db } from "./db.js";
import {
  collection,
  addDoc,
  getDocs,
  query,
  orderBy,
  limit,
  where
} from "https://www.gstatic.com/firebasejs/12.2.1/firebase-firestore.js";

const feedbackForm = document.querySelector(".feedback-form form");
const reviewCards = document.querySelector(".review-cards");

// ✅ Load 3 latest feedbacks
async function loadFeedbacks() {
  reviewCards.innerHTML = "<p>Loading feedbacks...</p>";

  const q = query(collection(db, "feedbacks"), orderBy("timestamp", "desc"), limit(3));
  const snapshot = await getDocs(q);

  if (snapshot.empty) {
    reviewCards.innerHTML = "<p>No feedback yet. Be the first to share your thoughts!</p>";
    return;
  }

  reviewCards.innerHTML = "";

  snapshot.forEach((doc) => {
    const feedback = doc.data();

    const div = document.createElement("div");
    div.classList.add("review-card");
    div.innerHTML = `
      <h3>${feedback.name || "Anonymous"}</h3>
      <p>"${feedback.message}"</p>
    `;
    reviewCards.appendChild(div);
  });
}

// ✅ Handle form submission
feedbackForm.addEventListener("submit", async (e) => {
  e.preventDefault();

  const name = feedbackForm.querySelector('input[type="text"]').value.trim();
  const email = feedbackForm.querySelector('input[type="email"]').value.trim();
  const message = feedbackForm.querySelector("textarea").value.trim();

  if (!message) {
    alert("Please enter your feedback before submitting.");
    return;
  }

  try {
    // ✅ 1. Save feedback to Firestore
    await addDoc(collection(db, "feedbacks"), {
      name,
      email,
      message,
      timestamp: new Date(),
    });

    // ✅ 2. Get all admin users
    const adminQuery = query(collection(db, "users"), where("role", "==", "admin"));
    const adminSnap = await getDocs(adminQuery);

    if (!adminSnap.empty) {
      // ✅ 3. Send an email to each admin
      for (const adminDoc of adminSnap.docs) {
        const adminData = adminDoc.data();
        if (!adminData.email) continue;

        await addDoc(collection(db, "mail"), {
          to: [adminData.email],
          message: {
            subject: "📝 New Feedback Submitted",
            text: `A new feedback has been submitted.\n\nFrom: ${name || "Anonymous"}\nEmail: ${email || "N/A"}\n\nMessage:\n${message}`,
            html: `
              <h2>New Feedback Received</h2>
              <p><strong>From:</strong> ${name || "Anonymous"}</p>
              <p><strong>Email:</strong> ${email || "N/A"}</p>
              <p><strong>Message:</strong></p>
              <p>${message}</p>
            `
          }
        });
      }
    }

    alert("Thank you for your feedback!");
    feedbackForm.reset();
    loadFeedbacks();
  } catch (error) {
    console.error("Error submitting feedback:", error);
    alert("Error submitting feedback. Please try again later.");
  }
});

// Load feedbacks on page load
loadFeedbacks();
