# HomologaIA - Frontend

Proyecto de la universidad para el sistema de homologación de asignaturas. La idea es que un estudiante que viene de otra institución pueda subir su certificado de notas y pedir que le homologuen las materias, en vez de hacerlo todo en papel.

Este repo es solo el frontend (React). El backend está en otro repo y se consume por API.

## Qué hace

- El **estudiante** sube su certificado (PDF), agrega las asignaturas que quiere homologar y envía la solicitud.
- Una IA revisa el certificado y compara las materias con el pénsum del programa, para dar una primera idea de qué tan parecidas son.
- El **coordinador** revisa esa primera evaluación y decide si la manda al vicerrector.
- El **vicerrector** aprueba o rechaza la solicitud (decisión final).
- El **admin** gestiona los usuarios del sistema.

Cada rol tiene su propia vista y sus propias rutas protegidas.

## Tecnologías

- React 19 + Vite
- React Router para las rutas
- Tailwind CSS para los estilos
- Axios para las peticiones al backend
- lucide-react para los iconos

## Cómo correrlo

```bash
npm install
npm run dev
```

Con eso ya debería abrir en `http://localhost:5173`.

Otros comandos:

```bash
npm run build     # build de producción
npm run preview   # ver el build ya generado
npm run lint      # revisa el código con eslint
```

El backend que consume este frontend está apuntado directo en [src/api/client.js](src/api/client.js) (no usamos variables de entorno para eso todavía).

## Estructura del proyecto

```
src/
  api/          -> cliente axios
  components/   -> componentes reutilizables (incluye components/ui)
  context/      -> AuthContext y FeedbackContext
  lib/          -> funciones auxiliares
  pages/        -> una carpeta por rol (estudiante, coordinador, vicerrector, admin)
  routes/       -> definición de rutas con AppRouter
```

## Notas

- El login guarda el token en localStorage.
- Las rutas de cada rol están protegidas, si alguien intenta entrar a una ruta que no le corresponde lo redirige a la suya.
