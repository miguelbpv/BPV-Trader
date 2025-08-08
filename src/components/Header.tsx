import React from 'react'
export default function Header({last,onToggleTheme}:{last?:string; onToggleTheme: ()=>void}){
  const theme = document.documentElement.dataset.theme || 'dark';
  return (
    <div className="h" style={{marginBottom:12}}>
      <div>
        <div className="title">BPV Trader</div>
        <div className="small">Atualizado {last ? `há ${last}` : '—'}</div>
      </div>
      <div style={{display:'flex',gap:8, alignItems:'center'}}>
        <button className="toggle" onClick={onToggleTheme}>{theme==='light'?'🌙 Escuro':'☀️ Claro'}</button>
        <div className="badge">Horizonte: ~1 mês</div>
      </div>
    </div>
  )
}
