# Google Play Console — qué responder para Savia

Borrador para completar antes de mandar la app a revisión, actualizado el 07/11/2026. Todo tiene que coincidir con la política pública de privacidad y con lo que hace el código. Revisar con la abogada antes de enviar.

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
- **¿Se pueden borrar los datos?** Sí: en la app, Perfil → «Eliminar mi cuenta»; por web, la dirección de eliminación de cuenta.
- **Tipos de datos** (todos opcionales, solo con cuenta):
  1. **Información personal → correo electrónico y nombre:** para entrar a la cuenta. Es obligatorio si crea cuenta.
  2. **Salud y bienestar → información de salud:** salud reproductiva y síntomas. Sirve para el respaldo entre dispositivos de la propia usuaria y para el modo pareja, que comparte solo la etapa y las fechas.
  3. **Salud y bienestar → información de actividad física:** pasos, pulso, sueño y temperatura leídos de Health Connect, solo si los activó. Sirve para el respaldo.

No declarar «cifrado de extremo a extremo»: el respaldo con clave propia quedó para después del lanzamiento.

## 4. Antes de enviar

- **Borrado de cuenta:** «Eliminar mi cuenta» borra los datos y después llama a `api/borrar-usuario` (función de Vercel), que verifica la sesión con la llave pública de Neon Auth y borra a esa usuaria con la API de Neon. Para que ande hace falta la variable `NEON_API_KEY` en el proyecto `cicloapp` de Vercel; sin ella responde «sin configurar» y la app sigue con el plan B (pedir el cierre por mail). Probado el 08/11/2026 en producción: sin clave responde 503, otra web 403, otro método 405.
- **Recompilar el paquete** con `compilar-savia.ps1` después de unir estos cambios. El paquete del 31/10 pide todavía el permiso que se sacó.
- **Probar en un Android real** que «Reloj y apps de salud» pide los 8 permisos y muestra los datos.

## 5. Textos de la ficha

- **Usar:** «Seguimiento del ciclo menstrual, recordatorio de pastillas, embarazo, posparto y menopausia, con privacidad».
- **Nunca usar:** «método anticonceptivo», «evitar el embarazo», «días seguros», «anticoncepción natural». La prueba `__tests__/metodos-y-auditoria.test.ts` revisa que el código y las páginas públicas no tengan esas frases.
- La ficha completa para pegar está en `docs/ficha-google-play.md`.
