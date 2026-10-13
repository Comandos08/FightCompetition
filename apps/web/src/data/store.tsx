import { createContext, useContext, useEffect, useMemo, useReducer, type ReactNode } from "react";
import type { ChaveEliminatoria, ChaveResolvida, Resultado } from "@engine";
import { gerarBase, type Atleta, type Inscricao, type StatusPagamento, type StatusPesagem } from "./seed";
import { gerarChave, montarCategorias, montarProgramacao, resolver, type Bloco, type Categoria } from "@/lib/competicao";

export type Persona = "atleta" | "professor" | "organizador" | "diretor" | "mesario" | "admin";

export interface Parceiro { id: string; nome: string; url: string; logo: string; ativo: boolean; }
export interface RegistroAuditoria { quando: string; quem: string; acao: string; }

export interface Membro { nome: string; email: string; papel: string; escopo: string; situacao: "ativo" | "convite enviado"; }
export interface Cupom { codigo: string; desconto: string; usos: number; limite: number; }
export interface EventoNovo { id: string; nome: string; datas: string; cidade: string; local: string; modalidades: string; tatames: number; valor: number; }
export interface Config { inscritosPublicos: boolean; ocultarMenores: boolean; exigirVinculo: boolean; cpfObrigatorio: boolean; painelPublico: boolean; }

interface Estado {
  config: Config;
  membros: Membro[];
  cupons: Cupom[];
  eventosNovos: EventoNovo[];
  dependentes: Atleta[];
  fotos: Record<string, string>;
  parceiros: Parceiro[];
  orgsSuspensas: Record<string, boolean>;
  auditoria: RegistroAuditoria[];
  capaEvento: string;
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

const membrosIniciais: Membro[] = [
  { nome: "Renata Coutinho Lins", email: "renata@ligahorizonte.exemplo", papel: "Dona", escopo: "Organização", situacao: "ativo" },
  { nome: "Paulo Guedes Neves", email: "paulo@ligahorizonte.exemplo", papel: "Diretor técnico", escopo: "Copa Horizonte 2026", situacao: "ativo" },
  { nome: "Diego Antunes Paiva", email: "diego@ligahorizonte.exemplo", papel: "Mesário", escopo: "Copa Horizonte 2026 · Tatame 1", situacao: "ativo" },
  { nome: "Larissa Moura Dias", email: "larissa@ligahorizonte.exemplo", papel: "Mesária", escopo: "Copa Horizonte 2026 · Tatame 2", situacao: "convite enviado" },
];
const vazio: Estado = {
  config: { inscritosPublicos: true, ocultarMenores: true, exigirVinculo: false, cpfObrigatorio: false, painelPublico: true },
  membros: membrosIniciais,
  cupons: [{ codigo: "LOTE1", desconto: "15%", usos: 84, limite: 100 }, { codigo: "PROJETOSOCIAL", desconto: "100%", usos: 22, limite: 40 }],
  eventosNovos: [], dependentes: [], fotos: {}, capaEvento: "",
  parceiros: [
    { id: "p1", nome: "SportCombat", url: "https://sportcombat.pro", logo: "", ativo: true },
    { id: "p2", nome: "Kimonos Aurora", url: "", logo: "", ativo: true },
    { id: "p3", nome: "Tatames Litoral", url: "", logo: "", ativo: true },
    { id: "p4", nome: "Instituto Guarda Viva", url: "", logo: "", ativo: true },
  ],
  orgsSuspensas: {}, auditoria: [],
  sessao: null, novosAtletas: [], novasInscricoes: [], pagamentos: {}, pesagens: {}, destino: {}, sorteios: {}, publicadas: {}, resultados: {} };

type Acao =
  | { tipo: "inscrever"; atleta?: Atleta; inscricoes: Inscricao[] }
  | { tipo: "pagamento"; id: string; status: StatusPagamento }
  | { tipo: "pesagem"; id: string; status: StatusPesagem }
  | { tipo: "fundir"; inscricaoIds: string[]; categoriaId: string }
  | { tipo: "sortear"; categoriaId: string }
  | { tipo: "publicar"; categoriaIds: string[]; valor: boolean }
  | { tipo: "resultado"; chave: string; resultado: Resultado }
  | { tipo: "config"; chave: keyof Config; valor: boolean }
  | { tipo: "membro"; membro: Membro }
  | { tipo: "cupom"; cupom: Cupom }
  | { tipo: "evento"; evento: EventoNovo }
  | { tipo: "dependente"; atleta: Atleta }
  | { tipo: "foto"; atletaId: string; url: string }
  | { tipo: "capa"; url: string }
  | { tipo: "parceiro"; parceiro: Parceiro }
  | { tipo: "parceiro-mudar"; id: string; campos: Partial<Parceiro> }
  | { tipo: "parceiro-remover"; id: string }
  | { tipo: "org-suspender"; nome: string; valor: boolean }
  | { tipo: "auditar"; registro: RegistroAuditoria }
  | { tipo: "entrar"; persona: Persona }
  | { tipo: "sair" }
  | { tipo: "reiniciar" };

function reduzir(e: Estado, a: Acao): Estado {
  switch (a.tipo) {
    case "inscrever":
      {
      // cada inscrição guarda a conta que a fez: uma conta não enxerga o pedido de outra
      const conta = e.sessao ?? undefined;
      return { ...e, novosAtletas: a.atleta ? [...e.novosAtletas, { ...a.atleta, conta }] : e.novosAtletas, novasInscricoes: [...e.novasInscricoes, ...a.inscricoes.map((i) => ({ ...i, conta }))] };
    }
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
    case "config": return { ...e, config: { ...e.config, [a.chave]: a.valor } };
    case "membro": return { ...e, membros: [...e.membros, a.membro] };
    case "cupom": return { ...e, cupons: [...e.cupons, a.cupom] };
    case "evento": return { ...e, eventosNovos: [...e.eventosNovos, a.evento] };
    case "dependente": return { ...e, dependentes: [...e.dependentes, { ...a.atleta, conta: e.sessao ?? undefined }] };
    case "foto": return { ...e, fotos: { ...e.fotos, [a.atletaId]: a.url } };
    case "capa": return { ...e, capaEvento: a.url };
    case "parceiro": return { ...e, parceiros: [...e.parceiros, a.parceiro] };
    case "parceiro-mudar": return { ...e, parceiros: e.parceiros.map((p) => (p.id === a.id ? { ...p, ...a.campos } : p)) };
    case "parceiro-remover": return { ...e, parceiros: e.parceiros.filter((p) => p.id !== a.id) };
    case "org-suspender": return { ...e, orgsSuspensas: { ...e.orgsSuspensas, [a.nome]: a.valor } };
    case "auditar": return { ...e, auditoria: [a.registro, ...e.auditoria].slice(0, 100) };
    case "entrar": return { ...e, sessao: a.persona };
    case "sair": return { ...e, sessao: null };
    case "reiniciar": return { ...vazio, sessao: e.sessao };
  }
}

const CHAVE_LOCAL = "arena-prototipo-v6";
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
/** Situação de cada inscrição como veio do cadastro, antes de qualquer ação no protótipo. */
export const inscricoesOriginais = base.inscricoes;

export function Provedor({ children }: { children: ReactNode }) {
  const [estado, despachar] = useReducer(reduzir, undefined, carregar);
  useEffect(() => { try { localStorage.setItem(CHAVE_LOCAL, JSON.stringify(estado)); } catch { /* sem armazenamento */ } }, [estado]);

  const valor = useMemo<Contexto>(() => {
    const todosAtletas = [...base.atletas, ...estado.novosAtletas, ...estado.dependentes];
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
