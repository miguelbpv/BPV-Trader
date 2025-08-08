import React, { useEffect, useState } from 'react'
import { getSetting, setSetting, listHoldings } from '../state/store'

export default function Settings(){
  const [theme, setTheme] = useState((document.documentElement.dataset.theme)||'dark')
  const [fbCfg, setFbCfg] = useState<string>('')
  const [token, setToken] = useState<string>('')
  const [ghUser, setGhUser] = useState('')
  const [ghRepo, setGhRepo] = useState('BPV-Trader')
  const [ghToken, setGhToken] = useState('')
  const [syncMsg, setSyncMsg] = useState('')

  useEffect(()=>{
    (async()=>{
      const cfg = await getSetting('fbConfig'); if(cfg) setFbCfg(JSON.stringify(cfg));
      const t = await getSetting('fcmToken'); if(t) setToken(t);
      const u = await getSetting('ghUser'); if(u) setGhUser(u);
      const r = await getSetting('ghRepo'); if(r) setGhRepo(r);
      const gt = await getSetting('ghToken'); if(gt) setGhToken(gt);
    })();
  }, [])

  function toggleTheme(){
    const next = theme==='light'?'dark':'light';
    setTheme(next);
    document.documentElement.dataset.theme = next;
    localStorage.setItem('bpv-theme', next);
  }

  async function initFirebase(){
    try{
      const cfg = JSON.parse(fbCfg);
      if('serviceWorker' in navigator){
        const reg = await navigator.serviceWorker.register('/firebase-messaging-sw.js');
        reg.active?.postMessage({ type:'INIT_FIREBASE', config: cfg });
      }
      const { getToken } = await import('https://www.gstatic.com/firebasejs/10.12.2/firebase-messaging-compat.js').then(()=>({getToken: (window as any).firebase.messaging().getToken}));
      await import('https://www.gstatic.com/firebasejs/10.12.2/firebase-app-compat.js');
      (window as any).firebase.initializeApp(cfg);
      const messaging = (window as any).firebase.messaging();
      const tok = await messaging.getToken({ vapidKey: cfg.vapidKey || undefined });
      if(tok){ setToken(tok); await setSetting('fcmToken', tok); alert('Token FCM obtido. Copia para o GitHub Secret FCM_TOKENS.'); }
      await setSetting('fbConfig', cfg);
    }catch(e){ alert('Config Firebase inválida: '+e); }
  }

  async function syncWatchlist(){
    try{
      const holdings = await listHoldings();
      const symbols = holdings.map(h=>h.symbol);
      const body = { message: 'update by app', content: btoa(unescape(encodeURIComponent(JSON.stringify(symbols, null, 2)))), sha: undefined };
      // Get current sha if file exists
      const r0 = await fetch(`https://api.github.com/repos/${ghUser}/${ghRepo}/contents/data/watchlist.json`, {
        headers: { Authorization: `Bearer ${ghToken}`, 'Accept': 'application/vnd.github+json' }
      });
      if(r0.status===200){ const j=await r0.json(); (body as any).sha = j.sha; }
      const r = await fetch(`https://api.github.com/repos/${ghUser}/${ghRepo}/contents/data/watchlist.json`, {
        method:'PUT',
        headers: { Authorization: `Bearer ${ghToken}`, 'Accept': 'application/vnd.github+json' },
        body: JSON.stringify({ message:'update watchlist', content: body.content, sha: (body as any).sha })
      });
      setSyncMsg(r.ok?'Watchlist sincronizada no repositório.':'Falha a sincronizar (verifica token/permissões).');
      await setSetting('ghUser', ghUser); await setSetting('ghRepo', ghRepo); await setSetting('ghToken', ghToken);
    }catch(e){ setSyncMsg('Erro: '+e); }
  }

  return <div className="card">
    <div className="sub">Definições</div>
    <div className="row" style={{gridTemplateColumns:'1fr 1fr'}}>
      <div>
        <div className="small">Tema</div>
        <button className="btn" onClick={toggleTheme}>{theme==='light'?'Usar escuro':'Usar claro'}</button>
      </div>
      <div>
        <div className="small">Firebase Cloud Messaging (push com app fechada)</div>
        <textarea className="input" placeholder='Cola aqui o JSON de config do Firebase (apiKey, projectId, messagingSenderId, appId, vapidKey)' value={fbCfg} onChange={e=>setFbCfg(e.target.value)} rows={5}></textarea>
        <button className="btn primary" onClick={initFirebase}>Ativar Push</button>
        <div className="small">Token do teu dispositivo (copia para GitHub Secret <b>FCM_TOKENS</b>):</div>
        <div className="small" style={{wordBreak:'break-all'}}>{token||'—'}</div>
      </div>
      <div>
        <div className="small">GitHub Sync (para alertas só das tuas posições)</div>
        <input className="input" placeholder="GitHub user" value={ghUser} onChange={e=>setGhUser(e.target.value)} />
        <input className="input" placeholder="Repositório (ex: BPV-Trader)" value={ghRepo} onChange={e=>setGhRepo(e.target.value)} />
        <input className="input" placeholder="GitHub Token (fine-grained, conteúdo repo)" value={ghToken} onChange={e=>setGhToken(e.target.value)} />
        <button className="btn" onClick={syncWatchlist}>Sincronizar Watchlist</button>
        <div className="small">{syncMsg}</div>
      </div>
    </div>
  </div>
}
