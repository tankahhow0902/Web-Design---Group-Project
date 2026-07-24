// 商品列表 (8 个)
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
        container.innerHTML = "<p>Cart is empty</p>";
        return;
    }

    let html = "<table><tr><th>Item Name</th><th>Unit Price</th><th>Quantity</th><th>Price</th><th>Action</th></tr>";
    cart.forEach(item => {
        html += `
            <tr>
                <td>${item.name}</td>
                <td>${item.price}</td>
                <td>
                <button onclick="changeQuantity(${item.id}, -1)">-</button>
                ${item.qty}
                <button onclick="changeQuantity(${item.id}, 1)">+</button>
                </td>
                <td>${item.price * item.qty}</td>
                <td><button onclick="removeFromCart(${item.id})">Remove</button></td>
            </tr>
        `;
    });
    const total = cart.reduce((sum, item) => sum + item.price * item.qty, 0);
    html += `<tr><td colspan="3"><strong>Total</strong></td><td colspan="2"><strong>${total}</strong></td></tr>`;
    html += "</table>";

    container.innerHTML = html;
}

document.addEventListener("DOMContentLoaded", renderCart);


document.getElementById("menu-toggle").addEventListener("click", function() {
  document.querySelector(".nav-links").classList.toggle("active");
});
