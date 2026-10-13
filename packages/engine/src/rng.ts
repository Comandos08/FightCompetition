/**
 * Gerador pseudoaleatório determinístico (mulberry32).
 * A mesma semente produz sempre a mesma sequência, o que torna o sorteio reproduzível.
 */
export type Rng = () => number;

export function criarRng(semente: number): Rng {
  let a = semente >>> 0;
  return () => {
    a = (a + 0x6d2b79f5) >>> 0;
    let t = a;
    t = Math.imul(t ^ (t >>> 15), t | 1);
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

/** Embaralha uma cópia da lista (Fisher-Yates) usando o gerador informado. */
export function embaralhar<T>(itens: readonly T[], rng: Rng): T[] {
  const copia = [...itens];
  for (let i = copia.length - 1; i > 0; i--) {
    const j = Math.floor(rng() * (i + 1));
    const tmp = copia[i] as T;
    copia[i] = copia[j] as T;
    copia[j] = tmp;
  }
  return copia;
}
