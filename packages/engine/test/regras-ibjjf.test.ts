import { describe, expect, it } from "vitest";
import * as r from "../src/regras-ibjjf.js";

describe("categorias de idade e tempo de luta (Regulamento Geral, art. 1)", () => {
  it("a idade é o ano do campeonato menos o ano de nascimento", () => {
    expect(r.idadeNoAno(2026, 2016)).toBe(10);
  });
  it("até 17 anos há uma única categoria, a da idade exata", () => {
    expect(r.categoriasElegiveis(4).map((c) => c.nome)).toEqual(["Pré-Mirim I"]);
    expect(r.categoriasElegiveis(9).map((c) => c.nome)).toEqual(["Mirim III"]);
    expect(r.categoriasElegiveis(15).map((c) => c.nome)).toEqual(["Infanto-Juvenil III"]);
    expect(r.categoriasElegiveis(17).map((c) => c.nome)).toEqual(["Juvenil II"]);
    expect(r.categoriasElegiveis(3)).toEqual([]);
  });
  it("adulto e master só têm limite mínimo", () => {
    expect(r.categoriasElegiveis(18).map((c) => c.nome)).toEqual(["Adulto"]);
    expect(r.categoriasElegiveis(29).map((c) => c.nome)).toEqual(["Adulto"]);
    expect(r.categoriasElegiveis(30).map((c) => c.nome)).toEqual(["Adulto", "Master 1"]);
    expect(r.categoriasElegiveis(40).map((c) => c.nome)).toEqual(["Adulto", "Master 1", "Master 2"]);
    expect(r.categoriaPadrao(61)?.nome).toBe("Master 7");
    expect(r.categoriaPadrao(45)?.nome).toBe("Master 3");
  });
  it("tempos da tabela do art. 1.3", () => {
    expect(r.tempoDeLuta("Pré-Mirim II", "Branca")).toBe(2);
    expect(r.tempoDeLuta("Mirim I", "Cinza")).toBe(3);
    expect(r.tempoDeLuta("Infantil III", "Amarela")).toBe(4);
    expect(r.tempoDeLuta("Infanto-Juvenil I", "Verde")).toBe(4);
    expect(r.tempoDeLuta("Juvenil II", "Azul")).toBe(5);
    expect(["Branca", "Azul", "Roxa", "Marrom", "Preta"].map((f) => r.tempoDeLuta("Adulto", f))).toEqual([5, 6, 7, 8, 10]);
    expect(["Branca", "Azul", "Roxa", "Marrom", "Preta"].map((f) => r.tempoDeLuta("Master 1", f))).toEqual([5, 5, 6, 6, 6]);
    expect(r.tempoDeLuta("Master 4", "Preta")).toBe(5);
    expect(() => r.tempoDeLuta("Sênior", "Preta")).toThrow();
  });
  it("descanso mínimo do art. 1.4", () => {
    expect(r.descansoMinimo(10, false)).toBe(10);
    expect(r.descansoMinimo(10, true)).toBe(20);
  });
});

describe("placar, punições e combatividade (Livro de Regras)", () => {
  it("pontos do art. 2.5.2", () => {
    expect(r.PONTOS).toEqual({ montada: 4, montadaPelasCostas: 4, pegadaPelasCostas: 4, passagemDeGuarda: 3, queda: 2, raspagem: 2, joelhoNaBarriga: 2 });
  });
  it("sequência de punições do art. 7.2.1", () => {
    expect(r.efeitoDaPunicao(1, false)).toEqual({ vantagemAoOponente: 0, pontosAoOponente: 0, desclassifica: false });
    expect(r.efeitoDaPunicao(2, false).vantagemAoOponente).toBe(1);
    expect(r.efeitoDaPunicao(3, false).pontosAoOponente).toBe(2);
    expect(r.efeitoDaPunicao(4, false).desclassifica).toBe(true);
  });
  it("até 15 anos, 4ª e 5ª punições dão dois pontos e a 6ª desclassifica (art. 7.2.4)", () => {
    expect(r.efeitoDaPunicao(4, true)).toEqual({ vantagemAoOponente: 0, pontosAoOponente: 2, desclassifica: false });
    expect(r.efeitoDaPunicao(5, true).pontosAoOponente).toBe(2);
    expect(r.efeitoDaPunicao(6, true).desclassifica).toBe(true);
    expect(r.ehAte15Anos("Infanto-Juvenil III")).toBe(true);
    expect(r.ehAte15Anos("Juvenil I")).toBe(false);
    expect(r.ehAte15Anos("Adulto")).toBe(false);
  });
  it("vencedor pelo placar: pontos, depois vantagens, depois menos punições (art. 2.5)", () => {
    const p = (pontos: number, vantagens: number, punicoes: number) => ({ pontos, vantagens, punicoes });
    expect(r.vencedorPeloPlacar(p(4, 0, 3), p(2, 5, 0))).toBe(0);
    expect(r.vencedorPeloPlacar(p(2, 1, 0), p(2, 2, 0))).toBe(1);
    expect(r.vencedorPeloPlacar(p(2, 1, 2), p(2, 1, 1))).toBe(1);
    expect(r.vencedorPeloPlacar(p(0, 0, 0), p(0, 0, 0))).toBeNull();
  });
  it("combatividade: 20 segundos (art. 7.3.1)", () => {
    expect(r.COMBATIVIDADE_SEGUNDOS).toBe(20);
  });
});

describe("disputa por academias e inscrição (Regulamento Geral, art. 3 e 5)", () => {
  it("9, 3 e 1 pontos (art. 3.2)", () => {
    expect(r.PONTOS_POR_ACADEMIA).toEqual({ campeao: 9, vice: 3, terceiro: 1 });
  });
  it("categoria com um atleta, ou com dois da mesma academia, não pontua (art. 3.4 e 3.5)", () => {
    expect(r.categoriaContaParaAcademias(["X"])).toBe(false);
    expect(r.categoriaContaParaAcademias(["X", "X"])).toBe(false);
    expect(r.categoriaContaParaAcademias(["X", "Y"])).toBe(true);
    expect(r.categoriaContaParaAcademias(["X", "X", "X"])).toBe(true);
  });
  it("até dois atletas por academia na categoria (art. 5.2)", () => {
    expect(r.MAXIMO_DE_ATLETAS_POR_ACADEMIA_NA_CATEGORIA).toBe(2);
  });
});
