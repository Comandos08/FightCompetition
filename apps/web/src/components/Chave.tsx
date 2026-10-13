import type { ChaveEliminatoria, ChaveResolvida, Origem } from "@engine";
import { useDados } from "@/data/store";
import { nomeRodada } from "@/lib/competicao";

interface Props {
  chave: ChaveEliminatoria;
  resolvida: ChaveResolvida;
  aoAbrirLuta?: (lutaId: string) => void;
}

/** Desenha a chave como árvore: cada luta fica à direita das lutas que a alimentam. */
export function Chave({ chave, resolvida, aoAbrirLuta }: Props) {
  const { nomeDe, equipeDe } = useDados();
  const definicao = new Map(chave.lutas.map((l) => [l.id, l]));
  const estado = new Map(resolvida.lutas.map((l) => [l.id, l]));

  const Lado = ({ id, vencedor, bye }: { id?: string; vencedor: boolean; bye?: boolean }) => (
    <div className={`flex items-center justify-between gap-2 px-2.5 py-1.5 ${vencedor ? "bg-tatame-claro" : ""}`}>
      <div className="min-w-0">
        <div className={`truncate text-[13px] leading-tight ${id ? (vencedor ? "font-semibold" : "") : "italic text-tinta-3"}`}>{nomeDe(id)}</div>
        {id && <div className="truncate text-[10px] uppercase tracking-wide text-tinta-3">{equipeDe(id)}{bye ? " · bye" : ""}</div>}
      </div>
      {vencedor && <span className="font-mono text-[10px] font-semibold text-tatame">V</span>}
    </div>
  );

  const No = ({ origem }: { origem: Origem }) => {
    if (origem.tipo === "participante") return null;
    const def = definicao.get(origem.lutaId)!;
    const est = estado.get(origem.lutaId)!;
    const temFilhos = def.ladoA.tipo === "vencedor" || def.ladoB.tipo === "vencedor";
    return (
      <div className="flex items-center">
        {temFilhos && (
          <div className="flex flex-col justify-around gap-3 self-stretch">
            <div className="flex flex-1 items-center justify-end"><No origem={def.ladoA} /></div>
            <div className="flex flex-1 items-center justify-end"><No origem={def.ladoB} /></div>
          </div>
        )}
        {temFilhos && <div className="h-px w-4 bg-linha" />}
        <button
          onClick={() => aoAbrirLuta?.(def.id)}
          disabled={!aoAbrirLuta}
          className={`w-52 shrink-0 overflow-hidden rounded-md border bg-white text-left transition ${est.pronta ? "border-acao/60 shadow-cartao" : "border-linha"} ${aoAbrirLuta ? "hover:border-tinta" : "cursor-default"}`}
        >
          <div className="flex items-center justify-between border-b border-linha/70 bg-papel/60 px-2.5 py-0.5">
            <span className="font-mono text-[10px] text-tinta-3">{def.id} · {nomeRodada(def.rodada, chave.totalRodadas)}</span>
            {est.metodo && <span className="font-mono text-[10px] text-tinta-3">{est.metodo}</span>}
            {est.pronta && <span className="font-mono text-[10px] font-semibold text-acao">pronta</span>}
          </div>
          <Lado id={est.a} vencedor={!!est.vencedorId && est.vencedorId === est.a} bye={def.ladoA.tipo === "participante" && def.rodada > 1} />
          <div className="h-px bg-linha/70" />
          <Lado id={est.b} vencedor={!!est.vencedorId && est.vencedorId === est.b} bye={def.ladoB.tipo === "participante" && def.rodada > 1} />
        </button>
      </div>
    );
  };

  return (
    <div className="overflow-x-auto pb-2">
      <div className="inline-block min-w-full p-1">
        <No origem={{ tipo: "vencedor", lutaId: chave.finalId }} />
      </div>
    </div>
  );
}

export function Podio({ resolvida }: { resolvida: ChaveResolvida }) {
  const { nomeDe, equipeDe } = useDados();
  if (!resolvida.concluida) return null;
  const linhas = [
    { pos: "1º", id: resolvida.campeaoId },
    { pos: "2º", id: resolvida.viceId },
    ...resolvida.semifinalistasDerrotados.map((id) => ({ pos: "3º", id })),
  ];
  return (
    <div className="cartao mt-4 max-w-md p-4">
      <div className="rotulo mb-2">Pódio</div>
      {linhas.map((l, i) => (
        <div key={i} className="flex items-baseline gap-3 py-1">
          <span className="w-7 font-display text-lg font-extrabold">{l.pos}</span>
          <span className="font-medium">{nomeDe(l.id)}</span>
          <span className="text-xs text-tinta-3">{equipeDe(l.id)}</span>
        </div>
      ))}
    </div>
  );
}
