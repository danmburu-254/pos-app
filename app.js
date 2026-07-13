const products = [
  { id: 1, name: "Coffee", price: 3.5, category: "Drinks" },
  { id: 2, name: "Tea", price: 2.75, category: "Drinks" },
  { id: 3, name: "Sandwich", price: 6.25, category: "Food" },
  { id: 4, name: "Blueberry Muffin", price: 4.0, category: "Bakery" },
  { id: 5, name: "Orange Juice", price: 3.25, category: "Drinks" },
  { id: 6, name: "Chocolate Bar", price: 1.8, category: "Snacks" },
  { id: 7, name: "Granola Cup", price: 3.95, category: "Breakfast" }
];

const cart = [];
const salesHistory = loadSalesHistory();
let discountApplied = false;

const productList = document.querySelector("#product-list");
const cartItems = document.querySelector("#cart-items");
const cartCount = document.querySelector("#cart-count");
const subtotalElement = document.querySelector("#subtotal");
const discountElement = document.querySelector("#discount");
const taxElement = document.querySelector("#tax");
const totalElement = document.querySelector("#total");
const amountPaidInput = document.querySelector("#amount-paid");
const changeDueElement = document.querySelector("#change-due");
const checkoutButton = document.querySelector("#checkout-button");
const discountButton = document.querySelector("#discount-button");
const receiptElement = document.querySelector("#receipt");
const salesHistoryElement = document.querySelector("#sales-history");
const salesCountElement = document.querySelector("#sales-count");

function formatMoney(amount) {
  return `$${amount.toFixed(2)}`;
}

function calculateTotals() {
  const itemCount = cart.reduce(function (total, item) {
    return total + item.quantity;
  }, 0);

  const subtotal = cart.reduce(function (total, item) {
    return total + item.price * item.quantity;
  }, 0);

  const discount = discountApplied ? subtotal * 0.1 : 0;
  const taxableAmount = subtotal - discount;
  const tax = taxableAmount * 0.08;
  const total = taxableAmount + tax;
  const amountPaid = Number(amountPaidInput.value) || 0;
  const changeDue = amountPaid >= total ? amountPaid - total : 0;

  return { itemCount, subtotal, discount, taxableAmount, tax, total, amountPaid, changeDue };
}

function loadSalesHistory() {
  const savedSales = localStorage.getItem("salesHistory");

  if (!savedSales) {
    return [];
  }

  return JSON.parse(savedSales);
}

function saveSalesHistory() {
  localStorage.setItem("salesHistory", JSON.stringify(salesHistory));
}

function renderProducts() {
  productList.innerHTML = "";

  products.forEach(function (product) {
    const productCard = document.createElement("article");
    productCard.className = "product-card";

    productCard.innerHTML = `
      <p class="product-category">${product.category}</p>
      <h3>${product.name}</h3>
      <p>${formatMoney(product.price)}</p>
      <button data-product-id="${product.id}">Add to cart</button>
    `;

    productList.appendChild(productCard);
  });
}

function findCartItem(productId) {
  return cart.find(function (item) {
    return item.id === productId;
  });
}

function addToCart(productId) {
  const product = products.find(function (item) {
    return item.id === productId;
  });

  const existingCartItem = findCartItem(productId);

  if (existingCartItem) {
    existingCartItem.quantity += 1;
  } else {
    cart.push({
      id: product.id,
      name: product.name,
      price: product.price,
      quantity: 1
    });
  }

  renderCart();
}

function decreaseQuantity(productId) {
  const existingCartItem = findCartItem(productId);

  if (!existingCartItem) {
    return;
  }

  existingCartItem.quantity -= 1;

  if (existingCartItem.quantity === 0) {
    removeFromCart(productId);
  } else {
    renderCart();
  }
}

function removeFromCart(productId) {
  const itemIndex = cart.findIndex(function (item) {
    return item.id === productId;
  });

  if (itemIndex !== -1) {
    cart.splice(itemIndex, 1);
    renderCart();
  }
}

function toggleDiscount() {
  discountApplied = !discountApplied;
  renderCart();
}

function renderCart() {
  cartItems.innerHTML = "";

  if (cart.length === 0) {
    cartItems.innerHTML = `<p class="empty-cart">No items yet.</p>`;
  } else {
    cart.forEach(function (item) {
      const cartRow = document.createElement("div");
      cartRow.className = "cart-row";

      cartRow.innerHTML = `
        <div>
          <strong>${item.name}</strong>
          <p>${item.quantity} × ${formatMoney(item.price)}</p>
        </div>
        <div class="cart-actions">
          <strong>${formatMoney(item.quantity * item.price)}</strong>
          <button data-action="decrease" data-product-id="${item.id}">−</button>
          <button data-action="increase" data-product-id="${item.id}">+</button>
          <button data-action="remove" data-product-id="${item.id}">Remove</button>
        </div>
      `;

      cartItems.appendChild(cartRow);
    });
  }

  const totals = calculateTotals();

  cartCount.textContent = `${totals.itemCount} item${totals.itemCount === 1 ? "" : "s"}`;
  subtotalElement.textContent = formatMoney(totals.subtotal);
  discountElement.textContent = `-${formatMoney(totals.discount)}`;
  taxElement.textContent = formatMoney(totals.tax);
  totalElement.textContent = formatMoney(totals.total);
  changeDueElement.textContent = formatMoney(totals.changeDue);
  discountButton.textContent = discountApplied ? "Remove 10% discount" : "Apply 10% discount";
  discountButton.classList.toggle("active", discountApplied);
}

function renderSalesHistory() {
  salesHistoryElement.innerHTML = "";
  salesCountElement.textContent = `${salesHistory.length} sale${salesHistory.length === 1 ? "" : "s"}`;

  if (salesHistory.length === 0) {
    salesHistoryElement.innerHTML = `<p class="empty-cart">No completed sales yet.</p>`;
    return;
  }

  salesHistory.forEach(function (sale) {
    const saleCard = document.createElement("article");
    saleCard.className = "sale-history-item";
    const saleDiscount = sale.discount || 0;

    const saleItems = sale.items.map(function (item) {
      return `<li>${item.quantity} × ${item.name}</li>`;
    }).join("");

    saleCard.innerHTML = `
      <p><strong>${sale.time}</strong></p>
      <p>Discount: -${formatMoney(saleDiscount)}</p>
      <p>Total: ${formatMoney(sale.total)}</p>
      <ul>${saleItems}</ul>
    `;

    salesHistoryElement.appendChild(saleCard);
  });
}

function buildReceiptItems() {
  return cart.map(function (item) {
    return `<li>${item.quantity} × ${item.name} — ${formatMoney(item.quantity * item.price)}</li>`;
  }).join("");
}

function recordCompletedSale(totals) {
  const completedSale = {
    time: new Date().toLocaleString(),
    items: cart.map(function (item) {
      return {
        name: item.name,
        quantity: item.quantity,
        price: item.price
      };
    }),
    discount: totals.discount,
    total: totals.total
  };

  salesHistory.unshift(completedSale);
  saveSalesHistory();
  renderSalesHistory();
}

function resetSale() {
  cart.length = 0;
  discountApplied = false;
  amountPaidInput.value = "";
  renderCart();
}

function checkout() {
  const totals = calculateTotals();

  if (cart.length === 0) {
    receiptElement.innerHTML = `<p class="receipt-warning">Add items before checkout.</p>`;
    return;
  }

  if (totals.amountPaid < totals.total) {
    receiptElement.innerHTML = `<p class="receipt-warning">Customer still owes ${formatMoney(totals.total - totals.amountPaid)}.</p>`;
    return;
  }

  receiptElement.innerHTML = `
    <h3>Receipt</h3>
    <ul>${buildReceiptItems()}</ul>
    <p><strong>Subtotal:</strong> ${formatMoney(totals.subtotal)}</p>
    <p><strong>Discount:</strong> -${formatMoney(totals.discount)}</p>
    <p><strong>Tax:</strong> ${formatMoney(totals.tax)}</p>
    <p><strong>Total:</strong> ${formatMoney(totals.total)}</p>
    <p><strong>Paid:</strong> ${formatMoney(totals.amountPaid)}</p>
    <p><strong>Change:</strong> ${formatMoney(totals.changeDue)}</p>
  `;

  recordCompletedSale(totals);
  resetSale();
}

productList.addEventListener("click", function (event) {
  if (event.target.matches("button")) {
    const productId = Number(event.target.dataset.productId);
    addToCart(productId);
  }
});

cartItems.addEventListener("click", function (event) {
  if (!event.target.matches("button")) {
    return;
  }

  const productId = Number(event.target.dataset.productId);
  const action = event.target.dataset.action;

  if (action === "increase") {
    addToCart(productId);
  }

  if (action === "decrease") {
    decreaseQuantity(productId);
  }

  if (action === "remove") {
    removeFromCart(productId);
  }
});

amountPaidInput.addEventListener("input", renderCart);
discountButton.addEventListener("click", toggleDiscount);
checkoutButton.addEventListener("click", checkout);

renderProducts();
renderCart();
renderSalesHistory();
