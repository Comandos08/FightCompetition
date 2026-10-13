/**
 * Fusão de categorias com atleta sozinho.
 * Modelo simples decidido em docs/decisoes.md (13/10/2026): o sistema só sugere; quem decide é a organização.
 * - Nunca cruza sexo, modalidade nem faixa (isso fica para decisão manual).
 * - Primeiro o peso mais próximo na mesma idade; depois a idade vizinha no mesmo peso, sem sair do bloco de idade
 *   (criança com criança, juvenil com juvenil, adulto com master).
 * - A categoria que fica é a de peso mais alto; na idade, a mais velha entre crianças e juvenis e a mais nova entre adulto e master,
 *   porque é para lá que o regulamento deixa o atleta subir ou descer.
 */
export interface CategoriaParaFusao {
  id: string;
  /** tudo o que não pode ser cruzado: modalidade, sexo e faixa */
  grupo: string;
  /** posição da categoria de idade na tabela, da mais nova para a mais velha */
  idade: number;
  /** categorias de idade que podem ser juntadas entre si */
  blocoDeIdade: string;
  /** na fusão por idade, fica a categoria mais velha (crianças e juvenis) ou a mais nova (adulto e master) */
  ficaAMaisVelha: boolean;
  /** posição da classe de peso, da mais leve para a mais pesada */
  peso: number;
  atletas: number;
}

export interface Fusao {
  /** categoria cujos atletas mudam */
  de: string;
  /** categoria que recebe e dá nome ao resultado */
  para: string;
  motivo: "peso" | "idade";
  /** quantas classes de peso ou categorias de idade separam as duas */
  distancia: number;
  /** atletas na categoria resultante */
  total: number;
}

export interface OpcoesDeFusao { maximoDePesos?: number; maximoDeIdades?: number; }

const monta = (a: CategoriaParaFusao, b: CategoriaParaFusao, motivo: Fusao["motivo"]): Fusao => {
  const fica = motivo === "peso" ? (a.peso > b.peso ? a : b) : (a.idade > b.idade) === a.ficaAMaisVelha ? a : b;
  const sai = fica === a ? b : a;
  return { de: sai.id, para: fica.id, motivo, distancia: Math.abs(motivo === "peso" ? a.peso - b.peso : a.idade - b.idade), total: a.atletas + b.atletas };
};

/** Fusões possíveis para uma categoria, da mais indicada para a menos indicada. */
export function opcoesDeFusao(cat: CategoriaParaFusao, todas: readonly CategoriaParaFusao[], opcoes: OpcoesDeFusao = {}): Fusao[] {
  const { maximoDePesos = 2, maximoDeIdades = 1 } = opcoes;
  const outras = todas.filter((c) => c.id !== cat.id && c.grupo === cat.grupo && c.atletas > 0);
  const porPeso = outras.filter((c) => c.idade === cat.idade && Math.abs(c.peso - cat.peso) <= maximoDePesos).map((c) => monta(cat, c, "peso"));
  const porIdade = outras.filter((c) => c.peso === cat.peso && c.blocoDeIdade === cat.blocoDeIdade && c.idade !== cat.idade && Math.abs(c.idade - cat.idade) <= maximoDeIdades).map((c) => monta(cat, c, "idade"));
  const ordem = (x: Fusao, y: Fusao) => x.distancia - y.distancia || y.total - x.total || x.para.localeCompare(y.para) || x.de.localeCompare(y.de);
  return [...porPeso.sort(ordem), ...porIdade.sort(ordem)];
}

/**
 * Plano para todas as categorias com um atleta só, usando apenas o peso imediatamente vizinho.
 * Aplica uma fusão de cada vez e reconta, para duas categorias não trocarem de lugar entre si.
 */
export function planejarFusoes(todas: readonly CategoriaParaFusao[]): Fusao[] {
  const atual = new Map(todas.map((c) => [c.id, { ...c }]));
  const plano: Fusao[] = [];
  for (const id of [...atual.keys()].sort()) {
    const cat = atual.get(id)!;
    if (cat.atletas !== 1) continue;
    const [melhor] = opcoesDeFusao(cat, [...atual.values()], { maximoDePesos: 1, maximoDeIdades: 0 });
    if (!melhor) continue;
    plano.push(melhor);
    atual.get(melhor.para)!.atletas = melhor.total;
    atual.get(melhor.de)!.atletas = 0;
  }
  return plano;
}
