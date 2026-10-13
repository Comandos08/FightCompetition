# FightCompetition

Plataforma da SportCombat para organização de competições de esportes de combate. BJJ é a primeira modalidade.

## Estado atual

O motor gera a estrutura da eliminatória simples (posições, byes e separação por equipe) com sorteio reproduzível. Ainda não há regra de colocação, regra de três atletas, pacote de regras IBJJF nem o kit.

Para rodar os testes: `cd packages/engine && npm install && npm test`.

## Trilhas

| Trilha | Objetivo | Prazo |
|---|---|---|
| A. Kit CBJJS | Planilha de inscritos entra; chaves e ordem de lutas saem em PDF | Evento da CBJJS, novembro/2026 (data a confirmar) |
| B. Plataforma | Inscrição, pagamento, pesagem, placar, resultados | Edição seguinte |

A trilha A tem prioridade. O motor escrito para o kit é o mesmo da plataforma.

## Estrutura

| Pasta | Conteúdo |
|---|---|
| `packages/engine` | Motor de competição: categorias, sorteio, progressão, colocação. Lógica pura, sem tela nem banco |
| `packages/rules-ibjjf` | Pacote de regras no modelo IBJJF: divisões de idade, faixas, pesos, tempos de luta |
| `apps/kit` | Kit de novembro: lê a planilha, valida, monta categorias, gera chaves e PDFs |
| `fixtures` | Casos de referência com entrada e resultado esperado. Nunca dados reais de atletas |
| `docs` | Escopo, decisões e pendências |

## Regras do repositório

- Nenhum dado pessoal real entra no repositório. Listas de inscritos ficam fora do controle de versão.
- Todo formato de chave só é considerado pronto com casos de teste validados por uma pessoa com autoridade técnica.
- O motor é determinístico: mesmos inscritos, mesma versão de regras e mesma semente produzem a mesma chave.
