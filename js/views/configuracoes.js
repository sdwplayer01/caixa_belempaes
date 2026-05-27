import { db } from '../db.js'
import { state, atualizarHeader, loadState } from '../app.js'
import { showToast } from '../components/toast.js'
import { abrirModal, fecharModal } from '../components/modal.js'

export async function renderConfiguracoes() {
  atualizarHeader('Configurações')
  const cfg = state.config

  document.getElementById('app-main').innerHTML = `
    <div class="view-enter">

      <div class="settings-section">
        <div class="settings-section__title">Negócio</div>
        <div class="settings-item" id="cfg-nome-negocio">
          <div class="settings-item__left">
            <span class="settings-item__icon">🍞</span>
            <div>
              <div class="settings-item__label">Nome do negócio</div>
              <div class="settings-item__value">${cfg.nome_negocio || 'Não definido'}</div>
            </div>
          </div>
          <span class="settings-item__arrow">›</span>
        </div>
        <div class="settings-item" id="cfg-nome-prop">
          <div class="settings-item__left">
            <span class="settings-item__icon">👤</span>
            <div>
              <div class="settings-item__label">Seu nome</div>
              <div class="settings-item__value">${cfg.nome_proprietaria || 'Não definido'}</div>
            </div>
          </div>
          <span class="settings-item__arrow">›</span>
        </div>
      </div>

      <div class="settings-section">
        <div class="settings-section__title">Categorias</div>
        <div class="settings-item" id="cfg-categorias">
          <div class="settings-item__left">
            <span class="settings-item__icon">🏷️</span>
            <div>
              <div class="settings-item__label">Gerenciar categorias</div>
              <div class="settings-item__value">${state.categorias.filter(c=>c.ativo).length} ativas</div>
            </div>
          </div>
          <span class="settings-item__arrow">›</span>
        </div>
      </div>

      <div class="settings-section">
        <div class="settings-section__title">Aparência</div>
        <div class="settings-item" id="cfg-tema">
          <div class="settings-item__left">
            <span class="settings-item__icon">🎨</span>
            <div>
              <div class="settings-item__label">Tema</div>
              <div class="settings-item__value">${cfg.cor_tema === 'dark' ? 'Escuro Profissional' : 'Claro Quentinho'}</div>
            </div>
          </div>
          <span class="settings-item__arrow">›</span>
        </div>
      </div>

      <div class="settings-section">
        <div class="settings-section__title">Dados</div>
        <div class="settings-item" id="cfg-exportar">
          <div class="settings-item__left">
            <span class="settings-item__icon">📤</span>
            <div><div class="settings-item__label">Exportar backup (JSON)</div></div>
          </div>
          <span class="settings-item__arrow">›</span>
        </div>
        <div class="settings-item" id="cfg-importar">
          <div class="settings-item__left">
            <span class="settings-item__icon">📥</span>
            <div><div class="settings-item__label">Importar backup</div></div>
          </div>
          <span class="settings-item__arrow">›</span>
        </div>
        <div class="settings-item" id="cfg-exemplo">
          <div class="settings-item__left">
            <span class="settings-item__icon">🧪</span>
            <div><div class="settings-item__label">Carregar dados de exemplo</div></div>
          </div>
          <span class="settings-item__arrow">›</span>
        </div>
        <div class="settings-item" id="cfg-limpar" style="border-color:var(--color-saida-bg)">
          <div class="settings-item__left">
            <span class="settings-item__icon">🗑️</span>
            <div><div class="settings-item__label" style="color:var(--color-saida)">Limpar todos os dados</div></div>
          </div>
          <span class="settings-item__arrow">›</span>
        </div>
      </div>

      <div class="settings-section">
        <div class="settings-section__title">Sobre</div>
        <div class="settings-item">
          <div class="settings-item__left">
            <span class="settings-item__icon">ℹ️</span>
            <div>
              <div class="settings-item__label">Caixa Padaria</div>
              <div class="settings-item__value">Versão 1.0 · Para padaria artesanal</div>
            </div>
          </div>
        </div>
      </div>
    </div>
  `

  bindEvents()
}

function bindEvents() {
  document.getElementById('cfg-nome-negocio').addEventListener('click', () => {
    editarConfig('nome_negocio', 'Nome do negócio', state.config.nome_negocio)
  })
  document.getElementById('cfg-nome-prop').addEventListener('click', () => {
    editarConfig('nome_proprietaria', 'Seu nome', state.config.nome_proprietaria)
  })
  document.getElementById('cfg-tema').addEventListener('click', alternarTema)
  document.getElementById('cfg-categorias').addEventListener('click', gerenciarCategorias)
  document.getElementById('cfg-exportar').addEventListener('click', exportarBackup)
  document.getElementById('cfg-importar').addEventListener('click', importarBackup)
  document.getElementById('cfg-exemplo').addEventListener('click', carregarExemplos)
  document.getElementById('cfg-limpar').addEventListener('click', limparDados)
}

function editarConfig(key, label, valorAtual) {
  abrirModal(`
    <div class="form-group">
      <label class="form-label">${label}</label>
      <input type="text" id="cfg-input" class="form-input" value="${valorAtual || ''}">
    </div>
    <button type="button" id="cfg-salvar" class="btn btn--primary btn--full">Salvar</button>
  `, `Editar ${label}`)

  document.getElementById('cfg-salvar').addEventListener('click', async () => {
    const val = document.getElementById('cfg-input').value.trim()
    if (!val) { showToast('Campo obrigatório', 'error'); return }
    await db.put('configuracoes', { key, value: val })
    await loadState()
    fecharModal()
    showToast('✅ Salvo!', 'success')
    renderConfiguracoes()
  })
}

async function alternarTema() {
  const novoTema = state.config.cor_tema === 'dark' ? 'warm' : 'dark'
  await db.put('configuracoes', { key:'cor_tema', value: novoTema })
  document.documentElement.setAttribute('data-theme', novoTema === 'dark' ? 'dark' : '')
  state.config.cor_tema = novoTema
  renderConfiguracoes()
}

function gerenciarCategorias() {
  const html = state.categorias.map(c => `
    <div style="display:flex;align-items:center;justify-content:space-between;padding:12px 0;border-bottom:1px solid var(--color-border)">
      <span>${c.icone} ${c.nome}</span>
      <label style="display:flex;align-items:center;gap:8px;cursor:pointer">
        <input type="checkbox" data-id="${c.id}" ${c.ativo ? 'checked' : ''} style="width:20px;height:20px">
        <span class="text-small text-muted">${c.ativo ? 'Ativa' : 'Inativa'}</span>
      </label>
    </div>
  `).join('')

  abrirModal(`<div>${html}</div>`, 'Gerenciar Categorias')

  document.getElementById('modal-body').addEventListener('change', async (e) => {
    if (e.target.type !== 'checkbox') return
    const id = e.target.dataset.id
    const cat = state.categorias.find(c => c.id === id)
    if (cat) {
      cat.ativo = e.target.checked
      await db.put('categorias', cat)
      e.target.nextElementSibling.textContent = cat.ativo ? 'Ativa' : 'Inativa'
    }
  })
}

async function exportarBackup() {
  const backup = {
    versao: '1.0',
    exportadoEm: new Date().toISOString(),
    movimentacoes:  await db.getAll('movimentacoes'),
    categorias:     await db.getAll('categorias'),
    formasPagamento:await db.getAll('formas_pagamento'),
    configuracoes:  await db.getAll('configuracoes'),
  }
  const blob = new Blob([JSON.stringify(backup, null, 2)], { type:'application/json' })
  const url = URL.createObjectURL(blob)
  const a = document.createElement('a')
  a.href = url
  a.download = `backup_padaria_${new Date().toISOString().slice(0,10)}.json`
  a.click()
  URL.revokeObjectURL(url)
  showToast('📤 Backup exportado!', 'success')
}

function importarBackup() {
  const input = document.createElement('input')
  input.type = 'file'; input.accept = '.json'
  input.addEventListener('change', async (e) => {
    const file = e.target.files[0]
    if (!file) return
    try {
      const text = await file.text()
      const backup = JSON.parse(text)
      if (!backup.movimentacoes) throw new Error('Arquivo inválido')
      if (!confirm(`Importar ${backup.movimentacoes.length} lançamentos? Os dados atuais serão mantidos.`)) return

      await db.putMany('movimentacoes',   backup.movimentacoes)
      await db.putMany('categorias',      backup.categorias || [])
      await db.putMany('formas_pagamento',backup.formasPagamento || [])
      await loadState()
      showToast('📥 Backup importado!', 'success')
    } catch {
      showToast('Erro ao importar backup', 'error')
    }
  })
  input.click()
}

async function carregarExemplos() {
  if (!confirm('Isso vai adicionar 15 lançamentos de exemplo. Continuar?')) return

  const { diasAtras, diasFrente, gerarId } = await import('../utils.js')
  const exemplos = [
    { tipo:'entrada', categoria:'venda-feira',   descricao:'Pães integrais – lote feira sábado',      contato:'Feira do Produtor – Praça Central', formaPagamento:'pix',        valorTotal:24000, status:'pago' },
    { tipo:'entrada', categoria:'encomenda',     descricao:'Bolo de mel p/ aniversário da Júlia',     contato:'Júlia Fernandes',                   formaPagamento:'pix',        valorTotal:8500,  status:'pago' },
    { tipo:'entrada', categoria:'venda-fixa',    descricao:'Entrega semanal – 30 pães de fermentação',contato:'Dona Tereza – Rua das Flores',       formaPagamento:'dinheiro',   valorTotal:19500, status:'pago' },
    { tipo:'entrada', categoria:'revenda',       descricao:'Reposição sacoleira 40 unidades',         contato:'Maria – sacoleira Feira Norte',      formaPagamento:'fiado',      valorTotal:8000,  status:'fiado' },
    { tipo:'entrada', categoria:'venda-feira',   descricao:'Pães rústicos de alho e ervas',           contato:'Feira do Produtor – Praça Central',  formaPagamento:'cartao-deb', valorTotal:15000, status:'pago' },
    { tipo:'entrada', categoria:'encomenda',     descricao:'Cesta de café da manhã – 10 pães sortidos',contato:'Roberto Alves',                     formaPagamento:'pix',        valorTotal:6500,  status:'pendente', dataVencimento: diasFrente(5) },
    { tipo:'saida',   categoria:'farinha',       descricao:'Farinha de trigo especial – 25kg',        contato:'Moinho São João',                    formaPagamento:'pix',        valorTotal:15500, status:'pago' },
    { tipo:'saida',   categoria:'ingredientes',  descricao:'Fermento natural, sal, azeite',           contato:'Atacado Sabor & Cia',                formaPagamento:'dinheiro',   valorTotal:4200,  status:'pago' },
    { tipo:'saida',   categoria:'embalagens',    descricao:'Sacos de papel craft + etiquetas',        contato:'Embalagens Braz',                    formaPagamento:'pix',        valorTotal:3800,  status:'pago' },
    { tipo:'saida',   categoria:'gas',           descricao:'Gás GLP – 2 botijões P45',               contato:'Distribuidora Irmãos Lima',           formaPagamento:'dinheiro',   valorTotal:22000, status:'pago' },
    { tipo:'saida',   categoria:'transporte',    descricao:'Frete para entregar encomendas',          contato:'Uber',                               formaPagamento:'cartao-deb', valorTotal:3200,  status:'pago' },
    { tipo:'saida',   categoria:'feira-taxa',    descricao:'Taxa de barraca – Feira do Produtor',     contato:'Prefeitura Municipal',               formaPagamento:'boleto',     valorTotal:8000,  status:'pendente', dataVencimento: diasFrente(8) },
    { tipo:'saida',   categoria:'imposto',       descricao:'DAS MEI – mês atual',                    contato:'Receita Federal',                    formaPagamento:'boleto',     valorTotal:7100,  status:'vencido',  dataVencimento: diasAtras(2) },
    { tipo:'saida',   categoria:'equipamento',   descricao:'Amassadeira elétrica 5kg (1/2)',          contato:'Casa do Chef – Equipamentos',         formaPagamento:'cartao-cred',valorTotal:22500, status:'pago',     parcelado:true, numeroParcela:1, totalParcelas:2 },
    { tipo:'saida',   categoria:'equipamento',   descricao:'Amassadeira elétrica 5kg (2/2)',          contato:'Casa do Chef – Equipamentos',         formaPagamento:'cartao-cred',valorTotal:22500, status:'pendente', dataVencimento: diasFrente(15), parcelado:true, numeroParcela:2, totalParcelas:2 },
  ]

  const movs = exemplos.map((e, i) => ({
    id: gerarId(),
    dataCriacao: new Date().toISOString(),
    dataMovimento: diasAtras(i % 10),
    valorRecebido: e.status==='pago' ? e.valorTotal : 0,
    dataRecebimento: e.status==='pago' ? new Date().toISOString() : null,
    grupoParcelamento: null,
    observacoes: '',
    updatedAt: new Date().toISOString(),
    ...e,
  }))

  await db.putMany('movimentacoes', movs)
  showToast('🧪 Dados de exemplo carregados!', 'success')
}

async function limparDados() {
  if (!confirm('Tem certeza? Todos os dados serão apagados permanentemente.')) return
  if (!confirm('SEGUNDA CONFIRMAÇÃO: Isso não pode ser desfeito. Continuar?')) return
  await db.clear('movimentacoes')
  showToast('🗑️ Dados apagados', 'info')
}
