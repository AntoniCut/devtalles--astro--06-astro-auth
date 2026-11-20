/*
    *  -----------------------------------------  *
    *  -----  env.d.ts  --  /src/env.d.ts  -----  *
    *  -----------------------------------------  *
 */

/// <reference types="astro/client" />



interface ImportMetaEnv {

    /** - `clave pública de la API Web de Firebase` */
    readonly PUBLIC_FIREBASE_API_KEY: string;

    /** - `dominio de autenticación de Firebase` */
    readonly PUBLIC_FIREBASE_AUTH_DOMAIN: string;

    /** - `id del proyecto en Firebase` */
    readonly PUBLIC_FIREBASE_PROJECT_ID: string;

    /** - `bucket de almacenamiento de Firebase` */
    readonly PUBLIC_FIREBASE_STORAGE_BUCKET: string;

    /** - `id del remitente de mensajes` */
    readonly PUBLIC_FIREBASE_MESSAGING_SENDER_ID: string;

    /** - `id de la aplicación web` */
    readonly PUBLIC_FIREBASE_APP_ID: string;

    /** - `id de medición de Analytics` */
    readonly PUBLIC_FIREBASE_MEASUREMENT_ID: string;
}



/**
 * ----------------------------------
 * -----  interface  -  `User`  -----
 * ----------------------------------
 * - `usuario autenticado que viaja en locals`
 */
interface User {

    /** - `correo del usuario` */
    email: string;

    /** - `nombre visible del usuario` */
    name: string;

    /** - `url del avatar` */
    avatar: string;

    /** - `si el correo ya fue verificado` */
    emailVerified: boolean;
}



/** - `datos de la request compartidos con páginas y middleware` */
declare namespace App {



    /**
     * ------------------------------------
     * -----  interface  -  `Locals`  -----
     * ------------------------------------
     * - `sesión disponible en Astro.locals y context.locals`
     */
    interface Locals {

        /** - `si hay un usuario autenticado` */
        isLoggedIn: boolean;

        /** - `usuario de la sesión, o null si no hay sesión` */
        user: User | null;
    }



}
