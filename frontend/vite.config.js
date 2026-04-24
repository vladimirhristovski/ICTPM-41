import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import path from 'path'

export default defineConfig({
  plugins: [react()],
  resolve: {
    alias: [
      // Scoped packages first (more specific), then bare packages
      { find: '@testing-library/jest-dom', replacement: path.resolve(__dirname, 'node_modules/@testing-library/jest-dom') },
      { find: '@testing-library/user-event', replacement: path.resolve(__dirname, 'node_modules/@testing-library/user-event') },
      { find: '@testing-library/react', replacement: path.resolve(__dirname, 'node_modules/@testing-library/react') },
      { find: '@frontend', replacement: path.resolve(__dirname, 'src') },
      // Bare packages — react-dom before react so prefix match doesn't fire early
      { find: 'react-router-dom', replacement: path.resolve(__dirname, 'node_modules/react-router-dom') },
      { find: 'react-dom', replacement: path.resolve(__dirname, 'node_modules/react-dom') },
      { find: 'react', replacement: path.resolve(__dirname, 'node_modules/react') },
      { find: 'axios', replacement: path.resolve(__dirname, 'node_modules/axios') },
      { find: 'recharts', replacement: path.resolve(__dirname, 'node_modules/recharts') },
    ],
  },
  server: {
    fs: {
      allow: ['..'],
    },
  },
  test: {
    globals: true,
    environment: 'jsdom',
    setupFiles: ['./src/test/setup.js'],
    include: [
      'src/**/*.test.{js,jsx}',
      '../src/test/java/mk/ukim/finki/ictpm41/frontend/**/*.test.{js,jsx}',
    ],
  },
})
