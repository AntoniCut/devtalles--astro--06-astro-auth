/*
    *  ----------------------------------------------------------  *
    *  -----  config.ts  --  /src/firebase/config.ts  -----  *
    *  ----------------------------------------------------------  *
 */

import type { FirebaseOptions } from "firebase/app";
import { initializeApp } from "firebase/app";
import { getAuth } from "firebase/auth";


/**
 * -----------------------------------
 * -----  `firebaseConfig = {}`  -----
 * -----------------------------------
 * - configuración de Firebase
 * - las credenciales se leen desde `import.meta.env.PUBLIC_FIREBASE_*`
 * - For Firebase JS SDK v7.20.0 and later, measurementId is optional
 * - https://firebase.google.com/docs/web/setup#available-libraries
 */
const firebaseConfig: FirebaseOptions = {
    /** - `clave pública de la API Web de Firebase` */
    apiKey: import.meta.env.PUBLIC_FIREBASE_API_KEY,

    /** - `dominio de autenticación de Firebase` */
    authDomain: import.meta.env.PUBLIC_FIREBASE_AUTH_DOMAIN,

    /** - `id del proyecto en Firebase` */
    projectId: import.meta.env.PUBLIC_FIREBASE_PROJECT_ID,

    /** - `bucket de almacenamiento de Firebase` */
    storageBucket: import.meta.env.PUBLIC_FIREBASE_STORAGE_BUCKET,

    /** - `id del remitente de mensajes` */
    messagingSenderId: import.meta.env.PUBLIC_FIREBASE_MESSAGING_SENDER_ID,

    /** - `id de la aplicación web` */
    appId: import.meta.env.PUBLIC_FIREBASE_APP_ID,

    /** - `id de medición de Analytics` */
    measurementId: import.meta.env.PUBLIC_FIREBASE_MEASUREMENT_ID,
};

/** - `inicializa la aplicación de Firebase` */
const app = initializeApp(firebaseConfig);

/** - `obtiene la instancia de autenticación de Firebase` */
const auth = getAuth(app);

/**
 * -----------------------------
 * -----  `firebase = {}`  -----
 * -----------------------------
 * - objeto de configuración de Firebase
 */
export const firebase = {
    app,
    auth,
};
