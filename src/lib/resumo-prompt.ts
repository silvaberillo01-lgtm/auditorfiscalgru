// Monta o texto que o usuário copia e cola numa IA pra entender melhor um
// bloco de resumo, no mesmo espírito dos outros prompts do app: contexto,
// analogia e, no final, os termos exatos que uma banca cobraria.

export type ResumoParaIA = {
  titulo: string | null;
  conteudo_md: string | null;
  pontos_decorar: string[] | null;
};

export function promptResumo(temaNome: string, resumo: ResumoParaIA): string {
  const instrucoes = `Sou leigo em "${temaNome}" — estudando pra um concurso e lendo o resumo abaixo. Quero entender de verdade, não só decorar. Mostre tudo de uma vez, sem esperar resposta entre as partes:

1. Dê um CONTEXTO rápido: pra que serve esse conteúdo, onde ele aparece na prática, por que a banca cobra isso.
2. Explique os termos técnicos como se eu nunca tivesse visto, sem definição de dicionário.
3. Me dê uma ANALOGIA ou exemplo do dia a dia (fora da área) que ajude a fixar a lógica.
4. Se tiver algo que costuma confundir ou virar pegadinha de prova, aponte o quê e por quê.
5. Termine com "📌 Pontos-chave:" listando os termos e palavras exatas que uma banca de concurso usaria pra cobrar isso — sem reformular, é literalmente o que eu preciso decorar.`;

  const partes = [`### ${resumo.titulo ?? "Resumo"}`, resumo.conteudo_md ?? ""];
  if (resumo.pontos_decorar && resumo.pontos_decorar.length > 0) {
    partes.push(`### Pontos pra decorar\n${resumo.pontos_decorar.map((p) => `- ${p}`).join("\n")}`);
  }

  return `${instrucoes}\n\n${partes.join("\n\n")}`;
}
