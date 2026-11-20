// Las promos de otras apps del mismo creador en Perfil: solo links https con ?ref=savia (no mandan datos).
import { expect, test } from '@jest/globals';
import { existsSync, readFileSync } from 'fs';
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

test('cada promo usa el logo real de su app (no emojis) y el archivo existe', () => {
  const logos = [...perfil.matchAll(/require\('\.\.\/\.\.\/\.\.\/assets\/(donde-la-veo|un-nuevo-comienzo|mis-cuentas)\.png'\)/g)].map((m) => m[1]);
  expect(logos).toEqual(['donde-la-veo', 'un-nuevo-comienzo', 'mis-cuentas']);
  for (const l of logos) expect(existsSync(join(__dirname, '../assets', l + '.png'))).toBe(true);
  expect(perfil).not.toMatch(/🌱|🧾/);
});
