import { useState, type ReactNode } from "react";
import { Link, NavLink, Navigate, Outlet, useLocation, useNavigate } from "react-router-dom";
import { useDados, type Persona } from "@/data/store";
import { contextos, personas, usePessoa, type ContextoId } from "@/data/sessao";

function Marca() {
  return (
    <Link to="/" className="flex items-center gap-2 text-white">
      <span className="grid h-8 w-8 place-items-center rounded-md bg-ouro text-base font-bold text-marinho">A</span>
      <span className="text-xl font-semibold">Arena</span>
    </Link>
  );
}

function AvisoPrototipo() {
  const { despachar } = useDados();
  const [confirmando, setConfirmando] = useState(false);
  return (
    <div className="border-b border-linha bg-ouro-claro">
      <div className="mx-auto flex max-w-[1240px] flex-wrap items-center justify-between gap-x-4 px-5 py-1.5 text-xs text-aviso">
        <span>Protótipo · nome provisório · dados fictícios · login e pagamento simulados · tabela de pesos e tempos ilustrativa</span>
        <button className={`underline-offset-2 hover:underline ${confirmando ? "font-semibold text-perigo" : ""}`} onBlur={() => setConfirmando(false)}
          onClick={() => { if (confirmando) { despachar({ tipo: "reiniciar" }); setConfirmando(false); } else setConfirmando(true); }}>
          {confirmando ? "Clique de novo para apagar suas alterações" : "Reiniciar dados"}
        </button>
      </div>
    </div>
  );
}

const PESSOA = "M20 21a8 8 0 0 0-16 0M12 12a4 4 0 1 0 0-8 4 4 0 0 0 0 8z";
function IconePessoa() {
  return <svg viewBox="0 0 24 24" className="h-4 w-4" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round"><path d={PESSOA} /></svg>;
}

/** Cabeçalho em dois níveis: marca e conta em cima, navegação da área embaixo. */
function Cabecalho({ direita, nav }: { direita: ReactNode; nav: ReactNode }) {
  return (
    <header className="sticky top-0 z-30">
      <div className="bg-marinho">
        <div className="mx-auto flex max-w-[1240px] items-center justify-between gap-4 px-5 py-3.5"><Marca /><div className="flex items-center gap-5 text-sm text-white">{direita}</div></div>
      </div>
      <div className="bg-marinho-escuro">
        <nav className="mx-auto flex max-w-[1240px] items-center gap-1 overflow-x-auto px-3 text-sm text-white">{nav}</nav>
      </div>
    </header>
  );
}

const itemNav = ({ isActive }: { isActive: boolean }) =>
  `whitespace-nowrap border-b-2 px-3 py-2.5 transition ${isActive ? "border-ouro font-medium text-white" : "border-transparent text-white/80 hover:text-white"}`;

function Rodape() {
  return (
    <footer className="mt-16 bg-marinho text-white">
      <div className="mx-auto flex max-w-[1240px] flex-wrap items-center justify-between gap-4 px-5 py-8 text-sm">
        <Marca />
        <span className="text-white/70">Protótipo de demonstração. Nenhum dado desta página é real.</span>
      </div>
    </footer>
  );
}

/** Site aberto: qualquer visitante vê agenda, evento, chaves publicadas e resultados. */
export function LayoutPublico() {
  const pessoa = usePessoa();
  const { pathname } = useLocation();
  return (
    <div className="flex min-h-screen flex-col">
      <Cabecalho
        direita={pessoa.persona
          ? <Link to={contextos[personas[pessoa.persona].inicial].rota} className="flex items-center gap-2 hover:underline"><IconePessoa />{pessoa.nome.split(" ")[0]} · minha área</Link>
          : <Link to="/entrar" className="flex items-center gap-2 hover:underline"><IconePessoa />Entrar</Link>}
        nav={<>
          <NavLink to="/" className={({ isActive }) => itemNav({ isActive: isActive || pathname.startsWith("/eventos") })}>Eventos</NavLink>
          <span className="flex-1" />
          <NavLink to="/tv" className={itemNav}>Painel do ginásio</NavLink>
        </>}
      />
      <AvisoPrototipo />
      <main className="entrada mx-auto w-full max-w-[1240px] flex-1 px-5 py-8" key={pathname}><Outlet /></main>
      <Rodape />
    </div>
  );
}

/** Área logada: a navegação mostra só os contextos em que a conta tem papel. */
export function LayoutLogado() {
  const { despachar } = useDados();
  const pessoa = usePessoa();
  const loc = useLocation();
  const nav = useNavigate();
  if (!pessoa.persona) return <Navigate to={`/entrar?de=${encodeURIComponent(loc.pathname)}`} replace />;
  const atual = (Object.keys(contextos) as ContextoId[]).find((c) => loc.pathname.startsWith(contextos[c].rota));
  const semAcesso = atual && !pessoa.contextos.includes(atual);
  // o placar ocupa a tela inteira, mas só para quem tem o papel de mesa
  if (loc.pathname.includes("/placar/") && !semAcesso) return <Outlet />;
  return (
    <div className="flex min-h-screen flex-col">
      <Cabecalho
        direita={<>
          <span className="hidden items-center gap-2 sm:flex"><IconePessoa />{pessoa.nome}</span>
          <button className="text-white/80 hover:text-white hover:underline" onClick={() => { despachar({ tipo: "sair" }); nav("/"); }}>Sair</button>
        </>}
        nav={<>
          {pessoa.contextos.map((c) => (
            <NavLink key={c} to={contextos[c].rota} className={itemNav}>
              {contextos[c].nome}{c !== "atleta" && <span className="ml-1.5 text-xs text-white/60">{contextos[c].papel.toLowerCase()}</span>}
            </NavLink>
          ))}
          <span className="flex-1" />
          <NavLink to="/" className={itemNav}>Site público</NavLink>
        </>}
      />
      <AvisoPrototipo />
      <main className="entrada mx-auto w-full max-w-[1240px] flex-1 px-5 py-8" key={loc.pathname.split("/").slice(0, 3).join("/")}>
        {semAcesso
          ? <SemAcesso><b>{contextos[atual].nome}</b> exige o papel de {contextos[atual].papel.toLowerCase()}. A conta de {personas[pessoa.persona].rotulo.toLowerCase()} não tem esse papel.</SemAcesso>
          : <Outlet />}
      </main>
      <Rodape />
    </div>
  );
}

function SemAcesso({ children }: { children: ReactNode }) {
  return (
    <div className="cartao max-w-xl p-6">
      <div className="rotulo mb-1">Acesso negado</div>
      <h1 className="mb-2 text-2xl font-semibold">Você não tem acesso a esta área</h1>
      <p className="text-tinta-2">{children}</p>
      <Link to="/entrar" className="botao-contorno mt-4">Entrar com outra conta</Link>
    </div>
  );
}

export function Entrar() {
  const { despachar } = useDados();
  const nav = useNavigate();
  const de = new URLSearchParams(useLocation().search).get("de");
  const entrar = (persona: Persona) => {
    despachar({ tipo: "entrar", persona });
    const destino = contextos[personas[persona].inicial].rota;
    // volta para onde a pessoa queria ir, se a conta escolhida tiver acesso
    nav(de && (de.startsWith("/app/inscricao") || de.startsWith(destino) || de.startsWith("/app/atleta")) ? de : destino);
  };
  return (
    <div className="mx-auto max-w-3xl">
      <div className="rotulo mb-1">Entrar</div>
      <h1 className="text-3xl font-semibold">Uma conta, vários papéis</h1>
      <p className="mt-2 max-w-2xl text-tinta-2">
        No produto, você entra com e-mail e senha e a plataforma mostra só as áreas em que a sua conta tem papel. Aqui o login é simulado: escolha uma conta de demonstração para ver o que cada pessoa enxerga.
      </p>
      {de && <div className="mt-4 rounded-md bg-aviso-claro px-3 py-2 text-sm text-aviso">Para continuar, entre com uma conta.</div>}
      <div className="mt-6 grid gap-3 sm:grid-cols-2">
        {(Object.keys(personas) as Persona[]).map((p) => (
          <button key={p} onClick={() => entrar(p)} className="cartao group p-5 text-left transition hover:-translate-y-0.5 hover:border-marinho">
            <div className="flex items-center justify-between"><h2 className="text-2xl font-semibold">{personas[p].rotulo}</h2><span className="text-sm font-medium text-marinho opacity-0 transition group-hover:opacity-100">Entrar ›</span></div>
            <p className="mt-1 text-sm text-tinta-2">{personas[p].descricao}</p>
            <div className="mt-3 flex flex-wrap gap-1.5">
              {personas[p].contextos.map((c) => <span key={c} className="rounded-full border border-linha bg-papel px-2 py-0.5 text-[11px]">{contextos[c].papel === "Inscrições e lutas" ? "Área pessoal" : contextos[c].papel}</span>)}
            </div>
          </button>
        ))}
      </div>
    </div>
  );
}
