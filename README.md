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
familias/                         → "Central de Famílias" do ministério infantil, veja abaixo
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

## Central de Famílias — banco de dados do ministério infantil (`familias/`)

Um terceiro app, independente do SERVE, para o ministério infantil ter **um só
lugar** com todas as famílias cadastradas no MyKids: quem são os
responsáveis, quais crianças, idade, turma, alergias, telefone, quem
precisa de um contato. Mesmo visual do SERVE, mesma ideia: um `index.html`
sem build.

- **Importa o PDF do MyKids direto.** Em "Mais" → "Importar do MyKids",
  solte o *Relatório de Famílias Com Seus Integrantes* (PDF). O app lê as
  famílias, crianças e responsáveis (nome, nascimento, sexo, telefone,
  e-mail e ID do MyKids) no próprio aparelho — o arquivo não é enviado a
  ninguém. Antes de gravar, mostra o que é novo, o que muda e quantos
  cadastros repetidos serão unificados; depois dá para **desfazer**.
  Importar de novo (relatório atualizado) só acrescenta/atualiza, sem
  apagar alergias, notas ou presenças que você já registrou.
  *Dica:* use o PDF, não o Excel do mesmo relatório — o Excel vem sem
  data de nascimento, telefone e e-mail.
- **Também aceita CSV/Excel** próprios, com reconhecimento automático das
  colunas (e você ajusta o que estiver errado).
- **Busca de balcão**: digite nome da criança, do responsável, final do
  telefone ou ID do MyKids; a ficha mostra alergias e cuidados em vermelho.
- **Ficha da família**: contatos com WhatsApp/ligar em um toque, crianças com
  turma automática pela idade, alergias/medicação/necessidades especiais,
  autorização de foto, autorizados a buscar, histórico de anotações.
- **Cuidar**: fila de quem merece uma mensagem hoje (visitante novo,
  aniversariante, família ausente) com texto pronto para o WhatsApp; o
  contato fica registrado na ficha.
- **Presença de hoje** (alimenta o aviso de ausência), **turmas** com
  **ficha de sala em PDF** (alergias em destaque), **aniversariantes**.
- **Limpeza de dados**: % de cadastros prontos para contato, famílias sem
  responsável/telefone e **possíveis duplicadas** (com mesclagem).
- **Exportar**: Excel, CSV, PDF e backup `.json`. **PIN** opcional de bloqueio.
- **Dados**: ficam no `localStorage` do aparelho. Para compartilhar entre
  vários líderes, preencha o `firebaseConfig` no topo de `familias/index.html`
  (mesmo passo a passo do SERVE; aqui o acesso é só por login, as contas
  são criadas por você no console do Firebase — não há cadastro aberto, e as
  regras do Firestore devem exigir `request.auth != null`). **A sincronização
  com o Firebase ainda não foi testada contra um projeto real.**

> **Privacidade (LGPD):** isto guarda dados de crianças. Nunca coloque o PDF/Excel
> do MyKids no repositório (o `.gitignore` já bloqueia `*.pdf`, `*.xlsx`,
> `*.csv`, `*.zip`), use o PIN, e dê acesso só a quem serve no ministério infantil.

Para publicar como site próprio no Netlify, siga os mesmos passos do FORJA com
**Base directory** = `familias`. Para só testar: abra `familias/index.html`
no navegador e use "Ver com famílias de exemplo".

## Limitações conhecidas (é um MVP, não um produto de 5 anos de estrada)

- A exportação (Excel/PDF) sempre pega o mês do seletor em "Configurações" —
  não dá pra exportar vários meses de uma vez ainda.
- O QR de check-in prova que o celular do voluntário "viu" a tela da
  portaria naquele dia — não é uma trava de segurança forte, é uma
  conveniência pra evitar check-in de outro dia por engano.
- As regras de segurança do Firestore sugeridas acima são o ponto de
  partida mais simples (qualquer pessoa autenticada lê/escreve tudo); pra
  uma operação maior, vale restringir por papel/coleção.
