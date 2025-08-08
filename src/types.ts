export type Reason = { title: string; url: string };
export type Rec = { symbol: string; nome?: string; acao: 'comprar'|'vender'|'observar'; score: number; confianca?: number; razoes: Reason[], chg1d?: number; chg5d?: number; chg1m?: number };
export type RecsFile = { generated_at: string; recs: Rec[] };
export type Holding = { symbol: string; qty: number; price: number; note?: string; addedAt: string; target?: number; stop?: number };
