# FightCompetition

Plataforma da SportCombat para competições de esportes de combate. Dono do produto: Villar. Idioma de trabalho: português do Brasil.

- Prioridade atual (decisão do fundador em 12/10/2026): a plataforma SaaS, começando pelo protótipo navegável em `apps/web`. O evento da CBJJS serve depois para validar os fluxos; o kit de `docs/escopo-kit-cbjjs.md` está em espera.
- Claude tem autonomia para decidir e executar dentro deste repositório. Ficam para o fundador: gastos, contato com terceiros, dados reais de atletas e qualquer publicação além de demonstração com dados fictícios. Ver `docs/decisoes.md`.
- `apps/web` é o protótipo: React, Vite, Tailwind, sem banco nem login, com dados fictícios gerados em `src/data/seed.ts`. As chaves são geradas pelo motor real.
- `packages/engine` é lógica pura em TypeScript, sem dependência de tela ou banco, e toda regra tem teste.
- Regras esportivas não são escritas de memória: vêm do livro de regras ou de decisão registrada em `docs/`. As regras da IBJJF já extraídas estão em `docs/regras-ibjjf.md` e em `packages/engine/src/regras-ibjjf.ts`.
- Nunca versionar dados pessoais reais. Fixtures usam nomes fictícios.
- Determinismo: sorteio recebe uma semente explícita.
