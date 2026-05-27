import { db } from './db.js'
import { showToast } from './components/toast.js'
import { renderNav } from './components/nav.js'
import { renderDashboard } from './views/dashboard.js'
import { renderHistorico } from './views/historico.js'
import { renderContas } from './views/contas-receber.js'
import { renderContasPagar } from './views/contas-pagar.js'
import { renderRelatorios } from './views/relatorios.js'
import { renderConfiguracoes } from './views/configuracoes.js'

const SEED_CATEGORIAS = [
  { id:'venda-feira',   nome:'Venda em Feira',          tipo:'entrada', icone:'🏪', ativo:true },
  { id:'venda-fixa',    nome:'Cliente Fixo (Entrega)',   tipo:'entrada', icone:'📦', ativo:true },
  { id:'encomenda',     nome:'Encomenda Especial',       tipo:'entrada', icone:'🎂', ativo:true },
  { id:'venda-loja',    nome:'Parceiro Loja / Mercado',  tipo:'entrada', icone:'🛒', ativo:true },
  { id:'revenda',       nome:'Sacoleira / Revendedora',  tipo:'entrada', icone:'🧺', ativo:true },
  { id:'venda-avulsa',  nome:'Venda Avulsa',             tipo:'entrada', icone:'💰', ativo:true },
  { id:'outro-entrada', nome:'Outra Receita',            tipo:'entrada', icone:'➕', ativo:true },
  { id:'farinha',       nome:'Farinha / Trigo',          tipo:'saida',   icone:'🌾', ativo:true },
  { id:'fermento',      nome:'Fermento / Levain',        tipo:'saida',   icone:'🧫', ativo:true },
  { id:'ingredientes',  nome:'Ingredientes em Geral',    tipo:'saida',   icone:'🧂', ativo:true },
  { id:'embalagens',    nome:'Embalagens / Sacos',       tipo:'saida',   icone:'🛍️', ativo:true },
  { id:'gas',           nome:'Gás / Energia',            tipo:'saida',   icone:'🔥', ativo:true },
  { id:'aluguel',       nome:'Aluguel / Espaço',         tipo:'saida',   icone:'🏠', ativo:true },
  { id:'transporte',    nome:'Transporte / Frete',       tipo:'saida',   icone:'🚗', ativo:true },
  { id:'feira-taxa',    nome:'Taxa de Feira / Evento',   tipo:'saida',   icone:'🎪', ativo:true },
  { id:'equipamento',   nome:'Equipamento / Utensílio',  tipo:'saida',   icone:'🔧', ativo:true },
  { id:'marketing',     nome:'Marketing / Divulgação',   tipo:'saida',   icone:'📣', ativo:true },
  { id:'imposto',       nome:'Imposto / DAS',            tipo:'saida',   icone:'📄', ativo:true },
  { id:'pro-labore',    nome:'Pró-Labore Próprio',       tipo:'saida',   icone:'👤', ativo:true },
  { id:'outro-saida',   nome:'Outro Gasto',              tipo:'saida',   icone:'➖', ativo:true },
]

const SEED_FORMAS = [
  { id:'pix',          nome:'PIX',              liquidezDias: 0  },
  { id:'dinheiro',     nome:'Dinheiro',         liquidezDias: 0  },
  { id:'cartao-deb',   nome:'Cartão de Débito', liquidezDias: 1  },
  { id:'cartao-cred',  nome:'Cartão de Crédito',liquidezDias: 30 },
  { id:'transferencia',nome:'Transferência',    liquidezDias: 1  },
  { id:'boleto',       nome:'Boleto',           liquidezDias: 2  },
  { id:'fiado',        nome:'Fiado / A Prazo',  liquidezDias: -1 },
]

export const state = {
  categorias: [],
  formas: [],
  config: {},
}

const ROUTES = {
  '#dashboard':      renderDashboard,
  '#historico':      renderHistorico,
  '#receber':        renderContas,
  '#pagar':          renderContasPagar,
  '#relatorios':     renderRelatorios,
  '#configuracoes':  renderConfiguracoes,
}

async function init() {
  await seedIfNeeded()
  await loadState()
  await verificarVencimentos()

  const loading = document.getElementById('loading-screen')
  loading.classList.add('fade-out')
  setTimeout(() => loading.remove(), 400)

  document.getElementById('app-header').hidden = false
  document.getElementById('app-nav').hidden = false
  renderNav()

  window.addEventListener('hashchange', route)
  if (!location.hash || location.hash === '#') location.hash = '#dashboard'
  else route()
}

export function route() {
  const hash = location.hash || '#dashboard'
  const fn = ROUTES[hash]
  if (fn) {
    const main = document.getElementById('app-main')
    main.innerHTML = ''
    fn()
  }
}

async function seedIfNeeded() {
  const count = await db.count('categorias')
  if (count === 0) {
    await db.seed('categorias', SEED_CATEGORIAS)
    await db.seed('formas_pagamento', SEED_FORMAS)
    await db.put('configuracoes', { key:'nome_negocio',     value:'Belém Pães' })
    await db.put('configuracoes', { key:'nome_proprietaria',value:'Maria' })
    await db.put('configuracoes', { key:'cor_tema',         value:'warm' })
    await db.put('configuracoes', { key:'primeiro_acesso',  value:true })
  }
}

export async function loadState() {
  state.categorias = await db.getAll('categorias')
  state.formas     = await db.getAll('formas_pagamento')
  const configs    = await db.getAll('configuracoes')
  state.config     = Object.fromEntries(configs.map(c => [c.key, c.value]))

  const tema = state.config.cor_tema || 'warm'
  document.documentElement.setAttribute('data-theme', tema === 'dark' ? 'dark' : '')
}

async function verificarVencimentos() {
  const hoje = new Date(); hoje.setHours(0,0,0,0)
  const pendentes = await db.getByIndex('movimentacoes', 'by-status', 'pendente')
  const vencer = pendentes.filter(m => {
    if (!m.dataVencimento) return false
    const v = new Date(m.dataVencimento); v.setHours(0,0,0,0)
    return v < hoje
  })
  if (vencer.length > 0) {
    const atualizados = vencer.map(m => ({ ...m, status:'vencido', updatedAt: new Date().toISOString() }))
    await db.putMany('movimentacoes', atualizados)
    showToast(`⚠️ ${vencer.length} lançamento(s) vencido(s)`, 'warning')
  }
}

export function atualizarHeader(titulo, subtitulo = '') {
  const h = document.getElementById('app-header')
  h.innerHTML = `
    <div>
      <div class="app-header__title">${titulo}</div>
      ${subtitulo ? `<div class="app-header__sub">${subtitulo}</div>` : ''}
    </div>
  `
}

document.addEventListener('DOMContentLoaded', init)

export { showToast }

export async function abrirFormLancamento(mov = null) {
  const { abrirFormLancamento: fn } = await import('./components/form-lancamento.js')
  fn(mov)
}
