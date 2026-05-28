import { db } from '../db.js'
import { state, atualizarHeader, abrirFormLancamento } from '../app.js'
import { formatMoeda, formatData, calcularKPIs, saudacao, labelStatus } from '../utils.js'

export async function renderDashboard() {
  const nome = state.config.nome_proprietaria || 'Maria'
  const nomeNegocio = state.config.nome_negocio || 'Belém Pães'
  const hoje = new Date().toLocaleDateString('pt-BR', { weekday:'long', day:'numeric', month:'long' })

  atualizarHeader(`🍞 ${nomeNegocio}`, hoje.charAt(0).toUpperCase() + hoje.slice(1))

  const main = document.getElementById('app-main')
  main.innerHTML = `
    <div class="dashboard-greeting view-enter">
      <div class="dashboard-greeting__name">${saudacao(nome)}</div>
    </div>
    <div class="kpi-grid" id="kpi-grid">
      ${[1,2,3,4].map(() => `<div class="kpi-card"><div class="skeleton skeleton--card"></div></div>`).join('')}
    </div>
    <div id="alertas"></div>
    <div class="section-header">
      <span class="section-title">Últimos lançamentos</span>
      <a href="#historico" class="section-link">Ver todos →</a>
    </div>
    <div id="lista-recentes">
      ${[1,2,3].map(() => `<div class="skeleton skeleton--card" style="height:72px;margin-bottom:8px"></div>`).join('')}
    </div>
    <button class="fab" id="fab-novo" aria-label="Novo lançamento">+</button>
  `

  document.getElementById('fab-novo').addEventListener('click', () => abrirFormLancamento())

  const movs = await db.getAll('movimentacoes')
  const kpis = calcularKPIs(movs)

  renderKPIs(kpis)
  renderAlertas(kpis)
  renderRecentes(movs.slice().sort((a,b) => b.dataCriacao?.localeCompare(a.dataCriacao)).slice(0,5))
}

function renderKPIs({ receitaPaga, gastosPagos, saldo, totalReceber, vencidos }) {
  const grid = document.getElementById('kpi-grid')
  grid.innerHTML = `
    <article class="kpi-card kpi-card--entrada" data-href="#historico">
      <header class="kpi-card__header"><span class="kpi-card__icon">✅</span><span class="kpi-card__label">Receita Paga</span></header>
      <div class="kpi-card__value">${formatMoeda(receitaPaga)}</div>
      <footer class="kpi-card__footer">este mês</footer>
    </article>
    <article class="kpi-card kpi-card--saida" data-href="#historico">
      <header class="kpi-card__header"><span class="kpi-card__icon">📤</span><span class="kpi-card__label">Gastos Pagos</span></header>
      <div class="kpi-card__value">${formatMoeda(gastosPagos)}</div>
      <footer class="kpi-card__footer">este mês</footer>
    </article>
    <article class="kpi-card ${saldo >= 0 ? 'kpi-card--saldo-pos' : 'kpi-card--saldo-neg'}" data-href="#relatorios">
      <header class="kpi-card__header"><span class="kpi-card__icon">💰</span><span class="kpi-card__label">Saldo Atual</span></header>
      <div class="kpi-card__value" style="color:${saldo>=0?'var(--color-entrada)':'var(--color-saida)'}">${formatMoeda(saldo)}</div>
      <footer class="kpi-card__footer">realizado</footer>
    </article>
    <article class="kpi-card kpi-card--pendente" data-href="#receber">
      <header class="kpi-card__header"><span class="kpi-card__icon">⏳</span><span class="kpi-card__label">A Receber</span></header>
      <div class="kpi-card__value" style="color:var(--color-pendente)">${formatMoeda(totalReceber)}</div>
      <footer class="kpi-card__footer">total em aberto</footer>
    </article>
  `
  grid.querySelectorAll('.kpi-card[data-href]').forEach(card => {
    card.addEventListener('click', () => { location.hash = card.dataset.href })
  })
}

function renderAlertas({ vencidos }) {
  const container = document.getElementById('alertas')
  if (vencidos.length === 0) { container.innerHTML = ''; return }
  const total = vencidos.reduce((s,m) => s + m.valorTotal, 0)
  container.innerHTML = `
    <div class="alert alert--warning">
      <div class="alert__content">
        <div class="alert__title">⚠️ Você tem ${vencidos.length} item(s) vencido(s)</div>
        <div class="alert__desc">${formatMoeda(total)} em recebimentos atrasados</div>
      </div>
      <a href="#receber" class="alert__action">Ver →</a>
    </div>
  `
}

function renderRecentes(movs) {
  const lista = document.getElementById('lista-recentes')
  if (movs.length === 0) {
    lista.innerHTML = `
      <div class="empty-state">
        <div class="empty-state__icon">🍞</div>
        <div class="empty-state__title">Nenhum lançamento ainda</div>
        <div class="empty-state__desc">Registre sua primeira venda ou gasto</div>
        <button class="btn btn--accent" onclick="document.getElementById('fab-novo').click()">+ Novo lançamento</button>
      </div>
    `
    return
  }

  const cats = Object.fromEntries((state.categorias || []).map(c => [c.id, c]))

  lista.innerHTML = movs.map(m => {
    const cat = cats[m.categoria] || {}
    return `
      <div class="mov-item mov-item--${m.tipo}" data-id="${m.id}">
        <div class="mov-item__icon">${cat.icone || (m.tipo==='entrada'?'⬆️':'⬇️')}</div>
        <div class="mov-item__content">
          <div class="mov-item__title">${m.descricao}</div>
          <div class="mov-item__meta">
            <span class="mov-item__contato">${m.contato || '—'}</span>
            <span class="mov-item__date">${formatData(m.dataMovimento,'curto')}</span>
          </div>
        </div>
        <div class="mov-item__right">
          <div class="mov-item__value">${m.tipo==='saida'?'−':''}${formatMoeda(m.valorTotal)}</div>
          <div class="status-chip status-chip--${m.status}" style="margin-top:4px">${labelStatus(m.status)}</div>
        </div>
      </div>
    `
  }).join('')
}

