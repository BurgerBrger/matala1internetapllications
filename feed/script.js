let cards = {
  cardtype: "movies",
  card: [
    {
      name: "Star Wars",
      year: 1977,
      genre: "Science Fiction",
      numberoflikesatstart: 0
    },
    {
      name: "Star Wars 2",
      year: 1980,
      genre: "Science Fiction",
      numberoflikesatstart: 0
    }
  ]
};

let continentJson = JSON.stringify(cards);

const feedContainer = document.getElementById("feedContainer");

cards.card.forEach(item => {
  feedContainer.innerHTML += `
    <div class="card">
      <h3>${item.name}</h3>
      <p>${item.year} | ${item.genre}</p>
      <p> ${item.numberoflikesatstart}</p>
    </div>
  `;
});


const profiles = [
  { id: 1, name: "Yosi" },
  { id: 2, name: "Yuval" },
  { id: 3, name: "David" }
];

const selectedId = localStorage.getItem("selectedProfileId");

if (selectedId) {
 
  const profile = profiles.find(p => p.id == selectedId);

  if (profile) {
    document.getElementById("welcomeMsg").textContent = "Hello " + profile.name;
  }
} else {
  document.getElementById("welcomeMsg").textContent = "Hello guest";
}