document.getElementById("logoutBtn").addEventListener("click", () => {  
  localStorage.clear();
    window.location.href = "../singin/singin.html";
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

  