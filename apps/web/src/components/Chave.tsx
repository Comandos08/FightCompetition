import type { ChaveEliminatoria, ChaveResolvida, Origem } from "@engine";
import { useDados } from "@/data/store";
import { useState, type ReactNode } from "react";
import { createPortal } from "react-dom";
import { useNavigate } from "react-router-dom";
import { hhmm, horarioDaLuta, nomeRodada } from "@/lib/competicao";
import { lutasDoAtleta } from "@/lib/resultados";
import { Avatar } from "@/components/ui";

interface Props {
  chave: ChaveEliminatoria;
  resolvida: ChaveResolvida;
  aoAbrirLuta?: (lutaId: string) => void;
}

/** Desenha a chave em dois lados que se encontram na final, como nas chaves impressas de torneio. */
export function Chave({ chave, resolvida, aoAbrirLuta }: Props) {
  const d = useDados();
  const nav = useNavigate();
  const { nomeDe, equipeDe } = d;
  /** Perfil público do atleta de uma inscrição; menores reservados não têm perfil. */
  const perfilDe = (id?: string) => {
    const a = id ? d.atletas.get(d.inscricaoPorId.get(id)?.atletaId ?? "") : undefined;
    return a && !(a.menor && d.estado.config.ocultarMenores) ? `/atletas/${a.id}` : undefined;
  };
  const definicao = new Map(chave.lutas.map((l) => [l.id, l]));
  const estado = new Map(resolvida.lutas.map((l) => [l.id, l]));
  const bloco = d.blocos.find((b) => b.chave === chave);
  const [cartao, setCartao] = useState<{ id: string; x: number; y: number } | null>(null);

  const Lado = ({ id, vencedor, bye, cor, espera }: { id?: string; vencedor: boolean; bye?: boolean; cor: string; espera?: string }) => (
    <div className={`flex items-center justify-between gap-2 border-l-[3px] px-2.5 py-1.5 ${id ? cor : "border-transparent"} ${vencedor ? "bg-tatame-claro" : ""}`}
      onMouseEnter={(e) => { if (!id) return; const r = e.currentTarget.getBoundingClientRect(); setCartao({ id, x: Math.min(r.left + 24, window.innerWidth - 300), y: r.bottom + 4 }); }}
      onMouseLeave={() => setCartao(null)}
      onClick={() => { const destino = !aoAbrirLuta && perfilDe(id); if (destino) { setCartao(null); nav(destino); } }}
      style={!aoAbrirLuta && perfilDe(id) ? { cursor: "pointer" } : undefined}>
      <div className="min-w-0">
        <div className={`truncate text-[13px] leading-tight ${id ? (vencedor ? "font-semibold text-marinho" : "font-medium text-marinho") : "italic text-tinta-3"}`}>{id ? nomeDe(id) : espera ?? nomeDe(id)}</div>
        {id && <div className="truncate text-[10px] text-tinta-3">{equipeDe(id)}{bye ? " · bye" : ""}</div>}
      </div>
      {vencedor && <span className="font-mono text-[10px] font-semibold text-tatame">V</span>}
    </div>
  );

  /** Com ação de luta (mesa), a caixa é um botão; sem ação, os nomes levam ao perfil do atleta. */
  const Caixa = ({ lutaId, className, children }: { lutaId: string; className: string; children: ReactNode }) =>
    aoAbrirLuta ? <button onClick={() => aoAbrirLuta(lutaId)} className={className}>{children}</button> : <div className={className}>{children}</div>;

  const No = ({ origem, espelhado }: { origem: Origem; espelhado?: boolean }) => {
    if (origem.tipo !== "vencedor") return null;
    const def = definicao.get(origem.lutaId)!;
    const est = estado.get(origem.lutaId)!;
    const temFilhos = def.ladoA.tipo === "vencedor" || def.ladoB.tipo === "vencedor";
    const indice = chave.lutas.findIndex((l) => l.id === def.id) + 1;
    return (
      <div className={`flex items-center ${espelhado ? "flex-row-reverse" : ""}`}>
        {temFilhos && (
          <div className="flex flex-col justify-around gap-3 self-stretch">
            <div className={`flex flex-1 items-center ${espelhado ? "justify-start" : "justify-end"}`}><No origem={def.ladoA} espelhado={espelhado} /></div>
            <div className={`flex flex-1 items-center ${espelhado ? "justify-start" : "justify-end"}`}><No origem={def.ladoB} espelhado={espelhado} /></div>
          </div>
        )}
        {temFilhos && <div className="h-px w-4 bg-linha" />}
        <div className="w-52 shrink-0">
          <div className="mb-0.5 flex items-center justify-between px-0.5 text-[10px] text-tinta-3">
            <span>Luta {indice}{bloco ? ` · Tatame ${bloco.tatame} · ${hhmm(horarioDaLuta(bloco, def.id))}` : ""}</span>
            {est.metodo ? <span>{est.metodo}</span> : est.pronta ? <span className="font-semibold text-ouro-escuro">pronta</span> : <span>{nomeRodada(def.rodada, chave.totalRodadas)}</span>}
          </div>
          <Caixa lutaId={def.id}
            className={`w-full overflow-hidden rounded-md border bg-papel/70 text-left transition ${est.pronta ? "border-ouro shadow-cartao" : "border-linha"} ${aoAbrirLuta ? "hover:border-tinta" : "cursor-default"}`}
          >
            <Lado id={est.a} cor="border-marinho" vencedor={!!est.vencedorId && est.vencedorId === est.a} bye={def.ladoA.tipo === "participante" && def.rodada > 1} espera={def.ladoA.tipo === "perdedor" ? (est.vencedorId ? "Sem direito à segunda luta" : `Perdedor da luta ${def.ladoA.lutaId.slice(1)}`) : undefined} />
            <div className="h-px bg-linha/70" />
            <Lado id={est.b} cor="border-perigo" vencedor={!!est.vencedorId && est.vencedorId === est.b} bye={def.ladoB.tipo === "participante" && def.rodada > 1} />
          </Caixa>
        </div>
      </div>
    );
  };

  const final = definicao.get(chave.finalId)!;
  const doisLados = chave.totalRodadas >= 3 && final.ladoA.tipo === "vencedor" && final.ladoB.tipo === "vencedor";

  const Resumo = () => {
    if (!cartao) return null;
    const insc = d.inscricaoPorId.get(cartao.id);
    const atleta = insc && d.atletas.get(insc.atletaId);
    if (!atleta) return null;
    const reservado = atleta.menor && d.estado.config.ocultarMenores;
    const feitas = lutasDoAtleta(d, atleta.id).filter((l) => l.venceu !== undefined);
    const v = feitas.filter((l) => l.venceu).length;
    return createPortal(
      <div className="pointer-events-none fixed z-50 flex w-72 items-center gap-3 rounded-lg border border-linha bg-white p-3 shadow-lg" style={{ left: cartao.x, top: cartao.y }}>
        <Avatar atletaId={reservado ? undefined : atleta.id} nome={atleta.nome} className="h-16 w-16 shrink-0 text-xl" />
        <div className="min-w-0">
          <div className="truncate text-sm font-semibold uppercase tracking-tight">{atleta.nome}</div>
          <div className="truncate text-xs text-tinta-3">{atleta.equipe} · faixa {atleta.faixa.toLowerCase()}</div>
          <div className="mt-1.5 flex gap-3 text-xs"><span><b>{feitas.length}</b> lutas</span><span className="text-tatame"><b>{v}</b> V</span><span className="text-perigo"><b>{feitas.length - v}</b> D</span></div>
        </div>
      </div>,
      document.body,
    );
  };

  return (
    <div className="overflow-x-auto pb-2">
      {chave.formato === "chave-de-tres" && <p className="mb-2 px-1 text-xs text-tinta-3">Chave de três: quem perde a primeira luta enfrenta o terceiro atleta, e o vencedor dessa segunda luta faz a final contra o vencedor da primeira. Há um único terceiro colocado.</p>}
      <div className="inline-block min-w-full p-1">
        {doisLados ? (
          <div className="flex items-center justify-between gap-0">
            <No origem={final.ladoA} />
            <div className="h-px w-4 shrink-0 bg-linha" />
            <div className="shrink-0"><div className="mb-1 text-center text-[11px] font-semibold uppercase tracking-wide text-marinho">Final</div><NoFinal /></div>
            <div className="h-px w-4 shrink-0 bg-linha" />
            <No origem={final.ladoB} espelhado />
          </div>
        ) : <No origem={{ tipo: "vencedor", lutaId: chave.finalId }} />}
      </div>
      <Resumo />
    </div>
  );

  function NoFinal() {
    const est = estado.get(final.id)!;
    return (
      <div className="w-52">
        <div className="mb-0.5 flex items-center justify-between px-0.5 text-[10px] text-tinta-3">
          <span>Luta {chave.lutas.length}{bloco ? ` · Tatame ${bloco.tatame} · ${hhmm(horarioDaLuta(bloco, final.id))}` : ""}</span>
          {est.metodo ? <span>{est.metodo}</span> : est.pronta ? <span className="font-semibold text-ouro-escuro">pronta</span> : null}
        </div>
        <Caixa lutaId={final.id}
          className={`w-full overflow-hidden rounded-md border-2 bg-white text-left ${est.pronta ? "border-ouro" : "border-marinho/40"} ${aoAbrirLuta ? "hover:border-tinta" : "cursor-default"}`}>
          <Lado id={est.a} cor="border-marinho" vencedor={!!est.vencedorId && est.vencedorId === est.a} />
          <div className="h-px bg-linha/70" />
          <Lado id={est.b} cor="border-perigo" vencedor={!!est.vencedorId && est.vencedorId === est.b} />
        </Caixa>
      </div>
    );
  }
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
          <span className="w-7 font-display text-lg font-semibold">{l.pos}</span>
          <span className="font-medium">{nomeDe(l.id)}</span>
          <span className="text-xs text-tinta-3">{equipeDe(l.id)}</span>
        </div>
      ))}
    </div>
  );
}
