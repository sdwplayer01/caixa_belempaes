import { db } from '../db.js'
import { state, atualizarHeader } from '../app.js'
import { formatMoeda } from '../utils.js'

let mesAtual = new Date().getMonth()
let anoAtual = new Date().getFullYear()
let _chartBarras = null
let _chartRosca  = null

export async function renderRelatorios() {
  atualizarHeader('Relatórios')
  const main = document.getElementById('app-main')
  main.innerHTML = `<div class="view-enter" id="rel-content"></div>`
  await renderConteudo()
}

async function renderConteudo() {
  if (_chartBarras) { _chartBarras.destroy(); _chartBarras = null }
  if (_chartRosca)  { _chartRosca.destroy();  _chartRosca  = null }

  const movs      = await db.getAll('movimentacoes')
  const inicioMes = new Date(anoAtual, mesAtual, 1)
  const fimMes    = new Date(anoAtual, mesAtual + 1, 0, 23, 59, 59)

  const doMes = movs.filter(m => {
    const d = new Date(m.dataMovimento)
    return d >= inicioMes && d <= fimMes
  })

  const receitaPaga = doMes.filter(m => m.tipo === 'entrada' && m.status === 'pago').reduce((s, m) => s + m.valorTotal, 0)
  const gastosPagos = doMes.filter(m => m.tipo === 'saida'   && m.status === 'pago').reduce((s, m) => s + m.valorTotal, 0)
  const lucro       = receitaPaga - gastosPagos
  const margem      = receitaPaga > 0 ? Math.round((lucro / receitaPaga) * 100) : 0

  const nomeMes    = inicioMes.toLocaleDateString('pt-BR', { month: 'long', year: 'numeric' })
  const nomeMesCap = nomeMes.charAt(0).toUpperCase() + nomeMes.slice(1)
  const labelMes   = inicioMes.toLocaleDateString('pt-BR', { month: 'short', year: 'numeric' })

  const catReceitas = agruparPorCategoria(doMes.filter(m => m.tipo === 'entrada' && m.status === 'pago'))
  const catGastos   = agruparPorCategoria(doMes.filter(m => m.tipo === 'saida'   && m.status === 'pago'))

  const vencidos   = movs.filter(m => m.status === 'vencido')
  const totalVenc  = vencidos.reduce((s, m) => s + (m.valorTotal - (m.valorRecebido || 0)), 0)
  const maisAntigo = vencidos.length
    ? Math.max(...vencidos.map(m => (new Date() - new Date(m.dataVencimento)) / 86400000 | 0))
    : 0

  const container = document.getElementById('rel-content')
  container.innerHTML = `
    <div class="period-nav">
      <button class="period-nav__btn" id="rel-prev">‹</button>
      <span class="period-nav__label">${nomeMesCap}</span>
      <button class="period-nav__btn" id="rel-next">›</button>
    </div>

    <div class="relatorio-card">
      <div class="relatorio-card__title">📊 Resumo do mês</div>
      <div class="relatorio-row">
        <span class="relatorio-row__label">Receita Total (Pago)</span>
        <span class="tabular" style="color:var(--color-entrada);font-weight:700">${formatMoeda(receitaPaga)}</span>
      </div>
      <div class="relatorio-row">
        <span class="relatorio-row__label">Gastos Totais (Pago)</span>
        <span class="tabular" style="color:var(--color-saida);font-weight:700">${formatMoeda(gastosPagos)}</span>
      </div>
      <div class="relatorio-row relatorio-row--total">
        <span>💰 Lucro do mês</span>
        <span class="tabular" style="color:${lucro >= 0 ? 'var(--color-entrada)' : 'var(--color-saida)'}">
          ${formatMoeda(lucro)} <small style="font-size:.75rem;opacity:.7">(${margem}%)</small>
        </span>
      </div>
    </div>

    <div class="relatorio-card" id="card-fluxo-diario">
      <div class="relatorio-card__title">📅 Fluxo diário — ${labelMes}</div>
      <div style="position:relative;height:200px">
        <canvas id="chart-barras"></canvas>
      </div>
    </div>

    <div class="relatorio-card">
      <div class="relatorio-card__title">🏆 Top Receitas</div>
      ${renderCategoriasTop(catReceitas, receitaPaga, 'entrada')}
      ${catReceitas.length === 0 ? '<p class="text-muted text-small">Nenhuma receita paga neste período</p>' : ''}
    </div>

    <div class="relatorio-card">
      <div class="relatorio-card__title">📉 Top Gastos</div>
      ${renderCategoriasTop(catGastos, gastosPagos, 'saida')}
      ${catGastos.length === 0 ? '<p class="text-muted text-small">Nenhum gasto pago neste período</p>' : ''}
    </div>

    ${catGastos.length > 0 ? `
    <div class="relatorio-card">
      <div class="relatorio-card__title">🍰 Distribuição de gastos</div>
      <div style="position:relative;max-width:280px;margin:0 auto">
        <canvas id="chart-rosca"></canvas>
      </div>
    </div>
    ` : ''}

    ${vencidos.length > 0 ? `
    <div class="relatorio-card" style="border-color:var(--color-vencido)">
      <div class="relatorio-card__title">🔴 Inadimplência</div>
      <div class="relatorio-row">
        <span class="relatorio-row__label">${vencidos.length} registro(s) em aberto</span>
        <span class="tabular" style="color:var(--color-vencido);font-weight:700">${formatMoeda(totalVenc)}</span>
      </div>
      ${maisAntigo > 0 ? `<div class="text-small text-muted" style="margin-top:8px">Mais antigo: há ${maisAntigo} dias</div>` : ''}
      <a href="#receber" class="btn btn--sm btn--outline" style="margin-top:12px;display:inline-flex">Ver detalhes →</a>
    </div>
    ` : ''}

    <div style="margin-bottom:var(--space-4)">
      <button class="btn btn--outline btn--full" id="rel-exportar">📤 Exportar CSV</button>
    </div>
  `

  document.getElementById('rel-prev').addEventListener('click', () => {
    mesAtual--; if (mesAtual < 0) { mesAtual = 11; anoAtual-- }
    renderConteudo()
  })
  document.getElementById('rel-next').addEventListener('click', () => {
    mesAtual++; if (mesAtual > 11) { mesAtual = 0; anoAtual++ }
    renderConteudo()
  })
  document.getElementById('rel-exportar').addEventListener('click', () =>
    exportarCSV(doMes, `relatorio_${anoAtual}_${String(mesAtual + 1).padStart(2, '0')}`)
  )

  if (window.Chart) {
    renderGraficos(doMes, catGastos, inicioMes, fimMes)
  } else {
    document.getElementById('card-fluxo-diario')?.remove()
  }
}

function renderGraficos(doMes, catGastos, inicioMes, fimMes) {
  Chart.defaults.font.family = 'DM Sans, sans-serif'
  Chart.defaults.color = '#8D6E63'

  const diasNoMes   = fimMes.getDate()
  const labels      = []
  const receitasDia = []
  const gastosDia   = []

  for (let d = 1; d <= diasNoMes; d++) {
    labels.push(d)
    const dosDia = doMes.filter(m => new Date(m.dataMovimento).getDate() === d)
    receitasDia.push(
      dosDia.filter(m => m.tipo === 'entrada' && m.status === 'pago').reduce((s, m) => s + m.valorTotal, 0) / 100
    )
    gastosDia.push(
      dosDia.filter(m => m.tipo === 'saida' && m.status === 'pago').reduce((s, m) => s + m.valorTotal, 0) / 100
    )
  }

  const ctxBar = document.getElementById('chart-barras')
  if (ctxBar) {
    _chartBarras = new Chart(ctxBar, {
      type: 'bar',
      data: {
        labels,
        datasets: [
          {
            label: 'Receita',
            data: receitasDia,
            backgroundColor: 'rgba(45,106,79,.75)',
            borderRadius: 4,
            borderSkipped: false,
          },
          {
            label: 'Gasto',
            data: gastosDia,
            backgroundColor: 'rgba(155,34,38,.75)',
            borderRadius: 4,
            borderSkipped: false,
          },
        ],
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        plugins: {
          legend: { position: 'bottom', labels: { boxWidth: 12, padding: 12, font: { size: 11 } } },
          tooltip: {
            callbacks: {
              label: ctx => ` R$ ${ctx.raw.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}`,
            },
          },
        },
        scales: {
          x: {
            grid: { display: false },
            ticks: { font: { size: 10 }, maxTicksLimit: 16 },
          },
          y: {
            grid: { color: 'rgba(139,94,60,.08)' },
            ticks: {
              font: { size: 10 },
              callback: v => v === 0 ? '0' : `R$${v >= 1000 ? (v / 1000).toFixed(1) + 'k' : v}`,
            },
          },
        },
      },
    })
  }

  const ctxRosca = document.getElementById('chart-rosca')
  if (ctxRosca && catGastos.length > 0) {
    const CORES = ['#9B2226', '#BB3E03', '#8B5E3C', '#6D4C41', '#C4956A']
    _chartRosca = new Chart(ctxRosca, {
      type: 'doughnut',
      data: {
        labels: catGastos.map(({ cat }) => `${cat.icone} ${cat.nome}`),
        datasets: [{
          data: catGastos.map(({ valor }) => valor / 100),
          backgroundColor: CORES.slice(0, catGastos.length),
          borderWidth: 2,
          borderColor: '#FFFFFF',
          hoverOffset: 8,
        }],
      },
      options: {
        responsive: true,
        cutout: '62%',
        plugins: {
          legend: {
            position: 'bottom',
            labels: { boxWidth: 12, padding: 10, font: { size: 12 } },
          },
          tooltip: {
            callbacks: {
              label: ctx => ` R$ ${ctx.raw.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}`,
            },
          },
        },
      },
    })
  }
}

function agruparPorCategoria(movs) {
  const mapa = {}
  for (const m of movs) {
    if (!mapa[m.categoria]) mapa[m.categoria] = 0
    mapa[m.categoria] += m.valorTotal
  }
  const cats = Object.fromEntries(state.categorias.map(c => [c.id, c]))
  return Object.entries(mapa)
    .map(([id, valor]) => ({ id, valor, cat: cats[id] || { nome: id, icone: '' } }))
    .sort((a, b) => b.valor - a.valor)
    .slice(0, 5)
}

function renderCategoriasTop(itens, total, tipo) {
  return itens.map(({ valor, cat }) => {
    const pct = total > 0 ? Math.round((valor / total) * 100) : 0
    return `
      <div class="relatorio-row" style="align-items:center;gap:8px;flex-wrap:wrap">
        <span style="min-width:120px">${cat.icone} ${cat.nome}</span>
        <div class="progress-bar" style="min-width:60px">
          <div class="progress-bar__fill progress-bar__fill--${tipo}" style="width:${pct}%"></div>
        </div>
        <span class="tabular" style="font-weight:600;font-size:.875rem;color:var(--color-${tipo});min-width:80px;text-align:right">${formatMoeda(valor)}</span>
        <span class="text-small text-muted">${pct}%</span>
      </div>
    `
  }).join('')
}

function exportarCSV(movs, nomeArquivo) {
  const headers = ['ID', 'Data', 'Tipo', 'Categoria', 'Descricao', 'Contato', 'Forma Pgto', 'Valor Total', 'Status', 'Data Vencimento', 'Observacoes']
  const rows = movs.map(m => [
    m.id,
    new Date(m.dataMovimento).toLocaleDateString('pt-BR'),
    m.tipo === 'entrada' ? 'Entrada' : 'Saida',
    m.categoria,
    m.descricao,
    m.contato || '',
    m.formaPagamento || '',
    (m.valorTotal / 100).toFixed(2).replace('.', ','),
    m.status,
    m.dataVencimento ? new Date(m.dataVencimento).toLocaleDateString('pt-BR') : '',
    m.observacoes || '',
  ])

  const csv = [headers, ...rows]
    .map(row => row.map(v => `"${String(v).replace(/"/g, '""')}"`).join(';'))
    .join('\n')

  const blob = new Blob(['﻿' + csv], { type: 'text/csv;charset=utf-8' })
  const url  = URL.createObjectURL(blob)
  const a    = document.createElement('a')
  a.href = url; a.download = `${nomeArquivo}.csv`; a.click()
  URL.revokeObjectURL(url)
}
