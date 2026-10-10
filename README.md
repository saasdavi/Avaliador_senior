# Avaliador de artigos

Mini site para colar um artigo e receber as checagens locais e a nota do validador com IA.

## Como funciona
- `index.html`: página com a caixa de texto.
- `api/avaliar.js`: função serverless (Vercel). Roda as checagens e, no modo completo, chama o Claude.
- `lib/checagens.js`: checagens sem IA (palavras, links, seção Fontes, seções repetidas, termos de risco).
- `lib/prompt.js`: critérios do validador (blogs V1–V7/V8 + diretrizes de conteúdo útil do Google).

## Publicar na Vercel
1. Importar o repositório na Vercel (sem build; é um site estático com funções em `api/`).
2. Em Settings → Environment Variables:
   - `ANTHROPIC_API_KEY`: a chave da API (nunca no código).
   - `ANTHROPIC_MODEL`: o modelo a usar.
   - `NOTA_MINIMA` (opcional, padrão 90, escala de 0 a 100).
3. Em Settings → Domains, adicionar o domínio escolhido.

## Limites
- A nota da IA é uma avaliação, não garantia de aprovação no Google ou no AdSense.
- Uso local (sem IA) não gasta API.
