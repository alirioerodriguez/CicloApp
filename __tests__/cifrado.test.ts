import { describe, expect, it } from '@jest/globals';
import { aBase64, abrirLlave, cifrar, cifrarConLlave, crearLlave, deBase64, descifrar, descifrarConLlave, ErrorCifrado, esSobre, fraseValida } from '../src/lib/cifrado';

// scrypt barato SOLO para que las pruebas anden rápido: en la app el costo es 2^15.
const N = 2 ** 10;
const datos = { logs: { '2026-11-01': { flow: 2, note: 'cólicos fuertes 🌸' } }, settings: { onboarded: true } };

describe('cifrado del cliente (AES-256-GCM + scrypt)', () => {
  it('base64 ida y vuelta, con cualquier largo', () => {
    for (let n = 0; n < 20; n++) {
      const b = Uint8Array.from({ length: n }, (_, i) => (i * 37 + 11) & 255);
      expect(Array.from(deBase64(aBase64(b)))).toEqual(Array.from(b));
    }
    expect(aBase64(new TextEncoder().encode('Savia'))).toBe('U2F2aWE=');
  });

  it('cifra y descifra con la frase, y el sobre no deja ver el contenido', async () => {
    const sobre = await cifrar(datos, 'una frase larga y mía', 'archivo', N);
    expect(esSobre(sobre)).toBe(true);
    expect(JSON.stringify(sobre)).not.toMatch(/cólicos|2026-11-01|logs/);
    expect(await descifrar(sobre, 'una frase larga y mía', 'archivo')).toEqual(datos);
  });

  it('una frase equivocada no abre nada', async () => {
    const sobre = await cifrar(datos, 'una frase larga y mía', 'archivo', N);
    await expect(descifrar(sobre, 'otra frase distinta', 'archivo')).rejects.toMatchObject({ codigo: 'frase' });
  });

  it('si alguien cambia un solo byte del contenido, no abre (GCM detecta la alteración)', async () => {
    const sobre = await cifrar(datos, 'una frase larga y mía', 'archivo', N);
    const ct = deBase64(sobre.ct);
    ct[3] ^= 1;
    await expect(descifrar({ ...sobre, ct: aBase64(ct) }, 'una frase larga y mía', 'archivo')).rejects.toBeInstanceOf(ErrorCifrado);
  });

  it('un sobre de «nube» no se acepta como «archivo» (el contexto va atado al cifrado)', async () => {
    const llave = await crearLlave('una frase larga y mía', N);
    const deNube = cifrarConLlave(datos, llave, 'nube');
    expect(() => descifrarConLlave(deNube, llave, 'archivo')).toThrow(/no es de este tipo/);
    // y aunque se le cambie la etiqueta, el cifrado ya no coincide
    expect(() => descifrarConLlave({ ...deNube, ctx: 'archivo' }, llave, 'archivo')).toThrow(ErrorCifrado);
  });

  it('con la misma llave cada cifrado usa un nonce nuevo, y la sal se mantiene para poder reabrirlo', async () => {
    const llave = await crearLlave('una frase larga y mía', N);
    const a = cifrarConLlave(datos, llave, 'nube');
    const b = cifrarConLlave(datos, llave, 'nube');
    expect(a.nonce).not.toBe(b.nonce);
    expect(a.ct).not.toBe(b.ct);
    expect(a.salt).toBe(b.salt);
    // otra sesión: se reconstruye la llave con la frase y la sal del sobre
    const reabierta = await abrirLlave('una frase larga y mía', a);
    expect(descifrarConLlave(b, reabierta, 'nube')).toEqual(datos);
  });

  it('la misma frase con otra sal da otra clave', async () => {
    const x = await crearLlave('una frase larga y mía', N);
    const y = await crearLlave('una frase larga y mía', N);
    expect(Array.from(x.clave)).not.toEqual(Array.from(y.clave));
  });

  it('la frase se normaliza (NFKC): la misma frase escrita con otro teclado abre igual', async () => {
    const compuesta = 'contraseña larga'; // ñ en una sola pieza
    const descompuesta = 'contrasen\u0303a larga'; // n + tilde combinada
    const sobre = await cifrar(datos, compuesta, 'archivo', N);
    expect(await descifrar(sobre, descompuesta, 'archivo')).toEqual(datos);
  });

  it('frase muy corta: se rechaza antes de gastar tiempo', async () => {
    expect(fraseValida('corta')).toBe(false);
    expect(fraseValida('suficiente frase')).toBe(true);
    await expect(cifrar(datos, 'corta', 'archivo', N)).rejects.toMatchObject({ codigo: 'frase' });
  });

  it('rechaza sobres de otra versión o con parámetros absurdos (no se deja que un archivo pida scrypt gigante)', async () => {
    const sobre = await cifrar(datos, 'una frase larga y mía', 'archivo', N);
    await expect(descifrar({ ...sobre, v: 2 as never }, 'una frase larga y mía', 'archivo')).rejects.toMatchObject({ codigo: 'version' });
    await expect(descifrar({ ...sobre, N: 2 ** 30 }, 'una frase larga y mía', 'archivo')).rejects.toMatchObject({ codigo: 'formato' });
    await expect(descifrar({ ...sobre, ct: '***' }, 'una frase larga y mía', 'archivo')).rejects.toMatchObject({ codigo: 'formato' });
    expect(esSobre({ logs: {} })).toBe(false);
  });

  it('con el costo real (2^15) la clave se deriva y funciona', async () => {
    const sobre = await cifrar({ ok: 1 }, 'una frase larga y mía', 'archivo');
    expect(sobre.N).toBe(2 ** 15);
    expect(await descifrar(sobre, 'una frase larga y mía', 'archivo')).toEqual({ ok: 1 });
  }, 60000);
});
