export const config = Object.freeze({
  // Número internacional, sin signos ni espacios. Déjalo vacío hasta validarlo.
  whatsapp: "",
  instagramUrl: ""
});

const internationalNumber = /^[1-9]\d{6,14}$/;

export function whatsappLink(message = "") {
  if (!internationalNumber.test(config.whatsapp)) return "";
  const url = new URL("https://wa.me/" + config.whatsapp);
  if (message) url.searchParams.set("text", message);
  return url.href;
}

export function instagramLink() {
  try {
    const url = new URL(config.instagramUrl);
    const allowedHost = ["instagram.com", "www.instagram.com"].includes(url.hostname);
    return url.protocol === "https:" && allowedHost && !url.username && !url.password ? url.href : "";
  } catch {
    return "";
  }
}
