# Krea 3D

Landing catálogo con carrito y pedido por WhatsApp para Krea 3D, marca de accesorios personalizados creados con impresión 3D.

No es un e-commerce con pago online: el flujo es **ver productos → agregar al carrito → revisar pedido → continuar por WhatsApp**.

## Estructura del proyecto

```
/
├── index.html              ← única página (landing con scroll)
├── css/
│   └── styles.css
├── js/
│   └── app.js               ← productos, carrito, WhatsApp, animaciones
├── assets/
│   ├── img/
│   │   ├── logo/             ← logo de Krea 3D
│   │   ├── productos/        ← fotos de productos (agregar aquí)
│   │   └── hero/              ← foto del hero cuando exista
│   └── icons/                ← favicon / apple-touch-icon
└── README.md
```

## Cómo agregar un producto nuevo

Edita el arreglo `products` en [js/app.js](js/app.js) (arriba del todo). Copia un objeto existente y cambia sus valores:

```js
{
  id: "porta-nueva-facultad",          // único, sin espacios
  name: "Porta celular - Nueva Facultad",
  faculty: "Nueva Facultad",
  shortDescription: "Descripción corta del producto.",
  price: 0,                             // ver sección de precios
  image: "./assets/img/productos/porta-nueva-facultad.webp",
}
```

## Cómo cambiar precios

En cada producto, cambia el campo `price` (número, sin el "S/"). Mientras `price` sea `0`, la tarjeta y el carrito muestran **"A coordinar"** en vez de un precio, para no inventar valores comerciales. En cuanto definas un precio real, solo cambia el número y aparecerá automáticamente formateado como `S/ XX.XX`.

## Cómo cambiar imágenes

- **Logo**: reemplaza el archivo en `assets/img/logo/krea3d-logo.jpg` (mismo nombre) o actualiza la ruta en `index.html`.
- **Productos**: coloca las fotos en `assets/img/productos/` con el nombre que indica el campo `image` de cada producto en `js/app.js`. Si el archivo no existe todavía, la tarjeta muestra automáticamente un ícono decorativo ("Foto próximamente") en vez de un enlace roto.
- **Hero**: cuando tengas una foto para el hero, colócala en `assets/img/hero/` y actualiza la sección `.hero` en `index.html` para usarla.

## Cómo cambiar el número de WhatsApp

En [js/app.js](js/app.js), busca la constante:

```js
const WHATSAPP_PHONE = "51957137229";
```

Cámbiala por el nuevo número (código de país + número, sin espacios ni símbolos). También actualiza los enlaces `https://wa.me/51957137229` en `index.html` (botón flotante y footer).

## Cómo cambiar Instagram / TikTok

Busca en `index.html` los enlaces con `instagram.com` y `tiktok.com` (sección "Síguenos" y footer) y reemplaza las URLs.

## Cómo ejecutarlo localmente

No requiere instalación ni build. Basta con abrir `index.html` en el navegador, o servirlo con cualquier servidor estático, por ejemplo:

```bash
npx serve .
```

## Cómo publicarlo en GitHub Pages

1. Sube el contenido de esta carpeta a un repositorio de GitHub.
2. En la configuración del repositorio, activa **GitHub Pages** apuntando a la rama `main` (carpeta raíz `/`).
3. La web quedará disponible en `https://usuario.github.io/nombre-repositorio/`.

Todas las rutas del proyecto son relativas (`./assets/...`, `./css/...`, `./js/...`), por lo que funcionan sin cambios dentro de un subdirectorio de GitHub Pages.

## Notas técnicas

- HTML, CSS y JavaScript vanilla, sin frameworks ni dependencias externas (solo la fuente Poppins de Google Fonts).
- El carrito persiste en `localStorage` bajo la clave `krea3d_cart`, con validación y manejo de errores al leer datos corruptos.
- El mensaje de WhatsApp se genera como texto plano y se codifica una sola vez con `encodeURIComponent` antes de armar la URL `wa.me`.
- Las animaciones respetan `prefers-reduced-motion: reduce`.
