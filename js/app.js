import { products } from "./products.js";
import { instagramLink, whatsappLink } from "./config.js";
import { createSelections, money, orderMessage, stockOf, subtotal } from "./cart.js";
import { mountCarousel } from "./carousel.js";
import { button, element } from "./dom.js";

const selections = createSelections(products);
function statusToast() {
  const status = element("div", "shop-toast");
  status.setAttribute("role", "status");
  status.setAttribute("aria-live", "polite");
  status.setAttribute("aria-atomic", "true");
  return status;
}

const toast = statusToast();
document.body.append(toast);

const dialog = element("dialog", "shop-dialog");
const panel = element("div", "shop-dialog-panel");
const dialogToast = statusToast();
dialog.setAttribute("aria-labelledby", "shop-dialog-title");
dialog.append(panel, dialogToast);
document.body.append(dialog);

let feedbackTimer;
let opener;
let currentPanel = "";
let updateDetail = () => {};

function announce(message) {
  const status = dialog.open ? dialogToast : toast;
  window.clearTimeout(feedbackTimer);
  toast.classList.remove("is-visible");
  dialogToast.classList.remove("is-visible");
  status.textContent = message;
  status.classList.add("is-visible");
  feedbackTimer = window.setTimeout(() => {
    status.classList.remove("is-visible");
    status.textContent = "";
  }, 3400);
}

function productPhoto(product, index, className, loading = "lazy") {
  const photo = product.fotos[index];
  const image = element("img", className);
  image.src = typeof photo === "string" ? photo : photo.src;
  image.alt = product.fotosAlt?.[index] || (typeof photo === "string" ? "" : photo.alt) || product.nombre;
  image.loading = loading;
  image.decoding = "async";
  image.width = 480;
  image.height = 600;
  return image;
}

function updateCounters() {
  for (const counter of document.querySelectorAll("[data-count]")) {
    const type = counter.dataset.count;
    const count = type === "cart" ? selections.cartCount() : selections.favorites().length;
    counter.textContent = count;
    counter.hidden = count === 0;
    const control = counter.closest("button");
    const label = type === "cart" ? "Carrito" : "Favoritos";
    if (control) control.setAttribute("aria-label", `${label}, ${count} ${count === 1 ? "prenda" : "prendas"}`);
  }
}

function updateFavorite(control) {
  const selected = selections.isFavorite(control.dataset.favoriteId);
  control.setAttribute("aria-pressed", String(selected));
  control.firstElementChild.textContent = selected ? "♥" : "♡";
}

function favoriteButton(product, className = "favorite-button") {
  const control = button("", className);
  control.dataset.favoriteId = product.id;
  control.setAttribute("aria-label", "Favorito: " + product.nombre);
  const icon = element("span");
  icon.setAttribute("aria-hidden", "true");
  control.append(icon);
  updateFavorite(control);

  control.addEventListener("click", () => {
    const saved = selections.toggleFavorite(product.id);
    document.querySelectorAll("[data-favorite-id]").forEach(updateFavorite);
    updateCounters();
    announce(saved ? "Prenda guardada en favoritos." : "Prenda eliminada de favoritos.");
    if (currentPanel === "favorites") {
      openFavorites();
      panel.querySelector(".favorite-button, .shop-dialog-close").focus();
    }
  });
  return control;
}

function makeCard(product) {
  const article = element("article", "product-card");
  const media = element("div", "product-media");
  const viewImage = button("", "product-image-button");
  viewImage.setAttribute("aria-label", "Ver " + product.nombre);
  viewImage.append(productPhoto(product, 0, "product-image"));
  const reverseIndex = product.fotos.findIndex(photo => {
    const source = typeof photo === "string" ? photo : photo.src;
    return /-atras\.[a-z]+$/i.test(source);
  });
  if (reverseIndex > 0) {
    const reverse = productPhoto(product, reverseIndex, "product-image product-image--alternate");
    reverse.alt = "";
    viewImage.append(reverse);
  }

  const badges = element("div", "product-badges");
  if (product.prendaUnica) badges.append(element("span", "product-badge", "Prenda única"));
  if (!stockOf(product)) badges.append(element("span", "product-badge product-badge--sold", "Agotada"));
  media.append(viewImage, badges, favoriteButton(product));

  const copy = element("div", "product-card-copy");
  const metadata = element("div", "product-card-meta");
  metadata.append(element("span", "", product.estado), element("span", "", "Talla " + product.talla));
  const name = element("h3", "product-name", product.nombre);
  const bottom = element("div", "product-card-bottom");
  const details = button("Ver detalle", "product-detail-button");
  details.setAttribute("aria-label", "Ver detalle de " + product.nombre);
  bottom.append(element("strong", "product-price", money(product.precio)), details);
  copy.append(metadata, name, bottom);
  article.append(media, copy);
  viewImage.addEventListener("click", () => openProduct(product));
  details.addEventListener("click", () => openProduct(product));
  return article;
}

function openPanel(kind, title) {
  if (!dialog.open) opener = document.activeElement;
  currentPanel = kind;
  updateDetail = () => {};
  dialog.dataset.panel = kind;
  const top = element("header", "shop-dialog-header");
  const heading = element("h2", "", title);
  const close = button("×", "shop-dialog-close");
  heading.id = "shop-dialog-title";
  heading.tabIndex = -1;
  close.setAttribute("aria-label", "Cerrar " + title);
  close.addEventListener("click", () => dialog.close());
  top.append(heading, close);
  panel.replaceChildren(top);
  if (!dialog.open) dialog.showModal();
  panel.scrollTop = 0;
  heading.focus({ preventScroll: true });
}

dialog.addEventListener("click", event => {
  if (event.target === dialog) dialog.close();
});

dialog.addEventListener("close", () => {
  currentPanel = "";
  updateDetail = () => {};
  dialogToast.classList.remove("is-visible");
  dialogToast.textContent = "";
  if (opener instanceof HTMLElement && opener.isConnected) opener.focus({ preventScroll: true });
});

function gallery(product) {
  const galleryWrapper = element("div", "shop-gallery");
  const viewport = element("div", "shop-gallery-viewport");
  const controls = element("div", "shop-gallery-controls");
  const zoom = button("Ampliar foto", "shop-button shop-button--outline");
  zoom.setAttribute("aria-pressed", "false");

  function select(index) {
    viewport.replaceChildren(productPhoto(product, index, "shop-gallery-image", "eager"));
    viewport.scrollTo(0, 0);
    for (const [position, thumbnail] of [...controls.querySelectorAll(".shop-thumbnail")].entries()) {
      thumbnail.setAttribute("aria-pressed", String(position === index));
    }
  }

  if (product.fotos.length > 1) {
    for (const [index] of product.fotos.entries()) {
      const photoLabel = product.fotosAlt?.[index] || `Foto ${index + 1} de ${product.nombre}`;
      const thumbnail = button("", "shop-thumbnail");
      const thumbImage = productPhoto(product, index, "shop-thumbnail-image");
      thumbImage.alt = "";
      thumbnail.append(thumbImage);
      thumbnail.setAttribute("aria-label", photoLabel);
      thumbnail.addEventListener("click", () => select(index));
      controls.append(thumbnail);
    }
  }

  zoom.addEventListener("click", () => {
    const expanded = zoom.getAttribute("aria-pressed") === "false";
    viewport.classList.toggle("is-zoomed", expanded);
    zoom.setAttribute("aria-pressed", String(expanded));
    zoom.textContent = expanded ? "Reducir foto" : "Ampliar foto";
    if (expanded) {
      viewport.tabIndex = 0;
      viewport.setAttribute("role", "region");
      viewport.setAttribute("aria-label", "Fotografía ampliada, puedes desplazarla");
    } else {
      viewport.removeAttribute("tabindex");
      viewport.removeAttribute("role");
      viewport.removeAttribute("aria-label");
    }
  });

  select(0);
  galleryWrapper.append(viewport);
  if (controls.childElementCount) galleryWrapper.append(controls);
  galleryWrapper.append(zoom);
  return galleryWrapper;
}

function openProduct(product) {
  const cameFromFavorites = currentPanel === "favorites";
  openPanel("product", product.nombre);
  const layout = element("div", "shop-product");
  const info = element("div", "shop-product-info");
  const list = element("dl", "shop-product-facts");
  const available = stockOf(product);
  const facts = [
    ["Código", product.id],
    ["Estado", product.estado],
    ["Talla", product.talla],
    ["Color", product.color],
    ["Disponibilidad", available ? `${available} ${available === 1 ? "unidad" : "unidades"}` : "Agotada"],
    ["Medidas", product.medidas],
    ["Material", product.material]
  ];
  if (typeof product.etiquetaOriginal === "boolean") {
    facts.push(["Etiqueta original", product.etiquetaOriginal ? "Conservada" : "Sin etiqueta"]);
  }

  for (const [label, value] of facts) {
    if (!value) continue;
    const group = element("div");
    const display = typeof value === "object"
      ? Object.entries(value).map(([name, detail]) => name + " " + detail).join(", ")
      : value;
    group.append(element("dt", "", label), element("dd", "", display));
    list.append(group);
  }

  if (product.prendaUnica) info.append(element("span", "product-badge", "Prenda única"));
  info.append(
    element("p", "shop-product-price", money(product.precio)),
    element("p", "", product.descripcion),
    list
  );
  if (product.defectos || product.senales) {
    const section = element("div", "shop-product-notes");
    section.append(element("h3", "", "Estado y detalles"), element("p", "", product.defectos || product.senales));
    info.append(section);
  }
  const actions = element("div", "shop-product-actions");
  const add = button("Agregar al carrito", "shop-button");
  updateDetail = () => {
    const reached = selections.quantity(product.id) >= available;
    add.setAttribute("aria-disabled", String(reached));
    add.textContent = available === 0 ? "Agotada" : reached ? "Stock existente en el carrito" : "Agregar al carrito";
  };
  add.addEventListener("click", () => {
    if (add.getAttribute("aria-disabled") === "true") return;
    if (selections.setQuantity(product.id, selections.quantity(product.id) + 1)) {
      updateCounters();
      updateDetail();
      announce(product.nombre + " se agregó al carrito.");
    }
  });
  updateDetail();
  actions.append(add, favoriteButton(product, "favorite-button favorite-button--detail"));
  if (cameFromFavorites) {
    const back = button("Volver a favoritos", "shop-button shop-button--outline");
    back.addEventListener("click", openFavorites);
    actions.append(back);
  }
  info.append(actions, element("p", "shop-small", "Prenda e imágenes de demostración."));
  layout.append(gallery(product), info);
  panel.append(layout);
}

function openFavorites() {
  openPanel("favorites", "Favoritos");
  const saved = selections.favorites();
  if (!saved.length) {
    panel.append(element("p", "shop-empty", "Guarda las prendas que te gusten con el corazón y encuéntralas aquí."));
    return;
  }
  const grid = element("div", "shop-favorites-grid");
  grid.append(...saved.map(makeCard));
  panel.append(grid);
}

async function copyMessage(field) {
  try {
    await navigator.clipboard.writeText(field.value);
    announce("Consulta copiada.");
  } catch {
    field.focus();
    field.select();
    announce("Texto seleccionado. Usa el comando de copiar de tu dispositivo.");
  }
}

function cartContent() {
  const items = selections.cartItems();
  const wrapper = element("div", "shop-cart");
  if (!items.length) {
    wrapper.append(element("p", "shop-empty", "Tu carrito está vacío. Explora las colecciones para agregar prendas."));
    return wrapper;
  }

  const lines = element("ul", "shop-cart-lines");
  for (const { product, quantity } of items) {
    const row = element("li", "shop-cart-row");
    const photo = productPhoto(product, 0, "shop-cart-image");
    photo.alt = "";
    const info = element("div", "shop-cart-item-info");
    const controls = element("div", "shop-cart-controls");
    const subtract = button("−", "shop-quantity");
    const add = button("+", "shop-quantity");
    const remove = button("Quitar", "shop-cart-remove");
    const reference = element("span", "shop-small", product.id + " · Talla " + product.talla);
    info.append(element("strong", "", product.nombre), reference);
    if (product.prendaUnica) info.append(element("span", "product-badge", "Prenda única"));

    for (const [control, purpose] of [[subtract, "Reducir cantidad de "], [add, "Aumentar cantidad de "], [remove, "Quitar del carrito "]]) {
      control.setAttribute("aria-label", purpose + product.nombre);
    }
    subtract.disabled = quantity <= 1;
    add.disabled = quantity >= stockOf(product);

    function change(next, command) {
      if (!selections.setQuantity(product.id, next)) return;
      updateCounters();
      showCartContent();
      const selector = `[data-cart-id="${product.id}"] [data-command="${command}"]`;
      const nextControl = panel.querySelector(selector);
      if (nextControl && !nextControl.disabled) nextControl.focus();
      else panel.querySelector(`[data-cart-id="${product.id}"] [data-command="remove"]`)?.focus();
      if (!panel.contains(document.activeElement) || document.activeElement === panel) {
        panel.querySelector(".shop-dialog-close").focus();
      }
      announce(next ? `Cantidad actualizada a ${next}.` : "Prenda eliminada del carrito.");
    }

    for (const [control, next, command] of [[subtract, quantity - 1, "less"], [add, quantity + 1, "more"], [remove, 0, "remove"]]) {
      control.dataset.command = command;
      control.addEventListener("click", () => change(next, command));
    }
    row.dataset.cartId = product.id;
    controls.append(subtract, element("span", "shop-quantity-count", quantity), add, remove);
    row.append(photo, info, controls, element("strong", "shop-cart-line-price", money(product.precio * quantity)));
    lines.append(row);
  }

  const total = element("p", "shop-subtotal");
  total.append(element("span", "", "Subtotal"), element("strong", "", money(subtotal(items)) + " CLP"));
  const help = element("p", "shop-small", "El carrito guarda tu selección en este navegador. La disponibilidad se confirma al consultar al bazar.");
  const message = orderMessage(items);
  const url = whatsappLink(message);
  const action = element("div", "shop-cart-actions");
  if (url) {
    const link = element("a", "shop-button", "Consultar por WhatsApp");
    link.href = url;
    link.target = "_blank";
    link.rel = "noopener noreferrer";
    action.append(link);
  } else {
    action.append(element("p", "shop-small", "El número de WhatsApp del bazar está pendiente de configurar."));
  }
  const field = element("textarea", "shop-order-message");
  field.value = message;
  field.readOnly = true;
  field.rows = 4;
  const label = element("label", "shop-field", "Mensaje de consulta");
  label.append(field);
  const copy = button("Copiar consulta", "shop-button shop-button--outline");
  copy.addEventListener("click", () => copyMessage(field));
  action.append(label, copy);
  wrapper.append(lines, total, help, action);
  return wrapper;
}

function showCartContent() {
  const content = cartContent();
  const previous = panel.querySelector(".shop-cart");
  if (previous) previous.replaceWith(content);
  else panel.append(content);
}

function openCart() {
  openPanel("cart", "Tu carrito");
  showCartContent();
}

for (const host of document.querySelectorAll("[data-carousel]")) {
  const subset = products.filter(product => {
    const key = host.dataset.carousel;
    if (key === "featured") return product.destacado;
    if (key === "unique") return product.prendaUnica;
    return product.estado === key;
  });
  mountCarousel(host, subset, makeCard);
}

for (const trigger of document.querySelectorAll('[data-open="favorites"]')) {
  trigger.addEventListener("click", openFavorites);
}

for (const trigger of document.querySelectorAll('[data-open="cart"]')) {
  trigger.addEventListener("click", openCart);
}

for (const contact of document.querySelectorAll("[data-contact]")) {
  const service = contact.dataset.contact;
  const path = service === "whatsapp" ? whatsappLink() : instagramLink();
  if (path) {
    contact.href = path;
    contact.target = "_blank";
    contact.rel = "noopener noreferrer";
  } else {
    const label = contact.textContent.trim();
    const placeholder = element("span", contact.className, label + " (próximamente)");
    contact.replaceWith(placeholder);
  }
}

const menu = document.querySelector("[data-menu]");
const navigation = menu && document.getElementById(menu.getAttribute("aria-controls"));
if (navigation) {
  const setMenu = open => {
    menu.setAttribute("aria-expanded", String(open));
    navigation.classList.toggle("is-open", open);
  };

  menu.addEventListener("click", () => setMenu(menu.getAttribute("aria-expanded") !== "true"));
  navigation.addEventListener("click", event => {
    if (event.target.closest("a")) setMenu(false);
  });
  document.addEventListener("keydown", event => {
    if (event.key === "Escape" && menu.getAttribute("aria-expanded") === "true") {
      setMenu(false);
      menu.focus();
    }
  });
}

window.addEventListener("storage", event => {
  if (event.key !== null && !selections.storageKeys.includes(event.key)) return;
  selections.reload();
  document.querySelectorAll("[data-favorite-id]").forEach(updateFavorite);
  updateCounters();
  updateDetail();
  if (currentPanel === "cart") showCartContent();
  if (currentPanel === "favorites") openFavorites();
});

updateCounters();
