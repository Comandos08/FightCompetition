import type { ChaveEliminatoria, Participante } from "./eliminatoria-simples.js";
import { criarRng, embaralhar } from "./rng.js";

/**
 * Chave de três atletas, a única exceção à eliminação simples.
 * Fonte: IBJJF, Regulamento Geral de Competições, art. 2.3 e 2.3.1 (Livro de Regras v6.1, jun. 2024):
 * "após a primeira luta, o vencedor segue para a final e o perdedor segue para enfrentar o terceiro
 * atleta da chave. O atleta que vencer a segunda luta, mesmo que seja o perdedor da primeira luta,
 * segue então para a final com o vencedor da primeira luta."
 *
 * L1: dois atletas sorteados. L2: perdedor da L1 contra o terceiro atleta. L3 (final): vencedor da L1
 * contra o vencedor da L2. O sorteio define quem faz a primeira luta; o livro não fixa outro critério.
 */
export function gerarChaveDeTres(participantes: readonly Participante[], opcoes: { semente: number }): ChaveEliminatoria {
  if (participantes.length !== 3) throw new Error("A chave de três exige exatamente 3 participantes.");
  if (new Set(participantes.map((p) => p.id)).size !== 3) throw new Error("Há participantes com identificador repetido.");
  const [a, b, c] = embaralhar([...participantes], criarRng(opcoes.semente)) as [Participante, Participante, Participante];
  return {
    formato: "chave-de-tres",
    semente: opcoes.semente,
    tamanho: 4,
    totalRodadas: 2,
    byes: [],
    lutas: [
      { id: "L1", rodada: 1, ladoA: { tipo: "participante", participanteId: a.id }, ladoB: { tipo: "participante", participanteId: b.id } },
      { id: "L2", rodada: 1, ladoA: { tipo: "perdedor", lutaId: "L1" }, ladoB: { tipo: "participante", participanteId: c.id } },
      { id: "L3", rodada: 2, ladoA: { tipo: "vencedor", lutaId: "L1" }, ladoB: { tipo: "vencedor", lutaId: "L2" } },
    ],
    finalId: "L3",
    ordem: [a.id, b.id, c.id],
  };
}
