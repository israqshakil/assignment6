// Load All Categories
const loadCategories = async () => {
  try {
    const res = await fetch(
      "https://openapi.programming-hero.com/api/categories"
    );
    const data = await res.json();
    const categories = data.categories;

    const allCategories = document.getElementById("all-categories");
    allCategories.innerHTML = "";

    categories.forEach((category) => {
      const li = document.createElement("li");
      li.className =
        "h-[35px] add-hover-effect hover:bg-[#15803d] hover:text-white flex items-center p-2 cursor-pointer rounded-lg";
      li.innerText = category.category_name;
      li.onclick = () => loadByCategory(category.id);
      allCategories.appendChild(li);
    });
  } catch (err) {
    console.error("Error loading categories:", err);
  }
};

// Load All Plants
const loadAllPlants = async () => {
  manageSpinner(true);
  try {
    const res = await fetch("https://openapi.programming-hero.com/api/plants");
    const data = await res.json();
    renderPlants(data.plants);
  } catch (err) {
    console.error("Error loading plants:", err);
  } finally {
    manageSpinner(false);
  }
};

// Load Plants by Category
const loadByCategory = async (id) => {
  manageSpinner(true);
  try {
    const res = await fetch(
      `https://openapi.programming-hero.com/api/category/${id}`
    );
    const data = await res.json();
    renderPlants(data.plants);
  } catch (err) {
    console.error("Error loading category plants:", err);
  } finally {
    manageSpinner(false);
  }
};

// Render Plant Cards

const renderPlants = (plants) => {
  const allPlants = document.getElementById("all-plants");
  allPlants.innerHTML = "";

  if (!plants || plants.length === 0) {
    allPlants.innerHTML =
      "<p class='text-center col-span-3 text-red-500'>No plants found!</p>";
    return;
  }

  plants.forEach((plant) => {
    const div = document.createElement("div");
    div.className =
      "card bg-white shadow-md p-4 rounded-lg border border-gray-200";
    div.innerHTML = `
      <figure class="h-[200px] flex justify-center">
        <img src="${plant.image}" alt="${plant.name}" class=" rounded-xl w-full h-48 object-cover"/>
      </figure>
      <div class="card-body">
       
        <h2 onclick="loadModal(${plant.id})" 
            class="card-title text-lg font-bold cursor-pointer hover:text-green-600">
          ${plant.name}
        </h2>
        <p class="text-justify"> ${plant.description}</p>
        <div class="flex justify-between py-10>
        <p class="text-blue-600 font-bold">${plant.category}</p>
        <p class="text-green-600 font-bold">$${plant.price}</p>
        </div>
        
        <div class="card-actions flex justify-between mt-3">
          <button onclick="addToCart(${plant.id}, '${plant.name}', ${plant.price})"
            class="btn bg-green-800 text-white hover:text-amber-300 w-full">Add to Cart</button>
        </div>
      </div>
    `;
    allPlants.appendChild(div);
  });
};

// Spinner Management
const manageSpinner = (isLoading) => {
  const spinner = document.getElementById("spinner");
  if (isLoading) {
    spinner.classList.remove("hidden");
  } else {
    spinner.classList.add("hidden");
  }
};

// Load Modal Data
const loadModal = async (id) => {
  try {
    const url = `https://openapi.programming-hero.com/api/plant/${id}`;
    const res = await fetch(url);
    const details = await res.json();
    displayModal(details.plants);
  } catch (err) {
    console.error("Error loading modal:", err);
  }
};

// Display Modal
const displayModal = (plant) => {
  const detailsContainer = document.getElementById("details-container");

  detailsContainer.innerHTML = `
    <h2 class="text-2xl font-bold">${plant.name}</h2>
    <img src="${plant.image}" alt="${plant.name}" 
         class="w-full h-[250px] object-contain my-3"/>
    <p><strong>Category:</strong> ${plant.category}</p>
    <p><strong>Price:</strong> $${plant.price}</p>
    <p class="text-gray-700 mt-2">${plant.description}</p>
    <div class="modal-action">
      <form method="dialog">
        <button class="btn">Close</button>
      </form>
    </div>
  `;

  document.getElementById("my_modal_5").showModal();
};

// Cart Functionality
let cart = [];

const addToCart = (id, name, price) => {
  cart.push({ id, name, price });
  renderCart();
};

const renderCart = () => {
  const cartContainer = document.getElementById("add-to-cart-main-section");
  const totalPrice = document.getElementById("cart-total-price");

  cartContainer.innerHTML = "";
  let total = 0;

  cart.forEach((item) => {
    total += item.price;
    const div = document.createElement("div");
    div.className = "flex justify-between items-center border-b py-2";
    div.innerHTML = `
      <p>${item.name}</p>
      <p>$${item.price}</p>
    `;
    cartContainer.appendChild(div);
  });

  totalPrice.innerText = total;
};

// Initial Calls
loadCategories();
loadAllPlants();
