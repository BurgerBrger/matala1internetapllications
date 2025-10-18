//Amit-Berger-207800681-Neetai-Nezer-El-322921594

document.addEventListener("click", (e) => {
  const btn = e.target.closest("#logoutBtn");
  if (!btn) return;
  e.preventDefault();
  localStorage.clear();
  window.location.href = "/";
});



document.addEventListener("DOMContentLoaded", () => {
const searchBtn = document.getElementById("searchBtn");
const searchInput = document.getElementById("searchInput");

  if (searchBtn && searchInput) {
    searchBtn.addEventListener("click", () => {
      const query = searchInput.value.toLowerCase();

      localStorage.setItem("searchQuery", query);

      window.location.href = "../feed/feed.html";
    });
  }
});
