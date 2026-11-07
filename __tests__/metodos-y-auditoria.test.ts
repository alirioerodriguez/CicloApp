// Recordatorios de anillo, parche e inyección, guía de batería y auditoría de frases que harían que las tiendas
// traten a Savia como dispositivo médico. Correr con: npm test
import { describe, expect, jest, test } from '@jest/globals';
import { proximoRecordatorio } from '../src/lib/metodosCalendario';
import { guiaBateria, marcaAndroid } from '../src/lib/bateriaAndroid';

// El proyecto no incluye los tipos de Node (es React Native); jest sí corre en Node.
declare const __dirname: string;
type Entrada = { name: string; isDirectory(): boolean };
const fs: { readdirSync(d: string, o: { withFileTypes: true }): Entrada[]; readFileSync(f: string, c: 'utf8'): string } = require('fs');
const path: { join(...p: string[]): string; relative(a: string, b: string): string } = require('path');

jest.mock('expo-localization', () => ({ getLocales: () => [{ languageCode: 'es', regionCode: 'VE' }] }));
jest.mock('@react-native-async-storage/async-storage', () => require('@react-native-async-storage/async-storage/jest/async-storage-mock'));

describe('recordatorios de otros métodos', () => {
  test('anillo: se saca el día 21 y se pone uno nuevo el 28', () => {
    expect(proximoRecordatorio('anillo', '2026-11-01', '2026-11-10')).toMatchObject({ accion: 'sacar_anillo', fecha: '2026-11-22', enDias: 12 });
    expect(proximoRecordatorio('anillo', '2026-11-01', '2026-11-24')).toMatchObject({ accion: 'poner_anillo', fecha: '2026-11-29', enDias: 5 });
    // Varios ciclos después sigue la misma cuenta
    expect(proximoRecordatorio('anillo', '2026-11-01', '2026-12-05')).toMatchObject({ accion: 'sacar_anillo', fecha: '2026-12-20' });
  });

  test('parche: cambio los días 7 y 14, semana sin parche y uno nuevo', () => {
    expect(proximoRecordatorio('parche', '2026-11-01', '2026-11-03')).toMatchObject({ accion: 'cambiar_parche', fecha: '2026-11-08' });
    expect(proximoRecordatorio('parche', '2026-11-01', '2026-11-16')).toMatchObject({ accion: 'semana_sin_parche', fecha: '2026-11-22' });
    expect(proximoRecordatorio('parche', '2026-11-01', '2026-11-23')).toMatchObject({ accion: 'poner_parche', fecha: '2026-11-29' });
  });

  test('inyección: mensual cada 30 días y trimestral cada 13 semanas', () => {
    expect(proximoRecordatorio('inyeccion_mensual', '2026-11-01', '2026-11-13')).toMatchObject({ fecha: '2026-12-01', enDias: 18 });
    expect(proximoRecordatorio('inyeccion_mensual', '2026-11-01', '2026-12-01')).toMatchObject({ fecha: '2026-12-01', enDias: 0, texto: 'Hoy toca la inyección' });
    expect(proximoRecordatorio('inyeccion_trimestral', '2026-11-01', '2026-11-27')).toMatchObject({ fecha: '2027-01-31', enDias: 65 });
  });
});

describe('guía de batería', () => {
  test('reconoce las marcas comunes en Venezuela y Latinoamérica', () => {
    expect(marcaAndroid('Xiaomi')).toBe('xiaomi');
    expect(marcaAndroid('INFINIX MOBILITY LIMITED')).toBe('infinix_tecno');
    expect(marcaAndroid('motorola')).toBe('motorola');
    expect(marcaAndroid(null)).toBe('generico');
    expect(guiaBateria('infinix_tecno').pasos[0]).toContain('Phone Master');
    for (const m of ['xiaomi', 'samsung', 'motorola', 'infinix_tecno', 'huawei_honor', 'generico'] as const) {
      expect(guiaBateria(m).pasos.some((p) => p.includes('Alarmas y recordatorios'))).toBe(true);
    }
  });
});

describe('auditoría para las tiendas', () => {
  // Frases que presentan la app como anticonceptivo. El aviso «no sirve como método anticonceptivo» sí está permitido.
  const PROHIBIDAS = [/d[ií]as seguros/i, /anticonceptivo natural/i, /m[ée]todo anticonceptivo digital/i, /previene el embarazo/i];
  const carpetas = ['src/content', 'src/app', 'src/lib', 'public'];

  function archivos(dir: string): string[] {
    return fs.readdirSync(dir, { withFileTypes: true }).flatMap((e) => {
      const p = path.join(dir, e.name);
      if (e.isDirectory()) return e.name === 'i18n' ? [] : archivos(p);
      return /\.(tsx?|html)$/.test(e.name) ? [p] : [];
    });
  }

  test('ningún texto promete evitar un embarazo', () => {
    const hallazgos: string[] = [];
    for (const f of carpetas.flatMap((c) => archivos(path.join(__dirname, '..', c)))) {
      fs.readFileSync(f, 'utf8').split('\n').forEach((linea: string, i: number) => {
        if (PROHIBIDAS.some((r) => r.test(linea))) hallazgos.push(`${path.relative(path.join(__dirname, '..'), f)}:${i + 1}`);
      });
    }
    expect(hallazgos).toEqual([]);
  });
});
