import { readdirSync, statSync } from 'node:fs';
import { join } from 'node:path';

import jsPlugin from '@eslint/js';
import eslintPluginAstro from 'eslint-plugin-astro';
import prettierPlugin from 'eslint-plugin-prettier/recommended';
import reactPlugin from 'eslint-plugin-react';
import simpleImportSort from 'eslint-plugin-simple-import-sort';
import tseslint from 'typescript-eslint';

// Dynamically read internal modules (folders and files) from src/
const srcPath = join(import.meta.dirname, 'src');
const internalModules = readdirSync(srcPath)
  // Step 1: Filter out test files - they are never imported by application code
  .filter((item) => !item.match(/\.(test|spec)\.(ts|tsx|js|jsx)$/))
  // Step 2: Transform each item (file or folder) to match import format
  .map((item) => {
    const itemPath = join(srcPath, item);

    // For files: strip extension because imports don't include them
    // Example: 'middleware.ts' -> 'middleware'
    if (statSync(itemPath).isFile()) {
      return item.replace(/\.(ts|tsx|js|jsx)$/, '');
    }

    // For folders: keep name unchanged
    // Example: 'components' -> 'components'
    return item;
  })
  // Step 3: Sort alphabetically for consistent ordering
  .sort();

export default tseslint.config(
  {
    ignores: ['node_modules', 'dist', '.astro'],
  },
  jsPlugin.configs.recommended,
  ...tseslint.configs.recommended,
  ...eslintPluginAstro.configs.recommended,
  reactPlugin.configs.flat['jsx-runtime'],
  prettierPlugin,
  {
    plugins: {
      'simple-import-sort': simpleImportSort,
    },
    rules: {
      'simple-import-sort/imports': [
        'error',
        {
          groups: [
            // Side effect imports
            ['^\\u0000'],
            // Node.js builtins
            ['^node:(?!.*\\u0000$)'],
            // React and Astro core packages only
            ['^react($|/|-dom)(?!.*\\u0000$)', '^astro($|/)(?!.*\\u0000$)', '^@astrojs/(?!.*\\u0000$)'],
            // External packages
            ['^@?\\w(?!.*\\u0000$)'],
            // Internal modules (folders and files from src/ directory)
            [`^(${internalModules.join('|')})(/|$)(?!.*\\u0000$)`],
            // Parent imports
            ['^\\.\\.(?!.*\\u0000$)'],
            // Same-folder imports
            ['^\\.(?!.*\\u0000$)'],
            // All type imports (React, Astro, external, internal, parent, etc.)
            ['.*\\u0000$'],
          ],
        },
      ],
      'simple-import-sort/exports': 'error',
    },
  },
  {
    rules: {
      '@typescript-eslint/consistent-type-imports': [
        'error',
        {
          prefer: 'type-imports',
          fixStyle: 'separate-type-imports',
          disallowTypeAnnotations: false,
        },
      ],

      'padding-line-between-statements': [
        'error',
        {
          blankLine: 'always',
          prev: '*',
          next: 'return',
        },
      ],

      '@typescript-eslint/no-unused-vars': [
        'error',
        {
          args: 'all',
          argsIgnorePattern: '^_',
          caughtErrors: 'all',
          caughtErrorsIgnorePattern: '^_',
          destructuredArrayIgnorePattern: '^_',
          varsIgnorePattern: '^_',
          ignoreRestSiblings: true,
        },
      ],

      'no-console': 'warn',
      'react/display-name': 'off',
    },
  },
  {
    files: ['**/*.config.js', '**/*.config.mjs'],
    rules: {
      '@typescript-eslint/no-require-imports': 'off',
      'no-undef': 'off',
    },
  },
  {
    files: ['src/env.d.ts'],
    rules: {
      '@typescript-eslint/triple-slash-reference': 'off',
    },
  },
);
