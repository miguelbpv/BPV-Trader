// tools/push_sender.js — Envio de push via FCM HTTP v1 com Service Account
import fs from 'fs';
import fetch from 'node-fetch';
import jwt from 'jsonwebtoken';

if (!process.env.FCM_SERVICE_ACCOUNT || !process.env.FCM_PROJECT_ID) {
  console.error('Faltam FCM_SERVICE_ACCOUNT e/ou FCM_PROJECT_ID nos Secrets.');
  process.exit(1);
}

const svc = JSON.parse(process.env.FCM_SERVICE_ACCOUNT);
const projectId = process.env.FCM_PROJECT_ID;
const tokens = (process.env.FCM_TOKENS || '')
  .split(',')
  .map(t => t.trim())
  .filter(Boolean);

const apiUrl = `https://fcm.googleapis.com/v1/projects/${projectId}/messages:send`;

// Lê recomendações e apanha SELL (podes ajustar à tua lógica)
let sells = [];
try {
  const recs = JSON.parse(fs.readFileSync('data/recs.json', 'utf8'));
  const list = recs.top || recs || [];
  sells = list.filter(x => (x.action || x.signal || '').toUpperCase() === 'VENDER');
} catch (e) {
  console.log('Aviso: não encontrei data/recs.json ou formato diferente. Envio teste.');
}

if (!tokens.length) {
  console.log('Sem FCM_TOKENS — nada a enviar.');
  process.exit(0);
}
if (!sells.length) {
  console.log('Sem SELL — nada a enviar.');
  process.exit(0);
}

async function getAccessToken() {
  const now = Math.floor(Date.now() / 1000);
  const payload = {
    iss: svc.client_email,
    sub: svc.client_email,
    aud: 'https://oauth2.googleapis.com/token',
    iat: now,
    exp: now + 3600,
    scope: 'https://www.googleapis.com/auth/firebase.messaging'
  };
  const jwtToken = jwt.sign(payload, svc.private_key, { algorithm: 'RS256' });

  const res = await fetch('https://oauth2.googleapis.com/token', {
    method: 'POST',
    headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
    body: `grant_type=urn:ietf:params:oauth:grant-type:jwt-bearer&assertion=${encodeURIComponent(jwtToken)}`
  });
  const j = await res.json();
  if (!j.access_token) {
    console.error('Falha a obter access_token:', j);
    process.exit(1);
  }
  return j.access_token;
}

(async () => {
  const accessToken = await getAccessToken();
  const title = 'BPV Trader — ALERTA: VENDER';
  const body = sells.slice(0, 3).map(s => `${s.symbol || s.ticker || 'SYM'} (${s.score ?? ''})`).join(' · ');

  for (const token of tokens) {
    const message = {
      message: {
        token,
        notification: { title, body },
        data: { kind: 'SELL', payload: JSON.stringify(sells.slice(0, 10)) }
      }
    };

    const res = await fetch(apiUrl, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${accessToken}`,
        'Content-Type': 'application/json; charset=utf-8'
      },
      body: JSON.stringify(message)
    });

    if (!res.ok) {
      const txt = await res.text();
      console.error('Erro ao enviar para', token, res.status, txt);
    } else {
      console.log('Push enviado para', token);
    }
  }
})();
