// Pide a Android o al iPhone que vuelvan a dibujar los widgets de Savia con lo guardado.
// Se llama al guardar desde la app, desde el widget, desde la notificación y al conectar con la pareja.
// En web no hace nada. Cada librería de widgets se carga solo en su plataforma.
import { Platform } from 'react-native';

export async function actualizarWidgets(): Promise<void> {
  if (Platform.OS === 'ios') return actualizarWidgetsIOS();
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

// iPhone (expo-widgets): manda hoy y los próximos 7 días, así la cuenta cambia sola a medianoche.
async function actualizarWidgetsIOS(): Promise<void> {
  try {
    const AsyncStorage = (require('@react-native-async-storage/async-storage') as typeof import('@react-native-async-storage/async-storage')).default;
    const { CLAVE_ACTIVA } = require('../lib/blister') as typeof import('../lib/blister');
    const { cargarRegionGuardada } = require('../lib/region') as typeof import('../lib/region');
    const { lineasDeTiempo } = require('./ios/datosIOS') as typeof import('./ios/datosIOS');
    const SaviaPeriodo = (require('./ios/SaviaPeriodo') as typeof import('./ios/SaviaPeriodo')).default;
    const SaviaPastilla = (require('./ios/SaviaPastilla') as typeof import('./ios/SaviaPastilla')).default;
    await cargarRegionGuardada();
    const clave = await AsyncStorage.getItem(CLAVE_ACTIVA);
    const guardado = clave ? await AsyncStorage.getItem(clave) : null;
    const lineas = lineasDeTiempo(guardado ? JSON.parse(guardado) : null);
    SaviaPeriodo.updateTimeline(lineas.periodo);
    SaviaPastilla.updateTimeline(lineas.pastilla);
  } catch {
    // En Expo Go (sin el módulo nativo) o sin widgets en la pantalla de inicio: nada que actualizar.
  }
}
