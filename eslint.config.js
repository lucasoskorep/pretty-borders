import eslint from "@eslint/js";
import tseslint from "typescript-eslint";
import jsdoc from "eslint-plugin-jsdoc";

export default tseslint.config(
    eslint.configs.recommended,
    ...tseslint.configs.recommended,
    jsdoc.configs["flat/recommended-typescript"],
    {
        languageOptions: {
            parserOptions: {
                projectService: true,
                tsconfigRootDir: import.meta.dirname,
            },
        },
        rules: {
            // Relax jsdoc rules — don't require docs on everything
            "jsdoc/require-jsdoc": "off",
            "jsdoc/require-param-description": "off",
            "jsdoc/require-returns-description": "off",
            "jsdoc/require-returns": "off",

            // Allow unused vars prefixed with _
            "@typescript-eslint/no-unused-vars": [
                "warn",
                { argsIgnorePattern: "^_", varsIgnorePattern: "^_" },
            ],
        },
    },
    {
        ignores: ["dist/", "node_modules/", "*.js"],
    },
);
