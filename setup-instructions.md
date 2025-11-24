# 🚀 MindFix - Setup Completo Após Correções

## 📋 **EXECUÇÃO PASSO A PASSO**

### **PASSO 1: Backup (IMPORTANTE!)**
```sql
-- No Supabase SQL Editor, faça backup dos dados atuais:
SELECT * FROM users WHERE email != 'salvador.programs@gmail.com';
-- Anote os usuários existentes para verificação posterior
```

### **PASSO 2: Executar Migração**
1. Abra o **Supabase Dashboard**
2. Vá para **SQL Editor**
3. Cole o conteúdo do arquivo `migration-to-new-schema.sql`
4. Clique em **RUN**

### **PASSO 3: Verificar se funcionou**
```sql
-- Execute estas queries para verificar:
SELECT * FROM users WHERE is_lifetime = true;
SELECT COUNT(*) FROM focus_sessions;
SELECT COUNT(*) FROM user_progress;
```

### **PASSO 4: Deploy na Vercel**
1. Faça commit das mudanças
2. Push para o repositório
3. Vercel vai fazer deploy automático
4. Teste o login e funcionalidades

---

## 🔧 **O QUE A MIGRAÇÃO FAZ:**

### **✅ Mantém Intacto:**
- Sua tabela `users` existente
- Conta vitalícia `salvador.programs@gmail.com`
- Todas as configurações do Stripe
- Dados de usuários existentes

### **➕ Adiciona Novo:**
- Tabela `focus_sessions` (sessões de foco)
- Tabela `user_progress` (pontos e progresso)
- Índices para performance
- Triggers automáticos

---

## 🧪 **TESTES APÓS DEPLOY:**

### **Teste 1: Login**
- ✅ Login funciona normalmente
- ✅ Conta vitalícia tem acesso
- ✅ Redirecionamento automático

### **Teste 2: Dados Sincronizam**
- ✅ Faça login no PC
- ✅ Complete uma sessão
- ✅ Verifique no celular se aparece

### **Teste 3: Stripe**
- ✅ Faça um pagamento de teste
- ✅ Webhook atualiza status
- ✅ Acesso liberado automaticamente

### **Teste 4: Relatórios**
- ✅ Dados aparecem corretos
- ✅ Gráficos funcionam
- ✅ Progresso sincronizado

---

## 🚨 **EM CASO DE PROBLEMA:**

### **Se der erro na migração:**
```sql
-- Rode este comando para limpar tabelas criadas:
DROP TABLE IF EXISTS focus_sessions;
DROP TABLE IF EXISTS user_progress;
```

### **Se quiser voltar ao schema antigo:**
- As tabelas originais continuam intactas
- Código suporta ambos os schemas
- Basta não usar as novas funcionalidades

---

## 📞 **SUPORTE:**

Se algo der errado:
1. **Verifique os logs da Vercel**
2. **Teste queries no Supabase SQL Editor**
3. **Verifique variáveis de ambiente**

**A migração é reversível e segura!** 🛡️
