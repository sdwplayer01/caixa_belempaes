const CACHE_NAME = 'padaria-caixa-v4'

const BASE = self.location.pathname.replace(/\/sw\.js$/, '')

const PRECACHE_PATHS = [
  '',
  'index.html',
  'offline.html',
  'manifest.json',
  'css/reset.css',
  'css/tokens.css',
  'css/components.css',
  'css/layouts.css',
  'js/app.js',
  'js/db.js',
  'js/utils.js',
  'js/auth.js',
  'js/views/dashboard.js',
  'js/views/historico.js',
  'js/views/contas-receber.js',
  'js/views/contas-pagar.js',
  'js/views/relatorios.js',
  'js/views/configuracoes.js',
  'js/views/login.js',
  'js/components/nav.js',
  'js/components/modal.js',
  'js/components/toast.js',
  'js/components/form-lancamento.js',
  'icons/icon.svg',
]

const PRECACHE_URLS = PRECACHE_PATHS.map(p => BASE + '/' + p)

async function precacheAll(cache) {
  const results = await Promise.allSettled(
    PRECACHE_URLS.map(url =>
      fetch(url).then(res => {
        if (res.ok) return cache.put(url, res)
      })
    )
  )
  const failed = results.filter(r => r.status === 'rejected')
  if (failed.length) console.warn('SW: falha ao cachear', failed.length, 'recurso(s)')
}

self.addEventListener('install', event => {
  event.waitUntil(
    caches.open(CACHE_NAME)
      .then(cache => precacheAll(cache))
      .then(() => self.skipWaiting())
  )
})

self.addEventListener('activate', event => {
  event.waitUntil(
    caches.keys()
      .then(keys => Promise.all(keys.filter(k => k !== CACHE_NAME).map(k => caches.delete(k))))
      .then(() => self.clients.claim())
  )
})

self.addEventListener('fetch', event => {
  if (event.request.method !== 'GET') return
  if (!event.request.url.startsWith(self.location.origin)) return

  // Deixa requisições de CDN externo passar direto (idb, chart.js, lucide, fonts)
  const url = new URL(event.request.url)
  if (url.origin !== self.location.origin) return

  event.respondWith(
    caches.match(event.request).then(cached => {
      if (cached) return cached
      return fetch(event.request).then(response => {
        if (response.ok) {
          const clone = response.clone()
          caches.open(CACHE_NAME).then(cache => cache.put(event.request, clone))
        }
        return response
      }).catch(() => caches.match(BASE + '/offline.html'))
    })
  )
})
