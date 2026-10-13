import { useRef, useState, type ReactNode } from "react";
import { NavLink } from "react-router-dom";
import { coresFaixa } from "@/data/seed";
import { useDados } from "@/data/store";
import { lerImagem } from "@/lib/imagem";

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
  return <section className="cartao min-w-0 p-4 sm:p-6"><div className="mb-4 flex flex-wrap items-center justify-between gap-3"><h2 className="text-lg font-semibold">{titulo}</h2>{acao}</div><div className="overflow-x-auto">{children}</div></section>;
}

const FUNDOS = ["#DCE6F4", "#E3EFE4", "#F6E9D2", "#EADFF2", "#F4DEDE", "#D9EEF0", "#ECECEC"];
const FIGURAS = ["#1A447D", "#1F6B4A", "#8F5303", "#5B3A8C", "#8C2F2F", "#17606B", "#3D4148"];
const QUIMONOS = ["#FFFFFF", "#FFFFFF", "#2C5FA8", "#22262B"];

/** Foto do atleta. Sem foto, um avatar ilustrado gerado a partir do cadastro: nunca um rosto real. */
export function Avatar({ atletaId, nome, className = "h-28 w-28 text-3xl" }: { atletaId?: string; nome: string; className?: string }) {
  const { estado, atletas } = useDados();
  const foto = atletaId ? estado.fotos[atletaId] : "";
  if (foto) return <img src={foto} alt={`Foto de ${nome}`} className={`rounded-lg object-cover ${className}`} />;
  const atleta = atletaId ? atletas.get(atletaId) : undefined;
  if (!atleta) return <div className={`grid place-items-center rounded-lg bg-marinho-claro font-semibold text-marinho ${className}`}>{nome.split(" ").map((x) => x[0]).slice(0, 2).join("")}</div>;
  let h = 0;
  for (const c of atleta.id + atleta.nome) h = (h * 31 + c.charCodeAt(0)) >>> 0;
  const tom = h % FUNDOS.length;
  const quimono = QUIMONOS[(h >>> 4) % QUIMONOS.length]!;
  const cabelo = (h >>> 8) % 3;
  const faixa = coresFaixa[atleta.faixa] ?? "#999";
  return (
    <svg viewBox="0 0 64 64" role="img" aria-label={`Avatar ilustrado de ${nome}`} className={`rounded-lg ${className}`} style={{ background: FUNDOS[tom] }}>
      <path d="M8 64c0-13 9-21 24-21s24 8 24 21z" fill={quimono} stroke={FIGURAS[tom]} strokeWidth="1.5" />
      <path d="M24 44l8 12 8-12" fill="none" stroke={FIGURAS[tom]} strokeWidth="1.5" strokeLinejoin="round" />
      <rect x="10" y="57" width="44" height="5" fill={faixa} stroke={FIGURAS[tom]} strokeWidth="1" />
      <circle cx="32" cy="26" r="12" fill={FIGURAS[tom]} opacity="0.85" />
      {cabelo === 0 && <path d="M20 25a12 12 0 0 1 24 0c-3-5-8-7-12-7s-9 2-12 7z" fill={FIGURAS[tom]} />}
      {cabelo === 1 && <path d="M19 30c-2-12 5-18 13-18s15 6 13 18c-1-7-5-11-13-11s-12 4-13 11z" fill={FIGURAS[tom]} />}
    </svg>
  );
}

/** Botão de envio de imagem: reduz o arquivo no navegador antes de guardar. */
export function EnviarImagem({ rotulo, ladoMaximo, aoEnviar, id }: { rotulo: string; ladoMaximo: number; aoEnviar: (url: string) => void; id: string }) {
  const entrada = useRef<HTMLInputElement>(null);
  const [erro, setErro] = useState("");
  return (
    <span className="inline-flex flex-col gap-1">
      <input ref={entrada} id={id} type="file" accept="image/*" className="hidden"
        onChange={async (e) => { const f = e.target.files?.[0]; e.target.value = ""; if (!f) return; try { aoEnviar(await lerImagem(f, ladoMaximo)); setErro(""); } catch (x) { setErro((x as Error).message); } }} />
      <button type="button" className="botao-contorno !py-1.5 text-xs" onClick={() => entrada.current?.click()}>{rotulo}</button>
      {erro && <span className="text-xs text-perigo">{erro}</span>}
    </span>
  );
}
