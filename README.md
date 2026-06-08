# PelixMax

PelixMax es un MVP frontend para explorar peliculas y series consumiendo la API de TMDB. La aplicacion permite consultar tendencias, contenido popular, mejor calificado, proximos estrenos, busqueda por titulo y paginas de detalle para peliculas o series.

El proyecto se desarrollo como parte del taller de Producto Minimo Viable con backlog en GitHub, Pull Requests, roles tecnicos por integrante y despliegue orientado a Netlify o contenedor Docker.

## Alcance Del MVP

- Consumo de datos reales desde TMDB.
- Rutas con React Router v7.
- UI responsiva con Tailwind CSS.
- Estado global centralizado con Context API.
- Persistencia local del flujo relevante del usuario.
- Logica de temporizador para dinamicas del MVP.
- Alertas sonoras para eventos relevantes.
- Tipado estricto con TypeScript.

## Stack Tecnico

- React 19
- React Router 7
- TypeScript
- Tailwind CSS 4
- Vite
- Vitest
- Zod
- pnpm
- Docker

## Estructura Principal

```text
app/
  components/       Componentes visuales reutilizables
  hooks/            Hooks para busqueda, debounce y consumo TMDB
  lib/              Estado global, tipos y cliente servidor de TMDB
  routes/           Rutas de home, busqueda, detalle y API interna
src/
  setupTests.ts     Configuracion base de pruebas
public/             Assets publicos
```

## Variables De Entorno

La app necesita un token de lectura de TMDB.

1. Crea el archivo `.env` tomando como base `.env.example`.
2. Configura `TMDB_ACCESS_TOKEN` con el access token de TMDB.

Ejemplo:

```bash
TMDB_BASE_URL=https://api.themoviedb.org/3
TMDB_ACCESS_TOKEN=tu_access_token_de_tmdb
```

No subas tokens reales al repositorio.

## Encender La App En Local

Instala dependencias:

```bash
pnpm install
```

Ejecuta el servidor de desarrollo:

```bash
pnpm dev
```

Abre la app en:

```text
http://localhost:5173
```

## Build De Produccion

Genera el build:

```bash
pnpm build
```

Ejecuta el servidor de produccion local:

```bash
pnpm start
```

Por defecto React Router Serve expone la app en:

```text
http://localhost:3000
```

## Scripts Disponibles

```bash
pnpm dev          # Servidor de desarrollo
pnpm build        # Build de produccion
pnpm start        # Servidor de produccion
pnpm typecheck    # Generacion de tipos de React Router y validacion TS
pnpm test         # Vitest
```

Actualmente Vitest esta configurado, pero si no existen archivos `*.test` o `*.spec`, el runner reporta `No test files found`.

## Flujo Funcional

1. La home carga listas desde TMDB: tendencias, populares, top rated y upcoming.
2. El usuario puede cambiar entre peliculas y series.
3. La busqueda consulta TMDB y guarda resultados en estado global.
4. Las tarjetas navegan a detalles por ruta dinamica.
5. El estado global conserva datos relevantes del flujo en `localStorage`.
