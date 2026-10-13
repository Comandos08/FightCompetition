import { describe, expect, it } from "vitest";
import { gerarChaveDeTres } from "../src/chave-de-tres.js";
import { resolverChave } from "../src/resolver.js";

const tres = [{ id: "A", equipe: "X" }, { id: "B", equipe: "Y" }, { id: "C", equipe: "Z" }];

describe("chave de três (IBJJF, Regulamento Geral, art. 2.3.1)", () => {
  it("exige exatamente três participantes", () => {
    expect(() => gerarChaveDeTres(tres.slice(0, 2), { semente: 1 })).toThrow();
    expect(() => gerarChaveDeTres([...tres, { id: "D" }], { semente: 1 })).toThrow();
  });

  it("é determinística e cada atleta aparece uma vez", () => {
    const c1 = gerarChaveDeTres(tres, { semente: 7 });
    expect(gerarChaveDeTres(tres, { semente: 7 })).toEqual(c1);
    expect([...c1.ordem].sort()).toEqual(["A", "B", "C"]);
    expect(c1.lutas).toHaveLength(3);
    expect(c1.formato).toBe("chave-de-tres");
  });

  it("sorteios diferentes mudam quem faz a primeira luta", () => {
    const primeiros = new Set(Array.from({ length: 40 }, (_, s) => gerarChaveDeTres(tres, { semente: s }).ordem[2]));
    expect(primeiros.size).toBe(3);
  });

  it("o perdedor da primeira luta enfrenta o terceiro atleta, e o vencedor espera na final", () => {
    const c = gerarChaveDeTres(tres, { semente: 3 });
    const [p1, p2, p3] = c.ordem as [string, string, string];
    const r = resolverChave(c, { L1: { vencedorId: p1 } });
    const l2 = r.lutas.find((l) => l.id === "L2")!;
    expect([l2.a, l2.b]).toEqual([p2, p3]);
    expect(l2.pronta).toBe(true);
    expect(r.lutas.find((l) => l.id === "L3")!.a).toBe(p1);
  });

  it("quem perdeu a primeira luta pode voltar e ser campeão", () => {
    const c = gerarChaveDeTres(tres, { semente: 3 });
    const [p1, p2, p3] = c.ordem as [string, string, string];
    const r = resolverChave(c, { L1: { vencedorId: p1 }, L2: { vencedorId: p2 }, L3: { vencedorId: p2 } });
    expect(r.campeaoId).toBe(p2);
    expect(r.viceId).toBe(p1);
    expect(r.semifinalistasDerrotados).toEqual([p3]);
    expect(r.concluida).toBe(true);
  });

  it("há um único terceiro colocado: quem perde a segunda luta", () => {
    const c = gerarChaveDeTres(tres, { semente: 3 });
    const [p1, p2, p3] = c.ordem as [string, string, string];
    const r = resolverChave(c, { L1: { vencedorId: p1 }, L2: { vencedorId: p3 }, L3: { vencedorId: p1 } });
    expect(r.campeaoId).toBe(p1);
    expect(r.viceId).toBe(p3);
    expect(r.semifinalistasDerrotados).toEqual([p2]);
  });

  it("art. 2.3.4: quem não comparece à primeira luta não faz a segunda", () => {
    const c = gerarChaveDeTres(tres, { semente: 3 });
    const [p1, , p3] = c.ordem as [string, string, string];
    const r = resolverChave(c, { L1: { vencedorId: p1, metodo: "W.O.", perdedorSemDireitoASegundaLuta: true } });
    const l2 = r.lutas.find((l) => l.id === "L2")!;
    expect(l2.vencedorId).toBe(p3);
    expect(l2.pronta).toBe(false);
    const final = r.lutas.find((l) => l.id === "L3")!;
    expect([final.a, final.b]).toEqual([p1, p3]);
    expect(final.pronta).toBe(true);
    const fim = resolverChave(c, { L1: { vencedorId: p1, perdedorSemDireitoASegundaLuta: true }, L3: { vencedorId: p3 } });
    expect(fim.campeaoId).toBe(p3);
    expect(fim.semifinalistasDerrotados).toEqual([]);
  });

  it("recusa resultado da final antes de as duas primeiras lutas terminarem", () => {
    const c = gerarChaveDeTres(tres, { semente: 3 });
    expect(() => resolverChave(c, { L1: { vencedorId: c.ordem[0]! }, L3: { vencedorId: c.ordem[0]! } })).toThrow();
  });
});
