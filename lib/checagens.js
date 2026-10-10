// Checagens locais: não usam IA, não gastam API. Rodam antes do validador.
// Cada checagem devolve { id, ok, critica, msg }. "critica" reprova o artigo sozinha.

export const TERMOS_DE_RISCO = [
  'cura definitiva', 'curar', 'cura garantida', 'emagrece', 'emagreça', 'garantido',
  'diagnóstico', 'diagnosticar', 'você tem', 'dose', 'mg por', 'tome ', 'pare de tomar',
];

const contar = (texto) => texto.split(/\s+/).filter(Boolean).length;

const titulosH2 = (texto) =>
  [...texto.matchAll(/^##\s+(.+)$/gm)].map((m) => m[1].trim().toLowerCase());

export function checar(texto, opcoes = {}) {
  const minPalavras = opcoes.minPalavras ?? 800;
  const maxPalavras = opcoes.maxPalavras ?? 2000;
  const resultados = [];
  const palavras = contar(texto);
  const links = (texto.match(/\]\(https?:\/\/[^)]+\)|https?:\/\/\S+/g) || []).length;
  const h2 = titulosH2(texto);
  const repetidos = h2.filter((t, i) => h2.indexOf(t) !== i);
  const risco = TERMOS_DE_RISCO.filter((t) => texto.toLowerCase().includes(t));

  resultados.push({
    id: 'L1', ok: palavras >= minPalavras && palavras <= maxPalavras, critica: false,
    msg: `${palavras} palavras (faixa ${minPalavras}–${maxPalavras})`,
  });
  resultados.push({
    id: 'L2', ok: links >= 3, critica: false,
    msg: `${links} link(s) de fonte (mínimo 3)`,
  });
  resultados.push({
    id: 'L3', ok: h2.some((t) => t.includes('fonte')), critica: true,
    msg: h2.some((t) => t.includes('fonte')) ? 'seção de Fontes presente' : 'falta seção "Fontes"',
  });
  resultados.push({
    id: 'L4', ok: repetidos.length === 0, critica: false,
    msg: repetidos.length ? `seções repetidas: ${[...new Set(repetidos)].join(', ')}` : 'sem seções repetidas',
  });
  resultados.push({
    id: 'L5', ok: risco.length === 0, critica: true,
    msg: risco.length ? `termos de risco: ${risco.join(', ')}` : 'sem termos de risco de saúde',
  });
  resultados.push({
    id: 'L6', ok: true, critica: false,
    msg: h2.some((t) => t.includes('resumindo')) ? 'tem seção "Resumindo" (opcional segundo a diretriz)' : 'sem seção "Resumindo"',
  });

  return { palavras, links, resultados, reprovadoLocal: resultados.some((r) => r.critica && !r.ok) };
}
