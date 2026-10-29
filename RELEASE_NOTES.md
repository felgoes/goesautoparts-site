# Notas de versão

## 29/10/2026 — atendimento pelo WhatsApp

- O telefone de atendimento aparece no rodapé e os botões do site abrem uma conversa com a equipe.
- Cada anúncio identifica a peça e a oferta na mensagem; o texto geral usa um tom cordial e profissional.

Versão publicada: [4291fe6](https://github.com/felgoes/goesautoparts-site/commit/4291fe66b941a9d4d00bb2deed6a774b9dcf230c).

## 24/10/2026 — quantidades no padrão brasileiro

- O estoque dos anúncios deixou de mostrar zeros decimais desnecessários: `7.000` agora aparece como `7`.
- Quantidades fracionadas continuam permitidas, com até três casas e formatação brasileira.

Versão publicada: [cfb379c](https://github.com/felgoes/goesautoparts-site/commit/cfb379c2f22f787eefc4d5ac62a1abf7188565c3).

## 24/10/2026 — catálogo mais direto e legível

- Os cartões deixaram de exibir a descrição comercial completa; nome, aplicação resumida, preço, disponibilidade e o atalho “Ver ficha técnica” continuam visíveis.
- A descrição completa e todas as compatibilidades veiculares permanecem na ficha ao abrir o produto.

Versão publicada: [37e809d](https://github.com/felgoes/goesautoparts-site/commit/37e809da75cc0bdb82893be9eb8334639e00a705).

## 20/10/2026 — rolagem e busca instantânea nas aplicações

- O modal inteiro agora responde à rolagem, inclusive quando o cursor está sobre a galeria.
- A busca de modelos e motores foi ligada diretamente ao evento de digitação, atualizando a lista a cada tecla.

Versão publicada: [2ff59a3](https://github.com/felgoes/goesautoparts-site/commit/2ff59a3).

## 20/10/2026 — lista inteligente de aplicações

- As cartas foram substituídas por uma lista agrupada por marca e modelo.
- Cada modelo mostra faixa de anos, motores e quantidade de versões; os detalhes abrem apenas quando solicitados.
- Quatro modelos aparecem inicialmente e o restante fica em “Ver todos”.
- A busca interna filtra por modelo ou motor sem poluir o modal.

Versão publicada: [4990c90](https://github.com/felgoes/goesautoparts-site/commit/4990c90).

## 20/10/2026 — cartas de compatibilidade veicular

- As aplicações do produto agora aparecem como cartas colecionáveis no estilo “Super Trunfo”, agrupadas por marca e modelo.
- Cada carta mostra faixa de anos, motor, principal versão, quantidade de aplicações e confirmação de compatibilidade.
- As cartas ficam em uma faixa horizontal no modal e continuam legíveis no celular.
- A busca do catálogo também aceita aplicação veicular, incluindo modelo e motor.

Versão publicada: [96e80a4](https://github.com/felgoes/goesautoparts-site/commit/96e80a4).

## 20/10/2026 — modal compacto do produto

- O modal foi reduzido para 760 px de largura e até 460 px de altura, com galeria de 320 px e foto limitada a 170 px.
- As miniaturas foram reduzidas para 30 px e o card do anúncio deixou de duplicar título e imagem.
- Preço, estoque, especificações recolhíveis e link do Mercado Livre ficaram em um bloco compacto.
- O layout foi validado com o produto real em desktop, 390 px e 320 px.

Versão publicada: [16906ef](https://github.com/felgoes/goesautoparts-site/commit/16906ef).

## 20/10/2026 — modal do produto redesenhado

- O modal virou um cartão compacto com galeria à esquerda e ficha técnica à direita no desktop, mantendo uma coluna no celular.
- A foto principal ficou limitada a um palco de 270 px, e as miniaturas foram reduzidas para 46 px.
- As especificações longas do anúncio agora ficam recolhidas e rolam dentro do painel sem alongar o modal.
- Bordas, botões, contador, setas e cartões foram arredondados e ajustados para 320 px, 390 px e telas maiores.

Versão publicada: [fdbb867](https://github.com/felgoes/goesautoparts-site/commit/fdbb867).

## 20/10/2026 — galeria do modal responsiva

- As fotos deixaram de ser ampliadas para preencher todo o modal e agora respeitam o tamanho e a proporção originais.
- O palco da galeria foi compactado, as setas ganharam uma área própria e o conjunto foi ajustado para desktop, tablet e celular.
- O modal usa melhor a altura da tela, mantém as miniaturas roláveis e volta à primeira foto ao reabrir o produto.

Versão publicada: [d4ffe2b](https://github.com/felgoes/goesautoparts-site/commit/d4ffe2b).

## 20/10/2026 — catálogo com foco em oficinas

- O posicionamento passou de loja para consumidor final para um catálogo de reposição voltado a oficinas, mecânicos, auto centers e lojas de autopeças.
- A busca agora destaca SKU, código OEM e aplicação; o fluxo de compra orienta a conferir versão, motor e ano antes do pedido.
- Os anúncios do Mercado Livre continuam sendo o canal de oferta e compra.

Versão publicada: [630465d](https://github.com/felgoes/goesautoparts-site/commit/630465d).

## 20/10/2026 — catálogo sem chamadas de contato

- Os botões e links “Falar com especialista” foram removidos do cabeçalho, da abertura, dos produtos, dos detalhes e do rodapé.
- Os links para os anúncios no Mercado Livre permanecem disponíveis.

Versão publicada: [ca0b17a](https://github.com/felgoes/goesautoparts-site/commit/ca0b17a).

## 20/10/2026 — galeria completa no catálogo

- Produtos com anúncios agora exibem todas as fotos do Mercado Livre em um carrossel lateral.
- A imagem principal usa a URL original do anúncio, em vez da miniatura de baixa resolução.
- Setas, miniaturas e gesto lateral funcionam no desktop e no celular.

Versão publicada: [dafdc21](https://github.com/felgoes/goesautoparts-site/commit/dafdc21).

## 18/10/2026 — Identidade visual Goes Auto Parts

- Catálogo atualizado com a identidade visual da marca e layout adaptado para celulares.
- Busca, detalhes das peças, disponibilidade e contato preservados; código OEM e aplicação aparecem quando disponíveis no catálogo.
- Melhorias de acessibilidade na navegação e nos detalhes das peças.

Versão publicada: [2b7994a](https://github.com/felgoes/goesautoparts-site/commit/2b7994ab48f7314c6b94a7f4e9142a7753e2abd8).
