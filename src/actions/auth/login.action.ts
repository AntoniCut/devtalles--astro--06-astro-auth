/*
    *  --------------------------------------------------------------------  *
    *  -----  login.action.ts  --  /src/actions/auth/login.action.ts  -----  *
    *  --------------------------------------------------------------------  *
 */

import type { AstroCookies } from "astro";
import { defineAction } from "astro:actions";
import { z } from "astro/zod";
import { signInWithEmailAndPassword, type AuthError } from "firebase/auth";
import { firebase } from "@/src/firebase/config";


/**
 * --------------------------------------------
 * -----  `loginUser = defineAction({})`  -----
 * --------------------------------------------
 * - valida las credenciales e inicia sesión en Firebase
 */
export const loginUser = defineAction({
    accept: "form",

    input: z.object({
        email: z.email({ message: "Ingresá un correo electrónico válido" }),

        password: z.string({ message: "La contraseña es obligatoria" }).min(6, {
            message: "La contraseña debe tener al menos 6 caracteres",
        }),

        remember_me: z.boolean().optional(),
    }),

    /** - `devuelve los datos ya validados` */
    handler: async (input, context) => {

        //  -----  desestructuración de los datos del formulario  -----
        const { email, password, remember_me } = input;

        //  -----  desestructuración de los datos del contexto  -----
        const { cookies } = context;

        //  -----  obtención de la instancia de autenticación de Firebase  -----
        const { auth } = firebase;

        try {
            /** - `credenciales del usuario autenticado` */
            const userCredential = await signInWithEmailAndPassword(
                auth,
                email,
                password,
            );

            /** - `correo confirmado por Firebase` */
            const verifiedEmail = userCredential.user.email ?? email;

            //  -----  guardar o borrar la cookie recién cuando la sesión existe  -----
            handleCookies({ email: verifiedEmail, remember_me }, cookies);

            //  -----  devolver solo datos serializables (POJO)  -----
            return {
                ok: true,
                message: "Sesión iniciada",
                uid: userCredential.user.uid,
                email: verifiedEmail,
            };
        } catch (error) {
            //*  -----  si Firebase rechaza las credenciales  -----

            /** - `error tipado de Firebase` */
            const firebaseError = error as AuthError;

            //  -----  si las credenciales no son válidas  -----
            if (
                firebaseError.code === "auth/invalid-credential" ||
                firebaseError.code === "auth/user-not-found" ||
                firebaseError.code === "auth/wrong-password"
            )
                //  -----  informar credenciales incorrectas  -----
                throw new Error("Correo o contraseña incorrectos");

            //  -----  si hay demasiados intentos fallidos  -----
            if (firebaseError.code === "auth/too-many-requests")
                //  -----  pedir que se intente más tarde  -----
                throw new Error("Demasiados intentos. Inténtalo más tarde.");

            //  -----  devolver un error genérico  -----
            throw new Error("No se pudo iniciar sesión. Algo salió mal.");
        }

    },
});



/**
 * ---------------------------------------------
 * -----  `handleCookies(input, cookies)`  -----
 * ---------------------------------------------
 * - función que guarda o elimina la cookie del correo según "recuérdame"
 */
const handleCookies = (
    input: { email: string; remember_me?: boolean },
    cookies: AstroCookies,
): void => {

    const { email, remember_me } = input;

    /** - `milisegundos que tiene un año` */
    const msPerYear = 1000 * 60 * 60 * 24 * 365;

    //  -----  si marcó recordar, guardar el correo en una cookie  -----
    if (remember_me)
        cookies.set("email", email, {
            expires: new Date(Date.now() + msPerYear),
            path: "/",
        });

    //  -----  si no lo marcó, eliminar la cookie del correo  -----
    else
        cookies.delete("email", {
            path: "/",
        });

};
