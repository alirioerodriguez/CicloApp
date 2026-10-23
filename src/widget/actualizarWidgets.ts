// Pide a Android que vuelva a dibujar los widgets de la pastilla con lo guardado.
// Se llama al marcar desde la app (después de guardar), desde el widget y desde la notificación.
// Solo Android: en web y iPhone no hace nada (la librería no existe ahí y no se carga).
import { Platform } from 'react-native';

export async function actualizarWidgets(): Promise<void> {
  if (Platform.OS !== 'android') return;
  try {
    const { requestWidgetUpdate } = require('react-native-android-widget') as typeof import('react-native-android-widget');
    const { cargarRegionGuardada } = require('../lib/region') as typeof import('../lib/region');
    const { leerDatosWidget } = require('./datosWidget') as typeof import('./datosWidget');
    const { WIDGET_CHICO, WIDGET_SEMANA, widgetPastilla } = require('./WidgetPastilla') as typeof import('./WidgetPastilla');
    await cargarRegionGuardada();
    const r = await leerDatosWidget();
    for (const nombre of [WIDGET_CHICO, WIDGET_SEMANA]) {
      await requestWidgetUpdate({ widgetName: nombre, renderWidget: () => widgetPastilla(nombre, r) });
    }
  } catch {
    // Sin widgets en la pantalla de inicio (o en Expo Go): nada que actualizar.
  }
}
