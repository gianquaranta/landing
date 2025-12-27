# Currículum Dinámico

Este proyecto es una landing page personal que funciona como un currículum dinámico. Está diseñada para ser fácil de mantener, permitiendo actualizar el contenido sin necesidad de editar el código fuente.

## Características

- **Single Page Application (SPA)**: Todo el contenido en una sola página para una navegación fluida.
- **Contenido Dinámico**: La información se carga desde un archivo `data.json`, facilitando las actualizaciones.
- **Multilenguaje**: Soporte para español e inglés, con botones para cambiar de idioma.
- **Diseño Moderno y Responsivo**: Creado con HTML5, JavaScript vanilla y Tailwind CSS.
- **Formulario de Contacto Funcional**: Integrado con Formspree para recibir mensajes sin necesidad de un backend.

## Cómo Empezar

1.  **Clona el repositorio**:
    ```bash
    git clone https://github.com/tu-usuario/tu-repositorio.git
    ```
2.  **Abre `index.html` en tu navegador** para ver la página.

## Personalización

### 1. Edita el Contenido

Toda la información de la página se encuentra en el archivo `data.json`. Abre este archivo y modifica el contenido para reflejar tu información personal, experiencia, proyectos, etc.

La estructura del JSON está dividida en dos idiomas: `es` (español) y `en` (inglés). Asegúrate de llenar ambos para que la funcionalidad de cambio de idioma funcione correctamente.

### 2. Actualiza los Enlaces de tu CV

En `data.json`, busca la sección `cv_links` y reemplaza los valores con los enlaces de descarga directa a tus archivos PDF alojados en la nube (por ejemplo, Google Drive).

```json
"cv_links": {
    "es": "URL_DE_TU_CV_EN_ESPAÑOL",
    "en": "URL_DE_TU_CV_EN_INGLES"
}
```

### 3. Configura el Formulario de Contacto

El formulario de contacto utiliza [Formspree](https://formspree.io/) para enviar los mensajes a tu correo electrónico.

1.  Crea una cuenta en Formspree y crea un nuevo formulario.
2.  Obtendrás un endpoint único. Cópialo.
3.  Abre `main.js` y reemplaza `'https://formspree.io/f/YOUR_FORM_ID'` con tu endpoint.

```javascript
const formspreeEndpoint = 'https://formspree.io/f/TU_FORM_ID';
```

### 4. (Opcional) Alojar `data.json` en Google Drive

Si prefieres, puedes alojar tu archivo `data.json` en Google Drive para editarlo desde cualquier lugar.

1.  Sube tu `data.json` a una carpeta en Google Drive.
2.  Comparte el archivo para que "cualquier persona con el enlace" pueda verlo.
3.  Obtén el enlace para compartir. Debería ser algo como: `https://drive.google.com/file/d/FILE_ID/view?usp=sharing`.
4.  Convierte ese enlace en un enlace de descarga directa usando el siguiente formato: `https://drive.google.com/uc?export=download&id=FILE_ID`.
5.  En `main.js`, cambia la URL del `fetch` para que apunte a tu enlace de Google Drive:

```javascript
// Reemplaza 'data.json' con tu URL de Google Drive
const response = await fetch('https://drive.google.com/uc?export=download&id=TU_FILE_ID');
```

## Despliegue en GitHub Pages

1.  Asegúrate de que tu repositorio en GitHub se llame `tu-usuario.github.io` o habilita GitHub Pages en la configuración de tu repositorio (en la sección "Pages").
2.  Sube todos los archivos (`index.html`, `main.js`, `data.json`) a tu repositorio.
3.  Tu sitio estará disponible en `https://tu-usuario.github.io/tu-repositorio/` (o en tu dominio personalizado si lo configuras).
