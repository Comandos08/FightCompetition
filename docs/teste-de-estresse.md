# Teste de estresse do protótipo

Decisão do fundador em 13/10/2026: estressar o protótipo ao máximo e depois construir no Lovable com Supabase. O motor de chaves continua como código testado neste repositório.

O objetivo do estresse é achar o que falta ou está errado enquanto mudar custa pouco. Cada lacuna vira um item da especificação que alimenta o Lovable.

## Frentes

| Frente | O que testa | Situação |
|---|---|---|
| 1. Celular | Todas as rotas em tela de 390 px, sem rolagem lateral nem conteúdo cortado | Primeira varredura feita em 13/10: 6 de 31 telas alargavam a página; corrigidas |
| 2. Cenários ponta a ponta | Os cenários A01 a A14 do caderno funcional, percorridos tela a tela por papel | A fazer |
| 3. Casos de borda da competição | Categoria com 2, 3 e 64 atletas, W.O., desclassificação, atleta que não bate o peso, troca de categoria depois da chave publicada, atleta em duas categorias com horários colados | A fazer |
| 4. Volume | Evento com 1.500 e 3.000 inscrições: tempo de geração das chaves e legibilidade das telas | A fazer |
| 5. Pessoas de fora | Um organizador, um professor e um mesário usando sem ajuda | Demonstração ao presidente da CBJJS e a outro mestre em 13/10: aprovado sem alterações. Uso sem ajuda ainda não feito |

## Critério de saída

O estresse termina quando as frentes 1 a 4 não revelam lacuna nova por duas rodadas seguidas e a frente 5 teve pelo menos três sessões. A partir daí, tela nova no protótipo só entra se vier de uma dessas sessões.

## Lacunas encontradas

| Data | Frente | Lacuna | Situação |
|---|---|---|---|
| 13/10/2026 | 1 | Página inicial, Meu desempenho, Perfil esportivo, Equipe, Atletas e vínculos e Financeiro alargavam a página no celular | Corrigido |
| 13/10/2026 | 2 | Auditoria de 32 rotas com 6 perfis: mesário abria qualquer tatame e a coordenação; inscrições de uma conta apareciam em outra; nome de menor abreviado na lista e inteiro na chave; painel do evento ignorava o evento do endereço; organizador era papel único; `/app` negava acesso ao administrador; contas sem perfil de atleta viam graduação e desempenho | Corrigido |
| 13/10/2026 | 2 | Segunda auditoria de rotas, com 7 perfis e ações dentro das telas: mesário abria o placar de luta de outro tatame trocando o número no endereço; a conta de atleta virava outra pessoa depois de cancelar uma inscrição; diretor técnico registrava autorização de menor; painel do ginásio ignorava o evento do endereço; cadastro aceitava nova conta com sessão ativa; opção "lista de inscritos pública" prometia mais do que fazia | Corrigido |
| 13/10/2026 | 3 | Categoria com 3 atletas usava eliminação simples com bye; o livro manda usar a chave de três | Corrigido no motor |
| 13/10/2026 | 3 | Tempos de luta, categorias de idade, punições e combatividade eram ilustrativos | Corrigido com o livro de regras |
| 13/10/2026 | 2 | Inscrição não reaproveitava dependentes; atleta novo aparecia com histórico inventado; nome longo era cortado no telão | Corrigido |
| 13/10/2026 | 3 | Com as categorias de idade oficiais, 262 de 374 categorias ficam com um atleta só | Aberto: falta a ferramenta de juntar categorias |
