// Pruebas de punta a punta en la web (Playwright). `npm run test:e2e` exporta la web a dist-e2e y las corre.
// Usan un Neon falso (e2e/neon-falso.ts): no necesitan claves ni tocan servicios reales.
import { defineConfig } from '@playwright/test';

export default defineConfig({
  testDir: './e2e',
  testMatch: '**/*.spec.ts',
  timeout: 60_000,
  expect: { timeout: 10_000 },
  workers: 1,
  reporter: [['list']],
  use: {
    baseURL: 'http://127.0.0.1:4173',
    locale: 'es-VE',
    // Si no hay navegador de Playwright instalado, se puede indicar uno con CHROME_PATH.
    launchOptions: process.env.CHROME_PATH ? { executablePath: process.env.CHROME_PATH } : {},
  },
  webServer: { command: 'node e2e/servir.mjs', url: 'http://127.0.0.1:4173', reuseExistingServer: true },
});
