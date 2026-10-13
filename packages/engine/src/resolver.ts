import type { ChaveEliminatoria, Origem } from "./eliminatoria-simples.js";

export interface Resultado {
  vencedorId: string;
  /** Texto livre nesta versão: pontos, finalização, W.O. etc. */
  metodo?: string;
  /**
   * Só na primeira luta da chave de três: o perdedor não compareceu e perde o direito de fazer a outra
   * semifinal (IBJJF, Regulamento Geral, art. 2.3.4). O terceiro atleta vai direto à final.
   */
  perdedorSemDireitoASegundaLuta?: boolean;
}

export interface LutaResolvida {
  id: string;
  rodada: number;
  /** Participante já definido em cada lado, quando conhecido. */
  a?: string;
  b?: string;
  vencedorId?: string;
  perdedorId?: string;
  metodo?: string;
  /** Os dois lados estão definidos e ainda não há resultado. */
  pronta: boolean;
}

export interface ChaveResolvida {
  lutas: LutaResolvida[];
  campeaoId?: string;
  viceId?: string;
  /**
   * Perdedores das semifinais. Corresponde à política de "dois terceiros lugares";
   * outras políticas de bronze ainda não existem no motor.
   */
  semifinalistasDerrotados: string[];
  concluida: boolean;
}

/**
 * Aplica os resultados registrados a uma chave e devolve quem está em cada luta.
 * Resultados de lutas cujos lados ainda não estão definidos, ou cujo vencedor não
 * é um dos dois lados, são recusados: o motor nunca avança um atleta sem condição.
 */
export function resolverChave(
  chave: ChaveEliminatoria,
  resultados: Readonly<Record<string, Resultado | undefined>>,
): ChaveResolvida {
  const porId = new Map<string, LutaResolvida>();
  const lado = (o: Origem): string | undefined =>
    o.tipo === "participante" ? o.participanteId : o.tipo === "vencedor" ? porId.get(o.lutaId)?.vencedorId : porId.get(o.lutaId)?.perdedorId;
  const deTres = chave.formato === "chave-de-tres";
  const semSegundaLuta = deTres && Boolean(resultados.L1?.perdedorSemDireitoASegundaLuta);

  // as lutas já vêm ordenadas por rodada, então as origens são resolvidas antes do uso
  for (const luta of chave.lutas) {
    const a = lado(luta.ladoA);
    const b = lado(luta.ladoB);
    const r = resultados[luta.id];
    const resolvida: LutaResolvida = { id: luta.id, rodada: luta.rodada, a, b, pronta: false };
    if (semSegundaLuta && luta.id === "L2" && porId.get("L1")?.vencedorId) {
      // art. 2.3.4: o ausente da primeira luta não faz a segunda; o terceiro atleta avança sem lutar
      resolvida.a = undefined;
      resolvida.vencedorId = b;
      resolvida.metodo = "Avança sem luta (art. 2.3.4)";
    } else if (r) {
      if (!a || !b) throw new Error(`Luta ${luta.id} recebeu resultado antes de ter os dois lados definidos.`);
      if (r.vencedorId !== a && r.vencedorId !== b) {
        throw new Error(`Vencedor ${r.vencedorId} não participa da luta ${luta.id}.`);
      }
      resolvida.vencedorId = r.vencedorId;
      resolvida.perdedorId = r.vencedorId === a ? b : a;
      resolvida.metodo = r.metodo;
    } else {
      resolvida.pronta = Boolean(a && b);
    }
    porId.set(luta.id, resolvida);
  }

  const final = porId.get(chave.finalId) as LutaResolvida;
  const definicaoFinal = chave.lutas.find((l) => l.id === chave.finalId)!;
  const semifinalistasDerrotados: string[] = [];
  if (deTres) {
    // na chave de três há um único terceiro colocado: quem perde a segunda luta.
    // quem perde a primeira ainda luta de novo, e o ausente do art. 2.3.4 não tem colocação (art. 4.2).
    const terceiro = porId.get("L2")?.perdedorId;
    if (terceiro) semifinalistasDerrotados.push(terceiro);
  } else {
    for (const o of [definicaoFinal.ladoA, definicaoFinal.ladoB]) {
      if (o.tipo === "vencedor") {
        const perdedor = porId.get(o.lutaId)?.perdedorId;
        if (perdedor) semifinalistasDerrotados.push(perdedor);
      }
    }
  }

  return {
    lutas: chave.lutas.map((l) => porId.get(l.id) as LutaResolvida),
    campeaoId: final.vencedorId,
    viceId: final.perdedorId,
    semifinalistasDerrotados,
    concluida: Boolean(final.vencedorId),
  };
}
