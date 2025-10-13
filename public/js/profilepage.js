//Amit-Berger-207800681-Neetai-Nezer-El-322921594
const profiles = [
  {
    id: 1,
    name: "Yosi",
    image: "https://images.unsplash.com/photo-1638643391904-9b551ba91eaa?q=80&w=1674&auto=format&fit=crop&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D"
    //image: "https://images.unsplash.com/photo-1511379938547-c1f69419868d?q=80&w=800&auto=format&fit=crop"
  },
  {
    id: 2,
    name: "Yuval",
    image: "https://images.unsplash.com/photo-1639628735078-ed2f038a193e?q=80&w=1674&auto=format&fit=crop&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D"
    //image: "https://images.unsplash.com/photo-1511671782779-c97d3d27a1d4?q=80&w=800&auto=format&fit=crop"
  },
  {
    id:3,
    name: "David",
    image: "https://images.unsplash.com/photo-1638803040283-7a5ffd48dad5?q=80&w=1674&auto=format&fit=crop&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D"
    //image: "https://images.unsplash.com/photo-1507874457470-272b3c8d8ee2?q=80&w=800&auto=format&fit=crop"
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
  const p = profiles.find(p => p.id === profileId);
  localStorage.setItem("selectedProfileId",String(profileId));
  localStorage.setItem("selectedProfileName", p ? p.name : "");
  localStorage.setItem("profiles", JSON.stringify(profiles));
  window.location.href = "/feed"
}
