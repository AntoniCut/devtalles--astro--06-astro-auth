# Flujo de autenticación con Firebase

En este proyecto la sesión de Firebase vive en la instancia `auth` del SDK de cliente (`src/firebase/config.ts`). Esa instancia se crea una sola vez al cargar el módulo y la comparten las actions y las páginas renderizadas en el servidor. El correo y la contraseña se validan solo en el servidor. Google se autentica primero en el navegador y después la action repite el inicio de sesión en esa misma instancia. La cookie `email` no autentica: solo rellena el formulario.

`references/astro-auth-firebase.md` describe lo que recomienda la documentación de Astro (Admin SDK y cookie `__session`). Este archivo describe lo que hace el código actual.

## Camino corto

| Camino | Dónde empieza | Qué llama a Firebase | A dónde termina |
| --- | --- | --- | --- |
| Registro con correo | `register.astro` | `registerUser` → `createUserWithEmailAndPassword` | `/protected` |
| Login con correo | `login.astro` | `loginUser` → `signInWithEmailAndPassword` | `/protected` |
| Login con Google | botón en `login.astro` | popup en el navegador, luego `loginGoogle` → `signInWithCredential` | `/protected` |
| Salir | `Navbar.astro` | `logoutUser` → `signOut` | `/` |

Las cuatro actions están exportadas en `src/actions/index.ts`.

## Pieza compartida

`src/firebase/config.ts` lee `PUBLIC_FIREBASE_*`, llama a `initializeApp` y exporta `{ app, auth }`. No hay `firebase-admin` ni cookie de sesión.

La cookie `email` se escribe recién cuando Firebase confirma la cuenta. `handleCookies`, repetida en registro, login y Google, hace esto:

- con "recuérdame": `cookies.set("email", email, { expires: un año, path: "/" })`
- sin "recuérdame": `cookies.delete("email", { path: "/" })`

`login.astro` y `register.astro` leen esa cookie en el frontmatter y precargan el campo. No es `httpOnly`.

`/protected` tiene dos puertas, en este orden:

1. `src/middleware.ts` exige HTTP Basic (`admin` / `admin`) y, si falla, responde `401`.
2. `protected.astro` lee `firebase.auth.currentUser`. Si es `null`, redirige a `/login`. Si hay usuario, hace `reload()` y muestra nombre, correo, `emailVerified` y la foto (`photoURL` o la del proveedor, con `referrerpolicy="no-referrer"`).

## Correo electrónico

### Registro

1. `register.astro` intercepta el submit, arma un `FormData` y llama a `actions.registerUser`.
2. Zod exige nombre de al menos 2 caracteres, correo válido, contraseña de al menos 6 y `remember_me` opcional. Si falla, el handler no corre.
3. El handler llama a `createUserWithEmailAndPassword(auth, email, password)`.
4. `updateProfile` guarda el nombre en `displayName`.
5. `sendEmailVerification` manda el correo con URL de retorno `http://localhost:4321/protected?emailVerified=true`.
6. Si todo salió bien, escribe o borra la cookie y devuelve `{ ok: true, message: "Usuario creado", uid, email, displayName }`.
7. Si Firebase responde `auth/email-already-in-use`, la action lanza `Correo electronico ya esta en uso`. Cualquier otro fallo lanza `Error al crear el usuario. Algo salió mal.`
8. El cliente muestra SweetAlert si hay error. Si no, escribe "Registro enviado" y hace `window.location.replace("/protected")`.

### Login

1. `login.astro` intercepta el submit y llama a `actions.loginUser(formData)`. El action acepta `form`.
2. Zod exige correo válido, contraseña de al menos 6 y `remember_me` opcional.
3. El handler llama a `signInWithEmailAndPassword(auth, email, password)` sobre la instancia del servidor.
4. Con éxito, escribe o borra la cookie y devuelve `{ ok: true, message: "Sesión iniciada", uid, email }`.
5. Errores de Firebase:
   - `auth/invalid-credential`, `auth/user-not-found` o `auth/wrong-password` → `Correo o contraseña incorrectos`
   - `auth/too-many-requests` → `Demasiados intentos. Inténtalo más tarde.`
   - cualquier otro → `No se pudo iniciar sesión. Algo salió mal.`
6. El cliente muestra SweetAlert si hay error. Si no, escribe "Sesión iniciada" y redirige a `/protected`.

El navegador nunca llama a `signInWithEmailAndPassword`. El `currentUser` que después lee `protected.astro` es el de la instancia del servidor.

## Google

El popup y la action no son el mismo inicio de sesión. El popup autentica el SDK del navegador. Las páginas leen `currentUser` en el servidor, así que los tokens del popup se reenvían para repetir el sign-in ahí.

1. El clic en `#btnGoogle` desactiva el botón de Google y el de envío.
2. En el navegador: `new GoogleAuthProvider()` y `signInWithPopup(firebase.auth, googleProvider)`.
3. Si el usuario de Google no trae correo, el cliente hace `signOut` y corta con `Google no devolvió un correo para esta cuenta.`
4. `GoogleAuthProvider.credentialFromResult` saca el id token de OAuth y el access token. Ese id token no es el JWT de Firebase.
5. Si no hay id token, el cliente hace `signOut` y corta con `Google no devolvió el token para validar la sesión.`
6. Llama a `actions.loginGoogle` con JSON: `{ idToken, accessToken, remember_me }`. `remember_me` sale del checkbox.
7. En el servidor, `GoogleAuthProvider.credential(idToken, accessToken)` arma la credencial y `signInWithCredential(auth, googleCredential)` inicia sesión en la instancia compartida.
8. Si ese usuario no tiene correo, la action lanza `Google no devolvió un correo para esta cuenta.` y no toca la cookie.
9. Con éxito, escribe o borra la cookie y devuelve `{ ok: true, message: "Sesión iniciada con Google", uid, email, displayName }`.
10. Si Firebase rechaza el token (`auth/invalid-credential` o `auth/user-disabled`), el mensaje es `No se pudo validar tu cuenta de Google. Probá de nuevo.` El resto cae en `No se pudo iniciar sesión con Google.`
11. Si la action falla, el cliente hace `signOut` del SDK del navegador y muestra SweetAlert. Si sale bien, escribe "Sesión iniciada con Google" y redirige a `/protected`.
12. El `finally` vuelve a habilitar los dos botones.

Errores del popup, antes de llegar a la action:

| Código | Mensaje |
| --- | --- |
| `auth/popup-closed-by-user` | `Cancelaste el inicio de sesión con Google.` |
| `auth/cancelled-popup-request` | `Ya hay un inicio de sesión con Google en curso.` |

## Cierre de sesión

`Navbar.astro` escucha el clic en `#logout`, cancela la navegación del enlace y llama a `actions.logoutUser()`. Esa action ejecuta `signOut` sobre la instancia del servidor y devuelve `{ ok: true, message: "Sesión cerrada" }`. Después el cliente va a `/`.

Ese cierre no borra la cookie `email` y no llama a `signOut` en el SDK del navegador. La sesión que abrió el popup de Google puede seguir en el browser.

## Límites del flujo actual

- `auth.currentUser` es estado en memoria del proceso de Node. No viaja en una cookie. Otra request ve al usuario solo si cae en el mismo proceso que ejecutó el sign-in.
- La misma instancia es única para todo el servidor. No hay una sesión de Firebase por visitante.
- El middleware de `/protected` sigue siendo Basic Auth. Firebase se consulta después, dentro de la página.
- La verificación de correo se envía en el registro, pero ni el login ni `/protected` exigen `emailVerified === true` para entrar. La página solo lo muestra.

## Referencias

- `src/firebase/config.ts`
- `src/actions/auth/register.action.ts`
- `src/actions/auth/login.action.ts`
- `src/actions/auth/login-google.action.ts`
- `src/actions/auth/logout.action.ts`
- `src/pages/login.astro`
- `src/pages/register.astro`
- `src/pages/protected.astro`
- `src/middleware.ts`
- [Firebase Auth: correo y contraseña](https://firebase.google.com/docs/auth/web/password-auth)
- [Firebase Auth: Google](https://firebase.google.com/docs/auth/web/google-signin)
