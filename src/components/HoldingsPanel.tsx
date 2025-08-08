import React, { useEffect, useState } from 'react'
import type { Holding } from '../types'
import { listHoldings, upsertHolding, removeHolding } from '../state/store'

export default function HoldingsPanel(){
  const [items, setItems] = useState<Holding[]>([])
  const [symbol, setSymbol] = useState('')
  const [qty, setQty] = useState('')
  const [price, setPrice] = useState('')
  const [note, setNote] = useState('')
  const [target, setTarget] = useState('')
  const [stop, setStop] = useState('')

  async function refresh(){ setItems(await listHoldings()) }
  useEffect(()=>{ refresh(); }, [])

  async function add(){
    if(!symbol) return;
    await upsertHolding({ symbol: symbol.toUpperCase(), qty: Number(qty||0), price: Number(price||0), note, target: target?Number(target):undefined, stop: stop?Number(stop):undefined, addedAt: new Date().toISOString() })
    setSymbol(''); setQty(''); setPrice(''); setNote(''); setTarget(''); setStop('');
    refresh();
    if('serviceWorker' in navigator && 'SyncManager' in window){
      const reg = await navigator.serviceWorker.ready; try{ await reg.sync.register('bpv-sync'); }catch(e){}
    }
  }

  return (
    <div id="holdings" className="card">
      <div className="h"><div className="sub">As minhas posições</div><button className="btn" onClick={refresh}>Atualizar</button></div>
      <div className="row" style={{gridTemplateColumns:'1fr 1fr 1fr 1fr 1fr 1fr auto'}}>
        <input className="input" placeholder="Símbolo (ex: SOXX)" value={symbol} onChange={e=>setSymbol(e.target.value)} />
        <input className="input" placeholder="Qtd" value={qty} onChange={e=>setQty(e.target.value)} />
        <input className="input" placeholder="Preço" value={price} onChange={e=>setPrice(e.target.value)} />
        <input className="input" placeholder="Alvo (opcional)" value={target} onChange={e=>setTarget(e.target.value)} />
        <input className="input" placeholder="Stop (opcional)" value={stop} onChange={e=>setStop(e.target.value)} />
        <input className="input" placeholder="Nota" value={note} onChange={e=>setNote(e.target.value)} />
        <button className="btn primary" onClick={add}>Registar</button>
      </div>
      <div className="grid" style={{marginTop:12}}>
        {items.map(h=> (
          <div className="card" key={h.symbol}>
            <div className="h">
              <div>
                <div className="sub">{h.symbol}</div>
                <div className="small">Qtd {h.qty} @ {h.price}{h.target?` · Alvo ${h.target}`:''}{h.stop?` · Stop ${h.stop}`:''}</div>
              </div>
              <button className="btn" onClick={()=>{ removeHolding(h.symbol).then(refresh) }}>Remover</button>
            </div>
            {h.note && <div className="small" style={{marginTop:8}}>{h.note}</div>}
          </div>
        ))}
      </div>
      <div className="small" style={{marginTop:8}}>Para alertas com a app fechada, ativa o Firebase em Definições.</div>
    </div>
  )
}
