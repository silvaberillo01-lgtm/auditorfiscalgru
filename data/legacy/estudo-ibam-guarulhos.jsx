import { useState, useEffect, useMemo, useRef, useCallback } from "react";
import * as XLSX from "xlsx";

// ============================================================
// BANCO DE QUESTÕES — Provas reais IBAM (autocontidas e aderentes
// ao Edital 03/2026-SGE01 de Guarulhos)
// g = índice da alternativa correta (0=a, 1=b, 2=c, 3=d)
// ============================================================
const ORIGINAIS = [
  // ---------- DIREITO ADMINISTRATIVO (Santos 2020) ----------
  {
    id: "S19", m: "Direito Administrativo", f: "IBAM 2020 · Santos/SP · Auditor Fiscal · Q19",
    e: "A respeito dos princípios básicos da administração pública, assinale a alternativa INCORRETA.",
    alt: [
      "O princípio da moralidade administrativa – enquanto valor constitucional revestido de caráter ético-jurídico – condiciona a legitimidade e a validade dos atos estatais.",
      "A administração pública submete-se ao princípio da legalidade, sobrepondo-se ao regulamento a lei em sentido formal e material.",
      "O princípio da impessoalidade vincula a publicidade ao caráter educativo, informativo ou de orientação social e é incompatível com a menção de nomes, símbolos ou imagens que caracterizem promoção pessoal ou de servidores públicos.",
      "A mera publicação do ato administrativo no diário oficial não garante, por si só, a autenticidade e a integridade da informação, necessárias para dar eficácia ao princípio da publicidade.",
    ],
    g: 3,
    c: "A publicação oficial garante, sim, presunção de autenticidade e integridade — por isso a alternativa D é a incorreta segundo a banca.",
  },
  {
    id: "S20", m: "Direito Administrativo", f: "IBAM 2020 · Santos/SP · Auditor Fiscal · Q20",
    e: "A propósito da sistemática de controle administrativo, legislativo e judiciário dos atos administrativos, NÃO é correto afirmar que:",
    alt: [
      "o exame prévio da validade dos editais de licitação e contratos administrativos celebrados pelo poder público se insere dentre as competências atribuídas aos Tribunais de Contas.",
      "a Controladoria-Geral da União (CGU) pode fiscalizar a aplicação de verbas federais onde quer que elas estejam sendo aplicadas, mesmo que em outro ente federado às quais foram destinadas.",
      "a fiscalização do Município será exercida pelo Poder Legislativo Municipal, mediante controle externo, e pelos sistemas de controle interno do Poder Executivo Municipal, na forma da lei.",
      "o parecer técnico elaborado pelo tribunal de contas tem natureza meramente opinativa, competindo exclusivamente à câmara de vereadores o julgamento das contas anuais do chefe do Poder Executivo local.",
    ],
    g: 0,
    c: "STF (SV 3 e jurisprudência): não há exame PRÉVIO de editais pelos TCs como regra de competência — o controle é posterior/concomitante.",
  },
  {
    id: "S21", m: "Direito Administrativo", f: "IBAM 2020 · Santos/SP · Auditor Fiscal · Q21",
    e: "A propósito da anulação dos atos administrativos, NÃO é correto afirmar que:",
    alt: [
      "produz efeitos ex nunc.",
      "somente pode ocorrer por motivo de ilegalidade.",
      "alcança atos vinculados e discricionários.",
      "trata-se de decisão vinculada.",
    ],
    g: 0,
    c: "Anulação opera efeitos EX TUNC (retroativos). Revogação é que opera ex nunc.",
  },
  {
    id: "S22", m: "Direito Administrativo", f: "IBAM 2020 · Santos/SP · Auditor Fiscal · Q22",
    e: "Acerca das sociedades de economia mista que executam atividades em regime de concorrência, NÃO é correto afirmar que:",
    alt: [
      "não gozam dos privilégios da Fazenda Pública em Juízo.",
      "não se sujeitam a fiscalização e controle do Tribunal de Contas.",
      "encontram-se sujeitas ao regime jurídico próprio das empresas privadas.",
      "não gozam de privilégios fiscais não extensivos aos do setor privado.",
    ],
    g: 1,
    c: "Sociedades de economia mista SE SUJEITAM ao controle dos Tribunais de Contas (CF, art. 71, II).",
  },
  {
    id: "S26", m: "Direito Administrativo", f: "IBAM 2020 · Santos/SP · Auditor Fiscal · Q26",
    e: "Quanto aos atos vinculados e discricionários, NÃO é correto afirmar que ambos:",
    alt: [
      "podem ser objeto de anulação pela Administração e pelo Judiciário.",
      "se sujeitam ao controle judicial quanto ao motivo e objeto.",
      "podem ser objeto de convalidação pela Administração.",
      "podem ser objeto de revogação pela Administração.",
    ],
    g: 3,
    c: "Atos vinculados NÃO podem ser revogados — revogação pressupõe juízo de conveniência/oportunidade, próprio dos discricionários.",
  },
  {
    id: "S27", m: "Direito Administrativo", f: "IBAM 2020 · Santos/SP · Auditor Fiscal · Q27",
    e: "A propósito do conjunto de normas aplicáveis aos servidores públicos, assinale a alternativa INCORRETA.",
    alt: [
      "Legislação infraconstitucional pode dispor sobre vantagem ou garantia não vedada ou não disciplinada pela Constituição da República.",
      "A normatização de direitos dos servidores públicos em lei orgânica do Município é de todo inconstitucional.",
      "O vencimento do servidor público não pode ser inferior a um salário mínimo.",
      "A fixação de vencimento dos servidores públicos não pode ser objeto de convenção coletiva.",
    ],
    g: 2,
    c: "SV 16/STF: a REMUNERAÇÃO total não pode ser inferior ao mínimo, mas o VENCIMENTO-base pode. Gabarito oficial: C.",
  },
  {
    id: "S28", m: "Direito Administrativo", f: "IBAM 2020 · Santos/SP · Auditor Fiscal · Q28",
    e: "De acordo com a Constituição Federal, a responsabilidade civil das pessoas jurídicas de direito público e as de direito privado prestadoras de serviços públicos é objetiva com base na teoria:",
    alt: ["do risco integral.", "do risco administrativo.", "da culpa exclusiva.", "da culpa administrativa."],
    g: 1,
    c: "Art. 37, §6º, CF — teoria do risco administrativo (admite excludentes, ao contrário do risco integral).",
  },
  // ---------- DIREITO CONSTITUCIONAL ----------
  {
    id: "S25", m: "Direito Constitucional", f: "IBAM 2020 · Santos/SP · Auditor Fiscal · Q25",
    e: "Indique, dentre as alternativas abaixo, aquela que contempla parte legítima para propor mandado de segurança coletivo.",
    alt: [
      "Ministério Público.",
      "Qualquer cidadão.",
      "Partido político com representação no Congresso Nacional.",
      "Defensoria Pública.",
    ],
    g: 2,
    c: "CF, art. 5º, LXX: partido político com representação no CN e organização sindical/entidade de classe/associação constituída há mais de 1 ano.",
  },
  // ---------- DIREITO EMPRESARIAL / PENAL / CIVIL ----------
  {
    id: "S29", m: "Direito Empresarial, Penal e Civil", f: "IBAM 2020 · Santos/SP · Auditor Fiscal · Q29",
    e: "De acordo com as normas que regem as sociedades em conta de participação, NÃO é correto afirmar que:",
    alt: [
      "salvo disposição em contrário, o sócio ostensivo não pode admitir novo sócio sem o consentimento expresso dos demais.",
      "a falência do sócio ostensivo acarreta a dissolução da sociedade e a liquidação da respectiva conta, cujo saldo constituirá crédito quirografário.",
      "obriga-se perante terceiro tão-somente o sócio ostensivo; e, exclusivamente perante este, o sócio participante, nos termos do contrato social.",
      "aplica-se à sociedade em conta de participação, subsidiariamente e no que com ela for compatível, o disposto para a sociedade limitada.",
    ],
    g: 3,
    c: "CC, art. 996: aplica-se subsidiariamente o regime da sociedade SIMPLES, não da limitada.",
  },
  {
    id: "S30", m: "Direito Empresarial, Penal e Civil", f: "IBAM 2020 · Santos/SP · Auditor Fiscal · Q30",
    e: "De acordo com as normas que regem as sociedades limitadas, assinale a alternativa INCORRETA.",
    alt: [
      "A responsabilidade de cada sócio é restrita ao valor de suas quotas, mas todos respondem solidariamente pela integralização do capital social.",
      "O contrato social poderá prever a regência supletiva da sociedade limitada pelas normas da sociedade anônima.",
      "A incorporação, fusão e dissolução da sociedade obrigatoriamente dependem de deliberação em reunião ou assembleia dos sócios.",
      "A sociedade limitada pode ser constituída por 1 (uma) ou mais pessoas.",
    ],
    g: 2,
    c: "Gabarito oficial: C. Nem toda deliberação exige o rito de reunião/assembleia em qualquer hipótese (CC, art. 1.072, §3º — dispensa quando todos decidem por escrito).",
  },
  {
    id: "S31", m: "Direito Empresarial, Penal e Civil", f: "IBAM 2020 · Santos/SP · Auditor Fiscal · Q31",
    e: "A propósito do contrato de franquia, NÃO é correto afirmar que:",
    alt: [
      "tem validade independentemente de ser levado a registro perante cartório ou órgão público.",
      "o termo franqueador, quando utilizado em qualquer de seus dispositivos, serve também para designar o subfranqueador.",
      "é um contrato de adesão tutelado pelo Código de Defesa do Consumidor.",
      "exige forma escrita, devendo ser assinado na presença de 2 (duas) testemunhas.",
    ],
    g: 2,
    c: "Lei 13.966/2019: a franquia não caracteriza relação de consumo — não é tutelada pelo CDC.",
  },
  {
    id: "S32", m: "Direito Empresarial, Penal e Civil", f: "IBAM 2020 · Santos/SP · Auditor Fiscal · Q32",
    e: "É correto afirmar que o direito de recesso, um dos instrumentos de proteção dos acionistas minoritários nas sociedades anônimas, consiste:",
    alt: [
      "no equilíbrio das ações com e sem direito a voto, determinando que o número de ações preferenciais sem direito a voto não ultrapasse 50% do total das ações emitidas.",
      "na proteção do minoritário no caso de fechamento do capital de companhia aberta.",
      "na faculdade conferida aos acionistas minoritários de participar na composição do conselho de administração da companhia por meio de eleição de um conselheiro.",
      "na faculdade de o acionista retirar-se da sociedade em circunstâncias legalmente previstas, recebendo o valor de suas ações.",
    ],
    g: 3,
    c: "Direito de recesso = direito de retirada com reembolso (Lei 6.404/76, art. 137).",
  },
  {
    id: "S33", m: "Direito Empresarial, Penal e Civil", f: "IBAM 2020 · Santos/SP · Auditor Fiscal · Q33",
    e: "A propósito da fusão, cisão e incorporação das sociedades anônimas, NÃO é correto afirmar que:",
    alt: [
      "a fusão é a operação pela qual se unem duas ou mais sociedades para formar sociedade nova, que lhes sucederá em todos os direitos e obrigações.",
      "efetivada a cisão com extinção da companhia cindida, caberá aos administradores das sociedades que tiverem absorvido parcelas do seu patrimônio promover o arquivamento e publicação dos atos da operação.",
      "a cisão é a operação pela qual uma ou mais sociedades são absorvidas por outra, que lhes sucede em todos os direitos e obrigações.",
      "na incorporação, desaparecem as sociedades incorporadas, em contraposição à sociedade incorporadora que permanece inalterada em termos de personalidade jurídica.",
    ],
    g: 2,
    c: "A alternativa C descreve a INCORPORAÇÃO. Cisão = transferência de parcelas do patrimônio para uma ou mais sociedades.",
  },
  {
    id: "S34", m: "Direito Empresarial, Penal e Civil", f: "IBAM 2020 · Santos/SP · Auditor Fiscal · Q34",
    e: "A propósito do instituto do aval, NÃO é correto afirmar que:",
    alt: [
      "no aval a garantia dada tem caráter pessoal.",
      "aval é uma garantia dada por um terceiro em título de crédito ou contrato de compra e venda mercantil.",
      "subsiste a responsabilidade do avalista, ainda que nula a obrigação daquele a quem se equipara, a menos que a nulidade decorra de vício de forma.",
      "no aval o garantidor não é protegido pelo benefício de ordem.",
    ],
    g: 1,
    c: "Aval é garantia exclusiva de TÍTULOS DE CRÉDITO — não existe aval em contrato.",
  },
  {
    id: "S35", m: "Direito Empresarial, Penal e Civil", f: "IBAM 2020 · Santos/SP · Auditor Fiscal · Q35",
    e: "A propósito do instituto do protesto, assinale a alternativa INCORRETA.",
    alt: [
      "O protesto indevido de título cambial e documentos de dívida não enseja responsabilização por danos morais à pessoa jurídica.",
      "A Fazenda Pública possui interesse e pode efetivar o protesto da Certidão de Dívida Ativa.",
      "O endossatário de título de crédito por endosso-mandato só responde por danos decorrentes de protesto indevido se extrapolar os poderes de mandatário.",
      "É ato formal e solene pelo qual se prova a inadimplência e o descumprimento de obrigação originada em títulos e outros documentos de dívida.",
    ],
    g: 0,
    c: "Súmula 227/STJ: pessoa jurídica PODE sofrer dano moral — protesto indevido enseja indenização.",
  },
  {
    id: "S36", m: "Direito Empresarial, Penal e Civil", f: "IBAM 2020 · Santos/SP · Auditor Fiscal · Q36",
    e: "A propósito do instituto do endosso, NÃO é correto afirmar que:",
    alt: [
      "assumindo responsabilidade pelo pagamento, o endossante se torna devedor solidário.",
      "pode ser total ou parcial.",
      "a transferência por endosso completa-se com a tradição do título.",
      "considera-se não escrita no endosso qualquer condição a que o subordine o endossante.",
    ],
    g: 1,
    c: "Endosso parcial é NULO (LUG, art. 12; CC, art. 912, § único).",
  },
  {
    id: "S37", m: "Direito Empresarial, Penal e Civil", f: "IBAM 2020 · Santos/SP · Auditor Fiscal · Q37",
    e: "A propósito das normas que regulam o cheque, NÃO é correto afirmar que:",
    alt: [
      "o cheque pagável a pessoa nomeada, com cláusula expressa \"à ordem\", não é transmissível por via de endosso.",
      "as obrigações contraídas no cheque são autônomas e independentes.",
      "o cheque apresentado para pagamento antes do dia indicado como data de emissão é pagável no dia da apresentação.",
      "o cheque não admite aceite, considerando-se não escrita qualquer declaração com esse sentido.",
    ],
    g: 0,
    c: "Cláusula \"à ordem\" é justamente a que PERMITE a transmissão por endosso (Lei 7.357/85, art. 17).",
  },
  {
    id: "S38", m: "Direito Empresarial, Penal e Civil", f: "IBAM 2020 · Santos/SP · Auditor Fiscal · Q38",
    e: "O abuso da personalidade jurídica, a ensejar a sua desconsideração pelo Judiciário, pode restar caracterizado pelo desvio de finalidade, assim entendido como:",
    alt: [
      "transferência de ativos ou de passivos sem efetivas contraprestações, exceto os de valor proporcionalmente insignificante.",
      "cumprimento repetitivo pela sociedade de obrigações do sócio ou do administrador ou vice-versa.",
      "utilização da pessoa jurídica com o propósito de lesar credores e para a prática de atos ilícitos de qualquer natureza.",
      "ausência de separação de fato entre os patrimônios.",
    ],
    g: 2,
    c: "CC, art. 50, §1º (redação da Lei 13.874/2019). As demais alternativas descrevem hipóteses de CONFUSÃO PATRIMONIAL.",
  },
  {
    id: "S39", m: "Direito Empresarial, Penal e Civil", f: "IBAM 2020 · Santos/SP · Auditor Fiscal · Q39",
    e: "Exigir, para si ou para outrem, direta ou indiretamente, ainda que fora da função ou antes de assumi-la, mas em razão dela, vantagem indevida, corresponde a qual tipo penal?",
    alt: ["Prevaricação.", "Excesso de Exação.", "Concussão.", "Corrupção passiva."],
    g: 2,
    c: "CP, art. 316 — concussão (EXIGIR). Corrupção passiva = SOLICITAR ou RECEBER (art. 317).",
  },
  {
    id: "S40", m: "Direito Empresarial, Penal e Civil", f: "IBAM 2020 · Santos/SP · Auditor Fiscal · Q40",
    e: "A propósito do crime de peculato, NÃO é correto afirmar que:",
    alt: [
      "é um crime formal.",
      "admite-se o concurso de pessoa estranha ao serviço público.",
      "não há impedimento para que o autor do crime seja responsabilizado por improbidade administrativa pelo mesmo fato.",
      "somente pode ser praticado por servidor público efetivo ou comissionado.",
    ],
    g: 3,
    c: "O conceito penal de funcionário público (CP, art. 327) é amplíssimo — abrange qualquer exercente de função pública, ainda que transitoriamente e sem remuneração.",
  },
  // ---------- DIREITO TRIBUTÁRIO ----------
  {
    id: "S41", m: "Direito Tributário", f: "IBAM 2020 · Santos/SP · Auditor Fiscal · Q41",
    e: "A propósito das regras de aplicação, interpretação e integração da legislação tributária constantes do CTN, assinale a alternativa INCORRETA.",
    alt: [
      "O emprego da analogia não poderá resultar na exigência de tributo não previsto em lei.",
      "Interpreta-se literalmente a legislação tributária que disponha sobre suspensão ou exclusão do crédito tributário, outorga de isenção e dispensa do cumprimento de obrigações tributárias acessórias.",
      "Utilizam-se os princípios gerais de direito privado para pesquisa da definição do conteúdo dos seus institutos e dos respectivos efeitos tributários.",
      "O emprego da equidade não poderá resultar na dispensa do pagamento de tributo devido.",
    ],
    g: 2,
    c: "CTN, art. 109: os princípios de direito privado servem para pesquisar definição/conteúdo/alcance dos institutos, mas NÃO para definição dos EFEITOS tributários.",
  },
  {
    id: "S42", m: "Direito Tributário", f: "IBAM 2020 · Santos/SP · Auditor Fiscal · Q42",
    e: "De acordo com as normas gerais de direito tributário a respeito da solidariedade tributária, NÃO é correto afirmar que, salvo disposição de lei em contrário:",
    alt: [
      "não comporta benefício de ordem.",
      "o pagamento efetuado por um dos obrigados aproveita aos demais.",
      "a interrupção da prescrição, em favor ou contra um dos obrigados, favorece ou prejudica aos demais.",
      "a remissão de crédito exonera todos os obrigados, salvo se outorgada pessoalmente a um deles, subsistindo, nesse caso, a solidariedade quanto aos demais pelo saldo.",
    ],
    g: 0,
    c: "Pegadinha do enunciado: a vedação ao benefício de ordem (CTN, art. 124, § único) NÃO admite ressalva legal — não é \"salvo disposição em contrário\". Os efeitos do art. 125, sim.",
  },
  {
    id: "S43", m: "Direito Tributário", f: "IBAM 2020 · Santos/SP · Auditor Fiscal · Q43",
    e: "Indique, dentre as alternativas abaixo, aquela que NÃO contempla hipótese de extinção do crédito tributário.",
    alt: ["Transação.", "Prescrição.", "Anistia.", "Remissão."],
    g: 2,
    c: "Anistia é hipótese de EXCLUSÃO (CTN, art. 175), junto com a isenção. Cuidado com o par remissão (extinção) × anistia (exclusão).",
  },
  {
    id: "S44", m: "Direito Tributário", f: "IBAM 2020 · Santos/SP · Auditor Fiscal · Q44",
    e: "De acordo com a doutrina majoritária, a elisão fiscal ocorre:",
    alt: [
      "quando o contribuinte simula um negócio jurídico para fugir da tributação.",
      "quando o contribuinte se utiliza de meios lícitos para não pagar ou pagar menos tributo.",
      "antes ou após o lançamento do fato gerador.",
      "quando o contribuinte pratica atos que visam evitar o conhecimento do nascimento da obrigação tributária pela autoridade fiscal.",
    ],
    g: 1,
    c: "Elisão = planejamento lícito, em regra antes do fato gerador. Evasão = meios ilícitos.",
  },
  {
    id: "S45", m: "Direito Tributário", f: "IBAM 2020 · Santos/SP · Auditor Fiscal · Q45",
    e: "De acordo com as normas gerais de direito tributário, a respeito do lançamento tributário, NÃO é correto afirmar que:",
    alt: [
      "a atividade administrativa de lançamento é vinculada e obrigatória, sob pena de responsabilidade funcional.",
      "a revisão do lançamento só pode ser iniciada enquanto não extinto o direito da Fazenda Pública.",
      "não se aplica ao lançamento a legislação que, posteriormente à ocorrência do fato gerador da obrigação, tenha instituído novos critérios de apuração.",
      "o lançamento reporta-se à data da ocorrência do fato gerador da obrigação e rege-se pela lei então vigente, ainda que posteriormente modificada ou revogada.",
    ],
    g: 2,
    c: "CTN, art. 144, §1º: aplica-se ao lançamento a legislação posterior que institua novos critérios de apuração/fiscalização ou amplie poderes de investigação.",
  },
  {
    id: "M23", m: "Direito Tributário", f: "IBAM 2014 · Mauá/SP · Fiscal de Tributos I · Q23",
    e: "De acordo com o CTN, na ausência de disposição expressa, a autoridade competente para aplicar a legislação tributária utilizará sucessivamente, na ordem indicada:",
    alt: [
      "a analogia, os princípios gerais de direito tributário, os princípios gerais de direito público e a equidade.",
      "os princípios gerais de direito tributário, os princípios gerais de direito público, a analogia e a equidade.",
      "a analogia, a equidade, os princípios gerais de direito tributário e os princípios gerais de direito público.",
      "a equidade, a analogia, os princípios gerais de direito tributário e os princípios gerais de direito público.",
    ],
    g: 0,
    c: "CTN, art. 108 — ordem clássica: Analogia → PG Dir. Tributário → PG Dir. Público → Equidade (mnemônico A-T-P-E).",
  },
  {
    id: "M24", m: "Direito Tributário", f: "IBAM 2014 · Mauá/SP · Fiscal de Tributos I · Q24",
    e: "Acerca das regras do CTN sobre interpretação e integração da Legislação Tributária, assinale a alternativa INCORRETA.",
    alt: [
      "O emprego da analogia não poderá resultar na exigência de tributo não previsto em lei.",
      "O emprego da equidade não poderá resultar na dispensa do pagamento de tributo devido.",
      "Os princípios gerais de direito privado podem ser utilizados para pesquisa do alcance de seus institutos, conceitos e formas.",
      "Interpreta-se literalmente a legislação tributária que disponha sobre a extinção do crédito tributário.",
    ],
    g: 3,
    c: "CTN, art. 111: interpretação literal para SUSPENSÃO e EXCLUSÃO — extinção não está no rol.",
  },
  {
    id: "M25", m: "Direito Tributário", f: "IBAM 2014 · Mauá/SP · Fiscal de Tributos I · Q25",
    e: "Nos termos do CTN, são normas complementares das leis, dos tratados e das convenções internacionais e dos decretos: I. os atos normativos expedidos pelas autoridades administrativas; II. as decisões dos órgãos coletivos de jurisdição administrativa, a que a lei atribua eficácia normativa; III. as práticas reiteradamente observadas pelas autoridades administrativas; IV. as decisões judiciais a respeito da interpretação de determinado aspecto da legislação tributária.",
    alt: [
      "Apenas as afirmativas I, II e III estão corretas.",
      "Apenas as afirmativas I, II e IV estão corretas.",
      "Apenas as afirmativas I, III e IV estão corretas.",
      "Apenas as afirmativas II, III e IV estão corretas.",
    ],
    g: 0,
    c: "CTN, art. 100. Decisões JUDICIAIS não são normas complementares — o rol inclui ainda os convênios entre entes.",
  },
  {
    id: "M26", m: "Direito Tributário", f: "IBAM 2014 · Mauá/SP · Fiscal de Tributos I · Q26",
    e: "Diante do CTN, a lei tributária que define infrações, ou lhe comina penalidades, interpreta-se da maneira mais favorável ao acusado, em caso de dúvida quanto à(s): I. capitulação legal do fato; II. circunstâncias materiais dos seus efeitos; III. autoria, imputabilidade, ou punibilidade; IV. natureza da penalidade aplicável, ou à sua graduação. Estão corretas:",
    alt: ["I, II e III, apenas.", "I, II e IV, apenas.", "I, III e IV, apenas.", "II, III e IV, apenas."],
    g: 2,
    c: "CTN, art. 112. Gabarito oficial: C — o item II veio com redação truncada em relação ao inciso II do artigo (natureza ou circunstâncias materiais DO FATO, ou natureza/extensão dos efeitos).",
  },
  {
    id: "M27", m: "Direito Tributário", f: "IBAM 2014 · Mauá/SP · Fiscal de Tributos I · Q27",
    e: "Indique, dentre as alternativas abaixo, aquela que, nos termos do CTN, suspende a exigibilidade do crédito tributário.",
    alt: ["Moratória.", "Transação.", "Prescrição.", "Remissão."],
    g: 0,
    c: "CTN, art. 151 — mnemônico MORDER-LIMPAR: MORatória, DEpósito, Reclamações/recursos, LIMinar, PARcelamento.",
  },
  {
    id: "M28", m: "Direito Tributário", f: "IBAM 2014 · Mauá/SP · Fiscal de Tributos I · Q28",
    e: "De acordo com o CTN, indique a hipótese que, quando não concedida em caráter geral, deve ser efetivada em cada caso, por despacho da autoridade administrativa, em requerimento com o qual o interessado faça prova do preenchimento das condições e do cumprimento dos requisitos previstos em lei para sua concessão.",
    alt: ["Compensação.", "Imunidade.", "Isenção.", "Remissão."],
    g: 2,
    c: "CTN, art. 179 — isenção em caráter individual por despacho. A remissão tem regra parecida (art. 172), mas o gabarito oficial cobrou a literalidade do art. 179.",
  },
  // ---------- CONTABILIDADE FISCAL (Mauá 2014) ----------
  {
    id: "M31", m: "Contabilidade Fiscal", f: "IBAM 2014 · Mauá/SP · Fiscal de Tributos I · Q31",
    e: "A escrituração contábil é o meio pelo qual procedemos ao registro de fatos contábeis. A terminologia utilizada no registro contábil deve expressar a:",
    alt: [
      "forma jurídica da transação.",
      "essência econômica da transação.",
      "forma operacional da transação.",
      "essência jurídica da transação.",
    ],
    g: 1,
    c: "Primazia da essência sobre a forma — característica da representação fidedigna (estrutura conceitual).",
  },
  {
    id: "M32", m: "Contabilidade Fiscal", f: "IBAM 2014 · Mauá/SP · Fiscal de Tributos I · Q32",
    e: "Na escrituração contábil, as formalidades se subdividem em intrínsecas e extrínsecas. Os livros contábeis obrigatórios, entre eles o Livro Diário e o Livro Razão, devem revestir-se de formalidades EXTRÍNSECAS, tais como:",
    alt: [
      "não conter rasuras.",
      "não conter espaços em branco.",
      "ser escriturado em rigorosa ordem cronológica.",
      "ter suas folhas numeradas sequencialmente.",
    ],
    g: 3,
    c: "Extrínsecas = aspectos externos/formais do livro (numeração, termos de abertura/encerramento). Intrínsecas = qualidade da escrituração em si.",
  },
  {
    id: "M33", m: "Contabilidade Fiscal", f: "IBAM 2014 · Mauá/SP · Fiscal de Tributos I · Q33",
    e: "Os Princípios de Contabilidade constituem o núcleo essencial que deve guiar a profissão. Dentre eles, aquele que se refere ao processo de mensuração e apresentação dos componentes patrimoniais para produzir informações íntegras e tempestivas é o Princípio da:",
    alt: ["Competência.", "Prudência.", "Oportunidade.", "Continuidade."],
    g: 2,
    c: "Oportunidade = integridade + tempestividade da informação (antiga Resolução CFC 750/93).",
  },
  {
    id: "M34", m: "Contabilidade Fiscal", f: "IBAM 2014 · Mauá/SP · Fiscal de Tributos I · Q34",
    e: "A Demonstração do Resultado do Exercício (DRE) apresenta grande utilidade aos investidores, bancos e administradores. De acordo com a legislação vigente, entre os itens abaixo, o único que NÃO faz parte da composição da DRE são as(os):",
    alt: [
      "receitas de vendas.",
      "tributos sobre vendas.",
      "despesas financeiras.",
      "tributos sobre ajustes de conversão do período.",
    ],
    g: 3,
    c: "Ajustes de conversão transitam pelo Patrimônio Líquido / DRA (resultado abrangente), não pela DRE.",
  },
  {
    id: "M35", m: "Contabilidade Fiscal", f: "IBAM 2014 · Mauá/SP · Fiscal de Tributos I · Q35",
    e: "O Balanço Patrimonial tem por finalidade apresentar a posição financeira e patrimonial da empresa em determinada data (posição estática). Conforme as intitulações da lei, o balanço é composto por três elementos básicos:",
    alt: [
      "Ativo, Passivo e Patrimônio Real.",
      "Variações Ativas, Variações Passivas e Patrimônio Real.",
      "Ativo, Passivo e Patrimônio Líquido.",
      "Ativo Real Líquido, Passivo Real a descoberto e Patrimônio.",
    ],
    g: 2,
    c: "Equação fundamental: Ativo = Passivo + PL.",
  },
  {
    id: "M36", m: "Contabilidade Fiscal", f: "IBAM 2014 · Mauá/SP · Fiscal de Tributos I · Q36",
    e: "Com relação à mensuração de ativos (CPC 00), os critérios de avaliação são aplicados dentro do regime de competência e, de forma geral, os Ativos Intangíveis são avaliados ao:",
    alt: [
      "custo incorrido na aquisição deduzido do saldo da respectiva conta de amortização, quando aplicável, ajustado ao valor recuperável se este for menor.",
      "custo de aquisição deduzido da depreciação, pelo desgaste ou perda de utilidade ou amortização ou exaustão.",
      "valor dos títulos menos estimativas de perdas para reduzi-los ao valor provável de realização.",
      "valor atualizado até a data do balanço e ajustado por demais encargos, como juros e outros rendimentos cabíveis.",
    ],
    g: 0,
    c: "Intangível: custo − amortização acumulada − impairment (teste de recuperabilidade).",
  },
  {
    id: "M37", m: "Contabilidade Fiscal", f: "IBAM 2014 · Mauá/SP · Fiscal de Tributos I · Q37",
    e: "Estoque inicial zero. Movimentações do mês: 05/10 compra de 200 unid. a R$ 80,00 (R$ 16.000,00); 10/10 baixa de 100 unid.; 15/10 compra de 300 unid. a R$ 90,00 (R$ 27.000,00); 25/10 baixa de 200 unid. Pelo método da média ponderada móvel, o valor do estoque final é de R$:",
    alt: ["18.000,00", "17.500,00", "17.000,00", "16.500,00"],
    g: 1,
    c: "Após 1ª baixa: 100 un × 80 = 8.000. Nova compra: 400 un / 35.000 → média 87,50. Baixa de 200 → restam 200 × 87,50 = 17.500.",
  },
  {
    id: "M38", m: "Contabilidade Fiscal", f: "IBAM 2014 · Mauá/SP · Fiscal de Tributos I · Q38",
    e: "Empresa comercial NÃO contribuinte do IPI realizou, no período: vendas de R$ 100.000,00 com ICMS a 16%; compras de R$ 60.000,00 com ICMS a 18% e IPI a 10%. Sem saldos iniciais de impostos, ao final do período a empresa apurou:",
    alt: [
      "ICMS a recolher no valor de R$ 5.200,00.",
      "Saldo de ICMS e IPI a recolher.",
      "ICMS a recuperar no valor de R$ 10.800,00.",
      "IPI a recolher no valor de R$ 6.000,00.",
    ],
    g: 0,
    c: "Débito ICMS: 16.000. Crédito ICMS: 10.800. A recolher: 5.200. O IPI da compra vira custo (empresa não contribuinte de IPI).",
  },
  // ---------- AUDITORIA FISCAL ----------
  {
    id: "M39", m: "Auditoria Fiscal", f: "IBAM 2014 · Mauá/SP · Fiscal de Tributos I · Q39",
    e: "De acordo com as Normas Brasileiras de Contabilidade, o objetivo da Auditoria é:",
    alt: [
      "exercer o controle interno, de modo a garantir a ocorrência de todos os registros necessários para a boa gestão empresarial.",
      "aumentar o grau de confiança nas demonstrações contábeis por parte dos usuários.",
      "levar à instância decisória elementos de prova necessários a subsidiar a justa solução do litígio.",
      "comunicar, desde logo, ao cliente, em documento reservado, eventual circunstância adversa que possa influir na decisão.",
    ],
    g: 1,
    c: "NBC TA 200: aumentar o grau de confiança dos usuários nas demonstrações contábeis.",
  },
  {
    id: "M40", m: "Auditoria Fiscal", f: "IBAM 2014 · Mauá/SP · Fiscal de Tributos I · Q40",
    e: "Cia. ALPHA detém 100% do capital da Cia. BETA. Balanços: ALPHA — Caixa 50, Contas a Receber 380, Investimentos em B 560, Imobilizado 1.000 (Total 1.990). BETA — Caixa 50, Contas a Receber 210, Imobilizado 500 (Total 760). Aplicando a Consolidação das Demonstrações Contábeis (CPC 36), o ATIVO CONSOLIDADO é igual a:",
    alt: ["2.750", "1.780", "2.190", "2.340"],
    g: 2,
    c: "Soma dos ativos (1.990 + 760 = 2.750) menos eliminação do investimento na controlada (560) = 2.190.",
  },
  // ---------- LÍNGUA PORTUGUESA (autocontidas) ----------
  {
    id: "M07", m: "Língua Portuguesa", f: "IBAM 2014 · Mauá/SP · Fiscal de Tributos I · Q7",
    e: "Leia os períodos abaixo. I. Em sua maneira de andar há um quê de menina, embora já seja uma mulher. II. Por quê você está rindo da situação? Não é o caso, com certeza. III. Não sei o quê ela viu nesse rapaz, ele não tem modos e é grosseiro com todos! IV. Quê bom você haver resolvido voltar a estudar! Os termos \"quê\", acentuados, foram empregados em consonância com a norma culta no(s) período(s):",
    alt: ["I, apenas.", "I e III, apenas.", "III e IV, apenas.", "II, III e IV, apenas."],
    g: 1,
    c: "Gabarito oficial: B. \"Quê\" substantivado (I) leva acento; a banca também validou o III. Em II, \"por que\" interrogativo no meio da frase não se acentua; em IV, \"Que bom\" não leva acento.",
  },
  {
    id: "M08", m: "Língua Portuguesa", f: "IBAM 2014 · Mauá/SP · Fiscal de Tributos I · Q8",
    e: "Analise as sentenças a seguir. I. Filho, não tenha medo – estamos próximos de você, sempre que precisar. II. Ficamos temerosos de que você desistisse de seus planos quando surgisse a primeira dificuldade. III. O álcool em excesso é prejudicial a saúde, isso já está comprovado. IV. Sem dúvida ela se encontra apta por prosseguir seus estudos – concluiu o ensino médio com louvor. A regência, em relação aos termos sublinhados, NÃO obedeceu aos parâmetros da norma culta em:",
    alt: ["IV, apenas.", "I e II, apenas.", "II e III, apenas.", "III e IV, apenas."],
    g: 3,
    c: "III: \"prejudicial À saúde\" (crase obrigatória). IV: \"apta A prosseguir\" (regência de apto = a).",
  },
  // ---------- QUESTÕES NOVAS — IBAM 2026 Arraial do Cabo/RJ, IBAM 2025 Prodesan/Santos, IBAM 2015 Santo André ----------
  // ---------- DIREITO TRIBUTÁRIO / REFORMA TRIBUTÁRIA (Arraial do Cabo 2026) ----------
  {
    id: "AC02", m: "Reforma Tributária", f: "IBAM 2026 · Arraial do Cabo/RJ · Fiscal de Rendas · Q02",
    e: "A Emenda Constitucional nº 132/23 inseriu novos princípios constitucionais tributários na Constituição Federal. Além de simplicidade, transparência e justiça tributária, são eles:",
    alt: [
      "capacidade contributiva e anterioridade nonagesimal.",
      "anterioridade nonagesimal e eficiência tributária.",
      "cooperação e defesa do meio ambiente.",
      "cooperação e legalidade.",
    ],
    g: 2,
    c: "EC 132/2023 acrescentou ao art. 145 da CF os princípios da simplicidade, transparência, justiça tributária, COOPERAÇÃO e DEFESA DO MEIO AMBIENTE. Capacidade contributiva, anterioridade e legalidade já existiam antes — pegadinha clássica de misturar princípio novo com antigo.",
  },
  {
    id: "AC03", m: "Direito Tributário", f: "IBAM 2026 · Arraial do Cabo/RJ · Fiscal de Rendas · Q03",
    e: "Representa comando prescritivo contido no Código Tributário Nacional tratando da sujeição passiva da obrigação tributária:",
    alt: [
      "pode ser atribuída ao contribuinte ou a um terceiro que é eleito pela lei como o responsável pelo recolhimento do tributo aos cofres públicos.",
      "o contribuinte sempre será responsável solidário pelo pagamento do tributo nos casos em que houver substituição tributária decorrente de lei.",
      "a atribuição de sujeição passiva decorrente de sucessão de fundo de comércio abrange as obrigações tributárias e as penalidades em qualquer hipótese.",
      "na hipótese de os diretores agirem com excesso de poderes, serão responsáveis solidários apenas os sócios que os contrataram, sem responsabilidade pessoal dos diretores.",
    ],
    g: 0,
    c: "CTN, art. 121: sujeito passivo é contribuinte (relação pessoal e direta com o FG) OU responsável (terceiro eleito por lei). B/C/D deturpam: substituição não gera solidariedade automática do contribuinte; sucessão de fundo de comércio (art. 133) tem gradação de responsabilidade; e diretores com excesso de poder respondem PESSOALMENTE (art. 135).",
  },
  {
    id: "AC05", m: "Direito Tributário", f: "IBAM 2026 · Arraial do Cabo/RJ · Fiscal de Rendas · Q05",
    e: "No que se refere à interpretação da legislação tributária, a alternativa que NÃO reflete comando previsto no Código Tributário Nacional é:",
    alt: [
      "deve ser restrita quando se tratar de isenções de pessoas jurídicas e abrangente quando se tratar de isenções de pessoas físicas.",
      "interpreta-se literalmente a legislação que disponha sobre outorga de isenção.",
      "sempre que houver dúvida quanto à capitulação legal do fato, aplica-se a penalidade mais favorável ao contribuinte.",
      "o emprego da analogia no processo de interpretação não poderá resultar na exigência de tributo não previsto em lei.",
    ],
    g: 0,
    c: "A alternativa A é a FALSA (por isso é a resposta): o CTN não distingue PF/PJ para interpretar isenção. Art. 111 manda interpretar LITERALMENTE a isenção (sem ampliar nem restringir por natureza do beneficiário). B (art. 111), C (art. 112, in dubio pro reo tributário) e D (art. 108, §1º) são corretas.",
  },
  {
    id: "AC07", m: "Direito Tributário", f: "IBAM 2026 · Arraial do Cabo/RJ · Fiscal de Rendas · Q07",
    e: "Sobre o crédito tributário, é correto afirmar que:",
    alt: [
      "decorre da obrigação principal, mas possui natureza de dever instrumental.",
      "quando regularmente constituído, somente se modifica ou extingue, ou tem sua exigibilidade suspensa ou excluída, nos casos previstos em lei.",
      "somente será lançado de ofício nos casos de inércia do contribuinte.",
      "sempre que modificado, anula o fato gerador que lhe deu origem.",
    ],
    g: 1,
    c: "CTN, art. 141: o crédito regularmente constituído só se modifica/extingue/suspende/exclui nos casos previstos em lei — reserva legal. A confunde crédito (obrigação principal, art. 113 §1º) com obrigação acessória (dever instrumental). C ignora as demais hipóteses de lançamento de ofício (art. 149). D é absurdo: modificar crédito não desfaz FG.",
  },
  {
    id: "AC08", m: "Direito Tributário", f: "IBAM 2026 · Arraial do Cabo/RJ · Fiscal de Rendas · Q08",
    e: "A alternativa que indica corretamente (i) causa de EXCLUSÃO do crédito tributário; (ii) causa de SUSPENSÃO da exigibilidade do crédito tributário; e (iii) causa de EXTINÇÃO do crédito tributário, nesta ordem, é:",
    alt: [
      "transação tributária – isenção tributária – pagamento.",
      "isenção tributária – liminar em mandado de segurança – prescrição.",
      "isenção tributária – anistia – transação tributária.",
      "anistia – isenção tributária – pagamento.",
    ],
    g: 1,
    c: "Exclusão (art. 175): isenção e anistia. Suspensão (art. 151): liminar em MS, moratória, depósito integral, parcelamento etc. Extinção (art. 156): pagamento, prescrição, transação, compensação etc. Só B ordena certo: isenção(exclusão) → liminar MS(suspensão) → prescrição(extinção). ARMADILHA CLÁSSICA da sua lista de traps: não confundir exclusão × suspensão × extinção, e lembrar que transação é EXTINÇÃO, não exclusão.",
  },
  {
    id: "AC13", m: "Direito Tributário", f: "IBAM 2026 · Arraial do Cabo/RJ · Fiscal de Rendas · Q13",
    e: "Assinale a afirmativa INCORRETA sobre o fato gerador da obrigação tributária:",
    alt: [
      "em se tratando de obrigação principal, é a situação definida em lei como necessária e suficiente à sua ocorrência.",
      "em situação de fato, ocorre quando se verifiquem as circunstâncias materiais necessárias a que produza os efeitos que normalmente lhe são próprios.",
      "em se tratando de obrigação acessória, é qualquer situação que, na forma da legislação aplicável, impõe a prática ou abstenção de ato que não configure obrigação principal.",
      "a definição do fato gerador é interpretada com a abstração da natureza dos atos supostamente praticados pelos contribuintes.",
    ],
    g: 3,
    c: "D é a INCORRETA (resposta): o art. 118 manda abstrair a VALIDADE JURÍDICA dos atos e a natureza do OBJETO ou dos EFEITOS — não 'a natureza dos atos'. É o princípio do 'non olet' (tributa-se ainda que a atividade seja ilícita). A(art.114), B(art.116,I) e C(art.115) reproduzem o CTN. Combina com sua trap de cross-matching do art. 112/118.",
  },
  {
    id: "AC20", m: "Direito Tributário", f: "IBAM 2026 · Arraial do Cabo/RJ · Fiscal de Rendas · Q20",
    e: "O contribuinte que pagou tributo a maior poderá restituir:",
    alt: [
      "o valor pago dentro de 10 anos se for o caso de tributo sujeito ao lançamento por homologação.",
      "o valor pago em até 5 anos contados da extinção do crédito tributário.",
      "o valor pago, desde que comprove que ocorreu a transferência do respectivo encargo financeiro para o contribuinte de fato.",
      "o valor pago indevidamente acrescido de juros, mas sem direito à devolução de multas, ainda que de caráter material.",
    ],
    g: 1,
    c: "CTN, art. 168, I: prazo de 5 anos para pleitear restituição, contados da extinção do crédito. A 'tese dos 10 anos' (5+5) foi SUPERADA pela LC 118/2005 — pegadinha temporal. C inverte o art. 166 (tributo indireto: precisa provar que ASSUMIU o encargo ou tem autorização de quem assumiu). D erra: multa indevida também se restitui.",
  },
  // ---------- LEGISLAÇÃO TRIBUTÁRIA MUNICIPAL (Arraial do Cabo 2026 · estilo da banca, ADAPTAR p/ Guarulhos) ----------
  {
    id: "AC10", m: "Legislação Tributária Municipal", f: "IBAM 2026 · Arraial do Cabo/RJ · Fiscal de Rendas · Q10 · [ADAPTAR-GUARULHOS]",
    e: "[MODELO DE ESTILO — conferir prazos na legislação de Guarulhos] Sobre as certidões de regularidade fiscal municipais, assinale a alternativa INCORRETA:",
    alt: [
      "a Certidão Positiva com Efeito de Negativa (CPEN) surte os mesmos efeitos que a Certidão Negativa de Débito (CND).",
      "a Certidão Positiva de Débito (CPD) tem validade de 60 dias.",
      "a Certidão Negativa de Débito (CND) tem validade de 60 dias.",
      "as certidões são solicitadas mediante requerimento da parte interessada ou de seu representante legal.",
    ],
    g: 1,
    c: "[VERIFICAR: prazos de validade das certidões na legislação de Guarulhos.] No modelo de Arraial, a INCORRETA era a validade da CPD. Conceito transferível: CPEN = mesmos efeitos da CND (CTN art. 206). PADRÃO DE COBRANÇA da banca: comparar CND × CPEN × CPD e testar prazos de validade — vale mapear os prazos exatos nas leis municipais de Guarulhos.",
  },
  {
    id: "AC38", m: "Legislação Tributária Municipal", f: "IBAM 2026 · Arraial do Cabo/RJ · Fiscal de Rendas · Q38",
    e: "Sobre a imunidade tributária, a Constituição Federal veda instituir impostos sobre patrimônio, renda ou serviços; contudo, tal imunidade NÃO se aplica ao patrimônio/renda/serviços que não representem as finalidades essenciais de entidades:",
    alt: [
      "religiosas, templos e partidos políticos.",
      "da União, Estados e Municípios.",
      "de livros, jornais e revistas.",
      "educacionais e hospitalares.",
    ],
    g: 1,
    c: "CF art. 150, §4º: a restrição 'somente às finalidades essenciais' aplica-se à imunidade de templos (VI 'b') e de entidades sem fins lucrativos (VI 'c'). A imunidade RECÍPROCA (entes federativos, VI 'a') tem tratamento próprio no §2º/§3º. A questão foi construída para você marcar a exceção. [Conferir redação equivalente na Lei 7.966/2021 de Guarulhos — CTM.]",
  },
  // ---------- PROCESSO ADMINISTRATIVO TRIBUTÁRIO (Arraial do Cabo 2026 · estilo da banca, ADAPTAR p/ Guarulhos) ----------
  {
    id: "AC16", m: "Processo Administrativo Tributário", f: "IBAM 2026 · Arraial do Cabo/RJ · Fiscal de Rendas · Q16 · [ADAPTAR-GUARULHOS]",
    e: "[MODELO DE ESTILO — conferir prazos na Lei 5.420/1999 e Decreto 21.066/2000 de Guarulhos] Sobre normas do processo administrativo fiscal municipal, é correto afirmar que os prazos para defesa/contestação e o direito de vista dos autos observam a sistemática:",
    alt: [
      "prazo em dias úteis; vista dos autos facultada sempre que necessário.",
      "prazo em dias corridos; vista dos autos facultada sempre que necessário.",
      "prazo em dias corridos; vista facultada durante os prazos de defesa ou recurso.",
      "prazo em dias úteis; vista facultada durante os prazos de defesa ou recurso.",
    ],
    g: 2,
    c: "[CONFLITO RESOLVIDO: no PAT de Guarulhos prevalece 30 dias — a Lei 6.164/2006 deu nova redação ao art. 53 da Lei 5.420/1999; o Decreto 21.066/2000 (art. 34, 20 dias) é anterior e reproduz a redação antiga, decreto não fixa prazo contra lei posterior.] O gabarito 'C' aqui é o de Arraial, NÃO de Guarulhos. Padrão da banca: sempre testar 'dias úteis × dias corridos' + escopo do direito de vista.",
  },
  // ---------- CONTABILIDADE FISCAL (Prodesan 2025 / Santo André 2015) ----------
  {
    id: "PD22", m: "Contabilidade Fiscal", f: "IBAM 2025 · Prodesan/Santos/SP · Contador · Q22",
    e: "A Receita Orçamentária classifica-se em categorias conforme a natureza de sua origem. As receitas resultantes da administração normal do Estado, destinadas ao custeio das atividades e serviços públicos (impostos, taxas e contribuições de melhoria), são:",
    alt: [
      "Receitas de provisão.",
      "Receitas correntes.",
      "Receitas de Capital.",
      "Receitas de multas.",
    ],
    g: 1,
    c: "Receitas CORRENTES (Lei 4.320/64, art. 11): tributárias, de contribuições, patrimoniais, de serviços etc. — financiam a operação normal. Receitas de CAPITAL vêm de operações de crédito, alienação de bens, amortizações — não custeio ordinário. Impostos/taxas/contribuição de melhoria são o núcleo das correntes tributárias.",
  },
  {
    id: "PD29", m: "Contabilidade Fiscal", f: "IBAM 2025 · Prodesan/Santos/SP · Contador · Q29",
    e: "O Resultado Abrangente reflete variações no PL que não decorrem de transações com sócios. Item reconhecido no resultado abrangente (não no lucro/prejuízo), relacionado a planos de benefícios de pensões ou obrigações de longo prazo:",
    alt: [
      "Ajustes em derivativos de cobertura.",
      "Variações cambiais.",
      "Ganhos ou perdas atuariais.",
      "Ajustes de avaliação patrimonial.",
    ],
    g: 2,
    c: "Ganhos/perdas ATUARIAIS de planos de benefício definido vão para 'Outros Resultados Abrangentes' (ORA/OCI), sem transitar pelo resultado (CPC 33 — Benefícios a Empregados). Todas as demais também podem compor ORA, mas a que se liga especificamente a pensões/obrigações de longo prazo é a atuarial.",
  },
  {
    id: "PD32", m: "Contabilidade Fiscal", f: "IBAM 2025 · Prodesan/Santos/SP · Contador · Q32",
    e: "Assinale o critério contábil que determina que os registros devem ser feitos no momento em que as transações ocorrem, e não quando o pagamento ou recebimento é realizado:",
    alt: [
      "Relevância.",
      "Consistência.",
      "Prudência.",
      "Competência.",
    ],
    g: 3,
    c: "Regime de COMPETÊNCIA: reconhece receitas e despesas no fato gerador econômico, independentemente do caixa. É pilar da estrutura conceitual (CPC 00). Não confundir com regime de CAIXA (reconhece só na movimentação financeira) — distinção que seu edital lista explicitamente em 'Regimes de caixa e competência'.",
  },
  {
    id: "SA36", m: "Contabilidade Fiscal", f: "IBAM 2015 · Santo André/SP · Assist. Econ.-Fin. · Q36",
    e: "No registro dos eventos relacionados aos gastos de uma organização, ao empregar o termo CUSTO estamos nos referindo ao:",
    alt: [
      "bem ou serviço consumido de forma anormal e involuntária.",
      "bem ou serviço consumido direta ou indiretamente para a obtenção de receitas.",
      "gasto ativado em função de sua vida útil ou de benefícios atribuíveis a períodos futuros.",
      "gasto relativo a um bem ou serviço utilizado na produção de outros bens ou serviços.",
    ],
    g: 3,
    c: "CUSTO = gasto relativo a bem/serviço utilizado na PRODUÇÃO de outros bens/serviços. A descreve PERDA (consumo anormal/involuntário). B descreve DESPESA (consumo para obter receita, fora da produção). C descreve INVESTIMENTO (gasto ativado). Distinguir Gasto × Custo × Despesa × Investimento × Perda é armadilha recorrente da banca.",
  },
  {
    id: "SA37", m: "Contabilidade Fiscal", f: "IBAM 2015 · Santo André/SP · Assist. Econ.-Fin. · Q37 · [cálculo]",
    e: "Uma empresa tem: Custos+Despesas Variáveis $875/un.; Custos+Despesas Fixas $500.000/mês; Preço de Venda $1.000/un. Qual o volume de vendas (em unidades) que atinge o Ponto de Equilíbrio Contábil (PEC)?",
    alt: [
      "3.200 unidades.",
      "3.600 unidades.",
      "4.000 unidades.",
      "4.400 unidades.",
    ],
    g: 2,
    c: "PEC = Custos e Despesas Fixas ÷ Margem de Contribuição unitária. MC = 1.000 − 875 = 125/un. PEC = 500.000 ÷ 125 = 4.000 unidades. Fórmula-chave de análise Custo-Volume-Lucro; sua base quantitativa resolve isso rápido.",
  },
  {
    id: "SA38", m: "Contabilidade Fiscal", f: "IBAM 2015 · Santo André/SP · Assist. Econ.-Fin. · Q38",
    e: "Na Demonstração dos Fluxos de Caixa (DFC), os fluxos classificam-se em operacionais, de investimentos e de financiamentos. Será considerado atividade OPERACIONAL o pagamento de:",
    alt: [
      "dividendos e juros sobre capital próprio aos donos, incluindo resgate de ações.",
      "ativos imobilizados adquiridos a prazo e do principal do arrendamento mercantil financeiro.",
      "empréstimos concedidos pela empresa e aquisição de títulos de investimento.",
      "juros (despesas financeiras) dos financiamentos comerciais e bancários obtidos.",
    ],
    g: 3,
    c: "Pela regra do CPC 03, JUROS PAGOS podem ser classificados como operacional ou de financiamento — a banca adotou operacional. A = financiamento (distribuição aos sócios). B = financiamento (principal de leasing/imobilizado a prazo). C = investimento (empréstimos concedidos e títulos). Saber alocar cada fluxo nos 3 grupos é o cerne da questão.",
  },
  {
    id: "SA40", m: "Contabilidade Fiscal", f: "IBAM 2015 · Santo André/SP · Assist. Econ.-Fin. · Q40 · [cálculo]",
    e: "Uma empresa apresenta: Capital Social $130.000; Reserva Legal $20.000; Reserva de Capital $10.000; Lucro Líquido do Exercício $200.000. Qual o valor a ser adicionado à Reserva Legal (Lei 6.404/76)?",
    alt: [
      "$ 10.000.",
      "$ 9.000.",
      "$ 6.000.",
      "$ 4.000.",
    ],
    g: 2,
    c: "Reserva Legal = 5% do LL = 5% × 200.000 = 10.000. MAS há teto: não pode ultrapassar 20% do Capital Social = 20% × 130.000 = 26.000. Já existem 20.000, logo só cabem mais 6.000 até o teto. Prevalece o menor: adiciona-se $6.000. Pegadinha do limite (art. 193 da Lei 6.404) — quem esquece o teto marca 10.000.",
  },
  {
    id: "SA41", m: "Contabilidade Fiscal", f: "IBAM 2015 · Santo André/SP · Assist. Econ.-Fin. · Q41 · [cálculo]",
    e: "Uma empresa tem 4 processos trabalhistas de mesma natureza: P1 $100mil/10%; P2 $120mil/75%; P3 $150mil/20%; P4 $200mil/10%. Conforme o CPC 25, o montante a registrar como Provisão para riscos trabalhistas é:",
    alt: [
      "$ 120 mil.",
      "$ 150 mil.",
      "$ 200 mil.",
      "$ 570 mil.",
    ],
    g: 0,
    c: "CPC 25: só se PROVISIONA a saída PROVÁVEL (> 50%). Apenas P2 (75%) é provável → provisão de $120 mil. P1, P3 e P4 são apenas POSSÍVEIS (≤ 50%) → viram passivo contingente DIVULGADO em nota, não provisionado. A alternativa $570 (soma tudo) é a pegadinha de quem não filtra pela probabilidade. Cai em 'Provisões e passivos contingentes' do seu edital.",
  },
  // ---------- AUDITORIA FISCAL (Prodesan 2025) ----------
  {
    id: "PD25", m: "Auditoria Fiscal", f: "IBAM 2025 · Prodesan/Santos/SP · Contador · Q25",
    e: "Dentre as características da evidência em auditoria, aquela que exige que a evidência seja fidedigna e proveniente de fontes confiáveis denomina-se:",
    alt: [
      "Competência.",
      "Suficiência.",
      "Relevância.",
      "Confiabilidade.",
    ],
    g: 3,
    c: "CONFIABILIDADE (fidedignidade da fonte) × SUFICIÊNCIA (quantidade adequada de evidência) × RELEVÂNCIA/pertinência (relação com a afirmação testada). A banca separa qualidade (confiabilidade) de quantidade (suficiência) — distinção do seu tópico 'Evidências' em Auditoria.",
  },
  {
    id: "PD26", m: "Auditoria Fiscal", f: "IBAM 2025 · Prodesan/Santos/SP · Contador · Q26",
    e: "Sobre as funções essenciais dos papéis de trabalho de auditoria, analise: I. Documentar o trabalho realizado; II. Facilitar a revisão e o acompanhamento; III. Registrar assunções ou estimativas a serem verificadas. Está correto o que se afirma em:",
    alt: [
      "I e II, apenas.",
      "II e III, apenas.",
      "I e III, apenas.",
      "I, II e III.",
    ],
    g: 3,
    c: "Papéis de trabalho documentam o trabalho (I), permitem revisão/supervisão (II) e registram premissas e estimativas a confirmar (III) — todas corretas. São a evidência do que foi feito e base para a opinião. Tópico 'Papéis de trabalho' do edital.",
  },
  {
    id: "PD33", m: "Auditoria Fiscal", f: "IBAM 2025 · Prodesan/Santos/SP · Contador · Q33",
    e: "Tipo de risco de auditoria relativo à suscetibilidade de uma afirmação a uma distorção relevante, ANTES de se considerar qualquer controle preexistente:",
    alt: [
      "Risco de detecção.",
      "Risco de relativismo.",
      "Risco de controle.",
      "Risco inerente.",
    ],
    g: 3,
    c: "Risco INERENTE: vulnerabilidade natural da afirmação, ANTES dos controles. Risco de CONTROLE: falha do controle interno em prevenir/detectar. Risco de DETECÇÃO: o auditor não detecta a distorção. Risco de Auditoria = Inerente × Controle × Detecção. 'Risco de relativismo' nem existe (distrator). Cai em 'Materialidade, relevância e risco'.",
  },
  {
    id: "PD34", m: "Auditoria Fiscal", f: "IBAM 2025 · Prodesan/Santos/SP · Contador · Q34",
    e: "Uma das principais finalidades do estudo e avaliação dos controles internos em auditoria é:",
    alt: [
      "avaliar a conformidade com as normas de auditoria e a veracidade dos demonstrativos com base apenas nos saldos contábeis.",
      "avaliar a eficiência e eficácia dos controles internos para prevenir, detectar e corrigir erros ou fraudes no processo contábil e operacional.",
      "focar exclusivamente no exame das transações financeiras, sem considerar o impacto dos controles internos.",
      "identificar falhas nos registros e recomendar a eliminação de toda a documentação fiscal da empresa.",
    ],
    g: 1,
    c: "A avaliação dos controles internos serve para medir sua capacidade de PREVENIR, DETECTAR e CORRIGIR erros/fraudes — e, a partir daí, o auditor dimensiona a natureza, extensão e profundidade dos testes. A (só saldos), C (ignora controles) e D (eliminar documentação — absurdo) são distratores.",
  },
  // ---------- RACIOCÍNIO LÓGICO E MATEMÁTICA FINANCEIRA (Santo André 2015) ----------
  {
    id: "SA13", m: "Raciocínio Lógico e Matemática Financeira", f: "IBAM 2015 · Santo André/SP · Assist. Econ.-Fin. · Q13 · [cálculo]",
    e: "Um bolo foi cortado em duas partes, A e B, de modo que a parte A correspondesse a 1/3 do bolo. A parte B é quantas vezes maior que a parte A?",
    alt: [
      "duas vezes maior.",
      "três vezes maior.",
      "uma vez e meia maior.",
      "quatro vezes maior.",
    ],
    g: 0,
    c: "A = 1/3 → B = 2/3. Razão B/A = (2/3)/(1/3) = 2. B é 2 vezes A. Razão e proporção — item do edital. (Questão simples de razão; o enunciado real trazia contexto adicional, mantido o núcleo lógico.)",
  },
  {
    id: "SA46", m: "Raciocínio Lógico e Matemática Financeira", f: "IBAM 2015 · Santo André/SP · Assist. Econ.-Fin. · Q46 · [cálculo]",
    e: "Julia fez um empréstimo a juros compostos de 14% ao ano. Após exatos 3 anos, quitou pagando R$ 143.709,768. O valor do empréstimo (principal) foi de:",
    alt: [
      "R$ 80.000.",
      "R$ 85.000.",
      "R$ 90.000.",
      "R$ 97.000.",
    ],
    g: 3,
    c: "M = C·(1+i)³ → C = M ÷ (1,14)³. (1,14)³ = 1,481544. C = 143.709,768 ÷ 1,481544 = 97.000. Juros compostos com valor presente (VP) — tema direto do seu caderno da manhã ('valor presente e valor futuro').",
  },
  {
    id: "SA47", m: "Raciocínio Lógico e Matemática Financeira", f: "IBAM 2015 · Santo André/SP · Assist. Econ.-Fin. · Q47 · [cálculo]",
    e: "Pelo princípio da equivalência de capitais, uma dívida de R$ 325.000,00 a juros SIMPLES de 18% ao ano será equivalente, nove meses depois, a:",
    alt: [
      "R$ 368.875,00.",
      "R$ 371.601,74.",
      "R$ 383.500,00.",
      "R$ 388.575,90.",
    ],
    g: 0,
    c: "Juros simples: M = C·(1 + i·t). i = 18% a.a., t = 9/12 = 0,75 ano → i·t = 0,135. M = 325.000 × 1,135 = 368.875,00. Cuidado com a proporção do tempo (9 meses = 0,75 ano) — erro comum é usar 18% cheio.",
  },
  // ---------- LÍNGUA PORTUGUESA (Arraial do Cabo 2026 / Prodesan 2025) ----------
  {
    id: "AC28", m: "Língua Portuguesa", f: "IBAM 2026 · Arraial do Cabo/RJ · Fiscal de Rendas · Q28",
    e: "Em “A lista de artefatos digitais dos Millennials que desapareceu ou perdeu relevância é EXTENSA”, as palavras EXTENSA e (o substantivo) LISTA são, respectivamente, classificadas como:",
    alt: [
      "adjetivo e adjetivo.",
      "adjetivo e substantivo.",
      "substantivo e adjetivo.",
      "substantivo e substantivo.",
    ],
    g: 1,
    c: "'extensa' qualifica o substantivo 'lista' → ADJETIVO. 'lista' é o núcleo, nomeia o ser → SUBSTANTIVO. Classificação de classes de palavras — item do seu caderno de Português. (Enunciado adaptado do original, que destacava duas palavras do texto.)",
  },
  {
    id: "AC29", m: "Língua Portuguesa", f: "IBAM 2026 · Arraial do Cabo/RJ · Fiscal de Rendas · Q29",
    e: "No título “Pode ser doloroso para alguns, mas é hora de reconhecer: a internet Millennial está morta”, os dois-pontos introduzem uma ideia de:",
    alt: [
      "síntese conclusiva.",
      "consequência.",
      "enumeração.",
      "oposição.",
    ],
    g: 0,
    c: "Os dois-pontos aqui anunciam o desfecho/síntese daquilo que se pede para reconhecer — valor de SÍNTESE CONCLUSIVA (apresenta a conclusão do que foi anunciado). Não é enumeração (não há lista) nem oposição (papel do 'mas', anterior). Pontuação — tópico do edital.",
  },
  {
    id: "PD10", m: "Língua Portuguesa", f: "IBAM 2025 · Prodesan/Santos/SP · Contador · Q10",
    e: "Em “Como podemos projetá-LO para o futuro”, a colocação pronominal destacada (pronome depois do verbo) denomina-se:",
    alt: [
      "Mesóclise.",
      "Catáfrase.",
      "Ênclise.",
      "Paráfrase.",
    ],
    g: 2,
    c: "Pronome DEPOIS do verbo = ÊNCLISE (projetá-lo). PRÓclise = antes; MESÓclise = no meio (projetá-lo-emos). 'Catáfrase' e 'paráfrase' não são posições pronominais (distratores). Colocação pronominal — item do edital.",
  },
];

// ============================================================
// VARIAÇÕES INÉDITAS NO ESTILO IBAM — cobrem as matérias do
// edital de Guarulhos ausentes nas provas antigas
// ============================================================
const VARIACOES = [
  {
    id: "V01", m: "Reforma Tributária", f: "Variação inédita · estilo IBAM",
    e: "A Emenda Constitucional nº 132/2023 instituiu o Imposto sobre Bens e Serviços (IBS). A respeito desse imposto, assinale a alternativa CORRETA.",
    alt: [
      "Trata-se de imposto de competência exclusiva da União, com produto da arrecadação repartido entre Estados e Municípios.",
      "Será cobrado, em regra, no local de origem da operação, preservando a sistemática atual do ISSQN.",
      "Terá legislação única aplicável em todo o território nacional, sendo de competência compartilhada entre Estados, Distrito Federal e Municípios.",
      "Incidirá exclusivamente sobre serviços, permanecendo as operações com mercadorias sujeitas ao ICMS em caráter definitivo.",
    ],
    g: 2,
    c: "IBS: competência compartilhada (Estados/DF/Municípios), legislação única, tributação no DESTINO e não cumulatividade plena.",
  },
  {
    id: "V02", m: "Reforma Tributária", f: "Variação inédita · estilo IBAM",
    e: "Nos termos da EC 132/2023 e da LC 214/2025, a respeito do Comitê Gestor do IBS, NÃO é correto afirmar que:",
    alt: [
      "é entidade pública sob regime especial, dotada de independência técnica, administrativa, orçamentária e financeira.",
      "compete-lhe editar regulamento único e uniformizar a interpretação e a aplicação da legislação do IBS.",
      "compete-lhe arrecadar o imposto, efetuar as compensações e distribuir o produto da arrecadação aos entes federativos.",
      "é órgão integrante da administração direta da União, vinculado hierarquicamente ao Ministério da Fazenda.",
    ],
    g: 3,
    c: "O Comitê Gestor NÃO integra a administração de nenhum ente — é entidade sob regime especial, com gestão compartilhada por Estados/DF/Municípios.",
  },
  {
    id: "V03", m: "Reforma Tributária", f: "Variação inédita · estilo IBAM",
    e: "De acordo com o regime de transição estabelecido pela EC 132/2023, a extinção definitiva do ISSQN e do ICMS, com a plena vigência do IBS, ocorrerá no ano de:",
    alt: ["2027.", "2029.", "2033.", "2078."],
    g: 2,
    c: "2026: fase-teste; 2027: CBS plena (extinção de PIS/Cofins); 2029–2032: redução gradual de ISS/ICMS; 2033: extinção. 2078 é o fim da transição federativa da repartição.",
  },
  {
    id: "V04", m: "Reforma Tributária", f: "Variação inédita · estilo IBAM",
    e: "A respeito da Contribuição sobre Bens e Serviços (CBS) e do Imposto Seletivo (IS), NÃO é correto afirmar que:",
    alt: [
      "a CBS, de competência da União, substitui as contribuições PIS e Cofins.",
      "o IS incidirá sobre a produção, extração, comercialização ou importação de bens e serviços prejudiciais à saúde ou ao meio ambiente.",
      "o IS possui finalidade marcadamente extrafiscal.",
      "a CBS é de competência compartilhada entre União, Estados e Municípios, com gestão pelo Comitê Gestor do IBS.",
    ],
    g: 3,
    c: "CBS é EXCLUSIVA da União (administrada pela RFB). O gêmeo compartilhado é o IBS.",
  },
  {
    id: "V05", m: "TI, Análise de Dados e LGPD", f: "Variação inédita · estilo IBAM",
    e: "Nos termos da Lei nº 13.709/2018 (LGPD), NÃO constitui hipótese legal para o tratamento de dados pessoais:",
    alt: [
      "o consentimento fornecido pelo titular.",
      "o cumprimento de obrigação legal ou regulatória pelo controlador.",
      "a execução, pela administração pública, de políticas públicas previstas em leis e regulamentos.",
      "o atendimento a interesse exclusivamente econômico do controlador, independentemente de ponderação com os direitos e liberdades fundamentais do titular.",
    ],
    g: 3,
    c: "O legítimo interesse (art. 7º, IX) exige ponderação e teste de balanceamento — jamais é \"independente\" dos direitos do titular.",
  },
  {
    id: "V06", m: "TI, Análise de Dados e LGPD", f: "Variação inédita · estilo IBAM",
    e: "São considerados dados pessoais SENSÍVEIS, nos termos da LGPD, EXCETO:",
    alt: [
      "dado referente à saúde ou à vida sexual do titular.",
      "dado genético ou biométrico, quando vinculado a uma pessoa natural.",
      "dado sobre convicção religiosa ou opinião política.",
      "dados bancários e histórico de transações financeiras do titular.",
    ],
    g: 3,
    c: "Rol do art. 5º, II: origem racial/étnica, convicção religiosa, opinião política, filiação sindical, saúde, vida sexual, genético, biométrico. Dados financeiros são pessoais, mas não sensíveis.",
  },
  {
    id: "V07", m: "TI, Análise de Dados e LGPD", f: "Variação inédita · estilo IBAM",
    e: "Quanto aos agentes de tratamento previstos na LGPD, assinale a alternativa CORRETA.",
    alt: [
      "O operador é a pessoa a quem competem as decisões referentes ao tratamento de dados pessoais.",
      "O controlador realiza o tratamento de dados pessoais em nome do operador.",
      "O encarregado atua como canal de comunicação entre o controlador, os titulares dos dados e a Autoridade Nacional de Proteção de Dados (ANPD).",
      "A ANPD é o agente de tratamento responsável pela guarda dos dados pessoais no setor público.",
    ],
    g: 2,
    c: "Controlador decide; operador executa em nome do controlador; encarregado (DPO) é o canal de comunicação. ANPD é órgão fiscalizador, não agente de tratamento.",
  },
  {
    id: "V08", m: "TI, Análise de Dados e LGPD", f: "Variação inédita · estilo IBAM",
    e: "As transações em bancos de dados relacionais devem observar as propriedades conhecidas pela sigla ACID. NÃO integra esse conjunto de propriedades a:",
    alt: ["Atomicidade.", "Consistência.", "Disponibilidade.", "Durabilidade."],
    g: 2,
    c: "ACID = Atomicidade, Consistência, Isolamento, Durabilidade. Disponibilidade pertence à tríade da segurança da informação (CID) e ao teorema CAP.",
  },
  {
    id: "V09", m: "TI, Análise de Dados e LGPD", f: "Variação inédita · estilo IBAM",
    e: "Em SQL, os comandos classificam-se em subconjuntos como DDL, DML e DCL. É exemplo de comando DDL (Data Definition Language):",
    alt: ["SELECT.", "INSERT.", "UPDATE.", "CREATE TABLE."],
    g: 3,
    c: "DDL define estruturas (CREATE, ALTER, DROP). SELECT/INSERT/UPDATE/DELETE são DML; GRANT/REVOKE são DCL.",
  },
  {
    id: "V10", m: "TI, Análise de Dados e LGPD", f: "Variação inédita · estilo IBAM",
    e: "Sobre o modelo relacional de banco de dados, é correto afirmar que a chave estrangeira:",
    alt: [
      "identifica de forma única cada registro da própria tabela em que está definida.",
      "estabelece o relacionamento entre tabelas, referenciando a chave primária de outra tabela.",
      "não pode ser composta por mais de um atributo.",
      "impede a aplicação das formas normais ao banco de dados.",
    ],
    g: 1,
    c: "Chave estrangeira garante integridade referencial apontando para a chave primária de outra tabela (ou da mesma, em autorrelacionamento). Pode ser composta.",
  },
  {
    id: "V11", m: "TI, Análise de Dados e LGPD", f: "Variação inédita · estilo IBAM",
    e: "A respeito dos documentos fiscais eletrônicos e do Sistema Público de Escrituração Digital (SPED), NÃO é correto afirmar que:",
    alt: [
      "a Escrituração Contábil Digital (ECD) compreende a versão digital de livros como o Diário e o Razão.",
      "a Nota Fiscal de Serviços eletrônica (NFS-e) destina-se ao registro das prestações de serviços sujeitas ao ISSQN.",
      "a Escrituração Contábil Fiscal (ECF) presta informações relativas à apuração do IRPJ e da CSLL das pessoas jurídicas.",
      "a autenticidade e a integridade dos documentos transmitidos ao SPED dispensam o uso de certificação digital.",
    ],
    g: 3,
    c: "O SPED se apoia justamente na certificação digital ICP-Brasil para garantir autenticidade, integridade e validade jurídica.",
  },
  {
    id: "V12", m: "Raciocínio Lógico e Matemática Financeira", f: "Variação inédita · estilo IBAM",
    e: "Um contribuinte possui débito de R$ 10.000,00 sujeito a juros compostos de 2% ao mês. Não havendo qualquer amortização no período, o montante da dívida após 3 meses será de:",
    alt: ["R$ 10.600,00.", "R$ 10.612,08.", "R$ 10.824,32.", "R$ 11.200,00."],
    g: 1,
    c: "M = 10.000 × (1,02)³ = 10.612,08. A alternativa A é a pegadinha dos juros SIMPLES (10.000 + 3×200).",
  },
  {
    id: "V13", m: "Raciocínio Lógico e Matemática Financeira", f: "Variação inédita · estilo IBAM",
    e: "A negação da proposição \"Todos os contribuintes entregaram a declaração\" é:",
    alt: [
      "Nenhum contribuinte entregou a declaração.",
      "Todos os contribuintes não entregaram a declaração.",
      "Pelo menos um contribuinte não entregou a declaração.",
      "Alguns contribuintes entregaram a declaração.",
    ],
    g: 2,
    c: "Negação de \"todo A é B\" = \"existe A que não é B\". Jamais negue um \"todos\" com \"nenhum\".",
  },
  {
    id: "V14", m: "Raciocínio Lógico e Matemática Financeira", f: "Variação inédita · estilo IBAM",
    e: "Sobre determinado serviço no valor de R$ 12.500,00 incide ISSQN à alíquota de 3%, retido na fonte pelo tomador. O valor do imposto retido corresponde a:",
    alt: ["R$ 325,00.", "R$ 350,00.", "R$ 375,00.", "R$ 425,00."],
    g: 2,
    c: "12.500 × 0,03 = 375,00.",
  },
  {
    id: "V15", m: "Tributos Municipais", f: "Variação inédita · estilo IBAM",
    e: "Nos termos da Lei Complementar nº 116/2003, a respeito do ISSQN, NÃO é correto afirmar que:",
    alt: [
      "o imposto incide sobre o serviço proveniente do exterior do País ou cuja prestação lá se tenha iniciado.",
      "o imposto não incide sobre as exportações de serviços para o exterior do País.",
      "o imposto incide sobre a prestação de serviços em relação de emprego.",
      "o serviço considera-se prestado, em regra, no local do estabelecimento prestador.",
    ],
    g: 2,
    c: "LC 116, art. 2º, II: NÃO incide sobre relação de emprego, trabalhadores avulsos, diretores e membros de conselhos.",
  },
  {
    id: "V16", m: "Tributos Municipais", f: "Variação inédita · estilo IBAM",
    e: "A respeito do IPTU, NÃO é correto afirmar que:",
    alt: [
      "a base de cálculo do imposto é o valor venal do imóvel.",
      "contribuinte é o proprietário do imóvel, o titular do seu domínio útil ou o seu possuidor a qualquer título.",
      "é vedada, em qualquer hipótese, a progressividade de alíquotas em razão do valor do imóvel.",
      "o imposto poderá ter alíquotas diferentes de acordo com a localização e o uso do imóvel.",
    ],
    g: 2,
    c: "Após a EC 29/2000, o IPTU PODE ser progressivo em razão do valor do imóvel (art. 156, §1º, I, CF).",
  },
  {
    id: "V17", m: "Tributos Municipais", f: "Variação inédita · estilo IBAM",
    e: "A respeito do ITBI, assinale a alternativa CORRETA.",
    alt: [
      "Compete ao Município do domicílio do adquirente do imóvel.",
      "Incide sobre as transmissões gratuitas de bens imóveis, como as doações.",
      "Não incide sobre a transmissão de bens incorporados ao patrimônio de pessoa jurídica em realização de capital, salvo se a atividade preponderante do adquirente for a compra e venda, locação ou arrendamento de imóveis.",
      "Tem como fato gerador a mera celebração de promessa de compra e venda, ainda que não registrada.",
    ],
    g: 2,
    c: "Art. 156, §2º, I, CF. Competência: Município da SITUAÇÃO do bem. Doação = ITCMD. STF (Tema 1124): fato gerador só com o registro da transmissão.",
  },
  {
    id: "V18", m: "Tributos Municipais", f: "Variação inédita · estilo IBAM",
    e: "A respeito da Contribuição para o Custeio do Serviço de Iluminação Pública (COSIP), NÃO é correto afirmar que:",
    alt: [
      "tem fundamento no art. 149-A da Constituição Federal, incluído pela EC nº 39/2002.",
      "é facultada sua cobrança na fatura de consumo de energia elétrica.",
      "após a EC 132/2023, pode custear também sistemas de monitoramento para segurança e preservação de logradouros públicos.",
      "possui natureza jurídica de taxa, exigindo serviço público específico e divisível.",
    ],
    g: 3,
    c: "É CONTRIBUIÇÃO sui generis. O STF já havia declarado inconstitucional a \"taxa\" de iluminação justamente por o serviço ser inespecífico e indivisível.",
  },
  {
    id: "V19", m: "Língua Portuguesa", f: "Variação inédita · estilo IBAM",
    e: "Assinale a frase em que o emprego (ou a ausência) do acento indicativo de crase está de acordo com a norma-padrão:",
    alt: [
      "O auditor chegou à conclusão de que a escrituração estava irregular.",
      "A notificação foi entregue à ele pessoalmente.",
      "O contribuinte começou à apresentar os documentos exigidos.",
      "O atendimento funciona de segunda à sexta-feira.",
    ],
    g: 0,
    c: "\"Chegar a + a conclusão\" = crase. Não há crase antes de pronome pessoal (B), antes de verbo (C) nem em \"de segunda a sexta\" sem artigo (D).",
  },
  {
    id: "V20", m: "Língua Portuguesa", f: "Variação inédita · estilo IBAM",
    e: "Assinale a alternativa em que a concordância verbal está em DESACORDO com a norma-padrão:",
    alt: [
      "Faz dez anos que o município revisou a planta genérica de valores.",
      "Existem, no cadastro municipal, milhares de imóveis não regularizados.",
      "Houveram muitas impugnações contra o lançamento do IPTU deste exercício.",
      "A maioria dos contribuintes pagou o tributo dentro do prazo de vencimento.",
    ],
    g: 2,
    c: "\"Haver\" no sentido de existir é impessoal: \"HOUVE muitas impugnações\". \"Fazer\" temporal também é impessoal (A está correta).",
  },

  // ================= REFORMA TRIBUTÁRIA (peso 3) =================
  {
    id: "V21", m: "Reforma Tributária", f: "Variação inédita · estilo IBAM",
    e: "Sobre a não cumulatividade do IBS e da CBS instituída pela EC 132/2023, assinale a alternativa CORRETA.",
    alt: [
      "Adota-se a não cumulatividade restrita, admitindo crédito apenas sobre insumos fisicamente integrados ao produto final.",
      "Adota-se a não cumulatividade plena, assegurando crédito sobre todas as operações em que haja incidência do tributo, salvo as de uso e consumo pessoal.",
      "Não há direito a crédito, por se tratar de tributos monofásicos em todas as etapas.",
      "O crédito é limitado ao percentual fixado anualmente por resolução do Senado Federal.",
    ],
    g: 1,
    c: "IBS/CBS adotam crédito amplo (não cumulatividade plena), excetuadas as aquisições de uso e consumo pessoal.",
  },
  {
    id: "V22", m: "Reforma Tributária", f: "Variação inédita · estilo IBAM",
    e: "A respeito do princípio do destino, adotado pela reforma tributária para o IBS, é correto afirmar que:",
    alt: [
      "a arrecadação pertence ao ente de origem, onde se localiza o estabelecimento prestador ou vendedor.",
      "a arrecadação pertence ao ente de destino, onde ocorre o consumo do bem ou serviço.",
      "a arrecadação é integralmente centralizada na União e posteriormente repartida por critérios populacionais.",
      "a repartição segue exclusivamente o critério da renda per capita do município.",
    ],
    g: 1,
    c: "A reforma migra da tributação na origem (atual ICMS/ISS) para o DESTINO — onde o bem/serviço é consumido.",
  },
  {
    id: "V23", m: "Reforma Tributária", f: "Variação inédita · estilo IBAM",
    e: "Nos termos da LC 214/2025, a respeito do regime de transição para os entes federativos, NÃO é correto afirmar que:",
    alt: [
      "no ano de 2026 haverá cobrança em caráter de teste, com alíquotas reduzidas de IBS e CBS.",
      "as alíquotas de referência serão fixadas de modo a repor a arrecadação dos tributos que estão sendo substituídos.",
      "durante a transição federativa, a distribuição do produto do IBS será gradualmente ajustada até 2078.",
      "os Municípios perderão imediatamente, já em 2027, toda a competência para legislar sobre o ISSQN.",
    ],
    g: 3,
    c: "O ISS é reduzido gradualmente entre 2029 e 2032 e só é extinto em 2033 — não há perda imediata em 2027.",
  },
  {
    id: "V24", m: "Reforma Tributária", f: "Variação inédita · estilo IBAM",
    e: "A respeito do Imposto Seletivo (IS) previsto na EC 132/2023, assinale a alternativa INCORRETA.",
    alt: [
      "Incide sobre a produção, extração, comercialização ou importação de bens e serviços prejudiciais à saúde ou ao meio ambiente.",
      "Não incidirá sobre as exportações.",
      "Poderá integrar a base de cálculo do IBS e da CBS.",
      "É tributo de competência da União com finalidade predominantemente arrecadatória (fiscal).",
    ],
    g: 3,
    c: "O IS tem finalidade EXTRAFISCAL (desestimular consumo nocivo), não arrecadatória. Ele incide sobre a base do IBS/CBS.",
  },
  {
    id: "V25", m: "Reforma Tributária", f: "Variação inédita · estilo IBAM",
    e: "Sobre a repartição do produto da arrecadação do IBS entre os entes subnacionais, a EC 132/2023 prevê a criação de:",
    alt: [
      "um Fundo Nacional de Desenvolvimento Regional gerido exclusivamente pela União.",
      "um Comitê Gestor do IBS, responsável por arrecadar, compensar créditos e distribuir a receita aos entes.",
      "uma câmara de compensação vinculada ao Banco Central do Brasil.",
      "um conselho consultivo sem poder de arrecadação, apenas normativo.",
    ],
    g: 1,
    c: "O Comitê Gestor do IBS centraliza arrecadação, compensação e distribuição — é a peça institucional central do novo modelo.",
  },
  {
    id: "V26", m: "Reforma Tributária", f: "Variação inédita · estilo IBAM",
    e: "A respeito do tratamento diferenciado previsto na reforma tributária, é correto afirmar que a Constituição prevê regimes específicos ou favorecidos, entre os quais NÃO se inclui:",
    alt: [
      "o regime do Simples Nacional.",
      "a cesta básica nacional de alimentos, com alíquota zero de IBS e CBS.",
      "a redução de alíquota para serviços de educação, saúde e transporte público coletivo.",
      "a isenção total e incondicionada de IBS para todas as operações do agronegócio.",
    ],
    g: 3,
    c: "Não há isenção total e incondicionada para todo o agronegócio — há regimes específicos e reduções, mas não imunidade geral do setor.",
  },
  {
    id: "V27", m: "Reforma Tributária", f: "Variação inédita · estilo IBAM",
    e: "Considerando os efeitos da reforma tributária sobre a administração tributária municipal, assinale a alternativa CORRETA.",
    alt: [
      "Com a extinção do ISS, os fiscais municipais perderão qualquer atribuição relacionada à arrecadação.",
      "A fiscalização do IBS será integralmente federalizada, sem participação de auditores municipais.",
      "Os Municípios participarão da gestão e fiscalização do IBS por meio do Comitê Gestor, preservando corpo técnico de fiscalização.",
      "A administração tributária municipal deixará de existir a partir de 2027.",
    ],
    g: 2,
    c: "O modelo é de gestão compartilhada — os Municípios seguem com papel de fiscalização, agora integrados ao Comitê Gestor do IBS.",
  },

  // ================= LGPD / TI / ANÁLISE DE DADOS (peso 1) =================
  {
    id: "V28", m: "TI, Análise de Dados e LGPD", f: "Variação inédita · estilo IBAM",
    e: "A tríade clássica da Segurança da Informação é composta pelos pilares de:",
    alt: [
      "Confidencialidade, Integridade e Disponibilidade.",
      "Autenticidade, Criptografia e Backup.",
      "Confidencialidade, Auditoria e Firewall.",
      "Integridade, Redundância e Antivírus.",
    ],
    g: 0,
    c: "Tríade CID: Confidencialidade, Integridade e Disponibilidade. Autenticidade e irretratabilidade são pilares complementares.",
  },
  {
    id: "V29", m: "TI, Análise de Dados e LGPD", f: "Variação inédita · estilo IBAM",
    e: "Sobre criptografia, assinale a alternativa CORRETA.",
    alt: [
      "Na criptografia simétrica, utiliza-se um par de chaves distintas: uma pública e uma privada.",
      "Na criptografia assimétrica, a mesma chave é usada para cifrar e decifrar a mensagem.",
      "Na criptografia assimétrica, o que é cifrado com a chave pública só pode ser decifrado com a respectiva chave privada.",
      "A criptografia simétrica dispensa o compartilhamento de qualquer chave entre as partes.",
    ],
    g: 2,
    c: "Simétrica = chave única compartilhada. Assimétrica = par de chaves pública/privada; cifra com uma, decifra com a outra.",
  },
  {
    id: "V30", m: "TI, Análise de Dados e LGPD", f: "Variação inédita · estilo IBAM",
    e: "A certificação digital no âmbito da ICP-Brasil tem por finalidade principal:",
    alt: [
      "aumentar a velocidade de transmissão dos documentos fiscais eletrônicos.",
      "garantir autenticidade, integridade e validade jurídica a documentos e transações eletrônicas.",
      "substituir integralmente a assinatura manuscrita em todos os contratos privados, sem exceção.",
      "reduzir o tamanho dos arquivos armazenados nos servidores públicos.",
    ],
    g: 1,
    c: "A certificação ICP-Brasil dá autenticidade, integridade, não repúdio e validade jurídica — base do SPED e da NFS-e.",
  },
  {
    id: "V31", m: "TI, Análise de Dados e LGPD", f: "Variação inédita · estilo IBAM",
    e: "No contexto de análise de dados, a diferença entre um Data Warehouse e um Data Lake é que:",
    alt: [
      "o Data Warehouse armazena dados estruturados e modelados para análise; o Data Lake armazena dados brutos em diversos formatos.",
      "o Data Lake só armazena dados estruturados; o Data Warehouse armazena qualquer formato.",
      "ambos armazenam exclusivamente dados não estruturados.",
      "o Data Warehouse é utilizado apenas para dados em tempo real, enquanto o Data Lake é histórico.",
    ],
    g: 0,
    c: "Warehouse = dados estruturados, tratados e modelados (schema-on-write). Lake = repositório de dados brutos em qualquer formato (schema-on-read).",
  },
  {
    id: "V32", m: "TI, Análise de Dados e LGPD", f: "Variação inédita · estilo IBAM",
    e: "A respeito da mineração de dados (Data Mining), é correto afirmar que:",
    alt: [
      "consiste apenas na cópia de tabelas de um banco para outro.",
      "é o processo de descobrir padrões, correlações e conhecimento útil em grandes volumes de dados.",
      "é sinônimo de backup incremental de bancos de dados.",
      "restringe-se à criação de gráficos em planilhas eletrônicas.",
    ],
    g: 1,
    c: "Data Mining busca padrões e conhecimento novo em grandes bases — aplicação direta em cruzamento fiscal e detecção de fraudes.",
  },
  {
    id: "V33", m: "TI, Análise de Dados e LGPD", f: "Variação inédita · estilo IBAM",
    e: "Nos termos da LGPD, os direitos do titular dos dados incluem, EXCETO:",
    alt: [
      "confirmação da existência de tratamento e acesso aos dados.",
      "correção de dados incompletos, inexatos ou desatualizados.",
      "eliminação dos dados tratados com consentimento, mediante requisição.",
      "direito irrestrito de exigir indenização automática de valor fixado em lei para qualquer incidente.",
    ],
    g: 3,
    c: "A LGPD assegura reparação de danos (art. 42), mas não há indenização automática de valor fixo — depende de dano comprovado e responsabilização.",
  },
  {
    id: "V34", m: "TI, Análise de Dados e LGPD", f: "Variação inédita · estilo IBAM",
    e: "Sobre a Autoridade Nacional de Proteção de Dados (ANPD), assinale a alternativa INCORRETA.",
    alt: [
      "Compete-lhe zelar pela proteção dos dados pessoais e fiscalizar o cumprimento da LGPD.",
      "Pode aplicar sanções administrativas em caso de descumprimento da lei.",
      "É o agente de tratamento responsável por decidir sobre o tratamento de dados dos órgãos públicos.",
      "Edita normas e orientações sobre proteção de dados pessoais.",
    ],
    g: 2,
    c: "A ANPD é órgão fiscalizador/regulador — não é agente de tratamento nem decide sobre tratamento alheio. Quem decide é o controlador.",
  },
  {
    id: "V35", m: "TI, Análise de Dados e LGPD", f: "Variação inédita · estilo IBAM",
    e: "Assinale a alternativa que apresenta um tipo de malware que se disfarça de programa legítimo para enganar o usuário e obter acesso ao sistema.",
    alt: ["Firewall.", "Cavalo de Troia (Trojan).", "Backup.", "Proxy."],
    g: 1,
    c: "Trojan se apresenta como software legítimo. Firewall e proxy são mecanismos de proteção; backup é cópia de segurança.",
  },
  {
    id: "V36", m: "TI, Análise de Dados e LGPD", f: "Variação inédita · estilo IBAM",
    e: "No modelo Entidade-Relacionamento (MER), o processo de normalização tem por objetivo principal:",
    alt: [
      "aumentar a redundância de dados para acelerar consultas.",
      "eliminar redundâncias e anomalias de inserção, atualização e exclusão.",
      "converter o banco relacional em não relacional (NoSQL).",
      "criptografar automaticamente todas as tabelas.",
    ],
    g: 1,
    c: "Normalização organiza a estrutura para reduzir redundância e evitar anomalias — mantendo integridade dos dados.",
  },
  {
    id: "V37", m: "TI, Análise de Dados e LGPD", f: "Variação inédita · estilo IBAM",
    e: "Sobre bancos de dados NoSQL, é correto afirmar que:",
    alt: [
      "seguem rigorosamente o modelo relacional e a linguagem SQL padrão.",
      "são adequados a grandes volumes de dados não estruturados e alta escalabilidade horizontal.",
      "não permitem armazenamento de dados em formato de documentos.",
      "exigem sempre esquema fixo e rígido de tabelas.",
    ],
    g: 1,
    c: "NoSQL (documentos, chave-valor, colunar, grafos) prioriza escalabilidade e flexibilidade de esquema — típico de Big Data.",
  },

  // ================= RACIOCÍNIO LÓGICO E MAT. FINANCEIRA (peso 1) =================
  {
    id: "V38", m: "Raciocínio Lógico e Matemática Financeira", f: "Variação inédita · estilo IBAM",
    e: "Considere a proposição: \"Se o contribuinte não pagar o tributo, então será autuado\". A proposição logicamente equivalente é:",
    alt: [
      "Se o contribuinte for autuado, então não pagou o tributo.",
      "Se o contribuinte não for autuado, então pagou o tributo.",
      "O contribuinte não pagou o tributo e não foi autuado.",
      "Se o contribuinte pagar o tributo, então não será autuado.",
    ],
    g: 1,
    c: "Equivalência pela contrapositiva: (~P → Q) ≡ (~Q → P). \"Não autuado → pagou\".",
  },
  {
    id: "V39", m: "Raciocínio Lógico e Matemática Financeira", f: "Variação inédita · estilo IBAM",
    e: "Um capital de R$ 20.000,00 foi aplicado a juros simples de 1,5% ao mês durante 8 meses. O montante final será de:",
    alt: ["R$ 22.400,00.", "R$ 22.000,00.", "R$ 21.200,00.", "R$ 23.600,00."],
    g: 0,
    c: "J = 20.000 × 0,015 × 8 = 2.400. M = 20.000 + 2.400 = 22.400.",
  },
  {
    id: "V40", m: "Raciocínio Lógico e Matemática Financeira", f: "Variação inédita · estilo IBAM",
    e: "Numa fiscalização, verificou-se que 60% das empresas tinham pendências no ISS e 30% no IPTU. Sabendo que 20% tinham pendências em ambos, o percentual de empresas com pelo menos uma pendência é de:",
    alt: ["90%.", "80%.", "70%.", "110%."],
    g: 2,
    c: "Princípio da inclusão-exclusão: 60 + 30 − 20 = 70%.",
  },
  {
    id: "V41", m: "Raciocínio Lógico e Matemática Financeira", f: "Variação inédita · estilo IBAM",
    e: "Um desconto racional simples é concedido sobre um título de valor nominal R$ 10.800,00, vencível em 6 meses, à taxa de 2% ao mês. O valor atual (líquido) do título é:",
    alt: ["R$ 9.500,00.", "R$ 9.642,86.", "R$ 9.600,00.", "R$ 9.720,00."],
    g: 1,
    c: "Valor atual racional = N / (1 + i·n) = 10.800 / (1 + 0,12) = 10.800 / 1,12 = 9.642,86.",
  },
  {
    id: "V42", m: "Raciocínio Lógico e Matemática Financeira", f: "Variação inédita · estilo IBAM",
    e: "Considere as premissas: \"Todo auditor é servidor público\" e \"Alguns servidores públicos são concursados\". Assinale a conclusão que NECESSARIAMENTE decorre dessas premissas.",
    alt: [
      "Todo auditor é concursado.",
      "Algum auditor é concursado.",
      "Nenhuma conclusão necessária pode ser extraída sobre a relação entre auditores e concursados.",
      "Nenhum auditor é concursado.",
    ],
    g: 2,
    c: "Silogismo inválido: \"alguns servidores são concursados\" não garante que esse subconjunto inclua algum auditor. Nada se conclui com necessidade.",
  },
  {
    id: "V43", m: "Raciocínio Lógico e Matemática Financeira", f: "Variação inédita · estilo IBAM",
    e: "Uma dívida de R$ 5.000,00 será quitada em 2 parcelas iguais e consecutivas, a primeira em 30 dias, a juros compostos de 4% ao mês (Tabela Price). O valor aproximado de cada parcela é:",
    alt: ["R$ 2.500,00.", "R$ 2.652,00.", "R$ 2.600,00.", "R$ 2.550,00."],
    g: 1,
    c: "PMT = PV × i / (1 − (1+i)^-n) = 5.000 × 0,04 / (1 − 1,04^-2) ≈ 5.000 × 0,04 / 0,07544 ≈ 2.651. Alt. mais próxima: B.",
  },

  // ================= DIREITO ADMINISTRATIVO (peso 2) =================
  {
    id: "V44", m: "Direito Administrativo", f: "Variação inédita · estilo IBAM",
    e: "A respeito do poder de polícia administrativa, com destaque para o poder de polícia tributária, NÃO é correto afirmar que:",
    alt: [
      "manifesta-se pela fiscalização, pela imposição de sanções e pela edição de atos de constatação de infrações.",
      "possui como atributos a discricionariedade, a autoexecutoriedade e a coercibilidade.",
      "seu exercício, quando envolve lançamento e constituição do crédito, é atividade indelegável a particulares.",
      "todos os seus atos são sempre vinculados, jamais comportando margem de discricionariedade.",
    ],
    g: 3,
    c: "O poder de polícia comporta atos discricionários E vinculados. Afirmar que \"todos são sempre vinculados\" é incorreto.",
  },
  {
    id: "V45", m: "Direito Administrativo", f: "Variação inédita · estilo IBAM",
    e: "Sobre a convalidação dos atos administrativos, assinale a alternativa CORRETA.",
    alt: [
      "É cabível para sanar vícios de competência e de forma, quando não exclusiva e desde que não cause prejuízo a terceiros.",
      "É cabível para sanar qualquer vício, inclusive de objeto ilícito.",
      "Produz efeitos apenas prospectivos (ex nunc).",
      "É sinônimo de revogação do ato viciado.",
    ],
    g: 0,
    c: "Convalidação (efeitos ex tunc) sana vícios sanáveis — competência (não exclusiva) e forma (não essencial). Vício de objeto/motivo/finalidade não se convalida.",
  },
  {
    id: "V46", m: "Direito Administrativo", f: "Variação inédita · estilo IBAM",
    e: "De acordo com a Lei de Acesso à Informação (Lei 12.527/2011), NÃO é correto afirmar que:",
    alt: [
      "o acesso à informação pública é a regra e o sigilo, a exceção.",
      "as informações pessoais relativas à intimidade e à vida privada terão acesso restrito, independentemente de classificação de sigilo.",
      "toda e qualquer informação produzida pela administração é de acesso público irrestrito, sem exceções.",
      "a negativa de acesso a informações objeto de pedido pode ser objeto de recurso.",
    ],
    g: 2,
    c: "Há exceções legais ao acesso (informações sigilosas classificadas e informações pessoais). A regra é a publicidade, mas não é irrestrita.",
  },
  {
    id: "V47", m: "Direito Administrativo", f: "Variação inédita · estilo IBAM",
    e: "A respeito da responsabilidade civil do Estado, assinale a alternativa CORRETA.",
    alt: [
      "Nas condutas comissivas, aplica-se, em regra, a responsabilidade subjetiva, exigindo prova de dolo do agente.",
      "A responsabilidade objetiva do Estado admite excludentes como caso fortuito, força maior e culpa exclusiva da vítima.",
      "O Estado responde de forma objetiva, sendo vedado, em qualquer caso, o direito de regresso contra o agente.",
      "A teoria adotada pela Constituição para prestadores de serviço público é a do risco integral.",
    ],
    g: 1,
    c: "Teoria do risco administrativo (art. 37, §6º): responsabilidade objetiva com excludentes, e há direito de regresso contra o agente que agiu com dolo ou culpa.",
  },
  {
    id: "V48", m: "Direito Administrativo", f: "Variação inédita · estilo IBAM",
    e: "Quanto à classificação dos atos administrativos, assinale a alternativa em que a definição está INCORRETA.",
    alt: [
      "Ato vinculado é aquele em que a lei não confere ao administrador margem de escolha.",
      "Ato discricionário admite juízo de conveniência e oportunidade dentro dos limites legais.",
      "Ato composto resulta da manifestação de vontade de dois ou mais órgãos independentes e de mesma hierarquia.",
      "A presunção de legitimidade é atributo comum aos atos administrativos.",
    ],
    g: 2,
    c: "A alternativa C descreve o ato COMPLEXO (vontades de órgãos diversos que se fundem). Ato composto = ato principal + ato acessório (ratificação/aprovação).",
  },
  {
    id: "V49", m: "Direito Administrativo", f: "Variação inédita · estilo IBAM",
    e: "Sobre os agentes públicos, NÃO é correto afirmar que:",
    alt: [
      "cargo público é o conjunto de atribuições cometidas a um servidor, criado por lei, com denominação própria.",
      "agente público é gênero que abrange agentes políticos, servidores públicos e particulares em colaboração com o poder público.",
      "servidor estatutário e empregado público submetem-se ao mesmo regime jurídico celetista.",
      "o provimento de cargo público efetivo depende, em regra, de prévia aprovação em concurso público.",
    ],
    g: 2,
    c: "Estatutário segue regime próprio (estatuto); empregado público segue a CLT. São regimes distintos.",
  },

  // ================= DIREITO CONSTITUCIONAL (peso 2) =================
  {
    id: "V50", m: "Direito Constitucional", f: "Variação inédita · estilo IBAM",
    e: "Quanto à eficácia das normas constitucionais, a norma que produz efeitos desde a promulgação, mas pode ter seu alcance reduzido por lei posterior, classifica-se como norma de eficácia:",
    alt: ["plena.", "contida (ou restringível).", "limitada.", "exaurida."],
    g: 1,
    c: "Eficácia contida: aplicabilidade direta e imediata, mas passível de restrição futura por lei (ex.: livre exercício profissional).",
  },
  {
    id: "V51", m: "Direito Constitucional", f: "Variação inédita · estilo IBAM",
    e: "A respeito das limitações constitucionais ao poder de tributar, assinale a alternativa INCORRETA.",
    alt: [
      "É vedado exigir ou aumentar tributo sem lei que o estabeleça (legalidade).",
      "É vedado cobrar tributos em relação a fatos geradores ocorridos antes da vigência da lei que os instituiu (irretroatividade).",
      "É vedado instituir imposto sobre patrimônio, renda ou serviços uns dos outros entre os entes federativos (imunidade recíproca).",
      "É permitido cobrar tributo no mesmo exercício financeiro da publicação da lei que o instituiu, sem qualquer restrição (anterioridade).",
    ],
    g: 3,
    c: "A anterioridade VEDA cobrança no mesmo exercício (e antes de 90 dias, na noventena). A alternativa D inverte a garantia.",
  },
  {
    id: "V52", m: "Direito Constitucional", f: "Variação inédita · estilo IBAM",
    e: "Sobre o controle de constitucionalidade, é correto afirmar que:",
    alt: [
      "o controle difuso é exercido exclusivamente pelo Supremo Tribunal Federal.",
      "no controle concentrado, a declaração de inconstitucionalidade produz, em regra, efeitos erga omnes e vinculantes.",
      "a ação direta de inconstitucionalidade pode ser proposta por qualquer cidadão.",
      "o controle difuso produz sempre efeitos erga omnes automaticamente.",
    ],
    g: 1,
    c: "Controle concentrado (ADI/ADC): efeitos erga omnes e vinculantes. Difuso: qualquer juiz, efeitos inter partes (em regra).",
  },
  {
    id: "V53", m: "Direito Constitucional", f: "Variação inédita · estilo IBAM",
    e: "A respeito da organização do Estado na Constituição de 1988, assinale a alternativa CORRETA.",
    alt: [
      "Os Municípios não integram a Federação brasileira.",
      "A União, os Estados, o Distrito Federal e os Municípios são entes autônomos, dotados de autogoverno, autoadministração e autolegislação.",
      "Os Municípios possuem competência para instituir o Poder Judiciário local.",
      "Os Estados podem se recusar a cumprir a Constituição Federal com base em sua autonomia.",
    ],
    g: 1,
    c: "Os Municípios INTEGRAM a Federação (art. 18) e todos os entes têm autonomia (autogoverno, autoadministração, autolegislação). Município não tem Judiciário próprio.",
  },
  {
    id: "V54", m: "Direito Constitucional", f: "Variação inédita · estilo IBAM",
    e: "Sobre os direitos e garantias fundamentais, NÃO é correto afirmar que:",
    alt: [
      "o rol de direitos fundamentais expresso na Constituição não exclui outros decorrentes do regime e dos princípios por ela adotados.",
      "os tratados internacionais de direitos humanos aprovados em cada Casa do Congresso, em dois turnos, por três quintos, equivalem a emendas constitucionais.",
      "os direitos fundamentais são absolutos e não comportam qualquer relativização.",
      "ninguém será obrigado a fazer ou deixar de fazer alguma coisa senão em virtude de lei.",
    ],
    g: 2,
    c: "Direitos fundamentais NÃO são absolutos — comportam relativização quando em conflito com outros direitos (princípio da convivência das liberdades).",
  },

  // ================= DIREITO TRIBUTÁRIO (peso 2) =================
  {
    id: "V55", m: "Direito Tributário", f: "Variação inédita · estilo IBAM",
    e: "Segundo o CTN, a natureza jurídica específica do tributo é determinada:",
    alt: [
      "pela denominação e demais características formais adotadas pela lei.",
      "pela destinação legal do produto da sua arrecadação.",
      "pelo fato gerador da respectiva obrigação.",
      "pelo órgão competente para a sua fiscalização.",
    ],
    g: 2,
    c: "CTN, art. 4º: o fato gerador define a natureza; são irrelevantes a denominação e a destinação (esta última, ressalvada pela CF para certas espécies).",
  },
  {
    id: "V56", m: "Direito Tributário", f: "Variação inédita · estilo IBAM",
    e: "A respeito da responsabilidade tributária dos sucessores, assinale a alternativa CORRETA.",
    alt: [
      "O adquirente de imóvel responde pelos tributos cujo fato gerador seja a propriedade, salvo quando conste do título a prova de sua quitação.",
      "A responsabilidade por sucessão jamais alcança os créditos tributários constituídos após a sucessão.",
      "A pessoa jurídica resultante de fusão não responde pelos tributos das sociedades fusionadas.",
      "O espólio não responde por tributos devidos pelo de cujus até a data da abertura da sucessão.",
    ],
    g: 0,
    c: "CTN, art. 130: adquirente de imóvel sucede nos tributos, salvo prova de quitação constante do título. As demais invertem regras dos arts. 131-133.",
  },
  {
    id: "V57", m: "Direito Tributário", f: "Variação inédita · estilo IBAM",
    e: "Sobre as modalidades de lançamento tributário, assinale a alternativa que associa CORRETAMENTE tributo e modalidade típica.",
    alt: [
      "IPTU — lançamento por homologação.",
      "ISSQN — lançamento de ofício em todos os casos.",
      "IPTU — lançamento de ofício (direto).",
      "Imposto de Renda — lançamento por declaração.",
    ],
    g: 2,
    c: "IPTU é clássico lançamento de ofício. ISS e IR são, em regra, por homologação. Lançamento por declaração é menos comum (ex.: ITBI em alguns municípios).",
  },
  {
    id: "V58", m: "Direito Tributário", f: "Variação inédita · estilo IBAM",
    e: "A respeito da decadência e da prescrição em matéria tributária, assinale a alternativa CORRETA.",
    alt: [
      "A decadência atinge o direito de a Fazenda constituir o crédito tributário; a prescrição, o direito de cobrá-lo judicialmente.",
      "Ambas se contam sempre a partir da ocorrência do fato gerador.",
      "O prazo decadencial e o prescricional são de 10 anos, conforme o CTN.",
      "A prescrição atinge o direito de lançar; a decadência, o direito de executar.",
    ],
    g: 0,
    c: "Decadência (5 anos) = perda do direito de CONSTITUIR (lançar). Prescrição (5 anos) = perda do direito de COBRAR (ação de execução).",
  },
  {
    id: "V59", m: "Direito Tributário", f: "Variação inédita · estilo IBAM",
    e: "Nos termos do CTN, a denúncia espontânea da infração, acompanhada do pagamento do tributo devido e dos juros de mora:",
    alt: [
      "afasta a responsabilidade por infrações, excluindo a multa, se feita antes de qualquer procedimento de fiscalização.",
      "é ineficaz, pois o pagamento do tributo não elide a multa em nenhuma hipótese.",
      "exige o pagamento também da multa de mora para produzir efeitos.",
      "só é admitida após o início da ação fiscal.",
    ],
    g: 0,
    c: "CTN, art. 138: denúncia espontânea exclui a responsabilidade por infrações (afasta multa), desde que anterior a qualquer procedimento fiscal.",
  },
  {
    id: "V60", m: "Direito Tributário", f: "Variação inédita · estilo IBAM",
    e: "A respeito das garantias e privilégios do crédito tributário, NÃO é correto afirmar que:",
    alt: [
      "presume-se fraudulenta a alienação de bens pelo sujeito passivo em débito com a Fazenda inscrito em dívida ativa, salvo reserva de bens suficientes.",
      "o crédito tributário prefere a qualquer outro, ressalvados os créditos decorrentes da legislação do trabalho e de acidente do trabalho.",
      "a cobrança judicial do crédito tributário está sujeita a concurso de credores ou habilitação em falência, recuperação judicial ou inventário.",
      "a totalidade dos bens e rendas do sujeito passivo responde pelo crédito tributário, ressalvados os bens legalmente impenhoráveis.",
    ],
    g: 2,
    c: "CTN, art. 187: a cobrança judicial do crédito tributário NÃO se sujeita a concurso de credores nem a habilitação em falência/inventário.",
  },
  {
    id: "V61", m: "Direito Tributário", f: "Variação inédita · estilo IBAM",
    e: "Sobre a competência tributária, assinale a alternativa CORRETA.",
    alt: [
      "É delegável a outra pessoa jurídica de direito público a competência para instituir tributos.",
      "A competência tributária é indelegável, mas as funções de arrecadar e fiscalizar (capacidade tributária ativa) podem ser delegadas.",
      "O não exercício da competência tributária a transfere automaticamente a outro ente.",
      "A competência tributária pode ser renunciada definitivamente pelo ente federativo.",
    ],
    g: 1,
    c: "CTN, arts. 7º e 8º: competência (instituir) é indelegável e irrenunciável; capacidade ativa (arrecadar/fiscalizar) é delegável. Não exercer não transfere.",
  },

  // ================= DIREITO EMPRESARIAL / PENAL / CIVIL (peso 2) =================
  {
    id: "V62", m: "Direito Empresarial, Penal e Civil", f: "Variação inédita · estilo IBAM",
    e: "A respeito do estabelecimento empresarial e do trespasse, assinale a alternativa CORRETA.",
    alt: [
      "Estabelecimento é a pessoa jurídica titular da atividade empresarial.",
      "Trespasse é a transferência da titularidade do estabelecimento empresarial.",
      "O adquirente do estabelecimento jamais responde pelos débitos anteriores à transferência.",
      "A cláusula de não concorrência do alienante é vedada em qualquer hipótese.",
    ],
    g: 1,
    c: "Trespasse = alienação do estabelecimento (CC, art. 1.142 e ss.). O adquirente responde pelos débitos contabilizados (art. 1.146).",
  },
  {
    id: "V63", m: "Direito Empresarial, Penal e Civil", f: "Variação inédita · estilo IBAM",
    e: "Sobre os crimes contra a ordem tributária (Lei 8.137/90), assinale a alternativa CORRETA.",
    alt: [
      "Suprimir ou reduzir tributo mediante omissão de informação ou declaração falsa às autoridades fazendárias constitui crime.",
      "O pagamento integral do tributo, ainda que após o recebimento da denúncia, é irrelevante para a punibilidade.",
      "São crimes exclusivamente formais, independentemente de qualquer resultado.",
      "Apenas o servidor público pode figurar como sujeito ativo desses crimes.",
    ],
    g: 0,
    c: "Art. 1º da Lei 8.137/90 — a supressão/redução de tributo por fraude/omissão é crime material. O pagamento pode extinguir a punibilidade.",
  },
  {
    id: "V64", m: "Direito Empresarial, Penal e Civil", f: "Variação inédita · estilo IBAM",
    e: "A respeito da Lei de Improbidade Administrativa (Lei 8.429/92, com as alterações da Lei 14.230/2021), NÃO é correto afirmar que:",
    alt: [
      "os atos de improbidade exigem, em regra, a demonstração de dolo do agente.",
      "constituem espécies os atos que importam enriquecimento ilícito, que causam prejuízo ao erário e que atentam contra princípios da administração.",
      "a modalidade culposa de improbidade por dano ao erário foi mantida integralmente pela reforma de 2021.",
      "as sanções podem incluir perda da função pública e suspensão dos direitos políticos.",
    ],
    g: 2,
    c: "A Lei 14.230/2021 EXTINGUIU a improbidade culposa — hoje exige-se dolo específico em todas as modalidades.",
  },
  {
    id: "V65", m: "Direito Empresarial, Penal e Civil", f: "Variação inédita · estilo IBAM",
    e: "Sobre a aplicação da lei penal no tempo, assinale a alternativa CORRETA.",
    alt: [
      "A lei penal mais benéfica (novatio legis in mellius) retroage para beneficiar o réu, mesmo após o trânsito em julgado.",
      "A lei penal mais gravosa retroage sempre que necessária à proteção da sociedade.",
      "Vigora, em matéria penal, a irretroatividade absoluta, inclusive da lei mais benéfica.",
      "O tempo do crime é o momento do resultado, e não o da ação.",
    ],
    g: 0,
    c: "CP, art. 2º: a lei mais benéfica retroage (mesmo após coisa julgada); a mais gravosa não retroage. Tempo do crime = teoria da atividade (momento da ação).",
  },
  {
    id: "V66", m: "Direito Empresarial, Penal e Civil", f: "Variação inédita · estilo IBAM",
    e: "A respeito da prescrição e da decadência no Código Civil, assinale a alternativa CORRETA.",
    alt: [
      "A prescrição atinge a pretensão; a decadência, o próprio direito potestativo.",
      "Os prazos decadenciais podem ser livremente alterados pela vontade das partes quando fixados em lei.",
      "A prescrição pode ser reconhecida de ofício apenas em favor da Fazenda Pública.",
      "A decadência legal pode ser renunciada pelas partes.",
    ],
    g: 0,
    c: "Prescrição extingue a pretensão (exigibilidade); decadência extingue o direito potestativo. A decadência legal é irrenunciável (CC, art. 209).",
  },
  {
    id: "V67", m: "Direito Empresarial, Penal e Civil", f: "Variação inédita · estilo IBAM",
    e: "Sobre as pessoas jurídicas de direito privado no Código Civil, assinale a alternativa INCORRETA.",
    alt: [
      "As associações constituem-se pela união de pessoas que se organizam para fins não econômicos.",
      "As fundações são criadas a partir de uma dotação patrimonial destinada a fins específicos.",
      "A existência legal das pessoas jurídicas de direito privado começa com a inscrição do ato constitutivo no respectivo registro.",
      "As associações, por definição, distribuem lucros e dividendos entre seus associados.",
    ],
    g: 3,
    c: "Associações têm fins NÃO econômicos e não distribuem lucros. Quem visa lucro são as sociedades.",
  },

  // ================= CONTABILIDADE FISCAL (peso 3) =================
  {
    id: "V68", m: "Contabilidade Fiscal", f: "Variação inédita · estilo IBAM",
    e: "Um fato contábil que altera a composição do patrimônio sem modificar o valor do Patrimônio Líquido é classificado como fato:",
    alt: ["modificativo aumentativo.", "modificativo diminutivo.", "permutativo.", "misto."],
    g: 2,
    c: "Permutativo: troca entre elementos sem alterar o PL (ex.: compra de máquina à vista — permuta caixa por imobilizado).",
  },
  {
    id: "V69", m: "Contabilidade Fiscal", f: "Variação inédita · estilo IBAM",
    e: "Pelo regime de competência, a receita e a despesa devem ser reconhecidas:",
    alt: [
      "no momento do efetivo recebimento ou pagamento em dinheiro.",
      "no período em que ocorre o fato gerador, independentemente do recebimento ou pagamento.",
      "somente no encerramento do exercício social.",
      "no momento da emissão da nota fiscal, exclusivamente.",
    ],
    g: 1,
    c: "Competência: reconhecimento no período do fato gerador, independentemente do fluxo de caixa. Caixa = quando entra/sai o dinheiro.",
  },
  {
    id: "V70", m: "Contabilidade Fiscal", f: "Variação inédita · estilo IBAM",
    e: "No método das partidas dobradas, para cada débito há um crédito de igual valor. A conta \"Caixa\" é uma conta do Ativo. O recebimento de uma duplicata em dinheiro provoca:",
    alt: [
      "débito em Caixa e crédito em Duplicatas a Receber.",
      "crédito em Caixa e débito em Duplicatas a Receber.",
      "débito em Caixa e débito em Duplicatas a Receber.",
      "crédito em Caixa e crédito em Fornecedores.",
    ],
    g: 0,
    c: "Caixa (ativo) aumenta → débito. Duplicatas a Receber (ativo) diminui → crédito. Permuta de ativos.",
  },
  {
    id: "V71", m: "Contabilidade Fiscal", f: "Variação inédita · estilo IBAM",
    e: "A respeito da depreciação, amortização e exaustão, assinale a alternativa CORRETA.",
    alt: [
      "Depreciação aplica-se a ativos intangíveis com vida útil definida.",
      "Amortização aplica-se à perda de valor de recursos minerais e florestais.",
      "Exaustão aplica-se ao esgotamento de recursos naturais, como jazidas e florestas.",
      "Terrenos são normalmente objeto de depreciação por desgaste.",
    ],
    g: 2,
    c: "Depreciação = bens tangíveis; amortização = intangíveis com vida útil definida; exaustão = recursos naturais. Terrenos não depreciam.",
  },
  {
    id: "V72", m: "Contabilidade Fiscal", f: "Variação inédita · estilo IBAM",
    e: "O teste de recuperabilidade (impairment) tem por objetivo:",
    alt: [
      "aumentar o valor contábil dos ativos até o valor de mercado.",
      "reconhecer perda quando o valor contábil de um ativo supera seu valor recuperável.",
      "eliminar a necessidade de depreciação dos ativos imobilizados.",
      "converter ativos intangíveis em tangíveis.",
    ],
    g: 1,
    c: "Impairment (CPC 01): reduz o ativo ao seu valor recuperável quando este for inferior ao contábil — nunca aumenta acima do custo.",
  },
  {
    id: "V73", m: "Contabilidade Fiscal", f: "Variação inédita · estilo IBAM",
    e: "Pelo Método da Equivalência Patrimonial (MEP), o investimento em coligada ou controlada é avaliado:",
    alt: [
      "pelo custo de aquisição, sem qualquer atualização posterior.",
      "com base na variação proporcional do patrimônio líquido da investida.",
      "pelo valor de mercado das ações na data do balanço.",
      "pelo valor nominal das ações emitidas.",
    ],
    g: 1,
    c: "MEP: o investimento acompanha a variação proporcional do PL da investida — reconhecendo resultados na proporção da participação.",
  },
  {
    id: "V74", m: "Contabilidade Fiscal", f: "Variação inédita · estilo IBAM",
    e: "Uma empresa apresenta: Ativo Circulante R$ 300.000, Ativo Não Circulante R$ 700.000, Passivo Circulante R$ 200.000, Passivo Não Circulante R$ 300.000. O Patrimônio Líquido é de:",
    alt: ["R$ 1.000.000.", "R$ 500.000.", "R$ 800.000.", "R$ 400.000."],
    g: 1,
    c: "PL = Ativo total − Passivo exigível = 1.000.000 − 500.000 = 500.000.",
  },
  {
    id: "V75", m: "Contabilidade Fiscal", f: "Variação inédita · estilo IBAM",
    e: "Na avaliação de estoques, considerando um cenário de preços em elevação (inflação), o método PEPS (primeiro que entra, primeiro que sai), comparado ao da média ponderada, tende a resultar em:",
    alt: [
      "menor valor de estoque final e maior CMV.",
      "maior valor de estoque final e menor CMV.",
      "estoque final e CMV idênticos ao da média.",
      "estoque final zero.",
    ],
    g: 1,
    c: "Com preços subindo, o PEPS baixa as unidades mais antigas (baratas) → menor CMV e estoque final mais alto (com preços recentes).",
  },

  // ================= AUDITORIA FISCAL (peso 3) =================
  {
    id: "V76", m: "Auditoria Fiscal", f: "Variação inédita · estilo IBAM",
    e: "A respeito da independência do auditor, assinale a alternativa CORRETA.",
    alt: [
      "A independência é exigível apenas na auditoria interna, não na independente.",
      "Compreende a independência de pensamento (mental) e a independência na aparência.",
      "Pode ser afastada mediante concordância expressa do cliente auditado.",
      "Refere-se apenas à ausência de vínculo empregatício com a entidade auditada.",
    ],
    g: 1,
    c: "Independência tem dupla dimensão: de fato (mental/pensamento) e de aparência (percepção de terceiros). É pilar da auditoria independente.",
  },
  {
    id: "V77", m: "Auditoria Fiscal", f: "Variação inédita · estilo IBAM",
    e: "Sobre o conceito de materialidade (relevância) em auditoria, é correto afirmar que:",
    alt: [
      "uma distorção é material quando, individual ou agregadamente, pode influenciar as decisões dos usuários das demonstrações.",
      "materialidade é sinônimo de valor total do ativo da entidade.",
      "distorções imateriais devem sempre ser reportadas com o mesmo destaque das materiais.",
      "a materialidade é fixada exclusivamente pela administração da entidade auditada.",
    ],
    g: 0,
    c: "Materialidade (NBC TA 320): distorção relevante é a que pode influenciar decisões econômicas dos usuários — definida pelo julgamento do auditor.",
  },
  {
    id: "V78", m: "Auditoria Fiscal", f: "Variação inédita · estilo IBAM",
    e: "A respeito das técnicas de auditoria fiscal aplicadas à presunção de omissão de receitas, o \"saldo credor de caixa\" caracteriza-se por:",
    alt: [
      "saldo de caixa positivo elevado, indicando excesso de disponibilidades.",
      "situação em que os pagamentos superam os recebimentos e o saldo inicial, sugerindo receitas não contabilizadas.",
      "conta de caixa zerada ao final do exercício.",
      "diferença entre o ativo e o passivo circulante.",
    ],
    g: 1,
    c: "Saldo credor de caixa é impossível fisicamente (não se paga mais do que se tem) — indício de receita omitida (recursos por fora da escrita).",
  },
  {
    id: "V79", m: "Auditoria Fiscal", f: "Variação inédita · estilo IBAM",
    e: "Sobre os papéis de trabalho em auditoria, NÃO é correto afirmar que:",
    alt: [
      "documentam as evidências obtidas e os procedimentos aplicados pelo auditor.",
      "servem de base para a fundamentação da opinião do auditor.",
      "podem ser descartados imediatamente após a emissão do relatório, sem prazo mínimo de guarda.",
      "constituem registro que permite a revisão e o controle de qualidade do trabalho.",
    ],
    g: 2,
    c: "Os papéis de trabalho devem ser conservados por prazo mínimo (NBC TA 230) — não podem ser descartados de imediato.",
  },
  {
    id: "V80", m: "Auditoria Fiscal", f: "Variação inédita · estilo IBAM",
    e: "A respeito da técnica de \"passivo fictício\", indício de omissão de receitas em auditoria fiscal, é correto afirmar que se caracteriza por:",
    alt: [
      "manutenção, no passivo, de obrigações já pagas ou inexistentes, para encobrir recursos de origem não comprovada.",
      "ausência total de registro de contas a pagar.",
      "excesso de provisões para devedores duvidosos.",
      "registro correto e integral de todas as obrigações da empresa.",
    ],
    g: 0,
    c: "Passivo fictício = obrigações falsas/já quitadas mantidas na escrita, usadas para justificar recursos que na verdade são receita omitida.",
  },
  {
    id: "V81", m: "Auditoria Fiscal", f: "Variação inédita · estilo IBAM",
    e: "Na auditoria, o procedimento pelo qual o auditor examina apenas parte dos itens de uma população, extraindo conclusões sobre o todo, denomina-se:",
    alt: ["confirmação externa.", "recálculo.", "amostragem.", "inspeção física integral."],
    g: 2,
    c: "Amostragem (NBC TA 530): aplicação de procedimentos a menos de 100% dos itens, permitindo conclusão sobre a população.",
  },
  {
    id: "V82", m: "Auditoria Fiscal", f: "Variação inédita · estilo IBAM",
    e: "Sobre os tipos de opinião do auditor no relatório, assinale a associação CORRETA.",
    alt: [
      "Opinião sem modificação (não modificada) é emitida quando há distorções materiais e generalizadas.",
      "Opinião com ressalva é emitida quando as distorções são materiais, mas não generalizadas.",
      "Opinião adversa é emitida quando o auditor não consegue obter qualquer evidência.",
      "Abstenção de opinião é emitida quando as demonstrações estão totalmente corretas.",
    ],
    g: 1,
    c: "Ressalva = distorção material, mas não generalizada. Adversa = material e generalizada. Abstenção = impossibilidade de obter evidência suficiente.",
  },

  // ================= LÍNGUA PORTUGUESA (peso 1) =================
  {
    id: "V83", m: "Língua Portuguesa", f: "Variação inédita · estilo IBAM",
    e: "Assinale a alternativa em que a regência verbal está de acordo com a norma-padrão.",
    alt: [
      "O auditor visou o documento e depois visou ao interesse público.",
      "Prefiro mais fiscalizar do que auditar processos.",
      "O contribuinte assistiu o filme sobre educação fiscal na repartição.",
      "Cheguei na repartição às oito horas da manhã.",
    ],
    g: 0,
    c: "\"Visar\" = dar visto (transitivo direto: visou o documento); = ter por objetivo (transitivo indireto: visou ao interesse). Em B (\"prefiro mais...que\"), C (assistir a) e D (chegar a) há erro.",
  },
  {
    id: "V84", m: "Língua Portuguesa", f: "Variação inédita · estilo IBAM",
    e: "\"Os fiscais, ___ competência foi ampliada, atuarão em todo o município.\" Assinale a alternativa que completa CORRETAMENTE a lacuna.",
    alt: ["cuja", "cuja a", "a cuja", "de cujo"],
    g: 0,
    c: "O pronome relativo \"cujo(a)\" concorda com o termo seguinte (competência) e NUNCA vem acompanhado de artigo. \"cuja competência\".",
  },
  {
    id: "V85", m: "Língua Portuguesa", f: "Variação inédita · estilo IBAM",
    e: "Assinale a alternativa em que a colocação pronominal está de acordo com a norma-padrão.",
    alt: [
      "Nunca se viu tamanha sonegação neste município.",
      "Me parece que o prazo já expirou.",
      "Farei-lhe a notificação amanhã.",
      "Quando chegou, sentou-se e não disse nada. Deu-lhe a palavra o presidente.",
    ],
    g: 0,
    c: "A palavra atrativa \"nunca\" (advérbio de negação) exige próclise: \"nunca SE viu\". Em B (início de frase), C (mesóclise no futuro) há erro.",
  },
  {
    id: "V86", m: "Língua Portuguesa", f: "Variação inédita · estilo IBAM",
    e: "Assinale a alternativa em que a palavra foi formada por DERIVAÇÃO PREFIXAL.",
    alt: ["desleal", "pensamento", "guarda-chuva", "pontapé"],
    g: 0,
    c: "\"des+leal\" = derivação prefixal. \"pensamento\" é sufixal; \"guarda-chuva\" e \"pontapé\" são compostas.",
  },
  {
    id: "V87", m: "Língua Portuguesa", f: "Variação inédita · estilo IBAM",
    e: "No período \"Embora estivesse cansado, o auditor concluiu o relatório\", a oração destacada em \"Embora estivesse cansado\" exprime ideia de:",
    alt: ["condição.", "concessão.", "finalidade.", "conformidade."],
    g: 1,
    c: "\"Embora\" introduz oração concessiva (contraste que não impede o fato principal).",
  },
  {
    id: "V88", m: "Língua Portuguesa", f: "Variação inédita · estilo IBAM",
    e: "Assinale a alternativa CORRETA quanto à concordância nominal.",
    alt: [
      "É necessário paciência para analisar os autos.",
      "Seguem anexas as certidões solicitadas.",
      "Os documentos estão em anexo, todo conferidos.",
      "As multas ficaram meias reduzidas após o recurso.",
    ],
    g: 1,
    c: "\"Anexo\" é adjetivo e concorda: \"anexas as certidões\". Em A (é necessária, com artigo), C (todos) e D (meio reduzidas — advérbio invariável) há erro.",
  },

  // ================= REFORMA TRIBUTÁRIA — extra =================
  {
    id: "V89", m: "Reforma Tributária", f: "Variação inédita · estilo IBAM",
    e: "Assinale a alternativa que indica corretamente os tributos que serão substituídos, respectivamente, pela CBS e pelo IBS, conforme a EC 132/2023.",
    alt: [
      "CBS substitui PIS e Cofins; IBS substitui ICMS e ISS.",
      "CBS substitui ICMS; IBS substitui IPI.",
      "CBS substitui ISS; IBS substitui PIS e Cofins.",
      "CBS substitui IPI e IOF; IBS substitui ITBI e IPTU.",
    ],
    g: 0,
    c: "CBS (federal) ← PIS + Cofins. IBS (estadual/municipal) ← ICMS + ISS. O IPTU e o ITBI municipais NÃO são afetados.",
  },
  {
    id: "V90", m: "Reforma Tributária", f: "Variação inédita · estilo IBAM",
    e: "A respeito da cesta básica e do cashback previstos na reforma tributária, assinale a alternativa CORRETA.",
    alt: [
      "O cashback consiste na devolução de parte do IBS/CBS a famílias de baixa renda, com o objetivo de reduzir a regressividade.",
      "A cesta básica nacional terá alíquota majorada em relação aos demais produtos.",
      "O cashback aplica-se exclusivamente a empresas exportadoras.",
      "A cesta básica e o cashback são vedados pela Constituição.",
    ],
    g: 0,
    c: "Cashback: devolução de tributo a famílias de baixa renda (reduz regressividade). Cesta básica nacional: alíquota zero de IBS/CBS.",
  },

  // ================= TRIBUTOS MUNICIPAIS — extra (base LC/CTN) =================
  {
    id: "V91", m: "Tributos Municipais", f: "Variação inédita · estilo IBAM",
    e: "Segundo a LC 116/2003, em regra, o ISSQN é devido no local:",
    alt: [
      "do domicílio do tomador do serviço, em qualquer hipótese.",
      "do estabelecimento prestador ou, na falta, do domicílio do prestador, ressalvadas as exceções legais.",
      "onde se localiza a sede da administração tributária estadual.",
      "de maior faturamento da empresa no exercício.",
    ],
    g: 1,
    c: "Regra geral do art. 3º da LC 116: local do estabelecimento prestador. As exceções (incisos I a XXV) recolhem no local da prestação.",
  },
  {
    id: "V92", m: "Tributos Municipais", f: "Variação inédita · estilo IBAM",
    e: "Sobre o Simples Nacional (LC 123/2006), NÃO é correto afirmar que:",
    alt: [
      "é regime unificado de arrecadação de tributos aplicável às microempresas e empresas de pequeno porte.",
      "abrange, entre outros, o ISSQN devido pelas empresas optantes.",
      "impede, em qualquer hipótese, a fiscalização do ISS pelo Município.",
      "possui faixas de receita bruta que determinam as alíquotas aplicáveis.",
    ],
    g: 2,
    c: "O Município mantém competência para fiscalizar o ISS das optantes do Simples (LC 123, art. 33). A adesão não afasta a fiscalização.",
  },
  {
    id: "V93", m: "Tributos Municipais", f: "Variação inédita · estilo IBAM",
    e: "A respeito das taxas municipais, assinale a alternativa CORRETA.",
    alt: [
      "Podem ter base de cálculo idêntica à de imposto.",
      "Têm como fato gerador o exercício do poder de polícia ou a utilização de serviço público específico e divisível.",
      "Independem de qualquer contraprestação estatal.",
      "São cobradas apenas de contribuintes que possuam imóveis urbanos.",
    ],
    g: 1,
    c: "CTN, art. 77: taxa decorre do poder de polícia ou de serviço público específico e divisível. É vedada base de cálculo própria de imposto (art. 145, §2º, CF).",
  },
  {
    id: "V94", m: "Tributos Municipais", f: "Variação inédita · estilo IBAM",
    e: "Sobre a inscrição em dívida ativa e a execução fiscal, assinale a alternativa CORRETA.",
    alt: [
      "A Certidão de Dívida Ativa (CDA) goza de presunção de certeza e liquidez, que pode ser ilidida por prova inequívoca.",
      "A inscrição em dívida ativa suspende a exigibilidade do crédito tributário.",
      "A execução fiscal é regida pelo Código de Processo Penal.",
      "A dívida ativa tributária abrange apenas multas de trânsito.",
    ],
    g: 0,
    c: "CTN, art. 204: a inscrição confere à CDA presunção (relativa) de certeza e liquidez. Execução fiscal segue a Lei 6.830/80.",
  },

  // ================= PROCESSO ADMINISTRATIVO TRIBUTÁRIO — base geral =================
  {
    id: "V95", m: "Processo Administrativo Tributário", f: "Variação inédita · estilo IBAM · confirmar na Lei 5.420/1999 de Guarulhos",
    e: "A respeito dos princípios do processo administrativo tributário, assinale a alternativa CORRETA. (Base: princípios gerais — confirmar prazos e regras específicas na Lei 5.420/1999 e Decreto 21.066/2000 de Guarulhos.)",
    alt: [
      "O contraditório e a ampla defesa não se aplicam ao processo administrativo, apenas ao judicial.",
      "A impugnação do lançamento pelo sujeito passivo instaura a fase litigiosa do procedimento e suspende a exigibilidade do crédito.",
      "As decisões administrativas dispensam motivação.",
      "O processo administrativo tributário é regido exclusivamente pelo Código de Processo Civil.",
    ],
    g: 1,
    c: "A impugnação/reclamação instaura a fase litigiosa e suspende a exigibilidade (CTN, art. 151, III). Contraditório e ampla defesa são garantidos (CF, art. 5º, LV).",
  },
  {
    id: "V96", m: "Processo Administrativo Tributário", f: "Variação inédita · estilo IBAM · confirmar na Lei 5.420/1999 de Guarulhos",
    e: "No âmbito do processo administrativo tributário, o auto de infração é o instrumento pelo qual: (Base geral — confirmar formalidades na legislação municipal.)",
    alt: [
      "o contribuinte solicita a restituição de tributo pago indevidamente.",
      "a autoridade fiscal formaliza a exigência do crédito tributário decorrente de infração à legislação.",
      "o município concede parcelamento de débitos.",
      "o Judiciário homologa o lançamento tributário.",
    ],
    g: 1,
    c: "O auto de infração formaliza a exigência do crédito e a imposição de penalidade — deve conter os requisitos legais (identificação, descrição do fato, capitulação, penalidade, prazo).",
  },
  {
    id: "V97", m: "Processo Administrativo Tributário", f: "Variação inédita · estilo IBAM · confirmar na Lei 5.420/1999 de Guarulhos",
    e: "Sobre a consulta em matéria tributária, assinale a alternativa CORRETA. (Base geral — confirmar regras específicas na legislação de Guarulhos.)",
    alt: [
      "A consulta formulada pelo sujeito passivo, enquanto pendente, em regra, impede a instauração de procedimento fiscal sobre a matéria consultada.",
      "A consulta tem efeito de recurso e reforma automaticamente o lançamento.",
      "A resposta à consulta vincula apenas o consulente a pagar em dobro o tributo.",
      "A consulta pode ser formulada por qualquer pessoa estranha à relação tributária.",
    ],
    g: 0,
    c: "A consulta regularmente formulada, em regra, protege o consulente (impede autuação sobre a matéria enquanto pendente e afasta multa/juros no período), conforme a legislação de regência.",
  },

  // ================= LEGISLAÇÃO TRIBUTÁRIA MUNICIPAL — GUARULHOS (peso 3) =================
  // Fundamentadas no texto real das leis anexadas ao projeto.

  // ---- ISS · Lei 5.986/2003 ----
  {
    id: "G01", m: "Legislação Tributária Municipal", f: "Lei nº 5.986/2003 (ISSQN Guarulhos) · art. 13-A",
    e: "Nos termos da Lei nº 5.986/2003, do Município de Guarulhos, a alíquota mínima do Imposto Sobre Serviços de Qualquer Natureza (ISSQN) é de:",
    alt: ["1% (um por cento).", "2% (dois por cento).", "3% (três por cento).", "5% (cinco por cento)."],
    g: 1,
    c: "Art. 13-A da Lei 5.986/2003 (redação da Lei 7.980/2021): alíquota mínima de 2%, em consonância com o art. 8º-A da LC 116/2003.",
  },
  {
    id: "G02", m: "Legislação Tributária Municipal", f: "Lei nº 5.986/2003 (ISSQN Guarulhos) · art. 8º",
    e: "De acordo com a Lei nº 5.986/2003, do Município de Guarulhos, o contribuinte do ISSQN é:",
    alt: [
      "o tomador do serviço.",
      "o prestador do serviço.",
      "o intermediário do serviço, em qualquer hipótese.",
      "o proprietário do estabelecimento onde o serviço é prestado.",
    ],
    g: 1,
    c: "Art. 8º da Lei 5.986/2003: contribuinte é o prestador do serviço. Tomadores e outros podem figurar como responsáveis solidários (art. 9º).",
  },
  {
    id: "G03", m: "Legislação Tributária Municipal", f: "Lei nº 5.986/2003 (ISSQN Guarulhos) · art. 5º",
    e: "Segundo a Lei nº 5.986/2003, do Município de Guarulhos, em regra o serviço considera-se prestado e o imposto devido no local:",
    alt: [
      "do domicílio do tomador do serviço.",
      "do estabelecimento prestador ou, na falta, do domicílio do prestador, ressalvadas as hipóteses legais.",
      "onde o pagamento do serviço é efetuado.",
      "da sede da administração tributária municipal.",
    ],
    g: 1,
    c: "Art. 5º da Lei 5.986/2003: regra geral do estabelecimento prestador, com exceções nos incisos (local da prestação) — espelha a LC 116/2003.",
  },
  {
    id: "G04", m: "Legislação Tributária Municipal", f: "Lei nº 5.986/2003 (ISSQN Guarulhos) · art. 10",
    e: "De acordo com a Lei nº 5.986/2003, do Município de Guarulhos, a base de cálculo do ISSQN é, em regra:",
    alt: [
      "o valor venal do bem envolvido no serviço.",
      "o preço do serviço.",
      "o faturamento bruto mensal do prestador.",
      "a receita líquida do prestador, deduzidos os custos.",
    ],
    g: 1,
    c: "Art. 10 da Lei 5.986/2003: a base de cálculo é o preço do serviço.",
  },
  {
    id: "G05", m: "Legislação Tributária Municipal", f: "Lei nº 5.986/2003 (ISSQN Guarulhos) · art. 9º, §2º",
    e: "A respeito da responsabilidade solidária pelo ISSQN prevista na Lei nº 5.986/2003, de Guarulhos, assinale a alternativa CORRETA.",
    alt: [
      "A solidariedade comporta benefício de ordem em favor do responsável.",
      "A solidariedade não comporta benefício de ordem, podendo o Fisco lançar de ofício o imposto ao contribuinte e/ou ao responsável.",
      "O tomador de serviços nunca pode ser responsabilizado pelo imposto.",
      "A retenção do imposto pelo tomador é vedada pela lei municipal.",
    ],
    g: 1,
    c: "Art. 9º, §2º da Lei 5.986/2003: a solidariedade não comporta benefício de ordem — regra idêntica ao art. 124, § único, do CTN.",
  },
  {
    id: "G06", m: "Legislação Tributária Municipal", f: "Lei nº 5.986/2003 (ISSQN Guarulhos) · art. 4º",
    e: "Nos termos da Lei nº 5.986/2003, de Guarulhos, quando o contribuinte prestar serviços enquadrados em mais de uma alíquota e não mantiver escrituração que os distinga, o imposto será calculado:",
    alt: [
      "pela média aritmética das alíquotas cabíveis.",
      "mediante aplicação da alíquota mais elevada dentre os serviços prestados.",
      "pela alíquota mínima de 2%.",
      "com isenção até a regularização da escrituração.",
    ],
    g: 1,
    c: "A lei determina a aplicação da alíquota MAIS ELEVADA quando não há escrituração que separe os serviços — desestimula a falta de controle.",
  },

  // ---- IPTU · Lei 6.793/2010 ----
  {
    id: "G07", m: "Legislação Tributária Municipal", f: "Lei nº 6.793/2010 (IPTU Guarulhos) · art. 26, §3º",
    e: "De acordo com a Lei nº 6.793/2010, do Município de Guarulhos, sobre os imóveis territoriais (não edificados) será aplicada a alíquota de IPTU de:",
    alt: ["1,0% (um por cento).", "2,0% (dois por cento).", "3,5% (três e meio por cento).", "5,0% (cinco por cento)."],
    g: 2,
    c: "Art. 26, §3º da Lei 6.793/2010: terrenos não edificados têm alíquota de 3,5% — a mais alta, para desestimular a especulação imobiliária.",
  },
  {
    id: "G08", m: "Legislação Tributária Municipal", f: "Lei nº 6.793/2010 (IPTU Guarulhos) · art. 26, §1º",
    e: "Segundo a Lei nº 6.793/2010, de Guarulhos, para os imóveis de uso predominantemente residencial, aplica-se a alíquota de 0,3% do IPTU para o valor venal:",
    alt: [
      "de até 10.000 UFG.",
      "que exceder a 10.000 e até 20.000 UFG.",
      "que exceder a 40.000 UFG.",
      "de qualquer valor, indistintamente.",
    ],
    g: 0,
    c: "Art. 26, §1º, I: 0,3% para valor venal residencial de até 10.000 UFG. As faixas superiores são progressivas (0,5%; 0,8%; 1,0%; 1,4%).",
  },
  {
    id: "G09", m: "Legislação Tributária Municipal", f: "Lei nº 6.793/2010 (IPTU Guarulhos) · art. 26",
    e: "A respeito das alíquotas do IPTU na Lei nº 6.793/2010, de Guarulhos, assinale a alternativa CORRETA.",
    alt: [
      "As alíquotas são fixas e idênticas para todos os imóveis, vedada qualquer diferenciação.",
      "As alíquotas são diferenciadas conforme o uso do imóvel e/ou progressivas em razão do valor venal.",
      "A progressividade em razão do valor venal é vedada pela legislação municipal.",
      "Imóveis residenciais e não residenciais sujeitam-se exatamente às mesmas faixas e alíquotas.",
    ],
    g: 1,
    c: "Art. 26 (redação da Lei 7.166/2013): alíquotas diferenciadas por uso e progressivas por valor venal, conforme autoriza o art. 156, §1º, da CF (pós-EC 29/2000).",
  },
  {
    id: "G10", m: "Legislação Tributária Municipal", f: "Lei nº 6.793/2010 (IPTU Guarulhos) · art. 7º",
    e: "Nos termos da Lei nº 6.793/2010, de Guarulhos, é contribuinte do IPTU:",
    alt: [
      "exclusivamente o proprietário com título registrado.",
      "o proprietário do imóvel, o titular do seu domínio útil ou o seu possuidor a qualquer título.",
      "apenas o possuidor direto do imóvel.",
      "somente o ocupante que resida no imóvel.",
    ],
    g: 1,
    c: "Art. 7º da Lei 6.793/2010: contribuinte é o proprietário, o titular do domínio útil ou o possuidor a qualquer título — em linha com o art. 34 do CTN.",
  },
  {
    id: "G11", m: "Legislação Tributária Municipal", f: "Lei nº 6.793/2010 (IPTU Guarulhos) · art. 9º",
    e: "Segundo a Lei nº 6.793/2010, de Guarulhos, a base de cálculo do IPTU é:",
    alt: [
      "o valor de aquisição declarado na escritura.",
      "o valor venal do imóvel.",
      "o valor da última transação registrada em cartório.",
      "a área construída multiplicada pela UFG.",
    ],
    g: 1,
    c: "Art. 9º da Lei 6.793/2010: a base de cálculo é o valor venal do imóvel.",
  },
  {
    id: "G12", m: "Legislação Tributária Municipal", f: "Lei nº 6.793/2010 (IPTU Guarulhos) · art. 27",
    e: "De acordo com a Lei nº 6.793/2010, de Guarulhos, o lançamento do IPTU é feito:",
    alt: [
      "por homologação, mediante declaração do contribuinte.",
      "de ofício e anualmente, com base nos dados do Cadastro Fiscal Imobiliário.",
      "por declaração, a cada transmissão do imóvel.",
      "mediante autolançamento pelo próprio contribuinte.",
    ],
    g: 1,
    c: "Art. 27 da Lei 6.793/2010: IPTU é lançado de ofício e anualmente — modalidade clássica desse imposto.",
  },
  {
    id: "G13", m: "Legislação Tributária Municipal", f: "Lei nº 6.793/2010 (IPTU Guarulhos) · art. 7º, §1º",
    e: "Nos termos da Lei nº 6.793/2010, de Guarulhos, os acordos ou contratos particulares que transfiram a responsabilidade pelo pagamento do IPTU:",
    alt: [
      "são plenamente válidos perante a Fazenda Municipal.",
      "não são válidos perante a Fazenda Municipal.",
      "são válidos se registrados em cartório.",
      "são válidos mediante simples comunicação ao Fisco.",
    ],
    g: 1,
    c: "Art. 7º, §1º da Lei 6.793/2010: acordos particulares não são oponíveis à Fazenda — reflete o art. 123 do CTN.",
  },

  // ---- ITBI · Lei 8.425/2025 ----
  {
    id: "G14", m: "Legislação Tributária Municipal", f: "Lei nº 8.425/2025 (ITBI Guarulhos) · art. 10",
    e: "Nos termos da Lei nº 8.425/2025, do Município de Guarulhos, a alíquota do ITBI é de:",
    alt: ["2,0% (dois por cento).", "2,5% (dois e meio por cento).", "3,0% (três por cento).", "4,0% (quatro por cento)."],
    g: 2,
    c: "Art. 10 da Lei 8.425/2025: alíquota única de 3,0%.",
  },
  {
    id: "G15", m: "Legislação Tributária Municipal", f: "Lei nº 8.425/2025 (ITBI Guarulhos) · art. 1º, §1º",
    e: "Segundo a Lei nº 8.425/2025, de Guarulhos, o fato gerador do ITBI ocorre:",
    alt: [
      "com a assinatura do compromisso de compra e venda.",
      "com o registro do título translativo de propriedade do bem imóvel na respectiva matrícula, no ofício de registro de imóveis.",
      "com o pagamento do sinal na transação.",
      "com a mera tradição (entrega das chaves) do imóvel.",
    ],
    g: 1,
    c: "Art. 1º, §1º da Lei 8.425/2025: o fato gerador ocorre com o REGISTRO do título translativo — alinhado ao entendimento do STF (Tema 1124).",
  },
  {
    id: "G16", m: "Legislação Tributária Municipal", f: "Lei nº 8.425/2025 (ITBI Guarulhos) · art. 3º",
    e: "De acordo com a Lei nº 8.425/2025, de Guarulhos, o ITBI NÃO incide, entre outras hipóteses:",
    alt: [
      "na compra e venda de imóvel urbano.",
      "na dação em pagamento de bem imóvel.",
      "sobre a transmissão de bem imóvel que volta ao domínio do antigo proprietário por força de retrovenda.",
      "na permuta de bens imóveis entre particulares.",
    ],
    g: 2,
    c: "Art. 3º, II da Lei 8.425/2025: não incide na retrovenda, retrocessão ou pacto de melhor comprador. As demais são hipóteses de incidência (art. 2º).",
  },
  {
    id: "G17", m: "Legislação Tributária Municipal", f: "Lei nº 8.425/2025 (ITBI Guarulhos) · art. 3º, IV e art. 4º",
    e: "A respeito da não incidência do ITBI sobre transmissão de bens integralizados ao patrimônio de pessoa jurídica, conforme a Lei nº 8.425/2025 de Guarulhos, assinale a alternativa CORRETA.",
    alt: [
      "A não incidência é absoluta, aplicando-se inclusive quando a atividade preponderante do adquirente for a compra e venda de imóveis.",
      "A imunidade não se aplica quando o adquirente tiver como atividade preponderante a compra e venda, locação ou arrendamento mercantil desses bens.",
      "A não incidência alcança apenas imóveis residenciais.",
      "O ITBI incide integralmente sobre a realização de capital, sem qualquer exceção.",
    ],
    g: 1,
    c: "Art. 4º da Lei 8.425/2025: afasta-se a não incidência quando a atividade preponderante do adquirente for imobiliária — reproduz o art. 156, §2º, I, da CF.",
  },
  {
    id: "G18", m: "Legislação Tributária Municipal", f: "Lei nº 8.425/2025 (ITBI Guarulhos) · art. 7º",
    e: "Nos termos da Lei nº 8.425/2025, de Guarulhos, a base de cálculo do ITBI é, em regra:",
    alt: [
      "o valor venal do imóvel para fins de IPTU, obrigatoriamente.",
      "o valor declarado pelo contribuinte, podendo o Fisco arbitrar de ofício outro valor quando não condizente com o de mercado.",
      "sempre o valor da avaliação judicial.",
      "o menor valor entre o de mercado e o da escritura anterior.",
    ],
    g: 1,
    c: "Art. 7º da Lei 8.425/2025: base = valor declarado pelo contribuinte; o Fisco pode adotar de ofício outro valor se o declarado não refletir o mercado (assegurados contraditório e impugnação).",
  },
  {
    id: "G19", m: "Legislação Tributária Municipal", f: "Lei nº 8.425/2025 (ITBI Guarulhos) · art. 8º, VIII",
    e: "Segundo a Lei nº 8.425/2025, de Guarulhos, na instituição de usufruto e uso, a base de cálculo do ITBI será reduzida para:",
    alt: ["1/3 (um terço).", "2/3 (dois terços).", "80% (oitenta por cento).", "20% (vinte por cento)."],
    g: 0,
    c: "Art. 8º, VIII, 'a' da Lei 8.425/2025: usufruto/uso reduz a base para 1/3; nua-propriedade para 2/3; enfiteuse para 80%; domínio direto para 20%.",
  },

  // ---- PAT · Lei 5.420/1999 ----
  {
    id: "G20", m: "Processo Administrativo Tributário", f: "Lei nº 5.420/1999 (PAT Guarulhos) · art. 43 (NR Lei 6.164/2006)",
    e: "De acordo com a Lei nº 5.420/1999, de Guarulhos (com a redação da Lei nº 6.164/2006), o prazo para o contribuinte impugnar exigência fiscal, contado da notificação do lançamento ou da intimação, é de:",
    alt: ["10 (dez) dias.", "15 (quinze) dias.", "20 (vinte) dias.", "30 (trinta) dias."],
    g: 3,
    c: "Art. 43 da Lei 5.420/1999 (NR Lei 6.164/2006): prazo de 30 dias para impugnação, independentemente de prévio depósito. A redação original previa 20 dias.",
  },
  {
    id: "G21", m: "Processo Administrativo Tributário", f: "Lei nº 5.420/1999 (PAT Guarulhos) · art. 36",
    e: "Segundo a Lei nº 5.420/1999, de Guarulhos, o julgamento dos atos e defesas, em segunda instância, compete:",
    alt: [
      "ao Prefeito Municipal.",
      "ao responsável pela unidade administrativa de finanças.",
      "à Junta de Recursos Fiscais.",
      "ao Secretário de Fazenda, monocraticamente.",
    ],
    g: 2,
    c: "Art. 36 da Lei 5.420/1999: 1ª instância = responsável pela unidade de finanças; 2ª instância = Junta de Recursos Fiscais.",
  },
  {
    id: "G22", m: "Processo Administrativo Tributário", f: "Lei nº 5.420/1999 (PAT Guarulhos) · art. 53 (NR Lei 6.164/2006)",
    e: "Nos termos da Lei nº 5.420/1999, de Guarulhos (com a redação da Lei nº 6.164/2006), da decisão de primeira instância caberá recurso voluntário à Junta de Recursos Fiscais, no prazo de:",
    alt: ["10 (dez) dias.", "15 (quinze) dias.", "20 (vinte) dias.", "30 (trinta) dias."],
    g: 3,
    c: "Art. 53 da Lei 5.420/1999 (NR Lei 6.164/2006): recurso voluntário em 30 dias contados da ciência.",
  },
  {
    id: "G23", m: "Processo Administrativo Tributário", f: "Lei nº 5.420/1999 (PAT Guarulhos) · art. 42 e 35",
    e: "A respeito da impugnação no processo administrativo tributário de Guarulhos (Lei nº 5.420/1999), assinale a alternativa CORRETA.",
    alt: [
      "A impugnação de exigência fiscal instaura a fase contraditória e independe de garantia de instância.",
      "A impugnação exige prévio depósito integral do crédito para ser admitida.",
      "A impugnação suspende automaticamente a fluência de todos os prazos prescricionais penais.",
      "A impugnação só pode ser apresentada pelo proprietário do imóvel.",
    ],
    g: 0,
    c: "Arts. 42 e 35, § único da Lei 5.420/1999: a impugnação instaura a fase contraditória e independe de garantia de instância (sem depósito prévio) — SV 21/28 do STF.",
  },
  {
    id: "G24", m: "Processo Administrativo Tributário", f: "Lei nº 5.420/1999 (PAT Guarulhos) · art. 37 (NR Lei 6.164/2006)",
    e: "Segundo a Lei nº 5.420/1999, de Guarulhos (redação da Lei nº 6.164/2006), o autuado que não apresentar impugnação e efetuar o pagamento das importâncias exigidas no auto de infração dentro de 30 dias da intimação terá o valor das multas (exceto a moratória) reduzido em:",
    alt: ["20%.", "35%.", "50%.", "100%."],
    g: 2,
    c: "Art. 37 da Lei 5.420/1999 (NR Lei 6.164/2006): redução de 50% das multas (salvo moratória) no pagamento em 30 dias sem impugnação. Se pagar no prazo de recurso após decisão contrária, a redução é de 35% (art. 52).",
  },
  {
    id: "G25", m: "Processo Administrativo Tributário", f: "Lei nº 5.420/1999 (PAT Guarulhos) · art. 38",
    e: "De acordo com a Lei nº 5.420/1999, de Guarulhos, no processo administrativo tributário:",
    alt: [
      "é admitido pedido de reconsideração de qualquer decisão.",
      "não será admitido pedido de reconsideração de qualquer decisão.",
      "cabe recurso ao Prefeito em três instâncias.",
      "as decisões de segunda instância podem ser revistas pela autoridade de primeira instância.",
    ],
    g: 1,
    c: "Art. 38 da Lei 5.420/1999: não se admite pedido de reconsideração de qualquer decisão.",
  },
  {
    id: "G26", m: "Processo Administrativo Tributário", f: "Lei nº 5.420/1999 (PAT Guarulhos) · art. 27 e 28",
    e: "Nos termos da Lei nº 5.420/1999, de Guarulhos, sobre a consulta em matéria tributária, assinale a alternativa CORRETA.",
    alt: [
      "O prazo para resposta à consulta é de 20 (vinte) dias.",
      "Cabe pedido de reconsideração da decisão proferida em processo de consulta.",
      "A consulta produz efeito ainda que formulada por quem já tenha sido intimado a cumprir obrigação relativa ao fato consultado.",
      "A consulta pode ser formulada por qualquer pessoa, ainda que estranha à relação tributária.",
    ],
    g: 0,
    c: "Art. 27 da Lei 5.420/1999: prazo de 20 dias para resposta. Não cabe reconsideração/recurso (art. 32); não produz efeito a consulta de quem já foi intimado (art. 28).",
  },
  {
    id: "G27", m: "Processo Administrativo Tributário", f: "Lei nº 5.420/1999 (PAT Guarulhos) · art. 51",
    e: "Segundo a Lei nº 5.420/1999, de Guarulhos, a autoridade julgadora de primeira instância recorrerá de ofício à Junta de Recursos Fiscais quando:",
    alt: [
      "a decisão mantiver integralmente a exigência fiscal.",
      "a decisão exonerar o contribuinte de tributo e multa acima do valor legalmente fixado, salvo erro manifesto ou direito líquido e certo.",
      "o contribuinte deixar de apresentar impugnação.",
      "houver qualquer impugnação, em todos os casos.",
    ],
    g: 1,
    c: "Art. 51 da Lei 5.420/1999: recurso de ofício (reexame necessário) quando a decisão exonera valores acima do piso legal — proteção do interesse público.",
  },
  {
    id: "G28", m: "Processo Administrativo Tributário", f: "Lei nº 5.420/1999 (PAT Guarulhos) · art. 5º",
    e: "De acordo com a Lei nº 5.420/1999, de Guarulhos, a intimação ou notificação feita por edital presume-se realizada:",
    alt: [
      "na data da publicação.",
      "15 (quinze) dias após a publicação.",
      "30 (trinta) dias após a data da afixação ou da publicação.",
      "no primeiro dia útil seguinte à publicação.",
    ],
    g: 2,
    c: "Art. 5º, III da Lei 5.420/1999: por edital, presume-se feita 30 dias após a afixação/publicação. Por carta, na data do recebimento (ou 15 dias se omitida).",
  },
];

// ============================================================
// ESTRUTURA DA PROVA DE GUARULHOS (Edital 03/2026-SGE01)
// ============================================================
const AREAS = [
  { key: "Língua Portuguesa", turno: "Manhã", cad: "Básico", peso: 1, n: 15 },
  { key: "Raciocínio Lógico e Matemática Financeira", turno: "Manhã", cad: "Básico", peso: 1, n: 10 },
  { key: "TI, Análise de Dados e LGPD", turno: "Manhã", cad: "Básico", peso: 1, n: 15 },
  { key: "Direito Administrativo", turno: "Manhã", cad: "Jurídico", peso: 2, n: 10 },
  { key: "Direito Constitucional", turno: "Manhã", cad: "Jurídico", peso: 2, n: 10 },
  { key: "Direito Tributário", turno: "Manhã", cad: "Jurídico", peso: 2, n: 10 },
  { key: "Direito Empresarial, Penal e Civil", turno: "Manhã", cad: "Jurídico", peso: 2, n: 10 },
  { key: "Legislação Tributária Municipal", turno: "Tarde", cad: "Tributário", peso: 3, n: 20 },
  { key: "Tributos Municipais", turno: "Tarde", cad: "Tributário", peso: 3, n: 10 },
  { key: "Reforma Tributária", turno: "Tarde", cad: "Tributário", peso: 3, n: 15 },
  { key: "Contabilidade Fiscal", turno: "Tarde", cad: "Fiscal", peso: 3, n: 15 },
  { key: "Auditoria Fiscal", turno: "Tarde", cad: "Fiscal", peso: 3, n: 15 },
  { key: "Processo Administrativo Tributário", turno: "Tarde", cad: "Fiscal", peso: 3, n: 5 },
];

const LETRAS = ["A", "B", "C", "D"];
const STORAGE_KEY = "estudo-ibam-guarulhos-v1";
const ALL_QUESTIONS = [...ORIGINAIS.map((q) => ({ ...q, aba: "Originais" })), ...VARIACOES.map((q) => ({ ...q, aba: "Variações" }))];

// ============================================================
// COMPONENTE PRINCIPAL
// ============================================================
export default function App() {
  const [tab, setTab] = useState("originais");
  const [answers, setAnswers] = useState({}); // id -> {resp, rac, duv, verificada}
  const [filtroMateria, setFiltroMateria] = useState("Todas");
  const [mostrarCorrecao, setMostrarCorrecao] = useState(false);
  const [loaded, setLoaded] = useState(false);
  const [saveStatus, setSaveStatus] = useState("");
  const [importMsg, setImportMsg] = useState(null);
  const fileRef = useRef(null);
  const saveTimer = useRef(null);

  // -------- carrega estado salvo automaticamente --------
  useEffect(() => {
    (async () => {
      try {
        const result = await window.storage.get(STORAGE_KEY);
        if (result && result.value) {
          const parsed = JSON.parse(result.value);
          if (parsed && typeof parsed === "object") setAnswers(parsed);
        }
      } catch (e) {
        // chave inexistente na primeira visita — segue normalmente
      }
      setLoaded(true);
    })();
  }, []);

  // -------- salva automaticamente (debounce) --------
  useEffect(() => {
    if (!loaded) return;
    if (saveTimer.current) clearTimeout(saveTimer.current);
    setSaveStatus("salvando…");
    saveTimer.current = setTimeout(async () => {
      try {
        await window.storage.set(STORAGE_KEY, JSON.stringify(answers));
        setSaveStatus("progresso salvo");
      } catch (e) {
        setSaveStatus("falha ao salvar — exporte o Excel por segurança");
      }
    }, 900);
    return () => saveTimer.current && clearTimeout(saveTimer.current);
  }, [answers, loaded]);

  const setField = useCallback((id, field, value) => {
    setAnswers((prev) => ({ ...prev, [id]: { ...(prev[id] || {}), [field]: value } }));
  }, []);

  // -------- estatísticas --------
  const stats = useMemo(() => {
    const porMateria = {};
    let respondidas = 0, acertos = 0;
    ALL_QUESTIONS.forEach((q) => {
      const a = answers[q.id];
      if (!porMateria[q.m]) porMateria[q.m] = { total: 0, resp: 0, acertos: 0 };
      porMateria[q.m].total++;
      if (a && a.resp !== undefined && a.resp !== null && a.resp !== "") {
        respondidas++;
        porMateria[q.m].resp++;
        if (Number(a.resp) === q.g) { acertos++; porMateria[q.m].acertos++; }
      }
    });
    return { porMateria, respondidas, acertos, total: ALL_QUESTIONS.length };
  }, [answers]);

  const projecao = useMemo(() => {
    const areas = AREAS.map((ar) => {
      const s = stats.porMateria[ar.key];
      const temDados = s && s.resp > 0;
      const acc = temDados ? s.acertos / s.resp : null;
      return { ...ar, acc, temDados, resp: s ? s.resp : 0, acertos: s ? s.acertos : 0 };
    });
    const calc = (filtro) => {
      const cov = areas.filter((a) => filtro(a) && a.temDados);
      const pontosPoss = cov.reduce((t, a) => t + a.n * a.peso, 0);
      const pontos = cov.reduce((t, a) => t + a.acc * a.n * a.peso, 0);
      return { pct: pontosPoss > 0 ? pontos / pontosPoss : null, pontos, pontosPoss };
    };
    return {
      areas,
      manha: calc((a) => a.turno === "Manhã"),
      tarde: calc((a) => a.turno === "Tarde"),
      total: calc(() => true),
      semCobertura: areas.filter((a) => !a.temDados),
    };
  }, [stats]);

  // -------- Excel: exportar --------
  const exportarExcel = () => {
    const rows = ALL_QUESTIONS.map((q) => {
      const a = answers[q.id] || {};
      const respIdx = a.resp !== undefined && a.resp !== null && a.resp !== "" ? Number(a.resp) : null;
      return {
        ID: q.id,
        Aba: q.aba,
        "Matéria": q.m,
        Fonte: q.f,
        "Enunciado (resumo)": q.e.length > 140 ? q.e.slice(0, 140) + "…" : q.e,
        "Minha resposta": respIdx !== null ? LETRAS[respIdx] : "",
        Gabarito: LETRAS[q.g],
        Resultado: respIdx === null ? "não respondida" : respIdx === q.g ? "acerto" : "erro",
        "Meu raciocínio": a.rac || "",
        "Minhas dúvidas": a.duv || "",
      };
    });
    const resumo = projecao.areas.map((a) => ({
      "Área (edital Guarulhos)": a.key,
      Turno: a.turno,
      Peso: a.peso,
      "Questões na prova real": a.n,
      "Respondidas aqui": a.resp,
      "Acertos aqui": a.acertos,
      "% de acerto": a.temDados ? Math.round(a.acc * 100) + "%" : "sem dados",
    }));
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, XLSX.utils.json_to_sheet(rows), "Respostas");
    XLSX.utils.book_append_sheet(wb, XLSX.utils.json_to_sheet(resumo), "Resumo por área");
    XLSX.writeFile(wb, "estudo-ibam-guarulhos.xlsx");
  };

  // -------- Excel: importar --------
  const importarExcel = async (file) => {
    try {
      const buf = await file.arrayBuffer();
      const wb = XLSX.read(buf);
      const ws = wb.Sheets["Respostas"] || wb.Sheets[wb.SheetNames[0]];
      const rows = XLSX.utils.sheet_to_json(ws);
      const novo = {};
      let restauradas = 0;
      rows.forEach((r) => {
        const id = String(r["ID"] || "").trim();
        const q = ALL_QUESTIONS.find((x) => x.id === id);
        if (!q) return;
        const letra = String(r["Minha resposta"] || "").trim().toUpperCase();
        const idx = LETRAS.indexOf(letra);
        const entry = {};
        if (idx >= 0) entry.resp = idx;
        if (r["Meu raciocínio"]) entry.rac = String(r["Meu raciocínio"]);
        if (r["Minhas dúvidas"]) entry.duv = String(r["Minhas dúvidas"]);
        if (Object.keys(entry).length > 0) { novo[id] = entry; restauradas++; }
      });
      setAnswers((prev) => ({ ...prev, ...novo }));
      setImportMsg({ ok: true, txt: `${restauradas} questão(ões) restaurada(s) do arquivo.` });
    } catch (e) {
      setImportMsg({ ok: false, txt: "Não foi possível ler o arquivo. Use o Excel exportado por este app." });
    }
  };

  const limparTudo = async () => {
    setAnswers({});
    try { await window.storage.delete(STORAGE_KEY); } catch (e) {}
  };

  const materiasDaAba = (aba) => ["Todas", ...Array.from(new Set((aba === "originais" ? ORIGINAIS : VARIACOES).map((q) => q.m)))];

  // ============================================================
  // RENDER
  // ============================================================
  const questoesVisiveis = (tab === "originais" ? ORIGINAIS : VARIACOES).filter(
    (q) => filtroMateria === "Todas" || q.m === filtroMateria
  );

  return (
    <div className="min-h-screen" style={{ background: "#101418", color: "#E8E4DA", fontFamily: "Georgia, 'Times New Roman', serif" }}>
      {/* ---------- CABEÇALHO ---------- */}
      <header className="px-5 pt-8 pb-5 max-w-5xl mx-auto">
        <div className="flex items-start justify-between flex-wrap gap-3">
          <div>
            <p className="text-xs tracking-widest uppercase mb-1" style={{ color: "#8FA3B8", fontFamily: "ui-monospace, monospace" }}>
              Guarulhos · Edital 03/2026-SGE01 · Prova 13/09/2026
            </p>
            <h1 className="text-3xl font-bold leading-tight" style={{ color: "#F5F1E6" }}>
              Caderno de Treino <span style={{ color: "#4E8FD9" }}>· Auditor Fiscal VI</span>
            </h1>
            <p className="text-sm mt-1" style={{ color: "#A8B4BE" }}>
              Banca IBAM — questões reais (Santos 2020 · Mauá 2014) + variações inéditas no estilo da banca
            </p>
          </div>
          <div className="text-right text-xs" style={{ color: "#7C8894", fontFamily: "ui-monospace, monospace" }}>
            <div>{stats.respondidas}/{stats.total} respondidas</div>
            <div style={{ color: "#5E9E6F" }}>{saveStatus}</div>
          </div>
        </div>

        {/* ---------- ABAS ---------- */}
        <nav className="flex gap-1 mt-6 flex-wrap">
          {[
            ["originais", `Questões reais (${ORIGINAIS.length})`],
            ["variacoes", `Variações IBAM (${VARIACOES.length})`],
            ["dashboard", "Dashboard"],
            ["dados", "Salvar / Retomar"],
          ].map(([k, label]) => (
            <button
              key={k}
              onClick={() => { setTab(k); setFiltroMateria("Todas"); }}
              className="px-4 py-2 text-sm rounded-t-lg transition-colors"
              style={{
                fontFamily: "ui-monospace, monospace",
                background: tab === k ? "#1B2530" : "transparent",
                color: tab === k ? "#F5F1E6" : "#7C8894",
                borderBottom: tab === k ? "2px solid #4E8FD9" : "2px solid transparent",
              }}
            >
              {label}
            </button>
          ))}
        </nav>
      </header>

      <main className="max-w-5xl mx-auto px-5 pb-16">
        {/* ================= ABAS DE QUESTÕES ================= */}
        {(tab === "originais" || tab === "variacoes") && (
          <div>
            <div className="flex items-center gap-3 flex-wrap mb-5 p-3 rounded-lg" style={{ background: "#1B2530" }}>
              <label className="text-xs uppercase tracking-wider" style={{ color: "#8FA3B8", fontFamily: "ui-monospace, monospace" }}>
                Filtrar matéria
              </label>
              <select
                value={filtroMateria}
                onChange={(e) => setFiltroMateria(e.target.value)}
                className="text-sm px-3 py-1.5 rounded"
                style={{ background: "#101418", color: "#E8E4DA", border: "1px solid #2E3B48" }}
              >
                {materiasDaAba(tab).map((m) => (
                  <option key={m} value={m}>{m}</option>
                ))}
              </select>
              <label className="flex items-center gap-2 text-sm ml-auto cursor-pointer select-none" style={{ color: "#A8B4BE" }}>
                <input type="checkbox" checked={mostrarCorrecao} onChange={(e) => setMostrarCorrecao(e.target.checked)} />
                Modo correção (mostra gabarito ao responder)
              </label>
            </div>

            {tab === "variacoes" && (
              <p className="text-sm mb-5 p-3 rounded-lg leading-relaxed" style={{ background: "#22303C", color: "#C4CDD5", borderLeft: "3px solid #4E8FD9" }}>
                Questões inéditas escritas no estilo IBAM ("assinale a incorreta", "não é correto afirmar"), cobrindo as matérias do
                edital de Guarulhos que não existiam nas provas antigas: Reforma Tributária, LGPD, TI/Dados, RLM e Tributos Municipais.
                A prova real terá 5 alternativas por questão — aqui mantive 4 para espelhar as provas históricas da banca.
              </p>
            )}

            <div className="space-y-6">
              {questoesVisiveis.map((q, i) => (
                <QuestaoCard
                  key={q.id}
                  q={q}
                  num={i + 1}
                  data={answers[q.id] || {}}
                  setField={setField}
                  mostrarCorrecao={mostrarCorrecao}
                />
              ))}
            </div>
          </div>
        )}

        {/* ================= DASHBOARD ================= */}
        {tab === "dashboard" && <Dashboard stats={stats} projecao={projecao} />}

        {/* ================= DADOS ================= */}
        {tab === "dados" && (
          <div className="space-y-5 max-w-2xl">
            <Card title="Salvamento automático">
              <p className="text-sm leading-relaxed" style={{ color: "#A8B4BE" }}>
                Seu progresso (respostas, raciocínios e dúvidas) é salvo automaticamente neste app. Ao reabrir esta conversa e este
                artefato, você continua de onde parou. O Excel abaixo é a sua camada extra de segurança — e o arquivo que você me
                envia depois para eu analisar seus erros e montar o plano de estudos.
              </p>
            </Card>

            <Card title="Exportar progresso (.xlsx)">
              <p className="text-sm mb-3" style={{ color: "#A8B4BE" }}>
                Gera um Excel com duas planilhas: <em>Respostas</em> (cada questão com sua resposta, gabarito, resultado, raciocínio e
                dúvidas) e <em>Resumo por área</em>. Envie esse arquivo para mim quando quiser a análise.
              </p>
              <button
                onClick={exportarExcel}
                className="px-5 py-2.5 rounded-lg text-sm font-bold transition-transform hover:scale-105"
                style={{ background: "#4E8FD9", color: "#0D1116", fontFamily: "ui-monospace, monospace" }}
              >
                ⬇ Baixar Excel
              </button>
            </Card>

            <Card title="Retomar de um Excel">
              <p className="text-sm mb-3" style={{ color: "#A8B4BE" }}>
                Desligou o computador? Faça upload do Excel exportado anteriormente e suas respostas, raciocínios e dúvidas voltam
                exatamente de onde pararam.
              </p>
              <input
                ref={fileRef}
                type="file"
                accept=".xlsx,.xls"
                onChange={(e) => e.target.files && e.target.files[0] && importarExcel(e.target.files[0])}
                className="text-sm"
                style={{ color: "#A8B4BE" }}
              />
              {importMsg && (
                <p className="text-sm mt-2" style={{ color: importMsg.ok ? "#5E9E6F" : "#D9704E" }}>{importMsg.txt}</p>
              )}
            </Card>

            <Card title="Zona de risco">
              <button
                onClick={limparTudo}
                className="px-4 py-2 rounded-lg text-sm"
                style={{ background: "transparent", color: "#D9704E", border: "1px solid #D9704E" }}
              >
                Apagar todo o progresso
              </button>
            </Card>
          </div>
        )}
      </main>
    </div>
  );
}

// ============================================================
// CARTÃO DE QUESTÃO — com "bolhas" de folha de respostas
// ============================================================
function QuestaoCard({ q, num, data, setField, mostrarCorrecao }) {
  const respIdx = data.resp !== undefined && data.resp !== null && data.resp !== "" ? Number(data.resp) : null;
  const respondida = respIdx !== null;
  const acertou = respondida && respIdx === q.g;
  const revelar = mostrarCorrecao && respondida;

  return (
    <article className="rounded-xl p-5" style={{ background: "#1B2530", border: "1px solid #2E3B48" }}>
      <div className="flex items-baseline justify-between gap-3 flex-wrap mb-2">
        <div className="flex items-baseline gap-3">
          <span className="text-lg font-bold" style={{ color: "#4E8FD9", fontFamily: "ui-monospace, monospace" }}>
            {String(num).padStart(2, "0")}
          </span>
          <span className="text-xs px-2 py-0.5 rounded-full" style={{ background: "#22303C", color: "#8FA3B8", fontFamily: "ui-monospace, monospace" }}>
            {q.m}
          </span>
        </div>
        <span className="text-xs" style={{ color: "#5C6874", fontFamily: "ui-monospace, monospace" }}>{q.id} · {q.f}</span>
      </div>

      <p className="leading-relaxed mb-4" style={{ color: "#E8E4DA" }}>{q.e}</p>

      {/* alternativas com bolha estilo folha de respostas */}
      <div className="space-y-2">
        {q.alt.map((texto, idx) => {
          const selecionada = respIdx === idx;
          const eGabarito = revelar && idx === q.g;
          const erroSelecionado = revelar && selecionada && idx !== q.g;
          return (
            <button
              key={idx}
              onClick={() => setField(q.id, "resp", idx)}
              className="w-full text-left flex items-start gap-3 p-2.5 rounded-lg transition-colors"
              style={{
                background: eGabarito ? "rgba(94,158,111,0.15)" : erroSelecionado ? "rgba(217,112,78,0.12)" : selecionada ? "#22303C" : "transparent",
                border: `1px solid ${eGabarito ? "#5E9E6F" : erroSelecionado ? "#D9704E" : selecionada ? "#4E8FD9" : "transparent"}`,
              }}
            >
              <span
                className="flex-shrink-0 w-7 h-7 rounded-full flex items-center justify-center text-xs font-bold mt-0.5"
                style={{
                  fontFamily: "ui-monospace, monospace",
                  background: selecionada ? "#4E8FD9" : "transparent",
                  color: selecionada ? "#0D1116" : "#8FA3B8",
                  border: `2px solid ${selecionada ? "#4E8FD9" : "#3A4855"}`,
                }}
              >
                {LETRAS[idx]}
              </span>
              <span className="text-sm leading-relaxed pt-1" style={{ color: selecionada ? "#F5F1E6" : "#C4CDD5" }}>{texto}</span>
            </button>
          );
        })}
      </div>

      {revelar && (
        <div className="mt-3 p-3 rounded-lg text-sm leading-relaxed" style={{ background: acertou ? "rgba(94,158,111,0.12)" : "rgba(217,112,78,0.1)", color: "#C4CDD5" }}>
          <strong style={{ color: acertou ? "#5E9E6F" : "#D9704E", fontFamily: "ui-monospace, monospace" }}>
            {acertou ? "✓ Acertou" : `✗ Errou — gabarito: ${LETRAS[q.g]}`}
          </strong>
          {q.c && <span className="block mt-1" style={{ color: "#A8B4BE" }}>{q.c}</span>}
        </div>
      )}

      <div className="grid md:grid-cols-2 gap-3 mt-4">
        <div>
          <label className="text-xs uppercase tracking-wider block mb-1" style={{ color: "#8FA3B8", fontFamily: "ui-monospace, monospace" }}>
            Meu raciocínio
          </label>
          <textarea
            value={data.rac || ""}
            onChange={(e) => setField(q.id, "rac", e.target.value)}
            rows={3}
            placeholder="Por que escolhi essa alternativa? Que regra/artigo apliquei?"
            className="w-full text-sm p-2.5 rounded-lg resize-y"
            style={{ background: "#101418", color: "#E8E4DA", border: "1px solid #2E3B48", fontFamily: "Georgia, serif" }}
          />
        </div>
        <div>
          <label className="text-xs uppercase tracking-wider block mb-1" style={{ color: "#8FA3B8", fontFamily: "ui-monospace, monospace" }}>
            Minhas dúvidas
          </label>
          <textarea
            value={data.duv || ""}
            onChange={(e) => setField(q.id, "duv", e.target.value)}
            rows={3}
            placeholder="O que ficou nebuloso? O que preciso revisar?"
            className="w-full text-sm p-2.5 rounded-lg resize-y"
            style={{ background: "#101418", color: "#E8E4DA", border: "1px solid #2E3B48", fontFamily: "Georgia, serif" }}
          />
        </div>
      </div>
    </article>
  );
}

// ============================================================
// DASHBOARD
// ============================================================
function Dashboard({ stats, projecao }) {
  const pct = (v) => (v === null ? "—" : Math.round(v * 100) + "%");
  const StatusBadge = ({ ok, label }) => (
    <span
      className="text-xs px-2.5 py-1 rounded-full font-bold"
      style={{
        fontFamily: "ui-monospace, monospace",
        background: ok === null ? "#22303C" : ok ? "rgba(94,158,111,0.2)" : "rgba(217,112,78,0.15)",
        color: ok === null ? "#7C8894" : ok ? "#5E9E6F" : "#D9704E",
      }}
    >
      {label}
    </span>
  );

  return (
    <div className="space-y-6">
      {/* Simulação de habilitação */}
      <Card title="Projeção de nota — regras do edital (item 7.8)">
        <p className="text-xs mb-4" style={{ color: "#7C8894" }}>
          Habilitação exige ≥ 50% por turno E ≥ 60% no total (com os pesos por caderno). A projeção usa sua taxa de acerto em cada
          área aplicada ao nº real de questões × peso da prova de Guarulhos — considerando apenas áreas em que você já respondeu algo.
        </p>
        <div className="grid sm:grid-cols-3 gap-4">
          {[
            ["Turno da manhã", projecao.manha, 0.5],
            ["Turno da tarde", projecao.tarde, 0.5],
            ["Nota total", projecao.total, 0.6],
          ].map(([label, p, corte]) => (
            <div key={label} className="p-4 rounded-xl text-center" style={{ background: "#101418", border: "1px solid #2E3B48" }}>
              <p className="text-xs uppercase tracking-wider mb-1" style={{ color: "#8FA3B8", fontFamily: "ui-monospace, monospace" }}>{label}</p>
              <p className="text-4xl font-bold mb-2" style={{ color: p.pct === null ? "#5C6874" : p.pct >= corte ? "#5E9E6F" : "#D9704E" }}>
                {pct(p.pct)}
              </p>
              <StatusBadge
                ok={p.pct === null ? null : p.pct >= corte}
                label={p.pct === null ? "sem dados" : p.pct >= corte ? `✓ acima do corte (${corte * 100}%)` : `✗ abaixo do corte (${corte * 100}%)`}
              />
            </div>
          ))}
        </div>
      </Card>

      {/* Forças por área */}
      <Card title="Forças e fraquezas por área do edital">
        <div className="space-y-3">
          {projecao.areas.map((a) => (
            <div key={a.key}>
              <div className="flex justify-between items-baseline text-sm mb-1 gap-2 flex-wrap">
                <span style={{ color: "#E8E4DA" }}>
                  {a.key}
                  <span className="text-xs ml-2" style={{ color: "#5C6874", fontFamily: "ui-monospace, monospace" }}>
                    {a.turno} · peso {a.peso} · {a.n}q na prova
                  </span>
                </span>
                <span className="text-xs" style={{ color: "#8FA3B8", fontFamily: "ui-monospace, monospace" }}>
                  {a.temDados ? `${a.acertos}/${a.resp} · ${Math.round(a.acc * 100)}%` : "sem questões respondidas"}
                </span>
              </div>
              <div className="h-2.5 rounded-full overflow-hidden" style={{ background: "#101418" }}>
                <div
                  className="h-full rounded-full transition-all"
                  style={{
                    width: a.temDados ? `${Math.max(a.acc * 100, 3)}%` : "0%",
                    background: !a.temDados ? "transparent" : a.acc >= 0.7 ? "#5E9E6F" : a.acc >= 0.5 ? "#D9A84E" : "#D9704E",
                  }}
                />
              </div>
            </div>
          ))}
        </div>
        {projecao.semCobertura.length > 0 && (
          <p className="text-xs mt-4 leading-relaxed" style={{ color: "#7C8894" }}>
            <strong style={{ color: "#D9A84E" }}>Sem cobertura ainda:</strong>{" "}
            {projecao.semCobertura.map((a) => a.key).join(" · ")}. Responda questões dessas áreas (ou me peça mais variações) para a
            projeção ficar completa — note que Legislação Tributária Municipal de Guarulhos e PAT valem peso 3 e ainda não têm questões aqui.
          </p>
        )}
      </Card>

      {/* Visão geral */}
      <Card title="Visão geral">
        <div className="flex gap-8 flex-wrap text-center">
          <div>
            <p className="text-3xl font-bold" style={{ color: "#4E8FD9" }}>{stats.respondidas}</p>
            <p className="text-xs" style={{ color: "#8FA3B8" }}>respondidas de {stats.total}</p>
          </div>
          <div>
            <p className="text-3xl font-bold" style={{ color: "#5E9E6F" }}>{stats.acertos}</p>
            <p className="text-xs" style={{ color: "#8FA3B8" }}>acertos</p>
          </div>
          <div>
            <p className="text-3xl font-bold" style={{ color: "#D9704E" }}>{stats.respondidas - stats.acertos}</p>
            <p className="text-xs" style={{ color: "#8FA3B8" }}>erros</p>
          </div>
          <div>
            <p className="text-3xl font-bold" style={{ color: "#E8E4DA" }}>
              {stats.respondidas > 0 ? Math.round((stats.acertos / stats.respondidas) * 100) + "%" : "—"}
            </p>
            <p className="text-xs" style={{ color: "#8FA3B8" }}>aproveitamento bruto</p>
          </div>
        </div>
      </Card>
    </div>
  );
}

function Card({ title, children }) {
  return (
    <section className="rounded-xl p-5" style={{ background: "#1B2530", border: "1px solid #2E3B48" }}>
      <h2 className="text-sm uppercase tracking-widest font-bold mb-4" style={{ color: "#8FA3B8", fontFamily: "ui-monospace, monospace" }}>
        {title}
      </h2>
      {children}
    </section>
  );
}
