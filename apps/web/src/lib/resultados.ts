import type { Contexto } from "@/data/store";

export interface LinhaMedalhas { equipe: string; ouro: number; prata: number; bronze: number; pontos: number; }

/** Quadro de medalhas por equipe. Pontuação ilustrativa: 9, 3 e 1 pontos por ouro, prata e bronze. */
export function quadroDeMedalhas(d: Contexto): LinhaMedalhas[] {
  const mapa = new Map<string, LinhaMedalhas>();
  const linha = (equipe: string) => {
    let l = mapa.get(equipe);
    if (!l) { l = { equipe, ouro: 0, prata: 0, bronze: 0, pontos: 0 }; mapa.set(equipe, l); }
    return l;
  };
  for (const r of d.resolvidas.values()) {
    if (!r.concluida) continue;
    if (r.campeaoId) linha(d.equipeDe(r.campeaoId)).ouro++;
    if (r.viceId) linha(d.equipeDe(r.viceId)).prata++;
    for (const id of r.semifinalistasDerrotados) linha(d.equipeDe(id)).bronze++;
  }
  for (const l of mapa.values()) l.pontos = l.ouro * 9 + l.prata * 3 + l.bronze;
  return [...mapa.values()].sort((a, b) => b.pontos - a.pontos || b.ouro - a.ouro || a.equipe.localeCompare(b.equipe));
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
