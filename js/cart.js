const keys = {
  cart: "vanellope.cart.v1",
  favorites: "vanellope.favorites.v1"
};

const priceFormatter = new Intl.NumberFormat("es-CL", {
  style: "currency",
  currency: "CLP"
});

export function money(value) {
  return priceFormatter.format(value);
}

export function stockOf(product) {
  const stock = Number.isSafeInteger(product.stock) ? product.stock : 0;
  return product.disponible ? Math.max(0, Math.min(stock, product.prendaUnica ? 1 : stock)) : 0;
}

function read(key) {
  try {
    const value = JSON.parse(window.localStorage.getItem(key));
    return Array.isArray(value) ? value : [];
  } catch {
    return [];
  }
}

function write(key, value) {
  try {
    window.localStorage.setItem(key, JSON.stringify(value));
  } catch {
    // The storefront remains usable for this session when browser storage is unavailable.
  }
}

export function createSelections(products) {
  const byId = new Map(products.map(product => [product.id, product]));
  let cart;
  let favorites;

  function reload() {
    favorites = new Set(read(keys.favorites).filter(id => typeof id === "string" && byId.has(id)));
    cart = new Map();
    for (const row of read(keys.cart)) {
      if (!Array.isArray(row)) continue;
      const [id, quantity] = row;
      const product = typeof id === "string" ? byId.get(id) : undefined;
      if (!product || !Number.isSafeInteger(quantity) || quantity < 1) continue;
      const count = Math.min(quantity, stockOf(product));
      if (count > 0) cart.set(id, count);
    }
  }

  function setQuantity(id, quantity) {
    const product = byId.get(id);
    if (!product || !Number.isSafeInteger(quantity)) return false;
    if (quantity > stockOf(product)) return false;
    if (quantity < 1) cart.delete(id);
    else cart.set(id, quantity);
    write(keys.cart, [...cart]);
    return true;
  }

  reload();

  return {
    reload,
    storageKeys: Object.values(keys),
    quantity: id => cart.get(id) ?? 0,
    isFavorite: id => favorites.has(id),
    favorites: () => products.filter(product => favorites.has(product.id)),
    cartCount: () => Array.from(cart.values()).reduce((sum, count) => sum + count, 0),
    cartItems: () => Array.from(cart, ([id, quantity]) => ({ product: byId.get(id), quantity })),
    setQuantity,
    toggleFavorite(id) {
      if (!byId.has(id)) return false;
      if (favorites.has(id)) favorites.delete(id);
      else favorites.add(id);
      write(keys.favorites, [...favorites]);
      return favorites.has(id);
    }
  };
}

export function subtotal(items) {
  return items.reduce((sum, { product, quantity }) => sum + product.precio * quantity, 0);
}

export function orderMessage(items) {
  const lines = items.map(({ product, quantity }) => {
    return `• ${product.nombre} (${product.id}), talla ${product.talla}, ${product.estado}: ${quantity} × ${money(product.precio)}`;
  });

  return [
    "Hola, El Bazar de Vanellope. Quisiera consultar la disponibilidad de estas prendas:",
    ...lines,
    `Subtotal de referencia: ${money(subtotal(items))} CLP.`,
    "¿Podrían confirmar la disponibilidad y cómo continuar?"
  ].join("\n");
}
