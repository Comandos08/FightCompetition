# FightCompetition

Plataforma da SportCombat para organização de competições de esportes de combate. BJJ é a primeira modalidade.

## Estado atual

- **Motor** (`packages/engine`): gera a eliminatória simples com sorteio reproduzível, byes espalhados e separação por equipe, e resolve a chave a partir dos resultados. 41 testes.
- **Protótipo navegável** (`apps/web`): quatro áreas (público e inscrição, organizador, mesa e placar, atleta e professor) sobre um evento fictício de 600 atletas. Sem banco, login ou pagamento real.

Ainda não existem: banco de dados, autenticação, pagamento, pacote de regras oficial, regra de três atletas e políticas de bronze além de dois terceiros lugares.

```
cd packages/engine && npm install && npm test     # testes do motor
cd apps/web && npm install && npm run dev         # protótipo em http://localhost:5173
```

## Prioridade

Decisão do fundador em 12/10/2026: construir a plataforma SaaS primeiro e usar o evento da CBJJS para validar os fluxos depois. O kit de novembro (`docs/escopo-kit-cbjjs.md`) está em espera.

## Estrutura

| Pasta | Conteúdo |
|---|---|
| `packages/engine` | Motor de competição: categorias, sorteio, progressão, colocação. Lógica pura, sem tela nem banco |
| `packages/rules-ibjjf` | Pacote de regras no modelo IBJJF: divisões de idade, faixas, pesos, tempos de luta |
| `apps/web` | Protótipo navegável da plataforma |
| `apps/kit` | Kit de planilha e PDF (em espera) |
| `fixtures` | Casos de referência com entrada e resultado esperado. Nunca dados reais de atletas |
| `docs` | Escopo, decisões e pendências |

## Regras do repositório

- Nenhum dado pessoal real entra no repositório. Listas de inscritos ficam fora do controle de versão.
- Todo formato de chave só é considerado pronto com casos de teste validados por uma pessoa com autoridade técnica.
- O motor é determinístico: mesmos inscritos, mesma versão de regras e mesma semente produzem a mesma chave.
