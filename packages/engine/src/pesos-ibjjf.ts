/**
 * Tabela de pesos.
 * Fonte: IBJJF, "Tabela de Pesos Oficial" (folha única enviada pelo fundador em 13/10/2026, com referência ao ano de 2023).
 * Valores transcritos como estão na folha: peso máximo de cada categoria, em quilos, com o quimono vestido.
 * A folha não traz pesos sem quimono (No-Gi) nem separa as crianças por sexo.
 */
export const FONTE_DOS_PESOS = "IBJJF, Tabela de Pesos Oficial (folha de 2023)";

export type Sexo = "M" | "F";
/** Até os 15 anos a folha traz um limite para cada tipo de quimono. */
export type Quimono = "liso" | "trancado";

export const CLASSES_DE_PESO = ["Galo", "Pluma", "Pena", "Leve", "Médio", "Meio-pesado", "Pesado", "Super-pesado", "Pesadíssimo"] as const;
export type ClasseDePeso = (typeof CLASSES_DE_PESO)[number];

export interface LimiteDePeso { classe: ClasseDePeso; /** nulo quando a classe não tem peso máximo */ maximo: number | null; }

const IDADES_INFANTIS = [
  "Pré-Mirim I", "Pré-Mirim II", "Pré-Mirim III", "Mirim I", "Mirim II", "Mirim III",
  "Infantil I", "Infantil II", "Infantil III", "Infanto-Juvenil I", "Infanto-Juvenil II", "Infanto-Juvenil III",
] as const;

/** Uma linha por classe (Galo a Super-pesado), uma coluna por categoria de idade, na ordem de IDADES_INFANTIS. */
const INFANTIL: Record<Quimono, number[][]> = {
  liso: [
    [11.3, 14.2, 16.2, 17.5, 20.5, 23.3, 26.3, 29.4, 31.4, 35.4, 39.5, 43.5],
    [14.2, 16.2, 18.2, 20.5, 23.3, 26.3, 29.4, 32.4, 35.4, 39.5, 43.5, 47.5],
    [17.2, 19.2, 21.2, 23.5, 26.3, 29.4, 32.4, 35.4, 39.5, 43.5, 47.5, 52.1],
    [20.2, 22.2, 24.3, 26.5, 29.4, 32.4, 35.4, 38.5, 43.5, 47.5, 52.1, 56.1],
    [23.2, 25.3, 27.3, 29.5, 32.4, 35.4, 38.5, 41.5, 47.5, 52.1, 56.1, 60.1],
    [26.2, 28.3, 30.4, 32.5, 35.4, 38.5, 41.5, 44.5, 52.1, 56.1, 60.1, 64.2],
    [29.3, 31.3, 33.4, 35.5, 38.5, 41.5, 44.5, 47.5, 56.1, 60.1, 64.2, 68.2],
    [32.3, 34.3, 36.4, 38.5, 41.5, 44.5, 47.5, 51.1, 60.1, 64.2, 68.2, 72.2],
  ],
  trancado: [
    [12.0, 14.7, 17.9, 18.2, 21.0, 24.0, 27.0, 30.2, 32.2, 36.2, 40.3, 44.3],
    [14.7, 17.9, 18.9, 21.0, 24.0, 27.0, 30.2, 33.2, 36.2, 40.3, 44.3, 48.3],
    [18.0, 20.0, 22.0, 24.0, 27.0, 30.2, 33.2, 36.2, 40.3, 44.3, 48.3, 52.5],
    [21.0, 24.0, 25.0, 27.0, 30.2, 33.2, 36.2, 39.3, 44.3, 48.3, 52.5, 56.5],
    [24.0, 26.0, 28.0, 30.2, 33.2, 36.2, 39.3, 42.3, 48.3, 52.5, 56.5, 60.5],
    [27.0, 29.0, 31.2, 33.2, 36.2, 39.3, 42.3, 45.3, 52.5, 56.5, 60.5, 65.0],
    [30.0, 32.0, 34.2, 36.2, 39.3, 42.3, 45.3, 48.3, 56.5, 60.5, 65.0, 69.0],
    [33.0, 35.0, 37.2, 39.3, 42.3, 45.3, 48.3, 51.5, 60.5, 65.0, 69.0, 73.0],
  ],
};

/** Limites de Galo em diante; a última classe de cada grupo não tem peso máximo. */
const JUVENIL_M = [53.5, 58.5, 64.0, 69.0, 74.0, 79.3, 84.3, 89.3];
const ADULTO_M = [57.5, 64.0, 70.0, 76.0, 82.3, 88.3, 94.3, 100.5];
const ADULTO_F = [48.5, 53.5, 58.5, 64.0, 69.0, 74.0, 79.3];
const JUVENIL_F = [44.3, 48.3, 52.5, 56.5, 60.5, 65.0, 69.0];

const comAberta = (limites: number[]): LimiteDePeso[] => [
  ...limites.map((maximo, i) => ({ classe: CLASSES_DE_PESO[i]!, maximo })),
  { classe: CLASSES_DE_PESO[limites.length]!, maximo: null },
];

/**
 * Classes de peso de uma categoria de idade, da mais leve para a mais pesada, com o peso máximo de cada uma.
 * No feminino juvenil, adulto e master a última classe é o Super-pesado; nos demais, o Pesadíssimo.
 */
export function limitesDePeso(categoriaDeIdade: string, sexo: Sexo, quimono: Quimono = "liso"): LimiteDePeso[] {
  const coluna = (IDADES_INFANTIS as readonly string[]).indexOf(categoriaDeIdade);
  if (coluna >= 0) return comAberta(INFANTIL[quimono].map((linha) => linha[coluna]!));
  if (categoriaDeIdade.startsWith("Juvenil")) return comAberta(sexo === "M" ? JUVENIL_M : JUVENIL_F);
  if (categoriaDeIdade === "Adulto" || categoriaDeIdade.startsWith("Master")) return comAberta(sexo === "M" ? ADULTO_M : ADULTO_F);
  throw new Error(`Categoria de idade desconhecida: ${categoriaDeIdade}`);
}

/** A classe mais leve em que o peso medido cabe. */
export function classeDoPeso(categoriaDeIdade: string, sexo: Sexo, quilos: number, quimono: Quimono = "liso"): ClasseDePeso {
  if (!(quilos > 0)) throw new Error("O peso precisa ser maior que zero.");
  return limitesDePeso(categoriaDeIdade, sexo, quimono).find((l) => l.maximo === null || quilos <= l.maximo)!.classe;
}

/** Na pesagem: o atleta está dentro do limite da classe em que se inscreveu? */
export function dentroDoPeso(categoriaDeIdade: string, sexo: Sexo, classe: string, quilos: number, quimono: Quimono = "liso"): boolean {
  const limite = limitesDePeso(categoriaDeIdade, sexo, quimono).find((l) => l.classe === classe);
  if (!limite) throw new Error(`A classe ${classe} não existe em ${categoriaDeIdade}.`);
  return limite.maximo === null || quilos <= limite.maximo;
}
