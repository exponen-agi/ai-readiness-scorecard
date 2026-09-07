import nextCoreWebVitals from 'eslint-config-next/core-web-vitals';
import nextTypescript from 'eslint-config-next/typescript';

/**
 * ESLint 9 flat config. Next 16 removed the `next lint` command, so `npm run lint` calls
 * eslint directly and this file is the only thing configuring it.
 */
const config = [
  {
    ignores: ['.next/**', 'out/**', 'build/**', 'next-env.d.ts'],
  },
  ...nextCoreWebVitals,
  ...nextTypescript,
];

export default config;
