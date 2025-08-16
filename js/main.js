// ===== CONFIG =====
const SHEETS = [
  "https://docs.google.com/spreadsheets/d/e/2PACX-1vRNR2S9ChRZ0QgYCH4EpAUK7KyVP-VwS4tTQhChdsGkA7h0sQNj0fjNvj-tDiAre66zzY6hIsKAdB-1/pub?gid=1941135183&single=true&output=csv",
  // add more sheet links here if needed
];

// ===== GLOBAL STATE =====
let allProducts = [];
let filteredProducts = [];

// ===== FETCH PRODUCTS =====
async function loadProducts() {
  let results = [];

  for (const url of SHEETS) {
    const response = await fetch(url);
    const csv = await response.text();
    const parsed = Papa.parse(csv, { header: true });
    results = results.concat(parsed.data.filter(p => p.Name)); // skip empty rows
  }

  allProducts = results;
  filteredProducts = [...allProducts];

  if (document.getElementById("product-list")) {
    renderProducts();
    populateSizeFilter();
  }

  if (document.getElementById("product-detail")) {
    renderSingleProduct();
  }

  if (document.getElementById("cart-items")) {
    renderCart();
  }
}

// ===== RENDER PRODUCTS (products.html) =====
function renderProducts() {
  const container = document.getElementById("product-list");
  container.innerHTML = "";

  filteredProducts.forEach((p, index) => {
    const div = document.createElement("div");
    div.classList.add("product-card");

    div.innerHTML = `
      <img src="${p.Image || 'https://via.placeholder.com/200'}" alt="${p.Name}">
      <h3>${p.Name}</h3>
      <p>$${p.Price}</p>
      <a href="product.html?id=${index}" class="button">View</a>
    `;

    container.appendChild(div);
  });
}

// ===== SIZE FILTER =====
function populateSizeFilter() {
  const select = document.getElementById("size-filter");
  if (!select) return;

  let sizes = new Set();
  allProducts.forEach(p => {
    if (p.Size) {
      p.Size.split(",").forEach(size => sizes.add(size.trim()));
    }
  });

  sizes = Array.from(sizes).sort();
  sizes.forEach(size => {
    const option = document.createElement("option");
    option.value = size;
    option.textContent = size;
    select.appendChild(option);
  });

  select.addEventListener("change", applyFilters);
}

// ===== SEARCH & FILTER =====
function applyFilters() {
  const search = document.getElementById("search")?.value.toLowerCase() || "";
  const size = document.getElementById("size-filter")?.value || "";

  filteredProducts = allProducts.filter(p => {
    const matchesSearch = p.Name.toLowerCase().includes(search);
    const matchesSize = size ? (p.Size && p.Size.includes(size)) : true;
    return matchesSearch && matchesSize;
  });

  renderProducts();
}

document.getElementById("search")?.addEventListener("input", applyFilters);

// ===== SINGLE PRODUCT PAGE (product.html) =====
function renderSingleProduct() {
  const params = new URLSearchParams(window.location.search);
  const id = params.get("id");

  if (!id || !allProducts[id]) return;

  const p = allProducts[id];
  const container = document.getElementById("product-detail");

  container.innerHTML = `
    <img src="${p.Image || 'https://via.placeholder.com/400'}" alt="${p.Name}">
    <div>
      <h2>${p.Name}</h2>
      <p>Price: $${p.Price}</p>
      <p>Available Sizes: ${p.Size || "N/A"}</p>
      <button onclick="addToCart(${id})" class="button">Add to Cart</button>
    </div>
  `;
}

// ===== CART FUNCTIONS =====
function getCart() {
  return JSON.parse(localStorage.getItem("cart") || "[]");
}

function saveCart(cart) {
  localStorage.setItem("cart", JSON.stringify(cart));
}

function addToCart(id) {
  const product = allProducts[id];
  let cart = getCart();
  cart.push(product);
  saveCart(cart);
  alert("Added to cart!");
}

function renderCart() {
  const container = document.getElementById("cart-items");
  const cart = getCart();

  if (cart.length === 0) {
    container.innerHTML = "<p>Your cart is empty.</p>";
    return;
  }

  container.innerHTML = "";
  let total = 0;

  cart.forEach((p, index) => {
    total += parseFloat(p.Price || 0);

    const div = document.createElement("div");
    div.classList.add("cart-item");
    div.innerHTML = `
      <img src="${p.Image || 'https://via.placeholder.com/100'}" alt="${p.Name}">
      <span>${p.Name}</span>
      <span>$${p.Price}</span>
      <button onclick="removeFromCart(${index})">Remove</button>
    `;
    container.appendChild(div);
  });

  const totalDiv = document.createElement("div");
  totalDiv.classList.add("cart-total");
  totalDiv.innerHTML = `<h3>Total: $${total.toFixed(2)}</h3>`;
  container.appendChild(totalDiv);
}

function removeFromCart(index) {
  let cart = getCart();
  cart.splice(index, 1);
  saveCart(cart);
  renderCart();
}

// ===== INIT =====
window.addEventListener("DOMContentLoaded", loadProducts);

