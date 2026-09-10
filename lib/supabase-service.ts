import { getSupabaseClient, isSupabaseConfigured, extractCleanSupabaseUrl } from './supabase';
import { Product, Order, User, StockMovement, FeaturedMonthConfig, UserPurchaseHistoryRecord } from './skate-store';

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
    user_purchase_history: boolean;
  };
}

// Controle em memória para evitar requisições repetidas se a tabela ainda não existir no Supabase
let isPurchaseHistoryTableAvailable: boolean | null = null;

export function isTableMissingError(error: any): boolean {
  if (!error) return false;
  const code = String(error.code || '');
  const message = String(error.message || '');
  return (
    code === 'PGRST205' ||
    code === '42P01' ||
    message.toLowerCase().includes('user_purchase_history') ||
    message.toLowerCase().includes('schema cache') ||
    message.toLowerCase().includes('does not exist')
  );
}

export function setPurchaseHistoryTableAvailable(available: boolean) {
  isPurchaseHistoryTableAvailable = available;
}

export function getPurchaseHistoryTableAvailable(): boolean | null {
  return isPurchaseHistoryTableAvailable;
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

    const { error: historyError } = await client
      .from('user_purchase_history')
      .select('id')
      .limit(1);

    if (historyError && isTableMissingError(historyError)) {
      isPurchaseHistoryTableAvailable = false;
    } else if (!historyError) {
      isPurchaseHistoryTableAvailable = true;
    }

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
        user_purchase_history: !historyError,
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
 * Salva um novo pedido e seus respectivos itens no Supabase de forma segura e resiliente.
 * Garante que chaves estrangeiras (user_id e product_id) não quebrem a gravação caso o usuário
 * ou produto não existam ou tenham IDs locais/temporários.
 */
export async function createOrderInSupabase(order: Order): Promise<{ success: boolean; error?: string }> {
  const client = getSupabaseClient();
  if (!client) {
    return { success: false, error: 'Cliente Supabase não configurado ou offline.' };
  }

  try {
    // 1. Validação do user_id contra restrição de chave estrangeira
    let validUserId: string | null = null;
    if (order.userId) {
      try {
        const { data: userExists } = await client
          .from('users')
          .select('id')
          .eq('id', order.userId)
          .maybeSingle();

        if (userExists?.id) {
          validUserId = userExists.id;
        } else if (order.customerEmail) {
          // Tenta localizar por e-mail caso o ID local seja diferente
          const { data: userByEmail } = await client
            .from('users')
            .select('id')
            .eq('email', order.customerEmail.toLowerCase().trim())
            .maybeSingle();
          if (userByEmail?.id) {
            validUserId = userByEmail.id;
          }
        }
      } catch (e) {
        console.warn('[Supabase] Aviso ao validar user_id do pedido:', e);
      }
    }

    // 2. Normalizar data para formato ISO seguro aceito pelo PostgreSQL TIMESTAMPTZ
    let safeDate = new Date().toISOString();
    if (order.date) {
      const parsed = new Date(order.date);
      if (!isNaN(parsed.getTime())) {
        safeDate = parsed.toISOString();
      }
    }

    // 3. Inserir registro principal do pedido
    const paymentDetailsWithHistory = {
      ...(order.paymentDetails || {}),
      statusHistory: order.statusHistory || [],
      deliveredAt: order.deliveredAt || null,
      canceledAt: order.canceledAt || null,
    };

    const { error: orderError } = await client.from('orders').upsert({
      id: order.id,
      user_id: validUserId,
      date: safeDate,
      subtotal: Number(order.subtotal) || 0,
      discount: Number(order.discount) || 0,
      interest: Number(order.interest) || 0,
      shipping_cost: Number(order.shippingCost) || 0,
      shipping_method: order.shippingMethod || 'Melhor Envio - PAC Correios',
      shipping_address: order.shippingAddress || {},
      total: Number(order.total) || 0,
      payment_method: order.paymentMethod,
      payment_details: paymentDetailsWithHistory,
      customer_name: order.customerName,
      customer_email: order.customerEmail,
      customer_phone: order.customerPhone || null,
      status: order.status || 'Aguardando Pagamento',
      admin_notes: order.adminNotes || null,
      tracking_code: order.trackingCode || null,
    }, { onConflict: 'id' });

    if (orderError) {
      console.error('[Supabase] Erro ao salvar pedido na tabela orders:', orderError);
      return { success: false, error: orderError.message };
    }

    // 4. Inserir itens do pedido validando product_id
    if (order.items && order.items.length > 0) {
      // Pré-carrega IDs de produtos para garantir integridade referencial
      const productIds = order.items
        .map((it) => it.product?.id)
        .filter((id): id is string => Boolean(id));

      let existingProductIds = new Set<string>();
      if (productIds.length > 0) {
        try {
          const { data: dbProducts } = await client
            .from('products')
            .select('id')
            .in('id', productIds);
          if (dbProducts) {
            existingProductIds = new Set(dbProducts.map((p) => p.id));
          }
        } catch (e) {
          console.warn('[Supabase] Aviso ao checar product_id dos itens:', e);
        }
      }

      // Remove itens antigos se for um upsert do mesmo pedido
      await client.from('order_items').delete().eq('order_id', order.id);

      const itemsToInsert = order.items.map((it) => {
        const hasValidDbProduct = it.product?.id && existingProductIds.has(it.product.id);
        return {
          order_id: order.id,
          product_id: hasValidDbProduct ? it.product.id : null,
          product_name: it.product.name,
          product_sku: it.product.sku || null,
          product_image: it.product.images?.[0] || null,
          sale_price: it.isGift ? 0 : Number(it.product.salePrice) || 0,
          quantity: Math.max(1, Number(it.quantity) || 1),
          selected_size: it.selectedSize || null,
          is_gift: Boolean(it.isGift),
          custom_note: it.customNote || null,
        };
      });

      const { error: itemsError } = await client.from('order_items').insert(itemsToInsert);
      if (itemsError) {
        console.error('[Supabase] Erro ao salvar itens do pedido:', itemsError);
      }
    }

    console.log(`[Supabase] Pedido ${order.id} salvo com sucesso no banco!`);
    return { success: true };
  } catch (e: any) {
    console.error('[Supabase] Exceção ao registrar pedido:', e);
    return { success: false, error: e?.message || 'Erro inesperado' };
  }
}

/**
 * Busca todos os pedidos e seus itens cadastrados no Supabase
 */
export async function fetchOrdersFromSupabase(): Promise<Order[] | null> {
  const client = getSupabaseClient();
  if (!client) return null;

  try {
    const { data, error } = await client
      .from('orders')
      .select('*, order_items(*)')
      .order('date', { ascending: false });

    if (error) {
      console.warn('[Supabase] Erro ao buscar pedidos:', error);
      return null;
    }

    if (!data) return [];

    return data.map((row: any): Order => {
      let formattedDate = row.date;
      try {
        if (row.date) {
          const d = new Date(row.date);
          if (!isNaN(d.getTime())) {
            formattedDate = d.toLocaleString('pt-BR');
          }
        }
      } catch {
        formattedDate = row.date || new Date().toLocaleString('pt-BR');
      }

      const items = (row.order_items || []).map((it: any) => ({
        product: {
          id: it.product_id || `prod-${it.id}`,
          name: it.product_name,
          category: 'Acessórios' as Product['category'],
          brand: 'Florishop',
          sku: it.product_sku || '',
          purchasePrice: 0,
          profitMargin: 0,
          salePrice: Number(it.sale_price) || 0,
          stockQuantity: 1,
          images: it.product_image ? [it.product_image] : [],
          specs: [],
          description: it.product_name,
          featured: false,
          sizes: it.selected_size ? [it.selected_size] : [],
        } as Product,
        quantity: Number(it.quantity) || 1,
        selectedSize: it.selected_size || undefined,
        isGift: Boolean(it.is_gift),
        customNote: it.custom_note || undefined,
      }));

      const statusHistory =
        row.status_history ||
        row.payment_details?.statusHistory ||
        [
          {
            id: `sh-${row.id}-init`,
            fromStatus: 'Novo Pedido',
            status: row.status || 'Aguardando Pagamento',
            timestamp: row.date || new Date().toISOString(),
            formattedDate: formattedDate,
            updatedBy: 'system',
            authorName: 'Sistema Florishop',
            notes: 'Registro inicial do pedido',
          },
        ];

      return {
        id: row.id,
        userId: row.user_id || undefined,
        date: formattedDate,
        items,
        subtotal: Number(row.subtotal) || 0,
        discount: Number(row.discount) || 0,
        interest: Number(row.interest) || 0,
        shippingCost: Number(row.shipping_cost) || 0,
        shippingMethod: row.shipping_method || 'Melhor Envio',
        shippingAddress: row.shipping_address || undefined,
        total: Number(row.total) || 0,
        paymentMethod: row.payment_method,
        paymentDetails: row.payment_details || {},
        customerName: row.customer_name,
        customerEmail: row.customer_email,
        customerPhone: row.customer_phone || undefined,
        status: row.status,
        adminNotes: row.admin_notes || undefined,
        trackingCode: row.tracking_code || undefined,
        statusHistory,
        deliveredAt: row.delivered_at || row.payment_details?.deliveredAt || undefined,
        canceledAt: row.canceled_at || row.payment_details?.canceledAt || undefined,
      };
    });
  } catch (e) {
    console.warn('[Supabase] Exceção ao buscar pedidos:', e);
    return null;
  }
}

/**
 * Atualiza status, rastreio, histórico ou notas de um pedido no Supabase
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

    if (
      updates.statusHistory !== undefined ||
      updates.deliveredAt !== undefined ||
      updates.canceledAt !== undefined ||
      updates.paymentDetails !== undefined
    ) {
      try {
        const { data: cur } = await client
          .from('orders')
          .select('payment_details')
          .eq('id', orderId)
          .maybeSingle();

        const basePayment = {
          ...(cur?.payment_details || {}),
          ...(updates.paymentDetails || {}),
        };

        if (updates.statusHistory !== undefined) {
          basePayment.statusHistory = updates.statusHistory;
        }
        if (updates.deliveredAt !== undefined) {
          basePayment.deliveredAt = updates.deliveredAt;
        }
        if (updates.canceledAt !== undefined) {
          basePayment.canceledAt = updates.canceledAt;
        }

        payload.payment_details = basePayment;
      } catch (e) {
        console.warn('[Supabase] Falha ao ler payment_details para mesclar histórico:', e);
      }
    }

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
    let validProductId: string | null = null;
    if (movement.productId) {
      try {
        const { data: pExists } = await client
          .from('products')
          .select('id')
          .eq('id', movement.productId)
          .maybeSingle();
        if (pExists?.id) {
          validProductId = pExists.id;
        }
      } catch {
        validProductId = null;
      }
    }

    let safeDate = new Date().toISOString();
    if (movement.date) {
      const parsed = new Date(movement.date);
      if (!isNaN(parsed.getTime())) {
        safeDate = parsed.toISOString();
      }
    }

    const { error } = await client.from('stock_movements').insert({
      id: movement.id,
      product_id: validProductId,
      product_name: movement.productName,
      type: movement.type,
      quantity: movement.quantity,
      date: safeDate,
      notes: movement.notes,
    });

    if (error) {
      console.error('[Supabase] Erro ao registrar movimentação no Supabase:', error);
      return false;
    }
    return true;
  } catch (e) {
    console.error('[Supabase] Exceção ao registrar movimentação no Supabase:', e);
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
      email: user.email.toLowerCase().trim(),
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
 * Sincroniza pedidos locais para o Supabase se a tabela de pedidos estiver vazia
 */
export async function syncInitialOrdersToSupabaseIfEmpty(
  orders: Order[]
): Promise<{ synced: boolean; orderCount: number }> {
  if (!isSupabaseConfigured() || orders.length === 0) {
    return { synced: false, orderCount: 0 };
  }

  const client = getSupabaseClient();
  if (!client) return { synced: false, orderCount: 0 };

  try {
    const { count, error } = await client
      .from('orders')
      .select('*', { count: 'exact', head: true });

    if (error) {
      console.warn('[Supabase] Aviso ao checar contagem de pedidos:', error);
      return { synced: false, orderCount: 0 };
    }

    if (count && count > 0) {
      return { synced: false, orderCount: count };
    }

    let successCount = 0;
    for (const order of orders) {
      const res = await createOrderInSupabase(order);
      if (res.success) successCount++;
    }

    return { synced: true, orderCount: successCount };
  } catch (e) {
    console.warn('[Supabase] Erro ao sincronizar pedidos iniciais:', e);
    return { synced: false, orderCount: 0 };
  }
}

/**
 * Sincroniza todos os pedidos para o Supabase (upsert manual sob demanda)
 */
export async function syncAllOrdersToSupabase(
  orders: Order[]
): Promise<{ success: number; failed: number }> {
  if (!isSupabaseConfigured()) {
    return { success: 0, failed: orders.length };
  }

  let success = 0;
  let failed = 0;
  for (const o of orders) {
    const res = await createOrderInSupabase(o);
    if (res.success) success++;
    else failed++;
  }
  return { success, failed };
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

/**
 * Registra ou atualiza um pedido no histórico de compras do usuário no Supabase (tabela user_purchase_history)
 */
export async function upsertPurchaseHistoryInSupabase(
  record: UserPurchaseHistoryRecord
): Promise<{ success: boolean; tableMissing?: boolean; error?: string }> {
  if (!isSupabaseConfigured()) {
    return { success: false, error: 'Supabase não configurado' };
  }

  // Se já foi detectado que a tabela não existe no banco remoto, evita novas tentativas com erro
  if (isPurchaseHistoryTableAvailable === false) {
    return {
      success: false,
      tableMissing: true,
      error: 'Tabela user_purchase_history ainda não criada no banco Supabase (dados mantidos no armazenamento local)',
    };
  }

  const client = getSupabaseClient();
  if (!client) {
    return { success: false, error: 'Cliente Supabase indisponível' };
  }

  try {
    const payload = {
      id: record.id,
      user_id: record.userId,
      order_id: record.orderId,
      customer_name: record.customerName,
      customer_email: record.customerEmail,
      completed_at: record.completedAt || new Date().toISOString(),
      order_date: record.orderDate || new Date().toISOString(),
      total: Number(record.total) || 0,
      subtotal: Number(record.subtotal) || 0,
      shipping_cost: Number(record.shippingCost) || 0,
      shipping_method: record.shippingMethod || null,
      payment_method: record.paymentMethod,
      items_count: record.itemsCount || record.items?.length || 1,
      items: record.items || [],
      tracking_code: record.trackingCode || null,
      delivery_notes: record.deliveryNotes || null,
      status: record.status || 'Entregue',
    };

    const { error } = await client
      .from('user_purchase_history')
      .upsert(payload, { onConflict: 'id' });

    if (error) {
      if (isTableMissingError(error)) {
        isPurchaseHistoryTableAvailable = false;
        console.warn(
          '[Supabase] Informação: A tabela "public.user_purchase_history" ainda não foi criada no banco de dados Supabase (PGRST205). O histórico foi salvo e mantido com segurança no armazenamento local (localStorage). Para criá-la no Supabase, basta executar a migration SQL em Administração > Conexão Supabase.'
        );
        return { success: false, tableMissing: true, error: error.message };
      }
      console.warn('[Supabase] Aviso ao registrar histórico de compras no Supabase:', error.message);
      return { success: false, error: error.message };
    }

    isPurchaseHistoryTableAvailable = true;
    console.log(`[Supabase] Histórico de compras sincronizado para o pedido #${record.orderId}`);
    return { success: true };
  } catch (e: any) {
    if (isTableMissingError(e)) {
      isPurchaseHistoryTableAvailable = false;
      return { success: false, tableMissing: true, error: e?.message };
    }
    console.warn('[Supabase] Aviso ao tentar sincronizar histórico de compras:', e?.message || e);
    return { success: false, error: e?.message || 'Erro inesperado' };
  }
}

/**
 * Consulta o histórico de compras de um usuário específico (pelo ID ou e-mail)
 */
export async function fetchUserPurchaseHistoryFromSupabase(
  userIdOrEmail: string
): Promise<UserPurchaseHistoryRecord[]> {
  if (!isSupabaseConfigured()) return [];
  if (isPurchaseHistoryTableAvailable === false) return [];
  const client = getSupabaseClient();
  if (!client) return [];

  try {
    const cleanParam = userIdOrEmail.trim().toLowerCase();
    const { data, error } = await client
      .from('user_purchase_history')
      .select('*')
      .or(`user_id.eq.${userIdOrEmail},customer_email.ilike.${cleanParam}`)
      .order('completed_at', { ascending: false });

    if (error) {
      if (isTableMissingError(error)) {
        isPurchaseHistoryTableAvailable = false;
        return [];
      }
      console.warn('[Supabase] Aviso ao buscar user_purchase_history:', error.message);
      return [];
    }

    isPurchaseHistoryTableAvailable = true;
    return (data || []).map((row: any) => ({
      id: row.id,
      userId: row.user_id,
      orderId: row.order_id,
      customerName: row.customer_name,
      customerEmail: row.customer_email,
      completedAt: row.completed_at,
      orderDate: row.order_date,
      total: Number(row.total) || 0,
      subtotal: Number(row.subtotal) || 0,
      shippingCost: Number(row.shipping_cost) || 0,
      shippingMethod: row.shipping_method,
      paymentMethod: row.payment_method,
      itemsCount: row.items_count,
      items: row.items || [],
      trackingCode: row.tracking_code,
      deliveryNotes: row.delivery_notes,
      status: row.status || 'Entregue',
      createdAt: row.created_at,
    }));
  } catch (e: any) {
    if (isTableMissingError(e)) {
      isPurchaseHistoryTableAvailable = false;
      return [];
    }
    console.warn('[Supabase] Aviso ao consultar histórico no Supabase:', e?.message || e);
    return [];
  }
}

/**
 * Consulta todo o histórico global de compras finalizadas (para painel administrativo)
 */
export async function fetchAllPurchaseHistoryFromSupabase(): Promise<UserPurchaseHistoryRecord[]> {
  if (!isSupabaseConfigured()) return [];
  if (isPurchaseHistoryTableAvailable === false) return [];
  const client = getSupabaseClient();
  if (!client) return [];

  try {
    const { data, error } = await client
      .from('user_purchase_history')
      .select('*')
      .order('completed_at', { ascending: false });

    if (error) {
      if (isTableMissingError(error)) {
        isPurchaseHistoryTableAvailable = false;
        return [];
      }
      console.warn('[Supabase] Aviso ao buscar todo o user_purchase_history:', error.message);
      return [];
    }

    isPurchaseHistoryTableAvailable = true;
    return (data || []).map((row: any) => ({
      id: row.id,
      userId: row.user_id,
      orderId: row.order_id,
      customerName: row.customer_name,
      customerEmail: row.customer_email,
      completedAt: row.completed_at,
      orderDate: row.order_date,
      total: Number(row.total) || 0,
      subtotal: Number(row.subtotal) || 0,
      shippingCost: Number(row.shipping_cost) || 0,
      shippingMethod: row.shipping_method,
      paymentMethod: row.payment_method,
      itemsCount: row.items_count,
      items: row.items || [],
      trackingCode: row.tracking_code,
      deliveryNotes: row.delivery_notes,
      status: row.status || 'Entregue',
      createdAt: row.created_at,
    }));
  } catch (e: any) {
    if (isTableMissingError(e)) {
      isPurchaseHistoryTableAvailable = false;
      return [];
    }
    return [];
  }
}
