import { useEffect, useState } from "react";

export interface Marcador { pontos: number; vantagens: number; punicoes: number; }

/** O que a mesa manda para a tela do tatame virada para o público. */
export interface LutaNaTela {
  lados: { nome: string; equipe: string }[];
  m: [Marcador, Marcador];
  resta: number;
  rodando: boolean;
  iniciada: boolean;
  rotulo: string;
  categoria: string;
  fase: string;
  combatividade: { lado: 0 | 1; resta: number } | null;
  vencedor: { lado: 0 | 1; metodo: string } | null;
}

export interface EstadoDaTela {
  /** luta aberta no placar do mesário; nula entre uma luta e outra */
  luta: LutaNaTela | null;
  /** o mesário liga para mostrar as próximas lutas do tatame entre uma luta e outra */
  proximas: boolean;
  dia: number;
}

const inicial: EstadoDaTela = { luta: null, proximas: true, dia: 1 };
const chave = (tatame: number) => `arena-tela-tatame-${tatame}`;
const AVISO = "arena-tela";

export function lerTela(tatame: number): EstadoDaTela {
  try { const b = localStorage.getItem(chave(tatame)); return b ? { ...inicial, ...JSON.parse(b) } : inicial; } catch { return inicial; }
}

/** Publica uma mudança para a tela do tatame. Outras janelas recebem pelo evento de armazenamento do navegador. */
export function publicarTela(tatame: number, parcial: Partial<EstadoDaTela>) {
  const novo = { ...lerTela(tatame), ...parcial };
  try { localStorage.setItem(chave(tatame), JSON.stringify(novo)); } catch { /* sem armazenamento */ }
  window.dispatchEvent(new CustomEvent(AVISO, { detail: tatame }));
}

/** Estado atual da tela de um tatame, atualizado quando a mesa publica, nesta janela ou em outra. */
export function useTela(tatame: number): EstadoDaTela {
  const [estado, setEstado] = useState(() => lerTela(tatame));
  useEffect(() => {
    const ler = () => setEstado(lerTela(tatame));
    const deFora = (e: StorageEvent) => { if (e.key === chave(tatame)) ler(); };
    ler();
    window.addEventListener("storage", deFora);
    window.addEventListener(AVISO, ler);
    return () => { window.removeEventListener("storage", deFora); window.removeEventListener(AVISO, ler); };
  }, [tatame]);
  return estado;
}

/** Endereço da tela do público. Na versão de página única a rota vai depois do "#". */
export function enderecoDaTela(tatame: number): string {
  return import.meta.env.MODE === "pagina-unica" ? `${window.location.href.split("#")[0]}#/telao/${tatame}` : `/telao/${tatame}`;
}
