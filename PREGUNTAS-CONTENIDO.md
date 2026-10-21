# Preguntas para alimentar la app "Ciclo"

> **Cómo usar este archivo**
> - **Parte A** la respondes tú: son decisiones sobre la app que ningún Claude puede tomar por ti.
> - **Parte B** es para el otro Claude: adjunta este archivo y pídele: *"Responde la Parte B siguiendo las reglas y el formato de entrega"*.
> - Cuando tengas las dos partes respondidas, pégalas en esta conversación y las cargo en la app.

---

## Contexto de la app (para el otro Claude)

App móvil (Android + iPhone) de seguimiento del ciclo menstrual, para cualquier mujer que quiera usarla, pensada primero para Venezuela y Latinoamérica. Datos 100 % locales. La interfaz está en **español neutro venezolano, tuteando** ("tú", no "vos" ni "usted"). Tono cálido, cercano y cariñoso, **nunca médico ni alarmista**.

Lo que ya tiene:
- **Registro diario:** flujo (0–4), dolor (0–10), ánimos, síntomas, nota, agua, sueño y pastilla tomada.
- **Predicción:** promedio de los últimos 6 ciclos; ovulación estimada 14 días antes del próximo período; ventana fértil de ovulación −5 a +1. Con pastilla no se muestran días fértiles.
- **Fases:** menstrual, folicular, ovulatoria, lútea, y un modo "pastilla" (sin fases hormonales).
- **"Cuídate hoy":** por fase muestra un resumen, una recomendación, un mimo (comida o autocuidado) y una frase.
- **"Alimentación":** lista de alimentos con su "por qué", con categorías y fases.
- **Recordatorios:** pastilla, blíster nuevo o descanso, período próximo, agua y respaldo.
- **Estadísticas y resumen PDF** para la ginecóloga.

### Reglas para quien responda la Parte B
1. Usa información respaldada (guías de ACOG, NHS, OMS, Mayo Clinic, revisiones Cochrane o estudios revisados por pares). **Cita la fuente de cada afirmación de salud** con nombre y, si puedes, enlace.
2. Si la evidencia es débil o mixta, dilo ("evidencia limitada") o no lo incluyas.
3. Nada de diagnósticos ni dosis de medicamentos. Como mucho: "consúltalo con tu médico" o "revisa el prospecto".
4. Usa vocabulario venezolano para alimentos: cambur, caraotas, auyama, patilla, lechosa, etc.
5. Textos cortos: recomendaciones de 1–2 frases (máx. ~160 caracteres) y frases motivacionales de máx. ~70 caracteres.
6. Entrega **exactamente en el formato** de la sección "Formato de entrega" (al final), para poder copiarlo directo al código.

---

## PARTE A — Decisiones sobre la app (las respondes tú)

### A1. Público y tono
1. ¿Para qué países es? ¿Solo Venezuela, o Latinoamérica en general? (Cambia el vocabulario: cambur/banano, caraotas/frijoles, patilla/sandía).
2. ¿Qué rango de edad esperas? ¿Adolescentes también? (Cambia qué tan "regular" se espera el ciclo y el tono).
3. ¿Mensajes más tiernos, más graciosos o más neutros?
4. ¿Hay palabras, emojis o colores que quieras evitar?

### A2. Qué se registra
5. ¿Falta algún síntoma o ánimo en la lista actual? Ánimos: feliz, tranquila, con energía, cansada, irritable, sensible, triste, ansiosa, con dolor. Síntomas: cólicos, dolor de cabeza, espalda, acné, hinchazón, náuseas, antojos, pechos sensibles, insomnio, flujo vaginal, digestión, mareo.
6. ¿Agregamos más registros? (temperatura basal, relaciones sexuales, ejercicio, peso, analgésicos tomados, café…)
7. ¿Agregamos modos para condiciones frecuentes? (SOP, endometriosis, embarazo, perimenopausia, lactancia)

### A3. Anticonceptivos
8. Además de la pastilla, ¿quieres soportar otros métodos? (DIU, implante, inyección mensual o trimestral, anillo, parche)
9. ¿Quieres diferenciar pastilla combinada de pastilla de solo progestágeno?

### A4. Recordatorios
10. ¿Valores por defecto? (hora del aviso de período, días de anticipación, horas de agua)
11. ¿Quieres mensajes de ánimo en días especiales? (por ejemplo, el primer día del período)

### A5. Publicación
12. ¿Cómo se va a distribuir? ¿APK compartido, Play Store, App Store o las tres?
13. ¿Tienes cuenta de Google Play Console (25 USD, pago único) y/o Apple Developer (99 USD al año)?
14. ¿Nombre final de la app y descripción del ícono? (flor, luna, gota…)
15. ¿Qué nombre o marca aparece como desarrollador, y qué correo de contacto? (Las tiendas lo piden, junto con una política de privacidad).
16. ¿La app será gratis? ¿Con donaciones, con versión de pago o sin monetizar? (Recomendación: sin anuncios, por privacidad).

---

## PARTE B — Preguntas de investigación (para el otro Claude)

### B1. Contenido de "Cuídate hoy" por fase
Para **cada fase**: menstrual, folicular, ovulatoria, lútea y "con pastilla".

1. Un **resumen** de 1–2 frases sobre qué pasa en el cuerpo y cómo puede sentirse, en lenguaje simple.
2. **8 recomendaciones** prácticas del día (descanso, movimiento, alivio, hidratación, organización, social), con fuente cuando hablen de salud.
3. **8 mimos**: comida o autocuidado concreto y realizable en casa, con un emoji cada uno.
4. **10 frases** cortas, cálidas y no cursis. Que no sean frases célebres con copyright.
5. Para "con pastilla": qué es normal sentir los primeros meses, qué hacer si olvida una (en términos generales, remitiendo al prospecto) y qué es el sangrado por deprivación.

### B2. Alivio del dolor menstrual (dismenorrea)
6. ¿Qué medidas **sin medicamentos** tienen evidencia para aliviar los cólicos? (calor local, ejercicio, jengibre, magnesio, omega-3, TENS, yoga…). Para cada una: nivel de evidencia y fuente.
7. ¿Qué medidas populares **no** tienen evidencia y conviene no recomendar?
8. ¿Cuáles son las **señales de alerta** para sugerir consultar a la ginecóloga? (dolor que impide la vida normal, sangrado muy abundante, ciclos < 21 o > 35 días, sangrado entre períodos, etc.). Dame umbrales concretos con fuente.

### B3. Alimentación
9. Revisa y corrige esta lista actual. Para cada uno: ¿la afirmación del "por qué" es correcta? ¿En qué fase tiene más sentido? Lista: jengibre, chocolate oscuro, sardinas/atún/salmón, espinaca, lentejas y caraotas, carne roja magra o hígado, naranja/kiwi/guayaba, cambur, semillas de auyama, aguacate, moras y frutos rojos, almendras y nueces, batata, huevos, avena, pepino y patilla, manzanilla, cúrcuma, yogur natural, agua.
10. Agrega **15 alimentos más** fáciles de conseguir en Venezuela (por ejemplo: lechosa, mango, plátano, sardina enlatada, caraotas negras, ocumo, quinchoncho, parchita, auyama, ají dulce, guayaba, papelón con limón…), cada uno con un "por qué" de una frase y su fuente.
11. ¿Qué alimentos o bebidas conviene **moderar** en cada fase y por qué? (sal, cafeína, alcohol, azúcar)
12. ¿Qué combinaciones mejoran la absorción del hierro y cuáles la empeoran? (vitamina C, té o café con la comida, calcio)
13. ¿Hay algún alimento a evitar si toma anticonceptivos orales? (por ejemplo, hierba de San Juan, toronja)

### B4. Síntomas y ánimos
14. Propón la lista ideal de **síntomas** para registrar (máx. 16), con un emoji claro para cada uno, priorizando lo más útil para llevarle a la ginecóloga.
15. Propón la lista ideal de **ánimos** (máx. 10) con emoji.
16. ¿Qué síntomas son típicos de cada fase? (para que la app diga "es común sentir X en esta fase")
17. ¿Qué es el síndrome premenstrual (SPM) y el TDPM, y a partir de qué patrón conviene sugerir hablarlo con un médico? (en lenguaje simple, sin diagnosticar)

### B5. Predicción y fertilidad
18. ¿Qué tan preciso es estimar la ovulación como "14 días antes del próximo período"? ¿Cuál es la variación real de la fase lútea?
19. ¿Cuántos ciclos registrados hacen falta para que un promedio sea confiable?
20. ¿Cuál es el rango normal de duración del ciclo y del período en adultas, según ACOG o FIGO?
21. ¿Cuántos días de diferencia entre ciclos se considera "regular"?
22. Redacta un **aviso corto** (máx. 140 caracteres) que deje claro que la app no sirve como anticonceptivo.
23. Si toma pastilla, ¿tiene algún sentido mostrar fases o fertilidad? (para confirmar que es correcto ocultarlas)

### B6. Pastillas anticonceptivas
24. ¿Cuáles son las **pastillas más comunes en Venezuela** (nombre comercial) y qué esquema tiene cada una? (21/7, 21+7 placebo, 24/4, 28 continua)
25. Para cada esquema, ¿cuándo suele aparecer el sangrado de deprivación?
26. Escribe mensajes de recordatorio para: hora de la pastilla, mañana empieza el descanso, mañana empieza un blíster nuevo y "parece que olvidaste la de ayer" (este último remitiendo al prospecto, sin instrucciones médicas).
27. ¿Qué cosas pueden reducir su eficacia y valdría la pena mencionar? (vómitos o diarrea, algunos antibióticos o anticonvulsivos, hierba de San Juan)

### B7. Textos de la app
28. Escribe **20 mensajes de notificación** variados y cariñosos: período próximo (5), agua (5), pastilla (5) y respaldo de datos (5). Máx. ~80 caracteres cada uno.
29. Escribe **12 saludos** para la pantalla "Hoy" según el momento (mañana, tarde, noche) y el estado (con período, sin período, retraso).
30. Escribe textos para los **estados vacíos**: sin datos en estadísticas, primer día de uso y primer ciclo completado (celebración).
31. Escribe **5 mensajes de "logro"**: 7 días seguidos registrando, primer ciclo completo, 30 días de pastilla sin olvidos, 3 meses usando la app y primer respaldo.

### B8. Ideas de funciones
32. ¿Qué funciones de apps de ciclo populares son más valoradas por las usuarias y cuáles se critican? (privacidad, notificaciones invasivas, lenguaje infantil…)
33. ¿Qué datos le resultan más útiles a una ginecóloga en un resumen de ciclo? (para mejorar el PDF)
34. Propón **10 funciones extra** que encajen con una app privada, local y de regalo, ordenadas de más a menos valiosas.

---

## Formato de entrega (para el otro Claude)

Responde con estos bloques, en este orden. Usa **exactamente** estos encabezados y formatos de código, sin texto extra dentro de los bloques.

### 1. `cuidate` (B1)
```ts
menstrual: {
  resumen: '...',
  recomendaciones: ['...', '...'],
  mimos: [{ emoji: '🛁', texto: '...' }],
  frases: ['...'],
},
// igual para folicular, ovulatoria, lutea, pastilla
```

### 2. `alimentos` (B3)
```ts
{ emoji: '🍌', nombre: 'Cambur', porque: '...', categorias: ['hinchazon','animo'], fases: ['lutea','menstrual'] },
```
- Categorías válidas: `dolor`, `hierro`, `antiinflamatorio`, `hinchazon`, `animo`, `energia` (puedes proponer nuevas aparte).
- Fases válidas: `menstrual`, `folicular`, `ovulatoria`, `lutea`, `pastilla`.

### 3. `catalogo` (B4)
```ts
SINTOMAS: [{ id: 'colicos', emoji: '🌀', label: 'Cólicos' }],
ANIMOS:   [{ id: 'feliz', emoji: '😊', label: 'Feliz' }],
```

### 4. `textos` (B5 aviso, B6.26, B7)
Lista en Markdown agrupada por tipo.

### 5. `alertas` (B2.8, B4.17, B5.20–21)
Tabla: señal | umbral | mensaje sugerido para la app | fuente.

### 6. `pastillas` (B6.24–25)
Tabla: marca | esquema | sangrado esperado | fuente.

### 7. `fuentes`
Lista numerada de todas las fuentes citadas.

### 8. `ideas` (B8)
Lista breve y ordenada.
