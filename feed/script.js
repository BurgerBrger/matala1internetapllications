
//טוען את הסרטים מהרשימה הקבועה ואז מעדכן לפי הלייקים שרשומים אצלו במידה וכבר עשה לייקים

let cards = {
  cardtype: "movies",
  card: [
    {
      id: 1,
      name: "The Godfather",
      year: 1972,
      genre: ["Drama"],
      numberoflikes: 0,
      image:"https://m.media-amazon.com/images/M/MV5BNGEwYjgwOGQtYjg5ZS00Njc1LTk2ZGEtM2QwZWQ2NjdhZTE5XkEyXkFqcGc@._V1_.jpg",
      wideimage:"https://m.media-amazon.com/images/M/MV5BYjBkN2QyYzItYzZlZi00MjIyLTkwMTMtMWQ0NmQyZjAxYzdkXkEyXkFqcGc@._V1_.jpg"
    },
    {
      id: 2,
      name: "Jaws",
      year: 1975,
      genre: ["Horror"],
      numberoflikes: 0,
      image:"https://m.media-amazon.com/images/M/MV5BYjViNDQzNmUtYzkxZi00NTk5LTljMmItYjJlZmZkODIxNjU1XkEyXkFqcGc@._V1_.jpg",
      wideimage:"https://m.media-amazon.com/images/M/MV5BMjI0ZmI0N2MtMTI5ZS00MmU1LThiNmQtZWQyZjljMGQ1M2VkXkEyXkFqcGc@._V1_.jpg"
    },
    {
      id: 3,
      name: "Oppenheimer",
      year: 2023,
      genre: ["Documentary"],
      numberoflikes: 0,
      image: "https://m.media-amazon.com/images/M/MV5BN2JkMDc5MGQtZjg3YS00NmFiLWIyZmQtZTJmNTM5MjVmYTQ4XkEyXkFqcGc@._V1_.jpg",
      wideimage: "https://m.media-amazon.com/images/M/MV5BMDEzMTNhZmEtNzAyNy00YTg3LWFhYTYtNDZiOTYwMmE4ZmFkXkEyXkFqcGc@._V1_.jpg"
    },
    {
      id: 4,
      name: "The Wolf of Wall Street",
      year: 2013,
      genre: ["Comedy"],
      numberoflikes: 0,
      image:"https://m.media-amazon.com/images/M/MV5BMjIxMjgxNTk0MF5BMl5BanBnXkFtZTgwNjIyOTg2MDE@._V1_.jpg",
      wideimage:"https://m.media-amazon.com/images/M/MV5BMTg3MTY4NDk4Nl5BMl5BanBnXkFtZTgwNjc0MzQ4MDE@._V1_.jpg"
    },
    {
      id: 5,
      name: "Forrest Gump",
      year: 1994,
      genre: ["Drama"],
      numberoflikes: 0,
      image:"https://m.media-amazon.com/images/M/MV5BNDYwNzVjMTItZmU5YS00YjQ5LTljYjgtMjY2NDVmYWMyNWFmXkEyXkFqcGc@._V1_.jpg",
      wideimage:"https://m.media-amazon.com/images/M/MV5BZDA3ZDExMDUtNjdjOC00YjNhLWIyNGUtNmZhNzJkMDI1ZjUzXkEyXkFqcGc@._V1_.jpg"
    },
    {
      id: 6,
      name: "Monsters, Inc.",
      year: 1977,
      genre: ["Animation", "Comedy"],
      numberoflikes: 0,
      image:"https://m.media-amazon.com/images/M/MV5BMTY1NTI0ODUyOF5BMl5BanBnXkFtZTgwNTEyNjQ0MDE@._V1_.jpg",
      wideimage:"https://m.media-amazon.com/images/M/MV5BZmQxMmVkMzUtMzE3My00YzQxLTk0NjUtOWZmOTZkMTA3OTVkXkEyXkFqcGc@._V1_.jpg"
    },
    {
      id: 7,
      name: "Top Gun: Maverick",
      year: 2022,
      genre: ["Action"],
      numberoflikes: 0,
      image:"https://m.media-amazon.com/images/M/MV5BMDBkZDNjMWEtOTdmMi00NmExLTg5MmMtNTFlYTJlNWY5YTdmXkEyXkFqcGc@._V1_.jpg",
      wideimage:"https://m.media-amazon.com/images/M/MV5BZTdiYzk2NGItZjhjMy00MTRhLThkZTEtMGMwZjc3NmZkNDFkXkEyXkFqcGc@._V1_.jpg"
    },
    {
      id: 8,
      name: "The Maze Runner",
      year: 2014,
      genre: ["Sci Fi"],
      numberoflikes: 0,
      image:"https://m.media-amazon.com/images/M/MV5BMjUyNTA3MTAyM15BMl5BanBnXkFtZTgwOTEyMTkyMjE@._V1_.jpg",
      wideimage:"https://m.media-amazon.com/images/M/MV5BMjI5MDQ0MDU2OV5BMl5BanBnXkFtZTgwOTIyODkyMjE@._V1_.jpg"
    },
    {
      id: 9,
      name: "The Blind Side",
      year: 2009,
      genre: ["Sport"],
      numberoflikes: 0,
      image:"https://m.media-amazon.com/images/M/MV5BMjEzOTE3ODM3OF5BMl5BanBnXkFtZTcwMzYyODI4Mg@@._V1_.jpg",
      wideimage:"https://m.media-amazon.com/images/M/MV5BMTMwNDkwMTY4N15BMl5BanBnXkFtZTcwNTkzMjg3Mg@@._V1_.jpg"
    }
  ]
};

const savedRaw = localStorage.getItem("cards");

if (savedRaw) {
  const saved = JSON.parse(savedRaw);
  const likeMap = new Map(saved.card.map(m => [(m.id ?? m.name), Number(m.numberoflikes) || 0])); // new array of name(id) -> numberoflikes
  cards.card.forEach(m => {// update only the likes in the default cards
    const key = m.id ?? m.name;
    if (likeMap.has(key)) m.numberoflikes = likeMap.get(key);// update from saved for every movie in default that is found
  });
}

const likedSet = new Set(JSON.parse(localStorage.getItem("likedIds") || "[]"));// remember which movies like between reloads

function saveCards() {
  localStorage.setItem("likedIds", JSON.stringify([...likedSet]));
  localStorage.setItem("cards", JSON.stringify(cards)); // save the cards with new likes to localStorage
}

document.addEventListener("click", (e) => {
    const btn = e.target.closest(".like-btn");
    if (!btn) return;

    const id = Number(btn.dataset.id);
    const movie = cards.card.find(m => m.id === id);
    if (!movie) return;
    
    const likeStatus = btn.classList.contains("liked");
    btn.classList.toggle("liked", !likeStatus);

    movie.numberoflikes = Math.max(0, (movie.numberoflikes || 0) + (likeStatus ? -1 : 1));

    // Update UI count (sibling in overlay)
    const likesEl = btn.parentElement.querySelector(".like-count");
    if (likesEl) likesEl.textContent = movie.numberoflikes;

    // Update likedSet
    if (!likeStatus) likedSet.add(String(id)); 
    else likedSet.delete(String(id));

    // Persist
    saveCards();
});

const profiles = JSON.parse(localStorage.getItem("profiles"));

// const profiles = [
//     { id: 1, name: "Yossi" },
//     { id: 2, name: "Yuval" },
//     { id: 3, name: "David" }
//   ];


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
    const isLiked = likedSet.has(item.id); // בודק אם הסרט נמצא ברשימת הסרטים שסומנו בלייק ומשנה לו את הסטטוס במשתנה
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

// חיפוש תוך כדי הקלדה (גם אם ה-navbar נטען אחרי)

function renderTopHero() {
  const heroMovie = pickRandomMovie(cards.card);
  // const selectedId = localStorage.getItem("selectedProfileId");
  // const profile = selectedId
  //   ? profiles.find(p => p.id == selectedId)
  //   : null;

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
    suggestedLine.textContent =                           // creates the “today’s suggested movie is …” line
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
      // ignore leading articles for nicer sort
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
