/**
 * Popula o Simulado 1 — prova de 40 questões cobrindo os temas das semanas
 * 1 a 6 do plano (Direito Tributário, Legislação Tributária Municipal,
 * Tributos Municipais, PAT, Reforma Tributária, Contabilidade Fiscal,
 * Auditoria Fiscal, Direito Administrativo e Direito Constitucional).
 *
 * Mistura questões REAIS de provas IBAM (gabarito oficial, fonte indicada)
 * com questões INÉDITAS no estilo da banca, ancoradas na legislação de
 * Guarulhos e nas normas gerais do edital.
 *
 * As respostas ficam em `simulado_respostas`, totalmente separadas do
 * caderno de questões normal — responder o simulado não mexe na engine de
 * fase nem nas estatísticas de `respostas`.
 *
 * Idempotente: upsert por (simulado_id, numero) — pode rodar de novo.
 *
 * Uso: npx tsx scripts/seed-simulado.ts
 */
import { config } from "dotenv";
config({ path: ".env.local" });
import { createClient } from "@supabase/supabase-js";

export const SIMULADO = {
  id: "simulado-1",
  titulo: "Simulado 1 — Semanas 1 a 6",
  descricao:
    "40 questões no formato IBAM cobrindo Direito Tributário, Legislação Tributária Municipal, " +
    "Tributos Municipais, PAT, Reforma Tributária, Contabilidade, Auditoria e Direito " +
    "Administrativo/Constitucional. Mistura provas reais da banca com inéditas no mesmo estilo.",
  ordem: 1,
};

type QuestaoSeed = {
  numero: number;
  tema_id: string;
  origem: "real" | "estilo";
  enunciado: string;
  alternativas: { letra: string; texto: string }[];
  gabarito: string;
  explicacao: string;
  fonte: string;
};

const A = (textos: string[]) =>
  textos.map((texto, i) => ({ letra: "ABCD"[i], texto }));

export const QUESTOES: QuestaoSeed[] = [
  // ------------------- DIREITO TRIBUTÁRIO (1-6) -------------------
  {
    numero: 1,
    tema_id: "direito-tributario",
    origem: "real",
    enunciado:
      "Indique, dentre as alternativas abaixo, aquela que NÃO contempla hipótese de extinção do crédito tributário.",
    alternativas: A(["Transação.", "Prescrição.", "Anistia.", "Remissão."]),
    gabarito: "C",
    explicacao:
      "Anistia é hipótese de EXCLUSÃO (CTN, art. 175), junto com a isenção. Cuidado com o par remissão (extinção) × anistia (exclusão).",
    fonte: "IBAM 2020 · Santos/SP · Auditor Fiscal · Q43",
  },
  {
    numero: 2,
    tema_id: "direito-tributario",
    origem: "real",
    enunciado:
      "Indique, dentre as alternativas abaixo, aquela que, nos termos do CTN, suspende a exigibilidade do crédito tributário.",
    alternativas: A(["Moratória.", "Transação.", "Prescrição.", "Remissão."]),
    gabarito: "A",
    explicacao:
      "CTN, art. 151 — mnemônico MORDER-LIMPAR: MORatória, DEpósito, Reclamações/recursos, LIMinar, PARcelamento.",
    fonte: "IBAM 2014 · Mauá/SP · Fiscal de Tributos I · Q27",
  },
  {
    numero: 3,
    tema_id: "direito-tributario",
    origem: "real",
    enunciado:
      "De acordo com as normas gerais de direito tributário, a respeito do lançamento tributário, NÃO é correto afirmar que:",
    alternativas: A([
      "a atividade administrativa de lançamento é vinculada e obrigatória, sob pena de responsabilidade funcional.",
      "a revisão do lançamento só pode ser iniciada enquanto não extinto o direito da Fazenda Pública.",
      "não se aplica ao lançamento a legislação que, posteriormente à ocorrência do fato gerador da obrigação, tenha instituído novos critérios de apuração.",
      "o lançamento reporta-se à data da ocorrência do fato gerador da obrigação e rege-se pela lei então vigente, ainda que posteriormente modificada ou revogada.",
    ]),
    gabarito: "C",
    explicacao:
      "CTN, art. 144, §1º: aplica-se ao lançamento a legislação posterior que institua novos critérios de apuração/fiscalização ou amplie poderes de investigação.",
    fonte: "IBAM 2020 · Santos/SP · Auditor Fiscal · Q45",
  },
  {
    numero: 4,
    tema_id: "direito-tributario",
    origem: "real",
    enunciado: "Sobre o crédito tributário, é correto afirmar que:",
    alternativas: A([
      "decorre da obrigação principal, mas possui natureza de dever instrumental.",
      "quando regularmente constituído, somente se modifica ou extingue, ou tem sua exigibilidade suspensa ou excluída, nos casos previstos em lei.",
      "somente será lançado de ofício nos casos de inércia do contribuinte.",
      "sempre que modificado, anula o fato gerador que lhe deu origem.",
    ]),
    gabarito: "B",
    explicacao:
      "CTN, art. 141: o crédito regularmente constituído só se modifica/extingue/suspende/exclui nos casos previstos em lei — reserva legal. A alternativa A confunde crédito (obrigação principal, art. 113 §1º) com obrigação acessória (dever instrumental); C ignora as demais hipóteses de lançamento de ofício (art. 149); D é absurda: modificar o crédito não desfaz o fato gerador.",
    fonte: "IBAM 2026 · Arraial do Cabo/RJ · Fiscal de Rendas · Q07",
  },
  {
    numero: 5,
    tema_id: "direito-tributario",
    origem: "real",
    enunciado: "Assinale a afirmativa INCORRETA sobre o fato gerador da obrigação tributária:",
    alternativas: A([
      "em se tratando de obrigação principal, é a situação definida em lei como necessária e suficiente à sua ocorrência.",
      "em situação de fato, ocorre quando se verifiquem as circunstâncias materiais necessárias a que produza os efeitos que normalmente lhe são próprios.",
      "em se tratando de obrigação acessória, é qualquer situação que, na forma da legislação aplicável, impõe a prática ou abstenção de ato que não configure obrigação principal.",
      "a definição do fato gerador é interpretada com a abstração da natureza dos atos supostamente praticados pelos contribuintes.",
    ]),
    gabarito: "D",
    explicacao:
      "O art. 118 do CTN manda abstrair a VALIDADE JURÍDICA dos atos e a natureza do OBJETO ou dos EFEITOS — não 'a natureza dos atos'. É o princípio do 'non olet' (tributa-se ainda que a atividade seja ilícita). A (art. 114), B (art. 116, I) e C (art. 115) reproduzem o CTN.",
    fonte: "IBAM 2026 · Arraial do Cabo/RJ · Fiscal de Rendas · Q13",
  },
  {
    numero: 6,
    tema_id: "direito-tributario",
    origem: "real",
    enunciado: "O contribuinte que pagou tributo a maior poderá restituir:",
    alternativas: A([
      "o valor pago dentro de 10 anos se for o caso de tributo sujeito ao lançamento por homologação.",
      "o valor pago em até 5 anos contados da extinção do crédito tributário.",
      "o valor pago, desde que comprove que ocorreu a transferência do respectivo encargo financeiro para o contribuinte de fato.",
      "o valor pago indevidamente acrescido de juros, mas sem direito à devolução de multas, ainda que de caráter material.",
    ]),
    gabarito: "B",
    explicacao:
      "CTN, art. 168, I: prazo de 5 anos para pleitear restituição, contados da extinção do crédito. A 'tese dos 10 anos' (5+5) foi superada pela LC 118/2005. C inverte o art. 166 (tributo indireto: precisa provar que ASSUMIU o encargo ou ter autorização de quem assumiu). D erra: multa indevida também se restitui.",
    fonte: "IBAM 2026 · Arraial do Cabo/RJ · Fiscal de Rendas · Q20",
  },
  // ------------- LEGISLAÇÃO TRIBUTÁRIA MUNICIPAL (7-13) -------------
  {
    numero: 7,
    tema_id: "legislacao-tributaria-municipal",
    origem: "estilo",
    enunciado:
      "Nos termos da Lei Complementar nº 116/2003, o ISS considera-se devido, como regra geral:",
    alternativas: A([
      "no local do estabelecimento do tomador do serviço, qualquer que seja o serviço prestado.",
      "no local do estabelecimento prestador ou, na sua falta, no local do domicílio do prestador, ressalvadas as exceções expressas em que o imposto é devido no local da prestação.",
      "no Município onde o serviço produzir efeitos econômicos, conforme definido em decreto municipal.",
      "sempre no local da efetiva prestação do serviço, independentemente do estabelecimento prestador.",
    ]),
    gabarito: "B",
    explicacao:
      "LC 116/2003, art. 3º: a regra geral é o local do estabelecimento prestador (ou domicílio do prestador). As exceções dos incisos — como construção civil, que é devida no local da obra — deslocam a incidência para o local da prestação.",
    fonte: "Inédita no estilo IBAM — LC 116/2003, art. 3º",
  },
  {
    numero: 8,
    tema_id: "legislacao-tributaria-municipal",
    origem: "estilo",
    enunciado:
      "Quanto às alíquotas do ISS, a legislação complementar nacional estabelece que:",
    alternativas: A([
      "a alíquota mínima é de 2% e a máxima de 5%, vedada a concessão de benefícios que resultem, direta ou indiretamente, em carga inferior à mínima, ressalvadas as exceções legais.",
      "a alíquota máxima é de 2% e a mínima fica a critério de cada Município.",
      "não há alíquota mínima, apenas a máxima de 5%.",
      "a alíquota é fixada exclusivamente pelo Senado Federal, por resolução.",
    ]),
    gabarito: "A",
    explicacao:
      "LC 116/2003, art. 8º (máxima de 5%) e art. 8º-A, incluído pela LC 157/2016 (mínima de 2%, com vedação de benefícios que burlem o piso — combate à guerra fiscal entre Municípios).",
    fonte: "Inédita no estilo IBAM — LC 116/2003, arts. 8º e 8º-A",
  },
  {
    numero: 9,
    tema_id: "legislacao-tributaria-municipal",
    origem: "estilo",
    enunciado: "Sobre a progressividade do IPTU, é correto afirmar que:",
    alternativas: A([
      "o IPTU não admite qualquer forma de progressividade, por ser imposto de natureza real.",
      "a Constituição admite apenas a progressividade no tempo, como sanção pelo descumprimento da função social da propriedade.",
      "o IPTU pode ser progressivo em razão do valor do imóvel e ter alíquotas diferentes de acordo com a localização e o uso, além da progressividade no tempo prevista na política urbana.",
      "a progressividade em razão do valor do imóvel depende de lei complementar federal específica.",
    ]),
    gabarito: "C",
    explicacao:
      "CF, art. 156, §1º (redação da EC 29/2000): progressividade em razão do valor do imóvel e alíquotas diferentes por localização e uso. Além disso, o art. 182, §4º, II prevê a progressividade no tempo como instrumento de política urbana (função social). Basta lei municipal.",
    fonte: "Inédita no estilo IBAM — CF, art. 156, §1º e art. 182, §4º, II",
  },
  {
    numero: 10,
    tema_id: "legislacao-tributaria-municipal",
    origem: "estilo",
    enunciado:
      "Para que um imóvel seja considerado em zona urbana para fins de incidência do IPTU, a lei exige a existência de melhoramentos construídos ou mantidos pelo Poder Público. Nos termos do CTN — regra reproduzida pelo CTM de Guarulhos —, exige-se o mínimo de:",
    alternativas: A([
      "1 dos 5 melhoramentos indicados em lei.",
      "2 dos 5 melhoramentos indicados em lei.",
      "3 dos 5 melhoramentos indicados em lei.",
      "todos os 5 melhoramentos indicados em lei.",
    ]),
    gabarito: "B",
    explicacao:
      "CTN, art. 32, §1º: mínimo de 2 dos 5 melhoramentos — meio-fio ou calçamento com canalização de águas pluviais; abastecimento de água; esgoto sanitário; rede de iluminação pública; escola primária ou posto de saúde a até 3 km do imóvel.",
    fonte: "Inédita no estilo IBAM — CTN, art. 32, §1º; CTM Guarulhos (Lei 7.966/2021)",
  },
  {
    numero: 11,
    tema_id: "legislacao-tributaria-municipal",
    origem: "estilo",
    enunciado: "Nos termos da Constituição Federal, o ITBI NÃO incide sobre:",
    alternativas: A([
      "a cessão de direitos relativos à aquisição de bens imóveis.",
      "a transmissão onerosa de direitos reais sobre imóveis, exceto os de garantia.",
      "a incorporação de bens imóveis ao patrimônio de pessoa jurídica em realização de capital, salvo se a atividade preponderante do adquirente for a compra e venda, locação ou arrendamento mercantil de imóveis.",
      "a compra e venda de imóvel entre particulares realizada por escritura pública.",
    ]),
    gabarito: "C",
    explicacao:
      "CF, art. 156, §2º, I: imunidade nas incorporações ao patrimônio de pessoa jurídica em realização de capital e nas transmissões por fusão, incorporação, cisão ou extinção — salvo se a atividade preponderante do adquirente for imobiliária (compra e venda, locação ou arrendamento mercantil).",
    fonte: "Inédita no estilo IBAM — CF, art. 156, §2º, I",
  },
  {
    numero: 12,
    tema_id: "legislacao-tributaria-municipal",
    origem: "estilo",
    enunciado: "A respeito do ITBI, é correto afirmar que o imposto compete:",
    alternativas: A([
      "ao Município de domicílio do transmitente do bem.",
      "ao Município da situação do bem imóvel transmitido.",
      "ao Estado em que se lavrar a escritura pública de transmissão.",
      "ao Município em que for registrado o contrato social do adquirente, quando pessoa jurídica.",
    ]),
    gabarito: "B",
    explicacao:
      "CF, art. 156, §2º, II: o ITBI compete ao Município da situação do bem. Não importa onde moram as partes nem onde a escritura é lavrada.",
    fonte: "Inédita no estilo IBAM — CF, art. 156, §2º, II",
  },
  {
    numero: 13,
    tema_id: "legislacao-tributaria-municipal",
    origem: "real",
    enunciado:
      "Sobre a imunidade tributária, a Constituição Federal veda instituir impostos sobre patrimônio, renda ou serviços; contudo, tal imunidade NÃO se aplica ao patrimônio/renda/serviços que não representem as finalidades essenciais de entidades:",
    alternativas: A([
      "religiosas, templos e partidos políticos.",
      "da União, Estados e Municípios.",
      "de livros, jornais e revistas.",
      "educacionais e hospitalares.",
    ]),
    gabarito: "B",
    explicacao:
      "CF, art. 150, §4º: a restrição 'somente às finalidades essenciais' aplica-se à imunidade de templos (VI, 'b') e de entidades sem fins lucrativos (VI, 'c'). A imunidade RECÍPROCA (entes federativos, VI, 'a') tem tratamento próprio nos §§2º e 3º. A questão foi construída para você marcar a exceção.",
    fonte: "IBAM 2026 · Arraial do Cabo/RJ · Fiscal de Rendas · Q38",
  },
  // ---------------- TRIBUTOS MUNICIPAIS (14-19) ----------------
  {
    numero: 14,
    tema_id: "tributos-municipais",
    origem: "estilo",
    enunciado:
      "Nos termos do Código Tributário Municipal de Guarulhos (Lei nº 7.966/2021), a lei que institui ou majora tributo municipal entra em vigor:",
    alternativas: A([
      "na data de sua publicação, por se tratar de norma municipal.",
      "no primeiro dia do exercício seguinte ao da publicação, ainda que não decorridos 90 dias.",
      "após decorridos 90 dias da publicação, ainda que dentro do mesmo exercício financeiro.",
      "não antes do primeiro dia do exercício seguinte nem antes de decorridos 90 dias da data da publicação.",
    ]),
    gabarito: "D",
    explicacao:
      "CTM, art. 5º: o Código incorpora expressamente as duas anterioridades da CF — a anual (exercício seguinte) e a nonagesimal (90 dias) — que se aplicam cumulativamente, prevalecendo a data mais tardia.",
    fonte: "Inédita no estilo IBAM — CTM Guarulhos, Lei 7.966/2021, art. 5º",
  },
  {
    numero: 15,
    tema_id: "tributos-municipais",
    origem: "estilo",
    enunciado:
      "Quanto aos acréscimos moratórios previstos no Código Tributário Municipal de Guarulhos, o pagamento de tributo fora do prazo sujeita o contribuinte a:",
    alternativas: A([
      "multa de até 10% do tributo devido e juros de mora de 0,5% ao mês.",
      "multa de até 20% do tributo devido e juros de mora de 1% ao mês.",
      "multa fixa de 2% e juros equivalentes à taxa SELIC.",
      "apenas juros de mora de 1% ao mês, vedada multa moratória.",
    ]),
    gabarito: "A",
    explicacao:
      "CTM, art. 60 e §2º (c/c art. 65, §1º): multa por atraso de até 10% do tributo devido e juros de mora de 0,5% ao mês. Pegadinha clássica contra quem responde no automático com os valores 'padrão' de outras leis (20% / 1% / SELIC).",
    fonte: "Inédita no estilo IBAM — CTM Guarulhos, Lei 7.966/2021, arts. 60 e 65",
  },
  {
    numero: 16,
    tema_id: "tributos-municipais",
    origem: "estilo",
    enunciado:
      "A transação, como forma de extinção do crédito tributário no Município de Guarulhos, é admitida pelo CTM quando:",
    alternativas: A([
      "o litígio for inferior a 350 UFGs ou a demora na solução for onerosa ao Município.",
      "o litígio for superior a 350 UFGs, independentemente de outros requisitos.",
      "houver simples conveniência da autoridade fiscal, sem parâmetro legal.",
      "o contribuinte comprovar incapacidade financeira, hipótese em que a dívida é integralmente perdoada.",
    ]),
    gabarito: "A",
    explicacao:
      "CTM, art. 78: transação apenas se o litígio for INFERIOR a 350 UFGs OU se a demora na solução for onerosa ao Município. A alternativa D descreve remissão, não transação.",
    fonte: "Inédita no estilo IBAM — CTM Guarulhos, Lei 7.966/2021, art. 78",
  },
  {
    numero: 17,
    tema_id: "tributos-municipais",
    origem: "estilo",
    enunciado:
      "Nos termos da Lei nº 5.767/2001 de Guarulhos, quanto à Taxa de Fiscalização de Instalação, Localização e Funcionamento, é correto afirmar que:",
    alternativas: A([
      "o funcionamento em horário especial, fora do horário normal, sujeita o estabelecimento a acréscimo de 50% sobre a taxa.",
      "a atividade temporária, exercida por até 90 dias, é isenta da taxa.",
      "a taxa somente é devida por estabelecimentos com localização fixa e funcionamento efetivo.",
      "a taxa é calculada em função do capital social da empresa fiscalizada.",
    ]),
    gabarito: "A",
    explicacao:
      "Art. 8º da Lei 5.767/2001: acréscimo de 50% para horário especial. A atividade temporária (até 90 dias) não é isenta — paga 50% da tabela (art. 9º). A taxa independe de estabelecimento fixo e de efetivo funcionamento (art. 4º), e taxa calculada sobre capital das empresas é vedada (CTM, art. 148, parágrafo único; Súmula Vinculante 29).",
    fonte: "Inédita no estilo IBAM — Lei 5.767/2001 (Guarulhos), arts. 4º, 8º e 9º",
  },
  {
    numero: 18,
    tema_id: "tributos-municipais",
    origem: "estilo",
    enunciado:
      "Sobre a Taxa de Fiscalização de Publicidade do Município de Guarulhos (Lei nº 5.767/2001), assinale a alternativa correta.",
    alternativas: A([
      "O anúncio veiculado no próprio estabelecimento paga valor maior que o anúncio veiculado fora dele.",
      "Os anúncios temporários, de até 90 dias, pagam 30% ao mês do valor anual da taxa.",
      "O Cadastro Fiscal de Publicidade (CFP) só é exigido quando houver mais de um veículo publicitário no mesmo local.",
      "A propaganda político-eleitoral sujeita-se normalmente à taxa.",
    ]),
    gabarito: "B",
    explicacao:
      "Art. 26, §4º: anúncio temporário (até 90 dias) paga 30% ao mês do valor anual. O anúncio no próprio estabelecimento é o Tipo 1, de valor-base — fora dele o valor é maior (não o contrário); o CFP é obrigatório para CADA veículo publicitário antes da veiculação (arts. 32-34); e a propaganda político-eleitoral é isenta (art. 23).",
    fonte: "Inédita no estilo IBAM — Lei 5.767/2001 (Guarulhos), arts. 23, 26 e 32-34",
  },
  {
    numero: 19,
    tema_id: "tributos-municipais",
    origem: "estilo",
    enunciado:
      "A respeito da COSIP no Município de Guarulhos (Lei nº 7.345/2014, com as alterações de 2025), é correto afirmar que:",
    alternativas: A([
      "a arrecadação é feita diretamente pela Secretaria Municipal da Fazenda, mediante guia própria.",
      "os imóveis residenciais com consumo mensal de até 100 kWh são isentos.",
      "a contribuição é arrecadada pela concessionária de energia elétrica, embutida na fatura, e repassada ao Município; consumidores comerciais pagam 4% e industriais 6% sobre a fatura.",
      "os proprietários de imóveis não edificados permanecem fora do campo de incidência da contribuição.",
    ]),
    gabarito: "C",
    explicacao:
      "Arts. 5º e 9º: a concessionária arrecada e repassa. Alíquotas pós Lei 8.365/2025: comercial/rural/consumo próprio 4%, industrial 6%. A isenção residencial é para consumo de até 50 kWh (não 100), e desde 2025 os imóveis NÃO edificados pagam R$ 3,00 por metro linear de testada, junto com o IPTU.",
    fonte: "Inédita no estilo IBAM — Lei 7.345/2014 (Guarulhos), arts. 5º, 7º e 9º",
  },
  // ------------ PROCESSO ADMINISTRATIVO TRIBUTÁRIO (20-23) ------------
  {
    numero: 20,
    tema_id: "processo-administrativo-tributario",
    origem: "estilo",
    enunciado:
      "Nos termos do Decreto nº 21.066/2000, que regulamenta o Processo Administrativo Tributário no Município de Guarulhos, o recurso voluntário contra decisão de primeira instância deve ser interposto no prazo de:",
    alternativas: A([
      "15 dias, com efeito meramente devolutivo.",
      "20 dias contados da ciência da decisão, com efeitos devolutivo e suspensivo.",
      "30 dias contados da ciência da decisão, com efeitos devolutivo e suspensivo.",
      "10 dias, dirigido à mesma autoridade que proferiu a decisão, como pedido de reconsideração.",
    ]),
    gabarito: "B",
    explicacao:
      "Art. 34 do Decreto 21.066/2000: recurso voluntário em 20 dias da ciência, com efeito devolutivo E suspensivo. O prazo de 30 dias é a pegadinha mais cobrada — e pedido de reconsideração da decisão de 1ª instância não é cabível (art. 30).",
    fonte: "Inédita no estilo IBAM — Decreto 21.066/2000 (Guarulhos), arts. 30 e 34",
  },
  {
    numero: 21,
    tema_id: "processo-administrativo-tributario",
    origem: "estilo",
    enunciado:
      "Quanto à ciência dos atos do Processo Administrativo Tributário de Guarulhos, a intimação por edital:",
    alternativas: A([
      "pode ser utilizada livremente, a critério da autoridade fiscal.",
      "é vedada em qualquer hipótese, por violar o contraditório.",
      "somente pode ser utilizada depois de esgotados os meios de ciência pessoal e por carta com aviso de recebimento.",
      "é o meio preferencial quando o débito superar valor fixado em lei.",
    ]),
    gabarito: "C",
    explicacao:
      "Art. 5º, §3º do Decreto 21.066/2000: o edital é subsidiário — só cabe depois de esgotadas a ciência pessoal e a carta com AR. Mesma lógica do CTN e da jurisprudência: a citação/intimação ficta é a última alternativa.",
    fonte: "Inédita no estilo IBAM — Decreto 21.066/2000 (Guarulhos), art. 5º, §3º",
  },
  {
    numero: 22,
    tema_id: "processo-administrativo-tributario",
    origem: "estilo",
    enunciado:
      "No regulamento do PAT de Guarulhos, é hipótese de NULIDADE ABSOLUTA do ato processual:",
    alternativas: A([
      "o erro de cálculo no lançamento, que pode ser corrigido de ofício.",
      "o erro na capitulação legal da infração.",
      "o ato praticado por autoridade incompetente, o ato que prejudique a defesa e o ato sem fundamentação.",
      "qualquer vício formal, ainda que não cause prejuízo à defesa.",
    ]),
    gabarito: "C",
    explicacao:
      "Art. 52 do Decreto 21.066/2000: nulidade absoluta em três hipóteses — autoridade incompetente, prejuízo à defesa e falta de fundamentação. Erro de cálculo e erro de capitulação legal são meramente ANULÁVEIS (sanáveis): corrigem-se de ofício, reabrindo prazo de 5 dias para impugnação (art. 54).",
    fonte: "Inédita no estilo IBAM — Decreto 21.066/2000 (Guarulhos), arts. 52 e 54",
  },
  {
    numero: 23,
    tema_id: "processo-administrativo-tributario",
    origem: "estilo",
    enunciado:
      "Sobre o duplo grau no Processo Administrativo Tributário de Guarulhos, é correto afirmar que:",
    alternativas: A([
      "cabe pedido de reconsideração da decisão de primeira instância, no prazo de 10 dias.",
      "a decisão de primeira instância que exonera o contribuinte acima do valor fixado em lei sujeita-se a recurso de ofício (reexame necessário).",
      "o recurso de ofício é cabível em toda e qualquer decisão favorável ao contribuinte, sem exceções.",
      "a autoridade fiscal que identificar indícios de crime contra a ordem tributária deve aguardar o trânsito em julgado administrativo para comunicar o superior.",
    ]),
    gabarito: "B",
    explicacao:
      "Recurso de ofício quando a decisão exonera o contribuinte acima do valor legal (art. 29 do Decreto c/c art. 51 da Lei 5.420/99). Não cabe reconsideração (art. 30); há hipóteses de dispensa do recurso de ofício por 'erro manifesto' e 'direito líquido e certo' (art. 33); e indícios de crime devem ser comunicados ao superior IMEDIATAMENTE, por protocolo (art. 55).",
    fonte: "Inédita no estilo IBAM — Decreto 21.066/2000 (Guarulhos), arts. 29, 30, 33 e 55",
  },
  // ----------------- REFORMA TRIBUTÁRIA (24-28) -----------------
  {
    numero: 24,
    tema_id: "reforma-tributaria",
    origem: "real",
    enunciado:
      "A Emenda Constitucional nº 132/23 inseriu novos princípios constitucionais tributários na Constituição Federal. Além de simplicidade, transparência e justiça tributária, são eles:",
    alternativas: A([
      "capacidade contributiva e anterioridade nonagesimal.",
      "anterioridade nonagesimal e eficiência tributária.",
      "cooperação e defesa do meio ambiente.",
      "cooperação e legalidade.",
    ]),
    gabarito: "C",
    explicacao:
      "EC 132/2023 acrescentou ao art. 145 da CF os princípios da simplicidade, transparência, justiça tributária, COOPERAÇÃO e DEFESA DO MEIO AMBIENTE. Capacidade contributiva, anterioridade e legalidade já existiam antes — pegadinha clássica de misturar princípio novo com antigo.",
    fonte: "IBAM 2026 · Arraial do Cabo/RJ · Fiscal de Rendas · Q02",
  },
  {
    numero: 25,
    tema_id: "reforma-tributaria",
    origem: "estilo",
    enunciado:
      "Sobre o Imposto sobre Bens e Serviços (IBS), criado pela Emenda Constitucional nº 132/2023, é correto afirmar que:",
    alternativas: A([
      "é imposto de competência exclusiva da União, que repassará percentuais aos demais entes.",
      "é instituído por lei complementar, de competência compartilhada entre Estados, Distrito Federal e Municípios, cobrado no destino, e substituirá o ICMS e o ISS.",
      "substituirá o IPTU e o ITBI, unificando a tributação municipal sobre o patrimônio.",
      "será cobrado na origem, preservando a arrecadação dos Municípios onde estão os estabelecimentos prestadores.",
    ]),
    gabarito: "B",
    explicacao:
      "CF, art. 156-A (EC 132/2023): o IBS é instituído por lei complementar (LC 214/2025), de competência compartilhada entre Estados, DF e Municípios, gerido pelo Comitê Gestor, com incidência no DESTINO e não cumulatividade ampla. Substitui ICMS (estadual) e ISS (municipal) — impostos sobre consumo, não sobre patrimônio.",
    fonte: "Inédita no estilo IBAM — CF, art. 156-A; EC 132/2023; LC 214/2025",
  },
  {
    numero: 26,
    tema_id: "reforma-tributaria",
    origem: "estilo",
    enunciado:
      "A Contribuição sobre Bens e Serviços (CBS), instituída no âmbito da reforma tributária do consumo, substituirá:",
    alternativas: A([
      "o ICMS e o ISS.",
      "o IPTU e o ITR.",
      "a contribuição para o PIS e a Cofins.",
      "o Imposto de Renda das pessoas jurídicas.",
    ]),
    gabarito: "C",
    explicacao:
      "A CBS é o tributo FEDERAL da reforma (CF, art. 195, V; LC 214/2025) e substitui PIS e Cofins. O par ICMS+ISS é substituído pelo IBS. Decorar o 'de-para': PIS/Cofins → CBS; ICMS/ISS → IBS.",
    fonte: "Inédita no estilo IBAM — CF, art. 195, V; EC 132/2023; LC 214/2025",
  },
  {
    numero: 27,
    tema_id: "reforma-tributaria",
    origem: "estilo",
    enunciado: "O Imposto Seletivo (IS), previsto pela Emenda Constitucional nº 132/2023:",
    alternativas: A([
      "incidirá sobre a produção, extração, comercialização ou importação de bens e serviços prejudiciais à saúde ou ao meio ambiente.",
      "incidirá sobre bens e serviços essenciais, para garantir arrecadação estável à União.",
      "é de competência municipal, substituindo a COSIP.",
      "incidirá sobre quaisquer bens supérfluos, conforme definição de decreto do Poder Executivo.",
    ]),
    gabarito: "A",
    explicacao:
      "CF, art. 153, VIII: o IS — apelidado de 'imposto do pecado' — é federal e incide sobre bens e serviços prejudiciais à saúde ou ao meio ambiente, nos termos de lei complementar. É extrafiscal: o objetivo é desestimular o consumo, não arrecadar sobre essenciais.",
    fonte: "Inédita no estilo IBAM — CF, art. 153, VIII; EC 132/2023",
  },
  {
    numero: 28,
    tema_id: "reforma-tributaria",
    origem: "estilo",
    enunciado:
      "Quanto à transição da reforma tributária do consumo relevante para os Municípios, o ISS:",
    alternativas: A([
      "foi extinto imediatamente com a promulgação da EC 132/2023.",
      "terá suas alíquotas reduzidas gradualmente entre 2029 e 2032, sendo extinto a partir de 2033, quando o IBS vigorará integralmente.",
      "permanecerá em vigor por prazo indeterminado, convivendo com o IBS.",
      "será substituído pela CBS a partir de 2027.",
    ]),
    gabarito: "B",
    explicacao:
      "Regra de transição da EC 132/2023 (ADCT): entre 2029 e 2032 as alíquotas de ICMS e ISS caem gradualmente (9/10, 8/10, 7/10, 6/10) com aumento proporcional do IBS; a partir de 2033 ICMS e ISS estão extintos. A CBS substitui PIS/Cofins (em 2027), não o ISS.",
    fonte: "Inédita no estilo IBAM — EC 132/2023, regras de transição (ADCT)",
  },
  // ---------------- CONTABILIDADE FISCAL (29-32) ----------------
  {
    numero: 29,
    tema_id: "contabilidade-fiscal",
    origem: "real",
    enunciado:
      "Assinale o critério contábil que determina que os registros devem ser feitos no momento em que as transações ocorrem, e não quando o pagamento ou recebimento é realizado:",
    alternativas: A(["Relevância.", "Consistência.", "Prudência.", "Competência."]),
    gabarito: "D",
    explicacao:
      "Regime de COMPETÊNCIA: reconhece receitas e despesas no fato gerador econômico, independentemente do caixa. É pilar da estrutura conceitual (CPC 00). Não confundir com regime de CAIXA, que reconhece só na movimentação financeira.",
    fonte: "IBAM 2025 · Prodesan/Santos/SP · Contador · Q32",
  },
  {
    numero: 30,
    tema_id: "contabilidade-fiscal",
    origem: "real",
    enunciado:
      "O Balanço Patrimonial tem por finalidade apresentar a posição financeira e patrimonial da empresa em determinada data (posição estática). Conforme as intitulações da lei, o balanço é composto por três elementos básicos:",
    alternativas: A([
      "Ativo, Passivo e Patrimônio Real.",
      "Variações Ativas, Variações Passivas e Patrimônio Real.",
      "Ativo, Passivo e Patrimônio Líquido.",
      "Ativo Real Líquido, Passivo Real a descoberto e Patrimônio.",
    ]),
    gabarito: "C",
    explicacao: "Equação fundamental: Ativo = Passivo + Patrimônio Líquido.",
    fonte: "IBAM 2014 · Mauá/SP · Fiscal de Tributos I · Q35",
  },
  {
    numero: 31,
    tema_id: "contabilidade-fiscal",
    origem: "real",
    enunciado:
      "A Demonstração do Resultado do Exercício (DRE) apresenta grande utilidade aos investidores, bancos e administradores. De acordo com a legislação vigente, entre os itens abaixo, o único que NÃO faz parte da composição da DRE são as(os):",
    alternativas: A([
      "receitas de vendas.",
      "tributos sobre vendas.",
      "despesas financeiras.",
      "tributos sobre ajustes de conversão do período.",
    ]),
    gabarito: "D",
    explicacao:
      "Ajustes de conversão transitam pelo Patrimônio Líquido / DRA (resultado abrangente), não pela DRE.",
    fonte: "IBAM 2014 · Mauá/SP · Fiscal de Tributos I · Q34",
  },
  {
    numero: 32,
    tema_id: "contabilidade-fiscal",
    origem: "real",
    enunciado:
      "Estoque inicial zero. Movimentações do mês: 05/10 compra de 200 unid. a R$ 80,00 (R$ 16.000,00); 10/10 baixa de 100 unid.; 15/10 compra de 300 unid. a R$ 90,00 (R$ 27.000,00); 25/10 baixa de 200 unid. Pelo método da média ponderada móvel, o valor do estoque final é de R$:",
    alternativas: A(["18.000,00", "17.500,00", "17.000,00", "16.500,00"]),
    gabarito: "B",
    explicacao:
      "Após a 1ª baixa: 100 un × R$ 80 = R$ 8.000. Nova compra: 400 un / R$ 35.000 → média R$ 87,50. Baixa de 200 → restam 200 × R$ 87,50 = R$ 17.500.",
    fonte: "IBAM 2014 · Mauá/SP · Fiscal de Tributos I · Q37",
  },
  // ------------------ AUDITORIA FISCAL (33-36) ------------------
  {
    numero: 33,
    tema_id: "auditoria-fiscal",
    origem: "real",
    enunciado: "De acordo com as Normas Brasileiras de Contabilidade, o objetivo da Auditoria é:",
    alternativas: A([
      "exercer o controle interno, de modo a garantir a ocorrência de todos os registros necessários para a boa gestão empresarial.",
      "aumentar o grau de confiança nas demonstrações contábeis por parte dos usuários.",
      "levar à instância decisória elementos de prova necessários a subsidiar a justa solução do litígio.",
      "comunicar, desde logo, ao cliente, em documento reservado, eventual circunstância adversa que possa influir na decisão.",
    ]),
    gabarito: "B",
    explicacao: "NBC TA 200: aumentar o grau de confiança dos usuários nas demonstrações contábeis.",
    fonte: "IBAM 2014 · Mauá/SP · Fiscal de Tributos I · Q39",
  },
  {
    numero: 34,
    tema_id: "auditoria-fiscal",
    origem: "real",
    enunciado:
      "Dentre as características da evidência em auditoria, aquela que exige que a evidência seja fidedigna e proveniente de fontes confiáveis denomina-se:",
    alternativas: A(["Competência.", "Suficiência.", "Relevância.", "Confiabilidade."]),
    gabarito: "D",
    explicacao:
      "CONFIABILIDADE (fidedignidade da fonte) × SUFICIÊNCIA (quantidade adequada de evidência) × RELEVÂNCIA (relação com a afirmação testada). A banca separa qualidade (confiabilidade) de quantidade (suficiência).",
    fonte: "IBAM 2025 · Prodesan/Santos/SP · Contador · Q25",
  },
  {
    numero: 35,
    tema_id: "auditoria-fiscal",
    origem: "real",
    enunciado:
      "Tipo de risco de auditoria relativo à suscetibilidade de uma afirmação a uma distorção relevante, ANTES de se considerar qualquer controle preexistente:",
    alternativas: A([
      "Risco de detecção.",
      "Risco de relativismo.",
      "Risco de controle.",
      "Risco inerente.",
    ]),
    gabarito: "D",
    explicacao:
      "Risco INERENTE: vulnerabilidade natural da afirmação, ANTES dos controles. Risco de CONTROLE: falha do controle interno em prevenir/detectar. Risco de DETECÇÃO: o auditor não detecta a distorção. Risco de Auditoria = Inerente × Controle × Detecção. 'Risco de relativismo' nem existe (distrator).",
    fonte: "IBAM 2025 · Prodesan/Santos/SP · Contador · Q33",
  },
  {
    numero: 36,
    tema_id: "auditoria-fiscal",
    origem: "real",
    enunciado: "Uma das principais finalidades do estudo e avaliação dos controles internos em auditoria é:",
    alternativas: A([
      "avaliar a conformidade com as normas de auditoria e a veracidade dos demonstrativos com base apenas nos saldos contábeis.",
      "avaliar a eficiência e eficácia dos controles internos para prevenir, detectar e corrigir erros ou fraudes no processo contábil e operacional.",
      "focar exclusivamente no exame das transações financeiras, sem considerar o impacto dos controles internos.",
      "identificar falhas nos registros e recomendar a eliminação de toda a documentação fiscal da empresa.",
    ]),
    gabarito: "B",
    explicacao:
      "A avaliação dos controles internos mede sua capacidade de PREVENIR, DETECTAR e CORRIGIR erros/fraudes — e, a partir daí, o auditor dimensiona a natureza, extensão e profundidade dos testes.",
    fonte: "IBAM 2025 · Prodesan/Santos/SP · Contador · Q34",
  },
  // --------------- DIREITO ADMINISTRATIVO (37-38) ---------------
  {
    numero: 37,
    tema_id: "direito-administrativo",
    origem: "real",
    enunciado: "A propósito da anulação dos atos administrativos, NÃO é correto afirmar que:",
    alternativas: A([
      "produz efeitos ex nunc.",
      "somente pode ocorrer por motivo de ilegalidade.",
      "alcança atos vinculados e discricionários.",
      "trata-se de decisão vinculada.",
    ]),
    gabarito: "A",
    explicacao:
      "Anulação opera efeitos EX TUNC (retroativos). Revogação é que opera ex nunc.",
    fonte: "IBAM 2020 · Santos/SP · Auditor Fiscal · Q21",
  },
  {
    numero: 38,
    tema_id: "direito-administrativo",
    origem: "real",
    enunciado:
      "De acordo com a Constituição Federal, a responsabilidade civil das pessoas jurídicas de direito público e as de direito privado prestadoras de serviços públicos é objetiva com base na teoria:",
    alternativas: A([
      "do risco integral.",
      "do risco administrativo.",
      "da culpa exclusiva.",
      "da culpa administrativa.",
    ]),
    gabarito: "B",
    explicacao:
      "Art. 37, §6º, CF — teoria do risco administrativo (admite excludentes, ao contrário do risco integral).",
    fonte: "IBAM 2020 · Santos/SP · Auditor Fiscal · Q28",
  },
  // --------------- DIREITO CONSTITUCIONAL (39-40) ---------------
  {
    numero: 39,
    tema_id: "direito-constitucional",
    origem: "real",
    enunciado:
      "Indique, dentre as alternativas abaixo, aquela que contempla parte legítima para propor mandado de segurança coletivo.",
    alternativas: A([
      "Ministério Público.",
      "Qualquer cidadão.",
      "Partido político com representação no Congresso Nacional.",
      "Defensoria Pública.",
    ]),
    gabarito: "C",
    explicacao:
      "CF, art. 5º, LXX: partido político com representação no CN e organização sindical/entidade de classe/associação constituída há mais de 1 ano.",
    fonte: "IBAM 2020 · Santos/SP · Auditor Fiscal · Q25",
  },
  {
    numero: 40,
    tema_id: "direito-constitucional",
    origem: "estilo",
    enunciado:
      "Nos termos da Constituição Federal, compete aos Municípios instituir:",
    alternativas: A([
      "IPTU, ITBI, ISS e a contribuição para o custeio do serviço de iluminação pública.",
      "IPTU, ITCMD e ISS.",
      "IPTU, ITBI, ISS e IPVA.",
      "ISS, ICMS incidente sobre serviços de qualquer natureza e IPTU.",
    ]),
    gabarito: "A",
    explicacao:
      "CF, art. 156: IPTU, ITBI e ISS são os impostos municipais; o art. 149-A (EC 39/2002) acrescenta a COSIP. ITCMD e IPVA são estaduais, e ICMS é estadual — misturar as competências é o distrator favorito da banca.",
    fonte: "Inédita no estilo IBAM — CF, arts. 149-A e 156",
  },
];

async function main() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const key =
    process.env.SUPABASE_SERVICE_ROLE_KEY ?? process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
  if (!url || !key) {
    console.error("Faltam NEXT_PUBLIC_SUPABASE_URL / NEXT_PUBLIC_SUPABASE_ANON_KEY em .env.local");
    process.exit(1);
  }
  const supabase = createClient(url, key);

  const { error: erroSimulado } = await supabase
    .from("simulados")
    .upsert(SIMULADO, { onConflict: "id" });
  if (erroSimulado) {
    console.error("Erro ao inserir simulado:", erroSimulado.message);
    process.exit(1);
  }

  const linhas = QUESTOES.map((q) => ({ simulado_id: SIMULADO.id, ...q }));
  const { error: erroQuestoes } = await supabase
    .from("simulado_questoes")
    .upsert(linhas, { onConflict: "simulado_id,numero" });
  if (erroQuestoes) {
    console.error("Erro ao inserir questões do simulado:", erroQuestoes.message);
    process.exit(1);
  }

  const reais = QUESTOES.filter((q) => q.origem === "real").length;
  console.log(
    `OK: simulado "${SIMULADO.titulo}" com ${QUESTOES.length} questões ` +
      `(${reais} reais IBAM + ${QUESTOES.length - reais} inéditas estilo banca).`
  );
}

// só roda quando executado diretamente (o array também é importável, ex. pra gerar SQL)
if (process.argv[1]?.includes("seed-simulado")) main();
