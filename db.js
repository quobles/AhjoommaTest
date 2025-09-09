  // Import the functions you need from the SDKs you need
  import { initializeApp } from "https://www.gstatic.com/firebasejs/12.2.1/firebase-app.js";
  import { getAnalytics } from "https://www.gstatic.com/firebasejs/12.2.1/firebase-analytics.js";
  import { initializeApp } from "firebase/app";
  import { getAuth } from "firebase/auth";
  // TODO: Add SDKs for Firebase products that you want to use
  // https://firebase.google.com/docs/web/setup#available-libraries

  // Your web app's Firebase configuration
  // For Firebase JS SDK v7.20.0 and later, measurementId is optional
  const firebaseConfig = {
    apiKey: "AIzaSyA5uPZtGvRC1VaqINKcVAWUWC9VyA1-b_s",
    authDomain: "ahjoommakmart.firebaseapp.com",
    projectId: "ahjoommakmart",
    storageBucket: "ahjoommakmart.firebasestorage.app",
    messagingSenderId: "1098456404389",
    appId: "1:1098456404389:web:7b057cc99258e122bf584c",
    measurementId: "G-DNLHP8DS8Y"
  };

  // Initialize Firebase
  const app = initializeApp(firebaseConfig);
  const analytics = getAnalytics(app);


const loginEmail = document.getElementById('loginEmail').value;
const loginPassword = document.getElementById('loginPassword').value;
const btnLogin = document.getElementById('btnLogin');

const btnRegister = document.getElementById('btnRegister');

btnLogin.addEventListener("click", function(event) {
  event.preventDefault();
  const regFirstName = document.getElementById('regFirstName').value;
  const regLastName = document.getElementById('regLastName').value;
  const regEmail = document.getElementById('regEmail').value;
  const regPassword = document.getElementById('regPassword').value;
  const regConfirmPassword = document.getElementById('regConfirmPassword').value;

  if (regPassword == regConfirmPassword) {
    let regPass = regConfirmPassword;
  }
  else {
    alert("Password do not match.")
  }

  createUserWithEmailAndPassword(auth, regEmail, regPass)
  .then((userCredential) => {
    // Signed up
    const user = userCredential.user;
    // ...
  })
  .catch((error) => {
    const errorCode = error.code;
    const errorMessage = error.message;
    // ..
  });

})
