import { useState } from "react";
import { NavLink, Outlet, useLocation } from "react-router-dom";
import { useDados } from "@/data/store";

const areas = [
  { para: "/", nome: "Público", fim: true },
  { para: "/organizador", nome: "Organizador" },
  { para: "/mesa", nome: "Mesa e placar" },
  { para: "/atleta", nome: "Atleta" },
  { para: "/professor", nome: "Professor" },
];

export function Layout() {
  const { despachar } = useDados();
  const { pathname } = useLocation();
  const [confirmando, setConfirmando] = useState(false);
  const telaCheia = pathname.startsWith("/mesa/tv") || pathname.includes("/placar/");
  if (telaCheia) return <Outlet />;
  return (
    <div className="min-h-screen">
      <div className="listra h-1.5" />
      <header className="sticky top-0 z-30 border-b border-linha bg-papel/90 backdrop-blur">
        <div className="mx-auto flex max-w-[1280px] flex-wrap items-center gap-x-6 gap-y-2 px-4 py-3">
          <NavLink to="/" className="flex items-baseline gap-2">
            <span className="font-display text-xl font-black uppercase tracking-tight" style={{ fontStretch: "78%" }}>Arena<span className="text-acao">.</span></span>
            <span className="rotulo hidden sm:inline">competições</span>
          </NavLink>
          <nav className="flex flex-1 gap-1 overflow-x-auto">
            {areas.map((a) => (
              <NavLink key={a.para} to={a.para} end={a.fim}
                className={({ isActive }) => `whitespace-nowrap rounded-md px-3 py-1.5 text-sm font-medium transition ${isActive ? "bg-tinta text-white" : "text-tinta-2 hover:bg-white"}`}>
                {a.nome}
              </NavLink>
            ))}
          </nav>
          <button className={`text-xs underline-offset-2 hover:underline ${confirmando ? "font-semibold text-acao" : "text-tinta-3"}`}
            onBlur={() => setConfirmando(false)}
            onClick={() => { if (confirmando) { despachar({ tipo: "reiniciar" }); setConfirmando(false); } else setConfirmando(true); }}>
            {confirmando ? "Clique de novo para apagar suas alterações" : "Reiniciar dados"}
          </button>
        </div>
        <div className="border-t border-linha bg-aviso-claro/70">
          <div className="mx-auto max-w-[1280px] px-4 py-1 text-[11px] text-aviso">
            Protótipo navegável · nome provisório · atletas, equipes e eventos fictícios · sem login, banco ou pagamento real · tabela de pesos e tempos ilustrativa
          </div>
        </div>
      </header>
      <main className="entrada mx-auto max-w-[1280px] px-4 py-8" key={pathname.split("/").slice(0, 3).join("/")}>
        <Outlet />
      </main>
    </div>
  );
}
