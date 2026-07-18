export type StatusPrazo = "futura" | "atual" | "atrasada" | "concluida";

export function hojeISO(): string {
  return new Date().toISOString().slice(0, 10);
}

/** Diferença em dias entre duas datas ISO (b - a). Positivo se b é depois de a. */
export function diasEntre(a: string, b: string): number {
  const msPorDia = 1000 * 60 * 60 * 24;
  const dataA = new Date(`${a}T00:00:00Z`).getTime();
  const dataB = new Date(`${b}T00:00:00Z`).getTime();
  return Math.round((dataB - dataA) / msPorDia);
}

/**
 * Status de uma semana do plano em relação a hoje.
 * `coberta` = todos os temas da semana já em espacando/dominado.
 * `diasRestantes` é negativo quando atrasada (dias desde o fim do prazo).
 */
export function statusSemana(
  periodoInicio: string | null,
  periodoFim: string | null,
  coberta: boolean,
  hoje: string = hojeISO()
): { status: StatusPrazo; diasRestantes: number } {
  if (!periodoInicio || !periodoFim) {
    return { status: coberta ? "concluida" : "futura", diasRestantes: 0 };
  }

  // Cobriu todos os temas da semana? Está concluída, mesmo que antes do prazo
  // (adiantado) — não faz sentido mostrar "vence em Xd" pra algo já terminado.
  if (coberta) {
    const diasRestantes = hoje <= periodoFim
      ? diasEntre(hoje, periodoFim)
      : diasEntre(periodoFim, hoje) * -1;
    return { status: "concluida", diasRestantes };
  }

  if (hoje < periodoInicio) {
    return { status: "futura", diasRestantes: diasEntre(hoje, periodoInicio) };
  }

  if (hoje > periodoFim) {
    return {
      status: coberta ? "concluida" : "atrasada",
      diasRestantes: diasEntre(periodoFim, hoje) * -1,
    };
  }

  return { status: "atual", diasRestantes: diasEntre(hoje, periodoFim) };
}
