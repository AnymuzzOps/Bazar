export function element(tag, className, text) {
  const node = document.createElement(tag);
  if (className) node.className = className;
  if (text !== undefined) node.textContent = text;
  return node;
}

export function button(label, className) {
  const control = element("button", className, label);
  control.type = "button";
  return control;
}
