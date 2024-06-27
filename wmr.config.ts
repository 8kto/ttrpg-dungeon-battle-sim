import { defineConfig } from 'wmr'

export default defineConfig({
  alias: {
    react: 'preact/compat',
    'react-dom': 'preact/compat',
  },
  jsx: 'react',
  out: 'build',
  plugins: [],
  port: 3000,
  public: 'src',
  sourcemap: true,
  typescript: true,
})
