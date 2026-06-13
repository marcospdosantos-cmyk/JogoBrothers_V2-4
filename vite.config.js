// vite.config.js
import { defineConfig } from 'vite';

export default defineConfig({
  // Relative base so the build works under a GitHub Pages subpath
  // (https://user.github.io/RepoName/) as well as at a domain root.
  base: './',
  build: { outDir: 'dist' },
  server: { port: 3000 },
});
