import feedparser, json, os
from datetime import datetime, timezone, timedelta
from utils import SINCE, norm_title

RSS = [
  "https://www.reuters.com/markets/rss",
  "https://www.reuters.com/world/rss",
]

MAP = {
  'ASML': ['ASML','ASML.AS'],
  'NVDA': ['NVDA'],
  'TSM': ['TSM'],
  'OIL|BRENT|WTI': ['BRENT'],
  'LMT':['LMT'],
}

by_symbol = {}
for url in RSS:
  feed = feedparser.parse(url)
  for e in feed.entries:
    title = norm_title(getattr(e,'title',''))
    link = getattr(e, 'link', '')
    pub = getattr(e, 'published_parsed', None)
    if not pub: continue
    pubdt = datetime(*pub[:6], tzinfo=timezone.utc)
    if pubdt < SINCE(5): continue
    t = title.upper()
    for k, syms in MAP.items():
      import re
      if re.search(k, t):
        for s in syms:
          by_symbol.setdefault(s, []).append({ 'title': title, 'url': link })

os.makedirs('data/news', exist_ok=True)
for s, arr in by_symbol.items():
  with open(f'data/news/{s}.json','w') as f: json.dump({ 'symbol': s, 'items': arr[:20] }, f, ensure_ascii=False, indent=2)
