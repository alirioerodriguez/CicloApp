// Punto de entrada: las tareas en segundo plano tienen que definirse antes que la app, porque Android
// puede arrancar el JS solo para correrlas (con la app cerrada):
// - el botón "Ya la tomé" de la notificación de la pastilla,
// - los widgets de inicio (solo Android).
// Se usa require (no import) para respetar este orden: los import se adelantan solos.
require('./src/polyfills'); // crypto en el teléfono, antes que cualquier librería
const { Platform } = require('react-native');

// Ingreso con Google o Apple desde la app del celular (ver signInSocial en src/lib/nube.ts). La app abre esta web
// con ?ingresoApp=google o apple; la web entra con el proveedor, vuelve con ?ingresoApp=volver&neon_auth_session_verifier=…
// y le pasa ese código a la app sin usarlo (si la web lo canjeara primero, a la app ya no le serviría).
const busqueda = Platform.OS === 'web' && typeof window !== 'undefined' ? window.location.search : '';
const pasoApp = /[?&]ingresoApp=(google|apple|volver)/.exec(busqueda)?.[1];

if (pasoApp === 'volver') {
  const codigo = /[?&]neon_auth_session_verifier=([^&#]+)/.exec(busqueda)?.[1];
  window.location.replace('ciclo://auth' + (codigo ? '?neon_auth_session_verifier=' + codigo : '?error=1'));
} else if (pasoApp === 'google' || pasoApp === 'apple') {
  document.body.style.cssText = 'font-family:system-ui;display:flex;align-items:center;justify-content:center;height:100vh;margin:0;color:#7E2F52';
  document.body.textContent = pasoApp === 'apple' ? 'Abriendo Apple…' : 'Abriendo Google…';
  require('./src/lib/nube')
    .signInSocial(pasoApp, window.location.origin + '/?ingresoApp=volver')
    .catch(() => window.location.replace('ciclo://auth?error=1'));
} else {
  require('./src/lib/tareaPastilla');
  if (Platform.OS === 'android') require('./src/widget/tareaWidget');
  require('expo-router/entry');
}
