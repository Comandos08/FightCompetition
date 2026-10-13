/**
 * Ranking e histórico de demonstração. Tudo aqui é FICTÍCIO e ILUSTRATIVO:
 * o histórico de temporadas passadas é gerado a partir do id do atleta, e a
 * regra de pontos (9, 3 e 1 por colocação, multiplicados pelo peso do evento)
 * é um exemplo. No produto, cada federação define a regra do próprio ranking.
 */
import type { Contexto } from "@/data/store";
import type { Atleta } from "@/data/seed";
import { lutasDoAtleta } from "@/lib/resultados";

export const METODOS = ["Pontos", "Finalização", "Vantagens", "Decisão", "Punições", "Desclassificação"] as const;
export const FINALIZACOES = ["Estrangulamento pelas costas", "Chave de braço", "Triângulo", "Chave de pé", "Kimura", "Outras"] as const;
export const ORGS_COM_RANKING = ["Liga Horizonte de Jiu-Jitsu", "Associação Serrana de Lutas", "Projeto Tatame Aberto"] as const;
const EVENTOS_PASSADOS = [
  { nome: "Copa Horizonte de Jiu-Jitsu 2025", peso: 3, org: ORGS_COM_RANKING[0] },
  { nome: "Circuito Horizonte · Etapa de Verão 2026", peso: 2, org: ORGS_COM_RANKING[0] },
  { nome: "Aberto da Serra de Grappling 2025", peso: 3, org: ORGS_COM_RANKING[1] },
  { nome: "Copa Serrana de Inverno 2026", peso: 2, org: ORGS_COM_RANKING[1] },
  { nome: "Festival Tatame Aberto 2025", peso: 2, org: ORGS_COM_RANKING[2] },
  { nome: "Desafio Tatame Aberto 2026", peso: 2, org: ORGS_COM_RANKING[2] },
];
const ORDEM_FAIXA = ["Preta", "Marrom", "Roxa", "Azul", "Branca"];

const nivelDaFaixa = (faixa: string) => { const i = ORDEM_FAIXA.indexOf(faixa); return i < 0 ? 1 : 5 - i; }; // preta 5 ... branca 1; faixas infantis 1

function gerador(texto: string) {
  let h = 2166136261;
  for (let i = 0; i < texto.length; i++) h = Math.imul(h ^ texto.charCodeAt(i), 16777619);
  return () => { h = Math.imul(h ^ (h >>> 15), 2246822507); h = Math.imul(h ^ (h >>> 13), 3266489909); return ((h ^= h >>> 16) >>> 0) / 4294967296; };
}

export interface Conquista { evento: string; org: string; colocacao: 1 | 2 | 3; pontos: number; conta: string; }
export interface FichaAtleta {
  atleta: Atleta; lutas: number; vitorias: number; derrotas: number;
  vitoriasPor: number[]; derrotasPor: number[]; finalizacoes: number[];
  conquistas: Conquista[]; pontos: number; tendencia: -1 | 0 | 1; grupo: string;
}

const cache = new Map<string, Omit<FichaAtleta, "pontos" | "conquistas" | "lutas" | "vitorias" | "derrotas"> & { base: Conquista[]; v: number; dr: number }>();

function historico(a: Atleta) {
  let c = cache.get(a.id);
  if (c) return c;
  const r = gerador(a.id + a.nome);
  // quem se cadastrou no protótipo começa do zero: sem lutas nem pódios inventados
  const novo = Boolean(a.conta);
  const nivel = nivelDaFaixa(a.faixa);
  const lutas = novo ? 0 : Math.floor(r() * 8 * nivel) + nivel;
  const taxa = 0.35 + r() * 0.5;
  const v = Math.round(lutas * taxa), dr = lutas - v;
  const repartir = (total: number, pesos: number[]) => {
    const fatias = pesos.map((p) => p * (0.5 + r()));
    const soma = fatias.reduce((s, x) => s + x, 0);
    const out = fatias.map((x) => Math.floor((x / soma) * total));
    out[0] += total - out.reduce((s, x) => s + x, 0);
    return out;
  };
  const vitoriasPor = repartir(v, [5, 4, 1.5, 1, 0.4, 0.2]);
  const derrotasPor = repartir(dr, [5, 3, 1.5, 1, 0.4, 0.2]);
  const finalizacoes = repartir(vitoriasPor[1]!, [3, 2.5, 1.5, 1, 1, 1.5]);
  const base: Conquista[] = [];
  for (const e of EVENTOS_PASSADOS) {
    if (novo || r() > 0.16 + taxa * 0.38) continue;
    const x = r();
    const colocacao = (x < taxa * 0.45 ? 1 : x < taxa * 0.9 ? 2 : 3) as 1 | 2 | 3;
    const p = [9, 3, 1][colocacao - 1]!;
    base.push({ evento: e.nome, org: e.org, colocacao, pontos: p * e.peso * nivel, conta: `${p} pts × ${e.peso} × ${nivel}` });
  }
  const div = 2026 - a.anoNascimento >= 30 ? "Master" : "Adulto";
  c = { atleta: a, vitoriasPor, derrotasPor, finalizacoes, base, v, dr, tendencia: (r() < 0.4 ? 1 : r() < 0.5 ? -1 : 0) as -1 | 0 | 1, grupo: `${div} · ${a.sexo === "M" ? "Masculino" : "Feminino"} · ${a.faixa}` };
  cache.set(a.id, c);
  return c;
}

/** Ficha esportiva: histórico fictício somado ao que aconteceu no evento em andamento. */
export function fichaDoAtleta(d: Contexto, a: Atleta): FichaAtleta {
  const h = historico(a);
  const atuais = lutasDoAtleta(d, a.id).filter((l) => l.venceu !== undefined);
  const vAgora = atuais.filter((l) => l.venceu).length;
  const conquistas = [...h.base];
  const minhas = new Set(d.inscricoes.filter((i) => i.atletaId === a.id).map((i) => i.id));
  const nivel = nivelDaFaixa(a.faixa);
  for (const r of d.resolvidas.values()) {
    if (!r.concluida) continue;
    const col = r.campeaoId && minhas.has(r.campeaoId) ? 1 : r.viceId && minhas.has(r.viceId) ? 2 : r.semifinalistasDerrotados.some((x) => minhas.has(x)) ? 3 : 0;
    if (col) { const p = [9, 3, 1][col - 1]!; conquistas.unshift({ evento: "Copa Horizonte de Jiu-Jitsu 2026", org: ORGS_COM_RANKING[0], colocacao: col as 1 | 2 | 3, pontos: p * 3 * nivel, conta: `${p} pts × 3 × ${nivel}` }); }
  }
  return { atleta: a, lutas: h.v + h.dr + atuais.length, vitorias: h.v + vAgora, derrotas: h.dr + atuais.length - vAgora, vitoriasPor: h.vitoriasPor, derrotasPor: h.derrotasPor, finalizacoes: h.finalizacoes, conquistas, pontos: conquistas.reduce((s, c) => s + c.pontos, 0), tendencia: h.tendencia, grupo: h.grupo };
}

/** Ranking de uma organização: só contam os pódios nos eventos dela. Só adultos entram no ranking público. */
export function rankingDeAtletas(d: Contexto, org: string): FichaAtleta[] {
  return [...d.atletas.values()].filter((a) => !a.menor && ORDEM_FAIXA.includes(a.faixa)).map((a) => {
    const f = fichaDoAtleta(d, a);
    const conquistas = f.conquistas.filter((c) => c.org === org);
    return { ...f, conquistas, pontos: conquistas.reduce((s, c) => s + c.pontos, 0) };
  }).filter((f) => f.pontos > 0).sort((x, y) => y.pontos - x.pontos || y.vitorias - x.vitorias);
}

/** Posição do atleta em cada ranking em que ele pontua. */
export function posicoesDoAtleta(d: Contexto, a: Atleta): { org: string; posicao: number; pontos: number; grupo: string }[] {
  return ORGS_COM_RANKING.flatMap((org) => {
    const fichas = rankingDeAtletas(d, org);
    const eu = fichas.find((f) => f.atleta.id === a.id);
    if (!eu) return [];
    return [{ org, pontos: eu.pontos, grupo: eu.grupo, posicao: fichas.filter((f) => f.grupo === eu.grupo).findIndex((f) => f.atleta.id === a.id) + 1 }];
  });
}

export function gruposDoRanking(fichas: FichaAtleta[]): string[] {
  const conta = new Map<string, number>();
  for (const f of fichas) conta.set(f.grupo, (conta.get(f.grupo) ?? 0) + 1);
  const faixa = (g: string) => ORDEM_FAIXA.indexOf(g.split(" · ")[2]!);
  return [...conta.entries()].filter(([, n]) => n >= 3).map(([g]) => g).sort((a, b) => faixa(a) - faixa(b) || a.localeCompare(b));
}

export interface FichaEquipe { equipe: string; atletas: number; pretas: number; pontos: number; lutas: number; vitorias: number; ouro: number; prata: number; bronze: number; porEvento: { evento: string; pontos: number; medalhas: number }[]; }

export function rankingDeEquipes(d: Contexto, org?: string): FichaEquipe[] {
  const mapa = new Map<string, FichaEquipe>();
  const pega = (equipe: string) => { let e = mapa.get(equipe); if (!e) { e = { equipe, atletas: 0, pretas: 0, pontos: 0, lutas: 0, vitorias: 0, ouro: 0, prata: 0, bronze: 0, porEvento: [] }; mapa.set(equipe, e); } return e; };
  for (const a of d.atletas.values()) {
    const e = pega(a.equipe);
    e.atletas++;
    if (a.faixa === "Preta") e.pretas++;
    if (a.menor || !ORDEM_FAIXA.includes(a.faixa)) continue;
    const f = fichaDoAtleta(d, a);
    e.lutas += f.lutas; e.vitorias += f.vitorias;
    for (const c of f.conquistas) {
      if (org && c.org !== org) continue;
      e.pontos += c.pontos;
      if (c.colocacao === 1) e.ouro++; else if (c.colocacao === 2) e.prata++; else e.bronze++;
      let pe = e.porEvento.find((x) => x.evento === c.evento);
      if (!pe) { pe = { evento: c.evento, pontos: 0, medalhas: 0 }; e.porEvento.push(pe); }
      pe.pontos += c.pontos; pe.medalhas++;
    }
  }
  return [...mapa.values()].sort((a, b) => b.pontos - a.pontos);
}
