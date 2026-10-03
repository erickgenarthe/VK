# O Manual · Videira Kids (série de outubro de 2026)

## Contexto
- Erick lidera o Videira Kids (CC Videira, Capim Macio, Natal). A série de outubro se chama "O Manual".
- Conceito: a Bíblia é o manual de instruções que Deus nos deu, como o manual de um brinquedo de montar. Frases da série: "A Bíblia mostra o caminho" e "Deus fala e guia".
- Material oficial da identidade: `referencias/identidade-serie-o-manual.pdf` (criado por Paulo Roberto).
- Pedido original: decoração com o mesmo tema, mas sem montar o tema com blocos e formas geométricas, e um devocional online para pais e filhos fazerem durante a semana.
- A decoração é para o palco da foto `referencias/palco-atual.png`. A decoração que aparece nessa foto deve ser ignorada.

## Identidade usada nos arquivos
- Fontes oficiais: Blockletter Regular (primária) e Azo Sans Medium (secundária). Nenhuma está no Google Fonts, então os arquivos usam **Big Shoulders Display** e **Figtree** como substitutas. Trocar se as fontes originais forem fornecidas.
- Cores (valores aproximados, tirados a olho do PDF): verde #2F9E44, roxo #7A3FC0, amarelo #F4BC1C, vermelho #DD3B32, azul #1F7FD6, laranja #F28A1A.
- Papel e tinta: creme #FFF9EC, kraft #C9A26B, tinta #241F31.
- Cor de cada passo do devocional: Ler azul, Conversar laranja, Fazer verde, Orar roxo.

## Estrutura da pasta
- `devocional/index.html`: página única (HTML, CSS e JS), 4 semanas, modo claro e escuro. Interativo: cada passo encaixa uma peça no quadro 4x4 "brinquedo da família", jogo de montar o versículo (estrelas), cronômetro por passo, sorteio de pergunta, ouvir o versículo, certificado imprimível, som e confete. Progresso no localStorage (migra o da v1).
- `decoracao/index.html`: página interativa da decoração (autônoma, sem build): palco animado passo a passo com peças clicáveis, lista de peças com checklist, e peças para imprimir (varal A6/A5/A4, parede-manual por semana, caixa, mini manual que abre) com QR code real a partir do link do devocional. Depende só de fontes do Google e do qrcodejs (cdnjs).
- `decoracao/original/project/*.dc.html`: pranchas originais de decoração (antes da versão interativa). `canvas.json` guarda a posição de cada uma no quadro.
  - `Palco` (proposta no palco da foto) e `Pecas` (lista de peças e cuidados)
  - `Main` (parede-manual), `Caixa` (caixa na entrada), `Varal` (cartões dos passos), `Capa` e `Miolo` (mini manual de bolso)
  - São HTML com estilo inline e abrem direto no navegador. O editor visual do Claude Design não vem junto.
- `referencias/`: PDF da identidade e foto do palco.

## Publicado no claude.ai (privado até ser compartilhado)
- Devocional: https://claude.ai/artifact/9jen4deE1XZYK8AsMYAnBw
- Quadro de decoração: https://claude.ai/artifact/Uki8X3E7Mx73Sc4LwARFKd

## Decisões e pendências
- Decoração sem faixas (pedido do Erick, depois de gostar das letras-peça do título do devocional): as letras O M A N U A L, em placas de E.V.A. coloridas com moldura clara e celofane, penduradas embaixo da TV num varão baixo (cano preto preso ao varão das luzes por dois fios). Os cartões do varal ficam um par de cada lado da TV, na altura dela. Moldes das letras na aba "Letras para recortar". Isso substitui a restrição original de não usar blocos/formas na decoração.
- Os 4 temas e versículos são sugestão, no texto da Almeida Corrigida: semana 1 "Todo brinquedo vem com manual" (Salmos 119:105), semana 2 "Quem escreveu o manual?" (2 Timóteo 3:16), semana 3 "Um passo de cada vez" (Provérbios 3:5-6), semana 4 "Montar de verdade" (Tiago 1:22). Alinhar com o material oficial da série e com a versão bíblica da igreja.
- O QR code das imagens é só um marcador. Trocar pelo QR real quando o link do devocional estiver compartilhado.
- Medidas dos banners, cartões e caixas não foram definidas. Conferir no palco.
- O peso pendurado no varão das luzes precisa ser combinado com a equipe de som e luz.
- O desenho do palco é uma ilustração aproximada feita a partir da foto, não uma montagem sobre a foto real.

## Ideias para melhorar
- Montagem realista sobre a foto do palco, com perspectiva.
- Arquivos de impressão em tamanho real (PDF com sangria): banners, cartões do varal, marcas de chão e mini manual.
- Ilustrações e ícones próprios no lugar das formas simples.
- QR code real nas peças.
- Devocional: ilustração por semana, versão para imprimir e áudio dos versículos.

## Convenções
- Português do Brasil, tom simples, pensado para pais e crianças.
- Não inventar conteúdo bíblico. Sempre indicar a versão do texto.
- Antes de mudar a identidade visual, conferir o PDF de referência.
