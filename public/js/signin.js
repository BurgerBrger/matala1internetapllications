//Amit-Berger-207800681-Neetai-Nezer-El-322921594
const btn = document.querySelector("#log-in-btn");
const email = document.querySelector("#username");
const password  = document.querySelector("#password");
const btnLabel = btn.querySelector(".btn-label");

const grpEmail = document.getElementById("grp-username");
const grpPassword  = document.getElementById("grp-password");

function setFieldError(group, msg) {
  group.classList.add("error");
  group.querySelector(".error-text").textContent = msg;
}

function clearFieldError(group) {
  group.classList.remove("error");
  group.querySelector(".error-text").textContent = "";
}

function validateEmail() {
  const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (!emailPattern.test(email.value)) {
     setFieldError(grpEmail, "Please enter a valid email address");
  }
  else 
    clearFieldError(grpEmail);
  const check = emailPattern.test(email.value);
  return check; 
}

function validatePassword() {
  if (password.value.length < 6) {
    setFieldError(grpPassword, "Your password must be at least 6 characters");}
  else     
    clearFieldError(grpPassword);
  const check = password.value.length >= 6;
  return check; 
}

function showSuccess() {
  btn.classList.add("success");
  btn.disabled = true;
  if (btnLabel) btnLabel.textContent = "Login successful";
}

btn.addEventListener("click", () => {
  const okEmail = validateEmail();
  const okPass  = validatePassword();

  if (!okEmail || !okPass) return;

  showSuccess();

  localStorage.setItem("login-user", email.value);
  // submit the form to the server for real authentication
  const form = document.getElementById('loginForm');
  if (form) form.submit();
});