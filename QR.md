# QR Code — Brothers Burger Game

## Gerar o QR Code

Após o deploy no Vercel, acesse o painel e copie a URL de produção (ex: `https://brothers-burger.vercel.app`).

Use um dos métodos abaixo para gerar o QR:

### Opção 1 — QR Code online (grátis)
1. Acesse https://qr.io ou https://www.qr-code-generator.com
2. Cole a URL de produção
3. Baixe o PNG em alta resolução (mínimo 300dpi para impressão)

### Opção 2 — Linha de comando (Node.js)
```bash
npx qrcode-terminal "https://brothers-burger.vercel.app"
```

### Tamanho recomendado para impressão de mesa
- **Totem de mesa (tent card):** QR 5×5 cm com margem branca de 1 cm
- **Flyer A5:** QR 7×7 cm, centralizado

## Configuração do Supabase (antes do deploy)

1. Crie um projeto em https://supabase.com
2. Execute o SQL em `supabase/schema.sql` no SQL Editor do Supabase
3. Copie a **Project URL** e a **anon/public key** do painel
4. Crie o arquivo `.env.local` na raiz do projeto:
   ```
   VITE_SUPABASE_URL=https://seu-projeto.supabase.co
   VITE_SUPABASE_ANON_KEY=sua-anon-key
   ```
5. No painel do Vercel, adicione as mesmas variáveis em **Settings → Environment Variables**
