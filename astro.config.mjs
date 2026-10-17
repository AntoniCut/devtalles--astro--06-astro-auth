/*
    *  -----------------------------------------------------  *
    *  -----  astro.config.mjs  --  /astro.config.mjs  -----  *
    *  -----------------------------------------------------  *
 */

// @ts-check

import netlify from "@astrojs/netlify";
import tailwindcss from "@tailwindcss/vite";
import { defineConfig } from "astro/config";


//  -----  exportar la configuración de astro  -----
export default defineConfig({
    output: "server",
    adapter: netlify(),

    vite: {
        plugins: [tailwindcss()],
    },
});
