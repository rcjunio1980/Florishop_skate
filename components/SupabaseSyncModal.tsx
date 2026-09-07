'use client';

import React, { useState, useEffect } from 'react';
import {
  Database,
  CheckCircle2,
  XCircle,
  AlertCircle,
  Copy,
  Check,
  RefreshCw,
  ExternalLink,
  Code2,
  Table,
  Shield,
  Layers,
  FileCode,
  Sparkles,
  X,
  UploadCloud,
  DownloadCloud
} from 'lucide-react';
import {
  checkSupabaseConnection,
  SupabaseHealthCheck,
  fetchProductsFromSupabase,
  upsertProductInSupabase,
  upsertUserInSupabase
} from '@/lib/supabase-service';
import { isSupabaseConfigured } from '@/lib/supabase';
import { useStore } from './StoreContext';

interface SupabaseSyncModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const SupabaseSyncModal: React.FC<SupabaseSyncModalProps> = ({ isOpen, onClose }) => {
  const { products, users } = useStore();
  const [activeSubTab, setActiveSubTab] = useState<'status' | 'migration' | 'seed' | 'instructions'>('status');
  const [health, setHealth] = useState<SupabaseHealthCheck | null>(null);
  const [isLoadingHealth, setIsLoadingHealth] = useState(false);
  const [isSyncing, setIsSyncing] = useState(false);
  const [syncMessage, setSyncMessage] = useState<{ type: 'success' | 'error' | 'info'; text: string } | null>(null);
  const [copiedMigration, setCopiedMigration] = useState(false);
  const [copiedSeed, setCopiedSeed] = useState(false);

  const migrationCode = `-- ==============================================================================
-- MIGRATION: 20260907000000_initial_schema.sql
-- PROJETO: Florishop Skate - E-Commerce & Gestão de Estoque
-- TABELAS: products, users, orders, order_items, stock_movements, featured_config
-- ==============================================================================

CREATE EXTENSION IF NOT EXISTS "pgcrypto";

CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- 1. TABELA DE PRODUTOS
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

CREATE INDEX IF NOT EXISTS idx_products_category ON public.products(category);
CREATE INDEX IF NOT EXISTS idx_products_brand ON public.products(brand);
CREATE INDEX IF NOT EXISTS idx_products_sku ON public.products(sku);
CREATE INDEX IF NOT EXISTS idx_products_featured ON public.products(featured);

DROP TRIGGER IF EXISTS trg_products_updated_at ON public.products;
CREATE TRIGGER trg_products_updated_at
    BEFORE UPDATE ON public.products
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

-- 2. TABELA DE USUÁRIOS
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

DROP TRIGGER IF EXISTS trg_users_updated_at ON public.users;
CREATE TRIGGER trg_users_updated_at
    BEFORE UPDATE ON public.users
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

-- 3. TABELA DE PEDIDOS
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

DROP TRIGGER IF EXISTS trg_orders_updated_at ON public.orders;
CREATE TRIGGER trg_orders_updated_at
    BEFORE UPDATE ON public.orders
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

-- 4. ITENS DO PEDIDO
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

-- 5. MOVIMENTAÇÕES DE ESTOQUE
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

-- 6. CONFIGURAÇÃO DE DESTAQUES
CREATE TABLE IF NOT EXISTS public.featured_config (
    id TEXT PRIMARY KEY DEFAULT 'current',
    slot1 JSONB NOT NULL,
    slot2 JSONB NOT NULL,
    slot3 JSONB NOT NULL,
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- 7. ROW LEVEL SECURITY (RLS)
ALTER TABLE public.products ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.users ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.orders ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.order_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.stock_movements ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.featured_config ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Produtos públicos" ON public.products FOR SELECT USING (true);
CREATE POLICY "Gestão produtos" ON public.products FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "Destaques públicos" ON public.featured_config FOR SELECT USING (true);
CREATE POLICY "Gestão destaques" ON public.featured_config FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "Leitura de usuários" ON public.users FOR SELECT USING (true);
CREATE POLICY "Edição de usuários" ON public.users FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "Leitura de pedidos" ON public.orders FOR SELECT USING (true);
CREATE POLICY "Edição de pedidos" ON public.orders FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "Leitura de itens" ON public.order_items FOR SELECT USING (true);
CREATE POLICY "Edição de itens" ON public.order_items FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "Gestão estoque" ON public.stock_movements FOR ALL USING (true) WITH CHECK (true);`;

  const seedCode = `-- Inserção de Usuários Padrão
INSERT INTO public.users (id, name, email, password_hash, phone, cpf, role, status, address)
VALUES 
  ('admin-florishop', 'Administrador Florishop', 'admin@florishop.com.br', 'admin123', '(48) 99876-5432', '111.222.333-44', 'admin', 'active', '{"cep": "88015-100", "street": "Rua Felipe Schmidt", "number": "450", "neighborhood": "Centro", "city": "Florianópolis", "state": "SC"}'::jsonb),
  ('user-pedro', 'Pedro Skate Silva', 'pedro@skate.com', 'skate123', '(48) 99123-4567', '222.333.444-55', 'customer', 'active', '{"cep": "88062-000", "street": "Avenida Pequeno Príncipe", "number": "1200", "neighborhood": "Campeche", "city": "Florianópolis", "state": "SC"}'::jsonb)
ON CONFLICT (email) DO NOTHING;

-- Configuração inicial dos Destaques do Mês
INSERT INTO public.featured_config (id, slot1, slot2, slot3)
VALUES (
  'current',
  '{"productId": "prod-2", "customTag": "NOVO DROP", "customSubtitle": "SHAPE MAPLE CANADENSE"}'::jsonb,
  '{"productId": "prod-3", "customTag": "TITANIUM", "customSubtitle": "TRUCKS DE ALTA DENSIDADE"}'::jsonb,
  '{"productId": "prod-4", "customTag": "101A DUREZA", "customSubtitle": "URETANO HIGH POP"}'::jsonb
)
ON CONFLICT (id) DO UPDATE 
SET slot1 = EXCLUDED.slot1, slot2 = EXCLUDED.slot2, slot3 = EXCLUDED.slot3, updated_at = NOW();`;

  const runHealthCheck = async () => {
    setIsLoadingHealth(true);
    setSyncMessage(null);
    try {
      const result = await checkSupabaseConnection();
      setHealth(result);
    } catch (e: any) {
      setHealth({
        isConfigured: false,
        connected: false,
        error: e.message || 'Erro ao checar status.',
      });
    } finally {
      setIsLoadingHealth(false);
    }
  };

  useEffect(() => {
    let isCancelled = false;
    if (isOpen) {
      checkSupabaseConnection()
        .then((result) => {
          if (!isCancelled) {
            setHealth(result);
          }
        })
        .catch((e: any) => {
          if (!isCancelled) {
            setHealth({
              isConfigured: false,
              connected: false,
              error: e.message || 'Erro ao checar status.',
            });
          }
        });
    }
    return () => {
      isCancelled = true;
    };
  }, [isOpen]);

  const handleCopyMigration = () => {
    navigator.clipboard.writeText(migrationCode);
    setCopiedMigration(true);
    setTimeout(() => setCopiedMigration(false), 2500);
  };

  const handleCopySeed = () => {
    navigator.clipboard.writeText(seedCode);
    setCopiedSeed(true);
    setTimeout(() => setCopiedSeed(false), 2500);
  };

  const handleExportLocalToSupabase = async () => {
    if (!health?.connected) {
      setSyncMessage({
        type: 'error',
        text: 'Não é possível sincronizar: o Supabase ainda não está conectado ou as tabelas não foram criadas.',
      });
      return;
    }

    setIsSyncing(true);
    setSyncMessage({ type: 'info', text: 'Iniciando upload de catálogo e usuários para o Supabase...' });

    let successCount = 0;
    try {
      // Sobe produtos
      for (const p of products) {
        const ok = await upsertProductInSupabase(p);
        if (ok) successCount++;
      }

      // Sobe usuários
      for (const u of users) {
        await upsertUserInSupabase(u);
      }

      setSyncMessage({
        type: 'success',
        text: `Sincronização concluída com sucesso! ${successCount} produtos e ${users.length} usuários sincronizados com o Supabase.`,
      });
    } catch (err: any) {
      setSyncMessage({
        type: 'error',
        text: `Erro durante a sincronização: ${err.message}`,
      });
    } finally {
      setIsSyncing(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/85 backdrop-blur-sm overflow-y-auto">
      <div className="relative w-full max-w-4xl bg-[#141414] border border-[#353534] rounded-lg shadow-2xl overflow-hidden flex flex-col max-h-[90vh]">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-[#282727] bg-[#1a1919]">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-lg bg-[#3ecf8e]/10 border border-[#3ecf8e]/30 flex items-center justify-center text-[#3ecf8e]">
              <Database className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="font-display text-lg font-bold text-white uppercase tracking-tight">
                  Integração Supabase &amp; Migrations
                </h2>
                <span className="px-2 py-0.5 text-[10px] font-mono font-bold uppercase rounded bg-[#3ecf8e]/20 text-[#3ecf8e] border border-[#3ecf8e]/40">
                  PostgreSQL
                </span>
              </div>
              <p className="text-xs text-gray-400">
                Gerenciador de esquemas, tabelas relacionais, migrations SQL e sincronização.
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded text-gray-400 hover:text-white hover:bg-[#282727] transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Subtabs Bar */}
        <div className="flex items-center gap-1 px-6 pt-3 border-b border-[#282727] bg-[#171616]">
          <button
            onClick={() => setActiveSubTab('status')}
            className={`px-4 py-2.5 text-xs font-mono font-bold uppercase border-b-2 transition-all flex items-center gap-2 ${
              activeSubTab === 'status'
                ? 'border-[#3ecf8e] text-[#3ecf8e]'
                : 'border-transparent text-gray-400 hover:text-white'
            }`}
          >
            <Layers className="w-3.5 h-3.5" />
            Status da Conexão
          </button>

          <button
            onClick={() => setActiveSubTab('migration')}
            className={`px-4 py-2.5 text-xs font-mono font-bold uppercase border-b-2 transition-all flex items-center gap-2 ${
              activeSubTab === 'migration'
                ? 'border-[#3ecf8e] text-[#3ecf8e]'
                : 'border-transparent text-gray-400 hover:text-white'
            }`}
          >
            <FileCode className="w-3.5 h-3.5" />
            Migration SQL (Esquema)
          </button>

          <button
            onClick={() => setActiveSubTab('seed')}
            className={`px-4 py-2.5 text-xs font-mono font-bold uppercase border-b-2 transition-all flex items-center gap-2 ${
              activeSubTab === 'seed'
                ? 'border-[#3ecf8e] text-[#3ecf8e]'
                : 'border-transparent text-gray-400 hover:text-white'
            }`}
          >
            <Table className="w-3.5 h-3.5" />
            Seed SQL (Dados Iniciais)
          </button>

          <button
            onClick={() => setActiveSubTab('instructions')}
            className={`px-4 py-2.5 text-xs font-mono font-bold uppercase border-b-2 transition-all flex items-center gap-2 ${
              activeSubTab === 'instructions'
                ? 'border-[#3ecf8e] text-[#3ecf8e]'
                : 'border-transparent text-gray-400 hover:text-white'
            }`}
          >
            <Sparkles className="w-3.5 h-3.5" />
            Instruções &amp; Variáveis
          </button>
        </div>

        {/* Modal Body */}
        <div className="flex-1 overflow-y-auto p-6 space-y-6">
          {/* TAB: STATUS DA CONEXÃO */}
          {activeSubTab === 'status' && (
            <div className="space-y-6">
              <div className="p-5 rounded-lg border border-[#2d2c2c] bg-[#1a1919]">
                <div className="flex items-center justify-between mb-4">
                  <div className="flex items-center gap-2">
                    <span className="text-xs font-mono uppercase text-gray-400">Diagnóstico:</span>
                    {isLoadingHealth ? (
                      <span className="flex items-center gap-1.5 text-xs text-amber-400">
                        <RefreshCw className="w-3.5 h-3.5 animate-spin" /> Testando conexão com Supabase...
                      </span>
                    ) : health?.connected ? (
                      <span className="flex items-center gap-1.5 text-xs font-bold text-[#3ecf8e]">
                        <CheckCircle2 className="w-4 h-4" /> CONECTADO AO SUPABASE
                      </span>
                    ) : (
                      <span className="flex items-center gap-1.5 text-xs font-bold text-amber-400">
                        <AlertCircle className="w-4 h-4" /> AGUARDANDO CONFIGURAÇÃO DE CHAVES
                      </span>
                    )}
                  </div>

                  <button
                    onClick={runHealthCheck}
                    disabled={isLoadingHealth}
                    className="px-3 py-1.5 rounded bg-[#252424] hover:bg-[#302f2f] text-xs font-mono text-gray-200 border border-[#3d3c3c] flex items-center gap-1.5 transition-colors disabled:opacity-50"
                  >
                    <RefreshCw className={`w-3.5 h-3.5 ${isLoadingHealth ? 'animate-spin' : ''}`} />
                    Testar Novamente
                  </button>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs font-mono">
                  <div className="p-3 bg-[#111] rounded border border-[#222]">
                    <span className="text-gray-400 block mb-1">URL DO SUPABASE:</span>
                    <span className="text-gray-200 break-all">
                      {process.env.NEXT_PUBLIC_SUPABASE_URL || 'Não configurada (NEXT_PUBLIC_SUPABASE_URL)'}
                    </span>
                  </div>

                  <div className="p-3 bg-[#111] rounded border border-[#222]">
                    <span className="text-gray-400 block mb-1">CHAVE ANON (CLIENT):</span>
                    <span className="text-gray-200">
                      {process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ? '•••••••••••••••• (Configurada)' : 'Não configurada (NEXT_PUBLIC_SUPABASE_ANON_KEY)'}
                    </span>
                  </div>
                </div>

                {health?.error && (
                  <div className="mt-4 p-3 bg-red-950/30 border border-red-800/40 rounded text-red-300 text-xs">
                    <strong>Aviso do Cliente:</strong> {health.error}
                  </div>
                )}
              </div>

              {/* Status das Tabelas */}
              <div className="p-5 rounded-lg border border-[#2d2c2c] bg-[#1a1919]">
                <h3 className="text-sm font-bold text-white uppercase tracking-wider font-mono mb-3 flex items-center gap-2">
                  <Table className="w-4 h-4 text-[#3ecf8e]" />
                  Tabelas Relacionais do Esquema
                </h3>
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 text-xs font-mono">
                  {[
                    { name: 'products', label: 'Catálogo de Produtos' },
                    { name: 'users', label: 'Clientes e Usuários' },
                    { name: 'orders', label: 'Pedidos de Compra' },
                    { name: 'order_items', label: 'Itens do Pedido' },
                    { name: 'stock_movements', label: 'Movimentações de Estoque' },
                    { name: 'featured_config', label: 'Destaques do Mês' },
                  ].map((table) => {
                    const ok = health?.connected;
                    return (
                      <div
                        key={table.name}
                        className="p-3 bg-[#111] rounded border border-[#282727] flex flex-col justify-between gap-1"
                      >
                        <div className="flex items-center justify-between">
                          <span className="font-bold text-white">{table.name}</span>
                          {ok ? (
                            <CheckCircle2 className="w-3.5 h-3.5 text-[#3ecf8e]" />
                          ) : (
                            <span className="text-[10px] text-gray-500">Pronta p/ Migrar</span>
                          )}
                        </div>
                        <span className="text-[11px] text-gray-400">{table.label}</span>
                      </div>
                    );
                  })}
                </div>
              </div>

              {/* Sincronização */}
              <div className="p-5 rounded-lg border border-[#2d2c2c] bg-[#1a1919] flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                <div>
                  <h4 className="text-sm font-bold text-white uppercase font-mono flex items-center gap-2">
                    <UploadCloud className="w-4 h-4 text-[#3ecf8e]" />
                    Exportar Estoque Local para o Supabase
                  </h4>
                  <p className="text-xs text-gray-400 mt-1">
                    Envia os {products.length} produtos e {users.length} usuários cadastrados localmente para as tabelas do Supabase.
                  </p>
                </div>

                <button
                  onClick={handleExportLocalToSupabase}
                  disabled={isSyncing}
                  className="px-4 py-2.5 bg-[#3ecf8e] hover:bg-[#34b27b] text-black font-mono font-bold text-xs uppercase rounded transition-colors flex items-center gap-2 disabled:opacity-50 shrink-0"
                >
                  <UploadCloud className={`w-4 h-4 ${isSyncing ? 'animate-pulse' : ''}`} />
                  {isSyncing ? 'Sincronizando...' : 'Sincronizar Agora'}
                </button>
              </div>

              {syncMessage && (
                <div
                  className={`p-4 rounded border text-xs font-mono ${
                    syncMessage.type === 'success'
                      ? 'bg-emerald-950/40 border-emerald-800 text-emerald-300'
                      : syncMessage.type === 'error'
                      ? 'bg-red-950/40 border-red-800 text-red-300'
                      : 'bg-blue-950/40 border-blue-800 text-blue-300'
                  }`}
                >
                  {syncMessage.text}
                </div>
              )}
            </div>
          )}

          {/* TAB: MIGRATION SQL */}
          {activeSubTab === 'migration' && (
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <span className="text-xs font-mono text-[#3ecf8e] font-bold uppercase">
                    ARQUIVO: supabase/migrations/20260907000000_initial_schema.sql
                  </span>
                  <p className="text-xs text-gray-400 mt-0.5">
                    Execute este script no SQL Editor do Dashboard do Supabase ou via Supabase CLI para criar toda a estrutura.
                  </p>
                </div>

                <button
                  onClick={handleCopyMigration}
                  className="px-3.5 py-1.5 bg-[#201f1f] hover:bg-[#2d2c2c] border border-[#3d3c3c] text-xs font-mono font-bold text-white rounded flex items-center gap-2 transition-colors"
                >
                  {copiedMigration ? (
                    <>
                      <Check className="w-3.5 h-3.5 text-[#3ecf8e]" />
                      Copiado!
                    </>
                  ) : (
                    <>
                      <Copy className="w-3.5 h-3.5" />
                      Copiar SQL da Migration
                    </>
                  )}
                </button>
              </div>

              <div className="relative bg-[#0a0a0a] rounded-lg border border-[#282727] p-4 max-h-96 overflow-y-auto font-mono text-xs text-gray-300 leading-relaxed">
                <pre className="whitespace-pre">{migrationCode}</pre>
              </div>
            </div>
          )}

          {/* TAB: SEED SQL */}
          {activeSubTab === 'seed' && (
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <span className="text-xs font-mono text-[#3ecf8e] font-bold uppercase">
                    ARQUIVO: supabase/seed.sql
                  </span>
                  <p className="text-xs text-gray-400 mt-0.5">
                    Insere os shapes, trucks, rodas, roupas, admin e cliente de teste automaticamente.
                  </p>
                </div>

                <button
                  onClick={handleCopySeed}
                  className="px-3.5 py-1.5 bg-[#201f1f] hover:bg-[#2d2c2c] border border-[#3d3c3c] text-xs font-mono font-bold text-white rounded flex items-center gap-2 transition-colors"
                >
                  {copiedSeed ? (
                    <>
                      <Check className="w-3.5 h-3.5 text-[#3ecf8e]" />
                      Copiado!
                    </>
                  ) : (
                    <>
                      <Copy className="w-3.5 h-3.5" />
                      Copiar SQL do Seed
                    </>
                  )}
                </button>
              </div>

              <div className="relative bg-[#0a0a0a] rounded-lg border border-[#282727] p-4 max-h-96 overflow-y-auto font-mono text-xs text-gray-300 leading-relaxed">
                <pre className="whitespace-pre">{seedCode}</pre>
              </div>
            </div>
          )}

          {/* TAB: INSTRUÇÕES E VARIÁVEIS */}
          {activeSubTab === 'instructions' && (
            <div className="space-y-5 text-xs font-mono text-gray-300">
              <div className="p-4 bg-[#1a1919] border border-[#2d2c2c] rounded-lg space-y-3">
                <h4 className="font-bold text-white uppercase text-sm flex items-center gap-2">
                  <Sparkles className="w-4 h-4 text-[#3ecf8e]" />
                  Como Rodar no seu Supabase
                </h4>
                <ol className="list-decimal list-inside space-y-2 text-gray-300 leading-relaxed">
                  <li>
                    Acesse o painel do seu projeto no{' '}
                    <a
                      href="https://supabase.com/dashboard"
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-[#3ecf8e] underline inline-flex items-center gap-1"
                    >
                      Supabase Dashboard <ExternalLink className="w-3 h-3" />
                    </a>.
                  </li>
                  <li>
                    No menu lateral esquerdo, clique em <strong>SQL Editor</strong>.
                  </li>
                  <li>
                    Clique em <strong>New query</strong>, copie o conteúdo da aba{' '}
                    <span className="text-[#3ecf8e]">Migration SQL</span> e cole no editor.
                  </li>
                  <li>
                    Clique em <strong>Run</strong>. Todas as 6 tabelas, índices e políticas de segurança RLS serão criadas instantaneamente.
                  </li>
                  <li>
                    (Opcional) Cole também o conteúdo da aba <span className="text-[#3ecf8e]">Seed SQL</span> e clique em <strong>Run</strong> para preencher com o estoque inicial da Florishop.
                  </li>
                </ol>
              </div>

              <div className="p-4 bg-[#1a1919] border border-[#2d2c2c] rounded-lg space-y-3">
                <h4 className="font-bold text-white uppercase text-sm flex items-center gap-2">
                  <Shield className="w-4 h-4 text-[#3ecf8e]" />
                  Variáveis de Ambiente (.env)
                </h4>
                <p className="text-gray-400">
                  Adicione as credenciais do seu projeto do Supabase nas configurações ou arquivo de ambiente:
                </p>
                <div className="p-3 bg-[#0a0a0a] rounded border border-[#282727] text-gray-200">
                  <code>
                    NEXT_PUBLIC_SUPABASE_URL=https://seu-projeto.supabase.co<br />
                    NEXT_PUBLIC_SUPABASE_ANON_KEY=sua-chave-anon-publica<br />
                    SUPABASE_SERVICE_ROLE_KEY=sua-chave-service-role-privada
                  </code>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="flex items-center justify-between px-6 py-4 border-t border-[#282727] bg-[#1a1919]">
          <span className="text-xs font-mono text-gray-400">
            Arquivos gerados em: <code className="text-[#3ecf8e]">/supabase/migrations/</code> e <code className="text-[#3ecf8e]">/lib/supabase.ts</code>
          </span>
          <button
            onClick={onClose}
            className="px-4 py-2 bg-[#201f1f] hover:bg-[#2d2c2c] border border-[#3d3c3c] text-xs font-mono font-bold uppercase text-white rounded transition-colors"
          >
            Fechar
          </button>
        </div>
      </div>
    </div>
  );
};
