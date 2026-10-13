import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useDados, type Config } from "@/data/store";
import { EVENTO_ID, eventos } from "@/data/seed";
import { RESTRITO_AO_DONO } from "@/data/sessao";
import { Campo, EnviarImagem, Indicador, Secao, Selo, SubNav, Titulo, Vazio, pagamentoSelo } from "@/components/ui";
import { quadroDeMedalhas } from "@/lib/resultados";

export const navOrganizacao = [
  { para: "/app/organizacao", nome: "Eventos", fim: true },
  { para: "/app/organizacao/ranking", nome: "Ranking" },
  { para: "/app/organizacao/membros", nome: "Membros e papéis" },
  { para: "/app/organizacao/dados", nome: "Dados da organização" },
];

/** O diretor técnico só vê a lista de eventos da organização. */
export function SubNavOrg() {
  const d = useDados();
  return <SubNav itens={navOrganizacao.filter((i) => d.estado.sessao !== "diretor" || !RESTRITO_AO_DONO.includes(i.para))} />;
}

const reais = (v: number) => `R$ ${v.toLocaleString("pt-BR", { minimumFractionDigits: 2 })}`;

export function ListaEventos() {
  const d = useDados();
  const meus = [eventos.find((e) => e.id === EVENTO_ID)!];
  return (
    <>
      <Titulo sobre="Organização" acoes={d.estado.sessao !== "diretor" && <Link to="/app/organizacao/novo" className="botao-acao">Criar evento</Link>}>Liga Horizonte de Jiu-Jitsu</Titulo>
      <SubNavOrg />
      <div className="cartao overflow-auto">
        <table className="tabela">
          <thead><tr><th>Evento</th><th>Data</th><th>Local</th><th>Inscrições</th><th>Situação</th><th></th></tr></thead>
          <tbody>
            {meus.map((e) => (
              <tr key={e.id}>
                <td className="font-medium">{e.nome}</td><td>{e.datas}</td><td>{e.cidade}</td><td>{d.inscricoes.length}</td>
                <td><Selo tom="ok">inscrições abertas</Selo></td>
                <td className="text-right"><Link to={`/app/organizacao/eventos/${e.id}`} className="botao-primario !py-1.5 text-xs">Administrar</Link></td>
              </tr>
            ))}
            {d.estado.eventosNovos.map((e) => (
              <tr key={e.id}>
                <td className="font-medium">{e.nome}</td><td>{e.datas}</td><td>{e.cidade}</td><td>0</td>
                <td><Selo tom="aviso">rascunho</Selo></td>
                <td className="text-right text-xs text-tinta-3">{e.modalidades} · {e.tatames} tatames · {reais(e.valor)}</td>
              </tr>
            ))}
            <tr className="opacity-70"><td className="font-medium">Copa Horizonte de Jiu-Jitsu 2025</td><td>22 e 23 nov 2025</td><td>Rio de Janeiro, RJ</td><td>512</td><td><Selo>encerrado</Selo></td><td className="text-right text-xs text-tinta-3">arquivo</td></tr>
          </tbody>
        </table>
      </div>
      <p className="mt-3 text-xs text-tinta-3">No protótipo, só a Copa Horizonte 2026 abre o painel completo. Eventos criados aqui ficam como rascunho.</p>
    </>
  );
}

export function NovoEvento() {
  const d = useDados();
  const nav = useNavigate();
  const [passo, setPasso] = useState(1);
  const [f, setF] = useState({ nome: "", datas: "", cidade: "", local: "", gi: true, nogi: false, tatames: 4, valor: 120, limite: 600, pacote: "Eliminatória simples com dois bronzes" });
  const mudar = (k: string, v: unknown) => setF((x) => ({ ...x, [k]: v }));
  const modalidades = [f.gi && "Gi", f.nogi && "No-Gi"].filter(Boolean).join(" e ");
  const pode = passo === 1 ? f.nome.trim().length > 4 && !!f.datas.trim() && !!f.cidade.trim() : passo === 2 ? !!modalidades : true;
  const criar = () => {
    d.despachar({ tipo: "evento", evento: { id: `novo-${d.estado.eventosNovos.length + 1}`, nome: f.nome.trim(), datas: f.datas.trim(), cidade: f.cidade.trim(), local: f.local.trim(), modalidades, tatames: f.tatames, valor: f.valor } });
    nav("/app/organizacao");
  };
  const passos = ["Dados do evento", "Modalidades e chaves", "Inscrições e preço", "Revisão"];
  return (
    <div className="mx-auto max-w-2xl">
      <Link to="/app/organizacao" className="rotulo hover:text-tinta">← Voltar aos eventos</Link>
      <h1 className="mb-5 mt-2 text-3xl font-semibold">Criar evento</h1>
      <div className="mb-6 flex flex-wrap gap-5">
        {passos.map((nome, k) => (
          <div key={nome} className={`flex items-center gap-2 ${passo >= k + 1 ? "text-tinta" : "text-tinta-3"}`}>
            <span className={`grid h-6 w-6 place-items-center rounded-full font-mono text-xs ${passo > k + 1 ? "bg-tatame text-white" : passo === k + 1 ? "bg-marinho text-white" : "border border-linha"}`}>{passo > k + 1 ? "✓" : k + 1}</span>
            <span className="text-sm font-medium">{nome}</span>
          </div>
        ))}
      </div>
      <div className="cartao space-y-4 p-6">
        {passo === 1 && <>
          <Campo rotulo="Nome do evento"><input id="ev-nome" className="campo" value={f.nome} onChange={(e) => mudar("nome", e.target.value)} placeholder="ex.: Copa Horizonte de Verão 2027" /></Campo>
          <div className="grid gap-3 sm:grid-cols-2">
            <Campo rotulo="Data ou datas"><input id="ev-datas" className="campo" value={f.datas} onChange={(e) => mudar("datas", e.target.value)} placeholder="ex.: 13 e 14 mar 2027" /></Campo>
            <Campo rotulo="Cidade"><input id="ev-cidade" className="campo" value={f.cidade} onChange={(e) => mudar("cidade", e.target.value)} placeholder="ex.: Rio de Janeiro, RJ" /></Campo>
          </div>
          <Campo rotulo="Local"><input id="ev-local" className="campo" value={f.local} onChange={(e) => mudar("local", e.target.value)} placeholder="Nome do ginásio" /></Campo>
        </>}
        {passo === 2 && <>
          <div><span className="rotulo">Modalidades</span>
            <div className="mt-2 flex gap-5 text-sm">
              <label className="flex items-center gap-2"><input type="checkbox" checked={f.gi} onChange={(e) => mudar("gi", e.target.checked)} /> Jiu-Jitsu Gi</label>
              <label className="flex items-center gap-2"><input type="checkbox" checked={f.nogi} onChange={(e) => mudar("nogi", e.target.checked)} /> Jiu-Jitsu No-Gi</label>
            </div></div>
          <Campo rotulo="Pacote de chaves" dica="O pacote define o formato usado conforme o número de atletas da categoria. O protótipo gera apenas eliminatória simples; os demais formatos entram com o motor.">
            <select id="ev-pacote" className="campo" value={f.pacote} onChange={(e) => mudar("pacote", e.target.value)}>
              <option>Eliminatória simples com dois bronzes</option><option>Eliminatória simples com disputa de terceiro</option><option>Eliminatória com repescagem</option><option>Todos contra todos até 5 atletas, eliminatória acima</option>
            </select>
          </Campo>
          <Campo rotulo="Tabela de categorias" dica="Divisões de idade, faixas e pesos. Pode ser editada depois."><select id="ev-tabela" className="campo"><option>Jiu-Jitsu: idades e pesos da IBJJF</option><option>Copiar da Copa Horizonte 2026</option></select></Campo>
          <Campo rotulo="Tatames"><input id="ev-tatames" className="campo w-32" type="number" min={1} max={20} value={f.tatames} onChange={(e) => mudar("tatames", Number(e.target.value))} /></Campo>
        </>}
        {passo === 3 && <>
          <div className="grid gap-3 sm:grid-cols-2">
            <Campo rotulo="Valor por inscrição (R$)"><input id="ev-valor" className="campo" type="number" min={0} value={f.valor} onChange={(e) => mudar("valor", Number(e.target.value))} /></Campo>
            <Campo rotulo="Limite de inscrições"><input id="ev-limite" className="campo" type="number" min={1} value={f.limite} onChange={(e) => mudar("limite", Number(e.target.value))} /></Campo>
          </div>
          <Campo rotulo="Forma de recebimento"><select id="ev-receb" className="campo"><option>Pix com confirmação automática</option><option>Pix e cartão</option><option>Sem pagamento online (evento gratuito)</option></select></Campo>
          <div className="rounded-md bg-papel px-3 py-2 text-sm text-tinta-2">Lotes, cupons e isenções são configurados depois, na aba Financeiro do evento.</div>
        </>}
        {passo === 4 && <>
          {[["Evento", f.nome], ["Data", f.datas], ["Local", `${f.local || "a definir"}, ${f.cidade}`], ["Modalidades", modalidades], ["Chaves", f.pacote], ["Tatames", String(f.tatames)], ["Inscrição", `${reais(f.valor)} · limite de ${f.limite}`]].map(([k, v]) => (
            <div key={k} className="flex justify-between gap-4 border-b border-linha/70 py-2 text-sm last:border-0"><span className="text-tinta-3">{k}</span><span className="text-right font-medium">{v}</span></div>
          ))}
          <div className="rounded-md bg-aviso-claro px-3 py-2 text-sm text-aviso">O evento nasce como rascunho. Ele só aparece no site público quando você publicar.</div>
        </>}
        <div className="flex gap-2">
          {passo > 1 && <button className="botao-contorno" onClick={() => setPasso(passo - 1)}>Voltar</button>}
          {passo < 4 ? <button className="botao-primario" disabled={!pode} onClick={() => setPasso(passo + 1)}>Continuar</button> : <button className="botao-acao" onClick={criar}>Criar rascunho</button>}
        </div>
      </div>
    </div>
  );
}

function Convite({ escopoPadrao, escopos }: { escopoPadrao: string; escopos: string[] }) {
  const d = useDados();
  const [f, setF] = useState({ nome: "", email: "", papel: "Mesário", escopo: escopoPadrao });
  const valido = f.nome.trim().length > 3 && /.+@.+\..+/.test(f.email);
  return (
    <Secao titulo="Convidar pessoa">
      <div className="space-y-4">
        <Campo rotulo="Nome"><input id="conv-nome" className="campo" value={f.nome} onChange={(e) => setF({ ...f, nome: e.target.value })} /></Campo>
        <Campo rotulo="E-mail"><input id="conv-email" className="campo" type="email" value={f.email} onChange={(e) => setF({ ...f, email: e.target.value })} /></Campo>
        <Campo rotulo="Papel"><select id="conv-papel" className="campo" value={f.papel} onChange={(e) => setF({ ...f, papel: e.target.value })}>{["Mesário", "Árbitro", "Pesagem e check-in", "Diretor técnico", "Financeiro"].map((p) => <option key={p}>{p}</option>)}</select></Campo>
        <Campo rotulo="Onde vale" dica="O papel só dá acesso dentro deste escopo."><select id="conv-escopo" className="campo" value={f.escopo} onChange={(e) => setF({ ...f, escopo: e.target.value })}>{escopos.map((p) => <option key={p}>{p}</option>)}</select></Campo>
        <button className="botao-primario w-full" disabled={!valido} onClick={() => { d.despachar({ tipo: "membro", membro: { ...f, nome: f.nome.trim(), situacao: "convite enviado" } }); setF({ ...f, nome: "", email: "" }); }}>Enviar convite</button>
      </div>
    </Secao>
  );
}

function TabelaMembros({ filtro }: { filtro?: string }) {
  const d = useDados();
  const lista = d.estado.membros.filter((m) => !filtro || m.escopo.includes(filtro));
  return (
    <table className="tabela">
      <thead><tr><th>Pessoa</th><th>Papel</th><th>Onde vale</th><th>Situação</th></tr></thead>
      <tbody>
        {lista.map((m) => (
          <tr key={m.email + m.papel}><td><div className="font-medium">{m.nome}</div><div className="text-xs text-tinta-3">{m.email}</div></td><td>{m.papel}</td><td>{m.escopo}</td>
            <td>{m.situacao === "ativo" ? <Selo tom="ok">ativo</Selo> : <Selo tom="aviso">convite enviado</Selo>}</td></tr>
        ))}
      </tbody>
    </table>
  );
}

export function Membros() {
  return (
    <>
      <Titulo sobre="Organização">Membros e papéis</Titulo>
      <SubNavOrg />
      <div className="grid gap-4 lg:grid-cols-[1.6fr_1fr]">
        <Secao titulo="Quem tem acesso"><TabelaMembros />
          <p className="mt-3 text-xs text-tinta-3">Cada pessoa usa a própria conta. O papel define o que ela faz e o escopo define onde: um mesário do Tatame 2 não vê inscrições nem financeiro.</p></Secao>
        <Convite escopoPadrao="Organização" escopos={["Organização", "Copa Horizonte 2026", "Copa Horizonte 2026 · Tatame 1", "Copa Horizonte 2026 · Tatame 2"]} />
      </div>
    </>
  );
}

export function DadosOrganizacao() {
  const [salvo, setSalvo] = useState(false);
  return (
    <>
      <Titulo sobre="Organização">Dados da organização</Titulo>
      <SubNavOrg />
      <div className="grid gap-4 lg:grid-cols-2">
        <Secao titulo="Perfil público">
          <div className="space-y-4">
            <Campo rotulo="Nome"><input id="org-nome" className="campo" defaultValue="Liga Horizonte de Jiu-Jitsu" /></Campo>
            <Campo rotulo="Cidade"><input id="org-cidade" className="campo" defaultValue="Rio de Janeiro, RJ" /></Campo>
            <Campo rotulo="Contato para atletas"><input id="org-contato" className="campo" defaultValue="contato@ligahorizonte.exemplo" /></Campo>
            <div><span className="rotulo">O que a organização faz</span>
              <div className="mt-2 flex flex-wrap gap-4 text-sm">{["Organiza eventos", "Filia equipes", "Mantém ranking"].map((c, k) => <label key={c} className="flex items-center gap-2"><input type="checkbox" defaultChecked={k === 0} /> {c}</label>)}</div></div>
            <div className="flex items-center gap-3"><button className="botao-primario" onClick={() => setSalvo(true)}>Salvar</button>{salvo && <span className="text-sm text-tatame">Alterações salvas.</span>}</div>
          </div>
        </Secao>
        <div className="space-y-4">
          <Secao titulo="Recebimento">
            <div className="space-y-3 text-sm">
              <div className="flex justify-between"><span className="text-tinta-3">Conta de repasse</span><span className="font-medium">Banco de exemplo · final 0000</span></div>
              <div className="flex justify-between"><span className="text-tinta-3">Prazo de repasse</span><span className="font-medium">2 dias úteis após o pagamento</span></div>
              <div className="flex justify-between"><span className="text-tinta-3">Situação cadastral</span><Selo tom="ok">verificada</Selo></div>
            </div>
          </Secao>
          <Secao titulo="Plano">
            <p className="text-sm text-tinta-2">Cobrança por atleta inscrito, sem mensalidade. O valor ainda não foi definido e aparece aqui como exemplo.</p>
            <div className="mt-3 flex items-baseline gap-2"><span className="text-3xl font-semibold text-marinho">R$ 0,00</span><span className="text-sm text-tinta-3">por inscrição (a definir)</span></div>
          </Secao>
        </div>
      </div>
    </>
  );
}

/* ---------- abas do painel do evento ---------- */

export function Financeiro() {
  const d = useDados();
  const [cupom, setCupom] = useState({ codigo: "", desconto: "10%", limite: 50 });
  const soma = (s: string) => d.inscricoes.filter((i) => i.pagamento === s).reduce((t, i) => t + i.valor, 0);
  const pago = soma("pago");
  const movimentos = d.inscricoes.filter((i) => i.pagamento === "pago" || i.pagamento === "estornado").slice(-40).reverse();
  return (
    <>
      <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
        <Indicador rotulo="Recebido" valor={reais(pago)} detalhe={`${d.inscricoes.filter((i) => i.pagamento === "pago").length} inscrições pagas`} />
        <Indicador rotulo="A receber" valor={reais(soma("pendente") + soma("aguardando-autorizacao"))} detalhe="pendentes e aguardando responsável" />
        <Indicador rotulo="Estornado" valor={reais(soma("estornado"))} detalhe="cancelamentos" />
        <Indicador rotulo="Repasse previsto" valor={reais(pago)} detalhe="taxa da plataforma ainda não definida" />
      </div>
      <div className="mt-5 grid gap-4 lg:grid-cols-[1.6fr_1fr]">
        <Secao titulo="Últimos pagamentos" acao={<button className="botao-contorno !py-1.5 text-xs">Exportar planilha</button>}>
          <div className="max-h-[52vh] overflow-auto">
            <table className="tabela">
              <thead><tr><th>Inscrição</th><th>Atleta</th><th>Valor</th><th>Situação</th><th></th></tr></thead>
              <tbody>
                {movimentos.map((i) => (
                  <tr key={i.id}><td className="font-mono text-xs text-tinta-3">{i.id}</td><td className="font-medium">{d.nomeDe(i.id)}</td><td>{reais(i.valor)}</td><td>{pagamentoSelo(i.pagamento)}</td>
                    <td className="text-right">{i.pagamento === "pago" && <button className="botao-contorno !py-1 text-xs" onClick={() => d.despachar({ tipo: "pagamento", id: i.id, status: "estornado" })}>Estornar</button>}</td></tr>
                ))}
              </tbody>
            </table>
          </div>
          <p className="mt-3 text-xs text-tinta-3">Estornar tira o atleta da categoria. Depois que a chave começa, o estorno deixa de ser possível por aqui.</p>
        </Secao>
        <div className="space-y-4">
          <Secao titulo="Lotes">
            {[["Lote 1", "até 31 out", "R$ 100,00", "encerrado"], ["Lote 2", "até 14 nov", "R$ 120,00", "aberto"], ["Lote 3", "até 18 nov", "R$ 140,00", "agendado"]].map(([a, b, c, s]) => (
              <div key={a} className="flex items-center justify-between border-b border-linha/70 py-2.5 text-sm last:border-0"><span><span className="font-medium">{a}</span> <span className="text-tinta-3">{b}</span></span><span className="flex items-center gap-2">{c}<Selo tom={s === "aberto" ? "ok" : "neutro"}>{s}</Selo></span></div>
            ))}
          </Secao>
          <Secao titulo="Cupons e isenções">
            {d.estado.cupons.map((c) => (
              <div key={c.codigo} className="flex items-center justify-between border-b border-linha/70 py-2.5 text-sm"><span className="font-mono font-medium">{c.codigo}</span><span className="text-tinta-2">{c.desconto} · {c.usos} de {c.limite} usos</span></div>
            ))}
            <div className="mt-4 grid grid-cols-[1fr_auto_auto] gap-2">
              <input id="cupom-codigo" className="campo" placeholder="CÓDIGO" value={cupom.codigo} onChange={(e) => setCupom({ ...cupom, codigo: e.target.value.toUpperCase().replace(/[^A-Z0-9]/g, "") })} />
              <select id="cupom-desc" className="campo w-auto" value={cupom.desconto} onChange={(e) => setCupom({ ...cupom, desconto: e.target.value })}>{["10%", "15%", "50%", "100%"].map((x) => <option key={x}>{x}</option>)}</select>
              <button className="botao-primario" disabled={cupom.codigo.length < 3} onClick={() => { d.despachar({ tipo: "cupom", cupom: { codigo: cupom.codigo, desconto: cupom.desconto, usos: 0, limite: cupom.limite } }); setCupom({ ...cupom, codigo: "" }); }}>Criar</button>
            </div>
          </Secao>
        </div>
      </div>
    </>
  );
}

export function ResultadosOrg() {
  const d = useDados();
  const quadro = quadroDeMedalhas(d);
  const concluidas = d.categorias.filter((c) => d.resolvidas.get(c.id)?.concluida);
  return (
    <div className="grid gap-4 lg:grid-cols-[1fr_1.2fr]">
      <Secao titulo="Quadro de medalhas" acao={<button className="botao-contorno !py-1.5 text-xs">Exportar</button>}>
        {!quadro.length ? <Vazio>Nenhuma categoria encerrada ainda. Encerre lutas na mesa para ver o quadro.</Vazio> : (
          <table className="tabela">
            <thead><tr><th></th><th>Equipe</th><th>O</th><th>P</th><th>B</th><th>Pontos</th></tr></thead>
            <tbody>{quadro.map((l, k) => <tr key={l.equipe}><td className="font-semibold">{k + 1}º</td><td className="font-medium">{l.equipe}</td><td>{l.ouro}</td><td>{l.prata}</td><td>{l.bronze}</td><td className="font-semibold text-marinho">{l.pontos}</td></tr>)}</tbody>
          </table>
        )}
        <p className="mt-3 text-xs text-tinta-3">Regulamento Geral da IBJJF, art. 3: 9, 3 e 1 pontos; categoria com um atleta, ou com dois da mesma academia, não pontua.</p>
      </Secao>
      <Secao titulo={`Pódios · ${concluidas.length} de ${d.chaves.size} categorias`} acao={<Link className="botao-primario !py-1.5 text-xs" to={`/app/organizacao/eventos/${EVENTO_ID}/sumula`}>Súmula do campeonato</Link>}>
        {!concluidas.length ? <Vazio>Os pódios aparecem conforme as categorias terminam.</Vazio> : (
          <div className="max-h-[60vh] space-y-3 overflow-auto">
            {concluidas.map((c) => {
              const r = d.resolvidas.get(c.id)!;
              return (
                <div key={c.id} className="rounded-md border border-linha p-3 text-sm">
                  <div className="rotulo">{c.modalidade} · {c.nome}</div>
                  {[["1º", r.campeaoId], ["2º", r.viceId], ...r.semifinalistasDerrotados.map((x) => ["3º", x] as const)].map(([p, x], k) => (
                    <div key={k} className="mt-1 flex gap-3"><span className="w-6 font-semibold">{p}</span><span>{d.nomeDe(x)}</span><span className="text-tinta-3">{d.equipeDe(x)}</span></div>
                  ))}
                </div>
              );
            })}
          </div>
        )}
      </Secao>
    </div>
  );
}

export function EquipeEvento() {
  return (
    <div className="grid gap-4 lg:grid-cols-[1.6fr_1fr]">
      <Secao titulo="Equipe de trabalho do evento"><TabelaMembros filtro="Copa Horizonte 2026" />
        <p className="mt-3 text-xs text-tinta-3">O acesso de mesários e árbitros termina sozinho quando o evento é encerrado.</p></Secao>
      <Convite escopoPadrao="Copa Horizonte 2026" escopos={["Copa Horizonte 2026", ...[1, 2, 3, 4, 5, 6].map((t) => `Copa Horizonte 2026 · Tatame ${t}`)]} />
    </div>
  );
}

const opcoes: { chave: keyof Config; nome: string; dica: string }[] = [
  { chave: "inscritosPublicos", nome: "Aba de inscritos aberta ao público", dica: "Desligada, a lista completa fica só para a organização. Os nomes continuam aparecendo nas chaves publicadas, nos resultados e nos rankings." },
  { chave: "ocultarMenores", nome: "Reservar perfil, foto e ranking de menores", dica: "O nome do menor aparece em inscritos, chaves e resultados, como em qualquer campeonato. Perfil público, foto e ranking individual ficam reservados." },
  { chave: "painelPublico", nome: "Painel de próximas lutas aberto ao público", dica: "Pais e atletas acompanham pelo celular e a TV do ginásio abre sem login. Desligado, só quem está logado vê." },
  { chave: "exigirVinculo", nome: "Exigir vínculo confirmado com a equipe", dica: "A inscrição só entra na chave depois que o professor confirma o atleta." },
  { chave: "cpfObrigatorio", nome: "Exigir CPF na inscrição", dica: "Reduz cadastros duplicados. O CPF nunca é exibido." },
];

export function Configuracoes() {
  const d = useDados();
  const ev = eventos.find((e) => e.id === EVENTO_ID)!;
  return (
    <div className="grid gap-4 lg:grid-cols-2">
      <div className="space-y-4">
        <Secao titulo="Dados do evento">
          <div className="space-y-4">
            <Campo rotulo="Nome"><input id="cfg-nome" className="campo" defaultValue={ev.nome} /></Campo>
            <div className="grid grid-cols-2 gap-3"><Campo rotulo="Datas"><input id="cfg-datas" className="campo" defaultValue={ev.datas} /></Campo><Campo rotulo="Tatames"><input id="cfg-tatames" className="campo" type="number" defaultValue={6} /></Campo></div>
            <Campo rotulo="Endereço do local" dica="O mapa e o botão Como chegar da página pública saem deste endereço."><input id="cfg-local" className="campo" defaultValue={`${ev.local}, ${ev.cidade}`} /></Campo>
            <div><span className="rotulo">Imagem do evento</span>
              {d.estado.capaEvento ? <img src={d.estado.capaEvento} alt="Imagem atual do evento" className="mt-2 h-32 w-full rounded-md object-cover" /> : <div className="mt-2 grid h-32 place-items-center rounded-md border border-dashed border-linha text-sm text-tinta-3">Sem imagem: a página usa a arte padrão.</div>}
              <div className="mt-2 flex flex-wrap items-start gap-2">
                <EnviarImagem id="cfg-capa" rotulo={d.estado.capaEvento ? "Trocar imagem" : "Enviar imagem"} ladoMaximo={1400} aoEnviar={(url) => d.despachar({ tipo: "capa", url })} />
                {d.estado.capaEvento && <button className="botao-contorno !py-1.5 text-xs" onClick={() => d.despachar({ tipo: "capa", url: "" })}>Remover</button>}
              </div>
              <span className="mt-1 block text-xs text-tinta-3">Formato largo, de preferência 1400 por 500. Aparece na agenda e no topo da página do evento.</span></div>
          </div>
        </Secao>
        <Secao titulo="Chaves">
          <div className="space-y-4">
            <Campo rotulo="Pacote de chaves" dica="O protótipo gera eliminatória simples com dois bronzes. Os outros formatos dependem do motor.">
              <select id="cfg-pacote" className="campo"><option>Eliminatória simples com dois bronzes</option><option disabled>Eliminatória simples com disputa de terceiro (em construção)</option><option disabled>Eliminatória com repescagem (em construção)</option><option disabled>Todos contra todos (em construção)</option></select>
            </Campo>
            <Campo rotulo="Separação no sorteio"><select id="cfg-sep" className="campo"><option>Separar atletas da mesma equipe</option><option>Sorteio livre</option></select></Campo>
          </div>
        </Secao>
      </div>
      <div className="space-y-4">
        <Secao titulo="Privacidade e inscrição">
          {opcoes.map((o) => (
            <label key={o.chave} className="flex cursor-pointer items-start justify-between gap-4 border-b border-linha/70 py-3 last:border-0">
              <span><span className="font-medium">{o.nome}</span><span className="block text-xs text-tinta-3">{o.dica}</span></span>
              <input type="checkbox" className="mt-1 h-4 w-4" checked={d.estado.config[o.chave]} onChange={(e) => d.despachar({ tipo: "config", chave: o.chave, valor: e.target.checked })} />
            </label>
          ))}
        </Secao>
        <Secao titulo="Publicação">
          <div className="space-y-3 text-sm">
            <div className="flex justify-between"><span className="text-tinta-3">Página do evento</span><Selo tom="ok">publicada</Selo></div>
            <div className="flex justify-between"><span className="text-tinta-3">Inscrições</span><Selo tom="ok">abertas até 18 nov</Selo></div>
            <div className="flex justify-between"><span className="text-tinta-3">Chaves publicadas</span><span className="font-medium">{d.categorias.filter((c) => d.estado.publicadas[c.id]).length} de {d.chaves.size}</span></div>
          </div>
          <div className="mt-4 flex flex-wrap gap-2"><button className="botao-contorno">Encerrar inscrições</button><Link to={`/eventos/${ev.id}`} className="botao-contorno">Ver página pública</Link><Link to={`/eventos/${ev.id}/painel`} className="botao-contorno">Abrir painel do ginásio</Link></div>
        </Secao>
      </div>
    </div>
  );
}
