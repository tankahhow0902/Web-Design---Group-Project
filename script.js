//检查当前页面
function getPageID(){
  const pageID = document.querySelector('meta[name="page-id"]');
  if(pageID) return pageID.content;
}


function scrollToTarget(TargetID){
  document.getElementById(TargetID).scrollIntoView({ behavior: "smooth" });
}









const products = [
  { id: 1, name: "Hello Kitty", price: 89 },
  { id: 2, name: "Melody", price: 69 },
  { id: 3, name: "Kuromi", price: 89 },
  { id: 4, name: "Keroppi", price: 59 },
  { id: 5, name: "Pikachu", price: 99 },
  { id: 6, name: "Eevee", price: 99 },
  { id: 7, name: "Clodsire", price: 79 },
  { id: 8, name: "Buneary", price: 79 },
  { id: 9, name: "Tanjiro Kamado", price: 79 },
  { id: 10, name: "Nezuko Kamado", price: 79 },
  { id: 11, name: "Zenitsu Agatsuma", price: 79 },
  { id: 12, name: "Inosuke Hashibara", price: 79 },
  { id: 13, name: "Alex", price: 69 },
  { id: 14, name: "Creeper", price: 79 },
  { id: 15, name: "Sheep", price: 89 },
  { id: 16, name: "Enderman", price: 99 }
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
function checkout(amount) {
  document.getElementById("checkout-value").innerText = `RM ${amount}`;
  document.getElementById("checkout-overlay").style.display = "block";
  document.getElementById("checkout-close").onclick = closeModal;
  function handleKey(e) {
    if (e.key === "Escape") closeModal();
  }
  function mouseWheelHandler(e) {
    e.preventDefault();
  }
  document.addEventListener("keydown", handleKey);
  document.addEventListener('wheel', mouseWheelHandler, { passive: false });

  function closeModal() {
    document.getElementById("checkout-overlay").style.display = "none";
    document.removeEventListener('keydown', handleKey);
    document.removeEventListener('wheel', mouseWheelHandler);
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
  html += `
    </table>
    <div class="checkout-container">
      <button class="checkout-btn" onclick="checkout(${total})">Check Out</button>
    </div>
   `;
  container.innerHTML = html;
}

document.addEventListener("DOMContentLoaded", renderCart);
