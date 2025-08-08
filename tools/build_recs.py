import feedparser, json, requests, os, math
from datetime import datetime, timezone, timedelta
from collections import defaultdict
from utils import SINCE, norm_title, score_sentiment, fetch_stooq_history

RSS = [
  "https://www.reuters.com/markets/rss",
  "https://www.reuters.com/world/rss",
  "https://www.aljazeera.com/xml/rss/all.xml",
  "https://www.ecb.europa.eu/press/rss/press_release.en.rss",
  "https://www.nato.int/cps/en/natolive/news.rss"
]

TOPIC_MAP = {
  r"opec|opep|oil|brent|wti": ["BRENT", "XLE"],
  r"tariff|tarif|export control|sanction": ["SOXX", "ASML.AS", "TSM"],
  r"rate cut|cut.*rates|bce|ecb|fed": ["QQQ","IWM","SPY","EUROSTOXX50"],
  r"middle east|red sea|houthis|iran|israel|yemen": ["BRENT","XLE","LMT"],
  r"china stimulus|pbo c|beijing unveils": ["MCHI","EEM","COPPER"],
  r"asml|nvidia|tsmc|lockheed": ["ASML.AS","NVDA","TSM","LMT"]
}

WEIGHTS = { 'impact': 0.6, 'sent': 0.25, 'recency': 0.15 }
SINCE_DAYS = 3

items = []
for url in RSS:
  feed = feedparser.parse(url)
  for e in feed.entries:
    title = norm_title(getattr(e,'title',''))
    link = getattr(e, 'link', '')
    pub = getattr(e, 'published_parsed', None)
    if not pub: continue
    pubdt = datetime(*pub[:6], tzinfo=timezone.utc)
    if pubdt < SINCE(SINCE_DAYS): continue
    t = title.lower()
    matched_assets = []
    impact = 0
    for k, assets in TOPIC_MAP.items():
      import re
      if re.search(k, t):
        matched_assets.extend(assets)
        if 'opec' in k or 'oil' in k: impact = max(impact, 2.0)
        elif 'rate' in k or 'ecb' in k or 'fed' in k: impact = max(impact, 1.4)
        elif 'tariff' in k or 'export' in k or 'sanction' in k: impact = max(impact, 1.6)
        else: impact = max(impact, 1.0)
    if not matched_assets: continue
    sent = score_sentiment(title)
    recency = max(0.5, 1.0 - ((datetime.now(timezone.utc) - pubdt).total_seconds() / (3600*72)))
    items.append({
      'title': title, 'url': link, 'when': pubdt.isoformat(),
      'assets': list(set(matched_assets)),
      'impact': impact, 'sent': sent, 'recency': recency
    })

agg = defaultdict(lambda: {'score':0.0, 'reasons':[]})
for it in items:
  for a in it['assets']:
    s = WEIGHTS['impact']*it['impact'] + WEIGHTS['sent']*it['sent'] + WEIGHTS['recency']*it['recency']
    agg[a]['score'] += s
    agg[a]['reasons'].append({'title': it['title'], 'url': it['url']})

recs = []
metrics = {}
sparks = {}

def pct_change(series, days):
  if len(series)<days+1: return 0.0
  last = series[-1][1]; prev = series[-1-days][1]
  if prev==0: return 0.0
  return (last - prev)/prev

for a,v in agg.items():
  score = round(v['score'], 2)
  # price series for metrics/sparklines
  hist = fetch_stooq_history(a)
  if hist:
    sparks[a] = [p for _,p in hist[-30:]]
    ch1d = pct_change(hist,1)
    ch5d = pct_change(hist,5)
    ch1m = pct_change(hist,21)
  else:
    ch1d = ch5d = ch1m = 0.0
  acao = 'comprar' if score >= 2.2 else ('vender' if score <= -1.2 else 'observar')
  confianca = int(min(95, max(5, (abs(score)/3.5)*100)))
  recs.append({'symbol': a, 'acao': acao, 'score': score, 'confianca': confianca, 'razoes': v['reasons'][:5], 'chg1d': ch1d, 'chg5d': ch5d, 'chg1m': ch1m})

recs = sorted(recs, key=lambda x: x['score'], reverse=True)[:10]
out = {'generated_at': datetime.utcnow().isoformat()+"Z", 'recs': recs}

os.makedirs('data', exist_ok=True)
with open('data/recs.json','w') as f: json.dump(out,f,ensure_ascii=False,indent=2)

# write sparklines
os.makedirs('data/sparklines', exist_ok=True)
with open('data/sparklines/index.json','w') as f: json.dump(sparks, f)

print('OK', len(recs))
