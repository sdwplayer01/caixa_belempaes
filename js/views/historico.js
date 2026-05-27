import { db } from '../db.js'
import { state, atualizarHeader, abrirFormLancamento } from '../app.js'
import { formatMoeda, formatData, agruparPorData, labelStatus } from '../utils.js'

let filtros = { tipo: 'todos', periodo: 'mes', status: 'todos', busca: '' }

export async function renderHistorico() {
  atualizarHeader('Histórico')
  const main = document.getElementById('app-main')
  main.innerHTML = `
    <div class="view-enter">
      <div class="filter-bar">
        <button class="filter-pill ${filtros.tipo==='todos'?'filter-pill--active':''}" data-f="tipo" data-v="todos">Todos</button>
        <button class="filter-pill ${filtros.tipo==='entrada'?'filter-pill--active':''}" data-f="tipo" data-v="entrada">⬆️ Entradas</button>
        <button class="filter-pill ${filtros.tipo==='saida'?'filter-pill--active':''}" data-f="tipo" data-v="saida">⬇️ Saídas</button>
        <button class="filter-pill ${filtros.periodo==='hoje'?'filter-pill--active':''}" data-f="periodo" data-v="hoje">Hoje</button>
        <button class="filter-pill ${filtros.periodo==='semana'?'filter-pill--active':''}" data-f="periodo" data-v="semana">Semana</button>
        <button class="filter-pill ${filtros.periodo==='mes'?'filter-pill--active':''}" data-f="periodo" data-v="mes">Este mês</button>
        <button class="filter-pill ${filtros.periodo==='mes-passado'?'filter-pill--active':''}" data-f="periodo" data-v="mes-passado">Mês passado</button>
        <button class="filter-pill ${filtros.periodo==='todos'?'filter-pill--active':''}" data-f="periodo" data-v="todos">Tudo</button>
      </div>
      <div class="filter-bar" style="margin-top:-8px">
        <button class="filter-pill ${filtros.status==='todos'?'filter-pill--active':''}" data-f="status" data-v="todos">Todos status</button>
        <button class="filter-pill ${filtros.status==='pago'?'filter-pill--active':''}" data-f="status" data-v="pago">Pago</button>
        <button class="filter-pill ${filtros.status==='pendente'?'filter-pill--active':''}" data-f="status" data-v="pendente">Pendente</button>
        <button class="filter-pill ${filtros.status==='vencido'?'filter-pill--active':''}" data-f="status" data-v="vencido">Vencido</button>
        <button class="filter-pill ${filtros.status==='fiado'?'filter-pill--active':''}" data-f="status" data-v="fiado">Fiado</button>
      </div>
      <div id="lista-historico"></div>
      <div id="summary-bar-container"></div>
    </div>
    <button class="fab" id="fab-hist" aria-label="Novo lançamento">+</button>
  `

  document.getElementById('fab-hist').addEventListener('click', () => abrirFormLancamento())

  main.querySelectorAll('.filter-pill').forEach(btn => {
    btn.addEventListener('click', () => {
      filtros[btn.dataset.f] = btn.dataset.v
      renderHistorico()
    })
  })

  await carregarLista()
}

async function carregarLista() {
  let movs = await db.getAll('movimentacoes')
  movs = aplicarFiltros(movs)

  const lista = document.getElementById('lista-historico')
  const cats = Object.fromEntries(state.categorias.map(c => [c.id, c]))

  if (movs.length === 0) {
    lista.innerHTML = `
      <div class="empty-state">
        <div class="empty-state__icon">🔍</div>
        <div class="empty-state__title">Nenhum resultado</div>
        <div class="empty-state__desc">Tente ajustar os filtros</div>
      </div>
    `
    document.getElementById('summary-bar-container').innerHTML = ''
    return
  }

  const grupos = agruparPorData(movs)
  lista.innerHTML = grupos.map(([data, itens]) => {
    const saldoDia = itens.reduce((s,m) => m.tipo==='entrada' ? s+m.valorTotal : s-m.valorTotal, 0)
    return `
      <div class="date-divider">
        <div class="date-divider__line"></div>
        <div class="date-divider__text">${formatData(data + 'T12:00:00', 'extenso')}</div>
        <div class="date-divider__line"></div>
      </div>
      ${itens.map(m => renderMovItem(m, cats)).join('')}
      <div style="text-align:right;font:600 .8125rem/1 var(--font-body);color:${saldoDia>=0?'var(--color-entrada)':'var(--color-saida)'};margin:4px 0 16px;padding-right:4px">
        Saldo do dia: ${saldoDia>=0?'+':''}${formatMoeda(saldoDia)}
      </div>
    `
  }).join('')

  lista.addEventListener('click', (e) => {
    const item = e.target.closest('.mov-item')
    if (!item) return
    const id = item.dataset.id
    const mov = movs.find(m => m.id === id)
    if (mov) abrirFormLancamento(mov)
  })

  const entrada = movs.filter(m => m.tipo==='entrada').reduce((s,m) => s+m.valorTotal, 0)
  const saida   = movs.filter(m => m.tipo==='saida').reduce((s,m) => s+m.valorTotal, 0)
  document.getElementById('summary-bar-container').innerHTML = `
    <div class="summary-bar">
      <div class="summary-bar__item"><span>${movs.length} lançamentos</span></div>
      <div class="summary-bar__item"><span>Receitas</span><span class="summary-bar__value text-entrada">${formatMoeda(entrada)}</span></div>
      <div class="summary-bar__item"><span>Gastos</span><span class="summary-bar__value text-saida">${formatMoeda(saida)}</span></div>
    </div>
  `
}

function renderMovItem(m, cats) {
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
}

function aplicarFiltros(movs) {
  const hoje = new Date(); hoje.setHours(0,0,0,0)

  return movs.filter(m => {
    if (filtros.tipo !== 'todos' && m.tipo !== filtros.tipo) return false
    if (filtros.status !== 'todos' && m.status !== filtros.status) return false

    if (filtros.periodo !== 'todos') {
      const d = new Date(m.dataMovimento); d.setHours(0,0,0,0)
      if (filtros.periodo === 'hoje') return d.getTime() === hoje.getTime()
      if (filtros.periodo === 'semana') {
        const semana = new Date(hoje); semana.setDate(hoje.getDate() - 7)
        return d >= semana
      }
      if (filtros.periodo === 'mes') return d.getMonth() === hoje.getMonth() && d.getFullYear() === hoje.getFullYear()
      if (filtros.periodo === 'mes-passado') {
        const mp = new Date(hoje.getFullYear(), hoje.getMonth()-1, 1)
        return d.getMonth() === mp.getMonth() && d.getFullYear() === mp.getFullYear()
      }
    }
    return true
  }).sort((a,b) => b.dataMovimento.localeCompare(a.dataMovimento))
}
