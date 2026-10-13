# Regras IBJJF usadas pelo produto

Fonte: IBJJF, "Livro de Regras, Regulamento Geral de Competições e Manual de Formatação de Competições", versão 6.1, junho de 2024, e o "Guia de atualização das regras 2024". Os dois arquivos foram enviados pelo fundador em 13/10/2026. O PDF não fica no repositório, por ser obra protegida; aqui ficam só as regras que o sistema aplica, cada uma com o artigo de origem.

O código está em `packages/engine/src/regras-ibjjf.ts` e `packages/engine/src/chave-de-tres.ts`, com testes.

## O que já está no motor

| Regra | Artigo | Onde |
|---|---|---|
| Idade = ano do campeonato − ano de nascimento | Regulamento Geral 1.1 | `idadeNoAno` |
| 22 categorias de idade, de Pré-Mirim I (4 anos) a Master 7 (61 anos ou mais); adulto e master só têm limite mínimo | RG 1.2 e 1.3 | `CATEGORIAS_DE_IDADE`, `categoriasElegiveis` |
| Tempo de luta por categoria e faixa (2 a 10 minutos) | RG 1.3 | `tempoDeLuta` |
| Descanso mínimo: igual ao tempo de luta até a semifinal, o dobro antes da final | RG 1.4 | `descansoMinimo` |
| Eliminação simples | RG 2.2 | `gerarEliminatoriaSimples` |
| Chave de três: o perdedor da primeira luta enfrenta o terceiro atleta | RG 2.3.1 | `gerarChaveDeTres` |
| Na chave de três, quem não comparece à primeira luta não faz a segunda | RG 2.3.4 | `perdedorSemDireitoASegundaLuta` |
| Ouro, prata e dois bronzes | RG 4.1.1 | `resolverChave` |
| Disputa por academias: 9, 3 e 1 pontos | RG 3.2 | `PONTOS_POR_ACADEMIA` |
| Categoria com um atleta, ou com dois da mesma academia, não pontua | RG 3.4 e 3.5 | `categoriaContaParaAcademias` |
| Até dois atletas por academia na mesma categoria | RG 5.2 | constante; ainda não validado na inscrição |
| Pontos: 4 (montada, montada pelas costas, pegada pelas costas), 3 (passagem de guarda), 2 (queda, raspagem, joelho na barriga) | Livro de Regras 2.5.2 | `PONTOS` |
| Vencedor pelo placar: pontos, depois vantagens, depois menos punições; empate total é decisão do árbitro | LR 2.5 e 2.6 | `vencedorPeloPlacar` |
| Punições: 1ª só marca; 2ª dá vantagem ao oponente; 3ª dá dois pontos; 4ª desclassifica | LR 7.2.1 | `efeitoDaPunicao` |
| Até 15 anos: 4ª e 5ª punições dão dois pontos; a 6ª desclassifica | LR 7.2.4 | `efeitoDaPunicao` |
| Falta de combatividade: contagem de 20 segundos | LR 7.3.1 | `COMBATIVIDADE_SEGUNDOS` |

## O que o livro traz e ainda não está no sistema

- Desclassificações em semifinais e finais (RG 2.4): doze situações que mudam quem é campeão, vice e terceiro. Exige distinguir falta técnica de falta disciplinar no registro do resultado.
- WO e medalha (RG 4.2): quem perde por WO sem ter lutado não entra na colocação.
- Atleta sozinho na categoria precisa ser pesado e ter o uniforme checado para receber medalha (RG 4.4).
- Desempate da disputa por academias além de ouros e pratas (RG 3.3): campeões mais graduados e mais pesados, depois sorteio.
- Descanso mínimo na programação (RG 1.4): a função existe, a programação ainda não a usa.
- Limite de dois atletas por academia na categoria (RG 5.2).
- Poder do professor sobre as inscrições da academia (RG 5.3): responde à pergunta em aberto do bloco 1 sobre delegação.
- O edital de cada competição se sobrepõe ao regulamento (RG 7.1): por isso as regras precisam ser configuráveis por evento.
- Decisão do árbitro e três árbitros (LR 1.2 e 2.6).

## O que o livro não traz

- **Tabela de pesos.** Recebida em 13/10/2026 (folha "Tabela de Pesos Oficial", com referência a 2023) e transcrita em `packages/engine/src/pesos-ibjjf.ts`. Por decisão do fundador, o No-Gi usa as mesmas categorias e limites. Falta a confirmação de que os valores de 2023 continuam valendo. A folha é uma imagem de baixa resolução; a transcrição passou no teste de coerência (limites sempre crescentes), mas vale conferir com a versão atual no site da IBJJF.
- **Sistema de faixas por idade** (quais faixas existem em cada categoria infantil). As faixas infantis do protótipo continuam ilustrativas.
- **Categoria absoluto**: o livro cita, mas não define as regras de inscrição.

## Consequência observada no protótipo

Com as categorias de idade oficiais, uma por ano de nascimento até os 17 anos, a base fictícia de 600 atletas passou a formar 374 categorias, das quais 262 tinham um atleta só (com a tabela de pesos oficial, de nove classes, são 391 categorias e 283 com um atleta só). Parte disso vem dos pesos e faixas ilustrativos, mas o efeito é real em eventos pequenos e médios: juntar categorias vira a tarefa central do organizador antes de gerar as chaves.
