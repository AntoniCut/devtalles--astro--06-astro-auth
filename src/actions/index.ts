/*
    *  -------------------------------------------------  *
    *  -----  index.ts  --  /src/actions/index.ts  -----  *
    *  ------------------------------------------------- *
 */

import { registerUser } from "@/src/actions/auth/register.action";


/**
 * ------------------------
 * -----  `server`{}  -----
 * ------------------------
 * - actions server
 */
export const server = {
    //  -----  auth  -----
    registerUser,
};
