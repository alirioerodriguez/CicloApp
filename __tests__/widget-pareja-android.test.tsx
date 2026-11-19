// Widget «Tu pareja hoy» de Android: en 4×2 la misión; agrandado, también cómo se siente, un plan y algo para comer.
import { describe, expect, jest, test } from '@jest/globals';
import { isValidElement, type ReactElement, type ReactNode } from 'react';
import { FlexWidget, TextWidget } from 'react-native-android-widget';
import { vistaPareja, type ResumenPareja } from '../src/lib/pareja';
import { ALTO_CONSEJOS, widgetPareja } from '../src/widget/WidgetCiclo';

jest.mock('expo-localization', () => ({ getLocales: () => [{ languageCode: 'es', regionCode: 'VE' }] }));
jest.mock('@react-native-async-storage/async-storage', () => require('@react-native-async-storage/async-storage/jest/async-storage-mock'));
jest.mock('../src/lib/nube', () => ({ nubeConfigurada: false, neon: null }));
jest.mock('react-native-android-widget', () => ({ FlexWidget: () => null, TextWidget: () => null, requestWidgetUpdate: jest.fn() }));

// Los textos que se verían: abre los componentes propios y junta el `text` de cada TextWidget.
function textos(n: ReactNode): string[] {
  if (Array.isArray(n)) return n.flatMap(textos);
  if (!isValidElement(n)) return [];
  const el = n as ReactElement<{ text?: string; children?: ReactNode }>;
  if (el.type === TextWidget) return [el.props.text ?? ''];
  if (el.type === FlexWidget) return textos(el.props.children);
  return textos((el.type as (p: unknown) => ReactNode)(el.props));
}

// widgetPareja siempre devuelve la versión clara y la oscura.
const modos = (w: unknown) => w as { light: ReactElement; dark: ReactElement };

const resumen: ResumenPareja = { v: 1, nombre: 'Ana', etapa: 'ciclo', compartir: ['fase', 'energia', 'periodo', 'ayuda'], ciclo: { inicio: '2026-10-27', largo: 28, sangrado: 5, rango: null }, fpp: null, nacimiento: null };

describe('Tu pareja hoy (Android)', () => {
  test('en 4×2: fase, período y la misión del día', () => {
    const t = textos(modos(widgetPareja(vistaPareja(resumen, 'VE', '2026-11-14'), 110)).light);
    expect(t).toContain('Ana está en su fase lútea');
    expect(t).toContain('Su período: en 10 días');
    expect(t.some((x) => x.startsWith('Hoy: '))).toBe(true);
    expect(t).not.toContain('CÓMO SE SIENTE');
  });

  test('agrandado: cómo se siente, misión, un plan y algo para comer', () => {
    const v = vistaPareja(resumen, 'VE', '2026-11-14');
    const t = textos(modos(widgetPareja(v, ALTO_CONSEJOS)).dark);
    for (const rotulo of ['CÓMO SE SIENTE', 'TU MISIÓN DE HOY', 'UN PLAN', 'PARA COMER']) expect(t).toContain(rotulo);
    expect(t).toContain(v.plan!);
    expect(t).toContain(v.plato!);
  });

  test('sin conexión invita a conectar, aunque esté agrandado', () => {
    expect(textos(modos(widgetPareja(null, 300)).light)).toContain('Toca para conectar con el código de tu pareja.');
  });
});
