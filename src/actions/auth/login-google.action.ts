/*
    *  ----------------------------------------------------------------------------  *
    *  -----  login-google.action.ts  --  /src/actions/auth/login-google.action.ts  -----  *
    *  ----------------------------------------------------------------------------  *
 */

import type { AstroCookies } from "astro";
import { defineAction } from "astro:actions";
import { z } from "astro/zod";
import {


    GoogleAuthProvider,
    signInWithCredential,
    type AuthError,
} from "firebase/auth";
import { firebase } from "@/src/firebase/config";


/**
 * ------------------------------------------------
 * -----  `loginGoogle = defineAction({})`  -----
 * ------------------------------------------------
 * - valida el token de Google y sincroniza la sesión en el servidor
 */
export const loginGoogle = defineAction({
    accept: "json",

    input: z.object({
        idToken: z.string({
            message: "El token de Google es obligatorio",
        }),

        accessToken: z.string().optional(),

        remember_me: z.boolean().optional(),
    }),

    /** - `devuelve los datos del usuario autenticado con Google` */
    handler: async (input, context) => {

        //  -----  desestructuración de los datos recibidos  -----
        const { idToken, accessToken, remember_me } = input;

        //  -----  desestructuración de los datos del contexto  -----
        const { cookies } = context;

        //  -----  obtención de la instancia de autenticación de Firebase  -----
        const { auth } = firebase;

        try {
            /** - `credencial OAuth de Google, armada con el id token y el access token del popup` */
            const googleCredential = GoogleAuthProvider.credential(
                idToken,
                accessToken,
            );

            /** - `credenciales del usuario autenticado en el servidor` */
            const userCredential = await signInWithCredential(
                auth,
                googleCredential,
            );

            /** - `correo confirmado por Firebase` */
            const verifiedEmail = userCredential.user.email;

            //  -----  si Google no devolvió correo, cortar sin tocar la cookie  -----
            if (!verifiedEmail)
                //  -----  informar que la cuenta no tiene correo  -----
                throw new Error(
                    "Google no devolvió un correo para esta cuenta.",
                );

            //  -----  guardar o borrar la cookie recién cuando la sesión existe  -----
            handleCookies({ email: verifiedEmail, remember_me }, cookies);

            //  -----  devolver solo datos serializables (POJO)  -----
            return {
                ok: true,
                message: "Sesión iniciada con Google",
                uid: userCredential.user.uid,
                email: verifiedEmail,
                displayName: userCredential.user.displayName,
            };
        } catch (error) {
            //*  -----  si Firebase rechaza el token de Google  -----

            //  -----  si el corte ya trae un mensaje propio, conservarlo  -----
            if (error instanceof Error && !("code" in error))
                //  -----  relanzar el mensaje de la cuenta sin correo  -----
                throw error;

            /** - `error tipado de Firebase` */
            const firebaseError = error as AuthError;

            //  -----  si el token es inválido o expiró  -----
            if (
                firebaseError.code === "auth/invalid-credential" ||
                firebaseError.code === "auth/user-disabled"
            )
                throw new Error(
                    "No se pudo validar tu cuenta de Google. Probá de nuevo.",
                );

            //  -----  devolver un error genérico  -----
            throw new Error("No se pudo iniciar sesión con Google.");
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
