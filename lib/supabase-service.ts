import { getSupabaseClient, isSupabaseConfigured, extractCleanSupabaseUrl } from './supabase';
import { Product, Order, User, StockMovement, FeaturedMonthConfig } from './skate-store';

export interface SupabaseHealthCheck {
  isConfigured: boolean;
  connected: boolean;
  url?: string;
  error?: string;
  tables?: {
    products: boolean;
    orders: boolean;
    users: boolean;
    stock_movements: boolean;
  };
}

/**
 * Valida a conexão ativa com o projeto Supabase e checa a presença das tabelas.
 */
export async function checkSupabaseConnection(): Promise<SupabaseHealthCheck> {
  if (!isSupabaseConfigured()) {
    return {
      isConfigured: false,
      connected: false,
      error: 'Variáveis de ambiente do Supabase não encontradas ou inválidas.',
    };
  }

  const client = getSupabaseClient();
  if (!client) {
    return {
      isConfigured: false,
      connected: false,
      error: 'Falha ao inicializar o cliente Supabase.',
    };
  }

  try {
    const { data: prodData, error: prodError } = await client
      .from('products')
      .select('id')
      .limit(1);

    const { error: orderError } = await client
      .from('orders')
      .select('id')
      .limit(1);

    const { error: userError } = await client
      .from('users')
      .select('id')
      .limit(1);

    const { error: stockError } = await client
      .from('stock_movements')
      .select('id')
      .limit(1);

    const hasAccess = !prodError;

    return {
      isConfigured: true,
      connected: hasAccess,
      url: extractCleanSupabaseUrl() || undefined,
      error: prodError ? prodError.message : undefined,
      tables: {
        products: !prodError,
        orders: !orderError,
        users: !userError,
        stock_movements: !stockError,
      },
    };
  } catch (err: any) {
    return {
      isConfigured: true,
      connected: false,
      error: err.message || 'Erro de rede ao conectar com o Supabase.',
    };
  }
}

/**
 * Mapeamento: Converte Produto da aplicação para formato do banco de dados
 */
export function mapProductToRow(product: Product) {
  let safeSpecs: string[] = [];
  if (Array.isArray(product.specs)) {
    safeSpecs = product.specs.map((s) => String(s));
  } else if (product.specs && typeof product.specs === 'object') {
    safeSpecs = Object.entries(product.specs).map(([k, v]) => `${k}: ${v}`);
  }

  return {
    id: product.id,
    name: product.name,
    category: product.category,
    brand: product.brand,
    sku: product.sku,
    purchase_price: product.purchasePrice,
    profit_margin: product.profitMargin,
    sale_price: product.salePrice,
    stock_quantity: product.stockQuantity,
    images: Array.isArray(product.images) ? product.images : [],
    specs: safeSpecs,
    description: product.description || '',
    featured: product.featured ?? false,
    badge: product.badge || null,
    sizes: Array.isArray(product.sizes) ? product.sizes : [],
  };
}

/**
 * Mapeamento: Converte Linha do banco de dados para Produto da aplicação
 */
export function mapRowToProduct(row: any): Product {
  return {
    id: row.id,
    name: row.name,
    category: row.category,
    brand: row.brand,
    sku: row.sku,
    purchasePrice: Number(row.purchase_price) || 0,
    profitMargin: Number(row.profit_margin) || 0,
    salePrice: Number(row.sale_price) || 0,
    stockQuantity: Number(row.stock_quantity) || 0,
    images: row.images || [],
    specs: row.specs || [],
    description: row.description || '',
    featured: Boolean(row.featured),
    badge: row.badge || undefined,
    sizes: row.sizes || [],
  };
}

/**
 * Busca todos os produtos do Supabase
 */
export async function fetchProductsFromSupabase(): Promise<Product[] | null> {
  const client = getSupabaseClient();
  if (!client) return null;

  try {
    const { data, error } = await client
      .from('products')
      .select('*')
      .order('created_at', { ascending: false });

    if (error) {
      console.warn('Erro ao carregar produtos do Supabase:', error.message);
      return null;
    }

    return (data || []).map(mapRowToProduct);
  } catch (e) {
    console.warn('Exceção ao buscar produtos do Supabase:', e);
    return null;
  }
}

/**
 * Salva ou atualiza um produto no Supabase
 */
export async function upsertProductInSupabase(product: Product): Promise<boolean> {
  const client = getSupabaseClient();
  if (!client) return false;

  try {
    const row = mapProductToRow(product);
    const { error } = await client.from('products').upsert(row, { onConflict: 'id' });
    if (error) {
      console.error('Erro ao fazer upsert de produto no Supabase:', error);
      return false;
    }
    return true;
  } catch (e) {
    console.error('Exceção ao salvar produto no Supabase:', e);
    return false;
  }
}

/**
 * Remove um produto do Supabase
 */
export async function deleteProductFromSupabase(productId: string): Promise<boolean> {
  const client = getSupabaseClient();
  if (!client) return false;

  try {
    const { error } = await client.from('products').delete().eq('id', productId);
    if (error) {
      console.error('Erro ao deletar produto no Supabase:', error);
      return false;
    }
    return true;
  } catch (e) {
    console.error('Exceção ao deletar produto no Supabase:', e);
    return false;
  }
}

/**
 * Salva um novo pedido e seus respectivos itens no Supabase
 */
export async function createOrderInSupabase(order: Order): Promise<boolean> {
  const client = getSupabaseClient();
  if (!client) return false;

  try {
    // 1. Inserir registro principal do pedido
    const { error: orderError } = await client.from('orders').insert({
      id: order.id,
      user_id: order.userId || null,
      date: order.date,
      subtotal: order.subtotal,
      discount: order.discount,
      interest: order.interest || 0,
      shipping_cost: order.shippingCost || 0,
      shipping_method: order.shippingMethod || 'PAC',
      shipping_address: order.shippingAddress || {},
      total: order.total,
      payment_method: order.paymentMethod,
      payment_details: order.paymentDetails || {},
      customer_name: order.customerName,
      customer_email: order.customerEmail,
      customer_phone: order.customerPhone || null,
      status: order.status,
      admin_notes: order.adminNotes || null,
      tracking_code: order.trackingCode || null,
    });

    if (orderError) {
      console.error('Erro ao salvar pedido no Supabase:', orderError);
      return false;
    }

    // 2. Inserir itens do pedido
    if (order.items && order.items.length > 0) {
      const itemsToInsert = order.items.map((it) => ({
        order_id: order.id,
        product_id: it.product.id || null,
        product_name: it.product.name,
        product_sku: it.product.sku || null,
        product_image: it.product.images?.[0] || null,
        sale_price: it.isGift ? 0 : it.product.salePrice,
        quantity: it.quantity,
        selected_size: it.selectedSize || null,
        is_gift: Boolean(it.isGift),
        custom_note: it.customNote || null,
      }));

      const { error: itemsError } = await client.from('order_items').insert(itemsToInsert);
      if (itemsError) {
        console.error('Erro ao salvar itens do pedido no Supabase:', itemsError);
      }
    }

    return true;
  } catch (e) {
    console.error('Exceção ao registrar pedido no Supabase:', e);
    return false;
  }
}

/**
 * Atualiza status, rastreio ou notas de um pedido no Supabase
 */
export async function updateOrderInSupabase(
  orderId: string,
  updates: Partial<Order>
): Promise<boolean> {
  const client = getSupabaseClient();
  if (!client) return false;

  try {
    const payload: any = {};
    if (updates.status !== undefined) payload.status = updates.status;
    if (updates.trackingCode !== undefined) payload.tracking_code = updates.trackingCode;
    if (updates.adminNotes !== undefined) payload.admin_notes = updates.adminNotes;
    if (updates.customerName !== undefined) payload.customer_name = updates.customerName;
    if (updates.customerEmail !== undefined) payload.customer_email = updates.customerEmail;
    if (updates.customerPhone !== undefined) payload.customer_phone = updates.customerPhone;
    if (updates.shippingCost !== undefined) payload.shipping_cost = updates.shippingCost;
    if (updates.shippingAddress !== undefined) payload.shipping_address = updates.shippingAddress;
    if (updates.total !== undefined) payload.total = updates.total;
    if (updates.subtotal !== undefined) payload.subtotal = updates.subtotal;

    const { error } = await client.from('orders').update(payload).eq('id', orderId);
    if (error) {
      console.error('Erro ao atualizar pedido no Supabase:', error);
      return false;
    }
    return true;
  } catch (e) {
    console.error('Exceção ao atualizar pedido no Supabase:', e);
    return false;
  }
}

/**
 * Exclui um pedido do Supabase
 */
export async function deleteOrderFromSupabase(orderId: string): Promise<boolean> {
  const client = getSupabaseClient();
  if (!client) return false;

  try {
    const { error } = await client.from('orders').delete().eq('id', orderId);
    if (error) {
      console.error('Erro ao deletar pedido no Supabase:', error);
      return false;
    }
    return true;
  } catch (e) {
    console.error('Exceção ao deletar pedido no Supabase:', e);
    return false;
  }
}

/**
 * Registra movimentação de estoque no Supabase
 */
export async function recordStockMovementInSupabase(movement: StockMovement): Promise<boolean> {
  const client = getSupabaseClient();
  if (!client) return false;

  try {
    const { error } = await client.from('stock_movements').insert({
      id: movement.id,
      product_id: movement.productId,
      product_name: movement.productName,
      type: movement.type,
      quantity: movement.quantity,
      date: movement.date,
      notes: movement.notes,
    });

    if (error) {
      console.error('Erro ao registrar movimentação no Supabase:', error);
      return false;
    }
    return true;
  } catch (e) {
    console.error('Exceção ao registrar movimentação no Supabase:', e);
    return false;
  }
}

/**
 * Salva ou atualiza usuário no Supabase
 */
export async function upsertUserInSupabase(user: User): Promise<boolean> {
  const client = getSupabaseClient();
  if (!client) return false;

  try {
    const { error } = await client.from('users').upsert({
      id: user.id,
      name: user.name,
      email: user.email,
      password_hash: user.password || null,
      phone: user.phone || null,
      cpf: user.cpf || null,
      role: user.role,
      status: user.status,
      address: user.address || {},
    }, { onConflict: 'id' });

    if (error) {
      console.error('Erro ao salvar usuário no Supabase:', error);
      return false;
    }
    return true;
  } catch (e) {
    console.error('Exceção ao salvar usuário no Supabase:', e);
    return false;
  }
}

/**
 * Se o banco do Supabase estiver online mas sem nenhum produto cadastrado,
 * envia o catálogo inicial de produtos e os usuários padrão para popular o banco.
 */
export async function syncInitialDataToSupabaseIfEmpty(
  products: Product[],
  users: User[]
): Promise<{ synced: boolean; productCount: number; userCount: number }> {
  if (!isSupabaseConfigured()) {
    return { synced: false, productCount: 0, userCount: 0 };
  }

  const client = getSupabaseClient();
  if (!client) return { synced: false, productCount: 0, userCount: 0 };

  try {
    const { count, error } = await client
      .from('products')
      .select('*', { count: 'exact', head: true });

    if (error) {
      console.warn('Não foi possível verificar contagem de produtos no Supabase:', error);
      return { synced: false, productCount: 0, userCount: 0 };
    }

    // Se já existem produtos no Supabase, não sobreescreve
    if (count && count > 0) {
      return { synced: false, productCount: count, userCount: 0 };
    }

    // Supabase está zerado, vamos subir os produtos
    let productSuccess = 0;
    for (const p of products) {
      const ok = await upsertProductInSupabase(p);
      if (ok) productSuccess++;
    }

    let userSuccess = 0;
    for (const u of users) {
      const ok = await upsertUserInSupabase(u);
      if (ok) userSuccess++;
    }

    return { synced: true, productCount: productSuccess, userCount: userSuccess };
  } catch (e) {
    console.error('Falha na sincronização inicial com Supabase:', e);
    return { synced: false, productCount: 0, userCount: 0 };
  }
}
