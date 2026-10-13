import { useState } from "react";
import { Link, useNavigate, useParams } from "react-router-dom";
import { useDados } from "@/data/store";
import { usePessoa } from "@/data/sessao";
import { ANO_EVENTO, EVENTO_ID, divisaoPorIdade, equipes, type Atleta } from "@/data/seed";
import { Campo, Faixa, Secao, Selo, SubNav, Titulo, Vazio, pagamentoSelo } from "@/components/ui";
import { quadroDeMedalhas, lutasDoAtleta } from "@/lib/resultados";
import { nomeRodada } from "@/lib/competicao";

export const navConta = [
  { para: "/app/atleta", nome: "Minhas lutas", fim: true },
  { para: "/app/perfil", nome: "Perfil esportivo" },
  { para: "/app/dependentes", nome: "Dependentes" },
  { para: "/app/pedidos", nome: "Pedidos e pagamentos" },
];

function Salvo({ visivel }: { visivel: boolean }) {
  return visivel ? <span className="text-sm text-tatame">Alterações salvas.</span> : null;
}

export function Perfil() {
  const d = useDados();
  const pessoa = usePessoa();
  const atleta = pessoa.atletaId ? d.atletas.get(pessoa.atletaId) : undefined;
  const [salvo, setSalvo] = useState(false);
  return (
    <>
      <Titulo sobre="Minha área">Perfil esportivo</Titulo>
      <SubNav itens={navConta} />
      <div className="grid gap-4 lg:grid-cols-[1fr_1.4fr]">
        <Secao titulo="Dados pessoais">
          <div className="space-y-4">
            <Campo rotulo="Nome completo"><input id="perfil-nome" className="campo" defaultValue={pessoa.nome} onChange={() => setSalvo(false)} /></Campo>
            <Campo rotulo="Nome de competição" dica="É o nome que aparece nas chaves e nos resultados."><input id="perfil-apelido" className="campo" defaultValue={pessoa.nome.split(" ").slice(0, 2).join(" ")} onChange={() => setSalvo(false)} /></Campo>
            <div className="grid grid-cols-2 gap-3">
              <Campo rotulo="Ano de nascimento" dica="Só muda pelo suporte depois da primeira inscrição."><input id="perfil-ano" className="campo" disabled defaultValue={atleta?.anoNascimento ?? 1988} /></Campo>
              <Campo rotulo="Celular"><input id="perfil-cel" className="campo" placeholder="(21) 90000-0000" onChange={() => setSalvo(false)} /></Campo>
            </div>
            <Campo rotulo="E-mail de acesso"><input id="perfil-email" className="campo" disabled defaultValue={`${pessoa.nome.split(" ")[0]!.toLowerCase()}@exemplo.com`} /></Campo>
            <div className="flex items-center gap-3"><button className="botao-primario" onClick={() => setSalvo(true)}>Salvar</button><Salvo visivel={salvo} /></div>
          </div>
        </Secao>
        <div className="space-y-4">
          <Secao titulo="Graduação por modalidade" acao={<button className="botao-contorno !py-1.5 text-xs">Adicionar modalidade</button>}>
            <table className="tabela">
              <thead><tr><th>Modalidade</th><th>Graduação</th><th>Desde</th><th>Situação</th></tr></thead>
              <tbody>
                <tr><td className="font-medium">Jiu-Jitsu</td><td><Faixa cor={atleta?.faixa ?? "Preta"} /></td><td>2024</td><td><Selo tom="ok">confirmada pelo professor</Selo></td></tr>
                <tr><td className="font-medium">Judô</td><td>Faixa roxa</td><td>2019</td><td><Selo>declarada</Selo></td></tr>
              </tbody>
            </table>
            <p className="mt-3 text-xs text-tinta-3">Cada modalidade tem graduação própria. A faixa usada em uma competição fica registrada naquele evento e não muda quando você é graduado depois.</p>
          </Secao>
          <Secao titulo="Vínculos com equipes" acao={<button className="botao-contorno !py-1.5 text-xs">Solicitar vínculo</button>}>
            <table className="tabela">
              <thead><tr><th>Equipe</th><th>Papel</th><th>Desde</th><th>Situação</th></tr></thead>
              <tbody>
                <tr><td className="font-medium">{atleta?.equipe ?? "Raiz Jiu-Jitsu"}</td><td>{pessoa.persona === "professor" ? "Professor" : "Atleta"}</td><td>mar 2022</td><td><Selo tom="ok">ativo</Selo></td></tr>
                <tr><td className="font-medium">Escola Vento Sul</td><td>Atleta</td><td>2018 a 2022</td><td><Selo>encerrado</Selo></td></tr>
              </tbody>
            </table>
            <p className="mt-3 text-xs text-tinta-3">Trocar de equipe não altera os resultados que você conquistou pela equipe anterior.</p>
          </Secao>
        </div>
      </div>
    </>
  );
}

export function Dependentes() {
  const d = useDados();
  const [f, setF] = useState({ nome: "", ano: "", sexo: "M", equipe: equipes[0]!, relacao: "Mãe ou pai" });
  const idade = f.ano.length === 4 ? ANO_EVENTO - Number(f.ano) : NaN;
  const div = Number.isFinite(idade) ? divisaoPorIdade(idade) : undefined;
  const valido = f.nome.trim().length > 4 && Number.isFinite(idade) && idade < 18 && idade >= 4;
  const adicionar = () => {
    const atleta: Atleta = { id: `AT8${String(d.estado.dependentes.length).padStart(3, "0")}`, nome: f.nome.trim(), sexo: f.sexo as "M" | "F", anoNascimento: Number(f.ano), equipe: f.equipe, faixa: "Branca", menor: true, responsavel: "Você" };
    d.despachar({ tipo: "dependente", atleta });
    setF({ ...f, nome: "", ano: "" });
  };
  return (
    <>
      <Titulo sobre="Minha área">Dependentes</Titulo>
      <SubNav itens={navConta} />
      <div className="grid gap-4 lg:grid-cols-[1.4fr_1fr]">
        <Secao titulo="Menores sob sua responsabilidade">
          {!d.estado.dependentes.length && <Vazio>Nenhum dependente cadastrado. Cadastre um filho ou menor sob sua responsabilidade para inscrevê-lo sem criar outra conta.</Vazio>}
          <div className="divide-y divide-linha/70">
            {d.estado.dependentes.map((a) => (
              <div key={a.id} className="flex flex-wrap items-center justify-between gap-3 py-3">
                <div><div className="font-medium">{a.nome}</div><div className="text-xs text-tinta-3">{ANO_EVENTO - a.anoNascimento} anos · {divisaoPorIdade(ANO_EVENTO - a.anoNascimento)?.nome ?? "sem divisão"} · {a.equipe}</div></div>
                <div className="flex items-center gap-2"><Selo tom="ok">autorização registrada</Selo><Link to={`/app/inscricao/${EVENTO_ID}`} className="botao-contorno !py-1.5 text-xs">Inscrever</Link></div>
              </div>
            ))}
          </div>
          <p className="mt-4 text-xs text-tinta-3">O dependente não tem login. Ao completar 18 anos, ele pode assumir o próprio perfil e manter todo o histórico. O seu nome nunca aparece em chaves ou telas públicas.</p>
        </Secao>
        <Secao titulo="Adicionar dependente">
          <div className="space-y-4">
            <Campo rotulo="Nome completo do menor"><input id="dep-nome" className="campo" value={f.nome} onChange={(e) => setF({ ...f, nome: e.target.value })} /></Campo>
            <div className="grid grid-cols-2 gap-3">
              <Campo rotulo="Ano de nascimento"><input id="dep-ano" className="campo" inputMode="numeric" placeholder="ex.: 2015" value={f.ano} onChange={(e) => setF({ ...f, ano: e.target.value.replace(/\D/g, "").slice(0, 4) })} /></Campo>
              <Campo rotulo="Sexo"><select id="dep-sexo" className="campo" value={f.sexo} onChange={(e) => setF({ ...f, sexo: e.target.value })}><option value="M">Masculino</option><option value="F">Feminino</option></select></Campo>
            </div>
            <Campo rotulo="Equipe"><select id="dep-equipe" className="campo" value={f.equipe} onChange={(e) => setF({ ...f, equipe: e.target.value })}>{equipes.map((e) => <option key={e}>{e}</option>)}</select></Campo>
            <Campo rotulo="Sua relação com o menor"><select id="dep-relacao" className="campo" value={f.relacao} onChange={(e) => setF({ ...f, relacao: e.target.value })}><option>Mãe ou pai</option><option>Tutor legal</option></select></Campo>
            {f.ano.length === 4 && (idade >= 18 ? <div className="rounded-md bg-perigo-claro px-3 py-2 text-sm text-perigo">Com {idade} anos, a pessoa cria a própria conta.</div>
              : div ? <div className="rounded-md bg-tatame-claro px-3 py-2 text-sm text-tatame">Divisão de idade: {div.nome}.</div> : null)}
            <button className="botao-primario w-full" disabled={!valido} onClick={adicionar}>Cadastrar e registrar autorização</button>
          </div>
        </Secao>
      </div>
    </>
  );
}

export function Pedidos() {
  const d = useDados();
  const pessoa = usePessoa();
  const minhas = d.inscricoes.filter((i) => i.atletaId === pessoa.atletaId || d.estado.novasInscricoes.some((n) => n.id === i.id));
  // um pedido por atleta: no produto, um pedido pode reunir inscrições de várias pessoas
  const pedidos = [...new Set(minhas.map((i) => i.atletaId))].map((atletaId, k) => {
    const itens = minhas.filter((i) => i.atletaId === atletaId);
    return { numero: `P-${2026}${String(1040 + k)}`, itens, total: itens.reduce((s, i) => s + i.valor, 0), status: itens[0]!.pagamento };
  });
  return (
    <>
      <Titulo sobre="Minha área">Pedidos e pagamentos</Titulo>
      <SubNav itens={navConta} />
      {!pedidos.length && <Vazio>Você ainda não fez nenhum pedido.</Vazio>}
      <div className="space-y-4">
        {pedidos.map((p) => (
          <div key={p.numero} className="cartao overflow-hidden">
            <div className="flex flex-wrap items-center justify-between gap-3 border-b border-linha/70 px-5 py-3">
              <div><span className="font-semibold">Pedido {p.numero}</span><span className="ml-3 text-sm text-tinta-3">Copa Horizonte de Jiu-Jitsu 2026 · Pix</span></div>
              <div className="flex items-center gap-3">{pagamentoSelo(p.status)}<span className="text-lg font-semibold text-marinho">R$ {p.total},00</span></div>
            </div>
            {p.itens.map((i) => (
              <div key={i.id} className="flex flex-wrap items-center justify-between gap-2 border-b border-linha/50 px-5 py-2.5 text-sm last:border-0">
                <span><span className="font-medium">{d.nomeDe(i.id)}</span> · {i.modalidade} · {i.divisao} · {i.faixa} · {i.peso}</span>
                <span className="text-tinta-2">R$ {i.valor},00</span>
              </div>
            ))}
            <div className="flex flex-wrap items-center justify-between gap-2 bg-papel px-5 py-3 text-sm">
              <span className="text-tinta-3">Cancelamento com reembolso integral até 14 nov. Depois disso, crédito para o próximo evento.</span>
              <div className="flex gap-2"><button className="botao-contorno !py-1.5 text-xs">Ver comprovante</button>
                {p.status === "pago" && <button className="botao-contorno !py-1.5 text-xs" onClick={() => p.itens.forEach((i) => d.despachar({ tipo: "pagamento", id: i.id, status: "estornado" }))}>Cancelar inscrição</button>}
                {p.status === "pendente" && <button className="botao-acao !py-1.5 text-xs" onClick={() => p.itens.forEach((i) => d.despachar({ tipo: "pagamento", id: i.id, status: "pago" }))}>Pagar com Pix</button>}
              </div>
            </div>
          </div>
        ))}
      </div>
    </>
  );
}

export function Cadastro() {
  const d = useDados();
  const nav = useNavigate();
  const [aceite, setAceite] = useState(false);
  return (
    <div className="mx-auto max-w-md">
      <h1 className="text-3xl font-semibold">Criar conta</h1>
      <p className="mt-2 text-tinta-2">Uma conta serve para competir, inscrever dependentes, acompanhar a sua equipe e trabalhar em eventos.</p>
      <div className="cartao mt-6 space-y-4 p-6">
        <Campo rotulo="Nome completo"><input id="cad-nome" className="campo" /></Campo>
        <Campo rotulo="E-mail"><input id="cad-email" className="campo" type="email" placeholder="voce@exemplo.com" /></Campo>
        <Campo rotulo="Senha" dica="Mínimo de 8 caracteres."><input id="cad-senha" className="campo" type="password" /></Campo>
        <Campo rotulo="Ano de nascimento" dica="A conta é para maiores de 18. Menores são cadastrados como dependentes."><input id="cad-ano" className="campo" inputMode="numeric" placeholder="ex.: 1990" /></Campo>
        <label className="flex items-start gap-2 text-sm"><input id="cad-aceite" type="checkbox" className="mt-1" checked={aceite} onChange={(e) => setAceite(e.target.checked)} /> Li e aceito os termos de uso e a política de privacidade.</label>
        <button className="botao-primario w-full" disabled={!aceite} onClick={() => { d.despachar({ tipo: "entrar", persona: "atleta" }); nav("/app/perfil"); }}>Criar conta</button>
        <p className="text-center text-sm text-tinta-2">Já tem conta? <Link to="/entrar" className="font-medium text-marinho hover:underline">Entrar</Link></p>
      </div>
      <p className="mt-3 text-center text-xs text-tinta-3">No protótipo, o cadastro é simulado e entra com a conta de atleta de demonstração.</p>
    </div>
  );
}

/** Perfil público do atleta: só dados esportivos. Menores podem ser ocultados pelo organizador. */
export function PerfilAtleta() {
  const { id } = useParams();
  const d = useDados();
  const a = d.atletas.get(id ?? "");
  if (!a) return <Vazio>Atleta não encontrado.</Vazio>;
  if (a.menor && d.estado.config.ocultarMenores) return <Vazio>O perfil de atletas menores de idade não é público neste evento.</Vazio>;
  const lutas = lutasDoAtleta(d, a.id);
  const feitas = lutas.filter((l) => l.venceu !== undefined);
  const vitorias = feitas.filter((l) => l.venceu).length;
  const inscricoes = d.inscricoes.filter((i) => i.atletaId === a.id);
  return (
    <>
      <nav className="mb-4 flex flex-wrap items-center gap-2 text-xs text-tinta-3">
        <Link to="/" className="font-medium text-marinho hover:underline">Eventos</Link><span>›</span>
        <Link to={`/eventos/${EVENTO_ID}`} className="font-medium text-marinho hover:underline">Copa Horizonte de Jiu-Jitsu 2026</Link><span>›</span><span>{a.nome}</span>
      </nav>
      <h1 className="mb-5 text-2xl font-semibold sm:text-3xl">{a.nome}</h1>
      <div className="grid gap-4 lg:grid-cols-[300px_1fr]">
        <div className="cartao p-6">
          <div className="mx-auto mb-5 grid h-28 w-28 place-items-center rounded-lg bg-marinho-claro text-3xl font-semibold text-marinho">{a.nome.split(" ").map((x) => x[0]).slice(0, 2).join("")}</div>
          {[["Equipe", <Link key="e" to={`/equipes/${encodeURIComponent(a.equipe)}`} className="text-marinho hover:underline">{a.equipe}</Link>], ["Faixa", <Faixa key="f" cor={a.faixa} />], ["Divisão", divisaoPorIdade(ANO_EVENTO - a.anoNascimento)?.nome ?? ""], ["Inscrições", String(inscricoes.length)]].map(([k, v]) => (
            <div key={String(k)} className="flex items-center justify-between border-b border-linha/70 py-2.5 text-sm last:border-0"><span className="text-tinta-3">{k}</span><span className="font-medium">{v}</span></div>
          ))}
          <p className="mt-4 text-xs text-tinta-3">Data de nascimento, contato e documentos não são exibidos.</p>
        </div>
        <div className="space-y-4">
          <div className="grid gap-3 sm:grid-cols-3">
            {[["Lutas", feitas.length], ["Vitórias", vitorias], ["Derrotas", feitas.length - vitorias]].map(([k, v]) => (
              <div key={k} className="cartao p-4"><div className="rotulo">{k}</div><div className="mt-1 text-3xl font-semibold text-marinho">{v}</div></div>
            ))}
          </div>
          <Secao titulo="Lutas neste evento">
            {!lutas.length ? <Vazio>Nenhuma luta definida ainda.</Vazio> : (
              <table className="tabela">
                <thead><tr><th>Categoria</th><th>Fase</th><th>Oponente</th><th>Resultado</th></tr></thead>
                <tbody>
                  {lutas.map((l, k) => (
                    <tr key={k}><td>{l.categoria}</td><td>{nomeRodada(l.rodada, l.total)}</td><td>{l.oponente ?? <span className="italic text-tinta-3">a definir</span>}</td>
                      <td>{l.venceu === undefined ? <Selo>a realizar</Selo> : l.venceu ? <Selo tom="ok">vitória · {l.metodo}</Selo> : <Selo tom="acao">derrota · {l.metodo}</Selo>}</td></tr>
                  ))}
                </tbody>
              </table>
            )}
          </Secao>
        </div>
      </div>
    </>
  );
}

export function PaginaEquipe() {
  const { nome } = useParams();
  const d = useDados();
  const equipe = decodeURIComponent(nome ?? "");
  const atletas = [...d.atletas.values()].filter((a) => a.equipe === equipe);
  if (!atletas.length) return <Vazio>Equipe não encontrada.</Vazio>;
  const quadro = quadroDeMedalhas(d);
  const posicao = quadro.findIndex((l) => l.equipe === equipe);
  const linha = quadro[posicao];
  const visiveis = atletas.filter((a) => !(a.menor && d.estado.config.ocultarMenores));
  return (
    <>
      <nav className="mb-4 flex flex-wrap items-center gap-2 text-xs text-tinta-3">
        <Link to="/" className="font-medium text-marinho hover:underline">Eventos</Link><span>›</span>
        <Link to={`/eventos/${EVENTO_ID}`} className="font-medium text-marinho hover:underline">Copa Horizonte de Jiu-Jitsu 2026</Link><span>›</span><span>{equipe}</span>
      </nav>
      <h1 className="mb-5 text-2xl font-semibold sm:text-3xl">{equipe}</h1>
      <div className="mb-4 grid gap-3 sm:grid-cols-2 lg:grid-cols-5">
        {[["Atletas", atletas.length], ["Posição", posicao >= 0 ? `${posicao + 1}º` : "sem pontos"], ["Ouros", linha?.ouro ?? 0], ["Pratas", linha?.prata ?? 0], ["Bronzes", linha?.bronze ?? 0]].map(([k, v]) => (
          <div key={k} className="cartao p-4"><div className="rotulo">{k}</div><div className="mt-1 text-3xl font-semibold text-marinho">{v}</div></div>
        ))}
      </div>
      <Secao titulo="Atletas inscritos">
        <div className="max-h-[60vh] overflow-auto">
          <table className="tabela">
            <thead><tr><th>Atleta</th><th>Faixa</th><th>Divisão</th><th>Inscrições</th></tr></thead>
            <tbody>
              {visiveis.map((a) => (
                <tr key={a.id}><td><Link to={`/atletas/${a.id}`} className="font-medium text-marinho hover:underline">{a.nome}</Link></td><td><Faixa cor={a.faixa} /></td>
                  <td>{divisaoPorIdade(ANO_EVENTO - a.anoNascimento)?.nome}</td><td>{d.inscricoes.filter((i) => i.atletaId === a.id).length}</td></tr>
              ))}
            </tbody>
          </table>
        </div>
        {visiveis.length < atletas.length && <p className="mt-3 text-xs text-tinta-3">{atletas.length - visiveis.length} atletas menores de idade não são listados publicamente.</p>}
      </Secao>
    </>
  );
}
