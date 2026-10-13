/**
 * Dados FICTÍCIOS do protótipo. Nenhum nome, equipe ou evento aqui é real.
 * Categorias de idade e tempos de luta vêm do pacote de regras IBJJF (Regulamento Geral, art. 1.3).
 * Pesos seguem a tabela oficial da IBJJF (packages/engine/src/pesos-ibjjf.ts). As faixas por idade continuam ilustrativas.
 */
import { criarRng, regrasIbjjf, type Rng, pesosIbjjf } from "@engine";

export type Sexo = "M" | "F";
export type Modalidade = "Gi" | "No-Gi";

export interface Atleta {
  id: string;
  nome: string;
  sexo: Sexo;
  anoNascimento: number;
  equipe: string;
  faixa: string;
  menor: boolean;
  responsavel?: string;
  /** conta que cadastrou este atleta no protótipo */
  conta?: string;
}

export type StatusPagamento = "pago" | "pendente" | "aguardando-autorizacao" | "estornado";
export type StatusPesagem = "nao-pesado" | "ok" | "nao-bateu";

export interface Inscricao {
  id: string;
  atletaId: string;
  modalidade: Modalidade;
  divisao: string;
  faixa: string;
  peso: string;
  pagamento: StatusPagamento;
  pesagem: StatusPesagem;
  valor: number;
  /** conta que fez a inscrição no protótipo */
  conta?: string;
  /** inscrição feita em lote pelo professor */
  lote?: boolean;
}

export interface EventoResumo {
  id: string;
  nome: string;
  organizador: string;
  cidade: string;
  datas: string;
  local: string;
  modalidades: string;
  inscritos: number;
  status: "Inscrições abertas" | "Em breve" | "Encerrado";
  demo?: boolean;
}

export const EVENTO_ID = "copa-horizonte-2026";

export const eventos: EventoResumo[] = [
  { id: EVENTO_ID, nome: "Copa Horizonte de Jiu-Jitsu 2026", organizador: "Liga Horizonte de Jiu-Jitsu", cidade: "Rio de Janeiro, RJ", datas: "21 e 22 nov 2026", local: "Ginásio Municipal Pedra Branca", modalidades: "Gi e No-Gi", inscritos: 0, status: "Inscrições abertas", demo: true },
  { id: "aberto-serra-2026", nome: "Aberto da Serra de Grappling", organizador: "Associação Serrana de Lutas", cidade: "Petrópolis, RJ", datas: "06 dez 2026", local: "Clube Maré Alta", modalidades: "No-Gi", inscritos: 214, status: "Inscrições abertas" },
  { id: "festival-kids-2027", nome: "Festival Kids Tatame Aberto", organizador: "Projeto Tatame Aberto", cidade: "Niterói, RJ", datas: "17 jan 2027", local: "Arena Baobá", modalidades: "Gi", inscritos: 0, status: "Em breve" },
  { id: "interno-raiz-2026", nome: "Torneio Interno Raiz", organizador: "Raiz Jiu-Jitsu", cidade: "Duque de Caxias, RJ", datas: "03 out 2026", local: "Sede Raiz", modalidades: "Gi", inscritos: 86, status: "Encerrado" },
];

export const equipes = [
  "Raiz Jiu-Jitsu", "Guarda Alta", "Tatame Aberto", "Leão do Norte", "Arte Suave Niterói", "Equipe Baobá",
  "Clube Maré", "Dojo Horizonte", "Pedra Branca JJ", "Time Serra", "Casca Grossa JJ", "Instituto Vitória",
  "Coletivo Raspagem", "Escola Marajó", "Projeto Faixa Social", "Nova Trilha BJJ",
];

const nomesM = ["Rafael", "Bruno", "Diego", "Lucas", "Mateus", "Thiago", "Caio", "André", "Felipe", "Gustavo", "Henrique", "Igor", "João", "Leandro", "Marcelo", "Nicolas", "Otávio", "Paulo", "Renan", "Samuel", "Tomás", "Vinícius", "Wesley", "Yuri", "Davi", "Enzo", "Miguel", "Pedro", "Arthur", "Heitor"];
const nomesF = ["Ana", "Bianca", "Camila", "Daniela", "Eduarda", "Fernanda", "Gabriela", "Helena", "Isabela", "Júlia", "Karina", "Larissa", "Marina", "Natália", "Olívia", "Patrícia", "Rafaela", "Sofia", "Tatiane", "Valentina", "Yasmin", "Alice", "Laura", "Manuela", "Luíza"];
const sobrenomes = ["Almeida", "Barros", "Cardoso", "Dias", "Esteves", "Farias", "Gomes", "Honorato", "Ibiapina", "Jardim", "Lacerda", "Macedo", "Nogueira", "Oliveira", "Paiva", "Queiroz", "Ramos", "Sampaio", "Teixeira", "Uchoa", "Valadares", "Xavier", "Zanetti", "Brandão", "Coutinho", "Duarte", "Figueira", "Guedes", "Lins", "Moura", "Neves", "Pacheco", "Rezende", "Siqueira", "Toledo"];

interface DivisaoDef { nome: string; idadeMin: number; idadeMax: number; faixas: string[]; pesos: string[]; minutos: (faixa: string) => number; peso: number; }

const todasAsClasses = [...pesosIbjjf.CLASSES_DE_PESO] as string[];
const faixasAdulto = ["Branca", "Azul", "Roxa", "Marrom", "Preta"];
const faixasKids = ["Branca", "Cinza", "Amarela", "Laranja", "Verde"];
/** Peso de sorteio de cada categoria na base fictícia e as faixas ilustrativas de cada grupo. */
const grupos: { prefixo: string; faixas: string[]; pesos: string[]; chance: number; ate?: number }[] = [
  { prefixo: "Pré-Mirim", faixas: faixasKids.slice(0, 2), pesos: todasAsClasses, chance: 0.7 },
  { prefixo: "Mirim", faixas: faixasKids.slice(0, 3), pesos: todasAsClasses, chance: 3 },
  { prefixo: "Infantil", faixas: faixasKids, pesos: todasAsClasses, chance: 3.6 },
  { prefixo: "Infanto-Juvenil", faixas: faixasKids, pesos: todasAsClasses, chance: 3 },
  { prefixo: "Juvenil", faixas: ["Branca", "Azul"], pesos: todasAsClasses, chance: 3 },
  { prefixo: "Adulto", faixas: faixasAdulto, pesos: todasAsClasses, chance: 38 },
  { prefixo: "Master 1", faixas: faixasAdulto, pesos: todasAsClasses, chance: 14 },
  { prefixo: "Master 2", faixas: faixasAdulto, pesos: todasAsClasses, chance: 8 },
  { prefixo: "Master 3", faixas: faixasAdulto, pesos: todasAsClasses, chance: 4 },
  { prefixo: "Master 4", faixas: faixasAdulto, pesos: todasAsClasses, chance: 1.5 },
  { prefixo: "Master 5", faixas: faixasAdulto, pesos: todasAsClasses, chance: 0.6 },
  { prefixo: "Master 6", faixas: faixasAdulto, pesos: todasAsClasses, chance: 0.3 },
  { prefixo: "Master 7", faixas: faixasAdulto, pesos: todasAsClasses, chance: 0.2 },
];

/** Uma entrada por categoria de idade do Regulamento Geral, art. 1.3, na ordem do livro. */
export const divisoes: DivisaoDef[] = regrasIbjjf.CATEGORIAS_DE_IDADE.map((c, i, todas) => {
  const g = grupos.find((x) => c.nome === x.prefixo || c.nome.startsWith(`${x.prefixo} `) && !x.prefixo.startsWith("Master"))!;
  // para a base fictícia, cada atleta cai na categoria mais específica da idade dele
  const proxima = todas[i + 1];
  return { nome: c.nome, idadeMin: c.idadeMinima, idadeMax: c.idadeExata ?? (proxima ? proxima.idadeMinima - 1 : 75), faixas: g.faixas, pesos: g.pesos, minutos: (f: string) => c.minutos(f), peso: g.chance };
});

export const ANO_EVENTO = 2026;
export const VALOR_INSCRICAO = 120;

const sortear = <T,>(itens: readonly T[], rng: Rng): T => itens[Math.floor(rng() * itens.length)]!;

function sortearPonderado<T>(itens: readonly T[], pesos: readonly number[], rng: Rng): T {
  const total = pesos.reduce((s, p) => s + p, 0);
  let alvo = rng() * total;
  for (let i = 0; i < itens.length; i++) {
    alvo -= pesos[i]!;
    if (alvo <= 0) return itens[i]!;
  }
  return itens[itens.length - 1]!;
}

/** Pesos centrais são mais comuns que os extremos. */
function sortearPeso(pesos: string[], rng: Rng): string {
  const meio = (pesos.length - 1) / 2;
  return sortearPonderado(pesos, pesos.map((_, i) => 1 / (1 + Math.abs(i - meio) * 1.8)), rng);
}

export interface Base { atletas: Atleta[]; inscricoes: Inscricao[]; }

export function gerarBase(totalAtletas = 600, semente = 2026): Base {
  const rng = criarRng(semente);
  const atletas: Atleta[] = [];
  const inscricoes: Inscricao[] = [];
  const usados = new Set<string>();
  let seq = 1;

  for (let i = 1; i <= totalAtletas; i++) {
    const sexo: Sexo = rng() < 0.72 ? "M" : "F";
    const div = sortearPonderado(divisoes, divisoes.map((d) => d.peso), rng);
    const idade = div.idadeMin + Math.floor(rng() * (div.idadeMax - div.idadeMin + 1));
    // faixas iniciais são mais comuns
    const faixa = sortearPonderado(div.faixas, div.faixas.map((_, k) => 1 / (1 + k * 1.3)), rng);
    let nome = "";
    do {
      nome = `${sortear(sexo === "M" ? nomesM : nomesF, rng)} ${sortear(sobrenomes, rng)} ${sortear(sobrenomes, rng)}`;
    } while (usados.has(nome));
    usados.add(nome);
    const menor = idade < 18;
    const equipe = sortearPonderado(equipes, equipes.map((_, k) => 1 / (1 + k * 0.18)), rng);
    const atleta: Atleta = {
      id: `AT${String(i).padStart(4, "0")}`, nome, sexo, anoNascimento: ANO_EVENTO - idade, equipe, faixa, menor,
      responsavel: menor ? `${sortear(rng() < 0.5 ? nomesM : nomesF, rng)} ${nome.split(" ").slice(-1)[0]}` : undefined,
    };
    atletas.push(atleta);

    const peso = sortearPeso(pesosIbjjf.limitesDePeso(div.nome, sexo).map((l) => l.classe), rng);
    const pg = rng();
    const pagamento: StatusPagamento = menor && pg < 0.06 ? "aguardando-autorizacao" : pg < 0.88 ? "pago" : "pendente";
    const modalidades: Modalidade[] = rng() < 0.26 ? ["Gi", "No-Gi"] : rng() < 0.9 ? ["Gi"] : ["No-Gi"];
    for (const modalidade of modalidades) {
      inscricoes.push({ id: `I${String(seq++).padStart(4, "0")}`, atletaId: atleta.id, modalidade, divisao: div.nome, faixa, peso, pagamento, pesagem: "nao-pesado", valor: VALOR_INSCRICAO });
    }
  }
  return { atletas, inscricoes };
}

export function minutosDeLuta(divisao: string, faixa: string): number {
  return divisoes.find((d) => d.nome === divisao)?.minutos(faixa) ?? 5;
}

export function divisaoPorIdade(idade: number): DivisaoDef | undefined {
  return divisoes.find((d) => idade >= d.idadeMin && idade <= d.idadeMax);
}

export const coresFaixa: Record<string, string> = {
  Branca: "#FFFFFF", Cinza: "#9AA1A9", Amarela: "#E8C434", Laranja: "#E58A2B", Verde: "#3E8E5A",
  Azul: "#2F62B8", Roxa: "#6B3FA0", Marrom: "#6E4A2E", Preta: "#15191E",
};
