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

/** Avatar padrão: silhueta neutra em cinza, uma para homens e outra para mulheres. Desenho próprio, sem rosto. */
function Silhueta({ sexo, rotulo, className }: { sexo: "M" | "F"; rotulo: string; className: string }) {
  return (
    <svg viewBox="0 0 100 100" role="img" aria-label={rotulo} className={`rounded-lg ${className}`} style={{ background: "#D3D6D7" }}>
      {sexo === "M" ? (
        <>
          <path d="M27 55c-4-22 6-38 24-38s27 14 22 38c-1-9-5-17-9-21-9 3-22 3-30-1-4 5-6 13-7 22z" fill="#9AA1A4" />
          <path d="M43 68h14v14H43z" fill="#E2E5E5" />
          <path d="M29 47c0-13 9-21 21-21s21 8 21 21c0 16-9 31-21 31S29 63 29 47z" fill="#EEF0EF" />
          <path d="M26 46c-3 0-3 9 3 11zM74 46c3 0 3 9-3 11z" fill="#EEF0EF" />
          <path d="M14 100c0-9 12-15 27-17 3 3 15 3 18 0 15 2 27 8 27 17z" fill="#9AA1A4" />
        </>
      ) : (
        <>
          <path d="M18 62c-3-24 9-44 32-44s35 20 32 44c4 8 1 17-6 22H24c-8-5-10-14-6-22z" fill="#9AA1A4" />
          <path d="M43 70h14v13H43z" fill="#E2E5E5" />
          <path d="M33 50c0-12 7-20 17-20s17 8 17 20c0 15-7 29-17 29S33 65 33 50z" fill="#EEF0EF" />
          <path d="M31 50c1-12 7-21 19-21 6 5 13 7 19 6 1 5 1 10 0 15-3-7-9-12-17-13-8 1-16 5-21 13z" fill="#9AA1A4" />
          <path d="M12 100c0-9 13-15 29-17 4 4 14 4 18 0 16 2 29 8 29 17z" fill="#EEF0EF" />
        </>
      )}
    </svg>
  );
}

/** Foto do atleta. Sem foto, o avatar padrão conforme o sexo do cadastro. */
export function Avatar({ atletaId, nome, className = "h-28 w-28 text-3xl" }: { atletaId?: string; nome: string; className?: string }) {
  const { estado, atletas } = useDados();
  const foto = atletaId ? estado.fotos[atletaId] : "";
  if (foto) return <img src={foto} alt={`Foto de ${nome}`} className={`rounded-lg object-cover ${className}`} />;
  const atleta = atletaId ? atletas.get(atletaId) : undefined;
  if (!atleta) return <div className={`grid place-items-center rounded-lg bg-marinho-claro font-semibold text-marinho ${className}`}>{nome.split(" ").map((x) => x[0]).slice(0, 2).join("")}</div>;
  return <Silhueta sexo={atleta.sexo} rotulo={`Avatar padrão de ${nome}`} className={className} />;
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
