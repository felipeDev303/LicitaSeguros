// 1. Obtener referencias a los elementos del DOM

// La URL de la API de Mercado Público

// 2. Crear la función que hará la petición

async function fetchData() {
  try {
    const response = await fetch(apiUrl);
    const data = await response.json();
    console.log(data);
  } catch (error) {
    console.error("Error fetching data:", error);
  }
}

// 3. Usar Async/Await para hacer la petición GET

// 4. Añadir un evento al botón para que llame a nuestra función

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
