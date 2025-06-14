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
  // Limpiamos el contenedor por si tenía contenido previo (como el spinner).
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
                <a href="/detalle?id=${op.CodigoExterno}" class="card-link">Ver detalle</a>
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

/**
 * Función principal asíncrona que orquesta el proceso.
 */
async function loadOpportunities() {
  // 1. Buscamos en el DOM los elementos que necesitamos.
  const opportunitiesContainer = document.getElementById("opportunities-list");
  const loadingSpinner = document.getElementById("loading-spinner");

  // 2. Si no encontramos el contenedor en la página actual, no hacemos nada.
  if (!opportunitiesContainer) {
    return;
  }

  try {
    // 3. Mostramos el indicador de carga.
    loadingSpinner.style.display = "block";

    // 4. LLAMADA A LA API LOCAL: Usamos fetch para obtener el archivo data.json.
    const response = await fetch("./data.json");

    // Verificamos si la petición fue exitosa.
    if (!response.ok) {
      throw new Error(`Error HTTP: ${response.status}`);
    }

    const data = await response.json();

    // 5. Ocultamos el indicador de carga.
    loadingSpinner.style.display = "none";

    // 6. Llamamos a la función que renderiza los datos, pasándole el array 'Listado'.
    displayOpportunities(data.Listado, opportunitiesContainer);
    updateOpportunitiesKPIs(data.Listado);
  } catch (error) {
    // 7. Si algo sale mal, lo mostramos al usuario.
    console.error("Error al cargar las oportunidades:", error);
    loadingSpinner.style.display = "none";
    if (opportunitiesContainer) {
      opportunitiesContainer.innerHTML =
        '<p class="error-message">Hubo un problema al cargar los datos. Por favor, inténtalo más tarde.</p>';
    }
  }
}

// Escuchamos el evento 'DOMContentLoaded' para ejecutar nuestro script.
document.addEventListener("DOMContentLoaded", loadOpportunities);
