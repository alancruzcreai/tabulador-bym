/* ============================================================
   CLIENTE — Wizard guiado de cotización
   ============================================================ */

(function () {
  const selected = new Set();       // service ids
  const sizes = {};                  // serviceId -> cantidad
  const cli = { nombre: '', telefono: '', email: '', ciudad: '', notas: '' };
  let currentStep = 1;

  // ============================================================
  // STEP NAVIGATION
  // ============================================================
  function goStep(n) {
    currentStep = n;
    document.querySelectorAll('[data-screen]').forEach(el => el.classList.add('hidden'));
    document.querySelector(`[data-screen="${n}"]`).classList.remove('hidden');
    updateStepper();
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }

  function updateStepper() {
    document.querySelectorAll('.step').forEach(s => {
      const stepNum = Number(s.dataset.step);
      s.classList.remove('is-active', 'is-done');
      if (stepNum === currentStep) s.classList.add('is-active');
      else if (stepNum < currentStep) s.classList.add('is-done');
    });
  }

  // ============================================================
  // STEP 1 — Service grid
  // ============================================================
  function renderServiceGrid() {
    const grid = document.getElementById('serviceGrid');
    grid.innerHTML = CATALOG.serviciosCliente.map(s => `
      <div class="service-card" data-service="${s.id}">
        <div class="icon-wrap">${Icons.get(s.icon, 22)}</div>
        <div class="body">
          <h4>${s.nombre}</h4>
          <p>${s.descripcion}</p>
          <div class="price">
            Desde <strong>${fmt.money(s.precioFijo + s.precioPorUnidad * 10)}</strong>
            <span style="color:var(--gray-500);"> · ${s.duracionDias} días aprox.</span>
          </div>
        </div>
      </div>
    `).join('');

    grid.querySelectorAll('.service-card').forEach(card => {
      card.addEventListener('click', () => {
        const id = card.dataset.service;
        if (selected.has(id)) {
          selected.delete(id);
          delete sizes[id];
          card.classList.remove('is-selected');
        } else {
          selected.add(id);
          const svc = CATALOG.serviciosCliente.find(x => x.id === id);
          sizes[id] = svc.precioPorUnidad > 0 ? 20 : 1; // sensible default
          card.classList.add('is-selected');
        }
        document.getElementById('step1Next').disabled = selected.size === 0;
      });
    });
  }

  document.getElementById('step1Next').addEventListener('click', () => {
    renderSizeCards();
    goStep(2);
  });

  // ============================================================
  // STEP 2 — Sizing
  // ============================================================
  function renderSizeCards() {
    const wrap = document.getElementById('sizeCards');
    const services = [...selected].map(id => CATALOG.serviciosCliente.find(s => s.id === id));

    wrap.innerHTML = services.map(s => {
      const qty = sizes[s.id];
      const estimate = s.precioFijo + s.precioPorUnidad * qty;
      return `
        <div class="calc-card" data-svc="${s.id}">
          <div style="display:flex; justify-content:space-between; align-items:flex-start; gap:12px; margin-bottom:8px;">
            <div>
              <h4>${s.nombre}</h4>
              <div class="meta">${s.unidad}</div>
            </div>
            <span class="badge badge-blue">${s.duracionDias} días</span>
          </div>

          <div class="calc-grid">
            <div class="field">
              <label>${s.unidad}</label>
              <div class="input-group">
                <input type="number" class="input is-number" data-size="${s.id}" value="${qty}" min="1" step="1" />
                <span class="addon">${s.unidad.split(' ')[0]}</span>
              </div>
              <div class="hint">Mínimo 1 ${s.unidad.split(' ')[0].toLowerCase()}</div>
            </div>
            <div class="field">
              <label>Estimación rápida</label>
              <div style="background:var(--white); border:1px solid var(--gray-200); border-radius:var(--radius); padding:10px 12px; font-variant-numeric:tabular-nums; font-weight:500; font-size:16px;" data-estimate="${s.id}">
                ${fmt.money(estimate)}
              </div>
              <div class="hint">Incluye base + cantidad solicitada</div>
            </div>
          </div>

          <div style="margin-top:16px;">
            <div class="eyebrow" style="margin-bottom:8px;">Incluye</div>
            <div style="display:flex; flex-wrap:wrap; gap:6px;">
              ${s.includes.map(t => `<span class="badge badge-gray">${t}</span>`).join('')}
            </div>
          </div>
        </div>
      `;
    }).join('');

    wrap.querySelectorAll('[data-size]').forEach(input => {
      input.addEventListener('input', e => {
        const id = e.target.dataset.size;
        sizes[id] = Math.max(1, Number(e.target.value) || 1);
        const svc = CATALOG.serviciosCliente.find(s => s.id === id);
        const est = svc.precioFijo + svc.precioPorUnidad * sizes[id];
        const target = wrap.querySelector(`[data-estimate="${id}"]`);
        if (target) target.textContent = fmt.money(est);
      });
    });
  }

  document.getElementById('step2Next').addEventListener('click', () => goStep(3));

  // ============================================================
  // STEP 3 — Contacto
  // ============================================================
  document.getElementById('step3Next').addEventListener('click', () => {
    cli.nombre = document.getElementById('cliNombre').value.trim();
    cli.telefono = document.getElementById('cliTelefono').value.trim();
    cli.email = document.getElementById('cliEmail').value.trim();
    cli.ciudad = document.getElementById('cliCiudad').value.trim();
    cli.notas = document.getElementById('cliNotas').value.trim();

    if (!cli.nombre || !cli.telefono) {
      toast('Necesitamos al menos nombre y teléfono');
      return;
    }
    renderQuoteDetail();
    goStep(4);
  });

  // ============================================================
  // STEP 4 — Cotización final
  // ============================================================
  function buildState() {
    const state = Store.defaultState();
    state.cotizacionNum = 'C' + Date.now().toString().slice(-5);
    state.fecha = new Date().toISOString().slice(0, 10);
    state.cliente = {
      atencion: cli.nombre,
      proyecto: 'Cotización en línea',
      direccion: cli.ciudad,
      telefono: cli.telefono,
      email: cli.email
    };
    state.notas = cli.notas || '';

    state.sections = [...selected].map(id => {
      const svc = CATALOG.serviciosCliente.find(s => s.id === id);
      const qty = sizes[id];
      const tpl = CATALOG.plantillas[svc.plantilla];

      if (tpl) {
        // Use template but scale items proportionally
        const section = Store.makeSection(svc.nombre, svc.icon);
        section.manoObra.items = tpl.manoObra.map(i => Store.makeItem('manoObra', i));
        section.materiales.items = tpl.materiales.map(i => Store.makeItem('materiales', i));

        // Scale based on cantidad (sensitivity)
        const baseQty = svc.id === 'remodelacion-cocina' ? 31 : svc.id === 'fachada-comercial' ? 54 : svc.id === 'plomeria-hidraulica' ? 4 : svc.id === 'instalacion-electrica' ? 30 : svc.id === 'gas-estacionario' ? 24 : 50;
        const ratio = qty / baseQty;
        if (Math.abs(ratio - 1) > 0.05) {
          section.manoObra.items.forEach(it => it.cantidad = Number((it.cantidad * ratio).toFixed(2)));
          section.materiales.items.forEach(it => it.cantidad = Number((it.cantidad * ratio).toFixed(2)));
        }
        return section;
      }
      // Fallback: single line item
      const section = Store.makeSection(svc.nombre, svc.icon);
      section.manoObra.items.push(Store.makeItem('manoObra', {
        descripcion: svc.nombre,
        unidad: svc.unidad,
        cantidad: qty,
        precioUnitario: svc.precioPorUnidad
      }));
      if (svc.precioFijo > 0) {
        section.materiales.items.push(Store.makeItem('materiales', {
          nombre: 'Cargos fijos / movilización',
          unidad: 'Lote',
          cantidad: 1,
          precioUnitario: svc.precioFijo
        }));
      }
      return section;
    });

    return state;
  }

  function renderQuoteDetail() {
    const state = buildState();
    window.__estimateState = state;

    const totals = Store.grandTotals(state);
    document.getElementById('estimateTotal').textContent = fmt.money(totals.total);

    const wrap = document.getElementById('quoteDetail');
    wrap.innerHTML = `
      <div style="display:flex; justify-content:space-between; align-items:center; margin-bottom:16px;">
        <div>
          <div class="eyebrow">Servicios seleccionados</div>
          <h4 style="margin-top:4px; font-size:18px;">${cli.nombre}</h4>
        </div>
        <span class="badge badge-blue mono">#${state.cotizacionNum}</span>
      </div>
      ${state.sections.map(s => {
        const t = Store.sectionTotals(s);
        return `
          <div style="display:flex; justify-content:space-between; align-items:center; padding:10px 0; border-bottom:1px solid var(--gray-200);">
            <div style="display:flex; align-items:center; gap:10px;">
              <div style="width:32px; height:32px; background:var(--blue-light); color:var(--blue); border-radius:var(--radius-sm); display:grid; place-items:center;">${Icons.get(s.icon, 16)}</div>
              <div>
                <div style="font-weight:500; font-size:14px;">${s.nombre}</div>
                <div style="font-size:11px; color:var(--gray-500);">${s.manoObra.items.length + s.materiales.items.length} conceptos</div>
              </div>
            </div>
            <div class="mono" style="font-weight:500;">${fmt.money(t.total)}</div>
          </div>
        `;
      }).join('')}
      <div style="display:flex; justify-content:space-between; padding:14px 0 4px; font-size:13px; color:var(--gray-500);">
        <span>Mano de obra</span>
        <span class="mono">${fmt.money(totals.manoObra)}</span>
      </div>
      <div style="display:flex; justify-content:space-between; padding:4px 0 14px; font-size:13px; color:var(--gray-500);">
        <span>Materiales</span>
        <span class="mono">${fmt.money(totals.materiales)}</span>
      </div>
    `;
  }

  // ============================================================
  // ACTIONS
  // ============================================================
  document.getElementById('btnDownloadEst').addEventListener('click', () => {
    if (!window.__estimateState) return;
    PDFGen.generate(window.__estimateState);
    toast('PDF descargado', 'success');
  });

  document.getElementById('btnRequestFormal').addEventListener('click', () => {
    const state = window.__estimateState;
    if (!state) return;
    const totals = Store.grandTotals(state);
    const subject = encodeURIComponent(`Solicitud de cotización formal — ${cli.nombre}`);
    const body = encodeURIComponent(
      `Hola B&M Construcciones,\n\nMe interesa una cotización formal para los siguientes servicios:\n\n` +
      state.sections.map(s => `• ${s.nombre} — ${fmt.money(Store.sectionTotals(s).total)}`).join('\n') +
      `\n\nEstimado total: ${fmt.money(totals.total)}\n\nDatos:\nNombre: ${cli.nombre}\nTeléfono: ${cli.telefono}\nCorreo: ${cli.email}\nCiudad: ${cli.ciudad}\n\nNotas: ${cli.notas || '—'}\n\nGracias.`
    );
    window.location.href = `mailto:contacto@bymconstrucciones.mx?subject=${subject}&body=${body}`;
    toast('Abriendo tu correo...', 'success');
  });

  // Prev buttons
  document.querySelectorAll('[data-prev]').forEach(btn => {
    btn.addEventListener('click', () => goStep(Number(btn.dataset.prev) - 1));
  });

  // ============================================================
  // TOAST
  // ============================================================
  let toastTimer = null;
  function toast(msg, type) {
    const el = document.getElementById('toast');
    el.textContent = msg;
    el.className = 'toast show' + (type === 'success' ? ' success' : '');
    clearTimeout(toastTimer);
    toastTimer = setTimeout(() => el.classList.remove('show'), 2400);
  }

  // ============================================================
  // INIT
  // ============================================================
  function init() {
    document.getElementById('pillIcon').innerHTML = Icons.get('user', 14);
    document.getElementById('backHomeIcon').innerHTML = Icons.get('arrow_left', 14);
    document.getElementById('next1Icon').innerHTML = Icons.get('arrow_right', 14);
    document.getElementById('next2Icon').innerHTML = Icons.get('arrow_right', 14);
    document.getElementById('next3Icon').innerHTML = Icons.get('arrow_right', 14);
    document.getElementById('prev2Icon').innerHTML = Icons.get('arrow_left', 14);
    document.getElementById('prev3Icon').innerHTML = Icons.get('arrow_left', 14);
    document.getElementById('prev4Icon').innerHTML = Icons.get('arrow_left', 14);
    document.getElementById('dlIcon').innerHTML = Icons.get('download', 14);
    document.getElementById('reqIcon').innerHTML = Icons.get('arrow_right', 14);
    document.getElementById('infoIcon').innerHTML = Icons.get('info', 20);

    renderServiceGrid();
    updateStepper();
    goStep(1);
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }
})();
