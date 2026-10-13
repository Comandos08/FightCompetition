import type { ReactNode } from "react";
import { Link, useParams } from "react-router-dom";
import { useDados } from "@/data/store";
import { EVENTO_ID, eventos } from "@/data/seed";
import { TATAME_DO_MESARIO } from "@/data/sessao";
import { Simbolo, Vazio } from "@/components/ui";
import { chaveDoResultado, hhmm, horarioDaLuta, nomeRodada } from "@/lib/competicao";
import { quadroDeMedalhas } from "@/lib/resultados";

const mmss = (s: number) => `${String(Math.floor(s / 60)).padStart(2, "0")}:${String(s % 60).padStart(2, "0")}`;
const dataHora = (iso: string) => new Date(iso).toLocaleString("pt-BR", { dateStyle: "short", timeStyle: "short" });

/** Folha de documento: na tela parece papel; na impressão, só ela sai. */
function Documento({ titulo, voltar, children }: { titulo: string; voltar: string; children: ReactNode }) {
  const ev = eventos.find((e) => e.id === EVENTO_ID)!;
  return (
    <>
      <div className="nao-imprimir mb-4 flex flex-wrap items-center justify-between gap-2">
        <Link to={voltar} className="text-sm text-marinho hover:underline">← Voltar</Link>
        <button className="botao-primario" onClick={() => window.print()}>Imprimir ou salvar em PDF</button>
      </div>
      <div className="documento cartao mx-auto max-w-4xl p-6 sm:p-10">
        <div className="mb-6 flex flex-wrap items-start justify-between gap-4 border-b-2 border-tinta pb-4">
          <div>
            <div className="rotulo">{titulo}</div>
            <div className="text-2xl font-semibold">{ev.nome}</div>
            <div className="text-sm text-tinta-2">{ev.organizador} · {ev.local}, {ev.cidade} · {ev.datas}</div>
          </div>
          <div className="flex items-center gap-2 text-marinho"><Simbolo className="h-6 w-auto" /><span className="text-sm font-semibold uppercase tracking-[0.14em]">Arena</span></div>
        </div>
        {children}
      </div>
    </>
  );
}

function Assinaturas({ quem }: { quem: string[] }) {
  return (
    <div className="mt-12 grid gap-8" style={{ gridTemplateColumns: `repeat(${quem.length}, minmax(0, 1fr))` }}>
      {quem.map((q) => <div key={q} className="border-t border-tinta pt-1 text-center text-xs text-tinta-2">{q}</div>)}
    </div>
  );
}

const Campo = ({ rotulo, children }: { rotulo: string; children: ReactNode }) => <div><div className="rotulo">{rotulo}</div><div className="font-medium">{children}</div></div>;

/** Súmula da luta: quem lutou, o que a mesa marcou, o resultado e as assinaturas. */
export function SumulaDaLuta() {
  const d = useDados();
  const { catId, lutaId } = useParams();
  const cat = d.categoriaPorId.get(decodeURIComponent(catId ?? ""));
  const luta = cat && d.resolvidas.get(cat.id)?.lutas.find((l) => l.id === lutaId);
  const bloco = cat && d.blocos.find((b) => b.categoria.id === cat.id);
  if (!cat || !luta || !bloco) return <Vazio>Luta não encontrada.</Vazio>;
  const chave = chaveDoResultado(cat.id, luta.id);
  const s = d.estado.sumulas[chave];
  const tatame = s?.tatame ?? d.estado.remanejadas[chave]?.tatame ?? bloco.tatame;
  if (d.estado.sessao === "mesario" && tatame !== TATAME_DO_MESARIO) return <Vazio>O mesário vê só as súmulas do Tatame {TATAME_DO_MESARIO}.</Vazio>;
  if (!luta.vencedorId) return <Vazio>Esta luta ainda não foi encerrada. A súmula é gerada quando a mesa confirma o resultado.</Vazio>;
  const lados = [luta.a, luta.b] as const;
  const numero = `${tatame}-${bloco.chave.lutas.findIndex((l) => l.id === luta.id) + 1}`;
  const rem = d.estado.remanejadas[chave];
  return (
    <Documento titulo={`Súmula da luta ${numero}`} voltar="/app/mesa">
      <div className="grid grid-cols-2 gap-4 text-sm sm:grid-cols-4">
        <Campo rotulo="Categoria">{cat.modalidade} · {cat.nome}</Campo>
        <Campo rotulo="Fase">{nomeRodada(luta.rodada, bloco.chave.totalRodadas)}</Campo>
        <Campo rotulo="Tatame">Tatame {tatame}{rem ? ` (programada no ${rem.origem})` : ""}</Campo>
        <Campo rotulo="Horário">{s ? `encerrada em ${dataHora(s.encerradaEm)}` : `previsto ${hhmm(horarioDaLuta(bloco, luta.id))}`}</Campo>
      </div>
      <table className="tabela mt-6">
        <thead><tr><th>Atleta</th><th>Equipe</th><th>Pontos</th><th>Vantagens</th><th>Punições</th><th>Resultado</th></tr></thead>
        <tbody>
          {lados.map((id, k) => (
            <tr key={k}>
              <td className="font-medium">{d.nomeDe(id)}</td><td>{d.equipeDe(id)}</td>
              <td>{s ? s.placar[k]!.pontos : "·"}</td><td>{s ? s.placar[k]!.vantagens : "·"}</td><td>{s ? s.placar[k]!.punicoes : "·"}</td>
              <td className="font-semibold">{luta.vencedorId === id ? "Vencedor" : ""}</td>
            </tr>
          ))}
        </tbody>
      </table>
      <div className="mt-4 grid grid-cols-2 gap-4 text-sm sm:grid-cols-4">
        <Campo rotulo="Vencedor">{d.nomeDe(luta.vencedorId)}</Campo>
        <Campo rotulo="Método">{s?.metodo ?? luta.metodo ?? "não informado"}</Campo>
        <Campo rotulo="Tempo de luta">{s ? `${mmss(s.duracao)} de ${mmss(s.regulamentar)}` : `regulamentar de ${cat.minutos} min`}</Campo>
        <Campo rotulo="Mesário">{s?.mesario ?? "não registrado"}</Campo>
      </div>
      <h3 className="mb-2 mt-6 text-sm font-semibold">Lances marcados pela mesa</h3>
      {s?.lances.length ? (
        <table className="tabela"><thead><tr><th className="w-24">Tempo</th><th>Atleta</th><th>Marcação</th></tr></thead>
          <tbody>{s.lances.map((l, k) => <tr key={k}><td className="font-mono">{mmss(l.t)}</td><td>{d.nomeDe(lados[l.lado])}</td><td>{l.texto}</td></tr>)}</tbody></table>
      ) : <p className="text-sm text-tinta-3">{s ? "Nenhuma marcação de pontos, vantagem ou punição nesta luta." : "Resultado lançado sem o placar da mesa; não há lances registrados."}</p>}
      {rem && <p className="mt-4 text-sm"><b>Ocorrência:</b> luta trazida do Tatame {rem.origem} por {rem.quem}. Motivo: {rem.motivo}.</p>}
      <div className="mt-6"><div className="rotulo">Observações do árbitro</div><div className="mt-1 h-16 rounded border border-linha" /></div>
      <Assinaturas quem={["Árbitro central", "Mesário", "Coordenação"]} />
    </Documento>
  );
}

/** Súmula do campeonato: o documento de fechamento, com números, quadro de medalhas, pódios, lutas e ocorrências. */
export function SumulaDoCampeonato() {
  const d = useDados();
  const { id } = useParams();
  if (id !== EVENTO_ID) return <Vazio>A súmula fica disponível para o evento em andamento.</Vazio>;
  const quadro = quadroDeMedalhas(d);
  const comChave = d.categorias.filter((c) => d.resolvidas.has(c.id));
  const concluidas = comChave.filter((c) => d.resolvidas.get(c.id)!.concluida);
  const lutas = comChave.flatMap((c) => d.resolvidas.get(c.id)!.lutas.map((l) => ({ c, l })));
  const feitas = lutas.filter((x) => x.l.vencedorId);
  const porMetodo = new Map<string, number>();
  for (const x of feitas) { const m = (d.estado.sumulas[chaveDoResultado(x.c.id, x.l.id)]?.metodo ?? x.l.metodo ?? "não informado").replace(/ \d+x\d+$/, ""); porMetodo.set(m, (porMetodo.get(m) ?? 0) + 1); }
  const remanejos = Object.entries(d.estado.remanejadas);
  const atletas = new Set(d.inscricoes.map((i) => i.atletaId)).size;
  const equipes = new Set(d.inscricoes.map((i) => d.equipeDe(i.id))).size;
  const sozinhos = d.categorias.length - comChave.length;
  const numeros: [string, string | number][] = [["Atletas", atletas], ["Inscrições", d.inscricoes.length], ["Equipes", equipes], ["Categorias com chave", comChave.length], ["Categorias encerradas", concluidas.length], ["Lutas realizadas", `${feitas.length} de ${lutas.length}`]];
  return (
    <Documento titulo="Súmula do campeonato" voltar={`/app/organizacao/eventos/${EVENTO_ID}/resultados`}>
      {feitas.length < lutas.length && <p className="nao-imprimir mb-4 rounded-md bg-ouro/15 px-3 py-2 text-sm">Documento parcial: ainda há {lutas.length - feitas.length} lutas sem resultado. A versão final sai quando todas as categorias forem encerradas.</p>}
      <div className="grid grid-cols-2 gap-4 text-sm sm:grid-cols-3">{numeros.map(([r, v]) => <Campo key={r} rotulo={r}>{v}</Campo>)}</div>
      {sozinhos > 0 && <p className="mt-3 text-xs text-tinta-3">{sozinhos} categorias ficaram com um atleta só e não tiveram luta.</p>}

      <h3 className="mb-2 mt-8 text-sm font-semibold">Quadro de medalhas por equipe</h3>
      {quadro.length ? (
        <table className="tabela"><thead><tr><th className="w-10" /><th>Equipe</th><th>Ouro</th><th>Prata</th><th>Bronze</th><th>Pontos</th></tr></thead>
          <tbody>{quadro.map((l, k) => <tr key={l.equipe}><td className="font-semibold">{k + 1}º</td><td className="font-medium">{l.equipe}</td><td>{l.ouro}</td><td>{l.prata}</td><td>{l.bronze}</td><td className="font-semibold">{l.pontos}</td></tr>)}</tbody></table>
      ) : <p className="text-sm text-tinta-3">Nenhuma categoria encerrada ainda.</p>}
      <p className="mt-2 text-xs text-tinta-3">Regulamento Geral da IBJJF, art. 3: 9, 3 e 1 pontos; categoria com um atleta, ou com dois da mesma academia, não pontua.</p>

      <h3 className="mb-2 mt-8 text-sm font-semibold">Lutas por método de vitória</h3>
      {porMetodo.size ? <div className="flex flex-wrap gap-x-6 gap-y-1 text-sm">{[...porMetodo].sort((a, b) => b[1] - a[1]).map(([m, n]) => <span key={m}><b>{n}</b> {m}</span>)}</div> : <p className="text-sm text-tinta-3">Sem lutas encerradas.</p>}

      <h3 className="mb-2 mt-8 text-sm font-semibold">Pódios e lutas por categoria</h3>
      {!concluidas.length && <p className="text-sm text-tinta-3">Os pódios entram conforme as categorias terminam.</p>}
      {concluidas.map((c) => {
        const r = d.resolvidas.get(c.id)!; const total = d.chaves.get(c.id)!.totalRodadas;
        return (
          <div key={c.id} className="mb-4 break-inside-avoid rounded-md border border-linha p-3 text-sm">
            <div className="font-semibold">{c.modalidade} · {c.nome}</div>
            <div className="mt-1 grid gap-x-6 sm:grid-cols-2">
              {[["1º", r.campeaoId], ["2º", r.viceId], ...r.semifinalistasDerrotados.map((x) => ["3º", x] as const)].map(([p, x], k) => <div key={k}><b className="inline-block w-7">{p}</b>{d.nomeDe(x)} <span className="text-tinta-3">{d.equipeDe(x)}</span></div>)}
            </div>
            <div className="mt-2 space-y-0.5 text-xs text-tinta-2">
              {r.lutas.filter((l) => l.vencedorId).map((l) => <div key={l.id}>{nomeRodada(l.rodada, total)}: <b>{d.nomeDe(l.vencedorId)}</b> venceu {d.nomeDe(l.vencedorId === l.a ? l.b : l.a)} · {l.metodo ?? "método não informado"} <Link className="nao-imprimir text-marinho hover:underline" to={`/app/mesa/sumula/${encodeURIComponent(c.id)}/${l.id}`}>súmula</Link></div>)}
            </div>
          </div>
        );
      })}

      <h3 className="mb-2 mt-8 text-sm font-semibold">Ocorrências</h3>
      {remanejos.length ? <ul className="list-disc space-y-1 pl-5 text-sm">{remanejos.map(([k, r]) => <li key={k}>Luta levada do Tatame {r.origem} para o Tatame {r.tatame} por {r.quem}. Motivo: {r.motivo}.</li>)}</ul> : <p className="text-sm text-tinta-3">Nenhuma luta mudou de tatame.</p>}
      <div className="mt-4"><div className="rotulo">Observações da organização</div><div className="mt-1 h-20 rounded border border-linha" /></div>
      <Assinaturas quem={["Diretor técnico", "Organização"]} />
    </Documento>
  );
}
