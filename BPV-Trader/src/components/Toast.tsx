import React from 'react'
export default function Toast({msg}:{msg:string}){
  return <div style={{position:'fixed',bottom:16,left:16,right:16,display:'flex',justifyContent:'center',zIndex:10}}>
    <div className="card" style={{background:'#17325c', padding:'10px 14px'}}>{msg}</div>
  </div>
}
