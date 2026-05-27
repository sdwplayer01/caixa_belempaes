import { db } from '../db.js'
import { gerarId, gerarParcelas, dataHoje } from '../utils.js'
import { state, route } from '../app.js'
import { abrirModal, fecharModal } from './modal.js'
import { showToast } from './toast.js'

export function abrirFormLancamento(movExistente = null) {
  const isEdicao = !!movExistente
  renderEtapa1(movExistente)
}

function renderEtapa1(mov = null) {
  const tipo = mov?.tipo || null
  abrirModal(`
    <div id="form-lancamento">
      ${!mov ? `
      <div class="type-selector" id="type-selector">
        <button class="type-card type-card--entrada ${tipo==='entrada'?'selected':''}" data-tipo="entrada">
          <span class="type-card__emoji">⬆️</span>
          <span class="type-card__label">RECEBI</span>
          <span class="type-card__sub">uma venda</span>
        </button>
        <button class="type-card type-card--saida ${tipo==='saida'?'selected':''}" data-tipo="saida">
          <span class="type-card__emoji">⬇️</span>
          <span class="type-card__label">GASTEI</span>
          <span class="type-card__sub">um valor</span>
        </button>
      </div>
      <div id="form-body" ${tipo ? '' : 'hidden'}></div>
      ` : `<div id="form-body"></div>`}
    </div>
  `, mov ? 'Editar Lançamento' : 'Novo Lançamento', null)

  if (mov) {
    renderFormBody(mov.tipo, mov)
    return
  }

  document.getElementById('type-selector').addEventListener('click', (e) => {
    const card = e.target.closest('.type-card')
    if (!card) return
    document.querySelectorAll('.type-card').forEach(c => c.classList.remove('selected'))
    card.classList.add('selected')
    document.getElementById('form-body').hidden = false
    renderFormBody(card.dataset.tipo, mov)
  })

  if (tipo) renderFormBody(tipo, mov)
}

function renderFormBody(tipo, mov = null) {
  const cats = state.categorias.filter(c => c.tipo === tipo || c.tipo === 'ambos').filter(c => c.ativo)
  const formas = state.formas

  const body = document.getElementById('form-body')
  body.innerHTML = `
    <div class="form-group">
      <label class="form-label">Quando foi?</label>
      <input type="date" id="f-data" class="form-input" value="${(mov?.dataMovimento || new Date().toISOString()).slice(0,10)}" max="${dataHoje()}">
    </div>

    <div class="form-group">
      <label class="form-label">O que foi?</label>
      <div class="chips-scroll" id="f-categoria">
        ${cats.map(c => `
          <button type="button" class="chip ${mov?.categoria === c.id ? 'chip--selected' : ''}" data-id="${c.id}">
            <span class="chip__icon">${c.icone}</span>
            <span class="chip__label">${c.nome}</span>
          </button>
        `).join('')}
      </div>
    </div>

    <div class="form-group">
      <label class="form-label">Descrição</label>
      <input type="text" id="f-descricao" class="form-input" placeholder="Ex: 15 pães de fermentação natural" value="${mov?.descricao || ''}">
    </div>

    <div class="form-group">
      <label class="form-label">Quem? (cliente ou fornecedor)</label>
      <input type="text" id="f-contato" class="form-input" placeholder="Ex: Maria – sacoleira" value="${mov?.contato || ''}" list="contatos-list">
      <datalist id="contatos-list"></datalist>
    </div>

    <div class="form-group">
      <label class="form-label">Como pagou / recebeu?</label>
      <div class="chips-scroll" id="f-forma">
        ${formas.map(f => `
          <button type="button" class="chip ${mov?.formaPagamento === f.id ? 'chip--selected' : ''}" data-id="${f.id}">
            <span class="chip__label">${f.nome}</span>
          </button>
        `).join('')}
      </div>
    </div>

    <div class="form-group">
      <label class="form-label">Valor total</label>
      <input type="number" id="f-valor" class="form-input form-input--currency" inputmode="decimal" placeholder="0,00" min="0" step="0.01" value="${mov ? (mov.valorTotal/100).toFixed(2) : ''}">
    </div>

    <div class="form-group">
      <label class="form-label">Status</label>
      <div class="toggle-group" id="f-status">
        ${[['pago','Pago'],['pendente','Pendente'],['fiado','Fiado']].map(([v,l]) => `
          <button type="button" class="toggle-btn ${(mov?.status||'pago')===v ? 'toggle-btn--active' : ''}" data-val="${v}">${l}</button>
        `).join('')}
      </div>
    </div>

    <div id="f-vencimento-group" class="form-group" hidden>
      <label class="form-label">Quando vence?</label>
      <input type="date" id="f-vencimento" class="form-input" value="${mov?.dataVencimento?.slice(0,10) || ''}">
    </div>

    <div id="f-parcial-group" class="form-group" hidden>
      <label class="form-label">Quanto já recebeu?</label>
      <input type="number" id="f-valor-recebido" class="form-input form-input--currency" inputmode="decimal" placeholder="0,00" min="0" step="0.01" value="${mov ? ((mov.valorRecebido||0)/100).toFixed(2) : ''}">
    </div>

    <div class="form-group">
      <label class="form-label">É parcelado?</label>
      <div class="toggle-group">
        <button type="button" class="toggle-btn ${mov?.parcelado ? 'toggle-btn--active' : ''}" id="f-parcelado-btn">Parcelar</button>
      </div>
    </div>

    <div id="f-parcelas-group" class="form-group" ${mov?.parcelado ? '' : 'hidden'}>
      <label class="form-label">Quantas parcelas?</label>
      <div class="stepper">
        <button type="button" class="stepper__btn" id="parcelas-menos">−</button>
        <span class="stepper__value" id="parcelas-valor">${mov?.totalParcelas || 2}</span>
        <button type="button" class="stepper__btn" id="parcelas-mais">+</button>
      </div>
    </div>

    <div class="form-group">
      <label class="form-label">Observações</label>
      <textarea id="f-observacoes" class="form-input" placeholder="Algo importante...">${mov?.observacoes || ''}</textarea>
    </div>

    <button type="button" id="f-salvar" class="btn btn--full ${tipo==='entrada' ? 'btn--entrada' : 'btn--saida'}" style="margin-top:8px">
      💾 ${mov ? 'Atualizar Lançamento' : 'Salvar Lançamento'}
    </button>
    ${mov ? `<button type="button" id="f-cancelar-mov" class="btn btn--full btn--ghost" style="margin-top:8px; color: var(--color-saida)">🗑️ Excluir lançamento</button>` : ''}
  `

  preencherContatos()
  bindFormEvents(tipo, mov)
}

async function preencherContatos() {
  const movs = await db.getAll('movimentacoes')
  const contatos = [...new Set(movs.map(m => m.contato).filter(Boolean))]
  const dl = document.getElementById('contatos-list')
  if (dl) dl.innerHTML = contatos.map(c => `<option value="${c}">`).join('')
}

function bindFormEvents(tipo, mov) {
  let parcelado = mov?.parcelado || false
  let numParcelas = mov?.totalParcelas || 2

  document.getElementById('f-categoria')?.addEventListener('click', (e) => {
    const chip = e.target.closest('.chip')
    if (!chip) return
    document.querySelectorAll('#f-categoria .chip').forEach(c => c.classList.remove('chip--selected'))
    chip.classList.add('chip--selected')
  })

  document.getElementById('f-forma')?.addEventListener('click', (e) => {
    const chip = e.target.closest('.chip')
    if (!chip) return
    document.querySelectorAll('#f-forma .chip').forEach(c => c.classList.remove('chip--selected'))
    chip.classList.add('chip--selected')
  })

  document.getElementById('f-status')?.addEventListener('click', (e) => {
    const btn = e.target.closest('.toggle-btn')
    if (!btn) return
    document.querySelectorAll('#f-status .toggle-btn').forEach(b => b.classList.remove('toggle-btn--active'))
    btn.classList.add('toggle-btn--active')
    const val = btn.dataset.val
    document.getElementById('f-vencimento-group').hidden = !['pendente','agendado','parcial'].includes(val)
    document.getElementById('f-parcial-group').hidden = val !== 'parcial'
  })

  const statusAtivo = mov?.status || 'pago'
  document.getElementById('f-vencimento-group').hidden = !['pendente','agendado','parcial'].includes(statusAtivo)
  document.getElementById('f-parcial-group').hidden = statusAtivo !== 'parcial'

  document.getElementById('f-parcelado-btn')?.addEventListener('click', (e) => {
    parcelado = !parcelado
    e.currentTarget.classList.toggle('toggle-btn--active', parcelado)
    document.getElementById('f-parcelas-group').hidden = !parcelado
  })

  document.getElementById('parcelas-menos')?.addEventListener('click', () => {
    if (numParcelas > 2) numParcelas--
    document.getElementById('parcelas-valor').textContent = numParcelas
  })
  document.getElementById('parcelas-mais')?.addEventListener('click', () => {
    if (numParcelas < 24) numParcelas++
    document.getElementById('parcelas-valor').textContent = numParcelas
  })

  document.getElementById('f-salvar')?.addEventListener('click', () => salvarLancamento(tipo, mov, parcelado, numParcelas))

  document.getElementById('f-cancelar-mov')?.addEventListener('click', async () => {
    if (!confirm('Excluir este lançamento?')) return
    await db.delete('movimentacoes', mov.id)
    fecharModal()
    showToast('Lançamento excluído', 'info')
    route()
  })
}

async function salvarLancamento(tipo, movExistente, parcelado, numParcelas) {
  const categoria    = document.querySelector('#f-categoria .chip--selected')?.dataset.id
  const forma        = document.querySelector('#f-forma .chip--selected')?.dataset.id
  const statusBtn    = document.querySelector('#f-status .toggle-btn--active')
  const descricao    = document.getElementById('f-descricao').value.trim()
  const valorRaw     = parseFloat(document.getElementById('f-valor').value || '0')
  const valorTotal   = Math.round(valorRaw * 100)

  if (!categoria) { showToast('Selecione uma categoria', 'error'); return }
  if (!descricao) { showToast('Informe uma descrição', 'error'); return }
  if (valorTotal <= 0) { showToast('Informe um valor maior que zero', 'error'); return }
  if (!forma) { showToast('Selecione a forma de pagamento', 'error'); return }

  const status           = statusBtn?.dataset.val || 'pago'
  const dataMovimento    = document.getElementById('f-data').value || new Date().toISOString().slice(0,10)
  const dataVencimento   = document.getElementById('f-vencimento')?.value ? new Date(document.getElementById('f-vencimento').value).toISOString() : null
  const valorRecebidoRaw = parseFloat(document.getElementById('f-valor-recebido')?.value || '0')
  const valorRecebido    = Math.round(valorRecebidoRaw * 100)

  const base = {
    id:               movExistente?.id || gerarId(),
    dataCriacao:      movExistente?.dataCriacao || new Date().toISOString(),
    dataMovimento:    new Date(dataMovimento).toISOString(),
    tipo,
    categoria,
    descricao,
    contato:          document.getElementById('f-contato').value.trim(),
    formaPagamento:   forma,
    valorTotal,
    valorRecebido:    status === 'pago' ? valorTotal : valorRecebido,
    status,
    dataVencimento,
    dataRecebimento:  status === 'pago' ? new Date().toISOString() : (movExistente?.dataRecebimento || null),
    parcelado,
    numeroParcela:    movExistente?.numeroParcela || null,
    totalParcelas:    parcelado ? numParcelas : null,
    grupoParcelamento:movExistente?.grupoParcelamento || null,
    observacoes:      document.getElementById('f-observacoes').value.trim(),
    updatedAt:        new Date().toISOString(),
  }

  if (parcelado && !movExistente) {
    const parcelas = gerarParcelas(base, numParcelas)
    await db.putMany('movimentacoes', parcelas)
  } else {
    await db.put('movimentacoes', base)
  }

  fecharModal()
  showToast('✅ Lançamento salvo!', 'success')
  route()
}
