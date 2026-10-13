import { useRef, useState, type ReactNode } from "react";
import { NavLink } from "react-router-dom";
import { coresFaixa } from "@/data/seed";
import { useDados } from "@/data/store";
import { lerImagem } from "@/lib/imagem";
// avatares padrão enviados pelo fundador, de banco de imagens gratuito
import avatarM from "@/assets/avatar-m.webp?inline";
import avatarF from "@/assets/avatar-f.webp?inline";

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

/** Foto do atleta. Sem foto, o avatar padrão conforme o sexo do cadastro. */
export function Avatar({ atletaId, nome, className = "h-28 w-28 text-3xl" }: { atletaId?: string; nome: string; className?: string }) {
  const { estado, atletas } = useDados();
  const foto = atletaId ? estado.fotos[atletaId] : "";
  if (foto) return <img src={foto} alt={`Foto de ${nome}`} className={`rounded-lg object-cover ${className}`} />;
  const atleta = atletaId ? atletas.get(atletaId) : undefined;
  if (!atleta) return <div className={`grid place-items-center rounded-lg bg-marinho-claro font-semibold text-marinho ${className}`}>{nome.split(" ").map((x) => x[0]).slice(0, 2).join("")}</div>;
  return <img src={atleta.sexo === "M" ? avatarM : avatarF} alt={`Avatar padrão de ${nome}`} className={`rounded-lg object-cover ${className}`} />;
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

/** Símbolo da Arena (arquivo original em docs/marca). Usa a cor do texto em volta. */
export function Simbolo({ className = "" }: { className?: string }) {
  return (
    <svg viewBox="0 0 154.3 100.23" className={className} fill="currentColor" aria-hidden="true">
      <path d="M136.06,68.2l-35.51-1.86-13.31-.61c-3.35-.15-4.62-3.39-6.38-6.66-1.03-1.91-3.1-4.2-5.5-4.2h-23.36c-17.52.81-34.65,2.71-51.96,6.32l.07,14.16c30.23-4.11,60.02-5.1,90.13-3.57,4.53,2.05,5.05,10.55,10.51,10.72l18.73.57,34.8,1.14v-14.18c-6.16-.82-12.04-1.35-18.23-1.81Z" />
      <path d="M107.18,94.46c-1.9-.59-2.91-2.4-3.81-3.99-3.93-6.94-5.16-6-12.73-6.2l-9.23-.25h-33.24s-13.35.33-13.35.33l-7.92.29-8.54.33-4.45.24-13.92.85.08,14.12,154.15.05-.04-5.37-47.01-.4Z" />
      <path d="M.02,36.3l.04,14.27c22.56-6.2,45.56-9.12,68.95-8.54,4.6,2.56,4.49,10.34,10.63,10.74l47.38,3.06c9.29.78,18.14,1.86,27.28,3.46v-14.13c-6.41-1.79-12.39-2.86-18.84-3.89-19.29-2.79-38.5-4.19-57.97-5.04l-11.61-.16c-1.52-.02-3.06-.45-3.91-1.79l-2.95-4.7c-.99-1.58-2.72-3.67-4.83-3.63-10.19.21-19.9,1.85-29.89,3.68-8.36,1.7-16.28,3.96-24.28,6.67Z" />
      <path d="M44.25,13.94l-7.52-11.73C35.47.83,34-.09,32.07,0,20.95,2.62,10.37,6.37,0,11.41l.05,14.41c14.49-6.11,28.76-9.87,44.19-11.88Z" />
    </svg>
  );
}
