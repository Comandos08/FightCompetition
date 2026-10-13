/**
 * Pacote de regras IBJJF.
 * Fonte única: IBJJF, "Livro de Regras, Regulamento Geral de Competições e Manual de Formatação de Competições",
 * versão 6.1, junho de 2024. Cada constante cita o artigo de onde saiu. Nada aqui é escrito de memória.
 *
 * O que o livro NÃO traz: a tabela de pesos (está em pesos-ibjjf.ts, de outra fonte) e o sistema de faixas por idade.
 */
export const FONTE = "IBJJF, Livro de Regras v6.1 (jun. 2024)";

export type Faixa = "Branca" | "Azul" | "Roxa" | "Marrom" | "Preta" | (string & {});

export interface CategoriaDeIdade {
  nome: string;
  /** Idade = ano do campeonato − ano de nascimento (Regulamento Geral, art. 1.1). */
  idadeMinima: number;
  /** Ausente em adulto e master, que só têm limite mínimo (art. 1.2). */
  idadeExata?: number;
  /** Tempo regulamentar em minutos, conforme a faixa (tabela do art. 1.3). */
  minutos: (faixa: Faixa) => number;
}

const fixo = (m: number) => () => m;
const infantil = (nome: string, idade: number, minutos: number): CategoriaDeIdade => ({ nome, idadeMinima: idade, idadeExata: idade, minutos: fixo(minutos) });

/** Regulamento Geral de Competições, art. 1.3. */
export const CATEGORIAS_DE_IDADE: readonly CategoriaDeIdade[] = [
  infantil("Pré-Mirim I", 4, 2), infantil("Pré-Mirim II", 5, 2), infantil("Pré-Mirim III", 6, 2),
  infantil("Mirim I", 7, 3), infantil("Mirim II", 8, 3), infantil("Mirim III", 9, 3),
  infantil("Infantil I", 10, 4), infantil("Infantil II", 11, 4), infantil("Infantil III", 12, 4),
  infantil("Infanto-Juvenil I", 13, 4), infantil("Infanto-Juvenil II", 14, 4), infantil("Infanto-Juvenil III", 15, 4),
  infantil("Juvenil I", 16, 5), infantil("Juvenil II", 17, 5),
  { nome: "Adulto", idadeMinima: 18, minutos: (f) => ({ Branca: 5, Azul: 6, Roxa: 7, Marrom: 8, Preta: 10 })[f as string] ?? 5 },
  { nome: "Master 1", idadeMinima: 30, minutos: (f) => (f === "Branca" || f === "Azul" ? 5 : 6) },
  { nome: "Master 2", idadeMinima: 36, minutos: fixo(5) },
  { nome: "Master 3", idadeMinima: 41, minutos: fixo(5) },
  { nome: "Master 4", idadeMinima: 46, minutos: fixo(5) },
  { nome: "Master 5", idadeMinima: 51, minutos: fixo(5) },
  { nome: "Master 6", idadeMinima: 56, minutos: fixo(5) },
  { nome: "Master 7", idadeMinima: 61, minutos: fixo(5) },
];

export const idadeNoAno = (anoDoCampeonato: number, anoDeNascimento: number) => anoDoCampeonato - anoDeNascimento;

/**
 * Categorias em que o atleta pode se inscrever. Até 17 anos, só a da idade exata.
 * A partir de 18, adulto e todo master cujo limite mínimo ele já atingiu (art. 1.2).
 */
export function categoriasElegiveis(idade: number): CategoriaDeIdade[] {
  return CATEGORIAS_DE_IDADE.filter((c) => (c.idadeExata !== undefined ? c.idadeExata === idade : idade >= c.idadeMinima));
}

/** A categoria mais específica para a idade: a exata até 17 anos, o master mais alto depois. */
export function categoriaPadrao(idade: number): CategoriaDeIdade | undefined {
  const lista = categoriasElegiveis(idade);
  return lista[lista.length - 1];
}

export function tempoDeLuta(categoria: string, faixa: Faixa): number {
  const c = CATEGORIAS_DE_IDADE.find((x) => x.nome === categoria);
  if (!c) throw new Error(`Categoria de idade desconhecida: ${categoria}`);
  return c.minutos(faixa);
}

/** Art. 1.4: descanso igual ao tempo de luta até a semifinal; o dobro antes da final. */
export const descansoMinimo = (minutosDeLuta: number, antesDaFinal: boolean) => (antesDaFinal ? minutosDeLuta * 2 : minutosDeLuta);

/** As punições mudam até os 15 anos (Livro de Regras, art. 7.2.4). */
export const ehAte15Anos = (categoria: string) => {
  const c = CATEGORIAS_DE_IDADE.find((x) => x.nome === categoria);
  return c?.idadeExata !== undefined && c.idadeExata <= 15;
};

/** Livro de Regras, art. 2.5.2. */
export const PONTOS = { montada: 4, montadaPelasCostas: 4, pegadaPelasCostas: 4, passagemDeGuarda: 3, queda: 2, raspagem: 2, joelhoNaBarriga: 2 } as const;

/** Livro de Regras, art. 7.3.1: o árbitro conta 20 segundos consecutivos. */
export const COMBATIVIDADE_SEGUNDOS = 20;

export interface EfeitoDaPunicao { vantagemAoOponente: number; pontosAoOponente: number; desclassifica: boolean; }

/**
 * Efeito da enésima punição de um atleta (faltas graves e falta de combatividade somam, art. 7.2.2, 7.2.3 e 7.3.2).
 * Art. 7.2.1: 1ª só marca; 2ª dá uma vantagem ao oponente; 3ª dá dois pontos; 4ª desclassifica.
 * Art. 7.2.4, até 15 anos: 4ª e 5ª dão dois pontos cada; a 6ª desclassifica.
 */
export function efeitoDaPunicao(numero: number, ate15Anos: boolean): EfeitoDaPunicao {
  if (!Number.isInteger(numero) || numero < 1) throw new Error("O número da punição começa em 1.");
  const nada = { vantagemAoOponente: 0, pontosAoOponente: 0, desclassifica: false };
  if (numero === 1) return nada;
  if (numero === 2) return { ...nada, vantagemAoOponente: 1 };
  if (numero === 3) return { ...nada, pontosAoOponente: 2 };
  if (ate15Anos && numero <= 5) return { ...nada, pontosAoOponente: 2 };
  return { ...nada, desclassifica: true };
}

export interface Placar { pontos: number; vantagens: number; punicoes: number; }

/**
 * Vencedor pela contagem do placar (art. 2.5.1, 2.5.3 e 2.5.4): mais pontos; no empate, mais vantagens;
 * no empate, menos punições. Devolve null quando tudo empata: a decisão é do árbitro (art. 2.6.1).
 */
export function vencedorPeloPlacar(a: Placar, b: Placar): 0 | 1 | null {
  if (a.pontos !== b.pontos) return a.pontos > b.pontos ? 0 : 1;
  if (a.vantagens !== b.vantagens) return a.vantagens > b.vantagens ? 0 : 1;
  if (a.punicoes !== b.punicoes) return a.punicoes < b.punicoes ? 0 : 1;
  return null;
}

/** Regulamento Geral, art. 3.2. */
export const PONTOS_POR_ACADEMIA = { campeao: 9, vice: 3, terceiro: 1 } as const;

/**
 * Regulamento Geral, art. 3.4 e 3.5: categoria com um só atleta, ou com apenas dois atletas da mesma
 * academia, não conta pontos para a disputa por academias.
 */
export function categoriaContaParaAcademias(academiasDosAtletas: readonly string[]): boolean {
  if (academiasDosAtletas.length <= 1) return false;
  if (academiasDosAtletas.length === 2 && academiasDosAtletas[0] === academiasDosAtletas[1]) return false;
  return true;
}

/** Regulamento Geral, art. 5.2: até dois atletas por academia em cada categoria de peso, faixa, idade e sexo. */
export const MAXIMO_DE_ATLETAS_POR_ACADEMIA_NA_CATEGORIA = 2;

/** Regulamento Geral, art. 4.1.1: ouro, prata e dois bronzes. */
export const TERCEIROS_COLOCADOS = 2;
