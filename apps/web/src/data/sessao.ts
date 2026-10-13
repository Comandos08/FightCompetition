import { useMemo } from "react";
import { inscricoesOriginais, useDados, type Persona } from "./store";

/** Contextos da área logada. Uma conta enxerga só os contextos em que tem papel. */
export type ContextoId = "atleta" | "equipe" | "organizacao" | "mesa" | "plataforma";

export const EQUIPE_DO_PROFESSOR = "Raiz Jiu-Jitsu";
/** O mesário de demonstração foi escalado só para este tatame. */
export const TATAME_DO_MESARIO = 1;
/** Rotas e abas da organização que o diretor técnico não enxerga. */
export const RESTRITO_AO_DONO = ["/app/organizacao/novo", "/app/organizacao/ranking", "/app/organizacao/membros", "/app/organizacao/dados"];
export const ABAS_RESTRITAS = ["financeiro", "equipe", "config"];

export const contextos: Record<ContextoId, { rota: string; nome: string; papel: string }> = {
  atleta: { rota: "/app/atleta", nome: "Minha área", papel: "Inscrições e lutas" },
  equipe: { rota: "/app/equipe", nome: EQUIPE_DO_PROFESSOR, papel: "Professor" },
  organizacao: { rota: "/app/organizacao", nome: "Liga Horizonte de Jiu-Jitsu", papel: "Organizador" },
  mesa: { rota: "/app/mesa", nome: "Copa Horizonte 2026", papel: "Mesa do tatame" },
  plataforma: { rota: "/app/plataforma", nome: "Administração da plataforma", papel: "Administrador" },
};

export const personas: Record<Persona, { rotulo: string; descricao: string; nome?: string; contextos: ContextoId[]; inicial: ContextoId }> = {
  atleta: { rotulo: "Atleta", descricao: "Vê as próprias inscrições, a chave e o horário previsto da próxima luta.", contextos: ["atleta"], inicial: "atleta" },
  professor: { rotulo: "Professor", descricao: "Além da área pessoal, acompanha a agenda e as pendências da equipe.", nome: "Marcos Teles Brandão", contextos: ["atleta", "equipe"], inicial: "equipe" },
  organizador: { rotulo: "Organizador", descricao: "Administra o evento: inscritos, categorias, chaves, programação e pesagem.", nome: "Renata Coutinho Lins", contextos: ["atleta", "organizacao", "mesa"], inicial: "organizacao" },
  diretor: { rotulo: "Diretor técnico", descricao: "Cuida da parte esportiva de um evento: inscritos, categorias, chaves, programação, pesagem e resultados. Não vê financeiro, equipe de trabalho nem configurações.", nome: "Paulo Guedes Neves", contextos: ["atleta", "organizacao", "mesa"], inicial: "organizacao" },
  mesario: { rotulo: "Mesário", descricao: "Opera a fila e o placar do Tatame 1, em que foi escalado. Não vê os outros tatames, inscrições nem financeiro.", nome: "Diego Antunes Paiva", contextos: ["atleta", "mesa"], inicial: "mesa" },
  admin: { rotulo: "Administrador da plataforma", descricao: "Equipe interna do SaaS: acompanha organizações, eventos, usuários, parceiros e auditoria.", nome: "Equipe Arena", contextos: ["plataforma"], inicial: "plataforma" },
};

/** Quem está logado: nome exibido e, para o atleta, o cadastro esportivo ligado à conta. */
export function usePessoa(): { persona: Persona | null; nome: string; atletaId?: string; contextos: ContextoId[] } {
  const d = useDados();
  const persona = d.estado.sessao;
  // atleta de demonstração: o primeiro adulto com duas inscrições pagas
  // escolhido pela situação original do cadastro: a conta não muda de pessoa quando ela paga ou cancela algo
  const atletaDemo = useMemo(() => {
    const porAtleta = new Map<string, number>();
    for (const i of inscricoesOriginais) if (i.pagamento === "pago") porAtleta.set(i.atletaId, (porAtleta.get(i.atletaId) ?? 0) + 1);
    return [...d.atletas.values()].find((a) => !a.menor && porAtleta.get(a.id) === 2 && !a.id.startsWith("AT9"));
  }, [d.atletas]);
  if (!persona) return { persona: null, nome: "", contextos: [] };
  const def = personas[persona];
  return persona === "atleta"
    ? { persona, nome: atletaDemo?.nome ?? "Atleta", atletaId: atletaDemo?.id, contextos: def.contextos }
    : { persona, nome: def.nome!, contextos: def.contextos };
}
