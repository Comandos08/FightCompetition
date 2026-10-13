import { gerarChaveDeTres, gerarEliminatoriaSimples, resolverChave, type ChaveEliminatoria, type ChaveResolvida, type Resultado } from "@engine";
import { divisoes, minutosDeLuta, type Atleta, type Inscricao, type Modalidade } from "@/data/seed";

export interface Categoria {
  id: string;
  modalidade: Modalidade;
  sexo: "M" | "F";
  divisao: string;
  faixa: string;
  peso: string;
  nome: string;
  inscricoes: Inscricao[];
  minutos: number;
}

export function idCategoria(i: Pick<Inscricao, "modalidade" | "divisao" | "faixa" | "peso">, sexo: string): string {
  return [i.modalidade, sexo, i.divisao, i.faixa, i.peso].join("|");
}

/** Agrupa as inscrições aprovadas (pagas) em categorias. `destino` aplica as fusões feitas pelo organizador. */
export function montarCategorias(
  inscricoes: Inscricao[],
  atletas: Map<string, Atleta>,
  destino: Record<string, string>,
): Categoria[] {
  const mapa = new Map<string, Categoria>();
  for (const insc of inscricoes) {
    if (insc.pagamento !== "pago" || insc.pesagem === "nao-bateu") continue;
    const atleta = atletas.get(insc.atletaId)!;
    const id = destino[insc.id] ?? idCategoria(insc, atleta.sexo);
    let cat = mapa.get(id);
    if (!cat) {
      const [modalidade, sexo, divisao, faixa, peso] = id.split("|") as [Modalidade, "M" | "F", string, string, string];
      cat = {
        id, modalidade, sexo, divisao, faixa, peso,
        nome: `${divisao} · ${sexo === "M" ? "Masculino" : "Feminino"} · ${faixa} · ${peso}`,
        inscricoes: [], minutos: minutosDeLuta(divisao, faixa),
      };
      mapa.set(id, cat);
    }
    cat.inscricoes.push(insc);
  }
  return [...mapa.values()].sort((a, b) => a.id.localeCompare(b.id));
}

function hash(texto: string): number {
  let h = 2166136261;
  for (let i = 0; i < texto.length; i++) h = Math.imul(h ^ texto.charCodeAt(i), 16777619);
  return h >>> 0;
}

export function gerarChave(cat: Categoria, atletas: Map<string, Atleta>, sorteio: number): ChaveEliminatoria | null {
  if (cat.inscricoes.length < 2) return null;
  const participantes = [...cat.inscricoes]
    .sort((a, b) => a.id.localeCompare(b.id))
    .map((i) => ({ id: i.id, equipe: atletas.get(i.atletaId)!.equipe }));
  const semente = (hash(cat.id) + sorteio) >>> 0;
  // três atletas: chave de três, a única exceção à eliminação simples (Regulamento Geral, art. 2.3)
  return participantes.length === 3 ? gerarChaveDeTres(participantes, { semente }) : gerarEliminatoriaSimples(participantes, { semente });
}

export const chaveDoResultado = (categoriaId: string, lutaId: string) => `${categoriaId}::${lutaId}`;

export function resolver(cat: Categoria, chave: ChaveEliminatoria, resultados: Record<string, Resultado>): ChaveResolvida {
  const locais: Record<string, Resultado> = {};
  for (const l of chave.lutas) {
    const r = resultados[chaveDoResultado(cat.id, l.id)];
    if (r) locais[l.id] = r;
  }
  try {
    return resolverChave(chave, locais);
  } catch {
    // resultados de um sorteio anterior deixam de valer se a chave foi refeita
    return resolverChave(chave, {});
  }
}

export const TATAMES = 6;
export const INICIO_MIN = 9 * 60;
const TRANSICAO_MIN = 3;

export interface Bloco {
  categoria: Categoria;
  chave: ChaveEliminatoria;
  tatame: number;
  dia: 1 | 2;
  inicio: number;
  fim: number;
}

/**
 * Programação simples do protótipo: Gi no dia 1, No-Gi no dia 2; crianças primeiro;
 * cada chave roda inteira em sequência no tatame com menor carga.
 * Ainda não respeita descanso nem conflito de atleta em duas categorias.
 */
export function montarProgramacao(categorias: Categoria[], chaves: Map<string, ChaveEliminatoria>): Bloco[] {
  // crianças primeiro, depois os masters do mais velho ao mais novo, e o adulto por último
  const nomes = divisoes.map((x) => x.nome);
  const ordemDivisao = [...nomes.filter((n) => !n.startsWith("Master") && n !== "Adulto"), ...nomes.filter((n) => n.startsWith("Master")).reverse(), "Adulto"];
  const blocos: Bloco[] = [];
  for (const dia of [1, 2] as const) {
    const carga = Array.from({ length: TATAMES }, () => INICIO_MIN);
    const doDia = categorias
      .filter((c) => (dia === 1 ? c.modalidade === "Gi" : c.modalidade === "No-Gi") && chaves.has(c.id))
      .sort((a, b) => ordemDivisao.indexOf(a.divisao) - ordemDivisao.indexOf(b.divisao) || a.id.localeCompare(b.id));
    for (const categoria of doDia) {
      const chave = chaves.get(categoria.id)!;
      const tatame = carga.indexOf(Math.min(...carga));
      const inicio = carga[tatame]!;
      const fim = inicio + chave.lutas.length * (categoria.minutos + TRANSICAO_MIN);
      carga[tatame] = fim;
      blocos.push({ categoria, chave, tatame: tatame + 1, dia, inicio, fim });
    }
  }
  return blocos;
}

export function horarioDaLuta(bloco: Bloco, lutaId: string): number {
  const indice = bloco.chave.lutas.findIndex((l) => l.id === lutaId);
  return bloco.inicio + indice * (bloco.categoria.minutos + TRANSICAO_MIN);
}

export const hhmm = (min: number) => `${String(Math.floor(min / 60)).padStart(2, "0")}:${String(Math.round(min % 60)).padStart(2, "0")}`;

export const nomeRodada = (rodada: number, total: number) => {
  const falta = total - rodada;
  return falta === 0 ? "Final" : falta === 1 ? "Semifinal" : falta === 2 ? "Quartas" : falta === 3 ? "Oitavas" : `Rodada ${rodada}`;
};
