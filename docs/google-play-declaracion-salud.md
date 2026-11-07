# Google Play Console — qué responder para Savia

Borrador para completar antes de mandar la app a revisión. Todo tiene que coincidir con la política pública de privacidad (cicloapp.vercel.app) y con lo que hace el código. Revisar con la abogada antes de enviar.

## 1. Declaración de apps de salud
En **Política y programas → Contenido de la app → Apps de salud**, marcar solo:
- Seguimiento del ciclo menstrual y la fertilidad.
- Actividad física y sueño, solo si se mantiene el permiso opcional de Health Connect.

No marcar «Dispositivo médico» ni «Anticoncepción».

### Justificación de los permisos de Health Connect (para pegar)
> Savia permite, de forma opcional, sincronizar con Health Connect el registro de menstruación, los síntomas, las horas de sueño y la actividad, para que la usuaria vea en un mismo calendario cómo su ciclo, su posparto o su perimenopausia se relacionan con su descanso. Está desactivado por defecto, necesita una acción explícita de la usuaria y los datos nunca se usan para publicidad ni se comparten con terceros.

Cada uno de los 9 permisos tiene que tener su uso visible en la app (estados/savia.md lo marca como pendiente).

## 2. Seguridad de los datos (Data Safety)
- **¿Recopila o comparte datos?** Sí, solo si la usuaria crea una cuenta para el respaldo en la nube o el modo pareja.
- **¿Comparte datos con terceros?** No. Ningún dato se vende ni va a redes de publicidad.
- **¿Cifrado en tránsito?** Sí (HTTPS hacia Neon y Vercel).
- **¿Se pueden borrar los datos?** Sí: en la app, Perfil → «Eliminar mi cuenta»; en la web, la URL pública de borrado (falta publicarla).
- **Tipos de datos** (todos opcionales, solo con cuenta):
  1. Información personal → correo electrónico, para entrar a la cuenta.
  2. Salud y bienestar → salud reproductiva, para el respaldo entre dispositivos de la propia usuaria y el modo pareja.

No declarar «cifrado de extremo a extremo»: el respaldo con clave propia quedó para después del lanzamiento.

## 3. Textos de la ficha
- **Usar:** «Seguimiento del ciclo menstrual, recordatorio de pastillas, embarazo, posparto y menopausia, con privacidad».
- **Nunca usar:** «método anticonceptivo», «evitar el embarazo», «días seguros», «anticoncepción natural». La prueba `__tests__/metodos-y-auditoria.test.ts` revisa que el código no tenga esas frases.
