import { BrowserRouter, MemoryRouter, Navigate, Route, Routes } from "react-router-dom";
import { Provedor } from "@/data/store";
import { Entrar, LayoutLogado, LayoutPublico } from "@/components/Layout";
import { Agenda, Evento, Inscricao } from "@/pages/Publico";
import { Organizador } from "@/pages/Organizador";
import { Arena, Mesa, Placar, TV } from "@/pages/Mesa";
import { Atleta, EquipeAtletas, EquipeInscrever, Professor } from "@/pages/Pessoas";
import { Cadastro, Dependentes, PaginaEquipe, Pedidos, Perfil, PerfilAtleta } from "@/pages/Conta";
import { Plataforma } from "@/pages/Plataforma";
import { Ajuda, ParaOrganizadores, Precos } from "@/pages/Institucional";
import { DadosOrganizacao, ListaEventos, Membros, NovoEvento } from "@/pages/Gestao";

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
            <Route path="/cadastro" element={<Cadastro />} />
            <Route path="/organizadores" element={<ParaOrganizadores />} />
            <Route path="/precos" element={<Precos />} />
            <Route path="/ajuda" element={<Ajuda />} />
            <Route path="/atletas/:id" element={<PerfilAtleta />} />
            <Route path="/equipes/:nome" element={<PaginaEquipe />} />
          </Route>
          <Route path="/eventos/:id/painel" element={<TV />} />

          {/* exige conta; cada área exige o papel correspondente */}
          <Route path="/app" element={<LayoutLogado />}>
            <Route index element={<Navigate to="/app/atleta" replace />} />
            <Route path="atleta" element={<Atleta />} />
            <Route path="inscricao/:id" element={<Inscricao />} />
            <Route path="perfil" element={<Perfil />} />
            <Route path="dependentes" element={<Dependentes />} />
            <Route path="pedidos" element={<Pedidos />} />
            <Route path="equipe" element={<Professor />} />
            <Route path="equipe/atletas" element={<EquipeAtletas />} />
            <Route path="equipe/inscrever" element={<EquipeInscrever />} />
            <Route path="organizacao" element={<ListaEventos />} />
            <Route path="organizacao/novo" element={<NovoEvento />} />
            <Route path="organizacao/membros" element={<Membros />} />
            <Route path="organizacao/dados" element={<DadosOrganizacao />} />
            <Route path="organizacao/eventos/:id" element={<Organizador />} />
            <Route path="organizacao/eventos/:id/:aba" element={<Organizador />} />
            <Route path="plataforma" element={<Plataforma />} />
            <Route path="plataforma/:aba" element={<Plataforma />} />
            <Route path="mesa" element={<Mesa />} />
            <Route path="mesa/arena" element={<Arena />} />
            <Route path="mesa/placar/:tatame/:catId/:lutaId" element={<Placar />} />
          </Route>
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </Roteador>
    </Provedor>
  );
}
