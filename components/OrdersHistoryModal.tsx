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
  Package
} from 'lucide-react';

export const OrdersHistoryModal: React.FC = () => {
  const {
    orders,
    setActiveTab,
    currentUser,
    isAdmin,
    isLoggedIn,
    openAuthModal,
    cancelOrder,
    deleteOrder
  } = useStore();

  // Selected orders for confirmation modals
  const [orderToCancel, setOrderToCancel] = useState<Order | null>(null);
  const [orderToDelete, setOrderToDelete] = useState<Order | null>(null);
  const [selectedReason, setSelectedReason] = useState<string>('Mudei de ideia / desistência');
  const [customReason, setCustomReason] = useState<string>('');

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
      ) : displayedOrders.length === 0 ? (
        <div className="bg-[#181717] border border-[#353534] p-12 text-center rounded space-y-4">
          <ShoppingBag className="w-12 h-12 text-[#ff544b] mx-auto opacity-80" />
          <h3 className="font-display text-xl font-bold text-white uppercase">
            Nenhum pedido realizado ainda
          </h3>
          <p className="font-sans text-xs text-gray-400">
            Quando você concluir um pedido pelo checkout, ele aparecerá aqui com todos os detalhes e comprovante de pagamento.
          </p>
          <button
            onClick={() => setActiveTab('catalog')}
            className="px-6 py-2.5 bg-[#ff544b] text-white font-mono text-xs uppercase font-bold rounded"
          >
            Fazer Minha Primeira Compra
          </button>
        </div>
      ) : (
        <div className="space-y-5">
          {displayedOrders.map((order) => {
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
                {/* SEÇÃO DE GESTÃO DO PEDIDO PELO CLIENTE (CANCELAR / EXCLUIR) */}
                {/* ========================================================================= */}
                <div className="mt-4 pt-3 border-t border-[#2d2c2c] flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-[#131313] -mx-6 -mb-6 p-4 rounded-b-lg">
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
                    ) : (
                      <span className="text-emerald-400 flex items-center gap-1.5">
                        <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
                        <span>Pagamento confirmado. Em caso de dúvidas ou alterações, contate nosso suporte.</span>
                      </span>
                    )}
                  </div>

                  {/* Ações disponíveis de acordo com o status */}
                  <div className="flex items-center gap-2 self-end sm:self-auto shrink-0">
                    {/* Botão Cancelar Pedido (apenas se ainda não pago) */}
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
              </div>
            );
          })}
        </div>
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
    </div>
  );
};
