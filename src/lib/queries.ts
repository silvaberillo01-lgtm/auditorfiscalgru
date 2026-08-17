import "server-only";
import { createClient } from "@/lib/supabase/server";
import type {
  Anotacao,
  Fase,
  PlanoSemana,
  Simulado,
  SimuladoQuestao,
  SimuladoResposta,
  Tema,
  TemaProgresso,
} from "@/lib/types";
import { FASE_ORDEM } from "@/lib/fase-ui";
import { statusSemana, type StatusPrazo } from "@/lib/prazo";

/** Dentre uma lista de temas, qual está na fase mais atrasada (mais perto de nao_iniciado). */
function temaMaisAtrasado(temaIds: string[], progressoMap: Map<string, Fase>): string {
  let pior = temaIds[0];
  let piorIndice = FASE_ORDEM.indexOf(progressoMap.get(pior) ?? "nao_iniciado");
  for (const temaId of temaIds) {
    const idx = FASE_ORDEM.indexOf(progressoMap.get(temaId) ?? "nao_iniciado");
    if (idx < piorIndice) {
      piorIndice = idx;
      pior = temaId;
    }
  }
  return pior;
}

export async function getTemas(): Promise<Tema[]> {
  const supabase = await createClient();
  const { data } = await supabase
    .from("temas")
    .select("*")
    .order("ordem_sugerida", { ascending: true });
  return data ?? [];
}

export async function getTema(id: string): Promise<Tema | null> {
  const supabase = await createClient();
  const { data } = await supabase.from("temas").select("*").eq("id", id).maybeSingle();
  return data;
}

export async function getProgressoMap(userId: string): Promise<Map<string, TemaProgresso>> {
  const supabase = await createClient();
  const { data } = await supabase.from("tema_progresso").select("*").eq("user_id", userId);
  const map = new Map<string, TemaProgresso>();
  for (const p of data ?? []) map.set(p.tema_id, p);
  return map;
}

export async function getProgresso(userId: string, temaId: string): Promise<TemaProgresso> {
  const supabase = await createClient();
  const { data } = await supabase
    .from("tema_progresso")
    .select("*")
    .eq("user_id", userId)
    .eq("tema_id", temaId)
    .maybeSingle();
  return (
    data ?? {
      tema_id: temaId,
      fase: "nao_iniciado",
      entendido_em: null,
      testado_em: null,
      pct_acerto: null,
      corrigido_em: null,
    }
  );
}

export function fasesLabel(fase: Fase): string {
  return (
    {
      nao_iniciado: "Não iniciado",
      entendendo: "Entendendo",
      testando: "Testando",
      corrigindo: "Corrigindo",
      espacando: "Espaçando",
      dominado: "Dominado",
    } satisfies Record<Fase, string>
  )[fase];
}

function hojeISO() {
  return new Date().toISOString().slice(0, 10);
}

/** Revisões atrasadas (flashcards com proxima_revisao <= hoje), agrupadas por tema. */
export async function getRevisoesAtrasadas(userId: string) {
  const supabase = await createClient();
  const { data } = await supabase
    .from("flashcard_reviews")
    .select("flashcard_id, proxima_revisao, flashcards(tema_id, pergunta, temas(nome))")
    .eq("user_id", userId)
    .lte("proxima_revisao", hojeISO());

  const porTema = new Map<string, { nome: string; count: number }>();
  for (const r of data ?? []) {
    const fc = r.flashcards as unknown as {
      tema_id: string;
      temas: { nome: string } | null;
    } | null;
    if (!fc?.tema_id) continue;
    const atual = porTema.get(fc.tema_id);
    porTema.set(fc.tema_id, {
      nome: fc.temas?.nome ?? fc.tema_id,
      count: (atual?.count ?? 0) + 1,
    });
  }
  return porTema;
}

/** Tema da semana atual (por data), com fase mais atrasada dentre os da semana. */
export async function getTemaDaSemana(userId: string) {
  const supabase = await createClient();
  const hoje = hojeISO();
  const { data: semana } = await supabase
    .from("plano_semanas")
    .select("*")
    .lte("periodo_inicio", hoje)
    .gte("periodo_fim", hoje)
    .maybeSingle();

  if (!semana || !semana.temas || semana.temas.length === 0) return null;

  const { data: progressos } = await supabase
    .from("tema_progresso")
    .select("*")
    .eq("user_id", userId)
    .in("tema_id", semana.temas);

  const progressoMap = new Map((progressos ?? []).map((p) => [p.tema_id, p.fase as Fase]));
  const piorTemaId = temaMaisAtrasado(semana.temas, progressoMap);

  const { data: tema } = await supabase
    .from("temas")
    .select("*")
    .eq("id", piorTemaId)
    .maybeSingle();

  return tema
    ? { tema, fase: progressoMap.get(piorTemaId) ?? "nao_iniciado", semana: semana.semana }
    : null;
}

export type SemanaComTemas = {
  semana: number;
  periodo_inicio: string | null;
  periodo_fim: string | null;
  temas: { id: string; nome: string; fase: Fase }[];
  status: StatusPrazo;
  diasRestantes: number;
};

/** Todas as semanas do plano, com os temas resolvidos e o status de prazo de cada uma. */
export async function getPlanoSemanas(userId: string): Promise<SemanaComTemas[]> {
  const supabase = await createClient();
  const [{ data: semanas }, { data: temas }, { data: progressos }] = await Promise.all([
    supabase.from("plano_semanas").select("*").order("semana", { ascending: true }),
    supabase.from("temas").select("id, nome"),
    supabase.from("tema_progresso").select("tema_id, fase").eq("user_id", userId),
  ]);

  const temaNomeMap = new Map((temas ?? []).map((t) => [t.id, t.nome as string]));
  const progressoMap = new Map(
    (progressos ?? []).map((p) => [p.tema_id, p.fase as Fase])
  );

  return ((semanas ?? []) as PlanoSemana[]).map((semana) => {
    const temaIds = semana.temas ?? [];
    const temasResolvidos = temaIds
      .filter((id) => temaNomeMap.has(id))
      .map((id) => ({
        id,
        nome: temaNomeMap.get(id)!,
        fase: progressoMap.get(id) ?? ("nao_iniciado" as Fase),
      }));

    const coberta =
      temasResolvidos.length > 0 &&
      temasResolvidos.every((t) => t.fase === "espacando" || t.fase === "dominado");

    const { status, diasRestantes } = statusSemana(
      semana.periodo_inicio,
      semana.periodo_fim,
      coberta
    );

    return {
      semana: semana.semana,
      periodo_inicio: semana.periodo_inicio,
      periodo_fim: semana.periodo_fim,
      temas: temasResolvidos,
      status,
      diasRestantes,
    };
  });
}

/** Semana do plano que contém um tema específico (primeira ocorrência). */
export async function getSemanaDoTema(
  userId: string,
  temaId: string,
  semanas?: SemanaComTemas[]
): Promise<SemanaComTemas | null> {
  const lista = semanas ?? (await getPlanoSemanas(userId));
  return lista.find((s) => s.temas.some((t) => t.id === temaId)) ?? null;
}

/**
 * % da prova coberto: soma o peso dos temas dominado/espacando dividido pelo
 * peso total. Pondera só por peso (não por peso*n_questoes_prova) porque
 * n_questoes_prova ainda é placeholder — ver "O que falta preencher" no
 * README. Trocar a fórmula de volta quando os números reais do edital
 * entrarem na tabela `temas`.
 */
export async function getProgressoProva(userId: string) {
  const supabase = await createClient();
  const [{ data: temas }, { data: progressos }] = await Promise.all([
    supabase.from("temas").select("id, peso"),
    supabase.from("tema_progresso").select("tema_id, fase").eq("user_id", userId),
  ]);

  const faseMap = new Map((progressos ?? []).map((p) => [p.tema_id, p.fase as Fase]));
  let total = 0;
  let coberto = 0;
  for (const t of temas ?? []) {
    const peso = t.peso ?? 0;
    total += peso;
    const fase = faseMap.get(t.id);
    if (fase === "dominado" || fase === "espacando") coberto += peso;
  }
  const temasDominados = (progressos ?? []).filter(
    (p) => p.fase === "dominado" || p.fase === "espacando"
  ).length;

  return {
    pct: total > 0 ? Math.round((coberto / total) * 100) : 0,
    temasDominados,
    totalTemas: temas?.length ?? 0,
  };
}

/** Streak de dias consecutivos com atividade, terminando hoje ou ontem. */
export async function getStreak(userId: string): Promise<number> {
  const supabase = await createClient();
  const { data } = await supabase
    .from("atividade_diaria")
    .select("data, acoes")
    .eq("user_id", userId)
    .gt("acoes", 0)
    .order("data", { ascending: false })
    .limit(400);

  if (!data || data.length === 0) return 0;

  const datas = new Set(data.map((d) => d.data));
  const cursor = new Date();
  // se hoje ainda não tem atividade, começa a contar a partir de ontem
  if (!datas.has(hojeISO())) cursor.setDate(cursor.getDate() - 1);

  let streak = 0;
  while (datas.has(cursor.toISOString().slice(0, 10))) {
    streak += 1;
    cursor.setDate(cursor.getDate() - 1);
  }
  return streak;
}

export async function getAnotacoesDoTema(userId: string, temaId: string): Promise<Anotacao[]> {
  const supabase = await createClient();
  const { data } = await supabase
    .from("anotacoes")
    .select("*")
    .eq("user_id", userId)
    .eq("tema_id", temaId)
    .order("criada_em", { ascending: false });
  return data ?? [];
}

/** Todas as anotações do usuário, com o nome do tema já resolvido, mais recentes primeiro. */
export async function getAnotacoesComTema(userId: string) {
  const supabase = await createClient();
  const { data } = await supabase
    .from("anotacoes")
    .select("*, temas(nome)")
    .eq("user_id", userId)
    .order("data", { ascending: false })
    .order("criada_em", { ascending: false });

  return (data ?? []).map((a) => ({
    ...(a as Anotacao),
    tema_nome: (a as unknown as { temas: { nome: string } | null }).temas?.nome ?? null,
  }));
}

export type SimuladoComProgresso = Simulado & {
  totalQuestoes: number;
  respondidas: number;
};

/**
 * Lista os simulados com o progresso do usuário (quantas questões ele já
 * marcou). Retorna null se as tabelas de simulado ainda não existem no
 * banco (schema.sql desatualizado) — a página mostra instrução de migração.
 */
export async function getSimulados(userId: string): Promise<SimuladoComProgresso[] | null> {
  const supabase = await createClient();
  const [{ data: simulados, error }, { data: questoes }, { data: respostas }] = await Promise.all([
    supabase.from("simulados").select("*").order("ordem", { ascending: true }),
    supabase.from("simulado_questoes").select("id, simulado_id"),
    supabase.from("simulado_respostas").select("questao_id, resposta").eq("user_id", userId),
  ]);
  if (error) return null;

  const respondidas = new Set(
    (respostas ?? []).filter((r) => r.resposta).map((r) => r.questao_id)
  );
  const porSimulado = new Map<string, { total: number; feitas: number }>();
  for (const q of questoes ?? []) {
    const atual = porSimulado.get(q.simulado_id) ?? { total: 0, feitas: 0 };
    atual.total += 1;
    if (respondidas.has(q.id)) atual.feitas += 1;
    porSimulado.set(q.simulado_id, atual);
  }

  return ((simulados ?? []) as Simulado[]).map((s) => ({
    ...s,
    totalQuestoes: porSimulado.get(s.id)?.total ?? 0,
    respondidas: porSimulado.get(s.id)?.feitas ?? 0,
  }));
}

/** Um simulado com as questões em ordem de prova e as respostas/anotações do usuário. */
export async function getSimuladoCompleto(userId: string, simuladoId: string) {
  const supabase = await createClient();
  const [{ data: simulado }, { data: questoes }, { data: temas }] = await Promise.all([
    supabase.from("simulados").select("*").eq("id", simuladoId).maybeSingle(),
    supabase
      .from("simulado_questoes")
      .select("*")
      .eq("simulado_id", simuladoId)
      .order("numero", { ascending: true }),
    supabase.from("temas").select("id, nome"),
  ]);
  if (!simulado) return null;

  const questaoIds = (questoes ?? []).map((q) => q.id);
  const respostasMap = new Map<string, SimuladoResposta>();
  if (questaoIds.length > 0) {
    const { data: respostas } = await supabase
      .from("simulado_respostas")
      .select("questao_id, resposta, anotacao, respondida_em")
      .eq("user_id", userId)
      .in("questao_id", questaoIds);
    for (const r of respostas ?? []) respostasMap.set(r.questao_id, r);
  }

  return {
    simulado: simulado as Simulado,
    questoes: (questoes ?? []) as SimuladoQuestao[],
    respostas: respostasMap,
    temaNomes: new Map((temas ?? []).map((t) => [t.id as string, t.nome as string])),
  };
}

export type EstatisticaTema = { totalQuestoes: number; respondidas: number; acertos: number };

/** Forças e fraquezas: quantas questões cada tema tem, quantas foram respondidas e com que aproveitamento. */
export async function getEstatisticasPorTema(userId: string) {
  const supabase = await createClient();
  const [{ data: questoes }, { data: respostas }] = await Promise.all([
    supabase.from("questoes").select("id, tema_id"),
    supabase
      .from("respostas")
      .select("questao_id, correta, respondida_em")
      .eq("user_id", userId)
      .order("respondida_em", { ascending: false }),
  ]);

  const temaPorQuestao = new Map<string, string>();
  const porTema = new Map<string, EstatisticaTema>();
  for (const q of questoes ?? []) {
    temaPorQuestao.set(q.id, q.tema_id);
    const atual = porTema.get(q.tema_id) ?? { totalQuestoes: 0, respondidas: 0, acertos: 0 };
    atual.totalQuestoes += 1;
    porTema.set(q.tema_id, atual);
  }

  // última resposta por questão (o estado atual, não cada tentativa)
  const ultimaPorQuestao = new Map<string, boolean>();
  for (const r of respostas ?? []) {
    if (!ultimaPorQuestao.has(r.questao_id)) ultimaPorQuestao.set(r.questao_id, !!r.correta);
  }

  for (const [questaoId, correta] of ultimaPorQuestao) {
    const temaId = temaPorQuestao.get(questaoId);
    if (!temaId) continue;
    const atual = porTema.get(temaId)!;
    atual.respondidas += 1;
    if (correta) atual.acertos += 1;
  }

  const totalRespondidas = ultimaPorQuestao.size;
  const totalAcertos = [...ultimaPorQuestao.values()].filter(Boolean).length;

  return {
    porTema,
    totalQuestoes: questoes?.length ?? 0,
    totalRespondidas,
    totalAcertos,
    totalErros: totalRespondidas - totalAcertos,
  };
}

/** Última resposta de cada questão do tema, pra hidratar o caderno de questões já respondido. */
export async function getRespostasDoTema(userId: string, temaId: string) {
  const supabase = await createClient();
  const { data: questoes } = await supabase.from("questoes").select("id").eq("tema_id", temaId);
  const questaoIds = (questoes ?? []).map((q) => q.id);
  if (questaoIds.length === 0) return new Map<string, string>();

  const { data: respostas } = await supabase
    .from("respostas")
    .select("questao_id, resposta, respondida_em")
    .eq("user_id", userId)
    .in("questao_id", questaoIds)
    .order("respondida_em", { ascending: false });

  const ultimaPorQuestao = new Map<string, string>();
  for (const r of respostas ?? []) {
    if (!ultimaPorQuestao.has(r.questao_id) && r.resposta) {
      ultimaPorQuestao.set(r.questao_id, r.resposta);
    }
  }
  return ultimaPorQuestao;
}

/** Erros já corrigidos (com raciocínio preenchido) do tema, pra copiar pra uma IA depois. */
export async function getErrosCorrigidosDoTema(userId: string, temaId: string) {
  const supabase = await createClient();
  const { data: questoes } = await supabase.from("questoes").select("id").eq("tema_id", temaId);
  const questaoIds = (questoes ?? []).map((q) => q.id);
  if (questaoIds.length === 0) return [];

  const { data } = await supabase
    .from("respostas")
    .select("id, resposta, raciocinio, respondida_em, questoes(enunciado, gabarito, explicacao)")
    .eq("user_id", userId)
    .in("questao_id", questaoIds)
    .eq("correta", false)
    .not("raciocinio", "is", null)
    .order("respondida_em", { ascending: false });

  return (data ?? []).map((r) => ({
    id: r.id as string,
    resposta: r.resposta as string | null,
    raciocinio: r.raciocinio as string | null,
    questao: r.questoes as unknown as {
      enunciado: string;
      gabarito: string | null;
      explicacao: string | null;
    } | null,
  }));
}

/** Quantos erros já respondidos ainda não têm raciocínio escrito (pra mostrar o link de corrigir). */
export async function getErrosPendentesCount(userId: string, temaId: string): Promise<number> {
  const supabase = await createClient();
  const { data: questoes } = await supabase.from("questoes").select("id").eq("tema_id", temaId);
  const questaoIds = (questoes ?? []).map((q) => q.id);
  if (questaoIds.length === 0) return 0;

  const { count } = await supabase
    .from("respostas")
    .select("id", { count: "exact", head: true })
    .eq("user_id", userId)
    .in("questao_id", questaoIds)
    .eq("correta", false)
    .is("raciocinio", null);

  return count ?? 0;
}
