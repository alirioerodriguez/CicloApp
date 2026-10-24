// Lo que en el navegador viene de fábrica y en el teléfono (Hermes) no: se carga antes que todo en index.js.
// La librería de cuentas de Neon llama a crypto.randomUUID() apenas se importa; sin esto la app se cierra al abrir.
import * as ExpoCrypto from 'expo-crypto';

interface CryptoMinimo {
  randomUUID?: () => string;
  getRandomValues?: typeof ExpoCrypto.getRandomValues;
}

const g = globalThis as unknown as { crypto?: CryptoMinimo };

// En el teléfono existe `window` pero no `window.location`, y la librería de cuentas la lee para los enlaces de los
// correos (recuperar contraseña, confirmar la cuenta) y al revisar la sesión. Se usa la dirección de la web de Savia,
// que es adonde deben volver esos enlaces. En la web no se toca.
const w = globalThis as unknown as { location?: Record<string, string> };
if (!w.location) {
  const origen = 'https://cicloapp.vercel.app';
  w.location = { origin: origen, href: `${origen}/`, protocol: 'https:', host: 'cicloapp.vercel.app', hostname: 'cicloapp.vercel.app', port: '', pathname: '/', search: '', hash: '' };
}

if (!g.crypto) g.crypto = {};
if (!g.crypto.randomUUID) g.crypto.randomUUID = () => ExpoCrypto.randomUUID();
if (!g.crypto.getRandomValues) g.crypto.getRandomValues = ExpoCrypto.getRandomValues;
