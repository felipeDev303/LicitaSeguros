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
