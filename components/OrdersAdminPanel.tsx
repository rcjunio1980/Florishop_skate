'use client';

import React, { useState } from 'react';
import { useStore } from './StoreContext';
import { Order, CartItem, Product, PaymentMethod, OrderStatusHistoryItem } from '@/lib/skate-store';
import {
  ClipboardList,
  Search,
  Filter,
  Package,
  Gift,
  Plus,
  Edit,
  Trash2,
  CheckCircle2,
  Clock,
  Truck,
  DollarSign,
  AlertCircle,
  FileText,
  User,
  MapPin,
  Calendar,
  CreditCard,
  ShieldCheck,
  History,
  XCircle,
  CheckCheck,
  MessageSquare,
  Lock,
  LayoutDashboard,
  Users,
  X,
  ExternalLink,
  ChevronDown,
  Tag,
  Check,
  AlertTriangle,
  Send,
  Phone,
  Mail,
  Sparkles,
  ArrowRight,
  RefreshCw,
  Database
} from 'lucide-react';

const STATUS_CONFIG: Record<
  Order['status'],
  { label: string; bg: string; text: string; border: string; icon: React.ReactNode }
> = {
  'Aguardando Pagamento': {
    label: 'Aguardando Pagamento',
    bg: 'bg-amber-950/40',
    text: 'text-amber-400',
    border: 'border-amber-600/40',
    icon: <Clock className="w-3.5 h-3.5" />,
  },
  'Aguardando Comprovante / Validação': {
    label: 'Aguardando Comprovante',
    bg: 'bg-blue-950/40',
    text: 'text-blue-400',
    border: 'border-blue-600/40',
    icon: <FileText className="w-3.5 h-3.5" />,
  },
  'Pago / Aprovado': {
    label: 'Pago / Aprovado',
    bg: 'bg-emerald-950/40',
    text: 'text-emerald-400',
    border: 'border-emerald-600/40',
    icon: <CheckCircle2 className="w-3.5 h-3.5" />,
  },
  'Em Separação': {
    label: 'Em Separação',
    bg: 'bg-purple-950/40',
    text: 'text-purple-300',
    border: 'border-purple-600/40',
    icon: <Package className="w-3.5 h-3.5" />,
  },
  'Enviado': {
    label: 'Enviado / Em Trânsito',
    bg: 'bg-sky-950/40',
    text: 'text-sky-300',
    border: 'border-sky-600/40',
    icon: <Truck className="w-3.5 h-3.5" />,
  },
  'Entregue': {
    label: 'Entregue',
    bg: 'bg-green-950/40',
    text: 'text-green-300',
    border: 'border-green-600/40',
    icon: <Check className="w-3.5 h-3.5" />,
  },
  'Cancelado': {
    label: 'Cancelado',
    bg: 'bg-red-950/40',
    text: 'text-red-400',
    border: 'border-red-600/40',
    icon: <X className="w-3.5 h-3.5" />,
  },
};

const PRESET_GIFTS = [
  {
    name: 'Pack de Adesivos Florishop Skate (10 unid)',
    category: 'Acessórios',
    notes: 'Pack especial com adesivos vinílicos à prova d’água',
    image:
      'https://lh3.googleusercontent.com/aida-public/AB6AXuCQPrqGOByOI__lr6TW0_2kPRl_5bz1M5PIJpu-r365swaNSsmKoVTaOQfOOLaPV66zZdzzYGVrq06_gGwqa8ihCz9j0kbl3U7767uepASsJSXT_oGtZeKJMaQhIb5ShVJH7ZXSGHlHI4sH_8nBQcaolNX6mn04Qgy-A2-quESi4H0lNQRSTyv-KlpxwgtbIrzUd77DbcLfEZcmcmPm_IlcwlW5Gxm7jO0OjLbzmxa9QCBpxWJcSeTkTw',
  },
  {
    name: 'Lixa Emborrachada Florishop Skate Grip',
    category: 'Acessórios',
    notes: 'Lixa microperfurada com alta aderência para o shape',
    image:
      'https://lh3.googleusercontent.com/aida-public/AB6AXuDfWJWQ9K6zbmR9_fkpnRV0UOTHoL6k766KS_pGuTFfqJNlm6tGe-UENGlxZKRfDahC0DqmQy2LfF3AJDOZ7DU39t5Rez3sWPNzj7-ctFenCZC0fMIywj6n0SVUTIWOlEemC-Lfdr0V-Wq6jUt2MbbvalwaGfId_j2XmjhvO8JwqCU8coGD-RnIS35g701A3FgZS-EzQv50fYUoauGZAReaNdnm1dNkf5KLvBqznj4PdTSL-3grtM7g0Q',
  },
  {
    name: 'Chave T Skate Multifuncional Profissional',
    category: 'Hardware',
    notes: 'Chave allen/phillips e 3 bocas para trucks, rodas e base',
    image:
      'https://lh3.googleusercontent.com/aida-public/AB6AXuBD8nnbw67dCK-36whhcuVpmpHFEHeRDIBEfAqjugpsG1UX7ctlRT9OtqivMZpaV0sQKAQTz2WflhyIdYp-odpDcrSa4kWzk-4KSp-I3Fxq4bLpWgyOdzKtwnLnh0ScyugjHs4o2byPck69FkPdAiJVEdDBuMBZVr4VHcI9A8DRhQV_2pCCUYC-1dY_DYxi5M04zqthxTDRz17meKLeKfQPChRnvalpXMEJ_Jkqdubk3OZXTotcpcswew',
  },
  {
    name: 'Cera / Parafina de Skate Florishop Wax',
    category: 'Acessórios',
    notes: 'Cera deslizante de alta densidade para bordas e corrimãos',
    image:
      'https://lh3.googleusercontent.com/aida-public/AB6AXuDfAUZUZdE_GrI_XZ3Mw6u0nQfx_ifYFGi-mXy1Svr0jL1hT9lU0gSEya_n83GTj6al_pT23g00qj802qDXxR2jLtTSY-BWL2pqhez02cIHNhrSpWBuGcSNsE7J4Mum9Iq-a9Hk1wvqHrTm8T3gUYuRTY24xpZCSHnMClO6h4eRcHRO1GxGdFLyPi5JFcDzrWx80QKTgfp0GJv0X9xep4INPafQK9irO4-kHBMR8i3YnSzWJWaqejb16A',
  },
  {
    name: 'Jogo de Parafusos de Base c/ Porcas Autotravantes',
    category: 'Hardware',
    notes: '8 parafusos 1 polegada com porcas de pressão',
    image:
      'https://lh3.googleusercontent.com/aida-public/AB6AXuBD8nnbw67dCK-36whhcuVpmpHFEHeRDIBEfAqjugpsG1UX7ctlRT9OtqivMZpaV0sQKAQTz2WflhyIdYp-odpDcrSa4kWzk-4KSp-I3Fxq4bLpWgyOdzKtwnLnh0ScyugjHs4o2byPck69FkPdAiJVEdDBuMBZVr4VHcI9A8DRhQV_2pCCUYC-1dY_DYxi5M04zqthxTDRz17meKLeKfQPChRnvalpXMEJ_Jkqdubk3OZXTotcpcswew',
  },
  {
    name: 'Chaveiro Shape Miniatura Metal Florishop',
    category: 'Acessórios',
    notes: 'Chaveiro colecionável em liga metálica gravada a laser',
    image:
      'https://lh3.googleusercontent.com/aida-public/AB6AXuDfAUZUZdE_GrI_XZ3Mw6u0nQfx_ifYFGi-mXy1Svr0jL1hT9lU0gSEya_n83GTj6al_pT23g00qj802qDXxR2jLtTSY-BWL2pqhez02cIHNhrSpWBuGcSNsE7J4Mum9Iq-a9Hk1wvqHrTm8T3gUYuRTY24xpZCSHnMClO6h4eRcHRO1GxGdFLyPi5JFcDzrWx80QKTgfp0GJv0X9xep4INPafQK9irO4-kHBMR8i3YnSzWJWaqejb16A',
  },
];

export const OrdersAdminPanel: React.FC = () => {
  const {
    orders,
    products,
    isAdmin,
    setActiveTab,
    openAuthModal,
    updateOrder,
    deleteOrder,
    cancelOrder,
    addItemToOrder,
    removeItemFromOrder,
    updateOrderItemQuantity,
    addGiftToOrder,
    syncOrdersWithSupabase,
  } = useStore();

  const [isSyncingSupabase, setIsSyncingSupabase] = useState(false);
  const [viewMode, setViewMode] = useState<'ativos' | 'historico' | 'todos'>('ativos');
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('Todos');
  const [paymentFilter, setPaymentFilter] = useState<string>('Todos');

  // Modals state
  const [editingOrder, setEditingOrder] = useState<Order | null>(null);
  const [deletingOrder, setDeletingOrder] = useState<Order | null>(null);
  const [restoreStockOnDelete, setRestoreStockOnDelete] = useState(true);
  const [viewingHistoryOrder, setViewingHistoryOrder] = useState<Order | null>(null);
  const [orderToCancel, setOrderToCancel] = useState<Order | null>(null);
  const [cancelReason, setCancelReason] = useState<string>('Cancelamento solicitado pelo cliente');
  const [customCancelReason, setCustomCancelReason] = useState<string>('');
  const [newStatusNote, setNewStatusNote] = useState<string>('');

  // Add Forgotten Item Modal
  const [addingItemToOrder, setAddingItemToOrder] = useState<Order | null>(null);
  const [selectedProductId, setSelectedProductId] = useState<string>('');
  const [selectedSize, setSelectedSize] = useState<string>('');
  const [selectedQuantity, setSelectedQuantity] = useState<number>(1);
  const [customItemPrice, setCustomItemPrice] = useState<number | ''>('');
  const [catalogSearch, setCatalogSearch] = useState('');
  const [catalogCategory, setCatalogCategory] = useState('Todos');

  // Add Gift Modal
  const [addingGiftToOrder, setAddingGiftToOrder] = useState<Order | null>(null);
  const [giftMode, setGiftMode] = useState<'preset' | 'catalog' | 'custom'>('preset');
  const [customGiftName, setCustomGiftName] = useState('');
  const [customGiftNotes, setCustomGiftNotes] = useState('Cortesia Florishop Skate');
  const [selectedCatalogGiftId, setSelectedCatalogGiftId] = useState('');
  const [catalogGiftSize, setCatalogGiftSize] = useState('');

  // Toast feedback
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 3500);
  };

  // Guard screen if not admin
  if (!isAdmin) {
    return (
      <div className="max-w-xl mx-auto my-20 p-8 bg-[#181717] border-2 border-[#ff544b] rounded-lg shadow-2xl text-center font-mono">
        <ShieldCheck className="w-16 h-16 text-[#ff544b] mx-auto mb-4" />
        <h2 className="text-2xl font-bold text-white mb-2 uppercase">Área Restrita do Administrador</h2>
        <p className="text-gray-400 text-sm mb-6 font-sans">
          Apenas administradores autenticados com credenciais autorizadas têm acesso à gestão de pedidos e vendas da Florishop.
        </p>
        <div className="flex flex-col sm:flex-row gap-3 justify-center">
          <button
            onClick={() => openAuthModal('admin-login')}
            className="px-6 py-3 bg-[#ff544b] hover:bg-white hover:text-black text-white font-bold text-xs uppercase rounded transition-all flex items-center justify-center gap-2"
          >
            <Lock className="w-4 h-4" /> Entrar como Administrador
          </button>
          <button
            onClick={() => setActiveTab('home')}
            className="px-6 py-3 bg-[#201f1f] border border-[#353534] text-gray-300 hover:text-white text-xs uppercase rounded transition-all"
          >
            Voltar para Loja
          </button>
        </div>
      </div>
    );
  }

  // Partition active vs history orders
  const activeOrdersCount = orders.filter(
    (o) => o.status !== 'Entregue' && o.status !== 'Cancelado'
  ).length;

  const historyOrdersCount = orders.filter(
    (o) => o.status === 'Entregue' || o.status === 'Cancelado'
  ).length;

  // Filter orders according to selected tab and criteria
  const filteredOrders = orders.filter((o) => {
    // 1. Tab partition:
    if (viewMode === 'ativos') {
      if (o.status === 'Entregue' || o.status === 'Cancelado') return false;
    } else if (viewMode === 'historico') {
      if (o.status !== 'Entregue' && o.status !== 'Cancelado') return false;
    }

    // 2. Search query:
    const term = searchTerm.toLowerCase();
    const matchesSearch =
      o.id.toLowerCase().includes(term) ||
      o.customerName.toLowerCase().includes(term) ||
      o.customerEmail.toLowerCase().includes(term) ||
      (o.customerPhone && o.customerPhone.includes(term)) ||
      (o.trackingCode && o.trackingCode.toLowerCase().includes(term)) ||
      o.items.some((it) => it.product.name.toLowerCase().includes(term));

    // 3. Dropdown filters:
    const matchesStatus = statusFilter === 'Todos' || o.status === statusFilter;
    const matchesPayment = paymentFilter === 'Todos' || o.paymentMethod === paymentFilter;

    return matchesSearch && matchesStatus && matchesPayment;
  });

  // Calculate high-level stats
  const totalOrdersCount = orders.length;
  const approvedOrders = orders.filter(
    (o) => o.status === 'Pago / Aprovado' || o.status === 'Em Separação' || o.status === 'Enviado' || o.status === 'Entregue'
  );
  const totalRevenue = approvedOrders.reduce((acc, o) => acc + o.total, 0);
  const pendingOrdersCount = orders.filter(
    (o) => o.status === 'Aguardando Pagamento' || o.status === 'Aguardando Comprovante / Validação'
  ).length;
  const totalGiftsGiven = orders.reduce(
    (acc, o) => acc + o.items.filter((it) => it.isGift).length,
    0
  );

  // Handlers for Add Item Modal
  const handleOpenAddItem = (order: Order) => {
    setAddingItemToOrder(order);
    setSelectedProductId(products[0]?.id || '');
    setSelectedSize('');
    setSelectedQuantity(1);
    setCustomItemPrice('');
    setCatalogSearch('');
    setCatalogCategory('Todos');
  };

  const handleConfirmAddItem = () => {
    if (!addingItemToOrder || !selectedProductId) return;

    const prod = products.find((p) => p.id === selectedProductId);
    if (!prod) return;

    const price = typeof customItemPrice === 'number' && customItemPrice >= 0 ? customItemPrice : prod.salePrice;

    const newItem: CartItem = {
      product: {
        ...prod,
        salePrice: price,
      },
      selectedSize: selectedSize || (prod.sizes && prod.sizes.length > 0 ? prod.sizes[0] : undefined),
      quantity: Math.max(1, selectedQuantity),
      isGift: false,
    };

    addItemToOrder(addingItemToOrder.id, newItem, false);
    showToast(`"${prod.name}" adicionado ao pedido #${addingItemToOrder.id} com sucesso!`);
    setAddingItemToOrder(null);
  };

  // Handlers for Add Gift Modal
  const handleOpenAddGift = (order: Order) => {
    setAddingGiftToOrder(order);
    setGiftMode('preset');
    setCustomGiftName('');
    setCustomGiftNotes('Cortesia Florishop Skate');
    setSelectedCatalogGiftId(products[0]?.id || '');
    setCatalogGiftSize('');
  };

  const handleConfirmAddGift = () => {
    if (!addingGiftToOrder) return;

    if (giftMode === 'preset') {
      const preset = PRESET_GIFTS.find((g) => g.name === customGiftName) || PRESET_GIFTS[0];
      addGiftToOrder(addingGiftToOrder.id, {
        name: preset.name,
        category: preset.category,
        notes: preset.notes,
        image: preset.image,
      });
      showToast(`Brinde "${preset.name}" incluído no pedido com R$ 0,00!`);
    } else if (giftMode === 'catalog') {
      const prod = products.find((p) => p.id === selectedCatalogGiftId);
      if (!prod) return;
      addGiftToOrder(addingGiftToOrder.id, {
        name: `[BRINDE] ${prod.name}`,
        category: prod.category,
        notes: customGiftNotes || 'Brinde especial de cortesia',
        image: prod.images[0],
        size: catalogGiftSize || (prod.sizes && prod.sizes.length > 0 ? prod.sizes[0] : undefined),
      });
      showToast(`Produto "${prod.name}" adicionado como brinde cortesia (R$ 0,00)!`);
    } else if (giftMode === 'custom') {
      if (!customGiftName.trim()) {
        alert('Por favor, informe o nome do brinde.');
        return;
      }
      addGiftToOrder(addingGiftToOrder.id, {
        name: customGiftName.trim(),
        category: 'Acessórios',
        notes: customGiftNotes.trim() || 'Brinde exclusivo cortesia Florishop',
      });
      showToast(`Brinde "${customGiftName.trim()}" incluído com sucesso!`);
    }

    setAddingGiftToOrder(null);
  };

  // Handlers for Delete Order
  const handleConfirmDelete = () => {
    if (!deletingOrder) return;
    deleteOrder(deletingOrder.id, restoreStockOnDelete);
    showToast(`Pedido #${deletingOrder.id} excluído com sucesso.`);
    setDeletingOrder(null);
  };

  return (
    <div className="max-w-7xl mx-auto px-4 md:px-12 py-10 space-y-8 font-mono">
      {/* Toast */}
      {toastMessage && (
        <div className="fixed bottom-6 right-6 z-[120] bg-emerald-950 border-2 border-emerald-500 text-emerald-100 px-5 py-3.5 rounded shadow-2xl flex items-center gap-3 animate-fadeIn">
          <CheckCircle2 className="w-5 h-5 text-emerald-400 shrink-0" />
          <span className="text-xs font-bold font-sans">{toastMessage}</span>
        </div>
      )}

      {/* Top Header with Navigation Tabs */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b-2 border-[#5c403c] pb-6">
        <div>
          <div className="flex items-center gap-2 text-xs font-bold text-[#ff544b] uppercase tracking-widest mb-1">
            <ShieldCheck className="w-4 h-4" />
            <span>PAINEL ADMINISTRATIVO FLORISHOP</span>
          </div>
          <h1 className="font-display text-3xl md:text-4xl font-extrabold text-white uppercase tracking-tight flex items-center gap-3">
            <ClipboardList className="w-8 h-8 text-[#ff544b]" />
            Gestão de <span className="text-[#ff544b]">Pedidos & Vendas</span>
          </h1>
          <p className="font-sans text-xs sm:text-sm text-gray-400 mt-1 max-w-2xl">
            Edite detalhes de compras, altere status de envio e rastreio, adicione itens esquecidos pelos clientes e insira brindes cortesias exclusivos.
          </p>
        </div>

        {/* Quick Cross-Admin Navigation */}
        <div className="flex flex-wrap items-center gap-2 text-xs">
          <button
            onClick={() => setActiveTab('admin-stock')}
            className="px-4 py-2 bg-[#201f1f] hover:bg-[#2d2c2c] border border-[#353534] text-gray-300 hover:text-white rounded flex items-center gap-2 transition-colors uppercase font-bold"
          >
            <LayoutDashboard className="w-4 h-4 text-[#ff544b]" />
            Gestão de Estoque
          </button>
          <button
            onClick={() => setActiveTab('admin-orders')}
            className="px-4 py-2 bg-[#ff544b] text-white border border-[#ff544b] rounded flex items-center gap-2 transition-colors uppercase font-bold shadow-lg"
          >
            <ClipboardList className="w-4 h-4" />
            Gestão de Pedidos ({orders.length})
          </button>
          <button
            onClick={() => setActiveTab('admin-users')}
            className="px-4 py-2 bg-[#201f1f] hover:bg-[#2d2c2c] border border-[#353534] text-gray-300 hover:text-white rounded flex items-center gap-2 transition-colors uppercase font-bold"
          >
            <Users className="w-4 h-4 text-[#ff544b]" />
            Gestão de Cadastros
          </button>
        </div>
      </div>

      {/* Metrics Bar */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-[#181717] border border-[#353534] p-5 rounded space-y-1">
          <span className="text-[10px] text-gray-400 uppercase font-bold block">Total de Pedidos</span>
          <div className="flex items-center justify-between">
            <span className="text-2xl font-extrabold text-white">{totalOrdersCount}</span>
            <ClipboardList className="w-5 h-5 text-gray-500" />
          </div>
          <span className="text-[10px] text-gray-500 block">Registrados na base de dados</span>
        </div>

        <div className="bg-[#181717] border border-emerald-500/30 bg-emerald-950/10 p-5 rounded space-y-1">
          <span className="text-[10px] text-emerald-400 uppercase font-bold block">Faturamento Aprovado</span>
          <div className="flex items-center justify-between">
            <span className="text-2xl font-extrabold text-emerald-400">R$ {totalRevenue.toFixed(2)}</span>
            <DollarSign className="w-5 h-5 text-emerald-400" />
          </div>
          <span className="text-[10px] text-emerald-500/80 block">{approvedOrders.length} pedidos faturados / pagos</span>
        </div>

        <div className="bg-[#181717] border border-amber-500/30 bg-amber-950/10 p-5 rounded space-y-1">
          <span className="text-[10px] text-amber-400 uppercase font-bold block">Aguardando Validação</span>
          <div className="flex items-center justify-between">
            <span className="text-2xl font-extrabold text-amber-400">{pendingOrdersCount}</span>
            <Clock className="w-5 h-5 text-amber-400" />
          </div>
          <span className="text-[10px] text-amber-500/80 block">Aguardando PIX, maquininha ou depósito</span>
        </div>

        <div className="bg-[#181717] border border-purple-500/30 bg-purple-950/10 p-5 rounded space-y-1">
          <span className="text-[10px] text-purple-300 uppercase font-bold block">Brindes Enviados</span>
          <div className="flex items-center justify-between">
            <span className="text-2xl font-extrabold text-purple-300">{totalGiftsGiven}</span>
            <Gift className="w-5 h-5 text-purple-400" />
          </div>
          <span className="text-[10px] text-purple-400/80 block">Itens cortesias inseridos nos pedidos</span>
        </div>
      </div>

      {/* Sub-Navigation Tabs: Gestão Ativa vs Histórico vs Todos */}
      <div className="flex flex-wrap items-center gap-2 border-b border-[#353534] pb-1">
        <button
          type="button"
          onClick={() => {
            setViewMode('ativos');
            setStatusFilter('Todos');
          }}
          className={`px-5 py-3 rounded-t-lg font-bold text-xs uppercase flex items-center gap-2.5 transition-all border-b-2 ${
            viewMode === 'ativos'
              ? 'bg-[#201f1f] text-[#ff544b] border-[#ff544b] shadow-md'
              : 'text-gray-400 hover:text-white border-transparent hover:bg-[#181717]'
          }`}
        >
          <Package className="w-4 h-4" />
          <span>Gestão de Pedidos em Andamento</span>
          <span
            className={`px-2 py-0.5 rounded-full text-[10px] font-mono font-bold ${
              viewMode === 'ativos' ? 'bg-[#ff544b] text-white' : 'bg-[#353534] text-gray-300'
            }`}
          >
            {activeOrdersCount}
          </span>
        </button>

        <button
          type="button"
          onClick={() => {
            setViewMode('historico');
            setStatusFilter('Todos');
          }}
          className={`px-5 py-3 rounded-t-lg font-bold text-xs uppercase flex items-center gap-2.5 transition-all border-b-2 ${
            viewMode === 'historico'
              ? 'bg-[#201f1f] text-emerald-400 border-emerald-400 shadow-md'
              : 'text-gray-400 hover:text-white border-transparent hover:bg-[#181717]'
          }`}
        >
          <History className="w-4 h-4" />
          <span>Histórico de Pedidos (Finalizados & Cancelados)</span>
          <span
            className={`px-2 py-0.5 rounded-full text-[10px] font-mono font-bold ${
              viewMode === 'historico' ? 'bg-emerald-600 text-white' : 'bg-[#353534] text-gray-300'
            }`}
          >
            {historyOrdersCount}
          </span>
        </button>

        <button
          type="button"
          onClick={() => {
            setViewMode('todos');
            setStatusFilter('Todos');
          }}
          className={`px-5 py-3 rounded-t-lg font-bold text-xs uppercase flex items-center gap-2.5 transition-all border-b-2 ${
            viewMode === 'todos'
              ? 'bg-[#201f1f] text-gray-200 border-gray-400 shadow-md'
              : 'text-gray-400 hover:text-white border-transparent hover:bg-[#181717]'
          }`}
        >
          <ClipboardList className="w-4 h-4" />
          <span>Todos os Registros</span>
          <span className="px-2 py-0.5 rounded-full text-[10px] font-mono bg-[#353534] text-gray-300">
            {orders.length}
          </span>
        </button>
      </div>

      {/* Filter and Search Bar */}
      <div className="bg-[#181717] border border-[#353534] p-4 rounded-lg flex flex-col md:flex-row gap-3 items-stretch md:items-center justify-between">
        <div className="relative flex-1">
          <Search className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-500" />
          <input
            type="text"
            placeholder="Buscar por #FLO-XXXXX, nome do cliente, e-mail, rastreio ou produto..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-10 pr-4 py-2.5 bg-[#201f1f] border border-[#353534] rounded text-xs text-white placeholder-gray-500 focus:outline-none focus:border-[#ff544b]"
          />
        </div>

        <div className="flex flex-wrap items-center gap-2 text-xs">
          <div className="flex items-center gap-1.5 bg-[#201f1f] border border-[#353534] px-3 py-1.5 rounded">
            <Filter className="w-3.5 h-3.5 text-gray-400" />
            <span className="text-gray-400 text-[10px] uppercase font-bold">Status:</span>
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="bg-transparent text-white focus:outline-none text-xs cursor-pointer"
            >
              <option value="Todos" className="bg-[#181717]">Todos</option>
              <option value="Aguardando Pagamento" className="bg-[#181717]">Aguardando Pagamento</option>
              <option value="Aguardando Comprovante / Validação" className="bg-[#181717]">Aguardando Comprovante</option>
              <option value="Pago / Aprovado" className="bg-[#181717]">Pago / Aprovado</option>
              <option value="Em Separação" className="bg-[#181717]">Em Separação</option>
              <option value="Enviado" className="bg-[#181717]">Enviado</option>
              <option value="Entregue" className="bg-[#181717]">Entregue</option>
              <option value="Cancelado" className="bg-[#181717]">Cancelado</option>
            </select>
          </div>

          <div className="flex items-center gap-1.5 bg-[#201f1f] border border-[#353534] px-3 py-1.5 rounded">
            <CreditCard className="w-3.5 h-3.5 text-gray-400" />
            <span className="text-gray-400 text-[10px] uppercase font-bold">Pagamento:</span>
            <select
              value={paymentFilter}
              onChange={(e) => setPaymentFilter(e.target.value)}
              className="bg-transparent text-white focus:outline-none text-xs cursor-pointer uppercase"
            >
              <option value="Todos" className="bg-[#181717]">Todos</option>
              <option value="pix" className="bg-[#181717]">PIX</option>
              <option value="maquininha" className="bg-[#181717]">Maquininha</option>
              <option value="deposito" className="bg-[#181717]">Depósito</option>
            </select>
          </div>

          {(searchTerm || statusFilter !== 'Todos' || paymentFilter !== 'Todos') && (
            <button
              onClick={() => {
                setSearchTerm('');
                setStatusFilter('Todos');
                setPaymentFilter('Todos');
              }}
              className="px-3 py-1.5 bg-[#201f1f] text-gray-400 hover:text-white border border-[#353534] rounded flex items-center gap-1"
            >
              <RefreshCw className="w-3 h-3" /> Limpar Filtros
            </button>
          )}
        </div>
      </div>

      {/* Orders List */}
      {filteredOrders.length === 0 ? (
        <div className="p-12 text-center bg-[#181717] border border-[#353534] rounded-lg space-y-4">
          <ClipboardList className="w-12 h-12 text-gray-600 mx-auto" />
          <h3 className="text-lg font-bold text-white uppercase">Nenhum pedido encontrado</h3>
          <p className="text-gray-400 text-xs font-sans max-w-md mx-auto">
            Não foram localizados pedidos com os filtros atuais. Experimente buscar por outro termo ou limpar os filtros de status.
          </p>
        </div>
      ) : (
        <div className="space-y-6">
          {filteredOrders.map((order) => {
            const statusMeta = STATUS_CONFIG[order.status] || STATUS_CONFIG['Aguardando Pagamento'];
            const giftsCount = order.items.filter((it) => it.isGift).length;

            return (
              <div
                key={order.id}
                className="bg-[#181717] border border-[#353534] rounded-lg overflow-hidden transition-all hover:border-[#5c403c] shadow-lg"
              >
                {/* Order Card Header */}
                <div className="bg-[#201f1f] px-6 py-4 border-b border-[#2d2c2c] flex flex-col md:flex-row md:items-center justify-between gap-4">
                  <div className="flex flex-wrap items-center gap-3">
                    <div className="flex items-center gap-2">
                      <span className="text-sm font-bold text-white font-mono bg-black/40 px-2.5 py-1 rounded border border-[#353534]">
                        #{order.id}
                      </span>
                      <span className="text-xs text-gray-400 flex items-center gap-1">
                        <Calendar className="w-3.5 h-3.5" />
                        {order.date}
                      </span>
                    </div>

                    {/* Status Badge */}
                    <div
                      className={`px-3 py-1 rounded-full text-xs font-bold border flex items-center gap-1.5 ${statusMeta.bg} ${statusMeta.text} ${statusMeta.border}`}
                    >
                      {statusMeta.icon}
                      <span>{statusMeta.label}</span>
                    </div>

                    {giftsCount > 0 && (
                      <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-purple-950/60 text-purple-300 border border-purple-500/40 flex items-center gap-1">
                        <Gift className="w-3 h-3 text-purple-400" />
                        {giftsCount} {giftsCount === 1 ? 'Brinde' : 'Brindes'} Cortesia
                      </span>
                    )}
                  </div>

                  {/* Top Action Buttons */}
                  <div className="flex flex-wrap items-center gap-2">
                    {/* Status Changer Quick Dropdown */}
                    <div className="flex items-center gap-1">
                      <select
                        value={order.status}
                        onChange={(e) => {
                          const newStatus = e.target.value as Order['status'];
                          if (newStatus === order.status) return;

                          updateOrder(
                            order.id,
                            { status: newStatus },
                            {
                              role: 'admin',
                              name: 'Administrador Florishop',
                              notes: `Status alterado no painel administrativo para "${newStatus}"`,
                            }
                          );

                          if (newStatus === 'Entregue') {
                            showToast(`Pedido #${order.id} marcado como Entregue! Registro salvo no histórico e transferido da gestão ativa.`);
                          } else if (newStatus === 'Cancelado') {
                            showToast(`Pedido #${order.id} cancelado! Registro salvo no histórico e transferido da gestão ativa.`);
                          } else {
                            showToast(`Status do pedido #${order.id} alterado para "${newStatus}". Novo registro salvo no histórico!`);
                          }
                        }}
                        className="bg-[#181717] border border-[#353534] text-xs text-gray-300 rounded px-2.5 py-1.5 focus:outline-none focus:border-[#ff544b] cursor-pointer"
                        title="Mudar status do pedido (grava novo registro de histórico)"
                      >
                        <option value="Aguardando Pagamento">Aguardando Pagamento</option>
                        <option value="Aguardando Comprovante / Validação">Aguardando Comprovante</option>
                        <option value="Pago / Aprovado">Pago / Aprovado</option>
                        <option value="Em Separação">Em Separação</option>
                        <option value="Enviado">Enviado</option>
                        <option value="Entregue">Entregue (Finalizar)</option>
                        <option value="Cancelado">Cancelado</option>
                      </select>
                    </div>

                    {/* Botão para Visualizar Histórico de Estados */}
                    <button
                      type="button"
                      onClick={() => setViewingHistoryOrder(order)}
                      title="Ver todos os registros e linha do tempo de estados deste pedido"
                      className="px-3 py-1.5 bg-[#201f1f] hover:bg-[#2d2c2c] border border-blue-500/40 text-blue-300 text-xs rounded font-bold flex items-center gap-1.5 transition-colors shadow-sm"
                    >
                      <History className="w-3.5 h-3.5 text-blue-400" />
                      <span>Histórico ({order.statusHistory?.length || 1})</span>
                    </button>

                    <button
                      onClick={() => setEditingOrder(order)}
                      title="Editar dados gerais do pedido"
                      className="px-3 py-1.5 bg-[#2a2929] hover:bg-[#ff544b] hover:text-white border border-[#353534] text-gray-200 text-xs rounded font-bold flex items-center gap-1.5 transition-colors"
                    >
                      <Edit className="w-3.5 h-3.5" />
                      Editar Pedido
                    </button>

                    <button
                      onClick={() => handleOpenAddItem(order)}
                      title="Acrescentar produto esquecido pelo cliente"
                      className="px-3 py-1.5 bg-[#2a2929] hover:bg-emerald-600 hover:text-white border border-[#353534] text-emerald-400 text-xs rounded font-bold flex items-center gap-1.5 transition-colors"
                    >
                      <Plus className="w-3.5 h-3.5" />
                      Acrescentar Item
                    </button>

                    <button
                      onClick={() => handleOpenAddGift(order)}
                      title="Dar um brinde cortesia para o cliente"
                      className="px-3 py-1.5 bg-purple-950/50 hover:bg-purple-600 hover:text-white border border-purple-500/40 text-purple-300 text-xs rounded font-bold flex items-center gap-1.5 transition-colors"
                    >
                      <Gift className="w-3.5 h-3.5" />
                      Dar Brinde
                    </button>

                    {/* Botão Cancelar Pedido (Admin) */}
                    {order.status !== 'Cancelado' && (
                      <button
                        type="button"
                        onClick={() => {
                          setOrderToCancel(order);
                          setCancelReason('Cancelamento solicitado pelo cliente');
                          setCustomCancelReason('');
                        }}
                        title="Cancelar este pedido, devolver estoque e arquivar no histórico"
                        className="px-3 py-1.5 bg-amber-950/40 hover:bg-amber-600 hover:text-black border border-amber-600/40 text-amber-300 text-xs rounded font-bold flex items-center gap-1.5 transition-colors"
                      >
                        <XCircle className="w-3.5 h-3.5" />
                        <span>Cancelar</span>
                      </button>
                    )}

                    <button
                      onClick={() => {
                        setDeletingOrder(order);
                        setRestoreStockOnDelete(true);
                      }}
                      title="Excluir pedido definitivamente"
                      className="p-1.5 bg-[#2a1a1a] hover:bg-red-600 text-red-400 hover:text-white border border-red-900/50 rounded transition-colors"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>

                {/* Banner de Status Finalizado ou Cancelado */}
                {order.status === 'Entregue' && (
                  <div className="bg-emerald-950/30 border-y border-emerald-500/30 px-6 py-2.5 flex flex-col sm:flex-row sm:items-center justify-between gap-2 text-xs text-emerald-300">
                    <span className="flex items-center gap-2 font-bold">
                      <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
                      Pedido Finalizado — Entregue ao Cliente no Destino
                    </span>
                    <div className="flex items-center gap-3">
                      {order.deliveredAt && (
                        <span className="text-[11px] text-emerald-400/80 font-mono">
                          Confirmado em: {new Date(order.deliveredAt).toLocaleString('pt-BR')}
                        </span>
                      )}
                      <button
                        type="button"
                        onClick={() => setViewingHistoryOrder(order)}
                        className="text-[11px] underline text-emerald-400 hover:text-emerald-200"
                      >
                        Ver trilha de auditoria
                      </button>
                    </div>
                  </div>
                )}

                {order.status === 'Cancelado' && (
                  <div className="bg-red-950/30 border-y border-red-500/30 px-6 py-2.5 flex flex-col sm:flex-row sm:items-center justify-between gap-2 text-xs text-red-300">
                    <span className="flex items-center gap-2 font-bold">
                      <XCircle className="w-4 h-4 text-red-400 shrink-0" />
                      Pedido Cancelado — Fora da Gestão Ativa (Guardado no Histórico)
                    </span>
                    <div className="flex items-center gap-3">
                      {order.canceledAt && (
                        <span className="text-[11px] text-red-400/80 font-mono">
                          Cancelado em: {new Date(order.canceledAt).toLocaleString('pt-BR')}
                        </span>
                      )}
                      <button
                        type="button"
                        onClick={() => setViewingHistoryOrder(order)}
                        className="text-[11px] underline text-red-400 hover:text-red-200"
                      >
                        Ver motivo no histórico
                      </button>
                    </div>
                  </div>
                )}

                {/* Customer and Shipping Details Strip */}
                <div className="px-6 py-3 bg-[#1c1b1b] border-b border-[#2d2c2c] grid grid-cols-1 md:grid-cols-3 gap-4 text-xs">
                  <div>
                    <span className="text-[10px] text-gray-400 uppercase font-bold block flex items-center gap-1">
                      <User className="w-3 h-3 text-[#ff544b]" /> Cliente
                    </span>
                    <span className="text-white font-bold block">{order.customerName}</span>
                    <span className="text-gray-400 block">{order.customerEmail}</span>
                    {order.customerPhone && (
                      <span className="text-gray-400 flex items-center gap-1 mt-0.5">
                        <Phone className="w-3 h-3" /> {order.customerPhone}
                      </span>
                    )}
                  </div>

                  <div>
                    <span className="text-[10px] text-gray-400 uppercase font-bold block flex items-center gap-1">
                      <Truck className="w-3 h-3 text-[#ff544b]" /> Envio & Endereço
                    </span>
                    <span className="text-white font-bold block">
                      {order.shippingMethod || 'Frete Padrão'}
                    </span>
                    {order.shippingAddress ? (
                      <span className="text-gray-400 block truncate">
                        {order.shippingAddress.street}, {order.shippingAddress.number}
                        {order.shippingAddress.complement ? ` - ${order.shippingAddress.complement}` : ''}
                        , {order.shippingAddress.neighborhood} - {order.shippingAddress.city}/{order.shippingAddress.state} (CEP: {order.shippingAddress.cep})
                      </span>
                    ) : (
                      <span className="text-gray-500 italic block">Endereço não informado</span>
                    )}
                    {order.trackingCode && (
                      <div className="mt-1 flex items-center gap-1.5 text-sky-400 font-bold">
                        <span>Rastreio: {order.trackingCode}</span>
                        <a
                          href={`https://rastreamento.correios.com.br/app/index.php?codigo=${order.trackingCode}`}
                          target="_blank"
                          rel="noreferrer"
                          className="hover:underline flex items-center gap-0.5 text-[10px]"
                        >
                          <ExternalLink className="w-3 h-3" />
                        </a>
                      </div>
                    )}
                  </div>

                  <div>
                    <span className="text-[10px] text-gray-400 uppercase font-bold block flex items-center gap-1">
                      <CreditCard className="w-3 h-3 text-[#ff544b]" /> Pagamento
                    </span>
                    <span className="text-white font-bold uppercase block">
                      {order.paymentMethod === 'pix' ? 'PIX (5% de Desconto)' : order.paymentMethod === 'maquininha' ? 'Cartão / Maquininha' : 'Depósito Bancário'}
                    </span>
                    {order.paymentDetails.cardInstallments && (
                      <span className="text-gray-400 block">{order.paymentDetails.cardInstallments}</span>
                    )}
                    {order.paymentDetails.receiptAttached && (
                      <span className="text-blue-400 block text-[11px] font-bold mt-1">
                        📎 Comprovante: {order.paymentDetails.receiptName || 'Anexado pelo cliente'}
                      </span>
                    )}
                  </div>
                </div>

                {/* Items in Order */}
                <div className="px-6 py-4 space-y-3">
                  <div className="flex items-center justify-between text-xs text-gray-400 uppercase font-bold border-b border-[#2a2a2a] pb-2">
                    <span>Itens do Pedido ({order.items.reduce((acc, it) => acc + it.quantity, 0)} unidades)</span>
                    <span>Subtotal / Ações</span>
                  </div>

                  <div className="divide-y divide-[#2a2a2a]/60">
                    {order.items.map((item, idx) => {
                      const itemTotal = item.isGift ? 0 : item.product.salePrice * item.quantity;

                      return (
                        <div key={`${item.product.id}-${idx}`} className="py-2.5 flex items-center justify-between gap-3 text-xs">
                          <div className="flex items-center gap-3">
                            <div className="w-12 h-12 bg-[#201f1f] rounded border border-[#353534] overflow-hidden shrink-0 flex items-center justify-center relative">
                              {item.product.images?.[0] ? (
                                <img
                                  src={item.product.images[0]}
                                  alt={item.product.name}
                                  className="w-full h-full object-contain p-1"
                                />
                              ) : (
                                <Package className="w-6 h-6 text-gray-500" />
                              )}
                              {item.isGift && (
                                <div className="absolute inset-0 bg-purple-900/60 flex items-center justify-center">
                                  <Gift className="w-5 h-5 text-purple-200" />
                                </div>
                              )}
                            </div>

                            <div>
                              <div className="flex items-center gap-2">
                                <span className="font-bold text-white text-sm">
                                  {item.product.name}
                                </span>
                                {item.isGift ? (
                                  <span className="bg-purple-900/80 text-purple-200 text-[10px] px-2 py-0.5 rounded font-bold border border-purple-500/50 flex items-center gap-1">
                                    <Sparkles className="w-3 h-3 text-purple-300" /> BRINDE CORTESIA
                                  </span>
                                ) : (
                                  <span className="text-[10px] text-gray-400 bg-[#252424] px-1.5 py-0.5 rounded">
                                    SKU: {item.product.sku || 'N/D'}
                                  </span>
                                )}
                              </div>

                              <div className="flex flex-wrap items-center gap-3 text-gray-400 text-[11px] mt-0.5">
                                {item.selectedSize && (
                                  <span className="text-[#ffb4ab] font-bold">Tam: {item.selectedSize}</span>
                                )}
                                <span>
                                  Valor Unitário: {item.isGift ? 'GRÁTIS (R$ 0,00)' : `R$ ${item.product.salePrice.toFixed(2)}`}
                                </span>
                                {item.customNote && (
                                  <span className="text-purple-300 italic">“{item.customNote}”</span>
                                )}
                              </div>
                            </div>
                          </div>

                          {/* Item Quantity and Actions */}
                          <div className="flex items-center gap-4">
                            {/* Quantity Controls */}
                            <div className="flex items-center bg-[#201f1f] border border-[#353534] rounded">
                              <button
                                onClick={() => updateOrderItemQuantity(order.id, idx, item.quantity - 1)}
                                className="px-2 py-1 text-gray-400 hover:text-white"
                                title="Diminuir quantidade"
                              >
                                -
                              </button>
                              <span className="px-2 py-1 font-bold text-white text-xs">{item.quantity}</span>
                              <button
                                onClick={() => updateOrderItemQuantity(order.id, idx, item.quantity + 1)}
                                className="px-2 py-1 text-gray-400 hover:text-white"
                                title="Aumentar quantidade"
                              >
                                +
                              </button>
                            </div>

                            <span className="font-bold font-mono text-sm text-right min-w-[80px]">
                              {item.isGift ? (
                                <span className="text-purple-400 font-bold">R$ 0,00</span>
                              ) : (
                                <span className="text-white">R$ {itemTotal.toFixed(2)}</span>
                              )}
                            </span>

                            {/* Remove item button */}
                            <button
                              onClick={() => {
                                if (confirm(`Remover "${item.product.name}" deste pedido?`)) {
                                  removeItemFromOrder(order.id, idx, true);
                                  showToast('Item removido do pedido.');
                                }
                              }}
                              className="text-gray-500 hover:text-red-400 p-1"
                              title="Remover item do pedido"
                            >
                              <X className="w-4 h-4" />
                            </button>
                          </div>
                        </div>
                      );
                    })}
                  </div>

                  {/* Admin Internal Notes */}
                  {order.adminNotes && (
                    <div className="mt-3 p-3 bg-[#241a18] border border-[#ff544b]/30 rounded text-xs flex items-start gap-2">
                      <AlertCircle className="w-4 h-4 text-[#ff544b] shrink-0 mt-0.5" />
                      <div>
                        <span className="font-bold text-[#ffb4ab] block">Observações do Lojista:</span>
                        <p className="text-gray-300 font-sans mt-0.5">{order.adminNotes}</p>
                      </div>
                    </div>
                  )}
                </div>

                {/* Footer with Totals */}
                <div className="px-6 py-4 bg-[#201f1f] border-t border-[#2d2c2c] flex flex-col sm:flex-row justify-between items-end sm:items-center gap-4 text-xs font-mono">
                  <div className="text-gray-400 flex flex-wrap gap-4 text-[11px]">
                    <span>Subtotal: <strong className="text-white">R$ {order.subtotal.toFixed(2)}</strong></span>
                    {order.discount > 0 && (
                      <span className="text-emerald-400">Desconto: <strong>- R$ {order.discount.toFixed(2)}</strong></span>
                    )}
                    <span>Frete: <strong className="text-white">R$ {(order.shippingCost || 0).toFixed(2)}</strong></span>
                    {order.interest !== undefined && order.interest > 0 && (
                      <span>Juros Cartão: <strong className="text-amber-400">+ R$ {order.interest.toFixed(2)}</strong></span>
                    )}
                  </div>

                  <div className="flex items-center gap-3">
                    <span className="text-gray-400 uppercase font-bold text-xs">Total do Pedido:</span>
                    <span className="text-xl md:text-2xl font-extrabold text-[#ff544b]">
                      R$ {order.total.toFixed(2)}
                    </span>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* ========================================================================= */}
      {/* MODAL 1: EDITAR PEDIDO                                                   */}
      {/* ========================================================================= */}
      {editingOrder && (
        <div className="fixed inset-0 z-[110] flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-fadeIn">
          <div className="relative w-full max-w-2xl bg-[#181717] border-2 border-[#5c403c] rounded-lg shadow-2xl overflow-hidden flex flex-col max-h-[90vh]">
            <div className="flex items-center justify-between px-6 py-4 border-b border-[#2d2c2c] bg-[#201f1f]">
              <div className="flex items-center gap-2">
                <Edit className="w-5 h-5 text-[#ff544b]" />
                <h3 className="font-bold text-white uppercase text-base">
                  Editar Pedido #{editingOrder.id}
                </h3>
              </div>
              <button
                onClick={() => setEditingOrder(null)}
                className="text-gray-400 hover:text-white p-1 rounded"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="p-6 overflow-y-auto space-y-4 text-xs font-mono">
              {/* Status */}
              <div>
                <label className="block text-gray-400 font-bold uppercase mb-1">Status do Pedido</label>
                <select
                  value={editingOrder.status}
                  onChange={(e) =>
                    setEditingOrder({ ...editingOrder, status: e.target.value as Order['status'] })
                  }
                  className="w-full bg-[#201f1f] border border-[#353534] rounded px-3 py-2 text-white text-xs focus:outline-none focus:border-[#ff544b]"
                >
                  <option value="Aguardando Pagamento">Aguardando Pagamento</option>
                  <option value="Aguardando Comprovante / Validação">Aguardando Comprovante / Validação</option>
                  <option value="Pago / Aprovado">Pago / Aprovado</option>
                  <option value="Em Separação">Em Separação</option>
                  <option value="Enviado">Enviado</option>
                  <option value="Entregue">Entregue</option>
                  <option value="Cancelado">Cancelado</option>
                </select>
              </div>

              {/* Customer Info */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <div>
                  <label className="block text-gray-400 font-bold uppercase mb-1">Nome do Cliente</label>
                  <input
                    type="text"
                    value={editingOrder.customerName}
                    onChange={(e) =>
                      setEditingOrder({ ...editingOrder, customerName: e.target.value })
                    }
                    className="w-full bg-[#201f1f] border border-[#353534] rounded px-3 py-2 text-white text-xs focus:outline-none focus:border-[#ff544b]"
                  />
                </div>
                <div>
                  <label className="block text-gray-400 font-bold uppercase mb-1">E-mail</label>
                  <input
                    type="email"
                    value={editingOrder.customerEmail}
                    onChange={(e) =>
                      setEditingOrder({ ...editingOrder, customerEmail: e.target.value })
                    }
                    className="w-full bg-[#201f1f] border border-[#353534] rounded px-3 py-2 text-white text-xs focus:outline-none focus:border-[#ff544b]"
                  />
                </div>
                <div>
                  <label className="block text-gray-400 font-bold uppercase mb-1">Telefone / WhatsApp</label>
                  <input
                    type="text"
                    value={editingOrder.customerPhone || ''}
                    onChange={(e) =>
                      setEditingOrder({ ...editingOrder, customerPhone: e.target.value })
                    }
                    placeholder="(48) 99999-9999"
                    className="w-full bg-[#201f1f] border border-[#353534] rounded px-3 py-2 text-white text-xs focus:outline-none focus:border-[#ff544b]"
                  />
                </div>
              </div>

              {/* Shipping & Tracking */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 border-t border-[#2d2c2c] pt-3">
                <div>
                  <label className="block text-gray-400 font-bold uppercase mb-1">Código de Rastreamento</label>
                  <input
                    type="text"
                    value={editingOrder.trackingCode || ''}
                    onChange={(e) =>
                      setEditingOrder({ ...editingOrder, trackingCode: e.target.value.toUpperCase() })
                    }
                    placeholder="Ex: BR123456789SC"
                    className="w-full bg-[#201f1f] border border-[#353534] rounded px-3 py-2 text-white text-xs focus:outline-none focus:border-[#ff544b]"
                  />
                </div>
                <div>
                  <label className="block text-gray-400 font-bold uppercase mb-1">Valor do Frete (R$)</label>
                  <input
                    type="number"
                    step="0.01"
                    value={editingOrder.shippingCost || 0}
                    onChange={(e) =>
                      setEditingOrder({ ...editingOrder, shippingCost: Number(e.target.value) })
                    }
                    className="w-full bg-[#201f1f] border border-[#353534] rounded px-3 py-2 text-white text-xs focus:outline-none focus:border-[#ff544b]"
                  />
                </div>
              </div>

              {/* Shipping Address */}
              <div className="border-t border-[#2d2c2c] pt-3">
                <label className="block text-gray-400 font-bold uppercase mb-2">Endereço de Entrega</label>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
                  <div className="sm:col-span-2">
                    <input
                      type="text"
                      placeholder="Rua / Logradouro"
                      value={editingOrder.shippingAddress?.street || ''}
                      onChange={(e) =>
                        setEditingOrder({
                          ...editingOrder,
                          shippingAddress: {
                            ...editingOrder.shippingAddress,
                            street: e.target.value,
                          },
                        })
                      }
                      className="w-full bg-[#201f1f] border border-[#353534] rounded px-3 py-2 text-white text-xs focus:outline-none focus:border-[#ff544b]"
                    />
                  </div>
                  <div>
                    <input
                      type="text"
                      placeholder="Número"
                      value={editingOrder.shippingAddress?.number || ''}
                      onChange={(e) =>
                        setEditingOrder({
                          ...editingOrder,
                          shippingAddress: {
                            ...editingOrder.shippingAddress,
                            number: e.target.value,
                          },
                        })
                      }
                      className="w-full bg-[#201f1f] border border-[#353534] rounded px-3 py-2 text-white text-xs focus:outline-none focus:border-[#ff544b]"
                    />
                  </div>
                  <div>
                    <input
                      type="text"
                      placeholder="Bairro"
                      value={editingOrder.shippingAddress?.neighborhood || ''}
                      onChange={(e) =>
                        setEditingOrder({
                          ...editingOrder,
                          shippingAddress: {
                            ...editingOrder.shippingAddress,
                            neighborhood: e.target.value,
                          },
                        })
                      }
                      className="w-full bg-[#201f1f] border border-[#353534] rounded px-3 py-2 text-white text-xs focus:outline-none focus:border-[#ff544b]"
                    />
                  </div>
                  <div>
                    <input
                      type="text"
                      placeholder="Cidade"
                      value={editingOrder.shippingAddress?.city || ''}
                      onChange={(e) =>
                        setEditingOrder({
                          ...editingOrder,
                          shippingAddress: {
                            ...editingOrder.shippingAddress,
                            city: e.target.value,
                          },
                        })
                      }
                      className="w-full bg-[#201f1f] border border-[#353534] rounded px-3 py-2 text-white text-xs focus:outline-none focus:border-[#ff544b]"
                    />
                  </div>
                  <div>
                    <input
                      type="text"
                      placeholder="CEP"
                      value={editingOrder.shippingAddress?.cep || ''}
                      onChange={(e) =>
                        setEditingOrder({
                          ...editingOrder,
                          shippingAddress: {
                            ...editingOrder.shippingAddress,
                            cep: e.target.value,
                          },
                        })
                      }
                      className="w-full bg-[#201f1f] border border-[#353534] rounded px-3 py-2 text-white text-xs focus:outline-none focus:border-[#ff544b]"
                    />
                  </div>
                </div>
              </div>

              {/* Admin Notes */}
              <div className="border-t border-[#2d2c2c] pt-3">
                <label className="block text-gray-400 font-bold uppercase mb-1">
                  Observações Internas do Lojista
                </label>
                <textarea
                  rows={3}
                  value={editingOrder.adminNotes || ''}
                  onChange={(e) =>
                    setEditingOrder({ ...editingOrder, adminNotes: e.target.value })
                  }
                  placeholder="Instruções para a equipe de embalagem, histórico de contato com o cliente, etc."
                  className="w-full bg-[#201f1f] border border-[#353534] rounded px-3 py-2 text-white text-xs focus:outline-none focus:border-[#ff544b]"
                />
              </div>
            </div>

            <div className="p-4 border-t border-[#2d2c2c] bg-[#201f1f] flex justify-end gap-2">
              <button
                onClick={() => setEditingOrder(null)}
                className="px-4 py-2 bg-transparent hover:bg-[#2a2a2a] text-gray-400 hover:text-white rounded text-xs uppercase"
              >
                Cancelar
              </button>
              <button
                onClick={() => {
                  updateOrder(editingOrder.id, editingOrder);
                  showToast(`Pedido #${editingOrder.id} atualizado com sucesso!`);
                  setEditingOrder(null);
                }}
                className="px-5 py-2 bg-[#ff544b] hover:bg-white hover:text-black text-white rounded font-bold text-xs uppercase transition-colors"
              >
                Salvar Alterações
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* MODAL 2: EXCLUIR PEDIDO (CONFIRMAÇÃO)                                    */}
      {/* ========================================================================= */}
      {deletingOrder && (
        <div className="fixed inset-0 z-[110] flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-fadeIn">
          <div className="relative w-full max-w-md bg-[#181717] border-2 border-red-600 rounded-lg shadow-2xl p-6 space-y-4 text-xs font-mono">
            <div className="flex items-center gap-3 text-red-500">
              <AlertTriangle className="w-7 h-7" />
              <h3 className="font-bold text-white text-base uppercase">Excluir Pedido</h3>
            </div>

            <p className="text-gray-300 font-sans text-sm">
              Você tem certeza que deseja excluir permanentemente o pedido{' '}
              <strong className="text-white font-mono">#{deletingOrder.id}</strong> do cliente{' '}
              <strong className="text-white font-mono">{deletingOrder.customerName}</strong> no valor de{' '}
              <strong className="text-[#ff544b] font-mono">R$ {deletingOrder.total.toFixed(2)}</strong>?
            </p>

            <div className="bg-[#201f1f] p-3 rounded border border-[#353534] space-y-2">
              <label className="flex items-center gap-2.5 text-gray-300 cursor-pointer">
                <input
                  type="checkbox"
                  checked={restoreStockOnDelete}
                  onChange={(e) => setRestoreStockOnDelete(e.target.checked)}
                  className="accent-[#ff544b] w-4 h-4 rounded"
                />
                <span className="font-bold">Devolver produtos ao estoque da loja (Estorno)</span>
              </label>
              <p className="text-[11px] text-gray-500">
                Se marcado, as quantidades dos produtos vendidos serão devolvidas automaticamente ao inventário de estoque.
              </p>
            </div>

            <div className="flex justify-end gap-2 pt-2">
              <button
                onClick={() => setDeletingOrder(null)}
                className="px-4 py-2 bg-transparent hover:bg-[#2a2a2a] text-gray-400 hover:text-white rounded uppercase font-bold"
              >
                Cancelar
              </button>
              <button
                onClick={handleConfirmDelete}
                className="px-4 py-2 bg-red-600 hover:bg-red-700 text-white rounded font-bold uppercase transition-colors"
              >
                Sim, Excluir Pedido
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* MODAL 3: ACRESCENTAR ITEM ESQUECIDO PELO CLIENTE                        */}
      {/* ========================================================================= */}
      {addingItemToOrder && (
        <div className="fixed inset-0 z-[110] flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-fadeIn">
          <div className="relative w-full max-w-3xl bg-[#181717] border-2 border-[#5c403c] rounded-lg shadow-2xl overflow-hidden flex flex-col max-h-[90vh]">
            <div className="flex items-center justify-between px-6 py-4 border-b border-[#2d2c2c] bg-[#201f1f]">
              <div className="flex items-center gap-2">
                <Plus className="w-5 h-5 text-emerald-400" />
                <h3 className="font-bold text-white uppercase text-base">
                  Acrescentar Item Esquecido ao Pedido #{addingItemToOrder.id}
                </h3>
              </div>
              <button
                onClick={() => setAddingItemToOrder(null)}
                className="text-gray-400 hover:text-white p-1 rounded"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="p-6 overflow-y-auto space-y-4 text-xs font-mono">
              <div className="bg-[#201f1f] border border-emerald-500/30 p-3.5 rounded text-gray-300 font-sans text-xs">
                O cliente esqueceu de incluir uma lixa, roda, cera ou rolamento no pedido? Escolha o produto abaixo. A quantidade será deduzida do estoque e o total do pedido recalculado automaticamente.
              </div>

              {/* Product Picker Search */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-gray-400 font-bold uppercase mb-1">Filtrar por Categoria</label>
                  <select
                    value={catalogCategory}
                    onChange={(e) => setCatalogCategory(e.target.value)}
                    className="w-full bg-[#201f1f] border border-[#353534] rounded px-3 py-2 text-white text-xs focus:outline-none focus:border-[#ff544b]"
                  >
                    <option value="Todos">Todas as Categorias</option>
                    <option value="Decks">Decks / Shapes</option>
                    <option value="Trucks">Trucks</option>
                    <option value="Wheels">Rodas</option>
                    <option value="Tênis">Tênis</option>
                    <option value="Hardware">Hardware / Parafusos</option>
                    <option value="Acessórios">Acessórios / Lixas / Ceras</option>
                    <option value="Apparel">Roupas / Vestuário</option>
                  </select>
                </div>
                <div>
                  <label className="block text-gray-400 font-bold uppercase mb-1">Buscar Produto</label>
                  <input
                    type="text"
                    placeholder="Digite o nome ou SKU..."
                    value={catalogSearch}
                    onChange={(e) => setCatalogSearch(e.target.value)}
                    className="w-full bg-[#201f1f] border border-[#353534] rounded px-3 py-2 text-white text-xs focus:outline-none focus:border-[#ff544b]"
                  />
                </div>
              </div>

              {/* Catalog Selection List */}
              <div>
                <label className="block text-gray-400 font-bold uppercase mb-1">
                  Selecione o Produto do Catálogo:
                </label>
                <div className="max-h-56 overflow-y-auto border border-[#353534] rounded divide-y divide-[#2d2c2c] bg-[#1c1b1b]">
                  {products
                    .filter((p) => {
                      const matchCat = catalogCategory === 'Todos' || p.category === catalogCategory;
                      const matchSearch =
                        p.name.toLowerCase().includes(catalogSearch.toLowerCase()) ||
                        p.sku.toLowerCase().includes(catalogSearch.toLowerCase());
                      return matchCat && matchSearch;
                    })
                    .map((p) => {
                      const isSelected = selectedProductId === p.id;
                      return (
                        <div
                          key={p.id}
                          onClick={() => {
                            setSelectedProductId(p.id);
                            if (p.sizes && p.sizes.length > 0) {
                              setSelectedSize(p.sizes[0]);
                            } else {
                              setSelectedSize('');
                            }
                            setCustomItemPrice(p.salePrice);
                          }}
                          className={`p-3 flex items-center justify-between cursor-pointer transition-colors ${
                            isSelected
                              ? 'bg-[#ff544b]/20 border-l-4 border-l-[#ff544b]'
                              : 'hover:bg-[#252424]'
                          }`}
                        >
                          <div className="flex items-center gap-3">
                            <div className="w-10 h-10 bg-black/40 rounded border border-[#353534] overflow-hidden shrink-0">
                              <img src={p.images[0]} alt={p.name} className="w-full h-full object-contain p-1" />
                            </div>
                            <div>
                              <span className="font-bold text-white block">{p.name}</span>
                              <span className="text-[10px] text-gray-400">
                                {p.category} | Estoque: <strong>{p.stockQuantity} unid</strong> | SKU: {p.sku}
                              </span>
                            </div>
                          </div>

                          <div className="text-right">
                            <span className="font-bold text-[#ffb4ab] block">R$ {p.salePrice.toFixed(2)}</span>
                            {isSelected && (
                              <span className="text-[10px] text-emerald-400 font-bold flex items-center gap-1">
                                <Check className="w-3 h-3" /> Selecionado
                              </span>
                            )}
                          </div>
                        </div>
                      );
                    })}
                </div>
              </div>

              {/* Selected Product Configuration */}
              {selectedProductId && (() => {
                const prod = products.find((p) => p.id === selectedProductId);
                if (!prod) return null;

                return (
                  <div className="bg-[#201f1f] border border-[#353534] p-4 rounded space-y-3">
                    <span className="font-bold text-white uppercase block">
                      Configurar Item: {prod.name}
                    </span>

                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                      {prod.sizes && prod.sizes.length > 0 && (
                        <div>
                          <label className="block text-gray-400 font-bold uppercase mb-1">Tamanho / Variação</label>
                          <select
                            value={selectedSize}
                            onChange={(e) => setSelectedSize(e.target.value)}
                            className="w-full bg-[#181717] border border-[#353534] rounded px-3 py-2 text-white text-xs focus:outline-none focus:border-[#ff544b]"
                          >
                            {prod.sizes.map((sz) => (
                              <option key={sz} value={sz}>
                                {sz}
                              </option>
                            ))}
                          </select>
                        </div>
                      )}

                      <div>
                        <label className="block text-gray-400 font-bold uppercase mb-1">Quantidade</label>
                        <input
                          type="number"
                          min="1"
                          max={prod.stockQuantity || 99}
                          value={selectedQuantity}
                          onChange={(e) => setSelectedQuantity(Math.max(1, Number(e.target.value)))}
                          className="w-full bg-[#181717] border border-[#353534] rounded px-3 py-2 text-white text-xs focus:outline-none focus:border-[#ff544b]"
                        />
                      </div>

                      <div>
                        <label className="block text-gray-400 font-bold uppercase mb-1">
                          Preço Unitário (R$)
                        </label>
                        <input
                          type="number"
                          step="0.01"
                          value={customItemPrice !== '' ? customItemPrice : prod.salePrice}
                          onChange={(e) =>
                            setCustomItemPrice(e.target.value === '' ? '' : Number(e.target.value))
                          }
                          className="w-full bg-[#181717] border border-[#353534] rounded px-3 py-2 text-white text-xs focus:outline-none focus:border-[#ff544b]"
                        />
                      </div>
                    </div>

                    <div className="text-right text-xs pt-2 border-t border-[#2d2c2c]">
                      <span className="text-gray-400">Total a acrescentar no pedido: </span>
                      <strong className="text-emerald-400 font-bold text-sm">
                        R${' '}
                        {(
                          (typeof customItemPrice === 'number' ? customItemPrice : prod.salePrice) *
                          selectedQuantity
                        ).toFixed(2)}
                      </strong>
                    </div>
                  </div>
                );
              })()}
            </div>

            <div className="p-4 border-t border-[#2d2c2c] bg-[#201f1f] flex justify-end gap-2">
              <button
                onClick={() => setAddingItemToOrder(null)}
                className="px-4 py-2 bg-transparent hover:bg-[#2a2a2a] text-gray-400 hover:text-white rounded text-xs uppercase"
              >
                Cancelar
              </button>
              <button
                onClick={handleConfirmAddItem}
                disabled={!selectedProductId}
                className="px-5 py-2 bg-emerald-600 hover:bg-emerald-500 disabled:opacity-50 text-white rounded font-bold text-xs uppercase transition-colors flex items-center gap-1.5"
              >
                <Plus className="w-4 h-4" /> Acrescentar ao Pedido
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* MODAL 4: INCLUIR BRINDE CORTESIA                                          */}
      {/* ========================================================================= */}
      {addingGiftToOrder && (
        <div className="fixed inset-0 z-[110] flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-fadeIn">
          <div className="relative w-full max-w-3xl bg-[#181717] border-2 border-purple-600 rounded-lg shadow-2xl overflow-hidden flex flex-col max-h-[90vh]">
            <div className="flex items-center justify-between px-6 py-4 border-b border-[#2d2c2c] bg-[#201f1f]">
              <div className="flex items-center gap-2">
                <Gift className="w-5 h-5 text-purple-400" />
                <h3 className="font-bold text-white uppercase text-base">
                  🎁 Incluir Brinde Cortesia ao Pedido #{addingGiftToOrder.id}
                </h3>
              </div>
              <button
                onClick={() => setAddingGiftToOrder(null)}
                className="text-gray-400 hover:text-white p-1 rounded"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="p-6 overflow-y-auto space-y-4 text-xs font-mono">
              <div className="bg-purple-950/40 border border-purple-500/40 p-3.5 rounded text-purple-200 font-sans text-xs">
                O brinde adicionado sairá discriminado com o selo <strong>[BRINDE CORTESIA]</strong> pelo valor de <strong>R$ 0,00</strong>. Não haverá cobrança adicional para o cliente e o valor total do pedido não será alterado.
              </div>

              {/* Gift Mode Tabs */}
              <div className="flex border-b border-[#353534]">
                <button
                  onClick={() => setGiftMode('preset')}
                  className={`px-4 py-2.5 font-bold uppercase transition-colors border-b-2 flex items-center gap-1.5 ${
                    giftMode === 'preset'
                      ? 'border-purple-500 text-purple-400 bg-purple-950/20'
                      : 'border-transparent text-gray-400 hover:text-white'
                  }`}
                >
                  <Sparkles className="w-3.5 h-3.5" /> Brindes Florishop (1 Clique)
                </button>
                <button
                  onClick={() => setGiftMode('catalog')}
                  className={`px-4 py-2.5 font-bold uppercase transition-colors border-b-2 flex items-center gap-1.5 ${
                    giftMode === 'catalog'
                      ? 'border-purple-500 text-purple-400 bg-purple-950/20'
                      : 'border-transparent text-gray-400 hover:text-white'
                  }`}
                >
                  <Package className="w-3.5 h-3.5" /> Peça do Estoque como Brinde
                </button>
                <button
                  onClick={() => setGiftMode('custom')}
                  className={`px-4 py-2.5 font-bold uppercase transition-colors border-b-2 flex items-center gap-1.5 ${
                    giftMode === 'custom'
                      ? 'border-purple-500 text-purple-400 bg-purple-950/20'
                      : 'border-transparent text-gray-400 hover:text-white'
                  }`}
                >
                  <Edit className="w-3.5 h-3.5" /> Brinde Personalizado
                </button>
              </div>

              {/* MODE 1: PRESET GIFTS */}
              {giftMode === 'preset' && (
                <div className="space-y-3">
                  <label className="block text-gray-400 font-bold uppercase">
                    Selecione um dos brindes mais enviados pela Florishop:
                  </label>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    {PRESET_GIFTS.map((g) => {
                      const isSelected = customGiftName === g.name;
                      return (
                        <div
                          key={g.name}
                          onClick={() => {
                            setCustomGiftName(g.name);
                            setCustomGiftNotes(g.notes);
                          }}
                          className={`p-3.5 rounded border flex items-center gap-3 cursor-pointer transition-all ${
                            isSelected
                              ? 'bg-purple-950/40 border-purple-500 shadow-lg'
                              : 'bg-[#201f1f] border-[#353534] hover:border-purple-500/50'
                          }`}
                        >
                          <div className="w-12 h-12 bg-black/40 rounded border border-[#353534] overflow-hidden shrink-0">
                            <img src={g.image} alt={g.name} className="w-full h-full object-contain p-1" />
                          </div>
                          <div className="flex-1">
                            <span className="font-bold text-white block leading-tight">{g.name}</span>
                            <span className="text-[10px] text-gray-400 block mt-0.5">{g.notes}</span>
                            <span className="text-[10px] text-purple-400 font-bold mt-1 block">
                              GRÁTIS (R$ 0,00)
                            </span>
                          </div>
                          {isSelected && <Check className="w-5 h-5 text-purple-400 shrink-0" />}
                        </div>
                      );
                    })}
                  </div>
                </div>
              )}

              {/* MODE 2: PRODUCT FROM CATALOG AS GIFT */}
              {giftMode === 'catalog' && (
                <div className="space-y-3">
                  <label className="block text-gray-400 font-bold uppercase">
                    Escolha qualquer peça da loja para presentear o cliente (R$ 0,00):
                  </label>
                  <div className="max-h-60 overflow-y-auto border border-[#353534] rounded divide-y divide-[#2d2c2c] bg-[#1c1b1b]">
                    {products.map((p) => {
                      const isSelected = selectedCatalogGiftId === p.id;
                      return (
                        <div
                          key={p.id}
                          onClick={() => {
                            setSelectedCatalogGiftId(p.id);
                            if (p.sizes && p.sizes.length > 0) {
                              setCatalogGiftSize(p.sizes[0]);
                            } else {
                              setCatalogGiftSize('');
                            }
                          }}
                          className={`p-3 flex items-center justify-between cursor-pointer transition-colors ${
                            isSelected ? 'bg-purple-950/50 border-l-4 border-l-purple-500' : 'hover:bg-[#252424]'
                          }`}
                        >
                          <div className="flex items-center gap-3">
                            <div className="w-10 h-10 bg-black/40 rounded border border-[#353534] overflow-hidden shrink-0">
                              <img src={p.images[0]} alt={p.name} className="w-full h-full object-contain p-1" />
                            </div>
                            <div>
                              <span className="font-bold text-white block">{p.name}</span>
                              <span className="text-[10px] text-gray-400">
                                Preço Original: R$ {p.salePrice.toFixed(2)} | Estoque: {p.stockQuantity} unid
                              </span>
                            </div>
                          </div>
                          <span className="text-purple-400 font-bold text-xs">SAIRÁ COMO BRINDE</span>
                        </div>
                      );
                    })}
                  </div>

                  {selectedCatalogGiftId && (() => {
                    const prod = products.find((p) => p.id === selectedCatalogGiftId);
                    if (!prod) return null;

                    return (
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 bg-[#201f1f] p-3 rounded border border-[#353534]">
                        {prod.sizes && prod.sizes.length > 0 && (
                          <div>
                            <label className="block text-gray-400 font-bold uppercase mb-1">
                              Tamanho do Brinde
                            </label>
                            <select
                              value={catalogGiftSize}
                              onChange={(e) => setCatalogGiftSize(e.target.value)}
                              className="w-full bg-[#181717] border border-[#353534] rounded px-3 py-2 text-white text-xs"
                            >
                              {prod.sizes.map((sz) => (
                                <option key={sz} value={sz}>{sz}</option>
                              ))}
                            </select>
                          </div>
                        )}
                        <div>
                          <label className="block text-gray-400 font-bold uppercase mb-1">
                            Mensagem / Nota de Cortesia
                          </label>
                          <input
                            type="text"
                            value={customGiftNotes}
                            onChange={(e) => setCustomGiftNotes(e.target.value)}
                            placeholder="Ex: Presente da Florishop por ser cliente VIP"
                            className="w-full bg-[#181717] border border-[#353534] rounded px-3 py-2 text-white text-xs"
                          />
                        </div>
                      </div>
                    );
                  })()}
                </div>
              )}

              {/* MODE 3: CUSTOM GIFT */}
              {giftMode === 'custom' && (
                <div className="space-y-3 bg-[#201f1f] p-4 rounded border border-[#353534]">
                  <div>
                    <label className="block text-gray-400 font-bold uppercase mb-1">
                      Nome do Brinde / Item Especial *
                    </label>
                    <input
                      type="text"
                      placeholder="Ex: Camiseta Edição Limitada Florishop, Pôster Autografado..."
                      value={customGiftName}
                      onChange={(e) => setCustomGiftName(e.target.value)}
                      className="w-full bg-[#181717] border border-[#353534] rounded px-3 py-2 text-white text-xs focus:outline-none focus:border-purple-500"
                    />
                  </div>

                  <div>
                    <label className="block text-gray-400 font-bold uppercase mb-1">
                      Mensagem / Motivo da Cortesia
                    </label>
                    <input
                      type="text"
                      placeholder="Ex: Cortesia de agradecimento pela compra"
                      value={customGiftNotes}
                      onChange={(e) => setCustomGiftNotes(e.target.value)}
                      className="w-full bg-[#181717] border border-[#353534] rounded px-3 py-2 text-white text-xs focus:outline-none focus:border-purple-500"
                    />
                  </div>
                </div>
              )}
            </div>

            <div className="p-4 border-t border-[#2d2c2c] bg-[#201f1f] flex justify-end gap-2">
              <button
                onClick={() => setAddingGiftToOrder(null)}
                className="px-4 py-2 bg-transparent hover:bg-[#2a2a2a] text-gray-400 hover:text-white rounded text-xs uppercase"
              >
                Cancelar
              </button>
              <button
                onClick={handleConfirmAddGift}
                className="px-5 py-2 bg-purple-600 hover:bg-purple-500 text-white rounded font-bold text-xs uppercase transition-colors flex items-center gap-1.5"
              >
                <Gift className="w-4 h-4" /> Incluir Brinde no Pedido
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* MODAL 4: HISTÓRICO DE ESTADOS & AUDITORIA DO PEDIDO */}
      {/* ========================================================================= */}
      {viewingHistoryOrder && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/85 backdrop-blur-sm animate-fadeIn font-sans">
          <div className="bg-[#181717] border border-blue-500/50 rounded-xl max-w-2xl w-full max-h-[90vh] flex flex-col shadow-2xl overflow-hidden">
            {/* Modal Header */}
            <div className="p-5 border-b border-[#2d2c2c] bg-[#201f1f] flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-lg bg-blue-500/10 border border-blue-500/30 flex items-center justify-center text-blue-400 shrink-0">
                  <History className="w-5 h-5" />
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <h3 className="text-base font-extrabold text-white font-mono uppercase tracking-wide">
                      Histórico de Estados — Pedido #{viewingHistoryOrder.id}
                    </h3>
                    <span className="text-[10px] px-2 py-0.5 rounded font-mono font-bold bg-blue-950 text-blue-300 border border-blue-800">
                      {viewingHistoryOrder.statusHistory?.length || 1} registros
                    </span>
                  </div>
                  <p className="text-xs text-gray-400 mt-0.5">
                    Cliente: <strong className="text-gray-200">{viewingHistoryOrder.customerName}</strong> • Total: <strong className="text-gray-200">R$ {viewingHistoryOrder.total.toFixed(2)}</strong> • Atual: <span className="text-[#ff544b] font-bold">{viewingHistoryOrder.status}</span>
                  </p>
                </div>
              </div>

              <button
                type="button"
                onClick={() => {
                  setViewingHistoryOrder(null);
                  setNewStatusNote('');
                }}
                className="text-gray-400 hover:text-white p-1 rounded hover:bg-[#2e2d2d] transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Modal Body: Timeline of Status Records */}
            <div className="p-6 overflow-y-auto space-y-6 flex-1 bg-[#151414]">
              <div className="relative pl-6 space-y-6 before:absolute before:left-2.5 before:top-2 before:bottom-2 before:w-0.5 before:bg-[#353534]">
                {(!viewingHistoryOrder.statusHistory || viewingHistoryOrder.statusHistory.length === 0) ? (
                  <div className="relative">
                    <div className="absolute -left-6 top-1.5 w-5 h-5 rounded-full bg-blue-600 border-2 border-[#181717] flex items-center justify-center">
                      <div className="w-2 h-2 rounded-full bg-white" />
                    </div>
                    <div className="bg-[#201f1f] border border-[#353534] p-3.5 rounded-lg space-y-1">
                      <div className="flex items-center justify-between text-xs">
                        <span className="font-bold text-white uppercase">{viewingHistoryOrder.status}</span>
                        <span className="text-gray-400 font-mono text-[11px]">{viewingHistoryOrder.date}</span>
                      </div>
                      <p className="text-xs text-gray-400">Criação do pedido</p>
                    </div>
                  </div>
                ) : (
                  viewingHistoryOrder.statusHistory.map((item, idx) => {
                    const isLatest = idx === viewingHistoryOrder.statusHistory!.length - 1;
                    const isCancel = item.status === 'Cancelado';
                    const isDelivered = item.status === 'Entregue';

                    return (
                      <div key={item.id || idx} className="relative group">
                        {/* Bullet indicator */}
                        <div
                          className={`absolute -left-6 top-1.5 w-5 h-5 rounded-full border-2 border-[#181717] flex items-center justify-center transition-all ${
                            isDelivered
                              ? 'bg-emerald-500'
                              : isCancel
                              ? 'bg-red-500'
                              : isLatest
                              ? 'bg-[#ff544b]'
                              : 'bg-blue-600'
                          }`}
                        >
                          <div className="w-1.5 h-1.5 rounded-full bg-white" />
                        </div>

                        {/* Record Card */}
                        <div
                          className={`border rounded-lg p-4 transition-all ${
                            isLatest
                              ? 'bg-[#201f1f] border-[#ff544b]/50 shadow-md'
                              : 'bg-[#1a1919] border-[#2e2d2d]'
                          }`}
                        >
                          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-1.5 pb-2 border-b border-[#2d2c2c]">
                            <div className="flex items-center gap-2">
                              <span
                                className={`text-xs font-extrabold uppercase px-2.5 py-0.5 rounded font-mono ${
                                  isDelivered
                                    ? 'bg-emerald-950 text-emerald-300 border border-emerald-700'
                                    : isCancel
                                    ? 'bg-red-950 text-red-300 border border-red-700'
                                    : 'bg-[#282626] text-white border border-[#403e3e]'
                                }`}
                              >
                                {item.status}
                              </span>

                              {item.fromStatus && item.fromStatus !== item.status && (
                                <span className="text-[10px] text-gray-500 font-mono">
                                  (anterior: {item.fromStatus})
                                </span>
                              )}
                            </div>

                            <div className="flex items-center gap-2 text-[11px] font-mono text-gray-400">
                              <Calendar className="w-3 h-3 text-gray-500" />
                              <span>{item.formattedDate || new Date(item.timestamp).toLocaleString('pt-BR')}</span>
                            </div>
                          </div>

                          <div className="mt-2.5 flex flex-col sm:flex-row sm:items-start justify-between gap-2">
                            <p className="text-xs text-gray-300 leading-relaxed flex-1">
                              {item.notes || 'Transição de status registrada no sistema.'}
                            </p>

                            <div className="flex items-center gap-1.5 text-[11px] text-gray-400 bg-[#252424] px-2.5 py-1 rounded border border-[#353534] self-start sm:self-auto shrink-0 font-mono">
                              <span
                                className={`w-1.5 h-1.5 rounded-full ${
                                  item.updatedBy === 'admin'
                                    ? 'bg-[#ff544b]'
                                    : item.updatedBy === 'customer'
                                    ? 'bg-emerald-400'
                                    : 'bg-blue-400'
                                }`}
                              />
                              <span className="capitalize">
                                {item.updatedBy === 'admin'
                                  ? 'Administrador'
                                  : item.updatedBy === 'customer'
                                  ? 'Cliente'
                                  : 'Sistema'}
                              </span>
                              {item.authorName && (
                                <span className="text-gray-500">• {item.authorName}</span>
                              )}
                            </div>
                          </div>
                        </div>
                      </div>
                    );
                  })
                )}
              </div>

              {/* Add Note Section */}
              <div className="bg-[#201f1f] border border-[#353534] rounded-lg p-4 space-y-3 mt-6">
                <div className="flex items-center gap-2 text-xs font-bold text-gray-300 uppercase font-mono">
                  <MessageSquare className="w-3.5 h-3.5 text-blue-400" />
                  <span>Adicionar Anotação Administrativa ao Histórico</span>
                </div>
                <div className="flex gap-2">
                  <input
                    type="text"
                    value={newStatusNote}
                    onChange={(e) => setNewStatusNote(e.target.value)}
                    placeholder="Ex: Entramos em contato com o cliente via WhatsApp para confirmar endereço..."
                    className="flex-1 bg-[#181717] border border-[#353534] text-xs text-white rounded px-3 py-2 focus:outline-none focus:border-blue-500"
                    onKeyDown={(e) => {
                      if (e.key === 'Enter' && newStatusNote.trim()) {
                        e.preventDefault();
                        const currentHistory = viewingHistoryOrder.statusHistory || [];
                        const newEntry: OrderStatusHistoryItem = {
                          id: `sh-${viewingHistoryOrder.id}-${Date.now()}`,
                          fromStatus: viewingHistoryOrder.status,
                          status: viewingHistoryOrder.status,
                          timestamp: new Date().toISOString(),
                          formattedDate: new Date().toLocaleString('pt-BR'),
                          updatedBy: 'admin',
                          authorName: 'Administrador Florishop',
                          notes: newStatusNote.trim(),
                        };
                        const updatedHistory = [...currentHistory, newEntry];
                        updateOrder(viewingHistoryOrder.id, {
                          statusHistory: updatedHistory,
                        });
                        setViewingHistoryOrder({
                          ...viewingHistoryOrder,
                          statusHistory: updatedHistory,
                        });
                        setNewStatusNote('');
                        showToast('Nova anotação registrada no histórico com sucesso!');
                      }
                    }}
                  />
                  <button
                    type="button"
                    onClick={() => {
                      if (!newStatusNote.trim()) return;
                      const currentHistory = viewingHistoryOrder.statusHistory || [];
                      const newEntry: OrderStatusHistoryItem = {
                        id: `sh-${viewingHistoryOrder.id}-${Date.now()}`,
                        fromStatus: viewingHistoryOrder.status,
                        status: viewingHistoryOrder.status,
                        timestamp: new Date().toISOString(),
                        formattedDate: new Date().toLocaleString('pt-BR'),
                        updatedBy: 'admin',
                        authorName: 'Administrador Florishop',
                        notes: newStatusNote.trim(),
                      };
                      const updatedHistory = [...currentHistory, newEntry];
                      updateOrder(viewingHistoryOrder.id, {
                        statusHistory: updatedHistory,
                      });
                      setViewingHistoryOrder({
                        ...viewingHistoryOrder,
                        statusHistory: updatedHistory,
                      });
                      setNewStatusNote('');
                      showToast('Nova anotação registrada no histórico com sucesso!');
                    }}
                    className="px-4 py-2 bg-blue-600 hover:bg-blue-500 text-white rounded text-xs font-bold uppercase transition-colors flex items-center gap-1.5 shrink-0"
                  >
                    <Send className="w-3.5 h-3.5" />
                    Registrar
                  </button>
                </div>
              </div>
            </div>

            {/* Modal Footer */}
            <div className="p-4 border-t border-[#2d2c2c] bg-[#201f1f] flex items-center justify-between">
              <span className="text-xs text-gray-500 font-mono">
                ID do Pedido: {viewingHistoryOrder.id}
              </span>
              <button
                type="button"
                onClick={() => {
                  setViewingHistoryOrder(null);
                  setNewStatusNote('');
                }}
                className="px-5 py-2 bg-[#2d2c2c] hover:bg-[#3d3c3c] text-white rounded text-xs font-bold uppercase transition-colors"
              >
                Fechar Histórico
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* MODAL 5: CONFIRMAÇÃO DE CANCELAMENTO PELO ADMINISTRADOR */}
      {/* ========================================================================= */}
      {orderToCancel && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/85 backdrop-blur-sm animate-fadeIn font-sans">
          <div className="bg-[#181717] border border-amber-500/50 rounded-xl max-w-lg w-full p-6 space-y-5 shadow-2xl">
            <div className="flex items-center justify-between border-b border-[#2d2c2c] pb-3">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-full bg-amber-500/10 border border-amber-500/40 flex items-center justify-center text-amber-400">
                  <XCircle className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-base font-bold text-white font-mono uppercase">
                    Cancelar Pedido #{orderToCancel.id}
                  </h3>
                  <p className="text-xs text-gray-400">
                    Cliente: {orderToCancel.customerName} • Valor: R$ {orderToCancel.total.toFixed(2)}
                  </p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setOrderToCancel(null)}
                className="text-gray-400 hover:text-white p-1 rounded hover:bg-[#2d2c2c]"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="space-y-4">
              <div className="p-3 bg-amber-950/20 border border-amber-500/30 rounded text-xs text-amber-300/90 leading-relaxed font-mono">
                <p className="font-bold flex items-center gap-1.5 text-amber-400 mb-1">
                  <AlertTriangle className="w-4 h-4 shrink-0" />
                  Efeito do Cancelamento:
                </p>
                <ul className="list-disc pl-5 space-y-1 text-[11px]">
                  <li>O status do pedido será alterado para <strong>Cancelado</strong>.</li>
                  <li>O estoque de todos os produtos comprados será <strong>devolvido automaticamente</strong>.</li>
                  <li>Um novo registro será gravado na <strong>trilha de histórico de estados</strong>.</li>
                  <li>O pedido <strong>sairá da gestão ativa de pedidos</strong> e ficará arquivado no <strong>Histórico de Pedidos</strong>.</li>
                </ul>
              </div>

              <div>
                <label className="block text-xs font-bold text-gray-300 uppercase font-mono mb-2">
                  Motivo do Cancelamento:
                </label>
                <select
                  value={cancelReason}
                  onChange={(e) => setCancelReason(e.target.value)}
                  className="w-full bg-[#201f1f] border border-[#353534] rounded px-3 py-2 text-xs text-white focus:outline-none focus:border-amber-500"
                >
                  <option value="Cancelamento solicitado pelo cliente">Cancelamento solicitado pelo cliente</option>
                  <option value="Pagamento expirado ou não identificado">Pagamento expirado ou não identificado</option>
                  <option value="Desistência da compra">Desistência da compra</option>
                  <option value="Suspeita de duplicidade ou fraude">Suspeita de duplicidade ou fraude</option>
                  <option value="Avaria de estoque / item indisponível">Avaria de estoque / item indisponível</option>
                  <option value="Outro">Outro motivo personalizado...</option>
                </select>
              </div>

              {cancelReason === 'Outro' && (
                <div>
                  <label className="block text-xs font-bold text-gray-300 uppercase font-mono mb-1">
                    Descreva o motivo:
                  </label>
                  <input
                    type="text"
                    value={customCancelReason}
                    onChange={(e) => setCustomCancelReason(e.target.value)}
                    placeholder="Especifique o motivo do cancelamento..."
                    className="w-full bg-[#201f1f] border border-[#353534] rounded px-3 py-2 text-xs text-white focus:outline-none focus:border-amber-500"
                  />
                </div>
              )}
            </div>

            <div className="flex items-center justify-end gap-2 pt-3 border-t border-[#2d2c2c]">
              <button
                type="button"
                onClick={() => setOrderToCancel(null)}
                className="px-4 py-2 bg-transparent hover:bg-[#2d2c2c] text-gray-400 hover:text-white rounded text-xs font-bold uppercase transition-colors"
              >
                Voltar
              </button>
              <button
                type="button"
                onClick={() => {
                  const finalReason = cancelReason === 'Outro' ? (customCancelReason.trim() || 'Cancelado por motivo personalizado') : cancelReason;
                  cancelOrder(orderToCancel.id, finalReason, 'admin');
                  showToast(`Pedido #${orderToCancel.id} cancelado com sucesso e movido para o histórico.`);
                  setOrderToCancel(null);
                }}
                className="px-5 py-2 bg-red-600 hover:bg-red-500 text-white rounded text-xs font-bold uppercase transition-colors flex items-center gap-1.5 shadow-lg"
              >
                <XCircle className="w-4 h-4" />
                Confirmar Cancelamento
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
