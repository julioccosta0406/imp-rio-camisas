let filter = "todos";
let type = "todos";
let cart = JSON.parse(localStorage.getItem("imperioCart") || "[]");
let selected = null;

const $ = (selector) => document.querySelector(selector);
const grid = $("#grid");

function saveCart() {
  localStorage.setItem("imperioCart", JSON.stringify(cart));
  renderCart();
}

function labelCategory(category) {
  if (category === "brasileiros") return "🇧🇷 Brasileiro";
  if (category === "europeus") return "🇪🇺 Europeu";
  if (category === "selecoes") return "🌎 Seleção";
  return "Catálogo";
}

function typeLabel(value) {
  return value === "jogador" ? "Jogador" : "Torcedor";
}

function renderProducts() {
  const products = PRODUCTS.filter((product) => {
    const categoryOK = filter === "todos" || product.category === filter;
    const typeOK = type === "todos" || product.type === type;
    return categoryOK && typeOK;
  });

  if (!products.length) {
    grid.innerHTML = `<div class="empty">Nenhum modelo identificado nessa categoria.</div>`;
    return;
  }

  grid.innerHTML = products.map((product) => {
    const sizes = Array.isArray(product.sizes) ? product.sizes : [];

    return `
      <article class="card">
        <div class="pic">
          <img src="${product.image}" alt="${product.name}" loading="lazy">
        </div>
        <div class="cardInfo">
          <span class="tag">${labelCategory(product.category)} • ${typeLabel(product.type)}</span>
          <h3>${product.name}</h3>
          <div class="sizesTxt">Tamanhos disponíveis: ${sizes.length ? sizes.join(" • ") : "Esgotado"}</div>
          <button type="button" class="add" data-product-id="${product.id}" ${sizes.length ? "" : "disabled"}>${sizes.length ? "ESCOLHER TAMANHO" : "ESGOTADO"}</button>
        </div>
      </article>`;
  }).join("");
}

/* ---------- Seletor de tamanho ---------- */
function openSizeModal(productId) {
  selected = PRODUCTS.find((product) => Number(product.id) === Number(productId));
  if (!selected) return;

  $("#mName").textContent = selected.name;

  const sizes = Array.isArray(selected.sizes) ? selected.sizes : [];
  $("#sizes").innerHTML = sizes.length
    ? sizes.map((size) => `
      <button type="button" class="sizeButton" data-size="${String(size).replace(/"/g, '&quot;')}">
        ${size}
      </button>
    `).join("")
    : `<div class="noSizes">Nenhum tamanho disponível.</div>`;

  $("#modal").classList.add("on");
  document.body.classList.add("modalOpen");
  requestAnimationFrame(() => $("#sizes button")?.focus());
}

function closeSizeModal() {
  $("#modal").classList.remove("on");
  document.body.classList.remove("modalOpen");
  selected = null;
}

function addToCart(productId, size) {
  const product = PRODUCTS.find((item) => Number(item.id) === Number(productId));
  if (!product) return;

  const existing = cart.find(
    (item) => Number(item.id) === Number(productId) && item.size === size
  );

  if (existing) {
    existing.qty += 1;
  } else {
    cart.push({
      id: product.id,
      name: product.name,
      type: product.type,
      size,
      qty: 1
    });
  }

  saveCart();
  closeSizeModal();
  openCart();
}

/* ---------- Carrinho ---------- */
function renderCart() {
  $("#count").textContent = cart.reduce((total, item) => total + item.qty, 0);

  if (!cart.length) {
    $("#cartItems").innerHTML = `<div class="empty">Seu carrinho está vazio.</div>`;
    return;
  }

  $("#cartItems").innerHTML = cart.map((item, index) => `
    <div class="item">
      <div>
        <b>${item.name}</b><br>
        <small>${typeLabel(item.type)} • tam. ${item.size}</small><br>
        <button type="button" class="remove" data-remove-index="${index}">Remover</button>
      </div>
      <div class="qty">
        <button type="button" data-qty-index="${index}" data-qty-change="-1">−</button>
        <span>${item.qty}</span>
        <button type="button" data-qty-index="${index}" data-qty-change="1">+</button>
      </div>
    </div>
  `).join("");
}

function changeQuantity(index, change) {
  if (!cart[index]) return;
  cart[index].qty += change;
  if (cart[index].qty <= 0) cart.splice(index, 1);
  saveCart();
}

function removeFromCart(index) {
  cart.splice(index, 1);
  saveCart();
}

function openCart() {
  $("#cart").classList.add("open");
  $("#shade").classList.add("on");
}

function closeCart() {
  $("#cart").classList.remove("open");
  $("#shade").classList.remove("on");
}

/* ---------- Eventos ---------- */
document.addEventListener("click", (event) => {
  const sizeButton = event.target.closest("#sizes .sizeButton");
  if (sizeButton && selected) {
    addToCart(selected.id, sizeButton.dataset.size);
    return;
  }

  const productButton = event.target.closest(".add[data-product-id]");
  if (productButton) {
    openSizeModal(productButton.dataset.productId);
    return;
  }

  const removeButton = event.target.closest("[data-remove-index]");
  if (removeButton) {
    removeFromCart(Number(removeButton.dataset.removeIndex));
    return;
  }

  const qtyButton = event.target.closest("[data-qty-index]");
  if (qtyButton) {
    changeQuantity(
      Number(qtyButton.dataset.qtyIndex),
      Number(qtyButton.dataset.qtyChange)
    );
  }
});

document.querySelectorAll(".filters button").forEach((button) => {
  button.addEventListener("click", () => {
    document.querySelectorAll(".filters button").forEach((item) => item.classList.remove("active"));
    button.classList.add("active");
    filter = button.dataset.cat;
    renderProducts();
  });
});

$("#type").addEventListener("change", (event) => {
  type = event.target.value;
  renderProducts();
});

$("#openCart").addEventListener("click", openCart);
$("#closeCart").addEventListener("click", closeCart);
$("#shade").addEventListener("click", closeCart);
$("#closeModal").addEventListener("click", closeSizeModal);

$("#modal").addEventListener("click", (event) => {
  if (event.target === $("#modal")) closeSizeModal();
});

$("#clear").addEventListener("click", () => {
  cart = [];
  saveCart();
});

document.addEventListener("keydown", (event) => {
  if (event.key === "Escape") {
    closeSizeModal();
    closeCart();
  }
});

$("#checkout").addEventListener("click", () => {
  if (!cart.length) {
    alert("Seu carrinho está vazio.");
    return;
  }

  const phone = "5511914623625"; // TROQUE pelo WhatsApp da loja
  const message = encodeURIComponent(
    "Olá! Quero fazer um pedido na Império Camisas:\n\n" +
    cart.map((item) =>
      `• ${item.name} — ${typeLabel(item.type)} — tamanho ${item.size} — qtd. ${item.qty}`
    ).join("\n")
  );

  window.open(`https://wa.me/${phone}?text=${message}`, "_blank");
});

renderProducts();
renderCart();
