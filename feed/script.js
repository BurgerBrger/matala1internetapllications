// טוענים את הקטלוג מה-localStorage אם יש, אחרת ברירת מחדל
let cards = localStorage.getItem("cards")
  ? JSON.parse(localStorage.getItem("cards"))
  : {
      cardtype: "movies",
      card: [
        {
          name: "rootsss",
          year: 1977,
          genre: "Science Fiction",
          numberoflikesatstart: 0,
          image: "https://picsum.photos/200/300?random=1"
        },
        {
          name: "a",
          year: 1980,
          genre: "Science Fiction",
          numberoflikesatstart: 0,
          image: "https://picsum.photos/200/300?random=2"
        },
        {
          name: "Star Wars 3",
          year: 1983,
          genre: "Science Fiction",
          numberoflikesatstart: 0,
          image: "https://picsum.photos/200/300?random=3"
        }
      ]
    };

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
document.addEventListener("keyup", (event) => {
  if (event.target && event.target.id === "searchInput") {
    const query = event.target.value.toLowerCase();
    const filtered = cards.card.filter(item =>
      item.name.toLowerCase().includes(query) ||
      item.genre.toLowerCase().includes(query) ||
      item.year.toString().includes(query)
    );
    renderFeed(filtered);
  }
});

// ברכת שלום לפי פרופיל
const profiles = [
  { id: 1, name: "Yosi" },
  { id: 2, name: "Yuval" },
  { id: 3, name: "David" }
];

const selectedId = localStorage.getItem("selectedProfileId");
const welcomeMsg = document.getElementById("welcomeMsg");

if (welcomeMsg) {
  if (selectedId) {
    const profile = profiles.find(p => p.id == selectedId);
    welcomeMsg.textContent = profile
      ? "Hello " + profile.name
      : "Hello guest";
  } else {
    welcomeMsg.textContent = "Hello guest";
  }
}

//to sort from a to z button
const sortBtn = document.getElementById("sortBtn");

if (sortBtn) {
  sortBtn.addEventListener("click", () => {
    // ממיינים את המערך לפי שם
    const sorted = [...cards.card].sort((a, b) =>
      a.name.localeCompare(b.name)
    );

    // מציירים מחדש את הפיד עם הסדר החדש
    renderFeed(sorted);
  });
}
