import { defineConfig, globalIgnores } from "eslint/config";
import nextVitals from "eslint-config-next/core-web-vitals";
import nextTs from "eslint-config-next/typescript";

const publicApiPatterns = [
  {
    group: [
      "@/entities/*/**",
      "@/features/*/**",
      "@/widgets/*/**",
      "@/pages-root/*/**",
      "@/shared/api/**",
      "@/shared/lib/**",
      "@/shared/ui/kit/**",
    ],
    message: "Импортируйте слайс или сегмент только через его публичный API.",
  },
];

const layerBoundaryRule = (patterns = []) => [
  "error",
  { patterns: [...publicApiPatterns, ...patterns] },
];

const eslintConfig = defineConfig([
  ...nextVitals,
  ...nextTs,
  // Override default ignores of eslint-config-next.
  globalIgnores([
    // Default ignores of eslint-config-next:
    ".next/**",
    ".next-dev/**",
    "out/**",
    "build/**",
    "next-env.d.ts",
  ]),
  {
    files: ["**/*.{ts,tsx}"],
    rules: {
      "@typescript-eslint/naming-convention": [
        "error",
        {
          selector: "variable",
          format: ["camelCase", "PascalCase"],
          leadingUnderscore: "allow",
        },
        {
          selector: "parameter",
          format: ["camelCase"],
          leadingUnderscore: "allow",
        },
      ],
    },
  },
  {
    files: ["**/*.tsx"],
    rules: {
      "@typescript-eslint/no-empty-object-type": "off",
      "react/function-component-definition": [
        "error",
        {
          namedComponents: "arrow-function",
          unnamedComponents: "arrow-function",
        },
      ],
    },
  },
  {
    files: ["app/**/*.{ts,tsx}", "src/app/**/*.{ts,tsx}"],
    rules: { "no-restricted-imports": layerBoundaryRule() },
  },
  {
    files: ["src/pages-root/**/*.{ts,tsx}"],
    rules: {
      "no-restricted-imports": layerBoundaryRule([
        {
          group: ["@/app/**", "@/pages-root/**"],
          message: "Pages могут зависеть только от нижележащих FSD-слоёв.",
        },
      ]),
    },
  },
  {
    files: ["src/widgets/**/*.{ts,tsx}"],
    rules: {
      "no-restricted-imports": layerBoundaryRule([
        {
          group: ["@/app/**", "@/pages-root/**", "@/widgets/**"],
          message:
            "Widgets не могут зависеть от App, Pages или других widgets.",
        },
      ]),
    },
  },
  {
    files: ["src/features/**/*.{ts,tsx}"],
    rules: {
      "no-restricted-imports": layerBoundaryRule([
        {
          group: [
            "@/app/**",
            "@/pages-root/**",
            "@/widgets/**",
            "@/features/**",
          ],
          message: "Features могут зависеть только от Entities и Shared.",
        },
      ]),
    },
  },
  {
    files: ["src/entities/**/*.{ts,tsx}"],
    rules: {
      "no-restricted-imports": layerBoundaryRule([
        {
          group: [
            "@/app/**",
            "@/pages-root/**",
            "@/widgets/**",
            "@/features/**",
            "@/entities/**",
          ],
          message:
            "Entities могут зависеть только от Shared и кода своего слайса.",
        },
      ]),
    },
  },
  {
    files: ["src/shared/**/*.{ts,tsx}"],
    rules: {
      "no-restricted-imports": layerBoundaryRule([
        {
          group: [
            "@/app/**",
            "@/pages-root/**",
            "@/widgets/**",
            "@/features/**",
            "@/entities/**",
          ],
          message: "Shared не может зависеть от прикладных FSD-слоёв.",
        },
      ]),
    },
  },
  {
    files: ["tests/**/*.cjs"],
    rules: {
      "@next/next/no-assign-module-variable": "off",
      "@typescript-eslint/no-require-imports": "off",
    },
  },
]);

export default eslintConfig;
