/*
    *  ---------------------------------------------------  *
    *  -----  middleware.ts  --  /src/middleware.ts  -----  *
    *  ---------------------------------------------------  *
 */

import type { MiddlewareNext } from "astro";
import { defineMiddleware } from "astro:middleware";
import { firebase } from "@/src/firebase/config";


/**
 * --------------------------------
 * -----  `privateRoutes`[]  -----
 * --------------------------------
 * - rutas que son privadas y necesitan autenticación
 */
const privateRoutes = ["/protected"];

/**
 * ---------------------------
 * -----  `authUsers`{}  -----
 * ---------------------------
 * - usuarios y contraseñas de autenticación
 */
const authUsers = {
    /** - `usuario de autenticación` */
    user: "admin",
    /** - `contraseña de autenticación` */
    pass: "admin",
};

/**
 * ---------------------------------------------------------------
 * -----  `onRequest = defineMiddleware((context, next) =>`  -----
 * ---------------------------------------------------------------
 * - función que se ejecuta antes de cada request
 */
export const onRequest = defineMiddleware((context, next) => {

    //  -----  obtener la url, request y locals  -----
    const { url, request, locals } = context;
    
    //  -----  obtener el pathname de la url  -----
    const { pathname } = url;

    /** - `usuario de Firebase en esta request` */
    const user = firebase.auth.currentUser;

    //  -----  publicar si hay sesión para el navbar  -----
    locals.isLoggedIn = !!user;

    //  -----  si hay usuario, copiar el perfil a locals  -----
    if (user) {
        //  -----  guardar email, nombre, avatar y verificación  -----
        locals.user = {
            email: user.email ?? "",
            name: user.displayName ?? "",
            avatar: user.photoURL ?? "",
            emailVerified: user.emailVerified,
        };
    }
    //  -----  si no hay usuario, dejar la sesión vacía  -----
    else
        //  -----  limpiar el usuario de locals  -----
        locals.user = null;

    /** - `Obtener el header de autenticación` */
    const authHeader = request.headers.get("Authorization") ?? "";

    //console.log('\n\n\nauthHeader', authHeader);

    //  -----  `Verificar si la ruta es privada`  -----
    if (privateRoutes.includes(pathname))
        return checkLocalAuth(authHeader, next);

    //  -----  `Si la ruta no es privada, continuar`  -----
    return next();

});



/**
 * ------------------------------------------------------------------------
 * -----  `checkLocalAuth(authHeader: string, next: MiddlewareNext)`  -----
 * ------------------------------------------------------------------------
 * - función que verifica la autenticación local que la persona puso en los authHeaders
 */
const checkLocalAuth = (authHeader: string, next: MiddlewareNext) => {

    /** - `Si el header de autenticación existe, verificar la autenticación` */
    if (authHeader) {
        /** - `Obtener el valor de la autenticación` */
        const authValue = authHeader.split(" ").at(-1) ?? "user:pass";
        //console.log("\n\n\nauthValue", authValue);

        /** - `Decodificar el valor de la autenticación` */
        const decodedValue = atob(authValue).split(":");
        //console.log("\n\n\ndecodedValue", decodedValue);

        /** - `Obtener el username y password` */
        const [username, password] = decodedValue;
        //console.log('\n\n\nusername', username);
        //console.log('password', password);

        //  -----  `Obtener el usuario y contraseña de autenticación`  -----
        const { user, pass } = authUsers;

        //*  -----  `Si el username y password son correctos, continuar`  -----
        if (username === user && password === pass) {
            return next();
        }
    }

    //*  -----  `Si el header de autenticación no existe, retornar un error 401`  -----
    return new Response("Autenticación requerida", {
        status: 401,
        headers: {
            "WWW-Authenticate": "Basic",
        },
    });

};
