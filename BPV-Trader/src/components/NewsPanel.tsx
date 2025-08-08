import React from 'react'
import type { Reason } from '../types'

export default function NewsPanel({title, items, translate}:{title:string; items: Reason[], translate?: boolean}){
  function tr(s:string){
    if(!translate) return s;
    const dict: Record<string,string> = {
      'announces':'anuncia','approves':'aprova','cuts rates':'corta taxas','hikes rates':'sobe taxas',
      'ban':'proíbe','probe':'investiga','fine':'multa','sanctions':'sanções','export controls':'controles à exportação',
      'deal':'acordo','strike':'greve','tariff':'tarifa','stimulus':'estímulo','miss':'falha','beat':'acima do esperado'
    };
    let out = s;
    for(const [k,v] of Object.entries(dict)){ out = out.replace(new RegExp(k,'ig'), v); }
    return out;
  }
  return (
    <div className="card">
      <div className="sub">{title}</div>
      <ul>
        {items.slice(0,8).map((n,i)=>(<li key={i}><a className="link" href={n.url} target="_blank" rel="noreferrer">{tr(n.title)}</a></li>))}
      </ul>
    </div>
  )
}
