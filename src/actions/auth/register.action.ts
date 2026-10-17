/*
    *  --------------------------------------------------------------------------  *
    *  -----  register.action.ts  --  /src/actions/auth/register.action.ts  -----  *
    *  --------------------------------------------------------------------------  *
 */

import { defineAction } from "astro:actions";


import { z } from "astro/zod";


/**
 * ------------------------------
 * -----  `registerUser()`  -----
 * ------------------------------
 * - valida los datos del formulario de registro
 */
export const registerUser = defineAction({
    /** - `acepta el envío del formulario` */
    accept: "form",

    /** - `datos del formulario de registro` */
    input: z.object({
        /** - `nombre con al menos 2 caracteres` */
        name: z.string().min(2),

        /** - `correo electrónico` */
        email: z.email(),

        /** - `contraseña con al menos 6 caracteres` */
        password: z.string().min(6),

        /** - `recordar la sesión` */
        remember_me: z.boolean().optional(),
    }),

    /** - `devuelve los datos ya validados` */
    handler: async ({ name, email, password, remember_me }, context) => {

        const { cookies } = context;

        /** - `numero de segundos que tiene un año` */
        const numSegYear = 1000 * 60 * 60 * 24 * 365;

        if (remember_me)
            cookies.set("email", email, {
                expires: new Date(Date.now() + numSegYear),
                path: "/",
            });
        else cookies.delete("email");

        return {
            ok: true,
            message: "Usuario creado",
        };

    },
});
