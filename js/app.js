/* ==========================================================================
   KREA 3D — catálogo + carrito + pedido por WhatsApp
   Actualización: Posavasos, Abrelatas y Llavero para foto
   ========================================================================== */

// ---------------------------------------------------------------------------
// 1) PRODUCTOS
// - price: usa 0 mientras el precio sea "A coordinar".
// - images: permite una o varias fotos por producto.
// ---------------------------------------------------------------------------
const products = [
  {
    id: "posavasos",
    name: "Posavasos 3D",
    faculty: "Hogar & Diseño",
    shortDescription:
      "Posavasos impresos en 3D con diseños de gatos y diferentes estilos. Ideales para darle un toque original a tu espacio.",
    price: 0,
    images: [
      "./assets/img/productos/posavasos-01.webp",
      "./assets/img/productos/posavasos-02.webp",
      "./assets/img/productos/posavasos-03.webp",
      "./assets/img/productos/posavasos-04.webp",
      "./assets/img/productos/posavasos-05.webp",
      "./assets/img/productos/posavasos-07.webp",
    ],
  },
  {
    id: "abrelatas",
    name: "Abrelatas 3D",
    faculty: "Accesorios",
    shortDescription:
      "Abrelatas con diseño de flor, fabricado mediante impresión 3D. Práctico, compacto y con un diseño diferente.",
    price: 0,
    images: [
      "./assets/img/productos/abrelatas-01.webp",
    ],
  },
  {
    id: "llavero-foto",
    name: "Llavero para foto",
    faculty: "Personalizados",
    shortDescription:
      "Llavero en forma de cámara con espacio para colocar una fotografía. Un detalle original para llevar tus recuerdos contigo.",
    price: 0,
    images: [
      "./assets/img/productos/llavero-foto-01.webp",
      "./assets/img/productos/llavero-foto-02.webp",
    ],
  },
];

// ---------------------------------------------------------------------------
// 2) CONFIGURACIÓN
// ---------------------------------------------------------------------------
const WHATSAPP_PHONE = "51957137229";
const CART_STORAGE_KEY = "krea3d_cart";

// ---------------------------------------------------------------------------
// 3) ESTADO
// ---------------------------------------------------------------------------
let cart = [];
let lastFocusedElement = null;

// ---------------------------------------------------------------------------
// 4) REFERENCIAS DOM
// ---------------------------------------------------------------------------
const productsGrid = document.getElementById("productsGrid");

const headerCartBtn = document.getElementById("headerCartBtn");
const cartCountEl = document.getElementById("cartCount");
const cartAmountEl = document.getElementById("cartAmount");

const cartBackdrop = document.getElementById("cartBackdrop");
const cartPanel = document.getElementById("cartPanel");
const cartItemsEl = document.getElementById("cartItems");
const cartTotalEl = document.getElementById("cartTotal");
const cartCloseBtn = document.getElementById("cartCloseBtn");
const checkoutBtn = document.getElementById("checkoutBtn");
const continueShoppingBtn = document.getElementById("continueShoppingBtn");

const toastContainer = document.getElementById("toastContainer");

// ---------------------------------------------------------------------------
// 5) ESTILOS DE GALERÍA
// Se inyectan desde JS para que esta actualización solo requiera reemplazar
// app.js y subir las nuevas imágenes.
// ---------------------------------------------------------------------------
function injectProductGalleryStyles() {
  if (document.getElementById("kreaProductGalleryStyles")) return;

  const style = document.createElement("style");
  style.id = "kreaProductGalleryStyles";
  style.textContent = `
    .product-image-gallery {
      position: relative;
      width: 100%;
      height: 100%;
      overflow: hidden;
    }

    .product-gallery-img {
      width: 100%;
      height: 100%;
      object-fit: cover;
      display: block;
    }

    .product-gallery-nav {
      position: absolute;
      inset: 0;
      display: flex;
      align-items: center;
      justify-content: space-between;
      padding: 0 10px;
      pointer-events: none;
      z-index: 3;
    }

    .product-gallery-btn {
      pointer-events: auto;
      width: 38px;
      height: 38px;
      border: 0;
      border-radius: 999px;
      background: rgba(255,255,255,.92);
      color: var(--krea-wine, #770716);
      box-shadow: 0 4px 14px rgba(0,0,0,.18);
      font-size: 1.35rem;
      line-height: 1;
      cursor: pointer;
      display: inline-flex;
      align-items: center;
      justify-content: center;
    }

    .product-gallery-counter {
      position: absolute;
      right: 10px;
      bottom: 10px;
      z-index: 4;
      border-radius: 999px;
      padding: 5px 9px;
      background: rgba(41,27,32,.78);
      color: #fff;
      font-size: .72rem;
      font-weight: 600;
      backdrop-filter: blur(4px);
    }

    .product-gallery-dots {
      position: absolute;
      left: 50%;
      bottom: 12px;
      transform: translateX(-50%);
      z-index: 4;
      display: flex;
      gap: 5px;
    }

    .product-gallery-dot {
      width: 6px;
      height: 6px;
      padding: 0;
      border: 0;
      border-radius: 50%;
      background: rgba(255,255,255,.6);
      box-shadow: 0 1px 4px rgba(0,0,0,.25);
    }

    .product-gallery-dot.active {
      background: #fff;
      transform: scale(1.25);
    }

    @media (max-width: 639px) {
      .product-image {
        aspect-ratio: 4 / 5;
      }

      .product-gallery-btn {
        width: 42px;
        height: 42px;
      }
    }
  `;
  document.head.appendChild(style);
}

// ---------------------------------------------------------------------------
// 6) PERSISTENCIA (localStorage)
// ---------------------------------------------------------------------------
function isValidCartItem(item) {
  return (
    item &&
    typeof item.key === "string" &&
    typeof item.id === "string" &&
    typeof item.name === "string" &&
    typeof item.price === "number" &&
    Number.isFinite(item.price) &&
    typeof item.qty === "number" &&
    Number.isInteger(item.qty) &&
    item.qty > 0
  );
}

function loadCart() {
  try {
    const saved = localStorage.getItem(CART_STORAGE_KEY);
    const parsed = saved ? JSON.parse(saved) : [];
    const validProductIds = new Set(products.map((product) => product.id));

    // Elimina automáticamente productos antiguos que ya no existen.
    cart = Array.isArray(parsed)
      ? parsed
          .filter(isValidCartItem)
          .filter((item) => validProductIds.has(item.id))
      : [];

    saveCart();
  } catch {
    cart = [];
    localStorage.removeItem(CART_STORAGE_KEY);
  }

  updateCartUI();
}

function saveCart() {
  localStorage.setItem(CART_STORAGE_KEY, JSON.stringify(cart));
}

// ---------------------------------------------------------------------------
// 7) UTILIDADES
// ---------------------------------------------------------------------------
function formatPrice(price) {
  return price > 0 ? `S/ ${price.toFixed(2)}` : "A coordinar";
}

function getProductMainImage(product) {
  return Array.isArray(product.images) && product.images.length
    ? product.images[0]
    : "./assets/img/logo/krea3d-logo.jpg";
}

// ---------------------------------------------------------------------------
// 8) RENDER DE PRODUCTOS
// ---------------------------------------------------------------------------
function renderProducts() {
  productsGrid.innerHTML = "";

  products.forEach((product) => {
    const card = document.createElement("article");
    card.className = "product-card";

    const priceClass = product.price > 0 ? "product-price" : "product-price tbd";
    const images = Array.isArray(product.images) ? product.images : [];
    const hasMultipleImages = images.length > 1;

    card.innerHTML = `
      <div class="product-image">
        <div class="product-image-placeholder">
          <span class="icon" aria-hidden="true">🧊</span>
          <span class="label">Krea 3D</span>
        </div>

        <div class="product-image-gallery" data-product-id="${product.id}">
          <img
            class="product-gallery-img"
            src="${getProductMainImage(product)}"
            alt="${product.name}"
            loading="lazy"
            width="570"
            height="760"
            data-index="0"
          />

          ${
            hasMultipleImages
              ? `
                <div class="product-gallery-nav">
                  <button
                    type="button"
                    class="product-gallery-btn gallery-prev"
                    aria-label="Foto anterior de ${product.name}"
                  >‹</button>
                  <button
                    type="button"
                    class="product-gallery-btn gallery-next"
                    aria-label="Siguiente foto de ${product.name}"
                  >›</button>
                </div>

                <div class="product-gallery-dots" aria-hidden="true">
                  ${images
                    .map(
                      (_, index) =>
                        `<span class="product-gallery-dot ${
                          index === 0 ? "active" : ""
                        }"></span>`
                    )
                    .join("")}
                </div>

                <span class="product-gallery-counter">1 / ${images.length}</span>
              `
              : ""
          }
        </div>
      </div>

      <div class="product-body">
        <span class="product-faculty">${product.faculty}</span>
        <h3 class="product-name">${product.name}</h3>
        <p class="product-desc">${product.shortDescription}</p>

        <div class="product-footer">
          <span class="${priceClass}">${formatPrice(product.price)}</span>
          <button type="button" class="btn-add" data-id="${product.id}">
            <span aria-hidden="true">+</span> Agregar
          </button>
        </div>
      </div>
    `;

    const galleryImg = card.querySelector(".product-gallery-img");

    galleryImg.addEventListener(
      "error",
      () => {
        galleryImg.classList.add("is-hidden");
      },
      { once: true }
    );

    if (hasMultipleImages) {
      let currentIndex = 0;
      const counter = card.querySelector(".product-gallery-counter");
      const dots = [...card.querySelectorAll(".product-gallery-dot")];

      const showImage = (newIndex) => {
        currentIndex = (newIndex + images.length) % images.length;
        galleryImg.src = images[currentIndex];
        galleryImg.dataset.index = String(currentIndex);
        counter.textContent = `${currentIndex + 1} / ${images.length}`;

        dots.forEach((dot, index) => {
          dot.classList.toggle("active", index === currentIndex);
        });
      };

      card.querySelector(".gallery-prev").addEventListener("click", (event) => {
        event.stopPropagation();
        showImage(currentIndex - 1);
      });

      card.querySelector(".gallery-next").addEventListener("click", (event) => {
        event.stopPropagation();
        showImage(currentIndex + 1);
      });

      // Swipe simple para móviles.
      let touchStartX = null;

      card
        .querySelector(".product-image-gallery")
        .addEventListener(
          "touchstart",
          (event) => {
            touchStartX = event.changedTouches[0].clientX;
          },
          { passive: true }
        );

      card
        .querySelector(".product-image-gallery")
        .addEventListener(
          "touchend",
          (event) => {
            if (touchStartX === null) return;
            const deltaX = event.changedTouches[0].clientX - touchStartX;

            if (Math.abs(deltaX) > 45) {
              showImage(currentIndex + (deltaX < 0 ? 1 : -1));
            }

            touchStartX = null;
          },
          { passive: true }
        );
    }

    productsGrid.appendChild(card);
  });

  productsGrid.querySelectorAll(".btn-add").forEach((btn) => {
    btn.addEventListener("click", () => {
      const id = btn.getAttribute("data-id");
      addToCart(id);

      const rect = btn.getBoundingClientRect();
      createBurst(rect.left + rect.width / 2, rect.top + rect.height / 2);
      bumpCartButton();
      showToast("Agregado al carrito");
    });
  });
}

// ---------------------------------------------------------------------------
// 9) LÓGICA DEL CARRITO
// ---------------------------------------------------------------------------
function addToCart(productId) {
  const product = products.find((p) => p.id === productId);
  if (!product) return;

  const existing = cart.find((item) => item.key === productId);

  if (existing) {
    existing.qty += 1;
  } else {
    cart.push({
      key: productId,
      id: product.id,
      name: product.name,
      faculty: product.faculty,
      price: product.price,
      image: getProductMainImage(product),
      qty: 1,
    });
  }

  saveCart();
  updateCartUI();
}

function updateQty(key, diff) {
  const item = cart.find((i) => i.key === key);
  if (!item) return;

  item.qty += diff;

  if (item.qty <= 0) {
    cart = cart.filter((i) => i.key !== key);
  }

  saveCart();
  updateCartUI();
}

function removeFromCart(key) {
  cart = cart.filter((i) => i.key !== key);
  saveCart();
  updateCartUI();
}

function getCartTotals() {
  const totalItems = cart.reduce((sum, item) => sum + item.qty, 0);
  const total = cart.reduce((sum, item) => sum + item.price * item.qty, 0);
  return { totalItems, total };
}

function updateCartUI() {
  const { totalItems, total } = getCartTotals();

  cartCountEl.textContent = totalItems;
  cartAmountEl.textContent = total > 0 ? `S/ ${total.toFixed(2)}` : "Pedido";
  cartTotalEl.textContent = total > 0 ? `S/ ${total.toFixed(2)}` : "A coordinar";
  checkoutBtn.disabled = cart.length === 0;

  cartItemsEl.innerHTML = "";

  if (cart.length === 0) {
    cartItemsEl.innerHTML = `
      <div class="cart-empty">
        <div class="icon" aria-hidden="true">🛒</div>
        <p>
          Tu carrito está vacío.<br />
          Agrega tus diseños favoritos y continúa tu pedido por WhatsApp.
        </p>
        <button
          type="button"
          class="btn btn-outline"
          id="emptyCartViewProducts"
        >
          Ver productos
        </button>
      </div>
    `;

    document
      .getElementById("emptyCartViewProducts")
      .addEventListener("click", () => {
        closeCart();
        document
          .getElementById("productos")
          .scrollIntoView({ behavior: "smooth" });
      });

    return;
  }

  cart.forEach((item) => {
    const row = document.createElement("div");
    row.className = "cart-item";

    row.innerHTML = `
      <div class="cart-item-thumb">
        <span aria-hidden="true">🧊</span>
        <img src="${item.image}" alt="${item.name}" />
      </div>

      <div class="cart-item-main">
        <div class="cart-item-name">${item.name}</div>
        <div class="cart-item-faculty">${item.faculty}</div>
        <div class="cart-item-price">${formatPrice(item.price)} c/u</div>
      </div>

      <div class="cart-item-actions">
        <div class="qty-controls">
          <button
            type="button"
            class="qty-btn"
            data-key="${item.key}"
            data-action="minus"
            aria-label="Disminuir cantidad"
          >−</button>

          <span class="qty-number">${item.qty}</span>

          <button
            type="button"
            class="qty-btn"
            data-key="${item.key}"
            data-action="plus"
            aria-label="Aumentar cantidad"
          >+</button>
        </div>

        <button
          type="button"
          class="remove-btn"
          data-key="${item.key}"
        >
          Quitar
        </button>
      </div>
    `;

    const thumbImg = row.querySelector(".cart-item-thumb img");
    thumbImg.addEventListener("error", () => thumbImg.remove(), { once: true });

    cartItemsEl.appendChild(row);
  });

  cartItemsEl.querySelectorAll(".qty-btn").forEach((btn) => {
    btn.addEventListener("click", () => {
      const key = btn.getAttribute("data-key");
      const action = btn.getAttribute("data-action");
      updateQty(key, action === "plus" ? 1 : -1);
    });
  });

  cartItemsEl.querySelectorAll(".remove-btn").forEach((btn) => {
    btn.addEventListener("click", () => {
      removeFromCart(btn.getAttribute("data-key"));
    });
  });
}

// ---------------------------------------------------------------------------
// 10) ABRIR / CERRAR CARRITO
// ---------------------------------------------------------------------------
function openCart() {
  lastFocusedElement = document.activeElement;
  cartBackdrop.classList.add("open");
  cartPanel.classList.add("open");
  document.body.classList.add("no-scroll");
  cartPanel.setAttribute("aria-hidden", "false");
  cartCloseBtn.focus();
}

function closeCart() {
  cartBackdrop.classList.remove("open");
  cartPanel.classList.remove("open");
  document.body.classList.remove("no-scroll");
  cartPanel.setAttribute("aria-hidden", "true");

  if (lastFocusedElement) {
    lastFocusedElement.focus();
  }
}

headerCartBtn.addEventListener("click", openCart);
cartCloseBtn.addEventListener("click", closeCart);
cartBackdrop.addEventListener("click", closeCart);

continueShoppingBtn.addEventListener("click", () => {
  closeCart();
  document.getElementById("productos").scrollIntoView({ behavior: "smooth" });
});

document.addEventListener("keydown", (event) => {
  if (event.key === "Escape" && cartPanel.classList.contains("open")) {
    closeCart();
  }
});

function bumpCartButton() {
  headerCartBtn.classList.remove("bump");
  void headerCartBtn.offsetWidth;
  headerCartBtn.classList.add("bump");
}

// ---------------------------------------------------------------------------
// 11) MENSAJE DE WHATSAPP
// ---------------------------------------------------------------------------
function buildWhatsAppMessage() {
  const lines = [];

  lines.push("Hola Krea 3D 👋");
  lines.push("Quisiera solicitar los siguientes productos:");
  lines.push("");

  cart.forEach((item) => {
    const subtotal = item.price * item.qty;

    lines.push(`• ${item.name}`);
    lines.push(`  Cantidad: ${item.qty}`);
    lines.push(`  Precio: ${formatPrice(item.price)}`);

    if (item.price > 0) {
      lines.push(`  Subtotal: S/ ${subtotal.toFixed(2)}`);
    }

    lines.push("");
  });

  const { total } = getCartTotals();

  if (total > 0) {
    lines.push(`Total referencial: S/ ${total.toFixed(2)}`);
    lines.push("");
  }

  lines.push(
    "¿Me ayudan a coordinar disponibilidad, personalización, pago y entrega?"
  );

  return lines.join("\n");
}

checkoutBtn.addEventListener("click", () => {
  if (cart.length === 0) return;

  const encodedMessage = encodeURIComponent(buildWhatsAppMessage());
  const url = `https://wa.me/${WHATSAPP_PHONE}?text=${encodedMessage}`;

  window.open(url, "_blank", "noopener,noreferrer");
});

// ---------------------------------------------------------------------------
// 12) TOAST
// ---------------------------------------------------------------------------
function showToast(message) {
  const toast = document.createElement("div");
  toast.className = "toast";
  toast.textContent = message;
  toastContainer.appendChild(toast);

  requestAnimationFrame(() => toast.classList.add("show"));

  setTimeout(() => {
    toast.classList.remove("show");
    setTimeout(() => toast.remove(), 250);
  }, 1800);
}

// ---------------------------------------------------------------------------
// 13) DESTELLOS — identidad Krea 3D
// ---------------------------------------------------------------------------
function createBurst(x, y) {
  if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;

  const burst = document.createElement("div");
  burst.className = "burst";
  burst.style.left = `${x}px`;
  burst.style.top = `${y}px`;

  const colors = ["wine", "blue", "yellow"];
  const particles = 18;

  for (let i = 0; i < particles; i++) {
    const particle = document.createElement("span");
    const angle = ((2 * Math.PI) / particles) * i;
    const distance = 55 + Math.random() * 45;

    particle.style.setProperty("--tx", `${Math.cos(angle) * distance}px`);
    particle.style.setProperty("--ty", `${Math.sin(angle) * distance}px`);
    particle.classList.add(
      colors[Math.floor(Math.random() * colors.length)]
    );

    burst.appendChild(particle);
  }

  document.body.appendChild(burst);
  setTimeout(() => burst.remove(), 700);
}

// ---------------------------------------------------------------------------
// 14) INICIALIZAR
// ---------------------------------------------------------------------------
injectProductGalleryStyles();

const yearEl = document.getElementById("year");
if (yearEl) {
  yearEl.textContent = new Date().getFullYear();
}

loadCart();
renderProducts();
