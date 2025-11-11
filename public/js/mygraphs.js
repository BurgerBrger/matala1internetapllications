// public/js/mygraphs.js
// Handles profile filter + charts on /mygraphs

let currentProfileId = null;
let timeWatchedChart = null;
let likedGenresChart = null;

/** Simple fetch helper */
async function fetchJSON(url) {
  const res = await fetch(url, { credentials: "same-origin" });
  if (!res.ok) throw new Error("Request failed: " + res.status);
  return res.json();
}

function renderProfileFilter(profiles) {
  const container = document.getElementById("profileFilter");
  container.innerHTML = "";

  if (!profiles || !profiles.length) {
    container.textContent = "No profiles yet.";
    return;
  }

  const savedId = Number(localStorage.getItem("graphsProfileId") || "0");
  let initialProfile =
    profiles.find((p) => Number(p.id) === savedId) || profiles[0];

  profiles.forEach((p) => {
    const btn = document.createElement("button");
    btn.type = "button";
    btn.className = "profile-chip";
    btn.dataset.profileId = p.id;

    const imgSrc = p.image || "/images/profile/default.avif";
    const emailText = p.ownerEmail || "";

    btn.innerHTML = `
      <img src="${imgSrc}" alt="${p.name}" class="profile-chip-img">
      <div class="d-flex flex-column">
        <span class="profile-chip-name">${p.name}</span>
        ${
          emailText
            ? `<span class="profile-chip-email">${emailText}</span>`
            : ""
        }
      </div>
    `;

    btn.addEventListener("click", () => {
      const selectedId = Number(p.id);

      currentProfileId = selectedId;
      localStorage.setItem("graphsProfileId", String(selectedId));

      // update active class
      document
        .querySelectorAll(".profile-chip")
        .forEach((el) => el.classList.remove("active"));
      btn.classList.add("active");

      // load charts for this profile
      loadChartsForProfile(selectedId);
    });

    container.appendChild(btn);
  });

  // Initial selection – reuse the same logic by triggering a click
  if (initialProfile) {
    const initialBtn = container.querySelector(
      `[data-profile-id="${initialProfile.id}"]`
    );
    if (initialBtn) {
      initialBtn.click(); // sets currentProfileId + draws charts
    }
  }
}


document.addEventListener("DOMContentLoaded", async () => {
  try {
    const profiles = await fetchJSON("/api/profiles");
    renderProfileFilter(profiles);
  } catch (e) {
    console.error("Failed to load profiles for graphs page", e);
  }
});

async function loadChartsForProfile(profileId) {
  const requestedId = Number(profileId);

  // If profileId is NaN, nothing to do
  if (Number.isNaN(requestedId)) return;

  // Remember current selection for race-condition protection
  currentProfileId = requestedId;

  // If this is the special admin profile (id 0), just clear charts and show "no data"
  if (requestedId === 0) {
    const timeEmptyEl   = document.getElementById("timeWatchedEmpty");
    const genresEmptyEl = document.getElementById("likedGenresEmpty");

    if (timeWatchedChart) {
      timeWatchedChart.destroy();
      timeWatchedChart = null;
    }
    if (likedGenresChart) {
      likedGenresChart.destroy();
      likedGenresChart = null;
    }

    if (timeEmptyEl)   timeEmptyEl.classList.remove("d-none");
    if (genresEmptyEl) genresEmptyEl.classList.remove("d-none");
    return;
  }

  let timeData, genreData;
  try {
    timeData = await fetchJSON(
      `/api/stats/time-watched?profileId=${requestedId}`
    );
    genreData = await fetchJSON(
      `/api/stats/liked-genres?profileId=${requestedId}`
    );
  } catch (e) {
    console.error("Failed to load stats", e);

    // On error, also clear charts so they don't stay on previous profile
    const timeEmptyEl   = document.getElementById("timeWatchedEmpty");
    const genresEmptyEl = document.getElementById("likedGenresEmpty");

    if (timeWatchedChart) {
      timeWatchedChart.destroy();
      timeWatchedChart = null;
    }
    if (likedGenresChart) {
      likedGenresChart.destroy();
      likedGenresChart = null;
    }

    if (timeEmptyEl)   timeEmptyEl.classList.remove("d-none");
    if (genresEmptyEl) genresEmptyEl.classList.remove("d-none");
    return;
  }

  // If user clicked another profile while we were loading, ignore stale response
  if (requestedId !== currentProfileId) {
    return;
  }

  // --- TIME WATCHED CHART (same as before) ---
  const timeEmptyEl = document.getElementById("timeWatchedEmpty");
  const timeCtx = document.getElementById("timeWatchedChart").getContext("2d");

  if (timeWatchedChart) {
    timeWatchedChart.destroy();
  }

  if (!timeData.labels.length) {
    timeEmptyEl.classList.remove("d-none");
  } else {
    timeEmptyEl.classList.add("d-none");
    timeWatchedChart = new Chart(timeCtx, {
      type: "bar",
      data: {
        labels: timeData.labels,
        datasets: [
          {
            label: "Minutes watched",
            data: timeData.data,
          },
        ],
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        scales: {
          y: {
            beginAtZero: true,
            title: {
              display: true,
              text: "Minutes",
            },
          },
        },
      },
    });
  }

  // --- LIKED GENRES CHART (same as before) ---
  const genresEmptyEl = document.getElementById("likedGenresEmpty");
  const genresCtx = document
    .getElementById("likedGenresChart")
    .getContext("2d");

  if (likedGenresChart) {
    likedGenresChart.destroy();
  }

  if (!genreData.labels.length) {
    genresEmptyEl.classList.remove("d-none");
  } else {
    genresEmptyEl.classList.add("d-none");
    likedGenresChart = new Chart(genresCtx, {
      type: "pie",
      data: {
        labels: genreData.labels,
        datasets: [
          {
            data: genreData.data,
          },
        ],
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
      },
    });
  }
}

