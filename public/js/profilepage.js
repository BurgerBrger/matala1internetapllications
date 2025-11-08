//Amit-Berger-207800681-Neetai-Nezer-El-322921594

// public/js/profilepage.js

// Edit mode

// public/js/profilepage.js

let EDIT_MODE = false;
let PROFILES = [];
let AVATARS = []; // cache

async function fetchJSON(url, opts) {
  const defaultOpts = { credentials: 'same-origin' };
  const res = await fetch(url, Object.assign(defaultOpts, opts || {}));
  if (!res.ok) throw new Error(`${opts?.method || "GET"} ${url} -> ${res.status}`);
  return res.json();
}

async function loadProfiles() {
  PROFILES = await fetchJSON("/api/profiles");

  // do not inject a fake Admin card here; server should return only allowed profiles
  // Admin ordering should be controlled server-side; just sort by id here
  PROFILES.sort((a, b) => Number(a.id) - Number(b.id));
}

async function loadAvatars() {
  if (AVATARS.length) return AVATARS;
  AVATARS = await fetchJSON("/api/profiles/avatars");
  return AVATARS;
}

/* ---------- RENDER ---------- */
function profileCard(p) {
  const img = p.image || "/images/profile/default.jpg";
  // treat profile as admin if it explicitly has usernumber 3 (special admin) or id/name fallback
  const isAdmin = Number(p.usernumber) === 3 || Number(p.id) === 0 || (p.name || "").toLowerCase() === "admin";
  if (!EDIT_MODE) {
    return `
      <div class="col-6 col-md-4 col-lg-2">
        <div class="card p-2" data-id="${p.id}" data-name="${p.name}">
          <img src="${img}" class="card-img-top" alt="${p.name}">
          <p class="name mt-2">${p.name}</p>
        </div>
      </div>`;
  }

  if (isAdmin) {
    // Admin: no overlay icons, name disabled
    return `
      <div class="col-6 col-md-4 col-lg-2">
        <div class="card p-2 edit" data-id="${p.id}" data-name="${p.name}">
          <div class="img-wrap" style="position:relative">
            <img src="${img}" class="card-img-top" alt="${p.name}">
          </div>
          <input class="name-input mt-2" value="${p.name}" disabled />
        </div>
      </div>`;
  }
  // Regular profile: show edit/delete overlay + editable name
  return `
    <div class="col-6 col-md-4 col-lg-2">
      <div class="card p-2 edit" data-id="${p.id}" data-name="${p.name}">
        <div class="img-wrap" style="position:relative">
          <img src="${img}" class="card-img-top" alt="${p.name}">
          <div class="hover-overlay">
            <i class="bi bi-pencil icon-btn edit" title="Change picture"></i>
            <i class="bi bi-trash icon-btn trash" title="Delete profile"></i>
          </div>
        </div>
        <input class="name-input mt-2" value="${p.name}" />
      </div>
    </div>`;
}

function addProfileCard() {
  return `
    <div class="col-6 col-md-4 col-lg-2">
      <div class="add-card" id="addProfileCard">+ Add Profile</div>
    </div>`;
}

function render() {
  const root = document.getElementById("profiles");
  root.innerHTML = [
    ...PROFILES.map(profileCard),
    ...(EDIT_MODE ? [addProfileCard()] : []),
  ].join("");
}

/* ---------- NORMAL (view) MODE HANDLERS ---------- */
function attachViewHandlers() {
  const root = document.getElementById("profiles");
  root.addEventListener("click", (e) => {
    if (EDIT_MODE) { e.preventDefault(); return; }

    const card = e.target.closest(".card");
    if (!card) return;

    const id = card.dataset.id;
    const p  = PROFILES.find(x => String(x.id) === String(id));

    // Admin shortcut
    if (String(id) === "0" || (p && (p.name || "").toLowerCase() === "admin")) {
      window.location.href = "/admin/content";
      return;
    }

    // Regular profile → feed
    localStorage.setItem("selectedProfileId", String(id));
    localStorage.setItem("selectedProfileName", p ? p.name : "");
    localStorage.setItem("profiles", JSON.stringify(PROFILES));
    window.location.href = "/feed";
  });
}


/* ---------- EDIT MODE HANDLERS ---------- */
function attachEditHandlers() {
  const root = document.getElementById("profiles");

  // Add profile → server sets default image `/images/profile/default.jpg`
  root.addEventListener("click", async (e) => {
    const add = e.target.closest("#addProfileCard");
    if (!add) return;
    const created = await fetchJSON("/api/profiles", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ name: "New Profile" })
    });
    PROFILES.push(created);
    render();
  });

  // Save name on Enter or blur
  root.addEventListener("keydown", async (e) => {
    const input = e.target.closest(".name-input");
    if (!input || e.key !== "Enter") return;
    e.preventDefault();
    await saveName(input);
  });
  root.addEventListener("blur", async (e) => {
    const input = e.target.closest(".name-input");
    if (!input) return;
    await saveName(input);
  }, true);

  async function saveName(input) {
    const card = input.closest(".card");
    const id = card.dataset.id;
    if (String(id) === "0") return; // ⟵ added
    const name = input.value.trim();
    const updated = await fetchJSON(`/api/profiles/${id}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ name })
    });
    const ix = PROFILES.findIndex(p => String(p.id) === String(id));
    PROFILES[ix] = updated;
    render();
  }

  // Change picture (pencil)
  root.addEventListener("click", async (e) => {
    const icon = e.target.closest(".icon-btn.edit");
    if (!icon) return;
    const card = icon.closest(".card");
    const id = card.dataset.id;
    if (String(id) === "0") return;

    // open modal & load avatars
    const modal = document.getElementById("avatarModal");
    const grid  = document.getElementById("avatarGrid");
    const close = document.getElementById("avatarClose");
    const avatars = await loadAvatars();
    grid.innerHTML = avatars.map(src => `<img data-src="${src}" src="${src}" alt="">`).join("");
    modal.style.display = "flex";

    const onPick = async (ev) => {
      const img = ev.target.closest("img");
      if (!img) return;
      const path = img.dataset.src; // library path
      const updated = await fetchJSON(`/api/profiles/${id}`, {
        method:"PUT",
        headers:{"Content-Type":"application/json"},
        body: JSON.stringify({ image: path })
      });
      const ix = PROFILES.findIndex(p => String(p.id) === String(id));
      PROFILES[ix] = updated;
      modal.style.display = "none";
      grid.removeEventListener("click", onPick);
      render();
    };

    grid.addEventListener("click", onPick);
    close.onclick = () => { modal.style.display = "none"; grid.removeEventListener("click", onPick); };
  });

  // Delete (trash) with confirm
  root.addEventListener("click", async (e) => {
    const icon = e.target.closest(".icon-btn.trash");
    if (!icon) return;
    const card = icon.closest(".card");
    const id = card.dataset.id;
    if (String(id) === "0") { alert("Admin profile cannot be deleted."); return; }
    if (!confirm("Delete this profile? This cannot be undone.")) return;
    await fetchJSON(`/api/profiles/${id}`, { method: "DELETE" });
    PROFILES = PROFILES.filter(p => String(p.id) !== String(id));
    render();
  });
}

/* ---------- MANAGE TOGGLE ---------- */
function attachManageToggle() {
  const btn = document.getElementById("manageBtn");
  btn.addEventListener("click", () => {
    EDIT_MODE = !EDIT_MODE;
    btn.textContent = EDIT_MODE ? "Done" : "Manage profiles";
    render();
  });
}

/* ---------- INIT ---------- */
document.addEventListener("DOMContentLoaded", async () => {
  try {
    await loadProfiles();
    render();
    attachViewHandlers();
    attachEditHandlers();
    attachManageToggle();
  } catch (e) {
    console.error(e);
  }
});