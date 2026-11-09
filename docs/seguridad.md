# Revisión de seguridad de Savia

Última revisión: 09/11/2026, sobre la web publicada (cicloapp.vercel.app), el proyecto `savia` de Neon y el código.

## Qué se probó y resultado

| Prueba | Resultado |
|---|---|
| Reglas de la base (RLS) en `ciclo_data` y `pareja` | ✅ Activas. Cada cuenta lee y cambia solo su fila; la pareja conectada solo puede **leer** el resumen. |
| Visitas sin sesión (rol `anonymous`) | ✅ Sin permisos: no leen ninguna tabla ni pueden canjear códigos (probado en la base real). |
| Sesión sin usuario válido | ✅ No ve ninguna fila. |
| Funciones con permisos elevados (`canjear_codigo_pareja`, `soltar_pareja`) | ✅ Solo para cuentas con sesión; toman la identidad del token. El canje exige código vigente (24 h) y que no sea el propio. |
| Función de Vercel `api/borrar-usuario` | ✅ Verifica la firma del token con las llaves públicas de Neon Auth (EdDSA), su vencimiento, y borra solo a quien llama. La clave de Neon vive solo en Vercel. |
| Claves secretas en la web publicada | ✅ No hay (se buscaron claves de Neon, cadenas de conexión y claves de Google/OpenAI en los archivos publicados). |
| Inserción de código (XSS) | ✅ React Native escapa todo; no hay `innerHTML` ni `eval` propios. |
| **Con una cuenta real** (sesión de Alirio, por el Data API publicado) | ✅ Leer todas las filas de `ciclo_data` y `pareja`: 0 ajenas (en la base hay filas de otras cuentas). Cambiar filas ajenas: 0 afectadas. Crear una fila a nombre de otra cuenta o pasarle la propia: rechazado (42501). Canjear un código falso o el propio: `null`. Sin sesión: rechazado. La fila de prueba de pareja se borró. |

## Qué se corrigió

1. **Código de pareja con azar seguro.** Se armaba con `Math.random`, que no es apto para secretos. Quien adivinara un código vigente vería el resumen del ciclo (fase y fechas). Ahora sale de `crypto.getRandomValues` (en el teléfono, por `src/polyfills.ts`) y hay una prueba que lo controla.
2. **Encabezados de seguridad en la web** (`vercel.json`): no se puede meter Savia dentro de otra página (anti-clickjacking), `nosniff`, y la dirección completa (que durante el ingreso con Google lleva un código de un solo uso) no viaja a otros sitios.

## Librerías (`npm audit`)

Marca 21 avisos, pero **ninguno afecta a la app en uso**:
- `better-auth`, `@better-auth/*`, `node-forge`: código de **servidor** de cuentas o de las herramientas de compilación. El servidor de cuentas lo corre Neon, no la app.
- `@expo/cli`, `glob`, `minimatch`, `@expo/*`: herramientas para compilar, no viajan en la app.
- `zod`: solo agota memoria con listas gigantes armadas a propósito; en la app valida datos propios.

`npm audit fix` cambiaba unas 4.000 líneas de dependencias para bajar de 21 a 17 avisos, con riesgo de romper la compilación de Android ya probada, así que no se aplicó. Conviene revisarlo al pasar a la próxima versión de Expo.

## Pendiente

- **Cargar `NEON_API_KEY` en Vercel** (proyecto `cicloapp`) para que «Eliminar mi cuenta» borre también el usuario de Neon Auth. Ver `docs/google-play-declaracion-salud.md`.
- **Orden del borrado:** la app borra primero sus filas y después llama a `api/borrar-usuario`. Si se corta en el medio queda la cuenta sin datos o, al revés, datos sin cuenta; la pantalla avisa y se puede reintentar. Sería más firme que la función de Vercel borre también las filas, pero para eso necesita una conexión a la base (otra clave) y no vale la pena por ahora.
- **El respaldo en la nube no está cifrado con una clave propia**: lo protege Neon (cifrado en disco y reglas por cuenta). La política de privacidad lo dice así.
- **Probar en un teléfono real** el ingreso, el borrado y el modo pareja con dos cuentas (el canje entre dos cuentas distintas todavía no se probó en vivo).

## Cómo repetir las pruebas

- Reglas: en el SQL Editor de Neon, `select * from pg_policies where schemaname = 'public';`.
- Sin sesión: `set role anonymous; select * from public.ciclo_data;` tiene que dar «permission denied».
- Encabezados: `curl -I https://cicloapp.vercel.app/`.
