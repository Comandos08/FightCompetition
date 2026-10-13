import { BrowserRouter, Route, Routes } from "react-router-dom";
import { Provedor } from "@/data/store";
import { Layout } from "@/components/Layout";
import { Agenda, Evento, Inscricao } from "@/pages/Publico";
import { Organizador } from "@/pages/Organizador";
import { Mesa, Placar, TV } from "@/pages/Mesa";
import { Atleta, Professor } from "@/pages/Pessoas";

export default function App() {
  return (
    <Provedor>
      <BrowserRouter>
        <Routes>
          <Route element={<Layout />}>
            <Route path="/" element={<Agenda />} />
            <Route path="/eventos/:id" element={<Evento />} />
            <Route path="/eventos/:id/inscricao" element={<Inscricao />} />
            <Route path="/organizador" element={<Organizador />} />
            <Route path="/mesa" element={<Mesa />} />
            <Route path="/mesa/tv" element={<TV />} />
            <Route path="/mesa/placar/:tatame/:catId/:lutaId" element={<Placar />} />
            <Route path="/atleta" element={<Atleta />} />
            <Route path="/professor" element={<Professor />} />
            <Route path="*" element={<Agenda />} />
          </Route>
        </Routes>
      </BrowserRouter>
    </Provedor>
  );
}
