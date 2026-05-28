# Melhorias — Belém Pães PWA

Registro das melhorias aplicadas ao projeto nesta sessão de desenvolvimento.

---

## 1. Resolução de Conflitos de Merge

Todos os 7 arquivos com marcadores `<<<<<<< HEAD` foram resolvidos, o que travava completamente o carregamento da página:

- `index.html` — mantida versão com Lucide, `icon.svg` e `./sw.js` relativo
- `js/app.js` — mantida versão com login PIN e botão de bloqueio
- `js/components/nav.js` — mantida versão com ícones Lucide
- `css/components.css` — mantida versão com estilos de login
- `sw.js` — mantida versão com `precacheAll` tolerante a 404 e path dinâmico via `BASE`
- `manifest.json` — `start_url: "./"` relativo e `icons/icon.svg`
- `package.json` — versões idênticas, conflito removido

---

## 2. Correção do CDN Lucide (erro 404)

**Antes:** `<script src="https://unpkg.com/lucide@latest">` — URL sem caminho do arquivo, retornava 404.

**Depois:** `<script src="https://cdn.jsdelivr.net/npm/lucide@latest/dist/umd/lucide.min.js">` — URL completa via jsDelivr (mais estável).

---

## 3. Melhorias Visuais — Bottom Nav CTA

O botão "Lançar" ganhou uma bolha dourada elevada (`.nav-cta-bubble`) com:
- Gradiente `var(--color-accent)` → `#C4870A`
- Sombra colorida: `box-shadow: 0 4px 16px rgba(212,168,83,.5)`
- Posicionamento elevado acima da barra via `margin-top: -18px`

---

## 4. Adoção de Princípios da Skill `next-design-migration`

Extraídos os padrões de qualidade de design independentes de framework:

### 4a. Novos Tokens CSS (`css/tokens.css`)
| Token | Valor | Uso |
|-------|-------|-----|
| `--color-surface-3` | `#EDE5D8` | Wells, fundos de input |
| `--color-surface-hover` | `#E5D9C8` | Hover interativo |
| `--color-input` | `#F7F2EA` | Fundo de campos de formulário |
| `--focus-ring` | `0 0 0 3px rgba(139,94,60,.18)` | Foco acessível unificado |
| `--border-subtle/default/strong` | opacidade semântica | Bordas por hierarquia |
| `--font-mono` | JetBrains Mono | Timestamps e números |

### 4b. Shimmer Melhorado
Substituído `skeleton-shimmer` por gradiente com `rgba(255,255,255,.55)` — transição mais suave e natural, animação de 1.6s com `background-position`.

### 4c. Dot-Pulse para Status Urgentes
Status chips `vencido` e `pendente` agora exibem um ponto animado com `::before`:
- `vencido`: pulsa em laranja a cada 1.4s (urgente)
- `pendente`: pulsa em azul a cada 2s

### 4d. Scrollbar Personalizado
Scrollbars de 4px, track transparente, thumb em `var(--border-default)` — harmônico com a paleta quente.

### 4e. Tabular Numbers em Valores Financeiros
`font-variant-numeric: tabular-nums` aplicado em `.kpi-card__value`, `.mov-item__value`, `.conta-item__value`, `.summary-bar__value` e `.view-header__amount` — dígitos com largura fixa evitam saltos visuais.

### 4f. Icon Stroke Convention (Lucide)
- Ícones inativos na nav: `stroke-width="1.8"`
- Ícone ativo: `stroke-width="2.2"` (atualizado dinamicamente em `atualizarNavAtivo()`)

### 4g. Filter Pill Group Container
Nova classe `.filter-bar--group` — pills agrupadas em container com borda e fundo, em vez de pills soltas.

### 4h. Reduced Motion
`@media (prefers-reduced-motion: reduce)` desativa todas as animações para usuários com preferência de acessibilidade.

---

## 5. Correções de Bugs (Auditoria)

| # | Arquivo | Linha | Bug | Status |
|---|---------|-------|-----|--------|
| 1 | `js/views/dashboard.js` | 99 | `window._state?.categorias` inválido — `window._state` nunca definido, causava ícones de categoria vazios | **Corrigido** → `state.categorias` |
| 2 | `js/views/dashboard.js` | 122 | `labelStatus` redeclarada localmente em vez de importada de `utils.js` | **Corrigido** → importada, local removida |

---

## 6. Conformidade PWA (Auditoria)

14/14 itens verificados como OK:

| Item | Resultado |
|------|-----------|
| `manifest.json` linkado no HTML | OK |
| `name` e `short_name` no manifest | OK |
| `start_url` relativo (`./`) | OK |
| `display: standalone` | OK |
| Ícone existente (`icons/icon.svg`) | OK |
| `theme-color` meta tag | OK |
| `viewport` meta com `width=device-width` | OK |
| Service Worker registrado | OK |
| `offline.html` existe e é servido pelo SW | OK |
| `apple-mobile-web-app-capable` | OK |
| `apple-mobile-web-app-title` | OK |
| SW com fallback tolerante a 404 | OK |
| `start_url` compatível com subpath | OK |
| HTML do `offline.html` válido | OK |

---

## 7. Implementação de Gráficos Chart.js (Tela Relatórios)

Dois gráficos implementados em `js/views/relatorios.js` usando Chart.js v4 via CDN (`cdn.jsdelivr.net`):

| Gráfico | Tipo | Dados |
|---------|------|-------|
| Fluxo diário | Barras agrupadas | Receita paga vs. Gasto pago por dia do mês |
| Distribuição de gastos | Rosca (doughnut) | Top 5 categorias de gasto do mês |

**Detalhes técnicos:**
- Instâncias armazenadas em `_chartBarras` e `_chartRosca` (module-level) e destruídas com `.destroy()` antes de cada re-render — evita vazamento de memória ao navegar entre meses
- Canvas envolvido em `div` com `position:relative; height:200px` + `maintainAspectRatio: false` — responsivo
- `window.Chart` verificado antes de inicializar — se o CDN falhar (offline), o card é removido graciosamente
- Eixo Y formatado em `R$` com sufixo `k` para milhares
- Paleta de cores do doughnut usa tokens existentes: `--color-saida`, `--color-vencido`, `--color-primary`
- `formatData` removida dos imports do relatorios.js (não era mais usada)

---

## 8. .gitignore Atualizado

Adicionadas entradas para: `.env`, `.env.local`, `dist/`, `*.tmp`, `*.bak`, `.claude/settings.local.json` (configurações locais de sessão), `*.skill` (pacotes binários de skill), `desktop.ini`, `.cursor/`.
