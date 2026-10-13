import type { ReactNode } from "react";
import { NavLink } from "react-router-dom";
import { coresFaixa } from "@/data/seed";

export function Faixa({ cor, comNome = true }: { cor: string; comNome?: boolean }) {
  return (
    <span className="inline-flex items-center gap-1.5 whitespace-nowrap">
      <span className="h-2.5 w-6 rounded-[2px] border border-tinta/25" style={{ background: coresFaixa[cor] ?? "#ccc" }} />
      {comNome && <span>{cor}</span>}
    </span>
  );
}

const tons = {
  neutro: "bg-papel text-tinta-2 border-linha",
  ok: "bg-tatame-claro text-tatame border-tatame/20",
  aviso: "bg-aviso-claro text-aviso border-aviso/25",
  acao: "bg-perigo-claro text-perigo border-perigo/25",
  escuro: "bg-marinho text-white border-marinho",
} as const;

export function Selo({ tom = "neutro", children }: { tom?: keyof typeof tons; children: ReactNode }) {
  return <span className={`inline-flex items-center rounded-full border px-2 py-0.5 text-[11px] font-medium whitespace-nowrap ${tons[tom]}`}>{children}</span>;
}

export function Indicador({ rotulo, valor, detalhe }: { rotulo: string; valor: ReactNode; detalhe?: string }) {
  return (
    <div className="cartao p-4">
      <div className="rotulo">{rotulo}</div>
      <div className="mt-1 font-display text-3xl font-semibold tabular-nums text-marinho">{valor}</div>
      {detalhe && <div className="mt-0.5 text-xs text-tinta-3">{detalhe}</div>}
    </div>
  );
}

export function Titulo({ sobre, children, acoes }: { sobre?: string; children: ReactNode; acoes?: ReactNode }) {
  return (
    <div className="mb-5 flex flex-wrap items-end justify-between gap-3">
      <div>
        {sobre && <div className="rotulo mb-1">{sobre}</div>}
        <h1 className="text-2xl font-semibold leading-tight sm:text-3xl">{children}</h1>
      </div>
      {acoes && <div className="flex flex-wrap gap-2">{acoes}</div>}
    </div>
  );
}

export function Abas<T extends string>({ abas, ativa, aoMudar }: { abas: readonly { id: T; nome: string; conta?: number }[]; ativa: T; aoMudar: (id: T) => void }) {
  return (
    <div className="cartao mb-5 flex gap-1 overflow-x-auto px-2">
      {abas.map((a) => (
        <button key={a.id} onClick={() => aoMudar(a.id)}
          className={`whitespace-nowrap border-b-2 px-4 py-3 text-sm font-medium transition ${ativa === a.id ? "border-marinho text-marinho" : "border-transparent text-tinta-2 hover:text-marinho"}`}>
          {a.nome}{a.conta !== undefined && <span className="ml-1.5 font-mono text-xs text-tinta-3">{a.conta}</span>}
        </button>
      ))}
    </div>
  );
}

export function Vazio({ children }: { children: ReactNode }) {
  return <div className="rounded-lg border border-dashed border-linha p-8 text-center text-sm text-tinta-3">{children}</div>;
}

export const pagamentoSelo = (s: string) =>
  s === "pago" ? <Selo tom="ok">Pago</Selo> : s === "estornado" ? <Selo>Estornado</Selo> : s === "pendente" ? <Selo tom="aviso">Pagamento pendente</Selo> : <Selo tom="acao">Aguarda responsável</Selo>;
export const pesagemSelo = (s: string) =>
  s === "ok" ? <Selo tom="ok">Peso ok</Selo> : s === "nao-bateu" ? <Selo tom="acao">Não bateu</Selo> : <Selo>Não pesado</Selo>;

export function SubNav({ itens }: { itens: { para: string; nome: string; fim?: boolean }[] }) {
  return (
    <div className="mb-6 flex gap-1 overflow-x-auto rounded-md border border-linha bg-white p-1">
      {itens.map((i) => (
        <NavLink key={i.para} to={i.para} end={i.fim}
          className={({ isActive }) => `whitespace-nowrap rounded px-3 py-1.5 text-sm font-medium transition ${isActive ? "bg-marinho text-white" : "text-tinta-2 hover:text-marinho"}`}>
          {i.nome}
        </NavLink>
      ))}
    </div>
  );
}

export function Campo({ rotulo, children, dica }: { rotulo: string; children: ReactNode; dica?: string }) {
  return <label className="block"><span className="rotulo">{rotulo}</span><div className="mt-1">{children}</div>{dica && <span className="mt-1 block text-xs text-tinta-3">{dica}</span>}</label>;
}

export function Secao({ titulo, acao, children }: { titulo: string; acao?: ReactNode; children: ReactNode }) {
  return <section className="cartao p-6"><div className="mb-4 flex items-center justify-between gap-3"><h2 className="text-lg font-semibold">{titulo}</h2>{acao}</div>{children}</section>;
}
