export function formatMoeda(centavos, comSimbolo = true) {
  const valor = (centavos || 0) / 100
  const formatted = valor.toLocaleString('pt-BR', { minimumFractionDigits: 2, maximumFractionDigits: 2 })
  return comSimbolo ? `R$ ${formatted}` : formatted
}

export function parseMoeda(str) {
  const clean = String(str).replace(/[^\d,]/g, '').replace(',', '.')
  return Math.round(parseFloat(clean || '0') * 100)
}

export function formatData(isoString, formato = 'curto') {
  if (!isoString) return ''
  const d = new Date(isoString)
  if (formato === 'curto')   return d.toLocaleDateString('pt-BR')
  if (formato === 'extenso') return d.toLocaleDateString('pt-BR', { weekday: 'long', day: 'numeric', month: 'long' })
  if (formato === 'mes-ano') return d.toLocaleDateString('pt-BR', { month: 'long', year: 'numeric' })
  if (formato === 'relativo') {
    const hoje = new Date(); hoje.setHours(0,0,0,0)
    const data = new Date(isoString); data.setHours(0,0,0,0)
    const diff = Math.round((data - hoje) / 86400000)
    if (diff === 0)  return 'Hoje'
    if (diff === -1) return 'Ontem'
    if (diff === 1)  return 'Amanhã'
    if (diff < 0)    return `Há ${Math.abs(diff)} dias`
    return `Em ${diff} dias`
  }
  return d.toLocaleDateString('pt-BR')
}

export function dataHoje() {
  return new Date().toISOString().slice(0, 10)
}

export function diasAtras(n) {
  const d = new Date(); d.setDate(d.getDate() - n)
  return d.toISOString()
}

export function diasFrente(n) {
  const d = new Date(); d.setDate(d.getDate() + n)
  return d.toISOString()
}

export function gerarId(tipo = 'MOV') {
  const ymd = new Date().toISOString().slice(0,10).replace(/-/g,'')
  const seq = String(Math.floor(Math.random() * 9999)).padStart(4,'0')
  return `${tipo}-${ymd}-${seq}`
}

export function gerarParcelas(base, totalParcelas) {
  const grupo = gerarId('GRP')
  const parcelas = []
  for (let i = 1; i <= totalParcelas; i++) {
    const venc = new Date(base.dataMovimento || new Date())
    venc.setMonth(venc.getMonth() + (i - 1))
    parcelas.push({
      ...base,
      id: gerarId(),
      grupoParcelamento: grupo,
      numeroParcela: i,
      totalParcelas,
      descricao: `${base.descricao} (${i}/${totalParcelas})`,
      dataVencimento: venc.toISOString(),
      status: i === 1 && base.status === 'pago' ? 'pago' : 'pendente',
      valorTotal: Math.round(base.valorTotal / totalParcelas)
    })
  }
  return parcelas
}

export function labelStatus(status) {
  const map = { pago:'Pago', pendente:'Pendente', vencido:'Vencido', fiado:'Fiado', parcial:'Parcial', cancelado:'Cancelado', agendado:'Agendado' }
  return map[status] || status
}

export function saudacao(nome) {
  const h = new Date().getHours()
  if (h >= 5 && h < 12) return `Bom dia, ${nome}! 🌅`
  if (h >= 12 && h < 18) return `Boa tarde, ${nome}! ☀️`
  return `Boa noite, ${nome}! 🌙`
}

export function agruparPorData(movs) {
  const grupos = {}
  for (const m of movs) {
    const key = (m.dataMovimento || m.dataCriacao || '').slice(0,10)
    if (!grupos[key]) grupos[key] = []
    grupos[key].push(m)
  }
  return Object.entries(grupos).sort(([a],[b]) => b.localeCompare(a))
}

export function calcularKPIs(movs) {
  const hoje = new Date()
  const inicioMes = new Date(hoje.getFullYear(), hoje.getMonth(), 1).toISOString()
  const fimMes    = new Date(hoje.getFullYear(), hoje.getMonth()+1, 0, 23,59,59).toISOString()

  const doMes = movs.filter(m => m.dataMovimento >= inicioMes && m.dataMovimento <= fimMes)

  const receitaPaga = doMes.filter(m => m.tipo==='entrada' && m.status==='pago').reduce((s,m) => s + m.valorTotal, 0)
  const gastosPagos = doMes.filter(m => m.tipo==='saida'   && m.status==='pago').reduce((s,m) => s + m.valorTotal, 0)
  const saldo       = receitaPaga - gastosPagos
  const totalReceber = movs.filter(m => m.tipo==='entrada' && ['pendente','vencido','fiado','parcial'].includes(m.status)).reduce((s,m) => s + (m.valorTotal - (m.valorRecebido||0)), 0)
  const totalPagar   = movs.filter(m => m.tipo==='saida'   && ['pendente','vencido','agendado'].includes(m.status)).reduce((s,m) => s + m.valorTotal, 0)
  const vencidos     = movs.filter(m => m.status==='vencido')

  return { receitaPaga, gastosPagos, saldo, totalReceber, totalPagar, vencidos }
}
