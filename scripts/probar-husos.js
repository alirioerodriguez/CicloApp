// Corre las pruebas de huso horario una vez por huso (en Node el huso se fija al arrancar el proceso, con la variable TZ).
// Uso:  node scripts/probar-husos.js
const { spawnSync } = require('node:child_process');

const HUSOS = ['America/Caracas', 'Europe/Madrid', 'America/Argentina/Buenos_Aires', 'America/Los_Angeles', 'Pacific/Auckland'];
let fallas = 0;
for (const tz of HUSOS) {
  const r = spawnSync('npx', ['jest', '__tests__/husos-y-ciclos-largos.test.ts'], { env: { ...process.env, TZ: tz }, encoding: 'utf8', shell: true });
  const resumen = (r.stdout + r.stderr).split('\n').find((l) => l.startsWith('Tests:')) || '(sin resumen)';
  console.log(`${r.status === 0 ? '✓' : '✗'} ${tz.padEnd(32)} ${resumen.trim()}`);
  if (r.status !== 0) { fallas++; console.log(r.stdout + r.stderr); }
}
process.exit(fallas ? 1 : 0);
