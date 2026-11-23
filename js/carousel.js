import { button, element } from "./dom.js";

const reducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)");

export function mountCarousel(host, products, makeCard) {
  host.setAttribute("role", "group");
  if (!products.length) {
    host.append(element("p", "shop-empty", "Pronto encontrarás más prendas aquí."));
    return;
  }

  const label = host.getAttribute("aria-label") || "Selección de prendas";
  const track = element("ul", "carousel-track");
  const controls = element("div", "carousel-controls");
  const previous = button("‹", "carousel-arrow");
  const position = element("span", "carousel-position");
  const next = button("›", "carousel-arrow");

  host.classList.add("carousel");
  track.setAttribute("aria-label", label);
  track.tabIndex = 0;
  previous.setAttribute("aria-label", "Prendas anteriores en " + label);
  next.setAttribute("aria-label", "Prendas siguientes en " + label);
  position.setAttribute("aria-hidden", "true");

  for (const product of products) {
    const item = element("li", "carousel-item");
    item.append(makeCard(product));
    track.append(item);
  }

  const items = [...track.children];
  controls.append(previous, position, next);
  host.append(controls, track);

  function go(direction) {
    const gap = items.length > 1 ? items[1].offsetLeft - items[0].offsetLeft : track.clientWidth;
    track.scrollBy({ left: direction * gap, behavior: reducedMotion.matches ? "instant" : "smooth" });
  }

  function update() {
    const start = track.getBoundingClientRect().left;
    const end = start + track.clientWidth;
    const visible = items.filter(item => {
      const rect = item.getBoundingClientRect();
      return rect.right > start + rect.width / 2 && rect.left < end - rect.width / 2;
    });
    const index = items.indexOf(visible[0]) + 1 || 1;
    const last = items.indexOf(visible.at(-1)) + 1 || index;
    position.textContent = index === last ? `${index} / ${items.length}` : `${index}–${last} / ${items.length}`;
    previous.disabled = track.scrollLeft <= 2;
    next.disabled = Math.ceil(track.scrollLeft + track.clientWidth) >= track.scrollWidth - 2;
  }

  previous.addEventListener("click", () => go(-1));
  next.addEventListener("click", () => go(1));
  track.addEventListener("scroll", update, { passive: true });
  track.addEventListener("keydown", event => {
    if (event.target !== track || !["ArrowLeft", "ArrowRight", "Home", "End"].includes(event.key)) return;
    event.preventDefault();
    if (event.key === "Home" || event.key === "End") {
      track.scrollTo({ left: event.key === "Home" ? 0 : track.scrollWidth, behavior: "instant" });
    } else {
      go(event.key === "ArrowLeft" ? -1 : 1);
    }
  });

  new ResizeObserver(update).observe(track);
  update();
}
