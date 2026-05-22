# B&M Cotizador — Tabulador en línea

Herramienta web para que **B&M Construcciones** capture cotizaciones de obra y genere PDFs profesionales en segundos. Cliente final puede cotizar en línea su proyecto y descargar una estimación.

## Estructura

```
tabulador-bym/
├── index.html          # Landing + selector de modo
├── admin.html          # Modo administrador (tabulador completo)
├── cliente.html        # Modo cliente (wizard guiado)
├── assets/
│   ├── style.css       # Sistema de diseño (paleta B&M)
│   ├── icons.js        # Biblioteca de íconos SVG
│   ├── catalog.js      # Datos: empresa, plantillas, servicios
│   ├── store.js        # Estado + persistencia localStorage
│   ├── pdf.js          # Generador PDF (jsPDF + autoTable)
│   ├── admin.js        # Lógica del tabulador admin
│   └── cliente.js      # Lógica del wizard cliente
└── README.md
```

**Sin dependencias de servidor.** Todo corre en el navegador. jsPDF se carga vía CDN.

## Modo administrador (`admin.html`)

- Captura cotización con secciones libres (cocina, fachada, eléctrica, gas, plomería, pintura).
- Plantillas precargadas con todos los conceptos típicos extraídos de cotizaciones anteriores.
- Cada **item** tiene: cantidad, precio unitario y **% de ajuste individual**.
- Cada **grupo** (mano de obra o materiales) tiene un **% global** independiente.
- Resumen lateral en tiempo real: mano de obra, materiales, subtotal, utilidad global, IVA.
- Toggle de IVA (16% sólo sobre mano de obra, como en cotizaciones originales).
- Autoguardado en localStorage cada 200 ms.
- Botón **Cargar demo** rellena con la cotización Daltónico Cocina (#0301).

### Plantillas incluidas
- **COCINA** — Remodelación completa (16 conceptos MO, 16 materiales)
- **FACHADA** — Aluminio y acabados (21 conceptos MO, 11 materiales)
- **RANURACIÓN Y CONEXIÓN HIDRÁULICA** — 6 conceptos MO, 12 materiales
- **INSTALACIÓN ELÉCTRICA** — 7 conceptos MO, 13 materiales
- **GAS ESTACIONARIO** — 3 conceptos MO, 8 materiales
- **PINTURA Y ACABADOS** — 4 conceptos MO, 6 materiales
- **Sección en blanco** — Para casos ad-hoc

## Modo cliente (`cliente.html`)

Wizard de 4 pasos:
1. **Servicios** — Selecciona uno o varios servicios pre-armados.
2. **Tamaño** — Captura cantidad (m², piezas, ML). Estimación al instante.
3. **Tus datos** — Nombre, teléfono, correo, ciudad y notas.
4. **Cotización** — Resumen visual + opciones para descargar PDF o solicitar cotización formal por correo.

## Generación de PDF

Estructura mejorada vs cotización original:

| Sección | Original | Esta versión |
|---|---|---|
| Portada | Lista directa | Portada azul con #cotización, total destacado, validez |
| Resumen ejecutivo | No existía | Barra MO vs Material, % por sección, totales claros |
| Por sección | Tabla plana | Header con índice, subtotal por grupo, % aplicados visibles |
| Forma de pago | Sólo cláusula | 3 tarjetas: anticipo / avance / entrega con %s y montos |
| Términos | Texto corrido | Numerados, garantía + validez como tarjetas separadas |
| Firmas | Una sola línea | Dos firmas (B&M / Cliente) con cédulas profesionales |
| Footer | Sólo última pág | Página X/Y, contacto y dirección en todas las páginas |

## Mejoras sugeridas al documento

Implementadas en el PDF nuevo, pero las resumo para que decidas conservarlas:

1. **Portada con jerarquía visual** — Número de cotización grande, total destacado al inicio (evita que el cliente tenga que buscar el monto).
2. **Resumen ejecutivo** — Bar chart MO vs Materiales y desglose por sección en una sola página. Útil para clientes que sólo quieren ver totales.
3. **Forma de pago como cards** — En vez de mencionar el 50%/25%/25% en texto, mostrar los montos exactos en pesos por etapa.
4. **Validez de cotización con fecha de expiración** — Calcula automáticamente "Válida hasta el [fecha]" en lugar de "30 días".
5. **Cláusulas numeradas** — Más fáciles de referenciar en conversaciones ("según cláusula 3").
6. **Página de firmas dedicada** — En vez de firma flotante al final, espacio claro para B&M y cliente con cédulas profesionales explícitas.
7. **Header/footer en todas las páginas** — Número de cotización siempre visible, paginación X/Y.

## Despliegue

### Opción 1: Hosting estático gratuito (recomendado)
Sube los archivos a:
- **Vercel** — `vercel deploy` desde el directorio raíz
- **Netlify** — Arrastra la carpeta a app.netlify.com/drop
- **Cloudflare Pages** — Conecta el repo o sube ZIP
- **GitHub Pages** — Push a un repo y activa Pages

### Opción 2: Tu dominio propio
1. Compra el dominio
2. Sube los archivos vía FTP, cPanel o tu panel de hosting
3. Coloca `index.html` en la raíz del dominio
4. Listo. No requiere Node, PHP, base de datos ni nada.

### Opción 3: Local
Abre `index.html` directamente en cualquier navegador moderno (Chrome, Edge, Safari, Firefox).

## Personalización

### Cambiar datos de la empresa
Edita `assets/catalog.js`:
```js
empresa: {
  nombre: 'B&M Construcciones',
  direccion: '...',
  telefonos: '...',
  ingenieros: [
    { nombre: 'ING. ...', cedula: '...' }
  ]
}
```

### Agregar nuevas plantillas
En `catalog.js` dentro de `plantillas`:
```js
nuevaSeccion: {
  nombre: 'NOMBRE DE LA SECCIÓN',
  icon: 'home', // o cualquier ícono de icons.js
  manoObra: [
    { descripcion: '...', unidad: 'M2', cantidad: 0, precioUnitario: 0 }
  ],
  materiales: [
    { codigo: '', nombre: '...', unidad: 'Pza', cantidad: 0, precioUnitario: 0 }
  ]
}
```

### Cambiar colores
Edita las variables CSS en `assets/style.css` (sección `:root`).

## Tecnología

- HTML5 + CSS3 (sin frameworks)
- Vanilla JavaScript (sin dependencias de build)
- jsPDF 2.5.1 + autoTable 3.8.2 (vía CDN) para PDF
- Tipografía: Inter (Google Fonts)

## Licencia

Uso interno B&M Construcciones. Diseñado por alan luna.
