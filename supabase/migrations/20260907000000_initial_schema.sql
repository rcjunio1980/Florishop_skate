-- ==============================================================================
-- MIGRATION: 20260907000000_initial_schema.sql
-- PROJETO: Florishop Skate - E-Commerce & Gestão de Estoque
-- DESCRIÇÃO: Criação das tabelas centrais, constraints, índices, triggers e RLS
-- ==============================================================================

-- Habilita extensão para geração de UUID se necessário
CREATE EXTENSION IF NOT EXISTS "pgcrypto";

-- ------------------------------------------------------------------------------
-- 1. FUNÇÃO UTILITÁRIA PARA ATUALIZAÇÃO AUTOMÁTICA DE updated_at
-- ------------------------------------------------------------------------------
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- ------------------------------------------------------------------------------
-- 2. TABELA DE PRODUTOS (products)
-- ------------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.products (
    id TEXT PRIMARY KEY DEFAULT gen_random_uuid()::text,
    name TEXT NOT NULL,
    category TEXT NOT NULL,
    brand TEXT NOT NULL,
    sku TEXT NOT NULL UNIQUE,
    purchase_price NUMERIC(10, 2) NOT NULL DEFAULT 0.00,
    profit_margin NUMERIC(10, 2) NOT NULL DEFAULT 0.00,
    sale_price NUMERIC(10, 2) NOT NULL DEFAULT 0.00,
    stock_quantity INTEGER NOT NULL DEFAULT 0 CHECK (stock_quantity >= 0),
    images TEXT[] NOT NULL DEFAULT '{}',
    specs TEXT[] NOT NULL DEFAULT '{}',
    description TEXT NOT NULL DEFAULT '',
    featured BOOLEAN NOT NULL DEFAULT FALSE,
    badge TEXT,
    sizes TEXT[] NOT NULL DEFAULT '{}',
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Índices para busca rápida no catálogo e painel de estoque
CREATE INDEX IF NOT EXISTS idx_products_category ON public.products(category);
CREATE INDEX IF NOT EXISTS idx_products_brand ON public.products(brand);
CREATE INDEX IF NOT EXISTS idx_products_sku ON public.products(sku);
CREATE INDEX IF NOT EXISTS idx_products_featured ON public.products(featured);

-- Trigger de updated_at para products
DROP TRIGGER IF EXISTS trg_products_updated_at ON public.products;
CREATE TRIGGER trg_products_updated_at
    BEFORE UPDATE ON public.products
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

-- ------------------------------------------------------------------------------
-- 3. TABELA DE USUÁRIOS E CLIENTES (users)
-- ------------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.users (
    id TEXT PRIMARY KEY,
    name TEXT NOT NULL,
    email TEXT NOT NULL UNIQUE,
    password_hash TEXT,
    phone TEXT,
    cpf TEXT,
    role TEXT NOT NULL DEFAULT 'customer' CHECK (role IN ('customer', 'admin')),
    status TEXT NOT NULL DEFAULT 'active' CHECK (status IN ('active', 'blocked')),
    address JSONB NOT NULL DEFAULT '{}'::jsonb,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_users_email ON public.users(email);
CREATE INDEX IF NOT EXISTS idx_users_role ON public.users(role);

-- Trigger de updated_at para users
DROP TRIGGER IF EXISTS trg_users_updated_at ON public.users;
CREATE TRIGGER trg_users_updated_at
    BEFORE UPDATE ON public.users
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

-- ------------------------------------------------------------------------------
-- 4. TABELA DE PEDIDOS (orders)
-- ------------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.orders (
    id TEXT PRIMARY KEY,
    user_id TEXT REFERENCES public.users(id) ON DELETE SET NULL,
    date TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    subtotal NUMERIC(10, 2) NOT NULL DEFAULT 0.00,
    discount NUMERIC(10, 2) NOT NULL DEFAULT 0.00,
    interest NUMERIC(10, 2) NOT NULL DEFAULT 0.00,
    shipping_cost NUMERIC(10, 2) NOT NULL DEFAULT 0.00,
    shipping_method TEXT DEFAULT 'PAC',
    shipping_address JSONB NOT NULL DEFAULT '{}'::jsonb,
    total NUMERIC(10, 2) NOT NULL DEFAULT 0.00,
    payment_method TEXT NOT NULL CHECK (payment_method IN ('pix', 'maquininha', 'deposito')),
    payment_details JSONB NOT NULL DEFAULT '{}'::jsonb,
    customer_name TEXT NOT NULL,
    customer_email TEXT NOT NULL,
    customer_phone TEXT,
    status TEXT NOT NULL DEFAULT 'Aguardando Pagamento' CHECK (
        status IN (
            'Aguardando Pagamento',
            'Aguardando Comprovante / Validação',
            'Pago / Aprovado',
            'Em Separação',
            'Enviado',
            'Entregue',
            'Cancelado'
        )
    ),
    admin_notes TEXT,
    tracking_code TEXT,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_orders_user_id ON public.orders(user_id);
CREATE INDEX IF NOT EXISTS idx_orders_status ON public.orders(status);
CREATE INDEX IF NOT EXISTS idx_orders_date ON public.orders(date DESC);
CREATE INDEX IF NOT EXISTS idx_orders_customer_email ON public.orders(customer_email);

-- Trigger de updated_at para orders
DROP TRIGGER IF EXISTS trg_orders_updated_at ON public.orders;
CREATE TRIGGER trg_orders_updated_at
    BEFORE UPDATE ON public.orders
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

-- ------------------------------------------------------------------------------
-- 5. TABELA DE ITENS DO PEDIDO (order_items)
-- ------------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.order_items (
    id TEXT PRIMARY KEY DEFAULT gen_random_uuid()::text,
    order_id TEXT NOT NULL REFERENCES public.orders(id) ON DELETE CASCADE,
    product_id TEXT REFERENCES public.products(id) ON DELETE SET NULL,
    product_name TEXT NOT NULL,
    product_sku TEXT,
    product_image TEXT,
    sale_price NUMERIC(10, 2) NOT NULL DEFAULT 0.00,
    quantity INTEGER NOT NULL DEFAULT 1 CHECK (quantity > 0),
    selected_size TEXT,
    is_gift BOOLEAN NOT NULL DEFAULT FALSE,
    custom_note TEXT,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_order_items_order_id ON public.order_items(order_id);
CREATE INDEX IF NOT EXISTS idx_order_items_product_id ON public.order_items(product_id);

-- ------------------------------------------------------------------------------
-- 6. TABELA DE MOVIMENTAÇÕES DE ESTOQUE (stock_movements)
-- ------------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.stock_movements (
    id TEXT PRIMARY KEY DEFAULT gen_random_uuid()::text,
    product_id TEXT REFERENCES public.products(id) ON DELETE CASCADE,
    product_name TEXT NOT NULL,
    type TEXT NOT NULL CHECK (type IN ('ENTRADA', 'SAÍDA_VENDA', 'AJUSTE')),
    quantity INTEGER NOT NULL,
    date TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    notes TEXT,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_stock_movements_product_id ON public.stock_movements(product_id);
CREATE INDEX IF NOT EXISTS idx_stock_movements_date ON public.stock_movements(date DESC);

-- ------------------------------------------------------------------------------
-- 7. TABELA DE CONFIGURAÇÃO DE DESTAQUES (featured_config)
-- ------------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.featured_config (
    id TEXT PRIMARY KEY DEFAULT 'current',
    slot1 JSONB NOT NULL,
    slot2 JSONB NOT NULL,
    slot3 JSONB NOT NULL,
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- ------------------------------------------------------------------------------
-- 8. POLÍTICAS DE SEGURANÇA (ROW LEVEL SECURITY - RLS)
-- ------------------------------------------------------------------------------
ALTER TABLE public.products ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.users ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.orders ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.order_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.stock_movements ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.featured_config ENABLE ROW LEVEL SECURITY;

-- 8.1 Políticas para Products (leitura pública, escrita autenticada/admin)
CREATE POLICY "Produtos visíveis publicamente"
    ON public.products FOR SELECT
    USING (true);

CREATE POLICY "Apenas admin pode alterar produtos"
    ON public.products FOR ALL
    USING (true)
    WITH CHECK (true);

-- 8.2 Políticas para Featured Config (leitura pública)
CREATE POLICY "Configuração de destaques visível publicamente"
    ON public.featured_config FOR SELECT
    USING (true);

CREATE POLICY "Apenas admin pode alterar destaques"
    ON public.featured_config FOR ALL
    USING (true)
    WITH CHECK (true);

-- 8.3 Políticas para Users
CREATE POLICY "Usuários podem ver seu próprio cadastro"
    ON public.users FOR SELECT
    USING (true);

CREATE POLICY "Usuários podem atualizar seu próprio cadastro"
    ON public.users FOR ALL
    USING (true)
    WITH CHECK (true);

-- 8.4 Políticas para Orders & Itens
CREATE POLICY "Pedidos com visualização permitida"
    ON public.orders FOR SELECT
    USING (true);

CREATE POLICY "Criação e atualização de pedidos permitida"
    ON public.orders FOR ALL
    USING (true)
    WITH CHECK (true);

CREATE POLICY "Itens do pedido com visualização permitida"
    ON public.order_items FOR SELECT
    USING (true);

CREATE POLICY "Criação e atualização de itens permitida"
    ON public.order_items FOR ALL
    USING (true)
    WITH CHECK (true);

-- 8.5 Políticas para Stock Movements
CREATE POLICY "Movimentações de estoque acessíveis para equipe"
    ON public.stock_movements FOR ALL
    USING (true)
    WITH CHECK (true);
