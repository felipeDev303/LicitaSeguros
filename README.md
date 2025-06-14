# LicitaSeguro - Panel de Usuario

LicitaSeguro es una plataforma web que conecta a empresas con oportunidades de negocio en Mercado Público, permitiendo automatizar procesos, acceder a datos clave y mejorar la competitividad en el mercado de compras públicas.

## Características principales

- **Panel de usuario** con navegación lateral (sidebar) intuitiva.
- **Búsqueda avanzada** de oportunidades según el perfil del usuario.
- **Seguimiento** de licitaciones y oportunidades relevantes.
- **Calendario** para visualizar fechas clave y organizar postulaciones.
- **Reportes** y análisis de desempeño, competencia y oportunidades de mejora.
- **Configuración** de preferencias y perfil de usuario.
- **Ayuda** y recursos para aprovechar al máximo la plataforma.

## Estructura del proyecto

```
/public/icons/         # Iconos SVG usados en el sidebar y la interfaz
/styles.css            # Hoja de estilos principal
/app.html              # Página principal del panel de usuario
/busqueda.html         # Módulo de búsqueda de oportunidades
/seguimiento.html      # Módulo de seguimiento de oportunidades
/calendario.html       # Módulo de calendario
/reportes.html         # Módulo de reportes y análisis
/configuracion.html    # Configuración de usuario y preferencias
/cuenta.html           # Gestión de cuenta y perfil
/ayuda.html            # Sección de ayuda y recursos
/app.js                # Lógica JS principal (si aplica)
```

## Instalación y uso

1. **Clona el repositorio** o descarga los archivos en tu entorno local.
2. **Abre `app.html`** en tu navegador para acceder al panel principal.
3. Navega entre los módulos usando el sidebar lateral izquierdo.
4. Personaliza tu perfil y preferencias desde la sección de configuración.

## Requisitos

- Navegador moderno (Chrome, Edge, Firefox, Safari).
- No requiere backend para la navegación básica (solo archivos estáticos).

## Personalización

- Los iconos del sidebar pueden ser reemplazados por otros SVG en `/public/icons/`.
- Los colores y estilos principales se encuentran en `styles.css`.
- Para cambiar el color de los iconos SVG, asegúrate de que sean de un solo color (preferentemente negro) y utiliza la propiedad `filter` en CSS o edita el atributo `fill` en los SVG.

## Contribución

¿Quieres mejorar LicitaSeguro? ¡Bienvenido! Puedes enviar pull requests o sugerencias para nuevas funcionalidades, mejoras de UI/UX o corrección de errores.

## Licencia

Este proyecto es solo para fines demostrativos y educativos.

---

**LicitaSeguro** - Haz del Estado tu mejor cliente.
