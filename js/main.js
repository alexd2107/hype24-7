// ===== CONFIG =====
const SHEET_URL = "YOUR_GOOGLE_SHEET_CSV_LINK"; 
// Example: "https://docs.google.com/spreadsheets/d/e/xxx/pub?output=csv"

// ===== GLOBAL =====
let products = [];

// ===== FETCH PRODUCTS =====
function loadProducts(callback) {
  Papa.parse(SHEET_URL, {
    download: true,
    header: true,
    complete: function(results) {
      products = results.data.filter(p => p.Title); // skip empty rows
      if (callback) callback();
    }
  });
}

// ===== RENDER PRODUCT LIST =====
function renderProductList() {
  const container = document.getElementById("product-list");
  if (!container) return;

  loadProducts(() => {
    container.innerHTML = "";
    products.forEach((product, index) => {
      const card = document.createElement("div");
      card.className = "product-card";
      card.innerHTML = `
        <img src="${product.Image || 'https://via.placeholder.com/300'}" alt="${product.Title}">
        <h3>${product.Title}</h3>
        <p>${product.Description || ''}</p>
        <p class="price">$${product.Price || '0.00'}</p>
        <a href="product.html?id=${index}" class="button">View</a>
      `;
      container.appendChild(card);
    });
  });
}

// ===== RENDER SINGLE PRODUCT =====
function renderProductDetail() {
  const params = new URLSearchParams(window.location.search);
  const id = params.get("id");

  if (id === null) return;

  loadProducts(() => {
    const product = products[id];
    if (!product) return;

    document.getElementById("product-image").src = product.Image || "https://via.placeholder.com/400";
    document.getElementById("product-title").textContent = product.Title || "";
    document.getElementById("product-description").textContent = product.Description || "";
    document.getElementById("product-price").textContent = `$${product.Price || "0.00"}`;

    // Store product globally for addToCart()
    window.currentProduct = product;
  });
}

// ===== CART =====
function addToCart() {
  let cart = JSON.parse(localStorage.getItem("cart")) || [];
  cart.push(window.currentProduct);
  localStorage.setItem("cart", JSON.stringify(cart));
  alert("Added to cart!");
}

function renderCart() {
  const container = document.getElementById("cart-items");
  if (!container) return;

  let cart = JSON.parse(localStorage.getItem("cart")) || [];
  container.innerHTML = "";

  if (cart.length === 0) {
    container.innerHTML = "<p>Your cart is empty</p>";
    return;
  }

  cart.forEach((item, index) => {
    const div = document.createElement("div");
    div.innerHTML = `
      <p><strong>${item.Title}</strong> - $${item.Price || "0.00"}</p>
    `;
    container.appendChild(div);
  });
}

// ===== INIT =====
document.addEventListener("DOMContentLoaded", () => {
  if (document.getElementById("product-list")) renderProductList();
  if (document.getElementById("product-title")) renderProductDetail();
  if (document.getElementById("cart-items")) renderCart();
});
