import { dirname } from "path";
import { fileURLToPath } from "url";
import { FlatCompat } from "@eslint/eslintrc";

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const compat = new FlatCompat({
  baseDirectory: __dirname,
});

export default [
  // FlatCompat을 통한 기존 설정 확장
  ...compat.extends("next/core-web-vitals", "next/typescript"),
  
  // 기본 언어 설정
  {
    languageOptions: {
      ecmaVersion: 2022,
      sourceType: "module",
      parser: await import("@typescript-eslint/parser"),
      parserOptions: {
        ecmaFeatures: {
          jsx: true,
        },
      },
      globals: {
        // browser globals
        window: "readonly",
        document: "readonly",
      },
    },
  },
  
  // 환경 설정
  {
    linterOptions: {
      reportUnusedDisableDirectives: true,
    },
  },
  
  // 플러그인 설정
  {
    plugins: {
      "@typescript-eslint": (await import("@typescript-eslint/eslint-plugin")).default,
      "import": (await import("eslint-plugin-import")).default,
      "unused-imports": (await import("eslint-plugin-unused-imports")).default,
      "simple-import-sort": (await import("eslint-plugin-simple-import-sort")).default,
    },
  },
  
  // 규칙 설정
  {
    rules: {
      // TypeScript 관련 규칙
      "@typescript-eslint/no-explicit-any": "error",
      "@typescript-eslint/no-unused-vars": "off", // unused-imports 플러그인으로 대체
      "@typescript-eslint/no-require-imports": "error",

      // React 관련 규칙
      "react/react-in-jsx-scope": "off",
      "react-hooks/rules-of-hooks": "error",
      "react-hooks/exhaustive-deps": "warn",
      "jsx-a11y/alt-text": "warn",

      // import 순서 정렬 규칙
      "simple-import-sort/imports": "error",
      "simple-import-sort/exports": "error",

      // 미사용 import 정리
      "unused-imports/no-unused-imports": "error",
      "unused-imports/no-unused-vars": [
        "warn",
        {
          vars: "all",
          varsIgnorePattern: "^_",
          args: "after-used",
          argsIgnorePattern: "^_",
        },
      ],

      // 일반 코드 품질 규칙
      eqeqeq: ["error", "always", { null: "ignore" }],
      "no-var": "error",
      "prefer-const": "error",
    },
  },
  
  // 파일별 설정 오버라이드
  {
    files: ["src/app/**/page.tsx", "src/app/**/layout.tsx", "src/app/**/route.ts"],
    rules: {
      "import/no-default-export": "off",
    },
  },
];