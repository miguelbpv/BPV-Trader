import React from 'react'
import { createRoot } from 'react-dom/client'
import App from './App'

createRoot(document.getElementById('root')!).render(<App />)

// Respond to SW request for holdings (for local notification checks)
navigator.serviceWorker?.addEventListener('message', async (e:any)=>{
  // noop
});
