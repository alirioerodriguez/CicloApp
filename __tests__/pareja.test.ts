// Modo pareja y widgets del ciclo: qué se comparte, qué ve la pareja y qué muestra cada widget.
import { describe, expect, jest, test } from '@jest/globals';
import { summarize } from '../src/lib/cycle';
import { faseDelDia, limpiarCodigo, mostrarCodigo, nuevoCodigo, resumenPareja, vistaPareja } from '../src/lib/pareja';
import { emptyData, normalize } from '../src/lib/store';
import type { AppData, DayLog } from '../src/lib/types';
import { resumenCiclo } from '../src/widget/datosCiclo';

jest.mock('expo-localization', () => ({ getLocales: () => [{ languageCode: 'es', regionCode: 'VE' }] }));
jest.mock('@react-native-async-storage/async-storage', () => require('@react-native-async-storage/async-storage/jest/async-storage-mock'));
jest.mock('../src/lib/nube', () => ({ nubeConfigurada: false, neon: null }));
jest.mock('react-native-android-widget', () => ({ requestWidgetUpdate: jest.fn(), FlexWidget: () => null, TextWidget: () => null }));

const log = (date: string, extra: Partial<DayLog> = {}): DayLog => ({ ...normalize({ logs: { [date]: { flow: 3 } } }).logs[date], ...extra });

// Ciclos de 28 días con período de 5: 1 sep, 29 sep y 27 oct de 2026 (este último, el actual).
function datos(): AppData {
  const d = emptyData();
  d.settings = { ...d.settings, onboarded: true, name: 'Ana', red: { on: true, nombre: 'Luis', compartir: ['fase', 'energia', 'periodo', 'ayuda'], enVivo: true } };
  for (const inicio of ['2026-09-01', '2026-09-29', '2026-10-27']) {
    const base = new Date(`${inicio}T12:00:00`);
    for (let i = 0; i < 5; i++) {
      const f = new Date(base);
      f.setDate(base.getDate() + i);
      const iso = f.toISOString().slice(0, 10);
      d.logs[iso] = log(iso, { intimidad: true, note: 'privado', symptoms: ['colicos'], moods: ['triste'] });
    }
  }
  return d;
}

describe('Lo que se comparte con la pareja', () => {
  test('solo fase y fechas: nunca registros, notas, síntomas, ánimo ni intimidad', () => {
    const d = datos();
    const r = resumenPareja(d, summarize(d, '2026-11-05'));
    expect(r).toEqual({ v: 1, nombre: 'Ana', etapa: 'ciclo', compartir: ['fase', 'energia', 'periodo', 'ayuda'], ciclo: { inicio: '2026-10-27', largo: 28, sangrado: 5, rango: null }, fpp: null, nacimiento: null });
    const texto = JSON.stringify(r);
    for (const privado of ['intimidad', 'privado', 'colicos', 'triste', 'logs', 'pastilla']) expect(texto).not.toContain(privado);
  });

  test('con pastilla no se comparte el ciclo (ni el método)', () => {
    const d = datos();
    d.settings = { ...d.settings, pillMode: true, anticonceptivo: 'pastilla' };
    const r = resumenPareja(d, summarize(d, '2026-11-05'));
    expect(r.ciclo).toBeNull();
    expect(vistaPareja(r, 'VE', '2026-11-05').fase).toBe('general');
  });

  test('si no comparte nada del ciclo, no viaja el ciclo', () => {
    const d = datos();
    d.settings = { ...d.settings, red: { ...d.settings.red, compartir: ['ayuda'] } };
    expect(resumenPareja(d, summarize(d, '2026-11-05')).ciclo).toBeNull();
  });
});

describe('Lo que ve la pareja', () => {
  const c = { inicio: '2026-10-27', largo: 28, sangrado: 5, rango: null };

  test('fase de cada día, calculada sin que ella abra la app', () => {
    expect(faseDelDia(c, '2026-10-27')).toEqual({ fase: 'menstrual', dia: 1 });
    expect(faseDelDia(c, '2026-11-02').fase).toBe('folicular'); // día 7
    expect(faseDelDia(c, '2026-11-09').fase).toBe('ovulatoria'); // día 14
    expect(faseDelDia(c, '2026-11-14').fase).toBe('lutea'); // día 19
    expect(faseDelDia(c, '2026-11-20').fase).toBe('spm'); // día 25
    expect(faseDelDia(c, '2026-11-30').fase).toBe('spm'); // ya pasó la fecha
  });

  test('misión, planes y comida del país; período en días', () => {
    const r = resumenPareja(datos(), summarize(datos(), '2026-11-14'));
    const v = vistaPareja(r, 'MX', '2026-11-14');
    expect(v.titulo).toBe('Ana está en su fase lútea');
    expect(v.dia).toBe(19);
    expect(v.periodo).toEqual({ enDias: 10, fecha: '2026-11-24', rango: null });
    expect(v.mision).toBeTruthy();
    expect(v.citas.length).toBeGreaterThan(0);
    expect(v.ingredientes.length).toBeGreaterThan(0);
    expect(vistaPareja(r, 'MX', '2026-10-28').ingredientes.map((a) => a.nombre)).toContain('Lentejas y frijoles'); // nombre de México, en su período
    expect(vistaPareja(r, 'MX', '2026-11-15').mision).not.toBe(v.mision); // cambia cada día
  });

  test('pasada la fecha dice "en cualquier momento", nunca atraso', () => {
    const r = resumenPareja(datos(), summarize(datos(), '2026-11-14'));
    expect(vistaPareja(r, 'VE', '2026-11-27').periodo?.enDias).toBe(0);
  });

  test('respeta lo que eligió: sin "periodo" no hay fecha; sin "ayuda" no hay misión', () => {
    const d = datos();
    d.settings = { ...d.settings, red: { ...d.settings.red, compartir: ['fase'] } };
    const v = vistaPareja(resumenPareja(d, summarize(d, '2026-11-14')), 'VE', '2026-11-14');
    expect(v.periodo).toBeNull();
    expect(v.mision).toBeNull();
    expect(v.platos).toEqual([]);
    expect(v.energia).toBeNull();
  });

  test('código de 8 caracteres sin letras confusas', () => {
    const c8 = nuevoCodigo();
    expect(c8).toMatch(/^[A-HJKMNP-Z2-9]{8}$/);
    expect(mostrarCodigo('ABCDEFGH')).toBe('ABCD-EFGH');
    expect(limpiarCodigo(' abcd-efgh ')).toBe('ABCDEFGH');
  });
});

describe('Widgets del ciclo', () => {
  test('cuenta regresiva al período y barra del ciclo', () => {
    const r = resumenCiclo(datos(), '2026-11-14');
    if (r.tipo !== 'ciclo') throw new Error('debería ser ciclo');
    expect(r).toMatchObject({ dia: 19, fase: 'lutea', enPeriodo: false, diasPara: 10, fecha: '2026-11-24', atraso: 0 });
    expect(r.marcas).toHaveLength(28);
    expect(r.marcas.slice(0, 5).every((m) => m === 'periodo')).toBe(true);
    expect(r.marcas.filter((m) => m === 'fertil')).toHaveLength(7);
  });

  test('con el período, el día del período; con atraso, los días de atraso', () => {
    expect(resumenCiclo(datos(), '2026-10-28')).toMatchObject({ tipo: 'ciclo', enPeriodo: true, dia: 2 });
    expect(resumenCiclo(datos(), '2026-11-27')).toMatchObject({ tipo: 'ciclo', atraso: 3, diasPara: 0 });
  });

  test('modo discreto y embarazo', () => {
    const d = datos();
    d.settings = { ...d.settings, discreet: true };
    expect(resumenCiclo(d, '2026-11-14')).toMatchObject({ discreto: true });
    d.settings = { ...d.settings, etapa: 'embarazo', embarazo: { fpp: '2027-04-09' } };
    expect(resumenCiclo(d, '2026-11-14')).toEqual({ tipo: 'embarazo', semana: 19, faltan: 146 });
  });

  test('quien solo acompaña a su pareja no tiene ciclo propio', () => {
    const d = datos();
    d.settings = { ...d.settings, soloPareja: true };
    expect(resumenCiclo(d, '2026-11-14')).toEqual({ tipo: 'vacio' });
    expect(resumenCiclo(null)).toEqual({ tipo: 'vacio' });
  });
});
