import { useEffect, useRef, useState } from "react";
import { Link, useNavigate, useParams, useSearchParams } from "react-router-dom";
import { useDados, type Contexto } from "@/data/store";
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
}

export function filaDoTatame(d: Contexto, dia: number, tatame: number): ItemFila[] {
  return d.blocos.filter((b) => b.dia === dia && b.tatame === tatame).flatMap((bloco) => {
    const r = d.resolvidas.get(bloco.categoria.id)!;
    return r.lutas.map((l) => ({ bloco, lutaId: l.id, rodada: l.rodada, a: l.a, b: l.b, vencedorId: l.vencedorId, metodo: l.metodo, pronta: l.pronta, horario: horarioDaLuta(bloco, l.id) }));
  });
}

const seg = (s: number) => `${String(Math.floor(s / 60)).padStart(2, "0")}:${String(s % 60).padStart(2, "0")}`;

export function Mesa() {
  const d = useDados();
  const [sp, setSp] = useSearchParams();
  const dia = Number(sp.get("dia") ?? 1);
  const tatame = Number(sp.get("tatame") ?? 1);
  const [mostrarFeitas, setMostrarFeitas] = useState(false);
  const fila = filaDoTatame(d, dia, tatame);
  const feitas = fila.filter((f) => f.vencedorId).length;
  const visiveis = fila.filter((f) => mostrarFeitas || !f.vencedorId).slice(0, 40);
  const mudar = (k: string, v: number) => { const n = new URLSearchParams(sp); n.set(k, String(v)); setSp(n); };
  return (
    <>
      <Titulo sobre="Mesa do tatame" acoes={<Link to={`/tv?dia=${dia}`} className="botao-contorno">Abrir painel do ginásio</Link>}>Tatame {tatame}</Titulo>
      <div className="mb-4 flex flex-wrap items-center gap-2">
        {[1, 2].map((x) => <button key={x} onClick={() => mudar("dia", x)} className={dia === x ? "botao-primario" : "botao-contorno"}>{x === 1 ? "Sábado · Gi" : "Domingo · No-Gi"}</button>)}
        <span className="mx-1 h-6 w-px bg-linha" />
        {[1, 2, 3, 4, 5, 6].map((t) => <button key={t} onClick={() => mudar("tatame", t)} className={tatame === t ? "botao-acao" : "botao-contorno"}>T{t}</button>)}
        <label className="ml-auto flex items-center gap-2 text-sm text-tinta-2"><input type="checkbox" checked={mostrarFeitas} onChange={(e) => setMostrarFeitas(e.target.checked)} /> Mostrar encerradas</label>
      </div>
      <div className="mb-3 h-1.5 overflow-hidden rounded-full bg-linha"><div className="h-full bg-tatame transition-all" style={{ width: `${fila.length ? (feitas / fila.length) * 100 : 0}%` }} /></div>
      <div className="mb-4 text-sm text-tinta-3">{feitas} de {fila.length} lutas encerradas neste tatame</div>
      {!visiveis.length && <Vazio>Nenhuma luta pendente neste tatame.</Vazio>}
      <div className="space-y-2">
        {visiveis.map((f) => (
          <div key={f.bloco.categoria.id + f.lutaId} className={`cartao flex flex-wrap items-center gap-4 p-3 ${f.pronta ? "border-acao/50" : ""} ${f.vencedorId ? "opacity-60" : ""}`}>
            <div className="w-14 text-center"><div className="font-mono text-lg font-semibold">{hhmm(f.horario)}</div><div className="rotulo">previsto</div></div>
            <div className="min-w-[14rem] flex-1">
              <div className="rotulo">{f.bloco.categoria.nome} · {nomeRodada(f.rodada, f.bloco.chave.totalRodadas)}</div>
              <div className="mt-0.5 grid gap-x-6 sm:grid-cols-2">
                {[f.a, f.b].map((id, k) => (
                  <div key={k} className={`truncate ${f.vencedorId && f.vencedorId === id ? "font-semibold text-tatame" : ""} ${!id ? "italic text-tinta-3" : ""}`}>
                    {d.nomeDe(id)} <span className="text-xs text-tinta-3">{d.equipeDe(id)}</span>
                  </div>
                ))}
              </div>
            </div>
            {f.vencedorId ? <Selo tom="ok">{f.metodo ?? "encerrada"}</Selo>
              : f.pronta ? <Link className="botao-acao" to={`/app/mesa/placar/${tatame}/${encodeURIComponent(f.bloco.categoria.id)}/${f.lutaId}?dia=${dia}`}>Abrir placar</Link>
              : <Selo>aguarda luta anterior</Selo>}
          </div>
        ))}
      </div>
    </>
  );
}

interface Marcador { pontos: number; vantagens: number; punicoes: number; }
const zero: Marcador = { pontos: 0, vantagens: 0, punicoes: 0 };

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
  const historico = useRef<[Marcador, Marcador][]>([]);

  useEffect(() => {
    if (!rodando) return;
    const t = setInterval(() => setResta((r) => { if (r <= 1) { setRodando(false); return 0; } return r - 1; }), 1000);
    return () => clearInterval(t);
  }, [rodando]);

  if (!cat || !luta || !luta.a || !luta.b) return <div className="p-10"><Vazio>Luta não encontrada ou ainda sem os dois atletas definidos.</Vazio></div>;
  const voltar = `/app/mesa?dia=${sp.get("dia") ?? 1}&tatame=${tatame}`;
  const lados = [luta.a, luta.b] as const;
  const somar = (lado: 0 | 1, campo: keyof Marcador, n: number) => {
    historico.current.push(m);
    setM((x) => { const c: [Marcador, Marcador] = [{ ...x[0] }, { ...x[1] }]; c[lado][campo] = Math.max(0, c[lado][campo] + n); return c; });
  };
  const desfazer = () => { const ant = historico.current.pop(); if (ant) setM(ant); };
  const encerrar = (vencedor: 0 | 1, metodo: string) => {
    const placar = metodo === "Pontos" ? ` ${m[0].pontos}x${m[1].pontos}` : "";
    d.despachar({ tipo: "resultado", chave: chaveDoResultado(cat.id, luta.id), resultado: { vencedorId: lados[vencedor], metodo: metodo + placar } });
    nav(voltar);
  };
  const sugerido: 0 | 1 | null = m[0].pontos !== m[1].pontos ? (m[0].pontos > m[1].pontos ? 0 : 1) : m[0].vantagens !== m[1].vantagens ? (m[0].vantagens > m[1].vantagens ? 0 : 1) : m[0].punicoes !== m[1].punicoes ? (m[0].punicoes < m[1].punicoes ? 0 : 1) : null;

  const coluna = (lado: 0 | 1) => {
    const claro = lado === 1;
    return (
      <div key={lado} className={`flex flex-1 flex-col p-5 sm:p-8 ${claro ? "bg-white text-tinta" : "bg-tinta text-white"}`}>
        <div className="font-mono text-xs uppercase tracking-widest opacity-60">{d.equipeDe(lados[lado])}</div>
        <div className="font-display text-3xl font-extrabold leading-tight sm:text-5xl" style={{ fontStretch: "80%" }}>{d.nomeDe(lados[lado])}</div>
        <div className="my-4 flex flex-1 items-center justify-center">
          <div className="font-display text-[9rem] font-black leading-none tabular-nums sm:text-[13rem]" style={{ fontStretch: "76%" }}>{m[lado].pontos}</div>
        </div>
        <div className="mb-4 flex justify-center gap-8 font-mono text-sm">
          <span>Vantagens <b className="text-2xl">{m[lado].vantagens}</b></span>
          <span className="text-acao">Punições <b className="text-2xl">{m[lado].punicoes}</b></span>
        </div>
        <div className="grid grid-cols-5 gap-2">
          {[2, 3, 4].map((n) => <button key={n} onClick={() => somar(lado, "pontos", n)} className={`rounded-md py-4 font-display text-2xl font-extrabold ${claro ? "bg-tinta text-white" : "bg-white text-tinta"}`}>+{n}</button>)}
          <button onClick={() => somar(lado, "vantagens", 1)} className="rounded-md border border-current py-4 text-sm font-semibold">Vant.</button>
          <button onClick={() => somar(lado, "punicoes", 1)} className="rounded-md bg-acao py-4 text-sm font-semibold text-white">Punição</button>
        </div>
      </div>
    );
  };

  return (
    <div className="flex min-h-screen flex-col bg-tinta">
      <div className="flex flex-wrap items-center justify-between gap-3 bg-black px-4 py-2 text-white">
        <Link to={voltar} className="text-sm opacity-70 hover:opacity-100">← Fila do tatame {tatame}</Link>
        <div className="text-center text-xs opacity-70">{cat.modalidade} · {cat.nome} · {nomeRodada(luta.rodada, d.chaves.get(cat.id)!.totalRodadas)}</div>
        <div className="flex items-center gap-2">
          <button onClick={desfazer} className="rounded border border-white/30 px-3 py-1.5 text-sm">Desfazer</button>
          <button onClick={() => setEncerrando(true)} className="rounded bg-acao px-3 py-1.5 text-sm font-semibold">Encerrar luta</button>
        </div>
      </div>
      <div className="flex items-center justify-center gap-4 bg-black/80 py-3 text-white">
        <button onClick={() => setRodando((r) => !r)} className="rounded bg-white px-4 py-2 text-sm font-semibold text-tinta">{rodando ? "Pausar" : resta === total ? "Iniciar" : "Retomar"}</button>
        <div className={`font-mono text-6xl font-semibold tabular-nums ${resta <= 30 ? "text-acao" : ""}`}>{seg(resta)}</div>
        <button onClick={() => { setRodando(false); setResta(total); }} className="rounded border border-white/30 px-3 py-2 text-sm">Zerar relógio</button>
      </div>
      <div className="flex flex-1 flex-col md:flex-row">{coluna(0)}{coluna(1)}</div>

      {encerrando && (
        <div className="fixed inset-0 z-50 grid place-items-center bg-black/60 p-4" onClick={() => setEncerrando(false)}>
          <div className="cartao w-full max-w-xl p-6" onClick={(e) => e.stopPropagation()}>
            <h2 className="text-2xl font-extrabold">Encerrar luta</h2>
            <p className="mb-4 text-sm text-tinta-2">Escolha o vencedor e o método. O resultado avança o atleta na chave e fica registrado.</p>
            <div className="grid gap-4 sm:grid-cols-2">
              {([0, 1] as const).map((lado) => (
                <div key={lado} className={`rounded-md border p-3 ${sugerido === lado ? "border-tatame bg-tatame-claro" : "border-linha"}`}>
                  <div className="font-semibold">{d.nomeDe(lados[lado])}</div>
                  <div className="mb-2 text-xs text-tinta-3">{m[lado].pontos} pts · {m[lado].vantagens} vant. · {m[lado].punicoes} pun.{sugerido === lado ? " · à frente no placar" : ""}</div>
                  <div className="flex flex-wrap gap-1.5">
                    {["Pontos", "Finalização", "Decisão", "W.O.", "Desclassificação"].map((met) => (
                      <button key={met} className="botao-contorno !px-2 !py-1 text-xs" onClick={() => encerrar(lado, met === "Desclassificação" ? "DQ do oponente" : met)}>{met === "Desclassificação" ? "Oponente DQ" : met}</button>
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
  return (
    <div className="min-h-screen bg-tinta p-4 text-white">
      <div className="mb-4 flex items-center justify-between">
        <div className="font-display text-3xl font-black uppercase" style={{ fontStretch: "78%" }}>Próximas lutas<span className="text-acao">.</span></div>
        <Link to="/" className="text-sm opacity-60 hover:opacity-100">Voltar ao site</Link>
      </div>
      <div className="grid gap-3 md:grid-cols-2 xl:grid-cols-3">
        {[1, 2, 3, 4, 5, 6].map((t) => {
          const pendentes = filaDoTatame(d, dia, t).filter((f) => !f.vencedorId);
          const prontas = pendentes.filter((f) => f.pronta).slice(0, 4);
          return (
            <div key={t} className="overflow-hidden rounded-lg border border-white/15 bg-white/5">
              <div className="flex items-center justify-between bg-acao px-4 py-2"><span className="font-display text-2xl font-extrabold">Tatame {t}</span><span className="font-mono text-xs">{pendentes.length} lutas restantes</span></div>
              {prontas.map((f, k) => (
                <div key={f.bloco.categoria.id + f.lutaId} className={`border-b border-white/10 px-4 py-3 last:border-0 ${k === 0 ? "bg-white text-tinta" : ""}`}>
                  <div className="flex justify-between font-mono text-[11px] uppercase tracking-wider opacity-60"><span>{k === 0 ? "No tatame" : `Em seguida · ${hhmm(f.horario)}`}</span><span>{f.bloco.categoria.divisao} · {f.bloco.categoria.faixa} · {f.bloco.categoria.peso}</span></div>
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
