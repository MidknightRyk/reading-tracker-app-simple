/* eslint-disable import/no-anonymous-default-export */
import { dirname } from 'path';
import { fileURLToPath } from 'url';
import { FlatCompat } from '@eslint/eslintrc';
import eslintParserTypeScript from '@typescript-eslint/parser';
import eslintPluginBetterTailwindcss from 'eslint-plugin-better-tailwindcss';
import eslintConfigPrettier from 'eslint-config-prettier';
// ✅ Add this import
import eslintPluginPrettier from 'eslint-plugin-prettier';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const compat = new FlatCompat({
    baseDirectory: __dirname,
});

export default [
    {
        ignores: [
            'node_modules/',
            'dist/',
            'build/',
            '*.min.js',
            '.next/',
            'public/',
            'styles/favicon.ico',
            'next-env.d.ts',
            '*.config.ts',
            '*.config.mjs',
            'tsconfig.json',
            'mongodb_seeds/',
        ],
    },
    ...compat.extends('next/core-web-vitals', 'next', 'next/typescript'),
    {
        files: ['**/*.{ts,tsx,cts,mts}'],
        languageOptions: {
            parser: eslintParserTypeScript,
            parserOptions: {
                project: true,
            },
        },
        // ✅ Add prettier plugin
        plugins: {
            prettier: eslintPluginPrettier,
        },
        rules: {
            'prettier/prettier': 'error',
            'object-curly-spacing': ['error', 'always'],
            semi: ['error', 'always'],
            quotes: ['error', 'single'],
            'object-curly-newline': ['error', { multiline: true, consistent: true }],
        },
    },
    {
        files: ['**/*.{jsx,tsx}'],
        languageOptions: {
            parserOptions: {
                ecmaFeatures: {
                    jsx: true,
                },
            },
        },
        plugins: {
            'better-tailwindcss': eslintPluginBetterTailwindcss,
            // ✅ Add prettier plugin here too
            prettier: eslintPluginPrettier,
        },
        rules: {
            ...eslintPluginBetterTailwindcss.configs['recommended-warn'].rules,
            ...eslintPluginBetterTailwindcss.configs['recommended-error'].rules,
            'better-tailwindcss/enforce-consistent-line-wrapping': ['warn', { printWidth: 120, indent: 4 }],
            'better-tailwindcss/no-unregistered-classes': 'off',
            'prettier/prettier': 'error',
            'import/no-anonymous-default-export': ['error', {}],
        },
        settings: {
            'better-tailwindcss': {
                entryPoint: 'src/global.css',
                tailwindConfig: 'tailwind.config.js',
            },
        },
    },
    eslintConfigPrettier,
];
