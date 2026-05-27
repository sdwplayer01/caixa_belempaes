/**
 * auth.js — Autenticação simples via PIN com hash SHA-256
 * Os dados ficam em localStorage (PIN hash) e sessionStorage (sessão ativa).
 */

const PIN_KEY   = 'padaria_pin_hash'
const SESSION_KEY = 'padaria_session'

/**
 * Converte uma string para SHA-256 hex.
 */
async function sha256(text) {
  const encoder = new TextEncoder()
  const data = encoder.encode(text)
  const hashBuffer = await crypto.subtle.digest('SHA-256', data)
  return Array.from(new Uint8Array(hashBuffer))
    .map(b => b.toString(16).padStart(2, '0'))
    .join('')
}

/** Retorna true se o usuário já cadastrou um PIN */
export function temPinCadastrado() {
  return !!localStorage.getItem(PIN_KEY)
}

/** Retorna true se há uma sessão ativa na aba atual */
export function sessaoAtiva() {
  return sessionStorage.getItem(SESSION_KEY) === '1'
}

/** Cria ou atualiza o PIN */
export async function definirPin(pin) {
  const hash = await sha256(pin)
  localStorage.setItem(PIN_KEY, hash)
  sessionStorage.setItem(SESSION_KEY, '1')
}

/** Verifica o PIN informado. Retorna true se correto e abre sessão. */
export async function verificarPin(pin) {
  const hash = await sha256(pin)
  const stored = localStorage.getItem(PIN_KEY)
  if (hash === stored) {
    sessionStorage.setItem(SESSION_KEY, '1')
    return true
  }
  return false
}

/** Encerra a sessão atual */
export function encerrarSessao() {
  sessionStorage.removeItem(SESSION_KEY)
}
