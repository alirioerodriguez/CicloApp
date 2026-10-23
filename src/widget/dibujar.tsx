// Dibuja cualquiera de los widgets de Savia con lo guardado en el teléfono.
import { leerParejaGuardada, vistaPareja } from '../lib/pareja';
import { region } from '../lib/region';
import { leerDatosCiclo } from './datosCiclo';
import { leerDatosWidget } from './datosWidget';
import { WIDGET_CICLO, WIDGET_CUENTA, WIDGET_PAREJA, widgetCiclo, widgetPareja } from './WidgetCiclo';
import { WIDGET_CHICO, WIDGET_SEMANA, widgetPastilla } from './WidgetPastilla';

export const WIDGETS = [WIDGET_CHICO, WIDGET_SEMANA, WIDGET_CUENTA, WIDGET_CICLO, WIDGET_PAREJA];

export async function dibujar(nombre: string) {
  if (nombre === WIDGET_CUENTA || nombre === WIDGET_CICLO) return widgetCiclo(nombre, await leerDatosCiclo());
  if (nombre === WIDGET_PAREJA) {
    const g = await leerParejaGuardada();
    return widgetPareja(g ? vistaPareja(g.resumen, region().pais) : null);
  }
  return widgetPastilla(nombre, await leerDatosWidget());
}
