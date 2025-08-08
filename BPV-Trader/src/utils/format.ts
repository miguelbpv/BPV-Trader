export const fmtPct = (x:number) => `${(x*100).toFixed(1)}%`;
export const timeAgo = (iso:string) => {
  const d = new Date(iso).getTime();
  const s = Math.max(1, Math.floor((Date.now()-d)/1000));
  for (const [u,t] of [[31536000,'ano'],[2592000,'mês'],[86400,'dia'],[3600,'h'],[60,'min'],[1,'s']] as const){
    if (s>=u) return `${Math.floor(s/u)} ${t}${Math.floor(s/u)>1&&t!=='h'?'s':''}`;
  }
  return 'agora';
};
