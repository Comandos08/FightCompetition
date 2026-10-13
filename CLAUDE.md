# FightCompetition

Plataforma da SportCombat para competições de esportes de combate. Dono do produto: Villar. Idioma de trabalho: português do Brasil.

- Prioridade atual: trilha A (kit CBJJS, novembro/2026). Ver `docs/escopo-kit-cbjjs.md`.
- `packages/engine` é lógica pura em TypeScript, sem dependência de tela ou banco, e toda regra tem teste.
- Regras esportivas não são escritas de memória: vêm do livro de regras ou de decisão registrada em `docs/`.
- Nunca versionar dados pessoais reais. Fixtures usam nomes fictícios.
- Determinismo: sorteio recebe uma semente explícita.
