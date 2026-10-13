import { describe, expect, it } from "vitest";
import { gerarEliminatoriaSimples, tamanhoDaChave, type Participante } from "../src/index.js";

function atletas(n: number, equipes?: string[]): Participante[] {
  return Array.from({ length: n }, (_, i) => ({
    id: `A${i + 1}`,
    equipe: equipes ? equipes[i % equipes.length] : undefined,
  }));
}

/** Conjunto de participantes que podem chegar a cada lado de cada luta. */
function alcance(chave: ReturnType<typeof gerarEliminatoriaSimples>) {
  const porLuta = new Map<string, { a: string[]; b: string[] }>();
  const resolver = (o: (typeof chave.lutas)[number]["ladoA"]): string[] => {
    if (o.tipo === "participante") return [o.participanteId];
    const l = porLuta.get(o.lutaId);
    if (!l) throw new Error(`Luta ${o.lutaId} referenciada antes de existir`);
    return [...l.a, ...l.b];
  };
  for (const l of chave.lutas) porLuta.set(l.id, { a: resolver(l.ladoA), b: resolver(l.ladoB) });
  return porLuta;
}

describe("eliminatória simples: estrutura", () => {
  for (let n = 2; n <= 33; n++) {
    it(`${n} atletas`, () => {
      const chave = gerarEliminatoriaSimples(atletas(n), { semente: 7 });
      const tamanho = tamanhoDaChave(n);

      // n-1 lutas decidem um campeão
      expect(chave.lutas).toHaveLength(n - 1);
      expect(chave.tamanho).toBe(tamanho);
      expect(chave.byes).toHaveLength(tamanho - n);

      // cada atleta aparece exatamente uma vez
      expect([...chave.ordem].sort()).toEqual(atletas(n).map((a) => a.id).sort());
      const diretos = chave.lutas.flatMap((l) =>
        [l.ladoA, l.ladoB].flatMap((o) => (o.tipo === "participante" ? [o.participanteId] : [])),
      );
      expect(new Set(diretos).size).toBe(n);
      expect(diretos).toHaveLength(n);

      // cada luta alimenta no máximo uma outra, e só a final não alimenta ninguém
      const usos = new Map<string, number>();
      for (const l of chave.lutas)
        for (const o of [l.ladoA, l.ladoB])
          if (o.tipo === "vencedor") usos.set(o.lutaId, (usos.get(o.lutaId) ?? 0) + 1);
      for (const l of chave.lutas) expect(usos.get(l.id) ?? 0).toBe(l.id === chave.finalId ? 0 : 1);

      // a final é a única luta da última rodada e todos podem chegar a ela
      const ultima = chave.lutas.filter((l) => l.rodada === chave.totalRodadas);
      expect(ultima.map((l) => l.id)).toEqual([chave.finalId]);
      const final = alcance(chave).get(chave.finalId)!;
      expect(final.a.length + final.b.length).toBe(n);

      // byes espalhados: as metades diferem em no máximo um atleta
      expect(Math.abs(final.a.length - final.b.length)).toBeLessThanOrEqual(1);

      // ninguém com bye luta na primeira rodada, e ninguém tem dois byes
      const primeira = chave.lutas.filter((l) => l.rodada === 1);
      expect(primeira).toHaveLength(n - tamanho / 2);
      for (const l of primeira) {
        expect(l.ladoA.tipo).toBe("participante");
        expect(l.ladoB.tipo).toBe("participante");
      }
    });
  }

  it("recusa menos de 2 atletas e identificadores repetidos", () => {
    expect(() => gerarEliminatoriaSimples(atletas(1), { semente: 1 })).toThrow();
    expect(() => gerarEliminatoriaSimples([{ id: "X" }, { id: "X" }], { semente: 1 })).toThrow();
  });
});

describe("eliminatória simples: sorteio reproduzível", () => {
  it("mesma semente gera a mesma chave", () => {
    const a = gerarEliminatoriaSimples(atletas(13, ["Alfa", "Beta", "Gama"]), { semente: 42 });
    const b = gerarEliminatoriaSimples(atletas(13, ["Alfa", "Beta", "Gama"]), { semente: 42 });
    expect(a).toEqual(b);
  });

  it("sementes diferentes geram chaves diferentes", () => {
    const ordens = new Set<string>();
    for (let s = 1; s <= 20; s++)
      ordens.add(gerarEliminatoriaSimples(atletas(16), { semente: s }).ordem.join(","));
    expect(ordens.size).toBeGreaterThan(15);
  });
});

describe("eliminatória simples: separação por equipe", () => {
  it("dois atletas da mesma equipe só se encontram na final", () => {
    for (let n = 4; n <= 33; n++) {
      for (let s = 1; s <= 10; s++) {
        const lista = atletas(n).map((a, i) => ({ ...a, equipe: i < 2 ? "Mesma" : `E${i}` }));
        const chave = gerarEliminatoriaSimples(lista, { semente: s });
        const final = alcance(chave).get(chave.finalId)!;
        expect(final.a.includes("A1")).not.toBe(final.a.includes("A2"));
      }
    }
  });

  it("em toda luta, cada equipe fica repartida com diferença de no máximo um atleta", () => {
    for (const equipes of [["Alfa", "Beta"], ["Alfa", "Beta", "Gama"], ["Alfa", "Alfa", "Alfa", "Beta"]]) {
      for (let n = 4; n <= 33; n++) {
        const lista = atletas(n, equipes);
        const equipeDe = new Map(lista.map((p) => [p.id, p.equipe]));
        const chave = gerarEliminatoriaSimples(lista, { semente: n });
        for (const lados of alcance(chave).values()) {
          for (const equipe of new Set(equipes)) {
            const emA = lados.a.filter((id) => equipeDe.get(id) === equipe).length;
            const emB = lados.b.filter((id) => equipeDe.get(id) === equipe).length;
            expect(Math.abs(emA - emB)).toBeLessThanOrEqual(1);
          }
        }
      }
    }
  });

  it("não coloca a mesma equipe frente a frente na primeira rodada quando há alternativa", () => {
    const lista = atletas(8, ["Alfa", "Beta", "Gama", "Delta"]);
    const equipeDe = new Map(lista.map((p) => [p.id, p.equipe]));
    for (let s = 1; s <= 50; s++) {
      const chave = gerarEliminatoriaSimples(lista, { semente: s });
      for (const l of chave.lutas.filter((x) => x.rodada === 1)) {
        if (l.ladoA.tipo === "participante" && l.ladoB.tipo === "participante")
          expect(equipeDe.get(l.ladoA.participanteId)).not.toBe(equipeDe.get(l.ladoB.participanteId));
      }
    }
  });
});
