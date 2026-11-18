/*
    *  -------------------------------------------------  *
    *  -----  index.ts  --  /src/actions/index.ts  -----  *
    *  ------------------------------------------------- *
 */

import { registerUser } from "@/src/actions/auth/register.action";
import { logoutUser } from "@/src/actions/auth/logout.action";
import { loginUser } from "@/src/actions/auth/login.action";


/**
 * ------------------------
 * -----  `server`{}  -----
 * ------------------------
 * - actions server
 */
export const server = {
    registerUser,
    logoutUser,
    loginUser,
};
