# Site Mill Indústrias

Site novo da Mill Indústrias (Lages/SC): Mill Serras, Mill Máquinas, pós-venda, representantes e institucional.
Página única com rotas por hash (`#/mill-serras/alimentos`, `#/mill-maquinas/secagem`, `#/pos-venda/pecas`, `#/produto/<id>`, `#/orcamento/<tipo>`).

## O que a Vercel publica
`index.html`, `vercel.json`, `assets/` e `fonts/` (o resto fica fora pelo `.vercelignore`).

## Como alterar
1. Edite os arquivos em `src/`:
   - `index.html`: estrutura das páginas
   - `base.css` e `site.css`: visual
   - `data.js`: contatos, WhatsApp por setor, máquinas, lâminas, peças, representantes, avaliações
   - `content.js`: etapas da serraria, seletor técnico e menus
   - `app.js`: menus, rotas, catálogo, animações e orçamento
2. Gere a página: `python3 build.py --raiz` (atualiza `index.html` e `vercel.json` na raiz).
3. Faça o commit: a Vercel publica sozinha.

Outros modos: `python3 build.py` gera um arquivo único com tudo embutido (para aprovar ou mandar por e-mail) e `python3 build.py --pasta` gera `dist/site/`.

## Leads
O orçamento em 3 etapas abre o WhatsApp do setor com prioridade (P1 a P3), código de referência e origem (UTM, gclid, fbclid). Para mandar os leads também para um CRM ou planilha, preencha `CONFIG.webhook` em `src/data.js`.

## Antes de apontar o domínio mill.com.br
- Conferir com a Mill: e-mail de currículos, nota do Google, política de privacidade, IDs de GTM ou Meta Pixel.
- O `vercel.json` só manda `noindex` nos endereços `*.vercel.app`; no domínio próprio o site é indexado normalmente.
