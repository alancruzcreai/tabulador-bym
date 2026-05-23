/* ============================================================
   ADMIN — Lógica del tabulador
   Arquitectura: event delegation (1 listener para todo el container).
   Esto previene memory leaks y freezes al manipular muchas secciones.
   ============================================================ */

(function () {
  let state = Store.load();
  let autoSaveTimer = null;
  let renderScheduled = false;

  const $container = () => document.getElementById('sectionsContainer');
  const $empty = () => document.getElementById('emptyState');

  // ============================================================
  // PERSIST (debounced)
  // ============================================================
  function persist() {
    clearTimeout(autoSaveTimer);
    autoSaveTimer = setTimeout(() => Store.save(state), 250);
  }

  // ============================================================
  // BINDINGS — Inputs simples con data-bind="path.to.value"
  // ============================================================
  function getByPath(obj, path) {
    return path.split('.').reduce((o, k) => (o == null ? o : o[k]), obj);
  }
  function setByPath(obj, path, value) {
    const keys = path.split('.');
    const last = keys.pop();
    const target = keys.reduce((o, k) => (o[k] = o[k] || {}), obj);
    target[last] = value;
  }

  function bindGlobalInputs() {
    document.querySelectorAll('[data-bind]').forEach(input => {
      const path = input.dataset.bind;
      const isNumber = input.type === 'number';
      const isCheckbox = input.type === 'checkbox';

      const initial = getByPath(state, path);
      if (isCheckbox) input.checked = !!initial;
      else if (initial !== undefined && initial !== null) input.value = initial;

      input.addEventListener('input', () => {
        let v = isCheckbox ? input.checked : input.value;
        if (isNumber) v = v === '' ? '' : Number(v);
        setByPath(state, path, v);
        if (path === 'cotizacionNum') updateNumBadge();
        if (path === 'porcentajeGlobalAdicional' || path.startsWith('formaPago')) renderTotals();
        persist();
      });
    });
  }

  function updateNumBadge() {
    document.getElementById('numBadge').textContent = state.cotizacionNum ? `Cot. #${state.cotizacionNum}` : 'Cot. #—';
  }

  // ============================================================
  // RENDER — Full rebuild (sólo cuando es necesario)
  // ============================================================
  function render() {
    const container = $container();
    const empty = $empty();

    if (!state.sections || state.sections.length === 0) {
      container.innerHTML = '';
      empty.classList.remove('hidden');
      renderTotals();
      return;
    }
    empty.classList.add('hidden');
    container.innerHTML = state.sections.map(s => sectionHTML(s)).join('');
    renderTotals();
  }

  // Repinta totals + meta sin tocar inputs (sin perder foco)
  function refreshDerived() {
    // Sidebar
    renderTotals();
    // Por sección: importe de items, subtotales, chips
    state.sections.forEach(section => {
      const sectionEl = $container().querySelector(`[data-section-id="${section.id}"]`);
      if (!sectionEl) return;
      // Items
      ['manoObra', 'materiales'].forEach(kind => {
        const groupEl = sectionEl.querySelector(`[data-group="${kind}"]`);
        if (!groupEl) return;
        section[kind].items.forEach(item => {
          const tr = groupEl.querySelector(`[data-item-id="${item.id}"]`);
          if (!tr) return;
          const cell = tr.querySelector('.col-importe');
          if (cell) cell.textContent = fmt.money(Store.itemImporte(item));
        });
        const subtotal = Store.subtotalGroup(section[kind]);
        const footValue = groupEl.querySelector('.subsection-foot .value');
        if (footValue) footValue.textContent = fmt.money(subtotal);
      });
      // Section chips
      const t = Store.sectionTotals(section);
      const chips = sectionEl.querySelectorAll('.section-totals .total-chip strong');
      if (chips.length >= 3) {
        chips[0].textContent = fmt.money(t.manoObra);
        chips[1].textContent = fmt.money(t.materiales);
        chips[2].textContent = fmt.money(t.total);
      }
      const meta = sectionEl.querySelector('.section-meta');
      if (meta) meta.textContent = `${section.manoObra.items.length} mano de obra · ${section.materiales.items.length} materiales`;
      // Sub label counts
      ['manoObra', 'materiales'].forEach(kind => {
        const lbl = sectionEl.querySelector(`[data-group="${kind}"] .sub-label .count`);
        if (lbl) {
          const n = section[kind].items.length;
          lbl.textContent = `· ${n} concepto${n === 1 ? '' : 's'}`;
        }
      });
    });
  }

  // ============================================================
  // SECTION TEMPLATES
  // ============================================================
  function sectionHTML(section) {
    const totals = Store.sectionTotals(section);
    return `
      <article class="section-block" data-section-id="${section.id}">
        <header class="section-head">
          <div class="section-icon">${Icons.get(section.icon || 'box', 18)}</div>
          <div class="section-title">
            <input type="text" data-section-name value="${escapeHtml(section.nombre)}" />
            <div class="section-meta">${section.manoObra.items.length} mano de obra · ${section.materiales.items.length} materiales</div>
          </div>
          <div class="section-totals">
            <div class="total-chip">MO <strong>${fmt.money(totals.manoObra)}</strong></div>
            <div class="total-chip">Mat <strong>${fmt.money(totals.materiales)}</strong></div>
            <div class="total-chip" style="background:var(--black); color:var(--white); border-color:var(--black);">Total <strong style="color:var(--white)">${fmt.money(totals.total)}</strong></div>
          </div>
          <button class="row-delete" data-action="delete-section" title="Eliminar sección">${Icons.get('trash', 16)}</button>
        </header>
        <div class="section-body">
          ${groupHTML(section, 'manoObra', 'Mano de obra')}
          ${groupHTML(section, 'materiales', 'Materiales')}
        </div>
      </article>
    `;
  }

  function groupHTML(section, kind, title) {
    const group = section[kind];
    const isMO = kind === 'manoObra';
    const subtotal = Store.subtotalGroup(group);
    const n = group.items.length;
    return `
      <div class="subsection" data-group="${kind}">
        <div class="subsection-head">
          <div class="sub-label">
            <span class="dot ${isMO ? 'dot-mo' : 'dot-mat'}"></span>
            ${title}
            <span class="count" style="font-weight:400; color:var(--gray-500); text-transform:none; letter-spacing:0; margin-left:6px;">· ${n} concepto${n === 1 ? '' : 's'}</span>
          </div>
          <div class="subsection-controls">
            <div class="pct-input" title="Porcentaje adicional aplicado a todo el grupo">
              <label>+%</label>
              <input type="number" data-action="group-pct" value="${group.porcentaje || 0}" min="0" step="0.5" />
              <span class="addon">%</span>
            </div>
          </div>
        </div>
        <div class="items-table-wrap">
        <table class="items-table">
          <thead>
            <tr>
              ${isMO
                ? `<th style="width:42%;">Descripción</th>
                   <th style="width:90px;">Unidad</th>
                   <th class="col-num" style="width:90px;">Cantidad</th>
                   <th class="col-num" style="width:110px;">P. Unitario</th>
                   <th class="col-num" style="width:60px;">+%</th>
                   <th class="col-num" style="width:120px;">Importe</th>
                   <th style="width:40px;"></th>`
                : `<th style="width:90px;">Código</th>
                   <th style="width:32%;">Nombre</th>
                   <th style="width:90px;">Unidad</th>
                   <th class="col-num" style="width:80px;">Cantidad</th>
                   <th class="col-num" style="width:110px;">P. Unitario</th>
                   <th class="col-num" style="width:60px;">+%</th>
                   <th class="col-num" style="width:120px;">Importe</th>
                   <th style="width:40px;"></th>`}
            </tr>
          </thead>
          <tbody>
            ${group.items.map(it => itemRowHTML(it, isMO)).join('')}
          </tbody>
        </table>
        </div>
        <button class="add-row" data-action="add-item">
          ${Icons.get('plus', 14)} Agregar ${isMO ? 'mano de obra' : 'material'}
        </button>
        <div class="subsection-foot">
          <span class="label">Total ${title.toLowerCase()}</span>
          <span class="value mono">${fmt.money(subtotal)}</span>
        </div>
      </div>
    `;
  }

  function itemRowHTML(item, isMO) {
    const importe = Store.itemImporte(item);
    if (isMO) {
      return `
        <tr data-item-id="${item.id}">
          <td><input class="table-input" data-field="descripcion" value="${escapeHtml(item.descripcion || '')}" placeholder="Concepto..." /></td>
          <td><input class="table-input" data-field="unidad" value="${escapeHtml(item.unidad || '')}" /></td>
          <td><input class="table-input is-number" data-field="cantidad" type="number" step="0.01" value="${item.cantidad || 0}" /></td>
          <td><input class="table-input is-number" data-field="precioUnitario" type="number" step="0.01" value="${item.precioUnitario || 0}" /></td>
          <td><input class="table-input is-number" data-field="porcentaje" type="number" step="0.5" value="${item.porcentaje || 0}" /></td>
          <td class="col-importe">${fmt.money(importe)}</td>
          <td class="col-actions"><button class="row-delete" data-action="delete-item">${Icons.get('x', 14)}</button></td>
        </tr>
      `;
    }
    return `
      <tr data-item-id="${item.id}">
        <td><input class="table-input mono" data-field="codigo" value="${escapeHtml(item.codigo || '')}" placeholder="—" /></td>
        <td><input class="table-input" data-field="nombre" value="${escapeHtml(item.nombre || '')}" placeholder="Material..." /></td>
        <td><input class="table-input" data-field="unidad" value="${escapeHtml(item.unidad || '')}" /></td>
        <td><input class="table-input is-number" data-field="cantidad" type="number" step="0.01" value="${item.cantidad || 0}" /></td>
        <td><input class="table-input is-number" data-field="precioUnitario" type="number" step="0.01" value="${item.precioUnitario || 0}" /></td>
        <td><input class="table-input is-number" data-field="porcentaje" type="number" step="0.5" value="${item.porcentaje || 0}" /></td>
        <td class="col-importe">${fmt.money(importe)}</td>
        <td class="col-actions"><button class="row-delete" data-action="delete-item">${Icons.get('x', 14)}</button></td>
      </tr>
    `;
  }

  // ============================================================
  // EVENT DELEGATION — 1 listener para todo el container
  // ============================================================
  function attachContainerDelegation() {
    const container = $container();

    container.addEventListener('input', e => {
      const target = e.target;
      const sectionEl = target.closest('[data-section-id]');
      if (!sectionEl) return;
      const section = state.sections.find(s => s.id === sectionEl.dataset.sectionId);
      if (!section) return;

      // Section name
      if (target.matches('[data-section-name]')) {
        section.nombre = target.value;
        persist();
        return;
      }

      // Group percentage
      if (target.matches('[data-action="group-pct"]')) {
        const groupEl = target.closest('[data-group]');
        const kind = groupEl.dataset.group;
        let pct = Number(target.value) || 0;
        if (pct < 0) { pct = 0; target.value = 0; }
        section[kind].porcentaje = pct;
        refreshDerived();
        persist();
        return;
      }

      // Item field
      const itemTr = target.closest('[data-item-id]');
      if (itemTr && target.matches('[data-field]')) {
        const groupEl = target.closest('[data-group]');
        const kind = groupEl.dataset.group;
        const item = section[kind].items.find(i => i.id === itemTr.dataset.itemId);
        if (!item) return;
        const field = target.dataset.field;
        let val = target.type === 'number' ? Number(target.value) : target.value;
        // Validación: no permitir negativos en numéricos
        if (target.type === 'number' && val < 0) {
          val = 0;
          target.value = 0;
        }
        item[field] = val;
        // Update only the importe cell — keep focus
        const cell = itemTr.querySelector('.col-importe');
        if (cell) cell.textContent = fmt.money(Store.itemImporte(item));
        // Update group subtotal + section chips
        updateGroupSubtotal(sectionEl, section, kind);
        updateSectionChips(sectionEl, section);
        renderTotals();
        persist();
      }
    });

    container.addEventListener('click', e => {
      const target = e.target.closest('[data-action]');
      if (!target) return;
      const action = target.dataset.action;
      const sectionEl = target.closest('[data-section-id]');
      if (!sectionEl) return;
      const section = state.sections.find(s => s.id === sectionEl.dataset.sectionId);
      if (!section) return;

      if (action === 'delete-section') {
        if (confirm(`¿Eliminar la sección "${section.nombre}"?`)) {
          // Remove from state
          state.sections = state.sections.filter(s => s.id !== section.id);
          // Remove element directly — no full re-render
          sectionEl.remove();
          if (state.sections.length === 0) $empty().classList.remove('hidden');
          renderTotals();
          persist();
          toast('Sección eliminada');
        }
        return;
      }

      if (action === 'add-item') {
        const groupEl = target.closest('[data-group]');
        const kind = groupEl.dataset.group;
        const newItem = Store.makeItem(kind);
        section[kind].items.push(newItem);
        // Append row directly to tbody
        const tbody = groupEl.querySelector('tbody');
        const isMO = kind === 'manoObra';
        tbody.insertAdjacentHTML('beforeend', itemRowHTML(newItem, isMO));
        // Focus the first input in the new row
        const newTr = tbody.lastElementChild;
        const firstInput = newTr.querySelector('input');
        if (firstInput) firstInput.focus();
        updateGroupSubtotal(sectionEl, section, kind);
        updateSectionChips(sectionEl, section);
        updateGroupCount(sectionEl, section, kind);
        renderTotals();
        persist();
        return;
      }

      if (action === 'delete-item') {
        const itemTr = target.closest('[data-item-id]');
        const groupEl = target.closest('[data-group]');
        const kind = groupEl.dataset.group;
        section[kind].items = section[kind].items.filter(i => i.id !== itemTr.dataset.itemId);
        itemTr.remove();
        updateGroupSubtotal(sectionEl, section, kind);
        updateSectionChips(sectionEl, section);
        updateGroupCount(sectionEl, section, kind);
        renderTotals();
        persist();
        return;
      }
    });
  }

  function updateGroupSubtotal(sectionEl, section, kind) {
    const subtotal = Store.subtotalGroup(section[kind]);
    const foot = sectionEl.querySelector(`[data-group="${kind}"] .subsection-foot .value`);
    if (foot) foot.textContent = fmt.money(subtotal);
  }

  function updateSectionChips(sectionEl, section) {
    const t = Store.sectionTotals(section);
    const chips = sectionEl.querySelectorAll('.section-totals .total-chip strong');
    if (chips.length >= 3) {
      chips[0].textContent = fmt.money(t.manoObra);
      chips[1].textContent = fmt.money(t.materiales);
      chips[2].textContent = fmt.money(t.total);
    }
    const meta = sectionEl.querySelector('.section-meta');
    if (meta) meta.textContent = `${section.manoObra.items.length} mano de obra · ${section.materiales.items.length} materiales`;
  }

  function updateGroupCount(sectionEl, section, kind) {
    const lbl = sectionEl.querySelector(`[data-group="${kind}"] .sub-label .count`);
    if (lbl) {
      const n = section[kind].items.length;
      lbl.textContent = `· ${n} concepto${n === 1 ? '' : 's'}`;
    }
  }

  // ============================================================
  // TOTALS SIDEBAR
  // ============================================================
  function renderTotals() {
    const t = Store.grandTotals(state);
    document.getElementById('sumMO').textContent = fmt.money(t.manoObra);
    document.getElementById('sumMat').textContent = fmt.money(t.materiales);
    document.getElementById('sumSub').textContent = fmt.money(t.subtotal);
    document.getElementById('sumAdd').textContent = fmt.money(t.adicional);
    document.getElementById('sumIVA').textContent = fmt.money(t.ivaAmount);
    document.getElementById('sumTotal').textContent = fmt.money(t.total);

    const toggle = document.getElementById('toggleIVA');
    toggle.classList.toggle('is-on', !!state.iva);
  }

  // ============================================================
  // ADD SECTION (popover principal + empty state)
  // ============================================================
  function attachAddSection() {
    const btn = document.getElementById('btnAddSection');
    const menu = document.getElementById('addSectionMenu');
    const emptyBtn = document.getElementById('btnEmptyAdd');

    function openMenu() {
      menu.classList.add('is-open');
    }
    function closeMenu() {
      menu.classList.remove('is-open');
    }
    function toggleMenu() {
      menu.classList.toggle('is-open');
    }

    btn.addEventListener('click', e => {
      e.stopPropagation();
      toggleMenu();
    });

    // El botón del empty state: scroll al popover y abrir
    emptyBtn.addEventListener('click', e => {
      e.stopPropagation();
      // Scroll suave hasta el botón principal arriba
      btn.scrollIntoView({ behavior: 'smooth', block: 'center' });
      // Pequeño delay para que se vea el scroll y luego abrir
      setTimeout(() => {
        openMenu();
        // Highlight visual del botón principal
        btn.animate(
          [{ transform: 'scale(1)' }, { transform: 'scale(1.05)' }, { transform: 'scale(1)' }],
          { duration: 400, easing: 'ease-out' }
        );
      }, 300);
    });

    document.addEventListener('click', e => {
      if (!menu.contains(e.target) && !btn.contains(e.target)) closeMenu();
    });

    menu.querySelectorAll('button[data-template]').forEach(b => {
      b.addEventListener('click', () => {
        addSection(b.dataset.template);
        closeMenu();
      });
    });
  }

  function addSection(templateKey) {
    let section;
    if (templateKey === 'blank') {
      section = Store.makeSection();
    } else {
      const tpl = CATALOG.plantillas[templateKey];
      if (!tpl) return;
      section = Store.makeSection(tpl.nombre, tpl.icon);
      section.manoObra.items = tpl.manoObra.map(i => Store.makeItem('manoObra', i));
      section.materiales.items = tpl.materiales.map(i => Store.makeItem('materiales', i));
    }
    state.sections.push(section);

    // Append directly — no full re-render
    $empty().classList.add('hidden');
    const container = $container();
    container.insertAdjacentHTML('beforeend', sectionHTML(section));
    renderTotals();
    persist();
    toast('Sección agregada');

    // Scroll a la nueva sección
    requestAnimationFrame(() => {
      const newEl = container.lastElementChild;
      if (newEl) newEl.scrollIntoView({ behavior: 'smooth', block: 'start' });
    });
  }

  // ============================================================
  // ACTIONS
  // ============================================================
  function attachActions() {
    document.getElementById('btnHistory').addEventListener('click', () => openHistoryModal());

    document.getElementById('toggleIVA').addEventListener('click', () => {
      state.iva = !state.iva;
      renderTotals();
      persist();
    });

    document.getElementById('btnReset').addEventListener('click', () => {
      if (confirm('¿Limpiar toda la cotización? No se podrá recuperar.')) {
        Store.reset();
        state = Store.defaultState();
        location.reload();
      }
    });

    document.getElementById('btnDemo').addEventListener('click', () => {
      if (state.sections.length > 0 && !confirm('Esto reemplazará la cotización actual. ¿Continuar?')) return;
      loadDemo();
    });

    document.getElementById('btnSave').addEventListener('click', () => {
      Store.save(state);
      const entry = Store.commitToHistory(state);
      updateHistoryBadge();
      toast(state.__historyId ? 'Cotización guardada en histórico' : 'Cotización agregada al histórico', 'success');
    });

    document.getElementById('btnExportPDF').addEventListener('click', async () => {
      if (!state.sections.length) {
        toast('Agrega al menos una sección antes de generar el PDF');
        return;
      }
      const btn = document.getElementById('btnExportPDF');
      const originalContent = btn.innerHTML;
      btn.disabled = true;
      btn.innerHTML = '<span class="spinner"></span> Generando…';
      toast('Generando PDF…');
      try {
        // Give the UI a tick to render the loading state
        await new Promise(r => requestAnimationFrame(r));
        await new Promise(r => setTimeout(r, 50));
        window.PDFGen.generate(state);
        toast('PDF descargado correctamente', 'success');
      } catch (e) {
        console.error(e);
        toast('No se pudo generar el PDF. Intenta de nuevo.', 'error');
      } finally {
        btn.disabled = false;
        btn.innerHTML = originalContent;
      }
    });

    document.getElementById('btnPreview').addEventListener('click', () => {
      const totals = Store.grandTotals(state);
      toast(`${state.sections.length} sección${state.sections.length === 1 ? '' : 'es'} · ${fmt.money(totals.total)}`, 'success');
    });
  }

  function loadDemo() {
    state = Store.defaultState();
    state.cotizacionNum = '0301';
    state.fecha = new Date().toISOString().slice(0, 10);
    state.cliente = { ...CATALOG.demoDaltonico.cliente };

    ['cocina', 'hidraulica', 'electrica', 'gas'].forEach(key => {
      const tpl = CATALOG.plantillas[key];
      const section = Store.makeSection(tpl.nombre, tpl.icon);
      section.manoObra.items = tpl.manoObra.map(i => Store.makeItem('manoObra', i));
      section.materiales.items = tpl.materiales.map(i => Store.makeItem('materiales', i));
      state.sections.push(section);
    });

    document.querySelectorAll('[data-bind]').forEach(input => {
      const path = input.dataset.bind;
      const value = getByPath(state, path);
      if (input.type === 'checkbox') input.checked = !!value;
      else input.value = value || '';
    });

    updateNumBadge();
    render();
    toast('Cotización demo cargada (Daltónico Cocina)', 'success');
  }

  // ============================================================
  // HISTORY MODAL
  // ============================================================
  function updateHistoryBadge() {
    const history = Store.loadHistory();
    const badge = document.getElementById('historyBadge');
    if (badge) {
      badge.textContent = history.length;
      badge.style.display = history.length > 0 ? 'inline-flex' : 'none';
    }
  }

  function openHistoryModal() {
    renderHistoryList('');
    document.getElementById('historyModal').classList.add('is-open');
    document.body.style.overflow = 'hidden';
    setTimeout(() => document.getElementById('historySearch').focus(), 100);
  }

  function closeHistoryModal() {
    document.getElementById('historyModal').classList.remove('is-open');
    document.body.style.overflow = '';
  }

  function renderHistoryList(query) {
    const history = Store.loadHistory();
    const list = document.getElementById('historyList');
    const subtitle = document.getElementById('historyModalSubtitle');
    const q = (query || '').trim().toLowerCase();

    const filtered = q
      ? history.filter(h =>
          (h.cotizacionNum || '').toLowerCase().includes(q) ||
          (h.cliente.atencion || '').toLowerCase().includes(q) ||
          (h.cliente.proyecto || '').toLowerCase().includes(q))
      : history;

    subtitle.textContent = history.length === 0
      ? 'Aún no tienes cotizaciones guardadas'
      : (q ? `${filtered.length} de ${history.length} cotizaciones` : `${history.length} cotización${history.length === 1 ? '' : 'es'} guardada${history.length === 1 ? '' : 's'}`);

    if (filtered.length === 0) {
      list.innerHTML = `
        <div class="history-empty">
          <div class="icon-wrap">${Icons.get(history.length === 0 ? 'folder' : 'search', 20)}</div>
          <h4>${history.length === 0 ? 'Sin cotizaciones aún' : 'Sin coincidencias'}</h4>
          <p>${history.length === 0 ? 'Cuando guardes una cotización aparecerá aquí.' : 'Intenta otro término de búsqueda.'}</p>
        </div>
      `;
      return;
    }

    list.innerHTML = filtered.map(h => historyItemHTML(h)).join('');

    list.querySelectorAll('[data-history-id]').forEach(row => {
      const id = row.dataset.historyId;
      row.addEventListener('click', e => {
        if (e.target.closest('[data-history-action]')) return;
        openHistoryEntry(id);
      });
      row.querySelectorAll('[data-history-action]').forEach(btn => {
        btn.addEventListener('click', e => {
          e.stopPropagation();
          const action = btn.dataset.historyAction;
          if (action === 'open') openHistoryEntry(id);
          else if (action === 'duplicate') duplicateHistoryEntry(id);
          else if (action === 'delete') deleteHistoryEntry(id);
        });
      });
    });
  }

  function historyItemHTML(h) {
    const cliente = escapeHtml(h.cliente.atencion || 'Sin nombre');
    const proyecto = escapeHtml(h.cliente.proyecto || 'Sin proyecto');
    return `
      <div class="history-item" data-history-id="${h.id}">
        <span class="h-num">#${escapeHtml(h.cotizacionNum || '—')}</span>
        <div class="h-info">
          <div class="h-name">${cliente}</div>
          <div class="h-meta">
            <span>${proyecto}</span>
            <span class="dot-sep">·</span>
            <span>${h.sectionsCount} sec${h.sectionsCount === 1 ? '' : 'ciones'}</span>
            <span class="dot-sep">·</span>
            <span>${h.itemsCount} items</span>
          </div>
        </div>
        <div class="h-total">
          ${fmt.money(h.total)}
          <div class="h-date">${relativeDate(h.savedAt)}</div>
        </div>
        <div class="h-actions">
          <button class="btn-icon" data-history-action="open" title="Abrir">${Icons.get('pencil', 14)}</button>
          <button class="btn-icon" data-history-action="duplicate" title="Duplicar">${Icons.get('duplicate', 14)}</button>
          <button class="btn-icon danger" data-history-action="delete" title="Eliminar">${Icons.get('trash', 14)}</button>
        </div>
      </div>
    `;
  }

  function relativeDate(ts) {
    if (!ts) return '';
    const now = Date.now();
    const diffMin = Math.round((now - ts) / 60000);
    if (diffMin < 1) return 'ahora';
    if (diffMin < 60) return `hace ${diffMin} min`;
    const diffH = Math.round(diffMin / 60);
    if (diffH < 24) return `hace ${diffH} h`;
    const diffD = Math.round(diffH / 24);
    if (diffD < 30) return `hace ${diffD} día${diffD === 1 ? '' : 's'}`;
    const d = new Date(ts);
    return d.toLocaleDateString('es-MX', { day: '2-digit', month: 'short', year: 'numeric' });
  }

  function openHistoryEntry(id) {
    const history = Store.loadHistory();
    const entry = history.find(h => h.id === id);
    if (!entry) return;
    if (state.sections.length > 0 && state.__historyId !== id) {
      if (!confirm('Esto reemplazará la cotización actual. ¿Continuar?\n\n(Guarda primero la cotización actual al histórico si quieres conservarla.)')) return;
    }
    state = { ...entry.state, __historyId: entry.id };
    Store.save(state);
    syncInputsFromState();
    updateNumBadge();
    render();
    closeHistoryModal();
    toast('Cotización abierta: ' + (entry.cliente.atencion || '#' + entry.cotizacionNum), 'success');
  }

  function duplicateHistoryEntry(id) {
    const newEntry = Store.duplicateInHistory(id);
    if (!newEntry) return;
    updateHistoryBadge();
    renderHistoryList(document.getElementById('historySearch').value);
    toast(`Duplicada como #${newEntry.cotizacionNum}`, 'success');
  }

  function deleteHistoryEntry(id) {
    const history = Store.loadHistory();
    const entry = history.find(h => h.id === id);
    if (!entry) return;
    if (!confirm(`¿Eliminar definitivamente la cotización #${entry.cotizacionNum} de ${entry.cliente.atencion || 'sin nombre'}?`)) return;
    Store.deleteFromHistory(id);
    updateHistoryBadge();
    renderHistoryList(document.getElementById('historySearch').value);
    if (state.__historyId === id) {
      delete state.__historyId;
      Store.save(state);
    }
    toast('Cotización eliminada del histórico');
  }

  function syncInputsFromState() {
    document.querySelectorAll('[data-bind]').forEach(input => {
      const path = input.dataset.bind;
      const value = getByPath(state, path);
      if (input.type === 'checkbox') input.checked = !!value;
      else input.value = value === undefined || value === null ? '' : value;
    });
  }

  function attachHistoryModal() {
    document.getElementById('closeHistoryModal').addEventListener('click', closeHistoryModal);
    document.getElementById('historyModal').addEventListener('click', e => {
      if (e.target.id === 'historyModal') closeHistoryModal();
    });
    document.addEventListener('keydown', e => {
      if (e.key === 'Escape' && document.getElementById('historyModal').classList.contains('is-open')) {
        closeHistoryModal();
      }
    });
    document.getElementById('historySearch').addEventListener('input', e => {
      renderHistoryList(e.target.value);
    });
    document.getElementById('btnSaveCurrentToHistory').addEventListener('click', () => {
      if (!state.sections.length) {
        toast('Agrega al menos una sección antes de guardar');
        return;
      }
      Store.commitToHistory(state);
      Store.save(state);
      updateHistoryBadge();
      renderHistoryList(document.getElementById('historySearch').value);
      toast('Cotización guardada en histórico', 'success');
    });
  }

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

  function escapeHtml(str) {
    return String(str || '').replace(/[&<>"']/g, c => ({
      '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;'
    }[c]));
  }

  // ============================================================
  // INIT
  // ============================================================
  function init() {
    document.getElementById('pillIcon').innerHTML = Icons.get('briefcase', 14);
    document.getElementById('btnDemoIcon').innerHTML = Icons.get('sparkles', 14);
    document.getElementById('btnResetIcon').innerHTML = Icons.get('trash', 14);
    document.getElementById('btnPrevIcon').innerHTML = Icons.get('eye', 14);
    document.getElementById('btnAddIcon').innerHTML = Icons.get('plus', 14);
    document.getElementById('btnEmptyAddIcon').innerHTML = Icons.get('plus', 14);
    document.getElementById('btnPDFIcon').innerHTML = Icons.get('download', 14);
    document.getElementById('btnSaveIcon').innerHTML = Icons.get('save', 14);
    document.getElementById('btnHistoryIcon').innerHTML = Icons.get('history', 14);
    document.getElementById('modalCloseIcon').innerHTML = Icons.get('x', 16);
    document.getElementById('searchIcon').innerHTML = Icons.get('search', 14);
    document.getElementById('saveCurrentIcon').innerHTML = Icons.get('save', 14);

    bindGlobalInputs();
    attachContainerDelegation();
    attachAddSection();
    attachActions();
    attachHistoryModal();
    updateNumBadge();
    updateHistoryBadge();
    render();
  }

  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', init);
  else init();
})();
