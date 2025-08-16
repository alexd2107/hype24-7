// Google Sheets CSV (published link)
const sheetUrls = [
  "https://docs.google.com/spreadsheets/d/e/2PACX-1vRNR2S9ChRZ0QgYCH4EpAUK7KyVP-VwS4tTQhChdsGkA7h0sQNj0fjNvj-tDiAre66zzY6hIsKAdB-1/pub?gid=0&single=true&output=csv",
  "https://docs.google.com/spreadsheets/d/e/2PACX-1vRNR2S9ChRZ0QgYCH4EpAUK7KyVP-VwS4tTQhChdsGkA7h0sQNj0fjNvj-tDiAre66zzY6hIsKAdB-1/pub?gid=1941135183&single=true&output=csv"
];

// Fetch + parse CSV
async function fetchCSV(url) {
  const response = await fetch(url);
  if (!response.ok) throw new Error("Failed to load CSV: " + url);
  const text = await response.text();
  return Papa.parse(text, { header: true }).data;
}

// Load products from all sheets
async function loadProducts() {
  try {
    let allProducts = [];
    for (let url of sheetUrls) {
      const products = await fetchCSV(url);
      allProducts = allProducts.concat(products);
    }
    renderProducts(allProducts);
    setupFilters(allProducts);
  } catch (error) {
    console.error(error);
    document.getElementById("product-grid").innerHTML = "<p>Error loading products.</p>";
  }
}

// Render products into grid
function renderProducts(products) {
  const grid = document.getElementById("product-grid");
  grid.innerHTML = "";

  products.forEach(p => {
    if (!p.Name) return; // Skip empty rows

    const card = document.createElement("div");
    card.className = "product-card";
    card.innerHTML = `
      <img src="${p.Image || 'https://via.placeholder.com/300'}" alt="${p.Name}">
      <h3>${p.Name}</h3>
      <p class="price">${p.Price || ''}</p>
      <p>${p.Size || ''}</p>
    `;
    grid.appendChild(card);
  });
}

// Setup search + size filter
function setupFilters(products) {
  const searchInput = document.getElementById("search");
  const sizeFilter = document.getElementById("sizeFilter");

  // Populate size filter
  const sizes = [...new Set(products.map(p => p.Size).filter(Boolean))];
  sizes.forEach(size => {
    const option = document.createElement("option");
    option.value = size;
    option.textContent = size;
    sizeFilter.appendChild(option);
  });

  function applyFilters() {
    const search = searchInput.value.toLowerCase();
    const size = sizeFilter.value;
    const filtered = products.filter(p =>
      (!search || p.Name?.toLowerCase().includes(search)) &&
      (!size || p.Size === size)
    );
    renderProducts(filtered);
  }

  searchInput.addEventListener("input", applyFilters);
  sizeFilter.addEventListener("change", applyFilters);
}

document.addEventListener("DOMContentLoaded", loadProducts);
