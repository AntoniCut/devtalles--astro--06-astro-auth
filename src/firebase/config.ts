/*
    *  ----------------------------------------------------  *
    *  -----  config.ts  --  /src/firebase/config.ts  -----  *
    *  ----------------------------------------------------  *
*/


import { initializeApp } from "firebase/app";
import { getAuth } from "firebase/auth";


/**
 * -----------------------------------
 * -----  `firebaseConfig = {}`  -----
 * -----------------------------------
 * - configuración de Firebase
 * - For Firebase JS SDK v7.20.0 and later, measurementId is optional
 * - https://firebase.google.com/docs/web/setup#available-libraries
 */
const firebaseConfig = {
  apiKey: "AIzaSy_REDACTED",
  authDomain: "devtalles-astro-astro-auth.firebaseapp.com",
  projectId: "devtalles-astro-astro-auth",
  storageBucket: "devtalles-astro-astro-auth.firebasestorage.app",
  messagingSenderId: "448244778923",
  appId: "1:448244778923:web:bddd707318d79fff4e34ee",
  measurementId: "G-VY6GHX14MQ"
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
}