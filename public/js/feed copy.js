

//Amit-Berger-207800681-Neetai-Nezer-El-322921594
//טוען את הסרטים מהרשימה הקבועה ואז מעדכן לפי הלייקים שרשומים אצלו במידה וכבר עשה לייקים

// Import the cards object from ../../models/movies.js

import { cards } from "../../models/movies.js";

const profiles = JSON.parse(localStorage.getItem("profiles")); // לוקח את מערך המשתמשים שנשמר בתור סטרינג
const saved = JSON.parse(localStorage.getItem("cards")); // לוקח את מערך הסרטים שנשמר בתור סטרינג

if (saved) {
  const likeMap = new Map(saved.card.map(m => [(m.id ?? m.name), Number(m.numberoflikes) || 0])); // new array of name(id) -> numberoflikes
  cards.card.forEach(m => {// update only the likes in the default cards
    const key = m.id ?? m.name;
    if (likeMap.has(key)) m.numberoflikes = likeMap.get(key);// update from saved for every movie in default that is found
  });
}

const likedSet = new Set(JSON.parse(localStorage.getItem("likedIds") || "[]"));
// remember which movies like between reloads, if not found the array no movies are liked (empty array)

function saveCards() {
  localStorage.setItem("likedIds", JSON.stringify([...likedSet]));
  localStorage.setItem("cards", JSON.stringify(cards)); // save the cards with new likes to localStorage
}

document.addEventListener("click", (e) => {//פעולות בעת לחיצה על לייק
    const btn = e.target.closest(".like-btn");
    if (!btn) return; //אם אין כפתור לייק תחזור

    const id = btn.dataset.id; // שומר את המזהה של הסרט שנלחץ
    const movie = cards.card.find(m => String(m.id) === id);
    if (!movie) return;

    const likeStatus = btn.classList.contains("liked"); //בדיקה האם הסרט סומן בלייק
    
    if (likeStatus) { // אם כבר מסומן בלייק
      likedSet.delete(String(id)); //תמחוק מרישמת הלייקים
      btn.classList.remove("liked", !likeStatus); // תוריד לו את הקלאס בשביל הנראות
    }
    else 
      { likedSet.add(String(id)); //תוסיף לרישמת הלייקים
        btn.classList.add("liked") // תוסיף לו את הקלאס בשביל הנראות
      }
    
    // Update count
    movie.numberoflikes = Math.max(0, (Number(movie.numberoflikes)) + (likeStatus ? -1 : 1));
    const likesEl = btn.parentElement.querySelector(".like-count");
    if (likesEl) likesEl.textContent = movie.numberoflikes;

    saveCards();
});

function getTimeGreeting() {
  const h = new Date().getHours(); // h = current hour
  if (h >= 5 && h < 12) return "Good morning";
  if (h >= 12 && h < 18) return "Good afternoon";
  if (h >= 18 && h < 22) return "Good evening";
  return "Good night";
}

function pickRandomMovie(list) {
  return list[Math.floor(Math.random() * list.length)]; // return - cards[round down(random number * number of cards)];
}

// פונקציה שמציירת את הפיד
function renderFeed(items) {
  const feedContainer = document.getElementById("feedContainer");
  feedContainer.innerHTML = "";

  items.forEach((item) => {
    const isLiked = likedSet.has(String(item.id)); 
    // בודק אם הסרט נמצא ברשימת הסרטים שסומנו בלייק ע"י המשתמש ומשנה לו את הסטטוס במשתנה
    feedContainer.innerHTML += `
      <div class="card">
        <div class="card-media">
          <img src="${item.image}" alt="${item.name}">
        </div>
        <div class="card-overlay">
          <div class="overlay-actions">
            <button class="like-btn ${isLiked ? "liked" : ""}"
              data-id="${item.id}">
              <i class="bi bi-heart heart-outline"></i>
              <i class="bi bi-heart-fill heart-fill"></i>
            </button>
            <span class="like-count">${item.numberoflikes}</span>
          </div>
          <div class="movie-year">${item.year}</div>
        </div>
        <h1 class="movie-title">${item.name}</h1>
        <div class="movie-genres">${item.genre.join(" · ").toLowerCase()}</div>
      </div>
    `;
    // <button class="like-btn ${isLiked ? "liked" : ""}" אם המשתנה ציין שהסרט נמצא ברשימת הסרטים האהובים אז תוסיף לו את הקלאס
  });
}

// חיפוש תוך כדי הקלדה (רק אם ה-navbar נטען קודם)
document.addEventListener("keyup", (event) => {
  if (event.target && event.target.id === "searchInput") {
    const query = event.target.value.toLowerCase();
    const filtered = cards.card.filter(item =>
      item.name.toLowerCase().includes(query)
    );
    renderFeed(filtered);
  }
});

// מציירים את כל הסרטים בהתחלה
renderFeed(cards.card);

function renderTopHero() {
  const heroMovie = pickRandomMovie(cards.card);

  // greeting + user name
  const welcomeMsg = document.getElementById("welcomeMsg");
  const profileName = localStorage.getItem("selectedProfileName");
  if (welcomeMsg) {
    welcomeMsg.textContent =
      getTimeGreeting() + ", " + (profileName ? profileName : "guest");  
  }

  // top hero banner via wideimage
  const topImg = document.getElementById("topMovieImg");
  if (topImg) {
    topImg.src = heroMovie.wideimage || heroMovie.image;           
  }

  // title under the image
  const titleEl = document.getElementById("topMovieTitle");
  if (titleEl) {
    titleEl.textContent = `${heroMovie.name} (${heroMovie.year})`;   
  }

  // suggested movie line under the greeting
  const suggestedLine = document.getElementById("suggestedLine");
  if (suggestedLine) {
    suggestedLine.textContent =  // creates the “today’s suggested movie is …” line
      "Today's suggested movie is";
  }
  const watchNowBtn = document.getElementById("watchNowBtn");
  if (watchNowBtn) {
    watchNowBtn.onclick = () => {
      alert('Playing "' + heroMovie.name + '"...');     //movie player for now
    };
  }
  const moreInfoBtn = document.getElementById("moreInfoBtn");
}

const sortBtn = document.getElementById("sortBtn");
if (sortBtn) {
  let asc = true;
  sortBtn.addEventListener("click", () => {
    cards.card.sort((a, b) => {
      const key = s => s.toLowerCase();
      return asc
        ? key(a.name).localeCompare(key(b.name))
        : key(b.name).localeCompare(key(a.name));
    });
    renderFeed(cards.card);
    sortBtn.textContent = asc ? "Sort Z–A" : "Sort A–Z";
    asc = !asc;
  });
}

renderTopHero();

async function loadHero() {
  try {
    const res = await fetch("/api/movies/random");
    if (!res.ok) throw new Error("Failed to fetch hero movie");
    const m = await res.json();

    // Background wide image:
    const bg = document.querySelector(".hero__bg");
    if (bg) {
      bg.src = m.wideimage;
      bg.alt = m.name;
    }

    const title = document.querySelector(".hero__title");
    const meta  = document.querySelector(".hero__meta");

    if (title) title.textContent = m.name;
    if (meta)  meta.textContent  = `${m.year} • ${m.genre.join(", ")}`;
  } catch (e) {
    console.error(e);
  }
}


async function fetchJSON(url) {
  const res = await fetch(url);
  if (!res.ok) throw new Error(`${url} -> ${res.status}`);
  return res.json();
}

function setHero(movie) {
  // uses elements provided in feed.ejs
  const bg = document.querySelector(".hero__bg");
  const title = document.querySelector(".hero__title");
  const meta = document.querySelector(".hero__meta");

  if (bg) {
    bg.src = movie.wideimage;      // e.g. "/images/wide/Forrest Gump.jpg"
    bg.alt = movie.name;
  }
  if (title) title.textContent = movie.name;
  if (meta)  meta.textContent  = `${movie.year} • ${movie.genre.join(", ")}`;
}

function cardHTML(m) {
  return `
    <article class="card">
      <img class="card__img" src="${m.image}" alt="${m.name}">
      <div class="card__body">
        <h3 class="card__title">${m.name}</h3>
        <p class="card__meta">${m.year} • ${m.genre.join(", ")}</p>
      </div>
    </article>
  `;
}

function renderList(movies) {
  const root = document.getElementById("feedContainer");
  if (!root) return;
  root.innerHTML = movies.map(cardHTML).join("");
}

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

async function init() {
  try {
    // random hero
    const hero = await fetchJSON("/api/movies/random");
    setHero(hero);

    // full catalog
    const all = await fetchJSON("/api/movies");
    renderList(all);
    attachSort(all);
  } catch (e) {
    console.error("Feed init failed:", e);
  }
}

document.addEventListener("DOMContentLoaded", init);


document.addEventListener("DOMContentLoaded", loadHero);

