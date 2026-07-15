import { PRAZO_BADGE } from "@/lib/fase-ui";
import type { StatusPrazo } from "@/lib/prazo";

function texto(status: StatusPrazo, diasRestantes: number): string {
  switch (status) {
    case "atrasada":
      return `⚠️ atrasado há ${Math.abs(diasRestantes)}d`;
    case "concluida":
      return "✅ concluído no prazo";
    case "futura":
      return diasRestantes > 0 ? `🗓️ começa em ${diasRestantes}d` : "🗓️ começa em breve";
    case "atual":
    default:
      return diasRestantes > 0 ? `🔥 vence em ${diasRestantes}d` : "🔥 vence hoje";
  }
}

export default function DeadlineBadge({
  status,
  diasRestantes,
}: {
  status: StatusPrazo;
  diasRestantes: number;
}) {
  return (
    <span className={`inline-block rounded-full px-2.5 py-1 text-xs font-semibold ${PRAZO_BADGE[status]}`}>
      {texto(status, diasRestantes)}
    </span>
  );
}
