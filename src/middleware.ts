/*
    *  ---------------------------------------------------  *
    *  -----  middleware.ts  --  /src/middleware.ts  -----  *
    *  ---------------------------------------------------  *
 */


import type { MiddlewareNext } from "astro";
import { defineMiddleware } from "astro:middleware";


/**
 * --------------------------------
 * -----  `privateRoutes`[]  -----
 * --------------------------------
 * - rutas que son privadas y necesitan autenticación
 */
const privateRoutes = [
    '/protected',
];


/**
 * ---------------------------
 * -----  `authUsers`{}  -----
 * ---------------------------
 * - usuarios y contraseñas de autenticación
 */
const authUsers = {
    'user': 'admin2',
    'pass': 'admin2',
}


/**
 * ---------------------------------------------------------------
 * -----  `onRequest = defineMiddleware((context, next) =>`  -----
 * ---------------------------------------------------------------
 * - función que se ejecuta antes de cada request
 */
export const onRequest = defineMiddleware((context, next) => {


    const { url, request } = context;
    const { pathname } = url;

    /** - `Obtener el header de autenticación` */
    const authHeader = request.headers.get('Authorization') ?? '';

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
        const authValue = authHeader.split(' ').at(-1) ?? 'user:pass';
        console.log('\n\n\nauthValue', authValue);

        /** - `Decodificar el valor de la autenticación` */
        const decodedValue = atob(authValue).split(':');
        console.log('\n\n\ndecodedValue', decodedValue);

        /** - `Obtener el username y password` */
        const [username, password] = decodedValue;
        //console.log('\n\n\nusername', username);
        //console.log('password', password);

        const { user, pass } = authUsers;


        //  -----  `Si el username y password son correctos, continuar`  -----
        if (username === user && password === pass) {
            return next();
        }
        
    }
    
    //  -----  `Si el header de autenticación no existe, retornar un error 401`  -----
    return new Response('Autenticación requerida',
        {
            status: 401,
            headers: {
                'WWW-Authenticate': 'Basic',
            }
        }
    );


}