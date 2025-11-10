//Amit-Berger-207800681-Neetai-Nezer-El-322921594

document.addEventListener("click", (e) => {
  const btn = e.target.closest("#logoutBtn");
  if (!btn) return;
  e.preventDefault();
  // call server logout to destroy session
  fetch('/logout', { method: 'POST', credentials: 'same-origin' })
    .then(() => {
      localStorage.clear();
      window.location.href = '/signin';
    })
    .catch(() => { localStorage.clear(); window.location.href = '/signin'; });
});

// Switch profile button: navigate to profile selection page
document.addEventListener("click", (e) => {
  const btn = e.target.closest("#switchProfileBtn");
  if (!btn) return;
  e.preventDefault();
  // Clear only current profile selection so user is forced to pick again.
  localStorage.removeItem('selectedProfileId');
  localStorage.removeItem('selectedProfileName');
  // Correct destination: server mounts profile page at /profile
  window.location.href = '/profile';
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

  // fetch current user info and show in navbar
  fetch('/api/me', { credentials: 'same-origin' })
    .then(r => r.json())
    .then(data => {
      if (data && data.loggedIn) {
        const el = document.getElementById('userEmail');
        if (el) el.textContent = data.email || '';
      }
    }).catch(() => {});
});
