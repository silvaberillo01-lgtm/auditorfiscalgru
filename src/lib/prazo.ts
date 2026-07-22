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
  // Terminou todos os temas da semana? Então está concluída, independente do
  // calendário — quem adianta o trabalho não deve ver "vence em Nd". Aqui
  // diasRestantes fica positivo se ainda dentro do prazo (concluiu adiantado)
  // e negativo/zero se o prazo já passou.
  if (coberta) {
    return {
      status: "concluida",
      diasRestantes: periodoFim ? diasEntre(hoje, periodoFim) : 0,
    };
  }

  if (!periodoInicio || !periodoFim) {
    return { status: "futura", diasRestantes: 0 };
  }

  if (hoje < periodoInicio) {
    return { status: "futura", diasRestantes: diasEntre(hoje, periodoInicio) };
  }

  if (hoje > periodoFim) {
    return { status: "atrasada", diasRestantes: diasEntre(periodoFim, hoje) * -1 };
  }

  return { status: "atual", diasRestantes: diasEntre(hoje, periodoFim) };
}
