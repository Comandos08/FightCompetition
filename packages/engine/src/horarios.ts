import type { ChaveEliminatoria, Origem } from "./eliminatoria-simples.js";

export interface OpcoesDeHorario {
  /** tempo regulamentar da luta, em minutos */
  minutos: number;
  /** troca de atletas entre uma luta e outra no mesmo tatame */
  transicao: number;
  /** descanso mínimo do atleta antes da próxima luta dele; o regulamento dobra antes da final */
  descanso: (antesDaFinal: boolean) => number;
}

/**
 * Minuto de início de cada luta de uma chave que roda inteira no mesmo tatame, contado do início da chave.
 * Uma luta só começa depois da anterior e depois de os dois atletas terem descansado o mínimo.
 */
export function horariosDaChave(chave: ChaveEliminatoria, o: OpcoesDeHorario): { inicio: Record<string, number>; duracao: number } {
  const inicio: Record<string, number> = {};
  const livre = (origem: Origem, ehFinal: boolean) => (origem.tipo === "participante" ? 0 : inicio[origem.lutaId]! + o.minutos + o.descanso(ehFinal));
  let tatameLivre = 0;
  for (const luta of chave.lutas) {
    const ehFinal = luta.id === chave.finalId;
    const t = Math.max(tatameLivre, livre(luta.ladoA, ehFinal), livre(luta.ladoB, ehFinal));
    inicio[luta.id] = t;
    tatameLivre = t + o.minutos + o.transicao;
  }
  return { inicio, duracao: tatameLivre };
}
