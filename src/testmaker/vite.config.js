import laravel from "laravel-vite-plugin";
import { defineConfig } from "vite";

export default defineConfig({
    server: {
        host: true,
        port: 5173,
        strictPort: true,
        hmr: {
            host: "localhost",
            protocol: "ws",
        },
        watch: {
            usePolling: true,
        },
    },
    plugins: [
        laravel({
            input: ["resources/js/index.jsx", "resources/css/app.css"],
            refresh: true,
        }),
        react(),
    ],
});
