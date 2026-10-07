# Outubro da Criança — o que doar

Site para a campanha de doações: o QR Code aparece no telão do culto, a pessoa
escolhe o que quer doar, deixa nome e WhatsApp, e você vê tudo no painel.

| Página | Para quê |
|---|---|
| `index.html` | O que o celular da pessoa abre (escolhe o item, deixa nome e WhatsApp, comemora). |
| `telao.html` | Projetar no telão: QR Code grande, a sala ao vivo, o contador por item e o aviso "Mais uma doação chegou!" (sem nome) a cada doação. |
| `admin.html` | Painel só seu: lista, filtros por item/situação, botão "Chamar no WhatsApp" com mensagem pronta, CSV. |

O centro do site é a sala "Brinquedos para o VK" (frase: *Cada doação vira um brinquedo para o nosso VK*). Cada item doado cai na sala e ganha vida (carrinhos andam, dinossauros passeiam, bolas quicam, bonecos pulam). Não há limite: quanto mais doações, mais cheia a sala, e os brinquedos encolhem para caber. No telão há ainda um contador por item (mostra o que mais está chegando) e uma comemoração a cada 50 doações (`MARCO` em `telao.html`).

**Fotos reais:** as ilustrações são desenhos próprios. Para usar fotos, ponha PNGs com fundo transparente em `img/itens/` e liste em `FOTOS` no topo de `doar.js` (ex.: `{ dinos: 'img/itens/dinos.png' }`). Use só imagens que você tenha direito de usar (suas ou de licença livre).

Tatames e abafadores/cubos infinitos ficaram de fora (estavam riscados na lista). Para mudar os itens, edite `ITENS` no topo de `doar.js`.

## Testar agora
`cd doar && python3 -m http.server`, abra `/telao.html` numa aba e `/index.html` em outra. Sem Firebase o site roda em modo demonstração (dados só no navegador). No telão, a tecla **T** simula uma doação.

## Publicar (Netlify) e ligar o banco (Firebase)
1. Netlify → novo site a partir deste repositório, **Base directory = `doar`**. O QR do telão aponta sozinho para o endereço do site.
2. Crie um projeto Firebase **só para este site** (as regras abertas do SERVE deixariam qualquer voluntário ler os telefones). Ative o Firestore e o Authentication (e-mail/senha), crie o seu usuário e **desative novos cadastros**.
3. Cole o `firebaseConfig` no topo de `doar.js`.
4. Cole `firestore.rules` nas regras do Firestore e troque `SEU_EMAIL@exemplo.com` pelo seu e-mail.
5. Abra `/telao` no culto e `/admin` quando quiser ver e chamar as pessoas.

Privacidade: o telão e a página pública mostram só números (total de doações e quantos de cada item), nunca nomes. Nome e telefone ficam só na coleção `doacoes`, legível apenas pelo e-mail administrador. A única tela com nome é a de agradecimento no celular da própria pessoa.
