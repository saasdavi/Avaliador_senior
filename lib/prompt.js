// Prompt do validador com IA. Junta os critérios que os blogs já usavam
// (Saúde 40+ V1–V7, Mente Curiosa V1–V8) com as diretrizes de conteúdo útil do Google (E-E-A-T).

export const CRITERIOS = [
  { id: 'C1', nome: 'Fatos sustentados pelas fontes', critico: true, origem: 'blogs V1' },
  { id: 'C2', nome: 'Fontes pertinentes e confiáveis', critico: true, origem: 'blogs V2' },
  { id: 'C3', nome: 'Segurança (sem diagnóstico, dose ou promessa de cura)', critico: true, origem: 'Saúde 40+ V6' },
  { id: 'C4', nome: 'Resposta direta no início', critico: false, origem: 'blogs V3' },
  { id: 'C5', nome: 'Cada seção ensina algo, sem enchimento', critico: false, origem: 'blogs V4' },
  { id: 'C6', nome: 'Sem marca ou venda', critico: false, origem: 'Saúde 40+ V7' },
  { id: 'C7', nome: 'Experiência ou exemplo prático do próprio autor', critico: false, origem: 'Google E-E-A-T' },
  { id: 'C8', nome: 'Exemplos e ferramentas reais e atuais, quando o tema pede', critico: false, origem: 'Google conteúdo útil' },
  { id: 'C9', nome: 'Sem blocos repetidos nem texto de preenchimento', critico: false, origem: 'Google spam de conteúdo' },
  { id: 'C10', nome: 'Tom humano e natural (só sugestão)', critico: false, origem: 'blogs V5' },
];

export function montarPrompt({ texto, fontes = [] }) {
  const lista = CRITERIOS.map((c) => `${c.id} ${c.nome}${c.critico ? ' (CRÍTICO: reprova se falhar)' : ''}`).join('\n');
  return `Você é o avaliador de artigos. Não reescreva o texto. Avalie e devolva motivos objetivos.

CRITÉRIOS:
${lista}

REGRAS:
- DEVOLVER somente se algum critério CRÍTICO falhar, ou se houver afirmação específica (número, estudo, nome, data) sem apoio nas fontes.
- Critérios não críticos geram sugestão, não reprovação.
- Links internos do próprio site não contam como fonte.
- Se a seção "Resumindo" existir, não a critique.

TEXTO DO ARTIGO:
${texto}

${fontes.length ? `TRECHOS DAS FONTES (única base factual):\n${fontes.join('\n\n---\n\n')}\n` : ''}
Responda SOMENTE com JSON válido, sem texto antes ou depois, neste formato:
{"nota": 0-100, "decisao": "APROVADO"|"DEVOLVER", "criterios": [{"id":"C1","ok":true|false,"motivo":"..."}], "sugestoes": ["..."]}`;
}
