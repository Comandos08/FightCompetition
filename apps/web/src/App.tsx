import { BrowserRouter, MemoryRouter, Navigate, Route, Routes } from "react-router-dom";
import { Provedor } from "@/data/store";
import { Entrar, LayoutLogado, LayoutPublico } from "@/components/Layout";
import { Agenda, Evento, Inscricao } from "@/pages/Publico";
import { Organizador } from "@/pages/Organizador";
import { Mesa, Placar, TV } from "@/pages/Mesa";
import { Atleta, Professor } from "@/pages/Pessoas";

// na versão de página única (demonstração) não há servidor para resolver rotas
const Roteador = import.meta.env.MODE === "pagina-unica" ? MemoryRouter : BrowserRouter;

export default function App() {
  return (
    <Provedor>
      <Roteador>
        <Routes>
          {/* aberto a qualquer visitante */}
          <Route element={<LayoutPublico />}>
            <Route path="/" element={<Agenda />} />
            <Route path="/eventos/:id" element={<Evento />} />
            <Route path="/entrar" element={<Entrar />} />
          </Route>
          <Route path="/tv" element={<TV />} />

          {/* exige conta; cada área exige o papel correspondente */}
          <Route path="/app" element={<LayoutLogado />}>
            <Route index element={<Navigate to="/app/atleta" replace />} />
            <Route path="atleta" element={<Atleta />} />
            <Route path="inscricao/:id" element={<Inscricao />} />
            <Route path="equipe" element={<Professor />} />
            <Route path="organizacao" element={<Organizador />} />
            <Route path="mesa" element={<Mesa />} />
            <Route path="mesa/placar/:tatame/:catId/:lutaId" element={<Placar />} />
          </Route>
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </Roteador>
    </Provedor>
  );
}
