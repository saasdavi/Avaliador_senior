// Função serverless (Vercel). Recebe o artigo e devolve as checagens locais + a avaliação com IA.
// Variáveis de ambiente: ANTHROPIC_API_KEY (obrigatória), ANTHROPIC_MODEL (obrigatória), NOTA_MINIMA (padrão 90, escala de 0 a 100).
import { checar } from '../lib/checagens.js';
import { montarPrompt } from '../lib/prompt.js';

const LIMITE_TEXTO = 40000;

export default async function handler(req, res) {
  if (req.method !== 'POST') return res.status(405).json({ erro: 'Use POST' });

  const texto = String(req.body?.texto || '').trim();
  const modo = req.body?.modo === 'local' ? 'local' : 'completo';
  if (!texto) return res.status(400).json({ erro: 'Cole o texto do artigo' });
  if (texto.length > LIMITE_TEXTO) return res.status(413).json({ erro: 'Texto grande demais' });

  const local = checar(texto);
  const notaMinima = Number(process.env.NOTA_MINIMA || 90);

  if (modo === 'local' || local.reprovadoLocal) {
    return res.json({
      modo,
      decisao: local.reprovadoLocal ? 'DEVOLVER' : 'SEM_IA',
      local,
      ia: null,
    });
  }

  const chave = process.env.ANTHROPIC_API_KEY;
  const modelo = process.env.ANTHROPIC_MODEL;
  if (!chave || !modelo) return res.status(500).json({ erro: 'Configuração da IA ausente no servidor' });

  try {
    const r = await fetch('https://api.anthropic.com/v1/messages', {
      method: 'POST',
      headers: { 'content-type': 'application/json', 'x-api-key': chave, 'anthropic-version': '2023-06-01' },
      body: JSON.stringify({
        model: modelo,
        max_tokens: 2000,
        messages: [{ role: 'user', content: montarPrompt({ texto }) }],
      }),
    });
    if (!r.ok) return res.status(502).json({ erro: `IA respondeu ${r.status}` });
    const dados = await r.json();
    const bruto = dados.content?.map((b) => b.text || '').join('') || '';
    const m = bruto.match(/\{[\s\S]*\}/);
    const ia = m ? JSON.parse(m[0]) : null;
    if (!ia) return res.status(502).json({ erro: 'IA devolveu resposta fora do formato' });

    const aprovado = ia.decisao === 'APROVADO' && Number(ia.nota) >= notaMinima;
    return res.json({
      modo,
      decisao: aprovado ? 'APROVADO' : 'DEVOLVER',
      notaMinima,
      local,
      ia,
    });
  } catch (e) {
    return res.status(500).json({ erro: 'Falha ao avaliar: ' + e.message });
  }
}
