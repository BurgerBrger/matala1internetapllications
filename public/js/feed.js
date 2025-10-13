// public/js/feed.js  -- no imports, fetch from API

// --- Like state persisted in localStorage ---
const likedSet = new Set(JSON.parse(localStorage.getItem("likedIds") || "[]"));
function saveLikes() {
  localStorage.setItem("likedIds", JSON.stringify([...likedSet]));
}

// ----- Helpers -----
async function fetchJSON(url) {
  const res = await fetch(url);
  if (!res.ok) throw new Error(`${url} -> ${res.status}`);
  return res.json();
}

// Normalize field names (numberoflikes vs numberOfLikes)
function likesOf(m) {
  return Number(m.numberoflikes ?? m.numberOfLikes ?? 0);
}
function setLikes(m, n) {
  if ("numberoflikes" in m) m.numberoflikes = n;
  else m.numberOfLikes = n;
}

// ----- Render hero -----

function setHero(movie) {
  // image
  const topImg = document.getElementById("topMovieImg");
  if (topImg) {
    topImg.src = movie.wideimage || movie.image;
    topImg.alt = movie.name;
  }

  // welcome line
  const welcomeMsg = document.getElementById("welcomeMsg");
  const profileName = localStorage.getItem("selectedProfileName") || "guest";
  if (welcomeMsg) {
    welcomeMsg.textContent = `Good day, ${profileName}`;
  }

  // small “suggested” line (optional)
  const suggestedLine = document.getElementById("suggestedLine");
  if (suggestedLine) {
    suggestedLine.textContent = "We think you’ll like:";
  }

  // title
  const topTitle = document.getElementById("topMovieTitle");
  if (topTitle) {
    topTitle.textContent = `${movie.name} (${movie.year})`;
  }
}

// ----- Render grid -----
function cardHTML(m) {
  const isLiked = likedSet.has(String(m.id));
  const genres = Array.isArray(m.genre) ? m.genre.join(" · ").toLowerCase() : "";
  return `
    <div class="card">
      <div class="card-media">
        <img src="${m.image}" alt="${m.name}">
      </div>
      <div class="card-overlay">
        <div class="overlay-actions">
          <button class="like-btn ${isLiked ? "liked" : ""}" data-id="${m.id}">
            <i class="bi bi-heart heart-outline"></i>
            <i class="bi bi-heart-fill heart-fill"></i>
          </button>
          <span class="like-count">${likesOf(m)}</span>
        </div>
        <div class="movie-year">${m.year}</div>
      </div>
      <h1 class="movie-title">${m.name}</h1>
      <div class="movie-genres">${genres}</div>
    </div>
  `;
}

function renderList(movies) {
  const root = document.getElementById("feedContainer");
  if (!root) return;
  root.innerHTML = movies.map(cardHTML).join("");
}

// ----- Events -----
document.addEventListener("click", (e) => {
  const btn = e.target.closest(".like-btn");
  if (!btn) return;

  const id = String(btn.dataset.id);
  const countEl = btn.parentElement.querySelector(".like-count");
  const isNowLiked = !btn.classList.contains("liked");

  btn.classList.toggle("liked", isNowLiked);
  if (isNowLiked) likedSet.add(id);
  else likedSet.delete(id);

  // Update number visually (we don’t post to API here)
  const n = Math.max(0, Number(countEl.textContent || 0) + (isNowLiked ? 1 : -1));
  countEl.textContent = n;

  saveLikes();
});

document.addEventListener("keyup", (e) => {
  if (e.target && e.target.id === "searchInput") {
    const q = e.target.value.toLowerCase();
    const filtered = window.__ALL_MOVIES__.filter(m => m.name.toLowerCase().includes(q));
    renderList(filtered);
  }
});

function attachSort(movies) {
  const btn = document.getElementById("sortBtn");
  if (!btn) return;
  let asc = true;
  btn.addEventListener("click", () => {
    const sorted = [...movies].sort((a, b) =>
      asc ? a.name.localeCompare(b.name) : b.name.localeCompare(a.name)
    );
    asc = !asc;
    btn.textContent = asc ? "Sort A–Z" : "Sort Z–A";
    renderList(sorted);
  });
}

// ----- Init -----
document.addEventListener("DOMContentLoaded", async () => {
  try {
    const hero = await fetchJSON("/api/movies/random");
    setHero(hero);

    const all = await fetchJSON("/api/movies");
    window.__ALL_MOVIES__ = all;   // for search/sort
    renderList(all);
    attachSort(all);
  } catch (err) {
    console.error("Feed init failed:", err);
  }
});
