# Google Play Console — qué responder para Savia

Borrador para completar antes de mandar la app a revisión, actualizado el 08/11/2026. Todo tiene que coincidir con la política pública de privacidad y con lo que hace el código. Revisar con la abogada antes de enviar.

## Direcciones para la consola

| Campo | Dirección |
|---|---|
| Política de privacidad | https://cicloapp.vercel.app/privacidad.html |
| Eliminación de cuenta (pedido por web) | https://cicloapp.vercel.app/eliminar-cuenta.html |

Las dos son páginas fijas en `public/`, fuera de la app. La prueba `__tests__/metodos-y-auditoria.test.ts` también las revisa para que no tengan frases prohibidas.

## 1. Declaración de apps de salud

En **Política y programas → Contenido de la app → Apps de salud**, marcar solo:
- Seguimiento del ciclo menstrual y la fertilidad.
- Actividad física y sueño, porque Savia lee esos datos de Health Connect si la usuaria lo activa.

No marcar «Dispositivo médico» ni «Anticoncepción».

## 2. Permisos de Health Connect

Savia **solo lee**: nunca escribe en Health Connect. Pide 8 permisos (`app.json`). El 07/11 se sacó `READ_BODY_TEMPERATURE`, que pedía sin usarlo. Todos se leen en `src/lib/fuentesSalud.android.ts` y se ven en la pantalla **Reloj y apps de salud** (Perfil → Reloj y apps de salud), cruzados con el ciclo.

### Texto general (para pegar)
> Savia permite, de forma opcional, leer de Health Connect los pasos, el pulso, el sueño y la temperatura, para que la usuaria vea en su calendario cómo se relacionan con su ciclo, su embarazo, su posparto o su menopausia. Está desactivado por defecto y necesita que la usuaria lo active en «Reloj y apps de salud». Savia solo lee, nunca escribe en Health Connect. Los datos se resumen por día, quedan en el teléfono (y en la copia de la cuenta, si la usuaria crea una), y nunca se usan para publicidad ni se comparten con terceros.

### Uno por uno

| Permiso | Para qué lo usa Savia |
|---|---|
| `READ_STEPS` | Pasos del día, para ver la actividad en cada fase del ciclo. |
| `READ_HEART_RATE` | Pulso promedio del día, que suele subir en la segunda mitad del ciclo. |
| `READ_RESTING_HEART_RATE` | Pulso en reposo, el dato más estable para ver ese cambio entre fases. |
| `READ_HEART_RATE_VARIABILITY` | Variabilidad del pulso, que acompaña el cansancio y el estrés de cada fase. |
| `READ_SLEEP` | Horas de sueño, para cruzarlas con el ciclo, el embarazo y el posparto. |
| `READ_SKIN_TEMPERATURE` | Temperatura de la piel que miden los relojes por la noche. |
| `READ_BASAL_BODY_TEMPERATURE` | Temperatura basal que carga la usuaria o su termómetro, para ver el cambio después de la ovulación. |
| `READ_HEALTH_DATA_HISTORY` | Leer los datos de antes de conectar Savia, para que la vista del ciclo no arranque vacía. |

## 3. Seguridad de los datos (Data Safety)

- **¿Recopila o comparte datos?** Recopila solo si la usuaria crea una cuenta para el respaldo en la nube o el modo pareja. Sin cuenta, todo queda en el teléfono y no se declara como recopilado.
- **¿Comparte datos con terceros?** No. Ningún dato se vende ni va a redes de publicidad.
- **¿Cifrado en tránsito?** Sí (HTTPS hacia Neon y Vercel).
- **Cifrado con clave propia (opcional, 11/11/2026):** la usuaria puede cifrar su respaldo en la nube y el archivo con una frase (AES-256-GCM, scrypt; `src/lib/cifrado.ts`). Es **opcional**: por defecto la copia no va cifrada con clave propia. Por eso no se declara «cifrado de extremo a extremo» para todos los datos; en el formulario, el cifrado en tránsito se marca «Sí» y lo opcional se explica en la política.
- **¿Se pueden borrar los datos?** Sí: en la app, Perfil → «Eliminar mi cuenta»; por web, la dirección de eliminación de cuenta.
- **Tipos de datos** (todos opcionales, solo con cuenta):
  1. **Información personal → correo electrónico y nombre:** para entrar a la cuenta. Es obligatorio si crea cuenta.
  2. **Salud y bienestar → información de salud:** salud reproductiva y síntomas. Sirve para el respaldo entre dispositivos de la propia usuaria y para el modo pareja, que comparte solo la etapa y las fechas.
  3. **Salud y bienestar → información de actividad física:** pasos, pulso, sueño y temperatura leídos de Health Connect, solo si los activó. Sirve para el respaldo.
  4. **Actividad en la app → interacciones con la app y otro contenido generado por la usuaria:** las respuestas e ideas de «Ayúdanos a mejorar» (Perfil → pruebas), que viajan dentro del respaldo. Uso: funcionalidad de la app (respaldo). Si las manda por correo, lo hace ella desde su propia app de correo.

En «información de salud» entran también lo que soñó, los controles médicos y autoexámenes, y los cuestionarios de ánimo (Edimburgo) y de menopausia (MRS): todo va en la misma copia (`ciclo_data`). El nombre o apodo que carga en Perfil también viaja en la copia y en el resumen del modo pareja: está cubierto por el punto 1.

### Lo que no se declara como «compartir»
- **Modo pareja:** lo inicia la usuaria y va a la persona que ella eligió con un código. Google no lo cuenta como compartir con terceros cuando es una transferencia que la usuaria pide y espera.
- **Neon y Vercel:** son proveedores que procesan los datos por cuenta de Savia, no terceros que los usan para sí.
- **Respaldo en archivo y PDF para la médica:** los arma el teléfono y los comparte la usuaria. El archivo de respaldo **no va cifrado por defecto**; la usuaria puede elegir «Respaldar con clave (cifrado)» (lo dice la política).
- **Google Fonts:** el PDF para la médica descarga las tipografías; no lleva datos de la usuaria. Si se quiere evitar del todo, hay que incluir las fuentes dentro de la app (`src/lib/informe.ts`).

### Revisión punto por punto (08/11/2026)

| Qué dice la política pública | Qué hace el código | ¿Coincide? |
|---|---|---|
| Sin cuenta, nada sale del teléfono | `nube.ts` solo sube con sesión iniciada | Sí |
| Copia en Neon, Ohio (EE. UU.) | `ep-old-bar-b5e0wyej…us-east-2.aws.neon.tech` | Sí |
| Modo pareja: nombre, etapa y fechas | `resumenPareja()` sube nombre, etapa, qué comparte, inicio y duración del ciclo, FPP o fecha de nacimiento | Sí |
| Health Connect: solo lectura | 8 permisos `READ_*` en `app.json`, ninguno de escritura | Sí |
| Sin herramientas de seguimiento ni análisis | No hay Sentry, Firebase, Analytics ni similares en `src/` ni en `app.json` | Sí |
| Borrar datos y cuenta desde Perfil | «Borrar todos mis datos» y «Eliminar mi cuenta» en `perfil.tsx` | Sí |
| Lista de lo que se guarda | Faltaban controles, autoexámenes, cuestionarios, posparto y el nombre | **Corregido el 08/11** |
| Respaldo en archivo | Existía sin mencionarse, y no va cifrado | **Agregado el 08/11** |
| Respuestas de «Ayúdanos a mejorar» | Viajaban en la copia sin mencionarse | **Agregado el 08/11** |
| Proveedores | No se nombraban Vercel ni Google Fonts | **Agregado el 08/11** |

No declarar «cifrado de extremo a extremo» como regla general: el cifrado con clave propia existe desde el 11/11/2026 pero es opcional (rama `claude/cifrado-cliente`; vale cuando se una a main).

## 4. Antes de enviar

- **Borrado de cuenta:** «Eliminar mi cuenta» borra los datos y después llama a `api/borrar-usuario` (función de Vercel), que verifica la sesión con la llave pública de Neon Auth y borra a esa usuaria con la API de Neon. Para que ande hace falta la variable `NEON_API_KEY` en el proyecto `cicloapp` de Vercel; sin ella responde «sin configurar» y la app sigue con el plan B (pedir el cierre por mail). Probado el 08/11/2026 en producción: sin clave responde 503, otra web 403, otro método 405.
- **Recompilar el paquete** con `compilar-savia.ps1` después de unir estos cambios. El paquete del 31/10 pide todavía el permiso que se sacó.
- **Probar en un Android real** que «Reloj y apps de salud» pide los 8 permisos y muestra los datos.

## 5. Textos de la ficha

- **Usar:** «Seguimiento del ciclo menstrual, recordatorio de pastillas, embarazo, posparto y menopausia, con privacidad».
- **Nunca usar:** «método anticonceptivo», «evitar el embarazo», «días seguros», «anticoncepción natural». La prueba `__tests__/metodos-y-auditoria.test.ts` revisa que el código y las páginas públicas no tengan esas frases.
- La ficha completa para pegar está en `docs/ficha-google-play.md`.
