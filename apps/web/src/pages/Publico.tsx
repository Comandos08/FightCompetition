import { useMemo, useState } from "react";
import { Link, useNavigate, useParams } from "react-router-dom";
import { useDados } from "@/data/store";
import { ANO_EVENTO, EVENTO_ID, VALOR_INSCRICAO, divisaoPorIdade, eventos, equipes, type Atleta, type Inscricao as TInscricao, type Modalidade } from "@/data/seed";
import { Abas, Faixa, Selo, Vazio } from "@/components/ui";
import { Chave, Podio } from "@/components/Chave";
import { hhmm, idCategoria } from "@/lib/competicao";
import { quadroDeMedalhas } from "@/lib/resultados";

const Icone = ({ d }: { d: string }) => (
  <svg viewBox="0 0 24 24" className="h-4 w-4 shrink-0" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><path d={d} /></svg>
);
const CALENDARIO = "M7 3v3M17 3v3M4 9h16M5 6h14a1 1 0 0 1 1 1v12a1 1 0 0 1-1 1H5a1 1 0 0 1-1-1V7a1 1 0 0 1 1-1z";
const LOCAL = "M12 21s7-6.2 7-11a7 7 0 1 0-14 0c0 4.8 7 11 7 11zM12 12.5a2.5 2.5 0 1 0 0-5 2.5 2.5 0 0 0 0 5z";

/** Arte do evento: um bloco de cor com o nome, no lugar do logotipo que cada organizador enviará. */
function Arte({ nome, tom, alta, imagem }: { nome: string; tom: number; alta?: boolean; imagem?: string }) {
  const tons = ["from-[#1A447D] to-[#0F2B52]", "from-[#1F8A5B] to-[#12583A]", "from-[#C97A0A] to-[#8F5303]", "from-[#5B3A8C] to-[#3A2260]"];
  if (imagem) return <img src={imagem} alt={`Imagem do evento ${nome}`} className={`w-full object-cover ${alta ? "h-56 rounded-lg sm:h-72" : "h-32 rounded-t-lg"}`} />;
  return (
    <div className={`relative overflow-hidden bg-gradient-to-br ${tons[tom % tons.length]} ${alta ? "h-56 rounded-lg" : "h-32 rounded-t-lg"}`}>
      <div className="absolute -right-10 -top-16 h-64 w-64 rounded-full border-[28px] border-white/10" />
      <div className="absolute -right-24 -top-28 h-96 w-96 rounded-full border-[28px] border-white/5" />
      <div className={`absolute inset-0 flex items-center px-5 font-semibold leading-tight text-white ${alta ? "text-4xl sm:px-10" : "text-lg"}`}>
        <span className={alta ? "max-w-xl" : "max-w-[14rem]"}>{nome}</span>
      </div>
    </div>
  );
}

/** Localização do evento. No protótipo o mapa é um desenho; no produto, um mapa real a partir do endereço. */
function Mapa({ local, cidade }: { local: string; cidade: string }) {
  const consulta = encodeURIComponent(`${local}, ${cidade}`);
  return (
    <div className="cartao overflow-hidden">
      <div className="relative h-56 bg-[#E8EEF5]">
        <svg viewBox="0 0 600 224" className="absolute inset-0 h-full w-full" preserveAspectRatio="xMidYMid slice" aria-hidden="true">
          <path d="M0 150 C120 120 200 190 330 160 S520 110 600 140 V224 H0Z" fill="#D5E4F3" />
          <rect x="40" y="24" width="120" height="70" rx="6" fill="#DDEBDD" /><rect x="430" y="150" width="130" height="56" rx="6" fill="#DDEBDD" />
          <g stroke="#fff" strokeLinecap="round" fill="none">
            <path d="M-10 112 H610" strokeWidth="14" /><path d="M300 -10 V234" strokeWidth="14" /><path d="M-10 40 L610 200" strokeWidth="9" />
            <path d="M120 -10 V234 M470 -10 V234 M-10 180 H610 M-10 60 H610" strokeWidth="5" />
          </g>
        </svg>
        <div className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-full text-perigo">
          <svg viewBox="0 0 24 24" className="h-10 w-10 drop-shadow" fill="currentColor"><path d="M12 22s7-6.4 7-12a7 7 0 1 0-14 0c0 5.6 7 12 7 12z" /><circle cx="12" cy="10" r="2.6" fill="#fff" /></svg>
        </div>
        <span className="absolute bottom-2 right-2 rounded bg-white/90 px-2 py-0.5 text-[10px] text-tinta-3">mapa ilustrativo</span>
      </div>
      <div className="flex flex-wrap items-center justify-between gap-3 p-5">
        <div><div className="font-semibold">{local}</div><div className="text-sm text-tinta-2">{cidade}</div></div>
        <a href={`https://www.google.com/maps/search/?api=1&query=${consulta}`} target="_blank" rel="noreferrer" className="botao-contorno">Como chegar</a>
      </div>
    </div>
  );
}

export function Agenda() {
  const { inscricoes, estado } = useDados();
  const [busca, setBusca] = useState("");
  const [filtro, setFiltro] = useState("Todos");
  const todos = eventos.map((e) => (e.id === EVENTO_ID ? { ...e, inscritos: inscricoes.length } : e));
  const lista = todos.filter((e) => (filtro === "Todos" || e.status === filtro) && `${e.nome} ${e.cidade} ${e.organizador}`.toLowerCase().includes(busca.toLowerCase()));
  const destaque = todos[0]!;
  return (
    <>
      <Link to={`/eventos/${destaque.id}`} className="relative mb-10 block overflow-hidden rounded-lg bg-gradient-to-br from-[#1A447D] to-[#0F2B52] px-6 py-10 text-white sm:px-10 sm:py-14">
        <div className="absolute -right-16 -top-24 h-[28rem] w-[28rem] rounded-full border-[40px] border-white/10" />
        <div className="absolute -right-40 -top-48 h-[44rem] w-[44rem] rounded-full border-[40px] border-white/5" />
        <div className="relative max-w-xl">
          <span className="rounded bg-ouro px-2 py-1 text-xs font-medium text-tinta">Inscrições abertas</span>
          <h1 className="mt-4 text-3xl font-semibold leading-tight sm:text-4xl">{destaque.nome}</h1>
          <p className="mt-2 text-white/80">{destaque.datas} · {destaque.local}, {destaque.cidade}</p>
          <span className="mt-6 inline-flex rounded-md bg-white px-4 py-2.5 text-sm font-medium text-marinho">Ver evento e inscrever-se</span>
        </div>
      </Link>

      <div className="mb-5 flex flex-wrap items-end justify-between gap-3">
        <h2 className="text-2xl font-semibold">Próximos eventos</h2>
        <div className="flex flex-wrap gap-2">
          <input className="campo w-64" placeholder="Buscar evento ou cidade" value={busca} onChange={(e) => setBusca(e.target.value)} />
          <div className="flex rounded-md border border-linha bg-white p-1">
            {["Todos", "Inscrições abertas", "Em breve", "Encerrado"].map((f) => (
              <button key={f} onClick={() => setFiltro(f)} className={`rounded px-3 py-1.5 text-sm font-medium transition ${filtro === f ? "bg-marinho text-white" : "text-tinta-2 hover:text-marinho"}`}>{f}</button>
            ))}
          </div>
        </div>
      </div>
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {lista.map((e, k) => (
          <Link key={e.id} to={e.demo ? `/eventos/${e.id}` : "/"} className={`cartao group flex flex-col overflow-hidden transition ${e.demo ? "hover:-translate-y-0.5 hover:shadow-lg" : "opacity-75"}`}>
            <Arte nome={e.nome} tom={todos.indexOf(e) + (k < 0 ? 0 : 0)} imagem={e.id === EVENTO_ID ? estado.capaEvento : undefined} />
            <div className="flex flex-1 flex-col gap-2 p-4 text-sm text-tinta-2">
              <div className="flex items-center gap-2"><Icone d={CALENDARIO} />{e.datas}</div>
              <div className="flex items-center gap-2"><Icone d={LOCAL} />{e.cidade}</div>
              <div className="text-xs text-tinta-3">{e.modalidades}{e.inscritos ? ` · ${e.inscritos} inscrições` : ""}</div>
            </div>
            <div className={`border-t border-linha py-3 text-center text-sm font-medium transition ${e.demo ? "text-marinho group-hover:bg-marinho group-hover:text-white" : "text-tinta-3"}`}>
              {e.status === "Encerrado" ? "Ver resultados" : e.status === "Em breve" ? "Em breve" : "Inscreva-se"}{!e.demo && " (demonstração)"}
            </div>
          </Link>
        ))}
        {!lista.length && <Vazio>Nenhum evento encontrado.</Vazio>}
      </div>
    </>
  );
}

type AbaEvento = "info" | "inscritos" | "chaves" | "programacao" | "resultados" | "medalhas" | "regulamento";

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
      <nav className="mb-4 flex flex-wrap items-center gap-2 text-xs text-tinta-3">
        <Link to="/" className="font-medium text-marinho hover:underline">Eventos</Link><span>›</span><span>{ev.nome}</span>
      </nav>
      <div className="mb-4 flex flex-wrap items-end justify-between gap-3">
        <div>
          <h1 className="text-2xl font-semibold sm:text-3xl">{ev.nome}</h1>
          <div className="mt-2 flex flex-wrap gap-x-5 gap-y-1 text-sm text-tinta-2">
            <span className="flex items-center gap-2"><Icone d={CALENDARIO} />{ev.datas}</span>
            <span className="flex items-center gap-2 text-marinho"><Icone d={LOCAL} />{ev.local}, {ev.cidade}</span>
          </div>
        </div>
        <Link to="/tv" className="botao-contorno">Painel do ginásio</Link>
      </div>
      <div className="mb-5"><Arte nome={ev.nome} tom={0} alta imagem={ev.id === EVENTO_ID ? dados.estado.capaEvento : undefined} /></div>
      <Abas<AbaEvento> ativa={aba} aoMudar={setAba} abas={[
        { id: "info", nome: "Informações" }, { id: "inscritos", nome: "Inscritos", conta: dados.inscricoes.length },
        { id: "chaves", nome: "Chaves", conta: publicadas.length }, { id: "programacao", nome: "Programação" },
        { id: "resultados", nome: "Resultados", conta: concluidas.length },
        { id: "medalhas", nome: "Quadro de medalhas" }, { id: "regulamento", nome: "Regulamento" },
      ]} />

      {aba === "info" && (
        <div className="grid gap-4 lg:grid-cols-[1.35fr_1fr]">
          <div className="space-y-4">
            <div className="cartao p-6">
              <h2 className="mb-4 text-lg font-semibold">{ev.nome}</h2>
              <dl className="grid gap-5 sm:grid-cols-2">
                {[["Data", ev.datas], ["Local", `${ev.local}, ${ev.cidade}`], ["Organização", ev.organizador], ["Formato", "Eliminatória simples"], ["Pesagem", "Antes da primeira luta"], ["Áreas de luta", "6 tatames simultâneos"]].map(([k, v]) => (
                  <div key={k}><dt className="rotulo">{k}</dt><dd className="mt-1 font-medium">{v}</dd></div>
                ))}
              </dl>
            </div>
            <Mapa local={ev.local} cidade={ev.cidade} />
            <div className="cartao p-6">
              <h2 className="mb-2 text-lg font-semibold">Sobre o evento</h2>
              <p className="text-tinta-2">Competição aberta a todas as equipes, com categorias de Mirim a Master, masculino e feminino, nas modalidades Gi (sábado) e No-Gi (domingo). Atletas podem se inscrever nas duas modalidades.</p>
            </div>
          </div>
          <div className="space-y-4">
            <div className="cartao p-6">
              <div className="mb-4 flex items-center justify-between">
                <h2 className="text-lg font-semibold">Participe do campeonato</h2>
                <span className="rounded bg-ouro px-2 py-1 text-xs font-medium text-tinta">Lote 2 até 14 nov</span>
              </div>
              {[["Uma modalidade (Gi ou No-Gi)", `R$ ${VALOR_INSCRICAO},00`], ["Gi e No-Gi", `R$ ${VALOR_INSCRICAO * 2},00`], ["Entrada de público", "Gratuita"]].map(([a2, b2]) => (
                <div key={a2} className="flex items-center justify-between border-b border-linha/70 py-3 text-sm last:border-0">
                  <span>{a2}</span><span className="font-semibold text-marinho">{b2}</span>
                </div>
              ))}
              <Link to={`/app/inscricao/${ev.id}`} className="botao-primario mt-5 w-full">Inscrição e pagamento</Link>
            </div>
            <div className="cartao p-6">
              <h2 className="mb-3 text-lg font-semibold">Prazos</h2>
              {[["Lote 1", "até 31 out", "encerrado"], ["Lote 2", "até 14 nov", "aberto"], ["Correções", "até 17 nov", ""], ["Chaves publicadas", "19 nov", ""]].map(([a2, b2, c2]) => (
                <div key={a2} className="flex items-center justify-between border-b border-linha/70 py-2.5 text-sm last:border-0">
                  <span className="font-medium">{a2}</span>
                  <span className="text-tinta-2">{b2} {c2 && <Selo tom={c2 === "aberto" ? "ok" : "neutro"}>{c2}</Selo>}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {aba === "inscritos" && (!dados.estado.config.inscritosPublicos ? <Vazio>A organização optou por não divulgar a lista de inscritos deste evento.</Vazio> : (
        <>
          <input className="campo mb-3 max-w-sm" placeholder="Buscar atleta ou equipe" value={busca} onChange={(e) => setBusca(e.target.value)} />
          <div className="cartao max-h-[65vh] overflow-auto">
            <table className="tabela">
              <thead><tr><th>Atleta</th><th>Equipe</th><th>Modalidade</th><th>Divisão</th><th>Faixa</th><th>Peso</th></tr></thead>
              <tbody>
                {inscritos.slice(0, 200).map((i) => {
                  const a = dados.atletas.get(i.atletaId)!;
                  const reservado = a.menor && dados.estado.config.ocultarMenores;
                  const partes = a.nome.split(" ");
                  return (
                    <tr key={i.id}>
                      <td className="font-medium">{reservado ? `${partes[0]} ${partes[partes.length - 1]![0]}.` : <Link to={`/atletas/${a.id}`} className="text-marinho hover:underline">{a.nome}</Link>}</td>
                      <td><Link to={`/equipes/${encodeURIComponent(a.equipe)}`} className="hover:underline">{a.equipe}</Link></td>
                      <td>{i.modalidade}</td><td>{i.divisao}</td><td><Faixa cor={i.faixa} /></td><td>{i.peso}</td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
          {inscritos.length > 200 && <p className="mt-2 text-xs text-tinta-3">Mostrando 200 de {inscritos.length}. Use a busca para encontrar um atleta.</p>}
          {dados.estado.config.ocultarMenores && <p className="mt-2 text-xs text-tinta-3">Menores de idade aparecem com o sobrenome abreviado e sem perfil público.</p>}
        </>
      ))}

      {aba === "chaves" && (!catSel ? <Vazio>As chaves ainda não foram publicadas. No protótipo, entre como organizador e use Chaves → Publicar todas.</Vazio> : (
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
                  <div className="flex items-center justify-between bg-marinho px-3 py-2 text-white">
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

      {aba === "resultados" && (!concluidas.length ? <Vazio>Nenhuma categoria encerrada ainda. No protótipo, entre como mesário e encerre lutas para ver o pódio aqui.</Vazio> : (
        <div className="grid gap-3 md:grid-cols-2">
          {concluidas.map((c) => {
            const r = dados.resolvidas.get(c.id)!;
            return (
              <div key={c.id} className="cartao p-4">
                <div className="rotulo">{c.modalidade}</div>
                <div className="mb-2 font-semibold">{c.nome}</div>
                {[["1º", r.campeaoId], ["2º", r.viceId], ...r.semifinalistasDerrotados.map((x) => ["3º", x] as const)].map(([p, x], k) => (
                  <div key={k} className="flex gap-3 text-sm"><span className="w-6 font-display font-semibold">{p}</span><span>{dados.nomeDe(x)}</span><span className="text-tinta-3">{dados.equipeDe(x)}</span></div>
                ))}
              </div>
            );
          })}
        </div>
      ))}
      {aba === "medalhas" && (() => {
        const quadro = quadroDeMedalhas(dados);
        return !quadro.length ? <Vazio>O quadro aparece quando a primeira categoria for encerrada.</Vazio> : (
          <div className="cartao overflow-auto">
            <table className="tabela">
              <thead><tr><th>Posição</th><th>Equipe</th><th>Ouro</th><th>Prata</th><th>Bronze</th><th>Pontos</th></tr></thead>
              <tbody>
                {quadro.map((l, k) => (
                  <tr key={l.equipe}><td className="font-semibold">{k + 1}º</td><td><Link to={`/equipes/${encodeURIComponent(l.equipe)}`} className="font-medium text-marinho hover:underline">{l.equipe}</Link></td>
                    <td>{l.ouro}</td><td>{l.prata}</td><td>{l.bronze}</td><td className="font-semibold text-marinho">{l.pontos}</td></tr>
                ))}
              </tbody>
            </table>
            <p className="px-4 py-3 text-xs text-tinta-3">Pontuação ilustrativa de 9, 3 e 1 pontos. No produto, cada organizador define o critério no regulamento.</p>
          </div>
        );
      })()}

      {aba === "regulamento" && (
        <div className="cartao max-w-3xl space-y-5 p-6">
          <div className="rounded-md bg-aviso-claro px-3 py-2 text-sm text-aviso">Texto de exemplo. No produto, o organizador escreve o regulamento e escolhe o pacote de regras da modalidade.</div>
          {[["Inscrições", "A inscrição é individual e só é confirmada depois do pagamento. A inscrição de menor exige responsável legal identificado."],
            ["Correções", "Correções de faixa, peso e equipe podem ser pedidas até o prazo divulgado em Informações. Depois da publicação das chaves, só a direção técnica altera uma categoria."],
            ["Pesagem", "A pesagem acontece no ginásio, antes da primeira luta do atleta. Quem não bate o peso sai da categoria."],
            ["Chaves e programação", "As chaves são sorteadas pelo sistema, separando atletas da mesma equipe sempre que possível. Os horários são estimativas e mudam conforme o andamento dos tatames."],
            ["Cancelamento", "Cancelamentos até o fim do lote vigente têm reembolso integral. Depois disso, o valor vira crédito para o próximo evento da organização."],
          ].map(([t, x]) => <div key={t}><h3 className="font-semibold">{t}</h3><p className="mt-1 text-tinta-2">{x}</p></div>)}
        </div>
      )}
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
      <span className={`grid h-6 w-6 place-items-center rounded-full font-mono text-xs ${passo > n ? "bg-tatame text-white" : passo === n ? "bg-marinho text-white" : "border border-linha"}`}>{passo > n ? "✓" : n}</span>
      <span className="text-sm font-medium">{nome}</span>
    </div>
  );

  return (
    <div className="mx-auto max-w-2xl">
      <Link to={`/eventos/${id}`} className="rotulo hover:text-tinta">← Voltar ao evento</Link>
      <h1 className="mb-5 mt-2 text-3xl font-semibold">Inscrição</h1>
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
            : <div className="rounded-md bg-perigo-claro px-3 py-2 text-sm text-perigo">Não há divisão para {idade} anos neste evento.</div>)}
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
          <div className="flex items-center justify-between"><span>{modalidades.length} inscrição(ões) · {f.nome}</span><span className="font-display text-2xl font-semibold">R$ {total},00</span></div>
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
          <h2 className="text-2xl font-semibold">Inscrição confirmada</h2>
          <p className="mt-1 text-tinta-2">{f.nome} já aparece na lista de inscritos e entra na categoria quando as chaves forem geradas.</p>
          <div className="mt-4 flex justify-center gap-2"><button className="botao-primario" onClick={() => nav(`/eventos/${id}`)}>Ver evento</button><button className="botao-contorno" onClick={() => nav("/app/atleta")}>Ir para minha área</button></div>
        </div>
      )}
    </div>
  );
}
