// Punto de entrada: las tareas en segundo plano tienen que definirse antes que la app, porque Android
// puede arrancar el JS solo para correrlas (con la app cerrada):
// - el botón "Ya la tomé" de la notificación de la pastilla,
// - los widgets de inicio (solo Android).
// Se usa require (no import) para respetar este orden: los import se adelantan solos.
const { Platform } = require('react-native');

require('./src/lib/tareaPastilla');
if (Platform.OS === 'android') require('./src/widget/tareaWidget');
require('expo-router/entry');
