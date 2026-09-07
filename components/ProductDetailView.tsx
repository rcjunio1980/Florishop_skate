'use client';

import React, { useState } from 'react';
import { useStore } from './StoreContext';
import { Product } from '@/lib/skate-store';
import { ShoppingCart, Truck, ShieldCheck, ArrowLeft, Check, Plus, Minus, Share2 } from 'lucide-react';

export const ProductDetailView: React.FC = () => {
  const {
    selectedProduct,
    addToCart,
    setActiveTab,
    products,
    openProductDetail,
    isLoggedIn,
    openAuthModal,
  } = useStore();

  const [activeImageIndex, setActiveImageIndex] = useState(0);
  const [userSelectedSize, setUserSelectedSize] = useState<string | null>(null);
  const [quantity, setQuantity] = useState(1);
  const [addedToast, setAddedToast] = useState(false);

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

  const images = selectedProduct.images && selectedProduct.images.length > 0
    ? selectedProduct.images
    : ['https://lh3.googleusercontent.com/aida-public/AB6AXuDfAUZUZdE_GrI_XZ3Mw6u0nQfx_ifYFGi-mXy1Svr0jL1hT9lU0gSEya_n83GTj6al_pT23g00qj802qDXxR2jLtTSY-BWL2pqhez02cIHNhrSpWBuGcSNsE7J4Mum9Iq-a9Hk1wvqHrTm8T3gUYuRTY24xpZCSHnMClO6h4eRcHRO1GxGdFLyPi5JFcDzrWx80QKTgfp0GJv0X9xep4INPafQK9irO4-kHBMR8i3YnSzWJWaqejb16A'];

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
          {/* Main Selected Image */}
          <div className="w-full h-[380px] md:h-[480px] bg-[#201f1f] border border-[#333] p-6 rounded flex items-center justify-center relative overflow-hidden group">
            <img
              src={images[activeImageIndex] || images[0]}
              alt={selectedProduct.name}
              className="max-h-full max-w-full object-contain filter drop-shadow-2xl group-hover:scale-105 transition-transform duration-500"
            />
            {selectedProduct.badge && (
              <span className="absolute top-4 left-4 bg-[#ff544b] text-white px-3 py-1 font-mono text-xs font-bold uppercase rounded">
                {selectedProduct.badge}
              </span>
            )}
          </div>

          {/* Thumbnails Swatch */}
          {images.length > 1 && (
            <div className="flex gap-3 overflow-x-auto pb-2">
              {images.map((imgUrl, idx) => (
                <button
                  key={idx}
                  onClick={() => setActiveImageIndex(idx)}
                  className={`w-20 h-20 bg-[#201f1f] border-2 rounded p-1 flex items-center justify-center flex-shrink-0 transition-all ${
                    activeImageIndex === idx ? 'border-[#ff544b]' : 'border-[#333] opacity-60 hover:opacity-100'
                  }`}
                >
                  <img src={imgUrl} alt={`Thumbnail ${idx}`} className="max-h-full max-w-full object-contain" />
                </button>
              ))}
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
