//Amit-Berger-207800681-Neetai-Nezer-El-322921594

document.addEventListener("click", (e) => {
  const btn = e.target.closest("#logoutBtn");
  if (!btn) return;
  e.preventDefault();
  localStorage.clear();
  window.location.href = "/";
});

