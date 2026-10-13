import { useMemo, useState } from "react";
import { Link } from "react-router-dom";
import { useDados } from "@/data/store";
import { EQUIPE_DO_PROFESSOR, usePessoa } from "@/data/sessao";
import { Avatar, Campo, Faixa, Indicador, Secao, Selo, SubNav, Titulo, Vazio } from "@/components/ui";
import { ORGS_COM_RANKING, fichaDoAtleta, gruposDoRanking, rankingDeAtletas } from "@/lib/ranking";
import { PainelDesempenho, PosicoesNosRankings } from "@/pages/Vitrine";
import { SubNavConta } from "@/pages/Conta";
import { navEquipe } from "@/pages/Pessoas";
import { SubNavOrg } from "@/pages/Gestao";

/** Atleta vendo a própria performance. */
export function MeuDesempenho() {
  const d = useDados();
  const pessoa = usePessoa();
  const a = pessoa.atletaId ? d.atletas.get(pessoa.atletaId) : undefined;
  return (
    <>
      <Titulo sobre="Minha área">Meu desempenho</Titulo>
      <SubNavConta />
      {!a ? <Vazio>Esta conta de demonstração não tem perfil de atleta. Entre com a conta de atleta para ver o desempenho.</Vazio> : (
        <div className="grid gap-4 lg:grid-cols-[280px_1fr]">
          <div className="cartao h-fit p-6">
            <div className="mb-4 flex items-center gap-3"><Avatar atletaId={a.id} nome={a.nome} className="h-14 w-14 text-lg" /><div><div className="font-semibold">{a.nome}</div><div className="text-xs text-tinta-3">{a.equipe}</div></div></div>
            <div className="rotulo mb-1">Minha posição nos rankings</div>
            <PosicoesNosRankings a={a} />
            <Link to={`/atletas/${a.id}`} className="botao-contorno mt-4 w-full">Ver meu perfil público</Link>
          </div>
          <PainelDesempenho a={a} />
        </div>
      )}
    </>
  );
}

/** Professor vendo o desempenho dos alunos, inclusive menores, que não aparecem nos rankings públicos. */
export function EquipeDesempenho() {
  const d = useDados();
  const equipe = EQUIPE_DO_PROFESSOR;
  const [ordem, setOrdem] = useState<"pontos" | "aproveitamento" | "lutas">("pontos");
  const fichas = useMemo(() => [...d.atletas.values()].filter((a) => a.equipe === equipe).map((a) => fichaDoAtleta(d, a)), [d, equipe]);
  const taxa = (v: number, l: number) => (l ? v / l : 0);
  const lista = [...fichas].sort((x, y) => ordem === "pontos" ? y.pontos - x.pontos : ordem === "lutas" ? y.lutas - x.lutas : taxa(y.vitorias, y.lutas) - taxa(x.vitorias, x.lutas));
  const lutas = fichas.reduce((s, f) => s + f.lutas, 0), vitorias = fichas.reduce((s, f) => s + f.vitorias, 0);
  const podios = fichas.reduce((s, f) => s + f.conquistas.length, 0);
  return (
    <>
      <Titulo sobre="Equipe · você é professor">{equipe}</Titulo>
      <SubNav itens={navEquipe} />
      <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
        <Indicador rotulo="Alunos com histórico" valor={fichas.length} detalhe={`${fichas.filter((f) => f.atleta.menor).length} menores`} />
        <Indicador rotulo="Aproveitamento" valor={`${Math.round(taxa(vitorias, lutas) * 100)}%`} detalhe={`${vitorias} vitórias em ${lutas} lutas`} />
        <Indicador rotulo="Pódios na temporada" valor={podios} detalhe={`${fichas.reduce((s, f) => s + f.conquistas.filter((c) => c.colocacao === 1).length, 0)} ouros`} />
        <Indicador rotulo="Finalizações" valor={fichas.reduce((s, f) => s + f.vitoriasPor[1]!, 0)} detalhe="vitórias por finalização" />
      </div>
      <div className="cartao mt-5 p-5">
        <div className="mb-3 flex flex-wrap items-center justify-between gap-3">
          <h2 className="text-lg font-semibold">Desempenho dos alunos</h2>
          <div className="flex rounded-md border border-linha bg-white p-1">
            {([["pontos", "Pontos"], ["aproveitamento", "Aproveitamento"], ["lutas", "Lutas"]] as const).map(([id, nome]) => <button key={id} onClick={() => setOrdem(id)} className={`rounded px-3 py-1.5 text-sm font-medium ${ordem === id ? "bg-marinho text-white" : "text-tinta-2 hover:text-marinho"}`}>{nome}</button>)}
          </div>
        </div>
        <div className="max-h-[60vh] overflow-auto">
          <table className="tabela">
            <thead><tr><th>Aluno</th><th>Faixa</th><th>Lutas</th><th>Cartel</th><th>Aproveitamento</th><th>Pódios</th><th>Pontos</th></tr></thead>
            <tbody>
              {lista.map((f) => (
                <tr key={f.atleta.id}>
                  <td><div className="flex items-center gap-3"><Avatar atletaId={f.atleta.id} nome={f.atleta.nome} className="h-9 w-9 shrink-0 text-xs" /><span className="font-medium">{f.atleta.nome}{f.atleta.menor && <span className="ml-2"><Selo>menor</Selo></span>}</span></div></td>
                  <td><Faixa cor={f.atleta.faixa} /></td><td>{f.lutas}</td>
                  <td className="whitespace-nowrap"><b>{f.vitorias}</b>V | <b>{f.derrotas}</b>D</td>
                  <td><div className="flex items-center gap-2"><div className="h-1.5 w-20 rounded-full bg-papel"><div className="h-1.5 rounded-full bg-tatame" style={{ width: `${taxa(f.vitorias, f.lutas) * 100}%` }} /></div><span className="text-xs">{Math.round(taxa(f.vitorias, f.lutas) * 100)}%</span></div></td>
                  <td>{f.conquistas.length}</td><td className="font-semibold">{f.pontos}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        <p className="mt-3 text-xs text-tinta-3">Só o professor vê esta tabela. Menores aparecem aqui, mas não nos rankings públicos. Os pontos somam os pódios do aluno em todas as organizações.</p>
      </div>
    </>
  );
}

/** Organização administrando o próprio ranking: regra de pontos, publicação e prévia. */
export function RankingDaOrganizacao() {
  const d = useDados();
  const org = ORGS_COM_RANKING[0];
  const [regra, setRegra] = useState({ ouro: 9, prata: 3, bronze: 1, publico: true, menores: false, descarte: "Todos os eventos contam" });
  const [salvo, setSalvo] = useState(false);
  const fichas = useMemo(() => rankingDeAtletas(d, org), [d, org]);
  const grupos = gruposDoRanking(fichas);
  const mudar = (k: string, v: unknown) => { setRegra((r) => ({ ...r, [k]: v })); setSalvo(false); };
  return (
    <>
      <Titulo sobre="Organização" acoes={<Link to="/rankings" className="botao-contorno">Ver ranking público</Link>}>Ranking da organização</Titulo>
      <SubNavOrg />
      <div className="grid gap-4 lg:grid-cols-[1fr_1.4fr]">
        <Secao titulo="Regra do ranking">
          <div className="space-y-4">
            <div className="grid grid-cols-3 gap-3">
              <Campo rotulo="Ouro"><input id="rk-ouro" type="number" className="campo" value={regra.ouro} onChange={(e) => mudar("ouro", Number(e.target.value))} /></Campo>
              <Campo rotulo="Prata"><input id="rk-prata" type="number" className="campo" value={regra.prata} onChange={(e) => mudar("prata", Number(e.target.value))} /></Campo>
              <Campo rotulo="Bronze"><input id="rk-bronze" type="number" className="campo" value={regra.bronze} onChange={(e) => mudar("bronze", Number(e.target.value))} /></Campo>
            </div>
            <Campo rotulo="Peso dos eventos" dica="Cada evento recebe um peso de 1 a 3 nas configurações dele.">
              <div className="rounded-md border border-linha text-sm">{[["Copa Horizonte de Jiu-Jitsu 2026", 3], ["Circuito Horizonte · Etapa de Verão 2026", 2], ["Copa Horizonte de Jiu-Jitsu 2025", 3]].map(([n, p]) => <div key={n as string} className="flex justify-between border-b border-linha/70 px-3 py-2 last:border-0"><span>{n}</span><b>× {p}</b></div>)}</div>
            </Campo>
            <Campo rotulo="Quantos resultados contam"><select id="rk-descarte" className="campo" value={regra.descarte} onChange={(e) => mudar("descarte", e.target.value)}><option>Todos os eventos contam</option><option>Os 3 melhores resultados da temporada</option><option>Os 5 melhores resultados da temporada</option></select></Campo>
            <label className="flex items-start justify-between gap-4"><span><span className="font-medium">Ranking público</span><span className="block text-xs text-tinta-3">Aparece na página de rankings e na página inicial da plataforma.</span></span><input type="checkbox" className="mt-1 h-4 w-4" checked={regra.publico} onChange={(e) => mudar("publico", e.target.checked)} /></label>
            <label className="flex items-start justify-between gap-4"><span><span className="font-medium">Incluir categorias de menores</span><span className="block text-xs text-tinta-3">Exige autorização do responsável para cada atleta.</span></span><input type="checkbox" className="mt-1 h-4 w-4" checked={regra.menores} onChange={(e) => mudar("menores", e.target.checked)} /></label>
            <div className="flex items-center gap-3"><button className="botao-primario" onClick={() => setSalvo(true)}>Salvar regra</button>{salvo && <span className="text-sm text-tatame">Regra salva. Vale para a próxima apuração.</span>}</div>
            <p className="text-xs text-tinta-3">No protótipo, a regra não recalcula o ranking. No produto, toda mudança de regra fica registrada com data e não altera temporadas encerradas.</p>
          </div>
        </Secao>
        <Secao titulo={`Líderes por categoria · ${fichas.length} atletas pontuados`}>
          <div className="max-h-[70vh] overflow-auto">
            <table className="tabela">
              <thead><tr><th>Categoria</th><th>Líder</th><th>Pontos</th><th>Atletas</th></tr></thead>
              <tbody>
                {grupos.map((g) => { const doGrupo = fichas.filter((f) => f.grupo === g); const l = doGrupo[0]!; return (
                  <tr key={g}><td className="font-medium">{g}</td><td><Link to={`/atletas/${l.atleta.id}`} className="text-marinho hover:underline">{l.atleta.nome}</Link><div className="text-xs text-tinta-3">{l.atleta.equipe}</div></td><td className="font-semibold">{l.pontos}</td><td>{doGrupo.length}</td></tr>
                ); })}
              </tbody>
            </table>
          </div>
        </Secao>
      </div>
    </>
  );
}
