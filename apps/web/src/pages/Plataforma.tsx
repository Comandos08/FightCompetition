import { useState } from "react";
import { useParams } from "react-router-dom";
import { useDados } from "@/data/store";
import { EVENTO_ID, eventos } from "@/data/seed";
import { Campo, EnviarImagem, Indicador, Secao, Selo, SubNav, Titulo, Vazio } from "@/components/ui";

const nav = [
  { para: "/app/plataforma", nome: "Visão geral", fim: true },
  { para: "/app/plataforma/organizacoes", nome: "Organizações" },
  { para: "/app/plataforma/eventos", nome: "Eventos" },
  { para: "/app/plataforma/usuarios", nome: "Usuários" },
  { para: "/app/plataforma/parceiros", nome: "Parceiros" },
  { para: "/app/plataforma/equipe", nome: "Equipe interna" },
  { para: "/app/plataforma/auditoria", nome: "Auditoria" },
];

/** Toda ação do administrador fica registrada: quem fez, o quê e quando. */
function useAuditar() {
  const d = useDados();
  return (acao: string) => d.despachar({ tipo: "auditar", registro: { quando: new Date().toLocaleString("pt-BR"), quem: "Equipe Arena", acao } });
}

/** Área interna do SaaS. Só a equipe da plataforma entra aqui. */
export function Plataforma() {
  const { aba = "visao" } = useParams();
  return (
    <>
      <Titulo sobre="Área interna · equipe da plataforma">Administração da plataforma</Titulo>
      <SubNav itens={nav} />
      {aba === "visao" && <Visao />}
      {aba === "organizacoes" && <Organizacoes />}
      {aba === "eventos" && <Eventos />}
      {aba === "usuarios" && <Usuarios />}
      {aba === "parceiros" && <Parceiros />}
      {aba === "equipe" && <EquipeInterna />}
      {aba === "auditoria" && <Auditoria />}
    </>
  );
}

function useOrganizacoes() {
  const d = useDados();
  return [...new Set(eventos.map((e) => e.organizador))].map((nome) => {
    const evs = eventos.filter((e) => e.organizador === nome);
    return { nome, eventos: evs.length, inscricoes: evs.reduce((s, e) => s + (e.id === EVENTO_ID ? d.inscricoes.length : e.inscritos), 0), cidade: evs[0]!.cidade, suspensa: !!d.estado.orgsSuspensas[nome] };
  });
}

function Visao() {
  const d = useDados();
  const orgs = useOrganizacoes();
  const total = orgs.reduce((s, o) => s + o.inscricoes, 0);
  const transacionado = d.inscricoes.filter((i) => i.pagamento === "pago").reduce((s, i) => s + i.valor, 0);
  return (
    <>
      <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
        <Indicador rotulo="Organizações" valor={orgs.length} detalhe={`${orgs.filter((o) => o.suspensa).length} suspensas`} />
        <Indicador rotulo="Eventos" valor={eventos.length + d.estado.eventosNovos.length} detalhe={`${eventos.filter((e) => e.status === "Inscrições abertas").length} com inscrições abertas`} />
        <Indicador rotulo="Inscrições" valor={total} detalhe={`${d.atletas.size} atletas cadastrados`} />
        <Indicador rotulo="Volume transacionado" valor={`R$ ${(transacionado / 1000).toFixed(1).replace(".", ",")} mil`} detalhe="receita da plataforma: taxa a definir" />
      </div>
      <div className="mt-5 grid gap-4 lg:grid-cols-2">
        <Secao titulo="Pede atenção">
          {[["1 organização aguardando verificação cadastral", "aviso"], ["2 fotos de perfil denunciadas", "acao"], ["3 chamados de suporte abertos", "neutro"], ["1 pedido de parceria recebido pelo site", "neutro"]].map(([t, tom]) => (
            <div key={t} className="flex items-center justify-between border-b border-linha/70 py-2.5 text-sm last:border-0"><span>{t}</span><Selo tom={tom as "aviso"}>ver</Selo></div>
          ))}
          <p className="mt-3 text-xs text-tinta-3">Itens de exemplo. No produto, vêm das filas reais de verificação, denúncia e suporte.</p>
        </Secao>
        <Secao titulo="Inscrições por organização">
          {orgs.sort((a, b) => b.inscricoes - a.inscricoes).map((o, _, arr) => (
            <div key={o.nome} className="mb-2 flex items-center gap-3 text-sm">
              <span className="w-48 truncate">{o.nome}</span>
              <div className="h-2 flex-1 rounded-full bg-papel"><div className="h-2 rounded-full bg-marinho" style={{ width: `${(o.inscricoes / Math.max(arr[0]!.inscricoes, 1)) * 100}%` }} /></div>
              <span className="w-10 text-right font-mono text-xs">{o.inscricoes}</span>
            </div>
          ))}
        </Secao>
      </div>
    </>
  );
}

function Organizacoes() {
  const d = useDados();
  const auditar = useAuditar();
  const orgs = useOrganizacoes();
  return (
    <div className="cartao overflow-auto">
      <table className="tabela">
        <thead><tr><th>Organização</th><th>Cidade</th><th>Eventos</th><th>Inscrições</th><th>Situação</th><th></th></tr></thead>
        <tbody>
          {orgs.map((o) => (
            <tr key={o.nome}>
              <td className="font-medium">{o.nome}</td><td>{o.cidade}</td><td>{o.eventos}</td><td>{o.inscricoes}</td>
              <td>{o.suspensa ? <Selo tom="acao">suspensa</Selo> : <Selo tom="ok">ativa</Selo>}</td>
              <td className="text-right"><span className="inline-flex gap-2">
                <button className="botao-contorno !py-1 text-xs" onClick={() => auditar(`Abriu o painel de ${o.nome} em modo suporte`)}>Entrar como suporte</button>
                <button className="botao-contorno !py-1 text-xs" onClick={() => { d.despachar({ tipo: "org-suspender", nome: o.nome, valor: !o.suspensa }); auditar(`${o.suspensa ? "Reativou" : "Suspendeu"} a organização ${o.nome}`); }}>{o.suspensa ? "Reativar" : "Suspender"}</button>
              </span></td>
            </tr>
          ))}
        </tbody>
      </table>
      <p className="px-4 py-3 text-xs text-tinta-3">Suspender impede novos eventos e inscrições, sem apagar nada. "Entrar como suporte" abre o painel da organização com identificação visível e fica registrado na auditoria.</p>
    </div>
  );
}

function Eventos() {
  const d = useDados();
  const auditar = useAuditar();
  const [ocultos, setOcultos] = useState<Record<string, boolean>>({});
  return (
    <div className="cartao overflow-auto">
      <table className="tabela">
        <thead><tr><th>Evento</th><th>Organização</th><th>Data</th><th>Inscrições</th><th>Situação</th><th></th></tr></thead>
        <tbody>
          {eventos.map((e) => (
            <tr key={e.id}>
              <td className="font-medium">{e.nome}</td><td>{e.organizador}</td><td>{e.datas}</td><td>{e.id === EVENTO_ID ? d.inscricoes.length : e.inscritos}</td>
              <td>{ocultos[e.id] ? <Selo tom="acao">oculto pela plataforma</Selo> : <Selo tom={e.status === "Inscrições abertas" ? "ok" : "neutro"}>{e.status.toLowerCase()}</Selo>}</td>
              <td className="text-right"><button className="botao-contorno !py-1 text-xs" onClick={() => { setOcultos({ ...ocultos, [e.id]: !ocultos[e.id] }); auditar(`${ocultos[e.id] ? "Voltou a exibir" : "Ocultou"} o evento ${e.nome}`); }}>{ocultos[e.id] ? "Exibir" : "Ocultar do site"}</button></td>
            </tr>
          ))}
          {d.estado.eventosNovos.map((e) => <tr key={e.id}><td className="font-medium">{e.nome}</td><td>Liga Horizonte de Jiu-Jitsu</td><td>{e.datas}</td><td>0</td><td><Selo tom="aviso">rascunho</Selo></td><td /></tr>)}
        </tbody>
      </table>
    </div>
  );
}

function Usuarios() {
  const d = useDados();
  const auditar = useAuditar();
  const [busca, setBusca] = useState("");
  const [abertos, setAbertos] = useState<Record<string, boolean>>({});
  const achados = busca.trim().length < 3 ? [] : [...d.atletas.values()].filter((a) => a.nome.toLowerCase().includes(busca.toLowerCase())).slice(0, 12);
  return (
    <div className="max-w-4xl">
      <input id="adm-busca" className="campo mb-3 max-w-md" placeholder="Buscar pessoa pelo nome (mínimo de 3 letras)" value={busca} onChange={(e) => setBusca(e.target.value)} />
      {!achados.length ? <Vazio>A lista de pessoas não é exibida inteira. Busque pelo nome para atender um chamado. Tente "Rafael".</Vazio> : (
        <div className="cartao overflow-auto">
          <table className="tabela">
            <thead><tr><th>Pessoa</th><th>Equipe</th><th>Inscrições</th><th>Contato e documentos</th></tr></thead>
            <tbody>
              {achados.map((a) => (
                <tr key={a.id}>
                  <td className="font-medium">{a.nome}{a.menor && <span className="ml-2"><Selo tom="aviso">menor</Selo></span>}</td><td>{a.equipe}</td><td>{d.inscricoes.filter((i) => i.atletaId === a.id).length}</td>
                  <td>{abertos[a.id] ? <span className="text-sm text-tinta-2">{a.nome.split(" ")[0]!.toLowerCase()}@exemplo.com{a.menor ? ` · resp.: ${a.responsavel}` : ""}</span>
                    : <button className="botao-contorno !py-1 text-xs" onClick={() => { setAbertos({ ...abertos, [a.id]: true }); auditar(`Consultou dados pessoais de ${a.nome}${a.menor ? " (menor)" : ""}`); }}>Revelar (fica registrado)</button>}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
      <p className="mt-3 text-xs text-tinta-3">Dados pessoais ficam ocultos por padrão. Cada consulta gera um registro com o nome de quem consultou.</p>
    </div>
  );
}

function Parceiros() {
  const d = useDados();
  const auditar = useAuditar();
  const [f, setF] = useState({ nome: "", url: "" });
  return (
    <div className="grid gap-4 lg:grid-cols-[1.7fr_1fr]">
      <Secao titulo="Parceiros exibidos na página inicial">
        {!d.estado.parceiros.length && <Vazio>Nenhum parceiro cadastrado. A seção some da página inicial.</Vazio>}
        <div className="divide-y divide-linha/70">
          {d.estado.parceiros.map((p) => (
            <div key={p.id} className="flex flex-wrap items-center gap-4 py-3">
              <div className="grid h-14 w-32 shrink-0 place-items-center rounded-md border border-linha bg-papel px-2">
                {p.logo ? <img src={p.logo} alt={p.nome} className="max-h-10 max-w-full object-contain" /> : <span className="text-center text-xs font-bold uppercase text-tinta-3">{p.nome}</span>}
              </div>
              <div className="min-w-[10rem] flex-1"><div className="font-medium">{p.nome}</div><div className="text-xs text-tinta-3">{p.url || "sem link"}</div></div>
              {p.ativo ? <Selo tom="ok">no ar</Selo> : <Selo>oculto</Selo>}
              <EnviarImagem id={`logo-${p.id}`} rotulo={p.logo ? "Trocar logo" : "Enviar logo"} ladoMaximo={480} aoEnviar={(logo) => { d.despachar({ tipo: "parceiro-mudar", id: p.id, campos: { logo } }); auditar(`Atualizou o logo do parceiro ${p.nome}`); }} />
              <button className="botao-contorno !py-1.5 text-xs" onClick={() => { d.despachar({ tipo: "parceiro-mudar", id: p.id, campos: { ativo: !p.ativo } }); auditar(`${p.ativo ? "Ocultou" : "Publicou"} o parceiro ${p.nome}`); }}>{p.ativo ? "Ocultar" : "Publicar"}</button>
              <button className="botao-contorno !py-1.5 text-xs" onClick={() => { d.despachar({ tipo: "parceiro-remover", id: p.id }); auditar(`Removeu o parceiro ${p.nome}`); }}>Remover</button>
            </div>
          ))}
        </div>
        <p className="mt-3 text-xs text-tinta-3">Só publique a marca de quem autorizou por escrito. Logos em PNG com fundo transparente ficam melhores; a página inicial mostra em cinza e colore ao passar o mouse.</p>
      </Secao>
      <Secao titulo="Adicionar parceiro">
        <div className="space-y-4">
          <Campo rotulo="Nome"><input id="parc-nome" className="campo" value={f.nome} onChange={(e) => setF({ ...f, nome: e.target.value })} /></Campo>
          <Campo rotulo="Site" dica="Opcional. O logo vira link para este endereço."><input id="parc-url" className="campo" placeholder="https://" value={f.url} onChange={(e) => setF({ ...f, url: e.target.value })} /></Campo>
          <button className="botao-primario w-full" disabled={f.nome.trim().length < 2 || (!!f.url && !/^https?:\/\//.test(f.url))}
            onClick={() => { d.despachar({ tipo: "parceiro", parceiro: { id: `p${Date.now()}`, nome: f.nome.trim(), url: f.url.trim(), logo: "", ativo: false } }); auditar(`Cadastrou o parceiro ${f.nome.trim()}`); setF({ nome: "", url: "" }); }}>Adicionar como oculto</button>
          <p className="text-xs text-tinta-3">O parceiro entra oculto. Envie o logo e publique quando estiver pronto.</p>
        </div>
      </Secao>
    </div>
  );
}

function EquipeInterna() {
  const papeis: [string, string, string][] = [
    ["Administrador", "Tudo, inclusive gerenciar a equipe interna e os parceiros", "1 pessoa"],
    ["Suporte", "Busca pessoas e organizações, entra como suporte, não suspende nem mexe em dinheiro", "nenhuma ainda"],
    ["Financeiro", "Repasses, estornos e taxas; não vê dados de atletas", "nenhuma ainda"],
    ["Conteúdo", "Parceiros, textos institucionais e moderação de imagens", "nenhuma ainda"],
  ];
  return (
    <Secao titulo="Papéis da equipe da plataforma">
      <table className="tabela">
        <thead><tr><th>Papel</th><th>O que pode fazer</th><th>Quem tem</th></tr></thead>
        <tbody>{papeis.map(([p, o, q]) => <tr key={p}><td className="font-medium">{p}</td><td>{o}</td><td>{q}</td></tr>)}</tbody>
      </table>
      <p className="mt-3 text-xs text-tinta-3">Mesmo dentro da equipe interna, cada pessoa recebe só o papel de que precisa. O acesso de administrador exige verificação em duas etapas.</p>
    </Secao>
  );
}

function Auditoria() {
  const d = useDados();
  return (
    <Secao titulo="Registro de ações da equipe interna">
      {!d.estado.auditoria.length ? <Vazio>Nenhuma ação registrada ainda. Suspenda uma organização, revele um contato ou publique um parceiro para ver o registro.</Vazio> : (
        <table className="tabela">
          <thead><tr><th>Quando</th><th>Quem</th><th>Ação</th></tr></thead>
          <tbody>{d.estado.auditoria.map((r, k) => <tr key={k}><td className="whitespace-nowrap font-mono text-xs">{r.quando}</td><td>{r.quem}</td><td>{r.acao}</td></tr>)}</tbody>
        </table>
      )}
      <p className="mt-3 text-xs text-tinta-3">O registro não pode ser editado nem apagado, nem pelo administrador.</p>
    </Secao>
  );
}
