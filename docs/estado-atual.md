# Arena · estado atual e passagem de bastão

Documento de continuidade: o que é o produto, o que foi decidido, o que está pronto, como se trabalha neste repositório e o que falta. Escrito em 13/10/2026, ao fim da primeira rodada de protótipo. Serve para abrir qualquer conversa nova sem reler o histórico.

## O produto

Arena é a plataforma da SportCombat (fundador: Villar) para organizar competições de esportes de combate, começando pelo Jiu-Jitsu. Benchmark: Smoothcomp. Cobre inscrição, categorias, chaves, programação por tatame, pesagem, mesa com placar e tela do público, súmulas, resultados, quadro de medalhas, rankings por organização e perfil do atleta. O primeiro cliente de validação é a CBJJS; o presidente e outro mestre viram o protótipo em 13/10 e aprovaram sem pedir alteração.

- Nome: Arena (definido). Símbolo e logo em `docs/marca`. A logo veio com o texto em fonte Neoverse Sans, não convertida em curvas; o cabeçalho usa o símbolo oficial com a palavra em Inter até chegar a versão em curvas.
- Protótipo navegável publicado: https://claude.ai/artifact/KGVsEBmKeom3sPwGmFWvoa (página única; contas de demonstração na tela de entrada).
- Repositório: github.com/Comandos08/FightCompetition, branch `main`.

## Decisões que governam o trabalho

Todas em `docs/decisoes.md`, com data e motivo. As que mais pesam:

1. Estressar o protótipo ao máximo e só depois construir no Lovable com Supabase, conectado a este GitHub. O motor de chaves continua como código testado aqui. O fundador avisa quando for a hora.
2. Claude decide e executa dentro do repositório. Ficam com o fundador: gastos, contato com terceiros, dados reais de atletas e qualquer publicação além de demonstração com dados fictícios.
3. Regras esportivas não se escrevem de memória: vêm do Livro de Regras da IBJJF v6.1 (`docs/regras-ibjjf.md`, `packages/engine/src/regras-ibjjf.ts`) e da Tabela de Pesos Oficial (`packages/engine/src/pesos-ibjjf.ts`), ou de decisão registrada.
4. Gi e No-Gi usam as mesmas categorias e limites. A tabela de categorias pode variar por organização: o produto grava e reaproveita modelos (idade, faixa, peso); a IBJJF é o modelo inicial.
5. Regras em aberto ficam no modelo mais simples: atleta sozinho recebe sugestão de fusão, bye por sorteio com semente, remanejamento de luta sem aprovação prévia e com registro.
6. Súmula no modelo da própria plataforma: numerada, com árbitro e mesário, todos os lances com tempo, início e fim, retificação registrada. Relato do mesário entra pendente; a organização aprova ou não; o não aprovado sai em anexo.
7. Mesário vê só os próprios dados e o tatame em que foi escalado. Placar em duas visões: a do mesário e a tela do público (`/telao/:tatame`), sincronizadas.
8. Preço, taxa, provedor de pagamento: definidos depois, não bloqueiam. Dados pessoais: LGPD e GDPR. Avatares padrão: banco gratuito.

## O que está pronto no protótipo

- Público: home com parceiros, agenda, página do evento (inscritos, chaves, programação, resultados, quadro de medalhas, regulamento, mapa), rankings por organização, perfil do atleta, página da equipe, institucional (para organizadores, preços, ajuda), painel do ginásio, tela do público por tatame.
- Atleta e professor: minhas lutas, desempenho, perfil esportivo, dependentes, pedidos, inscrição (com dependentes cadastrados), área da equipe.
- Organizador e diretor técnico: eventos, novo evento, membros, dados, ranking, modelos de categorias, e por evento: visão, inscritos, categorias com fusão (plano automático de peso vizinho, opções por categoria, desfazer), chaves (sorteio com semente, publicação), programação com descanso mínimo e atraso por tatame, pesagem com peso medido, financeiro, resultados, súmula do campeonato, equipe, configurações.
- Mesa: fila do tatame, trazer luta de outro tatame com motivo, atraso do tatame, árbitro do tatame, relato de ocorrência, placar fiel ao vídeo de referência com punição de efeito automático e combatividade, luta gravada no aparelho, súmula da luta, coordenação dos seis tatames.
- Administração do SaaS: organizações, eventos, usuários, parceiros, equipe interna, auditoria.
- Motor (`packages/engine`, 76 testes): eliminatória simples com separação por equipe, chave de três, resolução de resultados, regras da IBJJF (idades, tempos, punições, combatividade, pontos por academia), tabela de pesos, fusão de categorias, horários com descanso.
- Varredura de 13/10: 46 rotas × 7 perfis, computador e celular, sem erro, sem página vazia, sem rolagem lateral, cada perfil só onde deve.

## Como se trabalha aqui

- `apps/web`: React, Vite, Tailwind, react-router; sem banco nem login; dados fictícios de `src/data/seed.ts` (600 atletas, semente fixa); estado em reducer com localStorage (`arena-prototipo-v8`). `packages/engine`: TypeScript puro, vitest.
- Cada rodada: branch a partir de `origin/main`, `npx tsc --noEmit`, `npx vite build`, teste com Playwright quando há tela nova, registro em `docs/decisoes.md` (tabela e seção "Em aberto") e `docs/teste-de-estresse.md`, PR, merge squash, volta para `main`.
- Publicação do protótipo: `npx vite build --mode pagina-unica` em `apps/web` e republicação do artefato acima (mesma URL).
- Convenções: português do Brasil, zero travessão, nomes fictícios, semente explícita em todo sorteio, toda regra do motor com teste e citação de artigo.
- Branches antigas no GitHub só o fundador apaga (o proxy não permite); ligar "Automatically delete head branches" no repositório resolve de vez.

## O que falta antes de abrir o Lovable

Em ordem de valor:

1. Casos de borda da competição: categorias de 2, 3 e 64 atletas, W.O. duplo, atleta que não bate o peso, troca de categoria com chave publicada, lutas coladas em dois tatames.
2. Volume: evento com 1.500 e 3.000 inscrições (tempo de geração das chaves e legibilidade).
3. Cenários A01 a A14 do caderno funcional, tela a tela, por perfil.
4. Botões sem ação (8): conta do atleta (criar perfil, adicionar modalidade, solicitar vínculo, ver comprovante), gestão (exportar planilha, exportar quadro, encerrar inscrições), contato. E impedir que organizador e diretor abram "Meus dados" do mesário.
5. Modelos de categorias: editar faixas e tempos; aplicar o modelo ao evento.
6. Programação: intercalar chaves no mesmo tatame para aproveitar o descanso.
7. Especificação para o Lovable: modelo de dados, regras de acesso do Supabase e sequência de construção, a partir do protótipo e das decisões.

Do fundador: logo com o texto em curvas; uma sessão de uso sem ajuda (mesário no placar, organizador montando chaves) antes do primeiro evento real; apagar as branches antigas; avisar quando for hora de criar o projeto no Lovable.

## Como abrir a próxima conversa

Mensagem sugerida: "Continue o Arena a partir de `docs/estado-atual.md` do repositório Comandos08/FightCompetition. Siga as decisões de `docs/decisoes.md` e o fluxo de trabalho descrito. Comece pelo item 1 da lista do que falta."
