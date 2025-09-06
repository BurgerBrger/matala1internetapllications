document.getElementById("logoutBtn").addEventListener("click", () => {
    // מנקה את נתוני ההתחברות
    localStorage.clear();

    // מחזיר למסך התחברות
    window.location.href = "../singin/singin.html";
  });