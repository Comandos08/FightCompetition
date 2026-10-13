import { useMemo, useState } from "react";
import { Link } from "react-router-dom";
import { useDados } from "@/data/store";
import { EVENTO_ID, equipes } from "@/data/seed";
import { Faixa, Indicador, Selo, Titulo, Vazio, pagamentoSelo, pesagemSelo } from "@/components/ui";
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
  // atleta de demonstração: o primeiro adulto inscrito em Gi e No-Gi
  const padrao = useMemo(() => {
    const porAtleta = new Map<string, number>();
    for (const i of d.inscricoes) if (i.pagamento === "pago") porAtleta.set(i.atletaId, (porAtleta.get(i.atletaId) ?? 0) + 1);
    return [...d.atletas.values()].find((a) => !a.menor && porAtleta.get(a.id) === 2)?.id ?? [...d.atletas.keys()][0]!;
  }, [d.atletas, d.inscricoes]);
  const [atletaId, setAtletaId] = useState(padrao);
  const [busca, setBusca] = useState("");
  const atleta = d.atletas.get(atletaId)!;
  const minhas = d.inscricoes.filter((i) => i.atletaId === atletaId);
  const achados = busca.length < 2 ? [] : [...d.atletas.values()].filter((a) => a.nome.toLowerCase().includes(busca.toLowerCase())).slice(0, 6);

  return (
    <div className="mx-auto max-w-3xl">
      <Titulo sobre={`Área do atleta · ${atleta.equipe}`}>{atleta.nome}</Titulo>
      <div className="relative mb-6">
        <input className="campo" placeholder="Ver como outro atleta (busque pelo nome)" value={busca} onChange={(e) => setBusca(e.target.value)} />
        {!!achados.length && <div className="cartao absolute z-10 mt-1 w-full overflow-hidden">{achados.map((a) => <button key={a.id} className="block w-full px-3 py-2 text-left text-sm hover:bg-papel" onClick={() => { setAtletaId(a.id); setBusca(""); }}>{a.nome} <span className="text-tinta-3">· {a.equipe}</span></button>)}</div>}
      </div>
      {!minhas.length && <Vazio>Este atleta não tem inscrições.</Vazio>}
      <div className="space-y-4">
        {minhas.map((i) => {
          const p = proxima(i.id);
          const oponente = p.luta ? (p.luta.a === i.id ? p.luta.b : p.luta.a) : undefined;
          return (
            <div key={i.id} className="cartao overflow-hidden">
              <div className="flex flex-wrap items-center justify-between gap-2 border-b border-linha/70 px-4 py-3">
                <div><div className="rotulo">Copa Horizonte 2026 · {i.modalidade}</div><div className="font-semibold">{i.divisao} · <Faixa cor={i.faixa} /> · {i.peso}</div></div>
                <div className="flex gap-1.5">{pagamentoSelo(i.pagamento)}{pesagemSelo(i.pesagem)}</div>
              </div>
              {i.pagamento !== "pago" ? <div className="px-4 py-4 text-sm text-tinta-2">Conclua o pagamento para entrar na chave.</div>
                : !p.bloco ? <div className="px-4 py-4 text-sm text-tinta-2">Você está sozinho nesta categoria. A organização vai propor uma mudança de categoria.</div>
                : p.campeao ? <div className="bg-tatame-claro px-4 py-4 font-semibold text-tatame">Campeão da categoria.</div>
                : p.eliminado ? <div className="px-4 py-4 text-sm text-tinta-2">Sua participação nesta categoria terminou.</div>
                : p.luta ? (
                  <div className="grid gap-4 px-4 py-4 sm:grid-cols-[auto_1fr] sm:items-center">
                    <div className="rounded-md bg-tinta px-5 py-3 text-center text-white">
                      <div className="font-mono text-[10px] uppercase tracking-widest opacity-60">{p.bloco.dia === 1 ? "Sábado" : "Domingo"} · previsto</div>
                      <div className="font-display text-4xl font-black tabular-nums" style={{ fontStretch: "78%" }}>{hhmm(horarioDaLuta(p.bloco, p.luta.id))}</div>
                      <div className="font-mono text-xs">Tatame {p.bloco.tatame}</div>
                    </div>
                    <div>
                      <div className="rotulo">{nomeRodada(p.luta.rodada, p.bloco.chave.totalRodadas)} · sua próxima luta</div>
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
      <Link to={`/eventos/${EVENTO_ID}/inscricao`} className="botao-contorno mt-5">Nova inscrição</Link>
    </div>
  );
}

export function Professor() {
  const d = useDados();
  const proxima = useProximaLuta();
  const [equipe, setEquipe] = useState(equipes[0]!);
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
      <Titulo sobre="Área do professor" acoes={<select className="campo w-auto" value={equipe} onChange={(e) => setEquipe(e.target.value)}>{equipes.map((e) => <option key={e}>{e}</option>)}</select>}>{equipe}</Titulo>
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
                  <span className="w-10 rounded bg-tinta py-0.5 text-center font-mono text-xs text-white">T{p.bloco!.tatame}</span>
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
