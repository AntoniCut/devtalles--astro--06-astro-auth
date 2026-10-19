# Middleware en Astro

## Cómo funciona

**Concepto:** es código que se ejecuta **en cada request, en el servidor, antes de renderizar la página**. Solo funciona con renderizado on-demand (`output: "server"` o páginas sin prerender) — este proyecto usa `output: "server"` en `astro.config.mjs:16`, así que aplica a todas las rutas.

**Registro:** Astro detecta el archivo `src/middleware.ts` (nombre exacto) y busca un export llamado `onRequest`. Firma:

```ts
(context, next) => Response | Promise<Response>
```

- `context` — `{ request, url, cookies, locals, params, rewrite, redirect, ... }`.
- `next()` — continúa el pipeline y devuelve la `Response` de la página.
- Debe retornar **siempre una `Response`**: o el resultado de `next()`, o una propia (short-circuit).

**Flujo de un request:**

```
Request → middleware onRequest() → next() → página/endpoint renderiza → Response
                    │
                    └─ puede cortar aquí devolviendo su propio Response
```

**Qué permite hacer:**

1. **Bloquear/cortar** — devolver un `Response` propio sin llamar `next()` (ej. un 401, un redirect).
2. **Compartir datos con las páginas** — escribir en `context.locals` y leerlo en `.astro` con `Astro.locals` (útil para el usuario autenticado).
3. **Reescribir** — `next('/otra-ruta')` renderiza otra página sin cambiar la URL.
4. **Encadenar** varios middlewares con `sequence()` de `astro:middleware`.

## En este proyecto (`src/middleware.ts`)

1. `onRequest` recibe cada request y extrae el header `Authorization` (`middleware.ts:42`).
2. Si `pathname` está en `privateRoutes` (`/protected`) → delega a `checkLocalAuth`; si no, `return next()` (deja pasar).
3. `checkLocalAuth` (`middleware.ts:63`) implementa **HTTP Basic Auth**: el header viene como `Basic <base64>`, lo decodifica con `atob` → `user:pass`, y compara contra `admin3:admin3`.
4. Si coincide → `next()` (la página se renderiza). Si no → corta con un `401` + header `WWW-Authenticate: Basic`, que hace que el navegador muestre su diálogo nativo de usuario/contraseña.

## Notas

- Astro solo lee `src/middleware.ts` exacto, por lo que `middleware.local.ts` (con `admin2:admin2`) es código muerto — el activo es el que tiene `admin3`.
- Este patrón también aplica a endpoints y Astro Actions, ya que pasan por el mismo pipeline.

## Referencias

- [Guía de middleware de Astro](https://docs.astro.build/en/guides/middleware/)
- [Referencia: astro:middleware](https://docs.astro.build/en/reference/modules/astro-middleware/)
