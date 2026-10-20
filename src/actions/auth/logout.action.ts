/*
    *  ----------------------------------------------------------------------  *
    *  -----  logout.action.ts  --  /src/actions/auth/logout.action.ts  -----  *
    *  ----------------------------------------------------------------------  *
 */

import { defineAction } from "astro:actions";
import { signOut } from "firebase/auth";
import { firebase } from "@/src/firebase/config";


/**
 * ---------------------------------------------
 * -----  `logoutUser = defineAction({})`  -----
 * ---------------------------------------------
 * - cierra la sesión del usuario autenticado en Firebase
 */
export const logoutUser = defineAction({
    /** - `cierra la sesión y devuelve el resultado` */
    handler: async () => {

        /** - `instancia de autenticación de Firebase` */
        const { auth } = firebase;

        //  -----  cerrar la sesión del usuario  -----
        await signOut(auth);

        //  -----  devolver el resultado de la acción  -----
        return {
            ok: true,
            message: "Sesión cerrada",
        };

    },
});
