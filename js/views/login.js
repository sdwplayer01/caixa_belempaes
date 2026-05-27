import { temPinCadastrado, verificarPin, definirPin } from '../auth.js'

/**
 * Renderiza a tela de login / criação de PIN.
 * Chama onSuccess() após autenticação bem-sucedida.
 */
export function renderLogin(onSuccess) {
  const haPin = temPinCadastrado()

  // State
  let etapa = haPin ? 'login' : 'criar'  // 'login' | 'criar' | 'confirmar'
  let pin = ''
  let pinPrimeiro = ''
  const MAX = 6
  const MIN = 4

  // DOM
  const el = document.createElement('div')
  el.className = 'login-screen'
  document.body.prepend(el)

  function tituloHint() {
    if (etapa === 'login')    return ['Digite seu PIN', 'Seu PIN protege seus dados financeiros.']
    if (etapa === 'criar')    return ['Crie um PIN', 'Use de 4 a 6 dígitos para proteger o app.']
    if (etapa === 'confirmar') return ['Confirme o PIN', 'Digite o mesmo PIN novamente.']
    return ['', '']
  }

  function render() {
    const [titulo, hint] = tituloHint()
    const dots = Array.from({ length: haPin || etapa !== 'criar' ? MAX : MAX }, (_, i) => `
      <span class="pin-dot${i < pin.length ? ' pin-dot--filled' : ''}" id="dot-${i}"></span>
    `).join('')

    el.innerHTML = `
      <div class="login-card">
        <div class="login-brand">
          <div class="login-brand__icon">
            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 512 512" width="72" height="72">
              <rect width="512" height="512" rx="96" fill="#8B5E3C"/>
              <text x="256" y="350" font-size="300" text-anchor="middle" font-family="serif">🍞</text>
            </svg>
          </div>
          <h1 class="login-brand__name">Belém Pães</h1>
          <p class="login-brand__sub">Fluxo de Caixa</p>
        </div>
        <div class="login-form">
          <h2 class="login-form__title">${titulo}</h2>
          <p class="login-form__hint">${hint}</p>
          <div class="pin-display" id="pin-display">${dots}</div>
          <p class="login-form__error" id="login-error" hidden></p>
          <div class="pin-keypad" id="pin-keypad">
            ${[1,2,3,4,5,6,7,8,9,'',0,'⌫'].map(k => `
              <button type="button" class="pin-key${k===''?' pin-key--empty':''}" data-key="${k}">${k}</button>
            `).join('')}
          </div>
        </div>
      </div>
    `

    el.querySelector('#pin-keypad').addEventListener('click', handleKey)
  }

  function updateDots() {
    el.querySelectorAll('.pin-dot').forEach((dot, i) => {
      dot.classList.toggle('pin-dot--filled', i < pin.length)
    })
  }

  function shake() {
    const disp = el.querySelector('#pin-display')
    disp?.classList.add('pin-display--shake')
    setTimeout(() => disp?.classList.remove('pin-display--shake'), 500)
  }

  function erro(msg) {
    const err = el.querySelector('#login-error')
    if (err) { err.textContent = msg; err.hidden = false }
    shake()
    pin = ''
    updateDots()
  }

  function clearErro() {
    const err = el.querySelector('#login-error')
    if (err) err.hidden = true
  }

  async function handleKey(e) {
    const btn = e.target.closest('.pin-key')
    if (!btn || btn.classList.contains('pin-key--empty')) return
    const key = btn.dataset.key
    clearErro()

    if (key === '⌫') {
      pin = pin.slice(0, -1)
      updateDots()
      return
    }

    if (pin.length >= MAX) return
    pin += key
    updateDots()

    // Auto-submit
    if (etapa === 'login' && pin.length >= MIN) {
      // Try after a short tick to let the dot animate
      await tick()
      const ok = await verificarPin(pin)
      if (ok) { el.remove(); onSuccess() }
      else erro('PIN incorreto. Tente novamente.')
      return
    }

    if (etapa === 'criar' && pin.length === MAX) {
      await tick()
      pinPrimeiro = pin
      pin = ''
      etapa = 'confirmar'
      render()
      return
    }

    if (etapa === 'confirmar' && pin.length === pinPrimeiro.length) {
      await tick()
      if (pin === pinPrimeiro) {
        await definirPin(pin)
        el.remove()
        onSuccess()
      } else {
        erro('PINs diferentes. Tente de novo.')
        pinPrimeiro = ''
        etapa = 'criar'
        setTimeout(() => render(), 600)
      }
    }
  }

  function tick() {
    return new Promise(r => setTimeout(r, 80))
  }

  render()
}
