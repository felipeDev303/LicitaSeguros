// Configuración de la API
const API_BASE =
  "https://api.mercadopublico.cl/servicios/v1/publico/licitaciones.json";
const API_TICKET = "F8537A18-6766-4DEF-9E59-426B4FEE2844"; // Ticket de pruebas

// Proxy CORS para desarrollo local (Esto en desarrollo se descomenta)
// const CORS_PROXY = "https://cors-anywhere.herokuapp.com/";
// function proxiedUrl(url) { return CORS_PROXY + url; }
function proxiedUrl(url) {
  return url;
} // En producción, no usar proxy!!!!

/**
 * Se construyó la URL del endpoint de licitaciones con filtros.
 * @param {Object} params - { fecha: 'ddmmaaaa', estado: 'abierta' }
 */
function buildLicitacionesUrl(params = {}) {
  const url = new URL(API_BASE);
  if (params.fecha) url.searchParams.append("fecha", params.fecha);
  if (params.estado) url.searchParams.append("estado", params.estado);
  url.searchParams.append("ticket", API_TICKET);
  return url.toString();
}

/**
 * Obtener el detalle de una licitación por código.
 * @param {string} codigo
 */
async function fetchLicitacionDetalle(codigo) {
  const url = `${API_BASE}?codigo=${codigo}&ticket=${API_TICKET}`;
  const resp = await fetch(proxiedUrl(url));
  if (!resp.ok) throw new Error("No se pudo obtener el detalle");
  return await resp.json();
}

/**
 * Buscar proveedor por RUT.
 * @param {string} rut
 */
async function buscarProveedor(rut) {
  const url = `https://api.mercadopublico.cl/servicios/v1/Publico/Empresas/BuscarProveedor?rutempresaproveedor=${rut}&ticket=${API_TICKET}`;
  const resp = await fetch(proxiedUrl(url));
  if (!resp.ok) throw new Error("No se pudo obtener el proveedor");
  return await resp.json();
}

async function fetchData() {
  try {
    const response = await fetch(apiUrl);
    const data = await response.json();
    console.log(data);
  } catch (error) {
    console.error("Error fetching data:", error);
  }
}

/**
 * Función que toma un array de oportunidades y las renderiza en el DOM.
 * @param {Array} opportunities - El array de objetos de oportunidades del JSON.
 * @param {HTMLElement} container - El elemento del DOM donde se insertarán las tarjetas.
 */
function displayOpportunities(opportunities, container) {
  // Para limpiar el contenedor por si tenía contenido previo.
  container.innerHTML = "";

  if (!opportunities || opportunities.length === 0) {
    container.innerHTML =
      "<p>No se encontraron oportunidades destacadas en este momento.</p>";
    return;
  }

  // Un mapa para traducir CodigoEstado a un texto legible y a una clase CSS.
  const statusMap = {
    5: { text: "Abierta", className: "abierta" },
    6: { text: "Cerrada", className: "cerrada" },
    7: { text: "Adjudicada", className: "adjudicada" },
    8: { text: "Desierta", className: "desierta" },
    15: { text: "Suspendida", className: "suspendida" },
    16: { text: "Revocada", className: "revocada" },
  };

  opportunities.forEach((op) => {
    // Creamos la tarjeta HTML para cada oportunidad.
    const opportunityCard = document.createElement("div");
    opportunityCard.className = "opportunity-card";

    // Obtenemos el estado desde el mapa, con un valor por defecto si no se encuentra.
    const statusInfo = statusMap[op.CodigoEstado] || {
      text: "Desconocido",
      className: "desconocido",
    };

    // Formateamos la fecha para que sea más legible.
    const closingDate = new Date(op.FechaCierre).toLocaleDateString("es-CL", {
      year: "numeric",
      month: "long",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });

    opportunityCard.innerHTML = `
            <div class="card-header">
                <span class="card-status status-${statusInfo.className}">${statusInfo.text}</span>
                <span class="card-id">${op.CodigoExterno}</span>
            </div>
            <h4 class="card-title">${op.Nombre}</h4>
            <div class="card-footer">
                <p class="card-date">Cierre: ${closingDate}</p>
                <a href="detalle_licitacion.html?codigo=${op.CodigoExterno}" class="card-link" target="_blank">Ver detalle</a>
                <a href="https://www.mercadopublico.cl/Procurement/Modules/RFB/DetailsAcquisition.aspx?CodigoExterno=${op.CodigoExterno}" class="card-link" target="_blank" rel="noopener">Ver en Mercado Público</a>
            </div>
        `;
    container.appendChild(opportunityCard);
  });
}

/**
 * Calcula y muestra los KPIs de oportunidades en el dashboard.
 * @param {Array} opportunities - El array de objetos de oportunidades del JSON.
 */
function updateOpportunitiesKPIs(opportunities) {
  // Selección de elementos KPI
  const elTotalVigentes = document.getElementById("kpi-total-vigentes");
  const elMontoLicitaciones = document.getElementById("kpi-monto-licitaciones");
  const elMontoCompraAgil = document.getElementById("kpi-monto-compra-agil");
  const elCierranSemana = document.getElementById("kpi-cierran-semana");

  if (!opportunities || opportunities.length === 0) {
    elTotalVigentes.textContent = "0";
    elMontoLicitaciones.textContent = "$0";
    elMontoCompraAgil.textContent = "$0";
    elCierranSemana.textContent = "0";
    return;
  }

  // Oportunidades vigentes: CodigoEstado === 5 (Abierta)
  const vigentes = opportunities.filter((op) => op.CodigoEstado === 5);

  // Suma de montos de licitaciones vigentes (TipoLicitacion !== 'Compra Ágil')
  const montoLicitaciones = vigentes
    .filter((op) => op.TipoLicitacion !== "Compra Ágil")
    .reduce((sum, op) => sum + (op.MontoEstimado || 0), 0);

  // Suma de montos de compras ágiles vigentes (TipoLicitacion === 'Compra Ágil')
  const montoCompraAgil = vigentes
    .filter((op) => op.TipoLicitacion === "Compra Ágil")
    .reduce((sum, op) => sum + (op.MontoEstimado || 0), 0);

  // Oportunidades que cierran esta semana (vigentes y FechaCierre en la semana actual)
  const now = new Date();
  const firstDay = new Date(now);
  firstDay.setDate(now.getDate() - now.getDay()); // Domingo
  firstDay.setHours(0, 0, 0, 0);
  const lastDay = new Date(firstDay);
  lastDay.setDate(firstDay.getDate() + 6);
  lastDay.setHours(23, 59, 59, 999);

  const cierranSemana = vigentes.filter((op) => {
    const cierre = new Date(op.FechaCierre);
    return cierre >= firstDay && cierre <= lastDay;
  });

  // Formateo de montos CLP
  const formatCLP = (n) =>
    n.toLocaleString("es-CL", {
      style: "currency",
      currency: "CLP",
      maximumFractionDigits: 0,
    });

  elTotalVigentes.textContent = vigentes.length;
  elMontoLicitaciones.textContent = formatCLP(montoLicitaciones);
  elMontoCompraAgil.textContent = formatCLP(montoCompraAgil);
  elCierranSemana.textContent = cierranSemana.length;
}

// Utilidad para obtener la fecha de hoy en formato ddmmaaaa
function getFechaHoyDDMMAAAA() {
  const hoy = new Date();
  const dd = String(hoy.getDate()).padStart(2, "0");
  const mm = String(hoy.getMonth() + 1).padStart(2, "0");
  const yyyy = hoy.getFullYear();
  return `${dd}${mm}${yyyy}`;
}

/**
 * Función principal asíncrona que orquesta el proceso.
 * Permite filtrar por fecha y estado.
 */
async function loadOpportunities({ fecha, estado } = {}) {
  const opportunitiesContainer = document.getElementById("opportunities-list");
  const loadingSpinner = document.getElementById("loading-spinner");
  if (!opportunitiesContainer) return;

  try {
    loadingSpinner.style.display = "block";
    // Usar la API en vez de data.json
    const url = buildLicitacionesUrl({ fecha, estado });
    const response = await fetch(proxiedUrl(url));
    if (!response.ok) throw new Error(`Error HTTP: ${response.status}`);
    const data = await response.json();
    loadingSpinner.style.display = "none";
    displayOpportunities(data.Listado, opportunitiesContainer);
    updateOpportunitiesKPIs(data.Listado);
  } catch (error) {
    console.error(
      "Error al cargar las oportunidades:",
      error,
      error?.stack || ""
    );
    loadingSpinner.style.display = "none";
    if (opportunitiesContainer) {
      // En producción, solo muestra el mensaje genérico
      // En desarrollo, muestra el error real
      const isDev = !(
        "update_url" in chrome.runtime || "update_url" in browser.runtime
      );
      opportunitiesContainer.innerHTML =
        '<p class="error-message">Hubo un problema al cargar los datos. Por favor, inténtalo más tarde.' +
        (isDev ? `<br><small>${error.message}</small>` : "") +
        "</p>";
    }
  }
}

// Escuchamos el evento 'DOMContentLoaded' para ejecutar nuestro script.
// Por defecto, muestra las licitaciones abiertas de hoy.
document.addEventListener("DOMContentLoaded", () => {
  // Usar función robusta para la fecha
  const fecha = getFechaHoyDDMMAAAA();
  loadOpportunities({ fecha, estado: "abierta" });
});
