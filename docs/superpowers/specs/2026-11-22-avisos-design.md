# AVISOS — app secundário de mensagens semanais (Videira Kids)

## Intenção
Toda semana a liderança gera escalas (terça: QDE; quinta a sábado: domingo, 4 cultos 9h/11h/17h/19h) e precisa mandá-las nos grupos de WhatsApp, cobrar supervisores e avisar a equipe. AVISOS deixa tudo pronto para copiar/colar.

## Metas
- Mensagens prontas: escala QDE, escala de domingo (❌ nas vagas zeradas), cobranças ao supervisor (primeiro pedido, lembrete, aviso com quantidade na sala, vaga aberta, agradecimento, confirmação), palavra da semana (versículo + sabedoria), planner da semana.
- Importar escala colada do WhatsApp.
- Contatos de supervisores/líderes cadastráveis depois.

## Não-metas
- Envio automático a grupos (WhatsApp não permite); integração Firebase/SERVE.

## Restrições
- SERVE está em modo demonstração (localStorage, origem própria): app independente, dados próprios, backup JSON.
- Arquivo único, sem build, PWA, pt-BR, identidade SERVE (verde/coral).

## Abordagens
A) App independente em `avisos/` (escolhida). B) Firebase agora (exige config). C) Aba dentro do SERVE (foge do pedido).

## Decisões
Telas: Semana, Escalas, Cobranças, Palavra, Planner, Contatos (+Backup). Copiar e "Abrir no WhatsApp" (wa.me). ~52 versículos/sabedorias embutidos e editáveis; data do domingo calculada.
