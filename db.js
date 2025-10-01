import { initializeApp } from "https://www.gstatic.com/firebasejs/12.2.1/firebase-app.js";
import { getAuth } from "https://www.gstatic.com/firebasejs/12.2.1/firebase-auth.js";
import { getFirestore } from "https://www.gstatic.com/firebasejs/12.2.1/firebase-firestore.js";

// Firebase Config
const firebaseConfig = {
  apiKey: "AIzaSyA5uPZtGvRC1VaqINKcVAWUWC9VyA1-b_s",
  authDomain: "ahjoommakmart.firebaseapp.com",
  projectId: "ahjoommakmart",
  storageBucket: "ahjoommakmart.appspot.com",
  messagingSenderId: "1098456404389",
  appId: "1:1098456404389:web:7b057cc99258e122bf584c",
  measurementId: "G-DNLHP8DS8Y"
};

// init Firebase
const app = initializeApp(firebaseConfig);
const auth = getAuth(app);

const db = getFirestore(app);

export { auth, db };
