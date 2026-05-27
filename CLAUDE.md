# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Visão Geral

PWA de fluxo de caixa para uma padaria artesanal. **Zero dependências de build** — HTML + CSS + Vanilla JS com ES Modules, roda diretamente no browser sem npm, webpack ou servidor local. Dados 100% offline via IndexedDB.

## Execução e Deploy

Não há etapa de build. Para desenvolver localmente, sirva os arquivos estáticos:

```bash
# Python (mais comum)
python -m http.server 8080

# Node (se disponível)
npx serve .

# VS Code: extensão Live Server
```

Para deploy, copiar os arquivos para GitHub Pages, Netlify (drag & drop) ou qualquer static host.

## Arquitetura

### Stack obrigatória
- **Vanilla JS ES Modules** — sem framework, sem transpilação
- **IndexedDB** via biblioteca `idb` carregada via CDN (`https://cdn.jsdelivr.net/npm/idb@7/build/esm/index.js`)
- **Chart.js** via CDN para gráficos na tela de Relatórios
- **Google Fonts** via CDN: Playfair Display (títulos) + DM Sans (corpo)
- **Service Worker** com estratégia cache-first para funcionar offline

### Estrutura de módulos

```
js/app.js          ← router hash-based (#dashboard, #historico, etc.), init, estado global
js/db.js           ← abstração IndexedDB (único ponto de acesso ao banco)
js/utils.js        ← formatação monetária, datas, gerarId(), gerarParcelas()
js/views/          ← cada arquivo renderiza uma tela completa
js/components/     ← componentes reutilizáveis (modal, toast, nav, etc.)
```

O roteamento é baseado em `window.location.hash`. Cada view é um módulo que exporta uma função `render()`.

### Banco de dados (IndexedDB)

Database: `padaria_financeiro` — 4 object stores:

| Store | keyPath | Descrição |
|-------|---------|-----------|
| `movimentacoes` | `id` | Registros financeiros principais |
| `categorias` | `id` | Seed de ~20 categorias pré-definidas |
| `formas_pagamento` | `id` | 7 formas com liquidezDias |
| `configuracoes` | `key` | Configurações simples (nome negócio, tema, etc.) |

**Regra crítica:** valores monetários são armazenados **em centavos** (inteiros) para evitar imprecisão de float. Toda exibição formata para BRL.

A camada `db.js` expõe: `getAll`, `get`, `put`, `delete`, `getByIndex`, `getByRange`, `clear`, `seed`.

### Status de movimentações

```
pendente → vencido  (automático ao abrir o app, quando dataVencimento < hoje)
pago               (receita/gasto confirmados no caixa)
fiado              (entrada sem prazo definido, aparece em "Contas a Receber")
parcial            (valor parcialmente recebido)
cancelado          (excluído dos saldos, mantido no histórico)
agendado           (futuro planejado)
```

### Cálculos de saldo

```javascript
saldoRealizado = SUM(entradas status=pago) - SUM(saidas status=pago)
totalReceber   = SUM(entradas status IN [pendente, vencido, fiado, parcial])
totalPagar     = SUM(saidas   status IN [pendente, vencido, agendado])
inadimplencia  = SUM(entradas status=vencido) + SUM(entradas status=fiado com dataVencimento < hoje)
```

## Design System

Usar **exclusivamente** as CSS Custom Properties definidas em `css/tokens.css`. As variáveis de cor semântica financeira são:

```css
--color-entrada / --color-entrada-bg   /* verde — receitas pagas */
--color-saida   / --color-saida-bg     /* vermelho — gastos */
--color-vencido / --color-vencido-bg   /* laranja queimado — urgente */
--color-pendente / --color-pendente-bg /* azul — agendado */
--color-fiado   / --color-fiado-bg     /* terra — fiado */
```

Brand primária: `--color-primary: #8B5E3C` (castanho pão). Fundo: `--color-bg: #FAF7F2` (branco trigo).

## Regras de implementação

- **Nenhum elemento clicável menor que 44×44px** (usuária usa celular com tela 6")
- Campos de valor monetário: `inputmode="decimal"` para teclado numérico nativo
- Lançamento parcelado: gera N registros com mesmo `grupoParcelamento` (ID tipo `GRP-YYYYMMDD-XXXX`)
- IDs no formato `MOV-YYYYMMDD-XXXX` (gerado por `gerarId()` em utils.js)
- CSV exportado com BOM (`﻿`) para compatibilidade com Excel no Brasil, separador ponto-e-vírgula
- Toasts são sempre não-bloqueantes; tipos: `success | warning | error | info`
- Auto-transição `pendente → vencido` roda na abertura do app (`verificarVencimentosAoAbrir()`)

## Telas (views)

| Hash | View | Filtro automático |
|------|------|-------------------|
| `#dashboard` | Início — KPIs + últimos 5 lançamentos | — |
| `#lancamentos` | Modal/tela de novo lançamento | — |
| `#historico` | Lista filtrável de todas as movimentações | — |
| `#receber` | Contas a Receber | entrada + status ≠ pago,cancelado |
| `#pagar` | Contas a Pagar | saida + status ≠ pago,cancelado |
| `#relatorios` | Resumo mensal + gráfico Chart.js + exportação | — |
| `#configuracoes` | Dados do negócio, categorias, backup | — |

Navegação via bottom bar com 5 ícones. "Lançar" é o CTA central com destaque visual.
