export const NAME = (s:string) => ({
  'BRENT':'Brent Crude','WTI':'WTI Crude','XLE':'Energy Select SPDR','SOXX':'iShares Semiconductor',
  'QQQ':'Invesco QQQ','SPY':'SPDR S&P 500','IWM':'iShares Russell 2000','EUROSTOXX50':'Euro Stoxx 50',
  'ASML.AS':'ASML (AMS)','TSM':'TSMC','NVDA':'NVIDIA','LMT':'Lockheed Martin','MCHI':'iShares MSCI China',
  'EEM':'iShares MSCI EM','COPPER':'Copper'
}[s] || s);

export const RISK = (s:string): 'conservador'|'equilibrado'|'agressivo' => ({
  'SPY':'conservador','EUROSTOXX50':'conservador','XLE':'equilibrado','QQQ':'equilibrado',
  'SOXX':'agressivo','IWM':'agressivo','NVDA':'agressivo','TSM':'equilibrado','ASML.AS':'equilibrado',
  'BRENT':'equilibrado','WTI':'equilibrado','LMT':'conservador','MCHI':'agressivo','EEM':'equilibrado','COPPER':'agressivo'
}[s] || 'equilibrado');

export const XTB_LINK = (s:string) => `https://www.xtb.com/pt/`;
