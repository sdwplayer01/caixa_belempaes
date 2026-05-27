import { db } from '../db.js'
import { state, atualizarHeader } from '../app.js'
import { formatMoeda, formatData, labelStatus } from '../utils.js'
import { abrirModal, fecharModal } from '../components/modal.js'
import { showToast } from '../components/toast.js'
import { route } from '../app.js'

export async function renderContas() {
  atualizarHeader('Contas a Receber')
  const movs = await db.getAll('movimentacoes')
  const pendentes = movs.filter(m => m.tipo==='entrada' && !['pago','cancelado'].includes(m.status))
  const total = pendentes.reduce((s,m) => s + (m.valorTotal - (m.valorRecebido||0)), 0)

  const main = document.getElementById('app-main')
  main.innerHTML = `
    <div class="view-enter">
      <div class="view-header view-header--receber">
        <div class="view-header__title">⬆️ Contas a Receber</div>
        <div class="view-header__amount">${formatMoeda(total)}</div>
        <div class="view-header__sub">${pendentes.length} pendência(s)</div>
      </div>
      <div class="tabs" id="tabs-receber">
        <button class="tab-item tab-item--active" data-tab="todos">Todos<span class="tab-badge">${pendentes.length}</span></button>
        <button class="tab-item" data-tab="fiado">Fiados<span class="tab-badge">${pendentes.filter(m=>m.status==='fiado').length}</span></button>
        <button class="tab-item" data-tab="pendente">Pendentes<span class="tab-badge">${pendentes.filter(m=>m.status==='pendente').length}</span></button>
        <button class="tab-item" data-tab="vencido">Vencidos<span class="tab-badge">${pendentes.filter(m=>m.status==='vencido').length}</span></button>
      </div>
      <div id="lista-receber"></div>
    </div>
  `

  let tabAtiva = 'todos'
  function renderLista() {
    const filtrados = tabAtiva === 'todos' ? pendentes : pendentes.filter(m => m.status === tabAtiva)
    const cats = Object.fromEntries(state.categorias.map(c => [c.id, c]))
    const lista = document.getElementById('lista-receber')

    if (filtrados.length === 0) {
      lista.innerHTML = `<div class="empty-state"><div class="empty-state__icon">✅</div><div class="empty-state__title">Tudo em dia!</div><div class="empty-state__desc">Nenhuma pendência aqui</div></div>`
      return
    }

    lista.innerHTML = filtrados
      .sort((a,b) => (a.dataVencimento||'9').localeCompare(b.dataVencimento||'9'))
      .map(m => {
        const cat = cats[m.categoria] || {}
        const pendente = m.valorTotal - (m.valorRecebido||0)
        return `
          <div class="conta-item">
            <div class="conta-item__header">
              <div>
                <div class="conta-item__desc">${cat.icone||''} ${m.descricao}</div>
              </div>
              <div class="status-chip status-chip--${m.status}">${labelStatus(m.status)}</div>
            </div>
            <div class="conta-item__meta">
              <span class="text-small text-muted">${m.contato || '—'}</span>
              ${m.dataVencimento ? `<span class="text-small" style="color:${m.status==='vencido'?'var(--color-vencido)':'var(--color-pendente)'}">📅 ${formatData(m.dataVencimento,'curto')}</span>` : ''}
              <span class="text-small text-muted">${m.formaPagamento || ''}</span>
            </div>
            <div class="conta-item__footer">
              <div class="conta-item__value" style="color:var(--color-entrada)">${formatMoeda(pendente)}</div>
              <button class="btn btn--sm btn--entrada" data-id="${m.id}" data-valor="${pendente}">Receber →</button>
            </div>
          </div>
        `
      }).join('')

    lista.querySelectorAll('[data-id]').forEach(btn => {
      btn.addEventListener('click', () => {
        const mov = pendentes.find(m => m.id === btn.dataset.id)
        if (mov) abrirModalReceber(mov)
      })
    })
  }

  document.getElementById('tabs-receber').addEventListener('click', (e) => {
    const tab = e.target.closest('.tab-item')
    if (!tab) return
    tabAtiva = tab.dataset.tab
    document.querySelectorAll('.tab-item').forEach(t => t.classList.toggle('tab-item--active', t.dataset.tab === tabAtiva))
    renderLista()
  })

  renderLista()
}

function abrirModalReceber(mov) {
  const pendente = mov.valorTotal - (mov.valorRecebido||0)
  abrirModal(`
    <div class="form-group">
      <label class="form-label">Valor a receber</label>
      <input type="number" id="rec-valor" class="form-input form-input--currency" inputmode="decimal" value="${(pendente/100).toFixed(2)}">
    </div>
    <div class="form-group">
      <label class="form-label">Data do recebimento</label>
      <input type="date" id="rec-data" class="form-input" value="${new Date().toISOString().slice(0,10)}">
    </div>
    <div class="form-group">
      <label class="form-label">Forma de pagamento</label>
      <div class="chips-scroll" id="rec-forma">
        ${['PIX','Dinheiro','Cartão de Débito','Transferência'].map((f,i) => `
          <button type="button" class="chip ${i===0?'chip--selected':''}" data-id="${f.toLowerCase().replace(/ /g,'-')}">
            <span class="chip__label">${f}</span>
          </button>
        `).join('')}
      </div>
    </div>
    <button type="button" id="rec-confirmar" class="btn btn--full btn--entrada" style="margin-top:8px">✅ Confirmar Recebimento</button>
  `, '💚 Registrar Recebimento')

  document.getElementById('rec-forma').addEventListener('click', (e) => {
    const chip = e.target.closest('.chip')
    if (!chip) return
    document.querySelectorAll('#rec-forma .chip').forEach(c => c.classList.remove('chip--selected'))
    chip.classList.add('chip--selected')
  })

  document.getElementById('rec-confirmar').addEventListener('click', async () => {
    const valorRaw   = parseFloat(document.getElementById('rec-valor').value || '0')
    const valorRec   = Math.round(valorRaw * 100)
    const dataRec    = document.getElementById('rec-data').value
    const novoTotal  = (mov.valorRecebido||0) + valorRec
    const novoStatus = novoTotal >= mov.valorTotal ? 'pago' : 'parcial'

    await db.put('movimentacoes', {
      ...mov,
      valorRecebido: novoTotal,
      status: novoStatus,
      dataRecebimento: new Date(dataRec).toISOString(),
      updatedAt: new Date().toISOString()
    })
    fecharModal()
    showToast('✅ Recebimento registrado!', 'success')
    route()
  })
}
