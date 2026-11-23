import { money, stockOf } from "./cart.js";
import { button, element } from "./dom.js";

const conditions = [
  ["Usada", "Usadas"],
  ["Seminueva", "Seminuevas"],
  ["Nueva", "Nuevas"]
];

function normalize(text) {
  return text.normalize("NFD").replace(/\p{Diacritic}/gu, "").toLocaleLowerCase("es-CL");
}

export function mountCatalog(host, products, makeCard, resultsHost = host) {
  const form = element("form", "catalog-form");
  const searchControl = element("label", "catalog-field catalog-search", "Buscar por nombre");
  const search = element("input");
  const filters = element("details", "catalog-filters");
  const summary = element("summary", "", "Filtros y orden");
  const fields = element("div", "catalog-fields");
  const resultCount = element("p", "catalog-count");
  const results = element("div", "catalog-grid");
  const small = window.matchMedia("(max-width: 47.99rem)");

  search.type = "search";
  search.name = "q";
  search.placeholder = "Ej. chaqueta denim";
  search.autocomplete = "off";
  searchControl.append(search);
  resultCount.setAttribute("role", "status");

  function select(label, name, options, emptyLabel) {
    const field = element("label", "catalog-field", label);
    const control = element("select");
    control.name = name;
    const entries = emptyLabel ? [["", emptyLabel], ...options] : options;
    for (const [value, text] of entries) {
      const option = element("option", "", text);
      option.value = value;
      control.append(option);
    }
    field.append(control);
    fields.append(field);
    return control;
  }

  const uniqueValues = key => [...new Set(products.map(item => item[key]))];
  const asOptions = values => values.map(value => [value, value]);
  const category = select("Tipo de prenda", "categoria", asOptions(uniqueValues("categoria").sort((a, b) => a.localeCompare(b, "es-CL"))), "Todos los tipos");
  const state = select("Estado", "estado", conditions, "Todos los estados");
  const sizes = uniqueValues("talla");
  const knownSizes = ["XS", "S", "M", "L", "XL", "XXL", "Única"];
  const orderedSizes = [...knownSizes.filter(size => sizes.includes(size)), ...sizes.filter(size => !knownSizes.includes(size))];
  const size = select("Talla", "talla", asOptions(orderedSizes), "Todas las tallas");
  const availability = select("Disponibilidad", "stock", [["yes", "En stock"], ["no", "Agotadas"]], "Todas");
  const sort = select("Ordenar por", "orden", [["recent", "Novedades"], ["ascending", "Menor precio"], ["descending", "Mayor precio"]]);

  function priceField(label, name) {
    const field = element("label", "catalog-field", label);
    const control = element("input");
    control.type = "number";
    control.name = name;
    control.min = "0";
    control.step = "1";
    control.inputMode = "numeric";
    control.placeholder = "$ CLP";
    field.append(control);
    fields.append(field);
    return control;
  }

  const min = priceField("Precio mínimo", "desde");
  const max = priceField("Precio máximo", "hasta");
  const uniqueField = element("label", "catalog-checkbox");
  const unique = element("input");
  unique.type = "checkbox";
  unique.name = "unicas";
  uniqueField.append(unique, " Solo prendas únicas");

  const actions = element("div", "catalog-actions");
  const clear = button("Limpiar filtros", "shop-button shop-button--outline");
  actions.append(uniqueField, clear);
  filters.append(summary, fields, actions);
  filters.open = !small.matches;
  small.addEventListener("change", () => { filters.open = !small.matches; });
  form.append(searchControl, filters);
  host.append(form);
  resultsHost.append(resultCount, results);

  function render() {
    const query = normalize(search.value.trim());
    const floor = min.value === "" ? 0 : min.valueAsNumber;
    const ceiling = max.value === "" ? Infinity : max.valueAsNumber;
    const sorted = products.filter(product => {
      const available = stockOf(product) > 0;
      return normalize(product.nombre).includes(query) &&
        (!category.value || product.categoria === category.value) &&
        (!state.value || product.estado === state.value) &&
        (!size.value || product.talla === size.value) &&
        product.precio >= floor && product.precio <= ceiling &&
        (!unique.checked || product.prendaUnica) &&
        (!availability.value || available === (availability.value === "yes"));
    }).sort((a, b) => {
      if (sort.value === "ascending") return a.precio - b.precio;
      if (sort.value === "descending") return b.precio - a.precio;
      return (b.fecha || "").localeCompare(a.fecha || "");
    });

    resultCount.textContent = sorted.length === 1 ? "1 prenda" : `${sorted.length} prendas`;
    results.replaceChildren();
    if (floor > ceiling) {
      results.append(element("p", "shop-empty", `El precio máximo debe ser igual o mayor a ${money(floor)}.`));
    } else if (sorted.length === 0) {
      results.append(element("p", "shop-empty", "No encontramos prendas con estos filtros. Prueba otra búsqueda o limpia los filtros."));
    } else {
      results.append(...sorted.map(makeCard));
    }
  }

  form.addEventListener("input", render);
  form.addEventListener("submit", event => event.preventDefault());
  clear.addEventListener("click", () => {
    form.reset();
    render();
  });

  render();
  return {
    focusSearch: () => search.focus({ preventScroll: true }),
    filterState(value) {
      form.reset();
      state.value = value;
      render();
    },
    filterUnique() {
      form.reset();
      unique.checked = true;
      render();
    }
  };
}
