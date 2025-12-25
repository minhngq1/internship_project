let shop = document.getElementById("shop");

let basket;
try {
  const data = localStorage.getItem("data");
  basket = data && data !== "undefined" && data !== "" ? JSON.parse(data) : [];
} catch (e) {
  basket = [];
}

let generateShop = () => {
  const items = Array.isArray(window.shopItemsData) ? window.shopItemsData : [];
  shop.innerHTML = items
    .map((x) => {
      let { id, name, price, desc, img } = x;
      let search = basket.find((y) => y.id === id) || {};
      return `
      <div id="product-id-${id}" class="item">
        <img width="220" src="${img}" alt="${name}">
        <div class="details">
          <h3>${name}</h3>
          <p>${desc}</p>
          <div class="price-quantity">
            <h2>$ ${price}</h2>
            <div class="buttons">
              <i onclick="decrement('${id}')" class="bi bi-dash-lg"></i>
              <div id="${id}" class="quantity">
                ${search.item === undefined ? 0 : search.item}
              </div>
              <i onclick="increment('${id}')" class="bi bi-plus-lg"></i>
            </div>
          </div>
        </div>
      </div>
      `;
    })
    .join("");
};

let increment = (id) => {
  let search = basket.find((x) => x.id === id);

  if (search === undefined) {
    basket.push({
      id: id,
      item: 1,
    });
  } else {
    search.item += 1;
  }

  update(id);
  localStorage.setItem("data", JSON.stringify(basket));
};

let decrement = (id) => {
  let search = basket.find((x) => x.id === id);

  if (search === undefined) return;
  if (search.item === 0) return;
  search.item -= 1;

  update(id);
  basket = basket.filter((x) => x.item !== 0);
  localStorage.setItem("data", JSON.stringify(basket));
};

let update = (id) => {
  let search = basket.find((x) => x.id === id);
  const el = document.getElementById(id);
  if (el) el.innerHTML = search?.item || 0;
  calculation();
};

let calculation = () => {
  let cartIcon = document.getElementById("cartAmount");
  let total = basket.length > 0 ? basket.map((x) => x.item).reduce((x, y) => x + y, 0) : 0;
  if (cartIcon) cartIcon.innerHTML = total;
};

// Fetch products from API; if fail set empty array
(async function init() {
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

  generateShop();
  calculation();
})();