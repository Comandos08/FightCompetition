import { describe, expect, it } from "vitest";
import { pesosIbjjf as p, regrasIbjjf } from "../src/index.js";

describe("tabela de pesos da IBJJF", () => {
  it("toda categoria de idade do livro de regras tem tabela, nos dois sexos", () => {
    for (const c of regrasIbjjf.CATEGORIAS_DE_IDADE) for (const s of ["M", "F"] as const) expect(p.limitesDePeso(c.nome, s).length).toBeGreaterThanOrEqual(8);
  });
  it("os limites crescem da classe mais leve para a mais pesada e só a última é aberta", () => {
    for (const c of regrasIbjjf.CATEGORIAS_DE_IDADE) for (const s of ["M", "F"] as const) for (const q of ["liso", "trancado"] as const) {
      const l = p.limitesDePeso(c.nome, s, q);
      l.slice(0, -1).forEach((x, i) => { expect(x.maximo).not.toBeNull(); if (i) expect(x.maximo!).toBeGreaterThan(l[i - 1]!.maximo!); });
      expect(l[l.length - 1]!.maximo).toBeNull();
    }
  });
  it("adulto masculino: valores da folha", () => {
    expect(p.limitesDePeso("Adulto", "M").map((x) => x.maximo)).toEqual([57.5, 64, 70, 76, 82.3, 88.3, 94.3, 100.5, null]);
    expect(p.limitesDePeso("Master 3", "M")).toEqual(p.limitesDePeso("Adulto", "M"));
  });
  it("feminino adulto e juvenil terminam no Super-pesado, sem peso máximo", () => {
    expect(p.limitesDePeso("Adulto", "F").at(-1)).toEqual({ classe: "Super-pesado", maximo: null });
    expect(p.limitesDePeso("Juvenil I", "F").map((x) => x.maximo)).toEqual([44.3, 48.3, 52.5, 56.5, 60.5, 65, 69, null]);
    expect(p.limitesDePeso("Juvenil II", "M").at(-1)!.classe).toBe("Pesadíssimo");
  });
  it("infantil: o quimono trançado tem limite maior que o liso", () => {
    expect(p.limitesDePeso("Mirim II", "M")[3]).toEqual({ classe: "Leve", maximo: 29.4 });
    expect(p.limitesDePeso("Mirim II", "F", "trancado")[3]!.maximo).toBe(30.2);
    expect(p.limitesDePeso("Infanto-Juvenil III", "M")[7]!.maximo).toBe(72.2);
  });
  it("acha a classe pelo peso e confere a pesagem", () => {
    expect(p.classeDoPeso("Adulto", "M", 76)).toBe("Leve");
    expect(p.classeDoPeso("Adulto", "M", 76.1)).toBe("Médio");
    expect(p.classeDoPeso("Adulto", "F", 90)).toBe("Super-pesado");
    expect(p.dentroDoPeso("Adulto", "M", "Leve", 76)).toBe(true);
    expect(p.dentroDoPeso("Adulto", "M", "Leve", 76.05)).toBe(false);
    expect(p.dentroDoPeso("Adulto", "M", "Pesadíssimo", 140)).toBe(true);
    expect(() => p.dentroDoPeso("Adulto", "F", "Pesadíssimo", 80)).toThrow();
  });
});
