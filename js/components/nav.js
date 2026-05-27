import { abrirFormLancamento } from './form-lancamento.js'

const ITEMS = [
  { hash:'#dashboard',     icon:'home',         label:'Início' },
  { hash:'#historico',     icon:'arrow-up-down',label:'Histórico' },
  { hash:'lancamento',     icon:'plus',         label:'Lançar', cta: true },
  { hash:'#relatorios',    icon:'bar-chart-2',  label:'Relatórios' },
  { hash:'#configuracoes', icon:'settings',     label:'Config' },
]

export function renderNav() {
  const nav = document.getElementById('app-nav')
  nav.innerHTML = ITEMS.map(item => `
    <button class="nav-item ${item.cta ? 'nav-item--cta' : ''}" data-hash="${item.hash}" aria-label="${item.label}">
      <i data-lucide="${item.icon}" width="22" height="22"></i>
      <span>${item.label}</span>
    </button>
  `).join('')
  if (window.lucide) window.lucide.createIcons()

  nav.addEventListener('click', (e) => {
    const btn = e.target.closest('.nav-item')
    if (!btn) return
    const hash = btn.dataset.hash
    if (hash === 'lancamento') {
      abrirFormLancamento()
    } else {
      location.hash = hash
    }
  })

  window.addEventListener('hashchange', () => atualizarNavAtivo())
  atualizarNavAtivo()
}

function atualizarNavAtivo() {
  const current = location.hash || '#dashboard'
  document.querySelectorAll('.nav-item').forEach(btn => {
    btn.classList.toggle('nav-item--active', btn.dataset.hash === current)
  })
}
