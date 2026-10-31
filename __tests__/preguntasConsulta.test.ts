// Embarazo: preguntas para la próxima consulta (anotar, marcar, limpiar y verlas en el Modo consulta).
import { describe, expect, jest, test } from '@jest/globals';
import { summarize } from '../src/lib/cycle';
import { consulta, consultaTexto } from '../src/lib/consulta';
import { agregarPregunta, limpiarConversadas, lineaPregunta, marcarPregunta, pendientes, quitarPregunta } from '../src/lib/preguntasConsulta';
import { emptyData, normalize } from '../src/lib/store';

jest.mock('expo-localization', () => ({ getLocales: () => [{ languageCode: 'es', regionCode: 'VE' }] }));
jest.mock('@react-native-async-storage/async-storage', () => require('@react-native-async-storage/async-storage/jest/async-storage-mock'));
jest.mock('../src/lib/nube', () => ({ nubeConfigurada: false, neon: null }));

const base = () => emptyData().embarazo;

describe('Preguntas para la consulta prenatal', () => {
  test('se anotan limpias, con la semana, y no se repite la misma pendiente', () => {
    let e = agregarPregunta(base(), '  ¿Puedo   viajar en avión? ', '2026-10-20', 24, 'a');
    e = agregarPregunta(e, '¿puedo viajar en avión?', '2026-10-21', 24, 'b');
    e = agregarPregunta(e, '   ', '2026-10-21', 24, 'c');
    expect(e.preguntas).toEqual([{ id: 'a', fecha: '2026-10-20', semana: 24, texto: '¿Puedo viajar en avión?', hecha: false }]);
    expect(lineaPregunta(e.preguntas[0])).toBe('Semana 24 · ¿Puedo viajar en avión?');
  });

  test('pendientes en el orden en que surgieron; las conversadas no cuentan', () => {
    let e = agregarPregunta(base(), 'Segunda', '2026-10-22', 25, 'b');
    e = agregarPregunta(e, 'Primera', '2026-10-15', 24, 'a');
    e = agregarPregunta(e, 'Tercera', '2026-10-25', 25, 'c');
    e = marcarPregunta(e, 'c', true);
    expect(pendientes(e).map((p) => p.texto)).toEqual(['Primera', 'Segunda']);
    // una conversada se puede volver a anotar como nueva
    expect(agregarPregunta(e, 'tercera', '2026-10-30', 26, 'd').preguntas).toHaveLength(4);
  });

  test('limpiar saca solo las conversadas; quitar saca una', () => {
    let e = agregarPregunta(base(), 'Una', '2026-10-15', 24, 'a');
    e = agregarPregunta(e, 'Otra', '2026-10-16', 24, 'b');
    e = marcarPregunta(e, 'a', true);
    expect(limpiarConversadas(e).preguntas.map((p) => p.id)).toEqual(['b']);
    expect(quitarPregunta(e, 'b').preguntas.map((p) => p.id)).toEqual(['a']);
  });

  test('sin semana conocida, la línea es solo el texto', () => {
    const e = agregarPregunta(base(), 'Sin fecha probable', '2026-10-15', null, 'a');
    expect(lineaPregunta(e.preguntas[0])).toBe('Sin fecha probable');
  });

  test('un respaldo viejo (sin preguntas) se abre con la lista vacía', () => {
    const viejo = { ...emptyData(), embarazo: { hechos: ['x'], patadas: {}, medidas: {} } };
    const d = normalize(JSON.parse(JSON.stringify(viejo)));
    expect(d.embarazo.preguntas).toEqual([]);
    expect(d.embarazo.hechos).toEqual(['x']);
  });

  test('el Modo consulta las muestra y las comparte solo en embarazo', () => {
    const d = emptyData();
    d.settings.etapa = 'embarazo';
    d.settings.embarazo = { fpp: '2027-02-01' };
    d.embarazo = agregarPregunta(d.embarazo, '¿Cuándo hago la curva de glucosa?', '2026-10-20', 24, 'a');
    const r = consulta(d, summarize(d, '2026-10-30'), 3);
    expect(r.preguntas).toEqual(['Semana 24 · ¿Cuándo hago la curva de glucosa?']);
    expect(consultaTexto(r)).toContain('Mis preguntas:');
    d.settings.etapa = 'ciclo';
    const r2 = consulta(d, summarize(d, '2026-10-30'), 3);
    expect(r2.preguntas).toEqual([]);
    expect(consultaTexto(r2)).not.toContain('Mis preguntas');
  });
});
