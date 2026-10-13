import { Link } from "react-router-dom";

/** Páginas institucionais: falam com quem organiza competições, não com o atleta. */

const Chamada = () => (
  <div className="mt-12 flex flex-wrap items-center justify-between gap-4 rounded-lg bg-marinho px-6 py-8 text-white sm:px-10">
    <div><h2 className="text-2xl font-semibold">Quer rodar o seu próximo evento aqui?</h2><p className="mt-1 text-white/80">Crie a conta da sua organização e monte o primeiro evento em rascunho, sem compromisso.</p></div>
    <div className="flex flex-wrap gap-2"><Link to="/cadastro" className="rounded-md bg-ouro px-4 py-2.5 text-sm font-medium text-tinta">Criar conta de organizador</Link><Link to="/ajuda" className="rounded-md border border-white/40 px-4 py-2.5 text-sm font-medium">Falar com a gente</Link></div>
  </div>
);

const etapas = [
  ["Antes", "Inscrição e pagamento", "Página do evento, inscrição com categoria validada pela idade, Pix confirmado sozinho, lotes, cupons e inscrição em lote pelo professor."],
  ["Preparação", "Categorias e chaves", "Categorias montadas a partir dos inscritos, aviso de atleta sozinho, sorteio que separa atletas da mesma equipe e publicação com um clique."],
  ["No dia", "Tatames, mesa e placar", "Programação por tatame, check-in e pesagem, fila de lutas, placar operado pelo mesário e painel do ginásio com as próximas lutas."],
  ["Depois", "Resultados e histórico", "Pódios, quadro de medalhas por equipe e histórico de cada atleta, publicados assim que a categoria termina."],
];

const publicos = [
  ["Federações e ligas", "Vários eventos por ano, equipes filiadas e equipe de trabalho com papéis diferentes em cada evento."],
  ["Academias e equipes", "Torneios internos e festivais, com inscrição simples e chaves prontas em minutos."],
  ["Projetos sociais", "Eventos gratuitos ou com isenção, sem planilha e sem depender de voluntário que entenda de chave."],
];

export function ParaOrganizadores() {
  return (
    <>
      <div className="relative overflow-hidden rounded-lg bg-gradient-to-br from-[#1A447D] to-[#0F2B52] px-6 py-12 text-white sm:px-10 sm:py-16">
        <div className="absolute -right-16 -top-24 h-[28rem] w-[28rem] rounded-full border-[40px] border-white/10" />
        <div className="relative max-w-2xl">
          <span className="rounded bg-ouro px-2 py-1 text-xs font-medium text-tinta">Para quem organiza</span>
          <h1 className="mt-4 text-3xl font-semibold leading-tight sm:text-5xl">Da inscrição ao pódio, o evento inteiro em um lugar só.</h1>
          <p className="mt-4 text-lg text-white/80">Uma plataforma para competições de esportes de combate, começando pelo Jiu-Jitsu: inscrições, chaves, programação, mesa, placar e resultados.</p>
          <div className="mt-7 flex flex-wrap gap-2"><Link to="/cadastro" className="rounded-md bg-white px-4 py-2.5 text-sm font-medium text-marinho">Criar conta de organizador</Link><Link to="/eventos/copa-horizonte-2026" className="rounded-md border border-white/40 px-4 py-2.5 text-sm font-medium">Ver um evento de exemplo</Link></div>
        </div>
      </div>

      <h2 className="mb-5 mt-12 text-2xl font-semibold">O que a plataforma faz em cada momento</h2>
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {etapas.map(([quando, titulo, texto]) => (
          <div key={titulo} className="cartao p-5"><div className="rotulo">{quando}</div><h3 className="mt-1 text-lg font-semibold">{titulo}</h3><p className="mt-2 text-sm text-tinta-2">{texto}</p></div>
        ))}
      </div>

      <h2 className="mb-5 mt-12 text-2xl font-semibold">Para quem é</h2>
      <div className="grid gap-4 md:grid-cols-3">
        {publicos.map(([titulo, texto]) => <div key={titulo} className="cartao p-5"><h3 className="text-lg font-semibold">{titulo}</h3><p className="mt-2 text-sm text-tinta-2">{texto}</p></div>)}
      </div>

      <h2 className="mb-5 mt-12 text-2xl font-semibold">Uma conta para cada pessoa, um papel para cada função</h2>
      <div className="cartao grid gap-6 p-6 md:grid-cols-4">
        {[["Atleta e responsável", "Inscreve a si mesmo ou um dependente e acompanha chave e horário."], ["Professor", "Confirma quem é da equipe, inscreve em lote e segue a agenda dos atletas."], ["Organizador", "Administra inscritos, categorias, chaves, programação e financeiro."], ["Mesário e árbitro", "Opera só o tatame em que foi escalado, sem ver inscrições nem financeiro."]].map(([t, x]) => (
          <div key={t}><h3 className="font-semibold">{t}</h3><p className="mt-1 text-sm text-tinta-2">{x}</p></div>
        ))}
      </div>
      <Chamada />
    </>
  );
}

export function Precos() {
  return (
    <>
      <h1 className="text-3xl font-semibold">Preços</h1>
      <p className="mt-2 max-w-2xl text-tinta-2">O modelo é simples: você paga por atleta inscrito, só quando o evento acontece. Não há mensalidade nem taxa de implantação.</p>
      <div className="mt-4 max-w-2xl rounded-md bg-aviso-claro px-3 py-2 text-sm text-aviso">Os valores ainda não foram definidos. Esta página mostra a estrutura; os números entram quando o preço for decidido.</div>
      <div className="mt-8 grid gap-4 md:grid-cols-3">
        {[["Evento pago", "Valor por inscrição", ["Todas as funções da plataforma", "Pix com confirmação automática", "Repasse direto para a conta da organização"]],
          ["Evento gratuito ou social", "Condição especial", ["Mesmas funções do evento pago", "Para projetos sociais e festivais sem cobrança", "Sujeito a análise"]],
          ["Federações e circuitos", "Sob consulta", ["Vários eventos no ano", "Filiação de equipes e ranking", "Acompanhamento na implantação"]]].map(([nome, preco, itens]) => (
          <div key={nome as string} className="cartao flex flex-col p-6">
            <h2 className="text-lg font-semibold">{nome as string}</h2>
            <div className="mt-2 text-2xl font-semibold text-marinho">{preco as string}</div>
            <ul className="mt-4 flex-1 space-y-2 text-sm text-tinta-2">{(itens as string[]).map((i) => <li key={i} className="flex gap-2"><span className="text-tatame">✓</span>{i}</li>)}</ul>
            <Link to="/ajuda" className="botao-contorno mt-5 w-full">Falar com a gente</Link>
          </div>
        ))}
      </div>
      <Chamada />
    </>
  );
}

const perguntas: [string, string][] = [
  ["Sou atleta. Preciso pagar para usar?", "Não. O atleta paga apenas a inscrição definida pelo organizador do evento."],
  ["Como inscrevo meu filho?", "Crie a sua conta, cadastre o menor em Dependentes e faça a inscrição por ele. O menor não precisa de login."],
  ["Sou professor. Consigo inscrever a equipe toda?", "Sim. A inscrição em lote gera um pedido único, e cada atleta continua dono da própria inscrição."],
  ["Quero organizar um evento. Por onde começo?", "Crie a conta da organização e monte o evento em rascunho. Ele só aparece no site quando você publicar."],
  ["A plataforma atende outras modalidades?", "Ela começa pelo Jiu-Jitsu, Gi e No-Gi. Outras modalidades de combate entram depois."],
];

export function Ajuda() {
  return (
    <div className="grid gap-6 lg:grid-cols-[1.5fr_1fr]">
      <div>
        <h1 className="mb-5 text-3xl font-semibold">Ajuda</h1>
        <div className="cartao divide-y divide-linha/70">
          {perguntas.map(([p, r]) => (
            <details key={p} className="px-5 py-4"><summary className="cursor-pointer font-medium">{p}</summary><p className="mt-2 text-sm text-tinta-2">{r}</p></details>
          ))}
        </div>
      </div>
      <div className="cartao h-fit space-y-4 p-6">
        <h2 className="text-lg font-semibold">Fale com a gente</h2>
        <label className="block"><span className="rotulo">Seu nome</span><input id="contato-nome" className="campo mt-1" /></label>
        <label className="block"><span className="rotulo">E-mail</span><input id="contato-email" type="email" className="campo mt-1" /></label>
        <label className="block"><span className="rotulo">Você é</span><select id="contato-perfil" className="campo mt-1"><option>Organizador de eventos</option><option>Professor ou responsável por equipe</option><option>Atleta ou responsável</option></select></label>
        <label className="block"><span className="rotulo">Mensagem</span><textarea id="contato-msg" rows={4} className="campo mt-1" /></label>
        <button className="botao-primario w-full" disabled>Enviar</button>
        <p className="text-xs text-tinta-3">No protótipo, o formulário não envia nada.</p>
      </div>
    </div>
  );
}
