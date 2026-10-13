# Registro de decisões

Cada linha diz o que foi decidido, por quem e por quê. Mudar uma decisão acrescenta uma linha; não apaga a anterior.

| Data | Decisão | Quem | Motivo |
|---|---|---|---|
| 12/10/2026 | Motor e placar em TypeScript, escritos com Claude Code; mesma tecnologia do Lovable (React, Vite, Tailwind, Supabase) nas demais camadas | Fundador e Claude | Uma linguagem só; testes automáticos sem custo de créditos |
| 12/10/2026 | Modelo de competição da CBJJS segue o padrão IBJJF | Fundador | Informação do fundador |
| 12/10/2026 | Prioridade passa a ser a plataforma SaaS; o evento da CBJJS valida depois | Fundador | Quer navegar e ver a interface antes de tratar do caso |
| 12/10/2026 | Claude decide e executa dentro do repositório; gastos, terceiros, dados reais e publicações ficam com o fundador | Fundador | Delegação explícita |
| 12/10/2026 | Primeira entrega da plataforma é um protótipo navegável com dados fictícios, sem banco nem login | Fundador (escolha entre duas opções) | Aparece rápido e muda barato |
| 12/10/2026 | Nome provisório "Arena" e direção visual clara e limpa | Fundador (direção) e Claude (execução) | Nome definitivo ainda não escolhido |
| 12/10/2026 | Byes sorteados e separação por um único campo de equipe | Claude | Regra oficial ainda não conferida; a validar |
| 12/10/2026 | Sugestão de fusão limitada ao peso imediatamente vizinho na mesma faixa | Claude | Fusão entre faixas ou pesos distantes é decisão técnica, não automática |
| 12/10/2026 | Tabela de divisões, pesos e tempos do protótipo é ilustrativa | Claude | O livro de regras oficial ainda não foi lido; nada disso é regra do produto |
| 13/10/2026 | Site público separado da área logada; a área logada mostra só os contextos em que a conta tem papel (minha área, equipe, organização, mesa) | Fundador (apontou a mistura) e Claude (execução) | O protótipo expunha painel do organizador e mesa a qualquer visitante |
| 13/10/2026 | Público sem login: agenda, página do evento, chaves publicadas, programação, resultados e painel do ginásio. Inscrição exige conta | Claude | Segue o bloco 1 do caderno funcional; a validar |
| 13/10/2026 | Direção visual sóbria, inspirada no estudo "IBJJF Redesign" de Ruslan Iulaev (Behance): fundo #F7F9FC, cartões brancos, azul-marinho #1A447D, amarelo #FAAB19, cabeçalho em dois níveis, abas e cartões com o mesmo ritmo | Fundador (referência) e Claude (execução) | Substitui a primeira direção visual. A fonte da referência (TT Norms Pro) é paga; o protótipo usa Outfit, a alternativa gratuita mais próxima |
| 13/10/2026 | A referência orienta estrutura e ritmo; marca, logotipo e nome do produto precisam ser próprios | Claude | Azul-marinho com amarelo é a identidade da IBJJF; um produto de terceiros com a mesma cara pode ser lido como oficial dela |
| 13/10/2026 | Fonte do protótipo passa a ser Inter | Fundador | Pedido direto |
| 13/10/2026 | Protótipo cobre todas as rotas previstas: cadastro e entrada, perfil esportivo, dependentes, pedidos, perfil público de atleta e de equipe, quadro de medalhas, regulamento, vínculos e inscrição em lote da equipe, lista e criação de eventos, financeiro, resultados, equipe de trabalho, configurações, membros e coordenação de tatames | Fundador (pedido) e Claude (escopo das telas) | Ver o produto inteiro antes de construir banco e login. Telas novas seguem o bloco 1 do caderno funcional |
| 13/10/2026 | Menores aparecem com sobrenome abreviado na lista pública e sem perfil público, por padrão; o organizador pode mudar | Claude | Proteção por padrão; depende da revisão jurídica |
| 13/10/2026 | Pontuação do quadro de medalhas (9, 3 e 1) e textos de regulamento, lotes e cancelamento são ilustrativos | Claude | Nenhuma regra esportiva ou comercial foi definida; servem para mostrar a tela |
| 13/10/2026 | Foto do atleta, imagem do evento e mapa de localização entram no produto. No protótipo, as imagens ficam só no navegador de quem enviou e o mapa é um desenho com botão "Como chegar" | Fundador (pedido) e Claude (execução) | Sem servidor não há onde guardar arquivo, e a página de demonstração não carrega mapas de terceiros |
| 13/10/2026 | Foto de atleta menor não é pública por padrão; depende de autorização do responsável | Claude | Mesmo critério do perfil público de menores; a validar na revisão jurídica |
| 13/10/2026 | Chave em dois lados que se encontram na final, com número da luta, tatame e horário; nome na chave leva ao perfil do atleta | Fundador (referência) e Claude (execução) | Segue os prints de referência enviados pelo fundador |
| 13/10/2026 | Atleta sem foto recebe avatar ilustrado gerado por código, com a cor da faixa. O protótipo não usa fotos de pessoas reais nem rostos sintéticos | Claude | O material simula atletas, parte deles menores |
| 13/10/2026 | Encerrada a fase de telas do protótipo; próximo passo é a fundação: modelo de dados do bloco 1, login e permissões | Fundador (aceitou a recomendação) | Mais tela rende cada vez menos; o risco está em banco, acesso e pagamento |
| 13/10/2026 | Painel do ginásio sai do menu geral e passa a pertencer ao evento (`/eventos/:id/painel`). Fica aberto ao público por padrão, com opção do organizador de restringir a quem está logado | Fundador (apontou o lugar errado) e Claude (padrão aberto) | O painel só faz sentido dentro de um evento; exigir login atrapalha a TV do ginásio e os pais na arquibancada. A validar com o fundador |
| 13/10/2026 | Menu público passa a ter visão institucional: Eventos, Para organizadores, Preços, Ajuda e chamada "Organize seu evento"; rodapé com as mesmas seções | Fundador (direção) e Claude (execução) | O site fala com dois públicos: o atleta que procura evento e o organizador que compra a plataforma |
| 13/10/2026 | Página inicial continua sendo a agenda de eventos; o conteúdo institucional fica em "Para organizadores" | Claude | A maior parte das visitas é de atletas e responsáveis; a validar |

## Em aberto

- Paleta definitiva: manter azul-marinho e amarelo ou adotar cores próprias com a mesma estrutura.

- Nome do produto.
- Livro de regras e tabela de pesos oficiais (PDF), para o pacote de regras.
- Regra para atleta sozinho na categoria e para inscrição no absoluto.
- Se byes devem ser sorteados ou seguir ranking ou ordem de inscrição.
- Provedor de pagamento e enquadramento do repasse.
- Revisão jurídica para dados de menores.
- Preço por inscrição e taxa da plataforma (as telas de financeiro e plano mostram valores de exemplo).
- Quais formatos de chave entram primeiro no motor além da eliminatória simples.
- Provedor de mapa (Google Maps é pago acima da franquia; OpenStreetMap é gratuito) e regra de moderação de imagens enviadas.
