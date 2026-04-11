/** @type {import('@commitlint/types').UserConfig} */
export default {
  extends: ['@commitlint/config-conventional'],
  rules: {
    'body-max-line-length': [2, 'always', 0], // Enforce no body (one-line only)
    'footer-max-line-length': [2, 'always', 0], // Enforce no footer
    'header-max-length': [2, 'always', 120], // Generous header length for + and &
    'subject-case': [0], // Relax case rules to allow technical names
    'type-enum': [
      2,
      'always',
      [
        'feat',
        'fix',
        'docs',
        'style',
        'refactor',
        'perf',
        'test',
        'build',
        'ci',
        'chore',
        'revert',
      ],
    ],
  },
};
