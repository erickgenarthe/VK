# SERVE — escalas e check-in de voluntários

**Viver. Amar. Servir.**

SERVE nasceu a partir do que já tínhamos aprendido construindo o Videira
Kids: um app único, sem processo de build, fácil de publicar de graça no
Netlify e fácil de qualquer pessoa da liderança entender e mexer. A diferença
é o foco — aqui não existe cadastro de família nem check-in de criança. É só
a escala do voluntário e o check-in da própria pessoa que serve.

Guardamos o nome do repositório (`VK`) porque este projeto nasceu como uma
continuação dele, mas o produto se chama **SERVE** — pense num nome
melhor a qualquer momento, é só trocar "SERVE" pelo texto que você quiser
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
antes de usar; os nomes esperados por padrão são `serve_lembrete`,
`serve_agradecimento`, `serve_status_lider` e `serve_vaga_aberta`
(dá pra trocar via variável de ambiente, veja o topo de cada arquivo em
`netlify/functions/`).

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
- **Página de vendas**: `site/index.html` é uma landing page separada,
  pensada pra apresentar o SERVE pra outras igrejas — troque o e-mail de
  contato antes de publicar (procure por `contato@suaigreja.exemplo`).

## Estrutura do projeto

```
index.html                        → o app (voluntários e liderança)
site/index.html                   → landing page comercial do SERVE
manifest.json, sw.js              → deixa o app instalável no celular (PWA)
netlify.toml                      → configuração de publicação no Netlify
netlify/functions/_lib.mjs        → funções compartilhadas (Firestore, datas, WhatsApp)
netlify/functions/lembrete-escala.mjs        → lembrete de compromisso (seg/qui)
netlify/functions/agradecimento-servico.mjs  → agradecimento pós-culto
netlify/functions/status-lideres.mjs         → resumo pros líderes (ter/sáb)
netlify/functions/vagas-abertas.mjs          → aviso automático de vaga aberta (qua)
treino/                           → app pessoal "FORJA" (personal trainer), veja abaixo
devocional/                       → app "Despertas" (devocional do grupo de crescimento), veja abaixo
```

## FORJA — personal trainer digital (`treino/`)

Um segundo app, independente do SERVE, guardado na pasta `treino/`. Não tem
nada a ver com escala de voluntários — é um app pessoal de treino, dieta e
evolução física, pensado pra rotina corrida (trabalho de manhã, filho à
tarde, pouco tempo pra treinar).

- **100% local**: sem Firebase, sem login — todos os dados (medidas, treinos,
  dieta) ficam salvos só no `localStorage` do navegador. "Mais" → "Backup"
  exporta/importa tudo em um `.json`.
- **Dois perfis independentes**: botões "Erick" / "Nayara" no topo do app.
  Cada perfil tem seus próprios dados (medidas, treino, dieta, programa) —
  trocar de perfil não mexe nos dados do outro. Erick usa a trilha padrão
  (já treina); Nayara usa a trilha **iniciante**, com menos exercícios por
  treino e uma dica de execução em cada um (como fazer, erros comuns),
  pensada pra quem nunca treinou.
- **Hoje**: painel diário com o treino do dia, refeições, água, suplementos,
  progresso até a meta de peso e uma dica que muda todo dia.
- **Treino**: split adaptável (3x a 6x por semana, ou 3x/4x na trilha
  iniciante) que se ajusta sozinho — se um dia é pulado, o próximo treino
  continua de onde parou, sem perder o ciclo. Inclui modo "expresso" (só os
  exercícios essenciais) pra quando o tempo aperta, finisher de cardio
  embutido no treino da semana (já que cardio separado é difícil de
  encaixar), e sugestão de carga por progressão a partir do histórico de
  cada exercício.
- **Programa até fevereiro**: macrociclo de ~22 semanas dividido em blocos
  (hipertrofia, força/definição, definição metabólica, deload) com datas
  calculadas a partir de hoje. Cada bloco diz a faixa de reps, o descanso e
  a regra de progressão de carga daquela fase, e avisa quantos dias faltam
  pra trocar de bloco — sem precisar reconfigurar nada manualmente.
- **Dieta**: Erick vem com o plano de 1.900 kcal combinado pré-carregado;
  Nayara começa com um modelo em branco. Os dois editáveis refeição por
  refeição direto no app.
- **Medidas**: histórico de peso e medidas corporais com gráfico de evolução.
- **PWA**: `treino/manifest.json` e `treino/sw.js` deixam instalável no
  celular, com scope próprio (`/treino/`), sem interferir no SERVE.

### Publicar o FORJA como site separado do SERVE

O FORJA e o SERVE são dois produtos diferentes que só compartilham o mesmo
repositório Git — cada um pode virar um site Netlify próprio, com domínio
`.netlify.app` próprio, sem misturar um com o outro:

1. Em [app.netlify.com](https://app.netlify.com), "Add new site" → "Import
   an existing project" → escolha o mesmo repositório (`erickgenarthe/VK`)
   de novo — dá pra importar o mesmo repositório mais de uma vez, cada
   importação vira um site separado.
2. Nas configurações de build dessa nova importação, defina **Base
   directory** como `treino`. O `treino/netlify.toml` já cuida do resto
   (publica a própria pasta como raiz do site).
3. Deploy. Esse site novo mostra o FORJA direto na raiz (`/`), sem precisar
   do caminho `/treino/` e sem depender do site do SERVE.
4. (Opcional) Troque o nome do site em "Site settings" → "Change site name"
   pra algo como `forja-erick.netlify.app`.

O site do SERVE que já existe continua exatamente como está — publicar o
FORJA separado não mexe nele.

Pra só testar rapidinho sem publicar nada: abra `treino/index.html` direto
no navegador.

## Despertas — devocional do grupo de crescimento (`devocional/`)

Um terceiro app, independente do SERVE e do FORJA, guardado na pasta
`devocional/`. Resolve um problema de quem lidera um grupo de crescimento:
dar continuidade, de segunda a sexta, ao estudo que você ensinou no domingo
— no estilo do plano de leitura do app Bíblia (YouVersion).

- **Você adiciona o estudo, a IA escreve a semana**: em "Mais" → "Estudos da
  semana" → "+ Nova semana", cole o título e as anotações do que você
  ensinou. O botão "✨ Gerar com IA" chama uma função do Netlify que usa a
  API da Anthropic (Claude) pra escrever 5 devocionais (segunda a sexta),
  cada um com versículo, reflexão, pergunta pra compartilhar no grupo e uma
  oração — sempre revisáveis (e editáveis campo a campo) antes de publicar.
  Sem a IA configurada, ou se preferir escrever você mesmo, o botão
  "✍️ Escrever manualmente" abre os 5 dias em branco pra preencher na mão.
- **Check-in e comentário por dia**: cada pessoa do grupo marca "Concluído"
  no dia que fez o devocional e pode comentar o que aquele dia falou com
  ela — os comentários e o check-in são vistos por todo o grupo.
- **Aba "Grupo"**: mostra, pra cada pessoa, quais dos 5 dias da semana ela já
  concluiu — accountability leve, sem virar ranking nem gamificação.
- **Liderança compartilhável**: a primeira pessoa que se cadastra vira
  líder automaticamente (igual ao SERVE); qualquer líder pode promover
  outra pessoa do grupo a líder também, na aba "Grupo".
- **Modo demonstração**: sem configurar nada, o app já funciona salvando os
  dados no navegador (`localStorage`) — inclusive a geração de devocional
  cai pro preenchimento manual sem a função de IA configurada.

### Publicar o Despertas de verdade

1. **Firebase** (banco compartilhado do grupo): mesmo passo a passo do
   SERVE — crie um projeto grátis em [firebase.google.com](https://firebase.google.com),
   ative Firestore (produção) e Authentication → "E-mail/senha", e cole o
   `firebaseConfig` no início do `devocional/index.html` (procure por
   `COLE_AQUI`). Pode ser um projeto Firebase novo, só pro Despertas.
2. **IA (opcional, mas é o que torna a geração automática)**: no painel do
   Netlify do site do Despertas, em "Site settings" → "Environment
   variables", adicione `ANTHROPIC_API_KEY` com uma chave da
   [console.anthropic.com](https://console.anthropic.com). Sem essa
   variável, o botão "Gerar com IA" mostra um aviso e o líder escreve os
   dias manualmente — o resto do app funciona normalmente.
3. **Netlify**: igual ao FORJA — dá pra importar o mesmo repositório
   (`erickgenarthe/VK`) de novo em [app.netlify.com](https://app.netlify.com),
   "Add new site" → "Import an existing project", e definir **Base
   directory** como `devocional`. Esse site novo mostra o Despertas direto
   na raiz (`/`), sem depender do SERVE nem do FORJA.

Pra só testar rapidinho sem publicar nada: abra `devocional/index.html`
direto no navegador (ou `python3 -m http.server` na pasta).

## Limitações conhecidas (é um MVP, não um produto de 5 anos de estrada)

- A exportação (Excel/PDF) sempre pega o mês do seletor em "Configurações" —
  não dá pra exportar vários meses de uma vez ainda.
- O QR de check-in prova que o celular do voluntário "viu" a tela da
  portaria naquele dia — não é uma trava de segurança forte, é uma
  conveniência pra evitar check-in de outro dia por engano.
- As regras de segurança do Firestore sugeridas acima são o ponto de
  partida mais simples (qualquer pessoa autenticada lê/escreve tudo); pra
  uma operação maior, vale restringir por papel/coleção.
