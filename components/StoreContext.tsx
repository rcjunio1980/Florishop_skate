'use client';

import React, { createContext, useContext, useState, useEffect } from 'react';
import {
  Product,
  CartItem,
  Order,
  StockMovement,
  User,
  INITIAL_PRODUCTS,
  INITIAL_USERS,
  INITIAL_ORDERS,
  PaymentMethod,
  FeaturedMonthConfig,
  FeaturedSlotConfig,
  INITIAL_FEATURED_CONFIG,
  calculateSalePriceFromMargin,
  calculateMarginFromSalePrice,
  calculateUnitProfit
} from '@/lib/skate-store';
import {
  updateOrderInSupabase,
  deleteOrderFromSupabase,
  createOrderInSupabase,
  upsertProductInSupabase,
  deleteProductFromSupabase,
  upsertUserInSupabase,
  recordStockMovementInSupabase,
  syncInitialDataToSupabaseIfEmpty,
  fetchProductsFromSupabase,
  fetchOrdersFromSupabase,
  syncInitialOrdersToSupabaseIfEmpty,
  syncAllOrdersToSupabase
} from '@/lib/supabase-service';
import { isSupabaseConfigured } from '@/lib/supabase';

interface StoreContextType {
  isHydrated: boolean;
  products: Product[];
  cart: CartItem[];
  orders: Order[];
  stockMovements: StockMovement[];
  featuredConfig: FeaturedMonthConfig;
  users: User[];
  currentUser: User | null;
  isAdmin: boolean;
  isLoggedIn: boolean;
  authModalOpen: boolean;
  authModalMode: 'login' | 'register' | 'admin-login';
  activeTab: 'home' | 'catalog' | 'detail' | 'checkout' | 'admin-stock' | 'admin-users' | 'admin-orders' | 'orders-history' | 'tenis';
  selectedProduct: Product | null;
  searchQuery: string;
  categoryFilter: string;
  setSearchQuery: (q: string) => void;
  setCategoryFilter: (c: string) => void;
  setActiveTab: (tab: 'home' | 'catalog' | 'detail' | 'checkout' | 'admin-stock' | 'admin-users' | 'admin-orders' | 'orders-history' | 'tenis') => void;
  openProductDetail: (p: Product) => void;
  addToCart: (p: Product, qty?: number, size?: string) => void;
  removeFromCart: (pId: string, size?: string) => void;
  updateCartQuantity: (pId: string, qty: number, size?: string) => void;
  clearCart: () => void;
  openAuthModal: (mode?: 'login' | 'register' | 'admin-login') => void;
  closeAuthModal: () => void;
  login: (email: string, password: string) => { success: boolean; error?: string };
  registerUser: (userData: {
    name: string;
    email: string;
    password: string;
    phone?: string;
    cpf?: string;
    address?: {
      cep?: string;
      street?: string;
      number?: string;
      complement?: string;
      neighborhood?: string;
      city?: string;
      state?: string;
    };
  }) => { success: boolean; error?: string };
  logout: () => void;
  addUser: (userData: Omit<User, 'id' | 'createdAt'>) => void;
  updateUserStatus: (userId: string, status: 'active' | 'blocked') => void;
  updateUserProfile: (userId: string, data: Partial<User>) => void;
  deleteUser: (userId: string) => void;
  updateOrder: (orderId: string, updatedData: Partial<Order>) => void;
  deleteOrder: (orderId: string, restoreStock?: boolean) => void;
  cancelOrder: (orderId: string, reason?: string) => void;
  syncOrdersWithSupabase: () => Promise<{ success: boolean; count: number; error?: string }>;
  addItemToOrder: (orderId: string, item: CartItem, isGift?: boolean) => void;
  removeItemFromOrder: (orderId: string, itemIndex: number, restoreStock?: boolean) => void;
  updateOrderItemQuantity: (orderId: string, itemIndex: number, newQty: number) => void;
  addGiftToOrder: (orderId: string, gift: { name: string; notes?: string; category?: string; image?: string; size?: string }) => void;
  processCheckout: (
    customerName: string,
    customerEmail: string,
    paymentMethod: PaymentMethod,
    paymentDetails: {
      pixKey?: string;
      cardInstallments?: string;
      cardInterestRate?: number;
      receiptAttached?: boolean;
      receiptName?: string;
    },
    totals?: {
      subtotal?: number;
      discount?: number;
      interest?: number;
      shippingCost?: number;
      shippingMethod?: string;
      shippingAddress?: {
        cep?: string;
        street?: string;
        number?: string;
        neighborhood?: string;
        city?: string;
        state?: string;
        complement?: string;
      };
      total?: number;
    }
  ) => Order | null;
  addProduct: (productData: Omit<Product, 'id'>) => void;
  updateProduct: (id: string, productData: Partial<Product>) => void;
  deleteProduct: (id: string) => void;
  adjustStockQuantity: (id: string, delta: number, notes?: string) => void;
  updateFeaturedSlot: (slotKey: 'slot1' | 'slot2' | 'slot3', update: Partial<FeaturedSlotConfig>) => void;
  setFeaturedConfig: (config: FeaturedMonthConfig) => void;
  resetFeaturedConfig: () => void;
  resetToInitialData: () => void;
}

const StoreContext = createContext<StoreContextType | undefined>(undefined);

const STORAGE_KEYS = {
  PRODUCTS: 'florishop_skate_products_v1',
  CART: 'florishop_skate_cart_v1',
  ORDERS: 'florishop_skate_orders_v1',
  MOVEMENTS: 'florishop_skate_movements_v1',
  FEATURED: 'florishop_skate_featured_v1',
  USERS: 'florishop_skate_users_v1',
  CURRENT_USER: 'florishop_skate_current_user_v1',
};

export const StoreProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [products, setProducts] = useState<Product[]>(INITIAL_PRODUCTS);
  const [cart, setCart] = useState<CartItem[]>([]);
  const [orders, setOrders] = useState<Order[]>(INITIAL_ORDERS);
  const [stockMovements, setStockMovements] = useState<StockMovement[]>([]);
  const [featuredConfig, setFeaturedConfig] = useState<FeaturedMonthConfig>(INITIAL_FEATURED_CONFIG);
  const [users, setUsers] = useState<User[]>(INITIAL_USERS);
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [authModalOpen, setAuthModalOpen] = useState<boolean>(false);
  const [authModalMode, setAuthModalMode] = useState<'login' | 'register' | 'admin-login'>('login');
  const [isHydrated, setIsHydrated] = useState(false);

  const [activeTab, setActiveTab] = useState<'home' | 'catalog' | 'detail' | 'checkout' | 'admin-stock' | 'admin-users' | 'admin-orders' | 'orders-history' | 'tenis'>('home');
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('Todos');

  // Hydrate states from localStorage after initial client mount
  useEffect(() => {
    const handle = requestAnimationFrame(() => {
      try {
        const savedProducts = localStorage.getItem(STORAGE_KEYS.PRODUCTS);
        if (savedProducts) {
          const parsed: Product[] = JSON.parse(savedProducts);
          const existingIds = new Set(parsed.map((p) => p.id));
          const missingInitial = INITIAL_PRODUCTS.filter((p) => !existingIds.has(p.id));
          if (missingInitial.length > 0) {
            setProducts([...parsed, ...missingInitial]);
          } else {
            setProducts(parsed);
          }
        }

        const savedCart = localStorage.getItem(STORAGE_KEYS.CART);
        if (savedCart) {
          setCart(JSON.parse(savedCart));
        }

        const savedOrders = localStorage.getItem(STORAGE_KEYS.ORDERS);
        if (savedOrders) {
          try {
            const parsedOrders: Order[] = JSON.parse(savedOrders);
            setOrders(parsedOrders.length > 0 ? parsedOrders : INITIAL_ORDERS);
          } catch (e) {
            console.error('Error parsing orders:', e);
            setOrders(INITIAL_ORDERS);
          }
        } else {
          setOrders(INITIAL_ORDERS);
        }

        const savedMovements = localStorage.getItem(STORAGE_KEYS.MOVEMENTS);
        if (savedMovements) {
          setStockMovements(JSON.parse(savedMovements));
        }

        const savedFeatured = localStorage.getItem(STORAGE_KEYS.FEATURED);
        if (savedFeatured) {
          try {
            setFeaturedConfig(JSON.parse(savedFeatured));
          } catch (e) {
            console.error(e);
          }
        }

        // Hydrate users
        const savedUsers = localStorage.getItem(STORAGE_KEYS.USERS);
        if (savedUsers) {
          const parsedUsers: User[] = JSON.parse(savedUsers);
          // Garantir que o usuário admin padrão exista
          const hasAdmin = parsedUsers.some((u) => u.role === 'admin');
          if (!hasAdmin) {
            const adminUser = INITIAL_USERS.find((u) => u.role === 'admin');
            if (adminUser) parsedUsers.unshift(adminUser);
          }
          setUsers(parsedUsers);
        } else {
          setUsers(INITIAL_USERS);
        }

        // Hydrate current logged user
        const savedCurrentUser = localStorage.getItem(STORAGE_KEYS.CURRENT_USER);
        if (savedCurrentUser) {
          try {
            setCurrentUser(JSON.parse(savedCurrentUser));
          } catch (e) {
            console.error(e);
          }
        }
      } catch (e) {
        console.error('Error hydrating store from localStorage:', e);
      } finally {
        setIsHydrated(true);
      }
    });

    return () => cancelAnimationFrame(handle);
  }, []);

  // Sincronização em segundo plano com o Supabase quando hidratado
  useEffect(() => {
    if (!isHydrated) return;
    if (isSupabaseConfigured()) {
      syncInitialDataToSupabaseIfEmpty(products, users)
        .then((res) => {
          if (res.synced) {
            console.log(`[Supabase] Sincronização inicial de produtos: ${res.productCount} produtos enviados.`);
          } else if (res.productCount > 0) {
            fetchProductsFromSupabase().then((remoteProducts) => {
              if (remoteProducts && remoteProducts.length > 0) {
                setProducts(remoteProducts);
              }
            });
          }
        })
        .catch((e) => console.warn('[Supabase] Erro ao sincronizar catálogo inicial:', e));

      // Sincronização e carregamento de pedidos no Supabase
      syncInitialOrdersToSupabaseIfEmpty(orders)
        .then((res) => {
          if (res.synced) {
            console.log(`[Supabase] Sincronização de pedidos iniciais: ${res.orderCount} enviados.`);
          }
          fetchOrdersFromSupabase().then((remoteOrders) => {
            if (remoteOrders && remoteOrders.length > 0) {
              setOrders((local) => {
                const remoteMap = new Map(remoteOrders.map((o) => [o.id, o]));
                const localOnly = local.filter((o) => !remoteMap.has(o.id));
                // Persiste localmente pedidos que não estavam na nuvem ainda
                for (const l of localOnly) {
                  createOrderInSupabase(l).catch(() => {});
                }
                return [...localOnly, ...remoteOrders];
              });
            }
          });
        })
        .catch((e) => console.warn('[Supabase] Erro ao sincronizar pedidos:', e));
    }
  }, [isHydrated]);

  // Sync to localStorage
  useEffect(() => {
    if (!isHydrated) return;
    try {
      localStorage.setItem(STORAGE_KEYS.PRODUCTS, JSON.stringify(products));
    } catch (e) {
      console.error(e);
    }
  }, [products, isHydrated]);

  useEffect(() => {
    if (!isHydrated) return;
    try {
      localStorage.setItem(STORAGE_KEYS.CART, JSON.stringify(cart));
    } catch (e) {
      console.error(e);
    }
  }, [cart, isHydrated]);

  useEffect(() => {
    if (!isHydrated) return;
    try {
      localStorage.setItem(STORAGE_KEYS.ORDERS, JSON.stringify(orders));
    } catch (e) {
      console.error(e);
    }
  }, [orders, isHydrated]);

  useEffect(() => {
    if (!isHydrated) return;
    try {
      localStorage.setItem(STORAGE_KEYS.MOVEMENTS, JSON.stringify(stockMovements));
    } catch (e) {
      console.error(e);
    }
  }, [stockMovements, isHydrated]);

  useEffect(() => {
    if (!isHydrated) return;
    try {
      localStorage.setItem(STORAGE_KEYS.USERS, JSON.stringify(users));
    } catch (e) {
      console.error(e);
    }
  }, [users, isHydrated]);

  useEffect(() => {
    if (!isHydrated) return;
    try {
      if (currentUser) {
        localStorage.setItem(STORAGE_KEYS.CURRENT_USER, JSON.stringify(currentUser));
      } else {
        localStorage.removeItem(STORAGE_KEYS.CURRENT_USER);
      }
    } catch (e) {
      console.error(e);
    }
  }, [currentUser, isHydrated]);

  // Auth Helpers
  const isAdmin = currentUser?.role === 'admin';
  const isLoggedIn = !!currentUser;

  const openAuthModal = (mode: 'login' | 'register' | 'admin-login' = 'login') => {
    setAuthModalMode(mode);
    setAuthModalOpen(true);
  };

  const closeAuthModal = () => {
    setAuthModalOpen(false);
  };

  const login = (email: string, password: string): { success: boolean; error?: string } => {
    const cleanEmail = email.trim().toLowerCase();
    const found = users.find((u) => u.email.trim().toLowerCase() === cleanEmail);

    if (!found) {
      return { success: false, error: 'E-mail não encontrado. Verifique os dados ou crie sua conta.' };
    }

    if (found.password && found.password !== password) {
      return { success: false, error: 'Senha incorreta. Tente novamente.' };
    }

    if (found.status === 'blocked') {
      return { success: false, error: 'Esta conta de usuário foi temporariamente bloqueada pela administração.' };
    }

    setCurrentUser(found);
    closeAuthModal();
    return { success: true };
  };

  const registerUser = (userData: {
    name: string;
    email: string;
    password: string;
    phone?: string;
    cpf?: string;
    address?: {
      cep?: string;
      street?: string;
      number?: string;
      complement?: string;
      neighborhood?: string;
      city?: string;
      state?: string;
    };
  }): { success: boolean; error?: string } => {
    const cleanEmail = userData.email.trim().toLowerCase();

    if (!userData.name.trim()) {
      return { success: false, error: 'Por favor, informe seu nome completo.' };
    }

    if (!cleanEmail.includes('@')) {
      return { success: false, error: 'Por favor, informe um e-mail válido.' };
    }

    if (!userData.password || userData.password.length < 4) {
      return { success: false, error: 'A senha deve conter pelo menos 4 caracteres.' };
    }

    const emailExists = users.some((u) => u.email.trim().toLowerCase() === cleanEmail);
    if (emailExists) {
      return { success: false, error: 'Este e-mail já está cadastrado. Faça login ou use outro e-mail.' };
    }

    const newUser: User = {
      id: `usr-${Date.now()}-${Math.random().toString(36).substr(2, 4)}`,
      name: userData.name.trim(),
      email: cleanEmail,
      password: userData.password,
      phone: userData.phone || '',
      cpf: userData.cpf || '',
      role: 'customer',
      createdAt: new Date().toISOString(),
      status: 'active',
      address: userData.address,
    };

    setUsers((prev) => [newUser, ...prev]);
    setCurrentUser(newUser);
    closeAuthModal();

    if (isSupabaseConfigured()) {
      upsertUserInSupabase(newUser).catch((e) =>
        console.warn('Erro ao sincronizar usuário com Supabase:', e)
      );
    }

    return { success: true };
  };

  const logout = () => {
    setCurrentUser(null);
    localStorage.removeItem(STORAGE_KEYS.CURRENT_USER);
    // Se o usuário estava em aba administrativa restrita, redireciona para a home
    if (activeTab === 'admin-stock' || activeTab === 'admin-users' || activeTab === 'admin-orders') {
      setActiveTab('home');
    }
  };

  // Funções de Gestão de Cadastros (Admin)
  const addUser = (userData: Omit<User, 'id' | 'createdAt'>) => {
    const newUser: User = {
      ...userData,
      id: `usr-${Date.now()}-${Math.random().toString(36).substr(2, 4)}`,
      createdAt: new Date().toISOString(),
      status: userData.status || 'active',
    };
    setUsers((prev) => [newUser, ...prev]);

    if (isSupabaseConfigured()) {
      upsertUserInSupabase(newUser).catch((e) =>
        console.warn('Erro ao salvar usuário no Supabase:', e)
      );
    }
  };

  const updateUserStatus = (userId: string, status: 'active' | 'blocked') => {
    setUsers((prev) =>
      prev.map((u) => (u.id === userId ? { ...u, status } : u))
    );
    if (currentUser?.id === userId) {
      setCurrentUser((prev) => (prev ? { ...prev, status } : null));
    }
  };

  const updateUserProfile = (userId: string, data: Partial<User>) => {
    setUsers((prev) =>
      prev.map((u) => {
        if (u.id === userId) {
          const updated = { ...u, ...data };
          if (isSupabaseConfigured()) {
            upsertUserInSupabase(updated).catch((e) =>
              console.warn('Erro ao atualizar usuário no Supabase:', e)
            );
          }
          return updated;
        }
        return u;
      })
    );
    if (currentUser?.id === userId) {
      setCurrentUser((prev) => (prev ? { ...prev, ...data } : null));
    }
  };

  const deleteUser = (userId: string) => {
    setUsers((prev) => prev.filter((u) => u.id !== userId));
    if (currentUser?.id === userId) {
      logout();
    }
  };

  // Funções de Gestão de Pedidos (Admin)
  const updateOrder = (orderId: string, updatedData: Partial<Order>) => {
    if (isSupabaseConfigured()) {
      updateOrderInSupabase(orderId, updatedData).catch((e) =>
        console.warn('Falha ao atualizar pedido no Supabase:', e)
      );
    }

    setOrders((prev) =>
      prev.map((order) => {
        if (order.id !== orderId) return order;
        const merged = { ...order, ...updatedData };
        // Recalcular totais se itens, shippingCost ou interest foram alterados
        if (updatedData.items || updatedData.shippingCost !== undefined || updatedData.interest !== undefined) {
          const subtotal = merged.items.reduce(
            (acc, it) => (it.isGift ? acc : acc + it.product.salePrice * it.quantity),
            0
          );
          const discount = merged.paymentMethod === 'pix' ? Number((subtotal * 0.05).toFixed(2)) : merged.discount;
          const total = Number(
            (subtotal - discount + (merged.shippingCost || 0) + (merged.interest || 0)).toFixed(2)
          );
          merged.subtotal = subtotal;
          merged.discount = discount;
          merged.total = total;
        }
        return merged;
      })
    );
  };

  const deleteOrder = (orderId: string, restoreStock: boolean = true) => {
    const targetOrder = orders.find((o) => o.id === orderId);
    if (!targetOrder) return;

    if (restoreStock && targetOrder.status !== 'Cancelado') {
      // Devolver estoque dos itens que não são brindes de cortesia virtuais
      setProducts((prev) =>
        prev.map((p) => {
          const matchedItem = targetOrder.items.find((it) => it.product.id === p.id && !it.isGift);
          if (matchedItem) {
            return { ...p, stockQuantity: p.stockQuantity + matchedItem.quantity };
          }
          return p;
        })
      );

      const returnMovements: StockMovement[] = targetOrder.items
        .filter((it) => !it.isGift)
        .map((it) => ({
          id: `mov-${Date.now()}-${Math.random().toString(36).substr(2, 4)}`,
          productId: it.product.id,
          productName: it.product.name,
          type: 'ENTRADA',
          quantity: it.quantity,
          date: new Date().toLocaleString('pt-BR'),
          notes: `Estorno por Exclusão do Pedido #${orderId}`,
        }));

      if (returnMovements.length > 0) {
        setStockMovements((prev) => [...returnMovements, ...prev]);
      }
    }

    setOrders((prev) => prev.filter((o) => o.id !== orderId));

    if (isSupabaseConfigured()) {
      deleteOrderFromSupabase(orderId).catch((e) =>
        console.warn('Falha ao excluir pedido no Supabase:', e)
      );
    }
  };

  const cancelOrder = (orderId: string, reason?: string) => {
    const targetOrder = orders.find((o) => o.id === orderId);
    if (!targetOrder || targetOrder.status === 'Cancelado') return;

    // Se o pedido ainda não estava cancelado, devolver o estoque
    setProducts((prev) =>
      prev.map((p) => {
        const matchedItem = targetOrder.items.find((it) => it.product.id === p.id && !it.isGift);
        if (matchedItem) {
          return { ...p, stockQuantity: p.stockQuantity + matchedItem.quantity };
        }
        return p;
      })
    );

    const returnMovements: StockMovement[] = targetOrder.items
      .filter((it) => !it.isGift)
      .map((it) => ({
        id: `mov-${Date.now()}-${Math.random().toString(36).substr(2, 4)}`,
        productId: it.product.id,
        productName: it.product.name,
        type: 'ENTRADA',
        quantity: it.quantity,
        date: new Date().toLocaleString('pt-BR'),
        notes: `Estorno por Cancelamento do Pedido #${orderId}${reason ? ` (${reason})` : ''}`,
      }));

    if (returnMovements.length > 0) {
      setStockMovements((prev) => [...returnMovements, ...prev]);
    }

    const cancellationNote = reason
      ? `Cancelado pelo cliente (${reason}) em ${new Date().toLocaleString('pt-BR')}`
      : `Cancelado pelo cliente em ${new Date().toLocaleString('pt-BR')}`;

    setOrders((prev) =>
      prev.map((order) => {
        if (order.id !== orderId) return order;
        return {
          ...order,
          status: 'Cancelado',
          adminNotes: order.adminNotes ? `${order.adminNotes} | ${cancellationNote}` : cancellationNote,
        };
      })
    );

    if (isSupabaseConfigured()) {
      updateOrderInSupabase(orderId, {
        status: 'Cancelado',
        adminNotes: targetOrder.adminNotes ? `${targetOrder.adminNotes} | ${cancellationNote}` : cancellationNote,
      }).catch((e) => console.warn('Falha ao atualizar cancelamento no Supabase:', e));
    }
  };

  const syncOrdersWithSupabase = async (): Promise<{ success: boolean; count: number; error?: string }> => {
    if (!isSupabaseConfigured()) {
      return { success: false, count: 0, error: 'Supabase não está configurado nas variáveis de ambiente.' };
    }
    try {
      const pushRes = await syncAllOrdersToSupabase(orders);
      const remoteOrders = await fetchOrdersFromSupabase();
      if (remoteOrders && remoteOrders.length > 0) {
        setOrders(remoteOrders);
        return { success: true, count: remoteOrders.length };
      }
      return { success: true, count: pushRes.syncedCount };
    } catch (e: any) {
      return { success: false, count: 0, error: e?.message || 'Falha ao sincronizar pedidos com o Supabase' };
    }
  };

  const addItemToOrder = (orderId: string, item: CartItem, isGift: boolean = false) => {
    const targetOrder = orders.find((o) => o.id === orderId);
    if (!targetOrder) return;

    const formattedItem: CartItem = {
      ...item,
      isGift: isGift || item.isGift || false,
      product: {
        ...item.product,
        salePrice: isGift ? 0 : item.product.salePrice,
      },
    };

    // Se for item pago (esquecido pelo cliente), atualizar estoque
    if (!isGift) {
      setProducts((prev) =>
        prev.map((p) => {
          if (p.id === item.product.id) {
            return { ...p, stockQuantity: Math.max(0, p.stockQuantity - item.quantity) };
          }
          return p;
        })
      );

      const movement: StockMovement = {
        id: `mov-${Date.now()}-${Math.random().toString(36).substr(2, 4)}`,
        productId: item.product.id,
        productName: item.product.name,
        type: 'SAÍDA_VENDA',
        quantity: item.quantity,
        date: new Date().toLocaleString('pt-BR'),
        notes: `Item esquecido adicionado ao Pedido #${orderId} (Admin)`,
      };
      setStockMovements((prev) => [movement, ...prev]);
    } else if (item.product.id && !item.product.id.startsWith('gift-custom-')) {
      // Se for brinde de produto existente do catálogo, dá baixa de 1 unidade
      setProducts((prev) =>
        prev.map((p) => {
          if (p.id === item.product.id) {
            return { ...p, stockQuantity: Math.max(0, p.stockQuantity - item.quantity) };
          }
          return p;
        })
      );
    }

    setOrders((prev) =>
      prev.map((order) => {
        if (order.id !== orderId) return order;
        const newItems = [...order.items, formattedItem];
        const subtotal = newItems.reduce(
          (acc, it) => (it.isGift ? acc : acc + it.product.salePrice * it.quantity),
          0
        );
        const discount = order.paymentMethod === 'pix' ? Number((subtotal * 0.05).toFixed(2)) : order.discount;
        const total = Number(
          (subtotal - discount + (order.shippingCost || 0) + (order.interest || 0)).toFixed(2)
        );
        return {
          ...order,
          items: newItems,
          subtotal,
          discount,
          total,
        };
      })
    );
  };

  const removeItemFromOrder = (orderId: string, itemIndex: number, restoreStock: boolean = true) => {
    const targetOrder = orders.find((o) => o.id === orderId);
    if (!targetOrder || !targetOrder.items[itemIndex]) return;

    const removedItem = targetOrder.items[itemIndex];
    if (restoreStock && !removedItem.isGift) {
      setProducts((prev) =>
        prev.map((p) => {
          if (p.id === removedItem.product.id) {
            return { ...p, stockQuantity: p.stockQuantity + removedItem.quantity };
          }
          return p;
        })
      );
    }

    setOrders((prev) =>
      prev.map((order) => {
        if (order.id !== orderId) return order;
        const newItems = order.items.filter((_, idx) => idx !== itemIndex);
        const subtotal = newItems.reduce(
          (acc, it) => (it.isGift ? acc : acc + it.product.salePrice * it.quantity),
          0
        );
        const discount = order.paymentMethod === 'pix' ? Number((subtotal * 0.05).toFixed(2)) : (newItems.length === 0 ? 0 : order.discount);
        const total = Number(
          (subtotal - discount + (newItems.length === 0 ? 0 : (order.shippingCost || 0)) + (order.interest || 0)).toFixed(2)
        );
        return {
          ...order,
          items: newItems,
          subtotal,
          discount,
          total,
        };
      })
    );
  };

  const updateOrderItemQuantity = (orderId: string, itemIndex: number, newQty: number) => {
    if (newQty <= 0) {
      removeItemFromOrder(orderId, itemIndex);
      return;
    }

    const targetOrder = orders.find((o) => o.id === orderId);
    if (!targetOrder || !targetOrder.items[itemIndex]) return;

    const oldItem = targetOrder.items[itemIndex];
    const diff = newQty - oldItem.quantity;

    if (diff !== 0 && !oldItem.isGift) {
      setProducts((prev) =>
        prev.map((p) => {
          if (p.id === oldItem.product.id) {
            return { ...p, stockQuantity: Math.max(0, p.stockQuantity - diff) };
          }
          return p;
        })
      );
    }

    setOrders((prev) =>
      prev.map((order) => {
        if (order.id !== orderId) return order;
        const newItems = order.items.map((it, idx) => (idx === itemIndex ? { ...it, quantity: newQty } : it));
        const subtotal = newItems.reduce(
          (acc, it) => (it.isGift ? acc : acc + it.product.salePrice * it.quantity),
          0
        );
        const discount = order.paymentMethod === 'pix' ? Number((subtotal * 0.05).toFixed(2)) : order.discount;
        const total = Number(
          (subtotal - discount + (order.shippingCost || 0) + (order.interest || 0)).toFixed(2)
        );
        return {
          ...order,
          items: newItems,
          subtotal,
          discount,
          total,
        };
      })
    );
  };

  const addGiftToOrder = (
    orderId: string,
    gift: { name: string; notes?: string; category?: string; image?: string; size?: string }
  ) => {
    const giftProduct: Product = {
      id: `gift-${Date.now()}-${Math.random().toString(36).substr(2, 4)}`,
      name: gift.name,
      category: (gift.category as any) || 'Acessórios',
      brand: 'Florishop',
      sku: `GIFT-${Math.floor(1000 + Math.random() * 9000)}`,
      purchasePrice: 0,
      profitMargin: 0,
      salePrice: 0,
      stockQuantity: 999,
      images: [
        gift.image ||
          'https://lh3.googleusercontent.com/aida-public/AB6AXuCKp25h2N06j-tP_7L1p69z5r73E_C1b_eP_FLORISHOP_SKATE'
      ],
      specs: ['Cortesia Florishop Skate', 'Não cobrado'],
      description: gift.notes || 'Brinde exclusivo cortesia Florishop Skate.',
      badge: 'BRINDE CORTESIA',
    };

    const giftCartItem: CartItem = {
      product: giftProduct,
      quantity: 1,
      selectedSize: gift.size,
      isGift: true,
      customNote: gift.notes || '🎁 Brinde Cortesia Florishop Skate',
    };

    addItemToOrder(orderId, giftCartItem, true);
  };

  // Navigation & Product actions
  const openProductDetail = (product: Product) => {
    setSelectedProduct(product);
    setActiveTab('detail');
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const addToCart = (product: Product, quantity = 1, selectedSize?: string) => {
    setCart((prevCart) => {
      const existing = prevCart.find(
        (item) => item.product.id === product.id && item.selectedSize === selectedSize
      );
      if (existing) {
        return prevCart.map((item) =>
          item.product.id === product.id && item.selectedSize === selectedSize
            ? { ...item, quantity: item.quantity + quantity }
            : item
        );
      }
      return [...prevCart, { product, quantity, selectedSize }];
    });
  };

  const removeFromCart = (productId: string, selectedSize?: string) => {
    setCart((prevCart) =>
      prevCart.filter(
        (item) => !(item.product.id === productId && item.selectedSize === selectedSize)
      )
    );
  };

  const updateCartQuantity = (productId: string, quantity: number, selectedSize?: string) => {
    if (quantity <= 0) {
      removeFromCart(productId, selectedSize);
      return;
    }
    setCart((prevCart) =>
      prevCart.map((item) => {
        if (item.product.id === productId && item.selectedSize === selectedSize) {
          return { ...item, quantity };
        }
        return item;
      })
    );
  };

  const clearCart = () => {
    setCart([]);
  };

  const processCheckout = (
    customerName: string,
    customerEmail: string,
    paymentMethod: PaymentMethod,
    paymentDetails: {
      pixKey?: string;
      cardInstallments?: string;
      cardInterestRate?: number;
      receiptAttached?: boolean;
      receiptName?: string;
    },
    totals?: {
      subtotal?: number;
      discount?: number;
      interest?: number;
      shippingCost?: number;
      shippingMethod?: string;
      shippingAddress?: {
        cep?: string;
        street?: string;
        number?: string;
        neighborhood?: string;
        city?: string;
        state?: string;
        complement?: string;
      };
      total?: number;
    }
  ): Order | null => {
    if (cart.length === 0) return null;

    const baseSubtotal = cart.reduce((acc, item) => acc + item.product.salePrice * item.quantity, 0);
    const subtotal = totals?.subtotal !== undefined ? totals.subtotal : baseSubtotal;
    const discount = totals?.discount !== undefined ? totals.discount : (paymentMethod === 'pix' ? subtotal * 0.05 : 0);
    const shippingCost = totals?.shippingCost !== undefined ? totals.shippingCost : (subtotal > 250 ? 0 : 25.0);
    const interest = totals?.interest !== undefined ? totals.interest : 0;
    const total = totals?.total !== undefined ? totals.total : (subtotal - discount + shippingCost + interest);

    let status: Order['status'] = 'Aguardando Pagamento';
    if (paymentMethod === 'pix') {
      status = 'Pago / Aprovado';
    } else if (paymentMethod === 'deposito') {
      status = 'Aguardando Comprovante / Validação';
    } else if (paymentMethod === 'maquininha') {
      status = 'Aguardando Pagamento';
    }

    const newOrder: Order = {
      id: `FLO-${Math.floor(100000 + Math.random() * 900000)}`,
      userId: currentUser?.id,
      date: new Date().toLocaleString('pt-BR'),
      items: [...cart],
      subtotal,
      discount,
      interest,
      shippingCost,
      shippingMethod: totals?.shippingMethod,
      shippingAddress: totals?.shippingAddress,
      total,
      paymentMethod,
      paymentDetails,
      customerName: customerName || currentUser?.name || 'Cliente Florishop',
      customerEmail: customerEmail || currentUser?.email || 'skater@florishop.com.br',
      status,
    };

    // Deduct stock for each product in cart
    setProducts((prevProducts) =>
      prevProducts.map((p) => {
        const cartItem = cart.find((ci) => ci.product.id === p.id);
        if (cartItem) {
          const newQty = Math.max(0, p.stockQuantity - cartItem.quantity);
          return { ...p, stockQuantity: newQty };
        }
        return p;
      })
    );

    // Register stock movements
    const newMovements: StockMovement[] = cart.map((ci) => ({
      id: `mov-${Date.now()}-${Math.random().toString(36).substr(2, 4)}`,
      productId: ci.product.id,
      productName: ci.product.name,
      type: 'SAÍDA_VENDA',
      quantity: ci.quantity,
      date: new Date().toLocaleString('pt-BR'),
      notes: `Venda Pedido #${newOrder.id} (${paymentMethod.toUpperCase()})`,
    }));
    setStockMovements((prev) => [...newMovements, ...prev]);

    setOrders((prevOrders) => [newOrder, ...prevOrders]);
    clearCart();

    if (isSupabaseConfigured()) {
      if (currentUser) {
        upsertUserInSupabase(currentUser).catch((e) =>
          console.warn('[Checkout] Aviso ao sincronizar usuário antes do pedido:', e)
        );
      }
      createOrderInSupabase(newOrder)
        .then((res) => {
          if (res.success) {
            console.log(`[Checkout] Pedido #${newOrder.id} gravado com sucesso no Supabase!`);
          } else {
            console.warn(`[Checkout] Falha ao gravar pedido #${newOrder.id} no Supabase:`, res.error);
          }
        })
        .catch((e) => console.warn('Falha ao salvar pedido no Supabase:', e));

      for (const m of newMovements) {
        recordStockMovementInSupabase(m).catch(() => {});
      }
    }

    return newOrder;
  };

  const addProduct = (productData: Omit<Product, 'id'>) => {
    const newProduct: Product = {
      ...productData,
      id: `prod-${Date.now()}`,
    };
    setProducts((prev) => [newProduct, ...prev]);

    if (isSupabaseConfigured()) {
      upsertProductInSupabase(newProduct).catch((e) =>
        console.warn('Falha ao adicionar produto no Supabase:', e)
      );
    }

    if (newProduct.stockQuantity > 0) {
      setStockMovements((prev) => [
        {
          id: `mov-${Date.now()}`,
          productId: newProduct.id,
          productName: newProduct.name,
          type: 'ENTRADA',
          quantity: newProduct.stockQuantity,
          date: new Date().toLocaleString('pt-BR'),
          notes: 'Cadastro inicial de novo produto',
        },
        ...prev,
      ]);
    }
  };

  const updateProduct = (id: string, productData: Partial<Product>) => {
    setProducts((prev) => {
      const updatedList = prev.map((p) => {
        if (p.id === id) {
          return { ...p, ...productData };
        }
        return p;
      });
      const target = updatedList.find((p) => p.id === id);
      if (target && isSupabaseConfigured()) {
        upsertProductInSupabase(target).catch((e) =>
          console.warn('Falha ao atualizar produto no Supabase:', e)
        );
      }
      return updatedList;
    });
  };

  const deleteProduct = (id: string) => {
    const targetProduct = products.find((p) => p.id === id);
    setProducts((prev) => prev.filter((p) => p.id !== id));

    if (isSupabaseConfigured()) {
      deleteProductFromSupabase(id).catch((e) =>
        console.warn('Falha ao excluir produto no Supabase:', e)
      );
    }

    if (targetProduct && targetProduct.stockQuantity > 0) {
      setStockMovements((prev) => [
        {
          id: `mov-${Date.now()}-${Math.random().toString(36).substr(2, 4)}`,
          productId: id,
          productName: targetProduct.name,
          type: 'AJUSTE',
          quantity: targetProduct.stockQuantity,
          date: new Date().toLocaleString('pt-BR'),
          notes: `Produto excluído do estoque / catálogo (Baixa de ${targetProduct.stockQuantity} un)`,
        },
        ...prev,
      ]);
    }
  };

  const adjustStockQuantity = (id: string, delta: number, notes: string = 'Ajuste manual de estoque') => {
    setProducts((prev) =>
      prev.map((p) => {
        if (p.id === id) {
          const newQty = Math.max(0, p.stockQuantity + delta);
          return { ...p, stockQuantity: newQty };
        }
        return p;
      })
    );

    const targetProduct = products.find((p) => p.id === id);
    if (targetProduct) {
      setStockMovements((prev) => [
        {
          id: `mov-${Date.now()}`,
          productId: id,
          productName: targetProduct.name,
          type: delta >= 0 ? 'ENTRADA' : 'AJUSTE',
          quantity: Math.abs(delta),
          date: new Date().toLocaleString('pt-BR'),
          notes,
        },
        ...prev,
      ]);
    }
  };

  const updateFeaturedSlot = (slotKey: 'slot1' | 'slot2' | 'slot3', update: Partial<FeaturedSlotConfig>) => {
    setFeaturedConfig((prev) => ({
      ...prev,
      [slotKey]: {
        ...prev[slotKey],
        ...update,
      },
    }));
  };

  const resetFeaturedConfig = () => {
    setFeaturedConfig(INITIAL_FEATURED_CONFIG);
    localStorage.removeItem(STORAGE_KEYS.FEATURED);
  };

  const resetToInitialData = () => {
    setProducts(INITIAL_PRODUCTS);
    setCart([]);
    setOrders([]);
    setStockMovements([]);
    setFeaturedConfig(INITIAL_FEATURED_CONFIG);
    setUsers(INITIAL_USERS);
    setCurrentUser(null);
    localStorage.removeItem(STORAGE_KEYS.PRODUCTS);
    localStorage.removeItem(STORAGE_KEYS.CART);
    localStorage.removeItem(STORAGE_KEYS.ORDERS);
    localStorage.removeItem(STORAGE_KEYS.MOVEMENTS);
    localStorage.removeItem(STORAGE_KEYS.FEATURED);
    localStorage.removeItem(STORAGE_KEYS.USERS);
    localStorage.removeItem(STORAGE_KEYS.CURRENT_USER);
  };

  return (
    <StoreContext.Provider
      value={{
        isHydrated,
        products,
        cart,
        orders,
        stockMovements,
        featuredConfig,
        users,
        currentUser,
        isAdmin,
        isLoggedIn,
        authModalOpen,
        authModalMode,
        activeTab,
        selectedProduct,
        searchQuery,
        categoryFilter,
        setSearchQuery,
        setCategoryFilter,
        setActiveTab,
        openProductDetail,
        addToCart,
        removeFromCart,
        updateCartQuantity,
        clearCart,
        openAuthModal,
        closeAuthModal,
        login,
        registerUser,
        logout,
        addUser,
        updateUserStatus,
        updateUserProfile,
        deleteUser,
        updateOrder,
        deleteOrder,
        cancelOrder,
        syncOrdersWithSupabase,
        addItemToOrder,
        removeItemFromOrder,
        updateOrderItemQuantity,
        addGiftToOrder,
        processCheckout,
        addProduct,
        updateProduct,
        deleteProduct,
        adjustStockQuantity,
        updateFeaturedSlot,
        setFeaturedConfig,
        resetFeaturedConfig,
        resetToInitialData,
      }}
    >
      {children}
    </StoreContext.Provider>
  );
};

export const useStore = () => {
  const context = useContext(StoreContext);
  if (!context) {
    throw new Error('useStore must be used within a StoreProvider');
  }
  return context;
};
