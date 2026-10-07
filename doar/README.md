# Outubro da Criança — o que doar

Site para a campanha de doações: o QR Code aparece no telão do culto, a pessoa
escolhe o que quer doar, deixa nome e WhatsApp, e você vê tudo no painel.

| Página | Para quê |
|---|---|
| `index.html` | O que o celular da pessoa abre (escolhe o item, deixa nome e WhatsApp, comemora). |
| `telao.html` | Projetar no telão: QR Code grande, o cubo de blocos que se enche de brinquedos e o aviso "Maria colocou no cubo: Pufes" a cada doação. |
| `admin.html` | Painel só seu: lista, filtros por item/situação, botão "Chamar no WhatsApp" com mensagem pronta, CSV. |

O centro do site é o **Cubo de Doações**: cada doação solta no cubo o brinquedo escolhido (ilustrações próprias, sem emojis). Quando junta 50 (`metaInicial` em `doar.js`), o cubo comemora, esvazia e começa o próximo. Tocando no cubo, os brinquedos pulam.

Tatames e abafadores/cubos infinitos ficaram de fora (estavam riscados na lista). Para mudar os itens, edite `ITENS` no topo de `doar.js`.

## Testar agora
`cd doar && python3 -m http.server`, abra `/telao.html` numa aba e `/index.html` em outra. Sem Firebase o site roda em modo demonstração (dados só no navegador). No telão, a tecla **T** simula uma doação.

## Publicar (Netlify) e ligar o banco (Firebase)
1. Netlify → novo site a partir deste repositório, **Base directory = `doar`**. O QR do telão aponta sozinho para o endereço do site.
2. Crie um projeto Firebase **só para este site** (as regras abertas do SERVE deixariam qualquer voluntário ler os telefones). Ative o Firestore e o Authentication (e-mail/senha), crie o seu usuário e **desative novos cadastros**.
3. Cole o `firebaseConfig` no topo de `doar.js`.
4. Cole `firestore.rules` nas regras do Firestore e troque `SEU_EMAIL@exemplo.com` pelo seu e-mail.
5. Abra `/telao` no culto e `/admin` quando quiser ver e chamar as pessoas.

Privacidade: o telão mostra só o primeiro nome e o item. Nome completo e telefone só ficam na coleção `doacoes`, legível apenas pelo e-mail administrador.
