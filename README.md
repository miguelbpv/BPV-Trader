# BPV Trader (PWA) — Guia rápido

**O que é**: App móvel (PWA) que cruza notícias macro+geopolíticas com regras simples para gerar Top‑10 **comprar/vender (~1 mês)**. Permite registar **posições**, ver **notícias por ativo**, **sparklines**, métricas, e **receber alertas** (incluindo **push com a app fechada** via Firebase). Tudo **grátis** em GitHub Pages + GitHub Actions.

## Instalação (sem saber programar)

### 1) Criar repositório no GitHub
1. Cria conta (gratuito) em https://github.com
2. Clica **New** → nome: `BPV-Trader` → **Public** → Create.
3. Clica **Add file → Upload files** e **arrasta** os ficheiros desta pasta (ou faz upload do ZIP e depois “Upload files” já descompactado).

### 2) Ativar GitHub Pages (o site da app)
- Vai a **Settings → Pages** e escolhe **GitHub Actions**. O workflow `deploy` já trata do build e publicação.
- Faz um **commit inicial** (basta editar `README.md` e gravar) para acionar o deploy. O site ficará em `https://<teu-utilizador>.github.io/BPV-Trader/`.

### 3) Ligar o “robot” de notícias
- Vai a **Actions** → permite “I understand…” se aparecer.
- Abre o workflow **build-recs** → **Run workflow** (para a primeira geração). Depois corre de **3 em 3 horas**.

### 4) (Opcional, recomendado) Ativar **push com app fechada** (Firebase)
1. Vai a **Firebase Console → Create project** (grátis). Ativa **Cloud Messaging** (FCM).
2. Em **Project settings → Cloud Messaging**, gera **VAPID key pair**. Regista **apiKey, authDomain, projectId, appId, messagingSenderId, vapidKey**.
3. Na app (menu **Definições**): cola o **JSON** com estas chaves e prime **Ativar Push** → a app mostra o teu **Token**.
4. No GitHub, vai a **Settings → Secrets and variables → Actions** e cria:
   - **FCM_SERVER_KEY** (Server key do Firebase Cloud Messaging)
   - **FCM_TOKENS** (cola o token mostrado pela app; para mais dispositivos, separa por vírgulas)
5. (Opcional, melhor) Em **Definições** da app, ativa **GitHub Sync**: introduz **GitHub user**, **repo** e um **Fine‑grained personal access token** com permissões “Contents: Read and Write” para este repo. Prime **Sincronizar Watchlist** → isto grava `data/watchlist.json` com os símbolos das tuas posições.  
6. O workflow **push-alert** corre 10 min depois do build e envia push se algum símbolo da **watchlist** tiver **sinal “VENDER”**.

### 5) Instalar no telemóvel (PWA)
- **Android (Chrome/Edge)**: abre o link do teu site → menu ⋮ → **Adicionar ao ecrã inicial** → aceitar **Notificações**.
- **iPhone (Safari 16.4+)**: partilhar → **Adicionar ao Ecrã Principal** → permitir **Notificações** quando a app pedir (depois de ativares o Firebase na app).

## Como usar
- Vê o **Top‑10** e abre as **razões** (links).
- Regista as tuas **posições** em *As minhas posições* (podes pôr **alvo** e **stop**).
- Em **Definições**, ativa **Push** e opcionalmente **GitHub Sync** para alertas só das tuas posições.
- Filtra por **risco** e por **ação** (comprar/vender).

## Notas técnicas
- Agregação via RSS gratuitos (Reuters, BCE, NATO, etc.). Heurísticas de impacto + sentimento → **score**.
- Preços/series via **Stooq** (grátis) para variações 1D/5D/1M e **sparklines**.
- Backtest placeholder: `tools/backtest.py` calcula volatilidade 30d; para backtest real, guardar histórico de `data/recs.json` por commit e calcular retorno 20D.

## Sem custos
- GitHub Pages (grátis)
- GitHub Actions (minutos grátis suficientes para 8 execuções/dia)
- Firebase Cloud Messaging (grátis)

## Aviso
- Não é recomendação financeira. Usa como *screener* explicável.
