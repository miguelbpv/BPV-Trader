import json, os, math
from utils import fetch_stooq_history

# naive backtest: correlate score buckets with 20D forward returns (needs past scores; here just placeholder to show structure)
# In a real setup, keep a history of recs.json (e.g., commit every run) and compute realized forward returns.

# For demo, compute volatility proxy and tag risk per asset using last 30d std dev.
assets = ["SPY","QQQ","IWM","SOXX","EUROSTOXX50","XLE","NVDA","TSM","ASML.AS","BRENT","WTI","LMT","MCHI","EEM","COPPER"]
metrics = {}
for a in assets:
    hist = fetch_stooq_history(a)
    closes = [p for _,p in hist[-30:]]
    if len(closes)<2: continue
    rets = [(closes[i]/closes[i-1]-1.0) for i in range(1,len(closes))]
    avg = sum(rets)/len(rets)
    var = sum((r-avg)**2 for r in rets)/max(1,len(rets)-1)
    std = var**0.5
    metrics[a] = {"std30": std, "avgRet": avg}

os.makedirs('data', exist_ok=True)
with open('data/metrics.json','w') as f: json.dump(metrics, f, indent=2)
print("metrics for", len(metrics), "assets")
