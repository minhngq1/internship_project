let label = document.getElementById("label");
let ShoppingCart = document.getElementById("shopping-cart");

let basket;
try {
  const data = localStorage.getItem("data");
  basket = data && data !== "undefined" && data !== "" ? JSON.parse(data) : [];
} catch (e) {
  basket = [];
}

(async function initCart() {
  try {
    const resp = await fetch('api/products.php');
    if (resp.ok) {
      const data = await resp.json();
      if (Array.isArray(data) && data.length > 0) {
        window.shopItemsData = data;
      } else {
        window.shopItemsData = [];
      }
    } else {
      window.shopItemsData = [];
    }
  } catch (e) {
    window.shopItemsData = [];
  }

  calculation();
  generateCartItems();
  TotalAmount();
})();

function calculation() {
  const cartIcon = document.getElementById("cartAmount");
  const total = basket.length ? basket.map((x) => x.item).reduce((a, b) => a + b, 0) : 0;
  if (cartIcon) cartIcon.innerHTML = total;
}

function generateCartItems() {
  if (!ShoppingCart) return;
  if (basket.length === 0) {
    ShoppingCart.innerHTML = ``;
    label.innerHTML = `
      <h2>Cart is Empty</h2>
      <a href="index.html">
        <button class="HomeBtn">Back to home</button>
      </a>
    `;
    return;
  }

  const products = Array.isArray(window.shopItemsData) ? window.shopItemsData : [];

  ShoppingCart.innerHTML = basket
    .map((x) => {
      const { id, item } = x;
      const search = products.find((p) => p.id === id) || {};
      const img = search.img ? `src="${search.img}"` : "";
      const name = search.name || "";
      const price = search.price || 0;
      return `
        <div class="cart-item">
          <img width="100" ${img} alt="${name}" />
          <div class="details">
            <div class="title-price-x">
              <h4 class="title-price">
                <p>${name}</p>
                <p class="cart-item-price">$ ${price}</p>
              </h4>
              <i onclick="removeItem('${id}')" class="bi bi-x-lg"></i>
            </div>

            <div class="buttons">
              <i onclick="decrement('${id}')" class="bi bi-dash-lg"></i>
              <div id="${id}" class="quantity">${item}</div>
              <i onclick="increment('${id}')" class="bi bi-plus-lg"></i>
            </div>

            <h3>$ ${item * price}</h3>
          </div>
        </div>
      `;
    })
    .join("");
}

function increment(id) {
  let search = basket.find((x) => x.id === id);
  if (!search) {
    basket.push({ id: id, item: 1 });
  } else {
    search.item += 1;
  }
  localStorage.setItem("data", JSON.stringify(basket));
  generateCartItems();
  update(id);
}

function decrement(id) {
  let search = basket.find((x) => x.id === id);
  if (!search) return;
  if (search.item <= 0) return;
  search.item -= 1;
  basket = basket.filter((x) => x.item !== 0);
  localStorage.setItem("data", JSON.stringify(basket));
  generateCartItems();
  update(id);
}

function update(id) {
  const search = basket.find((x) => x.id === id);
  const el = document.getElementById(id);
  if (el) el.innerHTML = search?.item || 0;
  calculation();
  TotalAmount();
}

function removeItem(id) {
  basket = basket.filter((x) => x.id !== id);
  localStorage.setItem("data", JSON.stringify(basket));
  generateCartItems();
  calculation();
  TotalAmount();
}

function clearCart() {
  basket = [];
  localStorage.setItem("data", JSON.stringify(basket));
  generateCartItems();
  calculation();
  label.innerHTML = `
    <h2>Cart is Empty</h2>
    <a href="index.html">
      <button class="HomeBtn">Back to home</button>
    </a>
  `;
}

function checkout() {
  alert("Thank you for your purchase!");
  clearCart();
}

function TotalAmount() {
  if (basket.length === 0) {
    label.innerHTML = "";
    return;
  }
  const products = Array.isArray(window.shopItemsData) ? window.shopItemsData : [];
  const amount = basket
    .map((x) => {
      const product = products.find((p) => p.id === x.id) || {};
      return x.item * (product.price || 0);
    })
    .reduce((a, b) => a + b, 0);
  label.innerHTML = `
    <h2>Total Bill : $ ${amount}</h2>
    <button class="checkout" onclick="checkout()">Checkout</button>
    <button onclick="clearCart()" class="removeAll">Clear Cart</button>
  `;
}