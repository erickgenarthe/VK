// Despertas — gera os 5 devocionais da semana (segunda a sexta) a partir do
// estudo que o líder ensinou no domingo, chamando a API da Anthropic
// (Claude). Sem a variável ANTHROPIC_API_KEY configurada no Netlify, esta
// função responde com erro e o app cai automaticamente pro preenchimento
// manual — ver README.md. De propósito sem nenhuma dependência do npm
// (só fetch, que já vem pronto no Node 18+ do Netlify).

function diasUteis(segundaISO) {
  const [ano, mes, dia] = segundaISO.split('-').map(Number);
  const base = new Date(ano, mes - 1, dia);
  const out = [];
  for (let i = 0; i < 5; i++) {
    const d = new Date(base);
    d.setDate(base.getDate() + i);
    out.push(d.getFullYear() + '-' + String(d.getMonth() + 1).padStart(2, '0') + '-' + String(d.getDate()).padStart(2, '0'));
  }
  return out;
}

function json(obj, status) {
  return new Response(JSON.stringify(obj), { status: status || 200, headers: { 'content-type': 'application/json' } });
}

const FERRAMENTA = {
  name: 'definir_semana',
  description: 'Define os 5 devocionais diários (segunda a sexta) derivados do estudo do grupo de crescimento.',
  input_schema: {
    type: 'object',
    properties: {
      dias: {
        type: 'array',
        minItems: 5,
        maxItems: 5,
        items: {
          type: 'object',
          properties: {
            titulo: { type: 'string', description: 'Título curto do devocional do dia' },
            referencia: { type: 'string', description: 'Referência bíblica do versículo-base, ex: "João 3:16"' },
            versiculo: { type: 'string', description: 'Texto do versículo-base do dia' },
            texto: { type: 'string', description: 'Reflexão devocional (3 a 5 parágrafos curtos), tom acolhedor e pastoral' },
            pergunta: { type: 'string', description: 'Pergunta pra compartilhar/discutir no grupo' },
            oracao: { type: 'string', description: 'Oração curta de encerramento' },
          },
          required: ['titulo', 'referencia', 'versiculo', 'texto', 'pergunta', 'oracao'],
        },
      },
    },
    required: ['dias'],
  },
};

const SYSTEM_PROMPT = 'Você escreve devocionais diários para um pequeno grupo de crescimento de igreja, no estilo do plano de leitura do aplicativo Bíblia (YouVersion): linguagem acolhedora, direta e prática, sem jargão teológico complicado. A partir do estudo que o líder ensinou no domingo, crie 5 devocionais (segunda a sexta) que aprofundem o mesmo tema ao longo da semana, cada um com um ângulo diferente e progredindo em profundidade, terminando com uma pergunta pra compartilhar no grupo e uma oração curta. Escreva em português do Brasil, em segunda pessoa, de forma acolhedora e nunca condescendente. Cite os versículos com o melhor da sua memória, mas isso pode não ser 100% preciso — o líder vai revisar antes de publicar.';

export default async (req) => {
  if (req.method !== 'POST') return json({ erro: 'Método não permitido.' }, 405);

  let body;
  try {
    body = await req.json();
  } catch (e) {
    return json({ erro: 'JSON inválido.' }, 400);
  }

  const titulo = (body.titulo || '').trim();
  const texto = (body.texto || '').trim();
  const dataInicioISO = body.dataInicioISO || '';
  if (!titulo || !texto) return json({ erro: 'Preencha o título e o conteúdo do estudo.' }, 400);
  if (!/^\d{4}-\d{2}-\d{2}$/.test(dataInicioISO)) return json({ erro: 'Data de início inválida.' }, 400);

  const apiKey = process.env.ANTHROPIC_API_KEY;
  if (!apiKey) return json({ erro: 'ANTHROPIC_API_KEY não configurada no Netlify — veja o README.' }, 500);

  const datas = diasUteis(dataInicioISO);
  const userMsg = 'Estudo da semana: "' + titulo + '"\n\nConteúdo/anotações do estudo:\n' + texto;

  let res, data;
  try {
    res = await fetch('https://api.anthropic.com/v1/messages', {
      method: 'POST',
      headers: {
        'content-type': 'application/json',
        'x-api-key': apiKey,
        'anthropic-version': '2023-06-01',
      },
      body: JSON.stringify({
        model: 'claude-sonnet-5',
        max_tokens: 4000,
        system: SYSTEM_PROMPT,
        messages: [{ role: 'user', content: userMsg }],
        tools: [FERRAMENTA],
        tool_choice: { type: 'tool', name: 'definir_semana' },
      }),
    });
    data = await res.json();
  } catch (e) {
    return json({ erro: 'Falha ao falar com a IA: ' + e.message }, 502);
  }
  if (!res.ok) return json({ erro: 'A IA recusou o pedido: ' + (data?.error?.message || res.status) }, 502);

  const usoFerramenta = (data.content || []).find((b) => b.type === 'tool_use' && b.name === 'definir_semana');
  if (!usoFerramenta || !Array.isArray(usoFerramenta.input?.dias) || usoFerramenta.input.dias.length !== 5) {
    return json({ erro: 'A IA não retornou os 5 dias esperados. Tente gerar de novo.' }, 502);
  }

  const dias = usoFerramenta.input.dias.map((d, i) => ({
    data: datas[i],
    titulo: String(d.titulo || ''),
    referencia: String(d.referencia || ''),
    versiculo: String(d.versiculo || ''),
    texto: String(d.texto || ''),
    pergunta: String(d.pergunta || ''),
    oracao: String(d.oracao || ''),
  }));

  return json({ dias });
};
