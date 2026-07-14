/**
 * Popula resumo-teoria de Língua Portuguesa (completo) e Raciocínio Lógico
 * e Matemática Financeira (bem curto, só fórmulas-base — o investimento
 * pesado aqui é em questões de treino, não teoria), mais questões extras
 * de RLM.
 *
 * Idempotente: apaga resumos com o mesmo título antes de inserir de novo.
 *
 * Uso: npx tsx scripts/seed-portugues-rlm.ts
 */
import "dotenv/config";
import { createClient } from "@supabase/supabase-js";

const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
const key = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
if (!url || !key) {
  console.error("Faltam NEXT_PUBLIC_SUPABASE_URL / NEXT_PUBLIC_SUPABASE_ANON_KEY em .env.local");
  process.exit(1);
}
const supabase = createClient(url, key);

type Resumo = { tema_id: string; titulo: string; conteudo_md: string; pontos_decorar: string[] };
type Questao = {
  tema_id: string;
  origem: "real" | "variacao";
  enunciado: string;
  alternativas: { letra: string; texto: string }[];
  gabarito: string;
  explicacao: string;
  fonte: string;
};

const RESUMOS: Resumo[] = [
  {
    tema_id: "lingua-portuguesa",
    titulo: "Português — Crase, Regência e Concordância",
    conteudo_md: `Os 3 pontos onde banca de concurso mais gosta de pegar candidato.

## Crase (fusão de "a" + "a")

Só existe crase antes de palavra **feminina** que aceitaria o artigo "a".
Regra prática: substitua o termo regido por um masculino equivalente —
se virar "**ao**", tem crase; se virar "**o**", não tem.

- **Sempre com crase**: expressões de tempo específicas ("às 14h", "à
  noite" quando adjunto adverbial fixo), locuções adverbiais femininas
  ("à toa", "às pressas", "à vontade", "às vezes"), locuções conjuntivas
  e prepositivas femininas ("à medida que", "à proporção que").
- **Nunca tem crase**: antes de verbo, antes de pronome pessoal ("a ela",
  não "à ela"), antes de pronome de tratamento que não admite artigo
  (Vossa Excelência, Vossa Senhoria — exceção: senhora/senhorita admitem),
  antes de substantivo masculino, antes de palavra no plural sem o "a"
  também no plural.
- **Facultativa**: antes de nome próprio feminino ("Entreguei a/à Maria"),
  antes de pronome possessivo feminino ("Entreguei a/à minha proposta"),
  depois da preposição "até".
- **Pegadinha clássica**: "a distância" (substantivo, sem determinante) x
  "à distância" (locução adverbial, com artigo definido subentendido) —
  ambas existem, dependendo do contexto.

## Regência verbal (a mais cobrada)

- **Assistir** (= ver): transitivo indireto, "assistir **ao** filme".
  Assistir (= socorrer, morar): transitivo direto/indireto conforme a
  região, mas em prova formal costuma pedir "assistir **a**" para morar.
- **Visar** (= ter como objetivo): transitivo indireto, "visar **a**o
  cargo". Visar (= mirar, rubricar): transitivo direto, "visar o
  documento".
- **Chegar / Ir**: regidos por "**a**", não por "em" — "cheguei a São
  Paulo", nunca "cheguei **em**". Clássico erro de banca pra pegar quem
  fala coloquialmente.
- **Namorar, obedecer/desobedecer, informar**: "namorar" é transitivo
  direto (namorar **a** namorada, sem preposição — "namorar com" é
  errado). "Obedecer/desobedecer" são transitivo indireto com "a": obedecer
  **às** normas.
- **Preferir**: transitivo direto e indireto, "preferir X **a** Y" — nunca
  "preferir X **do que** Y" (erro clássico).
- **Implicar** (= acarretar): transitivo direto, sem preposição —
  "implicará **a** perda do direito", não "implicará **na** perda".

## Regência nominal (nomes que pedem preposição fixa)

- Apto **a**, apto **para**; propenso **a**; acessível **a**; favorável
  **a**; contrário **a**; imbuído **de**; ansioso **por**; compatível
  **com**; obediente **a**.

## Concordância verbal

- **Sujeito composto anteposto ao verbo**: verbo no plural — "O réu e a
  ré foram condenados".
- **Sujeito composto posposto ao verbo**: verbo pode ficar no singular
  (concordando só com o núcleo mais próximo) ou no plural — ambos aceitos
  em prova, mas o plural é mais cobrado como "correto" na maioria das
  bancas.
- **Sujeito coletivo singular**: verbo no singular — "A maioria **votou**"
  (não "votaram"), mesmo que semanticamente pareça plural.
- **"Mais de um"**: verbo no singular — "Mais de um candidato **compareceu**".
  Exceção: se a ideia for de reciprocidade, vai pro plural ("Mais de um
  aluno se **agrediram**").
- **Verbos impessoais** (haver no sentido de existir, fazer indicando
  tempo): **ficam sempre no singular**, nunca concordam com o que vem
  depois — "**Havia** muitos processos" (não "haviam"), "**Faz** dois anos"
  (não "fazem"). Erro gravíssimo e muito cobrado em prova de auditoria.
- **Verbo "ser" em expressões de preço/quantidade/distância**: concorda
  com o predicativo, não com o sujeito — "Dez reais **é** pouco" /
  "Duzentos quilômetros **é** muita distância".

## Concordância nominal

- Adjetivo depois de dois ou mais substantivos: concorda com o mais
  próximo ou vai para o plural (ambos aceitos) — "Comprou casa e terreno
  **caro**" ou "**caros**".
- "**Anexo**", "**incluso**", "**obrigado**", "**mesmo**" são variáveis:
  concordam em gênero e número com o substantivo a que se referem — "Seguem
  **anexos** os documentos" (não "anexo os documentos", exceto quando
  "anexo" funciona como advérbio invariável — regra menos cobrada).
- "**É proibido**", "**é necessário**", "**é bom**" antes de substantivo
  sem determinante: fica invariável — "**É proibido** entrada de
  visitantes". Com determinante (artigo), concorda: "**É proibida** a
  entrada de visitantes".`,
    pontos_decorar: [
      "Crase: substitua por masculino — virou 'ao', tem crase; virou 'o', não tem",
      "Chegar/ir são regidos por 'a', nunca por 'em' ('cheguei a', não 'cheguei em')",
      "Preferir X a Y — nunca 'preferir X do que Y'",
      "Implicar (acarretar) é transitivo direto, sem preposição: 'implicará a perda', não 'implicará na perda'",
      "Haver (existir) e fazer (tempo) são impessoais: sempre no singular ('havia', 'faz')",
      "Sujeito coletivo singular ('a maioria') pede verbo no singular",
      "'É proibido' sem determinante fica invariável; com artigo, concorda ('é proibida a entrada')",
    ],
  },
  {
    tema_id: "raciocinio-logico-mat-financeira",
    titulo: "RLM — Fórmulas-base",
    conteudo_md: `Resumo curto de propósito — o investimento aqui é em questões de treino
pra ganhar velocidade e reconhecer o padrão de pegadinha da banca, não em
teoria. Só as fórmulas que você precisa ter na ponta da língua.

## Porcentagem
- \`X% de V = (X/100) × V\`
- Aumento sucessivo de a% e b%: fator final = \`(1+a/100)×(1+b/100)\`, não
  \`(a+b)%\` — erro clássico de quem soma direto.

## Juros simples
- \`J = C × i × t\` (juros = capital × taxa × tempo, taxa e tempo na
  mesma unidade)
- Montante: \`M = C + J = C × (1 + i×t)\`

## Juros compostos
- \`M = C × (1 + i)^t\`
- Taxas equivalentes vs. taxas proporcionais: em compostos, taxas
  equivalentes **não** são a simples divisão/multiplicação linear —
  \`(1+i_mensal)^12 = (1+i_anual)\`. Pegadinha clássica de prova: taxa
  proporcional (juros simples, divide direto) ≠ taxa equivalente (juros
  compostos, precisa da raiz/potência).

## Proposições lógicas
- **Negação de "e" (conjunção)**: nega e vira "ou" — ¬(p ∧ q) = ¬p ∨ ¬q
  (De Morgan).
- **Negação de "ou" (disjunção)**: nega e vira "e" — ¬(p ∨ q) = ¬p ∧ ¬q.
- **Condicional "se p, então q"**: só é falsa quando p é verdadeiro e q é
  falso; nos outros 3 casos é verdadeira. Negação de condicional: ¬(p→q) =
  p ∧ ¬q (nega o "então", mantém o "se" verdadeiro).
- **Bicondicional "p se e somente se q"**: verdadeira quando p e q têm o
  mesmo valor lógico (ambos V ou ambos F).
- **Quantificadores**: negação de "todo X é Y" = "existe X que não é Y";
  negação de "algum X é Y" = "nenhum X é Y".`,
    pontos_decorar: [
      "Aumentos sucessivos multiplicam fatores (1+a%)×(1+b%), não somam as porcentagens",
      "Juros simples: J = C×i×t; juros compostos: M = C×(1+i)^t",
      "Taxa equivalente (compostos) ≠ taxa proporcional (simples) — compostos usa potência/raiz",
      "Negação de 'e' vira 'ou' com os dois negados (De Morgan), e vice-versa",
      "Condicional só é falsa quando antecedente V e consequente F",
      "Negação de 'todo X é Y' = 'existe X que não é Y'",
    ],
  },
];

const QUESTOES: Questao[] = [
  // Português — 4
  {
    tema_id: "lingua-portuguesa",
    origem: "real",
    enunciado: "Assinale a alternativa em que a crase foi empregada corretamente:",
    alternativas: [
      { letra: "A", texto: "O relatório foi entregue à ela na sexta-feira." },
      { letra: "B", texto: "A auditoria começou às 14h e terminou à noite." },
      { letra: "C", texto: "Ele se referiu à Vossa Excelência com respeito." },
      { letra: "D", texto: "Chegamos à distância de resolver o problema." },
    ],
    gabarito: "B",
    explicacao: "Crase antes de horas específicas ('às 14h') e em locução adverbial feminina de tempo ('à noite') é obrigatória. Não há crase antes de pronome pessoal ('a ela') nem antes de pronome de tratamento que não admite artigo (Vossa Excelência).",
    fonte: "Português — Crase (banca padrão)",
  },
  {
    tema_id: "lingua-portuguesa",
    origem: "real",
    enunciado: "Em relação à regência verbal, assinale a alternativa correta:",
    alternativas: [
      { letra: "A", texto: "O auditor visa ao cargo de coordenador desde o início da carreira." },
      { letra: "B", texto: "Os fiscais chegaram em Guarulhos na segunda-feira." },
      { letra: "C", texto: "O contribuinte prefere pagar à vista do que parcelado." },
      { letra: "D", texto: "A nova norma implicará na revisão de todos os lançamentos." },
    ],
    gabarito: "A",
    explicacao: "'Visar' no sentido de 'ter como objetivo' é transitivo indireto regido por 'a': 'visa ao cargo'. As demais alternativas trazem erros clássicos: 'chegar em' (correto é 'chegar a'), 'preferir... do que' (correto é 'preferir... a'), 'implicar na' (implicar, no sentido de acarretar, é transitivo direto: 'implicará a revisão').",
    fonte: "Português — Regência verbal (banca padrão)",
  },
  {
    tema_id: "lingua-portuguesa",
    origem: "real",
    enunciado: "Assinale a alternativa que respeita a concordância verbal:",
    alternativas: [
      { letra: "A", texto: "Haviam muitos processos pendentes de julgamento na Junta." },
      { letra: "B", texto: "Fazem dois anos que o processo foi protocolado." },
      { letra: "C", texto: "A maioria dos auditores votou favoravelmente à proposta." },
      { letra: "D", texto: "Mais de um contribuinte compareceram à audiência." },
    ],
    gabarito: "C",
    explicacao: "Sujeito coletivo singular ('a maioria') exige verbo no singular: 'votou'. 'Haver' no sentido de existir e 'fazer' indicando tempo são impessoais e ficam sempre no singular ('havia', 'faz'). 'Mais de um' pede verbo no singular, salvo ideia de reciprocidade.",
    fonte: "Português — Concordância verbal (banca padrão)",
  },
  {
    tema_id: "lingua-portuguesa",
    origem: "real",
    enunciado: "Assinale a alternativa correta quanto à concordância nominal:",
    alternativas: [
      { letra: "A", texto: "Seguem anexo os documentos solicitados pela fiscalização." },
      { letra: "B", texto: "É proibida a entrada de visitantes não autorizados." },
      { letra: "C", texto: "É proibido a entrada de visitantes não autorizados." },
      { letra: "D", texto: "Segue anexos o parecer técnico." },
    ],
    gabarito: "B",
    explicacao: "'Anexo' é variável e concorda com o substantivo ('anexos os documentos'). 'É proibido/é necessário' antes de substantivo COM determinante (artigo) concorda: 'é proibida a entrada'. Sem determinante, ficaria invariável ('é proibido entrada').",
    fonte: "Português — Concordância nominal (banca padrão)",
  },
  // RLM — 9 (proporção maior, conforme perfil do usuário)
  {
    tema_id: "raciocinio-logico-mat-financeira",
    origem: "real",
    enunciado: "Um produto sofre dois aumentos sucessivos de 10% e 20%. O aumento total acumulado é de:",
    alternativas: [
      { letra: "A", texto: "30%" },
      { letra: "B", texto: "30,5%" },
      { letra: "C", texto: "32%" },
      { letra: "D", texto: "22%" },
    ],
    gabarito: "C",
    explicacao: "Aumentos sucessivos multiplicam os fatores: 1,10 × 1,20 = 1,32, ou seja, 32% de aumento total — não 30% (soma direta, erro clássico).",
    fonte: "RLM — Porcentagem (variação)",
  },
  {
    tema_id: "raciocinio-logico-mat-financeira",
    origem: "real",
    enunciado: "Um capital de R$ 10.000,00 é aplicado a juros simples de 2% ao mês, por 5 meses. O montante ao final do período é:",
    alternativas: [
      { letra: "A", texto: "R$ 11.000,00" },
      { letra: "B", texto: "R$ 10.500,00" },
      { letra: "C", texto: "R$ 11.040,80" },
      { letra: "D", texto: "R$ 12.000,00" },
    ],
    gabarito: "A",
    explicacao: "Juros simples: M = C × (1 + i×t) = 10.000 × (1 + 0,02×5) = 10.000 × 1,10 = R$ 11.000,00.",
    fonte: "RLM — Juros simples (variação)",
  },
  {
    tema_id: "raciocinio-logico-mat-financeira",
    origem: "real",
    enunciado: "Um capital de R$ 8.000,00 é aplicado a juros compostos de 5% ao mês, por 2 meses. O montante, ao final do período, é:",
    alternativas: [
      { letra: "A", texto: "R$ 8.800,00" },
      { letra: "B", texto: "R$ 8.820,00" },
      { letra: "C", texto: "R$ 8.400,00" },
      { letra: "D", texto: "R$ 9.000,00" },
    ],
    gabarito: "B",
    explicacao: "Juros compostos: M = C × (1+i)^t = 8.000 × (1,05)² = 8.000 × 1,1025 = R$ 8.820,00.",
    fonte: "RLM — Juros compostos (variação)",
  },
  {
    tema_id: "raciocinio-logico-mat-financeira",
    origem: "real",
    enunciado: "Uma taxa de juros compostos de 1% ao mês equivale, aproximadamente, a qual taxa anual (mesmo regime de capitalização)?",
    alternativas: [
      { letra: "A", texto: "12%, pois basta multiplicar a taxa mensal por 12" },
      { letra: "B", texto: "Aproximadamente 12,68%, calculada por (1,01)^12 - 1" },
      { letra: "C", texto: "1%, a taxa não se altera" },
      { letra: "D", texto: "24%, o dobro da taxa mensal" },
    ],
    gabarito: "B",
    explicacao: "Em juros compostos, a taxa equivalente anual não é a simples multiplicação por 12 (isso seria taxa proporcional, usada em juros simples). O correto é (1+0,01)^12 - 1 ≈ 0,1268, ou seja, aproximadamente 12,68% ao ano.",
    fonte: "RLM — Taxas equivalentes vs. proporcionais (variação)",
  },
  {
    tema_id: "raciocinio-logico-mat-financeira",
    origem: "real",
    enunciado: "A negação da proposição 'O processo foi protocolado e o prazo foi cumprido' é:",
    alternativas: [
      { letra: "A", texto: "O processo não foi protocolado e o prazo não foi cumprido." },
      { letra: "B", texto: "O processo não foi protocolado ou o prazo não foi cumprido." },
      { letra: "C", texto: "O processo foi protocolado ou o prazo foi cumprido." },
      { letra: "D", texto: "Se o processo foi protocolado, então o prazo foi cumprido." },
    ],
    gabarito: "B",
    explicacao: "Pela lei de De Morgan, a negação de uma conjunção (p ∧ q) é a disjunção das negações (¬p ∨ ¬q): 'o processo não foi protocolado OU o prazo não foi cumprido'.",
    fonte: "RLM — Lógica proposicional, De Morgan (variação)",
  },
  {
    tema_id: "raciocinio-logico-mat-financeira",
    origem: "real",
    enunciado: "Considere a proposição condicional: 'Se o contribuinte é notificado, então o prazo começa a correr'. Essa proposição é FALSA apenas quando:",
    alternativas: [
      { letra: "A", texto: "O contribuinte não é notificado e o prazo não começa a correr" },
      { letra: "B", texto: "O contribuinte não é notificado e o prazo começa a correr" },
      { letra: "C", texto: "O contribuinte é notificado e o prazo começa a correr" },
      { letra: "D", texto: "O contribuinte é notificado e o prazo não começa a correr" },
    ],
    gabarito: "D",
    explicacao: "Uma proposição condicional (p→q) só é falsa quando o antecedente é verdadeiro e o consequente é falso: contribuinte é notificado (V) e o prazo não começa a correr (F).",
    fonte: "RLM — Condicional (variação)",
  },
  {
    tema_id: "raciocinio-logico-mat-financeira",
    origem: "real",
    enunciado: "A negação da proposição 'Todo auditor fiscal aprovou o exame' é:",
    alternativas: [
      { letra: "A", texto: "Nenhum auditor fiscal aprovou o exame." },
      { letra: "B", texto: "Existe pelo menos um auditor fiscal que não aprovou o exame." },
      { letra: "C", texto: "Todo auditor fiscal não aprovou o exame." },
      { letra: "D", texto: "Algum auditor fiscal aprovou o exame." },
    ],
    gabarito: "B",
    explicacao: "A negação de uma proposição universal ('todo X é Y') é uma proposição existencial ('existe X que não é Y') — não é o mesmo que 'nenhum X é Y', que seria uma afirmação mais forte.",
    fonte: "RLM — Quantificadores (variação)",
  },
  {
    tema_id: "raciocinio-logico-mat-financeira",
    origem: "real",
    enunciado: "Um item custava R$ 500,00 e sofreu um desconto de 15%, seguido de um novo desconto de 10% sobre o valor já reduzido. O preço final do item é:",
    alternativas: [
      { letra: "A", texto: "R$ 375,00" },
      { letra: "B", texto: "R$ 382,50" },
      { letra: "C", texto: "R$ 425,00" },
      { letra: "D", texto: "R$ 400,00" },
    ],
    gabarito: "B",
    explicacao: "Descontos sucessivos multiplicam os fatores: 500 × 0,85 × 0,90 = 500 × 0,765 = R$ 382,50. Não se pode somar os percentuais diretamente (25%), pois o segundo desconto incide sobre o valor já reduzido.",
    fonte: "RLM — Porcentagem, descontos sucessivos (variação)",
  },
  {
    tema_id: "raciocinio-logico-mat-financeira",
    origem: "real",
    enunciado: "A bicondicional 'p se e somente se q' é verdadeira quando:",
    alternativas: [
      { letra: "A", texto: "p e q têm o mesmo valor lógico, ambos verdadeiros ou ambos falsos" },
      { letra: "B", texto: "Apenas quando p e q são ambos verdadeiros" },
      { letra: "C", texto: "Quando p é verdadeiro e q é falso" },
      { letra: "D", texto: "Sempre, independentemente dos valores de p e q" },
    ],
    gabarito: "A",
    explicacao: "A bicondicional (p↔q) é verdadeira exatamente quando p e q têm o mesmo valor lógico — ambos verdadeiros ou ambos falsos.",
    fonte: "RLM — Bicondicional (variação)",
  },
];

async function main() {
  console.log("Populando resumos e questões de Português e RLM...\n");

  const titulos = RESUMOS.map((r) => r.titulo);
  await supabase.from("resumos").delete().in("titulo", titulos);
  const fontes = [...new Set(QUESTOES.map((q) => q.fonte))];
  await supabase.from("questoes").delete().in("fonte", fontes);

  const { error: errResumos } = await supabase.from("resumos").insert(RESUMOS);
  if (errResumos) console.error("Erro ao inserir resumos:", errResumos.message);
  else console.log(`OK: ${RESUMOS.length} resumos inseridos.`);

  const { error: errQuestoes } = await supabase.from("questoes").insert(QUESTOES);
  if (errQuestoes) console.error("Erro ao inserir questões:", errQuestoes.message);
  else console.log(`OK: ${QUESTOES.length} questões inseridas.`);

  console.log("\nFeito.");
}

main();
