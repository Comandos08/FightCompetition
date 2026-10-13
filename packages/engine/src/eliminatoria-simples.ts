import { criarRng, embaralhar, type Rng } from "./rng.js";

/** Um inscrito na categoria. `equipe` é a chave de separação (afiliação ou academia). */
export interface Participante {
  id: string;
  equipe?: string;
}

/** De onde vem o ocupante de um lado da luta. */
export type Origem =
  | { tipo: "participante"; participanteId: string }
  | { tipo: "vencedor"; lutaId: string };

export interface Luta {
  id: string;
  /** 1 = primeira rodada da chave cheia; a final tem o maior número. */
  rodada: number;
  ladoA: Origem;
  ladoB: Origem;
}

export interface ChaveEliminatoria {
  formato: "eliminatoria-simples";
  semente: number;
  /** Número de posições da chave cheia (potência de dois). */
  tamanho: number;
  totalRodadas: number;
  /** Participantes que entram direto na segunda rodada ou depois. */
  byes: string[];
  lutas: Luta[];
  finalId: string;
  /** Ordem dos participantes de cima para baixo na chave. */
  ordem: string[];
}

type No =
  | { tipo: "participante"; participante: Participante }
  | { tipo: "luta"; profundidade: number; a: No; b: No };

export function tamanhoDaChave(n: number): number {
  let t = 1;
  while (t < n) t *= 2;
  return t;
}

/**
 * Divide os participantes em duas metades.
 * - As metades diferem em no máximo um participante, o que espalha os byes.
 * - Atletas da mesma equipe são repartidos entre as metades; para cada equipe,
 *   a diferença entre as metades é de no máximo um atleta.
 */
function dividir(participantes: Participante[], rng: Rng): [Participante[], Participante[]] {
  const grupos = new Map<string, Participante[]>();
  let semEquipe = 0;
  for (const p of participantes) {
    // quem não tem equipe forma um grupo próprio e nunca "colide" com ninguém
    const chave = p.equipe ?? `\u0000sem-equipe-${semEquipe++}`;
    const lista = grupos.get(chave);
    if (lista) lista.push(p);
    else grupos.set(chave, [p]);
  }

  // equipes maiores primeiro; empates decididos pelo sorteio
  const equipes = embaralhar([...grupos.values()], rng).sort((x, y) => y.length - x.length);

  const cima: Participante[] = [];
  const baixo: Participante[] = [];
  let vagasCima = Math.ceil(participantes.length / 2);
  let vagasBaixo = Math.floor(participantes.length / 2);

  for (const equipe of equipes) {
    const membros = embaralhar(equipe, rng);
    const metade = Math.floor(membros.length / 2);
    let paraCima = metade;
    if (membros.length % 2 === 1) {
      // o atleta que sobra vai para a metade com mais vagas; empate decidido pelo sorteio
      const cimaLeva = vagasCima === vagasBaixo ? rng() < 0.5 : vagasCima > vagasBaixo;
      if (cimaLeva) paraCima += 1;
    }
    cima.push(...membros.slice(0, paraCima));
    baixo.push(...membros.slice(paraCima));
    vagasCima -= paraCima;
    vagasBaixo -= membros.length - paraCima;
  }

  // a metade que recebe o participante extra é sorteada, para o bye não cair sempre em cima
  return rng() < 0.5 ? [cima, baixo] : [baixo, cima];
}

function montar(participantes: Participante[], profundidade: number, rng: Rng): No {
  if (participantes.length === 1) {
    return { tipo: "participante", participante: participantes[0] as Participante };
  }
  const [cima, baixo] = dividir(participantes, rng);
  return {
    tipo: "luta",
    profundidade,
    a: montar(cima, profundidade + 1, rng),
    b: montar(baixo, profundidade + 1, rng),
  };
}

/**
 * Gera uma chave de eliminatória simples.
 * Determinística: mesmos participantes (na mesma ordem) e mesma semente produzem a mesma chave.
 *
 * Não define colocação (bronze) nem a regra de três atletas: isso depende do regulamento.
 */
export function gerarEliminatoriaSimples(
  participantes: readonly Participante[],
  opcoes: { semente: number },
): ChaveEliminatoria {
  if (participantes.length < 2) {
    throw new Error("Eliminatória simples exige pelo menos 2 participantes.");
  }
  const ids = new Set(participantes.map((p) => p.id));
  if (ids.size !== participantes.length) {
    throw new Error("Há participantes com identificador repetido.");
  }

  const rng = criarRng(opcoes.semente);
  const tamanho = tamanhoDaChave(participantes.length);
  const totalRodadas = Math.log2(tamanho);
  const raiz = montar([...participantes], 0, rng);

  interface LutaTemp {
    rodada: number;
    a: string | LutaTemp;
    b: string | LutaTemp;
    id?: string;
  }
  const temporarias: LutaTemp[] = [];
  const byes: string[] = [];
  const ordem: string[] = [];

  // percorre a árvore de cima para baixo e devolve quem alimenta o nível acima
  const visitar = (no: No, profundidadeDoPai: number): string | LutaTemp => {
    if (no.tipo === "participante") {
      ordem.push(no.participante.id);
      // participante ligado direto a uma luta que não é de primeira rodada = bye
      if (profundidadeDoPai < totalRodadas - 1) byes.push(no.participante.id);
      return no.participante.id;
    }
    const a = visitar(no.a, no.profundidade);
    const b = visitar(no.b, no.profundidade);
    const luta: LutaTemp = { rodada: totalRodadas - no.profundidade, a, b };
    temporarias.push(luta);
    return luta;
  };
  const raizVisitada = visitar(raiz, -1);
  if (typeof raizVisitada === "string") throw new Error("Chave sem luta final.");

  // numera as lutas por rodada, mantendo a ordem de cima para baixo dentro de cada rodada
  const porRodadaTemp = temporarias
    .map((luta, indice) => ({ luta, indice }))
    .sort((x, y) => x.luta.rodada - y.luta.rodada || x.indice - y.indice)
    .map((x) => x.luta);
  porRodadaTemp.forEach((luta, i) => {
    luta.id = `L${i + 1}`;
  });

  const origem = (ref: string | LutaTemp): Origem =>
    typeof ref === "string"
      ? { tipo: "participante", participanteId: ref }
      : { tipo: "vencedor", lutaId: ref.id as string };

  const porRodada: Luta[] = porRodadaTemp.map((luta) => ({
    id: luta.id as string,
    rodada: luta.rodada,
    ladoA: origem(luta.a),
    ladoB: origem(luta.b),
  }));
  const final = { lutaId: raizVisitada.id as string };

  return {
    formato: "eliminatoria-simples",
    semente: opcoes.semente,
    tamanho,
    totalRodadas,
    byes,
    lutas: porRodada,
    finalId: final.lutaId,
    ordem,
  };
}
