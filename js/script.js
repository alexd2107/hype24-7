function addToCart(productName, price) {
  let cart = JSON.parse(localStorage.getItem('cart')) || [];
  cart.push({ name: productName, price: price });
  localStorage.setItem('cart', JSON.stringify(cart));
  alert(productName + ' added to cart!');
}

function loadCart() {
  let cart = JSON.parse(localStorage.getItem('cart')) || [];
  let cartItems = document.getElementById('cart-items');
  let cartTotal = document.getElementById('cart-total');
  let total = 0;

  if (cart.length === 0) {
    cartItems.innerHTML = '<p>Your cart is empty.</p>';
  } else {
    cartItems.innerHTML = '';
    cart.forEach(item => {
      let itemEl = document.createElement('p');
      itemEl.textContent = `${item.name} - $${item.price}`;
      cartItems.appendChild(itemEl);
      total += item.price;
    });
  }

  if (cartTotal) {
    cartTotal.textContent = total.toFixed(2);
  }
}

function clearCart() {
  localStorage.removeItem('cart');
  loadCart();
}

// Load cart contents when on the cart page
if (document.getElementById('cart-items')) {
  loadCart();
}
