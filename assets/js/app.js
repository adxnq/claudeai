/* ============================================================
   Зелёный Дом — общая логика
   Шапка/подвал, корзина (localStorage), уведомления, помощники
   ============================================================ */

const CART_KEY = "greenhouse_cart_v1";
const NAV_LINKS = [
  { href: "index.html",    label: "Главная" },
  { href: "catalog.html",  label: "Каталог" },
  { href: "blog.html",     label: "Блог" },
  { href: "about.html",    label: "О нас" },
  { href: "contacts.html", label: "Контакты" }
];

/* ---------- Помощники ---------- */
function formatPrice(n) {
  return n.toLocaleString("ru-RU") + " ₽";
}
function getPlant(id) { return PLANTS.find(p => p.id === id); }
function getArticle(id) { return ARTICLES.find(a => a.id === id); }
function qs(name) { return new URLSearchParams(location.search).get(name); }
function currentPage() {
  const path = location.pathname.split("/").pop();
  return path === "" ? "index.html" : path;
}
/* Картинка с запасным вариантом, если CDN недоступен */
function imgTag(src, alt, cls) {
  return `<img src="${src}" alt="${alt}" class="${cls || ""}" loading="lazy"
    onerror="this.style.display='none';this.parentElement.classList.add('img-fallback');">`;
}

/* ---------- Корзина ---------- */
function getCart() {
  try { return JSON.parse(localStorage.getItem(CART_KEY)) || {}; }
  catch (e) { return {}; }
}
function saveCart(cart) {
  localStorage.setItem(CART_KEY, JSON.stringify(cart));
  updateCartCount();
}
function addToCart(id, qty = 1) {
  const cart = getCart();
  cart[id] = (cart[id] || 0) + qty;
  saveCart(cart);
  const plant = getPlant(id);
  toast(`«${plant.name}» в корзине 🌿`);
}
function setQty(id, qty) {
  const cart = getCart();
  if (qty <= 0) delete cart[id];
  else cart[id] = qty;
  saveCart(cart);
}
function removeFromCart(id) {
  const cart = getCart();
  delete cart[id];
  saveCart(cart);
}
function cartCount() {
  return Object.values(getCart()).reduce((a, b) => a + b, 0);
}
function cartItems() {
  const cart = getCart();
  return Object.keys(cart).map(id => {
    const plant = getPlant(id);
    return plant ? { ...plant, qty: cart[id] } : null;
  }).filter(Boolean);
}
function cartSubtotal() {
  return cartItems().reduce((sum, it) => sum + it.price * it.qty, 0);
}
function updateCartCount() {
  const c = cartCount();
  document.querySelectorAll("[data-cart-count]").forEach(el => {
    el.textContent = c;
    el.dataset.count = c;
  });
}

/* ---------- Уведомление ---------- */
let toastTimer;
function toast(msg) {
  let el = document.querySelector(".toast");
  if (!el) {
    el = document.createElement("div");
    el.className = "toast";
    document.body.appendChild(el);
  }
  el.innerHTML = msg;
  requestAnimationFrame(() => el.classList.add("is-visible"));
  clearTimeout(toastTimer);
  toastTimer = setTimeout(() => el.classList.remove("is-visible"), 2600);
}

/* ---------- Шапка и подвал ---------- */
function renderHeader() {
  const page = currentPage();
  const navHtml = NAV_LINKS.map(l =>
    `<a href="${l.href}" class="${l.href === page ? "is-active" : ""}">${l.label}</a>`
  ).join("");

  const html = `
  <header class="header">
    <div class="container header__inner">
      <a href="index.html" class="logo">
        <span class="logo__mark">🌿</span> Зелёный&nbsp;Дом
      </a>
      <nav class="nav">${navHtml}</nav>
      <div class="header__actions">
        <a href="cart.html" class="icon-btn" aria-label="Корзина">
          🛒<span class="cart-count" data-cart-count data-count="0">0</span>
        </a>
        <a href="catalog.html" class="btn btn--primary hide-sm">В каталог</a>
        <button class="burger" aria-label="Меню" onclick="toggleMobileNav()">☰</button>
      </div>
    </div>
    <nav class="mobile-nav" id="mobileNav">
      ${NAV_LINKS.map(l => `<a href="${l.href}">${l.label}</a>`).join("")}
      <a href="cart.html">🛒 Корзина</a>
    </nav>
  </header>`;
  const mount = document.getElementById("site-header");
  if (mount) mount.outerHTML = html;
}

function toggleMobileNav() {
  document.getElementById("mobileNav").classList.toggle("is-open");
}

function renderFooter() {
  const html = `
  <footer class="footer">
    <div class="container">
      <div class="footer__grid">
        <div>
          <a href="index.html" class="logo"><span class="logo__mark">🌿</span> Зелёный Дом</a>
          <p>Магазин комнатных растений с доставкой по всей России. Помогаем сделать дом живым и зелёным с 2018 года.</p>
          <div class="socials">
            <a href="#" aria-label="Telegram">✈️</a>
            <a href="#" aria-label="ВКонтакте">🌐</a>
            <a href="#" aria-label="Instagram">📷</a>
            <a href="#" aria-label="YouTube">▶️</a>
          </div>
        </div>
        <div>
          <h4>Магазин</h4>
          <ul>
            <li><a href="catalog.html">Каталог</a></li>
            <li><a href="catalog.html?cat=easy">Неприхотливые</a></li>
            <li><a href="catalog.html?cat=flowering">Цветущие</a></li>
            <li><a href="catalog.html?cat=succulents">Суккуленты</a></li>
          </ul>
        </div>
        <div>
          <h4>Покупателю</h4>
          <ul>
            <li><a href="about.html">О нас</a></li>
            <li><a href="blog.html">Блог об уходе</a></li>
            <li><a href="contacts.html">Контакты</a></li>
            <li><a href="contacts.html#delivery">Доставка и оплата</a></li>
          </ul>
        </div>
        <div>
          <h4>Рассылка</h4>
          <p>Советы по уходу и новинки — раз в неделю, без спама.</p>
          <form class="footer__news" onsubmit="event.preventDefault(); toast('Спасибо за подписку! 🌱'); this.reset();">
            <input type="email" placeholder="Ваш e-mail" required>
            <button class="btn btn--primary" type="submit">→</button>
          </form>
        </div>
      </div>
      <div class="footer__bottom">
        <span>© 2026 Зелёный Дом. Все права защищены.</span>
        <span>Сделано с любовью к растениям 🌿</span>
      </div>
    </div>
  </footer>`;
  const mount = document.getElementById("site-footer");
  if (mount) mount.outerHTML = html;
}

/* ---------- Карточка товара (переиспользуется) ---------- */
function plantCard(p) {
  const badgeCls = (p.badge === "Скидка" || p.badge === "Набор") ? "card__badge--sale" : "";
  const badge = p.badge ? `<span class="card__badge ${badgeCls}">${p.badge}</span>` : "";
  const oldPrice = p.oldPrice ? `<s>${formatPrice(p.oldPrice)}</s>` : "";
  return `
  <article class="card">
    <a href="product.html?id=${p.id}" class="card__media">
      ${badge}
      ${imgTag(p.img, p.name)}
    </a>
    <button class="card__fav" title="В избранное" onclick="toast('Добавлено в избранное ❤️')">♡</button>
    <div class="card__body">
      <span class="card__latin">${p.latin}</span>
      <h3 class="card__title"><a href="product.html?id=${p.id}">${p.name}</a></h3>
      <p class="card__short">${p.short}</p>
      <div class="card__meta">
        <span>☀️ ${p.light}</span>
        <span>💧 ${p.water}</span>
      </div>
      <div class="card__foot">
        <div class="price"><b>${formatPrice(p.price)}</b> ${oldPrice}</div>
        <button class="btn btn--primary btn--add" onclick="addToCart('${p.id}')">В корзину</button>
      </div>
    </div>
  </article>`;
}

/* ---------- Инициализация на каждой странице ---------- */
document.addEventListener("DOMContentLoaded", () => {
  renderHeader();
  renderFooter();
  updateCartCount();
});
