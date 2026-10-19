# Autenticación en Astro: qué recomienda la doc y guía de Firebase

## Qué recomienda Astro

Según la guía [Authentication](https://docs.astro.build/en/guides/authentication/) de los docs oficiales:

- **No hay solución oficial de autenticación**: el propio guide dice *"There is no official authentication solution for Astro"* y remite al [directorio de integraciones](https://astro.build/integrations/?search=auth).
- El guide **demuestra dos como ejemplos**:
    - **Better Auth** — walkthrough principal; librería TypeScript framework-agnostic con soporte Astro out of the box.
    - **Clerk** — integración `@clerk/astro` (componentes `<Show>`, `UserButton`, `clerkMiddleware`).
- Guías dedicadas de backends: **Supabase**, **Firebase** y **Scalekit** — cada una "agregando autenticación con X".

## Guía de Firebase (`guides/backend/firebase`)

El patrón que cubre la doc (el que se sigue en el curso de DevTalles):

1. Instalar dependencias: `firebase` (cliente) y `firebase-admin` (servidor).
2. **Init del cliente** (`src/firebase/client.ts`) con la configuración web pública (`apiKey`, `authDomain`, `projectId`, etc.).
3. **Init del admin** (`src/firebase/server.ts`) con la service account vía variables de entorno en dev, y credenciales por defecto en producción:

```ts
const serviceAccount = {
  type: "service_account",
  project_id: import.meta.env.FIREBASE_PROJECT_ID,
  private_key: import.meta.env.FIREBASE_PRIVATE_KEY,
  client_email: import.meta.env.FIREBASE_CLIENT_EMAIL,
  // ...
};

const initApp = () => {
  if (import.meta.env.PROD) return initializeApp();
  return initializeApp({ credential: cert(serviceAccount as ServiceAccount) });
};

export const app = getApps().length === 0 ? initApp() : getApps()[0];
```

4. **Proteger páginas** verificando la cookie de sesión `__session` con el Admin SDK:

```astro
---
import { app } from "../firebase/server";
import { getAuth } from "firebase-admin/auth";

const auth = getAuth(app);

if (!Astro.cookies.has("__session")) {
  return Astro.redirect("/signin");
}

const sessionCookie = Astro.cookies.get("__session")!.value;
const decodedCookie = await auth.verifySessionCookie(sessionCookie);
const user = await auth.getUser(decodedCookie.uid);

if (!user) {
  return Astro.redirect("/signin");
}
---
```

## Cómo encaja en este proyecto

La verificación de la cookie de Firebase se haría **en el middleware** (como el `checkLocalAuth` actual de `src/middleware.ts`) y el usuario decodificado se compartiría con las páginas vía `Astro.locals.user`, en lugar de comparar credenciales hardcodeadas con HTTP Basic Auth.

## Referencias

- [Guía de Authentication](https://docs.astro.build/en/guides/authentication/)
- [Guía: Adding authentication with Firebase](https://docs.astro.build/en/guides/backend/firebase/)
- [Guía de middleware](https://docs.astro.build/en/guides/middleware/)
