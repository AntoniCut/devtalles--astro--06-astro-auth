/*
    *  -------------------------------------------------  *
    *  -----  index.ts  --  /src/actions/index.ts  -----  *
    *  ------------------------------------------------- *
 */

import { registerUser } from "@/src/actions/auth/register.action";
import { logoutUser } from "@/src/actions/auth/logout.action";


/**
 * ------------------------
 * -----  `server`{}  -----
 * ------------------------
 * - actions server
 */
export const server = {
    //  -----  auth  -----
    registerUser,
    logoutUser,
};
