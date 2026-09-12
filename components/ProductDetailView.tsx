'use client';

import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { useStore } from './StoreContext';
import { Product } from '@/lib/skate-store';
import {
  ShoppingCart,
  Truck,
  ShieldCheck,
  ArrowLeft,
  Check,
  Plus,
  Minus,
  Share2,
  Search,
  MapPin,
  Loader2,
  Sparkles,
  ChevronLeft,
  ChevronRight,
  Image as ImageIcon
} from 'lucide-react';
import { fetchAddressAndShipping, cleanCep, formatCep, ShippingOption } from '@/lib/shipping';

export const ProductDetailView: React.FC = () => {
  const {
    selectedProduct,
    addToCart,
    setActiveTab,
    products,
    openProductDetail,
    isLoggedIn,
    openAuthModal,
    currentUser,
  } = useStore();

  const [activeImageIndex, setActiveImageIndex] = useState(0);
  const [userSelectedSize, setUserSelectedSize] = useState<string | null>(null);
  const [quantity, setQuantity] = useState(1);
  const [addedToast, setAddedToast] = useState(false);
  const [touchStartX, setTouchStartX] = useState<number | null>(null);

  // Reset image index when product changes
  useEffect(() => {
    setActiveImageIndex(0);
  }, [selectedProduct?.id]);

  const images = useMemo(() => {
    return selectedProduct?.images && selectedProduct.images.length > 0
      ? selectedProduct.images
      : ['https://lh3.googleusercontent.com/aida-public/AB6AXuDfAUZUZdE_GrI_XZ3Mw6u0nQfx_ifYFGi-mXy1Svr0jL1hT9lU0gSEya_n83GTj6al_pT23g00qj802qDXxR2jLtTSY-BWL2pqhez02cIHNhrSpWBuGcSNsE7J4Mum9Iq-a9Hk1wvqHrTm8T3gUYuRTY24xpZCSHnMClO6h4eRcHRO1GxGdFLyPi5JFcDzrWx80QKTgfp0GJv0X9xep4INPafQK9irO4-kHBMR8i3YnSzWJWaqejb16A'];
  }, [selectedProduct?.images]);

  const handlePrevImage = useCallback(() => {
    if (!images || images.length <= 1) return;
    setActiveImageIndex((prev) => (prev > 0 ? prev - 1 : images.length - 1));
  }, [images]);

  const handleNextImage = useCallback(() => {
    if (!images || images.length <= 1) return;
    setActiveImageIndex((prev) => (prev < images.length - 1 ? prev + 1 : 0));
  }, [images]);

  // Keyboard navigation
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (images.length <= 1) return;
      if (e.key === 'ArrowLeft') {
        handlePrevImage();
      } else if (e.key === 'ArrowRight') {
        handleNextImage();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [images.length, handlePrevImage, handleNextImage]);

  // Touch swipe handling
  const handleTouchStart = (e: React.TouchEvent) => {
    setTouchStartX(e.targetTouches[0].clientX);
  };

  const handleTouchEnd = (e: React.TouchEvent) => {
    if (touchStartX === null) return;
    const touchEndX = e.changedTouches[0].clientX;
    const diff = touchStartX - touchEndX;
    if (diff > 45) {
      handleNextImage();
    } else if (diff < -45) {
      handlePrevImage();
    }
    setTouchStartX(null);
  };

  // Shipping calculator state
  const [cepInput, setCepInput] = useState(currentUser?.address?.cep || '');
  const [isCalculatingShipping, setIsCalculatingShipping] = useState(false);
  const [shippingOptions, setShippingOptions] = useState<ShippingOption[] | null>(null);
  const [shippingAddressInfo, setShippingAddressInfo] = useState<string>('');
  const [shippingError, setShippingError] = useState<string | null>(null);

  const handleCalculateShipping = async () => {
    const clean = cleanCep(cepInput);
    if (clean.length !== 8) {
      setShippingError('Digite um CEP válido com 8 dígitos (ex: 88010-000)');
      return;
    }

    setShippingError(null);
    setIsCalculatingShipping(true);

    try {
      const subtotal = (selectedProduct?.salePrice || 0) * quantity;
      const result = await fetchAddressAndShipping(clean, subtotal);
      setShippingOptions(result.options);
      if (result.address.city && result.address.state) {
        setShippingAddressInfo(`${result.address.city}/${result.address.state}`);
      }
    } catch {
      setShippingError('Não foi possível calcular o frete no momento. Tente novamente.');
    } finally {
      setIsCalculatingShipping(false);
    }
  };

  const selectedSize =
    userSelectedSize !== null
      ? userSelectedSize
      : selectedProduct?.sizes && selectedProduct.sizes.length > 0
      ? selectedProduct.sizes[0]
      : '';

  if (!selectedProduct) {
    return (
      <div className="max-w-7xl mx-auto px-4 py-16 text-center">
        <h2 className="font-display text-2xl text-white uppercase mb-4">Nenhum produto selecionado</h2>
        <button
          onClick={() => setActiveTab('catalog')}
          className="px-6 py-3 bg-[#ff544b] text-white font-mono text-xs uppercase font-bold rounded"
        >
          Voltar para a Loja
        </button>
      </div>
    );
  }

  const handleAddToCart = () => {
    addToCart(selectedProduct, quantity, selectedSize);
    setAddedToast(true);
    setTimeout(() => setAddedToast(false), 3000);
  };

  // Recommendations "Complete o Kit"
  const kitItems = products.filter((p) => p.id !== selectedProduct.id).slice(0, 3);

  return (
    <div className="max-w-7xl mx-auto px-4 md:px-12 py-8">
      {/* Back Button */}
      <button
        onClick={() => {
          setActiveTab('catalog');
          window.scrollTo({ top: 0, behavior: 'smooth' });
        }}
        className="inline-flex items-center gap-2 font-mono text-xs text-[#ffb4ab] hover:text-[#ff544b] transition-colors uppercase font-bold mb-6"
      >
        <ArrowLeft className="w-4 h-4" /> Voltar para o Catálogo
      </button>

      {/* Main Detail Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 bg-[#181717] border border-[#353534] p-6 md:p-10 rounded">
        {/* Left Side: Photo Gallery */}
        <div className="flex flex-col gap-4">
          {/* Main Selected Image with Carousel Navigation */}
          <div
            className="w-full h-[380px] md:h-[480px] bg-[#201f1f] border border-[#333] p-6 rounded flex items-center justify-center relative overflow-hidden group select-none"
            onTouchStart={handleTouchStart}
            onTouchEnd={handleTouchEnd}
          >
            {/* Main Image */}
            <img
              key={activeImageIndex}
              src={images[activeImageIndex] || images[0]}
              alt={`${selectedProduct.name} - Foto ${activeImageIndex + 1}`}
              className="max-h-full max-w-full object-contain filter drop-shadow-2xl group-hover:scale-105 transition-all duration-300 animate-fadeIn"
            />

            {/* Badge */}
            {selectedProduct.badge && (
              <span className="absolute top-4 left-4 bg-[#ff544b] text-white px-3 py-1 font-mono text-xs font-bold uppercase rounded z-20 shadow-md">
                {selectedProduct.badge}
              </span>
            )}

            {/* Multi-Photo Counter Badge */}
            {images.length > 1 && (
              <div className="absolute top-4 right-4 z-20 bg-black/75 backdrop-blur-sm border border-white/20 text-white font-mono text-xs px-2.5 py-1 rounded-full flex items-center gap-1.5 shadow-md pointer-events-none">
                <ImageIcon className="w-3.5 h-3.5 text-[#ff544b]" />
                <span>{activeImageIndex + 1} / {images.length}</span>
              </div>
            )}

            {/* Previous Arrow Button */}
            {images.length > 1 && (
              <button
                type="button"
                onClick={(e) => {
                  e.stopPropagation();
                  handlePrevImage();
                }}
                aria-label="Foto anterior"
                title="Foto anterior (ou use a seta esquerda do teclado)"
                className="absolute left-3 top-1/2 -translate-y-1/2 z-20 w-10 h-10 rounded-full bg-black/75 hover:bg-[#ff544b] text-white flex items-center justify-center backdrop-blur-sm border border-white/20 hover:border-[#ff544b] transition-all shadow-xl hover:scale-110 active:scale-95"
              >
                <ChevronLeft className="w-6 h-6" />
              </button>
            )}

            {/* Next Arrow Button */}
            {images.length > 1 && (
              <button
                type="button"
                onClick={(e) => {
                  e.stopPropagation();
                  handleNextImage();
                }}
                aria-label="Próxima foto"
                title="Próxima foto (ou use a seta direita do teclado)"
                className="absolute right-3 top-1/2 -translate-y-1/2 z-20 w-10 h-10 rounded-full bg-black/75 hover:bg-[#ff544b] text-white flex items-center justify-center backdrop-blur-sm border border-white/20 hover:border-[#ff544b] transition-all shadow-xl hover:scale-110 active:scale-95"
              >
                <ChevronRight className="w-6 h-6" />
              </button>
            )}

            {/* Dot Indicators */}
            {images.length > 1 && (
              <div className="absolute bottom-3 left-1/2 -translate-x-1/2 z-20 flex items-center gap-1.5 bg-black/60 backdrop-blur-sm px-2.5 py-1 rounded-full border border-white/10">
                {images.map((_, dotIdx) => (
                  <button
                    key={dotIdx}
                    type="button"
                    onClick={(e) => {
                      e.stopPropagation();
                      setActiveImageIndex(dotIdx);
                    }}
                    className={`h-2 rounded-full transition-all ${
                      activeImageIndex === dotIdx
                        ? 'w-5 bg-[#ff544b]'
                        : 'w-2 bg-white/40 hover:bg-white/80'
                    }`}
                    aria-label={`Ir para foto ${dotIdx + 1}`}
                  />
                ))}
              </div>
            )}
          </div>

          {/* Thumbnails Swatch */}
          {images.length > 1 && (
            <div className="space-y-1">
              <div className="flex justify-between items-center text-[11px] font-mono text-gray-400">
                <span>Clique nas fotos abaixo ou use as setas para navegar:</span>
                <span className="text-[#ff544b] font-bold">Foto {activeImageIndex + 1} de {images.length}</span>
              </div>
              <div className="flex gap-2.5 overflow-x-auto pb-2 scrollbar-thin">
                {images.map((imgUrl, idx) => (
                  <button
                    key={idx}
                    type="button"
                    onClick={() => setActiveImageIndex(idx)}
                    className={`w-20 h-20 bg-[#201f1f] border-2 rounded p-1.5 flex items-center justify-center flex-shrink-0 transition-all ${
                      activeImageIndex === idx
                        ? 'border-[#ff544b] shadow-lg shadow-[#ff544b]/20 scale-105'
                        : 'border-[#333] opacity-60 hover:opacity-100 hover:border-gray-400'
                    }`}
                  >
                    <img src={imgUrl} alt={`Miniatura ${idx + 1}`} className="max-h-full max-w-full object-contain" />
                  </button>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Right Side: Product Info & Purchase */}
        <div className="flex flex-col justify-between">
          <div>
            <div className="flex justify-between items-center font-mono text-xs text-[#ffb4ab] uppercase mb-2">
              <span>{selectedProduct.brand} &bull; {selectedProduct.category}</span>
              <span>SKU: {selectedProduct.sku}</span>
            </div>

            <h1 className="font-display text-3xl md:text-5xl font-extrabold text-white uppercase tracking-tight leading-none mb-4">
              {selectedProduct.name}
            </h1>

            {/* Price Box */}
            <div className="bg-[#201f1f] border border-[#353534] p-4 rounded mb-6 flex flex-wrap justify-between items-center gap-4">
              <div>
                <span className="text-xs font-mono text-gray-400 block uppercase">Preço no PIX (-5% de desconto)</span>
                <span className="font-mono text-3xl font-extrabold text-[#ff544b]">
                  R$ {(selectedProduct.salePrice * 0.95).toFixed(2)}
                </span>
                <span className="text-xs font-mono text-emerald-400 block font-bold mt-0.5">
                  ou até 5x de R$ {(selectedProduct.salePrice / 5).toFixed(2)} sem juros na maquininha
                </span>
                <span className="text-[11px] font-mono text-gray-400 block">
                  (6x a 12x com taxas da operadora | Depósito com liberação após comprovante)
                </span>
              </div>
              <div className="text-right">
                <span className="font-mono text-xs px-2.5 py-1 bg-[#2a2a2a] text-emerald-400 border border-emerald-500/30 rounded font-bold uppercase block">
                  {selectedProduct.stockQuantity > 0 ? `${selectedProduct.stockQuantity} em estoque` : 'Esgotado'}
                </span>
              </div>
            </div>

            {/* Technical Specs Badges */}
            <div className="mb-6">
              <h4 className="font-mono text-xs font-bold text-[#c8c6c5] uppercase mb-2">Especificações Técnicas:</h4>
              <div className="flex flex-wrap gap-2">
                {selectedProduct.specs.map((spec, i) => (
                  <span
                    key={i}
                    className="px-3 py-1 bg-[#201f1f] border border-[#353534] font-mono text-xs text-white uppercase rounded"
                  >
                    {spec}
                  </span>
                ))}
              </div>
            </div>

            {/* Size Selector */}
            {selectedProduct.sizes && selectedProduct.sizes.length > 0 && (
              <div className="mb-6">
                <h4 className="font-mono text-xs font-bold text-[#c8c6c5] uppercase mb-2">Tamanho / Medida:</h4>
                <div className="flex flex-wrap gap-2">
                  {selectedProduct.sizes.map((sz) => (
                    <button
                      key={sz}
                      onClick={() => setUserSelectedSize(sz)}
                      className={`px-4 py-2 font-mono text-xs uppercase font-bold rounded border transition-all ${
                        selectedSize === sz
                          ? 'bg-[#ff544b] text-white border-[#ff544b]'
                          : 'bg-[#201f1f] text-gray-300 border-[#353534] hover:border-white'
                      }`}
                    >
                      {sz}
                    </button>
                  ))}
                </div>
              </div>
            )}

            {/* Description */}
            <div className="mb-6">
              <h4 className="font-mono text-xs font-bold text-[#c8c6c5] uppercase mb-1">Descrição:</h4>
              <p className="font-sans text-sm text-[#c8c6c5] leading-relaxed">
                {selectedProduct.description}
              </p>
            </div>
          </div>

          {/* Quantity Controls & Add To Cart Button */}
          <div className="border-t border-[#353534] pt-6 space-y-4">
            <div className="flex items-center gap-4">
              <span className="font-mono text-xs font-bold text-[#c8c6c5] uppercase">Quantidade:</span>
              <div className="flex items-center bg-[#201f1f] border border-[#353534] rounded">
                <button
                  onClick={() => setQuantity((q) => Math.max(1, q - 1))}
                  className="p-2 text-gray-300 hover:text-white"
                >
                  <Minus className="w-4 h-4" />
                </button>
                <span className="font-mono text-sm font-bold text-white px-4">{quantity}</span>
                <button
                  onClick={() => setQuantity((q) => Math.min(selectedProduct.stockQuantity || 99, q + 1))}
                  className="p-2 text-gray-300 hover:text-white"
                >
                  <Plus className="w-4 h-4" />
                </button>
              </div>
            </div>

            <div className="flex flex-col sm:flex-row gap-3">
              <button
                onClick={handleAddToCart}
                disabled={selectedProduct.stockQuantity <= 0}
                className={`flex-1 py-4 font-mono font-bold text-sm uppercase tracking-wider rounded flex items-center justify-center gap-2 transition-all ${
                  selectedProduct.stockQuantity <= 0
                    ? 'bg-gray-800 text-gray-500 cursor-not-allowed'
                    : 'bg-[#ff544b] text-white hover:bg-white hover:text-[#ff544b] glow-effect'
                }`}
              >
                <ShoppingCart className="w-5 h-5" />
                Adicionar ao Carrinho
              </button>

              <button
                onClick={() => {
                  handleAddToCart();
                  if (!isLoggedIn) {
                    openAuthModal('login');
                  } else {
                    setActiveTab('checkout');
                    window.scrollTo({ top: 0, behavior: 'smooth' });
                  }
                }}
                disabled={selectedProduct.stockQuantity <= 0}
                className="px-6 py-4 bg-white text-black font-mono font-bold text-sm uppercase tracking-wider hover:bg-[#ffb4ab] transition-colors rounded"
              >
                Comprar Agora
              </button>
            </div>

            {addedToast && (
              <div className="bg-emerald-950 border border-emerald-500 text-emerald-300 px-4 py-3 rounded font-mono text-xs flex items-center gap-2 animate-bounce">
                <Check className="w-4 h-4" /> Produto adicionado ao carrinho com sucesso!
              </div>
            )}

            {/* Shipping & Support Badges */}
            <div className="grid grid-cols-2 gap-3 pt-2 font-mono text-[11px] text-gray-400">
              <div className="flex items-center gap-2">
                <Truck className="w-4 h-4 text-[#ff544b]" /> Envio para todo o Brasil
              </div>
              <div className="flex items-center gap-2">
                <ShieldCheck className="w-4 h-4 text-[#ff544b]" /> Garantia de 90 Dias
              </div>
            </div>

            {/* Simulador de Frete Oficial Melhor Envio */}
            <div className="bg-[#181717] border border-[#353534] rounded-lg p-4 space-y-3 font-mono text-xs mt-4">
              <div className="flex items-center justify-between">
                <span className="font-bold text-white uppercase flex items-center gap-2">
                  <Truck className="w-4 h-4 text-[#ff544b]" />
                  Calcular Frete & Prazo (Melhor Envio)
                </span>
                <span className="text-[10px] text-gray-500 font-bold uppercase bg-[#252424] px-2 py-0.5 rounded border border-[#353534]">
                  Melhor Envio
                </span>
              </div>

              <div className="flex gap-2">
                <div className="relative flex-1">
                  <MapPin className="w-3.5 h-3.5 absolute left-3 top-1/2 -translate-y-1/2 text-gray-500" />
                  <input
                    type="text"
                    value={cepInput}
                    maxLength={9}
                    onChange={(e) => {
                      const formatted = formatCep(e.target.value);
                      setCepInput(formatted);
                    }}
                    onKeyDown={(e) => {
                      if (e.key === 'Enter') {
                        e.preventDefault();
                        handleCalculateShipping();
                      }
                    }}
                    placeholder="Digite seu CEP (ex: 88010-000)"
                    className="w-full pl-9 pr-3 py-2 bg-[#201f1f] border border-[#353534] rounded text-white text-xs placeholder-gray-500 focus:outline-none focus:border-[#ff544b]"
                  />
                </div>
                <button
                  type="button"
                  onClick={handleCalculateShipping}
                  disabled={isCalculatingShipping}
                  className="px-4 py-2 bg-[#ff544b] hover:bg-white hover:text-[#ff544b] text-white font-bold rounded transition-colors uppercase flex items-center gap-1.5 shrink-0 disabled:opacity-50"
                >
                  {isCalculatingShipping ? (
                    <Loader2 className="w-4 h-4 animate-spin" />
                  ) : (
                    <Search className="w-4 h-4" />
                  )}
                  Calcular
                </button>
              </div>

              {shippingError && (
                <p className="text-[11px] text-red-400 font-mono">{shippingError}</p>
              )}

              {shippingAddressInfo && (
                <p className="text-[11px] text-gray-400 font-mono flex items-center gap-1">
                  <MapPin className="w-3 h-3 text-[#ff544b]" />
                  Destino: <strong className="text-white">{shippingAddressInfo}</strong>
                </p>
              )}

              {shippingOptions && shippingOptions.length > 0 && (
                <div className="space-y-2 pt-2 border-t border-[#2d2c2c] max-h-56 overflow-y-auto pr-1">
                  {shippingOptions.map((opt) => (
                    <div
                      key={opt.id}
                      className="bg-[#201f1f] border border-[#2d2c2c] hover:border-[#403f3f] p-2.5 rounded flex items-center justify-between transition-colors"
                    >
                      <div className="space-y-0.5">
                        <div className="flex items-center gap-2">
                          <span className="font-bold text-white text-xs">{opt.name}</span>
                          {opt.tag && (
                            <span
                              className={`text-[9px] px-1.5 py-0.2 rounded font-bold uppercase ${
                                opt.isFree
                                  ? 'bg-emerald-950 text-emerald-300 border border-emerald-800'
                                  : 'bg-[#2a2929] text-gray-300 border border-[#403e3e]'
                              }`}
                            >
                              {opt.tag}
                            </span>
                          )}
                        </div>
                        <span className="text-[10px] text-gray-400 block font-mono">
                          Prazo: {opt.deadline}
                        </span>
                      </div>

                      <div className="text-right shrink-0">
                        {opt.isFree ? (
                          <span className="text-emerald-400 font-bold text-xs uppercase">Grátis</span>
                        ) : (
                          <div className="flex flex-col items-end">
                            {opt.originalPrice && opt.originalPrice > opt.price && (
                              <span className="text-[10px] text-gray-500 line-through">
                                R$ {opt.originalPrice.toFixed(2)}
                              </span>
                            )}
                            <span className="text-[#ff544b] font-bold text-xs">
                              R$ {opt.price.toFixed(2)}
                            </span>
                          </div>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Complete the Kit Recommendations */}
      <section className="mt-16 border-t border-[#353534] pt-8">
        <h3 className="font-display text-2xl font-extrabold text-white uppercase mb-6">
          Complete o <span className="text-[#ff544b]">Seu Kit</span>
        </h3>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
          {kitItems.map((item) => (
            <div
              key={item.id}
              onClick={() => openProductDetail(item)}
              className="bg-[#181717] border border-[#353534] hover:border-[#ff544b] p-4 rounded cursor-pointer group transition-all"
            >
              <div className="h-40 bg-[#201f1f] p-2 rounded mb-3 flex items-center justify-center">
                <img src={item.images[0]} alt={item.name} className="h-full object-contain group-hover:scale-105 transition-transform" />
              </div>
              <span className="font-mono text-[10px] text-[#ffb4ab] uppercase">{item.category}</span>
              <h4 className="font-mono text-xs font-bold text-white uppercase line-clamp-1 mb-1">{item.name}</h4>
              <span className="font-mono text-sm font-bold text-[#ff544b]">R$ {item.salePrice.toFixed(2)}</span>
            </div>
          ))}
        </div>
      </section>
    </div>
  );
};
