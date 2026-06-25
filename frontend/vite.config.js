import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";

export default defineConfig({
  plugins: [react()],

  build: {

    sourcemap: false,

    chunkSizeWarningLimit: 1000,

    rollupOptions: {

      output: {

        manualChunks: {

          react: [
            "react",
            "react-dom",
            "react-router-dom",
          ],

          calendar: [
            "@fullcalendar/core",
            "@fullcalendar/daygrid",
            "@fullcalendar/timegrid",
            "@fullcalendar/interaction",
          ],

          motion: [
            "framer-motion",
          ],

          emoji: [
            "emoji-picker-react",
          ],

        },

      },

    },

  },

});