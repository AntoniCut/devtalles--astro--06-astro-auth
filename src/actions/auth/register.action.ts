/*
    *  --------------------------------------------------------------------------  *
    *  -----  register.action.ts  --  /src/actions/auth/register.action.ts  -----  *
    *  --------------------------------------------------------------------------  *
 */

import type { AstroCookies } from "astro";
import { defineAction } from "astro:actions";
import { z } from "astro/zod";
import { createUserWithEmailAndPassword, updateProfile, type AuthError } from "firebase/auth";
import { firebase } from "@/src/firebase/config";


/**
 * -----------------------------------------------
 * -----  `registerUser = defineAction({})`  -----
 * -----------------------------------------------
 * - valida los datos del formulario de registro
 */
export const registerUser = defineAction({
    accept: "form",
    input: z.object({
        name: z.string().min(2),
        email: z.email(),
        password: z.string().min(6),
        remember_me: z.boolean().optional(),
    }),

    /** - `devuelve los datos ya validados` */
    handler: async (input, context) => {

        const { email, password } = input;
        const { cookies } = context;
        const { auth } = firebase;

        //  -----  `maneja la cookie del correo según "recuérdame"`  -----
        handleCookies(input, cookies);

        try {
            //*  -----  creación del usuario  -----

            /** - `credenciales del usuario creado en Firebase` */
            const userCredential = await createUserWithEmailAndPassword(
                auth,
                email,
                password,
            );

            //*  -----  actualizar el nombre (displayName)  -----

            //*  -----  verificar el correo electronico  -----

            //*  -----  devolver solo datos serializables (POJO)  -----
            return {
                ok: true,
                message: "Usuario creado",
                uid: userCredential.user.uid,
                email: userCredential.user.email,
            };

        } 
        
        catch (error) {
            
            const firebaseError = error as AuthError;

            if (firebaseError.code === "auth/email-already-in-use") {
                throw new Error("El correo electrónico ya está en uso");
            }

            throw new Error("Error al crear el usuario. Algo salió mal.");
            
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
