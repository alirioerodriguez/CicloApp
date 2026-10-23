// Tarea de los widgets (Android): Android la llama al agregar, actualizar o tocar un widget,
// aunque la app esté cerrada. Se registra en index.js, antes que la app.
import { registerWidgetTaskHandler, type WidgetTaskHandlerProps } from 'react-native-android-widget';
import { today } from '../lib/dates';
import { cargarRegionGuardada } from '../lib/region';
import { guardarTomaSinApp } from '../lib/tareaPastilla';
import { ACCION_MARCAR } from './WidgetPastilla';
import { actualizarWidgets } from './actualizarWidgets';
import { dibujar } from './dibujar';

export async function tareaWidget({ widgetInfo, widgetAction, clickAction, renderWidget }: WidgetTaskHandlerProps): Promise<void> {
  if (widgetAction === 'WIDGET_DELETED') return;
  await cargarRegionGuardada();
  if (widgetAction === 'WIDGET_CLICK' && clickAction === ACCION_MARCAR) {
    // Mismo camino que el botón "Ya la tomé" de la notificación: guarda y cancela el segundo aviso.
    await guardarTomaSinApp(today());
    renderWidget(await dibujar(widgetInfo.widgetName));
    await actualizarWidgets(); // los demás widgets, si también están en la pantalla
    return;
  }
  renderWidget(await dibujar(widgetInfo.widgetName));
}

registerWidgetTaskHandler(tareaWidget);
