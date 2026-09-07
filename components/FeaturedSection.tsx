'use client';

import React from 'react';
import { useStore } from './StoreContext';
import { ShoppingCart, ArrowRight } from 'lucide-react';

export const FeaturedSection: React.FC = () => {
  const { products, openProductDetail, addToCart, setActiveTab, featuredConfig } = useStore();

  const featuredShape = products.find((p) => p.id === featuredConfig?.slot1?.productId) || products[0];
  const featuredTruck = products.find((p) => p.id === featuredConfig?.slot2?.productId) || products[1] || products[0];
  const featuredWheel = products.find((p) => p.id === featuredConfig?.slot3?.productId) || products[2] || products[0];

  const slot1Tag = featuredConfig?.slot1?.customTag || featuredShape?.badge || 'Novo Drop';
  const slot1Subtitle = featuredConfig?.slot1?.customSubtitle || (featuredShape ? `${featuredShape.category} • ${featuredShape.brand}`.toUpperCase() : 'SHAPE MAPLE CANADENSE');

  const slot2Tag = featuredConfig?.slot2?.customTag || featuredTruck?.badge || featuredTruck?.specs[0] || 'Titanium';
  const slot2Subtitle = featuredConfig?.slot2?.customSubtitle || (featuredTruck ? `${featuredTruck.category} • ${featuredTruck.brand}`.toUpperCase() : 'TRUCKS DE ALTA DENSIDADE');

  const slot3Tag = featuredConfig?.slot3?.customTag || featuredWheel?.badge || featuredWheel?.specs[0] || '101A Dureza';
  const slot3Subtitle = featuredConfig?.slot3?.customSubtitle || (featuredWheel ? `${featuredWheel.category} • ${featuredWheel.brand}`.toUpperCase() : 'URETANO HIGH POP');

  return (
    <section className="px-4 md:px-12 mx-auto w-full max-w-7xl py-12" id="destaques">
      <div className="flex justify-between items-end mb-8 border-b border-[#353534] pb-4">
        <div>
          <h2 className="font-display text-2xl md:text-4xl font-extrabold text-[#e5e2e1] uppercase tracking-tight">
            Destaques <span className="text-[#ff544b]">do Mês</span>
          </h2>
        </div>
        <div className="flex items-center gap-3">
          <button
            onClick={() => {
              setActiveTab('admin-stock');
              window.scrollTo({ top: 0, behavior: 'smooth' });
            }}
            title="Acessar Gestão de Estoque para editar os 3 destaques"
            className="hidden sm:inline-flex items-center gap-1.5 font-mono text-[11px] text-gray-400 hover:text-white border border-[#353534] hover:border-[#ff544b] px-2.5 py-1 rounded transition-colors"
          >
            Editar Destaques
          </button>
          <button
            onClick={() => {
              setActiveTab('catalog');
              window.scrollTo({ top: 0, behavior: 'smooth' });
            }}
            className="hidden md:flex items-center gap-2 font-mono text-xs text-[#e6bdb8] hover:text-[#ff544b] transition-colors uppercase font-semibold"
          >
            VER TODOS OS DROPS <ArrowRight className="w-4 h-4" />
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* Large Featured Shape Card */}
        {featuredShape && (
          <article className="col-span-1 md:col-span-2 bg-[#1A1A1A] border border-[#333333] hover:border-[#ff544b] transition-colors group relative overflow-hidden flex flex-col md:flex-row h-full rounded">
            <div
              onClick={() => openProductDetail(featuredShape)}
              className="w-full md:w-1/2 h-64 md:h-auto bg-[#201f1f] p-6 flex items-center justify-center relative cursor-pointer group"
            >
              {/* Technical Badges */}
              <div className="absolute top-4 left-4 flex flex-wrap gap-2 z-10">
                <span className="bg-[#ff544b] text-white px-2 py-0.5 font-mono text-[10px] uppercase font-bold rounded">
                  {slot1Tag}
                </span>
                {featuredShape.specs && featuredShape.specs[0] && (
                  <span className="bg-[#353534] text-white px-2 py-0.5 font-mono text-[10px] uppercase rounded">
                    {featuredShape.specs[0]}
                  </span>
                )}
              </div>
              <img
                src={featuredShape.images[0]}
                alt={featuredShape.name}
                className="h-[105%] object-contain group-hover:scale-105 transition-transform duration-500 transform -rotate-3 filter drop-shadow-2xl"
              />
            </div>

            <div className="p-6 md:p-8 w-full md:w-1/2 flex flex-col justify-between">
              <div>
                <span className="font-mono text-xs text-[#ffb4ab] uppercase tracking-widest font-semibold">
                  {slot1Subtitle}
                </span>
                <h3
                  onClick={() => openProductDetail(featuredShape)}
                  className="font-display text-2xl md:text-3xl font-bold text-white uppercase mt-1 mb-3 hover:text-[#ff544b] cursor-pointer transition-colors leading-tight"
                >
                  {featuredShape.name}
                </h3>
                <p className="font-sans text-sm text-[#c8c6c5] mb-6 leading-relaxed">
                  {featuredShape.description}
                </p>
                <div className="flex flex-wrap gap-1.5 mb-6">
                  {featuredShape.specs.slice(0, 3).map((spec, i) => (
                    <span
                      key={i}
                      className="px-2 py-1 bg-[#2a2a2a] border border-[#353534] text-[11px] font-mono text-[#e5e2e1] uppercase rounded"
                    >
                      {spec}
                    </span>
                  ))}
                </div>
              </div>

              <div className="mt-auto flex items-center justify-between border-t border-[#333] pt-4">
                <div>
                  <span className="text-[10px] font-mono text-gray-400 block uppercase">Preço Especial</span>
                  <span className="font-mono text-2xl font-bold text-[#ff544b]">
                    R$ {featuredShape.salePrice.toFixed(2)}
                  </span>
                </div>
                <div className="flex gap-2">
                  <button
                    onClick={() => openProductDetail(featuredShape)}
                    className="px-3 py-2 bg-[#2a2a2a] text-white font-mono text-xs uppercase hover:bg-white hover:text-black transition-colors rounded"
                  >
                    Ver Detalhes
                  </button>
                  <button
                    onClick={() => addToCart(featuredShape)}
                    title="Adicionar ao Carrinho"
                    className="w-10 h-10 bg-[#ff544b] text-white rounded flex items-center justify-center hover:bg-white hover:text-[#ff544b] transition-colors"
                  >
                    <ShoppingCart className="w-4 h-4" />
                  </button>
                </div>
              </div>
            </div>
          </article>
        )}

        {/* Smaller Grid Column Items */}
        <div className="flex flex-col gap-6">
          {/* Truck Card */}
          {featuredTruck && (
            <article className="bg-[#1A1A1A] border border-[#333333] hover:border-[#ff544b] transition-colors group relative p-5 h-full flex flex-col rounded">
              <div className="absolute top-3 right-3 z-10">
                <span className="bg-[#353534] text-white px-2 py-0.5 font-mono text-[10px] uppercase rounded border border-[#444]">
                  {slot2Tag}
                </span>
              </div>
              <div
                onClick={() => openProductDetail(featuredTruck)}
                className="h-36 w-full mb-3 flex items-center justify-center overflow-hidden cursor-pointer"
              >
                <img
                  src={featuredTruck.images[0]}
                  alt={featuredTruck.name}
                  className="object-contain h-full group-hover:scale-110 transition-transform duration-300 filter drop-shadow-md"
                />
              </div>
              <div className="mt-auto">
                <span className="text-[10px] font-mono text-[#ffb4ab] uppercase">{slot2Subtitle}</span>
                <h3
                  onClick={() => openProductDetail(featuredTruck)}
                  className="font-mono text-sm text-white font-bold mb-2 uppercase cursor-pointer hover:text-[#ff544b] transition-colors line-clamp-1"
                >
                  {featuredTruck.name}
                </h3>
                <div className="flex items-center justify-between mt-1 pt-2 border-t border-[#2a2a2a]">
                  <span className="font-mono text-lg text-[#ff544b] font-bold">
                    R$ {featuredTruck.salePrice.toFixed(2)}
                  </span>
                  <button
                    onClick={() => addToCart(featuredTruck)}
                    className="px-3 py-1.5 bg-[#ff544b] text-white font-mono text-xs uppercase hover:bg-white hover:text-[#ff544b] transition-colors rounded flex items-center gap-1"
                  >
                    <ShoppingCart className="w-3.5 h-3.5" />
                    Comprar
                  </button>
                </div>
              </div>
            </article>
          )}

          {/* Wheel Card */}
          {featuredWheel && (
            <article className="bg-[#1A1A1A] border border-[#333333] hover:border-[#ff544b] transition-colors group relative p-5 h-full flex flex-col rounded">
              <div className="absolute top-3 right-3 z-10">
                <span className="bg-[#353534] text-white px-2 py-0.5 font-mono text-[10px] uppercase rounded border border-[#444]">
                  {slot3Tag}
                </span>
              </div>
              <div
                onClick={() => openProductDetail(featuredWheel)}
                className="h-36 w-full mb-3 flex items-center justify-center overflow-hidden cursor-pointer"
              >
                <img
                  src={featuredWheel.images[0]}
                  alt={featuredWheel.name}
                  className="object-contain h-full group-hover:scale-110 transition-transform duration-300 filter drop-shadow-md"
                />
              </div>
              <div className="mt-auto">
                <span className="text-[10px] font-mono text-[#ffb4ab] uppercase">{slot3Subtitle}</span>
                <h3
                  onClick={() => openProductDetail(featuredWheel)}
                  className="font-mono text-sm text-white font-bold mb-2 uppercase cursor-pointer hover:text-[#ff544b] transition-colors line-clamp-1"
                >
                  {featuredWheel.name}
                </h3>
                <div className="flex items-center justify-between mt-1 pt-2 border-t border-[#2a2a2a]">
                  <span className="font-mono text-lg text-[#ff544b] font-bold">
                    R$ {featuredWheel.salePrice.toFixed(2)}
                  </span>
                  <button
                    onClick={() => addToCart(featuredWheel)}
                    className="px-3 py-1.5 bg-[#ff544b] text-white font-mono text-xs uppercase hover:bg-white hover:text-[#ff544b] transition-colors rounded flex items-center gap-1"
                  >
                    <ShoppingCart className="w-3.5 h-3.5" />
                    Comprar
                  </button>
                </div>
              </div>
            </article>
          )}
        </div>
      </div>
    </section>
  );
};
