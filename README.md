# CCVServe — escalas e check-in de voluntários

**Viver. Amar. Servir.**

CCVServe nasceu a partir do que já tínhamos aprendido construindo o Videira
Kids: um app único, sem processo de build, fácil de publicar de graça no
Netlify e fácil de qualquer pessoa da liderança entender e mexer. A diferença
é o foco — aqui não existe cadastro de família nem check-in de criança. É só
a escala do voluntário e o check-in da própria pessoa que serve.

Guardamos o nome do repositório (`VK`) porque este projeto nasceu como uma
continuação dele, mas o produto se chama **CCVServe** — pense num nome
melhor a qualquer momento, é só trocar "CCVServe" pelo texto que você quiser
no `index.html`, no `manifest.json` e nos arquivos da pasta `netlify/functions`.

## O que tem no app

- **Cadastro e login** do voluntário (e-mail/senha), com departamentos e
  disponibilidade escolhidos no próprio cadastro.
- **A primeira pessoa que se cadastra vira administradora automaticamente**
  — não precisa de nenhuma etapa extra de "criar o primeiro admin".
- **Escala colaborativa**: quem lidera monta a escala e aprova pedidos; quem
  quer servir também pode se candidatar direto em "Vagas abertas".
- **Troca de turno**: o voluntário que não pode ir publica um pedido, e
  qualquer outra pessoa da mesma área pode aceitar — sem precisar da
  liderança no meio.
- **Check-in do próprio voluntário**: escaneando o QR mostrado na portaria
  (modo "Montar escala" → "Check-in" → líder abre "Modo portaria") ou
  confirmando manualmente. Sem depender de ninguém com caderno na mão.
- **Gamificação leve**: pontos por serviço, sequência de fidelidade,
  conquistas automáticas e elogios que a liderança pode enviar.
- **Exportação** da escala do mês em Excel e PDF, e um log de auditoria de
  quem fez o quê.
- **Lembretes por WhatsApp** (funções agendadas do Netlify, opcionais):
  lembrete de compromisso, agradecimento pós-culto, resumo pros líderes e
  aviso automático de vaga aberta.
- **Modo demonstração**: sem configurar nada, o app já funciona salvando os
  dados no navegador (`localStorage`) — dá pra testar tudo antes de publicar
  de verdade.
- **Totem pós-apelo** (`totem.html`, opcional): tela pra tablet, sem login,
  onde visitantes deixam nome, WhatsApp e o que têm interesse — a equipe de
  acompanhamento é avisada e vê tudo em "Mais" → "Totem · Contatos".

## Como testar agora mesmo (sem configurar nada)

Abra o `index.html` direto no navegador (duplo clique, ou `python3 -m
http.server` na pasta e acesse `http://localhost:8000`). O app entra
sozinho em **modo demonstração**: os dados ficam só no seu navegador, então
dá pra criar contas, montar escala e testar o check-in à vontade antes de
publicar.

## Como publicar de verdade

### 1. Firebase (banco de dados + login)

1. Crie um projeto grátis em [firebase.google.com](https://firebase.google.com)
   (o plano Spark, gratuito, é suficiente pra começar).
2. Ative o **Firestore Database** (modo produção) e o **Authentication** →
   método "E-mail/senha".
3. Em "Configurações do projeto" → "Seus apps" → crie um app Web e copie o
   objeto `firebaseConfig`.
4. Cole os valores no início do `index.html`, na constante `firebaseConfig`
   (procure por `COLE_AQUI_SUA_API_KEY`).
5. Nas regras do Firestore, comece liberando leitura/escrita só pra quem
   está autenticado:
   ```
   rules_version = '2';
   service cloud.firestore {
     match /databases/{database}/documents {
       match /{document=**} {
         allow read, write: if request.auth != null;
       }
     }
   }
   ```
   (Dá pra refinar depois, por coleção e por papel, quando quiser mais
   segurança.)

### 2. Publicar no Netlify

1. Suba este repositório pro GitHub (se ainda não estiver lá).
2. Em [netlify.com](https://netlify.com), "Add new site" → "Import an
   existing project" → conecte o repositório.
3. Não precisa configurar comando de build nem diretório — o
   `netlify.toml` já diz pra publicar a raiz do projeto.
4. Pronto: o site sobe com o `index.html` na URL principal.

### 3. Lembretes por WhatsApp (opcional)

As funções em `netlify/functions/` usam a **WhatsApp Cloud API** (da Meta) e
falam direto com o Firestore por REST, sem precisar instalar nada (`npm
install` não é necessário — o Netlify já roda essas funções com Node 18+).

No painel do Netlify, em "Site settings" → "Environment variables", adicione:

| Variável | O que é |
|---|---|
| `FIREBASE_PROJECT_ID` | o ID do seu projeto Firebase |
| `FIREBASE_CLIENT_EMAIL` | e-mail da conta de serviço (gere em "Configurações do projeto" → "Contas de serviço" → "Gerar nova chave privada") |
| `FIREBASE_PRIVATE_KEY` | a chave privada do mesmo JSON (cole com as quebras de linha como `\n`) |
| `WHATSAPP_PHONE_ID` | ID do número no WhatsApp Cloud API |
| `WHATSAPP_TOKEN` | token de acesso do WhatsApp Cloud API |

Sem essas variáveis, o app inteiro continua funcionando normalmente — só os
lembretes automáticos por WhatsApp ficam desativados. Os modelos de mensagem
("templates") precisam ser aprovados no Gerenciador do WhatsApp Business
antes de usar; os nomes esperados por padrão são `ccvserve_lembrete`,
`ccvserve_agradecimento`, `ccvserve_status_lider` e `ccvserve_vaga_aberta`
(dá pra trocar via variável de ambiente, veja o topo de cada arquivo em
`netlify/functions/`).

### 4. Totem pós-apelo (opcional)

`totem.html` é uma página pública, sem login, pensada pra rodar sozinha num
tablet perto da saída: quem visitou a igreja e não subiu no apelo pode
deixar nome, WhatsApp e o que despertou interesse (conhecer a igreja, grupo
de crescimento, oração...), com uma mensagem opcional.

Diferente das 4 funções acima, `netlify/functions/totem-contato.mjs` **não é
agendada** — é a única função deste projeto acionada sob demanda, chamada
pelo próprio `totem.html` a cada envio (`/.netlify/functions/totem-contato`).
Ela grava o contato na coleção `contatosTotem` do Firestore e, se houver
números cadastrados em "Mais" → "Configurações" → "WhatsApp da equipe de
acompanhamento", avisa a equipe por WhatsApp usando o template
`ccvserve_totem_contato` (nome configurável pela variável de ambiente
`WHATSAPP_TEMPLATE_TOTEM`).

**O contato do totem é sempre salvo no Firestore mesmo sem nenhuma variável
de WhatsApp configurada** — só o aviso automático pra equipe fica
desativado, igual aos outros recursos de WhatsApp do app. Depois de salvo,
qualquer líder ou admin vê a lista completa em "Mais" → "Totem · Contatos",
com um botão que já abre uma conversa no WhatsApp com o visitante e outro
("⬇️ Exportar PDF de hoje") que gera, na hora, um PDF com todos os contatos
do dia — pra imprimir ou arquivar ao final do culto.

### Montando o totem físico (hardware)

- **Tablet**: um Android 10"+ com boa base/suporte e sempre na tomada — não
  precisa ser topo de linha, a página é um formulário simples.
- **Travar no modo totem**: **Fully Kiosk Browser** (Android, versão grátis
  já serve) apontado pra URL publicada do `totem.html` — bloqueia os botões
  de início/voltar, evita a tela apagar e recarrega a página sozinho de
  tempos em tempos. Com iPad, dá pra usar **Acesso Guiado** (Ajustes →
  Acessibilidade) travando o Safari na página, mas é mais manual (sem
  monitoramento remoto) — por isso Android + Fully Kiosk é a recomendação.
- **Suporte/antifurto**: um suporte de mesa ou parede com trava simples perto
  da saída, só pra evitar que alguém leve o tablet sem querer na correria do
  culto.
- **Energia**: deixe sempre na tomada, com o cabo protegido pelo suporte —
  bateria descarregada no meio do culto é a principal causa de falha.

## Personalizando pra sua igreja (ou pra vender pra outra)

- **Nome e lema**: depois de logar como admin, vá em "Mais" → "Configurações"
  e troque o nome da igreja e o lema — isso já reflete no app sem mexer em
  código.
- **Departamentos**: "Mais" → "Departamentos" — adicione, remova, do jeito
  que sua casa já funciona. A lista inicial vem com os 20 departamentos
  informados: Artes Criativo, Balcão de Informações, Cafezinho, Comunicação,
  Conexão, Coordenação de Voluntários, Ensino, Eventos, House, Intercessão,
  Liderança de Culto, Louvor, Oferta, Protec, Recepção Externa, Recepção
  Interna, Sala de Materiais, Segurança, Social IVV e Store.
- **Cores da marca**: no `index.html`, dentro de `<style>`, as variáveis
  `--coral` (amar), `--teal` (servir) e `--ouro` (viver) controlam a
  identidade visual inteira.
- **Interesses do totem**: em `totem.html`, a constante `INTERESSES` no
  `<script>` tem as opções mostradas no formulário — edite ali se sua igreja
  usa outras (e mantenha igual à lista `INTERESSES_VALIDOS` em
  `netlify/functions/totem-contato.mjs`).
- **Página de vendas**: `site/index.html` é uma landing page separada,
  pensada pra apresentar o CCVServe pra outras igrejas — troque o e-mail de
  contato antes de publicar (procure por `contato@suaigreja.exemplo`).

## Estrutura do projeto

```
index.html                        → o app (voluntários e liderança)
totem.html                        → totem físico pós-apelo (sem login)
site/index.html                   → landing page comercial do CCVServe
manifest.json, sw.js              → deixa o app instalável no celular (PWA)
netlify.toml                      → configuração de publicação no Netlify
netlify/functions/_lib.mjs        → funções compartilhadas (Firestore, datas, WhatsApp)
netlify/functions/lembrete-escala.mjs        → lembrete de compromisso (seg/qui)
netlify/functions/agradecimento-servico.mjs  → agradecimento pós-culto
netlify/functions/status-lideres.mjs         → resumo pros líderes (ter/sáb)
netlify/functions/vagas-abertas.mjs          → aviso automático de vaga aberta (qua)
netlify/functions/totem-contato.mjs          → recebe o formulário do totem (sob demanda, não agendada)
```

## Limitações conhecidas (é um MVP, não um produto de 5 anos de estrada)

- A exportação (Excel/PDF) sempre pega o mês do seletor em "Configurações" —
  não dá pra exportar vários meses de uma vez ainda.
- O QR de check-in prova que o celular do voluntário "viu" a tela da
  portaria naquele dia — não é uma trava de segurança forte, é uma
  conveniência pra evitar check-in de outro dia por engano.
- As regras de segurança do Firestore sugeridas acima são o ponto de
  partida mais simples (qualquer pessoa autenticada lê/escreve tudo); pra
  uma operação maior, vale restringir por papel/coleção.
- O endpoint do totem (`totem-contato.mjs`) é público por natureza — não
  exige login, já que é pra visitantes usarem — e não tem proteção contra
  spam além da validação básica dos campos.
