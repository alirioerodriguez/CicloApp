# Savia en la App Store

Actualizada el 08/11/2026.

## Qué ya está hecho en el código

- **Iniciar sesión con Apple** (regla 4.8 de Apple: si la app ofrece Google, tiene que ofrecer Apple). En iPhone el botón aparece siempre, arriba del de Google. Es negro en modo claro y blanco en modo oscuro. Usa el mismo camino que Google: la app abre `cicloapp.vercel.app/?ingresoApp=apple` en una ventana segura del sistema, Neon Auth entra con Apple y la app recibe un código de un solo uso. En la web y en Android no se muestra hasta que pongas `EXPO_PUBLIC_APPLE_LOGIN=1`.
- **`app.json`**: `bundleIdentifier` `com.alirio.ciclo` (el mismo de Android), `buildNumber` 1, `ITSAppUsesNonExemptEncryption: false` (solo usa el cifrado HTTPS del sistema, así App Store Connect no pregunta por exportación en cada versión) y el manifiesto de privacidad con los motivos de las APIs que usan las librerías (preferencias, fechas de archivos, tiempo desde el arranque y espacio en disco).
- Ya estaban: Face ID, Apple Salud (solo lectura), widgets de iPhone, «Eliminar mi cuenta» desde la app, política de privacidad y aviso médico.
- **`eas.json`**: perfil `production` para compilar en la nube de Expo (no hace falta una Mac) y `submit` para mandarla a App Store Connect.

## Lo que te toca a ti

### 1. Decidir: persona o empresa
Apple pide que las apps de salud o con datos sensibles las publique una **persona jurídica** (regla 5.1.1 ix). Con una cuenta personal, Savia corre riesgo de rechazo. Lo recomendable es la cuenta de **organización**, que pide el número D-U-N-S (gratis, tarda unos días). Ver `guias/empresa.md` en el panel.

### 2. Cuenta de Apple Developer
developer.apple.com/programs → inscribirte y pagar la cuota anual (USD 99 según la página de Apple; confírmalo al pagar).

### 3. Identificadores en Apple Developer (Certificates, Identifiers & Profiles)
1. **App ID** `com.alirio.ciclo` con **HealthKit**, **App Groups** (para los widgets) y **Sign in with Apple** prendidos. Si EAS lo crea solo en el paso 6, igual entra después a prender Sign in with Apple.
2. **Services ID** (por ejemplo `com.alirio.ciclo.web`) con **Sign in with Apple** → **Configure**:
   - App ID principal: `com.alirio.ciclo`.
   - Domain: el host de Neon Auth del proyecto `savia` (lo muestra Neon en el paso 4).
   - Return URL: la que te muestra Neon en el paso 4 (termina en `/callback/apple`).
3. **Keys** → crear una clave con **Sign in with Apple** → descargar el `.p8` (se baja **una sola vez**) y anotar el **Key ID**. Anotar también tu **Team ID** (Membership).

Guarda el `.p8` junto a la llave de Android, fuera de GitHub.

### 4. Cargar Apple en Neon Auth
Neon Console → proyecto **savia** → rama principal → **Settings → Auth → OAuth providers → Add OAuth provider → Apple**:
- Client ID: el **Services ID**.
- Client secret: el contenido completo del `.p8`.
- Team ID y Key ID.

El mismo diálogo muestra la **Return URL** exacta para el paso 3.2. `cicloapp.vercel.app` ya está entre los dominios de confianza porque Google usa el mismo camino.

Guía oficial: https://neon.com/docs/auth/guides/setup-oauth#apple-setup

### 5. (Opcional) Probar Apple en la web
Vercel → proyecto **cicloapp** → Environment Variables → `EXPO_PUBLIC_APPLE_LOGIN` = `1` → Redeploy. Aparece el botón en cicloapp.vercel.app y puedes probarlo desde la compu antes de tener el iPhone.

### 6. Compilar y mandar a TestFlight
En la carpeta de CicloApp:

```bash
npx eas-cli@latest login
```

```bash
npx eas-cli@latest build -p ios --profile production
```

EAS te pide entrar con tu Apple ID y crea solo el certificado y el perfil. Cuando termina:

```bash
npx eas-cli@latest submit -p ios --latest
```

La versión llega a App Store Connect y, después de procesarse, a **TestFlight**.

### 7. Probar en un iPhone con TestFlight
Ingreso con Apple y con Google, Face ID, Apple Salud, notificaciones de la pastilla, widgets y «Eliminar mi cuenta».

### 8. Ficha en App Store Connect
- Textos, notas para el revisor y respuestas de App Privacy: `guias/app-store-textos.md` del panel (sección Savia).
- **Cuenta de prueba** para el revisor (un correo y contraseña de prueba, con datos de ejemplo).
- **Capturas de iPhone 6,9"** (obligatorias), con datos de ejemplo.
- Link a `https://cicloapp.vercel.app/privacidad.html`.
- Categoría Salud y forma física. Clasificación por edad: responder el cuestionario (tiene contenido médico y de sexualidad informativo).

### Palabras clave de App Store (campo «Keywords», máximo 100 caracteres)
`ciclo,menstrual,periodo,regla,embarazo,posparto,menopausia,pastillas,síntomas,privacidad`

- Van separadas por comas, sin espacios, y sin repetir el nombre ni la categoría (Apple ya los indexa).
- Dicen lo que hace la app (ciclo, embarazo, posparto, menopausia, pastillas) y nada más: no usar «anticonceptivo», «días seguros», «fertilidad» ni «evitar el embarazo» (ver `docs/google-play-declaracion-salud.md`, sección 5).
- La prueba `__tests__/palabras-clave-appstore.test.ts` revisa el largo y las palabras prohibidas.

### Para cada versión nueva
Subir `version` (o `ios.buildNumber`) en `app.json` antes de compilar: Apple no acepta dos builds con el mismo número.
