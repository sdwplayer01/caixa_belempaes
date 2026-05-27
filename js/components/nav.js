import { abrirFormLancamento } from './form-lancamento.js'

const ITEMS = [
  { hash:'#dashboard',     icon:'🏠', label:'Início' },
  { hash:'#historico',     icon:'↕️', label:'Histórico' },
  { hash:'lancamento',     icon:'💸', label:'Lançar', cta: true },
  { hash:'#relatorios',    icon:'📊', label:'Relatórios' },
  { hash:'#configuracoes', icon:'⚙️', label:'Config' },
]

export function renderNav() {
  const nav = document.getElementById('app-nav')
  nav.innerHTML = ITEMS.map(item => `
    <button class="nav-item ${item.cta ? 'nav-item--cta' : ''}" data-hash="${item.hash}" aria-label="${item.label}">
      <span class="nav-item__icon">${item.icon}</span>
      <span>${item.label}</span>
    </button>
  `).join('')

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
