# El Bazar de Vanellope

Boutique de ropa casual con colecciones de prendas usadas, seminuevas y nuevas. La tienda presenta 24 fichas de demostración en CLP e incluye favoritos, carrito local y consultas por WhatsApp.

## Ejecutar en local

Se necesita Python 3 o cualquier servidor HTTP estático. Ejecuta este comando desde la raíz del repositorio.

```bash
python3 -m http.server 8000
```

Abre [http://localhost:8000](http://localhost:8000). El servidor HTTP permite cargar los módulos JavaScript y conserva el mismo origen para el carrito y los favoritos. La tienda no requiere instalación, compilación ni variables de entorno.

## Editar las prendas y el contacto

- `js/products.js` contiene las fichas. Agrega un identificador irrepetible, precio entero en CLP, categoría, estado, talla, color y al menos una foto local con texto alternativo. Completa medidas, material, marca y señales de uso a partir de información verificada. Incluye tomas de frente, espalda y detalles cuando estén disponibles.
- `prendaUnica` es independiente del estado. Usa una unidad de stock para una prenda única disponible y cero al agotarse. Ajusta `disponible` al actualizar el inventario.
- Usa `js/config.js` para el número público de WhatsApp con código de país y para la URL de Instagram. Con el número pendiente, el carrito permite preparar y copiar el mensaje de consulta.
- La portada y la sección sobre el bazar usan imágenes editoriales generadas para esta demostración. Las imágenes de [productos](assets/productos/FUENTES.md) y de [categorías](assets/categorias/FUENTES.md) representan estilos de referencia y tienen sus propias notas de procedencia.
- DM Sans y Playfair Display se sirven localmente bajo SIL Open Font License. Sus textos de licencia están en `assets/fonts/`.

## Publicar

1. Sustituye las 24 fichas y sus imágenes de referencia por inventario verificado. Actualiza también los avisos de demostración, según corresponda.
2. Configura y prueba los canales de contacto. Revisa los textos de privacidad, compra, cambios y devoluciones con la información real de la tienda.
3. En `index.html`, define `og:url` y `link rel="canonical"` y cambia `og:image` a la URL HTTPS absoluta de la portada cuando se conozca el dominio definitivo.
4. Publica la raíz del proyecto en un alojamiento estático. Para GitHub Pages, selecciona la rama de producción y la carpeta raíz en **Settings → Pages**. Comprueba el despliegue también desde la subruta del proyecto.
5. Verifica las cabeceras de seguridad que entrega el alojamiento. `_headers` contiene la configuración para servicios compatibles, como Cloudflare Pages y Netlify. Las páginas incluyen CSP y política de referencias por metadatos para otros alojamientos, con el alcance propio de las etiquetas meta.

El almacenamiento local guarda identificadores y cantidades del carrito e identificadores de favoritos. WhatsApp abre un mensaje editable. Por el momento, la confirmación de stock y pedido corresponde a la conversación con la tienda.

## Organización

- `index.html` reúne la portada, las colecciones y el contacto. El detalle de cada prenda se abre en un diálogo.
- `privacidad.html` contiene la información sobre almacenamiento local y las condiciones pendientes.
- `css/`, `js/` y `assets/` contienen presentación, comportamiento y recursos locales.
- `RELEASE.md` reúne verificaciones y pendientes de publicación.

Se tomó [MyR2](https://github.com/AnymuzzOps/MyR2/) como referencia técnica para el enfoque estático, las rutas relativas, la navegación accesible, la política de seguridad y la documentación de entrega.
