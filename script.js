//检查当前页面
function getPageID(){
  const pageID = document.querySelector('meta[name="page-id"]');
  if(pageID) return pageID.content;
}


function scrollToTarget(TargetID){
  document.getElementById(TargetID).scrollIntoView({ behavior: "smooth" });
}









const products = [
  { id: 1, name: "Hello Kitty", price: 100 },
  { id: 2, name: "Kuromi", price: 120 },
  { id: 3, name: "Melody", price: 80 },
  { id: 4, name: "S1P4", price: 150 },
  { id: 5, name: "S2P1", price: 200 },
  { id: 6, name: "S2P2", price: 90 },
  { id: 7, name: "S2P3", price: 110 },
  { id: 8, name: "S2P4", price: 130 },
  { id: 9, name: "S3P1", price: 100 },
  { id: 10, name: "S3P2", price: 120 },
  { id: 11, name: "S3P3", price: 80 },
  { id: 12, name: "S3P4", price: 150 },
  { id: 13, name: "S4P1", price: 200 },
  { id: 14, name: "S4P2", price: 90 },
  { id: 15, name: "S4P3", price: 110 },
  { id: 16, name: "S4P4", price: 130 }
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

function confirmRemoveFromCart(itemId) {
  const item = cart.find(p => p.id === itemId);
  document.getElementById("modal-text").innerText = `Remove ${item.name} from cart?`;
  document.getElementById("modal-overlay").style.display = "block";
  document.getElementById("modal-confirm").onclick = function() {
    removeFromCart(itemId);
    closeModal();
  };
  document.getElementById("modal-cancel").onclick = closeModal;
  function handleKey(e) {
    if (e.key === "Escape") {
      closeModal();
    } else if (e.key === "Enter") {
      removeFromCart(itemId);
      closeModal();
    }
  }
  function mouseWheelHandler(e) {
    e.preventDefault();
  }
  document.addEventListener("keydown", handleKey);
  document.addEventListener('wheel', mouseWheelHandler, { passive: false });

  function closeModal() {
    document.getElementById("modal-overlay").style.display = "none";
    document.removeEventListener('keydown', handleKey);
    document.removeEventListener('wheel', mouseWheelHandler);
  }
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
        <td class="remove-cell"> <button class="remove-btn" onclick="confirmRemoveFromCart(${item.id})">X</button> </td>
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
