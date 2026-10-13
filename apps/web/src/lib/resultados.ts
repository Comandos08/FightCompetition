import { regrasIbjjf } from "@engine";
import type { Contexto } from "@/data/store";

export interface LinhaMedalhas { equipe: string; ouro: number; prata: number; bronze: number; pontos: number; }

/**
 * Disputa por academias conforme o Regulamento Geral da IBJJF, art. 3: 9, 3 e 1 pontos (art. 3.2);
 * categoria com um atleta, ou com apenas dois da mesma academia, não pontua (art. 3.4 e 3.5);
 * desempate por ouros e depois por pratas (art. 3.3).
 */
export function quadroDeMedalhas(d: Contexto): LinhaMedalhas[] {
  const mapa = new Map<string, LinhaMedalhas>();
  const linha = (equipe: string) => {
    let l = mapa.get(equipe);
    if (!l) { l = { equipe, ouro: 0, prata: 0, bronze: 0, pontos: 0 }; mapa.set(equipe, l); }
    return l;
  };
  for (const [catId, r] of d.resolvidas) {
    if (!r.concluida) continue;
    const cat = d.categoriaPorId.get(catId);
    if (cat && !regrasIbjjf.categoriaContaParaAcademias(cat.inscricoes.map((i) => d.equipeDe(i.id)))) continue;
    if (r.campeaoId) linha(d.equipeDe(r.campeaoId)).ouro++;
    if (r.viceId) linha(d.equipeDe(r.viceId)).prata++;
    for (const id of r.semifinalistasDerrotados) linha(d.equipeDe(id)).bronze++;
  }
  const P = regrasIbjjf.PONTOS_POR_ACADEMIA;
  for (const l of mapa.values()) l.pontos = l.ouro * P.campeao + l.prata * P.vice + l.bronze * P.terceiro;
  return [...mapa.values()].sort((a, b) => b.pontos - a.pontos || b.ouro - a.ouro || b.prata - a.prata || a.equipe.localeCompare(b.equipe));
}

export interface LutaDoAtleta { categoria: string; rodada: number; total: number; oponente?: string; venceu?: boolean; metodo?: string; }

/** Histórico de lutas de um atleta no evento, somando todas as inscrições dele. */
export function lutasDoAtleta(d: Contexto, atletaId: string): LutaDoAtleta[] {
  const minhas = new Set(d.inscricoes.filter((i) => i.atletaId === atletaId).map((i) => i.id));
  const saida: LutaDoAtleta[] = [];
  for (const cat of d.categorias) {
    const r = d.resolvidas.get(cat.id);
    const total = d.chaves.get(cat.id)?.totalRodadas ?? 1;
    if (!r) continue;
    for (const l of r.lutas) {
      const meu = l.a && minhas.has(l.a) ? l.a : l.b && minhas.has(l.b) ? l.b : undefined;
      if (!meu) continue;
      const outro = meu === l.a ? l.b : l.a;
      saida.push({ categoria: `${cat.modalidade} · ${cat.nome}`, rodada: l.rodada, total, oponente: outro ? d.nomeDe(outro) : undefined, venceu: l.vencedorId ? l.vencedorId === meu : undefined, metodo: l.metodo });
    }
  }
  return saida;
}
