# Server Actions en Astro

## Cómo funcionan

**Concepto:** son funciones que se ejecutan **solo en el servidor** y que Astro expone como endpoints HTTP invocables desde el cliente **con tipado extremo a extremo** (el tipo del input y del retorno se infiere y viaja al navegador). Reemplazan la necesidad de crear una API route manual + fetch.

**Definición — dónde viven:** deben estar en `src/actions/index.ts` exportando un objeto llamado `server` (en este proyecto: `actions/index.ts:16`). Cada entrada se construye con `defineAction` y puede dividirse en archivos por dominio (este proyecto: `auth/register.action.ts`):

```ts
defineAction({
  accept: "form",              // acepta FormData; por defecto es JSON
  input: z.object({ ... }),    // esquema Zod de validación
  handler: async (input, context) => { ... } // input ya validado
})
```

**Validación con Zod:** si el input no cumple el esquema, el `handler` **nunca se ejecuta**; Astro devuelve un error tipado con `.fields` (errores por campo) y `.message`. Con `accept: "form"`, Astro hace coerción desde `FormData` (strings, checkboxes → boolean, etc.).

## Cómo se llaman — 3 formas

1. **Desde el cliente** (en este proyecto: `register.astro:196`): `import { actions, isInputError } from "astro:actions"` → `const { data, error } = await actions.registerUser(formData)`. Nunca lanza excepción: siempre devuelve `{ data }` u `{ error }`. Se usa `isInputError(error)` para distinguir errores de validación (`error.fields`) de errores del handler (`error.message`) — exactamente el patrón de `register.astro:203-223`.
2. **Desde un formulario HTML (zero-JS)**: `<form method="POST" action={actions.registerUser}>`. El resultado se lee en el servidor con `Astro.getActionResult()` y la página debe ser on-demand (este proyecto ya lo es).
3. **Desde el servidor**: `Astro.callAction(actions.registerUser, input)` dentro de un componente `.astro`.

**Bajo el capó:** cada acción se publica como un endpoint POST (`/_actions/<nombre>`). Eso significa que pasa por el **pipeline completo**: el middleware se ejecuta también para las acciones.

## Flujo de registro completo en este proyecto

1. `register.astro:180` intercepta el submit, previene el nativo y crea un `FormData`.
2. `actions.registerUser(formData)` hace POST al endpoint generado.
3. Zod valida (`register.action.ts:24-36`): name ≥2, email válido, password ≥6, `remember_me` booleano opcional.
4. Si es válido, el `handler` (`register.action.ts:39`) lee `context.cookies` y guarda/borra la cookie `email` según "recuérdame", y devuelve `{ ok: true, message: "Usuario creado" }`.
5. El cliente recibe `{ data, error }` y muestra feedback en `#formFeedback` (verde para éxito, rojo con mensajes de campo para error).

**Nota de arquitectura:** el handler puede acceder a `cookies`, `locals`, base de datos, etc., porque corre en el servidor — ideal para mover después la verificación de credenciales y la sesión real.

## Referencias

- [Guía de Actions de Astro](https://docs.astro.build/en/guides/actions/)
- [Referencia: astro:actions](https://docs.astro.build/en/reference/modules/astro-actions/)
