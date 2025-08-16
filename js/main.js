// ========================
// CONFIG: Add your CSV sheet URLs here
// ========================
const sheetUrls = [
  "https://docs.google.com/spreadsheets/d/e/2PACX-1vRNR2S9ChRZ0QgYCH4EpAUK7KyVP-VwS4tTQhChdsGkA7h0sQNj0fjNvj-tDiAre66zzY6hIsKAdB-1/pub?gid=0&single=true&output=csv",
  "https://docs.google.com/spreadsheets/d/e/2PACX-1vRNR2S9ChRZ0QgYCH4EpAUK7KyVP-VwS4tTQhChdsGkA7h0sQNj0fjNvj-tDiAre66zzY6hIsKAdB-1/pub?gid=1941135183&single=true&output=csv",
  "https://docs.google.com/spreadsheets/d/e/2PACX-1vRNR2S9ChRZ0QgYCH4EpAUK7KyVP-VwS4tTQhChdsGkA7h0sQNj0fjNvj-tDiAre66zzY6hIsKAdB-1/pub?gid=10727842&single=true&output=csv"
  // 👆 add more GIDs as needed
];

let allProducts = [];

// ========================
// Fetch + Parse CSVs
// ========================
async function loadProducts() {
  const fetches = sheetUrls.map(url =>
    fetch(url)
      .then(res => res.text())
      .then(csv => new Promise((resolve, reject) => {
        Papa.parse(csv, {
          header: true,
          skipEmptyLines: true,
          complete: results => resolve(results.data),
          error: err => reject(err)
        });
      }))
      .catch(err => {
        console.error("Error fetching sheet:", url, err);
        return [];
      })
  );

  const results = await Promise.all(fetches);
  allProducts = results.flat(); // merge all sheets into one list

  renderProducts(allProducts);
  populateSizeFilter(allProducts);
}

// ========================
// Render Products
// ========================
function renderProducts(products) {
  const grid = document.getElementById("product-grid");
  if (!grid) return;

  grid.innerHTML = "";

  if (products.length === 0) {
    grid.innerHTML = "<p>No products found.</p>";
    return;
  }

  products.forEach(p => {
    const sizes = p.Size ? p.Size.split(",").map(s => s.trim()).join(", ") : "N/A";

    const card = document.createElement("div");
    card.className = "product-card";

    card.innerHTML = `
      <img src="${p.Image || "https://via.placeholder.com/300"}" alt="${p.Name || "Product"}" />
      <h3>${p.Name || "Unnamed Product"}</h3>
      <p class="price">${p.Price ? `$${p.Price}` : "Price not available"}</p>
      <p>Sizes: ${sizes}</p>
    `;

    grid.appendChild(card);
  });
}

// ========================
// Search + Filter
// ========================
function setupSearchAndFilter() {
  const searchInput = document.getElementById("searchInput");
  const sizeFilter = document.getElementById("sizeFilter");

  if (!searchInput || !sizeFilter) return;

  function applyFilters() {
    const query = searchInput.value.toLowerCase();
    const selectedSize = sizeFilter.value;

    const filtered = allProducts.filter(p => {
      const matchesSearch = p.Name?.toLowerCase().includes(query);

      let matchesSize = true;
      if (selectedSize) {
        const sizes = p.Size ? p.Size.split(",").map(s => s.trim().toLowerCase()) : [];
        matchesSize = sizes.includes(selectedSize.toLowerCase());
      }

      return matchesSearch && matchesSize;
    });

    renderProducts(filtered);
  }

  searchInput.addEventListener("input", applyFilters);
  sizeFilter.addEventListener("change", applyFilters);
}

function populateSizeFilter(products) {
  const sizeFilter = document.getElementById("sizeFilter");
  if (!sizeFilter) return;

  // Flatten all sizes into a single unique list
  let sizes = [];
  products.forEach(p => {
    if (p.Size) {
      const splitSizes = p.Size.split(",").map(s => s.trim());
      sizes = sizes.concat(splitSizes);
    }
  });

  sizes = [...new Set(sizes.filter(Boolean))].sort();

  sizeFilter.innerHTML = `<option value="">All Sizes</option>`;
  sizes.forEach(size => {
    sizeFilter.innerHTML += `<option value="${size}">${size}</option>`;
  });
}

// ========================
// Init
// ========================
document.addEventListener("DOMContentLoaded", () => {
  loadProducts();
  setupSearchAndFilter();
});
