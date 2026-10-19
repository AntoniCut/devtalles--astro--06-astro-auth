# Cookies con Server Actions en Astro

## Dónde y con qué API

En el handler de un action, el `context` incluye `cookies` (clase `AstroCookies`, **la misma API que `Astro.cookies`** en páginas y middleware). Con ella se leen, escriben y borran cookies de la respuesta del action:

```ts
handler: async (input, context) => {
  context.cookies.get("email");                    // AstroCookie | undefined
  context.cookies.set("email", "a@b.com", opts);   // escribe
  context.cookies.delete("email", opts);           // borra (expira en epoch 0)
  context.cookies.has("email");                    // boolean
}
```

## Opciones de `set` (`AstroCookieSetOptions`)

| Opción | Para qué |
|---|---|
| `expires: Date` | Caducidad absoluta |
| `maxAge: number` | Caducidad relativa en **segundos** |
| `path: string` | Ámbito de la cookie (`"/"` = todo el sitio) |
| `domain` | Subdominio |
| `httpOnly: true` | Oculta la cookie de `document.cookie` (recomendado para auth) |
| `secure: true` | Solo por HTTPS (producción) |
| `sameSite: "lax" \| "strict" \| "none"` | Protección CSRF |

**Importante:** `delete` debe recibir las mismas opciones de `path`/`domain` con las que se creó la cookie, si no, puede no borrarla.

## Cómo viajan las cookies

Cada action se sirve como endpoint POST (`/_actions/registerUser`); las cookies que setea el handler salen como headers `Set-Cookie` en esa respuesta, el navegador las guarda y las envía en la **siguiente** request. Por eso `register.action.ts` puede escribir la cookie y `register.astro:13` leerla al recargar (`Astro.cookies.get`).

## En este proyecto

`register.action.ts:47-51`: guarda `email` con `expires` de 1 año y `path: "/"` si `remember_me`, o la borra si no. Funciona, pero esa cookie es **legible por JavaScript** (sin `httpOnly`) y es el email en claro.

## Recomendación para auth real

No guardar datos del usuario en cookies legibles; guardar solo un **token/session id** con `httpOnly`, `secure` y `sameSite: "lax"`:

```ts
context.cookies.set("session", tokenId, {
  httpOnly: true,
  secure: import.meta.env.PROD,
  sameSite: "lax",
  path: "/",
  maxAge: 60 * 60 * 24 * 7,
});
```

Para esto, Astro trae **Sessions** (`context.session.get/set/destroy` con storage en cookie o backend) que es la vía idiomática en vez de manejar la cookie a mano.

## Referencias

- [Guía de Actions de Astro](https://docs.astro.build/en/guides/actions/)
- [API: cookies (set / get / delete)](https://docs.astro.build/en/reference/api-reference/#cookies)
- [Guía de Sessions de Astro](https://docs.astro.build/en/guides/sessions/)
