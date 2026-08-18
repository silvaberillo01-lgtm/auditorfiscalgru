export type Fase =
  | "nao_iniciado"
  | "entendendo"
  | "testando"
  | "corrigindo"
  | "espacando"
  | "dominado";

export type Tema = {
  id: string;
  nome: string;
  turno: string;
  caderno: string;
  peso: number;
  n_questoes_prova: number;
  ordem_sugerida: number | null;
};

export type Resumo = {
  id: string;
  tema_id: string;
  titulo: string | null;
  conteudo_md: string | null;
  pontos_decorar: string[] | null;
};

export type Alternativa = { letra: string; texto: string };

export type Questao = {
  id: string;
  tema_id: string;
  origem: string | null;
  enunciado: string | null;
  alternativas: Alternativa[] | null;
  gabarito: string | null;
  explicacao: string | null;
  fonte: string | null;
};

export type Flashcard = {
  id: string;
  tema_id: string;
  pergunta: string | null;
  resposta_html: string | null;
};

export type TemaProgresso = {
  tema_id: string;
  fase: Fase;
  entendido_em: string | null;
  testado_em: string | null;
  pct_acerto: number | null;
  corrigido_em: string | null;
};

export type FlashcardReview = {
  flashcard_id: string;
  intervalo_dias: number;
  proxima_revisao: string;
  ultima_revisao: string | null;
  streak_acertos: number;
  ciclos_completos: number;
  anotacao: string | null;
};

export type Resposta = {
  id: string;
  questao_id: string;
  resposta: string | null;
  correta: boolean | null;
  raciocinio: string | null;
  duvida: string | null;
  respondida_em: string;
};

export type Simulado = {
  id: string;
  titulo: string;
  descricao: string | null;
  ordem: number | null;
};

export type SimuladoQuestao = {
  id: string;
  simulado_id: string;
  numero: number;
  tema_id: string | null;
  origem: string | null; // 'real' | 'estilo'
  enunciado: string | null;
  alternativas: Alternativa[] | null;
  gabarito: string | null;
  explicacao: string | null;
  fonte: string | null;
};

export type SimuladoResposta = {
  questao_id: string;
  resposta: string | null;
  anotacao: string | null;
  respondida_em: string | null;
};

export type PlanoSemana = {
  semana: number;
  periodo_inicio: string | null;
  periodo_fim: string | null;
  temas: string[] | null;
};

export type AtividadeDiaria = {
  data: string;
  minutos_estudo: number;
  acoes: number;
};

export type Anotacao = {
  id: string;
  user_id: string;
  tema_id: string | null;
  data: string;
  titulo: string | null;
  conteudo_md: string | null;
  criada_em: string;
};
