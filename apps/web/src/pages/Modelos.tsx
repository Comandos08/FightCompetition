import { useState } from "react";
import { useDados, type ModeloDeCategorias } from "@/data/store";
import { divisoes } from "@/data/seed";
import { SubNavOrg } from "@/pages/Gestao";
import { Campo, Faixa, Secao, Titulo } from "@/components/ui";
import { pesosIbjjf, regrasIbjjf } from "@engine";

const PADRAO: ModeloDeCategorias = { id: "ibjjf", nome: "IBJJF (padrão da plataforma)", baseadoEm: "Livro de Regras v6.1 e Tabela de Pesos Oficial", criadoEm: "", pesos: {} };
const fmt = (n: number) => n.toFixed(2).replace(".", ",");

/**
 * Modelos de categorias da organização: idades, faixas e pesos que se gravam uma vez e se reaproveitam em cada evento.
 * O modelo da IBJJF é o ponto de partida; a organização cria o seu a partir dele e ajusta os limites de peso.
 */
export function Modelos() {
  const d = useDados();
  const modelos = [PADRAO, ...d.estado.modelos];
  const [id, setId] = useState("ibjjf");
  const [sexo, setSexo] = useState<"M" | "F">("M");
  const [nome, setNome] = useState("");
  const modelo = modelos.find((m) => m.id === id) ?? PADRAO;
  const editavel = modelo.id !== "ibjjf";
  const idades = regrasIbjjf.CATEGORIAS_DE_IDADE;
  const classes = pesosIbjjf.CLASSES_DE_PESO;
  const limite = (idade: string, classe: string) => {
    const chave = `${idade}|${sexo}|${classe}`;
    if (modelo.pesos[chave] !== undefined) return { valor: modelo.pesos[chave]!, alterado: true };
    const l = pesosIbjjf.limitesDePeso(idade, sexo).find((x) => x.classe === classe);
    return l ? { valor: l.maximo, alterado: false } : null;
  };
  const criar = () => {
    const novo: ModeloDeCategorias = { id: `mod-${Date.now()}`, nome: nome.trim() || `Modelo da Liga Horizonte (${new Date().getFullYear()})`, baseadoEm: modelo.nome, criadoEm: new Date().toISOString(), pesos: { ...modelo.pesos } };
    d.despachar({ tipo: "modelo", modelo: novo }); setId(novo.id); setNome("");
  };
  const mudarPeso = (idade: string, classe: string, texto: string) => {
    const v = Number(texto.replace(",", "."));
    if (!(v > 0)) return;
    d.despachar({ tipo: "modelo", modelo: { ...modelo, pesos: { ...modelo.pesos, [`${idade}|${sexo}|${classe}`]: v } } });
  };
  return (
    <>
      <Titulo sobre="Organização" acoes={editavel ? <button className="botao-contorno" onClick={() => { d.despachar({ tipo: "modelo-remover", id: modelo.id }); setId("ibjjf"); }}>Excluir modelo</button> : undefined}>Modelos de categorias</Titulo>
      <SubNavOrg />
      <div className="grid gap-4 lg:grid-cols-[18rem_1fr]">
        <div className="space-y-4">
          <Secao titulo="Modelos da organização">
            <div className="space-y-1">
              {modelos.map((m) => (
                <button key={m.id} onClick={() => setId(m.id)} className={`block w-full rounded-md px-3 py-2 text-left text-sm ${m.id === id ? "bg-marinho text-white" : "hover:bg-papel"}`}>
                  <div className="font-medium">{m.nome}</div>
                  <div className={`text-xs ${m.id === id ? "text-white/70" : "text-tinta-3"}`}>{m.id === "ibjjf" ? "22 idades · 9 classes de peso" : `a partir de ${m.baseadoEm} · ${Object.keys(m.pesos).length} limites ajustados`}</div>
                </button>
              ))}
            </div>
          </Secao>
          <Secao titulo="Criar modelo a partir do selecionado">
            <Campo rotulo="Nome do modelo"><input id="modelo-nome" className="campo" placeholder="Ex.: Circuito Estadual 2027" value={nome} onChange={(e) => setNome(e.target.value)} /></Campo>
            <button id="modelo-criar" className="botao-primario mt-3 w-full" onClick={criar}>Criar e editar</button>
            <p className="mt-2 text-xs text-tinta-3">O modelo novo começa igual ao selecionado. Ao criar um evento, você escolhe qual modelo usar.</p>
          </Secao>
        </div>
        <Secao titulo={modelo.nome} acao={<div className="flex gap-1">{(["M", "F"] as const).map((s) => <button key={s} className={sexo === s ? "botao-primario !py-1 text-xs" : "botao-contorno !py-1 text-xs"} onClick={() => setSexo(s)}>{s === "M" ? "Masculino" : "Feminino"}</button>)}</div>}>
          <p className="mb-3 text-xs text-tinta-3">{editavel ? "Clique num limite para alterar. Valores alterados ficam marcados; a tabela da IBJJF continua intacta." : "Este é o padrão da plataforma e não se edita. Crie um modelo a partir dele para ajustar pesos, e no produto também faixas e tempos."} Peso máximo em kg, com quimono; crianças até 15 anos pelo quimono liso.</p>
          <div className="overflow-x-auto">
            <table className="tabela text-xs">
              <thead><tr><th>Idade</th><th>Luta</th><th>Faixas</th>{classes.map((c) => <th key={c}>{c}</th>)}</tr></thead>
              <tbody>
                {idades.map((i) => {
                  const div = divisoes.find((x) => x.nome === i.nome);
                  return (
                    <tr key={i.nome}>
                      <td className="whitespace-nowrap font-medium">{i.nome}<div className="font-normal text-tinta-3">{i.idadeExata !== undefined ? `${i.idadeExata} anos` : `${i.idadeMinima}+`}</div></td>
                      <td className="whitespace-nowrap">{i.minutos("Preta") === i.minutos("Branca") ? `${i.minutos("Branca")} min` : `${i.minutos("Branca")} a ${i.minutos("Preta")} min`}</td>
                      <td className="min-w-[14rem]"><div className="flex flex-wrap gap-1">{(div?.faixas ?? []).map((f) => <Faixa key={f} cor={f} />)}</div></td>
                      {classes.map((c) => {
                        const l = limite(i.nome, c);
                        if (!l) return <td key={c} className="text-tinta-3">·</td>;
                        if (l.valor === null) return <td key={c} className="whitespace-nowrap text-tinta-3">sem limite</td>;
                        return <td key={c} className={l.alterado ? "bg-ouro/20 font-semibold" : ""}>{editavel ? <input className="w-14 rounded border border-linha bg-transparent px-1 py-0.5 text-right tabular-nums" defaultValue={fmt(l.valor)} onBlur={(e) => mudarPeso(i.nome, c, e.target.value)} /> : <span className="tabular-nums">{fmt(l.valor)}</span>}</td>;
                      })}
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </Secao>
      </div>
    </>
  );
}
