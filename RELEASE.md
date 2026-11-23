# Entrega del escaparate

La tienda está preparada para revisión en GitHub. Incluye 24 fichas de demostración, 10 tipos de prendas y ocho fichas por estado. Los ejemplos de stock permiten revisar disponibilidad y límites de cantidad.

## Verificaciones realizadas

| Área | Resultado |
| --- | --- |
| JavaScript y flujos | Revisión de sintaxis con Node y pruebas de integración con jsdom. Se recorrieron las 24 fichas en las colecciones, los cinco carruseles, los enlaces por estado, el menú, la galería, el zoom y la restauración del foco. |
| Favoritos y carrito | Verificados contadores, persistencia, recuperación de datos inválidos, altas, bajas, cantidades, subtotal y límite de una unidad para prendas únicas. |
| Consultas | Verificada la composición con código, talla, estado, cantidad, precio y subtotal. Con los contactos pendientes, el carrito muestra y permite copiar la consulta. |
| Recursos | Comprobadas las rutas relativas de ambas páginas, sus anclas y los archivos de imagen locales. Se decodificaron los 38 WebP. |
| Accesibilidad | Axe-core en jsdom no informó infracciones en las reglas evaluadas de nivel A y AA para inicio, detalle y carrito. Se comprobó el contraste de los colores sólidos principales. |

La vista previa administrada falló al abrir el relé del navegador. Quedan pendientes la revisión visual a 320, 375, 390, 430, 768, 1024, 1440 y 1920 px, las pruebas de gestos y carruseles con geometría real, el contraste sobre fotografías y una medición de Core Web Vitals. Las pruebas con DOM simulado cubren estados e interacciones funcionales.

## Antes de publicar

- Cargar y validar inventario, precios, stock, tallas, estado y fotografías reales.
- Completar WhatsApp e Instagram en `js/config.js` y comprobar el flujo con los canales oficiales.
- Validar los textos de privacidad, compra, cambios y devoluciones.
- Configurar el dominio definitivo y las URL absolutas para la vista previa al compartir.
- Completar la revisión en navegador y comprobar la caché, las cabeceras y el funcionamiento en el alojamiento elegido.
