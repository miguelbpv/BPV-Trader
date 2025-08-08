import React, { useEffect, useState } from 'react'
import Header from './components/Header'
import RecommendationCard from './components/RecommendationCard'
import HoldingsPanel from './components/HoldingsPanel'
import NewsPanel from './components/NewsPanel'
import Settings from './components/Settings'
import Toast from './components/Toast'
import type { RecsFile, Rec } from './types'
import { timeAgo } from './utils/format'

export default function App(){
  const [data, setData] = useState<RecsFile|null>(null)
  const [toast, setToast] = useState<string>('')
  const [onlyAction, setOnlyAction] = useState<'all'|'comprar'|'vender'>('all')
  const [risk, setRisk] = useState<'all'|'conservador'|'equilibrado'|'agressivo'>('all')
  const [series, setSeries] = useState<Record<string, number[]>>({})
  const [translate, setTranslate] = useState<boolean>(false)

  useEffect(()=>{
    fetch('/data/recs.json', { cache:'no-store' }).then(r=>r.ok?r.json():null).then(setData)
    ;(async()=>{
      // load sparkline series
      try{
        const s = await fetch('/data/sparklines/index.json', {cache:'no-store'}).then(r=>r.ok?r.json():{});
        setSeries(s || {});
      }catch{}
    })();
  },[])

  useEffect(()=>{
    if('serviceWorker' in navigator){
      navigator.serviceWorker.register('/sw.js').then(()=>navigator.serviceWorker.ready).then(async reg=>{
        if(Notification && Notification.permission !== 'granted'){
          const p = await Notification.requestPermission();
          if(p==='granted') setToast('Notificações ativas. Receberás alertas.');
        }
        if('SyncManager' in window){
          try{ await reg.sync.register('bpv-sync'); }catch(e){}
        }
      })
    }
  }, [])

  useEffect(()=>{ if(toast){ const t=setTimeout(()=>setToast(''), 2800); return ()=>clearTimeout(t) } }, [toast])

  let recs: Rec[] = (data?.recs||[])
  if(onlyAction!=='all') recs = recs.filter(r=> r.acao===onlyAction)

  // risk filter client-side
  const riskmap: Record<string,'conservador'|'equilibrado'|'agressivo'> = {
    'SPY':'conservador','EUROSTOXX50':'conservador','XLE':'equilibrado','QQQ':'equilibrado',
    'SOXX':'agressivo','IWM':'agressivo','NVDA':'agressivo','TSM':'equilibrado','ASML.AS':'equilibrado',
    'BRENT':'equilibrado','WTI':'equilibrado','LMT':'conservador','MCHI':'agressivo','EEM':'equilibrado','COPPER':'agressivo'
  };
  if(risk!=='all') recs = recs.filter(r=> riskmap[r.symbol]===risk)

  return (
    <div className="container">
      <Header last={data?.generated_at? timeAgo(data.generated_at): undefined} onToggleTheme={()=>{
        const cur = document.documentElement.dataset.theme || 'dark';
        const next = cur==='light'?'dark':'light';
        document.documentElement.dataset.theme = next; localStorage.setItem('bpv-theme', next);
      }} />

      <div className="card h" style={{marginBottom:12}}>
        <div className="sub">Filtrar</div>
        <div style={{display:'flex', gap:8}}>
          <select className="input" value={onlyAction} onChange={e=>setOnlyAction(e.target.value as any)}>
            <option value="all">Tudo</option>
            <option value="comprar">Comprar</option>
            <option value="vender">Vender</option>
          </select>
          <select className="input" value={risk} onChange={e=>setRisk(e.target.value as any)}>
            <option value="all">Todos os riscos</option>
            <option value="conservador">Conservador</option>
            <option value="equilibrado">Equilibrado</option>
            <option value="agressivo">Agressivo</option>
          </select>
          <label className="toggle" style={{display:'flex',alignItems:'center',gap:6}}>
            <input type="checkbox" checked={translate} onChange={e=>setTranslate(e.target.checked)} />
            PT (beta)
          </label>
        </div>
      </div>

      <div className="grid" style={{marginBottom:12}}>
        {recs.map((r,i)=> <RecommendationCard r={r} series={series[r.symbol]} key={i} />)}
      </div>

      <HoldingsPanel />
      <Settings />

      {data?.recs?.[0]?.razoes && <NewsPanel title="Últimas razões (feed agregado)" items={data.recs.flatMap(r=>r.razoes).slice(0,10)} translate={translate} />}

      {toast && <Toast msg={toast} />}
    </div>
  )
}
