import re, time, csv, io, math, json, requests
from datetime import datetime, timezone, timedelta

NOW = lambda: datetime.now(timezone.utc)
SINCE = lambda days=3: NOW() - timedelta(days=days)

def norm_title(t):
    import re
    return re.sub(r'\s+', ' ', t or '').strip()

def score_sentiment(title: str):
    t = title.lower()
    pos = ["beat","record","approval","expands","contract signed","stimulus","cuts rates","deal","upgrade","outperform"]
    neg = ["ban","halts","probe","fine","downgrade","miss","strike","tariff","sanction","export control","guidance cut"]
    s = 0
    for w in pos:
        if w in t: s += 1
    for w in neg:
        if w in t: s -= 1
    if any(w in t for w in ["may","considers","could","mulls"]): s *= 0.5
    if any(w in t for w in ["approves","passes","confirms","announces"]): s *= 1.2
    return s

def fetch_stooq_history(symbol):
    # crude mapping: extend as needed
    map = {
        "SPY":"spy.us","QQQ":"qqq.us","IWM":"iwm.us","SOXX":"soxx.us",
        "EUROSTOXX50":"^stoxx50e","XLE":"xle.us","NVDA":"nvda.us","TSM":"tsm.us","ASML.AS":"asml.us",
        "BRENT":"brn.f","WTI":"wti.f","LMT":"lmt.us","MCHI":"mchi.us","EEM":"eem.us","COPPER":"hg.f"
    }
    tick = map.get(symbol)
    if not tick: return []
    url = f"https://stooq.com/q/d/l/?s={tick}&i=d"
    try:
        r = requests.get(url, timeout=20)
        if r.status_code!=200: return []
        rows = list(csv.DictReader(io.StringIO(r.text)))
        closes = [(row['Date'], float(row['Close'])) for row in rows if row.get('Close') not in (None,'')]
        return closes[-90:]  # last ~90 days
    except Exception as e:
        return []
