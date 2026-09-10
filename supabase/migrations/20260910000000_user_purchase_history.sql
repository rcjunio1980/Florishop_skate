-- ==============================================================================
-- FLORISHOP SKATE SHOP - MIGRAÇÃO: TABELA DE HISTÓRICO DE COMPRAS DE USUÁRIO
-- Arquivo: /supabase/migrations/20260910000000_user_purchase_history.sql
-- ==============================================================================
-- Armazena permanentemente cada pedido finalizado e entregue para o histórico do cliente.

CREATE TABLE IF NOT EXISTS public.user_purchase_history (
    id TEXT PRIMARY KEY DEFAULT gen_random_uuid()::text,
    user_id TEXT NOT NULL,
    order_id TEXT NOT NULL,
    customer_name TEXT NOT NULL,
    customer_email TEXT NOT NULL,
    completed_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    order_date TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    total NUMERIC(10, 2) NOT NULL DEFAULT 0.00,
    subtotal NUMERIC(10, 2) NOT NULL DEFAULT 0.00,
    shipping_cost NUMERIC(10, 2) NOT NULL DEFAULT 0.00,
    shipping_method TEXT,
    payment_method TEXT NOT NULL,
    items_count INTEGER NOT NULL DEFAULT 1,
    items JSONB NOT NULL DEFAULT '[]'::jsonb,
    tracking_code TEXT,
    delivery_notes TEXT,
    status TEXT NOT NULL DEFAULT 'Entregue',
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Índices de performance para busca rápida por usuário, pedido e data
CREATE INDEX IF NOT EXISTS idx_purchase_history_user_id ON public.user_purchase_history(user_id);
CREATE INDEX IF NOT EXISTS idx_purchase_history_order_id ON public.user_purchase_history(order_id);
CREATE INDEX IF NOT EXISTS idx_purchase_history_email ON public.user_purchase_history(customer_email);
CREATE INDEX IF NOT EXISTS idx_purchase_history_completed_at ON public.user_purchase_history(completed_at DESC);

-- Habilitar Row Level Security (RLS)
ALTER TABLE public.user_purchase_history ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Histórico de compras visível para clientes e equipe" ON public.user_purchase_history;
CREATE POLICY "Histórico de compras visível para clientes e equipe"
    ON public.user_purchase_history FOR SELECT
    USING (true);

DROP POLICY IF EXISTS "Inserção e atualização de histórico de compras" ON public.user_purchase_history;
CREATE POLICY "Inserção e atualização de histórico de compras"
    ON public.user_purchase_history FOR ALL
    USING (true)
    WITH CHECK (true);
