import { Fragment, useMemo, useState } from "react";
import { Link, useParams } from "react-router-dom";
import { useDados } from "@/data/store";
import { ANO_EVENTO, EVENTO_ID, divisaoPorIdade } from "@/data/seed";
import { Avatar, Faixa, Secao, Selo, Vazio } from "@/components/ui";
import { FINALIZACOES, METODOS, ORGS_COM_RANKING, fichaDoAtleta, gruposDoRanking, posicoesDoAtleta, rankingDeAtletas, rankingDeEquipes, type FichaAtleta } from "@/lib/ranking";
import type { Atleta } from "@/data/seed";
import { lutasDoAtleta } from "@/lib/resultados";
import { nomeRodada } from "@/lib/competicao";

const TEMPORADA = "Temporada 2025 · 2026";

const Tendencia = ({ t }: { t: -1 | 0 | 1 }) => t === 1 ? <span className="text-tatame" title="Subiu">▲</span> : t === -1 ? <span className="text-perigo" title="Caiu">▼</span> : <span className="text-tinta-3">·</span>;

function Emblema({ nome, className = "h-10 w-10 text-sm" }: { nome: string; className?: string }) {
  let h = 0; for (const c of nome) h = (h * 31 + c.charCodeAt(0)) >>> 0;
  const cores = ["#1A447D", "#1F6B4A", "#8F5303", "#5B3A8C", "#8C2F2F", "#17606B", "#22262B"];
  return <span className={`grid shrink-0 place-items-center rounded-md font-bold text-white ${className}`} style={{ background: cores[h % cores.length] }}>{nome.split(" ").filter((p) => p.length > 2).map((p) => p[0]).slice(0, 2).join("")}</span>;
}

function LinhasRanking({ fichas, inicio = 0 }: { fichas: FichaAtleta[]; inicio?: number }) {
  return (
    <table className="tabela">
      <thead><tr><th className="w-10">#</th><th>Atleta</th><th>Pontos</th><th>Cartel</th><th className="hidden sm:table-cell">Faixa</th></tr></thead>
      <tbody>
        {fichas.map((f, k) => (
          <tr key={f.atleta.id}>
            <td className="font-semibold">{inicio + k + 1}</td>
            <td><Link to={`/atletas/${f.atleta.id}`} className="flex items-center gap-3"><Avatar atletaId={f.atleta.id} nome={f.atleta.nome} className="h-11 w-11 shrink-0 text-sm" />
              <span><span className="block font-semibold text-marinho hover:underline">{f.atleta.nome}</span><span className="block text-xs text-tinta-3">{f.atleta.equipe}</span></span></Link></td>
            <td className="whitespace-nowrap font-semibold"><Tendencia t={f.tendencia} /> {f.pontos.toLocaleString("pt-BR")}</td>
            <td className="whitespace-nowrap text-sm"><b>{f.vitorias}</b>V <span className="text-linha">|</span> <b>{f.derrotas}</b>D</td>
            <td className="hidden sm:table-cell"><Faixa cor={f.atleta.faixa} /></td>
          </tr>
        ))}
      </tbody>
    </table>
  );
}

export function SeletorOrg({ org, aoMudar }: { org: string; aoMudar: (o: string) => void }) {
  return (
    <div className="flex flex-wrap gap-2">
      {ORGS_COM_RANKING.map((o) => (
        <button key={o} onClick={() => aoMudar(o)} className={`flex items-center gap-2 rounded-md border px-3 py-2 text-sm font-medium transition ${org === o ? "border-marinho bg-marinho text-white" : "border-linha bg-white text-tinta-2 hover:border-marinho hover:text-marinho"}`}>
          <Emblema nome={o} className="h-6 w-6 text-[10px]" />{o}
        </button>
      ))}
    </div>
  );
}

function AbasGrupo({ grupos, ativo, aoMudar }: { grupos: string[]; ativo: string; aoMudar: (g: string) => void }) {
  return (
    <div className="mb-2 flex gap-1 overflow-x-auto border-b border-linha">
      {grupos.map((g) => <button key={g} onClick={() => aoMudar(g)} className={`whitespace-nowrap border-b-2 px-3 py-2.5 text-sm font-medium ${ativo === g ? "border-marinho text-marinho" : "border-transparent text-tinta-2 hover:text-marinho"}`}>{g}</button>)}
    </div>
  );
}

/** Bloco da página inicial: rankings de todas as organizações, com o mesmo destaque para cada uma. */
export function RankingDestaque() {
  const d = useDados();
  const [org, setOrg] = useState<string>(ORGS_COM_RANKING[0]);
  const fichas = useMemo(() => rankingDeAtletas(d, org), [d, org]);
  const grupos = gruposDoRanking(fichas).slice(0, 4);
  const [grupo, setGrupo] = useState("");
  const ativo = grupos.includes(grupo) ? grupo : grupos[0] ?? "";
  return (
    <>
      <section className="cartao mt-12 p-6">
        <div className="mb-4 flex flex-wrap items-end justify-between gap-3">
          <div><div className="rotulo">{TEMPORADA}</div><h2 className="text-2xl font-semibold">Rankings</h2></div>
          <Link to="/rankings" className="font-medium text-marinho hover:underline">Todos os rankings ›</Link>
        </div>
        <div className="mb-4"><SeletorOrg org={org} aoMudar={setOrg} /></div>
        {!grupos.length ? <Vazio>Este ranking ainda não tem atletas pontuados.</Vazio> : <><AbasGrupo grupos={grupos} ativo={ativo} aoMudar={setGrupo} /><LinhasRanking fichas={fichas.filter((f) => f.grupo === ativo).slice(0, 5)} /></>}
      </section>
      <section className="relative mt-6 overflow-hidden rounded-lg bg-[#15191E] px-6 py-9 text-white sm:px-10">
        <div className="absolute -right-10 -top-20 h-72 w-72 rounded-full border-[30px] border-white/5" /><div className="absolute right-24 -bottom-24 h-72 w-72 rounded-full border-[30px] border-ouro/20" />
        <div className="relative max-w-xl">
          <h2 className="text-2xl font-semibold">Seja um competidor</h2>
          <p className="mt-2 text-white/75">Crie o seu perfil de atleta, guarde o histórico de todas as suas lutas em um lugar só e apareça nos rankings das organizações em que competir.</p>
          <Link to="/cadastro" className="mt-5 inline-flex rounded-md bg-white px-4 py-2.5 text-sm font-medium text-tinta">Criar meu perfil de atleta</Link>
        </div>
      </section>
    </>
  );
}

export function Rankings() {
  const d = useDados();
  const [aba, setAba] = useState<"atletas" | "equipes">("atletas");
  const [busca, setBusca] = useState("");
  const [aberta, setAberta] = useState("");
  const [org, setOrg] = useState<string>(ORGS_COM_RANKING[0]);
  const fichas = useMemo(() => rankingDeAtletas(d, org), [d, org]);
  const equipes = useMemo(() => rankingDeEquipes(d, org).filter((e) => e.pontos > 0), [d, org]);
  const grupos = gruposDoRanking(fichas);
  const [grupo, setGrupo] = useState("");
  const ativo = grupos.includes(grupo) ? grupo : grupos[0] ?? "";
  const doGrupo = fichas.filter((f) => f.grupo === ativo);
  const lista = doGrupo.map((f, k) => ({ f, k })).filter(({ f }) => `${f.atleta.nome} ${f.atleta.equipe}`.toLowerCase().includes(busca.toLowerCase()));
  return (
    <>
      <div className="rotulo">{TEMPORADA}</div>
      <h1 className="mb-2 text-3xl font-semibold">Rankings</h1>
      <p className="mb-4 max-w-3xl text-sm text-tinta-2">Cada federação, liga ou circuito mantém o próprio ranking, com a regra de pontos que escolher. Escolha a organização para ver o ranking dela. O histórico desta demonstração é fictício.</p>
      <div className="mb-5"><SeletorOrg org={org} aoMudar={setOrg} /></div>
      <div className="mb-5 flex flex-wrap items-center gap-3">
        <div className="flex rounded-md border border-linha bg-white p-1">
          {([["atletas", "Atletas"], ["equipes", "Equipes"]] as const).map(([id, nome]) => <button key={id} onClick={() => setAba(id)} className={`rounded px-4 py-1.5 text-sm font-medium ${aba === id ? "bg-marinho text-white" : "text-tinta-2 hover:text-marinho"}`}>{nome}</button>)}
        </div>
        <input id="rank-busca" className="campo max-w-xs" placeholder={aba === "atletas" ? "Buscar atleta ou equipe" : "Buscar equipe"} value={busca} onChange={(e) => setBusca(e.target.value)} />
      </div>

      {aba === "atletas" && (
        <div className="cartao p-5">
          <AbasGrupo grupos={grupos} ativo={ativo} aoMudar={setGrupo} />
          {!lista.length ? <Vazio>Nenhum atleta encontrado nesta categoria.</Vazio> : (
            <div className="max-h-[70vh] overflow-auto">
              <table className="tabela">
                <thead><tr><th className="w-10">#</th><th>Atleta</th><th>Pontos</th><th>Cartel</th><th className="hidden sm:table-cell">Títulos</th></tr></thead>
                <tbody>
                  {lista.slice(0, 60).map(({ f, k }) => (
                    <tr key={f.atleta.id}>
                      <td className="font-semibold">{k + 1}</td>
                      <td><Link to={`/atletas/${f.atleta.id}`} className="flex items-center gap-3"><Avatar atletaId={f.atleta.id} nome={f.atleta.nome} className="h-11 w-11 shrink-0 text-sm" />
                        <span><span className="block font-semibold text-marinho hover:underline">{f.atleta.nome}</span><span className="block text-xs text-tinta-3">{f.atleta.equipe}</span></span></Link></td>
                      <td className="whitespace-nowrap font-semibold"><Tendencia t={f.tendencia} /> {f.pontos.toLocaleString("pt-BR")}</td>
                      <td className="whitespace-nowrap text-sm"><b>{f.vitorias}</b>V <span className="text-linha">|</span> <b>{f.derrotas}</b>D</td>
                      <td className="hidden sm:table-cell">{f.conquistas.filter((c) => c.colocacao === 1).length}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      )}

      {aba === "equipes" && (
        <div className="cartao overflow-auto p-5">
          <table className="tabela">
            <thead><tr><th className="w-10">#</th><th>Equipe</th><th>Pontos</th><th>Medalhas</th><th>Atletas</th><th /></tr></thead>
            <tbody>
              {equipes.map((e, k) => ({ e, k })).filter(({ e }) => e.equipe.toLowerCase().includes(busca.toLowerCase())).map(({ e, k }) => (
                <Fragment key={e.equipe}>
                  <tr>
                    <td className="font-semibold">{k + 1}</td>
                    <td><Link to={`/equipes/${encodeURIComponent(e.equipe)}`} className="flex items-center gap-3"><Emblema nome={e.equipe} /><span className="font-semibold text-marinho hover:underline">{e.equipe}</span></Link></td>
                    <td className="font-semibold">{e.pontos.toLocaleString("pt-BR")}</td>
                    <td className="whitespace-nowrap text-sm">{e.ouro} ouro · {e.prata} prata · {e.bronze} bronze</td>
                    <td>{e.atletas}</td>
                    <td className="text-right"><button className="botao-contorno !py-1 text-xs" onClick={() => setAberta(aberta === e.equipe ? "" : e.equipe)}>{aberta === e.equipe ? "Fechar" : "De onde vêm os pontos"}</button></td>
                  </tr>
                  {aberta === e.equipe && (
                    <tr key={e.equipe + "-d"}><td /><td colSpan={5} className="!pt-0">
                      <div className="rounded-md bg-papel p-3">
                        {e.porEvento.sort((a, b) => b.pontos - a.pontos).map((p) => <div key={p.evento} className="flex justify-between gap-4 py-1 text-sm"><span>{p.evento}</span><span className="text-tinta-2">{p.medalhas} medalhas · <b className="text-tinta">{p.pontos} pts</b></span></div>)}
                      </div>
                    </td></tr>
                  )}
                </Fragment>
              ))}
            </tbody>
          </table>
        </div>
      )}
      <p className="mt-3 max-w-3xl text-xs text-tinta-3">Regra de exemplo: 9, 3 e 1 pontos por ouro, prata e bronze, multiplicados pelo peso do evento e pelo nível da faixa. Menores de idade não aparecem em rankings individuais nesta demonstração.</p>
    </>
  );
}

function Rosca({ partes, total, legenda }: { partes: { nome: string; valor: number; cor: string }[]; total: number; legenda: string }) {
  let acumulado = 0;
  const C = 2 * Math.PI * 40;
  return (
    <div className="flex flex-wrap items-center gap-5">
      <svg viewBox="0 0 100 100" className="h-32 w-32 shrink-0 -rotate-90" role="img" aria-label={`${total} ${legenda}`}>
        <circle cx="50" cy="50" r="40" fill="none" stroke="#EEF1F6" strokeWidth="12" />
        {total > 0 && partes.map((p) => { const tam = (p.valor / total) * C; const el = <circle key={p.nome} cx="50" cy="50" r="40" fill="none" stroke={p.cor} strokeWidth="12" strokeDasharray={`${Math.max(tam - 1.5, 0)} ${C}`} strokeDashoffset={-acumulado} />; acumulado += tam; return el; })}
        <g className="rotate-90" style={{ transformOrigin: "50px 50px" }}><text x="50" y="50" textAnchor="middle" className="fill-tinta text-[18px] font-semibold">{total}</text><text x="50" y="62" textAnchor="middle" className="fill-tinta-3 text-[7px]">{legenda}</text></g>
      </svg>
      <div className="min-w-[11rem] flex-1 space-y-1.5 text-sm">
        {partes.map((p) => <div key={p.nome} className="flex items-center gap-2"><span className="h-2.5 w-2.5 shrink-0 rounded-full" style={{ background: p.cor }} /><span className="flex-1">{p.nome}</span><span className="text-tinta-3">{total ? Math.round((p.valor / total) * 100) : 0}%</span><b className="w-6 text-right">{p.valor}</b></div>)}
      </div>
    </div>
  );
}

const CORES = ["#1A447D", "#FAAB19", "#6B3FA0", "#E58A2B", "#1F8A5B", "#9AA1A9"];

/** Desempenho esportivo de um atleta: cartel, lutas, finalizações e pontos por ranking. Usado no perfil público e na área logada. */
export function PainelDesempenho({ a }: { a: Atleta }) {
  const d = useDados();
  const f = fichaDoAtleta(d, a);
  const lutas = lutasDoAtleta(d, a.id);
  const maior = Math.max(...f.vitoriasPor, ...f.derrotasPor, 1);
  return (
    <div className="space-y-4">
      <Secao titulo="Cartel">
        <div className="grid gap-6 md:grid-cols-[220px_1fr]">
          <div className="rounded-md border border-linha p-4">
            <div className="rotulo">Lutas</div><div className="text-4xl font-semibold">{f.lutas}</div>
            <div className="mt-3 flex justify-between text-xs"><span className="text-tatame">{f.lutas ? Math.round((f.vitorias / f.lutas) * 100) : 0}% · {f.vitorias} vitórias</span><span className="text-perigo">{f.derrotas} derrotas</span></div>
            <div className="mt-1 flex h-1.5 overflow-hidden rounded-full bg-perigo"><div className="bg-tatame" style={{ width: `${f.lutas ? (f.vitorias / f.lutas) * 100 : 0}%` }} /></div>
          </div>
          <div className="grid grid-cols-6 gap-2">
            {METODOS.map((m, k) => (
              <div key={m} className="flex flex-col items-center">
                <div className="mb-1 h-8 text-center text-[10px] leading-tight text-tinta-3">{m}</div>
                <div className="flex h-24 items-end gap-1">
                  <div className="flex w-4 flex-col items-center justify-end"><span className="text-[10px] font-semibold">{f.vitoriasPor[k]}</span><div className="w-full rounded-t bg-tatame" style={{ height: `${(f.vitoriasPor[k]! / maior) * 72}px` }} /></div>
                  <div className="flex w-4 flex-col items-center justify-end"><span className="text-[10px] font-semibold">{f.derrotasPor[k]}</span><div className="w-full rounded-t bg-perigo" style={{ height: `${(f.derrotasPor[k]! / maior) * 72}px` }} /></div>
                </div>
              </div>
            ))}
          </div>
        </div>
        <div className="mt-3 flex gap-4 text-xs text-tinta-3"><span><span className="mr-1 inline-block h-2 w-2 rounded-sm bg-tatame" />vitórias</span><span><span className="mr-1 inline-block h-2 w-2 rounded-sm bg-perigo" />derrotas</span></div>
      </Secao>

      <div className="grid gap-4 xl:grid-cols-2">
        <Secao titulo="Lutas neste evento" acao={<Link to={`/eventos/${EVENTO_ID}`} className="text-sm font-medium text-marinho hover:underline">Ver evento ›</Link>}>
          {!lutas.length ? <Vazio>Nenhuma luta definida ainda.</Vazio> : (
            <table className="tabela">
              <thead><tr><th>Oponente</th><th>Resultado</th><th>Fase</th></tr></thead>
              <tbody>{lutas.map((l, k) => (
                <tr key={k}><td>{l.oponente ?? <span className="italic text-tinta-3">a definir</span>}<div className="text-[11px] text-tinta-3">{l.categoria}</div></td>
                  <td>{l.venceu === undefined ? <Selo>a realizar</Selo> : l.venceu ? <Selo tom="ok">V · {l.metodo}</Selo> : <Selo tom="acao">D · {l.metodo}</Selo>}</td><td className="whitespace-nowrap text-sm">{nomeRodada(l.rodada, l.total)}</td></tr>
              ))}</tbody>
            </table>
          )}
        </Secao>
        <Secao titulo="Vitórias por finalização">
          <Rosca total={f.vitoriasPor[1]!} legenda="finalizações" partes={FINALIZACOES.map((nome, k) => ({ nome, valor: f.finalizacoes[k]!, cor: CORES[k]! }))} />
        </Secao>
      </div>

      <Secao titulo="Pódios e pontos por ranking">
        {!f.conquistas.length ? <Vazio>Ainda sem pódios nesta temporada.</Vazio> : (
          <table className="tabela">
            <thead><tr><th>Evento</th><th>Ranking</th><th>Colocação</th><th>Cálculo</th><th>Pontos</th></tr></thead>
            <tbody>
              {f.conquistas.map((c, k) => <tr key={k}><td className="font-medium">{c.evento}</td><td className="text-sm text-tinta-2">{c.org}</td><td>{c.colocacao}º lugar ({["ouro", "prata", "bronze"][c.colocacao - 1]})</td><td className="text-xs text-tinta-3">{c.conta}</td><td className="font-semibold">{c.pontos}</td></tr>)}
            </tbody>
          </table>
        )}
        <p className="mt-3 text-xs text-tinta-3">Cada pódio pontua só no ranking da organização que realizou o evento. Histórico gerado para demonstração; cálculo ilustrativo: pontos da colocação × peso do evento × nível da faixa.</p>
      </Secao>
    </div>
  );
}

export function PosicoesNosRankings({ a }: { a: Atleta }) {
  const d = useDados();
  const posicoes = useMemo(() => posicoesDoAtleta(d, a), [d, a]);
  if (!posicoes.length) return <p className="text-sm text-tinta-3">Ainda não pontua em nenhum ranking.</p>;
  return <>{posicoes.map((p) => (
    <div key={p.org} className="flex items-center justify-between gap-3 border-b border-linha/70 py-2.5 text-sm last:border-0">
      <span><span className="block font-medium">{p.org}</span><span className="block text-xs text-tinta-3">{p.grupo} · {p.pontos} pts</span></span><span className="text-xl font-semibold text-marinho">#{p.posicao}</span>
    </div>
  ))}</>;
}

/** Perfil público do atleta: só dados esportivos. Menores podem ser reservados pelo organizador. */
export function PerfilAtleta() {
  const { id } = useParams();
  const d = useDados();
  const a = d.atletas.get(id ?? "");
  if (!a) return <Vazio>Atleta não encontrado.</Vazio>;
  if (a.menor && d.estado.config.ocultarMenores) return <Vazio>O perfil de atletas menores de idade não é público neste evento.</Vazio>;
  return (
    <>
      <nav className="mb-4 flex flex-wrap items-center gap-2 text-xs text-tinta-3">
        <Link to="/rankings" className="font-medium text-marinho hover:underline">Rankings</Link><span>›</span><span>Atletas</span><span>›</span><span>{a.nome}</span>
      </nav>
      <div className="mb-5 flex flex-wrap items-end justify-between gap-3"><h1 className="text-2xl font-semibold sm:text-3xl">{a.nome}</h1><span className="rounded-md border border-linha bg-white px-3 py-1.5 text-sm font-medium text-marinho">{TEMPORADA}</span></div>
      <div className="grid gap-4 lg:grid-cols-[280px_1fr]">
        <div className="cartao h-fit p-6">
          <div className="mb-5 flex justify-center"><Avatar atletaId={a.id} nome={a.nome} className="h-36 w-36 text-4xl" /></div>
          {([["Faixa", <Faixa key="f" cor={a.faixa} />], ["Equipe", <Link key="e" to={`/equipes/${encodeURIComponent(a.equipe)}`} className="text-marinho hover:underline">{a.equipe}</Link>], ["Divisão", divisaoPorIdade(ANO_EVENTO - a.anoNascimento)?.nome ?? ""]] as const).map(([k, v]) => (
            <div key={k} className="flex items-center justify-between border-b border-linha/70 py-2.5 text-sm"><span className="text-tinta-3">{k}</span><span className="font-semibold">{v}</span></div>
          ))}
          <div className="rotulo mb-1 mt-5">Posição nos rankings</div>
          <PosicoesNosRankings a={a} />
          <p className="mt-4 text-xs text-tinta-3">Data de nascimento, contato e documentos não são exibidos.</p>
        </div>
        <PainelDesempenho a={a} />
      </div>
    </>
  );
}

export function PaginaEquipe() {
  const { nome } = useParams();
  const d = useDados();
  const equipe = decodeURIComponent(nome ?? "");
  const ranking = useMemo(() => rankingDeEquipes(d), [d]);
  const fichas = useMemo(() => [...d.atletas.values()].filter((a) => a.equipe === equipe && !a.menor).map((a) => fichaDoAtleta(d, a)).filter((f) => f.pontos > 0).sort((x, y) => y.pontos - x.pontos), [d, equipe]);
  const pos = ranking.findIndex((e) => e.equipe === equipe);
  const e = ranking[pos];
  if (!e) return <Vazio>Equipe não encontrada.</Vazio>;
  const destaques = fichas.slice(0, 8);
  const todos = [...d.atletas.values()].filter((a) => a.equipe === equipe);
  const reservados = todos.filter((a) => a.menor && d.estado.config.ocultarMenores).length;
  return (
    <>
      <nav className="mb-4 flex flex-wrap items-center gap-2 text-xs text-tinta-3"><Link to="/rankings" className="font-medium text-marinho hover:underline">Rankings</Link><span>›</span><span>Equipes</span><span>›</span><span>{equipe}</span></nav>
      <div className="grid gap-4 lg:grid-cols-[280px_1fr]">
        <div className="cartao h-fit p-6">
          <div className="mb-4 flex justify-center"><Emblema nome={equipe} className="h-32 w-32 text-4xl" /></div>
          <h1 className="mb-4 text-center text-xl font-semibold">{equipe}</h1>
          {[["Pontos somados", e.pontos.toLocaleString("pt-BR")], ["Atletas", e.atletas], ["Faixas pretas", e.pretas], ["Responsável", "Professor da equipe"]].map(([k, v]) => (
            <div key={k} className="flex items-center justify-between border-b border-linha/70 py-2.5 text-sm last:border-0"><span className="text-tinta-3">{k}</span><span className="font-semibold">{v}</span></div>
          ))}
        </div>
        <div className="space-y-4">
          <div className="grid gap-4 md:grid-cols-2">
            <Secao titulo="Resultado em lutas">
              <Rosca total={e.lutas} legenda="lutas" partes={[{ nome: "Vitórias", valor: e.vitorias, cor: "#1F8A5B" }, { nome: "Derrotas", valor: e.lutas - e.vitorias, cor: "#C8362E" }]} />
            </Secao>
            <Secao titulo="Pódios na temporada">
              {[["1º lugar", e.ouro, "#FAAB19"], ["2º lugar", e.prata, "#9AA1A9"], ["3º lugar", e.bronze, "#B7733A"]].map(([n, v, cor]) => {
                const total = Math.max(e.ouro + e.prata + e.bronze, 1);
                return <div key={n as string} className="mb-3"><div className="flex justify-between text-sm"><span>{n}</span><span><span className="text-tinta-3">{Math.round(((v as number) / total) * 100)}%</span> <b>{v}</b></span></div><div className="mt-1 h-1.5 rounded-full bg-papel"><div className="h-1.5 rounded-full" style={{ width: `${((v as number) / total) * 100}%`, background: cor as string }} /></div></div>;
              })}
            </Secao>
          </div>
          <Secao titulo="De onde vêm os pontos">
            {!e.porEvento.length ? <Vazio>Sem pódios registrados.</Vazio> : (
              <table className="tabela"><thead><tr><th>Evento</th><th>Medalhas</th><th>Pontos</th></tr></thead>
                <tbody>{[...e.porEvento].sort((a, b) => b.pontos - a.pontos).map((p) => <tr key={p.evento}><td className="font-medium">{p.evento}</td><td>{p.medalhas}</td><td className="font-semibold">{p.pontos}</td></tr>)}</tbody></table>
            )}
          </Secao>
          <Secao titulo="Atletas em destaque">
            {!destaques.length ? <Vazio>Nenhum atleta adulto pontuou ainda.</Vazio> : <LinhasRanking fichas={destaques} />}
            {reservados > 0 && <p className="mt-3 text-xs text-tinta-3">{reservados} atletas menores de idade fazem parte da equipe e não são listados publicamente.</p>}
          </Secao>
        </div>
      </div>
    </>
  );
}
