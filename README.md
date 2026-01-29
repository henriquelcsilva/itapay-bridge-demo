# ItaPay - Bridge Integration Demo

Demo funcional da integração do ItaPay com Bridge.xyz.

## 🚀 Deploy no Vercel

### Passo 1: Fazer Upload no GitHub

1. Crie novo repositório: https://github.com/new
   - Nome: `itapay-bridge-demo`
   - Private
   - **NÃO** adicione README, .gitignore, ou license

2. Faça upload dos arquivos deste ZIP

### Passo 2: Deploy no Vercel

1. Acesse https://vercel.com
2. Clique "Add New Project"
3. Import do seu repositório GitHub
4. **Antes de clicar Deploy**, adicione variáveis de ambiente:

```
BRIDGE_API_KEY=sk-live-sua-key-aqui
BRIDGE_API_URL=https://api.bridge.xyz
```

5. Clique "Deploy"

### Passo 3: Testar

Acesse a URL fornecida pelo Vercel e teste o fluxo completo!

## 🎯 O que a demo faz

1. ✅ Criar Customer na Bridge
2. ✅ Criar Wallet USDC (Solana)
3. ✅ Criar Virtual Account USD
4. ✅ Mostrar dados bancários completos

## 📁 Estrutura

```
pages/
├── api/
│   ├── create-customer.ts       # Endpoint para criar customer
│   ├── create-wallet.ts          # Endpoint para criar wallet
│   └── create-virtual-account.ts # Endpoint para virtual account
├── _app.tsx                      # App wrapper
└── index.tsx                     # Interface principal

styles/
└── globals.css                   # Estilos Tailwind
```

## 🔧 Desenvolvimento Local

```bash
npm install
cp .env.example .env.local
# Editar .env.local com sua API key
npm run dev
```

Acesse http://localhost:3000

---

**ItaPay Corp © 2026**
