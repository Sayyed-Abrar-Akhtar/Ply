const $ = (selector, root = document) => root.querySelector(selector);
const $$ = (selector, root = document) => [...root.querySelectorAll(selector)];
const page = document.body.dataset.page || "";
let products = [];
let cart = JSON.parse(localStorage.getItem("ply-cart") || "[]");
let wish = JSON.parse(localStorage.getItem("ply-wish") || "[]");

const esc = (value = "") => String(value).replace(/[&<>"']/g, char => ({
  "&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;","'":"&#39;"
}[char]));

const header = () => {
  const path = location.pathname.split("/").pop() || "index.html";
  const active = href => path === href ? ' aria-current="page"' : "";
  $("#header").innerHTML = `
    <header class="site-header" id="siteHeader">
      <div class="head wrap">
        <a class="brand" href="index.html" aria-label="Ply home">Ply</a>
        <nav class="nav" aria-label="Primary navigation">
          <a href="index.html"${active("index.html")}>Home</a>
          <a href="collection.html"${active("collection.html")}>Shop</a>
          <a href="page.html"${active("page.html")}>About</a>
          <a href="contact.html"${active("contact.html")}>Contact</a>
        </nav>
        <div class="head-actions">
          <a href="wishlist.html" aria-label="Wishlist">Wishlist <span id="wishCount" class="count"></span></a>
          <a href="cart.html" aria-label="Shopping bag">Bag <span id="bagCount" class="count"></span></a>
        </div>
      </div>
    </header>`;
  const siteHeader = $("#siteHeader");
  const syncHeader = () => siteHeader.classList.toggle("scrolled", window.scrollY > 18);
  syncHeader();
  window.addEventListener("scroll", syncHeader, {passive:true});
};

const footer = () => {
  $("#footer").innerHTML = `
    <footer class="footer">
      <div class="wrap footer-shell">
        <div class="footer-grid">
          <div class="footer-brand">
            <p class="footer-kicker">PLY / MODERN ESSENTIALS</p>
            <div class="footer-title">A wardrobe, not a rotation.</div>
            <p class="footer-copy">Considered everyday pieces, designed to work together and stay useful.</p>
          </div>
          <div><h3>Shop</h3><a href="collection.html">All pieces</a><a href="collection.html?category=women">Women</a><a href="collection.html?category=men">Men</a><a href="collection.html?category=unisex">Unisex</a></div>
          <div><h3>Explore</h3><a href="page.html">Our approach</a><a href="wishlist.html">Wishlist</a><a href="contact.html">Contact</a></div>
          <div><h3>Follow</h3><a href="#" aria-label="Instagram">Instagram</a><a href="#" aria-label="Pinterest">Pinterest</a><a href="mailto:hello@ply.example">Email us</a></div>
        </div>
        <div class="footer-bottom"><span>© ${new Date().getFullYear()} Ply</span><span>Designed for considered living.</span></div>
      </div>
    </footer>`;
};

const updateCounts = () => {
  const total = cart.reduce((sum, item) => sum + item.qty, 0);
  const bag = $("#bagCount"), saved = $("#wishCount");
  if (bag) bag.textContent = total ? total : "";
  if (saved) saved.textContent = wish.length ? wish.length : "";
};

const card = product => `
  <article class="card">
    <div class="card-media">
      <a href="product.html?id=${encodeURIComponent(product.id)}" aria-label="View ${esc(product.title)}">
        <img src="${product.images[0]}" alt="${esc(product.title)}" loading="lazy">
      </a>
      <span class="badge">${esc(product.badge)}</span>
      <button class="heart" type="button" data-wish="${esc(product.id)}" aria-label="${wish.includes(product.id) ? "Remove" : "Add"} ${esc(product.title)} ${wish.includes(product.id) ? "from" : "to"} wishlist">${wish.includes(product.id) ? "♥" : "♡"}</button>
    </div>
    <div class="card-body">
      <a class="card-title" href="product.html?id=${encodeURIComponent(product.id)}">${esc(product.title)}</a>
      <div class="meta"><span>${product.currency}${product.price.toFixed(2)}</span><span>${esc(product.categoryLabel)}</span></div>
      <div class="swatches" aria-label="Available colours">${product.colors.map(c => `<span class="swatch" title="${esc(c.name)}" style="background:${esc(c.hex)}"></span>`).join("")}</div>
      <button class="button outline quick" type="button" data-add="${esc(product.id)}">Quick add</button>
    </div>
  </article>`;

const bindCards = () => {
  $$("[data-wish]").forEach(button => button.onclick = () => {
    const id = button.dataset.wish;
    wish = wish.includes(id) ? wish.filter(item => item !== id) : [...wish, id];
    localStorage.setItem("ply-wish", JSON.stringify(wish));
    button.textContent = wish.includes(id) ? "♥" : "♡";
    button.setAttribute("aria-label", `${wish.includes(id) ? "Remove" : "Add"} ${button.closest(".card")?.querySelector(".card-title")?.textContent || "item"} ${wish.includes(id) ? "from" : "to"} wishlist`);
    updateCounts();
  });
  $$("[data-add]").forEach(button => button.onclick = () => addToCart(button.dataset.add, 1));
};

const renderFeatured = () => {
  const target = $("#featured");
  if (target) {
    target.innerHTML = products.slice(0, 4).map(card).join("");
    bindCards();
  }
};

const collection = () => {
  const grid = $("#grid");
  if (!grid) return;
  const state = {page:1, size:8, cats:new Set(), sizes:new Set(), sort:"featured"};
  const params = new URLSearchParams(location.search);
  const initialCategory = params.get("category");
  if (initialCategory) state.cats.add(initialCategory);

  const render = () => {
    let list = products.filter(p =>
      (!state.cats.size || state.cats.has(p.category)) &&
      (!state.sizes.size || [...state.sizes].some(size => p.sizes.includes(size)))
    );
    if (state.sort === "price-low") list.sort((a,b) => a.price - b.price);
    if (state.sort === "price-high") list.sort((a,b) => b.price - a.price);
    if (state.sort === "alpha") list.sort((a,b) => a.title.localeCompare(b.title));
    const pages = Math.max(1, Math.ceil(list.length / state.size));
    state.page = Math.min(state.page, pages);
    const visible = list.slice((state.page - 1) * state.size, state.page * state.size);
    grid.innerHTML = visible.length ? visible.map(card).join("") : '<div class="empty"><h2>No matches.</h2><p>Clear a filter and try again.</p></div>';
    const pagination = $("#pagination");
    if (pagination) pagination.innerHTML = Array.from({length:pages}, (_,i) => `<button type="button" class="${i+1===state.page?"active":""}" data-page="${i+1}" aria-label="Page ${i+1}">${i+1}</button>`).join("") + (state.page < pages ? '<button type="button" data-more aria-label="Load more products">+</button>' : "");
    bindCards();
    $$("[data-filter]").forEach(input => {
      input.checked = input.dataset.filter === "category" ? state.cats.has(input.value) : state.sizes.has(input.value);
    });
  };

  $$("[data-filter]").forEach(input => input.onchange = () => {
    const set = input.dataset.filter === "category" ? state.cats : state.sizes;
    input.checked ? set.add(input.value) : set.delete(input.value);
    state.page = 1;
    render();
  });
  $("#clear")?.addEventListener("click", () => {
    state.cats.clear(); state.sizes.clear(); state.page = 1; render();
  });
  $("#filterBtn")?.addEventListener("click", () => {
    const panel = $("#filters");
    const open = !panel.classList.contains("open");
    panel.classList.toggle("open", open);
    $("#filterBtn").setAttribute("aria-expanded", String(open));
  });
  $("#filterClose")?.addEventListener("click", () => {
    $("#filters").classList.remove("open");
    $("#filterBtn").setAttribute("aria-expanded", "false");
  });
  $$("[data-sort]").forEach(button => button.onclick = () => {
    state.sort = button.dataset.sort;
    $$("[data-sort]").forEach(item => item.setAttribute("aria-pressed", String(item === button)));
    state.page = 1;
    render();
  });
  $("#pagination")?.addEventListener("click", event => {
    const pageButton = event.target.closest("[data-page]");
    const moreButton = event.target.closest("[data-more]");
    if (pageButton) { state.page = Number(pageButton.dataset.page); render(); }
    if (moreButton) { state.size += 8; render(); }
  });
  render();
};

const productPage = () => {
  const target = $("#product");
  if (!target) return;
  const id = new URLSearchParams(location.search).get("id");
  const p = products.find(item => item.id === id) || products[0];
  target.innerHTML = `
    <div class="product-detail">
      <div class="gallery"><div class="thumbs">${p.images.map((image,index)=>`<button class="thumb ${index===0?"active":""}" data-img="${index}" type="button"><img src="${image}" alt="${esc(p.title)} view ${index+1}" loading="lazy"></button>`).join("")}</div><div class="main-image"><img id="main" src="${p.images[0]}" alt="${esc(p.title)}"></div></div>
      <div class="purchase"><p class="eyebrow">${esc(p.categoryLabel)} / ${esc(p.badge)}</p><h1>${esc(p.title)}</h1><p class="price-large">${p.currency}${p.price.toFixed(2)}</p><p class="lede">${esc(p.description)}</p>
        <fieldset class="variant"><legend>Colour</legend><div class="variant-buttons">${p.colors.map((c,i)=>`<button type="button" class="${i===0?"selected":""}" data-color="${esc(c.name)}" style="background:${esc(c.hex)}" aria-label="${esc(c.name)}"></button>`).join("")}</div></fieldset>
        <fieldset class="variant"><legend>Size</legend><div class="variant-buttons">${p.sizes.map((s,i)=>`<button type="button" class="${i===1?"selected":""}" data-size="${esc(s)}">${esc(s)}</button>`).join("")}</div></fieldset>
        <div class="buy"><div class="qty"><button type="button" id="minus" aria-label="Decrease quantity">−</button><output id="qty">1</output><button type="button" id="plus" aria-label="Increase quantity">+</button></div><button class="button full" id="add" type="button">Add to bag</button></div>
        <div class="accordion"><details open><summary>Details</summary><p>${esc(p.details)}</p></details><details><summary>Fabric & care</summary><p>${esc(p.care)}</p></details><details><summary>Size guide</summary><p>True to size. Size up for a relaxed silhouette.</p></details></div>
        <p class="rating"><strong>★★★★★</strong> ${p.reviews.rating} · ${p.reviews.count} reviews</p>
      </div>
    </div>`;
  let quantity = 1;
  $("#minus").onclick = () => { quantity = Math.max(1, quantity - 1); $("#qty").textContent = quantity; };
  $("#plus").onclick = () => { quantity += 1; $("#qty").textContent = quantity; };
  $("#add").onclick = () => addToCart(p.id, quantity);
  $$("[data-img]").forEach(button => button.onclick = () => {
    $("#main").src = p.images[Number(button.dataset.img)];
    $$("[data-img]").forEach(item => item.classList.remove("active"));
    button.classList.add("active");
  });
  $$("[data-color],[data-size]").forEach(button => button.onclick = () => {
    const group = button.hasAttribute("data-color") ? "[data-color]" : "[data-size]";
    $$(group).forEach(item => item.classList.remove("selected"));
    button.classList.add("selected");
  });
};

const addToCart = (id, quantity = 1) => {
  const line = cart.find(item => item.id === id);
  if (line) line.qty += quantity; else cart.push({id, qty:quantity});
  localStorage.setItem("ply-cart", JSON.stringify(cart));
  updateCounts();
  openCart();
};

const openCart = () => {
  if (!$("#cart")) document.body.insertAdjacentHTML("beforeend", '<div id="cart"></div>');
  const root = $("#cart");
  root.innerHTML = `<aside class="cart-drawer" id="drawer" aria-label="Shopping bag">
    <div class="drawer-head"><strong>Your bag</strong><button type="button" id="close" aria-label="Close bag">×</button></div>
    <div class="drawer-body">${cart.length ? cart.map(line => { const p=products.find(item=>item.id===line.id); return `<div class="line"><img src="${p.images[0]}" alt="${esc(p.title)}"><div><h3>${esc(p.title)}</h3><p>${p.currency}${p.price.toFixed(2)}</p><div class="line-controls"><button type="button" data-minus="${p.id}" aria-label="Decrease ${esc(p.title)}">−</button><span>${line.qty}</span><button type="button" data-plus="${p.id}" aria-label="Increase ${esc(p.title)}">+</button><button type="button" data-remove="${p.id}">Remove</button></div></div></div>`; }).join("") : '<div class="empty"><h2>Your bag is quiet.</h2><a href="collection.html">Shop pieces</a></div>'}</div>
    ${cart.length ? `<div class="drawer-foot"><div class="summary"><span>Subtotal</span><span>$${cart.reduce((sum,line)=>sum+products.find(p=>p.id===line.id).price*line.qty,0).toFixed(2)}</span></div><a class="button full" href="cart.html">View bag</a></div>` : ""}
  </aside>`;
  const drawer = $("#drawer");
  requestAnimationFrame(() => drawer.classList.add("open"));
  $("#close").onclick = () => drawer.classList.remove("open");
  $$("[data-minus]", drawer).forEach(button => button.onclick = () => changeCart(button.dataset.minus, -1));
  $$("[data-plus]", drawer).forEach(button => button.onclick = () => changeCart(button.dataset.plus, 1));
  $$("[data-remove]", drawer).forEach(button => button.onclick = () => { cart = cart.filter(item => item.id !== button.dataset.remove); localStorage.setItem("ply-cart", JSON.stringify(cart)); updateCounts(); openCart(); });
};

const changeCart = (id, amount) => {
  const line = cart.find(item => item.id === id);
  if (!line) return;
  line.qty += amount;
  if (line.qty < 1) cart = cart.filter(item => item !== line);
  localStorage.setItem("ply-cart", JSON.stringify(cart));
  updateCounts();
  openCart();
};

const cartPage = () => {
  const target = $("#cartPage");
  if (!target) return;
  const render = () => {
    if (!cart.length) { target.innerHTML = '<p class="eyebrow">Your bag</p><h1>Ready when you are.</h1><div class="empty"><h2>Your bag is empty.</h2><a class="button" href="collection.html">Shop pieces</a></div>'; return; }
    target.innerHTML = '<p class="eyebrow">Your bag</p><h1>Ready when you are.</h1><div class="cart-page"><div>' + cart.map(line => { const p=products.find(item=>item.id===line.id); return `<div class="line"><img src="${p.images[0]}" alt="${esc(p.title)}"><div><h3>${esc(p.title)}</h3><p>${p.currency}${p.price.toFixed(2)}</p><div class="line-controls"><button type="button" data-minus="${p.id}">−</button><span>${line.qty}</span><button type="button" data-plus="${p.id}">+</button><button type="button" data-remove="${p.id}">Remove</button></div></div></div>`; }).join("") + '</div><aside class="summary-box"><div class="summary"><span>Subtotal</span><span>$' + cart.reduce((sum,line)=>sum+products.find(p=>p.id===line.id).price*line.qty,0).toFixed(2) + '</span></div><p>Taxes and delivery are calculated at checkout.</p><button class="button full" disabled>Checkout</button></aside></div>';
    $$("[data-minus]", target).forEach(button => button.onclick = () => { changeCart(button.dataset.minus,-1); render(); });
    $$("[data-plus]", target).forEach(button => button.onclick = () => { changeCart(button.dataset.plus,1); render(); });
    $$("[data-remove]", target).forEach(button => button.onclick = () => { cart = cart.filter(item => item.id !== button.dataset.remove); localStorage.setItem("ply-cart",JSON.stringify(cart)); updateCounts(); render(); });
  };
  render();
};

const wishlistPage = () => {
  const target = $("#wishlist");
  if (!target) return;
  target.innerHTML = '<p class="eyebrow">Saved pieces</p><h1>Your wishlist.</h1><p class="lede">Keep the pieces you want to come back to.</p>' + (wish.length ? '<div class="grid">' + products.filter(p=>wish.includes(p.id)).map(card).join("") + '</div>' : '<div class="empty"><h2>Nothing saved yet.</h2><a class="button" href="collection.html">Explore the collection</a></div>');
  bindCards();
};

const contact = () => {
  const form = $("#contactForm");
  if (!form) return;
  form.onsubmit = event => { event.preventDefault(); $("#status").textContent = "Thanks — your message is ready to be sent."; form.reset(); };
};

const newsletter = () => {
  $$("form.newsletter-form").forEach(form => form.onsubmit = event => {
    event.preventDefault();
    const button = $("button", form);
    button.textContent = "You're on the list";
    button.disabled = true;
  });
};

const init = async () => {
  header();
  footer();
  updateCounts();
  try {
    const response = await fetch("data/products.json");
    if (!response.ok) throw new Error("Product data could not be loaded.");
    products = await response.json();
    if (page === "home") renderFeatured();
    if (page === "collection") collection();
    if (page === "product") productPage();
    if (page === "cart") cartPage();
    if (page === "wishlist") wishlistPage();
    contact();
    newsletter();
  } catch (error) {
    console.error(error);
    const target = $("#featured, #grid, #product, #cartPage, #wishlist");
    if (target) target.innerHTML = '<div class="empty"><h2>We could not load the collection.</h2><p>Please refresh and try again.</p></div>';
  }
};
init();