// טוענים את הקטלוג מה-localStorage אם יש, אחרת ברירת מחדל

let cards = /*localStorage.getItem("cards")
  ? JSON.parse(localStorage.getItem("cards"))
  :*/ {
      cardtype: "movies",
      card: [
        {
          name: "The Godfather",
          year: 1972,
          genre: "Drama",
          numberoflikesatstart: 0,
          image:"https://m.media-amazon.com/images/M/MV5BNGEwYjgwOGQtYjg5ZS00Njc1LTk2ZGEtM2QwZWQ2NjdhZTE5XkEyXkFqcGc@._V1_.jpg",
          wideimage:"https://m.media-amazon.com/images/M/MV5BYjBkN2QyYzItYzZlZi00MjIyLTkwMTMtMWQ0NmQyZjAxYzdkXkEyXkFqcGc@._V1_.jpg"
        },
        {
          name: "Jaws",
          year: 1975,
          genre: "Horror",
          numberoflikesatstart: 0,
          image:"https://m.media-amazon.com/images/M/MV5BYjViNDQzNmUtYzkxZi00NTk5LTljMmItYjJlZmZkODIxNjU1XkEyXkFqcGc@._V1_.jpg",
          wideimage:"https://m.media-amazon.com/images/M/MV5BMjI0ZmI0N2MtMTI5ZS00MmU1LThiNmQtZWQyZjljMGQ1M2VkXkEyXkFqcGc@._V1_.jpg"
        },
        {
          name: "Oppenheimer",
          year: 2023,
          genre: "Documentary",
          numberoflikesatstart: 0,
          image: "https://m.media-amazon.com/images/M/MV5BN2JkMDc5MGQtZjg3YS00NmFiLWIyZmQtZTJmNTM5MjVmYTQ4XkEyXkFqcGc@._V1_.jpg",
          wideimage: "https://m.media-amazon.com/images/M/MV5BMDEzMTNhZmEtNzAyNy00YTg3LWFhYTYtNDZiOTYwMmE4ZmFkXkEyXkFqcGc@._V1_.jpg"
        },
        {
          name: "The Wolf of Wall Street",
          year: 2013,
          genre: "Comedy",
          numberoflikesatstart: 0,
          image:"https://m.media-amazon.com/images/M/MV5BMjIxMjgxNTk0MF5BMl5BanBnXkFtZTgwNjIyOTg2MDE@._V1_.jpg",
          wideimage:"https://m.media-amazon.com/images/M/MV5BMTg3MTY4NDk4Nl5BMl5BanBnXkFtZTgwNjc0MzQ4MDE@._V1_.jpg"
        },
        {
          name: "Forrest Gump",
          year: 1994,
          genre: "Drama",
          numberoflikesatstart: 0,
          image:"https://m.media-amazon.com/images/M/MV5BNDYwNzVjMTItZmU5YS00YjQ5LTljYjgtMjY2NDVmYWMyNWFmXkEyXkFqcGc@._V1_.jpg",
          wideimage:"https://m.media-amazon.com/images/M/MV5BZDA3ZDExMDUtNjdjOC00YjNhLWIyNGUtNmZhNzJkMDI1ZjUzXkEyXkFqcGc@._V1_.jpg"
        },
        {
          name: "Monsters, Inc.",
          year: 1977,
          genre: "Animation",
          numberoflikesatstart: 0,
          image:"https://m.media-amazon.com/images/M/MV5BMTY1NTI0ODUyOF5BMl5BanBnXkFtZTgwNTEyNjQ0MDE@._V1_.jpg",
          wideimage:"https://m.media-amazon.com/images/M/MV5BZmQxMmVkMzUtMzE3My00YzQxLTk0NjUtOWZmOTZkMTA3OTVkXkEyXkFqcGc@._V1_.jpg"
        },
        {
          name: "Top Gun: Maverick",
          year: 2022,
          genre: "Action",
          numberoflikesatstart: 0,
          image:"https://m.media-amazon.com/images/M/MV5BMDBkZDNjMWEtOTdmMi00NmExLTg5MmMtNTFlYTJlNWY5YTdmXkEyXkFqcGc@._V1_.jpg",
          wideimage:"https://m.media-amazon.com/images/M/MV5BZTdiYzk2NGItZjhjMy00MTRhLThkZTEtMGMwZjc3NmZkNDFkXkEyXkFqcGc@._V1_.jpg"
        },
        {
          name: "The Maze Runner",
          year: 2014,
          genre: "Science Fiction",
          numberoflikesatstart: 0,
          image:"https://m.media-amazon.com/images/M/MV5BMjUyNTA3MTAyM15BMl5BanBnXkFtZTgwOTEyMTkyMjE@._V1_.jpg",
          wideimage:"https://m.media-amazon.com/images/M/MV5BMjI5MDQ0MDU2OV5BMl5BanBnXkFtZTgwOTIyODkyMjE@._V1_.jpg"
        },
         {
          name: "The Blind Side",
          year: 2009,
          genre: "Sport",
          numberoflikesatstart: 0,
          image:"https://m.media-amazon.com/images/M/MV5BMjEzOTE3ODM3OF5BMl5BanBnXkFtZTcwMzYyODI4Mg@@._V1_.jpg",
          wideimage:"https://m.media-amazon.com/images/M/MV5BMTMwNDkwMTY4N15BMl5BanBnXkFtZTcwNTkzMjg3Mg@@._V1_.jpg"
        }
      ]
    };

const profiles = [
    { id: 1, name: "Yosi" },
    { id: 2, name: "Yuval" },
    { id: 3, name: "David" }
  ];


function getTimeGreeting() {
  const h = new Date().getHours();
  if (h >= 5 && h < 12) return "Good morning";
  if (h >= 12 && h < 18) return "Good afternoon";
  if (h >= 18 && h < 22) return "Good evening";
  return "Good night";
}

function pickRandomMovie(list) {
  return list[Math.floor(Math.random() * list.length)]; // NEW: picks a random movie from the list
}

// פונקציה שמציירת את הפיד
function renderFeed(items) {
  const feedContainer = document.getElementById("feedContainer");
  feedContainer.innerHTML = "";

  items.forEach((item, index) => {
    feedContainer.innerHTML += `
      <div class="card">
        <img src="${item.image}" alt="${item.name}">
        <h3>${item.name}</h3>
        <p>${item.year} | ${item.genre}</p>
        <p>
          <button class="like-btn" data-index="${index}">
            <i class="bi bi-hand-thumbs-up"></i>
          </button>
          <span id="likes-${index}">${item.numberoflikesatstart}</span>
        </p>
      </div>
    `;
  });

  // מאזינים ללייקים
  const likeButtons = document.querySelectorAll(".like-btn");
  likeButtons.forEach(button => {
    button.addEventListener("click", () => {
      const index = button.getAttribute("data-index");
      items[index].numberoflikesatstart++;
      document.getElementById("likes-" + index).textContent =
        items[index].numberoflikesatstart;

      // שומרים ב-localStorage
      localStorage.setItem("cards", JSON.stringify(cards));
    });
  });
}

// מציירים את כל הסרטים בהתחלה
renderFeed(cards.card);

// 🔹 חיפוש תוך כדי הקלדה (גם אם ה-navbar נטען אחרי)

function renderTopHero() {
  const heroMovie = pickRandomMovie(cards.card);
  const selectedId = localStorage.getItem("selectedProfileId");
  const profile = selectedId
    ? profiles.find(p => p.id == selectedId)
    : null;

  // 1) greeting + user name
  const welcomeMsg = document.getElementById("welcomeMsg");
  if (welcomeMsg) {
    welcomeMsg.textContent =
      getTimeGreeting() + ", " + (profile ? profile.name : "guest");  
  }

  // 2) hero image via wideimage
  const topImg = document.getElementById("topMovieImg");
  if (topImg) {
    topImg.src = heroMovie.wideimage || heroMovie.image;           
  }

  // title under the image
  const titleEl = document.getElementById("topMovieTitle");
  if (titleEl) {
    titleEl.textContent = `${heroMovie.name} (${heroMovie.year})`;   
  }

  // 3) suggested movie line under the greeting
  const suggestedLine = document.getElementById("suggestedLine");
  if (suggestedLine) {
    suggestedLine.textContent =                           // NEW: creates the “today’s suggested movie is …” line
      "Today's suggested movie is";
  }
  const watchNowBtn = document.getElementById("watchNowBtn");
  if (watchNowBtn) {
    watchNowBtn.onclick = () => {
      alert('Playing "' + heroMovie.name + '"...');     // NEW: placeholder action to “watch” the movie
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
