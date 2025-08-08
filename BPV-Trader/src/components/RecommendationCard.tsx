import React from 'react'
import type { Rec } from '../types'
import { NAME, XTB_LINK, RISK } from '../utils/assets'

function Spark({points}:{points:number[]}){
  const w=220,h=48;
  if(!points || points.length<2) return <svg className="spark" />;
  const min = Math.min(...points), max = Math.max(...points);
  const path = points.map((p,i)=>{
    const x = i*(w/(points.length-1));
    const y = h - ((p-min)/(max-min+1e-9))*h;
    return `${i?'L':'M'}${x.toFixed(1)},${y.toFixed(1)}`;
  }).join(' ');
  return <svg className="spark" viewBox={`0 0 ${w} ${h}`} preserveAspectRatio="none">
    <path d={path} fill="none" stroke="currentColor" strokeWidth="2" />
  </svg>;
}

export default function RecommendationCard({r, series}:{r:Rec, series?:number[]}){
  const color = r.acao==='comprar'?'var(--accent)': r.acao==='vender'?'var(--neg)':'var(--warn)';
  return (
    <div className="card">
      <div className="h">
        <div>
          <div className="sub">{r.symbol} <span className="small">({RISK(r.symbol)})</span></div>
          <div style={{fontWeight:800, fontSize:18}}>{NAME(r.symbol)}</div>
        </div>
        <div className="badge" style={{background:color, color:'#081b14'}}>{r.acao.toUpperCase()}</div>
      </div>
      <div className="small" style={{margin:'8px 0'}}>Score: {r.score.toFixed(2)} | Confiança: {r.confianca ?? 0}% | 1D {((r.chg1d??0)*100).toFixed(1)}% · 5D {((r.chg5d??0)*100).toFixed(1)}% · 1M {((r.chg1m??0)*100).toFixed(1)}%</div>
      <div style={{color:color}}><Spark points={series||[]} /></div>
      <ul>
        {r.razoes?.slice(0,3).map((x,i)=>(<li key={i}><a className="link" href={x.url} target="_blank" rel="noreferrer">{x.title}</a></li>))}
      </ul>
      <div className="h" style={{marginTop:8}}>
        <a className="btn" href={XTB_LINK(r.symbol)} target="_blank" rel="noreferrer">Abrir na XTB</a>
        <span className="small">{r.nome || ''}</span>
      </div>
    </div>
  )
}
