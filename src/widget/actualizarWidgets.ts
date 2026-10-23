// Pide a Android que vuelva a dibujar los widgets de Savia con lo guardado.
// Se llama al guardar desde la app, desde el widget, desde la notificación y al conectar con la pareja.
// Solo Android: en web y iPhone no hace nada (la librería no existe ahí y no se carga).
import { Platform } from 'react-native';

export async function actualizarWidgets(): Promise<void> {
  if (Platform.OS !== 'android') return;
  try {
    const { requestWidgetUpdate } = require('react-native-android-widget') as typeof import('react-native-android-widget');
    const { cargarRegionGuardada } = require('../lib/region') as typeof import('../lib/region');
    const { WIDGETS, dibujar } = require('./dibujar') as typeof import('./dibujar');
    await cargarRegionGuardada();
    for (const nombre of WIDGETS) {
      const vista = await dibujar(nombre);
      await requestWidgetUpdate({ widgetName: nombre, renderWidget: () => vista });
    }
  } catch {
    // Sin widgets en la pantalla de inicio (o en Expo Go): nada que actualizar.
  }
}
