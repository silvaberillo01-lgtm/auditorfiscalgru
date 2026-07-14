/**
 * Popula resumos, flashcards e questões das 4 leis do "lote 2"
 * (conteudo-leis-lote2.md): CTM 7.966/2021, Decreto 21.066/2000 (PAT),
 * Lei 5.767/2001 (Taxas ILF/Publicidade) e Lei 7.345/2014 (COSIP).
 *
 * Idempotente na medida do possível: apaga o conteúdo anterior com a mesma
 * `fonte`/`titulo` antes de inserir de novo, então pode rodar mais de uma vez
 * sem duplicar.
 *
 * Uso: npx tsx scripts/seed-lote2.ts
 */
import { config } from "dotenv";
config({ path: ".env.local" });
import { createClient } from "@supabase/supabase-js";

const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
const key = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
if (!url || !key) {
  console.error("Faltam NEXT_PUBLIC_SUPABASE_URL / NEXT_PUBLIC_SUPABASE_ANON_KEY em .env.local");
  process.exit(1);
}
const supabase = createClient(url, key);

type Resumo = {
  tema_id: string;
  titulo: string;
  conteudo_md: string;
  pontos_decorar: string[];
};

type Flashcard = { tema_id: string; pergunta: string; resposta_html: string };

type Questao = {
  tema_id: string;
  origem: "real" | "variacao";
  enunciado: string;
  alternativas: { letra: string; texto: string }[];
  gabarito: string;
  explicacao: string;
  fonte: string;
};

// ---------------------------------------------------------------------------
// RESUMOS
// ---------------------------------------------------------------------------

const RESUMOS: Resumo[] = [
  {
    tema_id: "tributos-municipais",
    titulo: "Lei 7.966/2021 — CTM: Livro I (Normas Gerais)",
    conteudo_md: `O CTM é o CTN "traduzido" pra Guarulhos — mesmos institutos (obrigação,
crédito, lançamento, suspensão/extinção/exclusão), mas com **números de
artigo e valores locais próprios**. É exatamente onde a banca gosta de
pegar quem só decorou o CTN federal.

- **Vigência de lei que institui/majora tributo** (art. 5º): não antes do
  1º dia do exercício seguinte **nem** antes de 90 dias da publicação —
  anterioridade + noventena da CF, agora como norma municipal expressa.
- **Prazo padrão pra cumprir obrigação** quando a lei não fixar prazo:
  **30 dias** (art. 12).
- **DTEM — Domicílio Tributário Eletrônico Municipal**: comunicação
  eletrônica obrigatória entre Fazenda e sujeito passivo (art. 25 §2º).
- **Responsabilidade dos sucessores** (art. 28-31): espelha o CTN, mas com
  exceção de falência/recuperação judicial — alienação judicial de filial
  ou unidade produtiva isolada não gera sucessão, salvo fraude, parentesco
  com o devedor, ou sócio da sociedade falida/em recuperação.
- **Suspensão do crédito** (art. 49): as mesmas 6 hipóteses do CTN —
  moratória, depósito integral, reclamações/recursos do PAT, liminar em
  MS, liminar/tutela antecipada, parcelamento.
- **Extinção do crédito**: 11 modalidades do CTN + **dação em pagamento em
  bens imóveis** (art. 55, XI e art. 80) — o imóvel precisa estar quitado,
  livre de ônus, avaliado por laudo, e a dação precisa cobrir a totalidade
  da dívida.
- **Multa por atraso**: até **10%** do tributo devido (art. 60).
  **Juros de mora**: **0,5% ao mês** (art. 60 §2º e art. 65 §1º).
- **Imputação em pagamento** com múltiplos débitos, ordem (art. 61):
  1. obrigação própria antes de responsabilidade tributária;
  2. contribuição de melhoria → taxas → impostos;
  3. prazo de prescrição crescente;
  4. montante decrescente.
- **Transação** (art. 78): só se o litígio for **< 350 UFGs** OU a demora
  for onerosa ao Município.
- **Imunidades** (art. 118): reciprocidade entre entes; templos; partidos
  políticos, sindicatos de trabalhadores e instituições de educação/
  assistência social sem fins lucrativos (3 requisitos: não distribuir
  patrimônio/renda, aplicar recursos integralmente no país, manter
  escrituração regular); livros/jornais/periódicos/papel; e a imunidade
  cultural de fonogramas/videofonogramas musicais de autores brasileiros
  (EC 75/2013) — o item mais fácil de esquecer.`,
    pontos_decorar: [
      "Vigência de lei que institui/majora tributo: anterioridade + noventena (art. 5º)",
      "Prazo padrão pra cumprir obrigação sem prazo fixado na lei: 30 dias (art. 12)",
      "DTEM: comunicação eletrônica obrigatória Fazenda↔sujeito passivo (art. 25 §2º)",
      "Multa por atraso: até 10% do tributo (art. 60); juros de mora: 0,5% ao mês (art. 60 §2º/65 §1º)",
      "Dação em pagamento só em bens imóveis, quitados, livres de ônus, avaliados por laudo (art. 55, XI)",
      "Transação só se litígio < 350 UFGs ou demora onerosa ao Município (art. 78)",
      "Imunidade cultural de fonogramas/videofonogramas de autores brasileiros (EC 75/2013, art. 118)",
    ],
  },
  {
    tema_id: "legislacao-tributaria-municipal",
    titulo: "Lei 7.966/2021 — CTM: Livro II, Título I (Impostos)",
    conteudo_md: `É o mesmo ISS/IPTU/ITBI que você já estudou, agora na "versão CTM"
(hipótese de incidência, base de cálculo, contribuinte definidos de forma
genérica — as alíquotas continuam nas leis específicas).

- **IPTU** — pegadinha clássica: não incide sobre imóvel em zona urbana
  usado comprovadamente em exploração extrativa vegetal, agrícola,
  pecuária ou agroindustrial (art. 143), mesmo estando na zona urbana.
- **ITBI** (art. 146): 12 incisos do que está compreendido na incidência —
  vale decorar que **cessão de direitos à sucessão** e **cessão de
  benfeitorias em terreno de terceiro** também entram, não é só compra e
  venda.
- **Zona urbana para fins de IPTU**: mínimo 2 de 5 melhoramentos (meio-fio
  + águas pluviais, água, esgoto, iluminação, escola/posto de saúde a até
  3km) — igual ao CTN art. 32 §1º, agora como norma local.`,
    pontos_decorar: [
      "IPTU não incide em zona urbana com exploração extrativa vegetal/agrícola/pecuária/agroindustrial (art. 143)",
      "ITBI também incide sobre cessão de direitos à sucessão e cessão de benfeitorias em terreno de terceiro (art. 146)",
      "Zona urbana pra fins de IPTU: mínimo 2 de 5 melhoramentos do art. 32 §1º do CTN",
    ],
  },
  {
    tema_id: "tributos-municipais",
    titulo: "Lei 7.966/2021 — CTM: Livro II, Títulos II-III (Taxas e Contribuição de Melhoria)",
    conteudo_md: `- **Taxa não pode** ter base de cálculo ou fato gerador idênticos a
  imposto, nem ser calculada em função do capital das empresas (art. 148,
  parágrafo único) — ligação direta com a **Súmula Vinculante 29**.
- **Rol de taxas instituídas**: Fiscalização de Instalação/Localização/
  Funcionamento, Fiscalização de Publicidade (ambas nas leis específicas
  abaixo), Comércio Eventual/Ambulante, Feirante, Obra Particular,
  Arruamento/Loteamento, Ocupação de Solo, Licenciamento Ambiental (18
  sub-taxas — LP, LI, LO, LU, RLO, LD, PTA, TDLA, entre outras: vale saber
  que existem e a lógica de fase do licenciamento, não decorar cada
  sigla), Regularidade de Edificação, Fiscalização Sanitária, Expediente,
  Serviços Diversos.
- **Contribuição de Melhoria** (art. 203-204): limite total = custo da
  obra; limite individual = valorização do imóvel (igual ao CTN
  art. 81-82). Requer publicação prévia de 5 elementos (memorial,
  orçamento, parcela financiada, zona beneficiada, fator de absorção da
  valorização) e prazo mínimo de **30 dias** para impugnação.`,
    pontos_decorar: [
      "Taxa não pode ter base de cálculo/fato gerador de imposto nem ser calculada sobre capital das empresas — Súmula Vinculante 29 (art. 148, parágrafo único)",
      "Contribuição de Melhoria: limite total = custo da obra; limite individual = valorização do imóvel (art. 203-204)",
      "Contribuição de Melhoria: publicação prévia de 5 elementos + prazo mínimo de 30 dias para impugnação",
    ],
  },
  {
    tema_id: "processo-administrativo-tributario",
    titulo: "Decreto 21.066/2000 — Regulamento do PAT",
    conteudo_md: `Regulamenta a Lei 5.420/99. Complementa o que você já tinha; aqui só os
pontos que ainda não estavam cobertos.

> ⚠️ **Correção**: o recurso voluntário tem prazo de **20 dias** (art. 34),
> não 30 — se você tiver flashcard/questão antiga dizendo 30 dias, está
> desatualizado.

- **Ciência dos atos**: pessoal, carta com AR, ou **edital** — o edital só
  pode ser usado depois de esgotados os dois primeiros meios (art. 5º §3º).
- **Recurso voluntário**: **20 dias** da ciência da decisão de 1ª
  instância, com efeito devolutivo e suspensivo (art. 34).
- **Recurso de ofício (reexame necessário)**: quando a decisão de 1ª
  instância exonera o contribuinte acima do valor fixado em lei (art. 29
  do decreto, remetendo ao art. 51 da Lei 5.420/99).
- **Não cabe pedido de reconsideração** da decisão de 1ª instância
  (art. 30).
- **"Erro manifesto" e "direito líquido e certo"** (art. 33): hipóteses
  que dispensam o recurso de ofício à Junta — duplicidade de lançamento,
  erro de base de cálculo, erro cadastral, erro no carnê, penalidade
  indevida, restituição indevida, imunidade do art. 150-VI CF, isenção,
  decadência/prescrição, fato fora do campo de incidência.
- **Nulidade absoluta**: ato de autoridade incompetente, ato que
  prejudica a defesa, ato sem fundamentação (art. 52).
  **Anulável (sanável)**: erro de cálculo ou de capitulação legal — corrige
  de ofício e reabre prazo de **5 dias** para impugnação (art. 54).
- Autoridade fiscal com indícios de crime contra a ordem tributária deve
  cientificar o superior hierárquico **imediatamente**, por protocolo
  (art. 55).`,
    pontos_decorar: [
      "Recurso voluntário: 20 dias da ciência (art. 34) — NÃO 30 dias",
      "Edital só depois de esgotados ciência pessoal e carta com AR (art. 5º §3º)",
      "Não cabe pedido de reconsideração da decisão de 1ª instância (art. 30)",
      "Nulidade absoluta: incompetência, prejuízo à defesa, falta de fundamentação (art. 52)",
      "Anulável: erro de cálculo/capitulação legal, corrige de ofício, reabre prazo de 5 dias (art. 54)",
    ],
  },
  {
    tema_id: "tributos-municipais",
    titulo: "Lei 5.767/2001 — Taxas de Instalação/Localização/Funcionamento e Publicidade",
    conteudo_md: `### Taxa de Fiscalização de Instalação, Localização e Funcionamento
- Fato gerador: poder de polícia sobre instalação/localização/
  funcionamento de qualquer estabelecimento (art. 1º).
- Devida por 2 atividades administrativas indivisíveis: diligências no
  início da atividade + fiscalização contínua enquanto ela perdurar
  (art. 3º).
- Independe de 6 coisas: cumprimento de exigências legais, licença/
  autorização de qualquer ente, estabelecimento fixo, finalidade/
  resultado econômico, efetivo funcionamento, caráter permanente/
  eventual/transitório (art. 4º).
- **Horário especial**: acréscimo de **50%** se funcionar fora do horário
  normal (dias úteis 8h-22h, sábado 8h-18h, domingo/feriado 8h-12h) —
  art. 8º. Isentos dessa regra: energia elétrica, telefonia, transporte
  coletivo, funerárias, hospitais/postos de saúde, farmácias.
- **Atividade temporária** (≤ 90 dias): taxa a **50%** da tabela; depois
  disso vira permanente e paga integral (art. 9º).
- Isenções (rol longo, art. 17): instituições religiosas, APMs/conselhos
  escolares, assistenciais/filantrópicas, associações esportivas, de
  bairro, ONGs ambientais, sindicatos de trabalhadores, condomínios
  residenciais, órgãos públicos, associações empresariais/de classe,
  instituições de ensino em parceria com a rede municipal.

### Taxa de Fiscalização de Publicidade
- Fato gerador: poder de polícia sobre veiculação de publicidade em vias/
  logradouros públicos, ou em locais de audibilidade/visibilidade/acesso
  ao público (art. 21).
- Isenções (art. 23): hospitais/templos, placas de responsável técnico de
  obra até 2m², anúncios internos ao estabelecimento/condomínio/shopping,
  campanhas de utilidade pública, propaganda político-eleitoral, anúncios
  em transporte público concedido, anúncios de até 1m² no próprio imóvel,
  placas de venda/locação até 1m².
- Cálculo: anúncio **no próprio estabelecimento** = Tipo 1 (valor-base);
  anúncio **fora** do estabelecimento ou sem relação com ele = Tipo 2 em
  diante, valor maior.
- Anúncios temporários (≤ 90 dias): **30% ao mês** do valor anual
  (art. 26 §4º).
- **CFP — Cadastro Fiscal de Publicidade**: registro obrigatório de cada
  veículo publicitário antes do início da veiculação, mesmo que vários
  estejam no mesmo local (art. 32-34).
- Ambas as taxas desta lei aplicam-se subsidiariamente as normas do ISS e
  do PAT (arts. 19 e 40).`,
    pontos_decorar: [
      "Taxa ILF: horário especial fora do padrão = acréscimo de 50% (art. 8º)",
      "Taxa ILF: atividade temporária até 90 dias paga 50% da tabela (art. 9º)",
      "Taxa de Publicidade: anúncio no próprio estabelecimento = Tipo 1; fora dele = Tipo 2+ (valor maior)",
      "Taxa de Publicidade: anúncio temporário até 90 dias = 30% ao mês do valor anual (art. 26 §4º)",
      "CFP: cadastro obrigatório de cada veículo publicitário antes de veicular (art. 32-34)",
      "Ambas as taxas da Lei 5.767/2001 aplicam-se subsidiariamente as normas do ISS e do PAT",
    ],
  },
  {
    tema_id: "tributos-municipais",
    titulo: "Lei 7.345/2014 — COSIP",
    conteudo_md: `- Finalidade: custear o serviço de iluminação pública — manutenção,
  modernização, instalação, melhoria da rede e (desde a reforma de 2025)
  também sistemas de monitoramento/segurança de logradouros (art. 1º-2º).
- Contribuinte: pessoa física/jurídica com ligação de energia elétrica
  cadastrada na concessionária (art. 4º). Desde 2025, proprietários de
  imóveis **não edificados** também pagam: **R$ 3,00 por metro linear de
  testada**, cobrado junto com o IPTU.
- Cobrança: embutida na fatura de energia elétrica; a **concessionária**
  arrecada e repassa ao Município (arts. 5º e 9º).
- Cálculo (regra atual, pós Lei 8.365/2025):
  - Residencial: tabela por faixa de consumo em kWh — **isento até
    50kWh**, até R$ 18,70 acima de 1000kWh.
  - Comercial/rural/consumo próprio: alíquota **4%** sobre o total da
    fatura de energia.
  - Industrial: alíquota **6%** sobre o total da fatura de energia.
- Isenções (art. 7º): poder público (todos os entes), residencial com
  consumo ≤ 50kWh/mês, beneficiários do Bolsa Família, consumidores da
  tarifa social.
- **FUMCIP** (Fundo Municipal de Custeio da Iluminação Pública) e
  **COMIP** (Conselho Municipal de Iluminação Pública) — COMIP tem 6
  membros (3 poder público + 3 sociedade civil), mandato de 2 anos, 1
  recondução, função gratuita e consultiva (arts. 12, 16-18). Gestão do
  FUMCIP: Secretaria de Administrações Regionais (mudou da Secretaria de
  Obras via Lei 7.965/2021 — pegadinha de reforma administrativa).
- Reajuste anual conforme índices da ANEEL (art. 6º).`,
    pontos_decorar: [
      "Proprietário de imóvel não edificado paga R$ 3,00/metro linear de testada, junto com o IPTU (desde 2025)",
      "Quem arrecada e repassa a COSIP ao Município é a concessionária de energia (arts. 5º e 9º)",
      "Alíquotas pós-2025: comercial/rural/consumo próprio 4%, industrial 6% sobre a fatura de energia",
      "Isenção residencial: consumo ≤ 50kWh/mês (art. 7º)",
      "COMIP: 6 membros (3 poder público + 3 sociedade civil), mandato de 2 anos, 1 recondução",
      "Gestão do FUMCIP: Secretaria de Administrações Regionais (mudou da Secretaria de Obras, Lei 7.965/2021)",
    ],
  },
];

// ---------------------------------------------------------------------------
// FLASHCARDS
// ---------------------------------------------------------------------------

const FLASHCARDS: Flashcard[] = [
  // CTM Livro I
  { tema_id: "tributos-municipais", pergunta: "CTM: prazo padrão para cumprir obrigação quando a lei não fixar prazo?", resposta_html: "<b>30 dias</b> (art. 12)." },
  { tema_id: "tributos-municipais", pergunta: "CTM: o que é o DTEM?", resposta_html: "<b>Domicílio Tributário Eletrônico Municipal</b> — comunicação eletrônica obrigatória entre Fazenda e sujeito passivo (art. 25 §2º)." },
  { tema_id: "tributos-municipais", pergunta: "CTM: multa por atraso e juros de mora?", resposta_html: "Multa até <b>10%</b> do tributo devido (art. 60); juros de mora <b>0,5% ao mês</b> (art. 60 §2º / 65 §1º)." },
  { tema_id: "tributos-municipais", pergunta: "CTM: requisitos da dação em pagamento em bens imóveis?", resposta_html: "Imóvel <b>quitado</b>, <b>livre de ônus</b>, <b>avaliado por laudo</b>, e a dação precisa cobrir a <b>totalidade da dívida</b> (art. 55, XI e art. 80)." },
  { tema_id: "tributos-municipais", pergunta: "CTM: quando cabe transação (art. 78)?", resposta_html: "Se o litígio for <b>menor que 350 UFGs</b> OU se a demora for onerosa ao Município." },
  { tema_id: "tributos-municipais", pergunta: "CTM: ordem de imputação em pagamento com múltiplos débitos (art. 61)?", resposta_html: "1) obrigação própria antes de responsabilidade tributária; 2) contribuição de melhoria → taxas → impostos; 3) prazo de prescrição crescente; 4) montante decrescente." },
  { tema_id: "tributos-municipais", pergunta: "CTM: imunidade cultural do art. 118 mais recente (fácil de esquecer)?", resposta_html: "Fonogramas e videofonogramas musicais produzidos no Brasil contendo obras de autores brasileiros (<b>EC 75/2013</b>)." },
  // CTM Livro II - Impostos
  { tema_id: "legislacao-tributaria-municipal", pergunta: "CTM: IPTU não incide sobre imóvel em zona urbana usado para quê (art. 143)?", resposta_html: "Exploração extrativa <b>vegetal, agrícola, pecuária ou agroindustrial</b> comprovada, mesmo estando na zona urbana." },
  { tema_id: "legislacao-tributaria-municipal", pergunta: "CTM: além de compra e venda, o que mais entra na incidência do ITBI (art. 146)?", resposta_html: "<b>Cessão de direitos à sucessão</b> e <b>cessão de benfeitorias em terreno de terceiro</b>, entre outros 12 incisos." },
  { tema_id: "legislacao-tributaria-municipal", pergunta: "CTM: quantos melhoramentos (de 5) uma área precisa ter pra ser zona urbana pra fins de IPTU?", resposta_html: "Mínimo <b>2 de 5</b>: meio-fio+águas pluviais, água, esgoto, iluminação, escola/posto de saúde a até 3km." },
  // CTM Taxas e Contribuição de Melhoria
  { tema_id: "tributos-municipais", pergunta: "CTM: o que a Súmula Vinculante 29 tem a ver com taxas (art. 148, parágrafo único)?", resposta_html: "Taxa não pode ter base de cálculo/fato gerador idêntico a imposto, mas pode usar um ou mais elementos da base de cálculo de imposto, desde que não haja identidade integral." },
  { tema_id: "tributos-municipais", pergunta: "CTM: limites total e individual da Contribuição de Melhoria (art. 203-204)?", resposta_html: "Limite <b>total</b> = custo da obra; limite <b>individual</b> = valorização do imóvel." },
  { tema_id: "tributos-municipais", pergunta: "CTM: prazo mínimo de impugnação da Contribuição de Melhoria?", resposta_html: "<b>30 dias</b>, após publicação prévia de 5 elementos (memorial, orçamento, parcela financiada, zona beneficiada, fator de absorção da valorização)." },
  // Decreto PAT
  { tema_id: "processo-administrativo-tributario", pergunta: "Decreto 21.066/2000: prazo do recurso voluntário (art. 34)?", resposta_html: "<b>20 dias</b> da ciência da decisão de 1ª instância, com efeito devolutivo e suspensivo." },
  { tema_id: "processo-administrativo-tributario", pergunta: "Decreto 21.066/2000: quando pode usar edital pra dar ciência de um ato (art. 5º §3º)?", resposta_html: "Só depois de <b>esgotados</b> os meios de ciência pessoal e carta com AR." },
  { tema_id: "processo-administrativo-tributario", pergunta: "Decreto 21.066/2000: cabe pedido de reconsideração da decisão de 1ª instância?", resposta_html: "<b>Não</b> (art. 30)." },
  { tema_id: "processo-administrativo-tributario", pergunta: "Decreto 21.066/2000: diferença entre nulidade absoluta e ato anulável (arts. 52 e 54)?", resposta_html: "<b>Absoluta</b>: autoridade incompetente, prejuízo à defesa, falta de fundamentação. <b>Anulável</b>: erro de cálculo ou de capitulação legal — corrige de ofício e reabre prazo de <b>5 dias</b> para impugnação." },
  { tema_id: "processo-administrativo-tributario", pergunta: "Decreto 21.066/2000: prazo para o fiscal cientificar o superior de indícios de crime contra a ordem tributária (art. 55)?", resposta_html: "<b>Imediatamente</b>, por protocolo." },
  // Lei 5.767/2001
  { tema_id: "tributos-municipais", pergunta: "Lei 5.767/2001: acréscimo por horário especial de funcionamento (art. 8º)?", resposta_html: "<b>50%</b> sobre a taxa, se funcionar fora do horário normal (dias úteis 8h-22h, sábado 8h-18h, domingo/feriado 8h-12h)." },
  { tema_id: "tributos-municipais", pergunta: "Lei 5.767/2001: quanto paga uma atividade temporária de até 90 dias (art. 9º)?", resposta_html: "<b>50%</b> do valor da tabela; depois disso vira permanente e paga integral." },
  { tema_id: "tributos-municipais", pergunta: "Lei 5.767/2001: diferença entre Taxa de Publicidade Tipo 1 e Tipo 2?", resposta_html: "Tipo 1 = anúncio <b>no próprio estabelecimento</b> (valor-base). Tipo 2 em diante = anúncio <b>fora</b> do estabelecimento ou sem relação com ele (valor maior)." },
  { tema_id: "tributos-municipais", pergunta: "Lei 5.767/2001: quanto paga um anúncio publicitário temporário de até 90 dias (art. 26 §4º)?", resposta_html: "<b>30% ao mês</b> do valor anual." },
  { tema_id: "tributos-municipais", pergunta: "Lei 5.767/2001: o que é o CFP?", resposta_html: "<b>Cadastro Fiscal de Publicidade</b> — registro obrigatório de cada veículo publicitário antes do início da veiculação." },
  // COSIP
  { tema_id: "tributos-municipais", pergunta: "COSIP: quem arrecada e repassa a contribuição ao Município (arts. 5º e 9º)?", resposta_html: "A <b>concessionária</b> de energia elétrica, embutida na fatura." },
  { tema_id: "tributos-municipais", pergunta: "COSIP: alíquotas pós Lei 8.365/2025 para comercial/rural e industrial?", resposta_html: "Comercial/rural/consumo próprio: <b>4%</b>. Industrial: <b>6%</b>. Ambas sobre o total da fatura de energia." },
  { tema_id: "tributos-municipais", pergunta: "COSIP: quanto paga o proprietário de imóvel não edificado (desde 2025)?", resposta_html: "<b>R$ 3,00 por metro linear de testada</b>, cobrado junto com o IPTU." },
  { tema_id: "tributos-municipais", pergunta: "COSIP: isenção residencial de consumo (art. 7º)?", resposta_html: "Consumo <b>≤ 50kWh/mês</b>." },
  { tema_id: "tributos-municipais", pergunta: "COSIP: composição do COMIP?", resposta_html: "<b>6 membros</b> (3 poder público + 3 sociedade civil), mandato de <b>2 anos</b>, 1 recondução, função gratuita e consultiva." },
  { tema_id: "tributos-municipais", pergunta: "COSIP: quem gere o FUMCIP hoje?", resposta_html: "<b>Secretaria de Administrações Regionais</b> (mudou da Secretaria de Obras pela Lei 7.965/2021)." },
];

// ---------------------------------------------------------------------------
// QUESTÕES
// ---------------------------------------------------------------------------

const QUESTOES: Questao[] = [
  {
    tema_id: "tributos-municipais",
    origem: "real",
    enunciado: "Segundo o CTM de Guarulhos (Lei 7.966/2021), quando a legislação não fixar prazo para cumprimento de uma obrigação tributária, o prazo padrão é de:",
    alternativas: [
      { letra: "A", texto: "15 dias" },
      { letra: "B", texto: "20 dias" },
      { letra: "C", texto: "30 dias" },
      { letra: "D", texto: "60 dias" },
      { letra: "E", texto: "90 dias" },
    ],
    gabarito: "C",
    explicacao: "Art. 12 do CTM: na ausência de prazo fixado em lei, o prazo padrão para cumprimento de obrigação tributária é de 30 dias.",
    fonte: "CTM Guarulhos, Lei 7.966/2021, art. 12",
  },
  {
    tema_id: "tributos-municipais",
    origem: "real",
    enunciado: "Sobre a responsabilidade tributária dos sucessores no CTM de Guarulhos, é correto afirmar que:",
    alternativas: [
      { letra: "A", texto: "A alienação judicial de filial ou unidade produtiva isolada em processo de falência sempre gera sucessão tributária" },
      { letra: "B", texto: "Não há qualquer exceção às regras de sucessão do CTN" },
      { letra: "C", texto: "A alienação judicial de filial ou unidade produtiva isolada não gera sucessão, salvo em caso de fraude, parentesco com o devedor ou sócio da sociedade falida/em recuperação" },
      { letra: "D", texto: "A sucessão tributária só se aplica a pessoas físicas" },
    ],
    gabarito: "C",
    explicacao: "Arts. 28-31 do CTM espelham o CTN, mas trazem exceção expressa: alienação judicial de filial/unidade produtiva isolada na falência ou recuperação judicial não gera sucessão, salvo fraude, parentesco com o devedor, ou se o adquirente for sócio da sociedade falida/em recuperação.",
    fonte: "CTM Guarulhos, Lei 7.966/2021, arts. 28-31",
  },
  {
    tema_id: "tributos-municipais",
    origem: "real",
    enunciado: "A dação em pagamento como modalidade de extinção do crédito tributário no CTM de Guarulhos:",
    alternativas: [
      { letra: "A", texto: "Pode ser feita com quaisquer bens, móveis ou imóveis, independentemente de ônus" },
      { letra: "B", texto: "Só é admitida em bens imóveis, quitados, livres de ônus, avaliados por laudo, cobrindo a totalidade da dívida" },
      { letra: "C", texto: "Não é modalidade de extinção prevista no CTM" },
      { letra: "D", texto: "Pode ser parcial, cobrindo apenas parte da dívida" },
    ],
    gabarito: "B",
    explicacao: "Art. 55, XI e art. 80 do CTM: dação em pagamento só é admitida em bens imóveis, que devem estar quitados, livres de ônus, avaliados por laudo, e a dação deve cobrir a totalidade da dívida.",
    fonte: "CTM Guarulhos, Lei 7.966/2021, art. 55, XI e art. 80",
  },
  {
    tema_id: "tributos-municipais",
    origem: "real",
    enunciado: "Havendo múltiplos débitos tributários do mesmo sujeito passivo perante o Município de Guarulhos, a ordem de imputação em pagamento estabelecida pelo CTM prioriza, entre tributos de espécies diferentes:",
    alternativas: [
      { letra: "A", texto: "Impostos, depois taxas, depois contribuição de melhoria" },
      { letra: "B", texto: "Contribuição de melhoria, depois taxas, depois impostos" },
      { letra: "C", texto: "Ordem alfabética do nome do tributo" },
      { letra: "D", texto: "Sempre o montante decrescente, independentemente da espécie" },
    ],
    gabarito: "B",
    explicacao: "Art. 61 do CTM: a ordem é (1) obrigação própria antes de responsabilidade tributária; (2) contribuição de melhoria, depois taxas, depois impostos; (3) prazo de prescrição crescente; (4) montante decrescente.",
    fonte: "CTM Guarulhos, Lei 7.966/2021, art. 61",
  },
  {
    tema_id: "legislacao-tributaria-municipal",
    origem: "real",
    enunciado: "Nos termos do CTM de Guarulhos, o IPTU não incide sobre imóvel localizado em zona urbana quando:",
    alternativas: [
      { letra: "A", texto: "O imóvel estiver vazio, sem edificação" },
      { letra: "B", texto: "O proprietário for pessoa jurídica" },
      { letra: "C", texto: "O imóvel for comprovadamente utilizado em exploração extrativa vegetal, agrícola, pecuária ou agroindustrial" },
      { letra: "D", texto: "O imóvel tiver menos de 2 melhoramentos públicos" },
    ],
    gabarito: "C",
    explicacao: "Art. 143 do CTM: não incide IPTU sobre imóvel em zona urbana comprovadamente usado em exploração extrativa vegetal, agrícola, pecuária ou agroindustrial, mesmo estando dentro da zona urbana.",
    fonte: "CTM Guarulhos, Lei 7.966/2021, art. 143",
  },
  {
    tema_id: "legislacao-tributaria-municipal",
    origem: "real",
    enunciado: "De acordo com o art. 146 do CTM de Guarulhos, está compreendida na incidência do ITBI, além da compra e venda:",
    alternativas: [
      { letra: "A", texto: "Apenas a permuta de imóveis" },
      { letra: "B", texto: "A cessão de direitos à sucessão e a cessão de benfeitorias em terreno de terceiro" },
      { letra: "C", texto: "Somente operações registradas em cartório de imóveis" },
      { letra: "D", texto: "Apenas transmissões causa mortis" },
    ],
    gabarito: "B",
    explicacao: "O art. 146 do CTM traz 12 incisos de hipóteses de incidência do ITBI, incluindo cessão de direitos à sucessão e cessão de benfeitorias em terreno de terceiro, além da compra e venda tradicional.",
    fonte: "CTM Guarulhos, Lei 7.966/2021, art. 146",
  },
  {
    tema_id: "tributos-municipais",
    origem: "real",
    enunciado: "Segundo o CTM de Guarulhos, uma taxa municipal:",
    alternativas: [
      { letra: "A", texto: "Pode ter a mesma base de cálculo de um imposto, desde que instituída por lei complementar" },
      { letra: "B", texto: "Não pode ter base de cálculo ou fato gerador idênticos aos de imposto, nem ser calculada em função do capital das empresas" },
      { letra: "C", texto: "Deve necessariamente ser calculada com base no faturamento da empresa" },
      { letra: "D", texto: "Pode ser cobrada em substituição a qualquer imposto municipal" },
    ],
    gabarito: "B",
    explicacao: "Art. 148, parágrafo único, do CTM, em linha com a Súmula Vinculante 29: taxa não pode ter base de cálculo ou fato gerador idênticos aos de imposto, nem ser calculada em função do capital das empresas.",
    fonte: "CTM Guarulhos, Lei 7.966/2021, art. 148, parágrafo único",
  },
  {
    tema_id: "tributos-municipais",
    origem: "real",
    enunciado: "Sobre a Contribuição de Melhoria prevista no CTM de Guarulhos, é correto afirmar que:",
    alternativas: [
      { letra: "A", texto: "O limite total é o valor de mercado do imóvel beneficiado" },
      { letra: "B", texto: "Não há necessidade de publicação prévia de elementos do projeto" },
      { letra: "C", texto: "O limite total é o custo da obra e o limite individual é a valorização do imóvel, exigida publicação prévia de 5 elementos e prazo mínimo de 30 dias para impugnação" },
      { letra: "D", texto: "O prazo de impugnação é de 90 dias" },
    ],
    gabarito: "C",
    explicacao: "Arts. 203-204 do CTM: limite total = custo da obra; limite individual = valorização do imóvel; exige publicação prévia de 5 elementos (memorial, orçamento, parcela financiada, zona beneficiada, fator de absorção da valorização) e prazo mínimo de 30 dias para impugnação.",
    fonte: "CTM Guarulhos, Lei 7.966/2021, arts. 203-204",
  },
  {
    tema_id: "processo-administrativo-tributario",
    origem: "real",
    enunciado: "Nos termos do Decreto 21.066/2000, que regulamenta a Lei 5.420/99, o prazo para interposição de recurso voluntário contra decisão de 1ª instância no PAT de Guarulhos é de:",
    alternativas: [
      { letra: "A", texto: "10 dias, sem efeito suspensivo" },
      { letra: "B", texto: "15 dias, apenas com efeito devolutivo" },
      { letra: "C", texto: "20 dias, com efeito devolutivo e suspensivo" },
      { letra: "D", texto: "30 dias, apenas com efeito suspensivo" },
      { letra: "E", texto: "45 dias, com efeito devolutivo e suspensivo" },
    ],
    gabarito: "C",
    explicacao: "Art. 34 do Decreto 21.066/2000: o recurso voluntário deve ser interposto em 20 dias da ciência da decisão de 1ª instância, e tem efeito devolutivo e suspensivo.",
    fonte: "Decreto 21.066/2000, art. 34",
  },
  {
    tema_id: "processo-administrativo-tributario",
    origem: "real",
    enunciado: "De acordo com o Decreto 21.066/2000, a ciência dos atos processuais ao contribuinte pode se dar por edital:",
    alternativas: [
      { letra: "A", texto: "A qualquer tempo, a critério da autoridade fiscal" },
      { letra: "B", texto: "Somente depois de esgotados os meios de ciência pessoal e por carta com aviso de recebimento" },
      { letra: "C", texto: "Apenas em processos de valor superior a determinado limite" },
      { letra: "D", texto: "Nunca — o edital não é meio válido de ciência no PAT municipal" },
    ],
    gabarito: "B",
    explicacao: "Art. 5º §3º do Decreto 21.066/2000: o edital só pode ser usado como meio de ciência depois de esgotados os dois meios anteriores (pessoal e carta com AR).",
    fonte: "Decreto 21.066/2000, art. 5º §3º",
  },
  {
    tema_id: "processo-administrativo-tributario",
    origem: "real",
    enunciado: "Sobre nulidades no âmbito do PAT de Guarulhos (Decreto 21.066/2000), assinale a alternativa correta:",
    alternativas: [
      { letra: "A", texto: "Erro de cálculo e erro de capitulação legal geram nulidade absoluta, sem possibilidade de correção" },
      { letra: "B", texto: "Ato de autoridade incompetente, ato que prejudica a defesa e ato sem fundamentação geram nulidade absoluta; erro de cálculo ou de capitulação legal são sanáveis, corrigidos de ofício, reabrindo prazo de 5 dias para impugnação" },
      { letra: "C", texto: "Toda nulidade no PAT é sanável e nunca reabre prazo" },
      { letra: "D", texto: "Somente o contribuinte pode arguir nulidade, nunca a autoridade de ofício" },
    ],
    gabarito: "B",
    explicacao: "Art. 52 do Decreto 21.066/2000: nulidade absoluta em caso de incompetência da autoridade, prejuízo à defesa ou falta de fundamentação. Art. 54: erro de cálculo ou de capitulação legal é sanável — corrige de ofício e reabre prazo de 5 dias para impugnação.",
    fonte: "Decreto 21.066/2000, arts. 52 e 54",
  },
  {
    tema_id: "processo-administrativo-tributario",
    origem: "real",
    enunciado: "Ao identificar indícios de crime contra a ordem tributária no curso de uma fiscalização, a autoridade fiscal de Guarulhos deve, segundo o Decreto 21.066/2000:",
    alternativas: [
      { letra: "A", texto: "Aguardar o encerramento definitivo do PAT antes de qualquer comunicação" },
      { letra: "B", texto: "Cientificar o superior hierárquico imediatamente, por protocolo" },
      { letra: "C", texto: "Comunicar diretamente o Ministério Público, sem passar pelo superior hierárquico" },
      { letra: "D", texto: "Manter sigilo até a decisão de 2ª instância" },
    ],
    gabarito: "B",
    explicacao: "Art. 55 do Decreto 21.066/2000: a autoridade fiscal deve cientificar o superior hierárquico imediatamente, por protocolo, ao identificar indícios de crime contra a ordem tributária.",
    fonte: "Decreto 21.066/2000, art. 55",
  },
  {
    tema_id: "tributos-municipais",
    origem: "real",
    enunciado: "Segundo a Lei 5.767/2001, o funcionamento de estabelecimento fora do horário normal (dias úteis 8h-22h, sábado 8h-18h, domingo/feriado 8h-12h) sujeita o contribuinte, na Taxa de Fiscalização de Instalação, Localização e Funcionamento, a:",
    alternativas: [
      { letra: "A", texto: "Isenção total da taxa" },
      { letra: "B", texto: "Acréscimo de 20% sobre o valor da taxa" },
      { letra: "C", texto: "Acréscimo de 50% sobre o valor da taxa, salvo atividades isentas como hospitais e farmácias" },
      { letra: "D", texto: "Cobrança em dobro, sem exceções" },
    ],
    gabarito: "C",
    explicacao: "Art. 8º da Lei 5.767/2001: acréscimo de 50% para funcionamento em horário especial, com isenção dessa regra para energia elétrica, telefonia, transporte coletivo, funerárias, hospitais/postos de saúde e farmácias.",
    fonte: "Lei 5.767/2001, art. 8º",
  },
  {
    tema_id: "tributos-municipais",
    origem: "real",
    enunciado: "Uma atividade econômica temporária, com duração de até 90 dias, paga a Taxa de Fiscalização de Instalação, Localização e Funcionamento (Lei 5.767/2001) da seguinte forma:",
    alternativas: [
      { letra: "A", texto: "Isenta enquanto durar a atividade" },
      { letra: "B", texto: "50% do valor da tabela; ultrapassado o prazo, vira permanente e paga integral" },
      { letra: "C", texto: "100% do valor da tabela, sem redução" },
      { letra: "D", texto: "25% do valor da tabela, com desconto adicional após 90 dias" },
    ],
    gabarito: "B",
    explicacao: "Art. 9º da Lei 5.767/2001: atividade temporária de até 90 dias paga 50% do valor da tabela; passado esse prazo, a atividade é considerada permanente e passa a pagar o valor integral.",
    fonte: "Lei 5.767/2001, art. 9º",
  },
  {
    tema_id: "tributos-municipais",
    origem: "real",
    enunciado: "Na Taxa de Fiscalização de Publicidade da Lei 5.767/2001, um anúncio veiculado fora do estabelecimento anunciante, sem relação direta com ele, é classificado e tributado como:",
    alternativas: [
      { letra: "A", texto: "Tipo 1, valor-base, igual ao anúncio interno" },
      { letra: "B", texto: "Tipo 2 em diante, com valor superior ao Tipo 1" },
      { letra: "C", texto: "Isento de taxa, por não estar no imóvel do anunciante" },
      { letra: "D", texto: "Cobrado apenas na renovação do CFP" },
    ],
    gabarito: "B",
    explicacao: "Anúncio no próprio estabelecimento onde é veiculado é Tipo 1 (valor-base); anúncio fora do estabelecimento ou sem relação com ele é Tipo 2 em diante, com valor maior.",
    fonte: "Lei 5.767/2001, art. 21 e tabela de cálculo",
  },
  {
    tema_id: "tributos-municipais",
    origem: "real",
    enunciado: "O Cadastro Fiscal de Publicidade (CFP), previsto na Lei 5.767/2001, exige registro:",
    alternativas: [
      { letra: "A", texto: "Apenas de um veículo publicitário por estabelecimento, mesmo que haja vários" },
      { letra: "B", texto: "De cada veículo publicitário, individualmente, antes do início da veiculação, mesmo que vários estejam no mesmo local" },
      { letra: "C", texto: "Somente de anúncios luminosos" },
      { letra: "D", texto: "Somente após decorridos 90 dias da veiculação" },
    ],
    gabarito: "B",
    explicacao: "Arts. 32-34 da Lei 5.767/2001: o CFP exige registro obrigatório de cada veículo publicitário, individualmente, antes do início da veiculação — mesmo que vários estejam no mesmo local.",
    fonte: "Lei 5.767/2001, arts. 32-34",
  },
  {
    tema_id: "tributos-municipais",
    origem: "real",
    enunciado: "Segundo a Lei 7.345/2014 (COSIP), a arrecadação da contribuição para custeio da iluminação pública em Guarulhos é feita:",
    alternativas: [
      { letra: "A", texto: "Diretamente pela Secretaria da Fazenda, via boleto próprio" },
      { letra: "B", texto: "Embutida na fatura de energia elétrica, sendo a concessionária responsável por arrecadar e repassar ao Município" },
      { letra: "C", texto: "Apenas por meio de guia anexa ao carnê do IPTU, para todos os contribuintes" },
      { letra: "D", texto: "Por convênio com instituições bancárias, sem participação da concessionária" },
    ],
    gabarito: "B",
    explicacao: "Arts. 5º e 9º da Lei 7.345/2014: a COSIP é cobrada embutida na fatura de energia elétrica, e a concessionária é quem arrecada e repassa o valor ao Município.",
    fonte: "Lei 7.345/2014, arts. 5º e 9º",
  },
  {
    tema_id: "tributos-municipais",
    origem: "real",
    enunciado: "De acordo com a Lei 7.345/2014, após as alterações da Lei 8.365/2025, as alíquotas da COSIP aplicáveis sobre o total da fatura de energia elétrica para os consumidores comercial/rural/consumo próprio e industrial são, respectivamente:",
    alternativas: [
      { letra: "A", texto: "2% e 4%" },
      { letra: "B", texto: "4% e 6%" },
      { letra: "C", texto: "6% e 8%" },
      { letra: "D", texto: "3% e 5%" },
    ],
    gabarito: "B",
    explicacao: "Pós Lei 8.365/2025: consumidores comercial/rural/consumo próprio pagam alíquota de 4%, e industriais pagam 6%, ambas sobre o total da fatura de energia elétrica.",
    fonte: "Lei 7.345/2014, alterada pela Lei 8.365/2025",
  },
  {
    tema_id: "tributos-municipais",
    origem: "real",
    enunciado: "Desde a reforma de 2025, o proprietário de imóvel não edificado no Município de Guarulhos, em relação à COSIP, deve pagar:",
    alternativas: [
      { letra: "A", texto: "O mesmo valor de um imóvel edificado equivalente" },
      { letra: "B", texto: "R$ 3,00 por metro linear de testada, cobrado junto com o IPTU" },
      { letra: "C", texto: "Está isento de qualquer cobrança" },
      { letra: "D", texto: "Uma alíquota de 6% sobre o valor venal do imóvel" },
    ],
    gabarito: "B",
    explicacao: "Desde a reforma de 2025, proprietários de imóveis não edificados passaram a pagar R$ 3,00 por metro linear de testada, cobrado junto com o IPTU.",
    fonte: "Lei 7.345/2014, alterada em 2025",
  },
  {
    tema_id: "tributos-municipais",
    origem: "real",
    enunciado: "O Conselho Municipal de Iluminação Pública (COMIP), previsto na Lei 7.345/2014, é composto por:",
    alternativas: [
      { letra: "A", texto: "4 membros, todos do poder público, mandato vitalício" },
      { letra: "B", texto: "6 membros (3 poder público + 3 sociedade civil), mandato de 2 anos, com 1 recondução, função gratuita e consultiva" },
      { letra: "C", texto: "10 membros eleitos por voto popular direto" },
      { letra: "D", texto: "6 membros, todos da sociedade civil, mandato de 4 anos sem recondução" },
    ],
    gabarito: "B",
    explicacao: "Arts. 12 e 16-18 da Lei 7.345/2014: o COMIP tem 6 membros (3 do poder público e 3 da sociedade civil), mandato de 2 anos com 1 recondução, e função gratuita e consultiva.",
    fonte: "Lei 7.345/2014, arts. 12 e 16-18",
  },
];

async function main() {
  console.log("Populando conteúdo do lote 2 (CTM, Decreto PAT, Lei 5.767/2001, COSIP)...\n");

  // limpa conteúdo do lote 2 já inserido antes, pra rodar o script de novo sem duplicar
  const titulosLote2 = RESUMOS.map((r) => r.titulo);
  await supabase.from("resumos").delete().in("titulo", titulosLote2);
  const fontesLote2 = [...new Set(QUESTOES.map((q) => q.fonte))];
  await supabase.from("questoes").delete().in("fonte", fontesLote2);

  const { error: errResumos } = await supabase.from("resumos").insert(RESUMOS);
  if (errResumos) console.error("Erro ao inserir resumos:", errResumos.message);
  else console.log(`OK: ${RESUMOS.length} resumos inseridos.`);

  const { error: errFlashcards } = await supabase.from("flashcards").insert(FLASHCARDS);
  if (errFlashcards) console.error("Erro ao inserir flashcards:", errFlashcards.message);
  else console.log(`OK: ${FLASHCARDS.length} flashcards inseridos.`);

  const { error: errQuestoes } = await supabase.from("questoes").insert(QUESTOES);
  if (errQuestoes) console.error("Erro ao inserir questões:", errQuestoes.message);
  else console.log(`OK: ${QUESTOES.length} questões inseridas.`);

  console.log("\nFeito.");
}

main();
