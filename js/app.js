/* ==========================================================================
   KREA 3D — catálogo + carrito + pedido por WhatsApp
   ========================================================================== */

// ---------------------------------------------------------------------------
// 1) PRODUCTOS
//
// Para agregar un producto nuevo, copia un objeto y cambia sus valores.
// - price: usa 0 mientras no tengas el precio final (se muestra "A coordinar").
// - image: ruta al archivo dentro de assets/img/productos/. Si el archivo aún
//   no existe, la tarjeta muestra automáticamente un ícono decorativo.
// ---------------------------------------------------------------------------
const products = [
  {
    id: "porta-administracion",
    name: "Porta celular - Administración",
    faculty: "Administración",
    shortDescription: "Porta celular personalizado impreso en 3D con el sello de tu facultad.",
    price: 0,
    image: "./assets/img/productos/porta-administracion.webp",
  },
  {
    id: "porta-ingenieria",
    name: "Porta celular - Ingeniería",
    faculty: "Ingeniería",
    shortDescription: "Diseño resistente pensado para el día a día en el campus.",
    price: 0,
    image: "./assets/img/productos/porta-ingenieria.webp",
  },
  {
    id: "porta-derecho",
    name: "Porta celular - Derecho",
    faculty: "Derecho",
    shortDescription: "Personalízalo con el nombre de tu facultad o promoción.",
    price: 0,
    image: "./assets/img/productos/porta-derecho.webp",
  },
  {
    id: "porta-psicologia",
    name: "Porta celular - Psicología",
    faculty: "Psicología",
    shortDescription: "Un accesorio único, hecho a tu medida en impresión 3D.",
    price: 0,
    image: "./assets/img/productos/porta-psicologia.webp",
  },
  {
    id: "porta-arquitectura",
    name: "Porta celular - Arquitectura",
    faculty: "Arquitectura",
    shortDescription: "Formas limpias y modernas, ideal para llevar a clases.",
    price: 0,
    image: "./assets/img/productos/porta-arquitectura.webp",
  },
  {
    id: "porta-medicina",
    name: "Porta celular - Medicina",
    faculty: "Medicina",
    shortDescription: "Lleva tu facultad contigo con un diseño hecho para ti.",
    price: 0,
    image: "./assets/img/productos/porta-medicina.webp",
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
// 5) PERSISTENCIA (localStorage)
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
    cart = Array.isArray(parsed) ? parsed.filter(isValidCartItem) : [];
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
// 6) RENDER DE PRODUCTOS
// ---------------------------------------------------------------------------
function formatPrice(price) {
  return price > 0 ? `S/ ${price.toFixed(2)}` : "A coordinar";
}

function renderProducts() {
  productsGrid.innerHTML = "";

  products.forEach((product) => {
    const card = document.createElement("article");
    card.className = "product-card";

    const priceClass = product.price > 0 ? "product-price" : "product-price tbd";

    card.innerHTML = `
      <div class="product-image">
        <div class="product-image-placeholder">
          <span class="icon" aria-hidden="true">🧊</span>
          <span class="label">Foto próximamente</span>
        </div>
        <img
          src="${product.image}"
          alt="${product.name}"
          loading="lazy"
          width="400"
          height="300"
        />
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

    const img = card.querySelector("img");
    img.addEventListener("error", () => img.classList.add("is-hidden"), { once: true });

    productsGrid.appendChild(card);
  });

  productsGrid.querySelectorAll(".btn-add").forEach((btn) => {
    btn.addEventListener("click", (e) => {
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
// 7) LÓGICA DEL CARRITO
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
      image: product.image,
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
  cartAmountEl.textContent = `S/ ${total.toFixed(2)}`;
  cartTotalEl.textContent = `S/ ${total.toFixed(2)}`;
  checkoutBtn.disabled = cart.length === 0;

  cartItemsEl.innerHTML = "";

  if (cart.length === 0) {
    cartItemsEl.innerHTML = `
      <div class="cart-empty">
        <div class="icon" aria-hidden="true">🛒</div>
        <p>Tu carrito está vacío.<br />Agrega tus diseños favoritos y continúa tu pedido por WhatsApp.</p>
        <button type="button" class="btn btn-outline" id="emptyCartViewProducts">Ver productos</button>
      </div>
    `;
    const viewProductsBtn = document.getElementById("emptyCartViewProducts");
    viewProductsBtn.addEventListener("click", () => {
      closeCart();
      document.getElementById("productos").scrollIntoView({ behavior: "smooth" });
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
          <button type="button" class="qty-btn" data-key="${item.key}" data-action="minus" aria-label="Disminuir cantidad">−</button>
          <span class="qty-number">${item.qty}</span>
          <button type="button" class="qty-btn" data-key="${item.key}" data-action="plus" aria-label="Aumentar cantidad">+</button>
        </div>
        <button type="button" class="remove-btn" data-key="${item.key}">Quitar</button>
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
// 8) ABRIR / CERRAR CARRITO
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
  if (lastFocusedElement) lastFocusedElement.focus();
}

headerCartBtn.addEventListener("click", openCart);
cartCloseBtn.addEventListener("click", closeCart);
cartBackdrop.addEventListener("click", closeCart);
continueShoppingBtn.addEventListener("click", () => {
  closeCart();
  document.getElementById("productos").scrollIntoView({ behavior: "smooth" });
});

document.addEventListener("keydown", (e) => {
  if (e.key === "Escape" && cartPanel.classList.contains("open")) {
    closeCart();
  }
});

function bumpCartButton() {
  headerCartBtn.classList.remove("bump");
  void headerCartBtn.offsetWidth; // reflow para reiniciar animación
  headerCartBtn.classList.add("bump");
}

// ---------------------------------------------------------------------------
// 9) MENSAJE DE WHATSAPP
// ---------------------------------------------------------------------------
function buildWhatsAppMessage() {
  const lines = [];

  lines.push("Hola Krea 3D 👋");
  lines.push("Quisiera solicitar los siguientes productos:");
  lines.push("");

  cart.forEach((item) => {
    const subtotal = item.price * item.qty;
    lines.push(`• ${item.name} (${item.faculty})`);
    lines.push(`  Cantidad: ${item.qty}`);
    lines.push(`  Precio: ${formatPrice(item.price)}`);
    lines.push(`  Subtotal: ${item.price > 0 ? `S/ ${subtotal.toFixed(2)}` : "A coordinar"}`);
    lines.push("");
  });

  const { total } = getCartTotals();
  lines.push(`Total referencial: S/ ${total.toFixed(2)}`);
  lines.push("");
  lines.push("¿Me ayudan a coordinar disponibilidad, personalización, pago y entrega?");

  return lines.join("\n");
}

checkoutBtn.addEventListener("click", () => {
  if (cart.length === 0) return;

  const encodedMessage = encodeURIComponent(buildWhatsAppMessage());
  const url = `https://wa.me/${WHATSAPP_PHONE}?text=${encodedMessage}`;
  window.open(url, "_blank", "noopener,noreferrer");
});

// ---------------------------------------------------------------------------
// 10) TOAST
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
// 11) DESTELLOS (burst) — identidad Krea 3D: vino, celeste, amarillo
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
    const p = document.createElement("span");
    const angle = ((2 * Math.PI) / particles) * i;
    const distance = 55 + Math.random() * 45;
    const tx = Math.cos(angle) * distance;
    const ty = Math.sin(angle) * distance;

    p.style.setProperty("--tx", `${tx}px`);
    p.style.setProperty("--ty", `${ty}px`);
    p.classList.add(colors[Math.floor(Math.random() * colors.length)]);

    burst.appendChild(p);
  }

  document.body.appendChild(burst);
  setTimeout(() => burst.remove(), 700);
}

// ---------------------------------------------------------------------------
// 12) INICIALIZAR
// ---------------------------------------------------------------------------
document.getElementById("year").textContent = new Date().getFullYear();
loadCart();
renderProducts();
