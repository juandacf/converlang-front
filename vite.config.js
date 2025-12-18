import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import fs from "fs";

export default defineConfig({
  plugins: [react()],
  server: {
    host: "0.0.0.0",
    port: 5173,
    https: {
      key: fs.readFileSync("./localhost+2-key.pem"), //Estos nombres se deben actualizar al momento de la creación de los certificados
      cert: fs.readFileSync("./localhost+2.pem"),
    },
  },
});
