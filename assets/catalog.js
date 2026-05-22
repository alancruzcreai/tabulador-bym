/* ============================================================
   CATÁLOGO B&M — Servicios, items y plantillas
   Datos extraídos de cotizaciones reales (DALTONICO 0301, LANES 0250)
   ============================================================ */

window.CATALOG = {
  empresa: {
    nombre: 'B&M Construcciones',
    direccion: '19 poniente norte #305 Oficina 201, Col. Las Arboledas C.P. 29030, Tuxtla Gutiérrez, Chiapas',
    telefonos: '961 120 0355 / 961 255 4185',
    ingenieros: [
      { nombre: 'ING. AMILCAR FRANCISCO BRINDIS FLORES', cedula: '12870570' },
      { nombre: 'ING. CELIC MEDINA RUEDA', cedula: '12471384' }
    ]
  },

  // Cláusulas estándar (mejoradas)
  clausulasDefault: [
    'Al ser una remodelación, es recurrente que existan trabajos no contemplados. Estos se considerarán pagos adicionales y no representativos del total del presupuesto, se conciliarán con el cliente durante la ejecución.',
    'Los precios de mano de obra no incluyen I.V.A. En caso de requerir factura, se aumentará 16% al monto total de dicho concepto.',
    'El presupuesto total estará sujeto a cambios con previo aviso, según la naturaleza del terreno y reajustes por precio o disponibilidad de material.',
    'El material descrito en el presupuesto es con el que se recomienda realizar el trabajo. Puede cambiarse por uno de su preferencia.',
    'En caso de estar de acuerdo con el presupuesto, se acordará un contrato de obra para dar por entendido el inicio del mismo.'
  ],

  formaPagoDefault: { anticipo: 50, avance: 25, final: 25 },
  validezDiasDefault: 30,
  garantiaDefault: '6 meses sobre mano de obra. Materiales según especificaciones del fabricante.',

  // Plantillas de secciones que se pueden agregar a una cotización
  plantillas: {
    cocina: {
      nombre: 'COCINA — Remodelación completa',
      icon: 'home',
      manoObra: [
        { descripcion: 'Retiro de azulejo existente', unidad: 'M2', cantidad: 31, precioUnitario: 75 },
        { descripcion: 'Nivelación de piso (a 10 cm de altura) P-00', unidad: 'M2', cantidad: 31, precioUnitario: 150 },
        { descripcion: 'Pegado de piso cerámico P-01', unidad: 'M2', cantidad: 31, precioUnitario: 180 },
        { descripcion: 'Picado y pegado de piso cerámico en paredes a 2m de altura y 1.20m en paredes con ventana P-02', unidad: 'M2', cantidad: 50.05, precioUnitario: 225 },
        { descripcion: 'Pegado de piso cerámico P-01', unidad: 'M2', cantidad: 31, precioUnitario: 180 },
        { descripcion: 'Elaboración e instalación de puerta bandera y dos ventanas, en aluminio blanco de 3" y cristal claro de 6mm', unidad: 'Pza', cantidad: 3, precioUnitario: 11150 },
        { descripcion: 'Abrir espacio en ventana para cuadrar a medidas del plano y emboquillar', unidad: 'Pza', cantidad: 1, precioUnitario: 750 },
        { descripcion: 'Cerrar ventana de .30 x .70 y de 2.02 x 1.02', unidad: 'Pza', cantidad: 2, precioUnitario: 600 },
        { descripcion: 'Nivelar pared N-02', unidad: 'M2', cantidad: 12.64, precioUnitario: 150 },
        { descripcion: 'Picado y pasteado de techo T-01', unidad: 'M2', cantidad: 31, precioUnitario: 142.5 },
        { descripcion: 'Elaboración de muro de durock', unidad: 'M2', cantidad: 18.2, precioUnitario: 277.5 },
        { descripcion: 'Colocación de zoclo curva sanitaria', unidad: 'M2', cantidad: 28, precioUnitario: 60 },
        { descripcion: 'Picado y pasteado de paredes (arriba de azulejo) P-03', unidad: 'M2', cantidad: 22, precioUnitario: 142.5 },
        { descripcion: 'Pintado de techo y pared sin azulejo', unidad: 'M2', cantidad: 53, precioUnitario: 19.5 },
        { descripcion: 'Retiro y subida de escombro', unidad: 'Día', cantidad: 2, precioUnitario: 2400 },
        { descripcion: 'Viaje de escombro', unidad: 'Viaje', cantidad: 2, precioUnitario: 1425 }
      ],
      materiales: [
        { codigo: '', nombre: 'Cemento', unidad: 'Bulto', cantidad: 16, precioUnitario: 271.5 },
        { codigo: '', nombre: 'Arena', unidad: 'Tonelada', cantidad: 1.2, precioUnitario: 680 },
        { codigo: '', nombre: 'Grava', unidad: 'Tonelada', cantidad: 1.5, precioUnitario: 1000 },
        { codigo: 'P-01', nombre: 'Azulejo Kronos terracota 40 x 40', unidad: 'Caja', cantidad: 22, precioUnitario: 382.41 },
        { codigo: 'P-01', nombre: 'Pegamento Adhesivo Intercerammic', unidad: 'Bulto', cantidad: 10, precioUnitario: 368 },
        { codigo: 'P-01', nombre: 'Separadores', unidad: 'Bolsa', cantidad: 3, precioUnitario: 65 },
        { codigo: 'P-01', nombre: 'Boquilla Interceramic', unidad: 'Bulto', cantidad: 3, precioUnitario: 205 },
        { codigo: 'P-01', nombre: 'Esponja albañil', unidad: 'Pza', cantidad: 2, precioUnitario: 85 },
        { codigo: 'P-02', nombre: 'Azulejo Astratto Blanco 30 x 20', unidad: 'Caja', cantidad: 37, precioUnitario: 277.5 },
        { codigo: 'P-02', nombre: 'Pegamento Adhesivo Intercerammic', unidad: 'Bulto', cantidad: 14, precioUnitario: 368 },
        { codigo: 'SKU 173945', nombre: 'Permabase', unidad: 'Hoja', cantidad: 7, precioUnitario: 884.27 },
        { codigo: 'SKU 704161', nombre: 'Postes 6.35 x 3.05 cal 26', unidad: 'Pza', cantidad: 10, precioUnitario: 216.91 },
        { codigo: '', nombre: 'Basecoat', unidad: 'Bulto', cantidad: 5, precioUnitario: 699 },
        { codigo: '', nombre: 'Pintura Vinimex Comex', unidad: 'Cubeta', cantidad: 1, precioUnitario: 4553 },
        { codigo: '', nombre: 'Zoclo sanitario', unidad: 'Paquete', cantidad: 4, precioUnitario: 1299 },
        { codigo: '', nombre: 'Silicón para cocina', unidad: 'Tubo', cantidad: 15, precioUnitario: 140 }
      ]
    },

    fachada: {
      nombre: 'FACHADA — Aluminio y acabados',
      icon: 'building',
      manoObra: [
        { descripcion: 'Reconexión de tubos pluviales para bajar por cajillo', unidad: 'Pza', cantidad: 1, precioUnitario: 1120 },
        { descripcion: 'Elaboración de cajillos laterales de puertas', unidad: 'M2', cantidad: 15.6, precioUnitario: 168 },
        { descripcion: 'Pasteado y acabado de concreto pulido en cajillos laterales', unidad: 'M2', cantidad: 15.6, precioUnitario: 210 },
        { descripcion: 'Acabado de concreto en marco de puertas', unidad: 'M2', cantidad: 2, precioUnitario: 126 },
        { descripcion: 'Restauración de cortinas de seguridad e instalación', unidad: 'Pza', cantidad: 2, precioUnitario: 4060 },
        { descripcion: 'Emboquillado de puerta principal y secundaria', unidad: 'Pza', cantidad: 2, precioUnitario: 490 },
        { descripcion: 'Elaboración de cajillo para esconder cortinas de seguridad', unidad: 'M2', cantidad: 10, precioUnitario: 168 },
        { descripcion: 'Pasteado y acabado fino de cajillos', unidad: 'M2', cantidad: 10, precioUnitario: 168 },
        { descripcion: 'Suministro y colocación de ventana de aluminio blanco 3" + cristal 6mm (183 x 220)', unidad: 'Pza', cantidad: 1, precioUnitario: 9200.8 },
        { descripcion: 'Suministro y colocación de puerta pesada de aluminio blanco + cristal 6mm + bisagra hidráulica (113 x 220)', unidad: 'Pza', cantidad: 1, precioUnitario: 12843.6 },
        { descripcion: 'Elaboración de fachada con durock sobresaliente', unidad: 'M2', cantidad: 54.09, precioUnitario: 452.2 },
        { descripcion: 'Retiro de puerta y ventana actual, cerrado con ladrillo y anclado de castillo con repello rústico', unidad: 'Pza', cantidad: 1, precioUnitario: 4340 },
        { descripcion: 'Pintura de fachada (concreto)', unidad: 'M2', cantidad: 94, precioUnitario: 18.2 },
        { descripcion: 'Instalación eléctrica para contacto de tira LED', unidad: 'Pza', cantidad: 2, precioUnitario: 630 },
        { descripcion: 'Salida eléctrica para letrero', unidad: 'Pza', cantidad: 1, precioUnitario: 630 },
        { descripcion: 'Instalación luz LED', unidad: 'Ml', cantidad: 10, precioUnitario: 182 },
        { descripcion: 'Instalación lámparas exteriores', unidad: 'Pza', cantidad: 12, precioUnitario: 490 },
        { descripcion: 'Colocación de celosías de aluminio', unidad: 'Pza', cantidad: 8, precioUnitario: 980 },
        { descripcion: 'Subida de escombro a volteo', unidad: 'Días', cantidad: 2, precioUnitario: 1260 },
        { descripcion: 'Retiro de escombro con volteo', unidad: 'Viaje', cantidad: 2, precioUnitario: 1330 },
        { descripcion: 'Ahogado de SET de lámparas solares', unidad: 'Pza', cantidad: 12, precioUnitario: 350 }
      ],
      materiales: [
        { codigo: 'SKU 173945', nombre: 'Permabase', unidad: 'Hoja', cantidad: 17, precioUnitario: 1025.75 },
        { codigo: 'SKU 704161', nombre: 'Postes 6.35 x 3.05 cal 26', unidad: 'Pza', cantidad: 31, precioUnitario: 101 },
        { codigo: '', nombre: 'Canales 6.35 x 3.05 cal 26', unidad: 'Pza', cantidad: 20, precioUnitario: 148.62 },
        { codigo: '', nombre: 'Basecoat', unidad: 'Bulto', cantidad: 16, precioUnitario: 699 },
        { codigo: '', nombre: 'Crestuco', unidad: 'Bulto', cantidad: 25, precioUnitario: 255 },
        { codigo: '', nombre: 'Pintura Pro 1000 Comex', unidad: 'Cubeta', cantidad: 2, precioUnitario: 2867 },
        { codigo: '', nombre: 'Tira LED', unidad: 'Ml', cantidad: 10, precioUnitario: 120 },
        { codigo: '', nombre: 'Lámparas', unidad: 'Pza', cantidad: 8, precioUnitario: 299 },
        { codigo: '', nombre: 'Celosías de aluminio', unidad: 'Pza', cantidad: 8, precioUnitario: 1200 },
        { codigo: '', nombre: 'HORNA — Set de estacas solares Luz Cálida IP65', unidad: 'SET', cantidad: 2, precioUnitario: 1460 },
        { codigo: '', nombre: 'Silicón', unidad: 'Tubo', cantidad: 10, precioUnitario: 160 }
      ]
    },

    hidraulica: {
      nombre: 'RANURACIÓN Y CONEXIÓN HIDRÁULICA',
      icon: 'droplet',
      manoObra: [
        { descripcion: 'Ranuración de piso para líneas hidráulicas (suministro de agua y drenaje)', unidad: 'ML', cantidad: 49.31, precioUnitario: 180 },
        { descripcion: 'Salida hidráulica por WC/Lavabo', unidad: 'Pza', cantidad: 1, precioUnitario: 1500 },
        { descripcion: 'Salida hidráulica por A/C', unidad: 'Pza', cantidad: 1, precioUnitario: 1500 },
        { descripcion: 'Salida hidráulica para drenaje', unidad: 'Pza', cantidad: 1, precioUnitario: 1500 },
        { descripcion: 'Instalación de coladera', unidad: 'Pza', cantidad: 1, precioUnitario: 2640 },
        { descripcion: 'Conexión de trampa de grasa', unidad: 'Pza', cantidad: 1, precioUnitario: 1500 }
      ],
      materiales: [
        { codigo: '', nombre: 'Tubería PVC Sanitario 4" (6m/tramo)', unidad: 'Pza', cantidad: 24, precioUnitario: 145.2 },
        { codigo: '', nombre: 'Codo 90° PVC 4"', unidad: 'Pza', cantidad: 14, precioUnitario: 15.04 },
        { codigo: '', nombre: 'Codo 45° PVC 4"', unidad: 'Pza', cantidad: 45, precioUnitario: 10.87 },
        { codigo: '', nombre: 'Unión recta/manguito 4"', unidad: 'Pza', cantidad: 13, precioUnitario: 20.08 },
        { codigo: '', nombre: 'Tee sanitaria PVC 4"', unidad: 'Pza', cantidad: 7, precioUnitario: 6.62 },
        { codigo: '', nombre: 'Tapón PVC 4"', unidad: 'Pza', cantidad: 8, precioUnitario: 61.77 },
        { codigo: '', nombre: 'Registro sanitario prefabricado', unidad: 'Pza', cantidad: 2, precioUnitario: 560 },
        { codigo: '', nombre: 'Pegamento PVC sanitario (1L)', unidad: 'Pza', cantidad: 25, precioUnitario: 55.84 },
        { codigo: '', nombre: 'Limpiador de PVC (primer 1L)', unidad: 'Pza', cantidad: 2, precioUnitario: 400 },
        { codigo: '', nombre: 'Tubo CPVC 3/4" línea fría', unidad: 'Pza', cantidad: 21, precioUnitario: 38.23 },
        { codigo: '', nombre: 'Tubo CPVC 3/4" línea caliente', unidad: 'Pza', cantidad: 21, precioUnitario: 38.23 },
        { codigo: '', nombre: 'Coladera Industrial Acero Inox', unidad: 'Pza', cantidad: 1, precioUnitario: 1850 }
      ]
    },

    electrica: {
      nombre: 'INSTALACIÓN ELÉCTRICA',
      icon: 'zap',
      manoObra: [
        { descripcion: 'Conexión de acometida a interruptor general', unidad: 'Pza', cantidad: 1, precioUnitario: 2250 },
        { descripcion: 'Conexión y alimentación de interruptor general a centro de carga (instalado y empotrado)', unidad: 'Pza', cantidad: 1, precioUnitario: 5250 },
        { descripcion: 'Conexión y alimentación de luminaria, recorrido hasta tablero', unidad: 'Pza', cantidad: 6, precioUnitario: 525 },
        { descripcion: 'Conexión y alimentación de extractor, recorrido hasta tablero', unidad: 'Pza', cantidad: 2, precioUnitario: 525 },
        { descripcion: 'Conexión y alimentación de contacto, recorrido hasta tablero', unidad: 'Pza', cantidad: 12, precioUnitario: 600 },
        { descripcion: 'Ranuración de piso y pared para suministro eléctrico', unidad: 'ML', cantidad: 48.52, precioUnitario: 180 },
        { descripcion: 'Conexión y alimentación de campana, recorrido hasta tablero', unidad: 'Pza', cantidad: 1, precioUnitario: 975 }
      ],
      materiales: [
        { codigo: '', nombre: 'Centro de carga empotrado (8 módulos)', unidad: 'Pza', cantidad: 1, precioUnitario: 1269.92 },
        { codigo: '', nombre: 'Interruptor seccionador IG 63A', unidad: 'Pza', cantidad: 2, precioUnitario: 879 },
        { codigo: '', nombre: 'Interruptor diferencial 30mA 63A', unidad: 'Pza', cantidad: 1, precioUnitario: 1620.72 },
        { codigo: '', nombre: 'Breaker 1P 10A (iluminación)', unidad: 'Pza', cantidad: 1, precioUnitario: 224.02 },
        { codigo: '', nombre: 'Breaker 1P 20A (tomas)', unidad: 'Pza', cantidad: 2, precioUnitario: 300 },
        { codigo: '', nombre: 'Cable 1.5 mm² (rollo 100m)', unidad: 'Rollo', cantidad: 4, precioUnitario: 1100 },
        { codigo: '', nombre: 'Cable 2.5 mm² (rollo 100m)', unidad: 'Rollo', cantidad: 3, precioUnitario: 2200 },
        { codigo: '', nombre: 'Conduit PVC 20mm', unidad: 'm', cantidad: 80, precioUnitario: 20 },
        { codigo: '', nombre: 'Conduit PVC 25mm', unidad: 'm', cantidad: 150, precioUnitario: 30 },
        { codigo: '', nombre: 'Plafón / luminaria', unidad: 'Pza', cantidad: 6, precioUnitario: 450 },
        { codigo: '', nombre: 'Extractor ventilación', unidad: 'Pza', cantidad: 2, precioUnitario: 3500 },
        { codigo: '', nombre: 'Contacto (tomacorriente) simple', unidad: 'Pza', cantidad: 12, precioUnitario: 85 },
        { codigo: '', nombre: 'Interruptor (mecanismo) simple', unidad: 'Pza', cantidad: 8, precioUnitario: 65 }
      ]
    },

    gas: {
      nombre: 'INSTALACIÓN DE SISTEMA DE GAS ESTACIONARIO',
      icon: 'flame',
      manoObra: [
        { descripcion: 'Conexión de 3/4 recorrido a cocina', unidad: 'ML', cantidad: 24.21, precioUnitario: 270 },
        { descripcion: 'Instalación de gas a tanque estacionario en azotea', unidad: 'Pza', cantidad: 1, precioUnitario: 1800 },
        { descripcion: 'Conexión de 1/2 recorrido de tanque a cocina', unidad: 'ML', cantidad: 9.82, precioUnitario: 270 }
      ],
      materiales: [
        { codigo: '', nombre: 'Tubo galvanizado cédula 40 de 3/4"', unidad: 'Pza', cantidad: 24.21, precioUnitario: 130 },
        { codigo: '', nombre: 'Codos 90° 3/4"', unidad: 'Pza', cantidad: 6, precioUnitario: 65 },
        { codigo: '', nombre: 'Codos 45° 3/4"', unidad: 'Pza', cantidad: 2, precioUnitario: 65 },
        { codigo: '', nombre: 'Válvula de bola 3/4"', unidad: 'Pza', cantidad: 1, precioUnitario: 350 },
        { codigo: '', nombre: 'Kit de conexión para tanque', unidad: 'JGO', cantidad: 1, precioUnitario: 1850 },
        { codigo: '', nombre: 'Tubo galvanizado cédula 40 de 1/2"', unidad: 'Pza', cantidad: 9.82, precioUnitario: 115 },
        { codigo: '', nombre: 'Manguera flexible certificada', unidad: 'Pza', cantidad: 1, precioUnitario: 620 },
        { codigo: '', nombre: 'Tanque de gas estacionario 1000L TATSA', unidad: 'Pza', cantidad: 1, precioUnitario: 26149 }
      ]
    },

    pintura: {
      nombre: 'PINTURA Y ACABADOS',
      icon: 'brush',
      manoObra: [
        { descripcion: 'Lijado y preparación de superficie', unidad: 'M2', cantidad: 0, precioUnitario: 25 },
        { descripcion: 'Aplicación de sellador', unidad: 'M2', cantidad: 0, precioUnitario: 30 },
        { descripcion: 'Aplicación de pintura (2 manos)', unidad: 'M2', cantidad: 0, precioUnitario: 55 },
        { descripcion: 'Detallado y enmascarillado', unidad: 'M2', cantidad: 0, precioUnitario: 18 }
      ],
      materiales: [
        { codigo: '', nombre: 'Pintura Vinimex Comex (cubeta 19L)', unidad: 'Cubeta', cantidad: 0, precioUnitario: 4553 },
        { codigo: '', nombre: 'Sellador 5x1', unidad: 'Galón', cantidad: 0, precioUnitario: 687 },
        { codigo: '', nombre: 'Lija 180', unidad: 'Pliego', cantidad: 0, precioUnitario: 14.5 },
        { codigo: '', nombre: 'Rodillo azul liso', unidad: 'Pza', cantidad: 0, precioUnitario: 80.5 },
        { codigo: '', nombre: 'Brocha 1.5 pulgadas', unidad: 'Pza', cantidad: 0, precioUnitario: 83.47 },
        { codigo: '', nombre: 'Thinner', unidad: 'Galón', cantidad: 0, precioUnitario: 231 }
      ]
    }
  },

  // Servicios pre-armados para el modo cliente — input por m² o pieza
  serviciosCliente: [
    {
      id: 'remodelacion-cocina',
      nombre: 'Remodelación de cocina',
      descripcion: 'Cambio completo: piso, paredes, azulejo, pintura, instalación hidráulica y eléctrica.',
      icon: 'home',
      tagline: 'Servicio integral',
      unidad: 'M2 de cocina',
      precioPorUnidad: 5400, // promedio del proyecto Daltónico
      precioFijo: 12000, // overhead por trámites
      duracionDias: 14,
      includes: ['Demolición y retiro', 'Nivelación de piso', 'Instalación de cerámico', 'Pintura completa', 'Conexiones hidráulicas y eléctricas'],
      plantilla: 'cocina'
    },
    {
      id: 'fachada-comercial',
      nombre: 'Fachada comercial',
      descripcion: 'Renovación de fachada con aluminio, cristal, iluminación LED y acabados.',
      icon: 'building',
      tagline: 'Local o tienda',
      unidad: 'M2 de fachada',
      precioPorUnidad: 4400,
      precioFijo: 18000,
      duracionDias: 18,
      includes: ['Diseño de fachada', 'Aluminio y cristal', 'Iluminación LED', 'Pintura exterior', 'Acabados de concreto'],
      plantilla: 'fachada'
    },
    {
      id: 'instalacion-electrica',
      nombre: 'Instalación eléctrica',
      descripcion: 'Diseño y ejecución de circuitos, tableros, contactos e iluminación.',
      icon: 'zap',
      tagline: 'Residencial o comercial',
      unidad: 'M2 a instalar',
      precioPorUnidad: 850,
      precioFijo: 8000,
      duracionDias: 7,
      includes: ['Centro de carga', 'Cableado en conduit', 'Contactos y apagadores', 'Plafones e iluminación', 'Puesta a tierra'],
      plantilla: 'electrica'
    },
    {
      id: 'plomeria-hidraulica',
      nombre: 'Plomería e hidráulica',
      descripcion: 'Trazado y conexión de tuberías de agua fría, caliente y drenaje.',
      icon: 'droplet',
      tagline: 'Cocina o baño',
      unidad: 'Salidas hidráulicas',
      precioPorUnidad: 1500,
      precioFijo: 6000,
      duracionDias: 5,
      includes: ['Trazado de líneas', 'Tubería CPVC y PVC', 'Salidas WC/Lavabo', 'Coladeras', 'Pruebas de presión'],
      plantilla: 'hidraulica'
    },
    {
      id: 'gas-estacionario',
      nombre: 'Sistema de gas estacionario',
      descripcion: 'Instalación de tanque, regulador, tubería galvanizada y pruebas de fuga.',
      icon: 'flame',
      tagline: 'Comercial o residencial',
      unidad: 'Metros lineales',
      precioPorUnidad: 270,
      precioFijo: 28000,
      duracionDias: 4,
      includes: ['Tanque estacionario 1000L', 'Tubería cédula 40', 'Regulador y kit', 'Pruebas de hermeticidad', 'Pintura anticorrosiva'],
      plantilla: 'gas'
    },
    {
      id: 'pintura-acabados',
      nombre: 'Pintura y acabados',
      descripcion: 'Pintura interior o exterior con preparación de superficie.',
      icon: 'brush',
      tagline: 'Casa o local',
      unidad: 'M2 a pintar',
      precioPorUnidad: 128,
      precioFijo: 2500,
      duracionDias: 4,
      includes: ['Lijado y resanado', 'Aplicación de sellador', '2 manos de pintura', 'Enmascarillado', 'Limpieza final'],
      plantilla: 'pintura'
    }
  ],

  // Cotización demo precargada (basada en DALTONICO)
  demoDaltonico: {
    cotizacionNum: '0301',
    fecha: new Date().toISOString().slice(0, 10),
    cliente: {
      atencion: 'Mario Alberto Gamboa',
      proyecto: 'Daltónico Cocina',
      direccion: '',
      telefono: '',
      email: ''
    }
  }
};
