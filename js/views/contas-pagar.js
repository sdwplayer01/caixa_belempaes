import { db } from '../db.js'
import { state, atualizarHeader } from '../app.js'
import { formatMoeda, formatData, labelStatus } from '../utils.js'
import { abrirModal, fecharModal } from '../components/modal.js'
import { showToast } from '../components/toast.js'
import { route } from '../app.js'

export async function renderContasPagar() {
  atualizarHeader('Contas a Pagar')
  const movs = await db.getAll('movimentacoes')
  const pendentes = movs.filter(m => m.tipo==='saida' && !['pago','cancelado'].includes(m.status))
  const total = pendentes.reduce((s,m) => s + m.valorTotal, 0)

  const main = document.getElementById('app-main')
  main.innerHTML = `
    <div class="view-enter">
      <div class="view-header view-header--pagar">
        <div class="view-header__title">⬇️ Contas a Pagar</div>
        <div class="view-header__amount">${formatMoeda(total)}</div>
        <div class="view-header__sub">${pendentes.length} pendência(s)</div>
      </div>
      <div class="tabs" id="tabs-pagar">
        <button class="tab-item tab-item--active" data-tab="todos">Todos<span class="tab-badge">${pendentes.length}</span></button>
        <button class="tab-item" data-tab="vencido">Vencidos<span class="tab-badge">${pendentes.filter(m=>m.status==='vencido').length}</span></button>
        <button class="tab-item" data-tab="pendente">Pendentes<span class="tab-badge">${pendentes.filter(m=>m.status==='pendente').length}</span></button>
        <button class="tab-item" data-tab="agendado">Agendados<span class="tab-badge">${pendentes.filter(m=>m.status==='agendado').length}</span></button>
      </div>
      <div id="lista-pagar"></div>
    </div>
  `

  let tabAtiva = 'todos'
  function renderLista() {
    const filtrados = tabAtiva === 'todos' ? pendentes : pendentes.filter(m => m.status === tabAtiva)
    const cats = Object.fromEntries(state.categorias.map(c => [c.id, c]))
    const lista = document.getElementById('lista-pagar')

    if (filtrados.length === 0) {
      lista.innerHTML = `<div class="empty-state"><div class="empty-state__icon">✅</div><div class="empty-state__title">Tudo em dia!</div><div class="empty-state__desc">Nenhuma conta pendente aqui</div></div>`
      return
    }

    lista.innerHTML = filtrados
      .sort((a,b) => (a.dataVencimento||'9').localeCompare(b.dataVencimento||'9'))
      .map(m => {
        const cat = cats[m.categoria] || {}
        return `
          <div class="conta-item">
            <div class="conta-item__header">
              <div class="conta-item__desc">${cat.icone||''} ${m.descricao}</div>
              <div class="status-chip status-chip--${m.status}">${labelStatus(m.status)}</div>
            </div>
            <div class="conta-item__meta">
              <span class="text-small text-muted">${m.contato || '—'}</span>
              ${m.dataVencimento ? `<span class="text-small" style="color:${m.status==='vencido'?'var(--color-vencido)':'var(--color-pendente)'}">📅 ${formatData(m.dataVencimento,'curto')}</span>` : ''}
            </div>
            <div class="conta-item__footer">
              <div class="conta-item__value" style="color:var(--color-saida)">${formatMoeda(m.valorTotal)}</div>
              <button class="btn btn--sm btn--saida" data-id="${m.id}">Pagar →</button>
            </div>
          </div>
        `
      }).join('')

    lista.querySelectorAll('[data-id]').forEach(btn => {
      btn.addEventListener('click', () => {
        const mov = pendentes.find(m => m.id === btn.dataset.id)
        if (mov) abrirModalPagar(mov)
      })
    })
  }

  document.getElementById('tabs-pagar').addEventListener('click', (e) => {
    const tab = e.target.closest('.tab-item')
    if (!tab) return
    tabAtiva = tab.dataset.tab
    document.querySelectorAll('#tabs-pagar .tab-item').forEach(t => t.classList.toggle('tab-item--active', t.dataset.tab === tabAtiva))
    renderLista()
  })

  renderLista()
}

function abrirModalPagar(mov) {
  abrirModal(`
    <div class="form-group">
      <label class="form-label">Valor pago</label>
      <input type="number" id="pag-valor" class="form-input form-input--currency" inputmode="decimal" value="${(mov.valorTotal/100).toFixed(2)}">
    </div>
    <div class="form-group">
      <label class="form-label">Data do pagamento</label>
      <input type="date" id="pag-data" class="form-input" value="${new Date().toISOString().slice(0,10)}">
    </div>
    <button type="button" id="pag-confirmar" class="btn btn--full btn--saida" style="margin-top:8px">✅ Confirmar Pagamento</button>
  `, '💸 Registrar Pagamento')

  document.getElementById('pag-confirmar').addEventListener('click', async () => {
    const dataRec = document.getElementById('pag-data').value
    await db.put('movimentacoes', {
      ...mov,
      status: 'pago',
      dataRecebimento: new Date(dataRec).toISOString(),
      updatedAt: new Date().toISOString()
    })
    fecharModal()
    showToast('✅ Pagamento registrado!', 'success')
    route()
  })
}
