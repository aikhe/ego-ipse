import { ONLY_ALLOW_BEM_SELECTORS } from './selectors.js';
import { CUSTOM_AT_RULES } from './tailwind.js';

/** @type {import('stylelint').Config} */
export default {
  extends: ['stylelint-config-standard'],
  plugins: ['stylelint-order'],
  ignoreFiles: [
    '**/dist/**',
    '**/build/**',
    '**/.next/**',
    '**/.turbo/**',
    '**/node_modules/**',
  ],
  rules: {
    // enforces class names to follow BEM
    'selector-class-pattern': ONLY_ALLOW_BEM_SELECTORS,
    // enforces IDs to follow BEM
    'selector-id-pattern': ONLY_ALLOW_BEM_SELECTORS,
    // Allow Tailwind-based CSS Rules
    'at-rule-no-unknown': [true, { ignoreAtRules: CUSTOM_AT_RULES }],
    // Allow the Global CSS Selector
    'selector-pseudo-class-no-unknown': [
      true,
      { ignorePseudoClasses: ['global'] },
    ],
    // Enforces the order of the CSS properties to be in alphabetical order
    'order/properties-alphabetical-order': true,
    // Enforces the order of the CSS properties to be in alphabetical order
    'no-descending-specificity': null,
    // Disables the Level-4 Media Queries; Since they're more exotic and less known
    'media-feature-range-notation': 'prefix',
    // Adopts the import notation from `postcss-import`
    'import-notation': 'string',
    // Allow the `@apply` at rule as its part of Tailwind
    'at-rule-no-deprecated': [true, { ignoreAtRules: CUSTOM_AT_RULES }],

    // 'nodejs/one-utility-class-per-line': true,
  },
  overrides: [
    {
      files: ['**/*.svelte'],
      customSyntax: 'postcss-html',
    },
  ],
};
