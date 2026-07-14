import { requireAprovado } from "@/lib/auth";

const PRINCIPIOS = [
  {
    titulo: "Ordem certa",
    texto:
      "ENTENDER a teoria primeiro, SÓ DEPOIS testar. Questão sem base vira coleção de gabarito — e a banca quebra isso trocando uma palavra.",
  },
  {
    titulo: "Não grife: recupere",
    texto:
      "Ler e grifar é das técnicas de MENOR eficácia. Leia um bloco, feche, e reescreva de memória com suas palavras. Se sua anotação é cópia, não fixou nada.",
  },
  {
    titulo: "Casa ≠ Trem",
    texto:
      "Casa (mesa): aprender o novo e resolver questões. Trem (em pé, sem sinal): revisar e memorizar com os flashcards. Não tente fazer cálculo no metrô.",
  },
  {
    titulo: "Erro é ouro",
    texto:
      "Cada erro exige voltar à teoria e escrever o PORQUÊ. Errar e entender fixa mais do que acertar por sorte.",
  },
  {
    titulo: "Peso manda",
    texto:
      "A tarde (peso 3) vale a maior fatia dos pontos ponderados. Legislação Municipal sozinha é lei seca e local: o maior retorno por hora de toda a prova.",
  },
  {
    titulo: "Espaçar é o segredo",
    texto:
      "Revisar em intervalos crescentes (1, 3, 7, 15, 30 dias) é a técnica de maior impacto comprovado. Os flashcards fazem isso automaticamente por você.",
  },
];

export default async function PrincipiosPage() {
  await requireAprovado();

  return (
    <div className="space-y-4">
      <h1 className="text-xl font-semibold text-neutral-100">Princípios</h1>
      <p className="text-sm text-neutral-500">
        As regras de como estudar — releia sempre que sentir que perdeu o rumo.
      </p>
      <div className="grid gap-3">
        {PRINCIPIOS.map((p, i) => (
          <div key={p.titulo} className="rounded-2xl border border-neutral-800 bg-neutral-900 p-4">
            <p className="text-xs font-mono text-[#B97BD9] mb-1">{String(i + 1).padStart(2, "0")}</p>
            <p className="font-semibold text-neutral-100">{p.titulo}</p>
            <p className="mt-1 text-sm text-neutral-400">{p.texto}</p>
          </div>
        ))}
      </div>
    </div>
  );
}
