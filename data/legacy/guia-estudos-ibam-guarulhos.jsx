import { useState, useEffect, useRef, useCallback } from "react";

// ============================================================
// GUIA DE ESTUDOS — Auditor Fiscal VI · Guarulhos (IBAM)
// Plano recalculado: início 11/07 · prova 13/09
// Capacidade real: ~10h casa + ~12h trem = ~22h/semana (~200h)
// Fluxo: ENTENDER → TESTAR → CORRIGIR → ESPAÇAR
// ============================================================

const PLANO = [
  {
    sem: "Semana 1", periodo: "11–17 jul", foco: "Direito Tributário — a base de tudo",
    cor: "#4E8FD9",
    meta: "Sem o CTN, nada mais faz sentido: Legislação Municipal e Reforma são aplicações dele. Comece por aqui, hoje.",
    casa: [
      "ENTENDER (4h): resumo 'Direito Tributário — CTN'. Leia um bloco, FECHE, e reescreva de memória com suas palavras (não copie).",
      "TESTAR (3h): app → filtrar 'Direito Tributário'. Modo correção LIGADO.",
      "CORRIGIR (3h): cada erro → voltar ao resumo e escrever o PORQUÊ no campo 'meu raciocínio'.",
    ],
    trem: [
      "Flashcards → filtro 'Direito Tributário' (12 cartões).",
      "Foco nos mnemônicos: MORDER-LIMPAR (suspensão) e A-T-P-E (integração).",
      "Meta da semana: virar os 12 cartões de Trib. para nível 'sei'.",
    ],
  },
  {
    sem: "Semana 2", periodo: "18–24 jul", foco: "Legislação Municipal — ISS + IPTU",
    cor: "#5E9E6F",
    meta: "★ MAIOR PESO DA PROVA: 20 questões × peso 3 = 60 pontos. Lei seca, local, decorável — e quase ninguém estuda a fundo. É aqui que você ganha.",
    casa: [
      "ENTENDER (4h): resumo 'Legislação Municipal — ISS e IPTU'. Monte SUA tabela de alíquotas à mão.",
      "TESTAR (3h): app → 'Legislação Tributária Municipal' (questões G01–G13).",
      "CORRIGIR (3h): cada alíquota errada → reescrever à mão. Números só entram na mão, não no olho.",
    ],
    trem: [
      "Flashcards → 'Legislação Municipal' (16 cartões — o maior bloco).",
      "ESPAÇAR: os cartões de Direito Tributário da Semana 1 já vão reaparecer sozinhos (3 dias).",
      "Decorar: ISS mín 2% · IPTU resid. 0,3%→1,4% · terreno 3,5%.",
    ],
  },
  {
    sem: "Semana 3", periodo: "25–31 jul", foco: "Legislação Municipal — ITBI + PAT",
    cor: "#5E9E6F",
    meta: "Fecha o bloco de maior peso. ITBI (3%) e os prazos do PAT (30 dias) são campeões de cobrança em prova municipal.",
    casa: [
      "ENTENDER (4h): resumo 'Legislação Municipal — ITBI e PAT'. Desenhe o FLUXO do processo (auto → impugnação → 1ª instância → recurso → Junta).",
      "TESTAR (3h): app → questões G14–G28 + 'Tributos Municipais'.",
      "CORRIGIR (3h): tabela de prazos e de reduções de multa (50% / 35%).",
    ],
    trem: [
      "Flashcards → 'PAT (Processo Adm.)' (8 cartões) + revisão de Leg. Municipal.",
      "Decorar: ITBI 3% · fato gerador no REGISTRO · impugnação 30d · recurso 30d.",
      "ESPAÇAR: Semana 1 reaparece no intervalo de 7 dias.",
    ],
  },
  {
    sem: "Semana 4", periodo: "1–7 ago", foco: "Reforma Tributária (EC 132 · IBS/CBS)",
    cor: "#D9A84E",
    meta: "45 pontos ponderados. Tema novíssimo, mais lógica que decoreba — ótimo retorno por hora.",
    casa: [
      "ENTENDER (4h): resumo 'Reforma Tributária'. Desenhe a linha do tempo 2026→2033→2078.",
      "TESTAR (3h): app → 'Reforma Tributária'.",
      "CORRIGIR (3h): explique em voz alta (ou escrevendo) por que o IBS é no DESTINO. Se souber explicar, aprendeu.",
    ],
    trem: [
      "Flashcards → 'Reforma Tributária' (8 cartões).",
      "Decorar: CBS←PIS/Cofins · IBS←ICMS/ISS · 2033 fim do ISS.",
      "ESPAÇAR: Leg. Municipal reaparece (intervalo 7d).",
    ],
  },
  {
    sem: "Semana 5", periodo: "8–14 ago", foco: "Contabilidade + Auditoria Fiscal",
    cor: "#D9A84E",
    meta: "Caderno 4 inteiro: 30 questões × peso 3 = 90 pontos ponderados. Denso, mas os padrões se repetem.",
    casa: [
      "ENTENDER (5h): resumo 'Contabilidade e Auditoria'. Foco em omissão de receita (saldo credor de caixa / passivo fictício).",
      "TESTAR (3h): app → 'Contabilidade Fiscal' e 'Auditoria Fiscal'.",
      "CORRIGIR (2h): REFAÇA os cálculos do zero, na mão (média ponderada, ICMS a recolher). Ver a resolução não ensina — fazer, sim.",
    ],
    trem: [
      "Flashcards → 'Contabilidade/Auditoria' (9 cartões).",
      "Decorar: tipos de opinião do auditor · indícios de omissão de receita.",
      "ESPAÇAR: Trib. e Reforma reaparecem.",
    ],
  },
  {
    sem: "Semana 6", periodo: "15–21 ago", foco: "Direito Administrativo + Constitucional",
    cor: "#B97BD9",
    meta: "Peso 2 (manhã). Com ~200h você agora cobre isso bem — antes seria triagem.",
    casa: [
      "ENTENDER (5h): resumo 'Direito Administrativo e Constitucional'.",
      "TESTAR (3h): app → 'Direito Administrativo' e 'Direito Constitucional'.",
      "CORRIGIR (2h): tabela anulação × revogação; lista das limitações ao poder de tributar.",
    ],
    trem: [
      "Flashcards → 'Direito Administrativo' (6) + 'Direito Constitucional' (5).",
      "Decorar: anulação ex TUNC × revogação ex NUNC · risco administrativo (tem excludente).",
      "ESPAÇAR: revisões acumuladas aparecem sozinhas.",
    ],
  },
  {
    sem: "Semana 7", periodo: "22–28 ago", foco: "Empresarial/Penal/Civil + Português",
    cor: "#B97BD9",
    meta: "Empresarial/Penal é peso 2 e extenso — foque no mais cobrado. Português (peso 1): só os erros que a banca repete.",
    casa: [
      "ENTENDER (4h): resumo 'Empresarial/Penal/Civil + Português'. Prioridade: crimes do fiscal (concussão × corrupção × peculato).",
      "TESTAR (3h): app → 'Direito Empresarial, Penal e Civil' e 'Língua Portuguesa'.",
      "CORRIGIR (3h): caderno de erros.",
    ],
    trem: [
      "Flashcards → 'Penal/Empresarial' (6 cartões).",
      "Decorar: concussão = EXIGIR · corrupção passiva = SOLICITAR/RECEBER.",
      "ESPAÇAR: acumulado das semanas 1–6.",
    ],
  },
  {
    sem: "Semana 8", periodo: "29 ago–4 set", foco: "TI/Dados/LGPD + RLM + caderno de erros",
    cor: "#4E8FD9",
    meta: "Peso 1 e sua zona de conforto (VBA/Python/BI). Pouca hora aqui — o grosso da semana vai para SEUS erros acumulados.",
    casa: [
      "ENTENDER (2h): resumo 'TI/Dados/LGPD + RLM'. Leitura rápida — fixe só as definições legais da LGPD.",
      "TESTAR (2h): app → 'TI, Análise de Dados e LGPD' e 'Raciocínio Lógico'.",
      "ATACAR ERROS (6h): exporte o Excel do app e me mande — eu monto sua lista de reincidência. Refaça SÓ o que erra.",
    ],
    trem: [
      "Flashcards → 'LGPD/TI/RLM' (7 cartões) + tudo que estiver marcado 'errei'.",
      "Decorar: dados sensíveis · CID × ACID · negação do 'todo'.",
    ],
  },
  {
    sem: "Semana 9", periodo: "5–12 set", foco: "Simulado + consolidação final",
    cor: "#D9704E",
    meta: "Nada novo. Consolidar. Prova dia 13 — descansar na véspera faz parte da estratégia.",
    casa: [
      "SIMULADO (4h): app inteiro, cronômetro, SEM modo correção. Depois confira tudo de uma vez.",
      "REVISÃO (4h): todos os blocos '★ Decorar' dos resumos. Recupere de memória ANTES de conferir.",
      "PONTOS FRACOS (2h): só o que ainda erra.",
    ],
    trem: [
      "Flashcards: TODOS os cartões, sem filtro. Meta: zerar a fila.",
      "12/09 (véspera): revisão leve, nada novo. Durma cedo.",
      "13/09: PROVA. Leve a lógica, não a decoreba.",
    ],
  },
];

const RESUMOS = [
  {
    id: "trib", titulo: "Direito Tributário — CTN", peso: 2, cor: "#4E8FD9",
    intro: "A base de todo o resto. Se você entender o CTN, Legislação Municipal e Reforma passam a fazer sentido sozinhas.",
    secoes: [
      {
        h: "Competência × Capacidade tributária",
        p: "COMPETÊNCIA é o poder de INSTITUIR o tributo (dado pela Constituição). É indelegável e irrenunciável — o Município não pode 'passar' para outro o poder de criar o ISS. CAPACIDADE tributária ativa é a função de ARRECADAR e FISCALIZAR — essa sim pode ser delegada. Não exercer a competência não a transfere a ninguém (art. 7º e 8º do CTN).",
      },
      {
        h: "Natureza do tributo — o que define",
        p: "O que define a espécie tributária é o FATO GERADOR (art. 4º). São irrelevantes o nome dado e o destino do dinheiro (ressalvadas exceções constitucionais). Uma 'taxa' que na verdade tem fato gerador de imposto é imposto disfarçado.",
      },
      {
        h: "Obrigação principal × acessória",
        p: "PRINCIPAL = pagar tributo ou multa (obrigação de dar dinheiro). ACESSÓRIA = fazer ou não fazer no interesse da fiscalização (emitir nota, escriturar, declarar). Pegadinha clássica: a multa por descumprir uma acessória vira obrigação PRINCIPAL (converte-se em dinheiro).",
      },
      {
        h: "Lançamento — 3 modalidades",
        p: "É o ato que constitui o crédito tributário. DE OFÍCIO (direto): o Fisco faz sozinho — típico do IPTU e das taxas. POR DECLARAÇÃO (misto): o contribuinte informa, o Fisco calcula — ex. ITBI em alguns municípios. POR HOMOLOGAÇÃO: o contribuinte apura E paga antecipadamente, o Fisco só homologa depois — ISS, ICMS, IR. O lançamento reporta-se à data do fato gerador e rege-se pela lei de então (art. 144).",
      },
      {
        h: "Suspensão da exigibilidade — mnemônico MORDER-LIMPAR",
        p: "Art. 151. MORatória, DEpósito do montante integral, Reclamações e Recursos administrativos, LIMinar (mandado de segurança), PARcelamento. Enquanto suspenso, o Fisco não pode cobrar, mas o crédito continua existindo.",
      },
      {
        h: "Extinção × Exclusão — o par que mais confunde",
        p: "EXTINÇÃO (art. 156): o crédito acaba. Pagamento, compensação, transação, remissão (perdão do crédito já constituído), prescrição, decadência, etc. EXCLUSÃO (art. 175): impede o crédito de nascer/ser cobrado. São só DUAS: ISENÇÃO e ANISTIA (perdão da multa/infração). Cuidado com o par remissão (extinção) × anistia (exclusão) — a IBAM adora trocar.",
      },
      {
        h: "Decadência × Prescrição",
        p: "Ambas 5 anos. DECADÊNCIA = Fazenda perde o direito de CONSTITUIR o crédito (lançar) — conta-se, em regra, do 1º dia do exercício seguinte. PRESCRIÇÃO = perde o direito de COBRAR judicialmente o crédito já constituído — conta-se da constituição definitiva.",
      },
      {
        h: "Integração — mnemônico A-T-P-E",
        p: "Art. 108, na ausência de norma expressa, nesta ordem: Analogia → princípios gerais de direito Tributário → princípios gerais de direito Público → Equidade. Limites: analogia não cria tributo; equidade não dispensa tributo devido.",
      },
      {
        h: "Denúncia espontânea (art. 138)",
        p: "Se o contribuinte confessa a infração E paga o tributo + juros ANTES de qualquer fiscalização, fica livre da multa. Se o Fisco já começou a agir, perdeu a chance.",
      },
    ],
    memorizar: [
      "Suspende: MORDER-LIMPAR (Moratória, Depósito, Reclamações/Recursos, Liminar, Parcelamento)",
      "Exclui: só ISENÇÃO e ANISTIA. Extingue: o resto (inclui remissão, prescrição, decadência).",
      "Lançamento: IPTU=ofício, ISS/IR=homologação",
      "Competência não se delega; capacidade (arrecadar/fiscalizar) sim",
      "Decadência = constituir; Prescrição = cobrar",
    ],
  },
  {
    id: "muni1", titulo: "Legislação Municipal — ISS e IPTU (Guarulhos)", peso: 3, cor: "#5E9E6F",
    intro: "O MAIOR peso da prova (20 questões peso 3). Lei seca de Guarulhos — pura memorização com entendimento. Prioridade máxima.",
    secoes: [
      {
        h: "ISS — Lei 5.986/2003 · pontos-chave",
        p: "Fato gerador: prestação de serviço da lista anexa (LC 116). Contribuinte: o PRESTADOR (art. 8º). Base de cálculo: o PREÇO DO SERVIÇO (art. 10). Local do imposto: em regra, o do ESTABELECIMENTO PRESTADOR (art. 5º), com exceções (obra, limpeza, etc. = local da prestação). Alíquota MÍNIMA: 2% (art. 13-A). Solidariedade não comporta benefício de ordem (art. 9º, §2º).",
      },
      {
        h: "ISS — detalhes que a banca cobra",
        p: "Serviços em mais de uma alíquota sem escrituração separada → aplica-se a MAIS ELEVADA (art. 4º). O tomador pessoa jurídica é responsável solidário se não exigir nota/inscrição do prestador. MEI/ME/EPP têm tratamento diferenciado (Simples). Não incide sobre relação de emprego (isso é da LC 116, art. 2º).",
      },
      {
        h: "IPTU — Lei 6.793/2010 · pontos-chave",
        p: "Hipótese: propriedade, domínio útil ou posse de imóvel na zona urbana. Contribuinte: proprietário, titular do domínio útil OU possuidor a qualquer título (art. 7º). Base de cálculo: VALOR VENAL (art. 9º). Lançamento: DE OFÍCIO e anual, pelo Cadastro Fiscal Imobiliário (art. 27). Acordos particulares NÃO valem contra a Fazenda (art. 7º, §1º = art. 123 CTN).",
      },
      {
        h: "IPTU — as alíquotas de Guarulhos (DECORAR)",
        p: "RESIDENCIAL (progressivo por faixa de valor venal em UFG): 0,3% até 10 mil UFG; 0,5% de 10–20 mil; 0,8% de 20–40 mil; 1,0% de 40–60 mil; 1,4% acima de 60 mil. NÃO RESIDENCIAL: 0,8% até 20 mil; sobe até 2,0% acima de 300 mil. TERRENO (não edificado): 3,5% — a mais alta, contra especulação.",
      },
    ],
    memorizar: [
      "ISS: contribuinte = PRESTADOR; base = PREÇO do serviço; mínima 2%",
      "ISS local: regra = estabelecimento prestador",
      "IPTU: base = VALOR VENAL; lançamento de OFÍCIO anual",
      "IPTU Guarulhos: residencial 0,3%→1,4% | terreno 3,5% (a mais alta)",
      "Acordo particular não muda quem paga (vale p/ IPTU e ISS)",
    ],
  },
  {
    id: "muni2", titulo: "Legislação Municipal — ITBI e PAT (Guarulhos)", peso: 3, cor: "#5E9E6F",
    intro: "Continuação do maior bloco. ITBI e o rito do processo administrativo (prazos!) são campeões de cobrança.",
    secoes: [
      {
        h: "ITBI — Lei 8.425/2025 · pontos-chave",
        p: "Fato gerador: transmissão inter vivos, onerosa, de imóvel/direitos reais (exceto garantia). Ocorre com o REGISTRO do título (art. 1º, §1º) — não na escritura, não no compromisso (STF Tema 1124). Alíquota: 3,0% (art. 10). Base: valor declarado pelo contribuinte, com arbitramento possível pelo Fisco (art. 7º). Competência: Município da SITUAÇÃO do bem.",
      },
      {
        h: "ITBI — não incidência (art. 3º)",
        p: "Não incide: retrovenda/retrocessão; realização de capital (integralização); fusão/incorporação/cisão/extinção de PJ; extinção de condomínio sem aumento patrimonial. MAS: a imunidade da integralização e das reorganizações NÃO vale se a atividade preponderante do adquirente for imobiliária (compra/venda, locação, arrendamento) — art. 4º. Reduções de base: usufruto/uso 1/3; nua-propriedade 2/3; enfiteuse 80%; domínio direto 20%.",
      },
      {
        h: "PAT — Lei 5.420/1999 · estrutura e prazos (DECORAR)",
        p: "Instâncias: 1ª = responsável pela unidade de finanças; 2ª = JUNTA DE RECURSOS FISCAIS (art. 36). IMPUGNAÇÃO: 30 dias da notificação/intimação, instaura a fase contraditória, sem depósito prévio (art. 43 e 42, redação da Lei 6.164/2006). RECURSO voluntário à Junta: 30 dias da ciência (art. 53). Não cabe pedido de reconsideração (art. 38).",
      },
      {
        h: "PAT — reduções de multa e detalhes",
        p: "Pagou em 30 dias SEM impugnar → multa reduzida 50% (art. 37, exceto moratória). Pagou no prazo do recurso após decisão contrária → redução 35% (art. 52). Recurso de ofício (reexame necessário) quando a decisão exonera valor acima do piso legal (art. 51). Consulta: resposta em 20 dias (art. 27); não cabe reconsideração/recurso (art. 32). Edital presume-se intimado 30 dias após publicação (art. 5º).",
      },
    ],
    memorizar: [
      "ITBI: 3,0% · fato gerador no REGISTRO · município da situação do bem",
      "ITBI não incide: retrovenda, integralização, fusão/cisão/incorporação (salvo atividade imobiliária)",
      "PAT: impugnação 30d · recurso 30d · 1ª finanças / 2ª Junta de Recursos Fiscais",
      "PAT multas: 50% (paga em 30d sem impugnar) / 35% (paga no prazo do recurso)",
      "Consulta: resposta 20d, sem reconsideração",
    ],
  },
  {
    id: "reforma", titulo: "Reforma Tributária (EC 132/2023)", peso: 3, cor: "#D9A84E",
    intro: "45 pontos ponderados, tema novo, mais lógica que decoreba. Excelente retorno por hora.",
    secoes: [
      {
        h: "O que substitui o quê",
        p: "CBS (federal, da União) substitui PIS + Cofins. IBS (compartilhado Estados/DF/Municípios) substitui ICMS + ISS. Imposto Seletivo (IS, federal) sobre bens/serviços prejudiciais à saúde ou ao meio ambiente — finalidade EXTRAFISCAL. O IPTU e o ITBI municipais NÃO mudam.",
      },
      {
        h: "Princípios do novo modelo",
        p: "DESTINO: o imposto pertence a onde o bem/serviço é CONSUMIDO (não mais na origem). NÃO CUMULATIVIDADE PLENA: crédito sobre tudo em que houve incidência, salvo uso e consumo pessoal. Legislação ÚNICA nacional para o IBS. Alíquotas de referência repõem a arrecadação atual.",
      },
      {
        h: "Comitê Gestor do IBS",
        p: "Entidade pública sob regime especial, com independência, NÃO integra a administração de nenhum ente. Funções: arrecadar o IBS, compensar créditos, distribuir a receita aos entes. Gestão compartilhada por Estados/DF/Municípios. É a peça institucional central.",
      },
      {
        h: "Linha do tempo da transição (DECORAR)",
        p: "2026: fase-teste (alíquotas simbólicas). 2027: CBS plena, extingue PIS/Cofins; começa o IS. 2029–2032: redução gradual de ICMS/ISS e subida do IBS. 2033: extinção definitiva do ICMS e do ISS — IBS pleno. 2078: fim da transição da repartição federativa da receita.",
      },
      {
        h: "Regimes especiais e cashback",
        p: "Cesta básica nacional: alíquota ZERO de IBS/CBS. Reduções para saúde, educação, transporte público. CASHBACK: devolução de parte do imposto a famílias de baixa renda, para reduzir a regressividade. Simples Nacional é preservado.",
      },
    ],
    memorizar: [
      "CBS ← PIS/Cofins (União) | IBS ← ICMS/ISS (compartilhado)",
      "Princípio do DESTINO + não cumulatividade PLENA",
      "Comitê Gestor: arrecada, compensa, distribui — não é de nenhum ente",
      "Timeline: 2026 teste · 2027 CBS · 2033 fim ICMS/ISS · 2078 fim repartição",
      "IS = extrafiscal (saúde/meio ambiente) · cashback = reduz regressividade",
    ],
  },
  {
    id: "contab", titulo: "Contabilidade e Auditoria Fiscal", peso: 3, cor: "#D9A84E",
    intro: "Caderno 4 inteiro (peso 3). Denso, mas os padrões se repetem. Foque nos indícios de omissão de receita — o coração da auditoria fiscal.",
    secoes: [
      {
        h: "Fundamentos contábeis",
        p: "Equação: ATIVO = PASSIVO + PL. Regime de COMPETÊNCIA: receita/despesa no período do fato gerador, independentemente do caixa (≠ regime de caixa). Fatos: PERMUTATIVO (troca elementos, não muda o PL — ex. compra à vista); MODIFICATIVO (altera o PL — receita/despesa); MISTO. Primazia da ESSÊNCIA sobre a forma.",
      },
      {
        h: "Partidas dobradas e contas",
        p: "Todo débito tem crédito de igual valor. Ativo e Despesa aumentam a DÉBITO. Passivo, PL e Receita aumentam a CRÉDITO. Depreciação = tangível; Amortização = intangível com vida útil definida; Exaustão = recursos naturais. Impairment = reduz ativo ao valor recuperável (nunca aumenta acima do custo).",
      },
      {
        h: "Auditoria — conceitos-chave",
        p: "Objetivo (NBC TA 200): aumentar o grau de CONFIANÇA dos usuários nas demonstrações. Independência: de fato (mental) E de aparência. Materialidade: distorção que pode influenciar decisões dos usuários. Amostragem: examinar parte para concluir sobre o todo. Papéis de trabalho: documentam evidências, têm prazo mínimo de guarda.",
      },
      {
        h: "Indícios de omissão de receita (o que mais cai)",
        p: "SALDO CREDOR DE CAIXA: impossível fisicamente pagar mais do que se tem — indica receita não contabilizada. PASSIVO FICTÍCIO: obrigações falsas ou já pagas mantidas na escrita para justificar recursos que são receita oculta. Ambos são presunções legais de omissão que autorizam o lançamento.",
      },
      {
        h: "Tipos de opinião do auditor",
        p: "SEM MODIFICAÇÃO (limpa): sem distorções relevantes. COM RESSALVA: distorção material, mas NÃO generalizada. ADVERSA: material E generalizada. ABSTENÇÃO: não conseguiu obter evidência suficiente. Chave: material+generalizada = adversa; material sem ser generalizada = ressalva.",
      },
    ],
    memorizar: [
      "Ativo=Passivo+PL · Competência ≠ Caixa",
      "Permutativo não mexe no PL; modificativo mexe",
      "Depreciação(tangível)/Amortização(intangível)/Exaustão(natural)",
      "Auditoria: objetivo = confiança dos usuários",
      "Omissão de receita: saldo credor de caixa + passivo fictício",
      "Opinião: ressalva(material) < adversa(material+generalizada)",
    ],
  },
  {
    id: "adm-const", titulo: "Direito Administrativo e Constitucional", peso: 2, cor: "#B97BD9",
    intro: "Peso 2, manhã. Cobertura seletiva: só o que a IBAM mais repete.",
    secoes: [
      {
        h: "Atos administrativos",
        p: "ANULAÇÃO: por ilegalidade, efeitos EX TUNC (retroage), vinculada, feita pela Adm. ou Judiciário. REVOGAÇÃO: por conveniência/oportunidade, efeitos EX NUNC, só a Adm., só de atos discricionários válidos. CONVALIDAÇÃO: sana vício de competência (não exclusiva) ou forma (não essencial), ex tunc. Atributos: presunção de legitimidade, imperatividade, autoexecutoriedade, tipicidade.",
      },
      {
        h: "Vinculado × discricionário; poderes",
        p: "VINCULADO: lei não dá margem — não se revoga. DISCRICIONÁRIO: juízo de conveniência dentro da lei. Poder de POLÍCIA (inclui o fiscal): atributos discricionariedade, autoexecutoriedade, coercibilidade; o lançamento é atividade vinculada e indelegável a particular.",
      },
      {
        h: "Responsabilidade civil do Estado",
        p: "Art. 37, §6º: OBJETIVA (independe de culpa) pela teoria do RISCO ADMINISTRATIVO — admite excludentes (culpa exclusiva da vítima, força maior). NÃO é risco integral. Há direito de regresso contra o agente que agiu com dolo/culpa. Condutas omissivas: em regra, responsabilidade subjetiva.",
      },
      {
        h: "Constitucional — limitações ao poder de tributar",
        p: "Legalidade (só por lei), Irretroatividade, Anterioridade (não cobrar no mesmo exercício) + Noventena (90 dias), Isonomia, Não-confisco, Liberdade de tráfego. Imunidades: recíproca (entes entre si), templos, partidos/sindicatos/entidades educacionais e assistenciais sem fins lucrativos, livros/jornais/papel.",
      },
      {
        h: "Constitucional — controle e organização",
        p: "Controle DIFUSO: qualquer juiz, caso concreto, efeitos inter partes. CONCENTRADO (ADI/ADC no STF): efeitos erga omnes e vinculantes. Federação: União, Estados, DF e MUNICÍPIOS são todos autônomos (autogoverno, autoadministração, autolegislação). Eficácia das normas: plena, contida (restringível), limitada.",
      },
    ],
    memorizar: [
      "Anulação: ex TUNC, ilegalidade, Adm+Judiciário. Revogação: ex NUNC, conveniência, só Adm, só discricionário",
      "Responsabilidade: risco ADMINISTRATIVO (tem excludente) ≠ risco integral",
      "Limitações: Legalidade, Irretroatividade, Anterioridade+Noventena, Isonomia, Não-confisco",
      "Difuso=inter partes / Concentrado=erga omnes+vinculante",
      "Município INTEGRA a Federação e é autônomo",
    ],
  },
  {
    id: "emp-pen-por", titulo: "Empresarial/Penal/Civil + Português", peso: 2, cor: "#B97BD9",
    intro: "Empresarial/Penal/Civil é peso 2 e vastíssimo — cubra só o mais cobrado. Português é peso 1: revisão dos erros que a banca repete.",
    secoes: [
      {
        h: "Penal — crimes do fiscal (prioridade)",
        p: "CONCUSSÃO (art. 316): EXIGIR vantagem indevida. CORRUPÇÃO PASSIVA (art. 317): SOLICITAR ou RECEBER. PECULATO (art. 312): apropriar-se de bem público. Funcionário público (art. 327) é conceito AMPLO — qualquer exercente de função pública. Crimes contra a ordem tributária (Lei 8.137/90): suprimir/reduzir tributo por fraude/omissão — material; pagamento pode extinguir a punibilidade.",
      },
      {
        h: "Empresarial — o essencial",
        p: "Sociedade limitada: responsabilidade restrita às quotas, mas solidária pela integralização do capital. Aval = garantia SÓ de título de crédito (não de contrato); sem benefício de ordem. Endosso parcial é nulo. Cheque 'à ordem' é transmissível por endosso. Desconsideração da PJ (art. 50 CC): desvio de finalidade OU confusão patrimonial.",
      },
      {
        h: "Civil — prescrição/decadência e PJ",
        p: "PRESCRIÇÃO atinge a pretensão; DECADÊNCIA atinge o direito potestativo. Decadência legal é irrenunciável. Associações: fins NÃO econômicos, não distribuem lucro. Existência legal da PJ começa com o registro do ato constitutivo.",
      },
      {
        h: "Português — erros que a IBAM repete",
        p: "CRASE: há em 'chegar A + a conclusão'; NÃO há antes de pronome pessoal, antes de verbo, nem em 'de segunda a sexta' sem artigo. CONCORDÂNCIA: 'haver' (existir) e 'fazer' (tempo) são impessoais — 'HOUVE muitas', 'FAZ dez anos'. REGÊNCIA: assistir A (ver), visar A (objetivar), chegar A. 'Cujo' nunca vem com artigo. Colocação: palavra negativa/advérbio atrai próclise.",
      },
    ],
    memorizar: [
      "Concussão=EXIGIR / Corrupção passiva=SOLICITAR ou RECEBER",
      "Funcionário público (penal) = conceito amplíssimo",
      "Aval só em título de crédito, sem benefício de ordem; endosso parcial é nulo",
      "Prescrição=pretensão / Decadência=direito potestativo",
      "Crase: sim em 'à conclusão'; não antes de verbo/pronome pessoal",
      "Haver(existir) e Fazer(tempo) = impessoais (sempre singular)",
    ],
  },
  {
    id: "ti-rlm", titulo: "TI/Dados/LGPD + Raciocínio Lógico", peso: 1, cor: "#4E8FD9",
    intro: "Peso 1, e provavelmente sua zona de conforto (VBA/Python/BI). Pouca hora, alto acerto. Fixe só as definições legais da LGPD.",
    secoes: [
      {
        h: "LGPD — o que cai",
        p: "Agentes: CONTROLADOR decide; OPERADOR executa em nome dele; ENCARREGADO (DPO) é o canal com titulares e ANPD. ANPD fiscaliza (não é agente de tratamento). Dados SENSÍVEIS: origem racial/étnica, convicção religiosa, opinião política, filiação sindical, saúde, vida sexual, genético, biométrico (dados financeiros NÃO são sensíveis). Bases legais incluem consentimento, obrigação legal, execução de políticas públicas, legítimo interesse (com ponderação).",
      },
      {
        h: "TI e segurança",
        p: "Tríade CID: Confidencialidade, Integridade, Disponibilidade. ACID (transações): Atomicidade, Consistência, Isolamento, Durabilidade. Criptografia simétrica = 1 chave; assimétrica = par pública/privada. Certificação digital ICP-Brasil = autenticidade + integridade + validade jurídica (base do SPED). SQL: DDL(CREATE/ALTER/DROP), DML(SELECT/INSERT/UPDATE), DCL(GRANT/REVOKE).",
      },
      {
        h: "Raciocínio Lógico",
        p: "Negação de 'TODO A é B' = 'existe A que não é B' (nunca 'nenhum'). Equivalência: contrapositiva (P→Q ≡ ~Q→~P). Inclusão-exclusão: |A∪B| = |A|+|B|−|A∩B|. Juros SIMPLES: M=C(1+in). COMPOSTOS: M=C(1+i)ⁿ. Desconto racional: valor atual = N/(1+in).",
      },
    ],
    memorizar: [
      "LGPD: Controlador decide / Operador executa / Encarregado comunica / ANPD fiscaliza",
      "Sensíveis: raça, religião, política, sindicato, saúde, sexual, genético, biométrico",
      "CID (segurança) ≠ ACID (transações de BD)",
      "Simétrica=1 chave / Assimétrica=par pública-privada",
      "Negar 'todo' = 'algum não' (nunca 'nenhum')",
      "Compostos: M=C(1+i)ⁿ",
    ],
  },
];


const PRINCIPIOS = [
  ["Ordem certa", "ENTENDER a teoria primeiro, SÓ DEPOIS testar. Questão sem base vira coleção de gabarito — e a IBAM quebra isso trocando uma palavra."],
  ["Não grife: recupere", "Ler e grifar é das técnicas de MENOR eficácia. Leia um bloco, feche, e reescreva de memória com suas palavras. Se sua anotação é cópia, não fixou nada."],
  ["Casa ≠ Trem", "Casa (mesa): aprender o novo e resolver questões. Trem (em pé, sem sinal): revisar e memorizar com os flashcards. Não tente fazer cálculo no metrô."],
  ["Erro é ouro", "Cada erro exige voltar à teoria e escrever o PORQUÊ. Errar e entender fixa mais do que acertar por sorte."],
  ["Peso manda", "A tarde (peso 3) vale ~80 dos pontos ponderados. Legislação Municipal sozinha = 60 pontos, é lei seca e local: o maior retorno por hora de toda a prova."],
  ["Espaçar é o segredo", "Revisar em intervalos crescentes (1, 3, 7, 15, 30 dias) é a técnica de maior impacto comprovado. Os flashcards fazem isso automaticamente por você."],
];

// ============================================================
// APP
// ============================================================
const STORAGE_KEY = "guia-ibam-anotacoes-v1";

export default function App() {
  const [tab, setTab] = useState("plano");
  const [aberto, setAberto] = useState("trib");
  const [notas, setNotas] = useState({});
  const [loaded, setLoaded] = useState(false);
  const [status, setStatus] = useState("");
  const [verTexto, setVerTexto] = useState(false);
  const [copiado, setCopiado] = useState(false);
  const timer = useRef(null);

  useEffect(() => {
    (async () => {
      try {
        const r = await window.storage.get(STORAGE_KEY);
        if (r && r.value) setNotas(JSON.parse(r.value));
      } catch (e) {}
      setLoaded(true);
    })();
  }, []);

  useEffect(() => {
    if (!loaded) return;
    if (timer.current) clearTimeout(timer.current);
    setStatus("salvando…");
    timer.current = setTimeout(async () => {
      try {
        await window.storage.set(STORAGE_KEY, JSON.stringify(notas));
        setStatus("anotações salvas");
      } catch (e) { setStatus("falha ao salvar"); }
    }, 900);
    return () => timer.current && clearTimeout(timer.current);
  }, [notas, loaded]);

  const setNota = useCallback((id, v) => setNotas((p) => ({ ...p, [id]: v })), []);

  const gerarTexto = () => {
    const linhas = RESUMOS.filter((r) => notas[r.id] && notas[r.id].trim()).map(
      (r) => "## " + r.titulo + "\n\n" + notas[r.id].trim() + "\n"
    );
    if (linhas.length === 0) return "(Você ainda não escreveu nenhuma anotação.)";
    return "# Minhas anotações — Auditor Fiscal Guarulhos\n\n" + linhas.join("\n");
  };

  const copiarNotas = async () => {
    const txt = gerarTexto();
    try {
      await navigator.clipboard.writeText(txt);
      setCopiado(true);
      setTimeout(() => setCopiado(false), 2000);
    } catch (e) {
      setCopiado(false);
    }
  };

  return (
    <div className="min-h-screen" style={{ background: "#101418", color: "#E8E4DA", fontFamily: "Georgia, 'Times New Roman', serif" }}>
      <header className="px-5 pt-8 pb-5 max-w-4xl mx-auto">
        <div className="flex justify-between items-start flex-wrap gap-2">
          <div>
            <p className="text-xs tracking-widest uppercase mb-1" style={{ color: "#8FA3B8", fontFamily: "ui-monospace, monospace" }}>
              Início 11/07 · Prova 13/09 · ~22h/semana (~200h)
            </p>
            <h1 className="text-3xl font-bold leading-tight" style={{ color: "#F5F1E6" }}>
              Do zero à prova <span style={{ color: "#4E8FD9" }}>· Auditor Fiscal VI</span>
            </h1>
          </div>
          <span className="text-xs" style={{ color: "#5E9E6F", fontFamily: "ui-monospace, monospace" }}>{status}</span>
        </div>
        <p className="text-sm mt-2" style={{ color: "#A8B4BE" }}>
          <strong style={{ color: "#5E9E6F" }}>entender</strong> → <strong style={{ color: "#D9A84E" }}>testar</strong> →{" "}
          <strong style={{ color: "#D9704E" }}>corrigir</strong> → <strong style={{ color: "#B97BD9" }}>espaçar</strong>
          <span style={{ color: "#7C8894" }}> · guia = entender · app de questões = testar · flashcards = espaçar (no trem)</span>
        </p>

        <nav className="flex gap-1 mt-6 flex-wrap">
          {[["plano", "Plano semanal"], ["resumos", "Resumos + anotações"], ["principios", "Princípios"]].map(([k, label]) => (
            <button key={k} onClick={() => setTab(k)} className="px-4 py-2 text-sm rounded-t-lg"
              style={{ fontFamily: "ui-monospace, monospace", background: tab === k ? "#1B2530" : "transparent",
                color: tab === k ? "#F5F1E6" : "#7C8894", borderBottom: tab === k ? "2px solid #4E8FD9" : "2px solid transparent" }}>
              {label}
            </button>
          ))}
        </nav>
      </header>

      <main className="max-w-4xl mx-auto px-5 pb-16">
        {tab === "plano" && (
          <div>
            <div className="text-sm mb-5 p-4 rounded-lg leading-relaxed" style={{ background: "#22303C", color: "#C4CDD5", borderLeft: "3px solid #D9A84E" }}>
              <strong style={{ color: "#D9A84E" }}>Recalculado para sua realidade:</strong> ~10h em casa + ~12h no trem (3h × 4 dias) = <strong>~22h/semana</strong>, ~200h até a prova.
              Isso é mais que o dobro do plano anterior — dá para cobrir tudo com profundidade.
              Cada semana separa <strong style={{ color: "#5E9E6F" }}>CASA</strong> (aprender + resolver questões, com mesa) de{" "}
              <strong style={{ color: "#4E8FD9" }}>TREM</strong> (revisar + memorizar com os flashcards, offline).
            </div>
            <div className="space-y-4">
              {PLANO.map((s) => (
                <article key={s.sem} className="rounded-xl p-5" style={{ background: "#1B2530", border: "1px solid #2E3B48", borderLeft: `4px solid ${s.cor}` }}>
                  <div className="flex items-baseline justify-between flex-wrap gap-2 mb-1">
                    <h2 className="text-lg font-bold" style={{ color: "#F5F1E6" }}>
                      {s.sem} <span className="text-sm font-normal" style={{ color: s.cor }}>· {s.foco}</span>
                    </h2>
                    <span className="text-xs" style={{ color: "#7C8894", fontFamily: "ui-monospace, monospace" }}>{s.periodo}</span>
                  </div>
                  <p className="text-sm mb-4 leading-relaxed" style={{ color: "#A8B4BE" }}>
                    <strong style={{ color: s.cor }}>Por quê:</strong> {s.meta}
                  </p>
                  <div className="grid md:grid-cols-2 gap-4">
                    <div className="p-3 rounded-lg" style={{ background: "#101418" }}>
                      <h3 className="text-xs font-bold uppercase tracking-widest mb-2" style={{ color: "#5E9E6F", fontFamily: "ui-monospace, monospace" }}>
                        🏠 Casa · ~10h
                      </h3>
                      <ul className="space-y-1.5">
                        {s.casa.map((b, i) => (
                          <li key={i} className="text-sm flex gap-2" style={{ color: "#C4CDD5" }}>
                            <span style={{ color: "#5E9E6F" }}>▸</span><span>{b}</span>
                          </li>
                        ))}
                      </ul>
                    </div>
                    <div className="p-3 rounded-lg" style={{ background: "#101418" }}>
                      <h3 className="text-xs font-bold uppercase tracking-widest mb-2" style={{ color: "#4E8FD9", fontFamily: "ui-monospace, monospace" }}>
                        🚆 Trem · ~12h (offline)
                      </h3>
                      <ul className="space-y-1.5">
                        {s.trem.map((b, i) => (
                          <li key={i} className="text-sm flex gap-2" style={{ color: "#C4CDD5" }}>
                            <span style={{ color: "#4E8FD9" }}>▸</span><span>{b}</span>
                          </li>
                        ))}
                      </ul>
                    </div>
                  </div>
                </article>
              ))}
            </div>
          </div>
        )}

        {tab === "resumos" && (
          <div>
            <div className="mb-5 p-4 rounded-lg" style={{ background: "#22303C", borderLeft: "3px solid #5E9E6F" }}>
              <div className="flex justify-between items-center gap-3 flex-wrap">
                <p className="text-sm leading-relaxed" style={{ color: "#C4CDD5" }}>
                  Leia um bloco, <strong style={{ color: "#5E9E6F" }}>feche, e escreva de memória</strong> no campo de anotações — com suas palavras, não copiando.
                  É isso que fixa. Suas anotações salvam sozinhas.
                </p>
                <div className="flex gap-2 flex-shrink-0">
                  <button onClick={() => setVerTexto(!verTexto)} className="px-4 py-2 rounded-lg text-sm font-bold"
                    style={{ background: verTexto ? "#2E3B48" : "#4E8FD9", color: verTexto ? "#E8E4DA" : "#0D1116", fontFamily: "ui-monospace, monospace" }}>
                    {verTexto ? "Fechar" : "Ver / copiar tudo"}
                  </button>
                </div>
              </div>

              {verTexto && (
                <div className="mt-4">
                  <div className="flex justify-between items-center mb-2 gap-2 flex-wrap">
                    <span className="text-xs" style={{ color: "#8FA3B8", fontFamily: "ui-monospace, monospace" }}>
                      Selecione e copie, ou use o botão. Cole num arquivo .md, no Notion, onde preferir.
                    </span>
                    <button onClick={copiarNotas} className="px-3 py-1.5 rounded-lg text-xs font-bold"
                      style={{ background: copiado ? "#5E9E6F" : "#2E3B48", color: copiado ? "#0D1116" : "#E8E4DA", fontFamily: "ui-monospace, monospace" }}>
                      {copiado ? "✓ Copiado!" : "Copiar"}
                    </button>
                  </div>
                  <textarea
                    readOnly
                    value={gerarTexto()}
                    rows={12}
                    onFocus={(e) => e.target.select()}
                    className="w-full text-sm p-3 rounded-lg"
                    style={{ background: "#101418", color: "#D0D6DC", border: "1px solid #2E3B48", fontFamily: "ui-monospace, monospace", lineHeight: 1.6 }}
                  />
                </div>
              )}
            </div>
            <div className="space-y-3">
              {RESUMOS.map((r) => {
                const open = aberto === r.id;
                return (
                  <div key={r.id} className="rounded-xl overflow-hidden" style={{ background: "#1B2530", border: "1px solid #2E3B48" }}>
                    <button onClick={() => setAberto(open ? null : r.id)} className="w-full text-left px-5 py-4 flex items-center justify-between gap-3"
                      style={{ borderLeft: `4px solid ${r.cor}` }}>
                      <div>
                        <h2 className="text-lg font-bold" style={{ color: "#F5F1E6" }}>{r.titulo}</h2>
                        <p className="text-xs mt-0.5" style={{ color: "#A8B4BE" }}>{r.intro}</p>
                      </div>
                      <div className="flex items-center gap-3 flex-shrink-0">
                        {notas[r.id] && notas[r.id].trim() && <span style={{ color: "#5E9E6F", fontSize: 12 }}>✎</span>}
                        <span className="text-xs px-2 py-1 rounded-full" style={{ background: "#22303C", color: r.cor, fontFamily: "ui-monospace, monospace" }}>peso {r.peso}</span>
                        <span style={{ color: "#7C8894" }}>{open ? "−" : "+"}</span>
                      </div>
                    </button>
                    {open && (
                      <div className="px-5 pb-5">
                        {r.secoes.map((sec, i) => (
                          <div key={i} className="mb-4">
                            <h3 className="text-sm font-bold uppercase tracking-wide mb-1" style={{ color: r.cor, fontFamily: "ui-monospace, monospace" }}>{sec.h}</h3>
                            <p className="text-sm leading-relaxed" style={{ color: "#D0D6DC" }}>{sec.p}</p>
                          </div>
                        ))}
                        <div className="mt-4 p-4 rounded-lg" style={{ background: "#101418", border: `1px solid ${r.cor}44` }}>
                          <h3 className="text-xs font-bold uppercase tracking-widest mb-2" style={{ color: r.cor, fontFamily: "ui-monospace, monospace" }}>
                            ★ Decorar (vai para os flashcards)
                          </h3>
                          <ul className="space-y-1.5">
                            {r.memorizar.map((m, i) => (
                              <li key={i} className="text-sm flex gap-2" style={{ color: "#E8E4DA" }}>
                                <span style={{ color: r.cor }}>•</span><span>{m}</span>
                              </li>
                            ))}
                          </ul>
                        </div>
                        <div className="mt-4">
                          <label className="text-xs uppercase tracking-widest block mb-2" style={{ color: "#8FA3B8", fontFamily: "ui-monospace, monospace" }}>
                            ✎ Minhas anotações — escreva de memória, com suas palavras
                          </label>
                          <textarea
                            value={notas[r.id] || ""}
                            onChange={(e) => setNota(r.id, e.target.value)}
                            rows={6}
                            placeholder="Feche o resumo e escreva aqui o que você entendeu. Se estiver copiando, pare — reformule."
                            className="w-full text-sm p-3 rounded-lg resize-y"
                            style={{ background: "#101418", color: "#E8E4DA", border: "1px solid #2E3B48", fontFamily: "Georgia, serif", lineHeight: 1.6 }}
                          />
                        </div>
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {tab === "principios" && (
          <div className="space-y-3">
            {PRINCIPIOS.map(([t, d], i) => (
              <div key={i} className="rounded-xl p-5 flex gap-4" style={{ background: "#1B2530", border: "1px solid #2E3B48" }}>
                <span className="text-2xl font-bold flex-shrink-0" style={{ color: "#4E8FD9", fontFamily: "ui-monospace, monospace" }}>
                  {String(i + 1).padStart(2, "0")}
                </span>
                <div>
                  <h3 className="font-bold mb-1" style={{ color: "#F5F1E6" }}>{t}</h3>
                  <p className="text-sm leading-relaxed" style={{ color: "#A8B4BE" }}>{d}</p>
                </div>
              </div>
            ))}
          </div>
        )}
      </main>
    </div>
  );
}
