//Amit-Berger-207800681-Neetai-Nezer-El-322921594
//טוען את הסרטים מהרשימה הקבועה ואז מעדכן לפי הלייקים שרשומים אצלו במידה וכבר עשה לייקים

let cards = {
  cardtype: "movies",
  card: [
    {
      id: 1,
      name: "The Godfather",
      year: 1972,
      genre: ["Drama"],
      numberoflikes: 29,
      image:"https://m.media-amazon.com/images/M/MV5BNGEwYjgwOGQtYjg5ZS00Njc1LTk2ZGEtM2QwZWQ2NjdhZTE5XkEyXkFqcGc@._V1_.jpg",
      wideimage:"https://m.media-amazon.com/images/M/MV5BYjBkN2QyYzItYzZlZi00MjIyLTkwMTMtMWQ0NmQyZjAxYzdkXkEyXkFqcGc@._V1_.jpg"
    },
    {
      id: 2,
      name: "Jaws",
      year: 1975,
      genre: ["Horror"],
      numberoflikes: 21,
      image:"https://m.media-amazon.com/images/M/MV5BYjViNDQzNmUtYzkxZi00NTk5LTljMmItYjJlZmZkODIxNjU1XkEyXkFqcGc@._V1_.jpg",
      wideimage:"https://m.media-amazon.com/images/M/MV5BMjI0ZmI0N2MtMTI5ZS00MmU1LThiNmQtZWQyZjljMGQ1M2VkXkEyXkFqcGc@._V1_.jpg"
    },
    {
      id: 3,
      name: "Oppenheimer",
      year: 2023,
      genre: ["Documentary"],
      numberoflikes: 25,
      image: "https://m.media-amazon.com/images/M/MV5BN2JkMDc5MGQtZjg3YS00NmFiLWIyZmQtZTJmNTM5MjVmYTQ4XkEyXkFqcGc@._V1_.jpg",
      wideimage: "https://m.media-amazon.com/images/M/MV5BMDEzMTNhZmEtNzAyNy00YTg3LWFhYTYtNDZiOTYwMmE4ZmFkXkEyXkFqcGc@._V1_.jpg"
    },
    {
      id: 4,
      name: "The Wolf of Wall Street",
      year: 2013,
      genre: ["Comedy"],
      numberoflikes: 32,
      image:"https://m.media-amazon.com/images/M/MV5BMjIxMjgxNTk0MF5BMl5BanBnXkFtZTgwNjIyOTg2MDE@._V1_.jpg",
      wideimage:"https://m.media-amazon.com/images/M/MV5BMTg3MTY4NDk4Nl5BMl5BanBnXkFtZTgwNjc0MzQ4MDE@._V1_.jpg"
    },
    {
      id: 5,
      name: "Forrest Gump",
      year: 1994,
      genre: ["Drama"],
      numberoflikes: 35,
      image:"https://m.media-amazon.com/images/M/MV5BNDYwNzVjMTItZmU5YS00YjQ5LTljYjgtMjY2NDVmYWMyNWFmXkEyXkFqcGc@._V1_.jpg",
      wideimage:"https://m.media-amazon.com/images/M/MV5BZDA3ZDExMDUtNjdjOC00YjNhLWIyNGUtNmZhNzJkMDI1ZjUzXkEyXkFqcGc@._V1_.jpg"
    },
    {
      id: 6,
      name: "Monsters, Inc.",
      year: 1977,
      genre: ["Animation", "Comedy"],
      numberoflikes: 41,
      image:"https://m.media-amazon.com/images/M/MV5BMTY1NTI0ODUyOF5BMl5BanBnXkFtZTgwNTEyNjQ0MDE@._V1_.jpg",
      wideimage:"https://m.media-amazon.com/images/M/MV5BZmQxMmVkMzUtMzE3My00YzQxLTk0NjUtOWZmOTZkMTA3OTVkXkEyXkFqcGc@._V1_.jpg"
    },
    {
      id: 7,
      name: "Top Gun: Maverick",
      year: 2022,
      genre: ["Action"],
      numberoflikes: 19,
      image:"https://m.media-amazon.com/images/M/MV5BMDBkZDNjMWEtOTdmMi00NmExLTg5MmMtNTFlYTJlNWY5YTdmXkEyXkFqcGc@._V1_.jpg",
      wideimage:"https://m.media-amazon.com/images/M/MV5BZTdiYzk2NGItZjhjMy00MTRhLThkZTEtMGMwZjc3NmZkNDFkXkEyXkFqcGc@._V1_.jpg"
    },
    {
      id: 8,
      name: "The Maze Runner",
      year: 2014,
      genre: ["Sci Fi"],
      numberoflikes: 20,
      image:"https://m.media-amazon.com/images/M/MV5BMjUyNTA3MTAyM15BMl5BanBnXkFtZTgwOTEyMTkyMjE@._V1_.jpg",
      wideimage:"https://m.media-amazon.com/images/M/MV5BMjI5MDQ0MDU2OV5BMl5BanBnXkFtZTgwOTIyODkyMjE@._V1_.jpg"
    },
    {
      id: 9,
      name: "The Blind Side",
      year: 2009,
      genre: ["Sport"],
      numberoflikes: 23,
      image:"https://m.media-amazon.com/images/M/MV5BMjEzOTE3ODM3OF5BMl5BanBnXkFtZTcwMzYyODI4Mg@@._V1_.jpg",
      wideimage:"https://m.media-amazon.com/images/M/MV5BMTMwNDkwMTY4N15BMl5BanBnXkFtZTcwNTkzMjg3Mg@@._V1_.jpg"
    }
  ]
};

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
