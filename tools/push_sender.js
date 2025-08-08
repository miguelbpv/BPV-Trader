// Reads recs.json and watchlist.json and sends push to device tokens via FCM if a watched symbol has 'vender'
const fs = require('fs')
const https = require('https')

function readJSON(path, fallback){
  try{ return JSON.parse(fs.readFileSync(path,'utf8')) }catch{ return fallback }
}

const recs = readJSON('data/recs.json', {recs:[]})
const watch = readJSON('data/watchlist.json', [])
const tokens = (process.env.FCM_TOKENS||'').split(',').map(s=>s.trim()).filter(Boolean)
const key = process.env.FCM_SERVER_KEY

if(!key){ console.log('FCM_SERVER_KEY not set'); process.exit(0) }
if(!tokens.length){ console.log('No FCM_TOKENS'); process.exit(0) }

const sells = recs.recs.filter(x=> watch.includes(x.symbol) && x.acao==='vender')
if(!sells.length){ console.log('No sells for watchlist'); process.exit(0) }

const body = {
  notification: {
    title: 'BPV Trader – Alerta de venda',
    body: sells.map(s=>s.symbol).join(', ') + ' sinal VENDER.'
  },
  data: { tag: 'bpv-sell' }
}

function sendFCM(token){
  const payload = JSON.stringify({ ...body, to: token })
  const req = https.request({
    hostname: 'fcm.googleapis.com',
    path: '/fcm/send',
    method: 'POST',
    headers: { 'Authorization': 'key='+key, 'Content-Type': 'application/json', 'Content-Length': Buffer.byteLength(payload) }
  }, res => {
    let b=''; res.on('data', d=>b+=d); res.on('end', ()=>console.log('FCM', res.statusCode, b.slice(0,120)))
  })
  req.on('error', e=>console.error('FCM err', e))
  req.write(payload); req.end()
}

tokens.forEach(sendFCM)
