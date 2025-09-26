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
