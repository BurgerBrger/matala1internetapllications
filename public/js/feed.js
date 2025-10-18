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
  } catch (err) {
    console.error(err);
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
  } catch (err) {
    console.error("Feed init failed:", err);
  }
});



document.getElementById("feedContainer").addEventListener("click", (e) => {
  if (e.target.closest(".like-btn")) return;     // ignore heart
  const card = e.target.closest(".card");
  if (!card) return;
  const id = card.dataset.id;
  if (id) window.location.href = `/player/${id}`;
});
