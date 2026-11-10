# Lanzamiento de Savia

Escrito el 10/11/2026. Mensaje central, textos listos para pegar y cómo juntar a las testers que pide Google Play.

## El mensaje central

**Tu ciclo es tuyo. Sin anuncios, sin vender tus datos.**

Por qué este mensaje: las apps de ciclo más conocidas tuvieron problemas públicos de privacidad. Savia funciona sin cuenta (nada sale del teléfono), no tiene publicidad ni herramientas de seguimiento, y la cuenta es opcional, solo para no perder los datos.

Tres cosas para repetir siempre, con estas palabras:
1. Puedes usarla **sin crear una cuenta**: todo queda en tu teléfono.
2. **Sin anuncios y sin vender tus datos.** Nunca.
3. Te acompaña en **cada etapa**: ciclo, pastilla, embarazo, posparto y menopausia.

Qué no decir nunca: «anticonceptivo», «días seguros», «evitar el embarazo», «100 % privada» (con cuenta hay una copia en EE. UU., y lo decimos).

## Las testers que pide Google Play (paso obligatorio)

Con una cuenta personal de Play Console, antes de publicar hace falta una **prueba cerrada con al menos 12 testers que tengan la app instalada 14 días seguidos** ([Google, requisitos de prueba](https://support.google.com/googleplay/android-developer/answer/14151465), consultado el 31/10/2026). Conviene invitar a 20, porque siempre alguna se baja.

Cómo:
1. En Play Console: **Probar y publicar → Pruebas → Prueba cerrada → Crear pista**. Subir el `.aab` de `Documents\Android-apps\savia\`.
2. En **Testers**, crear una lista con los Gmail de las testers (tienen que ser cuentas de Google).
3. Copiar el **enlace para unirse** y mandarlo con el mensaje de abajo.
4. Contar 14 días desde que la número 12 la instaló. Después se pide el acceso a producción (Google hace unas preguntas sobre la prueba: las respuestas de «Ayúdanos a mejorar» y «Queremos escucharte» sirven).

Dónde buscarlas, en tres anillos: amigas y familia en Venezuela; la diáspora (grupos de WhatsApp de venezolanas en Argentina, Colombia, Chile, España); pacientes de una ginecóloga aliada.

### Mensaje para invitar (WhatsApp)

> ¡Hola! 🌸 Estoy por lanzar **Savia**, una app para llevar tu ciclo, la pastilla, el embarazo o la menopausia. Es gratis, sin anuncios y no vende tus datos: puedes usarla sin crear cuenta y todo queda en tu teléfono.
>
> Google me pide que 12 personas la prueben 14 días antes de publicarla. ¿Me ayudas? Solo tienes que:
> 1. Entrar a este enlace con tu Gmail: [ENLACE DE PLAY]
> 2. Tocar «Unirme» e instalarla.
> 3. Dejarla instalada al menos 14 días y usarla cuando quieras.
>
> Si algo no te gusta o se te ocurre una idea, en Perfil → «Queremos escucharte» me llega directo. ¡Gracias! 💗

### Recordatorio a los 7 días

> ¡Hola! Pasó una semana con Savia 🌸 Gracias por tenerla instalada: faltan 7 días. Si puedes, entra a Perfil → «Ayúdanos a mejorar» y haz las misiones cortas (5 minutos). Me ayuda muchísimo.

## Posts de lanzamiento

### Instagram / Facebook (cuando esté en producción)

> **Tu ciclo es tuyo.** 🌸
>
> Presentamos Savia: una app para acompañarte en cada etapa, del ciclo a la menopausia.
> ✔️ Sin anuncios
> ✔️ Sin vender tus datos
> ✔️ Puedes usarla sin cuenta: todo queda en tu teléfono
> ✔️ Recordatorio de la pastilla, embarazo semana a semana, posparto y menopausia
>
> Gratis en Google Play. Enlace en la bio.
>
> #Savia #SaludFemenina #CicloMenstrual #Privacidad

### Historia corta (3 pantallas)

1. «¿Sabes quién ve los datos de tu app de ciclo?»
2. «En Savia, nadie. Sin cuenta, todo queda en tu teléfono. Sin anuncios, sin vender tus datos.»
3. «Savia. Tu ciclo es tuyo. Gratis en Google Play.»

## Antes de anunciar

- [ ] La prueba cerrada terminó y Google dio acceso a producción.
- [ ] La declaración de apps de salud está cargada en Play Console (`docs/google-play-declaracion-salud.md`).
- [ ] Probado en un Android real: aviso de la pastilla, foto de perfil, «Queremos escucharte».
- [ ] La política de privacidad publicada coincide con la versión que se sube.
