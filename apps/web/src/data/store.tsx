import { createContext, useContext, useEffect, useMemo, useReducer, type ReactNode } from "react";
import type { ChaveEliminatoria, ChaveResolvida, Resultado } from "@engine";
import { gerarBase, type Atleta, type Inscricao, type StatusPagamento, type StatusPesagem } from "./seed";
import { gerarChave, montarCategorias, montarProgramacao, resolver, type Bloco, type Categoria } from "@/lib/competicao";

export type Persona = "atleta" | "professor" | "organizador" | "mesario";

interface Estado {
  sessao: Persona | null;
  novosAtletas: Atleta[];
  novasInscricoes: Inscricao[];
  pagamentos: Record<string, StatusPagamento>;
  pesagens: Record<string, StatusPesagem>;
  destino: Record<string, string>;
  sorteios: Record<string, number>;
  publicadas: Record<string, boolean>;
  resultados: Record<string, Resultado>;
}

const vazio: Estado = { sessao: null, novosAtletas: [], novasInscricoes: [], pagamentos: {}, pesagens: {}, destino: {}, sorteios: {}, publicadas: {}, resultados: {} };

type Acao =
  | { tipo: "inscrever"; atleta?: Atleta; inscricoes: Inscricao[] }
  | { tipo: "pagamento"; id: string; status: StatusPagamento }
  | { tipo: "pesagem"; id: string; status: StatusPesagem }
  | { tipo: "fundir"; inscricaoIds: string[]; categoriaId: string }
  | { tipo: "sortear"; categoriaId: string }
  | { tipo: "publicar"; categoriaIds: string[]; valor: boolean }
  | { tipo: "resultado"; chave: string; resultado: Resultado }
  | { tipo: "entrar"; persona: Persona }
  | { tipo: "sair" }
  | { tipo: "reiniciar" };

function reduzir(e: Estado, a: Acao): Estado {
  switch (a.tipo) {
    case "inscrever":
      return { ...e, novosAtletas: a.atleta ? [...e.novosAtletas, a.atleta] : e.novosAtletas, novasInscricoes: [...e.novasInscricoes, ...a.inscricoes] };
    case "pagamento": return { ...e, pagamentos: { ...e.pagamentos, [a.id]: a.status } };
    case "pesagem": return { ...e, pesagens: { ...e.pesagens, [a.id]: a.status } };
    case "fundir": {
      const destino = { ...e.destino };
      for (const id of a.inscricaoIds) destino[id] = a.categoriaId;
      return { ...e, destino };
    }
    case "sortear": return { ...e, sorteios: { ...e.sorteios, [a.categoriaId]: (e.sorteios[a.categoriaId] ?? 0) + 1 } };
    case "publicar": {
      const publicadas = { ...e.publicadas };
      for (const id of a.categoriaIds) publicadas[id] = a.valor;
      return { ...e, publicadas };
    }
    case "resultado": return { ...e, resultados: { ...e.resultados, [a.chave]: a.resultado } };
    case "entrar": return { ...e, sessao: a.persona };
    case "sair": return { ...e, sessao: null };
    case "reiniciar": return { ...vazio, sessao: e.sessao };
  }
}

const CHAVE_LOCAL = "arena-prototipo-v1";
function carregar(): Estado {
  try {
    const bruto = localStorage.getItem(CHAVE_LOCAL);
    return bruto ? { ...vazio, ...JSON.parse(bruto) } : vazio;
  } catch { return vazio; }
}

export interface Contexto {
  atletas: Map<string, Atleta>;
  inscricoes: Inscricao[];
  inscricaoPorId: Map<string, Inscricao>;
  categorias: Categoria[];
  categoriaPorId: Map<string, Categoria>;
  chaves: Map<string, ChaveEliminatoria>;
  resolvidas: Map<string, ChaveResolvida>;
  blocos: Bloco[];
  estado: Estado;
  despachar: (a: Acao) => void;
  nomeDe: (inscricaoId?: string) => string;
  equipeDe: (inscricaoId?: string) => string;
}

const Ctx = createContext<Contexto | null>(null);
const base = gerarBase();

export function Provedor({ children }: { children: ReactNode }) {
  const [estado, despachar] = useReducer(reduzir, undefined, carregar);
  useEffect(() => { try { localStorage.setItem(CHAVE_LOCAL, JSON.stringify(estado)); } catch { /* sem armazenamento */ } }, [estado]);

  const valor = useMemo<Contexto>(() => {
    const todosAtletas = [...base.atletas, ...estado.novosAtletas];
    const atletas = new Map(todosAtletas.map((a) => [a.id, a]));
    const inscricoes = [...base.inscricoes, ...estado.novasInscricoes].map((i) => ({
      ...i, pagamento: estado.pagamentos[i.id] ?? i.pagamento, pesagem: estado.pesagens[i.id] ?? i.pesagem,
    }));
    const inscricaoPorId = new Map(inscricoes.map((i) => [i.id, i]));
    const categorias = montarCategorias(inscricoes, atletas, estado.destino);
    const categoriaPorId = new Map(categorias.map((c) => [c.id, c]));
    const chaves = new Map<string, ChaveEliminatoria>();
    const resolvidas = new Map<string, ChaveResolvida>();
    for (const c of categorias) {
      const chave = gerarChave(c, atletas, estado.sorteios[c.id] ?? 0);
      if (chave) { chaves.set(c.id, chave); resolvidas.set(c.id, resolver(c, chave, estado.resultados)); }
    }
    const blocos = montarProgramacao(categorias, chaves);
    const nomeDe = (id?: string) => (id ? atletas.get(inscricaoPorId.get(id)?.atletaId ?? "")?.nome ?? "?" : "A definir");
    const equipeDe = (id?: string) => (id ? atletas.get(inscricaoPorId.get(id)?.atletaId ?? "")?.equipe ?? "" : "");
    return { atletas, inscricoes, inscricaoPorId, categorias, categoriaPorId, chaves, resolvidas, blocos, estado, despachar, nomeDe, equipeDe };
  }, [estado]);

  return <Ctx.Provider value={valor}>{children}</Ctx.Provider>;
}

export function useDados(): Contexto {
  const c = useContext(Ctx);
  if (!c) throw new Error("Provedor ausente");
  return c;
}
