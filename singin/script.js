
document.getElementById("loginForm").addEventListener("submit", function(event) {
      event.preventDefault(); // עוצר שליחה אוטומטית של הטופס

      const username = document.getElementById("username").value;
      const password = document.getElementById("password").value;
      const errorMsg = document.getElementById("errorMsg");

      // בדיקת אימייל
      const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

      if (!emailPattern.test(username)) {
        errorMsg.textContent = "User name must be a valid email.";
        return;
      }

      // בדיקת סיסמה – עד 6 תווים
      if (password.length > 6) {
        errorMsg.textContent = "Password must be up to 6 characters.";
        return;
      }

      // אם הכול תקין
      errorMsg.textContent = "";
      alert("Login successful!");
    });