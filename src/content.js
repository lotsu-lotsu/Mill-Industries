/* =========================================================================
   MILL INDÚSTRIAS — Menu, planejamento de ponta a ponta e seletor de lâminas
   Os textos institucionais (banners, quem somos, razões, blog, pós-venda)
   estão direto no index.html, copiados do site atual em 17/11/2026.
   ========================================================================= */

/* Planejamento de ponta a ponta: etapas da serraria e os equipamentos de cada uma */
const STEPS = [
  ['Entrada e classificação', 'Recebimento, medição e separação das toras por diâmetro e comprimento, com registro de volume e produção diária.', ['classificador-de-toras', 'esteiras']],
  ['Desdobro principal', 'Os primeiros cortes que transformam a tora em bloco: base reta, costaneiras retiradas e bloco no esquadro.', ['serra-fita-1o-corte', 'serra-fita-bloco', 'serra-fita-vertical-geminada', 'serra-fita-geminada-com-terceiro-corte', 'serra-circular-bloqueadeira']],
  ['Desdobro secundário', 'Blocos e semiblocos fatiados em tábuas, com 1 a 12 cabeçotes em linha e corte fino para alto aproveitamento.', ['serra-fita-horizontal', 'serra-fita-horizontal-com-duas-esteiras', 'serra-fita-horizontal-compact-line', 'serra-circular-multipla', 'painel-split', 'serra-fita-horizontal-angulo']],
  ['Aproveitamento e resíduos', 'Refilo, destopo e reaproveitamento das sobras: costaneiras e resíduos viram cavaco para biocombustível.', ['refilador', 'destopador', 'dogueira', 'picador', 'separador-de-serragem', 'limpador-de-serragem']],
  ['Tratamento e gradeamento', 'Imunização em banho contínuo e formação automática dos pacotes, com registro de produção.', ['imunizador-de-madeira', 'gradeador-manual', 'gradeador-compact', 'gradeador-de-garfos', 'gradeador-de-gaveta', 'desgradeador']],
  ['Secagem', 'Secagem contínua com piso móvel: mais produção que estufas convencionais, com menos energia.', ['tunel-de-secagem']],
  ['Afiação das serras', 'Afiar, travar e medir com precisão: lâminas que duram mais e cortam melhor.', ['afiadeira-de-serras', 'travadeira-de-serras', 'medidor-de-travas-de-serras']]
];

/* Seletor técnico de lâminas: [aplicação, lâmina indicada, dente, alternativa] */
const FINDER = {
  alimentos: [
    ['Carnes com muito osso (costela, paleta, pernil)', 'meat-blade-corte-leve', '4 TPI', 'meat-blade-corte-pesado'],
    ['Cortes finos e rápidos, com ou sem osso', 'meat-blade-corte-leve', '6 TPI'],
    ['Alta produção e cortes pesados', 'meat-blade-corte-pesado', '4 TPI'],
    ['Carcaça de suínos e ovinos', 'meat-blade-carcaca-5-8', '3 TPI'],
    ['Carcaça de bovinos e bubalinos', 'meat-blade-carcaca-3-4', '3 TPI'],
    ['Carnes e pescados congelados (até −20 °C)', 'meat-blade-congelado-5-8', '3 TPI', 'meat-blade-congelado-3-4'],
    ['Máxima exigência sanitária (lavável, sem oxidação)', 'laminas-inox', 'Inox'],
    ['Corte manual com arco de serra', 'lamina-arco-de-serra', 'Manual']
  ],
  marcenaria: [
    ['Curvas e retos com alto acabamento', 'wood-blade-marcenaria-3-8', '4 TPI', 'wood-blade-marcenaria-1-2'],
    ['Curvas pesadas, com mais resistência', 'wood-blade-marcenaria-1-2', '3 TPI', 'wood-blade-marcenaria-5-8'],
    ['Chapas e painéis em CNC ou automáticos', 'wood-blade-marcenaria-5-8', '4 TPI', 'wood-blade-marcenaria-3-4'],
    ['Madeira sólida, pallets com grampos, madeira seca e colada', 'wood-blade-marcenaria-1-1-4', '3 TPI']
  ],
  madeira: [
    ['Pinus e madeiras macias', 'wood-blade-madeira-1-1-4-090', 'Passo 20 mm'],
    ['Pinus e eucalipto, cortes maiores', 'wood-blade-madeira-1-1-4-110', 'Passo 20 mm'],
    ['Tábuas pesadas de pinus, eucalipto e teca', 'wood-blade-madeira-2', 'Passo 20 mm'],
    ['Toras de maior diâmetro', 'wood-blade-madeira-2-1-2', 'Passo 22 mm'],
    ['Madeira dura e abrasiva', 'wood-blade-bi-metalica', 'Passo 22 mm', 'wood-blade-estiletada'],
    ['Madeira seca e abertura de painéis', 'wood-blade-estiletada', 'Estiletado'],
    ['Laminação e serras largas', 'wood-blade-serra-larga', 'Passo 35 a 55 mm']
  ]
};

/* Menu principal (desktop e celular): [link, título, descrição, ícone] */
const NAV = [
  { k: 'serras', label: 'Mill Serras', href: '#/mill-serras', groups: [
      { h: 'Serras por aplicação', items: [
        ['#/mill-serras/alimentos', 'Serras para alimentos', 'Carnes com e sem osso, carcaças e congelados', 'meat'],
        ['#/mill-serras/marcenaria', 'Serras para marcenaria', 'Cortes em curva e retos, chapas e painéis', 'saw'],
        ['#/mill-serras/madeira', 'Serras para madeira', 'Pinus, eucalipto e teca na serraria', 'log']] },
      { h: 'Para escolher a lâmina', items: [
        ['#/mill-serras/seletor', 'Seletor técnico de lâminas', 'Indique o corte e veja a lâmina indicada', 'target'],
        ['#/mill-serras/tecnologia', 'Tecnologia Mill', 'Travas, passo, têmpera, aço e emenda', 'blade'],
        ['#/representantes/alimentos', 'Revendas de serras', 'Representantes por estado', 'pin']] }],
    promo: { img: 'p-202405-bimetalica01.webp', s: 'Mill Serras', t: 'Ver todas as lâminas', href: '#/mill-serras', photo: true } },
  { k: 'maquinas', label: 'Mill Máquinas', href: '#/mill-maquinas', groups: [
      { h: 'Equipamentos', cols: 2, items: [
        ['#/mill-maquinas/serraria', 'Serraria', 'Desdobro, refilo, destopo e resíduos', 'saw'],
        ['#/mill-maquinas/classificador', 'Classificação', 'Classificador de toras', 'log'],
        ['#/mill-maquinas/afiacao', 'Afiação', 'Afiar, travar e medir as lâminas', 'blade'],
        ['#/mill-maquinas/gradeamento', 'Gradeamento', 'Gradeadores e desgradeador', 'grid'],
        ['#/mill-maquinas/secagem', 'Secagem', 'Túnel de secagem com piso móvel', 'heat'],
        ['#/mill-maquinas/linhas', 'Linhas completas', 'Serrarias para pinus e eucalipto', 'layers']] },
      { h: 'Projetos', items: [
        ['#/mill-maquinas/ponta-a-ponta', 'Planejamento de ponta a ponta', 'Da entrada de toras à secagem', 'route'],
        ['#/orcamento/maquinas', 'Solicitar projeto', 'Fale com o time de máquinas', 'chat']] }],
    promo: { img: 'p-202406-62-1.webp', s: 'Mill Máquinas', t: 'Ver todas as máquinas', href: '#/mill-maquinas' } },
  { k: 'posvenda', label: 'Pós-venda', href: '#/pos-venda', groups: [
      { h: 'Depois da entrega', items: [
        ['#/pos-venda/pecas', 'Peças de reposição', 'Componentes originais Mill', 'part'],
        ['#/pos-venda/assistencia', 'Assistência autorizada', 'Suporte técnico, manutenção e montagem', 'wrench'],
        ['#/pos-venda/treinamentos', 'Treinamentos', 'Operadores e equipes técnicas', 'cap'],
        ['#/orcamento/assistencia', 'Abrir chamado técnico', 'Atendimento do pós-venda', 'chat']] }],
    promo: { img: 'p-202411-volante-de-serrras.webp', s: 'Pós-venda', t: 'Peças originais Mill', href: '#/pos-venda/pecas' } },
  { k: 'reps', label: 'Representantes', href: '#/representantes', groups: [
      { h: 'Revendas e representantes', items: [
        ['#/representantes/alimentos', 'Serras para alimentos', '', 'meat'],
        ['#/representantes/marcenaria', 'Serras para marcenaria', '', 'saw'],
        ['#/representantes/madeira', 'Serras para madeira', '', 'log'],
        ['#/representantes/maquinas', 'Máquinas e equipamentos', '', 'gear'],
        ['#/representantes/internacional', 'Atendimento internacional', 'Argentina, Colômbia, Equador e outros', 'globe']] },
      { h: 'Parcerias', items: [
        ['#/orcamento/representante', 'Quero ser representante', 'Fale com o comercial da Mill', 'handshake']] }] },
  { k: 'sobre', label: 'Institucional', href: '#/sobre', groups: [
      { h: 'A Mill', items: [
        ['#/sobre', 'Sobre nós', 'Desde 1996 em Lages/SC', 'factory'],
        ['#/sobre/video', 'Vídeo institucional', 'Conheça a fábrica', 'play'],
        ['#/inicio/razoes', 'Razões para escolher a Mill', '', 'shield'],
        ['#/inicio/blog', 'Blog', 'Automação, manutenção e segurança', 'doc']] },
      { h: 'Para você', items: [
        ['#/sobre/trabalhe-conosco', 'Trabalhe conosco', 'Áreas administrativa e industrial', 'user'],
        ['#/sobre/transparencia', 'Transparência', 'Relatórios de igualdade salarial', 'doc'],
        ['#/contato', 'Fale conosco', 'Telefone, WhatsApp e e-mail', 'mail']] }] },
  { k: 'contato', label: 'Contato', href: '#/contato' }
];
