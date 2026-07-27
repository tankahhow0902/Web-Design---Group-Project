//检查当前页面
function getPageID(){
  const pageID = document.querySelector('meta[name="page-id"]');
  if(pageID) return pageID.content;
}


function scrollToTarget(TargetID){
  document.getElementById(TargetID).scrollIntoView({ behavior: "smooth" });
}









const products = [
  { id: 1, name: "Product A", price: 100 },
  { id: 2, name: "Product B", price: 120 },
  { id: 3, name: "Product C", price: 80 },
  { id: 4, name: "Product D", price: 150 },
  { id: 5, name: "Product E", price: 200 },
  { id: 6, name: "Product F", price: 90 },
  { id: 7, name: "Product G", price: 110 },
  { id: 8, name: "Product H", price: 130 }
];

let cart = JSON.parse(localStorage.getItem("cart")) || [];

function saveCart() { localStorage.setItem("cart", JSON.stringify(cart)); }

function addToCart(itemId) {
  const item = cart.find(p => p.id === itemId);
  if (item) {
    item.qty++;
  } else {
    const product = products.find(p => p.id === itemId);
    if (product) cart.push({ id: product.id, name: product.name, price: product.price, qty: 1 });
  }
  saveCart();
}

function removeFromCart(itemId) {
  cart = cart.filter(p => p.id !== itemId);
  saveCart();
  renderCart();
}

function changeQuantity(itemId, delta) {
  const item = cart.find(p => p.id === itemId);
  if (!item) return;
  item.qty += delta;
  if (item.qty <= 0) {
    removeFromCart(itemId);
  } else {
    saveCart();
    renderCart();
  }
}

function renderCart() {
  const container = document.getElementById("item-container");
  if (cart.length === 0) {
    container.innerHTML = `<p class="empty-cart">Your cart is empty</p>`;
    return;
  }

  let html = `
    <table class="cart-table">
      <tr>
        <th>Item</th>
        <th style="width:15%;">Quantity</th>
        <th style="width:12%;">Price</th>
        <th style="width:5%;"></th>
      </tr>
  `;

  cart.forEach(item => {
    html += `
      <tr>
        <td class="item-cell"> <span class="item-name">${item.name}</span> <span class="unit-price">RM${item.price}</span> </td>
        <td class="quantity-cell">
          <button class="qty-btn" onclick="changeQuantity(${item.id}, -1)">-</button>
          ${item.qty}
          <button class="qty-btn" onclick="changeQuantity(${item.id}, 1)">+</button>
        </td>
        <td class="price-cell">RM${item.price * item.qty}</td>
        <td class="remove-cell"> <button class="remove-btn" onclick="removeFromCart(${item.id})">X</button> </td>
      </tr>
    `;
  });

  const total = cart.reduce((sum, item) => sum + item.price * item.qty, 0);
  html += `
    <tr>
      <td></td>
      <td class="total-label">Total(Tax Included)</td>
      <td class="total-amount">RM${total}</td>
      <td></td>
    </tr>
  `;
  html += "</table>";
  container.innerHTML = html;
}

document.addEventListener("DOMContentLoaded", renderCart);
