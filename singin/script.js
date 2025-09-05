const toDoLogInBtn = document.querySelector("#log-in-btn");

toDoLogInBtn.addEventListener("click", () => {
  const username = document.querySelector("#username").value;
  const password = document.querySelector("#password").value;
  const errorMsg = document.querySelector("#errorMsg");

  const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

  if (!emailPattern.test(username)) {
    errorMsg.textContent = "User name must be a valid email.";
    return;
  }

  if (password.length > 6) {
    errorMsg.textContent = "Password must be up to 6 characters.";
    return;
  }

  errorMsg.textContent = "Login succesful!";
});