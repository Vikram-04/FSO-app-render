import globals from "globals";
import { defineConfig } from "eslint/config";
import js from "@eslint/js";
export default defineConfig([
  js.configs.recommended,
  {
    files: ["**/*.js"],
    languageOptions: {
      sourceType: "commonjs",
    },
  },
  { files: ["**/*.{js,mjs,cjs}"], languageOptions: { globals: globals.node } },
  { ignores: ["dist/**", "mongo.js"] },
]);
