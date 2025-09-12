const API = {
  allPlants: "https://openapi.programming-hero.com/api/plants",
  allCategories: "https://openapi.programming-hero.com/api/categories",
  byCategory: (id) => `https://openapi.programming-hero.com/api/category/${id}`,
  details: (id) => `https://openapi.programming-hero.com/api/plant/${id}`,
};

const els = {
  categories: document.getElementById("categories"),
  grid: document.getElementById("plant-grid"),
  spinner: document.getElementById("grid-spinner"),
  cartList: document.getElementById("cart-list"),
  cartTotal: document.getElementById("cart-total"),
  clearCart: document.getElementById("clear-cart"),
  modal: document.getElementById("modal"),
  modalBody: document.getElementById("modal-body"),
  modalTitle: document.getElementById("modal-title"),
};

let activeCatId = null;
const cart = [];

function money(n) {
  const num = Number(n || 0);
  return num.toLocaleString(undefined, { style: "currency", currency: "USD" });
}

function setLoading(isLoading) {
  els.spinner.classList.toggle("hidden", !isLoading);
}

function setActiveCategory(id) {
  activeCatId = id;
  [...els.categories.querySelectorAll("button")].forEach((btn) => {
    btn.classList.toggle("active-cat", btn.dataset.id === String(id));
  });
}

function buildCategoryButtons(list) {
  els.categories.innerHTML = "";
  // All button
  const allBtn = document.createElement("button");
  allBtn.className =
    "px-4 py-2 rounded-xl border border-green-200 hover:bg-green-100 text-sm text-left";
  allBtn.textContent = "All Trees";
  allBtn.dataset.id = "all";
  allBtn.addEventListener("click", () => {
    loadPlants();
    setActiveCategory("all");
  });
  els.categories.appendChild(allBtn);

  list.forEach((cat) => {
    const btn = document.createElement("button");
    btn.className =
      "px-4 py-2 rounded-xl border border-green-200 hover:bg-green-100 text-sm text-left";
    btn.textContent = cat?.category || cat?.name || `Category ${cat?.id}`;
    btn.dataset.id = cat?.id;
    btn.addEventListener("click", () => {
      loadPlants(cat.id);
      setActiveCategory(cat.id);
    });
    els.categories.appendChild(btn);
  });
  setActiveCategory("all");
}

function plantCard(p) {
  const card = document.createElement("div");
  card.className =
    "bg-white rounded-2xl border border-green-100 overflow-hidden shadow-sm flex flex-col";
  card.innerHTML = `
        <div class="aspect-[4/3] bg-green-100/40 grid place-content-center overflow-hidden">
          <img src="${
            p?.image ||
            p?.img ||
            "https://images.unsplash.com/photo-1501004318641-b39e6451bec6?q=80&w=1480&auto=format&fit=crop"
          }" alt="${p?.name || "Plant"}" class="w-full h-full object-cover">
        </div>
        <div class="p-4 flex-1 flex flex-col gap-2">
          <button class="text-lg font-semibold text-left hover:text-green-700 plant-title">${
            p?.name || "Unknown plant"
          }</button>
          <p class="text-sm text-slate-600 line-clamp-2">${
            p?.short_description ||
            p?.description ||
            "A beautiful tree that helps our planet breathe better."
          }</p>
          <div class="mt-2 flex items-center justify-between text-sm">
            <span class="px-2 py-1 rounded-full bg-green-100 text-green-700">${
              p?.category || "Tree"
            }</span>
            <span class="font-semibold">${money(p?.price)}</span>
          </div>
          <button class="mt-3 inline-flex justify-center items-center gap-2 rounded-xl bg-green-600 hover:bg-green-700 text-white font-semibold px-4 py-2 add-cart">Add to Cart</button>
        </div>`;

  // Add to cart
  card.querySelector(".add-cart").addEventListener("click", () => addToCart(p));

  // Modal open on title
  card
    .querySelector(".plant-title")
    .addEventListener("click", () => openModal(p.id, p.name));

  return card;
}

async function loadCategories() {
  try {
    const res = await fetch(API.allCategories);
    const data = await res.json();
    const list = data?.categories || data?.data || [];
    buildCategoryButtons(list);
  } catch (e) {
    els.categories.innerHTML =
      '<div class="text-sm text-red-600">Failed to load categories.</div>';
  }
}

async function loadPlants(categoryId) {
  setLoading(true);
  els.grid.innerHTML = "";
  try {
    const url = categoryId ? API.byCategory(categoryId) : API.allPlants;
    const res = await fetch(url);
    const data = await res.json();
    const list = data?.plants || data?.data || [];
    if (!list.length) {
      els.grid.innerHTML =
        '<div class="col-span-full text-center text-slate-600">No plants found.</div>';
    } else {
      list.forEach((p) => els.grid.appendChild(plantCard(p)));
    }
  } catch (e) {
    els.grid.innerHTML =
      '<div class="col-span-full text-center text-red-600">Failed to load plants.</div>';
  } finally {
    setLoading(false);
  }
}

async function openModal(id, fallbackTitle) {
  try {
    document.documentElement.classList.add("no-scroll");
    els.modal.classList.remove("hidden");
    els.modalBody.innerHTML =
      '<div class="col-span-full flex items-center justify-center py-8 text-green-700"><svg class="animate-spin h-6 w-6 mr-2" viewBox="0 0 24 24"><circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle><path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v4a4 4 0 00-4 4H4z"></path></svg> Loading…</div>';
    const res = await fetch(API.details(id));
    const d = await res.json();
    const p = d?.plant || d?.data || {};
    els.modalTitle.textContent = p?.name || fallbackTitle || "Plant details";
    els.modalBody.innerHTML = `
          <img class="rounded-xl w-full h-56 object-cover" src="${
            p?.image ||
            p?.img ||
            "https://images.unsplash.com/photo-1501004318641-b39e6451bec6?q=80&w=1480&auto=format&fit=crop"
          }" alt="${p?.name || ""}">
          <div class="space-y-2 text-sm">
            <div><span class="font-semibold">Category:</span> ${
              p?.category || "Tree"
            }</div>
            <div><span class="font-semibold">Price:</span> ${money(
              p?.price
            )}</div>
            <p class="pt-2 text-slate-700">${
              p?.description ||
              p?.short_description ||
              "This plant contributes to biodiversity and carbon capture."
            }</p>
          </div>`;
  } catch (e) {
    els.modalBody.innerHTML =
      '<div class="col-span-full text-center text-red-600 p-6">Failed to load plant details.</div>';
  }
}

// Modal close
els.modal.addEventListener("click", (e) => {
  if (e.target.dataset.close !== undefined) {
    els.modal.classList.add("hidden");
    document.documentElement.classList.remove("no-scroll");
  }
});

function renderCart() {
  els.cartList.innerHTML = "";
  cart.forEach((item, idx) => {
    const li = document.createElement("li");
    li.className =
      "flex items-center justify-between gap-3 bg-green-50 border border-green-100 rounded-xl px-3 py-2";
    li.innerHTML = `
          <span class="truncate">${item.name || "Tree"}</span>
          <div class="flex items-center gap-3">
            <span class="font-semibold">${money(item.price)}</span>
            <button class="text-red-600 hover:bg-red-50 rounded p-1" aria-label="Remove">❌</button>
          </div>`;
    li.querySelector("button").addEventListener("click", () => {
      removeFromCart(idx);
    });
    els.cartList.appendChild(li);
  });
  const total = cart.reduce((sum, i) => sum + Number(i.price || 0), 0);
  els.cartTotal.textContent = money(total);
}

function addToCart(p) {
  cart.push({ id: p.id, name: p.name, price: Number(p.price || 0) });
  renderCart();
}

function removeFromCart(index) {
  cart.splice(index, 1);
  renderCart();
}

els.clearCart.addEventListener("click", () => {
  cart.length = 0;
  renderCart();
});

// Init
document.getElementById("year").textContent = new Date().getFullYear();
loadCategories();
loadPlants();
