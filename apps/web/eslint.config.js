import path from 'node:path';
import { includeIgnoreFile } from '@eslint/compat';
import { defineConfig } from 'eslint/config';
import svelteConfigObj from './svelte.config.js';
import { svelteConfig } from '@repo/eslint-config/svelte';

const gitignorePath = path.resolve(import.meta.dirname, '.gitignore');

export default defineConfig(includeIgnoreFile(gitignorePath), ...svelteConfig, {
  languageOptions: {
    parserOptions: {
      svelteConfig: svelteConfigObj,
    },
  },
});
