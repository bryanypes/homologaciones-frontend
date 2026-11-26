# HomologaIA — Frontend

Interfaz web de HomologaIA, el sistema de homologación de asignaturas de la Corporación Universitaria Autónoma del Cauca. El estudiante sube su certificado de notas y pide la homologación; la IA del backend propone equivalencias y el coordinador y el vicerrector deciden.

Este repositorio es solo el frontend (React). La API está en el repositorio `homologaciones-api`.

| Dato | Valor |
|---|---|
| Versión | 1.0.0 (`package.json`) |
| Fecha | noviembre de 2026 |
| Commit registrado | el que figura en `ENTREGA.md` de la carpeta de entrega |
| Autores | Bryan Yepes, Karen Mancilla, Zulema León Valencia y Jefferson Muñoz Luligo |
| Institución | Corporación Universitaria Autónoma del Cauca |

## Qué hace

- El **estudiante** crea su solicitud en un asistente de 6 pasos, sube el certificado (PDF) y sigue el estado.
- El **coordinador** toma la solicitud, sube el pensum de destino, lanza el análisis con IA, corrige asignaturas, genera o sube la resolución y la envía al vicerrector.
- El **vicerrector** revisa, puede corregir asignaturas y aprueba o rechaza.
- El **admin** gestiona los usuarios.

Cada rol tiene sus propias rutas protegidas.

## Requisitos

- Node.js 20 o superior y npm
- La API de `homologaciones-api` en marcha

## Tecnologías

React 19, Vite 8, React Router 7, Tailwind CSS 3, Axios y lucide-react. Versiones exactas en `package-lock.json`.

## Cómo construir y ejecutar

```bash
npm ci
npm run dev       # servidor de desarrollo en http://localhost:5173
npm run build     # build de producción en dist/
npm run preview   # sirve el build
npm run lint      # ESLint
```

La URL de la API está fija en [src/api/client.js](src/api/client.js) (`https://homologaciones-api.onrender.com/api/v1`). Para trabajar contra una API local hay que cambiarla a `http://localhost:8000/api/v1`.

## Estructura

```
index.html
public/img/          -> logo y mascota (SVG)
src/
  main.jsx           -> punto de entrada
  api/client.js      -> cliente Axios con el token JWT
  components/        -> componentes reutilizables (incluye components/ui)
  context/           -> AuthContext y FeedbackContext
  lib/               -> funciones auxiliares
  pages/             -> páginas públicas y una carpeta por rol (estudiante, coordinador, vicerrector, admin)
  routes/AppRouter.jsx -> rutas y protección por rol
```

## Notas

- El login guarda el token, el rol y el nombre en localStorage.
- Si alguien entra a una ruta de otro rol, lo redirige a la suya.
