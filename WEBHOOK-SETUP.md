# 🚀 Stripe Webhook Setup — MindFix

Este documento explica como configurar e testar o webhook `/api/stripe/webhook` integrado ao seu app **MindFix** (Next.js + Supabase).

---

## 📌 1. URL do Webhook

Use esta URL para configurar na Stripe:

https://mindfix.vercel.app/api/stripe/webhook

yaml
Copiar código

---

## 📌 2. Eventos que o Webhook trata

O endpoint processa os seguintes eventos essenciais:

### ✔️ checkout.session.completed  
Cria/atualiza o usuário e inicia a assinatura.

### ✔️ invoice.paid  
Renova acesso quando uma fatura é paga.

### ✔️ customer.subscription.updated  
Atualiza plano, status e datas.

### ✔️ customer.subscription.deleted  
Remove acesso quando há cancelamento.

### ✔️ payment_intent.succeeded  
Confirma pagamento bem-sucedido (backup).

---

## 📌 3. Variáveis de ambiente necessárias

Adicione no **Vercel** e no **.env.local**:

STRIPE_SECRET_KEY=sk_live_xxx
STRIPE_WEBHOOK_SECRET=whsec_xxx
NEXT_PUBLIC_STRIPE_PUBLIC_KEY=pk_live_xxx

SUPABASE_URL=https://xxxx.supabase.co
SUPABASE_SERVICE_ROLE_KEY=xxxx
SUPABASE_ANON_KEY=xxxx

yaml
Copiar código

⚠️ *Lembre-se: o webhook usa **SERVICE ROLE**, pois precisa alterar usuários.*

---

## 📌 4. Como testar o Webhook localmente

1. Instale Stripe CLI  
https://docs.stripe.com/stripe-cli

2. Faça login:
stripe login

markdown
Copiar código

3. Rode o listener:
stripe listen --forward-to http://localhost:3000/api/stripe/webhook

markdown
Copiar código

4. Gere eventos:
stripe trigger checkout.session.completed

nginx
Copiar código

Se tudo estiver ok, você verá:
[200] POST /api/stripe/webhook

yaml
Copiar código

---

## 📌 5. Estrutura esperada no banco (Supabase)

### Tabela `users`
| coluna | tipo | descrição |
|-------|------|-----------|
| id | uuid | id do usuário |
| email | text | email |
| subscription_status | text | active / inactive |
| subscription_plan | text | plano assinado |
| access_expires_at | timestamptz | até quando o usuário tem acesso |

### Tabela `subscriptions`
Registra histórico das assinaturas.

---

## 📌 6. Acesso vitalício para admin

O email:

salvador.programs@gmail.com

yaml
Copiar código

Sempre terá:

- access_expires_at = 2999-12-31  
- subscription_status = active  
- subscription_plan = lifetime  

Mesmo se cancelar na Stripe.

Esse comportamento é aplicado tanto via SQL quanto no código do webhook.

---

## 📌 7. Logs e Debug

Para ver erros em produção na Vercel:

1. Vá em **Logs → Function Logs**  
2. Procure por erros relacionados a `stripe/webhook`  
3. Normalmente são:
   - chave ENV faltando  
   - webhook secret errado  
   - erros de Supabase (permissões)  

---

## 📌 8. Checklist final do Stripe

Antes de ir para produção:

✔️ Webhook configurado com a URL  
✔️ Evento `checkout.session.completed` habilitado  
✔️ Evento `customer.subscription.updated` habilitado  
✔️ Testado com Stripe CLI  
✔️ Variáveis no Vercel definidas  
✔️ Tabelas criadas no Supabase  
✔️ SERVICE ROLE configurado no backend  

---

## 📌 9. Importante: não use ANON KEY no webhook

O webhook precisa alterar e atualizar usuários → apenas o **service_role_key** funciona.

---

## 📌 10. Dúvidas?

Se precisar que eu escreva o código completo do webhook, ou revise o que a outra IA criou, só me enviar!
