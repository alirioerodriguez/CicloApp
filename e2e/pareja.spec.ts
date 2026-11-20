// Modo pareja de punta a punta, en la web real y con dos usuarias (cada una en su propio navegador, como dos teléfonos).
// Ana crea el código en «Tu red de apoyo»; Luis lo escribe en «Acompañar a mi pareja».
// El backend es el Neon falso de e2e/neon-falso.ts (misma lógica que neon/pareja.sql), así que no hay claves ni cuentas reales.
import { expect, test, type Browser, type Page } from '@playwright/test';
import { NeonFalso, type Usuario } from './neon-falso';

const HOY = '2026-11-14T15:00:00Z'; // día 19 del ciclo de Ana (empezó el 27/10): fase lútea
const NOTA_PRIVADA = 'NOTA-SECRETA-DE-ANA';

// Tres ciclos de 28 días con período de 5, y en cada día de sangrado todo lo privado que Savia guarda.
function datosDeAna() {
  const logs: Record<string, unknown> = {};
  for (const inicio of ['2026-09-01', '2026-09-29', '2026-10-27']) {
    const base = new Date(`${inicio}T12:00:00Z`);
    for (let i = 0; i < 5; i++) {
      const iso = new Date(base.getTime() + i * 86400000).toISOString().slice(0, 10);
      logs[iso] = { date: iso, flow: 3, intimidad: true, note: NOTA_PRIVADA, symptoms: ['colicos'], moods: ['triste'] };
    }
  }
  return {
    settings: { onboarded: true, name: 'Ana', red: { on: true, nombre: 'Luis', compartir: ['fase', 'energia', 'periodo', 'ayuda'], enVivo: false } },
    logs,
  };
}
const datosDeLuis = () => ({ settings: { onboarded: true, name: 'Luis' }, logs: {} });

// Un navegador nuevo = un teléfono, con la sesión de esa usuaria ya abierta (el ingreso con correo se prueba aparte).
async function abrirComo(browser: Browser, neon: NeonFalso, u: Usuario, datos: object): Promise<Page> {
  const context = await browser.newContext({ locale: 'es-VE' });
  await context.clock.setFixedTime(new Date(HOY));
  await context.addInitScript(
    ([clave, valor, region]) => {
      if (!localStorage.getItem(clave)) localStorage.setItem(clave, valor);
      if (!localStorage.getItem('savia:region')) localStorage.setItem('savia:region', region); // ya eligió país e idioma
    },
    [`ciclo:data:v1:${u.id}`, JSON.stringify(datos), JSON.stringify({ pais: 'VE', idioma: 'es', elegido: true })] as const,
  );
  await neon.instalar(context, u);
  const page = await context.newPage();
  page.on('dialog', (d) => d.accept()); // los «¿Seguro?» del navegador
  await page.goto('/');
  await expect(page.getByRole('textbox', { name: 'Correo' })).toHaveCount(0);
  await expect(page.getByText('Usar Savia sin cuenta')).toHaveCount(0);
  return page;
}

// Ana: Perfil › Tu red de apoyo › Crear código. Devuelve el código tal como lo ve ella en pantalla («ABCD-EFGH»).
async function crearCodigo(ana: Page): Promise<string> {
  await ana.goto('/red');
  await ana.getByRole('button', { name: 'Crear código para mi pareja' }).click();
  const codigo = ana.getByText(/^[A-Z2-9]{4}-[A-Z2-9]{4}$/);
  await expect(codigo).toBeVisible();
  return (await codigo.innerText()).trim();
}

// Luis: Acompañar a mi pareja › escribe el código › Conectar.
async function canjear(page: Page, codigo: string) {
  await page.goto('/acompanar');
  await page.getByPlaceholder('ABCD-EFGH').fill(codigo);
  await page.getByRole('button', { name: 'Conectar' }).click();
}

const SIN_CODIGO = 'Ese código no existe o ya venció. Pídele uno nuevo.';

test.describe('Modo pareja', () => {
  let neon: NeonFalso;
  let ana: Usuario;
  let luis: Usuario;

  test.beforeEach(() => {
    neon = new NeonFalso();
    ana = neon.crearUsuario('ana@ejemplo.test');
    luis = neon.crearUsuario('luis@ejemplo.test');
  });

  test('Ana genera el código y Luis lo canjea: Luis ve el ciclo de Ana', async ({ browser }) => {
    const paginaAna = await abrirComo(browser, neon, ana, datosDeAna());
    const codigo = await crearCodigo(paginaAna);

    // El código vale 24 horas y se guarda en la fila de Ana, todavía sin pareja.
    expect(neon.pareja).toHaveLength(1);
    expect(neon.pareja[0]).toMatchObject({ owner_id: ana.id, pareja_id: null, codigo: codigo.replace('-', '') });

    const paginaLuis = await abrirComo(browser, neon, luis, datosDeLuis());
    await canjear(paginaLuis, codigo);

    // Luis ve a Ana: nombre, fase, día del ciclo y cuándo viene el período (del 27/10 con ciclos de 28 días: 24/11).
    await expect(paginaLuis.getByText('Ana está en su fase lútea')).toBeVisible();
    await expect(paginaLuis.getByText('Día 19 de su ciclo')).toBeVisible();
    await expect(paginaLuis.getByText(/Su período llegaría en 10 días/)).toBeVisible();
    await expect(paginaLuis.getByText('TU MISIÓN DE HOY')).toBeVisible();

    // El código se gastó: la fila quedó conectada con Luis y sin código.
    expect(neon.pareja[0]).toMatchObject({ pareja_id: luis.id, codigo: null, codigo_expira: null });

    // Ana lo ve conectado al revisar.
    await paginaAna.goto('/red');
    await expect(paginaAna.getByText(/Conectada\. Luis ve tu resumen/)).toBeVisible();
  });

  test('Luis nunca ve lo privado de Ana: ni lo que viaja, ni lo que se guarda, ni lo que se muestra', async ({ browser }) => {
    const paginaAna = await abrirComo(browser, neon, ana, datosDeAna());
    const codigo = await crearCodigo(paginaAna);
    const paginaLuis = await abrirComo(browser, neon, luis, datosDeLuis());
    await canjear(paginaLuis, codigo);
    await expect(paginaLuis.getByText('Ana está en su fase lútea')).toBeVisible();

    // Ana sí guarda lo privado en su respaldo (la prueba tiene que poder distinguirlo)…
    await expect.poll(() => JSON.stringify(neon.ciclo.find((f) => f.user_id === ana.id) ?? {})).toContain(NOTA_PRIVADA);

    // …pero lo que Ana comparte es un resumen con estas claves y nada más.
    const resumen = neon.pareja[0].resumen as Record<string, unknown>;
    expect(Object.keys(resumen).sort()).toEqual(['ciclo', 'compartir', 'etapa', 'fpp', 'nacimiento', 'nombre', 'v']);
    expect(Object.keys(resumen.ciclo as object).sort()).toEqual(['inicio', 'largo', 'rango', 'sangrado']);
    expect(resumen.compartir).toEqual(['fase', 'energia', 'periodo', 'ayuda']); // sin «intimidad» ni nada fuera de la lista

    const privado = [NOTA_PRIVADA, 'colicos', 'triste', 'intimidad', 'logs'];
    const textoDe = (x: unknown) => JSON.stringify(x);

    // Todo lo que Neon le contestó a Luis.
    const aLuis = neon.pedidos.filter((p) => p.quien === luis.id);
    expect(aLuis.length).toBeGreaterThan(0);
    for (const p of aLuis) for (const palabra of privado) expect(textoDe(p.respuesta), `${p.metodo} ${p.ruta} → ${palabra}`).not.toContain(palabra);
    // Luis nunca pidió el respaldo de nadie que no fuera él.
    expect(aLuis.filter((p) => p.ruta.includes('ciclo_data') && p.consulta.includes(ana.id))).toHaveLength(0);

    // Lo que quedó guardado en el teléfono de Luis y lo que ve en pantalla.
    const guardado = await paginaLuis.evaluate(() => JSON.stringify({ ...localStorage }));
    for (const palabra of [NOTA_PRIVADA, 'colicos', 'triste']) expect(guardado).not.toContain(palabra);
    const pantalla = await paginaLuis.locator('body').innerText();
    for (const palabra of [NOTA_PRIVADA, 'colicos', 'triste']) expect(pantalla).not.toContain(palabra);

    // Aunque Luis lo intente a mano con su propia sesión, la base no le da el respaldo de Ana.
    const token = await tokenDe(paginaLuis);
    const robo = await paginaLuis.evaluate(async ([usuario, token]) => {
      const r = await fetch(`https://ep-old-bar-b5e0wyej.apirest.c-7.us-east-2.aws.neon.tech/neondb/rest/v1/ciclo_data?select=data&user_id=eq.${usuario}`, { headers: { Authorization: `Bearer ${token}` } });
      return { status: r.status, cuerpo: await r.text() };
    }, [ana.id, token] as const);
    expect(robo.cuerpo).not.toContain(NOTA_PRIVADA);
    expect(robo.cuerpo).toBe('[]');
  });

  test('si Ana no comparte la fase ni el período, Luis no ve ciclo', async ({ browser }) => {
    const datos = datosDeAna();
    datos.settings.red.compartir = ['ayuda'];
    const paginaAna = await abrirComo(browser, neon, ana, datos);
    const codigo = await crearCodigo(paginaAna);
    const paginaLuis = await abrirComo(browser, neon, luis, datosDeLuis());
    await canjear(paginaLuis, codigo);

    await expect(paginaLuis.getByText('TU MISIÓN DE HOY')).toBeVisible();
    await expect(paginaLuis.getByText(/Día \d+ de su ciclo/)).toHaveCount(0);
    await expect(paginaLuis.getByText(/Su período/)).toHaveCount(0);
    expect((neon.pareja[0].resumen as { ciclo: unknown }).ciclo).toBeNull();
  });

  test('un código ya usado no funciona (ni para otra persona ni para el mismo Luis)', async ({ browser }) => {
    const paginaAna = await abrirComo(browser, neon, ana, datosDeAna());
    const codigo = await crearCodigo(paginaAna);
    const paginaLuis = await abrirComo(browser, neon, luis, datosDeLuis());
    await canjear(paginaLuis, codigo);
    await expect(paginaLuis.getByText('Ana está en su fase lútea')).toBeVisible();

    // Otra persona intenta con el mismo código.
    const marta = neon.crearUsuario('marta@ejemplo.test');
    const paginaMarta = await abrirComo(browser, neon, marta, datosDeLuis());
    await canjear(paginaMarta, codigo);
    await expect(paginaMarta.getByText(SIN_CODIGO)).toBeVisible();
    await expect(paginaMarta.getByText('Ana está')).toHaveCount(0);
    // La conexión de Luis sigue siendo de Luis.
    expect(neon.pareja[0].pareja_id).toBe(luis.id);

    // Luis suelta la conexión y vuelve a escribir el mismo código: tampoco sirve.
    await paginaLuis.getByRole('button', { name: 'Dejar de acompañar' }).click();
    await canjear(paginaLuis, codigo);
    await expect(paginaLuis.getByText(SIN_CODIGO)).toBeVisible();
  });

  test('un código vencido (más de 24 horas) no funciona', async ({ browser }) => {
    const paginaAna = await abrirComo(browser, neon, ana, datosDeAna());
    const codigo = await crearCodigo(paginaAna);
    const paginaLuis = await abrirComo(browser, neon, luis, datosDeLuis());

    neon.adelantarHoras(25);
    await canjear(paginaLuis, codigo);

    await expect(paginaLuis.getByText(SIN_CODIGO)).toBeVisible();
    await expect(paginaLuis.getByText('Ana está')).toHaveCount(0);
    expect(neon.pareja[0].pareja_id).toBeNull();
  });

  test('un código que no existe, o el de uno mismo, no funciona', async ({ browser }) => {
    const paginaAna = await abrirComo(browser, neon, ana, datosDeAna());
    const codigo = await crearCodigo(paginaAna);

    // Ana intenta canjear su propio código.
    await canjear(paginaAna, codigo);
    await expect(paginaAna.getByText(SIN_CODIGO)).toBeVisible();

    const paginaLuis = await abrirComo(browser, neon, luis, datosDeLuis());
    await canjear(paginaLuis, 'ZZZZ-ZZZZ');
    await expect(paginaLuis.getByText(SIN_CODIGO)).toBeVisible();
    await paginaLuis.getByPlaceholder('ABCD-EFGH').fill('ABC');
    await paginaLuis.getByRole('button', { name: 'Conectar' }).click();
    await expect(paginaLuis.getByText('El código tiene 8 letras y números.')).toBeVisible();
    expect(neon.pareja[0].pareja_id).toBeNull();
  });

  test('si Luis deja de acompañar, pierde el acceso', async ({ browser }) => {
    const paginaAna = await abrirComo(browser, neon, ana, datosDeAna());
    const codigo = await crearCodigo(paginaAna);
    const paginaLuis = await abrirComo(browser, neon, luis, datosDeLuis());
    await canjear(paginaLuis, codigo);
    await expect(paginaLuis.getByText('Ana está en su fase lútea')).toBeVisible();

    await paginaLuis.getByRole('button', { name: 'Dejar de acompañar' }).click();

    // Vuelve a la pantalla de escribir código y no queda nada de Ana en el teléfono.
    await expect(paginaLuis.getByPlaceholder('ABCD-EFGH')).toBeVisible();
    expect(await paginaLuis.evaluate(() => localStorage.getItem('savia:pareja'))).toBeNull();
    expect(neon.pareja[0].pareja_id).toBeNull();

    // Aunque recargue, la base ya no le muestra el resumen.
    await paginaLuis.reload();
    await expect(paginaLuis.getByText('Ana está')).toHaveCount(0);
    const lecturas = neon.pedidos.filter((p) => p.quien === luis.id && p.ruta.endsWith('/pareja') && p.metodo === 'GET' && p.consulta.includes(`pareja_id=eq.${luis.id}`));
    for (const l of lecturas.slice(-1)) expect(l.respuesta).toBe('[]');

    // Ana ya no figura como conectada y puede crear un código nuevo.
    await paginaAna.goto('/red');
    await expect(paginaAna.getByText(/Conectada/)).toHaveCount(0);
  });

  test('si Ana deja de compartir, Luis pierde el acceso y se le avisa', async ({ browser }) => {
    const paginaAna = await abrirComo(browser, neon, ana, datosDeAna());
    const codigo = await crearCodigo(paginaAna);
    const paginaLuis = await abrirComo(browser, neon, luis, datosDeLuis());
    await canjear(paginaLuis, codigo);
    await expect(paginaLuis.getByText('Ana está en su fase lútea')).toBeVisible();

    await paginaAna.goto('/red');
    await paginaAna.getByRole('button', { name: 'Dejar de compartir' }).click();
    await expect.poll(() => neon.pareja.length).toBe(0);

    await paginaLuis.goto('/acompanar');
    await expect(paginaLuis.getByText('Tu pareja dejó de compartir su resumen contigo.')).toBeVisible();
    await expect(paginaLuis.getByText('Ana está')).toHaveCount(0);
    expect(await paginaLuis.evaluate(() => localStorage.getItem('savia:pareja'))).toBeNull();
  });
});

test('ingreso con correo y contraseña (la base de todo lo demás)', async ({ browser }) => {
  const neon = new NeonFalso();
  const luis = neon.crearUsuario('luis@ejemplo.test');
  const context = await browser.newContext({ locale: 'es-VE' });
  await context.addInitScript(() => localStorage.setItem('savia:region', JSON.stringify({ pais: 'VE', idioma: 'es', elegido: true })));
  await neon.instalar(context);
  const page = await context.newPage();
  await page.goto('/');
  await page.getByRole('textbox', { name: 'Correo' }).fill(luis.email);
  await page.getByRole('textbox', { name: 'Contraseña', exact: true }).fill('otra-clave-incorrecta');
  await page.getByRole('button', { name: 'Entrar' }).last().click();
  await expect(page.getByText('El correo o la contraseña no coinciden.')).toBeVisible();

  await page.getByRole('textbox', { name: 'Contraseña', exact: true }).fill(luis.password);
  await page.getByRole('button', { name: 'Entrar' }).last().click();
  await expect.poll(() => neon.pedidos.some((p) => p.ruta === 'auth/sign-in/email' && p.respuesta.includes(luis.id))).toBe(true);
  // La sesión queda abierta al volver a abrir la web.
  await page.reload();
  await expect(page.getByRole('textbox', { name: 'Correo' })).toHaveCount(0);
});

// El token de la sesión de Luis, pedido a Neon Auth falso desde su propia página (como lo hace la app).
async function tokenDe(page: Page): Promise<string> {
  return page.evaluate(async () => {
    const r = await fetch('https://ep-old-bar-b5e0wyej.neonauth.c-7.us-east-2.aws.neon.tech/neondb/auth/token', { credentials: 'include' });
    return ((await r.json()) as { token: string }).token;
  });
}
