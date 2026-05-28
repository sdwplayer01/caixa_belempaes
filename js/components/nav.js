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
  nav.innerHTML = ITEMS.map(item => {
    if (item.cta) {
      return `
        <button class="nav-item nav-item--cta" data-hash="${item.hash}" aria-label="${item.label}">
          <div class="nav-cta-bubble">
            <i data-lucide="${item.icon}" width="24" height="24" stroke-width="2.2"></i>
          </div>
          <span>${item.label}</span>
        </button>
      `
    }
    return `
      <button class="nav-item" data-hash="${item.hash}" aria-label="${item.label}">
        <i data-lucide="${item.icon}" width="22" height="22" stroke-width="1.8"></i>
        <span>${item.label}</span>
      </button>
    `
  }).join('')

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
    const isActive = btn.dataset.hash === current
    btn.classList.toggle('nav-item--active', isActive)
    const icon = btn.querySelector('i[data-lucide]')
    if (icon && !btn.classList.contains('nav-item--cta')) {
      icon.setAttribute('stroke-width', isActive ? '2.2' : '1.8')
    }
  })
  if (window.lucide) window.lucide.createIcons()
}
