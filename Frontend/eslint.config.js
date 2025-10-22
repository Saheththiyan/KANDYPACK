import js from "@eslint/js";
import globals from "globals";
import reactHooks from "eslint-plugin-react-hooks";
import reactRefresh from "eslint-plugin-react-refresh";
import tseslint from "typescript-eslint";

export default tseslint.config(
  { ignores: ["dist"] },
  {
    extends: [js.configs.recommended, ...tseslint.configs.recommended],
    files: ["**/*.{ts,tsx}"],
    languageOptions: {
      ecmaVersion: 2020,
      globals: globals.browser,
    },
    plugins: {
      "react-hooks": reactHooks,
      "react-refresh": reactRefresh,
    },
    rules: {
      ...reactHooks.configs.recommended.rules,
      "react-refresh/only-export-components": ["warn", { allowConstantExport: true }],
      
      // Ignore formatting/style issues
      "indent": "off",                           // Ignore indentation errors
      "@typescript-eslint/indent": "off",        // TypeScript indentation
      "no-console": "off",                       // Allow console.log statements
      "no-trailing-spaces": "off",               // Ignore trailing spaces
      "no-multiple-empty-lines": "off",          // Allow multiple empty lines
      "eol-last": "off",                         // Don't require newline at end of file
      
      // Keep unused vars checking enabled (good practice)
      "@typescript-eslint/no-unused-vars": ["warn", { 
        "argsIgnorePattern": "^_",               // Allow unused args starting with _
        "varsIgnorePattern": "^_"                // Allow unused vars starting with _
      }],
    },
  },
);