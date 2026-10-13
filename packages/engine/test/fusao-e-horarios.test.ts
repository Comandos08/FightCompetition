import { describe, expect, it } from "vitest";
import { gerarChaveDeTres, gerarEliminatoriaSimples, horariosDaChave, opcoesDeFusao, planejarFusoes, regrasIbjjf, type CategoriaParaFusao } from "../src/index.js";

const cat = (id: string, peso: number, atletas: number, extra: Partial<CategoriaParaFusao> = {}): CategoriaParaFusao =>
  ({ id, grupo: "Gi|M|Branca", idade: 14, blocoDeIdade: "adulto", ficaAMaisVelha: false, peso, atletas, ...extra });

describe("fusão de categorias", () => {
  it("sugere o peso mais próximo e a categoria que fica é a mais pesada", () => {
    const todas = [cat("leve", 3, 1), cat("medio", 4, 5), cat("pena", 2, 2), cat("pesado", 6, 9)];
    const op = opcoesDeFusao(todas[0]!, todas);
    expect(op.map((o) => [o.de, o.para])).toEqual([["leve", "medio"], ["pena", "leve"]]);
    expect(op[0]).toMatchObject({ motivo: "peso", distancia: 1, total: 6 });
  });
  it("não cruza sexo, modalidade nem faixa", () => {
    const todas = [cat("a", 3, 1), cat("b", 4, 4, { grupo: "Gi|F|Branca" }), cat("c", 4, 4, { grupo: "Gi|M|Azul" })];
    expect(opcoesDeFusao(todas[0]!, todas)).toEqual([]);
  });
  it("na idade, criança sobe para a mais velha e master desce para a mais nova, sem sair do bloco", () => {
    const kids = { blocoDeIdade: "infantil", ficaAMaisVelha: true };
    const todas = [cat("mirim1", 3, 1, { idade: 3, ...kids }), cat("mirim2", 3, 2, { idade: 4, ...kids }), cat("juvenil", 3, 4, { idade: 5, blocoDeIdade: "juvenil", ficaAMaisVelha: true })];
    expect(opcoesDeFusao(todas[0]!, todas)).toEqual([{ de: "mirim1", para: "mirim2", motivo: "idade", distancia: 1, total: 3 }]);
    const masters = [cat("master2", 3, 1, { idade: 16 }), cat("master1", 3, 3, { idade: 15 })];
    expect(opcoesDeFusao(masters[0]!, masters)[0]).toMatchObject({ de: "master2", para: "master1" });
  });
  it("o plano resolve duas categorias sozinhas vizinhas com uma fusão só, sem troca de lugar", () => {
    const plano = planejarFusoes([cat("leve", 3, 1), cat("medio", 4, 1), cat("pesado", 6, 1)]);
    expect(plano).toEqual([{ de: "leve", para: "medio", motivo: "peso", distancia: 1, total: 2 }]);
  });
  it("o plano não usa categoria que já foi esvaziada", () => {
    const plano = planejarFusoes([cat("a-pena", 2, 1), cat("b-leve", 3, 1), cat("c-medio", 4, 1)]);
    expect(plano).toHaveLength(2);
    expect(plano[1]).toMatchObject({ de: "b-leve", para: "c-medio", total: 3 });
  });
});

describe("horários com descanso (Regulamento Geral, art. 1.4)", () => {
  const o = { minutos: 5, transicao: 3, descanso: (f: boolean) => regrasIbjjf.descansoMinimo(5, f) };
  const p = (n: number) => Array.from({ length: n }, (_, i) => ({ id: `p${i}` }));
  it("com quatro atletas, a final espera o dobro do tempo de luta depois da segunda semifinal", () => {
    const chave = gerarEliminatoriaSimples(p(4), { semente: 1 });
    const { inicio, duracao } = horariosDaChave(chave, o);
    const [s1, s2] = chave.lutas.filter((l) => l.id !== chave.finalId);
    expect(inicio[s1!.id]).toBe(0);
    expect(inicio[s2!.id]).toBe(8);
    expect(inicio[chave.finalId]).toBe(8 + 5 + 10);
    expect(duracao).toBe(23 + 5 + 3);
  });
  it("na chave de três, quem perde a primeira descansa antes da segunda", () => {
    const chave = gerarChaveDeTres(p(3), { semente: 1 });
    const { inicio } = horariosDaChave(chave, o);
    expect(inicio.L1).toBe(0);
    expect(inicio.L2).toBe(10);
    expect(inicio.L3).toBe(10 + 5 + 10);
  });
  it("em chave grande nenhum atleta luta antes do descanso", () => {
    const chave = gerarEliminatoriaSimples(p(13), { semente: 7 });
    const { inicio } = horariosDaChave(chave, o);
    for (const l of chave.lutas) for (const lado of [l.ladoA, l.ladoB]) if (lado.tipo !== "participante")
      expect(inicio[l.id]!).toBeGreaterThanOrEqual(inicio[lado.lutaId]! + 5 + (l.id === chave.finalId ? 10 : 5));
  });
});
