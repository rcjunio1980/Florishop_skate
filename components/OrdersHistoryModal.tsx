'use client';

import React, { useState } from 'react';
import { useStore } from './StoreContext';
import { Order } from '@/lib/skate-store';
import {
  PackageCheck,
  QrCode,
  CreditCard,
  Building2,
  ShoppingBag,
  FileCheck,
  AlertTriangle,
  Clock,
  CheckCircle2,
  Truck,
  MapPin,
  Lock,
  User,
  Users,
  LayoutDashboard,
  XCircle,
  Trash2,
  AlertOctagon,
  X,
  RotateCcw,
  Check,
  HelpCircle,
  Package,
  Database,
  History,
  RefreshCw,
  Copy,
  Calendar,
  ExternalLink,
  ShoppingCart
} from 'lucide-react';
import { UserPurchaseHistoryRecord } from '@/lib/skate-store';

export const OrdersHistoryModal: React.FC = () => {
  const {
    orders,
    setActiveTab,
    currentUser,
    isAdmin,
    isLoggedIn,
    openAuthModal,
    cancelOrder,
    confirmOrderDelivered,
    deleteOrder,
    getUserPurchaseHistory,
    userPurchaseHistory,
    addToCart
  } = useStore();

  // Submenu ativo: 'ativos' (pedidos em andamento) ou 'historico' (histórico de compras entregues/finalizadas)
  const [activeSubTab, setActiveSubTab] = useState<'ativos' | 'historico'>('ativos');

  // Selected orders for confirmation modals
  const [orderToCancel, setOrderToCancel] = useState<Order | null>(null);
  const [orderToDelete, setOrderToDelete] = useState<Order | null>(null);
  const [orderToConfirmDelivery, setOrderToConfirmDelivery] = useState<Order | null>(null);
  const [deliveryNotes, setDeliveryNotes] = useState<string>('');
  const [expandedHistoryOrderId, setExpandedHistoryOrderId] = useState<string | null>(null);
  const [selectedReason, setSelectedReason] = useState<string>('Mudei de ideia / desistência');
  const [customReason, setCustomReason] = useState<string>('');
  const [copiedOrderId, setCopiedOrderId] = useState<string | null>(null);

  // Toast notification state
  const [toastMessage, setToastMessage] = useState<string | null>(null);
  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => {
      setToastMessage(null);
    }, 4000);
  };

  // If customer, filter orders by current user or show their orders
  const displayedOrders = isAdmin
    ? orders
    : currentUser
    ? orders.filter(
        (o) =>
          (o.userId && o.userId === currentUser.id) ||
          o.customerEmail.toLowerCase() === currentUser.email.toLowerCase()
      )
    : [];

  // Pedidos ativos em andamento (excluindo os que foram 'Entregue')
  const activeOrders = displayedOrders.filter((o) => o.status !== 'Entregue');

  // Histórico de compras finalizadas e entregues (da tabela permanente user_purchase_history e pedidos Entregue)
  const purchaseHistoryRecords = getUserPurchaseHistory(isAdmin ? undefined : currentUser?.id);

  // Mapeamento consolidado para evitar duplicidade
  const deliveredOrderMap = new Map<string, UserPurchaseHistoryRecord>();
  purchaseHistoryRecords.forEach((rec) => {
    deliveredOrderMap.set(rec.orderId, rec);
  });

  // Garante que qualquer pedido entregue no estado atual também esteja visível no histórico
  displayedOrders
    .filter((o) => o.status === 'Entregue')
    .forEach((ord) => {
      if (!deliveredOrderMap.has(ord.id)) {
        deliveredOrderMap.set(ord.id, {
          id: `uph-${ord.id}`,
          userId: ord.userId || (currentUser?.id ?? `user-${ord.customerEmail}`),
          orderId: ord.id,
          customerName: ord.customerName,
          customerEmail: ord.customerEmail,
          completedAt: ord.deliveredAt || new Date().toISOString(),
          orderDate: ord.date,
          total: ord.total,
          subtotal: ord.subtotal,
          shippingCost: ord.shippingCost || 0,
          shippingMethod: ord.shippingMethod,
          paymentMethod: ord.paymentMethod,
          itemsCount: ord.items.reduce((sum, it) => sum + it.quantity, 0),
          items: ord.items,
          trackingCode: ord.trackingCode,
          deliveryNotes: ord.adminNotes,
          status: 'Entregue',
          createdAt: new Date().toISOString(),
        });
      }
    });

  const allCompletedPurchases = Array.from(deliveredOrderMap.values()).sort((a, b) => {
    const dateA = new Date(a.completedAt || a.orderDate).getTime() || 0;
    const dateB = new Date(b.completedAt || b.orderDate).getTime() || 0;
    return dateB - dateA;
  });

  const handleConfirmCancel = () => {
    if (!orderToCancel) return;
    const finalReason = selectedReason === 'Outro' ? customReason.trim() || 'Outro' : selectedReason;
    cancelOrder(orderToCancel.id, finalReason);
    showToast(`Pedido #${orderToCancel.id} cancelado com sucesso. O estoque foi liberado.`);
    setOrderToCancel(null);
    setSelectedReason('Mudei de ideia / desistência');
    setCustomReason('');
  };

  const handleConfirmDelete = () => {
    if (!orderToDelete) return;
    deleteOrder(orderToDelete.id, true);
    showToast(`Pedido #${orderToDelete.id} excluído com sucesso do histórico.`);
    setOrderToDelete(null);
  };

  return (
    <div className="max-w-5xl mx-auto px-4 md:px-12 py-10 space-y-6">
      {/* Toast Notification */}
      {toastMessage && (
        <div className="fixed top-20 right-6 z-50 bg-[#17231c] border border-[#3ecf8e] text-[#3ecf8e] px-4 py-3 rounded-lg shadow-2xl flex items-center gap-3 font-mono text-xs animate-in fade-in slide-in-from-top-4">
          <CheckCircle2 className="w-4 h-4 shrink-0" />
          <span>{toastMessage}</span>
          <button onClick={() => setToastMessage(null)} className="text-gray-400 hover:text-white ml-2">
            <X className="w-3.5 h-3.5" />
          </button>
        </div>
      )}

      {/* Header Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between border-b-2 border-[#5c403c] pb-4 gap-4">
        <div>
          <span className="font-mono text-xs text-[#ff544b] uppercase font-bold tracking-widest block mb-1">
            {isAdmin ? 'PAINEL ADMINISTRATIVO &bull; VENDAS GLOBAIS' : 'HISTÓRICO DA SUA CONTA'}
          </span>
          <h1 className="font-display text-3xl font-extrabold text-white uppercase tracking-tight flex items-center gap-3">
            <PackageCheck className="w-8 h-8 text-[#ff544b]" />
            {isAdmin ? 'Todos os' : 'Meus'} <span className="text-[#ff544b]">Pedidos</span>
          </h1>
          {isAdmin ? (
            <p className="font-mono text-xs text-amber-400 mt-1">
              Modo Administrador Ativo: Exibindo todos os {orders.length} pedidos da loja.
            </p>
          ) : (
            <p className="font-sans text-xs text-gray-400 mt-1">
              Acompanhe suas compras, código de rastreamento e gerencie cancelamentos ou exclusões de pedidos não pagos.
            </p>
          )}
        </div>

        <div className="flex items-center gap-2.5">
          {isAdmin && (
            <>
              <button
                onClick={() => setActiveTab('admin-orders')}
                className="px-3.5 py-2 bg-[#201f1f] border border-[#353534] text-gray-300 font-mono text-xs uppercase hover:text-white hover:border-[#ff544b] rounded flex items-center gap-1.5"
              >
                <PackageCheck className="w-3.5 h-3.5 text-[#ff544b]" /> Gestão de Pedidos
              </button>
              <button
                onClick={() => setActiveTab('admin-users')}
                className="px-3.5 py-2 bg-[#201f1f] border border-[#353534] text-gray-300 font-mono text-xs uppercase hover:text-white hover:border-[#ff544b] rounded flex items-center gap-1.5"
              >
                <Users className="w-3.5 h-3.5 text-[#ff544b]" /> Cadastros
              </button>
              <button
                onClick={() => setActiveTab('admin-stock')}
                className="px-3.5 py-2 bg-[#201f1f] border border-[#353534] text-gray-300 font-mono text-xs uppercase hover:text-white hover:border-[#ff544b] rounded flex items-center gap-1.5"
              >
                <LayoutDashboard className="w-3.5 h-3.5 text-[#ff544b]" /> Estoque
              </button>
            </>
          )}
          <button
            onClick={() => setActiveTab('catalog')}
            className="px-4 py-2 bg-[#ff544b] text-white font-mono text-xs uppercase font-bold hover:bg-white hover:text-black rounded transition-colors"
          >
            Ir para a Loja
          </button>
        </div>
      </div>

      {/* Submenu de Navegação: Pedidos em Andamento vs. Histórico de Compras */}
      {isLoggedIn && (
        <div className="flex flex-wrap items-center justify-between gap-4 border-b border-[#353534] pb-2 font-mono text-xs uppercase">
          <div className="flex items-center gap-2">
            <button
              onClick={() => setActiveSubTab('ativos')}
              id="tab-pedidos-ativos"
              className={`flex items-center gap-2 px-4 py-2.5 rounded-t font-bold transition-all border-b-2 -mb-[9px] ${
                activeSubTab === 'ativos'
                  ? 'bg-[#201f1f] text-white border-[#ff544b]'
                  : 'text-gray-400 hover:text-white border-transparent hover:bg-[#1a1919]'
              }`}
            >
              <Clock className="w-4 h-4 text-[#ff544b]" />
              <span>Pedidos em Andamento</span>
              <span
                className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${
                  activeOrders.length > 0
                    ? 'bg-[#ff544b] text-white'
                    : 'bg-[#2a2a2a] text-gray-400'
                }`}
              >
                {activeOrders.length}
              </span>
            </button>

            <button
              onClick={() => setActiveSubTab('historico')}
              id="tab-historico-compras"
              className={`flex items-center gap-2 px-4 py-2.5 rounded-t font-bold transition-all border-b-2 -mb-[9px] ${
                activeSubTab === 'historico'
                  ? 'bg-[#1a2e23] text-emerald-300 border-emerald-500'
                  : 'text-gray-400 hover:text-emerald-300 border-transparent hover:bg-[#1a1919]'
              }`}
            >
              <CheckCircle2 className="w-4 h-4 text-emerald-400" />
              <span>Histórico de Compras</span>
              <span
                className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${
                  allCompletedPurchases.length > 0
                    ? 'bg-emerald-600 text-white'
                    : 'bg-[#2a2a2a] text-gray-400'
                }`}
              >
                {allCompletedPurchases.length}
              </span>
            </button>
          </div>

          <div className="hidden sm:flex items-center gap-2 text-[11px] text-gray-400">
            <Database className="w-3.5 h-3.5 text-emerald-400" />
            <span>Tabela: <strong className="text-gray-200">user_purchase_history</strong></span>
          </div>
        </div>
      )}

      {/* Não está logado */}
      {!isLoggedIn ? (
        <div className="bg-[#181717] border-2 border-[#5c403c] p-12 text-center rounded space-y-4 max-w-xl mx-auto font-mono">
          <div className="w-16 h-16 mx-auto rounded-full bg-[#ff544b]/10 border border-[#ff544b] flex items-center justify-center text-[#ff544b]">
            <Lock className="w-8 h-8" />
          </div>
          <h3 className="font-display text-xl font-bold text-white uppercase">
            Acesso aos Pedidos Requer Login
          </h3>
          <p className="text-xs text-gray-400">
            Para acompanhar o histórico de compras, status de aprovação de pagamentos e rastreamento de entregas, entre na sua conta cadastrada.
          </p>
          <div className="pt-2 flex justify-center gap-3">
            <button
              onClick={() => openAuthModal('login')}
              className="px-6 py-3 bg-[#ff544b] text-white font-bold text-xs uppercase rounded hover:bg-white hover:text-black transition-all"
            >
              Fazer Login / Cadastrar
            </button>
          </div>
        </div>
      ) : activeSubTab === 'ativos' ? (
        activeOrders.length === 0 ? (
          <div className="bg-[#181717] border border-[#353534] p-12 text-center rounded space-y-4">
            <ShoppingBag className="w-12 h-12 text-[#ff544b] mx-auto opacity-80" />
            <h3 className="font-display text-xl font-bold text-white uppercase">
              Nenhum pedido em andamento no momento
            </h3>
            <p className="font-sans text-xs text-gray-400 max-w-md mx-auto">
              {allCompletedPurchases.length > 0
                ? 'Todos os seus pedidos anteriores foram entregues com sucesso e arquivados no seu Histórico de Compras!'
                : 'Quando você concluir um pedido pelo checkout, ele aparecerá aqui com todos os detalhes e comprovante de pagamento.'}
            </p>
            <div className="flex flex-wrap justify-center gap-3 pt-2">
              {allCompletedPurchases.length > 0 && (
                <button
                  onClick={() => setActiveSubTab('historico')}
                  className="px-6 py-2.5 bg-emerald-800 hover:bg-emerald-700 text-white font-mono text-xs uppercase font-bold rounded flex items-center gap-2 transition-colors"
                >
                  <CheckCircle2 className="w-4 h-4 text-emerald-300" />
                  Ver Histórico de Compras ({allCompletedPurchases.length})
                </button>
              )}
              <button
                onClick={() => setActiveTab('catalog')}
                className="px-6 py-2.5 bg-[#ff544b] text-white font-mono text-xs uppercase font-bold rounded hover:bg-white hover:text-black transition-colors"
              >
                Fazer Novo Pedido
              </button>
            </div>
          </div>
        ) : (
          <div className="space-y-5">
            {activeOrders.map((order) => {
            const isUnpaid =
              order.status === 'Aguardando Pagamento' ||
              order.status === 'Aguardando Comprovante / Validação';
            const isCancelled = order.status === 'Cancelado';
            const isPaid = !isUnpaid && !isCancelled;

            return (
              <div
                key={order.id}
                className={`bg-[#181717] border rounded-lg p-6 space-y-4 transition-all shadow-md ${
                  isCancelled
                    ? 'border-[#2e2424] opacity-90'
                    : isUnpaid
                    ? 'border-[#4a3928] hover:border-amber-500/50'
                    : 'border-[#353534] hover:border-[#ff544b]/50'
                }`}
              >
                {/* Top Info Bar */}
                <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-2 border-b border-[#2a2a2a] pb-3">
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="font-mono text-xs text-[#ffb4ab] font-bold block">
                        PEDIDO #{order.id}
                      </span>
                      {order.trackingCode && (
                        <span className="px-2 py-0.5 rounded bg-blue-950/60 border border-blue-600/40 text-blue-300 font-mono text-[10px] font-bold flex items-center gap-1">
                          <Truck className="w-3 h-3 text-blue-400" />
                          Rastreio: {order.trackingCode}
                        </span>
                      )}
                    </div>
                    <span className="font-mono text-[11px] text-gray-400">{order.date}</span>
                  </div>

                  <div className="flex flex-wrap items-center gap-2 font-mono text-xs">
                    {/* Payment Method Badge */}
                    <span className="px-2.5 py-1 bg-[#201f1f] text-gray-300 border border-[#333] rounded font-bold uppercase flex items-center gap-1.5">
                      {order.paymentMethod === 'pix' && <QrCode className="w-3.5 h-3.5 text-emerald-400" />}
                      {order.paymentMethod === 'maquininha' && <CreditCard className="w-3.5 h-3.5 text-[#ff544b]" />}
                      {order.paymentMethod === 'deposito' && <Building2 className="w-3.5 h-3.5 text-amber-400" />}
                      {order.paymentMethod === 'pix' ? 'PIX (-5%)' : order.paymentMethod === 'maquininha' ? 'Maquininha' : 'Depósito'}
                    </span>

                    {/* Status Badge */}
                    <span
                      className={`px-2.5 py-1 rounded font-bold uppercase flex items-center gap-1.5 text-xs ${
                        order.status === 'Pago / Aprovado'
                          ? 'bg-emerald-950 text-emerald-300 border border-emerald-500/40'
                          : order.status === 'Em Separação'
                          ? 'bg-blue-950 text-blue-300 border border-blue-500/40'
                          : order.status === 'Enviado'
                          ? 'bg-cyan-950 text-cyan-300 border border-cyan-500/40'
                          : order.status === 'Entregue'
                          ? 'bg-emerald-950 text-emerald-300 border border-emerald-500/40'
                          : order.status === 'Aguardando Comprovante / Validação'
                          ? 'bg-amber-950 text-amber-300 border border-amber-500/50'
                          : order.status === 'Cancelado'
                          ? 'bg-red-950/70 text-red-400 border border-red-800/60'
                          : 'bg-[#252424] text-gray-300 border border-[#444]'
                      }`}
                    >
                      {order.status === 'Pago / Aprovado' && <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />}
                      {order.status === 'Em Separação' && <Package className="w-3.5 h-3.5 text-blue-400" />}
                      {order.status === 'Enviado' && <Truck className="w-3.5 h-3.5 text-cyan-400" />}
                      {order.status === 'Entregue' && <Check className="w-3.5 h-3.5 text-emerald-400" />}
                      {order.status === 'Aguardando Comprovante / Validação' && <AlertTriangle className="w-3.5 h-3.5 text-amber-400" />}
                      {order.status === 'Aguardando Pagamento' && <Clock className="w-3.5 h-3.5 text-amber-400" />}
                      {order.status === 'Cancelado' && <XCircle className="w-3.5 h-3.5 text-red-400" />}
                      {order.status}
                    </span>
                  </div>
                </div>

                {/* Depósito Specific Verification Alert */}
                {order.paymentMethod === 'deposito' && !isCancelled && (
                  <div className="bg-amber-950/30 border border-amber-500/40 p-3 rounded flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2 font-sans text-xs text-amber-200">
                    <div className="flex items-center gap-2">
                      <AlertTriangle className="w-4 h-4 text-amber-400 flex-shrink-0" />
                      <span>
                        <strong>Liberação Pendente:</strong> A compra só será despachada após validação financeira do anexo de depósito.
                      </span>
                    </div>
                    {order.paymentDetails.receiptName && (
                      <span className="font-mono text-[11px] bg-[#1a1714] px-2 py-1 rounded border border-amber-500/30 text-amber-300 flex items-center gap-1">
                        <FileCheck className="w-3.5 h-3.5 text-amber-400" />
                        {order.paymentDetails.receiptName}
                      </span>
                    )}
                  </div>
                )}

                {/* Maquininha Specific Installment Info */}
                {order.paymentMethod === 'maquininha' && order.paymentDetails.cardInstallments && (
                  <div className="bg-[#201f1f] border border-[#ff544b]/30 p-2.5 rounded font-mono text-xs text-gray-300 flex flex-wrap items-center justify-between gap-2">
                    <span className="flex items-center gap-1.5">
                      <CreditCard className="w-3.5 h-3.5 text-[#ff544b]" />
                      <span>Plano selecionado: <strong className="text-white">{order.paymentDetails.cardInstallments}</strong></span>
                    </span>
                    {order.interest && order.interest > 0 ? (
                      <span className="text-amber-400 text-[11px]">
                        Taxas de parcelamento inclusas: +R$ {order.interest.toFixed(2)}
                      </span>
                    ) : (
                      <span className="text-emerald-400 text-[11px] font-bold">
                        Até 5x Sem Juros Aplicado
                      </span>
                    )}
                  </div>
                )}

                {/* Items Table */}
                <div className="space-y-2">
                  {order.items.map((ci, idx) => (
                    <div
                      key={idx}
                      className="flex justify-between items-center font-mono text-xs text-gray-300 bg-[#201f1f] p-3 rounded border border-[#272626]"
                    >
                      <div className="flex items-center gap-3">
                        <img
                          src={ci.product.images[0]}
                          alt={ci.product.name}
                          className="w-9 h-9 object-contain bg-[#131313] p-1 rounded border border-[#333]"
                        />
                        <div>
                          <div className="flex items-center gap-2">
                            <span className="font-bold text-white block">{ci.product.name}</span>
                            {ci.isGift && (
                              <span className="px-1.5 py-0.5 rounded text-[9px] bg-purple-950 text-purple-300 border border-purple-600/40 uppercase font-bold">
                                Cortesia / Brinde
                              </span>
                            )}
                          </div>
                          <span className="text-[10px] text-gray-400">
                            Qtd: {ci.quantity} {ci.selectedSize ? `| Tamanho: ${ci.selectedSize}` : ''}
                            {ci.customNote ? ` | Obs: ${ci.customNote}` : ''}
                          </span>
                        </div>
                      </div>
                      <span className="font-bold text-white">
                        {ci.isGift ? (
                          <span className="text-purple-300">R$ 0,00</span>
                        ) : (
                          `R$ ${(ci.product.salePrice * ci.quantity).toFixed(2)}`
                        )}
                      </span>
                    </div>
                  ))}
                </div>

                {/* Shipping & Delivery Info */}
                {order.shippingMethod && (
                  <div className="bg-[#181717] border border-[#2d2c2c] p-2.5 rounded font-mono text-xs text-gray-300 flex flex-wrap items-center justify-between gap-2">
                    <span className="flex items-center gap-1.5">
                      <Truck className="w-3.5 h-3.5 text-[#ff544b]" />
                      <span>Envio: <strong className="text-white">{order.shippingMethod}</strong></span>
                    </span>
                    <span className="font-bold text-white">
                      {order.shippingCost === 0 ? (
                        <span className="text-emerald-400">Frete Grátis</span>
                      ) : (
                        `Frete: R$ ${order.shippingCost?.toFixed(2)}`
                      )}
                    </span>
                  </div>
                )}

                {order.shippingAddress?.street && (
                  <div className="font-mono text-[11px] text-gray-400 flex items-center gap-1.5 px-1">
                    <MapPin className="w-3.5 h-3.5 text-gray-500 flex-shrink-0" />
                    <span>
                      Entrega: {order.shippingAddress.street}, {order.shippingAddress.number}
                      {order.shippingAddress.complement ? ` (${order.shippingAddress.complement})` : ''} - {order.shippingAddress.neighborhood}, {order.shippingAddress.city}/{order.shippingAddress.state} - CEP {order.shippingAddress.cep}
                    </span>
                  </div>
                )}

                {/* Subtotal & Totals Bar */}
                <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-2 border-t border-[#2a2a2a] pt-3 font-mono text-xs">
                  <span className="text-gray-400 flex items-center gap-1.5">
                    <User className="w-3.5 h-3.5 text-[#ff544b]" />
                    Cliente: <strong className="text-white">{order.customerName}</strong> ({order.customerEmail})
                  </span>
                  <div className="flex items-center gap-3">
                    {order.discount > 0 && (
                      <span className="text-emerald-400 text-xs">
                        Desconto PIX: -R$ {order.discount.toFixed(2)}
                      </span>
                    )}
                    <span className="text-lg font-bold text-[#ff544b]">
                      Total: R$ {order.total.toFixed(2)}
                    </span>
                  </div>
                </div>

                {/* ========================================================================= */}
                {/* SEÇÃO DE GESTÃO DO PEDIDO PELO CLIENTE (ENTREGUE / CANCELAR / HISTÓRICO) */}
                {/* ========================================================================= */}
                <div className="mt-4 pt-3 border-t border-[#2d2c2c] flex flex-col gap-3 bg-[#131313] -mx-6 -mb-6 p-4 rounded-b-lg">
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                    {/* Informação de Status para o Cliente */}
                    <div className="text-xs font-mono text-gray-400 flex items-center gap-2">
                      {isUnpaid ? (
                        <span className="text-amber-400 flex items-center gap-1.5">
                          <AlertTriangle className="w-4 h-4 text-amber-400 shrink-0" />
                          <span>Pedido não pago: você pode cancelar ou excluir este pedido a qualquer momento.</span>
                        </span>
                      ) : isCancelled ? (
                        <span className="text-gray-400 flex items-center gap-1.5">
                          <XCircle className="w-4 h-4 text-red-400 shrink-0" />
                          <span>Pedido cancelado. Itens já foram devolvidos ao estoque da loja.</span>
                        </span>
                      ) : order.status === 'Entregue' ? (
                        <span className="text-emerald-400 flex items-center gap-1.5 font-bold">
                          <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
                          <span>Pedido entregue e finalizado com sucesso!</span>
                        </span>
                      ) : order.status === 'Enviado' ? (
                        <span className="text-blue-400 flex items-center gap-1.5 font-bold">
                          <Truck className="w-4 h-4 text-blue-400 shrink-0" />
                          <span>Pacote a caminho! Confirme o recebimento assim que a entrega for feita.</span>
                        </span>
                      ) : (
                        <span className="text-emerald-400 flex items-center gap-1.5">
                          <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
                          <span>Pagamento confirmado. Pedido sendo preparado para envio.</span>
                        </span>
                      )}
                    </div>

                    {/* Ações disponíveis de acordo com o status */}
                    <div className="flex flex-wrap items-center gap-2 self-end sm:self-auto shrink-0">
                      {/* Botão para Rastrear Histórico de Estados */}
                      <button
                        type="button"
                        onClick={() =>
                          setExpandedHistoryOrderId(
                            expandedHistoryOrderId === order.id ? null : order.id
                          )
                        }
                        className="px-3 py-1.5 bg-[#201f1f] hover:bg-[#2e2d2d] border border-[#353534] text-gray-300 hover:text-white font-mono text-xs rounded flex items-center gap-1.5 transition-colors"
                        title="Ver histórico de alterações e linha do tempo deste pedido"
                      >
                        <Clock className="w-3.5 h-3.5 text-blue-400" />
                        <span>
                          {expandedHistoryOrderId === order.id
                            ? 'Ocultar Histórico'
                            : `Histórico (${order.statusHistory?.length || 1})`}
                        </span>
                      </button>

                      {/* Botão de Confirmação de Entrega pelo Cliente */}
                      {order.status === 'Enviado' && (
                        <button
                          type="button"
                          onClick={() => {
                            setOrderToConfirmDelivery(order);
                            setDeliveryNotes('');
                          }}
                          id={`btn-confirmar-entrega-${order.id}`}
                          className="px-4 py-2 bg-emerald-600 hover:bg-emerald-500 text-white font-mono text-xs uppercase font-bold rounded transition-all flex items-center gap-1.5 shadow-lg active:scale-95 animate-pulse"
                          title="Confirmar que você recebeu o pedido no seu endereço e finalizar"
                        >
                          <PackageCheck className="w-4 h-4" />
                          <span>Marcar como Entregue</span>
                        </button>
                      )}

                      {/* Botão Cancelar Pedido (se ainda não pago) */}
                      {isUnpaid && (
                        <button
                          type="button"
                          onClick={() => setOrderToCancel(order)}
                          id={`btn-cancelar-pedido-${order.id}`}
                          className="px-3.5 py-2 bg-amber-500/10 hover:bg-amber-500 hover:text-black border border-amber-500/40 text-amber-300 font-mono text-xs uppercase font-bold rounded transition-all flex items-center gap-1.5 shadow-sm active:scale-95"
                          title="Cancelar este pedido e devolver os itens ao estoque"
                        >
                          <XCircle className="w-3.5 h-3.5" />
                          Cancelar Pedido
                        </button>
                      )}

                      {/* Botão Excluir Pedido (se não pago ou se já cancelado) */}
                      {(isUnpaid || isCancelled) && (
                        <button
                          type="button"
                          onClick={() => setOrderToDelete(order)}
                          id={`btn-excluir-pedido-${order.id}`}
                          className="px-3.5 py-2 bg-red-950/40 hover:bg-red-600 hover:text-white border border-red-800/60 text-red-300 font-mono text-xs uppercase font-bold rounded transition-all flex items-center gap-1.5 shadow-sm active:scale-95"
                          title={
                            isCancelled
                              ? 'Excluir registro cancelado do histórico'
                              : 'Excluir definitivamente este pedido pendente'
                          }
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                          {isCancelled ? 'Excluir Registro' : 'Excluir Pedido'}
                        </button>
                      )}
                    </div>
                  </div>

                  {/* Linha do Tempo Detalhada Expandida */}
                  {expandedHistoryOrderId === order.id && (
                    <div className="mt-3 pt-3 border-t border-[#2d2c2c] bg-[#1a1919] p-4 rounded-lg space-y-3">
                      <div className="flex items-center justify-between text-xs font-mono font-bold text-gray-300 uppercase">
                        <span className="flex items-center gap-1.5 text-blue-400">
                          <Clock className="w-3.5 h-3.5" />
                          Linha do Tempo e Estados do Pedido
                        </span>
                        <span className="text-[10px] text-gray-500">
                          {order.statusHistory?.length || 1} registros gravados
                        </span>
                      </div>

                      <div className="relative pl-5 space-y-4 before:absolute before:left-2 before:top-2 before:bottom-2 before:w-0.5 before:bg-[#353534]">
                        {(!order.statusHistory || order.statusHistory.length === 0) ? (
                          <div className="relative">
                            <div className="absolute -left-5 top-1 w-4 h-4 rounded-full bg-blue-500 border border-[#1a1919]" />
                            <div className="text-xs">
                              <span className="font-bold text-white uppercase">{order.status}</span>
                              <span className="text-gray-400 font-mono text-[11px] block">{order.date}</span>
                              <p className="text-[11px] text-gray-400 mt-0.5">Pedido criado no sistema.</p>
                            </div>
                          </div>
                        ) : (
                          order.statusHistory.map((item, idx) => {
                            const isLatest = idx === order.statusHistory!.length - 1;
                            const isDelivered = item.status === 'Entregue';
                            const isCancel = item.status === 'Cancelado';

                            return (
                              <div key={item.id || idx} className="relative text-xs">
                                <div
                                  className={`absolute -left-5 top-1 w-4 h-4 rounded-full border border-[#1a1919] flex items-center justify-center ${
                                    isDelivered
                                      ? 'bg-emerald-500'
                                      : isCancel
                                      ? 'bg-red-500'
                                      : isLatest
                                      ? 'bg-[#ff544b]'
                                      : 'bg-blue-500'
                                  }`}
                                >
                                  <div className="w-1.5 h-1.5 rounded-full bg-white" />
                                </div>

                                <div className="bg-[#201f1f] border border-[#2e2d2d] p-3 rounded space-y-1">
                                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-1">
                                    <span
                                      className={`font-mono font-bold text-xs uppercase ${
                                        isDelivered
                                          ? 'text-emerald-400'
                                          : isCancel
                                          ? 'text-red-400'
                                          : 'text-white'
                                      }`}
                                    >
                                      {item.status}
                                    </span>
                                    <span className="text-[10px] text-gray-400 font-mono">
                                      {item.formattedDate || new Date(item.timestamp).toLocaleString('pt-BR')}
                                    </span>
                                  </div>

                                  {item.notes && (
                                    <p className="text-[11px] text-gray-300">{item.notes}</p>
                                  )}

                                  <div className="text-[10px] text-gray-500 font-mono pt-1">
                                    Registrado por:{' '}
                                    <strong className="text-gray-400 capitalize">
                                      {item.updatedBy === 'customer'
                                        ? 'Você (Cliente)'
                                        : item.updatedBy === 'admin'
                                        ? 'Equipe Florishop'
                                        : 'Sistema Automático'}
                                    </strong>
                                  </div>
                                </div>
                              </div>
                            );
                          })
                        )}
                      </div>
                    </div>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )) : (
        /* HISTÓRICO DE COMPRAS (COMPRAS ENTREGUES E FINALIZADAS) */
        allCompletedPurchases.length === 0 ? (
          <div className="bg-[#181717] border border-[#353534] p-12 text-center rounded space-y-4">
            <CheckCircle2 className="w-12 h-12 text-emerald-500 mx-auto opacity-80" />
            <h3 className="font-display text-xl font-bold text-white uppercase">
              Nenhuma compra finalizada no histórico ainda
            </h3>
            <p className="font-sans text-xs text-gray-400 max-w-md mx-auto">
              Assim que um pedido for entregue e concluído, ele sairá dos pedidos em andamento e ficará registrado aqui permanentemente com todos os detalhes fiscais, produtos e comprovante de entrega na tabela <strong className="text-emerald-400">user_purchase_history</strong>.
            </p>
            {activeOrders.length > 0 && (
              <div className="pt-2">
                <button
                  onClick={() => setActiveSubTab('ativos')}
                  className="px-6 py-2.5 bg-[#201f1f] border border-[#ff544b] text-[#ffb4ab] font-mono text-xs uppercase font-bold rounded hover:bg-[#ff544b] hover:text-white transition-colors"
                >
                  Ver Pedidos em Andamento ({activeOrders.length})
                </button>
              </div>
            )}
          </div>
        ) : (
          <div className="space-y-6">
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2 bg-[#17231c] border border-emerald-500/30 p-3.5 rounded font-mono text-xs text-emerald-200">
              <div className="flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
                <span>
                  <strong>{allCompletedPurchases.length} {allCompletedPurchases.length === 1 ? 'Compra Concluída' : 'Compras Concluídas'}:</strong> Todos os pedidos com status &quot;Entregue&quot; são arquivados permanentemente nesta tabela para sua conferência e garantia.
                </span>
              </div>
              <div className="flex items-center gap-1.5 text-[11px] bg-[#121c16] px-2.5 py-1 rounded border border-emerald-500/40 text-emerald-400 shrink-0">
                <Database className="w-3.5 h-3.5" />
                <span>Tabela: user_purchase_history</span>
              </div>
            </div>

            {allCompletedPurchases.map((record) => {
              return (
                <div
                  key={record.id || record.orderId}
                  className="bg-[#181717] border border-emerald-500/40 rounded-lg p-6 space-y-5 transition-all shadow-lg hover:border-emerald-500"
                >
                  {/* Top Info Bar */}
                  <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-2 border-b border-[#2a2a2a] pb-3">
                    <div>
                      <div className="flex flex-wrap items-center gap-2">
                        <span className="font-mono text-xs text-emerald-400 font-bold block">
                          PEDIDO FINALIZADO #{record.orderId}
                        </span>
                        {record.trackingCode && (
                          <span className="px-2 py-0.5 rounded bg-blue-950/60 border border-blue-600/40 text-blue-300 font-mono text-[10px] font-bold flex items-center gap-1">
                            <Truck className="w-3 h-3 text-blue-400" />
                            Rastreio: {record.trackingCode}
                          </span>
                        )}
                        <span className="px-2 py-0.5 rounded bg-emerald-950/60 border border-emerald-600/40 text-emerald-300 font-mono text-[10px] font-bold flex items-center gap-1">
                          <Database className="w-3 h-3 text-emerald-400" />
                          user_purchase_history
                        </span>
                      </div>
                      <div className="flex flex-wrap items-center gap-3 font-mono text-[11px] text-gray-400 mt-0.5">
                        <span>Data do pedido: {record.orderDate}</span>
                        <span>&bull;</span>
                        <span className="text-emerald-400 flex items-center gap-1">
                          <Check className="w-3 h-3" /> Concluído/Entregue em: {new Date(record.completedAt).toLocaleDateString('pt-BR')} {new Date(record.completedAt).toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' })}
                        </span>
                      </div>
                    </div>

                    <div className="flex flex-wrap items-center gap-2 font-mono text-xs">
                      {/* Payment Method Badge */}
                      <span className="px-2.5 py-1 bg-[#201f1f] text-gray-300 border border-[#333] rounded font-bold uppercase flex items-center gap-1.5">
                        {record.paymentMethod === 'pix' && <QrCode className="w-3.5 h-3.5 text-emerald-400" />}
                        {record.paymentMethod === 'maquininha' && <CreditCard className="w-3.5 h-3.5 text-[#ff544b]" />}
                        {record.paymentMethod === 'deposito' && <Building2 className="w-3.5 h-3.5 text-amber-400" />}
                        {record.paymentMethod === 'pix' ? 'PIX (-5%)' : record.paymentMethod === 'maquininha' ? 'Maquininha' : 'Depósito'}
                      </span>

                      {/* Status Badge */}
                      <span className="px-2.5 py-1 bg-emerald-950 text-emerald-300 border border-emerald-500/50 rounded font-bold uppercase flex items-center gap-1.5 text-xs">
                        <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />
                        Entregue &bull; Concluído
                      </span>
                    </div>
                  </div>

                  {/* Itens Comprados */}
                  <div className="space-y-2">
                    <span className="font-mono text-xs text-gray-400 uppercase font-bold block">
                      Produtos Adquiridos ({record.items?.length || 0}):
                    </span>
                    <div className="divide-y divide-[#262626] bg-[#141414] rounded border border-[#2a2a2a]">
                      {record.items && record.items.length > 0 ? (
                        record.items.map((item, idx) => (
                          <div key={idx} className="p-3 flex items-center justify-between gap-4 font-mono text-xs">
                            <div className="flex items-center gap-3">
                              <img
                                src={item.product?.images?.[0] || 'https://images.unsplash.com/photo-1520045892732-304bc3ac5d8e?w=100'}
                                alt={item.product?.name || 'Item de Skate'}
                                className="w-12 h-12 object-cover rounded bg-[#201f1f] border border-[#333]"
                              />
                              <div>
                                <span className="font-bold text-white block">
                                  {item.product?.name || 'Produto Florishop'}
                                </span>
                                <div className="flex items-center gap-2 text-[11px] text-gray-400 mt-0.5">
                                  <span className="text-[#ffb4ab] uppercase">{item.product?.category}</span>
                                  {item.selectedSize && <span>&bull; Tam: {item.selectedSize}</span>}
                                  {item.isGift && (
                                    <span className="bg-amber-500/20 text-amber-300 px-1.5 py-0.2 rounded text-[10px] font-bold">
                                      Brinde
                                    </span>
                                  )}
                                </div>
                              </div>
                            </div>
                            <div className="text-right">
                              <span className="text-gray-400 block text-[11px]">
                                {item.quantity}x R$ {item.product?.salePrice ? item.product.salePrice.toFixed(2) : '0.00'}
                              </span>
                              <span className="font-bold text-white">
                                R$ {((item.product?.salePrice || 0) * item.quantity).toFixed(2)}
                              </span>
                            </div>
                          </div>
                        ))
                      ) : (
                        <div className="p-3 text-xs text-gray-400 font-mono">
                          Itens arquivados no histórico de compra.
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Resumo Financeiro da Compra */}
                  <div className="bg-[#1f1e1e] p-4 rounded border border-[#2d2c2c] grid grid-cols-2 sm:grid-cols-4 gap-4 font-mono text-xs">
                    <div>
                      <span className="text-gray-400 block text-[11px]">Subtotal:</span>
                      <span className="text-white font-bold">
                        R$ {record.subtotal ? record.subtotal.toFixed(2) : record.total.toFixed(2)}
                      </span>
                    </div>
                    <div>
                      <span className="text-gray-400 block text-[11px]">Frete:</span>
                      <span className="text-white font-bold">
                        {record.shippingCost && record.shippingCost > 0 ? `R$ ${record.shippingCost.toFixed(2)}` : 'Grátis'}
                      </span>
                      {record.shippingMethod && (
                        <span className="text-[10px] text-gray-400 block truncate">{record.shippingMethod}</span>
                      )}
                    </div>
                    <div>
                      <span className="text-gray-400 block text-[11px]">Pagamento:</span>
                      <span className="text-emerald-400 font-bold uppercase">{record.paymentMethod}</span>
                    </div>
                    <div>
                      <span className="text-gray-400 block text-[11px]">Total Pago:</span>
                      <span className="text-lg text-[#ff544b] font-bold">R$ {record.total.toFixed(2)}</span>
                    </div>
                  </div>

                  {/* Comentário / Observação da Entrega */}
                  {record.deliveryNotes && (
                    <div className="bg-[#121c16] border border-emerald-500/30 p-3 rounded font-mono text-xs text-emerald-300 flex items-start gap-2">
                      <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
                      <div>
                        <span className="font-bold block">Observação / Confirmação da Entrega:</span>
                        <p className="text-gray-300 text-[11px] mt-0.5">&ldquo;{record.deliveryNotes}&rdquo;</p>
                      </div>
                    </div>
                  )}

                  {/* Footer Buttons for History Record */}
                  <div className="flex flex-wrap items-center justify-between gap-3 pt-2 border-t border-[#262626]">
                    <div className="text-[11px] font-mono text-gray-500 flex items-center gap-1.5">
                      <Database className="w-3.5 h-3.5 text-emerald-500" />
                      <span>Registro permanente #{record.id}</span>
                    </div>

                    <div className="flex items-center gap-2">
                      {record.trackingCode && (
                        <button
                          onClick={() => {
                            navigator.clipboard?.writeText(record.trackingCode!);
                            showToast(`Código ${record.trackingCode} copiado!`);
                          }}
                          className="px-3 py-1.5 bg-[#201f1f] hover:bg-[#2a2929] border border-[#353534] text-gray-300 font-mono text-xs rounded flex items-center gap-1.5"
                        >
                          <Copy className="w-3.5 h-3.5 text-blue-400" />
                          Copiar Rastreio
                        </button>
                      )}
                      <button
                        onClick={() => {
                          if (record.items && record.items.length > 0) {
                            record.items.forEach((it) => {
                              if (it.product) addToCart(it.product, it.quantity);
                            });
                            showToast('Itens adicionados ao seu carrinho!');
                            setActiveTab('checkout');
                          }
                        }}
                        className="px-4 py-1.5 bg-emerald-600 hover:bg-emerald-500 text-white font-mono text-xs font-bold uppercase rounded flex items-center gap-1.5 transition-all shadow"
                      >
                        <ShoppingCart className="w-3.5 h-3.5" />
                        Comprar Novamente
                      </button>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )
      )}

      {/* ========================================================================= */}
      {/* MODAL DE CONFIRMAÇÃO: CANCELAR PEDIDO */}
      {/* ========================================================================= */}
      {orderToCancel && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm">
          <div className="bg-[#181717] border border-amber-500/50 rounded-lg max-w-lg w-full p-6 space-y-5 shadow-2xl animate-in fade-in zoom-in-95">
            <div className="flex items-center justify-between border-b border-[#2d2c2c] pb-3">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-full bg-amber-500/10 border border-amber-500/40 flex items-center justify-center text-amber-400">
                  <XCircle className="w-6 h-6" />
                </div>
                <div>
                  <h3 className="font-display text-lg font-bold text-white uppercase">
                    Cancelar Pedido #{orderToCancel.id}
                  </h3>
                  <span className="font-mono text-xs text-gray-400">
                    Total do Pedido: R$ {orderToCancel.total.toFixed(2)}
                  </span>
                </div>
              </div>
              <button
                onClick={() => setOrderToCancel(null)}
                className="text-gray-400 hover:text-white transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="space-y-4 font-mono text-xs text-gray-300">
              <div className="p-3 bg-amber-950/20 border border-amber-500/30 rounded text-amber-200">
                <p className="flex items-center gap-2 font-bold mb-1">
                  <AlertTriangle className="w-4 h-4 text-amber-400" />
                  Atenção sobre o cancelamento:
                </p>
                <p className="text-[11px] text-gray-300 leading-relaxed">
                  Como este pedido ainda <strong>não foi pago</strong>, ao confirmar o cancelamento:
                </p>
                <ul className="list-disc list-inside mt-1 text-[11px] text-gray-400 space-y-0.5">
                  <li>O status mudará imediatamente para <strong>Cancelado</strong>;</li>
                  <li>Os produtos reservados retornarão automaticamente para o estoque da loja;</li>
                  <li>Nenhuma cobrança será realizada.</li>
                </ul>
              </div>

              {/* Seletor de Motivo */}
              <div className="space-y-2">
                <label className="text-gray-300 font-bold uppercase block text-[11px]">
                  Selecione o motivo do cancelamento:
                </label>
                <div className="space-y-1.5">
                  {[
                    'Mudei de ideia / desistência',
                    'Vou refazer com outros produtos ou tamanhos',
                    'Desejo alterar a forma de pagamento',
                    'Dificuldade no pagamento (PIX / Cartão)',
                    'Outro'
                  ].map((reason) => (
                    <label
                      key={reason}
                      className={`flex items-center gap-2.5 p-2 rounded cursor-pointer border transition-colors ${
                        selectedReason === reason
                          ? 'bg-[#262117] border-amber-500/60 text-white'
                          : 'bg-[#1f1e1e] border-[#2e2d2d] text-gray-400 hover:text-gray-200'
                      }`}
                    >
                      <input
                        type="radio"
                        name="cancelReason"
                        value={reason}
                        checked={selectedReason === reason}
                        onChange={(e) => setSelectedReason(e.target.value)}
                        className="accent-amber-500"
                      />
                      <span>{reason}</span>
                    </label>
                  ))}
                </div>

                {selectedReason === 'Outro' && (
                  <input
                    type="text"
                    value={customReason}
                    onChange={(e) => setCustomReason(e.target.value)}
                    placeholder="Descreva brevemente o motivo..."
                    className="w-full bg-[#111] border border-[#333] rounded px-3 py-2 text-white font-sans text-xs focus:outline-none focus:border-amber-500 mt-2"
                  />
                )}
              </div>
            </div>

            {/* Footer Buttons */}
            <div className="flex items-center justify-end gap-3 pt-3 border-t border-[#2d2c2c] font-mono text-xs">
              <button
                type="button"
                onClick={() => setOrderToCancel(null)}
                className="px-4 py-2 bg-[#201f1f] hover:bg-[#2d2c2c] text-gray-300 rounded font-bold uppercase"
              >
                Voltar
              </button>
              <button
                type="button"
                onClick={handleConfirmCancel}
                id="btn-confirmar-cancelamento-modal"
                className="px-5 py-2 bg-amber-500 hover:bg-amber-400 text-black font-bold uppercase rounded flex items-center gap-1.5 transition-all shadow-lg active:scale-95"
              >
                <Check className="w-4 h-4" />
                Confirmar Cancelamento
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* MODAL DE CONFIRMAÇÃO: EXCLUIR PEDIDO */}
      {/* ========================================================================= */}
      {orderToDelete && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/85 backdrop-blur-sm">
          <div className="bg-[#181717] border border-red-500/50 rounded-lg max-w-lg w-full p-6 space-y-5 shadow-2xl animate-in fade-in zoom-in-95">
            <div className="flex items-center justify-between border-b border-[#2d2c2c] pb-3">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-full bg-red-950/40 border border-red-500/50 flex items-center justify-center text-red-400">
                  <AlertOctagon className="w-6 h-6" />
                </div>
                <div>
                  <h3 className="font-display text-lg font-bold text-white uppercase">
                    Excluir Pedido #{orderToDelete.id}
                  </h3>
                  <span className="font-mono text-xs text-gray-400">
                    Status Atual: {orderToDelete.status}
                  </span>
                </div>
              </div>
              <button
                onClick={() => setOrderToDelete(null)}
                className="text-gray-400 hover:text-white transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="p-4 bg-red-950/30 border border-red-800/40 rounded space-y-2 font-mono text-xs text-red-200">
              <p className="font-bold flex items-center gap-2">
                <AlertTriangle className="w-4 h-4 text-red-400" />
                Você tem certeza que deseja excluir permanentemente este pedido?
              </p>
              <p className="text-[11px] text-gray-300 leading-relaxed">
                Esta ação removerá o pedido em definitivo da sua lista de pedidos. Se houver itens pendentes em reserva, o estoque será estornado para a loja.
              </p>
            </div>

            {/* Itens do Pedido para Confirmação */}
            <div className="max-h-36 overflow-y-auto space-y-1.5 font-mono text-xs">
              <span className="text-gray-400 text-[10px] uppercase font-bold block">
                Itens neste pedido ({orderToDelete.items.length}):
              </span>
              {orderToDelete.items.map((item, i) => (
                <div key={i} className="flex justify-between items-center bg-[#131313] p-2 rounded text-gray-300">
                  <span>{item.quantity}x {item.product.name}</span>
                  <span className="text-white font-bold">R$ {(item.product.salePrice * item.quantity).toFixed(2)}</span>
                </div>
              ))}
            </div>

            {/* Footer Buttons */}
            <div className="flex items-center justify-end gap-3 pt-3 border-t border-[#2d2c2c] font-mono text-xs">
              <button
                type="button"
                onClick={() => setOrderToDelete(null)}
                className="px-4 py-2 bg-[#201f1f] hover:bg-[#2d2c2c] text-gray-300 rounded font-bold uppercase"
              >
                Cancelar
              </button>
              <button
                type="button"
                onClick={handleConfirmDelete}
                id="btn-confirmar-exclusao-modal"
                className="px-5 py-2 bg-red-600 hover:bg-red-500 text-white font-bold uppercase rounded flex items-center gap-1.5 transition-all shadow-lg active:scale-95"
              >
                <Trash2 className="w-4 h-4" />
                Sim, Excluir Pedido
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* MODAL 3: CONFIRMAR ENTREGA / MARCAR COMO ENTREGUE PELO CLIENTE */}
      {/* ========================================================================= */}
      {orderToConfirmDelivery && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/85 backdrop-blur-sm animate-fadeIn">
          <div className="bg-[#181717] border border-emerald-500/60 rounded-xl max-w-md w-full p-6 space-y-5 shadow-2xl">
            {/* Header */}
            <div className="flex items-center justify-between border-b border-[#2d2c2c] pb-3">
              <div className="flex items-center gap-2.5">
                <div className="w-10 h-10 rounded-full bg-emerald-500/20 border border-emerald-500/50 flex items-center justify-center text-emerald-400">
                  <PackageCheck className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-base font-bold text-white font-mono uppercase">
                    Confirmar Entrega
                  </h3>
                  <span className="text-xs text-gray-400 font-mono">
                    Pedido #{orderToConfirmDelivery.id}
                  </span>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setOrderToConfirmDelivery(null)}
                className="text-gray-400 hover:text-white transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="space-y-4 font-mono text-xs text-gray-300">
              <div className="p-3 bg-emerald-950/20 border border-emerald-500/30 rounded text-emerald-200">
                <p className="flex items-center gap-2 font-bold mb-1 text-emerald-400">
                  <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
                  Finalização do Pedido:
                </p>
                <p className="text-[11px] text-gray-300 leading-relaxed">
                  Você está confirmando que sua encomenda chegou com sucesso no seu endereço.
                </p>
                <ul className="list-disc list-inside mt-1.5 text-[11px] text-gray-400 space-y-0.5">
                  <li>O status do pedido mudará para <strong className="text-emerald-400">Entregue</strong>;</li>
                  <li>Um novo registro será gravado com data, hora e sua confirmação;</li>
                  <li>O pedido será concluído e arquivado no histórico de pedidos entregues.</li>
                </ul>
              </div>

              <div>
                <label className="text-gray-300 font-bold uppercase block text-[11px] mb-1">
                  Comentário ou avaliação (opcional):
                </label>
                <input
                  type="text"
                  value={deliveryNotes}
                  onChange={(e) => setDeliveryNotes(e.target.value)}
                  placeholder="Ex: Recebido em perfeito estado, produto show!"
                  className="w-full bg-[#1c1b1b] border border-[#353534] rounded px-3 py-2 text-xs text-white placeholder-gray-500 focus:outline-none focus:border-emerald-500"
                />
              </div>
            </div>

            {/* Footer Buttons */}
            <div className="flex items-center justify-end gap-3 pt-3 border-t border-[#2d2c2c] font-mono text-xs">
              <button
                type="button"
                onClick={() => setOrderToConfirmDelivery(null)}
                className="px-4 py-2 bg-[#201f1f] hover:bg-[#2d2c2c] text-gray-300 rounded font-bold uppercase"
              >
                Cancelar
              </button>
              <button
                type="button"
                onClick={() => {
                  confirmOrderDelivered(orderToConfirmDelivery.id, deliveryNotes);
                  showToast(`Pedido #${orderToConfirmDelivery.id} marcado como Entregue! Agradecemos sua preferência.`);
                  setOrderToConfirmDelivery(null);
                }}
                id="btn-confirmar-entrega-modal-action"
                className="px-5 py-2 bg-emerald-600 hover:bg-emerald-500 text-white font-bold uppercase rounded flex items-center gap-1.5 transition-all shadow-lg active:scale-95"
              >
                <PackageCheck className="w-4 h-4" />
                Sim, Pedido Foi Entregue
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
