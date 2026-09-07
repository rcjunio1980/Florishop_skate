# Integração Supabase - Florishop Skate

Este diretório contém a estrutura de banco de dados relacional (PostgreSQL) para a **Florishop Skate**.

---

## 📁 Estrutura de Arquivos

- `supabase/migrations/20260907000000_initial_schema.sql`: Script completo de migração DDL.
  - Criação das tabelas `products`, `users`, `orders`, `order_items`, `stock_movements`, `featured_config`.
  - Configuração de índices para performance de queries.
  - Triggers para atualização automática de `updated_at`.
  - Políticas de segurança por linha (Row Level Security - RLS).
- `supabase/seed.sql`: Dados iniciais de fábrica contendo shapes, trucks, rodas, roupas, admin padrão e destaques.

---

## 🚀 Como Aplicar as Migrations no Supabase

### Opção 1: Pelo Supabase Dashboard (Sem instalar nada)

1. Acesse o [Supabase Dashboard](https://supabase.com/dashboard) e abra seu projeto.
2. No menu lateral, clique em **SQL Editor**.
3. Clique em **New query**.
4. Copie todo o conteúdo do arquivo `supabase/migrations/20260907000000_initial_schema.sql` e cole no editor.
5. Clique em **Run** (Ctrl+Enter / Cmd+Enter).
6. (Opcional) Para preencher o catálogo inicial, abra uma nova query, cole o conteúdo de `supabase/seed.sql` e clique em **Run**.

### Opção 2: Pelo Supabase CLI

```bash
# Vincular seu projeto Supabase
npx supabase link --project-ref <SEU_PROJECT_REF>

# Aplicar as migrations no banco remoto
npx supabase db push

# Ou rodar seed local
npx supabase db reset
```

---

## 🔑 Variáveis de Ambiente (.env)

No arquivo `.env` ou nas configurações do seu ambiente, configure:

```env
NEXT_PUBLIC_SUPABASE_URL=https://seu-projeto.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=sua-chave-anonima-publica
SUPABASE_SERVICE_ROLE_KEY=sua-chave-service-role-privada
```

---

## 💻 Integração no Código

- `lib/supabase.ts`: Inicializador do cliente Supabase (`@supabase/supabase-js`).
- `lib/supabase-service.ts`: Métodos tipados para consultas, cadastro de pedidos, movimentação de estoque e sincronização.
- `components/SupabaseSyncModal.tsx`: Interface gráfica acessível no Painel Admin para testar conexão, copiar scripts SQL e exportar o estoque local para o banco Supabase.
