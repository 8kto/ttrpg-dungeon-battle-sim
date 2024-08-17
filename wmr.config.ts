import { defineConfig } from 'wmr'

export default defineConfig({
  alias: {
    react: 'preact/compat',
    'react-dom': 'preact/compat',
  },
  exclude: ['**/__snapshots__/**', '**/__tests__/**', '**/*.test.js', '**/*.test.ts', '**/*.snap'],
  jsx: 'react',
  out: 'build',
  plugins: [],
  port: 3000,
  public: 'src',
  sourcemap: true,
  typescript: true,
  middleware: [
    // Custom middleware to serve files from the `build` directory during development
    function (req, res, next) {
      if (req.url.startsWith('/styles/')) {
        req.url = '/build' + req.url;
      }
      next();
    }
  ]
})
