# 🍞 PADARIA ARTESANAL — FLUXO DE CAIXA PWA
## Especificação Técnica Completa para Agente de Desenvolvimento

**Versão:** 1.0  
**Data:** Maio 2026  
**Tipo de Entrega:** Progressive Web App (PWA) — browser-based, offline-capable  
**Cliente Final:** Pequena fabricante de pães artesanais  
**Stack:** Vanilla JS ES Modules + IndexedDB + Service Worker + Web App Manifest  

---

## 🎯 OBJETIVO

Construir um **PWA completo de fluxo de caixa** para uma pequena fabricante de pães artesanais. O app substitui planilhas. Deve funcionar **100% offline** no celular da proprietária, com sincronização opcional futura.

A usuária final é uma **microempreendedora sem perfil técnico**. Ela usa o celular para tudo. O app precisa ser tão simples quanto uma conversa, e tão confiável quanto papel.

---

## 📋 CONTEXTO DO NEGÓCIO

### Perfil da Usuária
- Produtora artesanal de pães (MEI ou ME)
- Vende para: clientes fixos, feiras, encomendas, sacoleiras, lojas parceiras
- Compra de: fornecedores de farinha, fermento, embalagens, gás, frutas, sementes
- Receitas parceladas são raras, mas existem (encomendas pagas em 2x)
- Principal dor: **não sabe se está tendo lucro ou só girando caixa**
- Dispositivo: Android, tela 6", conectividade irregular

### Linguagem do Domínio

| Termos Técnicos | Como o app vai falar |
|----------------|----------------------|
| Entrada | Receita de venda |
| Saída | Gasto / Pagamento |
| Cliente/Fornecedor | Quem comprou / Quem vende pra ela |
| Fluxo projetado | Previsão do mês |
| Inadimplência | Fiado que não voltou |
| Categoria | Tipo de venda ou tipo de gasto |

---

## 🏗️ ARQUITETURA TÉCNICA

### Stack Obrigatória

```
├── Vanilla JavaScript (ES Modules, sem framework)
├── HTML5 semântico
├── CSS3 com Custom Properties (variáveis)
├── IndexedDB (via idb library via CDN)
├── Service Worker (cache-first strategy)
├── Web App Manifest (installable)
├── LocalStorage (settings e preferências simples)
└── ZERO dependências de build (sem webpack, sem npm)
```

### Estrutura de Arquivos

```
/
├── index.html              ← entry point, shell da SPA
├── manifest.json           ← PWA manifest
├── sw.js                   ← Service Worker
├── offline.html            ← página fallback offline
│
├── css/
│   ├── reset.css
│   ├── tokens.css          ← design tokens (CSS vars)
│   ├── components.css      ← componentes reutilizáveis
│   └── layouts.css         ← layouts de página
│
├── js/
│   ├── app.js              ← router, init, state global
│   ├── db.js               ← camada de abstração IndexedDB
│   ├── utils.js            ← formatação, datas, cálculos
│   │
│   ├── views/
│   │   ├── dashboard.js
│   │   ├── lancamentos.js
│   │   ├── contas-receber.js
│   │   ├── contas-pagar.js
│   │   ├── historico.js
│   │   ├── relatorios.js
│   │   └── configuracoes.js
│   │
│   └── components/
│       ├── nav.js
│       ├── modal.js
│       ├── toast.js
│       ├── card-kpi.js
│       ├── lista-movimentacao.js
│       ├── form-lancamento.js
│       └── grafico-mensal.js
│
└── icons/
    ├── icon-192.png
    ├── icon-512.png
    └── icon-maskable.png
```

---

## 🎨 DESIGN SYSTEM

### Identidade Visual

**Conceito:** Aconchegante + Profissional. Como o interior de uma padaria boa — quente, limpo, organizado. Não é app de banco, não é planilha fria.

**Estética:** Warm editorial. Pão fresco. Terra, trigo, forno. Luxury-rustic.

### Paleta de Cores

```css
:root {
  /* Base */
  --color-bg:          #FAF7F2;   /* branco trigo — fundo principal */
  --color-surface:     #FFFFFF;   /* branco puro — cards */
  --color-surface-2:   #F3EDE3;   /* creme — segundo nível */
  --color-border:      #E8DDD0;   /* borda suave */

  /* Brand */
  --color-primary:     #8B5E3C;   /* castanho pão — cor principal */
  --color-primary-dark:#5C3A1E;   /* castanho escuro */
  --color-primary-light:#C4956A;  /* caramelo */
  --color-accent:      #D4A853;   /* dourado crosta */
  --color-accent-light:#F0D090;   /* dourado claro */

  /* Semântica Financeira */
  --color-entrada:     #2D6A4F;   /* verde escuro — receita */
  --color-entrada-bg:  #D8F3DC;   /* verde claro — fundo */
  --color-saida:       #9B2226;   /* vermelho escuro — gasto */
  --color-saida-bg:    #FFE5E5;   /* vermelho claro — fundo */
  --color-vencido:     #BB3E03;   /* laranja queimado — urgente */
  --color-vencido-bg:  #FFE8D6;
  --color-pendente:    #5C6BC0;   /* azul — agendado */
  --color-pendente-bg: #E8EAF6;
  --color-fiado:       #6D4C41;   /* terra — fiado */
  --color-fiado-bg:    #EFEBE9;

  /* Tipografia */
  --font-display:      'Playfair Display', Georgia, serif;
  --font-body:         'DM Sans', 'Helvetica Neue', sans-serif;
  --font-mono:         'JetBrains Mono', monospace;

  /* Espaçamento */
  --space-1: 4px;
  --space-2: 8px;
  --space-3: 12px;
  --space-4: 16px;
  --space-5: 20px;
  --space-6: 24px;
  --space-8: 32px;
  --space-10: 40px;
  --space-12: 48px;

  /* Raios */
  --radius-sm:  6px;
  --radius-md:  12px;
  --radius-lg:  20px;
  --radius-xl:  28px;
  --radius-full: 9999px;

  /* Sombras */
  --shadow-sm:  0 1px 3px rgba(139,94,60,0.08);
  --shadow-md:  0 4px 16px rgba(139,94,60,0.12);
  --shadow-lg:  0 8px 32px rgba(139,94,60,0.16);

  /* Transições */
  --transition-fast: 150ms ease;
  --transition-base: 250ms ease;
  --transition-slow: 400ms cubic-bezier(0.16,1,0.3,1);
}
```

### Tipografia

```html
<!-- No <head> -->
<link rel="preconnect" href="https://fonts.googleapis.com">
<link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
<link href="https://fonts.googleapis.com/css2?family=Playfair+Display:wght@600;700&family=DM+Sans:wght@300;400;500;600&display=swap" rel="stylesheet">
```

```css
/* Hierarquia tipográfica */
.text-hero     { font: 700 2rem/1.2 var(--font-display); }
.text-title    { font: 700 1.375rem/1.3 var(--font-display); }
.text-subtitle { font: 600 1.125rem/1.4 var(--font-body); }
.text-body     { font: 400 0.9375rem/1.6 var(--font-body); }
.text-small    { font: 400 0.8125rem/1.5 var(--font-body); }
.text-caption  { font: 500 0.75rem/1.4 var(--font-body); letter-spacing: 0.04em; }
.text-mono     { font: 500 0.875rem/1 var(--font-mono); }
.text-value    { font: 600 1.25rem/1 var(--font-body); }
.text-value-lg { font: 700 1.75rem/1 var(--font-body); }
```

---

## 🗄️ MODELO DE DADOS (IndexedDB)

### Database: `padaria_financeiro`

#### Object Store: `movimentacoes`

```javascript
{
  id:             String,     // "MOV-20260501-0001" — gerado automaticamente
  dataCriacao:    ISOString,  // quando foi lançado
  dataMovimento:  ISOString,  // data da venda ou compra (pode ser diferente)
  tipo:           "entrada" | "saida",
  categoria:      String,     // ref para store categorias
  descricao:      String,     // "20 pães de fermentação natural"
  contato:        String,     // "Maria – sacoleira Feira do Produtor"
  formaPagamento: String,     // ref para store formas
  valorTotal:     Number,     // em centavos (evita float)
  valorRecebido:  Number,     // em centavos
  status:         "pago" | "pendente" | "vencido" | "cancelado" | "agendado" | "fiado" | "parcial",
  dataVencimento: ISOString | null,
  dataRecebimento: ISOString | null,
  parcelado:      Boolean,
  numeroParcela:  Number | null,
  totalParcelas:  Number | null,
  grupoParcelamento: String | null, // ID agrupador das parcelas
  observacoes:    String,
  updatedAt:      ISOString   // para eventual sync futuro
}
```

**Índices:**
```javascript
db.createIndex('by-date',     'dataMovimento')
db.createIndex('by-status',   'status')
db.createIndex('by-tipo',     'tipo')
db.createIndex('by-contato',  'contato')
db.createIndex('by-categoria','categoria')
db.createIndex('by-grupo',    'grupoParcelamento')
```

#### Object Store: `categorias`

```javascript
{
  id:    String,   // slug: "venda-feira"
  nome:  String,   // "Venda em Feira"
  tipo:  "entrada" | "saida" | "ambos",
  icone: String,   // emoji: "🥖"
  ativo: Boolean
}
```

**Dados iniciais (seed):**

```javascript
// ENTRADAS
{ id: "venda-feira",       nome: "Venda em Feira",            tipo: "entrada", icone: "🏪" },
{ id: "venda-fixa",        nome: "Cliente Fixo (Entrega)",    tipo: "entrada", icone: "📦" },
{ id: "encomenda",         nome: "Encomenda Especial",        tipo: "entrada", icone: "🎂" },
{ id: "venda-loja",        nome: "Parceiro Loja / Mercado",   tipo: "entrada", icone: "🛒" },
{ id: "revenda",           nome: "Sacoleira / Revendedora",   tipo: "entrada", icone: "🧺" },
{ id: "venda-avulsa",      nome: "Venda Avulsa",              tipo: "entrada", icone: "💰" },
{ id: "outro-entrada",     nome: "Outra Receita",             tipo: "entrada", icone: "➕" },

// SAÍDAS — MATÉRIA-PRIMA
{ id: "farinha",           nome: "Farinha / Trigo",           tipo: "saida",  icone: "🌾" },
{ id: "fermento",          nome: "Fermento / Levain",         tipo: "saida",  icone: "🧫" },
{ id: "ingredientes",      nome: "Ingredientes em Geral",     tipo: "saida",  icone: "🧂" },
{ id: "embalagens",        nome: "Embalagens / Sacos",        tipo: "saida",  icone: "🛍️" },
{ id: "gas",               nome: "Gás / Energia",             tipo: "saida",  icone: "🔥" },

// SAÍDAS — OPERACIONAL
{ id: "aluguel",           nome: "Aluguel / Espaço",          tipo: "saida",  icone: "🏠" },
{ id: "transporte",        nome: "Transporte / Frete",        tipo: "saida",  icone: "🚗" },
{ id: "feira-taxa",        nome: "Taxa de Feira / Evento",    tipo: "saida",  icone: "🎪" },
{ id: "equipamento",       nome: "Equipamento / Utensílio",   tipo: "saida",  icone: "🔧" },
{ id: "marketing",         nome: "Marketing / Divulgação",    tipo: "saida",  icone: "📣" },
{ id: "imposto",           nome: "Imposto / DAS",             tipo: "saida",  icone: "📄" },
{ id: "pro-labore",        nome: "Pró-Labore Próprio",        tipo: "saida",  icone: "👤" },
{ id: "outro-saida",       nome: "Outro Gasto",               tipo: "saida",  icone: "➖" }
```

#### Object Store: `formas_pagamento`

```javascript
{
  id:        String,
  nome:      String,
  liquidezDias: Number  // D+0, D+1, D+30
}
```

**Dados iniciais:**

```javascript
{ id: "pix",        nome: "PIX",              liquidezDias: 0  },
{ id: "dinheiro",   nome: "Dinheiro",         liquidezDias: 0  },
{ id: "cartao-deb", nome: "Cartão de Débito", liquidezDias: 1  },
{ id: "cartao-cred",nome: "Cartão de Crédito",liquidezDias: 30 },
{ id: "transferencia",nome:"Transferência",   liquidezDias: 1  },
{ id: "boleto",     nome: "Boleto",           liquidezDias: 2  },
{ id: "fiado",      nome: "Fiado / A Prazo",  liquidezDias: -1 }
```

#### Object Store: `configuracoes`

```javascript
{
  key:   String,
  value: any
}
```

**Chaves:**
- `nome_negocio` → "Pãozinho da Vó Maria"
- `nome_proprietaria` → "Maria"
- `cor_tema` → "warm" | "dark"
- `moeda` → "BRL"
- `primeiro_acesso` → Boolean

---

## 📱 VIEWS (Telas do App)

### Navegação

```
Bottombar mobile (5 ícones):
┌─────────────────────────────────────────────────┐
│  🏠 Início  │  💸 Lançar  │  ⬆↓ Histórico  │  📊 Relatórios  │  ⚙️ Config  │
└─────────────────────────────────────────────────┘

Regras:
- Active state: ícone + label + linha indicadora embaixo
- Inactive: ícone + label apagado
- "Lançar" é o botão CTA central (maior, destaque visual)
- Animação de entrada: slide-up suave (300ms)
```

---

### VIEW 1: Dashboard (Início)

**Rota:** `/` ou `#dashboard`

#### Header
```
┌────────────────────────────────────┐
│ 🍞 Pãozinho da Vó Maria       🔔  │  ← nome do negócio + notificações
│ Quarta, 28 de maio               │  ← data atual por extenso
└────────────────────────────────────┘
```

#### Saudação contextual
```
Regra: muda conforme horário
├─ 05h–11h: "Bom dia, Maria! 🌅 Fornada fresca, dia novo."
├─ 11h–18h: "Boa tarde, Maria! ☀️"
└─ 18h–05h: "Boa noite, Maria! 🌙"
```

#### Cards KPI (2×2 grid)

```
┌──────────────────┬──────────────────┐
│  ✅ Receita Paga  │  📤 Gastos Pagos  │
│  R$ 1.240,00     │  R$ 387,50       │
│  este mês        │  este mês        │
├──────────────────┼──────────────────┤
│  💰 Saldo Atual   │  ⏳ A Receber    │
│  R$ 852,50       │  R$ 320,00       │
│  realizado       │  total em aberto │
└──────────────────┴──────────────────┘
```

**Comportamento dos cards:**
- Tap em qualquer card navega para view correspondente
- Saldo negativo → card vermelho pulsante
- Saldo positivo → card com borda dourada sutil
- Loading skeleton enquanto DB carrega

#### Alerta de Urgência (condicional)

```
Aparece quando existem movimentações vencidas:

┌────────────────────────────────────┐
│ ⚠️  Você tem 2 itens vencidos      │
│ R$ 80,00 em recebimentos atrasados │
│                          [Ver →]   │
└────────────────────────────────────┘
```

#### Últimos Lançamentos (lista)

```
Título: "Últimos lançamentos"
Mostrar: últimos 5 registros (todos tipos)
Cada item:
├─ Ícone da categoria (emoji)
├─ Descrição (truncada em 1 linha)
├─ Contato (pequeno, cinza)
├─ Chip de status (colorido)
└─ Valor (verde entrada / vermelho saída)
```

#### FAB (Floating Action Button)

```
Botão fixo no canto inferior direito:
├─ Ícone: "+"
├─ Cor: var(--color-accent) dourado
└─ Tap: abre modal de novo lançamento
```

---

### VIEW 2: Lançar (Modal ou tela dedicada)

**Trigger:** FAB, tab "Lançar" no bottombar, ou tap em "+" de qualquer lista

#### Seletor de Tipo (primeiro passo — UI proeminente)

```
Dois botões grandes, lado a lado:

┌──────────────────┬──────────────────┐
│   ⬆️              │   ⬇️              │
│                  │                  │
│  RECEBI          │  GASTEI          │
│  uma venda       │  um valor        │
│                  │                  │
└──────────────────┴──────────────────┘
Recebi = verde   │   Gastei = vermelho
```

Após selecionar, formulário expande com animação slide-down.

#### Formulário Completo

```javascript
// Campos por ordem de aparição no formulário:

campos = [
  {
    id: "dataMovimento",
    label: "Quando foi?",
    type: "date",
    default: "hoje",
    obrigatorio: true
  },
  {
    id: "categoria",
    label: "O que foi?",
    type: "chips-scroll",  // scroll horizontal de chips clicáveis
    opcoes: "por tipo (entrada ou saída)",
    obrigatorio: true
  },
  {
    id: "descricao",
    label: "Descreva",
    type: "text",
    placeholder: "Ex: 15 pães de fermentação natural",
    obrigatorio: true
  },
  {
    id: "contato",
    label: "Quem? (cliente ou fornecedor)",
    type: "text-autocomplete",  // sugere contatos anteriores do DB
    placeholder: "Ex: Maria – sacoleira",
    obrigatorio: false
  },
  {
    id: "formaPagamento",
    label: "Como pagou / recebeu?",
    type: "chips-horizontal",
    opcoes: formas_pagamento
  },
  {
    id: "valorTotal",
    label: "Valor total",
    type: "number-currency",  // teclado numérico nativo, formatação R$
    obrigatorio: true
  },
  {
    id: "status",
    label: "Já caiu no caixa?",
    type: "toggle-three",     // Pago | Pendente | Fiado
    default: "pago"
  },
  // Condicional: aparece se status ≠ pago
  {
    id: "dataVencimento",
    label: "Quando vence?",
    type: "date",
    condicional: "status !== 'pago'"
  },
  // Condicional: aparece se status = parcial
  {
    id: "valorRecebido",
    label: "Quanto já recebeu?",
    type: "number-currency",
    condicional: "status === 'parcial'"
  },
  // Expansível: "Parcelar?"
  {
    id: "parcelado",
    label: "É parcelado?",
    type: "toggle"
  },
  {
    id: "totalParcelas",
    label: "Em quantas parcelas?",
    type: "stepper",           // botões + e -
    min: 2, max: 24,
    condicional: "parcelado === true"
  },
  {
    id: "observacoes",
    label: "Observações",
    type: "textarea",
    placeholder: "Algo importante sobre esse lançamento..."
  }
]
```

#### Botão de Confirmação

```
[  💾  Salvar Lançamento  ]

Comportamento:
1. Validação client-side (campos obrigatórios, valor > 0)
2. Se parcelado: gera N registros com mesmo grupoParcelamento
3. Salva no IndexedDB
4. Toast de confirmação: "✅ Lançamento salvo!"
5. Fecha modal / volta ao dashboard
6. Dashboard atualiza KPIs imediatamente (sem reload)
```

---

### VIEW 3: Histórico

**Rota:** `#historico`

#### Barra de filtros

```
┌────────────────────────────────────────┐
│  [Todos ▾]  [Este mês ▾]  [🔍 buscar]  │
└────────────────────────────────────────┘

Filtros disponíveis:
├─ Tipo: Todos / Entradas / Saídas
├─ Período: Hoje / Esta semana / Este mês / Mês passado / Período personalizado
├─ Status: Todos / Pago / Pendente / Vencido / Fiado
└─ Categoria: (lista dos definidos)
```

#### Lista de Movimentações

Cada item da lista:

```
┌──────────────────────────────────────────────────┐
│  🥖  Venda em Feira              📅 28/05/2026    │
│  20 pães de fermentação natural                  │
│  Maria – sacoleira Feira do Produtor             │
│                              💚 PAGO   R$ 80,00  │
└──────────────────────────────────────────────────┘

Cores do valor:
├─ Entrada: var(--color-entrada) verde
└─ Saída:   var(--color-saida)  vermelho com "-"

Swipe left (mobile): revela botões Editar | Excluir
Tap: abre modal de detalhe + edição
```

#### Agrupamento por data

```
Cada grupo de data tem um separador:
────── Quarta, 28 de maio ────────────

Dentro do grupo, lista de itens daquele dia.
Ao final do grupo, subtotal do dia (entradas - saídas = saldo).
```

#### Bottom summary bar (fixo)

```
Quando filtrado, mostra resumo do filtro ativo:
┌──────────────────────────────────────────────────┐
│  12 lançamentos  │  Receitas: R$ 1.100  │  Gastos: R$ 340  │
└──────────────────────────────────────────────────┘
```

---

### VIEW 4: Contas a Receber

**Rota:** `#receber`  
**Filtro automático:** tipo = entrada AND status ≠ pago AND status ≠ cancelado

#### Header com KPI

```
┌────────────────────────────────────┐
│  ⬆️ Contas a Receber               │
│  Total: R$ 640,00  (4 pendências)  │
└────────────────────────────────────┘
```

#### Abas de agrupamento

```
[Fiados]  [Pendentes]  [Vencidos]  [Todos]

Cada aba mostra contagem em badge:
[Fiados 3]  [Pendentes 1]  [Vencidos 2]
```

#### Cada item tem:

```
┌──────────────────────────────────────────────────┐
│  🧺  Sacoleira Maria                  📅 Vence 30/05  │
│  20 pães de fermentação natural                      │
│  Fiado / A Prazo                                     │
│                          🔴 VENCIDO   R$ 80,00        │
│                                     [Receber →]       │
└──────────────────────────────────────────────────────┘
```

**Botão "Receber →":**
Abre mini-modal:
```
┌─────────────────────────────────────┐
│  💚 Registrar Recebimento           │
│                                     │
│  Valor a receber:  R$ 80,00         │
│  Valor recebido: [80,00] ← editável │
│  Data:  [hoje] ← editável           │
│  Forma: PIX | Dinheiro | ...        │
│                                     │
│         [Confirmar Recebimento]     │
└─────────────────────────────────────┘
```

---

### VIEW 5: Contas a Pagar

**Rota:** `#pagar`  
**Filtro automático:** tipo = saida AND status ≠ pago AND status ≠ cancelado

#### Header

```
┌────────────────────────────────────┐
│  ⬇️ Contas a Pagar                 │
│  Total: R$ 520,00  (3 pendências)  │
└────────────────────────────────────┘
```

Mesma estrutura da View 4, adaptada para pagamentos a fornecedores.

**Botão "Pagar →"** abre mini-modal equivalente.

---

### VIEW 6: Relatórios

**Rota:** `#relatorios`

#### Seletor de período

```
[← Abril 2026]  [Maio 2026]  [Junho 2026 →]
```

#### Bloco 1: Resumo do mês

```
┌────────────────────────────────────────┐
│  📊 MAIO 2026                          │
├────────────────────────────────────────┤
│  Receita Total (Pago)      R$ 2.340,00 │
│  Gastos Totais (Pago)        R$ 890,00 │
│  ──────────────────────────────────── │
│  💰 LUCRO DO MÊS           R$ 1.450,00 │
│  Margem:                         62%  │
└────────────────────────────────────────┘
```

#### Bloco 2: Gráfico de barras — Entradas vs Saídas (6 meses)

```
Implementar com <canvas> + Chart.js (CDN):

Barra verde = receita paga
Barra vermelha = gastos pagos
Linha dourada = saldo acumulado

Meses no eixo X: dez, jan, fev, mar, abr, mai
```

#### Bloco 3: Por categoria (Top gastos e receitas)

```
TOP RECEITAS:
🏪 Venda em Feira      R$ 980,00   42%  [████████░░]
📦 Cliente Fixo        R$ 760,00   32%  [██████░░░░]
🎂 Encomenda           R$ 600,00   26%  [█████░░░░░]

TOP GASTOS:
🌾 Farinha / Trigo     R$ 280,00   31%  [███░░░░░░░]
🔥 Gás / Energia       R$ 180,00   20%  [██░░░░░░░░]
🛍️ Embalagens          R$ 150,00   17%  [█░░░░░░░░░]
```

#### Bloco 4: Inadimplência

```
┌────────────────────────────────────────┐
│  🔴 Inadimplência (fiados em atraso)   │
│  3 registros · R$ 220,00 em aberto     │
│  Mais antigo: há 18 dias               │
│                     [Ver detalhes →]   │
└────────────────────────────────────────┘
```

#### Botão de exportação

```
[📤 Exportar Relatório]

Exporta CSV com todas as movimentações do período.
Compatível com Google Sheets e Excel.
```

---

### VIEW 7: Configurações

**Rota:** `#configuracoes`

```
Seções:
├─ Negócio
│   ├─ Nome do negócio
│   └─ Seu nome
├─ Categorias
│   ├─ Ver todas as categorias ativas
│   ├─ Adicionar categoria
│   └─ Ativar / desativar
├─ Formas de Pagamento
│   └─ Mesma gestão
├─ Aparência
│   └─ Tema: Claro Quentinho | Escuro Profissional
├─ Dados
│   ├─ Exportar todos os dados (JSON backup)
│   ├─ Importar backup
│   └─ Limpar dados (com double-confirm)
└─ Sobre
    └─ Versão do app, créditos
```

---

## ⚙️ REGRAS DE NEGÓCIO

### Regras de Status

```javascript
// Lógica de transição de status
const STATUS_RULES = {
  pago: {
    requerDataRecebimento: true,
    requerValorRecebido: true,
    valorRecebidoDefault: "valorTotal"
  },
  pendente: {
    requerDataVencimento: true,
    alertaAntecipacao: 3   // alertar 3 dias antes
  },
  vencido: {
    autoTransicao: true,   // pendente → vencido quando dataVencimento < hoje
    verificarEm: "app-open + diário"
  },
  fiado: {
    aparecerEm: "contas-receber",
    tratarComo: "a-receber",
    semDataVencimento: true  // não tem prazo definido por padrão
  },
  parcial: {
    requerValorRecebido: true,
    saldoPendente: "valorTotal - valorRecebido"
  },
  cancelado: {
    excluirDeSaldos: true,
    manter: "histórico"
  }
}
```

### Regras de Saldo

```javascript
// Saldo Realizado (Caixa Real)
saldoRealizado = SUM(entradas onde status=pago) - SUM(saidas onde status=pago)

// Saldo Projetado (inclui pendentes)
saldoProjetado = saldoRealizado
               + SUM(entradas pendentes/agendadas)
               - SUM(saidas pendentes/agendadas)

// A Receber
totalReceber = SUM(entradas onde status IN [pendente, vencido, fiado, parcial])

// A Pagar
totalPagar = SUM(saidas onde status IN [pendente, vencido, agendado])

// Inadimplência
inadimplencia = SUM(entradas onde status=vencido)
              + SUM(entradas onde status=fiado AND dataVencimento < hoje)
```

### Geração de ID

```javascript
function gerarId(tipo = "MOV") {
  const now = new Date()
  const ymd = now.toISOString().slice(0,10).replace(/-/g,'')
  const seq = String(Math.floor(Math.random() * 9999)).padStart(4,'0')
  return `${tipo}-${ymd}-${seq}`
}
```

### Geração de Parcelamentos

```javascript
function gerarParcelas(base, totalParcelas) {
  const grupo = gerarId("GRP")
  const parcelas = []
  for (let i = 1; i <= totalParcelas; i++) {
    const venc = new Date(base.dataMovimento)
    venc.setMonth(venc.getMonth() + (i - 1))
    parcelas.push({
      ...base,
      id: gerarId(),
      grupoParcelamento: grupo,
      numeroParcela: i,
      totalParcelas: totalParcelas,
      descricao: `${base.descricao} (${i}/${totalParcelas})`,
      dataVencimento: venc.toISOString(),
      status: i === 1 && base.status === 'pago' ? 'pago' : 'pendente',
      valorTotal: Math.round(base.valorTotal / totalParcelas)
    })
  }
  return parcelas
}
```

---

## 📲 PWA — CONFIGURAÇÕES OBRIGATÓRIAS

### manifest.json

```json
{
  "name": "Padaria — Fluxo de Caixa",
  "short_name": "Caixa Padaria",
  "description": "Controle financeiro para padaria artesanal",
  "start_url": "/",
  "display": "standalone",
  "background_color": "#FAF7F2",
  "theme_color": "#8B5E3C",
  "orientation": "portrait",
  "icons": [
    {
      "src": "icons/icon-192.png",
      "sizes": "192x192",
      "type": "image/png",
      "purpose": "any"
    },
    {
      "src": "icons/icon-512.png",
      "sizes": "512x512",
      "type": "image/png",
      "purpose": "any"
    },
    {
      "src": "icons/icon-maskable.png",
      "sizes": "512x512",
      "type": "image/png",
      "purpose": "maskable"
    }
  ],
  "screenshots": [],
  "categories": ["finance", "productivity"],
  "lang": "pt-BR"
}
```

### Service Worker (sw.js) — Cache Strategy

```javascript
const CACHE_NAME = 'padaria-caixa-v1'

// Arquivos para pré-cachear (app shell)
const PRECACHE_URLS = [
  '/',
  '/index.html',
  '/offline.html',
  '/css/tokens.css',
  '/css/components.css',
  '/css/layouts.css',
  '/js/app.js',
  '/js/db.js',
  '/js/utils.js',
  '/js/views/dashboard.js',
  '/js/views/lancamentos.js',
  '/js/views/historico.js',
  '/js/views/contas-receber.js',
  '/js/views/contas-pagar.js',
  '/js/views/relatorios.js',
  '/js/views/configuracoes.js',
  '/icons/icon-192.png',
  '/icons/icon-512.png'
]

// Estratégia: Cache-First para assets, Network-First para dados
// (dados ficam no IndexedDB — SW não precisa cachear)

self.addEventListener('install', event => {
  event.waitUntil(
    caches.open(CACHE_NAME)
      .then(cache => cache.addAll(PRECACHE_URLS))
      .then(() => self.skipWaiting())
  )
})

self.addEventListener('activate', event => {
  event.waitUntil(
    caches.keys().then(keys =>
      Promise.all(keys.filter(k => k !== CACHE_NAME).map(k => caches.delete(k)))
    ).then(() => self.clients.claim())
  )
})

self.addEventListener('fetch', event => {
  // Ignora requisições non-GET e requests externos (Google Fonts etc)
  if (event.request.method !== 'GET') return
  if (!event.request.url.startsWith(self.location.origin)) return

  event.respondWith(
    caches.match(event.request)
      .then(cached => cached || fetch(event.request)
        .then(response => {
          const clone = response.clone()
          caches.open(CACHE_NAME).then(cache => cache.put(event.request, clone))
          return response
        })
        .catch(() => caches.match('/offline.html'))
      )
  )
})
```

### Registro do Service Worker

```html
<!-- No <body> do index.html, antes de fechar </body> -->
<script>
  if ('serviceWorker' in navigator) {
    window.addEventListener('load', () => {
      navigator.serviceWorker.register('/sw.js')
        .then(reg => console.log('SW registrado:', reg.scope))
        .catch(err => console.warn('SW falhou:', err))
    })
  }
</script>
```

### Banner de instalação (A2HS)

```javascript
// Capturar evento beforeinstallprompt
let deferredPrompt

window.addEventListener('beforeinstallprompt', (e) => {
  e.preventDefault()
  deferredPrompt = e
  // Mostrar banner customizado após 30 segundos de uso
  setTimeout(mostrarBannerInstalacao, 30000)
})

function mostrarBannerInstalacao() {
  const banner = document.getElementById('install-banner')
  banner.classList.add('visible')
  banner.querySelector('#btn-instalar').addEventListener('click', async () => {
    if (!deferredPrompt) return
    deferredPrompt.prompt()
    const { outcome } = await deferredPrompt.userChoice
    if (outcome === 'accepted') banner.remove()
    deferredPrompt = null
  })
}
```

```html
<!-- HTML do banner -->
<div id="install-banner" class="install-banner" hidden>
  <span>🍞 Adicionar na tela inicial?</span>
  <button id="btn-instalar">Instalar</button>
  <button id="btn-fechar">✕</button>
</div>
```

---

## 🔔 NOTIFICAÇÕES E ALERTAS

### Verificação de vencimentos

```javascript
// Executar sempre que o app abre
async function verificarVencimentosAoAbrir() {
  const hoje = new Date()
  hoje.setHours(0,0,0,0)

  const pendentes = await db.getByIndex('movimentacoes', 'by-status', 'pendente')
  const atualizados = []

  for (const mov of pendentes) {
    if (!mov.dataVencimento) continue
    const venc = new Date(mov.dataVencimento)
    venc.setHours(0,0,0,0)
    if (venc < hoje) {
      atualizados.push({ ...mov, status: 'vencido', updatedAt: new Date().toISOString() })
    }
  }

  if (atualizados.length > 0) {
    await Promise.all(atualizados.map(m => db.put('movimentacoes', m)))
    // Exibe toast
    showToast(`⚠️ ${atualizados.length} lançamento(s) vencido(s) encontrado(s)`, 'warning')
  }
}
```

### Sistema de Toast

```javascript
// Toasts de feedback: sempre não-bloqueantes
function showToast(message, type = 'success', duration = 3500) {
  const toast = document.createElement('div')
  toast.className = `toast toast--${type}`
  toast.textContent = message
  document.getElementById('toast-container').appendChild(toast)

  requestAnimationFrame(() => {
    toast.classList.add('toast--visible')
    setTimeout(() => {
      toast.classList.remove('toast--visible')
      toast.addEventListener('transitionend', () => toast.remove())
    }, duration)
  })
}
// Tipos: success | warning | error | info
```

---

## 📤 EXPORTAÇÃO DE DADOS

### Exportar CSV (relatório)

```javascript
function exportarCSV(movimentacoes, nomeArquivo) {
  const headers = [
    'ID', 'Data', 'Tipo', 'Categoria', 'Descrição', 'Contato',
    'Forma Pgto', 'Valor Total', 'Valor Recebido', 'Status',
    'Data Vencimento', 'Data Recebimento', 'Parcelado', 'Nº Parcela',
    'Total Parcelas', 'Observações'
  ]

  const rows = movimentacoes.map(m => [
    m.id,
    new Date(m.dataMovimento).toLocaleDateString('pt-BR'),
    m.tipo === 'entrada' ? 'Entrada' : 'Saída',
    m.categoria,
    m.descricao,
    m.contato || '',
    m.formaPagamento,
    formatarMoeda(m.valorTotal, false),   // sem R$, só número
    formatarMoeda(m.valorRecebido, false),
    m.status,
    m.dataVencimento ? new Date(m.dataVencimento).toLocaleDateString('pt-BR') : '',
    m.dataRecebimento ? new Date(m.dataRecebimento).toLocaleDateString('pt-BR') : '',
    m.parcelado ? 'Sim' : 'Não',
    m.numeroParcela || '',
    m.totalParcelas || '',
    m.observacoes || ''
  ])

  const csv = [headers, ...rows]
    .map(row => row.map(v => `"${String(v).replace(/"/g,'""')}"`).join(';'))
    .join('\n')

  const blob = new Blob(['\uFEFF' + csv], { type: 'text/csv;charset=utf-8' }) // BOM para Excel BR
  const url = URL.createObjectURL(blob)
  const a = document.createElement('a')
  a.href = url
  a.download = `${nomeArquivo}.csv`
  a.click()
  URL.revokeObjectURL(url)
}
```

### Backup JSON completo

```javascript
async function exportarBackupCompleto() {
  const backup = {
    versao: '1.0',
    exportadoEm: new Date().toISOString(),
    movimentacoes: await db.getAll('movimentacoes'),
    categorias: await db.getAll('categorias'),
    formasPagamento: await db.getAll('formas_pagamento'),
    configuracoes: await db.getAll('configuracoes')
  }

  const blob = new Blob([JSON.stringify(backup, null, 2)], { type: 'application/json' })
  const url = URL.createObjectURL(blob)
  const a = document.createElement('a')
  a.href = url
  a.download = `backup_padaria_${new Date().toISOString().slice(0,10)}.json`
  a.click()
  URL.revokeObjectURL(url)
}
```

---

## 🔄 CAMADA DB (db.js)

```javascript
// Abstração leve sobre IndexedDB usando idb (CDN: https://cdn.jsdelivr.net/npm/idb@7/build/umd.js)

import { openDB } from 'https://cdn.jsdelivr.net/npm/idb@7/build/esm/index.js'

const DB_NAME = 'padaria_financeiro'
const DB_VERSION = 1

let _db = null

async function getDB() {
  if (_db) return _db
  _db = await openDB(DB_NAME, DB_VERSION, {
    upgrade(db) {
      // movimentacoes
      const movStore = db.createObjectStore('movimentacoes', { keyPath: 'id' })
      movStore.createIndex('by-date',       'dataMovimento')
      movStore.createIndex('by-status',     'status')
      movStore.createIndex('by-tipo',       'tipo')
      movStore.createIndex('by-contato',    'contato')
      movStore.createIndex('by-categoria',  'categoria')
      movStore.createIndex('by-grupo',      'grupoParcelamento')

      // categorias
      db.createObjectStore('categorias', { keyPath: 'id' })

      // formas_pagamento
      db.createObjectStore('formas_pagamento', { keyPath: 'id' })

      // configuracoes
      db.createObjectStore('configuracoes', { keyPath: 'key' })
    },
    blocked() { console.warn('DB bloqueado por outra aba') },
    blocking() { _db.close(); _db = null }
  })
  return _db
}

export const db = {
  async getAll(store)           { return (await getDB()).getAll(store) },
  async get(store, key)         { return (await getDB()).get(store, key) },
  async put(store, value)       { return (await getDB()).put(store, value) },
  async delete(store, key)      { return (await getDB()).delete(store, key) },
  async getByIndex(store, idx, query) {
    return (await getDB()).getAllFromIndex(store, idx, query)
  },
  async getByRange(store, idx, lower, upper) {
    const range = IDBKeyRange.bound(lower, upper)
    return (await getDB()).getAllFromIndex(store, idx, range)
  },
  async clear(store)            { return (await getDB()).clear(store) },
  async seed(store, data) {
    const db_ = await getDB()
    const tx = db_.transaction(store, 'readwrite')
    await Promise.all([...data.map(item => tx.store.put(item)), tx.done])
  }
}
```

---

## 📏 COMPONENTES UI DETALHADOS

### Componente: Card KPI

```html
<!-- HTML estrutura -->
<article class="kpi-card kpi-card--{tipo}">
  <header class="kpi-card__header">
    <span class="kpi-card__icon">{emoji}</span>
    <span class="kpi-card__label">{label}</span>
  </header>
  <div class="kpi-card__value">{valor formatado}</div>
  <footer class="kpi-card__footer">{subtexto}</footer>
</article>
```

```css
.kpi-card {
  background: var(--color-surface);
  border-radius: var(--radius-lg);
  padding: var(--space-5);
  box-shadow: var(--shadow-sm);
  border: 1.5px solid var(--color-border);
  cursor: pointer;
  transition: transform var(--transition-fast), box-shadow var(--transition-fast);
}
.kpi-card:active { transform: scale(0.97); }
.kpi-card--entrada { border-color: var(--color-entrada); }
.kpi-card--saida   { border-color: var(--color-saida); }
.kpi-card--saldo-pos { border-color: var(--color-accent); }
.kpi-card--saldo-neg { border-color: var(--color-saida); animation: pulse-red 2s infinite; }

.kpi-card__value {
  font: 700 1.625rem/1 var(--font-body);
  margin: var(--space-2) 0;
}
.kpi-card__footer {
  font: 400 0.75rem/1 var(--font-body);
  color: var(--color-text-muted);
  letter-spacing: 0.03em;
}
```

### Componente: Item de Movimentação

```html
<article class="mov-item mov-item--{tipo} mov-item--{status}" data-id="{id}">
  <div class="mov-item__icon">{icone categoria}</div>
  <div class="mov-item__content">
    <div class="mov-item__title">{descricao truncada}</div>
    <div class="mov-item__meta">
      <span class="mov-item__contato">{contato}</span>
      <span class="mov-item__date">{data}</span>
    </div>
  </div>
  <div class="mov-item__right">
    <div class="mov-item__value">{R$ valor}</div>
    <div class="mov-item__status status-chip status-chip--{status}">{label status}</div>
  </div>
</article>
```

### Componente: Status Chip

```css
.status-chip {
  display: inline-flex;
  align-items: center;
  padding: 2px 8px;
  border-radius: var(--radius-full);
  font: 600 0.6875rem/1 var(--font-body);
  letter-spacing: 0.04em;
}
.status-chip--pago     { background: var(--color-entrada-bg); color: var(--color-entrada); }
.status-chip--pendente { background: var(--color-pendente-bg); color: var(--color-pendente); }
.status-chip--vencido  { background: var(--color-vencido-bg); color: var(--color-vencido); }
.status-chip--fiado    { background: var(--color-fiado-bg); color: var(--color-fiado); }
.status-chip--parcial  { background: var(--color-accent-light); color: var(--color-primary-dark); }
.status-chip--cancelado{ background: #F5F5F5; color: #9E9E9E; }
```

### Componente: Chips de Categoria (seletor no formulário)

```html
<div class="category-chips" role="group" aria-label="Categoria">
  <button class="chip chip--categoria" data-value="venda-feira">
    <span class="chip__icon">🏪</span>
    <span class="chip__label">Feira</span>
  </button>
  <!-- repete para cada categoria -->
</div>
```

```css
.category-chips {
  display: flex;
  gap: var(--space-2);
  overflow-x: auto;
  scroll-snap-type: x mandatory;
  padding-bottom: var(--space-2);
  scrollbar-width: none;  /* Hide scrollbar no mobile */
}
.chip {
  flex-shrink: 0;
  scroll-snap-align: start;
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: var(--space-1);
  padding: var(--space-3) var(--space-4);
  border-radius: var(--radius-md);
  border: 2px solid var(--color-border);
  background: var(--color-surface);
  cursor: pointer;
  transition: all var(--transition-fast);
}
.chip--selected {
  border-color: var(--color-primary);
  background: var(--color-surface-2);
}
.chip__icon { font-size: 1.5rem; }
.chip__label { font: 500 0.75rem/1 var(--font-body); }
```

---

## 🧪 DADOS DE EXEMPLO (Seed para Demo)

O agente deve incluir um botão "Carregar dados de exemplo" no primeiro acesso.

Incluir pelo menos **15 movimentações** cobrindo:

```javascript
const dadosExemplo = [
  // Entradas pagas
  { tipo:'entrada', categoria:'venda-feira', descricao:'Pães integrais – lote feira sábado', contato:'Feira do Produtor – Praça Central', formaPagamento:'pix', valorTotal:24000, status:'pago', dataMovimento: diasAtras(0) },
  { tipo:'entrada', categoria:'encomenda',   descricao:'Bolo de mel p/ aniversário da Júlia', contato:'Júlia Fernandes', formaPagamento:'pix', valorTotal:8500, status:'pago', dataMovimento: diasAtras(1) },
  { tipo:'entrada', categoria:'venda-fixa',  descricao:'Entrega semanal – 30 pães de fermentação', contato:'Dona Tereza – Rua das Flores', formaPagamento:'dinheiro', valorTotal:19500, status:'pago', dataMovimento: diasAtras(2) },
  { tipo:'entrada', categoria:'revenda',     descricao:'Reposição sacoleira 40 unidades', contato:'Maria – sacoleira Feira Norte', formaPagamento:'fiado', valorTotal:8000, status:'fiado', dataMovimento: diasAtras(5) },
  { tipo:'entrada', categoria:'venda-feira', descricao:'Pães rústicos de alho e ervas', contato:'Feira do Produtor – Praça Central', formaPagamento:'cartao-deb', valorTotal:15000, status:'pago', dataMovimento: diasAtras(7) },
  { tipo:'entrada', categoria:'encomenda',   descricao:'Cesta de café da manhã – 10 pães sortidos', contato:'Roberto Alves', formaPagamento:'pix', valorTotal:6500, status:'pendente', dataVencimento: diasFrente(5) },

  // Saídas pagas
  { tipo:'saida', categoria:'farinha', descricao:'Farinha de trigo especial – 25kg', contato:'Moinho São João', formaPagamento:'pix', valorTotal:15500, status:'pago', dataMovimento: diasAtras(3) },
  { tipo:'saida', categoria:'ingredientes', descricao:'Fermento natural, sal, azeite', contato:'Atacado Sabor & Cia', formaPagamento:'dinheiro', valorTotal:4200, status:'pago', dataMovimento: diasAtras(3) },
  { tipo:'saida', categoria:'embalagens', descricao:'Sacos de papel craft + etiquetas', contato:'Embalagens Braz', formaPagamento:'pix', valorTotal:3800, status:'pago', dataMovimento: diasAtras(4) },
  { tipo:'saida', categoria:'gas', descricao:'Gás GLP – 2 botijões P45', contato:'Distribuidora de Gás Irmãos Lima', formaPagamento:'dinheiro', valorTotal:22000, status:'pago', dataMovimento: diasAtras(6) },
  { tipo:'saida', categoria:'transporte', descricao:'Frete Uber para entregar encomendas', contato:'Uber', formaPagamento:'cartao-deb', valorTotal:3200, status:'pago', dataMovimento: diasAtras(2) },

  // Saídas pendentes/vencidas
  { tipo:'saida', categoria:'feira-taxa', descricao:'Taxa de barraca – Feira do Produtor Junho', contato:'Prefeitura Municipal', formaPagamento:'boleto', valorTotal:8000, status:'pendente', dataVencimento: diasFrente(8) },
  { tipo:'saida', categoria:'imposto', descricao:'DAS MEI – Maio 2026', contato:'Receita Federal', formaPagamento:'boleto', valorTotal:7100, status:'vencido', dataVencimento: diasAtras(2) },

  // Parcelamento (2 parcelas)
  { tipo:'saida', categoria:'equipamento', descricao:'Amassadeira elétrica 5kg (1/2)', contato:'Casa do Chef – Equipamentos', formaPagamento:'cartao-cred', valorTotal:22500, status:'pago', dataMovimento: diasAtras(15), parcelado:true, numeroParcela:1, totalParcelas:2 },
  { tipo:'saida', categoria:'equipamento', descricao:'Amassadeira elétrica 5kg (2/2)', contato:'Casa do Chef – Equipamentos', formaPagamento:'cartao-cred', valorTotal:22500, status:'pendente', dataVencimento: diasFrente(15), parcelado:true, numeroParcela:2, totalParcelas:2 }
]
```

---

## ✅ CHECKLIST DE ENTREGA (para o agente)

### Funcionalidade Core

```
[ ] IndexedDB inicializa corretamente com todas as stores
[ ] Seed de categorias e formas de pagamento roda no primeiro acesso
[ ] CRUD completo de movimentações (criar, ler, editar, deletar)
[ ] Status automático: pendente → vencido quando dataVencimento < hoje
[ ] Geração automática de IDs no formato MOV-YYYYMMDD-XXXX
[ ] Lançamento de parcelamentos gera N registros com grupo compartilhado
[ ] Filtros funcionam: por tipo, status, período, categoria
[ ] Botão "Receber" atualiza status + data + valor recebido
[ ] Exportação CSV com BOM para compatibilidade com Excel BR
[ ] Backup JSON export + import funcionam
```

### KPIs e Cálculos

```
[ ] Receita do mês (apenas status=pago, mês atual)
[ ] Gastos do mês (apenas status=pago, mês atual)
[ ] Saldo realizado = receita paga - gastos pagos
[ ] Total a receber (entrada + não-pago + não-cancelado)
[ ] Total a pagar (saída + não-pago + não-cancelado)
[ ] Inadimplência (status=vencido + fiados antigos)
[ ] Margem % = (receita - gastos) / receita
```

### PWA

```
[ ] manifest.json válido (validar em https://manifest-validator.appspot.com)
[ ] Service Worker registrado com sucesso
[ ] App funciona 100% offline após primeiro load
[ ] Instala na tela inicial (A2HS) em Android Chrome
[ ] Ícones 192px e 512px presentes
[ ] theme_color aparece na barra de status do Android
[ ] Tela de splash (background_color + ícone) ao abrir
```

### UX / Mobile

```
[ ] Nenhum elemento clicável menor que 44×44px
[ ] Teclado numérico abre em campo de valor (inputmode="decimal")
[ ] Seletor de data nativo (type="date") com formatação pt-BR
[ ] Swipe-to-delete nas listas de movimentações
[ ] Toast de feedback em todas as ações (salvar, deletar, marcar pago)
[ ] Loading skeleton enquanto DB carrega
[ ] Estado vazio (empty state) com CTA quando não há lançamentos
[ ] Scroll suave, sem jank
[ ] Funciona bem em tela 360px de largura (mínimo)
[ ] Focus management correto no modal (trap focus)
[ ] Sem overflow horizontal em nenhuma view
```

### Qualidade de Código

```
[ ] Zero dependências de build (roda direto no browser sem servidor local)
[ ] Pode ser servido via GitHub Pages, Netlify ou qualquer CDN estático
[ ] Valores monetários armazenados em centavos (inteiro), exibidos formatados
[ ] Nenhum console.error no fluxo normal de uso
[ ] Testes manuais nos dados de exemplo (sem erros visíveis)
```

---

## 🚀 COMO HOSPEDAR APÓS ENTREGA

```
Opção 1: GitHub Pages (gratuito)
├─ Fazer push dos arquivos para repositório público
├─ Settings → Pages → Deploy from branch main
└─ URL: https://username.github.io/padaria-caixa/

Opção 2: Netlify (drag and drop, gratuito)
├─ Acessar netlify.com
├─ Arrastar pasta do projeto para a interface
└─ URL gerada automaticamente (ex: radiant-macaron-abc123.netlify.app)

Opção 3: Servidor próprio (qualquer static host)
└─ Só copiar os arquivos — zero config de servidor necessária
```

---

*Spec preparada por Walter Miranda | Com Propósito — Maio 2026*  
*Para uso com agente Cowork — entrega esperada: PWA completo e funcional*
