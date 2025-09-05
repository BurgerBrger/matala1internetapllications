const profiles = [
  {
    id: 1,
    name: "Yosi",
    image: "https://images.unsplash.com/photo-1511379938547-c1f69419868d?q=80&w=800&auto=format&fit=crop"
  },
  {
    id: 2,
    name: "Yuval",
    image: "https://images.unsplash.com/photo-1511671782779-c97d3d27a1d4?q=80&w=800&auto=format&fit=crop"
  },
  {
    id:3,
    name: "David",
    image: "https://images.unsplash.com/photo-1507874457470-272b3c8d8ee2?q=80&w=800&auto=format&fit=crop"
  }
];

const profilesContainer = document.getElementById("profiles");

profiles.forEach(profile => {
  profilesContainer.innerHTML +=
    "<div class='col-6 col-md-4 col-lg-3'>" +
      "<div class='card p-2' onclick='selectProfile(" + profile.id + ")'>" +
        "<img src='" + profile.image + "' class='card-img-top' alt='" + profile.name + "'>" +
        "<p class='name mt-2'>" + profile.name + "</p>" +
      "</div>" +
    "</div>";
});

function selectProfile(profileId) {
  localStorage.setItem("selectedProfileId", profileId);
  window.location.href = "../NavBar/NavBar.html"
}

