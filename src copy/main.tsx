// Polyfill for Buffer in browser
import { Buffer } from 'buffer'

// Buffer ni ko'p joyda qo'shamiz
;(globalThis as any).Buffer = Buffer
;(globalThis as any).global = globalThis

// Node.js modullari uchun mocklar
if (typeof (globalThis as any).require === 'undefined') {
  ;(globalThis as any).require = (id: string) => {
    console.log('Mock require:', id)
    return {}
  }
}

// Mock for FastText to prevent import errors
;(globalThis as any).FastText = {
  loadModel: async () => ({
    getWordVector: () => [],
    getSentenceVector: () => [],
    getNearestNeighbors: () => [],
  }),
}

// Mock for FastEmbed to prevent import errors
;(globalThis as any).FastEmbed = {
  init: async () => ({
    embed: async () => [],
    embedBatch: async () => [],
  }),
}

// Mock for Node.js modules to prevent import errors
;(globalThis as any).fs = {
  readFile: async () => Buffer.from(''),
  writeFile: async () => {},
  createReadStream: () => ({
    on: () => {},
    pipe: () => {},
  }),
  createWriteStream: () => ({
    on: () => {},
    write: () => true,
    end: () => {},
  }),
  promises: {
    readFile: async () => Buffer.from(''),
    writeFile: async () => {},
  },
}

;(globalThis as any)['node:fs'] = (globalThis as any).fs

;(globalThis as any).path = {
  resolve: (...args: any[]) => args.join('/'),
  join: (...args: any[]) => args.join('/'),
  basename: (path: any) => path.split('/').pop(),
}

// Note: crypto already exists in browser, we can't override it
// Node.js crypto methods will be handled by mocks

import React from 'react'
import ReactDOM from 'react-dom/client'
import App from './App'
import { LanguageProvider } from './contexts/LanguageContext'
import './styles/professional-design.css'
import './index.css'

// Unregister any existing service workers to prevent fetch errors
if ('serviceWorker' in navigator) {
  navigator.serviceWorker.getRegistrations().then(function(registrations) {
    for(let registration of registrations) {
      registration.unregister()
    }
  })
}

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <LanguageProvider>
      <App />
    </LanguageProvider>
  </React.StrictMode>,
)
