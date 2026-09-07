-- ==============================================================================
-- SEED DATA: supabase/seed.sql
-- PROJETO: Florishop Skate
-- DADOS INICIAIS: Produtos do Catálogo, Usuários de Teste/Admin e Destaques
-- ==============================================================================

-- 1. Inserção de Usuário Administrador e Cliente Padrão
INSERT INTO public.users (id, name, email, password_hash, phone, cpf, role, status, address)
VALUES 
  ('admin-florishop', 'Administrador Florishop', 'admin@florishop.com.br', 'admin123', '(48) 99876-5432', '111.222.333-44', 'admin', 'active', '{"cep": "88015-100", "street": "Rua Felipe Schmidt", "number": "450", "neighborhood": "Centro", "city": "Florianópolis", "state": "SC"}'::jsonb),
  ('user-pedro', 'Pedro Skate Silva', 'pedro@skate.com', 'skate123', '(48) 99123-4567', '222.333.444-55', 'customer', 'active', '{"cep": "88062-000", "street": "Avenida Pequeno Príncipe", "number": "1200", "neighborhood": "Campeche", "city": "Florianópolis", "state": "SC"}'::jsonb)
ON CONFLICT (email) DO NOTHING;

-- 2. Inserção de Configuração de Destaques
INSERT INTO public.featured_config (id, slot1, slot2, slot3)
VALUES (
  'current',
  '{"productId": "prod-2", "customTag": "NOVO DROP", "customSubtitle": "SHAPE MAPLE CANADENSE"}'::jsonb,
  '{"productId": "prod-3", "customTag": "TITANIUM", "customSubtitle": "TRUCKS DE ALTA DENSIDADE"}'::jsonb,
  '{"productId": "prod-4", "customTag": "101A DUREZA", "customSubtitle": "URETANO HIGH POP"}'::jsonb
)
ON CONFLICT (id) DO UPDATE 
SET slot1 = EXCLUDED.slot1, slot2 = EXCLUDED.slot2, slot3 = EXCLUDED.slot3, updated_at = NOW();

-- 3. Inserção do Catálogo Inicial de Produtos
INSERT INTO public.products (id, name, category, brand, sku, purchase_price, profit_margin, sale_price, stock_quantity, images, specs, description, featured, badge, sizes)
VALUES
  (
    'prod-1',
    'Pro Series - Caveira Urban',
    'Decks',
    'Florishop',
    'D-CAVEIRA-825',
    160.00,
    118.125,
    349.00,
    15,
    ARRAY[
      'https://images.unsplash.com/photo-1520045892732-304bc3ac5d8e?auto=format&fit=crop&q=80&w=1000',
      'https://images.unsplash.com/photo-1547447134-cd3f5c716030?auto=format&fit=crop&q=80&w=1000'
    ],
    ARRAY['Largura: 8.25"', 'Comprimento: 32"', 'Wheelbase: 14.25"', '7 lâminas de Maple Canadense'],
    'Shape profissional testado e aprovado nas pistas da Ilha. Concave médio perfeito para street e transição.',
    true,
    'PRO SERIES',
    ARRAY['7.75"', '8.0"', '8.25"', '8.5"']
  ),
  (
    'prod-2',
    'Classic Maple - Logo Ilha',
    'Decks',
    'Florishop',
    'D-ILHA-80',
    140.00,
    113.57,
    299.00,
    8,
    ARRAY[
      'https://images.unsplash.com/photo-1547447134-cd3f5c716030?auto=format&fit=crop&q=80&w=1000'
    ],
    ARRAY['Largura: 8.0"', 'Comprimento: 31.75"', 'Wheelbase: 14"', 'Maple selecionado com cola epoxy'],
    'Design clássico minimalista homenageando o lifestyle do skate em Florianópolis.',
    true,
    'MAIS VENDIDO',
    ARRAY['8.0"', '8.25"']
  ),
  (
    'prod-3',
    'Stage 11 Hollow Silver 149mm',
    'Trucks',
    'Independent',
    'T-INDY-149H',
    310.00,
    80.32,
    559.00,
    6,
    ARRAY[
      'https://images.unsplash.com/photo-1595950653106-6c9ebd614d3a?auto=format&fit=crop&q=80&w=1000'
    ],
    ARRAY['Tamanho: 149mm (Ideal para shapes 8.25" a 8.5")', 'Eixo vazado Hollow', 'Amortecedores Medium 90A'],
    'Durabilidade lendária Independent com peso reduzido pelo eixo e pino central ocos.',
    true,
    'IMPORTADO',
    ARRAY['139mm', '144mm', '149mm']
  ),
  (
    'prod-4',
    'Formula Four Conical Full 54mm 101D',
    'Wheels',
    'Spitfire',
    'W-SPIT-F4-54',
    240.00,
    82.91,
    439.00,
    12,
    ARRAY[
      'https://images.unsplash.com/photo-1564982722802-1a7f05eb4970?auto=format&fit=crop&q=80&w=1000'
    ],
    ARRAY['Diâmetro: 54mm', 'Dureza: 101D', 'Formato: Conical Full', 'Uretano Formula Four anti-flatspot'],
    'A roda mais cobiçada do mundo. Velocidade inigualável e resposta rápida em qualquer asfalto.',
    true,
    'PREMIUM',
    ARRAY['52mm', '53mm', '54mm', '56mm']
  ),
  (
    'prod-5',
    'Camiseta Heavy Cotton Oversized Floripa Core',
    'Apparel',
    'Florishop',
    'A-TEE-CORE-BLK',
    55.00,
    134.54,
    129.00,
    25,
    ARRAY[
      'https://images.unsplash.com/photo-1521572267360-ee0c2909d518?auto=format&fit=crop&q=80&w=1000'
    ],
    ARRAY['100% Algodão 260g/m²', 'Modelagem Oversized Streetwear', 'Gola 3cm reforçada', 'Estampa em silk screen zero toque'],
    'Resistente a quedas e abrasão. Conforto total para sessões no sol da Joaquina.',
    false,
    'DROP EXCLUSIVO',
    ARRAY['P', 'M', 'G', 'GG']
  ),
  (
    'prod-6',
    'Tênis Skate Half Cab Pro Black/White',
    'Tênis',
    'Vans',
    'S-VANS-HCAB-41',
    340.00,
    76.17,
    599.00,
    4,
    ARRAY[
      'https://images.unsplash.com/photo-1525966222134-fcfa99b8ae77?auto=format&fit=crop&q=80&w=1000'
    ],
    ARRAY['Cabedal em camurça reforçada Duracap', 'Palmilha PopCush com máximo amortecimento', 'Solado Waffle de goma SickStick', 'Cano médio com proteção de tornozelo'],
    'O maior clássico do skate mundial, reforçado com as tecnologias modernas da linha Skate Classics.',
    true,
    'ICÔNICO',
    ARRAY['38', '39', '40', '41', '42', '43']
  )
ON CONFLICT (id) DO NOTHING;
