let _onClose = null

export function abrirModal(conteudo, titulo = '', onClose = null) {
  _onClose = onClose
  const overlay = document.getElementById('modal-overlay')

  overlay.innerHTML = `
    <div class="modal" role="dialog" aria-modal="true">
      <div class="modal__handle"></div>
      ${titulo ? `<h2 class="modal__title">${titulo}</h2>` : ''}
      <button class="modal__close" id="modal-close" aria-label="Fechar">✕</button>
      <div id="modal-body">${conteudo}</div>
    </div>
  `
  overlay.hidden = false
  document.body.style.overflow = 'hidden'

  overlay.querySelector('#modal-close').addEventListener('click', fecharModal)
  overlay.addEventListener('click', (e) => { if (e.target === overlay) fecharModal() })

  const firstInput = overlay.querySelector('input, select, textarea, button:not(#modal-close)')
  if (firstInput) firstInput.focus()
}

export function fecharModal() {
  const overlay = document.getElementById('modal-overlay')
  overlay.hidden = true
  overlay.innerHTML = ''
  document.body.style.overflow = ''
  if (_onClose) { _onClose(); _onClose = null }
}

export function getModalBody() {
  return document.getElementById('modal-body')
}
