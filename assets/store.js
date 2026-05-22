/* ============================================================
   STORE — Estado + persistencia en localStorage
   ============================================================ */

(function () {
  const KEY = 'bym-cotizacion-v1';
  const HISTORY_KEY = 'bym-history-v1';

  const uid = () => Math.random().toString(36).slice(2, 10);

  const defaultState = () => ({
    cotizacionNum: '',
    fecha: new Date().toISOString().slice(0, 10),
    cliente: {
      atencion: '',
      proyecto: '',
      direccion: '',
      telefono: '',
      email: ''
    },
    sections: [],
    porcentajeGlobalAdicional: 0,
    iva: false,
    formaPago: { anticipo: 50, avance: 25, final: 25 },
    validezDias: 30,
    garantia: '6 meses sobre mano de obra. Materiales según especificaciones del fabricante.',
    notas: '',
    clausulas: [...(window.CATALOG?.clausulasDefault || [])]
  });

  function makeSection(name, icon) {
    return {
      id: uid(),
      nombre: name || 'Nueva sección',
      icon: icon || 'box',
      manoObra: { items: [], porcentaje: 0 },
      materiales: { items: [], porcentaje: 0 }
    };
  }

  function makeItem(kind, partial = {}) {
    const base = {
      id: uid(),
      cantidad: 0,
      precioUnitario: 0,
      porcentaje: 0
    };
    if (kind === 'manoObra') {
      return { ...base, descripcion: '', unidad: 'M2', ...partial };
    }
    return { ...base, codigo: '', nombre: '', unidad: 'Pza', ...partial };
  }

  function load() {
    try {
      const raw = localStorage.getItem(KEY);
      if (!raw) return defaultState();
      const parsed = JSON.parse(raw);
      return { ...defaultState(), ...parsed };
    } catch (e) {
      return defaultState();
    }
  }

  function save(state) {
    try {
      localStorage.setItem(KEY, JSON.stringify(state));
    } catch (e) {
      console.warn('No se pudo guardar el estado:', e);
    }
  }

  function reset() {
    localStorage.removeItem(KEY);
  }

  // Cálculos
  function itemImporte(item) {
    const base = (Number(item.cantidad) || 0) * (Number(item.precioUnitario) || 0);
    const pct = Number(item.porcentaje) || 0;
    return base * (1 + pct / 100);
  }

  function subtotalGroup(group) {
    const itemsTotal = (group.items || []).reduce((acc, it) => acc + itemImporte(it), 0);
    const pct = Number(group.porcentaje) || 0;
    return itemsTotal * (1 + pct / 100);
  }

  function sectionTotals(section) {
    const mo = subtotalGroup(section.manoObra);
    const mat = subtotalGroup(section.materiales);
    return { manoObra: mo, materiales: mat, total: mo + mat };
  }

  function grandTotals(state) {
    let subtotal = 0;
    let manoObra = 0;
    let materiales = 0;
    (state.sections || []).forEach(s => {
      const t = sectionTotals(s);
      subtotal += t.total;
      manoObra += t.manoObra;
      materiales += t.materiales;
    });

    const adicional = subtotal * ((Number(state.porcentajeGlobalAdicional) || 0) / 100);
    const conAdicional = subtotal + adicional;
    const ivaAmount = state.iva ? manoObra * 0.16 : 0;
    const total = conAdicional + ivaAmount;

    return {
      subtotal,
      manoObra,
      materiales,
      adicional,
      ivaAmount,
      total
    };
  }

  // ============================================================
  // HISTÓRICO — gestión de cotizaciones guardadas
  // ============================================================
  function loadHistory() {
    try {
      const raw = localStorage.getItem(HISTORY_KEY);
      if (!raw) return [];
      return JSON.parse(raw);
    } catch (e) {
      return [];
    }
  }

  function saveHistory(arr) {
    try {
      localStorage.setItem(HISTORY_KEY, JSON.stringify(arr));
    } catch (e) {
      console.warn('No se pudo guardar el histórico:', e);
    }
  }

  function summarizeForHistory(state) {
    const totals = grandTotals(state);
    return {
      id: state.__historyId || uid(),
      cotizacionNum: state.cotizacionNum || '',
      cliente: {
        atencion: state.cliente?.atencion || '',
        proyecto: state.cliente?.proyecto || '',
        telefono: state.cliente?.telefono || '',
        email: state.cliente?.email || ''
      },
      fecha: state.fecha,
      total: totals.total,
      sectionsCount: (state.sections || []).length,
      itemsCount: (state.sections || []).reduce((acc, s) =>
        acc + (s.manoObra?.items?.length || 0) + (s.materiales?.items?.length || 0), 0),
      savedAt: Date.now(),
      state: { ...state } // snapshot completo
    };
  }

  function commitToHistory(state) {
    const history = loadHistory();
    // Si tiene __historyId, actualizamos
    let entry;
    if (state.__historyId) {
      entry = summarizeForHistory(state);
      const idx = history.findIndex(h => h.id === state.__historyId);
      if (idx >= 0) {
        history[idx] = entry;
      } else {
        history.unshift(entry);
      }
    } else {
      // Nueva entrada
      state.__historyId = uid();
      entry = summarizeForHistory(state);
      // Garantizar que el state guardado tenga el __historyId
      entry.state.__historyId = state.__historyId;
      history.unshift(entry);
    }
    saveHistory(history);
    return entry;
  }

  function deleteFromHistory(id) {
    const history = loadHistory().filter(h => h.id !== id);
    saveHistory(history);
    return history;
  }

  function duplicateInHistory(id) {
    const history = loadHistory();
    const orig = history.find(h => h.id === id);
    if (!orig) return null;
    const dupState = JSON.parse(JSON.stringify(orig.state));
    // Asignar nuevo historyId
    dupState.__historyId = uid();
    // Sugerir nuevo número de cotización
    const m = (dupState.cotizacionNum || '').match(/(\d+)$/);
    if (m) {
      const inc = String(Number(m[1]) + 1).padStart(m[1].length, '0');
      dupState.cotizacionNum = dupState.cotizacionNum.replace(/\d+$/, inc);
    } else {
      dupState.cotizacionNum = (dupState.cotizacionNum || 'COPIA') + '-copia';
    }
    // Marcar copia: agregar prefix temporal en el proyecto
    if (dupState.cliente?.proyecto) {
      dupState.cliente.proyecto = dupState.cliente.proyecto + ' (copia)';
    }
    // Regenerar UUIDs de secciones e items para evitar colisiones de DOM
    (dupState.sections || []).forEach(sec => {
      sec.id = uid();
      ['manoObra', 'materiales'].forEach(kind => {
        (sec[kind]?.items || []).forEach(it => { it.id = uid(); });
      });
    });
    dupState.fecha = new Date().toISOString().slice(0, 10);
    const newEntry = summarizeForHistory(dupState);
    newEntry.state.__historyId = dupState.__historyId;
    history.unshift(newEntry);
    saveHistory(history);
    return newEntry;
  }

  // API global
  window.Store = {
    KEY,
    HISTORY_KEY,
    uid,
    defaultState,
    makeSection,
    makeItem,
    load,
    save,
    reset,
    itemImporte,
    subtotalGroup,
    sectionTotals,
    grandTotals,
    // Histórico
    loadHistory,
    saveHistory,
    commitToHistory,
    deleteFromHistory,
    duplicateInHistory
  };
})();

// Helpers globales de formato
window.fmt = {
  money(n) {
    const v = Number(n) || 0;
    return '$' + v.toLocaleString('es-MX', { minimumFractionDigits: 2, maximumFractionDigits: 2 });
  },
  moneyShort(n) {
    const v = Number(n) || 0;
    if (Math.abs(v) >= 1000000) return '$' + (v / 1000000).toFixed(1) + 'M';
    if (Math.abs(v) >= 1000) return '$' + (v / 1000).toFixed(1) + 'k';
    return '$' + v.toFixed(0);
  },
  number(n, decimals = 2) {
    return (Number(n) || 0).toLocaleString('es-MX', { minimumFractionDigits: decimals, maximumFractionDigits: decimals });
  },
  date(iso) {
    if (!iso) return '';
    const [y, m, d] = iso.split('-');
    const meses = ['enero', 'febrero', 'marzo', 'abril', 'mayo', 'junio', 'julio', 'agosto', 'septiembre', 'octubre', 'noviembre', 'diciembre'];
    return `${parseInt(d)} de ${meses[parseInt(m) - 1]}, ${y}`;
  },
  dateShort(iso) {
    if (!iso) return '';
    const [y, m, d] = iso.split('-');
    return `${d}/${m}/${y}`;
  }
};
