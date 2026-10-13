import { useMemo, useState } from "react";
import { Link, useNavigate, useParams } from "react-router-dom";
import { Configuracoes, EquipeEvento, Financeiro, ResultadosOrg } from "@/pages/Gestao";
import { useDados } from "@/data/store";
import { EVENTO_ID, divisoes, eventos } from "@/data/seed";
import { Abas, Faixa, Indicador, Selo, Titulo, Vazio, pagamentoSelo, pesagemSelo } from "@/components/ui";
import { Chave, Podio } from "@/components/Chave";
import { hhmm, type Categoria } from "@/lib/competicao";

type Aba = "visao" | "inscritos" | "categorias" | "chaves" | "programacao" | "pesagem" | "financeiro" | "resultados" | "equipe" | "config";
const ABAS: Aba[] = ["visao", "inscritos", "categorias", "chaves", "programacao", "pesagem", "financeiro", "resultados", "equipe", "config"];

export function Organizador() {
  const d = useDados();
  const nav = useNavigate();
  const params = useParams();
  const aba: Aba = ABAS.includes(params.aba as Aba) ? (params.aba as Aba) : "visao";
  const setAba = (a: Aba) => nav(`/app/organizacao/eventos/${EVENTO_ID}/${a}`);
  const ev = eventos.find((e) => e.id === EVENTO_ID)!;

  const pagos = d.inscricoes.filter((i) => i.pagamento === "pago");
  const atletasUnicos = new Set(d.inscricoes.map((i) => i.atletaId)).size;
  const sozinhos = d.categorias.filter((c) => c.inscricoes.length === 1);
  const totalLutas = [...d.chaves.values()].reduce((s, c) => s + c.lutas.length, 0);
  const feitas = [...d.resolvidas.values()].reduce((s, r) => s + r.lutas.filter((l) => l.vencedorId).length, 0);
  const publicadas = d.categorias.filter((c) => d.estado.publicadas[c.id]).length;

  return (
    <>
      <Link to="/app/organizacao" className="rotulo mb-2 inline-block hover:text-tinta">← Todos os eventos</Link>
      <Titulo sobre={`Painel do evento · ${ev.organizador}`}
        acoes={<><button className="botao-contorno" onClick={() => nav(`/eventos/${ev.id}`)}>Ver página pública</button><button className="botao-primario" onClick={() => nav("/app/mesa/arena")}>Coordenar tatames</button></>}>
        {ev.nome}
      </Titulo>
      <Abas<Aba> ativa={aba} aoMudar={setAba} abas={[
        { id: "visao", nome: "Visão geral" }, { id: "inscritos", nome: "Inscritos", conta: d.inscricoes.length },
        { id: "categorias", nome: "Categorias", conta: d.categorias.length }, { id: "chaves", nome: "Chaves", conta: d.chaves.size },
        { id: "programacao", nome: "Programação" }, { id: "pesagem", nome: "Check-in e pesagem" },
        { id: "financeiro", nome: "Financeiro" }, { id: "resultados", nome: "Resultados" }, { id: "equipe", nome: "Equipe" }, { id: "config", nome: "Configurações" },
      ]} />

      {aba === "visao" && (
        <>
          <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
            <Indicador rotulo="Inscrições" valor={d.inscricoes.length} detalhe={`${atletasUnicos} atletas únicos`} />
            <Indicador rotulo="Recebido" valor={`R$ ${(pagos.reduce((s, i) => s + i.valor, 0) / 1000).toFixed(1).replace(".", ",")} mil`} detalhe={`${d.inscricoes.length - pagos.length} inscrições sem pagamento`} />
            <Indicador rotulo="Categorias" valor={d.categorias.length} detalhe={`${sozinhos.length} com atleta sozinho`} />
            <Indicador rotulo="Lutas" valor={`${feitas}/${totalLutas}`} detalhe={`${publicadas} chaves publicadas`} />
          </div>
          <div className="mt-6 grid gap-4 lg:grid-cols-2">
            <div className="cartao p-5">
              <h2 className="mb-3 text-xl font-bold">O que falta antes do evento</h2>
              {[
                [`${d.inscricoes.filter((i) => i.pagamento === "pendente").length} pagamentos pendentes`, "inscritos", "aviso"],
                [`${d.inscricoes.filter((i) => i.pagamento === "aguardando-autorizacao").length} menores aguardando autorização do responsável`, "inscritos", "acao"],
                [`${sozinhos.length} categorias com um atleta só`, "categorias", "aviso"],
                [`${d.chaves.size - publicadas} chaves ainda não publicadas`, "chaves", "neutro"],
              ].map(([texto, destino, tom]) => (
                <button key={texto} onClick={() => setAba(destino as Aba)} className="flex w-full items-center justify-between border-b border-linha/70 py-2.5 text-left text-sm last:border-0 hover:text-acao">
                  <span>{texto}</span><Selo tom={tom as "aviso"}>resolver →</Selo>
                </button>
              ))}
            </div>
            <div className="cartao p-5">
              <h2 className="mb-3 text-xl font-bold">Inscrições por equipe</h2>
              {Object.entries(d.inscricoes.reduce<Record<string, number>>((m, i) => { const e = d.atletas.get(i.atletaId)!.equipe; m[e] = (m[e] ?? 0) + 1; return m; }, {}))
                .sort((a, b) => b[1] - a[1]).slice(0, 8).map(([equipe, n], _, arr) => (
                  <div key={equipe} className="mb-1.5 flex items-center gap-3 text-sm">
                    <span className="w-40 truncate">{equipe}</span>
                    <div className="h-2 flex-1 rounded-full bg-papel"><div className="h-2 rounded-full bg-marinho" style={{ width: `${(n / arr[0]![1]) * 100}%` }} /></div>
                    <span className="w-8 text-right font-mono text-xs">{n}</span>
                  </div>
                ))}
            </div>
          </div>
        </>
      )}

      {aba === "inscritos" && <Inscritos />}
      {aba === "categorias" && <Categorias />}
      {aba === "chaves" && <Chaves />}
      {aba === "programacao" && <Programacao />}
      {aba === "pesagem" && <Pesagem />}
      {aba === "financeiro" && <Financeiro />}
      {aba === "resultados" && <ResultadosOrg />}
      {aba === "equipe" && <EquipeEvento />}
      {aba === "config" && <Configuracoes />}
    </>
  );
}

function Inscritos() {
  const d = useDados();
  const [busca, setBusca] = useState("");
  const [status, setStatus] = useState("todos");
  const lista = useMemo(() => d.inscricoes.filter((i) => {
    const a = d.atletas.get(i.atletaId)!;
    return (status === "todos" || i.pagamento === status) && `${a.nome} ${a.equipe} ${i.id}`.toLowerCase().includes(busca.toLowerCase());
  }), [d.inscricoes, d.atletas, busca, status]);
  return (
    <>
      <div className="mb-3 flex flex-wrap gap-2">
        <input className="campo max-w-sm" placeholder="Buscar por atleta, equipe ou número" value={busca} onChange={(e) => setBusca(e.target.value)} />
        <select className="campo w-auto" value={status} onChange={(e) => setStatus(e.target.value)}>
          <option value="todos">Todos os pagamentos</option><option value="pago">Pagos</option><option value="pendente">Pendentes</option><option value="aguardando-autorizacao">Aguardando responsável</option><option value="estornado">Estornados</option>
        </select>
        <span className="self-center text-sm text-tinta-3">{lista.length} inscrições</span>
      </div>
      <div className="cartao max-h-[65vh] overflow-auto">
        <table className="tabela">
          <thead><tr><th>Nº</th><th>Atleta</th><th>Equipe</th><th>Categoria</th><th>Pagamento</th><th></th></tr></thead>
          <tbody>
            {lista.slice(0, 150).map((i) => {
              const a = d.atletas.get(i.atletaId)!;
              return (
                <tr key={i.id}>
                  <td className="font-mono text-xs text-tinta-3">{i.id}</td>
                  <td><div className="font-medium">{a.nome}</div>{a.menor && <div className="text-xs text-tinta-3">Menor · resp.: {a.responsavel}</div>}</td>
                  <td>{a.equipe}</td>
                  <td><div>{i.modalidade} · {i.divisao} · {i.peso}</div><div className="text-xs"><Faixa cor={i.faixa} /></div></td>
                  <td>{pagamentoSelo(i.pagamento)}</td>
                  <td className="text-right">
                    {i.pagamento === "pendente" && <button className="botao-contorno !py-1 text-xs" onClick={() => d.despachar({ tipo: "pagamento", id: i.id, status: "pago" })}>Confirmar pagamento</button>}
                    {i.pagamento === "aguardando-autorizacao" && <button className="botao-contorno !py-1 text-xs" onClick={() => d.despachar({ tipo: "pagamento", id: i.id, status: "pago" })}>Registrar autorização</button>}
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
      {lista.length > 150 && <p className="mt-2 text-xs text-tinta-3">Mostrando 150 de {lista.length}.</p>}
    </>
  );
}

function vizinhas(cat: Categoria, todas: Categoria[]): Categoria[] {
  const pesos = divisoes.find((x) => x.nome === cat.divisao)?.pesos ?? [];
  const distancia = (c: Categoria) => Math.abs(pesos.indexOf(c.peso) - pesos.indexOf(cat.peso));
  // só propõe o peso imediatamente vizinho na mesma faixa; mudar de faixa ou saltar pesos fica para decisão manual
  return todas
    .filter((c) => c.id !== cat.id && c.modalidade === cat.modalidade && c.sexo === cat.sexo && c.divisao === cat.divisao && c.faixa === cat.faixa && distancia(c) === 1)
    .sort((a, b) => b.inscricoes.length - a.inscricoes.length);
}

function Categorias() {
  const d = useDados();
  const [filtro, setFiltro] = useState<"todas" | "sozinho" | "pequenas">("sozinho");
  const lista = d.categorias.filter((c) => filtro === "todas" || (filtro === "sozinho" ? c.inscricoes.length === 1 : c.inscricoes.length <= 3));
  return (
    <>
      <div className="mb-3 flex flex-wrap items-center gap-2">
        {([["sozinho", "Atleta sozinho"], ["pequenas", "Até 3 atletas"], ["todas", "Todas"]] as const).map(([id, nome]) => (
          <button key={id} className={filtro === id ? "botao-primario" : "botao-contorno"} onClick={() => setFiltro(id)}>{nome}</button>
        ))}
        <span className="text-sm text-tinta-3">{lista.length} categorias</span>
      </div>
      <p className="mb-3 max-w-3xl text-sm text-tinta-2">Categoria com um atleta só não gera luta. O sistema sugere apenas o peso imediatamente vizinho na mesma faixa, e a mudança fica registrada. Qualquer outra fusão é decisão da direção técnica.</p>
      <div className="cartao max-h-[62vh] overflow-auto">
        <table className="tabela">
          <thead><tr><th>Modalidade</th><th>Categoria</th><th>Atletas</th><th>Luta</th><th>Sugestão de fusão</th></tr></thead>
          <tbody>
            {lista.map((c) => {
              const sugestao = c.inscricoes.length === 1 ? vizinhas(c, d.categorias)[0] : undefined;
              return (
                <tr key={c.id}>
                  <td>{c.modalidade}</td>
                  <td><div className="font-medium">{c.divisao} · {c.sexo === "M" ? "Masc." : "Fem."} · {c.peso}</div><div className="text-xs"><Faixa cor={c.faixa} /></div></td>
                  <td><span className="font-mono">{c.inscricoes.length}</span> {c.inscricoes.length === 1 && <Selo tom="aviso">sozinho</Selo>}</td>
                  <td className="font-mono text-xs">{c.minutos} min</td>
                  <td>
                    {sugestao ? (
                      <button className="botao-contorno !py-1 text-xs" onClick={() => d.despachar({ tipo: "fundir", inscricaoIds: c.inscricoes.map((i) => i.id), categoriaId: sugestao.id })}>
                        Mover para {sugestao.peso} ({sugestao.inscricoes.length})
                      </button>
                    ) : c.inscricoes.length === 1 ? <span className="text-xs text-tinta-3">Sem vizinha; decidir manualmente</span> : null}
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </>
  );
}

function Chaves() {
  const d = useDados();
  const comChave = d.categorias.filter((c) => d.chaves.has(c.id));
  const [catId, setCatId] = useState(() => [...comChave].sort((a, b) => b.inscricoes.length - a.inscricoes.length)[0]?.id ?? "");
  const cat = comChave.find((c) => c.id === catId) ?? comChave[0];
  if (!cat) return <Vazio>Nenhuma categoria com dois ou mais atletas.</Vazio>;
  const chave = d.chaves.get(cat.id)!;
  const resolvida = d.resolvidas.get(cat.id)!;
  const publicada = !!d.estado.publicadas[cat.id];
  const iniciada = resolvida.lutas.some((l) => l.vencedorId);
  return (
    <>
      <div className="mb-4 flex flex-wrap items-center gap-2">
        <select className="campo max-w-xl" value={cat.id} onChange={(e) => setCatId(e.target.value)}>
          {comChave.map((c) => <option key={c.id} value={c.id}>{c.modalidade} · {c.nome} ({c.inscricoes.length}){d.estado.publicadas[c.id] ? " · publicada" : ""}</option>)}
        </select>
        <button className="botao-contorno" disabled={publicada || iniciada} onClick={() => d.despachar({ tipo: "sortear", categoriaId: cat.id })}>Sortear de novo</button>
        <button className={publicada ? "botao-contorno" : "botao-primario"} disabled={iniciada} onClick={() => d.despachar({ tipo: "publicar", categoriaIds: [cat.id], valor: !publicada })}>{publicada ? "Despublicar" : "Publicar"}</button>
        <button className="botao-acao" onClick={() => d.despachar({ tipo: "publicar", categoriaIds: comChave.map((c) => c.id), valor: true })}>Publicar todas</button>
      </div>
      <div className="mb-3 flex flex-wrap gap-2 text-xs">
        <Selo>{cat.inscricoes.length} atletas</Selo><Selo>{chave.lutas.length} lutas</Selo><Selo>{chave.byes.length} byes</Selo>
        <Selo>sorteio nº {chave.semente}</Selo>
        {publicada ? <Selo tom="ok">publicada</Selo> : <Selo tom="aviso">rascunho</Selo>}
        {iniciada && <Selo tom="escuro">em andamento: não pode ser refeita</Selo>}
      </div>
      <div className="cartao p-4"><Chave chave={chave} resolvida={resolvida} /></div>
      <Podio resolvida={resolvida} />
      <p className="mt-3 max-w-3xl text-xs text-tinta-3">A chave é gerada pelo motor real: atletas da mesma equipe ficam em lados opostos, os byes são espalhados e o mesmo número de sorteio reproduz sempre a mesma chave.</p>
    </>
  );
}

function Programacao() {
  const d = useDados();
  const [dia, setDia] = useState<1 | 2>(1);
  const doDia = d.blocos.filter((b) => b.dia === dia);
  const fim = Math.max(...doDia.map((b) => b.fim), 0);
  return (
    <>
      <div className="mb-4 flex flex-wrap items-center gap-2">
        {([1, 2] as const).map((x) => <button key={x} onClick={() => setDia(x)} className={dia === x ? "botao-primario" : "botao-contorno"}>{x === 1 ? "Sábado · Gi" : "Domingo · No-Gi"}</button>)}
        <span className="text-sm text-tinta-3">{doDia.reduce((s, b) => s + b.chave.lutas.length, 0)} lutas · término previsto {hhmm(fim)}</span>
      </div>
      <div className="grid gap-3 overflow-x-auto" style={{ gridTemplateColumns: "repeat(6, minmax(190px, 1fr))" }}>
        {Array.from({ length: 6 }, (_, t) => t + 1).map((t) => {
          const bs = doDia.filter((b) => b.tatame === t);
          return (
            <div key={t} className="cartao overflow-hidden">
              <div className="bg-marinho px-3 py-2 text-white"><div className="font-display font-bold">Tatame {t}</div><div className="font-mono text-[11px] opacity-70">{bs.reduce((s, b) => s + b.chave.lutas.length, 0)} lutas · até {hhmm(bs[bs.length - 1]?.fim ?? 0)}</div></div>
              <div className="max-h-[58vh] space-y-1.5 overflow-auto p-2">
                {bs.map((b) => (
                  <div key={b.categoria.id} className="rounded border border-linha bg-papel/50 p-2 text-xs">
                    <div className="flex justify-between font-mono text-[10px] text-tinta-3"><span>{hhmm(b.inicio)}–{hhmm(b.fim)}</span><span>{b.chave.lutas.length} lutas</span></div>
                    <div className="mt-0.5 font-medium leading-tight">{b.categoria.divisao} · {b.categoria.sexo === "M" ? "Masc." : "Fem."}</div>
                    <div className="text-tinta-2">{b.categoria.faixa} · {b.categoria.peso}</div>
                  </div>
                ))}
              </div>
            </div>
          );
        })}
      </div>
      <p className="mt-3 max-w-3xl text-xs text-tinta-3">Distribuição automática por carga de cada tatame. No produto, os blocos poderão ser arrastados, as finais separadas em bloco próprio e o descanso mínimo do atleta respeitado.</p>
    </>
  );
}

function Pesagem() {
  const d = useDados();
  const [busca, setBusca] = useState("");
  const achados = busca.trim().length < 2 ? [] : [...d.atletas.values()].filter((a) => a.nome.toLowerCase().includes(busca.toLowerCase())).slice(0, 8);
  const pesados = d.inscricoes.filter((i) => i.pesagem !== "nao-pesado").length;
  return (
    <div className="max-w-3xl">
      <div className="mb-3 flex items-center gap-3">
        <input autoFocus className="campo" placeholder="Digite o nome do atleta (ou leia o QR, no produto)" value={busca} onChange={(e) => setBusca(e.target.value)} />
        <span className="whitespace-nowrap text-sm text-tinta-3">{pesados} pesagens registradas</span>
      </div>
      {!achados.length && <Vazio>Busque um atleta para fazer o check-in e registrar a pesagem. Tente "Rafael" ou "Ana".</Vazio>}
      <div className="space-y-3">
        {achados.map((a) => (
          <div key={a.id} className="cartao p-4">
            <div className="flex flex-wrap items-baseline justify-between gap-2">
              <div><span className="text-lg font-semibold">{a.nome}</span> <span className="text-sm text-tinta-3">{a.equipe} · nasc. {a.anoNascimento}</span></div>
              {a.menor && <Selo tom="aviso">menor · resp.: {a.responsavel}</Selo>}
            </div>
            {d.inscricoes.filter((i) => i.atletaId === a.id).map((i) => (
              <div key={i.id} className="mt-3 flex flex-wrap items-center justify-between gap-2 border-t border-linha/70 pt-3 text-sm">
                <span>{i.modalidade} · {i.divisao} · <Faixa cor={i.faixa} /> · {i.peso}</span>
                <span className="flex items-center gap-2">
                  {pagamentoSelo(i.pagamento)} {pesagemSelo(i.pesagem)}
                  <button className="botao-contorno !py-1 text-xs" disabled={i.pagamento !== "pago"} onClick={() => d.despachar({ tipo: "pesagem", id: i.id, status: "ok" })}>Peso ok</button>
                  <button className="botao-contorno !py-1 text-xs" disabled={i.pagamento !== "pago"} onClick={() => d.despachar({ tipo: "pesagem", id: i.id, status: "nao-bateu" })}>Não bateu</button>
                </span>
              </div>
            ))}
          </div>
        ))}
      </div>
    </div>
  );
}
