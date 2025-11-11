// Amit-Berger-207800681-Neetai-Nezer-El-322921594
const form     = document.getElementById("loginForm");
const btn      = document.querySelector("#log-in-btn");
const email    = document.querySelector("#username");
const password = document.querySelector("#password");
const btnLabel = btn ? btn.querySelector(".btn-label") : null;

const grpEmail    = document.getElementById("grp-username");
const grpPassword = document.getElementById("grp-password");

function setFieldError(group, msg) {
  if (!group) return;
  group.classList.add("error");
  const el = group.querySelector(".error-text");
  if (el) el.textContent = msg;
}

function clearFieldError(group) {
  if (!group) return;
  group.classList.remove("error");
  const el = group.querySelector(".error-text");
  if (el) el.textContent = "";
}

function validateEmail() {
  const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  const ok = emailPattern.test(email.value);
  if (!ok) setFieldError(grpEmail, "Please enter a valid email address");
  else     clearFieldError(grpEmail);
  return ok;
}

function validatePassword() {
  const ok = (password.value || "").length >= 6;
  if (!ok) setFieldError(grpPassword, "Your password must be at least 6 characters");
  else     clearFieldError(grpPassword);
  return ok;
}

function setLoading(isLoading) {
  if (!btn) return;
  if (isLoading) {
    btn.classList.add("success");   // just means "loading" now
    btn.disabled = true;
    if (btnLabel) btnLabel.textContent = "Logging in...";
  } else {
    btn.classList.remove("success");
    btn.disabled = false;
    if (btnLabel) btnLabel.textContent = "Log In";
  }
}

// Ensure initial state
setLoading(false);

// Handle BOTH click and Enter (form submit)
if (form) {
  form.addEventListener("submit", (event) => {
    const okEmail = validateEmail();
    const okPass  = validatePassword();

    // if validation fails, stop the submit & don't show loading
    if (!okEmail || !okPass) {
      event.preventDefault();
      setLoading(false);
      return;
    }

    // validation passed -> show loading while request is sent
    setLoading(true);
    localStorage.setItem("login-user", email.value);
    // allow normal submit to continue
  });
}
