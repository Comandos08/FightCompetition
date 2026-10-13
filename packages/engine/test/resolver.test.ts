import { describe, expect, it } from "vitest";
import { gerarEliminatoriaSimples, resolverChave, type Resultado } from "../src/index.js";

const atletas = (n: number) => Array.from({ length: n }, (_, i) => ({ id: `A${i + 1}` }));

describe("resolver chave", () => {
  it("sem resultados, só as lutas com dois participantes diretos estão prontas", () => {
    const chave = gerarEliminatoriaSimples(atletas(6), { semente: 3 });
    const r = resolverChave(chave, {});
    expect(r.concluida).toBe(false);
    expect(r.lutas.filter((l) => l.pronta)).toHaveLength(2);
  });

  it("avança vencedores até definir campeão, vice e semifinalistas derrotados", () => {
    for (let n = 2; n <= 20; n++) {
      const chave = gerarEliminatoriaSimples(atletas(n), { semente: n });
      const resultados: Record<string, Resultado> = {};
      const perdedores = new Set<string>();
      // o lado A vence sempre
      for (;;) {
        const pronta = resolverChave(chave, resultados).lutas.find((l) => l.pronta);
        if (!pronta) break;
        resultados[pronta.id] = { vencedorId: pronta.a as string };
        perdedores.add(pronta.b as string);
      }
      const fim = resolverChave(chave, resultados);
      expect(fim.concluida).toBe(true);
      expect(perdedores.size).toBe(n - 1);
      expect(perdedores.has(fim.campeaoId as string)).toBe(false);
      expect(fim.semifinalistasDerrotados).toHaveLength(n >= 4 ? 2 : n === 3 ? 1 : 0);
    }
  });

  it("recusa resultado de luta ainda sem os dois lados e vencedor que não está na luta", () => {
    const chave = gerarEliminatoriaSimples(atletas(4), { semente: 1 });
    expect(() => resolverChave(chave, { [chave.finalId]: { vencedorId: "A1" } })).toThrow();
    const primeira = chave.lutas[0]!;
    expect(() => resolverChave(chave, { [primeira.id]: { vencedorId: "ZZ" } })).toThrow();
  });
});
