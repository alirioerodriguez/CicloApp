# Ciclo · app de seguimiento menstrual (Android + iPhone)

Para cualquier mujer que quiera llevar su ciclo con privacidad. Un solo código para los dos teléfonos (y la web), hecho con **Expo (React Native)**. Los datos se guardan en el teléfono y, con la cuenta, una copia de respaldo en Neon (servidor en EE. UU., protegida por las reglas RLS de la cuenta; el cifrado con una clave de la usuaria está pendiente). El modo pareja comparte solo un resumen mínimo. Detalle completo en la pantalla «Qué sale de tu teléfono» (`src/app/privacidad-datos.tsx`).

## Qué cambió respecto a la guía original

La guía proponía Kotlin, que solo sirve para Android. Para que funcione también en iPhone se pasó a Expo, manteniendo los mismos bloques, ya construidos:

| Bloque de la guía | Dónde está | Mejoras añadidas |
|---|---|---|
| 0 · Esqueleto y tema | `src/app/(tabs)/_layout.tsx`, `src/lib/theme.ts` | Modo claro/oscuro automático, la app abre en "Hoy" |
| ½ · Bienvenida | `src/app/onboarding.tsx` | 5 pasos: nombre (opcional), último período, duración, pastilla (tipo de blíster y hora) y promesa de privacidad |
| 1 · Datos locales | `src/lib/store.tsx`, `src/lib/types.ts` | Guarda solo y también al cerrar la app; tolera respaldos viejos |
| 2 · Calendario y predicción | `src/app/(tabs)/calendario.tsx`, `src/lib/cycle.ts` | **Aprende de sus ciclos reales** (promedio de los últimos 6), muestra el rango y avisa de retrasos; modo "Marcar días de período". Fértil/ovulación solo sin pastilla. Nunca muestra "días seguros" |
| 3 · Registrar el día | `src/components/DayEditor.tsx` | Igual en "Hoy" y al tocar cualquier día del calendario; botón "Me vino hoy" |
| 4 · Cuídate hoy | `src/app/(tabs)/cuidate.tsx`, `src/content/cuidate.ts` | Contenido por fase (y para quien toma pastilla), botón "Otra idea", explorar otras fases |
| 5 · Alimentación | `src/app/alimentacion.tsx`, `src/content/alimentos.ts` | Filtros por categoría y "Para mi fase", sección "Con moderación" |
| 6 · Estadísticas | `src/app/(tabs)/estadisticas.tsx` | **Patrones automáticos** ("tus cólicos suelen aparecer el día 1–2"), regularidad, cumplimiento de la pastilla |
| 7 · Recordatorios | `src/lib/notifications.ts` | Pastilla (salta la semana de descanso), aviso de blíster nuevo/descanso, período próximo, agua y respaldo mensual |
| 8 · Perfil y respaldo | `src/app/(tabs)/perfil.tsx`, `src/lib/backup.ts` | Exportar/importar JSON, **bloqueo con huella/Face ID**, borrar todo |
| Ideas v2 | — | Ya incluidas: **resumen PDF para la ginecóloga** y **recordatorio de fin de blíster** |

## ✍️ Contenido editable

Los textos de `src/content/cuidate.ts`, `src/content/alimentos.ts` y `src/content/catalogo.ts` son texto simple: se pueden cambiar sin saber programar.

## Probarla ahora (gratis, Android y iPhone)

1. Instala **Expo Go** en el teléfono (Play Store o App Store).
2. En la computadora, dentro de esta carpeta:

```bash
npm install
```

```bash
npx expo start
```

3. Escanea el código QR que aparece: con la cámara en iPhone, o desde Expo Go en Android. La computadora y el teléfono tienen que estar en el mismo wifi.

> En Expo Go el bloqueo con Face ID puede pedir el código del teléfono en lugar de la cara. En la app instalada funciona normal.

También puedes verla en el navegador con `npx expo start --web` (sin recordatorios ni bloqueo).

## Instalarla de verdad

### Android: archivo APK (gratis)

1. Crea una cuenta gratis en [expo.dev](https://expo.dev).
2. En esta carpeta:

```bash
npx eas-cli@latest login
```

```bash
npx eas-cli@latest build -p android --profile apk
```

3. Cuando termine (unos 10–20 minutos en la nube), te da un enlace para descargar el `.apk`. Compártelo con quien quiera usarla; al abrirlo, Android pide permitir "instalar apps de origen desconocido" una sola vez.

### iPhone

Apple no deja instalar apps sueltas como Android. Las opciones reales son:

- **Cuenta de Apple Developer (99 USD al año):** `npx eas-cli@latest build -p ios --profile iphone`, registras cada iPhone cuando EAS te lo pida y se instala con un enlace. O la subes a **TestFlight** con `npx eas-cli@latest submit -p ios`.
- **Gratis, con una Mac:** `npx expo run:ios --device` con tu Apple ID gratuito. La app deja de abrir a los 7 días y hay que reinstalarla.
- **Gratis, sin instalar:** usarla dentro de Expo Go (pasos de arriba). Solo funciona mientras tu computadora corre `npx expo start`, así que sirve para probar, no para el día a día.

## Respaldo (importante)

Todo vive solo en el teléfono de cada usuaria. Para no perder el historial se usa **Perfil → Respaldar mis datos** y se guarda el archivo en Drive o iCloud; la app lo recuerda cada 30 días. Para pasar a otro teléfono: **Perfil → Restaurar un respaldo**.

## Para seguir trabajando con Claude

- Revisar tipos: `npx tsc --noEmit`
- Revisar dependencias: `npx expo-doctor`
- Nuevas librerías siempre con `npx expo install <paquete>`

## Novedades: diseño, ejercicios, tutorial y pruebas

| Qué | Dónde |
|---|---|
| Estilo del diseño: 12 tonos, modo Noche/Día, tipografías Fraunces y Plus Jakarta Sans, logo de anillo y gota | `src/lib/theme.ts`, `src/components/Logo.tsx`, `src/components/TonePicker.tsx` |
| Ejercicios animados por fase, con repeticiones, series y descansos | `src/content/ejercicios.ts`, `src/components/Figura.tsx`, `src/app/ejercicio/[id].tsx` |
| Alivio inmediato: respiración guiada y movimientos suaves (aparece en "Hoy" si el dolor es 7 o más) | `src/app/respirar.tsx`, `src/app/ejercicios.tsx` |
| Tutorial al entrar por primera vez (y desde Perfil) | `src/content/tutorial.ts`, `src/app/tutorial.tsx` |
| "Ayúdanos a mejorar": misiones con tiempo, facilidad 1–7 (SEQ), cuestionario SUS e ideas | `src/content/pruebas.ts`, `src/app/pruebas.tsx` |
| Salud ginecológica: controles con aviso, autoexamen de mamas, dolor de ovarios y quistes | `src/app/salud.tsx`, `src/content/salud.ts` |
| Registro de ovarios, senos e intimidad 🔥 (la intimidad nunca va en el PDF) | `src/components/DayEditor.tsx` |
| Diario de sueños (el signo es solo por diversión) | `src/app/suenos.tsx` |
| Tu situación (irregular, SOP, perimenopausia…): muestra un rango probable en vez de una fecha, y opción "sin avisos de retraso" | Perfil · `src/content/condiciones.ts` |

### Para agregar un ejercicio
Copia uno en `src/content/ejercicios.ts`, cambia el texto y las dos poses (A y B). Los pies se ubican con coordenadas y las rodillas se calculan solas.

### Para recibir los resultados de las pruebas por correo
Escribe tu correo en `CORREO_RESULTADOS` dentro de `src/content/pruebas.ts`. Si queda vacío, cada usuaria los comparte por donde quiera. Los resultados nunca incluyen datos del ciclo.

## Cuentas y nube (Neon) — encendido

La app tiene inicio de sesión con **Google** (en la web) y con **correo y contraseña**, y respaldo automático en **Neon** (Postgres con *Managed Better Auth*, plan gratis). Ya está conectada al proyecto **savia** de Neon: su URL pública va por defecto en `src/lib/nube.ts` y se puede cambiar con `EXPO_PUBLIC_NEON_URL`.

Así se armó (por si hay que repetirlo en otro proyecto):

1. En [console.neon.tech](https://console.neon.tech) crea un proyecto (plan Free).
2. En el proyecto, activa **Auth** (Managed Better Auth). Google ya viene con credenciales de prueba de Neon; para producción, crea las tuyas en Google Cloud y pégalas en Auth → OAuth.
3. En **Auth → Configuración**, agrega `https://cicloapp.vercel.app` (y `http://localhost:8081` para probar) como dominio de confianza.
4. En **Data API**, marca *Use Neon Auth* y actívalo.
5. En el **SQL Editor**, ejecuta `neon/ciclo_data.sql` (crea la tabla con seguridad por usuaria) y luego *Refresh schema cache* en Data API.
6. Copia la URL HTTPS de la base de datos (sin usuario ni contraseña, ver `.env.example`) en `EXPO_PUBLIC_NEON_URL`: en `.env` para probar en tu compu y en Vercel → Settings → Environment Variables para la web. Vuelve a publicar.

Al entrar por primera vez, los datos que ya había en el teléfono se suben solos a la cuenta.

**Apple:** Neon Auth no ofrece inicio de sesión con Apple por ahora. Además, Apple exige una cuenta de desarrollador paga (USD 99 al año) y la app publicada en la App Store.

## Países e idiomas

Antes de iniciar sesión, la app pregunta el país (Venezuela, México, Colombia, Argentina, Chile, Perú o Estados Unidos) y el idioma (español o inglés; por defecto, el del dispositivo). Los dos se cambian en Perfil → Tú.

- Todo el texto está escrito en español venezolano. `t()` en `src/lib/region.tsx` lo pasa a **inglés** (`src/content/i18n/en.ts`) o a **español neutro** para los demás países (`src/content/i18n/neutro.ts`). La clave es la frase exacta en español; las frases con datos usan `{0}`, `{1}`.
- Todos los textos de pantalla pasan por `Text` de `src/components/Texto.tsx`, que traduce solo. Si agregas una frase nueva, súmala a `en.ts` (y a `neutro.ts` si tiene palabras venezolanas como caraotas o cambur); si falta, se muestra en español.
- Las comidas de Alimentación y Cuídate salen de `src/content/alimentos.ts`: cada alimento tiene su nombre local por país (`nombres`) y algunos son solo de ciertos países (`paises`), como la sangrecita en Perú o los nopales en México.
- El PDF para la médica, el CSV y las notificaciones también se traducen (`t as tr` en `lib/backup.ts` y `lib/notifications.ts`). En las notificaciones con `{dias}`, la frase se traduce antes de poner el número (`fill` en `content/textos.ts`).
- `npm test` incluye `__tests__/ingles.test.ts`, que arma el PDF y una notificación con el teléfono en inglés.

## Versión web (Vercel)

`vercel.json` ya está configurado: Vercel ejecuta `npx expo export -p web` y publica la carpeta `dist`. En la web no hay recordatorios ni bloqueo con huella.
