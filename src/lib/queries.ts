import "server-only";
import { createClient } from "@/lib/supabase/server";
import type { Anotacao, Fase, Tema, TemaProgresso } from "@/lib/types";

const FASE_ORDEM: Fase[] = [
  "nao_iniciado",
  "entendendo",
  "testando",
  "corrigindo",
  "espacando",
  "dominado",
];

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

  let temaMaisAtrasado = semana.temas[0];
  let piorIndice = FASE_ORDEM.indexOf(progressoMap.get(temaMaisAtrasado) ?? "nao_iniciado");

  for (const temaId of semana.temas) {
    const fase = progressoMap.get(temaId) ?? "nao_iniciado";
    const idx = FASE_ORDEM.indexOf(fase);
    if (idx < piorIndice) {
      piorIndice = idx;
      temaMaisAtrasado = temaId;
    }
  }

  const { data: tema } = await supabase
    .from("temas")
    .select("*")
    .eq("id", temaMaisAtrasado)
    .maybeSingle();

  return tema
    ? { tema, fase: progressoMap.get(temaMaisAtrasado) ?? "nao_iniciado", semana: semana.semana }
    : null;
}

/** % da prova coberto: soma peso*n_questoes dos temas dominado/espacando dividido pelo total. */
export async function getProgressoProva(userId: string) {
  const supabase = await createClient();
  const [{ data: temas }, { data: progressos }] = await Promise.all([
    supabase.from("temas").select("id, peso, n_questoes_prova"),
    supabase.from("tema_progresso").select("tema_id, fase").eq("user_id", userId),
  ]);

  const faseMap = new Map((progressos ?? []).map((p) => [p.tema_id, p.fase as Fase]));
  let total = 0;
  let coberto = 0;
  for (const t of temas ?? []) {
    const peso = (t.peso ?? 0) * (t.n_questoes_prova ?? 0);
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
