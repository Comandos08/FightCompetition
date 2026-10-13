import { useMemo, useState } from "react";
import { Link, useNavigate, useParams } from "react-router-dom";
import { useDados } from "@/data/store";
import { ANO_EVENTO, EVENTO_ID, VALOR_INSCRICAO, divisaoPorIdade, eventos, equipes, type Atleta, type Inscricao as TInscricao, type Modalidade } from "@/data/seed";
import { Abas, Faixa, Selo, Titulo, Vazio } from "@/components/ui";
import { Chave, Podio } from "@/components/Chave";
import { hhmm, idCategoria } from "@/lib/competicao";

export function Agenda() {
  const { inscricoes } = useDados();
  const [busca, setBusca] = useState("");
  const [filtro, setFiltro] = useState("Todos");
  const lista = eventos
    .map((e) => (e.id === EVENTO_ID ? { ...e, inscritos: inscricoes.length } : e))
    .filter((e) => (filtro === "Todos" || e.status === filtro) && `${e.nome} ${e.cidade} ${e.organizador}`.toLowerCase().includes(busca.toLowerCase()));
  return (
    <>
      <section className="mb-8 grid gap-6 lg:grid-cols-[1.3fr_1fr] lg:items-end">
        <div>
          <div className="rotulo mb-2">Agenda de competições</div>
          <h1 className="text-5xl font-black uppercase leading-[0.92] sm:text-6xl" style={{ fontStretch: "76%" }}>
            Do cadastro<br />ao pódio,<br /><span className="text-acao">sem planilha.</span>
          </h1>
        </div>
        <p className="max-w-md text-tinta-2">
          Encontre um evento, inscreva-se em poucos passos e acompanhe sua chave e o horário estimado da sua luta pelo celular.
        </p>
      </section>
      <div className="mb-5 flex flex-wrap gap-2">
        <input className="campo max-w-xs" placeholder="Buscar evento, cidade ou organizador" value={busca} onChange={(e) => setBusca(e.target.value)} />
        {["Todos", "Inscrições abertas", "Em breve", "Encerrado"].map((f) => (
          <button key={f} onClick={() => setFiltro(f)} className={filtro === f ? "botao-primario" : "botao-contorno"}>{f}</button>
        ))}
      </div>
      <div className="grid gap-4 md:grid-cols-2">
        {lista.map((e) => (
          <Link key={e.id} to={e.demo ? `/eventos/${e.id}` : "#"} className={`cartao group relative overflow-hidden p-5 transition ${e.demo ? "hover:-translate-y-0.5 hover:border-tinta" : "opacity-70"}`}>
            <div className="listra absolute inset-y-0 left-0 w-1.5" />
            <div className="flex items-start justify-between gap-3 pl-3">
              <div>
                <div className="rotulo">{e.datas} · {e.cidade}</div>
                <h2 className="mt-1 text-2xl font-extrabold leading-tight">{e.nome}</h2>
                <div className="mt-1 text-sm text-tinta-2">{e.organizador} · {e.local}</div>
              </div>
              <Selo tom={e.status === "Inscrições abertas" ? "ok" : e.status === "Em breve" ? "aviso" : "neutro"}>{e.status}</Selo>
            </div>
            <div className="mt-4 flex items-center justify-between pl-3 text-sm">
              <span className="text-tinta-2">{e.modalidades}{e.inscritos ? ` · ${e.inscritos} inscrições` : ""}</span>
              <span className="font-medium text-acao">{e.demo ? "Abrir evento →" : "Só o primeiro evento é navegável"}</span>
            </div>
          </Link>
        ))}
        {!lista.length && <Vazio>Nenhum evento encontrado.</Vazio>}
      </div>
    </>
  );
}

type AbaEvento = "info" | "inscritos" | "chaves" | "programacao" | "resultados";

export function Evento() {
  const { id } = useParams();
  const dados = useDados();
  const [aba, setAba] = useState<AbaEvento>("info");
  const [busca, setBusca] = useState("");
  const [catId, setCatId] = useState<string>("");
  const [dia, setDia] = useState<1 | 2>(1);
  const ev = eventos.find((e) => e.id === id) ?? eventos[0]!;
  const publicadas = dados.categorias.filter((c) => dados.estado.publicadas[c.id] && dados.chaves.has(c.id));
  const catSel = publicadas.find((c) => c.id === catId) ?? publicadas[0];
  const concluidas = dados.categorias.filter((c) => dados.resolvidas.get(c.id)?.concluida);
  const inscritos = useMemo(() => dados.inscricoes.filter((i) => {
    const a = dados.atletas.get(i.atletaId)!;
    return `${a.nome} ${a.equipe}`.toLowerCase().includes(busca.toLowerCase());
  }), [dados.inscricoes, dados.atletas, busca]);

  return (
    <>
      <Titulo sobre={`${ev.datas} · ${ev.cidade}`} acoes={<Link to={`/eventos/${ev.id}/inscricao`} className="botao-acao">Inscrever-se</Link>}>{ev.nome}</Titulo>
      <Abas<AbaEvento> ativa={aba} aoMudar={setAba} abas={[
        { id: "info", nome: "Informações" }, { id: "inscritos", nome: "Inscritos", conta: dados.inscricoes.length },
        { id: "chaves", nome: "Chaves", conta: publicadas.length }, { id: "programacao", nome: "Programação" },
        { id: "resultados", nome: "Resultados", conta: concluidas.length },
      ]} />

      {aba === "info" && (
        <div className="grid gap-4 lg:grid-cols-3">
          <div className="cartao p-5 lg:col-span-2">
            <h2 className="mb-2 text-xl font-bold">Sobre o evento</h2>
            <p className="text-tinta-2">Competição aberta a todas as equipes, com categorias de Mirim a Master, masculino e feminino, nas modalidades Gi (sábado) e No-Gi (domingo). Atletas podem se inscrever nas duas modalidades.</p>
            <dl className="mt-5 grid gap-4 sm:grid-cols-2">
              {[["Local", ev.local], ["Organização", ev.organizador], ["Inscrição", `R$ ${VALOR_INSCRICAO},00 por modalidade`], ["Pesagem", "Antes da primeira luta, no tatame de aquecimento"], ["Formato", "Eliminatória simples"], ["Tatames", "6 áreas simultâneas"]].map(([k, v]) => (
                <div key={k}><dt className="rotulo">{k}</dt><dd className="mt-0.5 font-medium">{v}</dd></div>
              ))}
            </dl>
          </div>
          <div className="cartao p-5">
            <div className="rotulo mb-3">Prazos</div>
            {[["Lote 1", "até 31 out", "encerrado"], ["Lote 2", "até 14 nov", "aberto"], ["Correções", "até 17 nov", ""], ["Chaves publicadas", "19 nov", ""]].map(([a, b, c]) => (
              <div key={a} className="flex items-center justify-between border-b border-linha/70 py-2 last:border-0">
                <span className="font-medium">{a}</span>
                <span className="text-sm text-tinta-2">{b} {c && <Selo tom={c === "aberto" ? "ok" : "neutro"}>{c}</Selo>}</span>
              </div>
            ))}
          </div>
        </div>
      )}

      {aba === "inscritos" && (
        <>
          <input className="campo mb-3 max-w-sm" placeholder="Buscar atleta ou equipe" value={busca} onChange={(e) => setBusca(e.target.value)} />
          <div className="cartao max-h-[65vh] overflow-auto">
            <table className="tabela">
              <thead><tr><th>Atleta</th><th>Equipe</th><th>Modalidade</th><th>Divisão</th><th>Faixa</th><th>Peso</th></tr></thead>
              <tbody>
                {inscritos.slice(0, 200).map((i) => {
                  const a = dados.atletas.get(i.atletaId)!;
                  return <tr key={i.id}><td className="font-medium">{a.nome}</td><td>{a.equipe}</td><td>{i.modalidade}</td><td>{i.divisao}</td><td><Faixa cor={i.faixa} /></td><td>{i.peso}</td></tr>;
                })}
              </tbody>
            </table>
          </div>
          {inscritos.length > 200 && <p className="mt-2 text-xs text-tinta-3">Mostrando 200 de {inscritos.length}. Use a busca para encontrar um atleta.</p>}
        </>
      )}

      {aba === "chaves" && (!catSel ? <Vazio>As chaves ainda não foram publicadas. No protótipo, publique-as pela área do organizador (Chaves → Publicar todas).</Vazio> : (
        <>
          <select className="campo mb-4 max-w-xl" value={catSel.id} onChange={(e) => setCatId(e.target.value)}>
            {publicadas.map((c) => <option key={c.id} value={c.id}>{c.modalidade} · {c.nome} ({c.inscricoes.length})</option>)}
          </select>
          <Chave chave={dados.chaves.get(catSel.id)!} resolvida={dados.resolvidas.get(catSel.id)!} />
          <Podio resolvida={dados.resolvidas.get(catSel.id)!} />
        </>
      ))}

      {aba === "programacao" && (
        <>
          <div className="mb-4 flex gap-2">
            {([1, 2] as const).map((d) => <button key={d} onClick={() => setDia(d)} className={dia === d ? "botao-primario" : "botao-contorno"}>{d === 1 ? "Sábado · Gi" : "Domingo · No-Gi"}</button>)}
          </div>
          <div className="grid gap-3 md:grid-cols-2 xl:grid-cols-3">
            {Array.from({ length: 6 }, (_, t) => t + 1).map((t) => {
              const bs = dados.blocos.filter((b) => b.dia === dia && b.tatame === t);
              return (
                <div key={t} className="cartao overflow-hidden">
                  <div className="flex items-center justify-between bg-tinta px-3 py-2 text-white">
                    <span className="font-display font-bold">Tatame {t}</span>
                    <span className="font-mono text-xs opacity-70">{bs.length ? `${hhmm(bs[0]!.inicio)} – ${hhmm(bs[bs.length - 1]!.fim)}` : ""}</span>
                  </div>
                  <div className="max-h-80 overflow-auto">
                    {bs.map((b) => (
                      <div key={b.categoria.id} className="flex gap-3 border-b border-linha/70 px-3 py-2 text-sm last:border-0">
                        <span className="font-mono text-xs text-tinta-3">{hhmm(b.inicio)}</span>
                        <span className="flex-1">{b.categoria.nome}</span>
                        <span className="text-xs text-tinta-3">{b.chave.lutas.length} lutas</span>
                      </div>
                    ))}
                  </div>
                </div>
              );
            })}
          </div>
          <p className="mt-3 text-xs text-tinta-3">Horários estimados. No produto, eles são recalculados a cada luta encerrada.</p>
        </>
      )}

      {aba === "resultados" && (!concluidas.length ? <Vazio>Nenhuma categoria encerrada ainda. Registre resultados na área Mesa e placar para ver o pódio aqui.</Vazio> : (
        <div className="grid gap-3 md:grid-cols-2">
          {concluidas.map((c) => {
            const r = dados.resolvidas.get(c.id)!;
            return (
              <div key={c.id} className="cartao p-4">
                <div className="rotulo">{c.modalidade}</div>
                <div className="mb-2 font-semibold">{c.nome}</div>
                {[["1º", r.campeaoId], ["2º", r.viceId], ...r.semifinalistasDerrotados.map((x) => ["3º", x] as const)].map(([p, x], k) => (
                  <div key={k} className="flex gap-3 text-sm"><span className="w-6 font-display font-extrabold">{p}</span><span>{dados.nomeDe(x)}</span><span className="text-tinta-3">{dados.equipeDe(x)}</span></div>
                ))}
              </div>
            );
          })}
        </div>
      ))}
    </>
  );
}

export function Inscricao() {
  const { id } = useParams();
  const nav = useNavigate();
  const { atletas, despachar, inscricoes } = useDados();
  const [passo, setPasso] = useState(1);
  const [quem, setQuem] = useState<"eu" | "dependente">("eu");
  const [f, setF] = useState({ nome: "", ano: "", sexo: "M", equipe: equipes[0]!, faixa: "", peso: "", responsavel: "", gi: true, nogi: false, aceite: false });
  const idade = f.ano ? ANO_EVENTO - Number(f.ano) : NaN;
  const div = Number.isFinite(idade) ? divisaoPorIdade(idade) : undefined;
  const menor = idade < 18;
  const modalidades = [f.gi && "Gi", f.nogi && "No-Gi"].filter(Boolean) as Modalidade[];
  const total = modalidades.length * VALOR_INSCRICAO;
  const podePasso1 = f.nome.trim().length > 4 && !!div && (!menor || f.responsavel.trim().length > 4);
  const podePasso2 = !!f.faixa && !!f.peso && modalidades.length > 0;
  const mudar = (k: string, v: unknown) => setF((x) => ({ ...x, [k]: v }));

  const concluir = () => {
    const atleta: Atleta = { id: `AT9${String(atletas.size).padStart(3, "0")}`, nome: f.nome.trim(), sexo: f.sexo as "M" | "F", anoNascimento: Number(f.ano), equipe: f.equipe, faixa: f.faixa, menor, responsavel: menor ? f.responsavel : undefined };
    const novas: TInscricao[] = modalidades.map((m, k) => ({ id: `I9${String(inscricoes.length + k).padStart(3, "0")}`, atletaId: atleta.id, modalidade: m, divisao: div!.nome, faixa: f.faixa, peso: f.peso, pagamento: "pago", pesagem: "nao-pesado", valor: VALOR_INSCRICAO }));
    despachar({ tipo: "inscrever", atleta, inscricoes: novas });
    setPasso(4);
  };

  const Passo = ({ n, nome }: { n: number; nome: string }) => (
    <div className={`flex items-center gap-2 ${passo >= n ? "text-tinta" : "text-tinta-3"}`}>
      <span className={`grid h-6 w-6 place-items-center rounded-full font-mono text-xs ${passo > n ? "bg-tatame text-white" : passo === n ? "bg-tinta text-white" : "border border-linha"}`}>{passo > n ? "✓" : n}</span>
      <span className="text-sm font-medium">{nome}</span>
    </div>
  );

  return (
    <div className="mx-auto max-w-2xl">
      <Link to={`/eventos/${id}`} className="rotulo hover:text-tinta">← Voltar ao evento</Link>
      <h1 className="mb-5 mt-2 text-3xl font-extrabold">Inscrição</h1>
      <div className="mb-6 flex flex-wrap gap-5"><Passo n={1} nome="Atleta" /><Passo n={2} nome="Categoria" /><Passo n={3} nome="Pagamento" /></div>

      {passo === 1 && (
        <div className="cartao space-y-4 p-5">
          <div className="grid grid-cols-2 gap-2">
            {(["eu", "dependente"] as const).map((q) => (
              <button key={q} onClick={() => setQuem(q)} className={`rounded-md border p-3 text-left text-sm ${quem === q ? "border-tinta bg-papel" : "border-linha"}`}>
                <div className="font-semibold">{q === "eu" ? "Eu vou competir" : "Vou inscrever um dependente"}</div>
                <div className="text-xs text-tinta-3">{q === "eu" ? "Maior de 18 anos" : "Filho ou menor sob minha responsabilidade"}</div>
              </button>
            ))}
          </div>
          <label className="block"><span className="rotulo">Nome completo do atleta</span><input className="campo mt-1" value={f.nome} onChange={(e) => mudar("nome", e.target.value)} /></label>
          <div className="grid grid-cols-2 gap-3">
            <label><span className="rotulo">Ano de nascimento</span><input className="campo mt-1" inputMode="numeric" placeholder="ex.: 1998" value={f.ano} onChange={(e) => mudar("ano", e.target.value.replace(/\D/g, "").slice(0, 4))} /></label>
            <label><span className="rotulo">Sexo</span><select className="campo mt-1" value={f.sexo} onChange={(e) => mudar("sexo", e.target.value)}><option value="M">Masculino</option><option value="F">Feminino</option></select></label>
          </div>
          <label className="block"><span className="rotulo">Equipe</span><select className="campo mt-1" value={f.equipe} onChange={(e) => mudar("equipe", e.target.value)}>{equipes.map((e) => <option key={e}>{e}</option>)}</select></label>
          {f.ano.length === 4 && (div
            ? <div className="rounded-md bg-tatame-claro px-3 py-2 text-sm text-tatame">Divisão de idade: <b>{div.nome}</b> ({idade} anos em {ANO_EVENTO}).</div>
            : <div className="rounded-md bg-acao-claro px-3 py-2 text-sm text-acao-escuro">Não há divisão para {idade} anos neste evento.</div>)}
          {menor && div && (
            <label className="block"><span className="rotulo">Nome do responsável legal</span><input className="campo mt-1" value={f.responsavel} onChange={(e) => mudar("responsavel", e.target.value)} />
              <span className="mt-1 block text-xs text-tinta-3">A inscrição de menor só é confirmada com responsável identificado. O nome do responsável nunca aparece em telas públicas.</span></label>
          )}
          <button className="botao-primario" disabled={!podePasso1} onClick={() => setPasso(2)}>Continuar</button>
        </div>
      )}

      {passo === 2 && div && (
        <div className="cartao space-y-4 p-5">
          <p className="text-sm text-tinta-2">Só aparecem as opções permitidas para a divisão <b>{div.nome}</b>.</p>
          <div><span className="rotulo">Faixa</span>
            <div className="mt-1 flex flex-wrap gap-2">{div.faixas.map((x) => <button key={x} onClick={() => mudar("faixa", x)} className={`rounded-md border px-3 py-2 text-sm ${f.faixa === x ? "border-tinta bg-papel" : "border-linha"}`}><Faixa cor={x} /></button>)}</div></div>
          <div><span className="rotulo">Categoria de peso</span>
            <div className="mt-1 flex flex-wrap gap-2">{div.pesos.map((x) => <button key={x} onClick={() => mudar("peso", x)} className={`rounded-md border px-3 py-2 text-sm ${f.peso === x ? "border-tinta bg-papel" : "border-linha"}`}>{x}</button>)}</div></div>
          <div><span className="rotulo">Modalidades</span>
            <div className="mt-1 flex gap-4 text-sm">
              <label className="flex items-center gap-2"><input type="checkbox" checked={f.gi} onChange={(e) => mudar("gi", e.target.checked)} /> Gi (sábado)</label>
              <label className="flex items-center gap-2"><input type="checkbox" checked={f.nogi} onChange={(e) => mudar("nogi", e.target.checked)} /> No-Gi (domingo)</label>
            </div></div>
          {f.faixa && f.peso && <div className="rounded-md bg-papel px-3 py-2 font-mono text-xs">{modalidades.map((m) => idCategoria({ modalidade: m, divisao: div.nome, faixa: f.faixa, peso: f.peso }, f.sexo).split("|").join(" · ")).join("  /  ")}</div>}
          <div className="flex gap-2"><button className="botao-contorno" onClick={() => setPasso(1)}>Voltar</button><button className="botao-primario" disabled={!podePasso2} onClick={() => setPasso(3)}>Continuar</button></div>
        </div>
      )}

      {passo === 3 && (
        <div className="cartao space-y-4 p-5">
          <div className="flex items-center justify-between"><span>{modalidades.length} inscrição(ões) · {f.nome}</span><span className="font-display text-2xl font-extrabold">R$ {total},00</span></div>
          <div className="grid gap-4 rounded-md border border-linha p-4 sm:grid-cols-[auto_1fr] sm:items-center">
            <div className="grid h-32 w-32 place-items-center rounded bg-[repeating-conic-gradient(#15191E_0_25%,#fff_0_50%)] bg-[length:14px_14px]"><span className="bg-white px-1 font-mono text-[10px]">PIX demo</span></div>
            <div className="text-sm text-tinta-2">No produto, o Pix é confirmado automaticamente e a taxa da plataforma é descontada no repasse ao organizador. Aqui o pagamento é simulado.</div>
          </div>
          <label className="flex items-start gap-2 text-sm"><input type="checkbox" className="mt-1" checked={f.aceite} onChange={(e) => mudar("aceite", e.target.checked)} /> Li e aceito o regulamento do evento{menor ? " e autorizo a participação do menor" : ""}.</label>
          <div className="flex gap-2"><button className="botao-contorno" onClick={() => setPasso(2)}>Voltar</button><button className="botao-acao" disabled={!f.aceite} onClick={concluir}>Simular pagamento confirmado</button></div>
        </div>
      )}

      {passo === 4 && (
        <div className="cartao p-6 text-center">
          <div className="mx-auto mb-3 grid h-12 w-12 place-items-center rounded-full bg-tatame text-xl text-white">✓</div>
          <h2 className="text-2xl font-extrabold">Inscrição confirmada</h2>
          <p className="mt-1 text-tinta-2">{f.nome} já aparece na lista de inscritos e entra na categoria quando as chaves forem geradas.</p>
          <div className="mt-4 flex justify-center gap-2"><button className="botao-primario" onClick={() => nav(`/eventos/${id}`)}>Ver evento</button><button className="botao-contorno" onClick={() => nav("/organizador")}>Ver como organizador</button></div>
        </div>
      )}
    </div>
  );
}
