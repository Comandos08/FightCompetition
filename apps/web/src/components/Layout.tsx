import { useState, type ReactNode } from "react";
import { Link, NavLink, Navigate, Outlet, useLocation, useNavigate } from "react-router-dom";
import { useDados, type Persona } from "@/data/store";
import { contextos, personas, usePessoa, type ContextoId } from "@/data/sessao";

function Marca() {
  return (
    <Link to="/" className="flex items-baseline gap-2">
      <span className="font-display text-xl font-black uppercase tracking-tight" style={{ fontStretch: "78%" }}>Arena<span className="text-acao">.</span></span>
      <span className="rotulo hidden sm:inline">competições</span>
    </Link>
  );
}

function AvisoPrototipo() {
  const { despachar } = useDados();
  const [confirmando, setConfirmando] = useState(false);
  return (
    <div className="border-b border-linha bg-aviso-claro/70">
      <div className="mx-auto flex max-w-[1280px] flex-wrap items-center justify-between gap-x-4 px-4 py-1 text-[11px] text-aviso">
        <span>Protótipo · nome provisório · dados fictícios · login e pagamento simulados · tabela de pesos e tempos ilustrativa</span>
        <button className={`underline-offset-2 hover:underline ${confirmando ? "font-semibold text-acao" : ""}`} onBlur={() => setConfirmando(false)}
          onClick={() => { if (confirmando) { despachar({ tipo: "reiniciar" }); setConfirmando(false); } else setConfirmando(true); }}>
          {confirmando ? "Clique de novo para apagar suas alterações" : "Reiniciar dados"}
        </button>
      </div>
    </div>
  );
}

/** Site aberto: qualquer visitante vê agenda, evento, chaves publicadas e resultados. */
export function LayoutPublico() {
  const pessoa = usePessoa();
  const { pathname } = useLocation();
  return (
    <div className="min-h-screen">
      <div className="listra h-1.5" />
      <header className="sticky top-0 z-30 border-b border-linha bg-papel/90 backdrop-blur">
        <div className="mx-auto flex max-w-[1280px] items-center gap-6 px-4 py-3">
          <Marca />
          <nav className="flex flex-1 gap-1">
            <NavLink to="/" end className={({ isActive }) => `rounded-md px-3 py-1.5 text-sm font-medium ${isActive || pathname.startsWith("/eventos") ? "text-tinta" : "text-tinta-2 hover:text-tinta"}`}>Eventos</NavLink>
          </nav>
          {pessoa.persona
            ? <Link to={contextos[pessoa.contextos[pessoa.contextos.length - 1]!].rota} className="botao-primario">Minha área · {pessoa.nome.split(" ")[0]}</Link>
            : <Link to="/entrar" className="botao-primario">Entrar</Link>}
        </div>
      </header>
      <AvisoPrototipo />
      <main className="entrada mx-auto max-w-[1280px] px-4 py-8" key={pathname}><Outlet /></main>
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
    <div className="min-h-screen lg:grid lg:grid-cols-[260px_1fr]">
      <aside className="border-b border-linha bg-tinta text-white lg:sticky lg:top-0 lg:h-screen lg:border-b-0">
        <div className="flex items-center justify-between px-4 py-3 lg:block lg:px-5 lg:py-5">
          <Link to="/" className="font-display text-xl font-black uppercase" style={{ fontStretch: "78%" }}>Arena<span className="text-acao">.</span></Link>
          <div className="text-right lg:mt-5 lg:text-left">
            <div className="text-sm font-semibold">{pessoa.nome}</div>
            <div className="font-mono text-[10px] uppercase tracking-widest opacity-50">conta de {personas[pessoa.persona].rotulo.toLowerCase()}</div>
          </div>
        </div>
        <nav className="flex gap-1 overflow-x-auto px-3 pb-3 lg:flex-col lg:px-3">
          <div className="hidden px-2 pb-1 pt-2 font-mono text-[10px] uppercase tracking-widest opacity-40 lg:block">Onde você atua</div>
          {pessoa.contextos.map((c) => (
            <NavLink key={c} to={contextos[c].rota} className={({ isActive }) => `whitespace-nowrap rounded-md px-3 py-2 text-sm transition ${isActive ? "bg-white text-tinta" : "hover:bg-white/10"}`}>
              <div className="font-medium">{contextos[c].nome}</div>
              <div className="text-[11px] opacity-60">{contextos[c].papel}</div>
            </NavLink>
          ))}
        </nav>
        <div className="hidden px-5 pb-5 lg:absolute lg:bottom-0 lg:block">
          <Link to="/" className="block py-1 text-sm opacity-70 hover:opacity-100">← Site público</Link>
          <button className="py-1 text-sm opacity-70 hover:opacity-100" onClick={() => { despachar({ tipo: "sair" }); nav("/"); }}>Sair da conta</button>
        </div>
      </aside>
      <div className="min-w-0">
        <AvisoPrototipo />
        <div className="flex justify-end gap-4 px-4 pt-3 text-sm lg:hidden">
          <Link to="/" className="text-tinta-2">Site público</Link>
          <button className="text-tinta-2" onClick={() => { despachar({ tipo: "sair" }); nav("/"); }}>Sair</button>
        </div>
        <main className="entrada mx-auto max-w-[1180px] px-4 py-8 lg:px-8" key={loc.pathname.split("/").slice(0, 3).join("/")}>
          {semAcesso
            ? <SemAcesso><b>{contextos[atual].nome}</b> exige o papel de {contextos[atual].papel.toLowerCase()}. A conta de {personas[pessoa.persona].rotulo.toLowerCase()} não tem esse papel.</SemAcesso>
            : <Outlet />}
        </main>
      </div>
    </div>
  );
}

function SemAcesso({ children }: { children: ReactNode }) {
  return (
    <div className="cartao max-w-xl p-6">
      <div className="rotulo mb-1">Acesso negado</div>
      <h1 className="mb-2 text-2xl font-extrabold">Você não tem acesso a esta área</h1>
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
    const destino = contextos[personas[persona].contextos[personas[persona].contextos.length - 1]!].rota;
    // volta para onde a pessoa queria ir, se a conta escolhida tiver acesso
    nav(de && (de.startsWith("/app/inscricao") || de.startsWith(destino) || de.startsWith("/app/atleta")) ? de : destino);
  };
  return (
    <div className="mx-auto max-w-3xl">
      <div className="rotulo mb-1">Entrar</div>
      <h1 className="text-4xl font-extrabold">Uma conta, vários papéis</h1>
      <p className="mt-2 max-w-2xl text-tinta-2">
        No produto, você entra com e-mail e senha e a plataforma mostra só as áreas em que a sua conta tem papel. Aqui o login é simulado: escolha uma conta de demonstração para ver o que cada pessoa enxerga.
      </p>
      {de && <div className="mt-4 rounded-md bg-aviso-claro px-3 py-2 text-sm text-aviso">Para continuar, entre com uma conta.</div>}
      <div className="mt-6 grid gap-3 sm:grid-cols-2">
        {(Object.keys(personas) as Persona[]).map((p) => (
          <button key={p} onClick={() => entrar(p)} className="cartao group p-5 text-left transition hover:-translate-y-0.5 hover:border-tinta">
            <div className="flex items-center justify-between"><h2 className="text-2xl font-extrabold">{personas[p].rotulo}</h2><span className="text-acao opacity-0 transition group-hover:opacity-100">Entrar →</span></div>
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
