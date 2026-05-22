/* ============================================================
   PDF GENERATOR — jsPDF + autoTable
   Diseño B&M Construcción: negro + amarillo, jerarquía clara,
   logo PNG insertado tal cual del archivo del cliente.
   ============================================================ */

window.PDFGen = (function () {
  // Paleta B&M (RGB)
  const C = {
    yellow:     [244, 196, 48],
    yellowDark: [201, 163, 0],
    yellowLight:[255, 232, 138],
    yellowSoft: [255, 244, 209],
    yellow50:   [255, 251, 235],
    black:      [10, 10, 10],
    white:      [255, 255, 255],
    gray900:    [26, 26, 26],
    gray700:    [64, 64, 64],
    gray600:    [95, 99, 104],
    gray500:    [107, 114, 128],
    gray400:    [160, 160, 160],
    gray300:    [212, 212, 212],
    gray200:    [229, 229, 229],
    gray100:    [245, 245, 245],
    gray50:     [250, 250, 250]
  };

  const M = { left: 16, right: 16, top: 16, bottom: 16 };
  const PAGE_W = 210, PAGE_H = 297;
  const CONTENT_W = PAGE_W - M.left - M.right;

  // ============================================================
  // LOGO PRELOAD — convierte PNG a base64 al cargar el script
  // ============================================================
  const logoCache = { color: null, white: null, colorDims: null, whiteDims: null };

  function loadImageBase64(url, maxDim = 512) {
    return fetch(url)
      .then(r => { if (!r.ok) throw new Error('No se pudo cargar ' + url); return r.blob(); })
      .then(blob => new Promise((resolve, reject) => {
        const reader = new FileReader();
        reader.onload = () => {
          const img = new Image();
          img.onload = () => {
            // Downsize si es muy grande (PDF debe quedar liviano)
            const nw = img.naturalWidth, nh = img.naturalHeight;
            let w = nw, h = nh;
            if (Math.max(nw, nh) > maxDim) {
              const ratio = nw / nh;
              if (nw >= nh) { w = maxDim; h = Math.round(maxDim / ratio); }
              else { h = maxDim; w = Math.round(maxDim * ratio); }
              const canvas = document.createElement('canvas');
              canvas.width = w; canvas.height = h;
              const ctx = canvas.getContext('2d');
              ctx.imageSmoothingEnabled = true;
              ctx.imageSmoothingQuality = 'high';
              ctx.drawImage(img, 0, 0, w, h);
              resolve({ data: canvas.toDataURL('image/png'), w, h });
            } else {
              resolve({ data: reader.result, w: nw, h: nh });
            }
          };
          img.onerror = reject;
          img.src = reader.result;
        };
        reader.onerror = reject;
        reader.readAsDataURL(blob);
      }));
  }

  function preloadLogos() {
    loadImageBase64('assets/LOGO.PNG').then(o => { logoCache.color = o.data; logoCache.colorDims = { w: o.w, h: o.h }; }).catch(e => console.warn('LOGO.PNG no cargado:', e.message));
    loadImageBase64('assets/LOGO2.PNG').then(o => { logoCache.white = o.data; logoCache.whiteDims = { w: o.w, h: o.h }; }).catch(e => console.warn('LOGO2.PNG no cargado:', e.message));
  }
  preloadLogos();

  // ============================================================
  // PRIMITIVES
  // ============================================================
  function setFill(doc, c) { doc.setFillColor(c[0], c[1], c[2]); }
  function setDraw(doc, c) { doc.setDrawColor(c[0], c[1], c[2]); }
  function setText(doc, c) { doc.setTextColor(c[0], c[1], c[2]); }

  function text(doc, str, x, y, opts = {}) {
    if (opts.color) setText(doc, opts.color);
    if (opts.size) doc.setFontSize(opts.size);
    doc.setFont('helvetica', opts.style || 'normal');
    doc.text(String(str ?? ''), x, y, { align: opts.align || 'left', maxWidth: opts.maxWidth });
  }

  function fmtMoney(n) {
    const v = Number(n) || 0;
    return '$' + v.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 });
  }
  function fmtNum(n, decimals = 2) {
    return (Number(n) || 0).toLocaleString('en-US', { minimumFractionDigits: decimals, maximumFractionDigits: decimals });
  }
  function fmtDate(iso) {
    if (!iso) return '';
    const [y, m, d] = iso.split('-');
    const meses = ['enero', 'febrero', 'marzo', 'abril', 'mayo', 'junio', 'julio', 'agosto', 'septiembre', 'octubre', 'noviembre', 'diciembre'];
    return `${parseInt(d)} de ${meses[parseInt(m) - 1]}, ${y}`;
  }
  function addDate(iso, days) {
    if (!iso) return '';
    const d = new Date(iso);
    d.setDate(d.getDate() + (days || 0));
    return fmtDate(d.toISOString().slice(0, 10));
  }

  // ============================================================
  // LOGO HELPERS — usa PNG real o fallback vectorial
  // ============================================================
  function drawLogo(doc, variant, x, y, height) {
    // El alias permite a jsPDF reutilizar la imagen entre páginas (1 copia en el PDF total)
    if (variant === 'white' && logoCache.white && logoCache.whiteDims) {
      const ratio = logoCache.whiteDims.w / logoCache.whiteDims.h;
      doc.addImage(logoCache.white, 'PNG', x, y, height * ratio, height, 'logoBMWhite', 'FAST');
      return height * ratio;
    }
    if (variant === 'color' && logoCache.color && logoCache.colorDims) {
      const ratio = logoCache.colorDims.w / logoCache.colorDims.h;
      doc.addImage(logoCache.color, 'PNG', x, y, height * ratio, height, 'logoBMColor', 'FAST');
      return height * ratio;
    }
    return drawLogoVector(doc, variant, x, y, height);
  }

  function drawLogoVector(doc, variant, x, y, h) {
    const onDark = variant === 'white';
    const accent = C.yellow;
    const text = onDark ? C.white : C.black;
    const s = h / 100;
    doc.setDrawColor(accent[0], accent[1], accent[2]);
    doc.setLineWidth(1.4);
    doc.setLineCap('butt');
    doc.setLineJoin('miter');
    const xs = [14, 14, 38, 62, 62];
    const ys = [78, 30, 12, 30, 78];
    for (let i = 0; i < xs.length - 1; i++) {
      doc.line(x + xs[i] * s, y + ys[i] * s, x + xs[i + 1] * s, y + ys[i + 1] * s);
    }
    doc.line(x + 38 * s, y + 12 * s, x + 38 * s, y + 78 * s);
    setText(doc, accent);
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(h * 0.45);
    doc.text('B&M', x + 70 * s, y + 62 * s);
    doc.setFont('helvetica', 'normal');
    doc.setFontSize(h * 0.10);
    setText(doc, onDark ? C.white : C.gray600);
    doc.text('CONSTRUCCIÓN', x + 70 * s, y + 78 * s, { charSpace: 0.4 });
    return h * 1.4;
  }

  // ============================================================
  // GENERATE
  // ============================================================
  function generate(state) {
    const { jsPDF } = window.jspdf;
    const doc = new jsPDF({ unit: 'mm', format: 'a4' });

    drawCover(doc, state);
    doc.addPage();
    drawExecutiveSummary(doc, state);
    drawSections(doc, state);
    drawTerms(doc, state);
    drawFooterOnAllPages(doc, state);

    const num = state.cotizacionNum || 'sn';
    const cliente = (state.cliente.proyecto || state.cliente.atencion || 'cotizacion').replace(/[^a-zA-Z0-9]/g, '_').slice(0, 40) || 'cotizacion';
    doc.save(`BM_Cotizacion_${num}_${cliente}.pdf`);
  }

  // ============================================================
  // COVER PAGE
  // ============================================================
  function drawCover(doc, state) {
    const totals = Store.grandTotals(state);

    // —— Banda negra superior (115mm)
    setFill(doc, C.black);
    doc.rect(0, 0, PAGE_W, 115, 'F');
    // Stripe amarillo lateral izquierdo
    setFill(doc, C.yellow);
    doc.rect(0, 0, 5, 115, 'F');

    // Logo (variant white para fondo negro)
    drawLogo(doc, 'white', M.left, 14, 28);

    // # Cotización (top right)
    text(doc, 'COTIZACIÓN', PAGE_W - M.right, 22, { color: C.yellowLight, size: 8, style: 'bold', align: 'right' });
    text(doc, '#' + (state.cotizacionNum || '—'), PAGE_W - M.right, 36, { color: C.yellow, size: 26, style: 'bold', align: 'right' });

    // Título proyecto (centro de la banda)
    text(doc, (state.cliente.proyecto || 'Proyecto sin nombre').toUpperCase(), M.left, 70, { color: C.white, size: 26, style: 'normal', maxWidth: CONTENT_W });

    // Línea separadora amarilla
    setFill(doc, C.yellow);
    doc.rect(M.left, 78, 40, 0.8, 'F');

    // Preparado para / Fecha
    text(doc, 'PREPARADO PARA', M.left, 88, { color: C.yellowLight, size: 7, style: 'bold' });
    text(doc, (state.cliente.atencion || '—').toUpperCase(), M.left, 95, { color: C.white, size: 14, style: 'bold', maxWidth: 90 });

    text(doc, 'FECHA', M.left + 95, 88, { color: C.yellowLight, size: 7, style: 'bold' });
    text(doc, fmtDate(state.fecha) || '—', M.left + 95, 95, { color: C.white, size: 12 });

    // —— Card blanco con resumen ejecutivo
    const cardY = 125;
    const cardH = 92;
    setFill(doc, C.white);
    setDraw(doc, C.gray200);
    doc.setLineWidth(0.3);
    doc.rect(M.left, cardY, CONTENT_W, cardH, 'FD');

    let y = cardY + 10;
    text(doc, 'RESUMEN EJECUTIVO', M.left + 6, y, { color: C.gray500, size: 7, style: 'bold' });
    y += 7;
    text(doc, 'Inversión total estimada', M.left + 6, y, { color: C.black, size: 16 });
    y += 10;

    // Barra MO vs Materiales (full width)
    const barX = M.left + 6;
    const barW = CONTENT_W - 12;
    const moPct = totals.subtotal > 0 ? totals.manoObra / totals.subtotal : 0;
    const matPct = totals.subtotal > 0 ? totals.materiales / totals.subtotal : 0;

    setFill(doc, C.gray100);
    doc.rect(barX, y, barW, 5, 'F');
    setFill(doc, C.yellow);
    doc.rect(barX, y, barW * moPct, 5, 'F');
    setFill(doc, C.black);
    doc.rect(barX + barW * moPct, y, barW * matPct, 5, 'F');

    y += 12;

    // Leyenda en 2 columnas (MO izquierda, Materiales derecha)
    const colW = barW / 2;
    // MO
    setFill(doc, C.yellow);
    doc.rect(barX, y - 2.5, 2.5, 2.5, 'F');
    text(doc, 'Mano de obra', barX + 4.5, y, { color: C.gray700, size: 8 });
    text(doc, fmtMoney(totals.manoObra), barX, y + 6, { color: C.black, size: 12, style: 'bold' });
    text(doc, `${(moPct * 100).toFixed(0)}% del proyecto`, barX, y + 11, { color: C.gray500, size: 7 });
    // Materiales
    const matX = barX + colW;
    setFill(doc, C.black);
    doc.rect(matX, y - 2.5, 2.5, 2.5, 'F');
    text(doc, 'Materiales', matX + 4.5, y, { color: C.gray700, size: 8 });
    text(doc, fmtMoney(totals.materiales), matX, y + 6, { color: C.black, size: 12, style: 'bold' });
    text(doc, `${(matPct * 100).toFixed(0)}% del proyecto`, matX, y + 11, { color: C.gray500, size: 7 });

    y += 18;

    // Línea divisora
    setDraw(doc, C.gray200);
    doc.setLineWidth(0.2);
    doc.line(barX, y, barX + barW, y);

    y += 5;

    // TOTAL — fila completa abajo, negra con stripe amarillo
    setFill(doc, C.black);
    doc.rect(barX, y, barW, 18, 'F');
    setFill(doc, C.yellow);
    doc.rect(barX, y, 2.5, 18, 'F');
    text(doc, 'INVERSIÓN TOTAL', barX + 6, y + 7, { color: C.yellowLight, size: 7, style: 'bold' });
    text(doc, state.iva ? '(incluye I.V.A. sobre mano de obra)' : '(no incluye I.V.A.)', barX + 6, y + 13, { color: C.gray400, size: 7 });
    text(doc, fmtMoney(totals.total), barX + barW - 4, y + 13, { color: C.yellow, size: 18, style: 'bold', align: 'right' });

    // —— 3 info cells abajo del card
    const infoY = cardY + cardH + 8;
    drawInfoCell(doc, M.left, infoY, 'SECCIONES', String(state.sections.length), 55);
    drawInfoCell(doc, M.left + 60, infoY, 'VÁLIDA HASTA', addDate(state.fecha, state.validezDias || 30) || '—', 65);
    drawInfoCell(doc, M.left + 130, infoY, 'GARANTÍA', state.garantia || '—', CONTENT_W - 130);

    // —— Footer cover: ingenieros + dirección
    const engY = 252;
    setDraw(doc, C.gray200);
    doc.line(M.left, engY - 4, PAGE_W - M.right, engY - 4);
    text(doc, 'ELABORADO POR', M.left, engY, { color: C.gray500, size: 7, style: 'bold' });

    text(doc, CATALOG.empresa.ingenieros[0].nombre, M.left, engY + 6, { color: C.black, size: 9, style: 'bold' });
    text(doc, 'Cédula Profesional: ' + CATALOG.empresa.ingenieros[0].cedula, M.left, engY + 11, { color: C.gray700, size: 8 });

    text(doc, CATALOG.empresa.ingenieros[1].nombre, M.left + 95, engY + 6, { color: C.black, size: 9, style: 'bold' });
    text(doc, 'Cédula Profesional: ' + CATALOG.empresa.ingenieros[1].cedula, M.left + 95, engY + 11, { color: C.gray700, size: 8 });

    text(doc, CATALOG.empresa.direccion, M.left, engY + 21, { color: C.gray500, size: 7, maxWidth: CONTENT_W });
    text(doc, 'Tel: ' + CATALOG.empresa.telefonos, M.left, engY + 26, { color: C.gray500, size: 7 });
  }

  function drawInfoCell(doc, x, y, label, value, w) {
    setFill(doc, C.gray50);
    setDraw(doc, C.gray200);
    doc.setLineWidth(0.2);
    doc.rect(x, y, w - 5, 22, 'FD');
    text(doc, label, x + 4, y + 7, { color: C.gray500, size: 7, style: 'bold' });
    const v = String(value);
    // Wrap si es muy largo
    const lines = doc.splitTextToSize(v, w - 10);
    lines.slice(0, 2).forEach((ln, i) => {
      text(doc, ln, x + 4, y + 14 + i * 4, { color: C.black, size: 9, style: 'bold' });
    });
  }

  // ============================================================
  // EXECUTIVE SUMMARY (página 2)
  // ============================================================
  function drawExecutiveSummary(doc, state) {
    drawPageHeader(doc, state, 'Resumen ejecutivo');
    let y = 36;

    const totals = Store.grandTotals(state);

    text(doc, 'Desglose por sección', M.left, y, { color: C.black, size: 16 });
    y += 6;
    text(doc, 'Inversión segmentada del proyecto. Cada sección agrupa mano de obra y materiales.', M.left, y, { color: C.gray500, size: 9 });
    y += 12;

    // Tabla resumen por sección
    const rows = state.sections.map((s, i) => {
      const t = Store.sectionTotals(s);
      return [
        String(i + 1).padStart(2, '0'),
        s.nombre,
        fmtMoney(t.manoObra),
        fmtMoney(t.materiales),
        fmtMoney(t.total),
        totals.subtotal > 0 ? ((t.total / totals.subtotal) * 100).toFixed(1) + '%' : '0%'
      ];
    });

    doc.autoTable({
      startY: y,
      head: [['#', 'Sección', 'Mano de obra', 'Materiales', 'Total', '%']],
      body: rows,
      theme: 'plain',
      styles: { font: 'helvetica', fontSize: 9, cellPadding: { top: 5, right: 4, bottom: 5, left: 4 }, lineColor: C.gray200, lineWidth: 0 },
      headStyles: { fontStyle: 'bold', textColor: C.gray500, fontSize: 7, fillColor: C.gray50, lineWidth: 0, halign: 'left' },
      columnStyles: {
        0: { cellWidth: 10, textColor: C.gray500, fontStyle: 'bold' },
        1: { cellWidth: 64 },
        2: { halign: 'right', cellWidth: 30 },
        3: { halign: 'right', cellWidth: 30 },
        4: { halign: 'right', cellWidth: 30, fontStyle: 'bold' },
        5: { halign: 'right', cellWidth: 14, textColor: C.gray500 }
      },
      didDrawCell: data => {
        if (data.section === 'body') {
          doc.setDrawColor(229, 229, 229);
          doc.setLineWidth(0.1);
          doc.line(data.cell.x, data.cell.y + data.cell.height, data.cell.x + data.cell.width, data.cell.y + data.cell.height);
        }
      },
      margin: { left: M.left, right: M.right }
    });

    y = doc.lastAutoTable.finalY + 8;

    // Totales resumen
    function summaryRow(label, value, opts = {}) {
      const h = opts.tall ? 12 : 8;
      if (opts.fill) {
        setFill(doc, opts.fill);
        doc.rect(M.left + 80, y, CONTENT_W - 80, h, 'F');
      }
      if (opts.stripe) {
        setFill(doc, C.yellow);
        doc.rect(M.left + 80, y, 2, h, 'F');
      }
      text(doc, label, M.left + 85, y + h - 3, { color: opts.labelColor || C.gray700, size: opts.tall ? 8 : 9, style: opts.tall ? 'bold' : 'normal' });
      text(doc, value, PAGE_W - M.right - 4, y + h - 3, { color: opts.valueColor || C.black, size: opts.tall ? 14 : 10, style: 'bold', align: 'right' });
      y += h + 1;
    }

    summaryRow('Subtotal', fmtMoney(totals.subtotal), { fill: C.gray50 });
    if (totals.adicional > 0) {
      summaryRow(`Utilidad / ajuste global (${state.porcentajeGlobalAdicional || 0}%)`, fmtMoney(totals.adicional), { fill: C.gray50 });
    }
    if (state.iva && totals.ivaAmount > 0) {
      summaryRow('I.V.A. 16% sobre mano de obra', fmtMoney(totals.ivaAmount), { fill: C.gray50 });
    }
    // Grand total
    summaryRow('INVERSIÓN TOTAL', fmtMoney(totals.total), { fill: C.black, stripe: true, labelColor: C.yellowLight, valueColor: C.yellow, tall: true });

    y += 10;

    // Forma de pago (si cabe en la página)
    if (y > 230) { doc.addPage(); drawPageHeader(doc, state, 'Forma de pago'); y = 36; }
    drawPaymentSchedule(doc, state, y);
  }

  function drawPaymentSchedule(doc, state, startY) {
    let y = startY;
    const totals = Store.grandTotals(state);
    const fp = state.formaPago || { anticipo: 50, avance: 25, final: 25 };

    text(doc, 'Forma de pago sugerida', M.left, y, { color: C.black, size: 14 });
    y += 5;
    text(doc, 'Pagos escalonados según avance de obra. Sujeto a contrato.', M.left, y, { color: C.gray500, size: 9 });
    y += 10;

    const colW = (CONTENT_W - 10) / 3;
    const stages = [
      { label: 'Anticipo', pct: fp.anticipo, note: 'Al firmar contrato', stripeColor: C.yellow },
      { label: 'Avance', pct: fp.avance, note: '50% de obra ejecutada', stripeColor: C.gray500 },
      { label: 'Entrega', pct: fp.final, note: 'Al cierre y entrega', stripeColor: C.black }
    ];

    stages.forEach((s, i) => {
      const x = M.left + i * (colW + 5);
      setFill(doc, C.white);
      setDraw(doc, C.gray200);
      doc.setLineWidth(0.2);
      doc.rect(x, y, colW, 34, 'FD');
      setFill(doc, s.stripeColor);
      doc.rect(x, y, colW, 2, 'F');
      text(doc, s.label.toUpperCase(), x + 5, y + 9, { color: C.gray500, size: 7, style: 'bold' });
      text(doc, fmtMoney(totals.total * s.pct / 100), x + 5, y + 19, { color: C.black, size: 13, style: 'bold' });
      text(doc, s.pct + '% · ' + s.note, x + 5, y + 26, { color: C.gray500, size: 8 });
    });
  }

  // ============================================================
  // SECTIONS
  // ============================================================
  function drawSections(doc, state) {
    state.sections.forEach((section, idx) => {
      doc.addPage();
      drawPageHeader(doc, state, `Sección ${idx + 1} de ${state.sections.length}`);
      drawSectionDetail(doc, state, section, idx);
    });
  }

  function drawSectionDetail(doc, state, section, idx) {
    let y = 36;
    const totals = Store.sectionTotals(section);

    // Header card
    setFill(doc, C.yellow50);
    doc.rect(M.left, y, CONTENT_W, 26, 'F');
    setFill(doc, C.yellow);
    doc.rect(M.left, y, 2.5, 26, 'F');

    text(doc, `${String(idx + 1).padStart(2, '0')}`, M.left + 8, y + 12, { color: C.yellowDark, size: 22, style: 'bold' });
    text(doc, section.nombre, M.left + 22, y + 11, { color: C.black, size: 13, style: 'bold', maxWidth: 110 });
    text(doc, `${section.manoObra.items.length} mano de obra · ${section.materiales.items.length} materiales`, M.left + 22, y + 18, { color: C.gray500, size: 8 });

    text(doc, 'TOTAL SECCIÓN', PAGE_W - M.right - 4, y + 8, { color: C.gray500, size: 7, style: 'bold', align: 'right' });
    text(doc, fmtMoney(totals.total), PAGE_W - M.right - 4, y + 18, { color: C.black, size: 14, style: 'bold', align: 'right' });

    y += 34;

    if (section.manoObra.items.length > 0) {
      y = drawGroupTable(doc, state, section.manoObra, y, 'Mano de obra', 'manoObra', section);
    }

    if (section.materiales.items.length > 0) {
      if (y > 215) { doc.addPage(); drawPageHeader(doc, state, section.nombre + ' (cont.)'); y = 36; }
      y = drawGroupTable(doc, state, section.materiales, y, 'Materiales', 'materiales', section);
    }
  }

  function drawGroupTable(doc, state, group, startY, title, kind) {
    let y = startY;
    const isMO = kind === 'manoObra';
    const subtotal = Store.subtotalGroup(group);
    const accent = isMO ? C.yellow : C.gray700;
    const labelColor = isMO ? C.yellowDark : C.gray700;

    // Group title
    setFill(doc, accent);
    doc.rect(M.left, y - 2.5, 2.5, 2.5, 'F');
    text(doc, title.toUpperCase(), M.left + 5, y, { color: labelColor, size: 9, style: 'bold' });
    if (group.porcentaje) {
      text(doc, `+ ${group.porcentaje}% aplicado al grupo`, PAGE_W - M.right, y, { color: C.gray500, size: 8, align: 'right' });
    }
    y += 4;

    let head, body, colStyles;

    if (isMO) {
      head = [['Descripción', 'Unidad', 'Cantidad', 'P. Unitario', '%', 'Importe']];
      body = group.items.map(it => [
        it.descripcion || '—',
        it.unidad || '',
        fmtNum(it.cantidad),
        fmtMoney(it.precioUnitario),
        (it.porcentaje || 0) + '%',
        fmtMoney(Store.itemImporte(it))
      ]);
      colStyles = {
        0: { cellWidth: 78 },
        1: { cellWidth: 18, halign: 'center', textColor: C.gray500 },
        2: { cellWidth: 20, halign: 'right' },
        3: { cellWidth: 26, halign: 'right' },
        4: { cellWidth: 14, halign: 'right', textColor: C.gray500 },
        5: { cellWidth: 26, halign: 'right', fontStyle: 'bold' }
      };
    } else {
      head = [['Código', 'Material', 'Unidad', 'Cant.', 'P. Unitario', '%', 'Importe']];
      body = group.items.map(it => [
        it.codigo || '—',
        it.nombre || '—',
        it.unidad || '',
        fmtNum(it.cantidad, 0),
        fmtMoney(it.precioUnitario),
        (it.porcentaje || 0) + '%',
        fmtMoney(Store.itemImporte(it))
      ]);
      colStyles = {
        0: { cellWidth: 22, textColor: C.gray500 },
        1: { cellWidth: 60 },
        2: { cellWidth: 18, halign: 'center', textColor: C.gray500 },
        3: { cellWidth: 14, halign: 'right' },
        4: { cellWidth: 24, halign: 'right' },
        5: { cellWidth: 14, halign: 'right', textColor: C.gray500 },
        6: { cellWidth: 26, halign: 'right', fontStyle: 'bold' }
      };
    }

    doc.autoTable({
      startY: y + 1,
      head, body,
      theme: 'plain',
      styles: { font: 'helvetica', fontSize: 8, cellPadding: { top: 3, right: 3, bottom: 3, left: 3 }, lineColor: C.gray200, lineWidth: 0 },
      headStyles: { fontStyle: 'bold', textColor: C.gray500, fontSize: 7, fillColor: C.gray50, lineWidth: 0 },
      columnStyles: colStyles,
      alternateRowStyles: { fillColor: [252, 252, 253] },
      margin: { left: M.left, right: M.right },
      didDrawCell: data => {
        if (data.section === 'body') {
          doc.setDrawColor(238, 238, 238);
          doc.setLineWidth(0.1);
          doc.line(data.cell.x, data.cell.y + data.cell.height, data.cell.x + data.cell.width, data.cell.y + data.cell.height);
        }
      }
    });

    y = doc.lastAutoTable.finalY + 2;

    // Subtotal row
    setFill(doc, isMO ? C.yellowSoft : C.gray100);
    doc.rect(M.left, y, CONTENT_W, 8, 'F');
    text(doc, `Subtotal ${title.toLowerCase()}`, M.left + 4, y + 5.5, { color: C.gray700, size: 8, style: 'bold' });
    text(doc, fmtMoney(subtotal), PAGE_W - M.right - 4, y + 5.5, { color: C.black, size: 10, style: 'bold', align: 'right' });

    return y + 14;
  }

  // ============================================================
  // TERMS PAGE
  // ============================================================
  function drawTerms(doc, state) {
    doc.addPage();
    drawPageHeader(doc, state, 'Términos y condiciones');
    let y = 36;

    text(doc, 'Términos del proyecto', M.left, y, { color: C.black, size: 16 });
    y += 6;
    text(doc, 'Condiciones, garantías y cláusulas aplicables a esta cotización.', M.left, y, { color: C.gray500, size: 9 });
    y += 12;

    // Garantía + validez
    const colW = (CONTENT_W - 6) / 2;
    setFill(doc, C.gray50);
    setDraw(doc, C.gray200);
    doc.setLineWidth(0.2);
    doc.rect(M.left, y, colW, 26, 'FD');
    setFill(doc, C.yellow);
    doc.rect(M.left, y, colW, 2, 'F');
    text(doc, 'GARANTÍA', M.left + 4, y + 9, { color: C.gray500, size: 7, style: 'bold' });
    text(doc, state.garantia || '—', M.left + 4, y + 16, { color: C.black, size: 9, style: 'bold', maxWidth: colW - 8 });

    setFill(doc, C.gray50);
    doc.rect(M.left + colW + 6, y, colW, 26, 'FD');
    setFill(doc, C.yellow);
    doc.rect(M.left + colW + 6, y, colW, 2, 'F');
    text(doc, 'VALIDEZ DE LA COTIZACIÓN', M.left + colW + 10, y + 9, { color: C.gray500, size: 7, style: 'bold' });
    text(doc, `${state.validezDias || 30} días naturales`, M.left + colW + 10, y + 15, { color: C.black, size: 9, style: 'bold' });
    text(doc, addDate(state.fecha, state.validezDias || 30), M.left + colW + 10, y + 21, { color: C.gray500, size: 8 });

    y += 34;

    // Cláusulas
    text(doc, 'Cláusulas', M.left, y, { color: C.black, size: 12, style: 'bold' });
    y += 8;

    (state.clausulas || []).forEach((c, i) => {
      if (y > 245) { doc.addPage(); drawPageHeader(doc, state, 'Términos (cont.)'); y = 36; }
      text(doc, String(i + 1).padStart(2, '0'), M.left, y + 1, { color: C.yellowDark, size: 10, style: 'bold' });
      const lines = doc.splitTextToSize(c, CONTENT_W - 12);
      lines.forEach((ln, idx) => {
        text(doc, ln, M.left + 10, y + 1 + idx * 4.2, { color: C.gray700, size: 9 });
      });
      y += lines.length * 4.2 + 7;
    });

    // Notas
    if (state.notas && state.notas.trim()) {
      y += 4;
      if (y > 240) { doc.addPage(); drawPageHeader(doc, state, 'Notas'); y = 36; }
      setFill(doc, C.yellowSoft);
      doc.rect(M.left, y, CONTENT_W, 8, 'F');
      setFill(doc, C.yellow);
      doc.rect(M.left, y, 2, 8, 'F');
      text(doc, 'NOTAS ADICIONALES', M.left + 4, y + 5.5, { color: C.black, size: 8, style: 'bold' });
      y += 12;
      const notaLines = doc.splitTextToSize(state.notas, CONTENT_W);
      notaLines.forEach(ln => {
        text(doc, ln, M.left, y, { color: C.gray700, size: 9 });
        y += 4.5;
      });
      y += 6;
    }

    // Firmas
    if (y > 215) { doc.addPage(); drawPageHeader(doc, state, 'Firmas'); y = 60; }
    y += 16;
    text(doc, 'Aceptación', M.left, y, { color: C.black, size: 12, style: 'bold' });
    text(doc, 'La firma representa la aceptación de los términos descritos. Para dar inicio al proyecto se firmará un contrato de obra.', M.left, y + 5, { color: C.gray500, size: 8, maxWidth: CONTENT_W });
    y += 24;

    const sigW = (CONTENT_W - 12) / 2;
    setDraw(doc, C.gray400);
    doc.setLineWidth(0.4);
    doc.line(M.left, y, M.left + sigW, y);
    doc.line(M.left + sigW + 12, y, M.left + sigW + 12 + sigW, y);

    text(doc, 'B&M CONSTRUCCIONES', M.left, y + 6, { color: C.gray500, size: 7, style: 'bold' });
    text(doc, CATALOG.empresa.ingenieros[0].nombre, M.left, y + 11, { color: C.black, size: 8, style: 'bold' });
    text(doc, 'Cédula Prof: ' + CATALOG.empresa.ingenieros[0].cedula, M.left, y + 15, { color: C.gray500, size: 7 });

    text(doc, 'CLIENTE', M.left + sigW + 12, y + 6, { color: C.gray500, size: 7, style: 'bold' });
    text(doc, state.cliente.atencion || '—', M.left + sigW + 12, y + 11, { color: C.black, size: 8, style: 'bold' });
    text(doc, 'Nombre y firma', M.left + sigW + 12, y + 15, { color: C.gray500, size: 7 });
  }

  // ============================================================
  // PAGE HEADER & FOOTER
  // ============================================================
  function drawPageHeader(doc, state, subtitle) {
    // Logo color a la izquierda
    drawLogo(doc, 'color', M.left, 8, 14);

    text(doc, subtitle || '', M.left + 52, 14, { color: C.gray500, size: 9 });
    text(doc, `Cot. #${state.cotizacionNum || '—'} · ${state.cliente.proyecto || '—'}`, PAGE_W - M.right, 14, { color: C.gray500, size: 8, align: 'right' });

    // Línea base + stripe amarillo
    setFill(doc, C.yellow);
    doc.rect(M.left, 24, 14, 1, 'F');
    setDraw(doc, C.gray200);
    doc.setLineWidth(0.2);
    doc.line(M.left + 16, 24.5, PAGE_W - M.right, 24.5);
  }

  function drawFooterOnAllPages(doc, state) {
    const total = doc.internal.getNumberOfPages();
    for (let p = 1; p <= total; p++) {
      doc.setPage(p);
      setDraw(doc, C.gray200);
      doc.setLineWidth(0.2);
      doc.line(M.left, PAGE_H - 12, PAGE_W - M.right, PAGE_H - 12);

      text(doc, CATALOG.empresa.telefonos, M.left, PAGE_H - 7, { color: C.gray500, size: 7 });
      text(doc, 'Tuxtla Gutiérrez, Chiapas', PAGE_W / 2, PAGE_H - 7, { color: C.gray500, size: 7, align: 'center' });
      text(doc, `${p} / ${total}`, PAGE_W - M.right, PAGE_H - 7, { color: C.gray500, size: 7, align: 'right' });
    }
  }

  return { generate, preloadLogos };
})();
