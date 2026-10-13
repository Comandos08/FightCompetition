import { useState } from "react";
import { navConta } from "@/pages/Conta";
import { Link } from "react-router-dom";
import { useDados } from "@/data/store";
import { EVENTO_ID, VALOR_INSCRICAO, type Inscricao, type Modalidade } from "@/data/seed";
import { EQUIPE_DO_PROFESSOR, usePessoa } from "@/data/sessao";
import { Faixa, Indicador, Secao, Selo, SubNav, Titulo, Vazio, pagamentoSelo, pesagemSelo } from "@/components/ui";
import { Chave } from "@/components/Chave";
import { hhmm, horarioDaLuta, idCategoria, nomeRodada } from "@/lib/competicao";

/** Próxima luta de uma inscrição: onde, quando e contra quem. */
function useProximaLuta() {
  const d = useDados();
  return (inscricaoId: string) => {
    const insc = d.inscricaoPorId.get(inscricaoId)!;
    const atleta = d.atletas.get(insc.atletaId)!;
    const catId = d.estado.destino[insc.id] ?? idCategoria(insc, atleta.sexo);
    const bloco = d.blocos.find((b) => b.categoria.id === catId);
    const resolvida = d.resolvidas.get(catId);
    if (!bloco || !resolvida) return { catId, bloco: undefined, luta: undefined, eliminado: false, campeao: false };
    const minhas = resolvida.lutas.filter((l) => l.a === insc.id || l.b === insc.id);
    const eliminado = minhas.some((l) => l.perdedorId === insc.id);
    const pendente = minhas.find((l) => !l.vencedorId);
    // ainda sem luta definida: aguarda o vencedor de uma luta anterior
    const futura = pendente ?? (eliminado ? undefined : resolvida.lutas.find((l) => !l.vencedorId && !l.a !== !l.b && (l.a === insc.id || l.b === insc.id)));
    return { catId, bloco, luta: futura, eliminado, campeao: resolvida.campeaoId === insc.id };
  };
}

export function Atleta() {
  const d = useDados();
  const proxima = useProximaLuta();
  const pessoa = usePessoa();
  const atleta = pessoa.atletaId ? d.atletas.get(pessoa.atletaId) : undefined;
  // inscrições do atleta da sessão e as que esta conta fez pelo fluxo de inscrição
  const minhas = d.inscricoes.filter((i) => i.atletaId === pessoa.atletaId || d.estado.novasInscricoes.some((n) => n.id === i.id));

  return (
    <div className="max-w-3xl">
      <Titulo sobre="Minha área" acoes={<Link to={`/app/inscricao/${EVENTO_ID}`} className="botao-acao">Nova inscrição</Link>}>{pessoa.nome}</Titulo>
      <SubNav itens={navConta} />
      {atleta && <p className="-mt-2 mb-5 text-sm text-tinta-2">{atleta.equipe} · faixa {atleta.faixa.toLowerCase()}</p>}
      {!minhas.length && <Vazio>Você ainda não tem inscrições. Use "Nova inscrição" para se inscrever ou inscrever um dependente.</Vazio>}
      <div className="space-y-4">
        {minhas.map((i) => {
          const p = proxima(i.id);
          const oponente = p.luta ? (p.luta.a === i.id ? p.luta.b : p.luta.a) : undefined;
          const deOutro = i.atletaId !== pessoa.atletaId;
          return (
            <div key={i.id} className="cartao overflow-hidden">
              <div className="flex flex-wrap items-center justify-between gap-2 border-b border-linha/70 px-4 py-3">
                <div><div className="rotulo">Copa Horizonte 2026 · {i.modalidade}{deOutro ? ` · ${d.nomeDe(i.id)}` : ""}</div><div className="font-semibold">{i.divisao} · <Faixa cor={i.faixa} /> · {i.peso}</div></div>
                <div className="flex gap-1.5">{pagamentoSelo(i.pagamento)}{pesagemSelo(i.pesagem)}</div>
              </div>
              {i.pagamento !== "pago" ? <div className="px-4 py-4 text-sm text-tinta-2">Conclua o pagamento para entrar na chave.</div>
                : !p.bloco ? <div className="px-4 py-4 text-sm text-tinta-2">Só há um atleta nesta categoria. A organização vai propor uma mudança de categoria.</div>
                : p.campeao ? <div className="bg-tatame-claro px-4 py-4 font-semibold text-tatame">Campeão da categoria.</div>
                : p.eliminado ? <div className="px-4 py-4 text-sm text-tinta-2">A participação nesta categoria terminou.</div>
                : p.luta ? (
                  <div className="grid gap-4 px-4 py-4 sm:grid-cols-[auto_1fr] sm:items-center">
                    <div className="rounded-md bg-marinho px-5 py-3 text-center text-white">
                      <div className="font-mono text-[10px] opacity-60">{p.bloco.dia === 1 ? "Sábado" : "Domingo"} · previsto</div>
                      <div className="font-display text-4xl font-bold tabular-nums">{hhmm(horarioDaLuta(p.bloco, p.luta.id))}</div>
                      <div className="font-mono text-xs">Tatame {p.bloco.tatame}</div>
                    </div>
                    <div>
                      <div className="rotulo">{nomeRodada(p.luta.rodada, p.bloco.chave.totalRodadas)} · próxima luta</div>
                      <div className="text-lg font-semibold">{oponente ? <>contra {d.nomeDe(oponente)}</> : "Oponente a definir"}</div>
                      {oponente && <div className="text-sm text-tinta-3">{d.equipeDe(oponente)}</div>}
                      <div className="mt-1 text-xs text-tinta-3">O horário é uma estimativa e se ajusta conforme o tatame avança.</div>
                    </div>
                  </div>
                ) : <div className="px-4 py-4 text-sm text-tinta-2">Aguardando definição da chave.</div>}
              {p.bloco && d.estado.publicadas[p.catId] && (
                <details className="border-t border-linha/70 px-4 py-3"><summary className="cursor-pointer text-sm font-medium">Ver chave completa</summary><div className="mt-3"><Chave chave={p.bloco.chave} resolvida={d.resolvidas.get(p.catId)!} /></div></details>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}

export const navEquipe = [
  { para: "/app/equipe", nome: "Agenda e pendências", fim: true },
  { para: "/app/equipe/atletas", nome: "Atletas e vínculos" },
  { para: "/app/equipe/inscrever", nome: "Inscrição em lote" },
];

const pedidosIniciais = [
  { nome: "Caio Valente Prado", detalhe: "Faixa azul · pediu em 09 out" },
  { nome: "Helena Duarte Sá", detalhe: "Faixa branca · pediu em 11 out" },
  { nome: "Otávio Lins Rego", detalhe: "Infantil · pedido feito pela responsável em 12 out" },
];

export function EquipeAtletas() {
  const d = useDados();
  const equipe = EQUIPE_DO_PROFESSOR;
  const [pedidos, setPedidos] = useState(pedidosIniciais.map((p) => ({ ...p, decisao: "" })));
  const atletas = [...d.atletas.values()].filter((a) => a.equipe === equipe);
  return (
    <>
      <Titulo sobre="Equipe · você é professor">{equipe}</Titulo>
      <SubNav itens={navEquipe} />
      <div className="grid gap-4 lg:grid-cols-[1fr_1.5fr]">
        <Secao titulo="Pedidos de vínculo">
          <div className="divide-y divide-linha/70">
            {pedidos.map((p, k) => (
              <div key={p.nome} className="flex flex-wrap items-center justify-between gap-2 py-3 text-sm">
                <span><span className="font-medium">{p.nome}</span><div className="text-xs text-tinta-3">{p.detalhe}</div></span>
                {p.decisao ? <Selo tom={p.decisao === "aprovado" ? "ok" : "neutro"}>{p.decisao}</Selo> : (
                  <span className="flex gap-2">
                    <button className="botao-primario !py-1 text-xs" onClick={() => setPedidos(pedidos.map((x, j) => (j === k ? { ...x, decisao: "aprovado" } : x)))}>Aprovar</button>
                    <button className="botao-contorno !py-1 text-xs" onClick={() => setPedidos(pedidos.map((x, j) => (j === k ? { ...x, decisao: "recusado" } : x)))}>Recusar</button>
                  </span>
                )}
              </div>
            ))}
          </div>
          <p className="mt-3 text-xs text-tinta-3">Quem diz que treina na sua equipe só passa a representá-la depois da sua confirmação. Você também confirma a faixa declarada.</p>
        </Secao>
        <Secao titulo={`Atletas vinculados · ${atletas.length}`}>
          <div className="max-h-[60vh] overflow-auto">
            <table className="tabela">
              <thead><tr><th>Atleta</th><th>Faixa</th><th>Nascimento</th><th>Inscrições</th><th>Vínculo</th></tr></thead>
              <tbody>
                {atletas.map((a) => (
                  <tr key={a.id}><td className="font-medium">{a.nome}{a.menor && <div className="text-xs font-normal text-tinta-3">menor · resp.: {a.responsavel}</div>}</td><td><Faixa cor={a.faixa} /></td><td>{a.anoNascimento}</td>
                    <td>{d.inscricoes.filter((i) => i.atletaId === a.id).length}</td><td><Selo tom="ok">ativo</Selo></td></tr>
                ))}
              </tbody>
            </table>
          </div>
        </Secao>
      </div>
    </>
  );
}

export function EquipeInscrever() {
  const d = useDados();
  const equipe = EQUIPE_DO_PROFESSOR;
  const [marcadas, setMarcadas] = useState<Record<string, boolean>>({});
  const [feito, setFeito] = useState(0);
  const linhas = [...d.atletas.values()].filter((a) => a.equipe === equipe).map((a) => ({ a, inscs: d.inscricoes.filter((i) => i.atletaId === a.id) })).filter((x) => x.inscs.length);
  const chaves = Object.keys(marcadas).filter((k) => marcadas[k]);
  const gerar = () => {
    const novas: Inscricao[] = chaves.map((k, n) => {
      const [atletaId, modalidade] = k.split("|") as [string, Modalidade];
      const baseI = d.inscricoes.find((i) => i.atletaId === atletaId)!;
      return { ...baseI, id: `I8${String(d.inscricoes.length + n).padStart(3, "0")}`, modalidade, pagamento: d.atletas.get(atletaId)!.menor ? "aguardando-autorizacao" : "pendente", pesagem: "nao-pesado", valor: VALOR_INSCRICAO };
    });
    d.despachar({ tipo: "inscrever", inscricoes: novas });
    setFeito(novas.length); setMarcadas({});
  };
  return (
    <>
      <Titulo sobre="Equipe · você é professor">{equipe}</Titulo>
      <SubNav itens={navEquipe} />
      {feito > 0 && <div className="mb-4 rounded-md bg-tatame-claro px-4 py-3 text-sm text-tatame">{feito} inscrições criadas em um pedido só. Elas aparecem em <Link to="/app/equipe" className="font-medium underline">Agenda e pendências</Link> até o pagamento. As de menores aguardam a autorização do responsável.</div>}
      <div className="grid gap-4 lg:grid-cols-[1.7fr_1fr]">
        <Secao titulo="Copa Horizonte de Jiu-Jitsu 2026">
          <p className="mb-3 text-sm text-tinta-2">Marque a modalidade que falta para cada atleta. A categoria repete a da inscrição que ele já tem.</p>
          <div className="max-h-[58vh] overflow-auto">
            <table className="tabela">
              <thead><tr><th>Atleta</th><th>Categoria</th><th>Gi</th><th>No-Gi</th></tr></thead>
              <tbody>
                {linhas.map(({ a, inscs }) => (
                  <tr key={a.id}>
                    <td className="font-medium">{a.nome}</td><td className="text-xs">{inscs[0]!.divisao} · {inscs[0]!.faixa} · {inscs[0]!.peso}</td>
                    {(["Gi", "No-Gi"] as const).map((m) => {
                      const tem = inscs.some((i) => i.modalidade === m);
                      const k = `${a.id}|${m}`;
                      return <td key={m}><input type="checkbox" className="h-4 w-4" disabled={tem} checked={tem || !!marcadas[k]} onChange={(e) => setMarcadas({ ...marcadas, [k]: e.target.checked })} /></td>;
                    })}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </Secao>
        <Secao titulo="Pedido da equipe">
          <div className="flex items-baseline justify-between"><span className="text-tinta-2">{chaves.length} novas inscrições</span><span className="text-3xl font-semibold text-marinho">R$ {chaves.length * VALOR_INSCRICAO},00</span></div>
          <button className="botao-acao mt-4 w-full" disabled={!chaves.length} onClick={gerar}>Gerar pedido único</button>
          <p className="mt-3 text-xs text-tinta-3">O professor paga tudo em um Pix. Cada atleta continua dono da própria inscrição e vê o status na área dele.</p>
        </Secao>
      </div>
    </>
  );
}

export function Professor() {
  const d = useDados();
  const proxima = useProximaLuta();
  const equipe = EQUIPE_DO_PROFESSOR;
  const [dia, setDia] = useState<1 | 2>(1);
  const daEquipe = d.inscricoes.filter((i) => d.atletas.get(i.atletaId)!.equipe === equipe);
  const atletasUnicos = new Set(daEquipe.map((i) => i.atletaId)).size;
  const pendentes = daEquipe.filter((i) => i.pagamento !== "pago");
  const agenda = daEquipe.filter((i) => i.pagamento === "pago").map((i) => ({ i, p: proxima(i.id) }))
    .filter((x) => x.p.bloco && x.p.bloco.dia === dia && x.p.luta && !x.p.eliminado)
    .map((x) => ({ ...x, hora: horarioDaLuta(x.p.bloco!, x.p.luta!.id) })).sort((a, b) => a.hora - b.hora);
  const ouros = d.categorias.filter((c) => { const id = d.resolvidas.get(c.id)?.campeaoId; return id && d.equipeDe(id) === equipe; }).length;

  return (
    <>
      <Titulo sobre="Equipe · você é professor" acoes={<Link to="/app/equipe/inscrever" className="botao-acao">Inscrever atletas</Link>}>{equipe}</Titulo>
      <SubNav itens={navEquipe} />
      <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
        <Indicador rotulo="Atletas inscritos" valor={atletasUnicos} detalhe={`${daEquipe.length} inscrições`} />
        <Indicador rotulo="Pendências" valor={pendentes.length} detalhe="pagamento ou autorização" />
        <Indicador rotulo="Lutas hoje" valor={agenda.length} detalhe={dia === 1 ? "sábado · Gi" : "domingo · No-Gi"} />
        <Indicador rotulo="Ouros" valor={ouros} detalhe="categorias encerradas" />
      </div>

      <div className="mt-6 grid gap-5 lg:grid-cols-[1.2fr_1fr]">
        <div>
          <div className="mb-3 flex items-center justify-between">
            <h2 className="text-xl font-bold">Agenda da equipe</h2>
            <div className="flex gap-1.5">{([1, 2] as const).map((x) => <button key={x} onClick={() => setDia(x)} className={dia === x ? "botao-primario !py-1" : "botao-contorno !py-1"}>{x === 1 ? "Sábado" : "Domingo"}</button>)}</div>
          </div>
          {!agenda.length && <Vazio>Nenhuma luta prevista para este dia.</Vazio>}
          <div className="cartao max-h-[60vh] divide-y divide-linha/70 overflow-auto">
            {agenda.map(({ i, p, hora }, k) => {
              const conflito = k > 0 && hora - agenda[k - 1]!.hora < 4 && agenda[k - 1]!.p.bloco!.tatame !== p.bloco!.tatame;
              const oponente = p.luta!.a === i.id ? p.luta!.b : p.luta!.a;
              return (
                <div key={i.id} className="flex items-center gap-3 px-3 py-2.5 text-sm">
                  <span className="w-12 font-mono font-semibold">{hhmm(hora)}</span>
                  <span className="w-10 rounded bg-marinho py-0.5 text-center font-mono text-xs text-white">T{p.bloco!.tatame}</span>
                  <span className="flex-1"><span className="font-medium">{d.nomeDe(i.id)}</span> <span className="text-tinta-3">{oponente ? `x ${d.nomeDe(oponente)}` : "· oponente a definir"}</span><div className="text-xs text-tinta-3">{i.divisao} · {i.faixa} · {i.peso}</div></span>
                  {conflito && <Selo tom="aviso">tatames diferentes quase juntos</Selo>}
                </div>
              );
            })}
          </div>
        </div>
        <div>
          <h2 className="mb-3 text-xl font-bold">Pendências da equipe</h2>
          {!pendentes.length && <Vazio>Nenhuma pendência.</Vazio>}
          <div className="cartao divide-y divide-linha/70">
            {pendentes.slice(0, 12).map((i) => (
              <div key={i.id} className="flex items-center justify-between gap-2 px-3 py-2.5 text-sm">
                <span><span className="font-medium">{d.nomeDe(i.id)}</span><div className="text-xs text-tinta-3">{i.modalidade} · {i.divisao} · {i.peso}</div></span>
                {pagamentoSelo(i.pagamento)}
              </div>
            ))}
          </div>
          {!!pendentes.filter((i) => i.pagamento === "pendente").length && (
            <button className="botao-acao mt-3 w-full" onClick={() => pendentes.filter((i) => i.pagamento === "pendente").forEach((i) => d.despachar({ tipo: "pagamento", id: i.id, status: "pago" }))}>
              Pagar todas as pendentes em um pedido (simulado)
            </button>
          )}
          <p className="mt-3 text-xs text-tinta-3">Inscrição de menor continua aguardando a autorização do responsável, mesmo paga pelo professor.</p>
        </div>
      </div>
    </>
  );
}
