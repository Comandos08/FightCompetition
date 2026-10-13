import { useEffect, useRef, useState } from "react";
import { Link, useNavigate, useParams, useSearchParams } from "react-router-dom";
import { useDados, type Contexto } from "@/data/store";
import { EVENTO_ID } from "@/data/seed";
import { TATAME_DO_MESARIO } from "@/data/sessao";
import { Selo, Titulo, Vazio } from "@/components/ui";
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
      <Titulo sobre="Mesa do tatame" acoes={<>{!soMeuTatame && <Link to="/app/mesa/arena" className="botao-contorno">Todos os tatames</Link>}<Link to={`/eventos/${EVENTO_ID}/painel?dia=${dia}`} className="botao-contorno">Abrir painel do ginásio</Link></>}>Tatame {tatame}</Titulo>
      <div className="mb-4 flex flex-wrap items-center gap-2">
        {[1, 2].map((x) => <button key={x} onClick={() => mudar("dia", x)} className={dia === x ? "botao-primario" : "botao-contorno"}>{x === 1 ? "Sábado · Gi" : "Domingo · No-Gi"}</button>)}
        <span className="mx-1 h-6 w-px bg-linha" />
        {soMeuTatame ? <span className="text-sm text-tinta-2">Você foi escalado para o Tatame {tatame}.</span> : [1, 2, 3, 4, 5, 6].map((t) => <button key={t} onClick={() => mudar("tatame", t)} className={tatame === t ? "botao-primario" : "botao-contorno"}>T{t}</button>)}
        <span className="ml-auto" /><PuxarLuta dia={dia} tatame={tatame} />
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
            {f.vencedorId ? <Selo tom="ok">{f.metodo ?? "encerrada"}</Selo>
              : f.pronta ? <span className="flex items-center gap-2">{f.veioDe && <button className="botao-contorno !py-1.5 text-xs" onClick={() => d.despachar({ tipo: "remanejar", chave: chaveDoResultado(f.bloco.categoria.id, f.lutaId), remanejo: null })}>Devolver ao T{f.veioDe}</button>}<Link className="botao-acao" to={`/app/mesa/placar/${tatame}/${encodeURIComponent(f.bloco.categoria.id)}/${f.lutaId}?dia=${dia}`}>Abrir placar</Link></span>
              : <Selo>aguarda luta anterior</Selo>}
          </div>
        ))}
      </div>
    </>
  );
}

interface Marcador { pontos: number; vantagens: number; punicoes: number; }
const zero: Marcador = { pontos: 0, vantagens: 0, punicoes: 0 };
const COMBATIVIDADE_SEG = 20;

/**
 * Telão da luta: o que atleta, técnico e público enxergam. Dois atletas empilhados, placar grande à direita,
 * vantagem e punição ao lado, e a barra de baixo com a luta, a categoria e o relógio.
 * As medidas são proporcionais à altura do próprio telão, para caber em qualquer tela.
 */
function Telao({ altura, lados, m, resta, rodando, iniciada, rotulo, categoria, fase, combatividade, vencedor }: {
  altura: string; lados: { nome: string; equipe: string }[]; m: [Marcador, Marcador]; resta: number; rodando: boolean; iniciada: boolean;
  rotulo: string; categoria: string; fase: string; combatividade: { lado: 0 | 1; resta: number } | null; vencedor: { lado: 0 | 1; metodo: string } | null;
}) {
  const linha = (lado: 0 | 1) => (
    <div className="flex min-h-0 flex-[35] items-stretch border-b-[0.5cqh] border-black">
      <div className="flex min-w-0 flex-1 flex-col justify-center pl-[1.4cqw]">
        <div className="truncate font-semibold leading-none text-white" style={{ fontSize: "13.5cqh" }}>{lados[lado]!.nome}</div>
        <div className="truncate font-medium leading-none text-white/45" style={{ fontSize: "8.6cqh", marginTop: "1.2cqh" }}>{lados[lado]!.equipe}</div>
      </div>
      {combatividade?.lado === lado && (
        <div className="my-[2.2cqh] mr-[1.2cqw] flex flex-col items-center justify-center rounded-[0.8cqh] bg-[#F5E61E] px-[1.6cqw] leading-none text-[#3A1010]">
          <div className="font-bold tabular-nums" style={{ fontSize: "15cqh" }}>{seg(combatividade.resta)}</div>
          <div className="font-semibold" style={{ fontSize: "5.4cqh" }}>Combatividade</div>
        </div>
      )}
      <div className="flex w-[7cqw] shrink-0 flex-col items-center justify-center leading-none">
        <div className={m[lado].vantagens ? "text-[#4ADE4A]" : "text-white/45"} style={{ fontSize: "1.9cqh" }}>Vantagem</div>
        <div className={`font-semibold tabular-nums ${m[lado].vantagens ? "text-[#4ADE4A]" : "text-white/45"}`} style={{ fontSize: "10.5cqh" }}>{m[lado].vantagens}</div>
        <div className={m[lado].punicoes ? "text-[#E0263C]" : "text-white/45"} style={{ fontSize: "1.9cqh", marginTop: "1cqh" }}>Punição</div>
        <div className={`font-semibold tabular-nums ${m[lado].punicoes ? "text-[#E0263C]" : "text-white/45"}`} style={{ fontSize: "10.5cqh" }}>{m[lado].punicoes}</div>
      </div>
      <div className={`grid shrink-0 place-items-center font-bold leading-none tabular-nums ${lado === 0 ? "bg-[#F5E61E] text-[#12964B]" : "bg-black text-white"}`} style={{ width: "34.5cqh", fontSize: "31cqh" }}>{m[lado].pontos}</div>
    </div>
  );
  return (
    <div className="relative flex select-none flex-col overflow-hidden bg-[#222326] font-placar uppercase" style={{ height: altura, containerType: "size" }}>
      {linha(0)}{linha(1)}
      <div className="flex min-h-0 flex-[30] items-stretch">
        <div className="grid shrink-0 place-items-center bg-white px-[1.6cqw] font-semibold leading-none text-black" style={{ fontSize: "19cqh" }}>{rotulo}</div>
        <div className="flex min-w-0 flex-1 flex-col justify-center pl-[1.4cqw] leading-none">
          <div className="truncate font-medium text-white" style={{ fontSize: "6.6cqh" }}>{categoria}</div>
          <div className="font-medium text-[#F5E61E]" style={{ fontSize: "6.6cqh", marginTop: "1.4cqh" }}>{fase}</div>
        </div>
        <div className={`flex items-center pr-[1.2cqw] font-semibold leading-none tabular-nums ${!iniciada ? "text-white/40" : rodando ? "text-white" : "text-[#F2C81E]"}`} style={{ fontSize: "27cqh" }}>{seg(resta)}</div>
      </div>
      {vencedor && (
        <div className="absolute inset-x-0 top-0 flex flex-col items-center justify-center bg-[#222326]" style={{ height: "70.5%" }}>
          <div className="bg-[#F5E61E] px-[1.2cqw] font-semibold leading-tight text-black" style={{ fontSize: "8cqh" }}>Vencedor por {vencedor.metodo}</div>
          <div className="font-semibold leading-none text-white" style={{ fontSize: "20cqh", marginTop: "2.5cqh" }}>{lados[vencedor.lado]!.nome}</div>
          <div className="font-medium leading-none text-white/45" style={{ fontSize: "8.6cqh", marginTop: "2cqh" }}>{lados[vencedor.lado]!.equipe}</div>
        </div>
      )}
    </div>
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
  const [vencedor, setVencedor] = useState<{ lado: 0 | 1; metodo: string; registro: string } | null>(null);
  const [telao, setTelao] = useState(false);
  const historico = useRef<[Marcador, Marcador][]>([]);

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

  if (!cat || !luta || !luta.a || !luta.b) return <div className="p-10"><Vazio>Luta não encontrada ou ainda sem os dois atletas definidos.</Vazio></div>;
  // a luta só abre no tatame em que está na fila: trocar o número no endereço não dá acesso
  const blocoDaLuta = d.blocos.find((b) => b.categoria.id === cat.id);
  const tatameDaLuta = d.estado.remanejadas[chaveDoResultado(cat.id, luta.id)]?.tatame ?? blocoDaLuta?.tatame;
  if (!blocoDaLuta || tatameDaLuta !== Number(tatame)) return <div className="p-10"><Vazio>Esta luta não está na fila do Tatame {tatame}. Para operá-la aqui, use "Trazer luta de outro tatame" na fila. <Link to="/app/mesa" className="font-medium text-marinho hover:underline">Voltar à fila</Link></Vazio></div>;
  const voltar = `/app/mesa?dia=${sp.get("dia") ?? 1}&tatame=${tatame}`;
  const lados = [luta.a, luta.b] as const;
  const chave = d.chaves.get(cat.id)!;
  const somar = (lado: 0 | 1, campo: keyof Marcador, n: number) => {
    historico.current.push(m);
    setM((x) => { const c: [Marcador, Marcador] = [{ ...x[0] }, { ...x[1] }]; c[lado][campo] = Math.max(0, c[lado][campo] + n); return c; });
  };
  const desfazer = () => { const ant = historico.current.pop(); if (ant) setM(ant); };
  const anunciar = (lado: 0 | 1, metodo: string) => {
    const placar = metodo === "Pontos" ? ` ${m[0].pontos}x${m[1].pontos}` : "";
    setRodando(false); setCombatividade(null); setEncerrando(false);
    setVencedor({ lado, metodo: metodo === "DQ do oponente" ? "desclassificação" : metodo, registro: metodo + placar });
  };
  const confirmar = () => {
    if (!vencedor) return;
    d.despachar({ tipo: "resultado", chave: chaveDoResultado(cat.id, luta.id), resultado: { vencedorId: lados[vencedor.lado], metodo: vencedor.registro } });
    nav(voltar);
  };
  const sugerido: 0 | 1 | null = m[0].pontos !== m[1].pontos ? (m[0].pontos > m[1].pontos ? 0 : 1) : m[0].vantagens !== m[1].vantagens ? (m[0].vantagens > m[1].vantagens ? 0 : 1) : m[0].punicoes !== m[1].punicoes ? (m[0].punicoes < m[1].punicoes ? 0 : 1) : null;

  const controles = (lado: 0 | 1) => (
    <div key={lado} className="flex-1 rounded-lg bg-white/5 p-3">
      <div className="mb-2 flex items-center gap-2 text-sm text-white"><span className={`h-3 w-3 rounded-sm ${lado === 0 ? "bg-[#F5E61E]" : "border border-white/60 bg-black"}`} /><span className="truncate font-semibold">{d.nomeDe(lados[lado])}</span></div>
      <div className="grid grid-cols-3 gap-2">
        {[2, 3, 4].map((n) => <button key={n} onClick={() => somar(lado, "pontos", n)} className="rounded-md bg-white py-3 text-xl font-semibold text-tinta">+{n}</button>)}
        <button onClick={() => somar(lado, "vantagens", 1)} className="rounded-md border border-[#4ADE4A]/70 py-2.5 text-sm font-semibold text-[#4ADE4A]">+ Vantagem</button>
        <button onClick={() => somar(lado, "punicoes", 1)} className="rounded-md bg-perigo py-2.5 text-sm font-semibold text-white">+ Punição</button>
        <button onClick={() => setCombatividade(combatividade?.lado === lado ? null : { lado, resta: COMBATIVIDADE_SEG })} className={`rounded-md py-2.5 text-sm font-semibold ${combatividade?.lado === lado ? "bg-[#F5E61E] text-black" : "border border-white/30 text-white"}`}>{combatividade?.lado === lado ? "Parar contagem" : "Combatividade"}</button>
      </div>
    </div>
  );

  return (
    <div className="flex min-h-screen flex-col bg-[#17181A]">
      <Telao altura={telao ? "100vh" : "min(62vh, 56.25vw)"} lados={lados.map((id) => ({ nome: d.nomeDe(id), equipe: d.equipeDe(id) }))} m={m} resta={resta} rodando={rodando} iniciada={resta !== total || rodando}
        rotulo={`${tatame}-${chave.lutas.findIndex((l) => l.id === luta.id) + 1}`} categoria={`${cat.modalidade === "Gi" ? "Jiu-Jitsu" : "Jiu-Jitsu sem quimono"} / ${cat.nome.split(" · ").join(" / ")}`}
        fase={nomeRodada(luta.rodada, chave.totalRodadas)} combatividade={combatividade} vencedor={vencedor} />
      {telao ? (
        <button onClick={() => setTelao(false)} className="fixed right-3 top-3 z-40 rounded bg-black/50 px-3 py-1.5 text-xs text-white/70 hover:text-white">Sair do telão</button>
      ) : (
        <div className="flex-1 space-y-3 p-3 sm:p-4">
          {vencedor ? (
            <div className="flex flex-wrap items-center justify-between gap-3 rounded-lg bg-white/5 p-4 text-white">
              <span>Resultado anunciado no telão: <b>{d.nomeDe(lados[vencedor.lado])}</b> por {vencedor.metodo.toLowerCase()}.</span>
              <span className="flex gap-2"><button onClick={() => setVencedor(null)} className="rounded border border-white/30 px-3 py-2 text-sm">Corrigir</button><button onClick={confirmar} className="rounded bg-ouro px-4 py-2 text-sm font-semibold text-tinta">Confirmar e voltar à fila</button></span>
            </div>
          ) : (
            <>
              <div className="flex flex-wrap items-center gap-2 text-white">
                <Link to={voltar} className="mr-auto text-sm opacity-70 hover:opacity-100">← Fila do tatame {tatame}</Link>
                <button onClick={() => setRodando((r) => !r)} className="rounded bg-white px-5 py-2 text-sm font-semibold text-tinta">{rodando ? "Pausar" : resta === total ? "Iniciar" : "Retomar"}</button>
                <button onClick={() => { setRodando(false); setResta(total); }} className="rounded border border-white/30 px-3 py-2 text-sm">Zerar relógio</button>
                <button onClick={desfazer} className="rounded border border-white/30 px-3 py-2 text-sm">Desfazer</button>
                <button onClick={() => setTelao(true)} className="rounded border border-white/30 px-3 py-2 text-sm">Modo telão</button>
                <button onClick={() => setEncerrando(true)} className="rounded bg-ouro px-4 py-2 text-sm font-semibold text-tinta">Encerrar luta</button>
              </div>
              <div className="flex flex-col gap-3 md:flex-row">{controles(0)}{controles(1)}</div>
              <p className="text-xs text-white/40">A parte de cima é o que aparece no telão do tatame. A contagem de combatividade usa {COMBATIVIDADE_SEG} segundos como exemplo; o tempo oficial entra com o pacote de regras.</p>
            </>
          )}
        </div>
      )}

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
