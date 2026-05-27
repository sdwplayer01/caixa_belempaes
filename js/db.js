import { openDB } from 'https://cdn.jsdelivr.net/npm/idb@7/build/esm/index.js'

const DB_NAME = 'padaria_financeiro'
const DB_VERSION = 1

let _db = null

async function getDB() {
  if (_db) return _db
  _db = await openDB(DB_NAME, DB_VERSION, {
    upgrade(db) {
      const movStore = db.createObjectStore('movimentacoes', { keyPath: 'id' })
      movStore.createIndex('by-date',      'dataMovimento')
      movStore.createIndex('by-status',    'status')
      movStore.createIndex('by-tipo',      'tipo')
      movStore.createIndex('by-contato',   'contato')
      movStore.createIndex('by-categoria', 'categoria')
      movStore.createIndex('by-grupo',     'grupoParcelamento')

      db.createObjectStore('categorias',       { keyPath: 'id' })
      db.createObjectStore('formas_pagamento', { keyPath: 'id' })
      db.createObjectStore('configuracoes',    { keyPath: 'key' })
    },
    blocked()  { console.warn('DB bloqueado por outra aba') },
    blocking() { _db.close(); _db = null }
  })
  return _db
}

export const db = {
  async getAll(store)               { return (await getDB()).getAll(store) },
  async get(store, key)             { return (await getDB()).get(store, key) },
  async put(store, value)           { return (await getDB()).put(store, value) },
  async delete(store, key)          { return (await getDB()).delete(store, key) },
  async clear(store)                { return (await getDB()).clear(store) },
  async count(store)                { return (await getDB()).count(store) },
  async getByIndex(store, idx, query) {
    return (await getDB()).getAllFromIndex(store, idx, query)
  },
  async getByRange(store, idx, lower, upper) {
    const range = IDBKeyRange.bound(lower, upper)
    return (await getDB()).getAllFromIndex(store, idx, range)
  },
  async seed(store, data) {
    const db_ = await getDB()
    const tx = db_.transaction(store, 'readwrite')
    await Promise.all([...data.map(item => tx.store.put(item)), tx.done])
  },
  async putMany(store, items) {
    const db_ = await getDB()
    const tx = db_.transaction(store, 'readwrite')
    await Promise.all([...items.map(item => tx.store.put(item)), tx.done])
  }
}
