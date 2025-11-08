// public/js/feed.js  -- no imports, fetch from API

// Selected profile (saved by profile page)
function getSelectedProfileId() {
  return Number(localStorage.getItem("selectedProfileId") || 0);
}

// --- Like state persisted in localStorage ---
const likedSet = new Set(JSON.parse(localStorage.getItem("likedIds") || "[]"));
function saveLikes() {
  localStorage.setItem("likedIds", JSON.stringify([...likedSet]));
}

// --- Genre stats (for recommendations) stored per profile ---
function genreStatsStorageKey() {
  const pid = getSelectedProfileId();
  return pid ? `genreStats:${pid}` : null;
}
function loadGenreStats() {
  const key = genreStatsStorageKey();
  if (!key) return {};
  try {
    return JSON.parse(localStorage.getItem(key) || "{}");
  } catch {
    return {};
  }
}
function saveGenreStats(stats) {
  const key = genreStatsStorageKey();
  if (!key) return;
  localStorage.setItem(key, JSON.stringify(stats));
}
function bumpLikedGenres(genres, delta) {
  const key = genreStatsStorageKey();
  if (!key || !Array.isArray(genres) || !genres.length) return;
  const stats = loadGenreStats();
  genres.forEach(g => {
    if (!stats[g]) stats[g] = { watched: 0, liked: 0 };
    stats[g].liked = (stats[g].liked || 0) + delta;
    if (stats[g].liked < 0) stats[g].liked = 0;
  });
  saveGenreStats(stats);
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

function setHero(content) {
  // image
  const topImg = document.getElementById("topContentImg");
  if (topImg) {
    topImg.src = content.wideimage || content.image;
    topImg.alt = content.name;
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
  const topTitle = document.getElementById("topContentTitle");
  if (topTitle) {
    topTitle.textContent = `${content.name} (${content.year})`;
  }
}

// ----- Render grid -----
function cardHTML(m) {
  return `
    <div class="card" data-id="${m.id}">
      <div class="card-media">
        <img class="card__img" src="${m.image}" alt="${m.name}">
        ${(() => {
          // show rating even if it's 0 (0 is a valid grade)
          const rating = (m.tmdb && (m.tmdb.rating !== undefined ? m.tmdb.rating : null)) ?? (m.tmdbRating !== undefined ? m.tmdbRating : null);
          return rating !== null && rating !== undefined ? `<span class="rating-badge">${Number(rating).toFixed(1)}</span>` : '';
        })()}
      </div>
      <div class="card-overlay">
        <div class="overlay-actions">
          <button class="like-btn" data-id="${m.id}">
            <i class="bi bi-heart heart-outline"></i>
            <i class="bi bi-heart-fill heart-fill"></i>
          </button>
          <span class="like-count">${likesOf(m)}</span>
        </div>
        <div class="movie-year">${m.year}</div>
      </div>
      <h1 class="content-title">${m.name}</h1>
      <div class="content-genres">${(m.genre||[]).join(" · ").toLowerCase()}</div>
    </div>`;
}

function renderList(content) {
  const root = document.getElementById("feedContainer");
  if (!root) return;
  root.innerHTML = content.map(cardHTML).join("");

  // NEW: mark already-liked buttons
  for (const btn of root.querySelectorAll(".like-btn")) {
    const id = btn.dataset.id;
    if (likedSet.has(String(id))) btn.classList.add("liked");
  }
}

// ----- Events -----
document.addEventListener("click", async (e) => {
  const btn = e.target.closest(".like-btn");
  if (!btn) return;

  const id = Number(btn.dataset.id);
  const pid = getSelectedProfileId();
  if (!pid) {
    alert("Select a profile first.");
    return;
  }
  const countEl = btn.parentElement.querySelector(".like-count");
  const isNowLiked = !btn.classList.contains("liked");

  // find genres of this title so we can keep per-profile stats
  const fullList = window.__ALL_CONTENT__ || [];
  const contentItem = fullList.find(m => Number(m.id) === id);
  const genres = contentItem && Array.isArray(contentItem.genre) ? contentItem.genre : [];


  try {
    const endpoint = isNowLiked ? "like" : "unlike";
    const res = await fetch(`/api/content/${id}/${endpoint}`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ profileId: pid })
    });
    if (!res.ok) throw new Error(`${endpoint} failed`);
    const data = await res.json(); // { id, numberOfLikes, liked }

    // Update UI from server truth
    btn.classList.toggle("liked", data.liked);
    if (countEl) countEl.textContent = data.numberOfLikes;

    // keep the local set in sync for render/search/sort redraws
    if (data.liked) likedSet.add(String(id));
    else likedSet.delete(String(id));

    // update genre stats (liked counter)
    if (genres.length) {
      bumpLikedGenres(genres, data.liked ? +1 : -1);
    }
    } catch (err) {
    console.error("like/unlike failed", err);
  }
});

document.addEventListener("keyup", (e) => {
  if (e.target && e.target.id === "searchInput") {
    const q = e.target.value.toLowerCase();
    const filtered = window.__ALL_CONTENT__.filter(m => m.name.toLowerCase().includes(q));
    renderList(filtered);
  }
});

function attachSort(content) {
  const btn = document.getElementById("sortBtn");
  if (!btn) return;
  let asc = true;
  btn.addEventListener("click", () => {
    const sorted = [...content].sort((a, b) =>
      asc ? a.name.localeCompare(b.name) : b.name.localeCompare(a.name)
    );
    asc = !asc;
    btn.textContent = asc ? "Sort A–Z" : "Sort Z–A";
    renderList(sorted);
  });
}

function ratingValue(m) {
  // Prefer object path m.tmdb.rating, then m.tmdbRating, then numeric m.rating
  const r = (m && m.tmdb && (m.tmdb.rating !== undefined ? m.tmdb.rating : null)) ?? (m && m.tmdbRating !== undefined ? m.tmdbRating : (m && m.rating !== undefined ? m.rating : null));
  const n = Number(r);
  // if not a valid number, return -Infinity so ungraded items fall to the end when sorting desc
  return Number.isFinite(n) ? n : -Infinity;
}

function attachSortByGrade(content) {
  const btn = document.getElementById('sortByGradeBtn');
  if (!btn) return;
  // start with descending (highest first)
  let desc = true;
  btn.addEventListener('click', () => {
    const sorted = [...content].sort((a, b) => {
      const ra = ratingValue(a);
      const rb = ratingValue(b);
      // compare numbers; for equal ratings fall back to name
      if (ra === rb) return a.name.localeCompare(b.name);
      return desc ? (rb - ra) : (ra - rb);
    });
    desc = !desc;
    btn.textContent = desc ? 'Sort by grade ↓' : 'Sort by grade ↑';
    renderList(sorted);
  });
}


document.addEventListener("DOMContentLoaded", async () => {
  try {
    const hero = await fetchJSON("/api/content/random");
    setHero(hero);

    const all = await fetchJSON("/api/content");
    window.__ALL_CONTENT__ = all;

    // NEW: get profile liked ids
    const pid = getSelectedProfileId();
    let likedIds = [];
    if (pid) {
      const prof = await fetchJSON(`/api/profiles/${pid}`);
      likedIds = Array.isArray(prof.liked) ? prof.liked.map(String) : [];
    }
    // set the likedSet from the server
    likedSet.clear();
    likedIds.forEach(id => likedSet.add(String(id)));

    renderList(all);
    attachSort(all);
  attachSortByGrade(all);
    // populate ratings asynchronously for visible cards (no DB writes)
    populateRatings();
  } catch (err) {
    console.error("Feed init failed:", err);
  }
});

// fetch rating for each visible card and inject a badge if found
async function populateRatings() {
  try {
    const root = document.getElementById('feedContainer');
    if (!root) return;
    const cards = Array.from(root.querySelectorAll('.card'));
    const ids = cards.map(c => Number(c.dataset.id)).filter(n => !Number.isNaN(n));
    if (!ids.length) return;
    try {
      const bulk = await fetch('/api/tmdb/contents', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ids })
      });
      if (!bulk.ok) throw new Error('bulk rating fetch failed');
      const data = await bulk.json();
      const results = data.results || {};
      for (const card of cards) {
        const id = String(card.dataset.id);
        const info = results[id] || results[Number(id)] || null;
        const rating = info?.rating ?? (info?.tmdbRating ?? null);
        if (rating !== null && rating !== undefined) {
          const media = card.querySelector('.card-media');
          if (media && !media.querySelector('.rating-badge')) {
            const span = document.createElement('span');
            span.className = 'rating-badge';
            span.textContent = Number(rating).toFixed(1);
            media.appendChild(span);
          }
        }
      }
    } catch (e) {
      // fallback to per-item approach if bulk fails
      console.warn('bulk ratings failed, falling back to per-item', e);
      // previous per-item implementation
      const concurrency = 6;
      let i = 0;
      async function worker() {
        while (i < cards.length) {
          const idx = i++;
          const card = cards[idx];
          const id = card.dataset.id;
          try {
            const info = await fetchJSON(`/api/tmdb/content/${id}`);
            const rating = info?.rating ?? null;
            if (rating !== null && rating !== undefined) {
              const media = card.querySelector('.card-media');
              if (media && !media.querySelector('.rating-badge')) {
                const span = document.createElement('span');
                span.className = 'rating-badge';
                span.textContent = Number(rating).toFixed(1);
                media.appendChild(span);
              }
            }
          } catch (err) { /* ignore */ }
        }
      }
      await Promise.all(Array.from({ length: concurrency }, () => worker()));
    }
  } catch (e) { console.error('populateRatings failed', e); }
}



document.getElementById("feedContainer").addEventListener("click", (e) => {
  if (e.target.closest(".like-btn")) return;     // ignore heart
  const card = e.target.closest(".card");
  if (!card) return;
  const id = card.dataset.id;
  if (id) window.location.href = `/player/${id}`;
});
