const PROMO_PRODUCTS = [
  42,
  68,
  69,
  97,
];
const PROMO_PRICE = 180.00;

PRODUCTS.forEach((product) => {
  if (product.price === undefined || product.price === null) {
    product.price = 209.90;
  }
});
/* =========================================================
   IMPÉRIO CAMISAS
   SCRIPT PRINCIPAL
   ========================================================= */

/* ---------- CONFIGURAÇÕES ---------- */

// Preço padrão.
// Depois você pode colocar preços individuais no index.html
// usando: "price": 199.90
const PRECO_PADRAO = 199.90;

// WhatsApp da loja
const WHATSAPP_NUMBER = "5511914623625";


/* ---------- ESTADO DO SITE ---------- */
let promoOnly = false;
let filter = "todos";
let type = "todos";
let search = "";
let priceFilter = "todos";

let cart = JSON.parse(
  localStorage.getItem("imperioCart") || "[]"
);

let selected = null;


/* ---------- ELEMENTOS ---------- */

const $ = (selector) => document.querySelector(selector);

const grid = $("#grid");
const cartElement = $("#cart");
const cartItems = $("#cartItems");
const cartCount = $("#count");
const shade = $("#shade");

const modal = $("#modal");
const modalName = $("#mName");
const sizesContainer = $("#sizes");


/* =========================================================
   FUNÇÕES DE PREÇO
   ========================================================= */

function getProductPrice(product) {
  const price = Number(product?.price);

  if (Number.isFinite(price) && price > 0) {
    return price;
  }

  return PRECO_PADRAO;
}


function formatPrice(value) {
  return Number(value || 0).toLocaleString("pt-BR", {
    style: "currency",
    currency: "BRL"
  });
}


/* =========================================================
   LOCAL STORAGE
   ========================================================= */

function saveCart() {
  localStorage.setItem(
    "imperioCart",
    JSON.stringify(cart)
  );

  renderCart();
}


/* =========================================================
   CATEGORIA E TIPO
   ========================================================= */

function labelCategory(category) {

  if (category === "brasileiros") {
    return "🇧🇷 Brasileiro";
  }

  if (category === "europeus") {
    return "🇪🇺 Europeu";
  }

  if (category === "selecoes") {
    return "🌎 Seleção";
  }

  return "Catálogo";
}


function typeLabel(value) {
  return value === "jogador"
    ? "Jogador"
    : "Torcedor";
}



const promoButton = document.querySelector(".promo-btn");

if (promoButton) {
  promoButton.addEventListener("click", (event) => {
    event.preventDefault();

    promoOnly = true;

    renderProducts();

    document
      .querySelector("#catalogo")
      ?.scrollIntoView({
        behavior: "smooth"
      });
  });
}
// Preenche somente os produtos que ainda não possuem preço
/* =========================================================
   PRODUTOS
   ========================================================= */

function renderProducts() {
 const products = PRODUCTS
  .filter((product) => {

    if (
      promoOnly &&
      !PROMO_PRODUCTS.includes(product.id)
    ) {
      return false;
    }

    // resto dos seus filtros...

      const categoryOK =
        filter === "todos" || product.category === filter;

      const typeOK =
        type === "todos" || product.type === type;

      const priceOK =
        priceFilter === "todos" ||
        Number(product.price || 0) <= Number(priceFilter);

      const searchText = search.trim().toLowerCase();

      const nameOK =
        product.name
          .toLowerCase()
          .includes(searchText);

      const sizeOK =
        Array.isArray(product.sizes) &&
        product.sizes.some(size =>
          String(size).toLowerCase() === searchText
        );

      const searchOK =
        !searchText || nameOK || sizeOK;

      return (
        categoryOK &&
        typeOK &&
        priceOK &&
        searchOK
      );
    })

    // ORDEM ALFABÉTICA
    .sort((a, b) =>
      a.name.localeCompare(
        b.name,
        "pt-BR",
        { sensitivity: "base" }
      )
    );

  if (!products.length) {
    grid.innerHTML = `
      <div class="empty">
        Nenhuma camisa encontrada com esses filtros.
      </div>
    `;
    return;
  }

  grid.innerHTML = products.map((product) => {

    const sizes =
      Array.isArray(product.sizes)
        ? product.sizes
        : [];

    const price =
      Number(product.price || 0).toLocaleString(
        "pt-BR",
        {
          style: "currency",
          currency: "BRL"
        }
      );

      const isPromo = PROMO_PRODUCTS.includes(product.id);

    return `
      <article class="card">

        <div class="pic">
          <img
            src="${product.image}"
            alt="${product.name}"
            loading="lazy"
          >
        </div>

        <div class="cardInfo">

          <span class="tag">
            ${labelCategory(product.category)}
            •
            ${typeLabel(product.type)}
          </span>

          <h3>${product.name}</h3>

          <div class="price">
            ${price}
          </div>

          <div class="sizesTxt">
            Tamanhos disponíveis:
            ${
              sizes.length
                ? sizes.join(" • ")
                : "Esgotado"
            }
          </div>

          <button
            type="button"
            class="add"
            data-product-id="${product.id}"
            ${sizes.length ? "" : "disabled"}
          >
            ${
              sizes.length
                ? "ESCOLHER TAMANHO"
                : "ESGOTADO"
            }
          </button>

        </div>
      </article>
    `;
  }).join("");

  grid
    .querySelectorAll(".card .pic")
    .forEach((pic, index) => {
      pic.addEventListener("click", () => {
        openSizeModal(products[index].id);
      });
    });



  if (!products.length) {

    grid.innerHTML = `
      <div class="empty">
        Nenhum modelo encontrado.
      </div>
    `;

    return;
  }


  grid.innerHTML = products
    .map((product) => {

      const sizes =
        Array.isArray(product.sizes)
          ? product.sizes
          : [];

      const price =
        getProductPrice(product);


      return `
        <article class="card">

          <div class="pic">
            <img
              src="${product.image}"
              alt="${product.name}"
              loading="lazy"
            >
          </div>

          <div class="cardInfo">

            <span class="tag">
              ${labelCategory(product.category)}
              •
              ${typeLabel(product.type)}
            </span>

            <h3>
              ${product.name}
            </h3>

<div class="price">
  ${
    PROMO_PRODUCTS.includes(Number(product.id))
      ? `
        <span class="old-price">${formatPrice(price)}</span>
        <span class="promo-price">${formatPrice(PROMO_PRICE)}</span>
      `
      : formatPrice(price)
  }
</div> 

            <div class="sizesTxt">
              Tamanhos disponíveis:
              ${
                sizes.length
                  ? sizes.join(" • ")
                  : "Esgotado"
              }
            </div>

            <button
              type="button"
              class="add"
              data-product-id="${product.id}"
              ${sizes.length ? "" : "disabled"}
            >
              ${
                sizes.length
                  ? "ESCOLHER TAMANHO"
                  : "ESGOTADO"
              }
            </button>

          </div>

        </article>
      `;
    })
    .join("");


  /* Clique na foto */

  grid
    .querySelectorAll(".card .pic")
    .forEach((pic, index) => {

      pic.addEventListener("click", () => {

        openSizeModal(
          products[index].id
        );

      });

    });
}


/* =========================================================
   MODAL DE TAMANHO
   ========================================================= */

function openSizeModal(productId) {

  selected = PRODUCTS.find(
    (product) =>
      Number(product.id) === Number(productId)
  );

  if (!selected) {
    return;
  }


  modalName.textContent =
    selected.name;


  const sizes =
    Array.isArray(selected.sizes)
      ? selected.sizes
      : [];


  if (!sizes.length) {

    sizesContainer.innerHTML = `
      <div class="noSizes">
        Nenhum tamanho disponível.
      </div>
    `;

  } else {

    sizesContainer.innerHTML =
      sizes
        .map((size) => {

          const safeSize =
            String(size)
              .replace(/"/g, "&quot;");

          return `
            <button
              type="button"
              class="sizeButton"
              data-size="${safeSize}"
            >
              ${size}
            </button>
          `;

        })
        .join("");

  }


  modal.classList.add("on");

  document.body.classList.add(
    "modalOpen"
  );


  requestAnimationFrame(() => {

    const firstButton =
      $("#sizes button");

    if (firstButton) {
      firstButton.focus();
    }

  });
}


function closeSizeModal() {

  modal.classList.remove("on");

  document.body.classList.remove(
    "modalOpen"
  );

  selected = null;
}


/* =========================================================
   ADICIONAR AO CARRINHO
   ========================================================= */

function addToCart(productId, size) {

  const product =
    PRODUCTS.find(
      (item) =>
        Number(item.id) ===
        Number(productId)
    );


  if (!product) {
    return;
  }


  const price =
    getProductPrice(product);
const isPromo = PROMO_PRODUCTS.includes(Number(product.id));

const displayPrice = isPromo
  ? PROMO_PRICE
  : price;

  /*
    Verifica se já existe
    o mesmo produto + tamanho
  */

  const existing =
    cart.find(
      (item) =>
        Number(item.id) ===
          Number(productId) &&
        item.size === size
    );


  if (existing) {

    existing.qty += 1;

    /*
      Garante que carrinhos antigos
      também recebam preço.
    */

    existing.price =
      getProductPrice(existing);

  } else {

    cart.push({

      id: product.id,

      name: product.name,

      type: product.type,

      size: size,

      price: price,

      qty: 1

    });

  }


  saveCart();

  closeSizeModal();

  openCart();
}


/* =========================================================
   TOTAL DO CARRINHO
   ========================================================= */

function getCartTotal() {

  return cart.reduce(
    (total, item) => {

      const price =
        Number(item.price) ||
        PRECO_PADRAO;

      const qty =
        Number(item.qty) || 0;

      return total +
        price * qty;

    },
    0
  );
}


/* =========================================================
   QUANTIDADE TOTAL
   ========================================================= */

function getCartQuantity() {

  return cart.reduce(
    (total, item) => {

      return total +
        (Number(item.qty) || 0);

    },
    0
  );
}


/* =========================================================
   CARRINHO
   ========================================================= */

function renderCart() {

  /* Quantidade no botão */

  cartCount.textContent =
    getCartQuantity();


  /* Carrinho vazio */

  if (!cart.length) {

    cartItems.innerHTML = `
      <div class="empty">
        Seu carrinho está vazio.
      </div>
    `;

    updateCartTotal();

    return;
  }


  /* Produtos */

  cartItems.innerHTML =
    cart
      .map((item, index) => {

        const price =
          Number(item.price) ||
          PRECO_PADRAO;

        const qty =
          Number(item.qty) || 1;

        const subtotal =
          price * qty;


        return `
          <div class="item">

            <div class="itemInfo">

              <b>
                ${item.name}
              </b>

              <br>

              <small>
                ${typeLabel(item.type)}
                • tam. ${item.size}
              </small>

              <br>

              <small>
                ${formatPrice(price)} cada
              </small>

              <br>

              <small>
                Subtotal:
                <strong>
                  ${formatPrice(subtotal)}
                </strong>
              </small>

              <br>

              <button
                type="button"
                class="remove"
                data-remove-index="${index}"
              >
                Remover
              </button>

            </div>


            <div class="qty">

              <button
                type="button"
                data-qty-index="${index}"
                data-qty-change="-1"
              >
                −
              </button>

              <span>
                ${qty}
              </span>

              <button
                type="button"
                data-qty-index="${index}"
                data-qty-change="1"
              >
                +
              </button>

            </div>

          </div>
        `;

      })
      .join("");


  updateCartTotal();
}


/* =========================================================
   ATUALIZAR TOTAL VISUAL
   ========================================================= */

function updateCartTotal() {

  const total =
    formatPrice(
      getCartTotal()
    );


  /*
    Seu HTML atual possui:
    .cartFoot .total b
  */

  const totalElement =
    document.querySelector(
      ".cartFoot .total b"
    );


  if (totalElement) {

    totalElement.textContent =
      total;

  }
}


/* =========================================================
   ALTERAR QUANTIDADE
   ========================================================= */

function changeQuantity(
  index,
  change
) {

  if (!cart[index]) {
    return;
  }


  cart[index].qty =
    (Number(cart[index].qty) || 0) +
    change;


  if (cart[index].qty <= 0) {

    cart.splice(index, 1);

  }


  saveCart();
}


/* =========================================================
   REMOVER PRODUTO
   ========================================================= */

function removeFromCart(index) {

  if (!cart[index]) {
    return;
  }


  cart.splice(index, 1);

  saveCart();
}


/* =========================================================
   ABRIR CARRINHO
   ========================================================= */

function openCart() {

  cartElement.classList.add(
    "open"
  );

  shade.classList.add(
    "on"
  );
}


/* =========================================================
   FECHAR CARRINHO
   ========================================================= */

function closeCart() {

  cartElement.classList.remove(
    "open"
  );

  shade.classList.remove(
    "on"
  );
}


/* =========================================================
   EVENTOS
   ========================================================= */

document.addEventListener(
  "click",
  (event) => {

    /* ---------- Tamanho ---------- */

    const sizeButton =
      event.target.closest(
        "#sizes .sizeButton"
      );


    if (
      sizeButton &&
      selected
    ) {

      addToCart(
        selected.id,
        sizeButton.dataset.size
      );

      return;
    }


    /* ---------- Produto ---------- */

    const productButton =
      event.target.closest(
        ".add[data-product-id]"
      );


    if (productButton) {

      openSizeModal(
        productButton.dataset.productId
      );

      return;
    }


    /* ---------- Remover ---------- */

    const removeButton =
      event.target.closest(
        "[data-remove-index]"
      );


    if (removeButton) {

      removeFromCart(
        Number(
          removeButton.dataset
            .removeIndex
        )
      );

      return;
    }


    /* ---------- Quantidade ---------- */

    const qtyButton =
      event.target.closest(
        "[data-qty-index]"
      );


    if (qtyButton) {

      changeQuantity(

        Number(
          qtyButton.dataset
            .qtyIndex
        ),

        Number(
          qtyButton.dataset
            .qtyChange
        )

      );

    }

  }
);


/* =========================================================
   FILTROS
   ========================================================= */

document
  .querySelectorAll(
    ".filters button"
  )
  .forEach((button) => {

    button.addEventListener(
      "click",
      () => {

        promoOnly = false;

        document
          .querySelectorAll(
            ".filters button"
          )
          .forEach((item) => {

            item.classList.remove(
              "active"
            );

          });


        button.classList.add(
          "active"
        );


        filter =
          button.dataset.cat;


        renderProducts();

      }
    );

  });


/* =========================================================
   FILTRO TORCEDOR / JOGADOR
   ========================================================= */

const typeSelect =
  $("#type");


if (typeSelect) {

  typeSelect.addEventListener(
    "change",
    (event) => {

      type =
        event.target.value;

      renderProducts();

    }
  );

  $("#priceFilter").addEventListener("change", (event) => {
    priceFilter = event.target.value;
    renderProducts();
});

}


/* =========================================================
   BOTÃO CARRINHO
   ========================================================= */

const openCartButton =
  $("#openCart");


if (openCartButton) {

  openCartButton.addEventListener(
    "click",
    openCart
  );

}


const closeCartButton =
  $("#closeCart");


if (closeCartButton) {

  closeCartButton.addEventListener(
    "click",
    closeCart
  );

}


if (shade) {

  shade.addEventListener(
    "click",
    closeCart
  );

}


/* =========================================================
   FECHAR MODAL
   ========================================================= */

const closeModalButton =
  $("#closeModal");


if (closeModalButton) {

  closeModalButton.addEventListener(
    "click",
    closeSizeModal
  );

}


if (modal) {

  modal.addEventListener(
    "click",
    (event) => {

      if (
        event.target === modal
      ) {

        closeSizeModal();

      }

    }
  );

}


/* =========================================================
   LIMPAR CARRINHO
   ========================================================= */

const clearButton =
  $("#clear");


if (clearButton) {

  clearButton.addEventListener(
    "click",
    () => {

      cart = [];

      saveCart();

    }
  );

}


/* =========================================================
   TECLA ESC
   ========================================================= */

document.addEventListener(
  "keydown",
  (event) => {

    if (event.key === "Escape") {

      closeSizeModal();

      closeCart();

    }

  }
);


/* =========================================================
   PESQUISA
   ========================================================= */

const searchInput =
  $("#search");

const clearSearch =
  $("#clearSearch");


if (searchInput) {

  searchInput.addEventListener(
    "input",
    () => {

      search =
        searchInput.value;

      renderProducts();

    }
  );

}


if (clearSearch) {

  clearSearch.addEventListener(
    "click",
    () => {

      if (searchInput) {

        searchInput.value = "";

        search = "";

        renderProducts();

        searchInput.focus();

      }

    }
  );

}


/* =========================================================
   WHATSAPP
   ========================================================= */

const checkoutButton =
  $("#checkout");


if (checkoutButton) {

  checkoutButton.addEventListener(
    "click",
    () => {

      if (!cart.length) {

        alert(
          "Seu carrinho está vazio."
        );

        return;

      }


      const total =
        formatPrice(
          getCartTotal()
        );


      const productsMessage =
        cart
          .map((item) => {

            const price =
              Number(item.price) ||
              PRECO_PADRAO;

            const subtotal =
              price * item.qty;


            return (
              `• ${item.qty}x ` +
              `${item.name} ` +
              `— ${typeLabel(item.type)} ` +
              `— tamanho ${item.size} ` +
              `— ${formatPrice(subtotal)}`
            );

          })
          .join("\n");


      const message = encodeURIComponent(

        "Olá! Quero fazer um pedido na Império Camisas:\n\n" +

        productsMessage +

        "\n\n" +

        `TOTAL: ${total}`

      );


      window.open(
        `https://wa.me/${WHATSAPP_NUMBER}?text=${message}`,
        "_blank"
      );

    }
  );

}


/* =========================================================
   CORREÇÃO DE CARRINHOS ANTIGOS
   ========================================================= */

/*
  Se você já tinha produtos no carrinho antes
  de colocar os preços, eles não tinham a propriedade
  "price".

  Aqui adicionamos automaticamente o preço padrão.
*/

cart.forEach((item) => {

  if (
    !Number.isFinite(
      Number(item.price)
    ) ||
    Number(item.price) <= 0
  ) {

    item.price =
      PRECO_PADRAO;

  }

});


/* Salva novamente o carrinho corrigido */

if (cart.length) {

  localStorage.setItem(
    "imperioCart",
    JSON.stringify(cart)
  );

}


/* =========================================================
   INICIAR SITE
   ========================================================= */

renderProducts();

renderCart();