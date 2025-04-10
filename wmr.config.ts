import { defineConfig } from 'wmr'

export default defineConfig({
  alias: {
    react: 'preact/compat',
    'react-dom': 'preact/compat',
  },
  exclude: ['**/__snapshots__/**', '**/__tests__/**', '**/*.test.js', '**/*.test.ts', '**/*.snap', 'src/js/io/**/*'],
  jsx: 'react',
  out: 'build',
  plugins: [],
  port: 3000,
  public: 'src',
  sourcemap: true,
  typescript: true,
})
