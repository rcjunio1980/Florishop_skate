'use client';

import React, { useState } from 'react';
import { useStore } from './StoreContext';
import { PaymentMethod, Order } from '@/lib/skate-store';
import {
  Trash2,
  Plus,
  Minus,
  QrCode,
  CreditCard,
  Building2,
  CheckCircle2,
  Copy,
  Upload,
  ArrowRight,
  ShoppingBag,
  Sparkles,
  FileCheck,
  AlertTriangle,
  Info,
  Clock,
  Check,
  Truck,
  MapPin,
  Search,
  RotateCcw,
  Edit3,
  Phone,
  Lock,
  LogIn,
  UserCheck,
  ShieldAlert,
} from 'lucide-react';
import {
  ShippingOption,
  ShippingAddress,
  formatCep,
  cleanCep,
  fetchAddressAndShipping
} from '@/lib/shipping';

export interface MaquininhaRate {
  key: string;
  installments: number; // 0 = Débito, 1 a 12 = Crédito
  label: string;
  interestRate: number; // percentual de juros da maquininha
  isInterestFree: boolean;
}

export const MAQUININHA_RATES: MaquininhaRate[] = [
  { key: 'debito', installments: 0, label: 'Débito à Vista', interestRate: 0, isInterestFree: true },
  { key: '1x', installments: 1, label: '1x no Crédito', interestRate: 0, isInterestFree: true },
  { key: '2x', installments: 2, label: '2x no Crédito', interestRate: 0, isInterestFree: true },
  { key: '3x', installments: 3, label: '3x no Crédito', interestRate: 0, isInterestFree: true },
  { key: '4x', installments: 4, label: '4x no Crédito', interestRate: 0, isInterestFree: true },
  { key: '5x', installments: 5, label: '5x no Crédito (Sem Juros)', interestRate: 0, isInterestFree: true },
  { key: '6x', installments: 6, label: '6x no Crédito (+5,40% juros)', interestRate: 5.4, isInterestFree: false },
  { key: '7x', installments: 7, label: '7x no Crédito (+6,70% juros)', interestRate: 6.7, isInterestFree: false },
  { key: '8x', installments: 8, label: '8x no Crédito (+8,00% juros)', interestRate: 8.0, isInterestFree: false },
  { key: '9x', installments: 9, label: '9x no Crédito (+9,30% juros)', interestRate: 9.3, isInterestFree: false },
  { key: '10x', installments: 10, label: '10x no Crédito (+10,60% juros)', interestRate: 10.6, isInterestFree: false },
  { key: '11x', installments: 11, label: '11x no Crédito (+11,90% juros)', interestRate: 11.9, isInterestFree: false },
  { key: '12x', installments: 12, label: '12x no Crédito (+13,20% juros)', interestRate: 13.2, isInterestFree: false },
];

export const CartCheckoutModal: React.FC = () => {
  const {
    cart,
    removeFromCart,
    updateCartQuantity,
    clearCart,
    processCheckout,
    setActiveTab,
    currentUser,
    isLoggedIn,
    openAuthModal,
  } = useStore();

  const [step, setStep] = useState<'cart' | 'checkout' | 'confirmation'>('cart');
  const [paymentMethod, setPaymentMethod] = useState<PaymentMethod>('pix');
  const [customerName, setCustomerName] = useState(currentUser?.name || '');
  const [customerEmail, setCustomerEmail] = useState(currentUser?.email || '');
  const [customerPhone, setCustomerPhone] = useState(currentUser?.phone || '');
  const [selectedInstallmentKey, setSelectedInstallmentKey] = useState<string>('1x');
  const [receiptAttached, setReceiptAttached] = useState(false);
  const [receiptName, setReceiptName] = useState('');
  const [depositError, setDepositError] = useState('');
  const [completedOrder, setCompletedOrder] = useState<Order | null>(null);
  const [copiedKey, setCopiedKey] = useState(false);

  // Subtotal dos itens no carrinho
  const subtotal = cart.reduce((acc, item) => acc + item.product.salePrice * item.quantity, 0);

  // --- MECANISMO DE FRETE (SABER E COLOCAR O VALOR DO FRETE) ---
  const [cepInput, setCepInput] = useState(currentUser?.address?.cep || '');
  const [isSearchingCep, setIsSearchingCep] = useState(false);
  const [cepError, setCepError] = useState('');
  const [cepCalculated, setCepCalculated] = useState(false);

  // Opções padrão calculadas (inicializadas com base no subtotal)
  const [shippingOptions, setShippingOptions] = useState<ShippingOption[]>([
    {
      id: 'pac',
      name: 'PAC Correios - Convencional',
      carrier: 'Correios',
      price: subtotal >= 250 ? 0 : 22.90,
      originalPrice: subtotal >= 250 ? 22.90 : undefined,
      deadline: '5 a 8 dias úteis',
      isFree: subtotal >= 250,
      tag: subtotal >= 250 ? 'FRETE GRÁTIS' : 'Econômico',
    },
    {
      id: 'sedex',
      name: 'SEDEX Correios - Expresso',
      carrier: 'Correios',
      price: 36.90,
      deadline: '2 a 3 dias úteis',
      tag: 'Mais Rápido',
    },
    {
      id: 'motoboy',
      name: 'Entrega Expressa / Motoboy Local',
      carrier: 'Florishop Express',
      price: 16.00,
      deadline: 'Até 24 horas (mesmo dia)',
      tag: 'Entrega Local',
    },
    {
      id: 'retirada',
      name: 'Retirada no Skatepark / Loja Física',
      carrier: 'Florishop Skate',
      price: 0,
      deadline: 'Disponível em até 2 horas',
      isFree: true,
      tag: 'Sem Custo de Envio',
    },
  ]);

  // ID da opção de frete selecionada
  const [selectedShippingId, setSelectedShippingId] = useState<string>('pac');

  // Modo de frete manual ("Colocar o valor do frete manualmente")
  const [isManualShipping, setIsManualShipping] = useState<boolean>(false);
  const [manualShippingPrice, setManualShippingPrice] = useState<string>('20.00');
  const [manualShippingNote, setManualShippingNote] = useState<string>('Frete Combinado / Personalizado');

  // Endereço de entrega
  const [shippingAddress, setShippingAddress] = useState<ShippingAddress>({
    cep: currentUser?.address?.cep || '',
    street: currentUser?.address?.street || '',
    number: currentUser?.address?.number || '',
    complement: currentUser?.address?.complement || '',
    neighborhood: currentUser?.address?.neighborhood || '',
    city: currentUser?.address?.city || '',
    state: currentUser?.address?.state || '',
  });

  // Sync customer data when logged-in user changes during render
  const [prevUserId, setPrevUserId] = useState<string | undefined>(currentUser?.id);
  if (currentUser && currentUser.id !== prevUserId) {
    setPrevUserId(currentUser.id);
    setCustomerName(currentUser.name);
    setCustomerEmail(currentUser.email);
    if (currentUser.phone) setCustomerPhone(currentUser.phone);
    if (currentUser.address) {
      setShippingAddress({
        cep: currentUser.address.cep || '',
        street: currentUser.address.street || '',
        number: currentUser.address.number || '',
        complement: currentUser.address.complement || '',
        neighborhood: currentUser.address.neighborhood || '',
        city: currentUser.address.city || '',
        state: currentUser.address.state || '',
      });
      if (currentUser.address.cep) {
        setCepInput(currentUser.address.cep);
      }
    }
  }

  // Função para consultar CEP e recalcular frete ("Saber o frete")
  const handleSearchCep = async (overrideCep?: string) => {
    const raw = overrideCep !== undefined ? overrideCep : cepInput;
    const digits = cleanCep(raw);

    if (digits.length !== 8) {
      setCepError('Digite um CEP válido com 8 dígitos (ex: 88010-000).');
      return;
    }

    setCepError('');
    setIsSearchingCep(true);

    try {
      const result = await fetchAddressAndShipping(digits, subtotal);
      setShippingOptions(result.options);
      setCepCalculated(true);

      // Preenche os dados de endereço encontrados
      setShippingAddress((prev) => ({
        ...prev,
        cep: formatCep(digits),
        street: result.address.street || prev.street,
        neighborhood: result.address.neighborhood || prev.neighborhood,
        city: result.address.city || prev.city,
        state: result.address.state || prev.state,
      }));

      // Seleciona PAC por padrão (ou mantém a seleção se válida)
      if (!isManualShipping) {
        setSelectedShippingId(result.options[0]?.id || 'pac');
      }
    } catch {
      setCepError('Não foi possível consultar os Correios no momento. Você também pode colocar o valor manual do frete.');
    } finally {
      setIsSearchingCep(false);
    }
  };

  // Valor final do frete baseado na seleção do usuário
  const activeOption = shippingOptions.find((opt) => opt.id === selectedShippingId) || shippingOptions[0];
  
  const currentShippingCost: number = isManualShipping
    ? Math.max(0, parseFloat(manualShippingPrice) || 0)
    : activeOption?.price ?? 0;

  const currentShippingName: string = isManualShipping
    ? (manualShippingNote ? `Manual (${manualShippingNote})` : 'Frete Manual')
    : (activeOption?.name || 'Frete Padrão');

  const currentShippingDeadline: string = isManualShipping
    ? 'A combinar com a loja'
    : (activeOption?.deadline || 'Consulte');

  // Totais atualizados com o frete em TODOS os métodos de pagamento
  const shippingCost = currentShippingCost;
  const baseOrderTotal = subtotal + shippingCost;

  // 1. PIX: 5% de desconto à vista sobre os produtos
  const pixDiscount = paymentMethod === 'pix' ? subtotal * 0.05 : 0;

  // 2. Maquininha: 1x a 5x sem juros (0%), 6x a 12x com juros da operadora (aplicado sobre baseOrderTotal)
  const selectedRate = MAQUININHA_RATES.find((r) => r.key === selectedInstallmentKey) || MAQUININHA_RATES[1];
  const cardInterestAmount =
    paymentMethod === 'maquininha' && !selectedRate.isInterestFree
      ? Number(((baseOrderTotal * selectedRate.interestRate) / 100).toFixed(2))
      : 0;

  // Total final conforme o método de pagamento selecionado
  const finalTotal =
    paymentMethod === 'pix'
      ? subtotal - pixDiscount + shippingCost
      : paymentMethod === 'maquininha'
      ? baseOrderTotal + cardInterestAmount
      : baseOrderTotal;

  const installmentAmount =
    selectedRate.installments > 0 ? finalTotal / selectedRate.installments : finalTotal;

  const handleCopyPix = () => {
    navigator.clipboard.writeText('00020126580014BR.GOV.BCB.PIX0136florishop-skate-pix-key-2026');
    setCopiedKey(true);
    setTimeout(() => setCopiedKey(false), 2500);
  };

  const handleSimulateFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      setReceiptAttached(true);
      setReceiptName(e.target.files[0].name);
      setDepositError('');
    }
  };

  const handleFinishOrder = (e: React.FormEvent) => {
    e.preventDefault();
    setDepositError('');

    // Regra fundamental: Compra só permitida para usuários logados
    if (!isLoggedIn) {
      openAuthModal('login');
      return;
    }

    if (!customerName.trim() || !customerEmail.trim()) {
      alert('Por favor, preencha o seu nome e e-mail para acompanhar o pedido.');
      return;
    }

    // Validação de endereço se não for retirada na loja
    if (selectedShippingId !== 'retirada' && !isManualShipping) {
      if (!shippingAddress.street.trim() || !shippingAddress.number.trim()) {
        alert('Por favor, informe a Rua e o Número para a entrega dos seus produtos.');
        return;
      }
    }

    // Regra estrita: No Depósito, o comprovante anexado é OBRIGATÓRIO para a liberação da compra
    if (paymentMethod === 'deposito' && !receiptAttached) {
      setDepositError(
        'Atenção: Para prosseguir com o pagamento por Depósito Bancário, é obrigatório anexar o comprovante de depósito ou transferência. A compra só poderá ser liberada e despachada após o envio e validação do comprovante.'
      );
      return;
    }

    const cardInstallmentSummary =
      paymentMethod === 'maquininha'
        ? selectedRate.installments === 0
          ? `Débito à Vista - R$ ${finalTotal.toFixed(2)} (com frete incluso)`
          : `${selectedRate.installments}x de R$ ${installmentAmount.toFixed(2)} ${
              selectedRate.isInterestFree
                ? '(Sem juros - até 5x - com frete)'
                : `(com juros da operadora +${selectedRate.interestRate}% - total R$ ${finalTotal.toFixed(2)})`
            }`
        : undefined;

    const order = processCheckout(
      customerName,
      customerEmail,
      paymentMethod,
      {
        pixKey:
          paymentMethod === 'pix'
            ? '00020126580014BR.GOV.BCB.PIX0136florishop-skate-pix-key-2026'
            : undefined,
        cardInstallments: cardInstallmentSummary,
        cardInterestRate: paymentMethod === 'maquininha' ? selectedRate.interestRate : undefined,
        receiptAttached,
        receiptName: receiptName || (receiptAttached ? 'Comprovante_Deposito.pdf' : undefined),
      },
      {
        subtotal,
        discount: pixDiscount,
        interest: cardInterestAmount,
        shippingCost,
        shippingMethod: `${currentShippingName} (${currentShippingDeadline})`,
        shippingAddress: {
          cep: shippingAddress.cep || cepInput,
          street: shippingAddress.street,
          number: shippingAddress.number,
          neighborhood: shippingAddress.neighborhood,
          city: shippingAddress.city,
          state: shippingAddress.state,
          complement: shippingAddress.complement,
        },
        total: finalTotal,
      }
    );

    if (order) {
      setCompletedOrder(order);
      setStep('confirmation');
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
  };

  if (cart.length === 0 && step !== 'confirmation') {
    return (
      <div className="max-w-4xl mx-auto px-4 py-20 text-center">
        <div className="bg-[#181717] border border-[#353534] p-12 rounded">
          <ShoppingBag className="w-16 h-16 text-[#ff544b] mx-auto mb-4 opacity-80" />
          <h2 className="font-display text-3xl font-extrabold text-white uppercase mb-2">
            Seu Carrinho está Vazio
          </h2>
          <p className="font-sans text-sm text-gray-400 mb-6">
            Adicione shapes, trucks, rodas, vestuário ou tênis para montar o seu kit de skate.
          </p>
          <button
            onClick={() => setActiveTab('catalog')}
            className="px-8 py-3 bg-[#ff544b] text-white font-mono font-bold text-xs uppercase tracking-wider hover:bg-white hover:text-black transition-colors rounded"
          >
            Ir para a Loja
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 md:px-12 py-10">
      {/* Progress Steps Header */}
      <div className="flex items-center justify-center gap-4 mb-8 font-mono text-xs uppercase font-bold">
        <button
          onClick={() => setStep('cart')}
          className={`flex items-center gap-2 px-3 py-1.5 rounded ${
            step === 'cart' ? 'bg-[#ff544b] text-white' : 'text-gray-400 bg-[#201f1f]'
          }`}
        >
          1. Carrinho ({cart.reduce((a, b) => a + b.quantity, 0)})
        </button>
        <span className="text-gray-600">&rarr;</span>
        <button
          onClick={() => cart.length > 0 && setStep('checkout')}
          disabled={cart.length === 0}
          className={`flex items-center gap-2 px-3 py-1.5 rounded ${
            step === 'checkout' ? 'bg-[#ff544b] text-white' : 'text-gray-400 bg-[#201f1f]'
          }`}
        >
          2. Pagamento &amp; Endereço
        </button>
        <span className="text-gray-600">&rarr;</span>
        <span
          className={`flex items-center gap-2 px-3 py-1.5 rounded ${
            step === 'confirmation' ? 'bg-emerald-600 text-white' : 'text-gray-600 bg-[#1c1b1b]'
          }`}
        >
          3. Confirmação
        </span>
      </div>

      {/* STEP 1: CARRINHO */}
      {step === 'cart' && (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Cart Items List */}
          <div className="lg:col-span-2 space-y-4">
            <h2 className="font-display text-2xl font-extrabold text-white uppercase border-b border-[#353534] pb-3">
              Itens no <span className="text-[#ff544b]">Carrinho</span>
            </h2>

            {cart.map((item, idx) => (
              <div
                key={`${item.product.id}-${item.selectedSize}-${idx}`}
                className="bg-[#181717] border border-[#353534] p-4 rounded flex flex-col sm:flex-row items-center gap-4 justify-between"
              >
                <div className="flex items-center gap-4 w-full sm:w-auto">
                  <div className="w-20 h-20 bg-[#201f1f] border border-[#333] p-2 rounded flex-shrink-0 flex items-center justify-center">
                    <img
                      src={item.product.images[0]}
                      alt={item.product.name}
                      className="max-h-full max-w-full object-contain"
                    />
                  </div>

                  <div>
                    <span className="font-mono text-[10px] text-[#ffb4ab] uppercase">
                      {item.product.brand} {item.selectedSize && `| Medida: ${item.selectedSize}`}
                    </span>
                    <h3 className="font-mono text-sm font-bold text-white uppercase line-clamp-1">
                      {item.product.name}
                    </h3>
                    <span className="font-mono text-xs text-[#ff544b] font-bold">
                      R$ {item.product.salePrice.toFixed(2)} cada
                    </span>
                  </div>
                </div>

                {/* Controls */}
                <div className="flex items-center gap-6 justify-between w-full sm:w-auto">
                  <div className="flex items-center bg-[#201f1f] border border-[#353534] rounded">
                    <button
                      onClick={() =>
                        updateCartQuantity(item.product.id, item.quantity - 1, item.selectedSize)
                      }
                      className="p-1.5 text-gray-300 hover:text-white"
                      title="Diminuir quantidade"
                    >
                      <Minus className="w-3.5 h-3.5" />
                    </button>
                    <span className="font-mono text-xs font-bold text-white px-3">{item.quantity}</span>
                    <button
                      onClick={() =>
                        updateCartQuantity(item.product.id, item.quantity + 1, item.selectedSize)
                      }
                      className="p-1.5 text-gray-300 hover:text-white"
                      title="Aumentar quantidade"
                    >
                      <Plus className="w-3.5 h-3.5" />
                    </button>
                  </div>

                  <span className="font-mono text-sm font-bold text-white w-24 text-right">
                    R$ {(item.product.salePrice * item.quantity).toFixed(2)}
                  </span>

                  <button
                    onClick={() => removeFromCart(item.product.id, item.selectedSize)}
                    className="text-gray-500 hover:text-[#ff544b] p-1.5"
                    title="Remover produto"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>
            ))}

            <div className="flex justify-between items-center pt-2">
              <button
                onClick={clearCart}
                className="font-mono text-xs text-gray-400 hover:text-[#ff544b] underline uppercase"
              >
                Esvaziar Carrinho
              </button>
              <button
                onClick={() => setActiveTab('catalog')}
                className="font-mono text-xs text-[#ffb4ab] hover:underline uppercase font-bold"
              >
                + Adicionar Mais Peças
              </button>
            </div>
          </div>

          {/* Summary Box & Shipping Calculator */}
          <div className="bg-[#181717] border border-[#353534] p-6 rounded h-fit space-y-5">
            <h3 className="font-mono text-sm font-bold text-white uppercase border-b border-[#2a2a2a] pb-3 flex items-center justify-between">
              <span>Resumo do Pedido</span>
              <span className="text-[10px] text-gray-400 font-normal">{cart.reduce((a, b) => a + b.quantity, 0)} itens</span>
            </h3>

            {/* MECANISMO NO CARRINHO: SABER OU COLOCAR FRETE */}
            <div className="bg-[#201f1f] p-3.5 rounded border border-[#2d2c2c] space-y-3">
              <div className="flex items-center justify-between">
                <span className="font-mono text-xs font-bold text-white uppercase flex items-center gap-1.5">
                  <Truck className="w-4 h-4 text-[#ff544b]" />
                  Frete &amp; Envio:
                </span>
                <button
                  type="button"
                  onClick={() => setIsManualShipping(!isManualShipping)}
                  className="font-mono text-[10px] text-[#ffb4ab] hover:underline flex items-center gap-1"
                >
                  <Edit3 className="w-3 h-3" />
                  {isManualShipping ? 'Calcular por CEP' : 'Colocar Valor Manual'}
                </button>
              </div>

              {!isManualShipping ? (
                /* Saber o frete por CEP */
                <div className="space-y-2">
                  <div className="flex gap-2">
                    <input
                      type="text"
                      placeholder="00000-000"
                      maxLength={9}
                      value={cepInput}
                      onChange={(e) => setCepInput(formatCep(e.target.value))}
                      onKeyDown={(e) => e.key === 'Enter' && handleSearchCep()}
                      className="w-full bg-[#131313] border border-[#353534] text-xs text-white px-3 py-2 rounded font-mono focus:outline-none focus:border-[#ff544b]"
                    />
                    <button
                      type="button"
                      onClick={() => handleSearchCep()}
                      disabled={isSearchingCep}
                      className="px-3 py-2 bg-[#ff544b] text-white font-mono text-xs uppercase font-bold rounded hover:bg-white hover:text-black flex items-center gap-1 flex-shrink-0 transition-colors"
                    >
                      {isSearchingCep ? <RotateCcw className="w-3.5 h-3.5 animate-spin" /> : <Search className="w-3.5 h-3.5" />}
                      Calcular
                    </button>
                  </div>

                  {cepError && (
                    <p className="font-mono text-[10px] text-red-400">{cepError}</p>
                  )}

                  {/* Seletor rápido de opções de frete calculadas */}
                  <div className="space-y-1.5 pt-1">
                    {shippingOptions.map((opt) => (
                      <label
                        key={opt.id}
                        onClick={() => setSelectedShippingId(opt.id)}
                        className={`flex items-center justify-between p-2 rounded border cursor-pointer font-mono text-xs transition-colors ${
                          selectedShippingId === opt.id
                            ? 'bg-[#181717] border-[#ff544b] text-white'
                            : 'bg-[#131313] border-[#2d2c2c] text-gray-400 hover:text-white'
                        }`}
                      >
                        <div className="flex items-center gap-2">
                          <input
                            type="radio"
                            name="cartShipping"
                            checked={selectedShippingId === opt.id}
                            onChange={() => setSelectedShippingId(opt.id)}
                            className="accent-[#ff544b]"
                          />
                          <div>
                            <span className="font-bold text-[11px] block text-white">{opt.name}</span>
                            <span className="text-[10px] text-gray-400 block">{opt.deadline}</span>
                          </div>
                        </div>
                        <span className="font-bold">
                          {opt.price === 0 ? (
                            <span className="text-emerald-400">GRÁTIS</span>
                          ) : (
                            `R$ ${opt.price.toFixed(2)}`
                          )}
                        </span>
                      </label>
                    ))}
                  </div>
                </div>
              ) : (
                /* Colocar o frete manualmente */
                <div className="space-y-2 bg-[#181717] p-3 rounded border border-[#ff544b]/40">
                  <div>
                    <label className="font-mono text-[11px] text-gray-300 block mb-1">
                      Colocar Valor do Frete (R$):
                    </label>
                    <div className="flex items-center gap-2">
                      <span className="font-mono text-xs text-gray-400">R$</span>
                      <input
                        type="number"
                        min="0"
                        step="0.50"
                        value={manualShippingPrice}
                        onChange={(e) => setManualShippingPrice(e.target.value)}
                        placeholder="20.00"
                        className="w-full bg-[#131313] border border-[#ff544b]/50 text-xs text-white px-3 py-2 rounded font-mono font-bold focus:outline-none focus:border-[#ff544b]"
                      />
                    </div>
                  </div>
                  <div>
                    <label className="font-mono text-[11px] text-gray-400 block mb-1">
                      Observação / Identificação do Frete:
                    </label>
                    <input
                      type="text"
                      value={manualShippingNote}
                      onChange={(e) => setManualShippingNote(e.target.value)}
                      placeholder="Ex: Frete combinado, Jadlog, etc."
                      className="w-full bg-[#131313] border border-[#353534] text-xs text-gray-300 px-3 py-1.5 rounded font-mono focus:outline-none focus:border-[#ff544b]"
                    />
                  </div>
                  <p className="font-mono text-[10px] text-emerald-400">
                    Valor manual ativo e aplicado a todos os pagamentos.
                  </p>
                </div>
              )}
            </div>

            {/* Subtotais e Linhas de Preço */}
            <div className="space-y-2 font-mono text-xs">
              <div className="flex justify-between text-gray-300">
                <span>Subtotal dos Produtos:</span>
                <span>R$ {subtotal.toFixed(2)}</span>
              </div>
              <div className="flex justify-between items-center text-gray-300">
                <span className="flex items-center gap-1">
                  Frete ({currentShippingName}):
                </span>
                <span className={shippingCost === 0 ? 'text-emerald-400 font-bold' : 'text-white font-bold'}>
                  {shippingCost === 0 ? 'GRÁTIS' : `R$ ${shippingCost.toFixed(2)}`}
                </span>
              </div>
            </div>

            {/* Benefícios dos Meios de Pagamento */}
            <div className="bg-[#201f1f] p-3 rounded border border-[#2d2c2c] space-y-1.5 font-mono text-[11px]">
              <div className="flex items-center justify-between text-emerald-400">
                <span>PIX à vista:</span>
                <span className="font-bold">5% OFF nos produtos (-R$ {(subtotal * 0.05).toFixed(2)})</span>
              </div>
              <div className="flex items-center justify-between text-gray-300">
                <span>Maquininha de Cartão:</span>
                <span className="text-white font-bold">Até 5x SEM JUROS (com frete)</span>
              </div>
            </div>

            <div className="border-t border-[#353534] pt-3 flex justify-between items-center">
              <span className="font-mono text-xs text-white uppercase font-bold">Total Estimado:</span>
              <span className="font-mono text-2xl font-extrabold text-[#ff544b]">
                R$ {(subtotal + shippingCost).toFixed(2)}
              </span>
            </div>

            {/* BOTÃO E BLOQUEIO DE SEGURANÇA: COMPRA SOMENTE COM LOGIN */}
            {!isLoggedIn ? (
              <div className="space-y-3 pt-2">
                <div className="bg-[#2a1715] border-2 border-[#ff544b]/60 p-3.5 rounded space-y-2">
                  <div className="flex items-center gap-2 text-[#ff544b] font-mono font-bold text-xs">
                    <Lock className="w-4 h-4 flex-shrink-0" />
                    <span>LOGIN OBRIGATÓRIO PARA COMPRAR</span>
                  </div>
                  <p className="font-mono text-[11px] text-gray-300 leading-relaxed">
                    Você pode consultar peças, calcular o frete e adicionar produtos ao carrinho livremente. Para efetivar a compra, é obrigatório estar logado com seu usuário e senha.
                  </p>
                </div>

                <button
                  type="button"
                  onClick={() => openAuthModal('login')}
                  id="btn-login-para-comprar"
                  className="w-full py-4 bg-[#ff544b] text-white font-mono font-bold text-xs uppercase tracking-wider hover:bg-white hover:text-black transition-all rounded flex items-center justify-center gap-2 shadow-xl hover:shadow-red-500/20 active:scale-95"
                >
                  <LogIn className="w-4 h-4" /> Entrar / Cadastrar para Comprar
                </button>
              </div>
            ) : (
              <div className="space-y-3 pt-2">
                <div className="bg-[#18261b] border border-emerald-500/40 p-2.5 rounded flex items-center gap-2 font-mono text-[11px] text-emerald-300">
                  <UserCheck className="w-4 h-4 text-emerald-400 flex-shrink-0" />
                  <span className="truncate">
                    Conectado como <strong>{currentUser?.name}</strong>
                  </span>
                </div>

                <button
                  onClick={() => setStep('checkout')}
                  id="btn-ir-para-checkout"
                  className="w-full py-4 bg-[#ff544b] text-white font-mono font-bold text-xs uppercase tracking-wider hover:bg-white hover:text-black transition-all rounded flex items-center justify-center gap-2 glow-effect shadow-lg"
                >
                  Ir para o Checkout <ArrowRight className="w-4 h-4" />
                </button>
              </div>
            )}
          </div>
        </div>
      )}

      {/* STEP 2: CHECKOUT (ENDEREÇO, FRETE E PAGAMENTO) */}
      {step === 'checkout' && !isLoggedIn && (
        <div className="max-w-xl mx-auto py-12 text-center font-mono space-y-6">
          <div className="bg-[#181717] border-2 border-[#ff544b]/50 p-8 rounded-lg space-y-4 shadow-2xl">
            <div className="w-16 h-16 mx-auto rounded-full bg-[#ff544b]/10 border border-[#ff544b] flex items-center justify-center text-[#ff544b]">
              <Lock className="w-8 h-8" />
            </div>
            <h2 className="text-xl font-bold text-white uppercase tracking-tight">
              Identificação Obrigatória
            </h2>
            <p className="text-xs text-gray-400 leading-relaxed max-w-md mx-auto">
              Para garantir a segurança do seu pedido e o rastreamento da entrega, você precisa estar autenticado com seu login e senha.
            </p>
            <div className="pt-2 flex flex-col sm:flex-row gap-3 justify-center">
              <button
                type="button"
                onClick={() => openAuthModal('login')}
                className="px-6 py-3 bg-[#ff544b] hover:bg-white text-white hover:text-black font-bold text-xs uppercase rounded transition-all flex items-center justify-center gap-2"
              >
                <LogIn className="w-4 h-4" /> Fazer Login / Cadastrar
              </button>
              <button
                type="button"
                onClick={() => setStep('cart')}
                className="px-6 py-3 bg-[#201f1f] border border-[#353534] text-gray-300 hover:text-white font-bold text-xs uppercase rounded transition-all"
              >
                Voltar ao Carrinho
              </button>
            </div>
          </div>
        </div>
      )}

      {/* STEP 2: CHECKOUT (ENDEREÇO, FRETE E PAGAMENTO) - USUÁRIO AUTENTICADO */}
      {step === 'checkout' && isLoggedIn && (
        <form onSubmit={handleFinishOrder} className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Main Column: Customer, Address/Shipping & Payment */}
          <div className="lg:col-span-2 space-y-6">
            
            {/* 1. Dados do Comprador */}
            <div className="bg-[#181717] border border-[#353534] p-6 rounded space-y-4">
              <h3 className="font-mono text-sm font-bold text-white uppercase border-b border-[#2a2a2a] pb-2">
                1. Dados do Skatista / Comprador
              </h3>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <div>
                  <label className="font-mono text-xs text-gray-300 block mb-1">Nome Completo *</label>
                  <input
                    type="text"
                    required
                    placeholder="Ex: Lucas Gabriel"
                    value={customerName}
                    onChange={(e) => setCustomerName(e.target.value)}
                    className="w-full bg-[#201f1f] border border-[#353534] text-xs text-white px-3 py-2.5 rounded font-mono focus:outline-none focus:border-[#ff544b]"
                  />
                </div>
                <div>
                  <label className="font-mono text-xs text-gray-300 block mb-1">E-mail para Confirmação *</label>
                  <input
                    type="email"
                    required
                    placeholder="lucas@skate.com.br"
                    value={customerEmail}
                    onChange={(e) => setCustomerEmail(e.target.value)}
                    className="w-full bg-[#201f1f] border border-[#353534] text-xs text-white px-3 py-2.5 rounded font-mono focus:outline-none focus:border-[#ff544b]"
                  />
                </div>
                <div>
                  <label className="font-mono text-xs text-gray-300 block mb-1 flex items-center gap-1">
                    <Phone className="w-3 h-3 text-[#ff544b]" />
                    WhatsApp / Telefone
                  </label>
                  <input
                    type="tel"
                    placeholder="(48) 99999-9999"
                    value={customerPhone}
                    onChange={(e) => setCustomerPhone(e.target.value)}
                    className="w-full bg-[#201f1f] border border-[#353534] text-xs text-white px-3 py-2.5 rounded font-mono focus:outline-none focus:border-[#ff544b]"
                  />
                </div>
              </div>
            </div>

            {/* 2. Endereço de Entrega & Mecanismo de Frete (SABER E COLOCAR FRETE) */}
            <div className="bg-[#181717] border border-[#353534] p-6 rounded space-y-5">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between border-b border-[#2a2a2a] pb-3 gap-2">
                <div>
                  <h3 className="font-mono text-sm font-bold text-white uppercase flex items-center gap-2">
                    <MapPin className="w-4 h-4 text-[#ff544b]" />
                    2. Endereço de Entrega &amp; Valor do Frete
                  </h3>
                  <p className="font-mono text-[11px] text-gray-400">
                    Consulte pelo CEP para calcular ou coloque um valor de frete manual
                  </p>
                </div>

                {/* Botão de Alternância entre Consultar CEP e Frete Manual */}
                <button
                  type="button"
                  onClick={() => setIsManualShipping(!isManualShipping)}
                  className="px-3 py-1.5 bg-[#201f1f] border border-[#353534] hover:border-[#ff544b] text-white font-mono text-xs rounded flex items-center gap-1.5 self-start sm:self-auto transition-colors"
                >
                  <Edit3 className="w-3.5 h-3.5 text-[#ff544b]" />
                  {isManualShipping ? 'Voltar para Consulta por CEP' : 'Colocar Frete Manualmente'}
                </button>
              </div>

              {/* Bloco 1: Consulta de CEP & Endereço */}
              <div className="space-y-4">
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                  <div className="sm:col-span-1">
                    <label className="font-mono text-xs text-gray-300 block mb-1">CEP de Entrega *</label>
                    <div className="flex gap-2">
                      <input
                        type="text"
                        placeholder="88010-000"
                        maxLength={9}
                        value={shippingAddress.cep || cepInput}
                        onChange={(e) => {
                          const formatted = formatCep(e.target.value);
                          setCepInput(formatted);
                          setShippingAddress((prev) => ({ ...prev, cep: formatted }));
                        }}
                        className="w-full bg-[#201f1f] border border-[#353534] text-xs text-white px-3 py-2.5 rounded font-mono focus:outline-none focus:border-[#ff544b]"
                      />
                      <button
                        type="button"
                        onClick={() => handleSearchCep(shippingAddress.cep || cepInput)}
                        disabled={isSearchingCep}
                        className="px-3 py-2.5 bg-[#ff544b] text-white font-mono text-xs uppercase font-bold rounded hover:bg-white hover:text-black flex items-center justify-center flex-shrink-0 transition-colors"
                        title="Buscar CEP e Calcular Frete"
                      >
                        {isSearchingCep ? <RotateCcw className="w-3.5 h-3.5 animate-spin" /> : <Search className="w-3.5 h-3.5" />}
                      </button>
                    </div>
                  </div>

                  <div className="sm:col-span-2">
                    <label className="font-mono text-xs text-gray-300 block mb-1">Rua / Logradouro</label>
                    <input
                      type="text"
                      placeholder="Ex: Av. Beira Mar Norte"
                      value={shippingAddress.street}
                      onChange={(e) => setShippingAddress({ ...shippingAddress, street: e.target.value })}
                      className="w-full bg-[#201f1f] border border-[#353534] text-xs text-white px-3 py-2.5 rounded font-mono focus:outline-none focus:border-[#ff544b]"
                    />
                  </div>
                </div>

                {cepError && (
                  <div className="p-2 bg-red-950/60 border border-red-500/50 rounded font-mono text-xs text-red-300">
                    {cepError}
                  </div>
                )}

                <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                  <div>
                    <label className="font-mono text-xs text-gray-300 block mb-1">Número</label>
                    <input
                      type="text"
                      placeholder="1000"
                      value={shippingAddress.number}
                      onChange={(e) => setShippingAddress({ ...shippingAddress, number: e.target.value })}
                      className="w-full bg-[#201f1f] border border-[#353534] text-xs text-white px-3 py-2.5 rounded font-mono focus:outline-none focus:border-[#ff544b]"
                    />
                  </div>
                  <div>
                    <label className="font-mono text-xs text-gray-300 block mb-1">Complemento</label>
                    <input
                      type="text"
                      placeholder="Apto 302"
                      value={shippingAddress.complement || ''}
                      onChange={(e) => setShippingAddress({ ...shippingAddress, complement: e.target.value })}
                      className="w-full bg-[#201f1f] border border-[#353534] text-xs text-white px-3 py-2.5 rounded font-mono focus:outline-none focus:border-[#ff544b]"
                    />
                  </div>
                  <div>
                    <label className="font-mono text-xs text-gray-300 block mb-1">Bairro</label>
                    <input
                      type="text"
                      placeholder="Centro"
                      value={shippingAddress.neighborhood}
                      onChange={(e) => setShippingAddress({ ...shippingAddress, neighborhood: e.target.value })}
                      className="w-full bg-[#201f1f] border border-[#353534] text-xs text-white px-3 py-2.5 rounded font-mono focus:outline-none focus:border-[#ff544b]"
                    />
                  </div>
                  <div>
                    <label className="font-mono text-xs text-gray-300 block mb-1">Cidade / UF</label>
                    <div className="flex gap-1">
                      <input
                        type="text"
                        placeholder="Florianópolis"
                        value={shippingAddress.city}
                        onChange={(e) => setShippingAddress({ ...shippingAddress, city: e.target.value })}
                        className="w-3/4 bg-[#201f1f] border border-[#353534] text-xs text-white px-2 py-2.5 rounded font-mono focus:outline-none focus:border-[#ff544b]"
                      />
                      <input
                        type="text"
                        placeholder="SC"
                        maxLength={2}
                        value={shippingAddress.state}
                        onChange={(e) => setShippingAddress({ ...shippingAddress, state: e.target.value.toUpperCase() })}
                        className="w-1/4 bg-[#201f1f] border border-[#353534] text-xs text-white px-1 text-center py-2.5 rounded font-mono focus:outline-none focus:border-[#ff544b]"
                      />
                    </div>
                  </div>
                </div>
              </div>

              {/* Bloco 2: Opções de Frete (Saber o Frete vs Colocar Frete Manual) */}
              <div className="pt-2 border-t border-[#2a2a2a] space-y-3">
                <div className="flex items-center justify-between">
                  <span className="font-mono text-xs font-bold text-white uppercase flex items-center gap-1.5">
                    <Truck className="w-4 h-4 text-[#ff544b]" />
                    Modalidades de Frete Disponíveis:
                  </span>
                  <span className="font-mono text-[10px] text-emerald-400">
                    {subtotal >= 250 ? '🎉 Você ganhou Frete Grátis no PAC!' : 'Frete Grátis nas compras acima de R$ 250'}
                  </span>
                </div>

                {!isManualShipping ? (
                  /* Cards com opções calculadas */
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 font-mono">
                    {shippingOptions.map((opt) => {
                      const isSelected = selectedShippingId === opt.id;
                      return (
                        <div
                          key={opt.id}
                          onClick={() => setSelectedShippingId(opt.id)}
                          className={`p-3.5 rounded border cursor-pointer transition-all flex flex-col justify-between ${
                            isSelected
                              ? 'bg-[#ff544b]/10 border-[#ff544b] text-white shadow-md'
                              : 'bg-[#201f1f] border-[#353534] text-gray-300 hover:border-gray-500'
                          }`}
                        >
                          <div className="flex items-start justify-between gap-2 mb-2">
                            <div className="flex items-center gap-2">
                              <input
                                type="radio"
                                name="checkoutShipping"
                                checked={isSelected}
                                onChange={() => setSelectedShippingId(opt.id)}
                                className="accent-[#ff544b]"
                              />
                              <span className="text-xs font-bold text-white">{opt.name}</span>
                            </div>
                            {opt.tag && (
                              <span className={`text-[9px] font-bold px-1.5 py-0.5 rounded ${
                                opt.isFree ? 'bg-emerald-500 text-black' : 'bg-[#2a2a2a] text-[#ffb4ab]'
                              }`}>
                                {opt.tag}
                              </span>
                            )}
                          </div>

                          <div className="flex items-center justify-between text-xs pt-1 border-t border-[#2a2a2a]">
                            <span className="text-[11px] text-gray-400">{opt.deadline}</span>
                            <span className="text-sm font-bold">
                              {opt.price === 0 ? (
                                <span className="text-emerald-400">GRÁTIS</span>
                              ) : (
                                <span className="text-[#ff544b]">R$ {opt.price.toFixed(2)}</span>
                              )}
                            </span>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                ) : (
                  /* Card para Colocar Valor Manual de Frete */
                  <div className="bg-[#201f1f] border-2 border-[#ff544b] p-4 rounded space-y-3 font-mono">
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-bold text-white uppercase flex items-center gap-2">
                        <Edit3 className="w-4 h-4 text-[#ff544b]" />
                        Definição Manual de Frete
                      </span>
                      <span className="bg-[#ff544b] text-white text-[9px] px-2 py-0.5 rounded font-bold">
                        VALOR MANUAL ATIVO
                      </span>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      <div>
                        <label className="text-xs text-gray-300 block mb-1">
                          Digite o Valor do Frete (R$):
                        </label>
                        <div className="flex items-center gap-2">
                          <span className="text-sm text-gray-400">R$</span>
                          <input
                            type="number"
                            min="0"
                            step="0.50"
                            value={manualShippingPrice}
                            onChange={(e) => setManualShippingPrice(e.target.value)}
                            placeholder="20.00"
                            className="w-full bg-[#131313] border border-[#ff544b] text-sm text-white px-3 py-2 rounded font-mono font-bold focus:outline-none"
                          />
                        </div>
                      </div>

                      <div>
                        <label className="text-xs text-gray-300 block mb-1">
                          Descrição / Motivo do Frete:
                        </label>
                        <input
                          type="text"
                          value={manualShippingNote}
                          onChange={(e) => setManualShippingNote(e.target.value)}
                          placeholder="Ex: Frete negociado via WhatsApp"
                          className="w-full bg-[#131313] border border-[#353534] text-xs text-white px-3 py-2 rounded font-mono focus:outline-none focus:border-[#ff544b]"
                        />
                      </div>
                    </div>

                    <p className="text-[11px] text-gray-400">
                      O valor inserido aqui (R$ {shippingCost.toFixed(2)}) será somado ao total da compra em <strong>todos os métodos de pagamento</strong> (PIX, Maquininha e Depósito).
                    </p>
                  </div>
                )}
              </div>
            </div>

            {/* 3. Seleção do Método de Pagamento */}
            <div className="bg-[#181717] border border-[#353534] p-6 rounded space-y-6">
              <div className="flex items-center justify-between border-b border-[#2a2a2a] pb-2">
                <h3 className="font-mono text-sm font-bold text-white uppercase flex items-center gap-2">
                  3. Método de Pagamento
                </h3>
                <span className="font-mono text-[11px] text-gray-400">O frete é aplicado em todas as formas</span>
              </div>

              {/* Payment Tabs */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                {/* PIX */}
                <button
                  type="button"
                  onClick={() => {
                    setPaymentMethod('pix');
                    setDepositError('');
                  }}
                  className={`p-4 border rounded text-left font-mono text-xs uppercase font-bold transition-all flex flex-col gap-2 ${
                    paymentMethod === 'pix'
                      ? 'border-[#ff544b] bg-[#ff544b]/10 text-white shadow-lg'
                      : 'border-[#353534] bg-[#201f1f] text-gray-400 hover:text-white'
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <QrCode className="w-5 h-5 text-[#ff544b]" />
                    <span className="bg-emerald-500 text-black text-[9px] px-1.5 py-0.5 rounded font-bold">
                      -5% OFF
                    </span>
                  </div>
                  <span>PIX Instantâneo</span>
                  <span className="text-[10px] text-emerald-400 normal-case font-normal">
                    5% de desconto nos produtos
                  </span>
                </button>

                {/* Maquininha */}
                <button
                  type="button"
                  onClick={() => {
                    setPaymentMethod('maquininha');
                    setDepositError('');
                  }}
                  className={`p-4 border rounded text-left font-mono text-xs uppercase font-bold transition-all flex flex-col gap-2 ${
                    paymentMethod === 'maquininha'
                      ? 'border-[#ff544b] bg-[#ff544b]/10 text-white shadow-lg'
                      : 'border-[#353534] bg-[#201f1f] text-gray-400 hover:text-white'
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <CreditCard className="w-5 h-5 text-[#ff544b]" />
                    <span className="bg-[#ff544b]/20 text-[#ffb4ab] border border-[#ff544b]/40 text-[9px] px-1.5 py-0.5 rounded font-bold">
                      ATÉ 5X S/ JUROS
                    </span>
                  </div>
                  <span>Maquininha (Cartão)</span>
                  <span className="text-[10px] text-gray-300 normal-case font-normal">
                    5x sem juros (6x a 12x c/ juros)
                  </span>
                </button>

                {/* Depósito */}
                <button
                  type="button"
                  onClick={() => {
                    setPaymentMethod('deposito');
                  }}
                  className={`p-4 border rounded text-left font-mono text-xs uppercase font-bold transition-all flex flex-col gap-2 ${
                    paymentMethod === 'deposito'
                      ? 'border-[#ff544b] bg-[#ff544b]/10 text-white shadow-lg'
                      : 'border-[#353534] bg-[#201f1f] text-gray-400 hover:text-white'
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <Building2 className="w-5 h-5 text-[#ff544b]" />
                    <span className="bg-amber-500/20 text-amber-400 border border-amber-500/40 text-[9px] px-1.5 py-0.5 rounded font-bold">
                      ANEXO OBRIGATÓRIO
                    </span>
                  </div>
                  <span>Depósito Bancário</span>
                  <span className="text-[10px] text-amber-400 normal-case font-normal">
                    Liberação mediante anexo
                  </span>
                </button>
              </div>

              {/* PIX Details Block (Com Frete Aplicado) */}
              {paymentMethod === 'pix' && (
                <div className="bg-[#201f1f] border border-[#ff544b]/40 p-5 rounded space-y-4">
                  {/* Banner do Frete no PIX */}
                  <div className="bg-[#131313] border border-emerald-500/40 p-3 rounded flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2 font-mono text-xs">
                    <div className="flex items-center gap-2 text-emerald-400">
                      <Truck className="w-4 h-4 text-emerald-400 flex-shrink-0" />
                      <span>
                        Frete Incluso no PIX: <strong>{currentShippingName}</strong>
                      </span>
                    </div>
                    <span className="text-white font-bold">
                      {shippingCost === 0 ? (
                        <span className="text-emerald-400">GRÁTIS (R$ 0,00)</span>
                      ) : (
                        `+ R$ ${shippingCost.toFixed(2)}`
                      )}
                    </span>
                  </div>

                  <div className="flex items-center justify-between text-emerald-400 font-mono text-xs font-bold">
                    <span className="flex items-center gap-2">
                      <Sparkles className="w-4 h-4" /> Desconto PIX 5%: -R$ {pixDiscount.toFixed(2)}
                    </span>
                    <span className="text-white font-mono text-sm">
                      Total a Pagar no PIX: <strong className="text-[#ff544b]">R$ {finalTotal.toFixed(2)}</strong>
                    </span>
                  </div>

                  <div className="flex flex-col md:flex-row items-center gap-6 pt-2">
                    {/* Dynamic QR Code */}
                    <div className="w-36 h-36 bg-white p-2 rounded shadow-lg flex items-center justify-center flex-shrink-0 relative">
                      <div className="w-full h-full border-2 border-black p-1 flex flex-col items-center justify-center text-black text-center font-mono">
                        <QrCode className="w-20 h-20 text-black mb-1" />
                        <span className="text-[8px] font-bold">FLORISHOP PIX</span>
                      </div>
                    </div>

                    <div className="space-y-2 w-full">
                      <label className="font-mono text-xs text-gray-300 block">Chave PIX (Copia e Cola):</label>
                      <div className="flex gap-2">
                        <input
                          type="text"
                          readOnly
                          value="00020126580014BR.GOV.BCB.PIX0136florishop-skate-pix-key-2026"
                          className="w-full bg-[#131313] border border-[#353534] text-[11px] text-gray-300 px-3 py-2 rounded font-mono"
                        />
                        <button
                          type="button"
                          onClick={handleCopyPix}
                          className="px-3 py-2 bg-[#ff544b] text-white font-mono text-xs rounded font-bold hover:bg-white hover:text-black flex items-center gap-1 flex-shrink-0"
                        >
                          <Copy className="w-3.5 h-3.5" />
                          {copiedKey ? 'Copiado!' : 'Copiar'}
                        </button>
                      </div>
                      <p className="font-mono text-[10px] text-gray-400">
                        O QR Code expira em 15 minutos. O valor transferido inclui os produtos e o frete. Após identificação, aprovação imediata!
                      </p>
                    </div>
                  </div>
                </div>
              )}

              {/* Maquininha Details Block (Com Frete Incluso e SEM o texto presencial) */}
              {paymentMethod === 'maquininha' && (
                <div className="bg-[#201f1f] border border-[#ff544b]/40 p-5 rounded space-y-4">
                  {/* Banner do Frete na Maquininha */}
                  <div className="bg-[#131313] border border-[#ff544b]/40 p-3 rounded flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2 font-mono text-xs">
                    <div className="flex items-center gap-2 text-[#ffb4ab]">
                      <Truck className="w-4 h-4 text-[#ff544b] flex-shrink-0" />
                      <span>
                        Frete no Cartão: <strong>{currentShippingName}</strong>
                      </span>
                    </div>
                    <span className="text-white font-bold">
                      {shippingCost === 0 ? (
                        <span className="text-emerald-400">GRÁTIS (R$ 0,00)</span>
                      ) : (
                        `R$ ${shippingCost.toFixed(2)} (incluso no parcelamento)`
                      )}
                    </span>
                  </div>

                  <div className="flex items-start gap-3 bg-[#131313] p-3.5 rounded border border-[#353534]">
                    <Info className="w-5 h-5 text-[#ff544b] flex-shrink-0 mt-0.5" />
                    <div className="font-sans text-xs text-gray-300 space-y-1">
                      <p className="font-bold text-white font-mono uppercase">
                        Política de Parcelamento da Maquininha Florishop:
                      </p>
                      <p>
                        • <strong className="text-emerald-400">Até 5x SEM JUROS</strong>: Parcele o valor total (produtos + frete) em até 5 vezes sem acréscimo.
                      </p>
                      <p>
                        • <strong className="text-amber-400">De 6x até 12x</strong>: Conforme as taxas da operadora de cartão de crédito, incide o juros discriminado abaixo.
                      </p>
                    </div>
                  </div>

                  <div>
                    <label className="font-mono text-xs text-gray-200 block mb-1.5 font-bold uppercase">
                      Selecione o Parcelamento na Maquininha (Base total com frete: R$ {baseOrderTotal.toFixed(2)}):
                    </label>
                    <select
                      value={selectedInstallmentKey}
                      onChange={(e) => setSelectedInstallmentKey(e.target.value)}
                      className="w-full bg-[#131313] border border-[#ff544b]/50 text-xs text-white px-3 py-3 rounded font-mono focus:outline-none focus:border-[#ff544b] cursor-pointer"
                    >
                      {MAQUININHA_RATES.map((rate) => {
                        const rateInterest = !rate.isInterestFree
                          ? (baseOrderTotal * rate.interestRate) / 100
                          : 0;
                        const optTotal = baseOrderTotal + rateInterest;
                        const optInstallment =
                          rate.installments > 0 ? optTotal / rate.installments : optTotal;

                        return (
                          <option key={rate.key} value={rate.key} className="bg-[#181717] py-1">
                            {rate.installments === 0
                              ? `Débito à Vista: R$ ${optTotal.toFixed(2)} (Sem Juros - com frete)`
                              : rate.isInterestFree
                              ? `${rate.installments}x de R$ ${optInstallment.toFixed(2)} (SEM JUROS - Total: R$ ${optTotal.toFixed(2)})`
                              : `${rate.installments}x de R$ ${optInstallment.toFixed(2)} (COM JUROS ${rate.interestRate}% - Total: R$ ${optTotal.toFixed(2)})`}
                          </option>
                        );
                      })}
                    </select>
                  </div>

                  {/* Installment breakdown card */}
                  <div className="bg-[#181717] p-4 rounded border border-[#2d2c2c] grid grid-cols-1 sm:grid-cols-3 gap-3 font-mono text-xs">
                    <div>
                      <span className="text-gray-400 block text-[10px] uppercase">Opção Escolhida:</span>
                      <strong className="text-white text-sm">
                        {selectedRate.installments === 0 ? 'Débito à Vista' : `${selectedRate.installments}x Parcelas`}
                      </strong>
                    </div>

                    <div>
                      <span className="text-gray-400 block text-[10px] uppercase">Valor da Parcela:</span>
                      <strong className="text-[#ff544b] text-base">
                        R$ {installmentAmount.toFixed(2)}
                      </strong>
                    </div>

                    <div>
                      <span className="text-gray-400 block text-[10px] uppercase">Taxa / Juros:</span>
                      {selectedRate.isInterestFree ? (
                        <span className="text-emerald-400 font-bold flex items-center gap-1">
                          <Check className="w-3.5 h-3.5" /> 0% (Sem Juros)
                        </span>
                      ) : (
                        <span className="text-amber-400 font-bold flex items-center gap-1">
                          <AlertTriangle className="w-3.5 h-3.5" /> +{selectedRate.interestRate}% operadora (+R$ {cardInterestAmount.toFixed(2)})
                        </span>
                      )}
                    </div>
                  </div>
                </div>
              )}

              {/* Depósito Details Block (Com Frete Incluso) */}
              {paymentMethod === 'deposito' && (
                <div className="bg-[#201f1f] border border-amber-500/50 p-5 rounded space-y-4">
                  {/* Banner do Frete no Depósito */}
                  <div className="bg-[#131313] border border-amber-500/40 p-3 rounded flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2 font-mono text-xs">
                    <div className="flex items-center gap-2 text-amber-300">
                      <Truck className="w-4 h-4 text-amber-400 flex-shrink-0" />
                      <span>
                        Frete no Depósito: <strong>{currentShippingName}</strong>
                      </span>
                    </div>
                    <span className="text-white font-bold">
                      {shippingCost === 0 ? (
                        <span className="text-emerald-400">GRÁTIS (R$ 0,00)</span>
                      ) : (
                        `R$ ${shippingCost.toFixed(2)} (incluso no depósito)`
                      )}
                    </span>
                  </div>

                  {/* Mandate Notice */}
                  <div className="bg-amber-950/40 border border-amber-500/40 p-3.5 rounded flex items-start gap-3">
                    <AlertTriangle className="w-5 h-5 text-amber-400 flex-shrink-0 mt-0.5" />
                    <div className="font-sans text-xs text-amber-200 space-y-1">
                      <p className="font-mono font-bold uppercase text-amber-300">
                        REGRA OBRIGATÓRIA PARA DEPÓSITO BANCÁRIO:
                      </p>
                      <p>
                        A sua compra ficará registrada com o status <strong>&quot;Aguardando Validação&quot;</strong>.
                        A separação dos produtos e a liberação do envio ocorrerão após a conferência do comprovante anexado.
                      </p>
                    </div>
                  </div>

                  <div className="flex items-center justify-between bg-[#131313] p-3 rounded border border-[#353534] font-mono text-xs">
                    <span className="text-gray-300">Valor exato para transferência/depósito (com frete):</span>
                    <strong className="text-lg text-[#ff544b]">R$ {finalTotal.toFixed(2)}</strong>
                  </div>

                  <h4 className="font-mono text-xs font-bold text-white uppercase flex items-center gap-2">
                    <Building2 className="w-4 h-4 text-[#ff544b]" />
                    Contas para Depósito / Transferência:
                  </h4>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 font-mono text-xs">
                    <div className="bg-[#131313] p-3 rounded border border-[#353534] space-y-1 text-gray-300">
                      <strong className="text-white block border-b border-[#2a2a2a] pb-1">Banco do Brasil (001)</strong>
                      <p>Agência: 0482-1</p>
                      <p>Conta Corrente: 89412-5</p>
                      <p>CNPJ: 49.821.000/0001-92</p>
                    </div>

                    <div className="bg-[#131313] p-3 rounded border border-[#353534] space-y-1 text-gray-300">
                      <strong className="text-white block border-b border-[#2a2a2a] pb-1">Banco Itaú (341)</strong>
                      <p>Agência: 1205</p>
                      <p>Conta Corrente: 45892-0</p>
                      <p>Favorecido: Florishop Skate Ltda</p>
                    </div>
                  </div>

                  {/* Required Attachment Section */}
                  <div className={`p-4 rounded border transition-all ${depositError ? 'bg-red-950/20 border-red-500' : 'bg-[#131313] border-[#353534]'}`}>
                    <label className="font-mono text-xs text-white block mb-1 font-bold uppercase flex items-center justify-between">
                      <span>Anexo do Comprovante de Pagamento * (Obrigatório para Liberação)</span>
                      <span className="text-amber-400 text-[10px]">OBRIGATÓRIO</span>
                    </label>
                    <p className="font-sans text-[11px] text-gray-400 mb-3">
                      Envie a foto ou PDF do comprovante bancário no valor exato de R$ {finalTotal.toFixed(2)} para validação.
                    </p>

                    <div className="flex flex-col sm:flex-row items-start sm:items-center gap-3">
                      <label className="px-4 py-2.5 bg-[#ff544b] text-white font-mono text-xs uppercase font-bold rounded cursor-pointer hover:bg-white hover:text-black flex items-center gap-2 transition-colors">
                        <Upload className="w-4 h-4" /> Selecionar Comprovante
                        <input
                          type="file"
                          required
                          onChange={handleSimulateFileUpload}
                          className="hidden"
                          accept="image/*,.pdf"
                        />
                      </label>

                      {receiptAttached ? (
                        <div className="flex items-center gap-2 bg-emerald-950/60 border border-emerald-500/50 px-3 py-1.5 rounded font-mono text-xs text-emerald-300">
                          <FileCheck className="w-4 h-4 text-emerald-400" />
                          <span className="font-bold">{receiptName || 'Comprovante_Anexado.pdf'}</span>
                          <span className="text-[10px] text-emerald-400">(Anexado com sucesso!)</span>
                        </div>
                      ) : (
                        <span className="font-mono text-[11px] text-amber-400 flex items-center gap-1">
                          <Clock className="w-3.5 h-3.5" /> Nenhum arquivo anexado ainda
                        </span>
                      )}
                    </div>

                    {depositError && (
                      <div className="mt-3 p-2.5 bg-red-950/80 border border-red-500 rounded text-red-200 font-sans text-xs flex items-center gap-2">
                        <AlertTriangle className="w-4 h-4 text-red-400 flex-shrink-0" />
                        <span>{depositError}</span>
                      </div>
                    )}
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Right Summary Sidebar */}
          <div className="bg-[#181717] border border-[#353534] p-6 rounded h-fit space-y-4">
            <h3 className="font-mono text-sm font-bold text-white uppercase border-b border-[#2a2a2a] pb-3">
              Total Final do Pedido
            </h3>

            <div className="space-y-2.5 font-mono text-xs">
              <div className="flex justify-between text-gray-300">
                <span>Subtotal dos Produtos:</span>
                <span>R$ {subtotal.toFixed(2)}</span>
              </div>

              {/* Linha do Frete com Nome e Valor */}
              <div className="flex justify-between items-start text-gray-300 border-t border-[#252525] pt-2">
                <div>
                  <span className="block text-white font-bold">Frete:</span>
                  <span className="block text-[10px] text-gray-400 line-clamp-1">{currentShippingName}</span>
                </div>
                <span className={shippingCost === 0 ? 'text-emerald-400 font-bold' : 'text-white font-bold'}>
                  {shippingCost === 0 ? 'GRÁTIS' : `R$ ${shippingCost.toFixed(2)}`}
                </span>
              </div>

              {/* PIX Discount breakdown */}
              {paymentMethod === 'pix' && (
                <div className="flex justify-between text-emerald-400 font-bold border-t border-[#252525] pt-2">
                  <span>Desconto PIX (5%):</span>
                  <span>- R$ {pixDiscount.toFixed(2)}</span>
                </div>
              )}

              {/* Maquininha Installment Breakdown */}
              {paymentMethod === 'maquininha' && (
                <>
                  <div className="flex justify-between items-center text-xs border-t border-[#252525] pt-2">
                    <span className="text-gray-300">Condição Cartão:</span>
                    <span className={selectedRate.isInterestFree ? 'text-emerald-400 font-bold' : 'text-amber-400 font-bold'}>
                      {selectedRate.isInterestFree ? 'Até 5x Sem Juros' : `Taxa ${selectedRate.interestRate}%`}
                    </span>
                  </div>

                  {!selectedRate.isInterestFree && (
                    <div className="flex justify-between text-amber-400 font-bold">
                      <span>Juros da Operadora ({selectedRate.installments}x):</span>
                      <span>+ R$ {cardInterestAmount.toFixed(2)}</span>
                    </div>
                  )}

                  <div className="flex justify-between items-center text-[11px] text-gray-400 border-t border-[#252525] pt-1.5">
                    <span>Parcelamento:</span>
                    <span className="text-white font-mono font-bold">
                      {selectedRate.installments === 0
                        ? 'À vista no débito'
                        : `${selectedRate.installments}x de R$ ${installmentAmount.toFixed(2)}`}
                    </span>
                  </div>
                </>
              )}

              {/* Depósito notice */}
              {paymentMethod === 'deposito' && (
                <div className="pt-2 border-t border-[#2d2c2c] text-[11px] font-sans text-amber-300 space-y-1">
                  <span className="font-bold block font-mono text-amber-400">LIBERAÇÃO DA COMPRA:</span>
                  <span>Apenas após conferência do comprovante anexado.</span>
                </div>
              )}
            </div>

            <div className="border-t border-[#353534] pt-3 flex justify-between items-center">
              <span className="font-mono text-xs text-white uppercase font-bold">Total a Pagar:</span>
              <span className="font-mono text-2xl font-extrabold text-[#ff544b]">
                R$ {finalTotal.toFixed(2)}
              </span>
            </div>

            {depositError && (
              <div className="p-2 bg-red-950/60 border border-red-500 rounded text-red-300 text-[11px] font-sans">
                {depositError}
              </div>
            )}

            <button
              type="submit"
              className="w-full py-4 bg-[#ff544b] text-white font-mono font-bold text-xs uppercase tracking-wider hover:bg-white hover:text-black transition-all rounded flex items-center justify-center gap-2 glow-effect"
            >
              <CheckCircle2 className="w-4 h-4" />
              Finalizar &amp; Gerar Pedido
            </button>
          </div>
        </form>
      )}

      {/* STEP 3: CONFIRMAÇÃO DO PEDIDO COM DETALHES DE FRETE */}
      {step === 'confirmation' && completedOrder && (
        <div className="max-w-3xl mx-auto bg-[#181717] border-2 border-[#ff544b] p-8 rounded text-center space-y-6">
          <div className="w-16 h-16 bg-emerald-500/20 text-emerald-400 border border-emerald-500 rounded-full flex items-center justify-center mx-auto">
            <CheckCircle2 className="w-10 h-10" />
          </div>

          <div>
            <span className="font-mono text-xs text-emerald-400 font-bold uppercase block">
              PEDIDO REGISTRADO COM SUCESSO!
            </span>
            <h2 className="font-display text-3xl font-extrabold text-white uppercase tracking-tight mt-1">
              Pedido #{completedOrder.id}
            </h2>
            <p className="font-sans text-sm text-gray-300 mt-2">
              Obrigado, <strong className="text-white">{completedOrder.customerName}</strong>! Enviamos os detalhes para{' '}
              <strong className="text-white">{completedOrder.customerEmail}</strong>.
            </p>
          </div>

          {/* Special Status banner for Depósito */}
          {completedOrder.paymentMethod === 'deposito' && (
            <div className="bg-amber-950/40 border-2 border-amber-500/60 p-4 rounded text-left font-sans text-xs text-amber-200 space-y-2">
              <div className="flex items-center gap-2 font-mono font-bold uppercase text-amber-300 text-sm">
                <AlertTriangle className="w-4 h-4 text-amber-400" />
                Aguardando Validação do Comprovante de Depósito
              </div>
              <p>
                O comprovante anexado (<strong>{completedOrder.paymentDetails.receiptName || 'comprovante_enviado.pdf'}</strong>) foi recebido com sucesso.
              </p>
              <p className="font-bold text-white">
                A liberação dos produtos e envio para seu endereço ocorrerão assim que nossa equipe financeira confirmar o depósito.
              </p>
            </div>
          )}

          {/* Details Table */}
          <div className="bg-[#201f1f] border border-[#353534] p-5 rounded text-left font-mono text-xs space-y-3">
            <div className="flex justify-between border-b border-[#333] pb-2">
              <span className="text-gray-400">Data do Pedido:</span>
              <span className="text-white font-bold">{completedOrder.date}</span>
            </div>
            
            <div className="flex justify-between border-b border-[#333] pb-2">
              <span className="text-gray-400">Forma de Pagamento:</span>
              <span className="text-[#ff544b] font-bold uppercase">
                {completedOrder.paymentMethod === 'pix' && 'PIX Instantâneo (5% OFF)'}
                {completedOrder.paymentMethod === 'maquininha' && 'Maquininha de Cartão'}
                {completedOrder.paymentMethod === 'deposito' && 'Depósito Bancário'}
              </span>
            </div>

            {completedOrder.paymentDetails.cardInstallments && (
              <div className="flex justify-between border-b border-[#333] pb-2">
                <span className="text-gray-400">Plano de Parcelamento:</span>
                <span className="text-white font-bold">{completedOrder.paymentDetails.cardInstallments}</span>
              </div>
            )}

            {/* Detalhes do Frete Escolhido */}
            <div className="flex justify-between border-b border-[#333] pb-2">
              <span className="text-gray-400">Modalidade de Envio:</span>
              <span className="text-white font-bold">
                {completedOrder.shippingMethod || 'Frete Padrão'}
                {' '}({completedOrder.shippingCost === 0 ? <span className="text-emerald-400">GRÁTIS</span> : `R$ ${completedOrder.shippingCost?.toFixed(2)}`})
              </span>
            </div>

            {/* Endereço de Entrega se disponível */}
            {completedOrder.shippingAddress?.street && (
              <div className="flex justify-between border-b border-[#333] pb-2">
                <span className="text-gray-400">Endereço de Entrega:</span>
                <span className="text-white text-right font-medium">
                  {completedOrder.shippingAddress.street}, {completedOrder.shippingAddress.number}
                  {completedOrder.shippingAddress.complement ? ` (${completedOrder.shippingAddress.complement})` : ''} - {completedOrder.shippingAddress.neighborhood}, {completedOrder.shippingAddress.city}/{completedOrder.shippingAddress.state} - CEP: {completedOrder.shippingAddress.cep}
                </span>
              </div>
            )}

            <div className="flex justify-between border-b border-[#333] pb-2">
              <span className="text-gray-400">Status do Pedido:</span>
              <span className={`px-2 py-0.5 rounded font-bold ${
                completedOrder.paymentMethod === 'deposito'
                  ? 'bg-amber-950 text-amber-300 border border-amber-500/40'
                  : 'bg-emerald-950 text-emerald-300 border border-emerald-500/30'
              }`}>
                {completedOrder.status}
              </span>
            </div>

            <div className="flex justify-between pt-1">
              <span className="text-gray-400">Valor Total do Pedido (com frete):</span>
              <span className="text-lg text-[#ff544b] font-bold">R$ {completedOrder.total.toFixed(2)}</span>
            </div>
          </div>

          <div className="flex flex-col sm:flex-row gap-3 justify-center">
            <button
              onClick={() => setActiveTab('orders-history')}
              className="px-6 py-3 bg-[#2a2a2a] text-white font-mono text-xs uppercase font-bold rounded hover:bg-white hover:text-black transition-colors"
            >
              Ver Meus Pedidos
            </button>
            <button
              onClick={() => {
                setStep('cart');
                setActiveTab('catalog');
              }}
              className="px-6 py-3 bg-[#ff544b] text-white font-mono text-xs uppercase font-bold rounded hover:bg-white hover:text-black transition-colors"
            >
              Voltar à Loja
            </button>
          </div>
        </div>
      )}
    </div>
  );
};
