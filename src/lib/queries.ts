import "server-only";
import { supabase } from "@/lib/supabase";
import type { Fase, Tema, TemaProgresso } from "@/lib/types";

const FASE_ORDEM: Fase[] = [
  "nao_iniciado",
  "entendendo",
  "testando",
  "corrigindo",
  "espacando",
  "dominado",
];

export async function getTemas(): Promise<Tema[]> {
  const { data } = await supabase
    .from("temas")
    .select("*")
    .order("ordem_sugerida", { ascending: true });
  return data ?? [];
}

export async function getTema(id: string): Promise<Tema | null> {
  const { data } = await supabase.from("temas").select("*").eq("id", id).maybeSingle();
  return data;
}

export async function getProgressoMap(): Promise<Map<string, TemaProgresso>> {
  const { data } = await supabase.from("tema_progresso").select("*");
  const map = new Map<string, TemaProgresso>();
  for (const p of data ?? []) map.set(p.tema_id, p);
  return map;
}

export async function getProgresso(temaId: string): Promise<TemaProgresso> {
  const { data } = await supabase
    .from("tema_progresso")
    .select("*")
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
export async function getRevisoesAtrasadas() {
  const { data } = await supabase
    .from("flashcard_reviews")
    .select("flashcard_id, proxima_revisao, flashcards(tema_id, pergunta, temas(nome))")
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
export async function getTemaDaSemana() {
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
export async function getProgressoProva() {
  const [{ data: temas }, { data: progressos }] = await Promise.all([
    supabase.from("temas").select("id, peso, n_questoes_prova"),
    supabase.from("tema_progresso").select("tema_id, fase"),
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
export async function getStreak(): Promise<number> {
  const { data } = await supabase
    .from("atividade_diaria")
    .select("data, acoes")
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
