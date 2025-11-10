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

let watchStateById = {};

// --- active filters + sort state ---
const activeStatusFilters = new Set();   // "watching", "watched"
let activeGenreFilters = new Set();

let currentSortMode = null;             // "alpha" | "grade" | null
let currentSortAsc = true;              // for alpha sort
let currentSortGradeDesc = true;        // for grade sort


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
  // compute rating HTML
  const ratingHtml = (() => {
    const rating =
      (m.tmdb && (m.tmdb.rating !== undefined ? m.tmdb.rating : null)) ??
      (m.tmdbRating !== undefined ? m.tmdbRating : null);
    return rating !== null && rating !== undefined
      ? `<span class="rating-badge">${Number(rating).toFixed(1)}</span>`
      : "";
  })();

  // compute watch state badge HTML
  const state = watchStateById[Number(m.id)];
  const watchHtml =
    state === "watched"
      ? `<span class="watch-status-badge watched">watched</span>`
      : state === "watching"
      ? `<span class="watch-status-badge watching">watching</span>`
      : "";

  return `
    <div class="card" data-id="${m.id}">
      <div class="card-media">
        <img class="card__img" src="${m.image}" alt="${m.name}">
        <div class="rating-wrap">
          ${watchHtml}
          ${ratingHtml}
        </div>
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
      <div class="content-genres">${(m.genre || []).join(" · ").toLowerCase()}</div>
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
// build genre checkbox grid inside the dropdown
function buildGenreFilterOptions(allContent) {
  const grid = document.getElementById("genreFilterGrid");
  if (!grid) return;

  const genresSet = new Set();
  allContent.forEach(m => {
    (m.genre || []).forEach(g => genresSet.add(g));
  });

  const genres = Array.from(genresSet).sort((a, b) => a.localeCompare(b));

  grid.innerHTML = "";
  genres.forEach(g => {
    const btn = document.createElement("button");
    btn.type = "button";
    btn.className = "genre-option";
    btn.dataset.genre = g;
    btn.textContent = g;

    // reflect current filters
    if (activeGenreFilters.has(g)) {
      btn.classList.add("active");
    }

    grid.appendChild(btn);
  });
}



function getFilteredAndSortedContent() {
  const all = window.__ALL_CONTENT__ || [];

  // current search query
  const searchInput = document.getElementById("searchInput");
  const q = searchInput ? searchInput.value.toLowerCase() : "";

  let list = all.filter(m => {
    // search
    if (q && !m.name.toLowerCase().includes(q)) return false;

    // genre filter: at least one selected genre must match
    if (activeGenreFilters.size) {
      const genres = Array.isArray(m.genre) ? m.genre : [];
      const hasMatch = genres.some(g => activeGenreFilters.has(g));
      if (!hasMatch) return false;
    }

    // watching status filter
    if (activeStatusFilters.size) {
      const rawState = watchStateById[Number(m.id)];
      const state = rawState || "unwatched";   // derive "unwatched"
    if (!activeStatusFilters.has(state)) return false;
    }

    return true;
  });

  // sorting
  if (currentSortMode === "alpha") {
    list.sort((a, b) =>
      currentSortAsc
        ? a.name.localeCompare(b.name)
        : b.name.localeCompare(a.name)
    );
  } else if (currentSortMode === "grade") {
    list.sort((a, b) => {
      const ra = ratingValue(a);
      const rb = ratingValue(b);
      if (ra === rb) return a.name.localeCompare(b.name);
      return currentSortGradeDesc ? (rb - ra) : (ra - rb);
    });
  }

  return list;
}


// genre filter dropdown: open/close/apply/clear/cancel
// genre filter dropdown: open/close/apply/clear/cancel
document.addEventListener("click", (e) => {
  const panel = document.getElementById("genreFilterPanel");
  const grid  = document.getElementById("genreFilterGrid");

  // toggle open
  const toggleBtn = e.target.closest("#genreFilterToggle");
  if (toggleBtn) {
    if (panel && grid) {
      // sync pills with current activeGenreFilters
      grid.querySelectorAll(".genre-option").forEach(btn => {
        const g = btn.dataset.genre;
        btn.classList.toggle("active", activeGenreFilters.has(g));
      });
    }
    if (panel) panel.classList.toggle("open");
    return;
  }

  // click on a genre pill inside the panel (toggle visual only)
  const genreBtn = e.target.closest(".genre-option");
  if (genreBtn && grid && panel && panel.classList.contains("open")) {
    genreBtn.classList.toggle("active");
    return;
  }

  // Apply
  const applyBtn = e.target.closest("#genreApplyBtn");
  if (applyBtn) {
    if (grid) {
      const selected = [];
      grid.querySelectorAll(".genre-option.active").forEach(btn => {
        const g = btn.dataset.genre;
        if (g) selected.push(g);
      });
      activeGenreFilters = new Set(selected);
    }
    if (panel) panel.classList.remove("open");
    applyFiltersAndRender();
    return;
  }

  // Clear
  const clearBtn = e.target.closest("#genreClearBtn");
  if (clearBtn) {
    activeGenreFilters = new Set();
    if (grid) {
      grid.querySelectorAll(".genre-option").forEach(btn => {
        btn.classList.remove("active");
      });
    }
    if (panel) panel.classList.remove("open");
    applyFiltersAndRender();
    return;
  }

  // Cancel
  const cancelBtn = e.target.closest("#genreCancelBtn");
  if (cancelBtn) {
    if (panel) panel.classList.remove("open");
    return;
  }

  // Click outside panel closes it
  if (panel && panel.classList.contains("open")) {
    const insidePanel = panel.contains(e.target);
    const clickedToggle = e.target.closest("#genreFilterToggle");
    if (!insidePanel && !clickedToggle) {
      panel.classList.remove("open");
    }
  }
});


function applyFiltersAndRender() {
  const list = getFilteredAndSortedContent();
  renderList(list);
}

document.addEventListener("input", (e) => {
  if (e.target && e.target.id === "searchInput") {
    applyFiltersAndRender();
  }
});


// ----- Events -----

// filter by watching status (multiple choice)
document.addEventListener("click", (e) => {
  const btn = e.target.closest(".filter-status");
  if (!btn) return;

  const value = btn.dataset.status;
  if (!value) return;

  if (activeStatusFilters.has(value)) {
    activeStatusFilters.delete(value);
    btn.classList.remove("active");
  } else {
    activeStatusFilters.add(value);
    btn.classList.add("active");
  }

  applyFiltersAndRender();
});

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
    const data = await res.json(); // shape depends on backend

    // Determine liked flag from response, fallback to optimistic value
    const likedFlag = data.liked ?? data.content?.liked ?? isNowLiked;

    // Try to get the new like count from the payload, otherwise compute it
    let newLikes =
      data.numberOfLikes ??
      data.content?.numberOfLikes ??
      data.content?.numberoflikes;

    if (!Number.isFinite(Number(newLikes)) && countEl) {
      const current = Number(countEl.textContent) || 0;
      newLikes = current + (likedFlag ? 1 : -1);
    }

    // Update UI
    btn.classList.toggle("liked", likedFlag);
    if (countEl && newLikes != null) {
      countEl.textContent = newLikes;
    }

    // keep the local set in sync for render/search/sort redraws
    if (likedFlag) likedSet.add(String(id));
    else likedSet.delete(String(id));


    // update genre stats (liked counter)
    if (genres.length) {
      bumpLikedGenres(genres, data.liked ? +1 : -1);
    }
    } catch (err) {
    console.error("like/unlike failed", err);
  }
});

document.addEventListener("click", (e) => {
  const btn = e.target.closest("#feedSearchBtn");
  if (btn) {
    applyFiltersAndRender();
  }
});

// quick reset button: clear search, filters and sorts
document.addEventListener("click", (e) => {
  const btn = e.target.closest("#resetFiltersBtn");
  if (!btn) return;

  // clear search
  const si = document.getElementById("searchInput");
  if (si) si.value = "";

  // clear genre & status filters
  activeGenreFilters = new Set();
  activeStatusFilters.clear();
  document.querySelectorAll('.filter-status').forEach(b => b.classList.remove('active'));
  document.querySelectorAll('.genre-option').forEach(b => b.classList.remove('active'));

  // close panel if open
  const panel = document.getElementById('genreFilterPanel');
  if (panel) panel.classList.remove('open');

  // reset sort modes
  currentSortMode = null;
  currentSortAsc = true;
  currentSortGradeDesc = true;
  const sortBtn = document.getElementById('sortBtn');
  if (sortBtn) sortBtn.textContent = 'Sort A–Z';
  const gradeBtn = document.getElementById('sortByGradeBtn');
  if (gradeBtn) gradeBtn.textContent = 'Sort by grade ↓';
  const popBtn = document.getElementById('popularBtn');
  if (popBtn) popBtn.classList.remove('active');

  applyFiltersAndRender();
});

function attachSort(_content) {
  const btn = document.getElementById("sortBtn");
  if (!btn) return;

  btn.addEventListener("click", () => {
    currentSortMode = "alpha";
    currentSortAsc = !currentSortAsc;
    btn.textContent = currentSortAsc ? "Sort A–Z" : "Sort Z–A";
    applyFiltersAndRender();
  });
}


function ratingValue(m) {
  // Prefer object path m.tmdb.rating, then m.tmdbRating, then numeric m.rating
  const r = (m && m.tmdb && (m.tmdb.rating !== undefined ? m.tmdb.rating : null)) ?? (m && m.tmdbRating !== undefined ? m.tmdbRating : (m && m.rating !== undefined ? m.rating : null));
  const n = Number(r);
  // if not a valid number, return -Infinity so ungraded items fall to the end when sorting desc
  return Number.isFinite(n) ? n : -Infinity;
}

function attachSortByGrade(_content) {
  const btn = document.getElementById('sortByGradeBtn');
  if (!btn) return;

  btn.addEventListener('click', () => {
    currentSortMode = "grade";
    currentSortGradeDesc = !currentSortGradeDesc;
    btn.textContent = currentSortGradeDesc ? 'Sort by grade ↓' : 'Sort by grade ↑';
    applyFiltersAndRender();
  });
}

function attachPopular(_content) {
  const btn = document.getElementById('popularBtn');
  if (!btn) return;

  // Modes cycle: 'top5' -> 'movies' -> 'all' -> back to 'top5'
  btn.dataset.mode = btn.dataset.mode || 'top5';

  btn.addEventListener('click', async () => {
    // On click, request grouped top-5 per type from server using aggregation
    // endpoint and render grouped sections. Subsequent clicks will cycle
    // through the same grouped view (keeps behavior predictable).
    try {
      btn.disabled = true;
      btn.classList.add('loading');
      const res = await fetch('/api/content?groupby=typeTop');
      if (!res.ok) throw new Error(`/api/content?groupby=typeTop -> ${res.status}`);
      const groups = await res.json();

      // groups is an array: [{ type: 'movie', items: [...] }, { type: 'tv', items: [...] }]
      renderGroupedPopular(groups);
      // set hero to the first available item from the first group
      const first = (groups[0] && groups[0].items && groups[0].items[0]) || null;
      if (first) setHero(first);
    } catch (err) {
      console.error('Popular group fetch failed', err);
    } finally {
      btn.disabled = false;
      btn.classList.remove('loading');
    }
  });
}

// Render grouped popular results: show a heading per type and cards for that type
function renderGroupedPopular(groups) {
  const root = document.getElementById('feedContainer');
  if (!root) return;
  // Accept two response shapes:
  // 1) grouped: [{ type: 'movie', items: [...] }, ...]
  // 2) flat list: [{ id, type, ... }, ...] -> group client-side
  let normalized = [];
  if (!Array.isArray(groups)) groups = [];
  // detect flat list (elements look like content docs: have id and type but no items)
  const looksLikeFlat = groups.length && groups.every(g => (g.id || g._id) && g.type && !g.items);
  if (looksLikeFlat) {
    const map = {};
    for (const doc of groups) {
      const t = (doc.type || 'unknown');
      if (!map[t]) map[t] = [];
      map[t].push(doc);
    }
    for (const t of Object.keys(map)) {
      normalized.push({ type: t, items: map[t].slice(0, 5) });
    }
  } else {
    // assume grouped shape or defensively map
    normalized = groups.map(g => ({ type: g.type || 'unknown', items: Array.isArray(g.items) ? g.items : [] }));
  }

  // produce HTML: for each normalized group, show a header and its cards
  const parts = [];
  for (const g of normalized) {
    const t = (g.type || 'unknown').toUpperCase();
    const items = Array.isArray(g.items) ? g.items : [];
    const cards = items.map(cardHTML).join('');
    parts.push(`<section class="popular-group"><h2 class="group-title">${t} (${items.length})</h2><div class="group-row">${cards}</div></section>`);
  }
  root.innerHTML = parts.join('');

  // restore liked-state on newly rendered buttons
  for (const btn of root.querySelectorAll('.like-btn')) {
    const id = btn.dataset.id;
    if (likedSet.has(String(id))) btn.classList.add('liked');
  }
}

document.addEventListener("DOMContentLoaded", async () => {
  try {
    const hero = await fetchJSON("/api/content/random");
    setHero(hero);

    const all = await fetchJSON("/api/content");
    window.__ALL_CONTENT__ = all;

    // ---- get profile + liked ids + watch state ----
    const pid = getSelectedProfileId();
    let likedIds = [];

    if (pid) {
      const prof = await fetchJSON(`/api/profiles/${pid}`);

      // liked content ids for this profile
      likedIds = Array.isArray(prof.liked) ? prof.liked.map(String) : [];

      // compute watch state map from profile
      watchStateById = {};
      const watchedSet   = new Set((prof.watched || []).map(Number));
      const progressRows = Array.isArray(prof.watchProgress) ? prof.watchProgress : [];

      // finished titles
      watchedSet.forEach(cid => {
        watchStateById[cid] = "watched";
      });

      // in-progress titles (position > 0 but not completed and not fully watched)
      progressRows.forEach(row => {
        const cid = Number(row.contentId);
        if (!cid) return;
        if (watchStateById[cid] === "watched") return; // finished beats watching
        if ((Number(row.position) || 0) > 0 && !row.completed) {
          watchStateById[cid] = "watching";
        }
      });
    } else {
      // no selected profile -> clear watch state
      watchStateById = {};
    }

    // set the likedSet from the server
    likedSet.clear();
    likedIds.forEach(id => likedSet.add(String(id)));

    // build genre options and render with current filters/sort
    buildGenreFilterOptions(all);

    applyFiltersAndRender();
  attachSort(all);
  attachSortByGrade(all);
  attachPopular(all);
  attachRecommendation(all);
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


function attachRecommendation(_content) {
  const btn = document.getElementById('recommendBtn');
  if (!btn) return;

  btn.addEventListener('click', () => {
    const pid = getSelectedProfileId();
    if (!pid) {
      alert('Select a profile to get recommendations');
      return;
    }

    // load stored genre stats (per-profile) and pick top genres
    const stats = loadGenreStats();
    const genreScores = Object.entries(stats || {}).map(([g, v]) => ({ genre: g, score: (v.liked || 0) + (v.watched || 0) }));
    genreScores.sort((a, b) => b.score - a.score);

    let preferredGenres = genreScores.slice(0, 3).map(x => x.genre);
    if (!preferredGenres.length) {
      // fallback: use most common genres from all content
      const all = window.__ALL_CONTENT__ || [];
      const freq = {};
      all.forEach(m => (m.genre || []).forEach(g => freq[g] = (freq[g] || 0) + 1));
      preferredGenres = Object.keys(freq).sort((a, b) => freq[b] - freq[a]).slice(0, 3);
    }

    // choose matching content and rank by likes then rating
    const all = window.__ALL_CONTENT__ || [];
    const candidates = all.filter(m => (m.genre || []).some(g => preferredGenres.includes(g)));
    candidates.sort((a, b) => {
      const la = likesOf(a), lb = likesOf(b);
      if (lb !== la) return lb - la;
      const ra = ratingValue(a), rb = ratingValue(b);
      return rb - ra;
    });

    const top = candidates.slice(0, 5);
    if (top.length === 0) {
      alert('No recommendations found. Try interacting more (like items) to improve recommendations.');
      return;
    }

    renderList(top);
    setHero(top[0]);

    btn.classList.add('active');
    setTimeout(() => btn.classList.remove('active'), 900);
  });
}


document.getElementById("feedContainer").addEventListener("click", (e) => {
  if (e.target.closest(".like-btn")) return;     // ignore heart
  const card = e.target.closest(".card");
  if (!card) return;
  const id = card.dataset.id;
  if (id) window.location.href = `/player/${id}`;
});


