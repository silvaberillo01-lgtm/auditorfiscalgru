// Monta o texto que o usuário copia e cola numa IA pra entender melhor os
// flashcards que anda errando. Segue o mesmo espírito dos prompts de erro das
// questões (CopiarErrosBrutos / ErrosResumoPanel): pede analogia, exemplo do
// dia a dia e linguagem de leigo.

export type FlashcardParaIA = {
  tema_nome: string;
  pergunta: string;
  resposta_html: string;
};

/** Tira as tags de HTML da resposta pra virar texto limpo no prompt. */
function htmlParaTexto(html: string): string {
  if (typeof document !== "undefined") {
    const el = document.createElement("div");
    el.innerHTML = html;
    return (el.textContent ?? "").replace(/\s+/g, " ").trim();
  }
  // fallback sem browser (ex.: SSR): remove tags na unha
  return html
    .replace(/<[^>]*>/g, " ")
    .replace(/\s+/g, " ")
    .trim();
}

export function promptFlashcards(cards: FlashcardParaIA[]): string {
  const temas = [...new Set(cards.map((c) => c.tema_nome).filter(Boolean))];
  const contextoTema =
    temas.length === 1
      ? `sobre "${temas[0]}"`
      : temas.length > 1
        ? `sobre os temas: ${temas.join(", ")}`
        : "";

  const instrucoes = `Sou leigo ${contextoTema} — estou estudando pra um concurso com flashcards e estes abaixo são justamente os que eu não consigo fixar (erro toda vez). Mostre TODOS de uma vez, um atrás do outro — não pare pra esperar eu responder entre um e outro. Pra cada flashcard:

1. Explique a resposta como se eu nunca tivesse visto esses termos, sem definição de dicionário.
2. Me dê uma ANALOGIA ou exemplo do dia a dia (fora do direito/contabilidade) que faça a lógica "grudar" na memória.
3. Aponte por que isso costuma confundir e qual é o macete pra não errar de novo.
4. Termine com "📌 Resposta-chave:" seguido da resposta EXATA como uma banca de concurso cobraria — os termos técnicos e palavras-chave precisos que eu preciso decorar, não uma paráfrase com outras palavras. Essa parte não pode reformular o termo técnico.`;

  const blocos = cards.map((c, i) => {
    const partes = [`### Flashcard ${i + 1}${c.tema_nome ? ` (${c.tema_nome})` : ""}`];
    partes.push(`Pergunta: ${c.pergunta}`);
    partes.push(`Resposta: ${htmlParaTexto(c.resposta_html)}`);
    return partes.join("\n");
  });

  return `${instrucoes}\n\n${blocos.join("\n\n")}`;
}
