// Las promos de otras apps del mismo creador en Perfil: solo links https con ?ref=savia (no mandan datos).
import { readFileSync } from 'fs';
import { join } from 'path';

const perfil = readFileSync(join(__dirname, '../src/app/(tabs)/perfil.tsx'), 'utf8');

test('Perfil enlaza a VeoMás, Un nuevo comienzo y Mis Cuentas con ?ref=savia', () => {
  const links = [...perfil.matchAll(/Linking\.openURL\('([^']+)'\)/g)].map((m) => m[1]).filter((u) => u.includes('ref=savia'));
  expect(links).toEqual([
    'https://donde-la-veo-app.vercel.app/?ref=savia',
    'https://un-nuevo-comienzo-empleo.vercel.app/?ref=savia',
    'https://control-de-gastos-lyart-theta.vercel.app/?ref=savia',
  ]);
});
