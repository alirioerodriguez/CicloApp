// Savia+: lo que va a ser pago. Mientras no se cobre (Google Play Billing y la web todavía no están),
// todas ven todo; el día que se cobre, se pone SAVIA_PLUS_COBRANDO en true y el plan gratis queda con lo básico.
// La predicción del período, el blíster, el PDF para la médica y los avisos clínicos son gratis siempre.

export const SAVIA_PLUS_COBRANDO = false;

/** Ciclos que se ven en la tendencia: el plan gratis muestra 3, Savia+ 12. */
export const CICLOS_GRATIS = 3;
export const CICLOS_PLUS = 12;

export function tieneSaviaPlus(suscripta = false): boolean {
  return !SAVIA_PLUS_COBRANDO || suscripta;
}

export function ciclosVisibles(suscripta = false): number {
  return tieneSaviaPlus(suscripta) ? CICLOS_PLUS : CICLOS_GRATIS;
}
