---
name: next-design-migration
description: >
  Full design system migration for Next.js App Router projects. Use this skill whenever a user wants to: redesign, rebrand, or visually overhaul a Next.js codebase using a design handoff package (README with tokens, screenshots, reference HTML/JSX); migrate from a light-theme or legacy styling to a dark-mode premium aesthetic; implement a new Tailwind v4 @theme token system; convert existing pages to match a new component library (Button, Card, Badge, IconContainer, etc.); or apply a new design system across auth pages, dashboard shell, and app views while preserving all business logic. Trigger on "redesign", "rebrand", "implement handoff", "migrate design system", "dark mode migration", "nova identidade visual", "aplicar design system", or any request to systematically update visual styling across a Next.js codebase from a spec document. Also trigger when the user provides a design_handoff folder, README.md with token specs, or screenshots alongside a request to restyle pages.
---

# Next.js Design System Migration

A structured, phase-by-phase approach to migrating a Next.js App Router + Tailwind project to a new design system from a design handoff package. The guiding constraint: **zero changes to business logic** — only the visual layer moves.

> **No formal handoff package?** If the user describes the target aesthetic verbally (e.g., "dark navy with cyan accents, premium executive feel"), ask for: (1) a primary brand color hex, (2) any reference screenshots or links, (3) the surface/background tones they have in mind. Then derive a token set using the surface elevation pattern in Phase 2 as a template. If they provide nothing, propose a sensible dark palette and confirm before proceeding.

---

## Before You Touch Anything: Phase 0

Read the entire design handoff package first. Skipping this causes costly rework.

1. **Read the README completely.** Tokens, typography, spacing, component patterns, copy rules — this is the source of truth. Never invent colors or spacing that aren't in it.
2. **Look at every screenshot.** Build a mental model of contrast ratios, hierarchy, hover states, motion, and which surfaces sit at which elevation.
3. **Scan the reference HTML/JSX.** These are visual references, not code to transplant. Translate their patterns into the project's existing component conventions. The project's `cn()`, `cva`, and `forwardRef` patterns take precedence.

---

## Phase 1 — Audit and Conflict Detection

Before writing a single changed line, map every collision between the spec and the existing codebase. Present this list to the user and collect decisions before proceeding — unresolved conflicts mid-migration create regressions.

**Common conflicts to surface:**

| Category | Example conflict | Typical options |
|---|---|---|
| CSS tokens | Design uses `--color-brand-500`, codebase uses HSL vars | Overwrite vs. extend |
| Component API | Design has `variant="primary"`, code has `variant="default"` | Rename + find-replace vs. add alias |
| Route/store coupling | GTD spec conflicts with financial store at same route | New store vs. merge |
| Font system | Design: Inter + Playfair Display, code: Geist | Swap vs. both |
| Loading patterns | Design: shimmer, code: `bg-neutral-100 animate-pulse` | Update globally |

Get a yes/no decision per conflict before starting Phase 2. This conversation is cheap; debugging a half-migrated codebase is not.

---

## Phase 2 — Token Foundation (`globals.css`)

Overwrite (or surgically replace) the CSS variable block. In Tailwind v4, the `@theme` block defines all design tokens:

```css
@import "tailwindcss";

@theme {
  /* Surfaces — darkest to lightest */
  --color-bg:            #030712;
  --color-bg-alt:        #061022;
  --color-surface:       #0A1525;
  --color-surface-2:     #0F1D33;
  --color-surface-3:     #142540;
  --color-surface-hover: #18294A;
  --color-sidebar:       #050B17;
  --color-input:         #0E1B30;

  /* Text */
  --color-text:          #F8FAFC;
  --color-text-muted:    #94A3B8;
  --color-text-faint:    #64748B;
  --color-text-disabled: #475569;

  /* Brand (cyan example — replace with actual brand color) */
  --color-brand-300: #67E8F9;
  --color-brand-400: #22D3EE;
  --color-brand-500: #06B6D4;
  --color-brand-600: #0891B2;
  --color-brand-fg:  #062B33;  /* text on brand bg */

  /* Semantic */
  --color-success: #34D399;
  --color-warning: #FBBF24;
  --color-error:   #F87171;
  --color-info:    #60A5FA;

  /* Accent palette */
  --color-purple: #A78BFA;
  --color-rose:   #FB7185;
  --color-amber:  #F59E0B;
  --color-pink:   #F472B6;

  /* Typography */
  --font-display: "Playfair Display", Georgia, serif;
  --font-body:    "Inter", system-ui, sans-serif;
  --font-mono:    "JetBrains Mono", monospace;

  /* Radii */
  --radius-sm: 6px;  --radius-md: 10px;  --radius-lg: 14px;
  --radius-xl: 18px; --radius-2xl: 24px;

  /* Easing */
  --ease-out: cubic-bezier(.22, 1, .36, 1);
}

@layer base {
  html, body {
    @apply bg-bg text-text;
    font-family: var(--font-body);
    -webkit-font-smoothing: antialiased;
  }
  :focus-visible {
    outline: 2px solid rgba(34, 211, 238, 0.7);
    outline-offset: 2px;
  }
  ::-webkit-scrollbar { width: 6px; height: 6px; }
  ::-webkit-scrollbar-track { background: transparent; }
  ::-webkit-scrollbar-thumb { background: rgba(255,255,255,0.08); border-radius: 999px; }
}

/* Named animations */
@keyframes fadeInUp {
  from { opacity: 0; transform: translateY(12px); }
  to   { opacity: 1; transform: translateY(0); }
}
@keyframes dot-pulse {
  0%, 100% { opacity: 1; transform: scale(1); }
  50%       { opacity: 0.4; transform: scale(0.7); }
}
@keyframes shimmer {
  0%   { background-position: -400px 0; }
  100% { background-position:  400px 0; }
}

.animate-fade-in-up { animation: fadeInUp 350ms var(--ease-out) both; }
.animate-dot-pulse   { animation: dot-pulse 1.8s ease-in-out infinite; }
.animate-shimmer {
  background: linear-gradient(90deg, transparent 0%, rgba(255,255,255,0.04) 50%, transparent 100%);
  background-size: 400px 100%;
  animation: shimmer 1.8s linear infinite;
}

@media (prefers-reduced-motion: reduce) {
  .animate-fade-in-up, .animate-dot-pulse, .animate-shimmer {
    animation: none !important;
    transition: none !important;
  }
}

.font-display { font-family: var(--font-display); }
.font-mono    { font-family: var(--font-mono); }
.tabular      { font-variant-numeric: tabular-nums; }
```

> **Windows NTFS warning:** If the file path contains non-ASCII characters, or if CSS comments use Unicode box-drawing characters (`──`, U+2500), the Write tool may truncate the file silently. Use bash heredoc for CSS files on Windows:
> ```bash
> cat > src/app/globals.css << 'ENDCSS'
> ... file content with ASCII-only comments ...
> ENDCSS
> ```

---

## Phase 3 — Layout and Fonts (`layout.tsx`)

```tsx
import { Inter, Playfair_Display, JetBrains_Mono } from 'next/font/google';

const inter = Inter({ subsets: ['latin'], variable: '--font-body' });
const playfair = Playfair_Display({ subsets: ['latin'], variable: '--font-display' });
const mono = JetBrains_Mono({ subsets: ['latin'], variable: '--font-mono' });

// Apply to <body>: className={`${inter.variable} ${playfair.variable} ${mono.variable}`}
```

Set `lang` to project locale. Apply dark theme to any toast/notification system (e.g., Sonner's `Toaster` accepts `theme="dark"` and custom `toastOptions`).

---

## Phase 4 — UI Primitives

Create these before touching any page. Pages depend on them; rebuilding halfway through creates broken intermediates.

### Button
Use `cva` + Radix `Slot` for `asChild`. Key variants:

```ts
const buttonVariants = cva(
  'inline-flex items-center justify-center gap-2 rounded-[10px] font-semibold transition-all duration-150 focus-visible:ring-2 focus-visible:ring-brand-400/50 disabled:opacity-40 disabled:pointer-events-none',
  {
    variants: {
      variant: {
        primary:   'bg-brand-500 text-brand-fg hover:bg-brand-400 active:scale-[.97]',
        secondary: 'bg-surface-3 text-text hover:bg-surface-hover border border-white/10',
        ghost:     'text-text-muted hover:text-text hover:bg-surface-hover',
        outline:   'border border-white/14 text-text-muted hover:text-text hover:border-white/22',
        danger:    'bg-error/10 text-error border border-error/25 hover:bg-error/18',
        // Legacy aliases:
        default:      '...same as primary...',
        destructive:  '...same as danger...',
      },
      size: {
        sm:      'h-[34px] px-3.5 text-[13px]',
        md:      'h-[42px] px-4.5 text-[14px]',
        lg:      'h-[52px] px-6 text-[16px]',
        icon:    'h-[42px] w-[42px]',
        'icon-sm': 'h-[34px] w-[34px]',
      },
    },
    defaultVariants: { variant: 'primary', size: 'md' },
  }
);
```

After creating Button, find-replace any `variant="default"` residuals across the codebase. Zero should remain.

### Card
```tsx
// Dark surface baseline
<div className="rounded-[18px] border border-white/7 bg-surface p-5">
// With hover
<div className="rounded-[18px] border border-white/7 bg-surface hover:bg-surface-2 hover:border-white/11 hover:-translate-y-px transition-all duration-[250ms]">
```

### Badge
Semantic context variants map to brand colors. Status variants use specific semantics:
- `andamento` / `in-progress` → auto dot-pulse
- `concluido` / `done` → success color
- `bloqueado` → error color
- `novo` → info color

Include a `dot` prop for manual pulse dot on any variant.

### IconContainer
Wraps a lucide icon with consistent colored bg:
```tsx
// Sizes: sm=32px/r8, md=44px/r12, lg=56px/r14
// Colors: brand, emerald, blue, purple, amber, rose, pink, neutral
<div className={cn('flex items-center justify-center rounded-[12px]', sizeClass, colorClass)}>
  <Icon className={iconSize} strokeWidth={1.8} />
</div>
```

### Auth-specific components (create if project has auth pages)
- `AuthShell` — centered dark wrapper with logo + card (see pattern below)
- `AuthField` — `forwardRef` input with label, hint, error, dark styling
- `Toggle` — accessible `role="switch"` button using brand tokens

---

## Phase 5 — App Shell

### Sidebar
Must be a Client Component (`'use client'`) to access `usePathname()`.

Active state pattern:
```tsx
const isActive = pathname === item.href || pathname.startsWith(item.href + '/');
<div className={cn(
  'flex items-center gap-2.5 px-3 h-9 rounded-[10px] text-[13px] font-medium transition-all',
  isActive
    ? 'bg-brand-400/10 text-brand-300 border-l-2 border-brand-400'
    : 'text-text-faint hover:text-text-muted hover:bg-surface-hover',
)}>
  <Icon strokeWidth={isActive ? 2.2 : 1.8} />
  {item.label}
</div>
```

Sidebar background: `bg-sidebar` (the darkest surface).

### TopBar
Dynamic title/subtitle per route via a `VIEW_META` record keyed by pathname prefix.

### Layout wrapper
```tsx
<div className="flex h-screen overflow-hidden bg-bg">
  <AppSidebar />
  <div className="flex flex-col flex-1 min-w-0 overflow-hidden">
    <TopBar />
    <main className="flex-1 overflow-y-auto">
      {children}
    </main>
  </div>
</div>
```

Preserve any existing engines (RecurrenceEngine, modal providers, etc.) in the layout — only swap the shell components.

---

## Phase 6 — Page Redesign

### The core rule
Preserve all business logic verbatim. Replace only visual classes.

**Always preserve:**
- Supabase calls (`supabase.auth.*`, `supabase.from(...)`, etc.)
- Zustand store reads and writes
- Routing logic (`router.push`, `useParams`, redirects, security guards)
- Form submit handlers with error handling
- TypeScript types and interfaces
- All `useEffect` data-fetching logic

**Replace by pattern:**

| Old (light theme) | New (dark tokens) |
|---|---|
| `bg-white` | `bg-surface` |
| `bg-neutral-50` | `bg-surface-2` or `bg-bg` |
| `bg-neutral-100` | `bg-surface-3` |
| `text-neutral-900` | `text-text` |
| `text-neutral-700` | `text-text` |
| `text-neutral-500` | `text-text-muted` |
| `text-neutral-400` | `text-text-faint` |
| `border-neutral-200` | `border-white/7` |
| `border-neutral-300` | `border-white/10` |
| `text-red-500` / `bg-red-50` | `text-error` / `bg-error/8 border-error/25` |
| `bg-emerald-600 hover:bg-emerald-700` | `<Button variant="primary">` |
| `bg-violet-600 hover:bg-violet-700` | `<Button variant="primary">` (or semantic variant) |
| `animate-pulse bg-neutral-100 rounded-xl` | `animate-shimmer rounded-[18px] bg-surface border border-white/7` |
| Loading spinner text (`text-neutral-500`) | Dot-pulse pattern (see Common Patterns) |

### Auth pages

Auth pages skip the app shell. Use `AuthShell`:

```tsx
// AuthShell anatomy
<div className="min-h-screen flex items-center justify-center bg-bg p-4"
  style={{ backgroundImage: 'radial-gradient(ellipse 80% 50% at 50% -10%, rgba(6,182,212,.12), transparent)' }}>
  <div className="w-full max-w-md">
    <div className="flex justify-center mb-8"><Logo /></div>
    <div className="rounded-[20px] border border-white/8 bg-surface shadow-[0_24px_64px_rgba(0,0,0,.5)]">
      <div className="px-8 pt-8 pb-6 border-b border-white/6 text-center">
        <h1 className="font-display text-[24px] font-bold text-text">{title}</h1>
        <p className="mt-1.5 text-[14px] text-text-muted">{description}</p>
      </div>
      <div className="px-8 py-6">{children}</div>
    </div>
  </div>
</div>
```

Multi-step onboarding gets a `StepDots` progress indicator:
```tsx
// Animated bars, not circles
<div className="flex items-center justify-center gap-2 mb-6">
  {Array.from({ length: total }).map((_, i) => (
    <div className={cn('h-1.5 rounded-full transition-all duration-300',
      i < step ? 'bg-brand-400 w-6' : 'bg-white/12 w-3')} />
  ))}
</div>
```

### Module layout pages (`[id]/layout.tsx`)

Tab navigation inside module layouts:
```tsx
<div className="flex items-center gap-1 border-b border-white/8">
  <Link href={href} className={cn(
    'pb-3 px-4 border-b-2 text-[14px] font-medium transition-colors -mb-px',
    isActive
      ? 'border-brand-400 text-brand-300'
      : 'border-transparent text-text-faint hover:text-text-muted hover:border-white/20',
  )}>
```

---

## Phase 7 — Final Verification

Run a grep sweep before declaring done:

```bash
grep -rn "bg-neutral\|text-neutral\|border-neutral\|bg-white[^/]\|text-gray\|bg-gray\|bg-emerald-6\|bg-violet-6\|text-red-500\|bg-red-50\|bg-amber-100\|text-amber-7\|bg-violet-1" \
  --include="*.tsx" src/ 2>/dev/null
```

Any hits in files you haven't touched yet → decide: redesign now or create a follow-up task.

Also verify:
- Every page wrapper has `animate-fade-in-up`
- Loading states use `animate-shimmer` or dot-pulse (not `animate-pulse bg-neutral-100`)
- `prefers-reduced-motion` is respected in `globals.css`
- `Button variant="default"` has zero remaining occurrences outside `button.tsx` itself

---

## Common Patterns Reference

### Error alert
```tsx
<div className="rounded-[10px] border border-error/25 bg-error/8 px-4 py-3 text-[13px] text-error">
  {errorMessage}
</div>
```

### Info/hint box
```tsx
<div className="rounded-[12px] border border-brand-400/15 bg-brand-400/6 px-4 py-3 text-[13px] text-text-muted">
  Informational copy here.
</div>
```

### Shimmer skeleton
```tsx
<div className="h-64 rounded-[18px] bg-surface border border-white/7 animate-shimmer" />
```

### Dot-pulse loading indicator
```tsx
<div className="flex flex-col items-center gap-3">
  <div className="flex gap-1.5">
    {[0, 1, 2].map((i) => (
      <div key={i} className="w-2 h-2 rounded-full bg-brand-400 animate-dot-pulse"
        style={{ animationDelay: `${i * 0.2}s` }} />
    ))}
  </div>
  <p className="text-[13px] text-text-faint">Carregando...</p>
</div>
```

### Subtle gradient card (brand highlight)
```tsx
<div className="rounded-[18px] border border-brand-400/20 p-5"
  style={{ background: 'linear-gradient(135deg, rgba(34,211,238,.10), rgba(34,211,238,.02))' }}>
```

### Status badge (pill)
```tsx
// In-progress with pulse
<span className="inline-flex items-center gap-1.5 text-[11px] font-bold tracking-wide text-warning bg-warning/10 border border-warning/20 px-3 py-1 rounded-full uppercase">
  <span className="w-1.5 h-1.5 rounded-full bg-warning animate-dot-pulse" />
  Em Andamento
</span>
```

### Filter pill group
```tsx
<div className="flex items-center gap-1 p-1 rounded-[10px] bg-surface border border-white/7">
  {options.map(opt => (
    <button key={opt.key} className={cn(
      'px-3 py-1.5 rounded-[8px] text-[13px] font-medium transition-colors whitespace-nowrap',
      active === opt.key
        ? 'bg-brand-400/15 text-brand-300 border border-brand-400/25'
        : 'text-text-muted hover:text-text',
    )}>
      {opt.label}
    </button>
  ))}
</div>
```

### Dark textarea
```tsx
<textarea className="w-full h-48 rounded-[14px] border border-white/10 bg-input px-4 py-3 text-[13px] text-text placeholder:text-text-faint resize-none focus:outline-none focus:border-brand-400/50 focus:ring-2 focus:ring-brand-400/15 transition-colors" />
```

### Avatar stack
```tsx
{initials.map((initial, i) => (
  <div key={i} className="w-6 h-6 rounded-full flex items-center justify-center text-[9px] font-bold text-brand-fg border-2 border-surface"
    style={{
      background: 'linear-gradient(135deg, var(--color-brand-300), var(--color-brand-600))',
      marginLeft: i > 0 ? -8 : 0,
      zIndex: initials.length - i,
    }}>
    {initial}
  </div>
))}
```

---

## Border Opacity Convention

| Class | Use case |
|---|---|
| `border-white/6` | Very subtle, section header dividers |
| `border-white/7` | Standard card borders (most common) |
| `border-white/8` | Slightly more visible separators |
| `border-white/10` | Input borders, focus rings |
| `border-white/14` | Dashed/ghost elements |
| `border-white/20` | Prominent dividers, active states |

---

## Icon Stroke Convention

- `strokeWidth={1.8}` — resting/inactive icons
- `strokeWidth={2.2}` — active, emphasized, or CTAs

---

## Typography Convention

| Class | Font | Use |
|---|---|---|
| `font-display` | Playfair Display | Page headings, brand moments, hero text |
| `font-body` | Inter | Default (implicit) |
| `font-mono` | JetBrains Mono | Timestamps, numbers, code, timers |
| `tabular` | (numeric variant) | Counters, financial figures, timers |

Typical heading scale: `text-[26px] font-display font-bold` for page titles, `text-[18px] font-semibold` for card headers, `text-[15px] font-semibold` for section headers.

---

## Migration Order Checklist

```
[ ] Phase 0 — Read full design handoff (README + screenshots + reference HTML/JSX)
[ ] Phase 1 — Audit conflicts, present list to user, collect decisions
[ ] Phase 2 — globals.css: @theme tokens + animations + utility classes
[ ] Phase 3 — layout.tsx: fonts + lang + toast theme
[ ] Phase 4 — Primitives: Button, Card, Badge, IconContainer (+ AuthShell/AuthField/Toggle if needed)
[ ] Phase 5 — App shell: Sidebar + TopBar + app layout
[ ] Phase 6 — Pages: auth first, then dashboard/overview, then per-module views
[ ] Phase 7 — Final grep sweep + verification checklist
```

Apply `animate-fade-in-up` to every page's root wrapper. Ship each phase before starting the next.
