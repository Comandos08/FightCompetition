import { useEffect, useRef, useState } from "react";
import { Link, useNavigate, useParams, useSearchParams } from "react-router-dom";
import { useDados, type Contexto } from "@/data/store";
import { EVENTO_ID } from "@/data/seed";
import { TATAME_DO_MESARIO, usePessoa } from "@/data/sessao";
import { RelatarOcorrencia } from "@/pages/Sumulas";
import { enderecoDaTela, publicarTela, useTela, type Marcador } from "@/data/telaPublica";
import { Campo, Secao, Selo, SubNav, Titulo, Vazio } from "@/components/ui";
import { regrasIbjjf } from "@engine";
import { chaveDoResultado, hhmm, horarioDaLuta, nomeRodada, type Bloco } from "@/lib/competicao";

export interface ItemFila {
  bloco: Bloco;
  lutaId: string;
  rodada: number;
  a?: string;
  b?: string;
  vencedorId?: string;
  metodo?: string;
  pronta: boolean;
  horario: number;
  tatame: number;
  /** tatame em que a luta estava programada, quando foi trazida de outro */
  veioDe?: number;
  motivo?: string;
}

/** Fila de um tatame, já considerando as lutas que foram levadas de um tatame para outro. */
export function filaDoTatame(d: Contexto, dia: number, tatame: number): ItemFila[] {
  return d.blocos.filter((b) => b.dia === dia).flatMap((bloco) => {
    const r = d.resolvidas.get(bloco.categoria.id)!;
    return r.lutas.map((l) => {
      const rem = d.estado.remanejadas[chaveDoResultado(bloco.categoria.id, l.id)];
      return { bloco, lutaId: l.id, rodada: l.rodada, a: l.a, b: l.b, vencedorId: l.vencedorId, metodo: l.metodo, pronta: l.pronta, horario: horarioDaLuta(bloco, l.id), tatame: rem?.tatame ?? bloco.tatame, veioDe: rem?.origem, motivo: rem?.motivo };
    });
  }).filter((x) => x.tatame === tatame).sort((x, y) => Number(!!y.veioDe && !y.vencedorId) - Number(!!x.veioDe && !x.vencedorId));
}

const MOTIVOS = ["Tatame de origem parado ou atrasado", "Atendimento médico no tatame de origem", "Pedido da coordenação", "Atleta com lutas coladas em dois tatames", "Outro motivo"];

/** O imprevisto acontece: o operador pode trazer uma luta de outro tatame, com motivo registrado e visível para a coordenação. */
function PuxarLuta({ dia, tatame }: { dia: number; tatame: number }) {
  const d = useDados();
  const outros = [1, 2, 3, 4, 5, 6].filter((t) => t !== tatame);
  const [aberto, setAberto] = useState(false);
  const [origem, setOrigem] = useState(outros[0]!);
  const [motivo, setMotivo] = useState(MOTIVOS[0]!);
  const candidatas = filaDoTatame(d, dia, origem).filter((f) => f.pronta && !f.vencedorId).slice(0, 8);
  const quem = d.estado.sessao === "mesario" ? "Diego Antunes Paiva (mesário)" : d.estado.sessao === "diretor" ? "Paulo Guedes Neves (diretor técnico)" : "Renata Coutinho Lins (organização)";
  if (!aberto) return <button className="botao-contorno" onClick={() => setAberto(true)}>Trazer luta de outro tatame</button>;
  return (
    <div className="cartao mb-4 w-full p-4">
      <div className="mb-3 flex flex-wrap items-center justify-between gap-2"><h2 className="font-semibold">Trazer luta para o Tatame {tatame}</h2><button className="text-sm text-tinta-3 hover:text-tinta" onClick={() => setAberto(false)}>Fechar</button></div>
      <div className="mb-3 flex flex-wrap items-center gap-2 text-sm">
        <span className="text-tinta-2">De qual tatame:</span>
        {outros.map((t) => <button key={t} onClick={() => setOrigem(t)} className={origem === t ? "botao-primario !py-1" : "botao-contorno !py-1"}>T{t}</button>)}
        <select id="rem-motivo" className="campo ml-auto w-auto" value={motivo} onChange={(e) => setMotivo(e.target.value)}>{MOTIVOS.map((m) => <option key={m}>{m}</option>)}</select>
      </div>
      {!candidatas.length ? <Vazio>Nenhuma luta pronta no Tatame {origem}.</Vazio> : candidatas.map((f) => (
        <div key={f.bloco.categoria.id + f.lutaId} className="flex flex-wrap items-center justify-between gap-3 border-t border-linha/70 py-2 text-sm">
          <span><span className="font-medium">{d.nomeDe(f.a)} x {d.nomeDe(f.b)}</span><span className="block text-xs text-tinta-3">{f.bloco.categoria.nome} · previsto {hhmm(f.horario)}</span></span>
          <button className="botao-acao !py-1 text-xs" onClick={() => { d.despachar({ tipo: "remanejar", chave: chaveDoResultado(f.bloco.categoria.id, f.lutaId), remanejo: { tatame, origem: f.veioDe ?? origem, motivo, quem, quando: new Date().toLocaleTimeString("pt-BR", { hour: "2-digit", minute: "2-digit" }) } }); setAberto(false); }}>Trazer para o Tatame {tatame}</button>
        </div>
      ))}
      <p className="mt-3 text-xs text-tinta-3">A luta sai da fila do Tatame {origem} e entra na sua. O motivo, o horário e o seu nome ficam registrados e aparecem para a coordenação.</p>
    </div>
  );
}

const seg = (s: number) => `${String(Math.floor(s / 60)).padStart(2, "0")}:${String(s % 60).padStart(2, "0")}`;

export function Mesa() {
  const d = useDados();
  const [sp, setSp] = useSearchParams();
  const dia = Number(sp.get("dia") ?? 1);
  const soMeuTatame = d.estado.sessao === "mesario";
  const tatame = soMeuTatame ? TATAME_DO_MESARIO : Number(sp.get("tatame") ?? 1);
  const [mostrarFeitas, setMostrarFeitas] = useState(false);
  const fila = filaDoTatame(d, dia, tatame);
  const feitas = fila.filter((f) => f.vencedorId).length;
  const visiveis = fila.filter((f) => mostrarFeitas || !f.vencedorId).slice(0, 40);
  const mudar = (k: string, v: number) => { const n = new URLSearchParams(sp); n.set(k, String(v)); setSp(n); };
  return (
    <>
      <Titulo sobre="Mesa do tatame" acoes={<>{!soMeuTatame && <Link to="/app/mesa/arena" className="botao-contorno">Todos os tatames</Link>}{!soMeuTatame && <Link to={`/eventos/${EVENTO_ID}/painel?dia=${dia}`} className="botao-contorno">Painel geral do ginásio</Link>}</>}>Tatame {tatame}</Titulo>
      {soMeuTatame && <SubNav itens={navMesario} />}
      <TelaDoPublico tatame={tatame} dia={dia} />
      <div className="mb-4 flex flex-wrap items-center gap-2">
        {[1, 2].map((x) => <button key={x} onClick={() => mudar("dia", x)} className={dia === x ? "botao-primario" : "botao-contorno"}>{x === 1 ? "Sábado · Gi" : "Domingo · No-Gi"}</button>)}
        <span className="mx-1 h-6 w-px bg-linha" />
        {soMeuTatame ? <span className="text-sm text-tinta-2">Você foi escalado para o Tatame {tatame}.</span> : [1, 2, 3, 4, 5, 6].map((t) => <button key={t} onClick={() => mudar("tatame", t)} className={tatame === t ? "botao-primario" : "botao-contorno"}>T{t}</button>)}
        <span className="ml-auto" /><RelatarOcorrencia tatame={tatame} /><PuxarLuta dia={dia} tatame={tatame} />
        <label className="flex items-center gap-2 text-sm text-tinta-2"><input type="checkbox" checked={mostrarFeitas} onChange={(e) => setMostrarFeitas(e.target.checked)} /> Mostrar encerradas</label>
      </div>
      <div className="mb-3 h-1.5 overflow-hidden rounded-full bg-linha"><div className="h-full bg-tatame transition-all" style={{ width: `${fila.length ? (feitas / fila.length) * 100 : 0}%` }} /></div>
      <div className="mb-4 text-sm text-tinta-3">{feitas} de {fila.length} lutas encerradas neste tatame</div>
      {!visiveis.length && <Vazio>Nenhuma luta pendente neste tatame.</Vazio>}
      <div className="space-y-2">
        {visiveis.map((f) => (
          <div key={f.bloco.categoria.id + f.lutaId} className={`cartao flex flex-wrap items-center gap-4 p-3 ${f.pronta ? "border-marinho/40" : ""} ${f.vencedorId ? "opacity-60" : ""}`}>
            <div className="w-14 text-center"><div className="font-mono text-lg font-semibold">{hhmm(f.horario)}</div><div className="rotulo">previsto</div></div>
            <div className="min-w-[14rem] flex-1">
              <div className="rotulo">{f.bloco.categoria.nome} · {nomeRodada(f.rodada, f.bloco.chave.totalRodadas)}{f.veioDe && <span className="ml-2 rounded bg-ouro-claro px-1.5 py-0.5 normal-case text-aviso">veio do T{f.veioDe} · {f.motivo}</span>}</div>
              <div className="mt-0.5 grid gap-x-6 sm:grid-cols-2">
                {[f.a, f.b].map((id, k) => (
                  <div key={k} className={`truncate ${f.vencedorId && f.vencedorId === id ? "font-semibold text-tatame" : ""} ${!id ? "italic text-tinta-3" : ""}`}>
                    {d.nomeDe(id)} <span className="text-xs text-tinta-3">{d.equipeDe(id)}</span>
                  </div>
                ))}
              </div>
            </div>
            {f.vencedorId ? <span className="flex items-center gap-2"><Selo tom="ok">{f.metodo ?? "encerrada"}</Selo><Link className="botao-contorno !py-1.5 text-xs" to={`/app/mesa/sumula/${encodeURIComponent(f.bloco.categoria.id)}/${f.lutaId}`}>Súmula</Link></span>
              : f.pronta ? <span className="flex items-center gap-2">{f.veioDe && <button className="botao-contorno !py-1.5 text-xs" onClick={() => d.despachar({ tipo: "remanejar", chave: chaveDoResultado(f.bloco.categoria.id, f.lutaId), remanejo: null })}>Devolver ao T{f.veioDe}</button>}<Link className="botao-acao" to={`/app/mesa/placar/${tatame}/${encodeURIComponent(f.bloco.categoria.id)}/${f.lutaId}?dia=${dia}`}>Abrir placar</Link></span>
              : <Selo>aguarda luta anterior</Selo>}
          </div>
        ))}
      </div>
    </>
  );
}

const zero: Marcador = { pontos: 0, vantagens: 0, punicoes: 0 };
/** Livro de Regras da IBJJF, art. 7.3.1. */
const COMBATIVIDADE_SEG = regrasIbjjf.COMBATIVIDADE_SEGUNDOS;

/**
 * Telão da luta: o que atleta, técnico e público enxergam. Dois atletas empilhados, placar grande à direita,
 * vantagem e punição ao lado, e a barra de baixo com a luta, a categoria e o relógio.
 * As medidas são proporcionais à altura do próprio telão, para caber em qualquer tela.
 */
function Telao({ altura, lados, m, resta, rodando, iniciada, rotulo, categoria, fase, combatividade, vencedor }: {
  altura: string; lados: { nome: string; equipe: string }[]; m: [Marcador, Marcador]; resta: number; rodando: boolean; iniciada: boolean;
  rotulo: string; categoria: string; fase: string; combatividade: { lado: 0 | 1; resta: number } | null; vencedor: { lado: 0 | 1; metodo: string } | null;
}) {
  // medidas tiradas do vídeo de referência (1280 × 720): 1cqh = 1% da altura, 1cqw = 1% da largura do telão
  const indicador = (rotuloInd: string, valor: number, cor: string) => (
    <>
      <div className="font-semibold" style={{ fontSize: "1.9cqh", letterSpacing: "0.02em", color: valor ? cor : "#A9AAAD" }}>{rotuloInd}</div>
      <div className="font-bold" style={{ fontSize: "14.4cqh", lineHeight: 0.84, color: valor ? cor : "#A9AAAD" }}>{valor}</div>
    </>
  );
  const linha = (lado: 0 | 1) => (
    <div className="flex min-h-0 items-stretch bg-[#232427]" style={{ flex: 250 }}>
      <div className="flex min-w-0 flex-1 flex-col justify-center" style={{ paddingLeft: "1.4cqw" }}>
        <div className="truncate font-bold text-[#F7F8FB]" style={{ fontSize: `${15.2 * Math.min(1, (combatividade?.lado === lado ? 14 : 27) / lados[lado]!.nome.length)}cqh`, lineHeight: 0.86 }}>{lados[lado]!.nome}</div>
        <div className="truncate font-semibold text-[#97989B]" style={{ fontSize: "10.9cqh", lineHeight: 0.9, marginTop: "1.4cqh" }}>{lados[lado]!.equipe}</div>
      </div>
      {combatividade?.lado === lado && (
        <div className="flex shrink-0 flex-col items-center justify-center bg-[#FAD70C] text-[#5A1A12]" style={{ width: "22.9cqw", margin: "2.1cqh 0", borderRadius: "0.9cqh", boxShadow: "0 0 1.2cqh rgba(250,215,12,.35)" }}>
          <div className="font-bold tabular-nums" style={{ fontSize: "18cqh", lineHeight: 0.86, letterSpacing: "-0.05em", marginRight: "-0.05em" }}>{seg(combatividade.resta)}</div>
          <div className="font-semibold" style={{ fontSize: "7.6cqh", lineHeight: 0.9, marginTop: "1.6cqh" }}>Combatividade</div>
        </div>
      )}
      <div className="flex shrink-0 flex-col items-center justify-center" style={{ width: "7.1cqw", gap: "0.5cqh" }}>
        {indicador("Vantagem", m[lado].vantagens, "#22D22E")}
        <div style={{ height: "1.6cqh" }} />
        {indicador("Punição", m[lado].punicoes, "#E8203A")}
      </div>
      <div className={`grid shrink-0 place-items-center font-extrabold ${lado === 0 ? "bg-[#F8D91D] text-[#12965A]" : "bg-black text-white"}`} style={{ width: "29.7cqh", fontSize: "39.5cqh", lineHeight: 0.8 }}>{m[lado].pontos}</div>
    </div>
  );
  const letreiro = `${categoria}\u2003\u2003\u2003`;
  return (
    <div className="relative flex select-none flex-col overflow-hidden bg-[#1B1C1F] font-placar uppercase" style={{ height: altura, aspectRatio: altura === "auto" ? "16 / 9" : undefined, containerType: "size", gap: "0.3cqh" }}>
      {linha(0)}{linha(1)}
      <div className="relative flex min-h-0 items-stretch bg-[#1D1E21]" style={{ flex: 215 }}>
        <div className="grid shrink-0 place-items-center overflow-hidden whitespace-nowrap bg-white font-semibold text-black" style={{ width: "13cqw", fontSize: "20.5cqh", lineHeight: 0.8, letterSpacing: "0.02em" }}>{rotulo}</div>
        <div className="relative min-w-0 flex-1 overflow-hidden">
          <div className="absolute inset-x-0 font-semibold text-[#F7F8FB]" style={{ top: "6.9cqh", fontSize: "7.4cqh", lineHeight: 1, paddingLeft: "2.3cqw" }}>
            <span className="letreiro"><span>{letreiro}</span><span>{letreiro}</span></span>
          </div>
          <div className="absolute font-semibold text-[#D4A91C]" style={{ top: "15.2cqh", left: "2.3cqw", fontSize: "7.2cqh", lineHeight: 1 }}>{fase}</div>
        </div>
        <div className="flex shrink-0 items-center bg-[#1D1E21] font-bold tabular-nums" style={{ fontSize: "30.5cqh", lineHeight: 0.8, letterSpacing: "-0.055em", paddingLeft: "1.2cqw", paddingRight: "1.9cqw", boxShadow: "-2cqw 0 2cqw #1D1E21", color: !iniciada ? "#6B6C6F" : rodando ? "#F7F8FB" : "#F2C21B" }}>{seg(resta)}</div>
      </div>
      {vencedor && (
        <div className="absolute inset-x-0 top-0 flex flex-col items-center justify-center bg-[#232427]" style={{ height: "70%" }}>
          <div className="anuncio flex flex-col items-center">
            <div className="bg-[#F2EA1E] font-semibold text-black" style={{ fontSize: "9.8cqh", lineHeight: 1, padding: "0.6cqh 1.1cqw" }}>Vencedor por {vencedor.metodo}</div>
            <div className="font-bold text-[#F7F8FB]" style={{ fontSize: "23.5cqh", lineHeight: 0.86, marginTop: "2.2cqh" }}>{lados[vencedor.lado]!.nome}</div>
            <div className="font-semibold text-[#97989B]" style={{ fontSize: "11cqh", lineHeight: 0.9, marginTop: "2.2cqh" }}>{lados[vencedor.lado]!.equipe}</div>
          </div>
        </div>
      )}
    </div>
  );
}

const tituloDaCategoria = (cat: { modalidade: string; nome: string }) => `Copa Horizonte 2026 / ${cat.modalidade === "Gi" ? "Jiu-Jitsu" : "Jiu-Jitsu sem quimono"} / ${cat.nome.split(" · ").join(" / ")}`;

const navMesario = [{ para: "/app/mesa", nome: "Fila do tatame", fim: true }, { para: "/app/mesa/dados", nome: "Meus dados" }];

/** Abre a tela do público: em outra janela, para arrastar ao monitor virado para a arquibancada, ou nesta mesma. */
function BotoesDaTela({ tatame, escuro }: { tatame: number; escuro?: boolean }) {
  const b = escuro ? "rounded border border-white/30 px-3 py-1.5 text-xs text-white hover:bg-white/10" : "botao-contorno !py-1.5 text-xs";
  return (
    <div className="mt-2 flex flex-wrap gap-2">
      <button className={b} onClick={() => window.open(enderecoDaTela(tatame), `tela-tatame-${tatame}`, "popup,width=1280,height=720")}>Abrir em outra janela</button>
      {!escuro && <Link className={b} to={`/telao/${tatame}`}>Ver nesta janela</Link>}
    </div>
  );
}

/** Na fila: o que a tela virada para o público mostra e o que o mesário pode ligar nela entre uma luta e outra. */
function TelaDoPublico({ tatame, dia }: { tatame: number; dia: number }) {
  const tela = useTela(tatame);
  useEffect(() => { if (tela.dia !== dia) publicarTela(tatame, { dia }); }, [tatame, dia, tela.dia]);
  return (
    <div className="cartao mb-4 flex flex-wrap items-center gap-x-6 gap-y-2 p-3">
      <div className="min-w-[13rem] flex-1">
        <div className="rotulo">Tela do público do Tatame {tatame}</div>
        <div className="text-sm text-tinta-2">{tela.luta ? "Mostrando o placar da luta em andamento." : tela.proximas ? "Entre lutas: chamada da próxima luta e lista das seguintes." : "Entre lutas: só a chamada da próxima luta."}</div>
      </div>
      <label className="flex items-center gap-2 text-sm"><input id="tela-proximas" type="checkbox" checked={tela.proximas} onChange={(e) => publicarTela(tatame, { proximas: e.target.checked })} />Mostrar próximas lutas ao lado, entre uma luta e outra</label>
      <BotoesDaTela tatame={tatame} />
    </div>
  );
}

/**
 * Tela do tatame virada para o público. Não tem controle nenhum: durante a luta mostra o placar,
 * e entre uma luta e outra chama a próxima, com a lista das seguintes ao lado quando o mesário liga.
 */
export function TelaDoTatame() {
  const d = useDados();
  const tatame = Number(useParams().tatame);
  const tela = useTela(tatame);
  if (!(tatame >= 1 && tatame <= 6)) return <div className="grid min-h-screen place-items-center bg-[#1B1C1F] text-white">Tatame não encontrado.</div>;
  const voltar = d.estado.sessao && <Link to="/app/mesa" className="fixed right-2 top-2 z-40 rounded bg-black/40 px-2 py-1 text-[11px] text-white/30 hover:text-white">voltar à mesa</Link>;
  if (tela.luta) return <div className="bg-[#1B1C1F]">{voltar}<Telao altura="100vh" {...tela.luta} /></div>;
  const prontas = filaDoTatame(d, tela.dia, tatame).filter((f) => !f.vencedorId && f.pronta);
  const [proxima, ...resto] = prontas;
  return (
    <div className="flex min-h-screen flex-col bg-[#1B1C1F] p-[3vh] font-placar uppercase text-white">
      {voltar}
      <div className="flex items-baseline justify-between" style={{ fontSize: "4vh" }}><span className="font-bold">Tatame {tatame}</span><span className="text-white/50">Copa Horizonte 2026</span></div>
      <div className={`mt-[3vh] grid flex-1 gap-[3vh] ${tela.proximas && resto.length ? "lg:grid-cols-[minmax(0,1.5fr)_minmax(0,1fr)]" : ""}`}>
        <div className="flex min-w-0 flex-col justify-center rounded-lg bg-white/5 p-[4vh]">
          {proxima ? (
            <>
              <div className="text-[#F5E61E]" style={{ fontSize: "3.4vh" }}>Próxima luta · {hhmm(proxima.horario)}</div>
              <div className="text-white/60" style={{ fontSize: "2.8vh" }}>{proxima.bloco.categoria.nome} · {nomeRodada(proxima.rodada, proxima.bloco.chave.totalRodadas)}</div>
              {[proxima.a, proxima.b].map((id, k) => (
                <div key={k} className="mt-[3vh] flex items-center gap-[2vh]">
                  <span className={`shrink-0 rounded-sm ${k === 0 ? "bg-[#F5E61E]" : "border border-white/60 bg-black"}`} style={{ width: "1.6vh", height: "11vh" }} />
                  <div className="min-w-0"><div className="font-bold leading-none" style={{ fontSize: "min(8vh, 3.4vw)" }}>{d.nomeDe(id)}</div><div className="truncate text-white/60" style={{ fontSize: "3.6vh" }}>{d.equipeDe(id)}</div></div>
                </div>
              ))}
            </>
          ) : <div className="text-center text-white/50" style={{ fontSize: "5vh" }}>Sem lutas pendentes neste tatame</div>}
        </div>
        {tela.proximas && resto.length > 0 && (
          <div id="proximas-do-tatame" className="min-w-0 rounded-lg bg-white/5 p-[3vh]">
            <div className="mb-[1.5vh] text-white/50" style={{ fontSize: "3vh" }}>Em seguida</div>
            {resto.slice(0, 4).map((f) => (
              <div key={f.bloco.categoria.id + f.lutaId} className="border-b border-white/10 py-[1.6vh] last:border-0">
                <div className="text-white/50" style={{ fontSize: "2.2vh" }}>{hhmm(f.horario)} · {f.bloco.categoria.nome}</div>
                <div className="font-bold leading-tight" style={{ fontSize: "min(3.4vh, 1.9vw)" }}><div className="truncate">{d.nomeDe(f.a)}</div><div className="truncate">{d.nomeDe(f.b)}</div></div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

/** Dados da própria conta do mesário e a escala dele. Nada de perfil esportivo, dependentes ou pedidos. */
export function DadosDoMesario() {
  const pessoa = usePessoa();
  const [salvo, setSalvo] = useState(false);
  return (
    <>
      <Titulo sobre="Mesa do tatame">Meus dados</Titulo>
      <SubNav itens={navMesario} />
      <div className="grid gap-4 lg:grid-cols-2">
        <Secao titulo="Dados pessoais">
          <div className="space-y-4">
            <Campo rotulo="Nome completo"><input id="mesario-nome" className="campo" defaultValue={pessoa.nome} onChange={() => setSalvo(false)} /></Campo>
            <Campo rotulo="Celular" dica="A coordenação usa este número no dia do evento."><input id="mesario-cel" className="campo" placeholder="(21) 90000-0000" onChange={() => setSalvo(false)} /></Campo>
            <Campo rotulo="E-mail de acesso"><input className="campo" disabled defaultValue={`${pessoa.nome.split(" ")[0]!.toLowerCase()}@exemplo.com`} /></Campo>
            <div className="flex items-center gap-3"><button className="botao-primario" onClick={() => setSalvo(true)}>Salvar</button>{salvo && <span className="text-sm text-tatame">Dados salvos.</span>}</div>
          </div>
        </Secao>
        <Secao titulo="Minha escala">
          <table className="tabela">
            <thead><tr><th>Evento</th><th>Dia</th><th>Função</th><th>Tatame</th></tr></thead>
            <tbody>
              <tr><td className="font-medium">Copa Horizonte 2026</td><td>Sábado · Gi</td><td>Mesário</td><td><Selo tom="ok">Tatame {TATAME_DO_MESARIO}</Selo></td></tr>
              <tr><td className="font-medium">Copa Horizonte 2026</td><td>Domingo · No-Gi</td><td>Mesário</td><td><Selo tom="ok">Tatame {TATAME_DO_MESARIO}</Selo></td></tr>
            </tbody>
          </table>
          <p className="mt-3 text-xs text-tinta-3">Quem define a escala é a organização do evento. Esta conta enxerga só a fila e o placar do tatame em que foi escalada.</p>
        </Secao>
      </div>
    </>
  );
}

export function Placar() {
  const { tatame, catId, lutaId } = useParams();
  const [sp] = useSearchParams();
  const nav = useNavigate();
  const d = useDados();
  const cat = d.categoriaPorId.get(decodeURIComponent(catId ?? ""));
  const luta = cat && d.resolvidas.get(cat.id)?.lutas.find((l) => l.id === lutaId);
  const total = (cat?.minutos ?? 5) * 60;
  const [resta, setResta] = useState(total);
  const [rodando, setRodando] = useState(false);
  const [m, setM] = useState<[Marcador, Marcador]>([zero, zero]);
  const [encerrando, setEncerrando] = useState(false);
  const [combatividade, setCombatividade] = useState<{ lado: 0 | 1; resta: number } | null>(null);
  const [vencedor, setVencedor] = useState<{ lado: 0 | 1; metodo: string; registro: string; semSegundaLuta?: boolean } | null>(null);
  const [aviso, setAviso] = useState("");
  const historico = useRef<[Marcador, Marcador][]>([]);
  const lances = useRef<{ t: number; lado: 0 | 1; texto: string }[]>([]);
  const iniciadaEm = useRef<string | undefined>(undefined);
  useEffect(() => { if (rodando && !iniciadaEm.current) iniciadaEm.current = new Date().toISOString(); }, [rodando]);
  const pessoa = usePessoa();

  useEffect(() => {
    if (!rodando) return;
    const t = setInterval(() => setResta((r) => { if (r <= 1) { setRodando(false); return 0; } return r - 1; }), 1000);
    return () => clearInterval(t);
  }, [rodando]);
  // a contagem de combatividade corre junto com o relógio da luta
  useEffect(() => {
    if (!rodando || !combatividade) return;
    const t = setInterval(() => setCombatividade((c) => (c && c.resta > 0 ? { ...c, resta: c.resta - 1 } : c)), 1000);
    return () => clearInterval(t);
  }, [rodando, combatividade?.lado]);

  // tudo o que muda na luta vai para a tela do público do tatame; ao sair do placar, a tela volta ao intervalo
  const noTatame = Number(tatame);
  const valida = !!(cat && luta && luta.a && luta.b);
  useEffect(() => {
    if (!valida) return;
    const ch = d.chaves.get(cat!.id)!;
    publicarTela(noTatame, { luta: {
      lados: [luta!.a, luta!.b].map((id) => ({ nome: d.nomeDe(id), equipe: d.equipeDe(id) })), m, resta, rodando, iniciada: resta !== total || rodando,
      rotulo: `${tatame}-${ch.lutas.findIndex((l) => l.id === luta!.id) + 1}`, categoria: tituloDaCategoria(cat!), fase: nomeRodada(luta!.rodada, ch.totalRodadas),
      combatividade, vencedor: vencedor && { lado: vencedor.lado, metodo: vencedor.metodo },
    } });
  }, [valida, m, resta, rodando, combatividade, vencedor]);
  useEffect(() => () => publicarTela(noTatame, { luta: null }), [noTatame]);

  if (!cat || !luta || !luta.a || !luta.b) return <div className="p-10"><Vazio>Luta não encontrada ou ainda sem os dois atletas definidos.</Vazio></div>;
  // a luta só abre no tatame em que está na fila: trocar o número no endereço não dá acesso
  const blocoDaLuta = d.blocos.find((b) => b.categoria.id === cat.id);
  const tatameDaLuta = d.estado.remanejadas[chaveDoResultado(cat.id, luta.id)]?.tatame ?? blocoDaLuta?.tatame;
  if (!blocoDaLuta || tatameDaLuta !== Number(tatame)) return <div className="p-10"><Vazio>Esta luta não está na fila do Tatame {tatame}. Para operá-la aqui, use "Trazer luta de outro tatame" na fila. <Link to="/app/mesa" className="font-medium text-marinho hover:underline">Voltar à fila</Link></Vazio></div>;
  const voltar = `/app/mesa?dia=${sp.get("dia") ?? 1}&tatame=${tatame}`;
  const lados = [luta.a, luta.b] as const;
  const chave = d.chaves.get(cat.id)!;
  const ate15 = regrasIbjjf.ehAte15Anos(cat.divisao);
  const somar = (lado: 0 | 1, campo: keyof Marcador, n: number) => {
    historico.current.push(m);
    lances.current.push({ t: total - resta, lado, texto: campo === "pontos" ? `+${n} pontos` : "Vantagem" });
    setAviso("");
    setM((x) => { const c: [Marcador, Marcador] = [{ ...x[0] }, { ...x[1] }]; c[lado][campo] = Math.max(0, c[lado][campo] + n); return c; });
  };
  /** Marca a punição e aplica a consequência prevista no Livro de Regras, art. 7.2.1 e 7.2.4, num só passo. */
  const punir = (lado: 0 | 1) => {
    const outro = (1 - lado) as 0 | 1;
    const numero = m[lado].punicoes + 1;
    const efeito = regrasIbjjf.efeitoDaPunicao(numero, ate15);
    historico.current.push(m);
    lances.current.push({ t: total - resta, lado, texto: `${numero}ª punição por ${combatividade?.lado === lado ? "falta de combatividade" : "falta grave"}${efeito.desclassifica ? " (desclassificação)" : efeito.pontosAoOponente ? " (dois pontos ao oponente)" : efeito.vantagemAoOponente ? " (vantagem ao oponente)" : ""}` });
    const c: [Marcador, Marcador] = [{ ...m[0] }, { ...m[1] }];
    c[lado].punicoes = numero;
    c[outro].vantagens += efeito.vantagemAoOponente;
    c[outro].pontos += efeito.pontosAoOponente;
    setM(c);
    if (combatividade?.lado === lado) setCombatividade(null);
    const nome = d.nomeDe(lados[lado]);
    setAviso(efeito.desclassifica ? `${numero}ª punição de ${nome}: desclassificação.` : efeito.pontosAoOponente ? `${numero}ª punição de ${nome}: dois pontos para o oponente.` : efeito.vantagemAoOponente ? `${numero}ª punição de ${nome}: uma vantagem para o oponente.` : `1ª punição de ${nome}: só a marcação.`);
    if (efeito.desclassifica) anunciar(outro, "DQ do oponente");
  };
  const desfazer = () => { const ant = historico.current.pop(); if (ant) { lances.current.pop(); setM(ant); setAviso(""); } };
  const anunciar = (lado: 0 | 1, metodo: string) => {
    const placar = metodo === "Pontos" ? ` ${m[0].pontos}x${m[1].pontos}` : "";
    setRodando(false); setCombatividade(null); setEncerrando(false);
    // chave de três: quem não comparece à primeira luta perde o direito à segunda (Regulamento Geral, art. 2.3.4)
    const semSegundaLuta = chave.formato === "chave-de-tres" && luta.id === "L1" && metodo === "W.O.";
    setVencedor({ lado, metodo: metodo === "DQ do oponente" ? "desclassificação" : metodo, registro: metodo + placar, semSegundaLuta });
  };
  const confirmar = () => {
    if (!vencedor) return;
    d.despachar({ tipo: "resultado", chave: chaveDoResultado(cat.id, luta.id), resultado: { vencedorId: lados[vencedor.lado], metodo: vencedor.registro, perdedorSemDireitoASegundaLuta: vencedor.semSegundaLuta || undefined },
      sumula: { tatame: noTatame, mesario: pessoa.nome, encerradaEm: new Date().toISOString(), iniciadaEm: iniciadaEm.current, duracao: total - resta, regulamentar: total, placar: m, metodo: vencedor.metodo, lances: lances.current } });
    nav(voltar);
  };
  // pontos, depois vantagens, depois menos punições (Livro de Regras, art. 2.5); empate total é decisão do árbitro
  const sugerido = regrasIbjjf.vencedorPeloPlacar(m[0], m[1]);

  const botao = "rounded-md px-1 py-2.5 text-xs font-semibold sm:text-sm";
  const controles = (lado: 0 | 1) => (
    <div key={lado} className="flex-1 rounded-lg bg-white/5 p-2.5">
      <div className="mb-2 flex items-center gap-2 text-sm"><span className={`h-3 w-3 rounded-sm ${lado === 0 ? "bg-[#F8D91D]" : "border border-white/60 bg-black"}`} /><span className="truncate font-semibold">{d.nomeDe(lados[lado])}</span></div>
      <div className="grid grid-cols-3 gap-2">
        {[2, 3, 4].map((n) => <button key={n} onClick={() => somar(lado, "pontos", n)} className={`${botao} bg-white !text-xl text-tinta`}>+{n}</button>)}
        <button onClick={() => somar(lado, "vantagens", 1)} className={`${botao} border border-[#4ADE4A]/70 text-[#4ADE4A]`}>+ Vantagem</button>
        <button onClick={() => punir(lado)} className={`${botao} bg-perigo text-white`}>+ Punição</button>
        <button onClick={() => setCombatividade(combatividade?.lado === lado ? null : { lado, resta: COMBATIVIDADE_SEG })} className={`${botao} ${combatividade?.lado === lado ? "bg-[#F8D91D] text-black" : "border border-white/30 text-white"}`}>{combatividade?.lado === lado ? "Parar contagem" : "Combatividade"}</button>
      </div>
    </div>
  );

  const rotulo = `${tatame}-${chave.lutas.findIndex((l) => l.id === luta.id) + 1}`;
  const seguintes = filaDoTatame(d, Number(sp.get("dia") ?? 1), noTatame).filter((f) => !f.vencedorId && f.pronta && !(f.bloco.categoria.id === cat.id && f.lutaId === luta.id)).slice(0, 3);
  return (
    <div className="min-h-screen bg-[#17181A] p-3 text-white">
      <div className="mb-2 flex flex-wrap items-center gap-x-4 gap-y-1">
        <Link to={voltar} className="text-sm opacity-70 hover:opacity-100">← Fila do tatame {tatame}</Link>
        <span className="rounded bg-white/10 px-2 py-0.5 font-mono text-xs">Luta {rotulo}</span>
        <span className="min-w-0 flex-1 truncate text-sm text-white/70">{cat.nome} · {nomeRodada(luta.rodada, chave.totalRodadas)}</span>
        <span className="text-xs uppercase tracking-wide text-white/40">Visão do mesário</span>
        <RelatarOcorrencia tatame={noTatame} escuro />
        <button className="rounded border border-white/30 px-3 py-1.5 text-xs hover:bg-white/10" onClick={() => window.open(enderecoDaTela(noTatame), `tela-tatame-${noTatame}`, "popup,width=1280,height=720")}>Abrir tela do público</button>
      </div>
      {/* o mesmo placar que o público vê, na proporção do vídeo de referência */}
      <div id="placar-mesario" className="mx-auto overflow-hidden" style={{ maxWidth: "calc(58vh * 16 / 9)" }}>
        <Telao altura="auto" lados={lados.map((id) => ({ nome: d.nomeDe(id), equipe: d.equipeDe(id) }))} m={m} resta={resta} rodando={rodando} iniciada={resta !== total || rodando}
          rotulo={rotulo} categoria={tituloDaCategoria(cat)} fase={nomeRodada(luta.rodada, chave.totalRodadas)} combatividade={combatividade} vencedor={vencedor} />
      </div>
      <div className="mx-auto mt-3 space-y-2" style={{ maxWidth: "calc(58vh * 16 / 9)" }}>
        {vencedor ? (
          <div className="flex flex-wrap items-center justify-between gap-3 rounded-lg bg-white/5 p-4">
            <span>Resultado anunciado na tela do público: <b>{d.nomeDe(lados[vencedor.lado])}</b> por {vencedor.metodo.toLowerCase()}.{vencedor.semSegundaLuta ? " Na chave de três, quem não compareceu perde o direito à segunda luta." : ""}</span>
            <span className="flex gap-2"><button onClick={() => setVencedor(null)} className="rounded border border-white/30 px-3 py-2 text-sm">Corrigir</button><button onClick={confirmar} className="rounded bg-ouro px-4 py-2 text-sm font-semibold text-tinta">Confirmar e voltar à fila</button></span>
          </div>
        ) : (
          <>
            <div className="flex flex-wrap items-center gap-2">
              <button id="relogio-mesario" onClick={() => setRodando((r) => !r)} className="rounded bg-white px-8 py-3 text-base font-semibold text-tinta">{rodando ? "Pausar" : resta === total ? "Iniciar" : "Retomar"}</button>
              <button onClick={() => { setRodando(false); setResta(total); }} className="rounded border border-white/30 px-3 py-3 text-sm">Zerar relógio</button>
              <button onClick={desfazer} className="rounded border border-white/30 px-3 py-3 text-sm">Desfazer</button>
              <span className="min-w-0 flex-1 truncate px-2 text-xs text-white/40">{seguintes[0] ? `A seguir: ${d.nomeDe(seguintes[0].a)} x ${d.nomeDe(seguintes[0].b)} · ${hhmm(seguintes[0].horario)}` : ""}</span>
              <button onClick={() => setEncerrando(true)} className="rounded bg-ouro px-6 py-3 text-sm font-semibold text-tinta">Encerrar luta</button>
            </div>
            <div className="flex flex-col gap-2 md:flex-row">{controles(0)}{controles(1)}</div>
            {aviso && <div className="rounded-md bg-[#F8D91D]/15 px-3 py-2 text-sm text-[#F8D91D]">{aviso} Use "Desfazer" se foi engano.</div>}
          </>
        )}
      </div>

      {encerrando && (
        <div className="fixed inset-0 z-50 grid place-items-center bg-black/60 p-4" onClick={() => setEncerrando(false)}>
          <div className="cartao w-full max-w-xl p-6" onClick={(e) => e.stopPropagation()}>
            <h2 className="text-2xl font-semibold">Encerrar luta</h2>
            <p className="mb-4 text-sm text-tinta-2">Escolha o vencedor e o método. O telão anuncia o vencedor, e você confirma antes de o resultado avançar a chave.</p>
            <div className="grid gap-4 sm:grid-cols-2">
              {([0, 1] as const).map((lado) => (
                <div key={lado} className={`rounded-md border p-3 ${sugerido === lado ? "border-tatame bg-tatame-claro" : "border-linha"}`}>
                  <div className="font-semibold">{d.nomeDe(lados[lado])}</div>
                  <div className="mb-2 text-xs text-tinta-3">{m[lado].pontos} pts · {m[lado].vantagens} vant. · {m[lado].punicoes} pun.{sugerido === lado ? " · à frente no placar" : ""}</div>
                  <div className="flex flex-wrap gap-1.5">
                    {["Pontos", "Finalização", "Decisão", "W.O.", "Desclassificação"].map((met) => (
                      <button key={met} className="botao-contorno !px-2 !py-1 text-xs" onClick={() => anunciar(lado, met === "Desclassificação" ? "DQ do oponente" : met)}>{met === "Desclassificação" ? "Oponente DQ" : met}</button>
                    ))}
                  </div>
                </div>
              ))}
            </div>
            <button className="botao-contorno mt-4" onClick={() => setEncerrando(false)}>Cancelar</button>
          </div>
        </div>
      )}
    </div>
  );
}

export function TV() {
  const d = useDados();
  const [sp] = useSearchParams();
  const dia = Number(sp.get("dia") ?? 1);
  const { id } = useParams();
  if (id !== EVENTO_ID) return <div className="grid min-h-screen place-items-center bg-[#1D1E1F] p-6 text-center text-white"><div><div className="text-2xl font-semibold">Evento não encontrado</div><Link to="/" className="mt-5 inline-block rounded-md bg-white px-4 py-2 text-sm font-medium text-marinho">Ver eventos</Link></div></div>;
  if (!d.estado.config.painelPublico && !d.estado.sessao) return (
    <div className="grid min-h-screen place-items-center bg-[#1D1E1F] p-6 text-center text-white">
      <div><div className="text-2xl font-semibold">Painel restrito</div><p className="mt-2 text-white/70">A organização deste evento reservou o painel para quem está logado.</p><Link to="/entrar" className="mt-5 inline-block rounded-md bg-white px-4 py-2 text-sm font-medium text-marinho">Entrar</Link></div>
    </div>
  );
  return (
    <div className="min-h-screen bg-[#1D1E1F] p-4 text-white">
      <div className="mb-4 flex items-center justify-between">
        <div className="font-display text-3xl font-bold uppercase">Próximas lutas<span className="text-ouro">.</span></div>
        <Link to={`/eventos/${EVENTO_ID}`} className="text-sm opacity-60 hover:opacity-100">Copa Horizonte 2026 · voltar ao evento</Link>
      </div>
      <div className="grid gap-3 md:grid-cols-2 xl:grid-cols-3">
        {[1, 2, 3, 4, 5, 6].map((t) => {
          const pendentes = filaDoTatame(d, dia, t).filter((f) => !f.vencedorId);
          const prontas = pendentes.filter((f) => f.pronta).slice(0, 4);
          return (
            <div key={t} className="overflow-hidden rounded-lg border border-white/15 bg-white/5">
              <div className="flex items-center justify-between bg-marinho px-4 py-2"><span className="font-display text-2xl font-semibold">Tatame {t}</span><span className="font-mono text-xs">{pendentes.length} lutas restantes</span></div>
              {prontas.map((f, k) => (
                <div key={f.bloco.categoria.id + f.lutaId} className={`border-b border-white/10 px-4 py-3 last:border-0 ${k === 0 ? "bg-white text-tinta" : ""}`}>
                  <div className="flex justify-between font-mono text-[11px] opacity-60"><span>{k === 0 ? "No tatame" : `Em seguida · ${hhmm(f.horario)}`}</span><span>{f.bloco.categoria.divisao} · {f.bloco.categoria.faixa} · {f.bloco.categoria.peso}</span></div>
                  <div className={`font-display font-bold leading-tight ${k === 0 ? "text-2xl" : "text-lg"}`}>{d.nomeDe(f.a)} <span className="opacity-40">x</span> {d.nomeDe(f.b)}</div>
                </div>
              ))}
              {!prontas.length && <div className="px-4 py-6 text-sm opacity-50">Sem lutas pendentes.</div>}
            </div>
          );
        })}
      </div>
    </div>
  );
}

/** Coordenação: situação de todos os tatames em uma tela, para a direção técnica. */
export function Arena() {
  const d = useDados();
  const [dia, setDia] = useState(1);
  return (
    <>
      <Titulo sobre="Coordenação de tatames" acoes={<Link to={`/eventos/${EVENTO_ID}/painel?dia=${dia}`} className="botao-contorno">Abrir painel do ginásio</Link>}>Copa Horizonte 2026</Titulo>
      <div className="mb-4 flex gap-2">{[1, 2].map((x) => <button key={x} onClick={() => setDia(x)} className={dia === x ? "botao-primario" : "botao-contorno"}>{x === 1 ? "Sábado · Gi" : "Domingo · No-Gi"}</button>)}</div>
      <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
        {[1, 2, 3, 4, 5, 6].map((t) => {
          const fila = filaDoTatame(d, dia, t);
          const feitas = fila.filter((f) => f.vencedorId).length;
          const pendentes = fila.filter((f) => !f.vencedorId);
          const atual = pendentes.find((f) => f.pronta);
          const seguinte = pendentes.filter((f) => f !== atual)[0];
          return (
            <div key={t} className="cartao overflow-hidden">
              <div className="flex items-center justify-between bg-marinho px-4 py-2.5 text-white"><span className="font-semibold">Tatame {t}</span><span className="font-mono text-xs opacity-80">{feitas}/{fila.length} lutas</span></div>
              <div className="h-1.5 bg-linha"><div className="h-full bg-tatame" style={{ width: `${fila.length ? (feitas / fila.length) * 100 : 0}%` }} /></div>
              <div className="space-y-3 p-4 text-sm">
                {atual ? (
                  <div><div className="rotulo">Na vez · {hhmm(atual.horario)} · {nomeRodada(atual.rodada, atual.bloco.chave.totalRodadas)}</div>
                    <div className="mt-1 font-medium">{d.nomeDe(atual.a)} <span className="font-normal text-tinta-3">x</span> {d.nomeDe(atual.b)}</div>
                    <div className="text-xs text-tinta-3">{atual.bloco.categoria.nome}</div></div>
                ) : <div className="text-tinta-3">{fila.length ? "Tatame encerrado." : "Sem lutas neste dia."}</div>}
                {seguinte && <div className="border-t border-linha/70 pt-3"><div className="rotulo">Em seguida · {hhmm(seguinte.horario)}</div><div className="mt-1 text-tinta-2">{d.nomeDe(seguinte.a)} x {d.nomeDe(seguinte.b)}</div></div>}
                <Link to={`/app/mesa?dia=${dia}&tatame=${t}`} className="botao-contorno w-full">Abrir mesa do tatame</Link>
              </div>
            </div>
          );
        })}
      </div>
      {Object.keys(d.estado.remanejadas).length > 0 && (
        <div className="cartao mt-5 p-5">
          <h2 className="mb-3 text-lg font-semibold">Lutas remanejadas</h2>
          <table className="tabela"><thead><tr><th>Hora</th><th>Luta</th><th>De</th><th>Para</th><th>Motivo</th><th>Quem</th></tr></thead>
            <tbody>{Object.entries(d.estado.remanejadas).map(([chave, r]) => { const [catId, lutaId] = chave.split("::"); const l = d.resolvidas.get(catId!)?.lutas.find((x) => x.id === lutaId); return (
              <tr key={chave}><td className="font-mono text-xs">{r.quando}</td><td className="font-medium">{d.nomeDe(l?.a)} x {d.nomeDe(l?.b)}<div className="text-xs font-normal text-tinta-3">{d.categoriaPorId.get(catId!)?.nome}</div></td><td>T{r.origem}</td><td>T{r.tatame}</td><td>{r.motivo}</td><td>{r.quem}</td></tr>
            ); })}</tbody></table>
        </div>
      )}
      <p className="mt-3 max-w-3xl text-xs text-tinta-3">No produto, esta tela mostra o atraso de cada tatame e permite mover uma categoria para um tatame livre.</p>
    </>
  );
}
