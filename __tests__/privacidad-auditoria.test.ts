// Auditoría de la política de privacidad pública (public/privacidad.html): que diga lo mismo que hace la app y lo que se declara en las tiendas.
import { describe, expect, test } from '@jest/globals';
import { readFileSync } from 'fs';
import { join } from 'path';

const raiz = join(__dirname, '..');
const html = readFileSync(join(raiz, 'public', 'privacidad.html'), 'utf-8');
const texto = html.replace(/<style[\s\S]*?<\/style>/g, '').replace(/<[^>]+>/g, ' ').replace(/&[a-z]+;/g, ' ').replace(/\s+/g, ' ');
const declaracion = readFileSync(join(raiz, 'docs', 'google-play-declaracion-salud.md'), 'utf-8');
const cifrado = readFileSync(join(raiz, 'src', 'lib', 'cifrado.ts'), 'utf-8');

describe('Política de privacidad', () => {
  test('distingue datos locales, copia en la nube y metadatos de la cuenta', () => {
    expect(texto).toContain('Qué queda en tu teléfono');
    expect(texto).toContain('Qué se guarda si creas una cuenta');
    expect(texto).toMatch(/nada sale de tu teléfono/);
    expect(texto).toMatch(/Tu correo y tu contraseña/);
    expect(texto).toMatch(/Una copia de todo lo que guarda la app/);
    expect(texto).toMatch(/fecha en que aceptaste estas condiciones/);
  });

  test('dice dónde están los servidores: Neon en Ohio (Estados Unidos) y Vercel (Estados Unidos)', () => {
    expect(texto).toMatch(/Neon \(Ohio, Estados Unidos\)/);
    expect(texto).toMatch(/Vercel \(Estados Unidos\)/);
  });

  test('el cifrado con clave propia figura como opcional y avisa que sin la frase no se recupera', () => {
    expect(cifrado).toMatch(/AES-256-GCM|aes-256-gcm|gcm/i);
    expect(texto).toMatch(/Cifrar mi respaldo/);
    expect(texto).toMatch(/AES-256-GCM/);
    expect(texto).toMatch(/no se puede recuperar/);
    expect(texto).toMatch(/Respaldar con clave \(cifrado\)/);
    expect(texto).not.toMatch(/El archivo no va cifrado, así que/); // la versión vieja, anterior al cifrado opcional
  });

  test('Apple Salud y Health Connect: solo lectura, nunca publicidad ni venta a terceros (App Store 5.1.1, Google Play Health)', () => {
    const bloque = /Reloj y apps de salud[\s\S]*?Lo que nunca hacemos/.exec(texto)?.[0] ?? '';
    expect(bloque).toMatch(/Health Connect/);
    expect(bloque).toMatch(/Apple Salud/);
    expect(bloque).toMatch(/Solo lee: nunca escribe/);
    expect(bloque).toMatch(/Nunca se usa para publicidad ni se comparte con nadie/);
    expect(texto).toMatch(/No vendemos ni compartimos tus datos con terceros/);
    expect(texto).toMatch(/No mostramos publicidad/);
  });

  test('borrado: respuesta en 5 días hábiles (Ley 25.326, art. 16) y una vía sin entrar a la app', () => {
    expect(texto).toMatch(/menos de 5 días hábiles/);
    expect(texto).toMatch(/Si no puedes entrar a la app/);
    expect(html).toContain('eliminar-cuenta.html');
    expect(readFileSync(join(raiz, 'public', 'eliminar-cuenta.html'), 'utf-8')).toMatch(/5 días hábiles/);
  });

  test('la fecha de la política es de hoy o posterior a la del cambio del cifrado', () => {
    const m = /Última actualización: (\d+) de noviembre de 2026/.exec(texto);
    expect(Number(m?.[1])).toBeGreaterThanOrEqual(11);
  });

  test('la declaración de Google Play no dice «cifrado de extremo a extremo» como regla y explica que el cifrado es opcional', () => {
    expect(declaracion).toMatch(/opcional/i);
    expect(declaracion).toMatch(/No declarar «cifrado de extremo a extremo»/);
  });
});
