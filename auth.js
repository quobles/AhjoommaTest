    // Switch between login/register
    document.getElementById("show-register").addEventListener("click", function(e) {
      e.preventDefault();
      document.getElementById("login-form").classList.add("hidden");
      document.getElementById("register-form").classList.remove("hidden");
      document.getElementById("form-title").innerText = "Register";
    });

    document.getElementById("show-login").addEventListener("click", function(e) {
      e.preventDefault();
      document.getElementById("register-form").classList.add("hidden");
      document.getElementById("login-form").classList.remove("hidden");
      document.getElementById("form-title").innerText = "Login";
    });

    // Confirm password validation
    document.getElementById("register-form").addEventListener("submit", function(e) {
      var pw = this.querySelector('input[placeholder="Password"]').value;
      var confirmPw = this.querySelector('input[placeholder="Confirm Password"]').value;
      if (pw !== confirmPw) {
        e.preventDefault();
        alert("Passwords do not match!");
      }
    });

    document.addEventListener("DOMContentLoaded", function () {
  const termsLabel = document.getElementById("termsLabel");
  const termsCheckbox = document.getElementById("termsCheckbox");
  const termsModal = document.getElementById("termsModal");
  const closeBtn = termsModal.querySelector(".close");
  const acceptBtn = document.getElementById("acceptTermsBtn");
  const registerForm = document.getElementById("register-form");

  // Clicking the label opens modal
  termsLabel.addEventListener("click", function (e) {
    e.preventDefault();
    termsModal.style.display = "block";
  });

  termsCheckbox.addEventListener("click", function (e) {
    e.preventDefault();
    termsModal.style.display = "block";
  });

  // Accept button → check the box + close modal
  acceptBtn.addEventListener("click", function () {
    termsCheckbox.checked = true;
    termsModal.style.display = "none";
  });

  // Close modal → checkbox stays unchecked
  closeBtn.addEventListener("click", function () {
    termsCheckbox.checked = false;
    termsModal.style.display = "none";
  });

  // Close modal if clicked outside
  window.addEventListener("click", function (e) {
    if (e.target === termsModal) {
      termsCheckbox.checked = false;
      termsModal.style.display = "none";
    }
  });

  // Prevent registration without accepting terms
  registerForm.addEventListener("submit", function (e) {
    if (!termsCheckbox.checked) {
      e.preventDefault();
      alert("You must accept the Terms and Conditions to register.");
    }
  });
});

// Register
document.getElementById("register-form").addEventListener("submit", async function(e) {
  e.preventDefault();

  var email = this.querySelector('input[type="email"]').value;
  var password = this.querySelector('input[type="password"]').value;
  var firstName = this.querySelector('input[placeholder="First Name"]').value;
  var lastName = this.querySelector('input[placeholder="Last Name"]').value;

  try {
    const userCredential = await firebaseAuth.createUserWithEmailAndPassword(email, password);
    const user = userCredential.user;

    // Store extra user data in Firestore
    await setDoc(doc(firebaseDB, "users", user.uid), {
      firstName: firstName,
      lastName: lastName,
      email: email
    });

    alert("Registration successful!");
  } catch (error) {
    alert(error.message);
  }
});

// Login
document.getElementById("login-form").addEventListener("submit", async function(e) {
  e.preventDefault();

  var email = this.querySelector('input[type="email"]').value;
  var password = this.querySelector('input[type="password"]').value;

  try {
    const userCredential = await firebaseAuth.signInWithEmailAndPassword(email, password);
    const user = userCredential.user;
    alert("Welcome back, " + user.email);
  } catch (error) {
    alert(error.message);
  }
});
