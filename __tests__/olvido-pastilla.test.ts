// Guía «¿Olvidaste una pastilla?» (CDC 2024, la más prudente).
import { describe, expect, test } from '@jest/globals';
import { guiaCombinada, guiaProgestageno, tipoDeGuia } from '../src/lib/olvidoPastilla';

describe('olvido de pastilla', () => {
  test('cada blíster va a su guía', () => {
    expect(tipoDeGuia('21-7')).toBe('combinada');
    expect(tipoDeGuia('24-4')).toBe('combinada');
    expect(tipoDeGuia('continua')).toBe('combinadaContinua');
    expect(tipoDeGuia('pop')).toBe('progestageno');
    expect(tipoDeGuia('pop-24-4')).toBe('progestageno');
    expect(tipoDeGuia('26-2')).toBe('especial');
  });

  test('una combinada olvidada: tomarla y sin protección extra', () => {
    const r = guiaCombinada({ olvido: 'una' });
    expect(r.aviso).toBeUndefined();
    expect(r.pasos.join(' ')).toContain('no hace falta protección extra');
  });

  test('placebo olvidado: se descarta', () => {
    expect(guiaCombinada({ olvido: 'placebo' }).pasos.join(' ')).toContain('Descarta');
  });

  test('dos o más: 7 días de protección; en la semana 3 se saltea la pausa', () => {
    const s2 = guiaCombinada({ olvido: 'dosOMas', semana: 2 });
    expect(s2.aviso).toContain('7 días');
    expect(s2.pasos.join(' ')).not.toContain('no hagas la pausa');
    expect(guiaCombinada({ olvido: 'dosOMas', semana: 3 }).pasos.join(' ')).toContain('no hagas la pausa');
  });

  test('semana 1 con relaciones sin protección: consultar por la pastilla de emergencia', () => {
    expect(guiaCombinada({ olvido: 'dosOMas', semana: 1, relaciones: true }).aviso).toContain('pastilla de emergencia');
    expect(guiaCombinada({ olvido: 'dosOMas', semana: 1, relaciones: false }).aviso).not.toContain('emergencia');
  });

  test('combinada continua: no hay pausa que saltear', () => {
    expect(guiaCombinada({ olvido: 'dosOMas', semana: 3, continua: true }).pasos.join(' ')).not.toContain('no hagas la pausa');
  });

  test('solo progestágeno: más de 3 horas pide 2 días de protección', () => {
    expect(guiaProgestageno({ masDe3Horas: false }).aviso).toBeUndefined();
    expect(guiaProgestageno({ masDe3Horas: true }).aviso).toContain('2 días');
    expect(guiaProgestageno({ masDe3Horas: true, relaciones: true }).aviso).toContain('pastilla de emergencia');
  });
});
