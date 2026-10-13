import type { ReactNode } from "react";
import { BrowserRouter, MemoryRouter, Navigate, Route, Routes } from "react-router-dom";
import { Provedor } from "@/data/store";
import { contextos, personas, usePessoa } from "@/data/sessao";
import { Entrar, LayoutLogado, LayoutPublico } from "@/components/Layout";
import { Agenda, Evento, Inscricao } from "@/pages/Publico";
import { Organizador } from "@/pages/Organizador";
import { SumulaDaLuta, SumulaDoCampeonato } from "@/pages/Sumulas";
import { Arena, DadosDoMesario, Mesa, Placar, TelaDoTatame, TV } from "@/pages/Mesa";
import { Atleta, EquipeAtletas, EquipeInscrever, Professor } from "@/pages/Pessoas";
import { Cadastro, Dependentes, Pedidos, Perfil } from "@/pages/Conta";
import { PaginaEquipe, PerfilAtleta, Rankings } from "@/pages/Vitrine";
import { EquipeDesempenho, MeuDesempenho, RankingDaOrganizacao } from "@/pages/Desempenho";
import { Plataforma } from "@/pages/Plataforma";
import { Ajuda, ParaOrganizadores, Precos } from "@/pages/Institucional";
import { DadosOrganizacao, ListaEventos, Membros, NovoEvento } from "@/pages/Gestao";

/** /app leva cada conta à área inicial do papel dela. */
function InicioDaConta() {
  const pessoa = usePessoa();
  return <Navigate to={pessoa.persona ? contextos[personas[pessoa.persona].inicial].rota : "/entrar"} replace />;
}

// na versão de página única (demonstração) não há servidor para resolver rotas
function Roteador({ children }: { children: ReactNode }) {
  // a tela do público abre em outra janela; na página única a rota inicial vem depois do "#"
  return import.meta.env.MODE === "pagina-unica"
    ? <MemoryRouter initialEntries={[window.location.hash.slice(1) || "/"]}>{children}</MemoryRouter>
    : <BrowserRouter>{children}</BrowserRouter>;
}

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
            <Route path="/rankings" element={<Rankings />} />
            <Route path="/organizadores" element={<ParaOrganizadores />} />
            <Route path="/precos" element={<Precos />} />
            <Route path="/ajuda" element={<Ajuda />} />
            <Route path="/atletas/:id" element={<PerfilAtleta />} />
            <Route path="/equipes/:nome" element={<PaginaEquipe />} />
          </Route>
          <Route path="/eventos/:id/painel" element={<TV />} />
          <Route path="/telao/:tatame" element={<TelaDoTatame />} />

          {/* exige conta; cada área exige o papel correspondente */}
          <Route path="/app" element={<LayoutLogado />}>
            <Route index element={<InicioDaConta />} />
            <Route path="atleta" element={<Atleta />} />
            <Route path="inscricao/:id" element={<Inscricao />} />
            <Route path="desempenho" element={<MeuDesempenho />} />
            <Route path="perfil" element={<Perfil />} />
            <Route path="dependentes" element={<Dependentes />} />
            <Route path="pedidos" element={<Pedidos />} />
            <Route path="equipe" element={<Professor />} />
            <Route path="equipe/desempenho" element={<EquipeDesempenho />} />
            <Route path="equipe/atletas" element={<EquipeAtletas />} />
            <Route path="equipe/inscrever" element={<EquipeInscrever />} />
            <Route path="organizacao" element={<ListaEventos />} />
            <Route path="organizacao/novo" element={<NovoEvento />} />
            <Route path="organizacao/ranking" element={<RankingDaOrganizacao />} />
            <Route path="organizacao/membros" element={<Membros />} />
            <Route path="organizacao/dados" element={<DadosOrganizacao />} />
            <Route path="organizacao/eventos/:id" element={<Organizador />} />
            <Route path="organizacao/eventos/:id/sumula" element={<SumulaDoCampeonato />} />
            <Route path="organizacao/eventos/:id/:aba" element={<Organizador />} />
            <Route path="plataforma" element={<Plataforma />} />
            <Route path="plataforma/:aba" element={<Plataforma />} />
            <Route path="mesa" element={<Mesa />} />
            <Route path="mesa/arena" element={<Arena />} />
            <Route path="mesa/dados" element={<DadosDoMesario />} />
            <Route path="mesa/sumula/:catId/:lutaId" element={<SumulaDaLuta />} />
            <Route path="mesa/placar/:tatame/:catId/:lutaId" element={<Placar />} />
          </Route>
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </Roteador>
    </Provedor>
  );
}
