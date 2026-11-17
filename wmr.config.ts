import { readFileSync } from 'fs'
import { defineConfig } from 'wmr'

const { version } = JSON.parse(readFileSync('./package.json', 'utf-8'))

export default defineConfig((options) => ({
  alias: {
    react: 'preact/compat',
    'react-dom': 'preact/compat',
  },
  // exposed to the app as import.meta.env.WMR_APP_VERSION
  env: { ...options.env, WMR_APP_VERSION: version },
  exclude: ['**/__snapshots__/**', '**/__tests__/**', '**/*.test.js', '**/*.test.ts', '**/*.snap', 'src/js/io/**/*'],
  jsx: 'react',
  out: 'build',
  plugins: [],
  port: 3030,
  public: 'src',
  sourcemap: true,
  typescript: true,
}))
