'use client';

import React, { useState, useMemo } from 'react';
import { useStore } from './StoreContext';
import { Product } from '@/lib/skate-store';
import {
  ShoppingBag,
  SlidersHorizontal,
  Search,
  Check,
  Zap,
  ShieldCheck,
  Truck,
  RotateCcw,
  Sparkles,
  ArrowRight,
  HelpCircle,
  Eye,
  ChevronLeft,
  ChevronRight
} from 'lucide-react';

const ShoeCardMedia: React.FC<{
  shoe: Product;
  onOpenDetail: (p: Product) => void;
}> = ({ shoe, onOpenDetail }) => {
  const [currentIdx, setCurrentIdx] = useState(0);
  const images = shoe.images && shoe.images.length > 0 ? shoe.images : [shoe.images[0]];
  const hasMultiple = images.length > 1;

  const handlePrev = (e: React.MouseEvent) => {
    e.stopPropagation();
    setCurrentIdx((prev) => (prev > 0 ? prev - 1 : images.length - 1));
  };

  const handleNext = (e: React.MouseEvent) => {
    e.stopPropagation();
    setCurrentIdx((prev) => (prev < images.length - 1 ? prev + 1 : 0));
  };

  return (
    <div className="relative h-64 bg-[#121212] overflow-hidden flex items-center justify-center p-4 group/media select-none">
      {shoe.badge && (
        <span className="absolute top-3 left-3 bg-[#ff544b] text-white font-mono text-[10px] uppercase font-bold px-2 py-0.5 rounded z-10 shadow">
          {shoe.badge}
        </span>
      )}

      <span className="absolute top-3 right-3 bg-[#201f1f]/90 text-gray-300 border border-[#353534] font-mono text-[10px] px-2 py-0.5 rounded z-10 uppercase">
        {shoe.brand}
      </span>

      {/* Product Image */}
      <img
        key={currentIdx}
        src={images[currentIdx] || images[0]}
        alt={`${shoe.name} - Foto ${currentIdx + 1}`}
        className="w-full h-full object-contain group-hover/media:scale-105 transition-transform duration-300 rounded animate-fadeIn"
        loading="lazy"
      />

      {/* Hover Overlay Button to open details */}
      <button
        type="button"
        onClick={() => onOpenDetail(shoe)}
        className="absolute inset-0 bg-black/40 opacity-0 group-hover/media:opacity-100 transition-opacity flex items-center justify-center gap-2 font-mono text-xs text-white font-bold"
      >
        <span className="bg-[#201f1f] px-3 py-1.5 rounded border border-[#ff544b] flex items-center gap-1.5 shadow-lg">
          <Eye className="w-3.5 h-3.5 text-[#ff544b]" /> Ver Detalhes
        </span>
      </button>

      {/* Mini Next / Prev controls when multiple photos */}
      {hasMultiple && (
        <>
          <button
            type="button"
            onClick={handlePrev}
            aria-label="Foto anterior"
            className="absolute left-2 top-1/2 -translate-y-1/2 z-20 w-7 h-7 rounded-full bg-black/80 hover:bg-[#ff544b] text-white flex items-center justify-center border border-white/20 transition-all opacity-85 hover:opacity-100 shadow-md hover:scale-110 active:scale-95"
          >
            <ChevronLeft className="w-4 h-4" />
          </button>
          <button
            type="button"
            onClick={handleNext}
            aria-label="Próxima foto"
            className="absolute right-2 top-1/2 -translate-y-1/2 z-20 w-7 h-7 rounded-full bg-black/80 hover:bg-[#ff544b] text-white flex items-center justify-center border border-white/20 transition-all opacity-85 hover:opacity-100 shadow-md hover:scale-110 active:scale-95"
          >
            <ChevronRight className="w-4 h-4" />
          </button>

          {/* Dots Indicator */}
          <div className="absolute bottom-2 left-1/2 -translate-x-1/2 z-20 flex items-center gap-1 bg-black/70 px-2 py-0.5 rounded-full border border-white/10 pointer-events-none">
            {images.map((_, idx) => (
              <div
                key={idx}
                className={`h-1.5 rounded-full transition-all ${
                  currentIdx === idx ? 'w-3.5 bg-[#ff544b]' : 'w-1.5 bg-white/40'
                }`}
              />
            ))}
          </div>
        </>
      )}
    </div>
  );
};

export const TenisView: React.FC = () => {
  const { products, addToCart, openProductDetail, setActiveTab } = useStore();

  // Local filter states for the Tênis screen
  const [selectedBrand, setSelectedBrand] = useState<string>('Todas');
  const [selectedSize, setSelectedSize] = useState<string>('Todos');
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [sortBy, setSortBy] = useState<'featured' | 'price-asc' | 'price-desc' | 'stock'>('featured');
  const [onlyInStock, setOnlyInStock] = useState<boolean>(false);
  
  // Track selected size for each card before adding to cart
  const [cardSelectedSizes, setCardSelectedSizes] = useState<{ [productId: string]: string }>({});
  const [addedFeedback, setAddedFeedback] = useState<string | null>(null);

  // Available brands in the Tênis collection
  const availableBrands = ['Todas', 'Florishop', 'Vans', 'Nike SB', 'Adidas', 'DC Shoes'];
  const availableSizes = ['Todos', '38', '39', '40', '41', '42', '43', '44'];

  // Filter products by Tênis category
  const tenisProducts = useMemo(() => {
    return products.filter((p) => p.category === 'Tênis');
  }, [products]);

  // Apply filters
  const filteredShoes = useMemo(() => {
    return tenisProducts
      .filter((shoe) => {
        // Brand filter
        if (selectedBrand !== 'Todas' && shoe.brand.toLowerCase() !== selectedBrand.toLowerCase()) {
          return false;
        }

        // Size filter
        if (selectedSize !== 'Todos') {
          if (!shoe.sizes || !shoe.sizes.includes(selectedSize)) {
            return false;
          }
        }

        // Stock filter
        if (onlyInStock && shoe.stockQuantity <= 0) {
          return false;
        }

        // Search query
        if (searchQuery.trim() !== '') {
          const q = searchQuery.toLowerCase();
          const matchName = shoe.name.toLowerCase().includes(q);
          const matchBrand = shoe.brand.toLowerCase().includes(q);
          const matchSku = shoe.sku.toLowerCase().includes(q);
          const matchSpecs = shoe.specs?.some((s) => s.toLowerCase().includes(q));
          if (!matchName && !matchBrand && !matchSku && !matchSpecs) return false;
        }

        return true;
      })
      .sort((a, b) => {
        if (sortBy === 'price-asc') return a.salePrice - b.salePrice;
        if (sortBy === 'price-desc') return b.salePrice - a.salePrice;
        if (sortBy === 'stock') return b.stockQuantity - a.stockQuantity;
        // 'featured'
        if (a.featured && !b.featured) return -1;
        if (!a.featured && b.featured) return 1;
        return 0;
      });
  }, [tenisProducts, selectedBrand, selectedSize, searchQuery, sortBy, onlyInStock]);

  const handleSelectCardSize = (productId: string, size: string) => {
    setCardSelectedSizes((prev) => ({
      ...prev,
      [productId]: size,
    }));
  };

  const handleAddToCart = (shoe: Product) => {
    const chosenSize = cardSelectedSizes[shoe.id] || (shoe.sizes && shoe.sizes.length > 0 ? shoe.sizes[0] : undefined);
    addToCart(shoe, 1, chosenSize);
    
    setAddedFeedback(shoe.id);
    setTimeout(() => {
      setAddedFeedback(null);
    }, 1800);
  };

  return (
    <div className="w-full bg-[#131313] text-[#e5e2e1] min-h-screen">
      {/* Breadcrumb navigation */}
      <div className="border-b border-[#262525] bg-[#181717]">
        <div className="max-w-[1440px] mx-auto px-4 md:px-12 py-3 flex items-center gap-2 font-mono text-xs text-gray-400">
          <button
            onClick={() => setActiveTab('home')}
            className="hover:text-white transition-colors"
          >
            Início
          </button>
          <span>/</span>
          <button
            onClick={() => setActiveTab('catalog')}
            className="hover:text-white transition-colors"
          >
            Catálogo
          </button>
          <span>/</span>
          <span className="text-[#ff544b] font-bold">Skate Footwear (Tênis)</span>
        </div>
      </div>

      {/* Hero Banner for Tênis */}
      <div className="relative border-b border-[#353534] bg-gradient-to-b from-[#1c1b1b] via-[#161515] to-[#131313] py-12 md:py-16 px-4 md:px-12 overflow-hidden">
        <div className="absolute right-0 top-0 bottom-0 w-1/3 opacity-10 pointer-events-none flex items-center justify-center">
          <span className="font-display font-black text-9xl text-white select-none">SK8</span>
        </div>

        <div className="max-w-[1440px] mx-auto relative z-10">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded bg-[#ff544b]/10 border border-[#ff544b]/30 text-[#ff544b] font-mono text-xs font-bold uppercase mb-4 tracking-wider">
            <Sparkles className="w-3.5 h-3.5" />
            Coleção Skate Footwear Oficial
          </div>

          <h1 className="font-display text-4xl md:text-6xl font-black uppercase tracking-tight text-white mb-4">
            Tênis de Skate de Alta Resistência
          </h1>
          
          <p className="max-w-2xl text-gray-400 font-sans text-sm md:text-base leading-relaxed mb-8">
            Desenvolvidos especificamente para o atrito contínuo da lixa. Solados vulcanizados com grip brutal,
            cabedais em camurça pesada e palmilhas anatômicas com proteção contra impactos de escadarias e transições.
          </p>

          {/* Value Badges */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 font-mono text-xs max-w-4xl">
            <div className="bg-[#201f1f]/80 border border-[#353534] p-3 rounded flex items-center gap-2.5">
              <ShieldCheck className="w-4 h-4 text-[#ff544b] flex-shrink-0" />
              <div>
                <strong className="block text-white">Camurça Suína</strong>
                <span className="text-gray-400 text-[11px]">Durabilidade no ollie</span>
              </div>
            </div>

            <div className="bg-[#201f1f]/80 border border-[#353534] p-3 rounded flex items-center gap-2.5">
              <Zap className="w-4 h-4 text-emerald-400 flex-shrink-0" />
              <div>
                <strong className="block text-white">Grip Vulcanizado</strong>
                <span className="text-gray-400 text-[11px]">Boardfeel milimétrico</span>
              </div>
            </div>

            <div className="bg-[#201f1f]/80 border border-[#353534] p-3 rounded flex items-center gap-2.5">
              <RotateCcw className="w-4 h-4 text-amber-400 flex-shrink-0" />
              <div>
                <strong className="block text-white">1ª Troca Grátis</strong>
                <span className="text-gray-400 text-[11px]">Errou o tamanho? Trocamos</span>
              </div>
            </div>

            <div className="bg-[#201f1f]/80 border border-[#353534] p-3 rounded flex items-center gap-2.5">
              <Truck className="w-4 h-4 text-[#ffb4ab] flex-shrink-0" />
              <div>
                <strong className="block text-white">Envio Imediato</strong>
                <span className="text-gray-400 text-[11px]">Despacho em até 24h</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Main Content Area */}
      <div className="max-w-[1440px] mx-auto px-4 md:px-12 py-8">
        {/* Filter and Control Bar */}
        <div className="bg-[#181717] border border-[#353534] p-4 md:p-6 rounded mb-8 space-y-4">
          <div className="flex flex-col lg:flex-row gap-4 items-start lg:items-center justify-between">
            {/* Search within Tênis */}
            <div className="relative w-full lg:w-72">
              <Search className="w-4 h-4 text-gray-400 absolute left-3 top-2.5" />
              <input
                type="text"
                placeholder="Buscar modelo, Vans, Dunk..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full bg-[#201f1f] border border-[#353534] text-xs text-white pl-9 pr-3 py-2 rounded font-mono focus:outline-none focus:border-[#ff544b]"
              />
            </div>

            {/* Brand Filter Chips */}
            <div className="flex items-center gap-1.5 flex-wrap font-mono text-xs">
              <span className="text-gray-400 mr-1 text-[11px] uppercase">Marca:</span>
              {availableBrands.map((b) => (
                <button
                  key={b}
                  onClick={() => setSelectedBrand(b)}
                  className={`px-3 py-1 rounded transition-colors ${
                    selectedBrand.toLowerCase() === b.toLowerCase()
                      ? 'bg-[#ff544b] text-white font-bold'
                      : 'bg-[#201f1f] text-gray-300 hover:text-white hover:bg-[#2a2929] border border-[#353534]'
                  }`}
                >
                  {b}
                </button>
              ))}
            </div>

            {/* Sort & Stock toggle */}
            <div className="flex items-center gap-3 w-full lg:w-auto justify-between lg:justify-end font-mono text-xs">
              <label className="flex items-center gap-1.5 cursor-pointer text-gray-300 hover:text-white select-none">
                <input
                  type="checkbox"
                  checked={onlyInStock}
                  onChange={(e) => setOnlyInStock(e.target.checked)}
                  className="accent-[#ff544b] rounded"
                />
                <span>Apenas em estoque</span>
              </label>

              <select
                value={sortBy}
                onChange={(e: any) => setSortBy(e.target.value)}
                className="bg-[#201f1f] border border-[#353534] text-white px-2.5 py-1.5 rounded focus:border-[#ff544b]"
              >
                <option value="featured">Mais Relevantes</option>
                <option value="price-asc">Menor Preço</option>
                <option value="price-desc">Maior Preço</option>
                <option value="stock">Maior Estoque</option>
              </select>
            </div>
          </div>

          {/* Size Filter Row */}
          <div className="pt-3 border-t border-[#2a2929] flex flex-wrap items-center gap-2 font-mono text-xs">
            <span className="text-gray-400 mr-2 text-[11px] uppercase font-bold flex items-center gap-1">
              <SlidersHorizontal className="w-3 h-3 text-[#ff544b]" />
              Numeração (BR):
            </span>
            {availableSizes.map((sz) => (
              <button
                key={sz}
                onClick={() => setSelectedSize(sz)}
                className={`min-w-8 h-8 px-2.5 rounded transition-colors flex items-center justify-center font-bold ${
                  selectedSize === sz
                    ? 'bg-[#ff544b] text-white'
                    : 'bg-[#201f1f] text-gray-300 hover:bg-[#2c2b2b] border border-[#353534]'
                }`}
              >
                {sz}
              </button>
            ))}
            {(selectedBrand !== 'Todas' || selectedSize !== 'Todos' || searchQuery !== '' || onlyInStock) && (
              <button
                onClick={() => {
                  setSelectedBrand('Todas');
                  setSelectedSize('Todos');
                  setSearchQuery('');
                  setOnlyInStock(false);
                }}
                className="text-[11px] text-[#ff544b] hover:underline ml-auto font-mono"
              >
                Limpar filtros
              </button>
            )}
          </div>
        </div>

        {/* Results Header Count */}
        <div className="flex justify-between items-center mb-6 font-mono text-xs text-gray-400">
          <span>
            Exibindo <strong className="text-white">{filteredShoes.length}</strong> modelo(s) de tênis
            {selectedBrand !== 'Todas' && ` da marca ${selectedBrand}`}
            {selectedSize !== 'Todos' && ` no tamanho ${selectedSize}`}
          </span>
          <span className="text-emerald-400 flex items-center gap-1">
            <Check className="w-3.5 h-3.5" /> Pronta entrega
          </span>
        </div>

        {/* Shoes Grid */}
        {filteredShoes.length === 0 ? (
          <div className="bg-[#181717] border border-[#353534] rounded p-12 text-center max-w-lg mx-auto space-y-4">
            <HelpCircle className="w-12 h-12 text-gray-500 mx-auto" />
            <h3 className="font-display text-xl uppercase font-bold text-white">
              Nenhum tênis encontrado
            </h3>
            <p className="text-gray-400 text-xs font-sans">
              Não encontramos nenhum par com os filtros selecionados. Tente selecionar outra numeração ou limpar a busca.
            </p>
            <button
              onClick={() => {
                setSelectedBrand('Todas');
                setSelectedSize('Todos');
                setSearchQuery('');
                setOnlyInStock(false);
              }}
              className="bg-[#ff544b] text-white font-mono text-xs uppercase px-4 py-2 rounded font-bold hover:bg-[#ff3b30] transition-colors"
            >
              Ver todos os modelos
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredShoes.map((shoe) => {
              const currentChosenSize =
                cardSelectedSizes[shoe.id] || (shoe.sizes && shoe.sizes.length > 0 ? shoe.sizes[0] : 'Único');
              const isLowStock = shoe.stockQuantity > 0 && shoe.stockQuantity <= 5;
              const isOutOfStock = shoe.stockQuantity <= 0;
              const pixPrice = (shoe.salePrice * 0.95).toFixed(2);

              return (
                <div
                  key={shoe.id}
                  className="bg-[#181717] border border-[#353534] hover:border-[#ff544b] rounded flex flex-col justify-between transition-all duration-300 group overflow-hidden"
                >
                  {/* Card Header & Image */}
                  <div>
                    <ShoeCardMedia shoe={shoe} onOpenDetail={openProductDetail} />

                    {/* Card Body */}
                    <div className="p-5 space-y-3">
                      <div>
                        <span className="font-mono text-[10px] text-gray-400 uppercase tracking-wider block">
                          SKU: {shoe.sku}
                        </span>
                        <h3
                          onClick={() => openProductDetail(shoe)}
                          className="font-display text-lg font-bold uppercase text-white hover:text-[#ff544b] transition-colors cursor-pointer line-clamp-1 mt-0.5"
                        >
                          {shoe.name}
                        </h3>
                      </div>

                      {/* Specs pills */}
                      <div className="flex flex-wrap gap-1">
                        {shoe.specs?.slice(0, 2).map((spec, i) => (
                          <span
                            key={i}
                            className="bg-[#201f1f] border border-[#2e2d2d] text-gray-300 font-mono text-[9px] px-2 py-0.5 rounded"
                          >
                            {spec}
                          </span>
                        ))}
                      </div>

                      {/* Size Selector on the card */}
                      {shoe.sizes && shoe.sizes.length > 0 && (
                        <div className="pt-2">
                          <span className="font-mono text-[10px] text-gray-400 uppercase font-bold block mb-1.5">
                            Selecione a Numeração:
                          </span>
                          <div className="flex flex-wrap gap-1.5 font-mono text-xs">
                            {shoe.sizes.map((sz) => {
                              const isSelected = currentChosenSize === sz;
                              return (
                                <button
                                  key={sz}
                                  type="button"
                                  onClick={() => handleSelectCardSize(shoe.id, sz)}
                                  className={`w-7 h-7 rounded text-[11px] font-bold flex items-center justify-center transition-colors ${
                                    isSelected
                                      ? 'bg-[#ff544b] text-white ring-1 ring-[#ff544b]'
                                      : 'bg-[#201f1f] text-gray-300 hover:bg-[#2c2b2b] border border-[#353534]'
                                  }`}
                                >
                                  {sz}
                                </button>
                              );
                            })}
                          </div>
                        </div>
                      )}

                      {/* Stock Warning */}
                      <div className="font-mono text-[11px] pt-1">
                        {isOutOfStock ? (
                          <span className="text-red-400 font-bold">Esgotado temporariamente</span>
                        ) : isLowStock ? (
                          <span className="text-amber-400 font-bold">
                            ⚠️ Apenas {shoe.stockQuantity} pares restantes!
                          </span>
                        ) : (
                          <span className="text-emerald-400">
                            ✓ {shoe.stockQuantity} pares em estoque (Pronta Entrega)
                          </span>
                        )}
                      </div>
                    </div>
                  </div>

                  {/* Card Footer: Price & Add to Cart */}
                  <div className="p-5 pt-0 border-t border-[#262525] mt-3 space-y-3">
                    <div className="pt-3">
                      <div className="flex items-baseline gap-2">
                        <span className="font-mono text-xl font-extrabold text-white">
                          R$ {shoe.salePrice.toFixed(2)}
                        </span>
                        <span className="font-mono text-[10px] text-[#ff544b] font-bold bg-[#ff544b]/10 px-1.5 py-0.5 rounded">
                          5% OFF NO PIX
                        </span>
                      </div>
                      <span className="font-mono text-[10px] text-gray-400 block mt-0.5">
                        ou R$ {pixPrice} à vista no PIX | até 5x de R$ {(shoe.salePrice / 5).toFixed(2)} sem juros
                      </span>
                    </div>

                    <div className="flex gap-2">
                      <button
                        onClick={() => handleAddToCart(shoe)}
                        disabled={isOutOfStock}
                        className={`flex-1 py-2.5 px-3 rounded font-mono text-xs uppercase font-bold flex items-center justify-center gap-1.5 transition-colors ${
                          isOutOfStock
                            ? 'bg-gray-800 text-gray-500 cursor-not-allowed'
                            : addedFeedback === shoe.id
                            ? 'bg-emerald-600 text-white'
                            : 'bg-[#ff544b] hover:bg-[#ff3b30] text-white shadow-md'
                        }`}
                      >
                        {addedFeedback === shoe.id ? (
                          <>
                            <Check className="w-4 h-4" /> Adicionado ({currentChosenSize})!
                          </>
                        ) : (
                          <>
                            <ShoppingBag className="w-4 h-4" />
                            Comprar ({currentChosenSize})
                          </>
                        )}
                      </button>

                      <button
                        onClick={() => openProductDetail(shoe)}
                        title="Ver especificações completas"
                        className="p-2.5 rounded bg-[#201f1f] hover:bg-[#2c2b2b] border border-[#353534] text-gray-300 hover:text-white"
                      >
                        <Eye className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}

        {/* Footwear Tech & Guide Section */}
        <div className="mt-16 border border-[#353534] bg-[#181717] rounded-lg p-6 md:p-10">
          <div className="max-w-3xl mb-8">
            <span className="font-mono text-xs font-bold text-[#ff544b] uppercase tracking-wider block mb-1">
              Guia Técnico Florishop
            </span>
            <h2 className="font-display text-2xl md:text-3xl font-black uppercase text-white">
              Vulcanizado vs. Cupsole: Qual tênis é ideal para você?
            </h2>
            <p className="text-gray-400 text-xs md:text-sm font-sans mt-2">
              A escolha da sola muda completamente o controle do skate e a proteção dos seus pés durante a sessão.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 font-sans text-xs">
            {/* Vulcanizado */}
            <div className="bg-[#201f1f] border border-[#353534] p-5 rounded space-y-3">
              <div className="flex items-center gap-2">
                <span className="w-3 h-3 rounded-full bg-[#ff544b]" />
                <h3 className="font-display font-bold text-sm text-white uppercase">
                  Solado Vulcanizado (Vulc)
                </h3>
              </div>
              <p className="text-gray-300 leading-relaxed">
                A borracha da sola é colada à lateral com fita vira aquecida. Oferece <strong>máximo boardfeel</strong> e sensibilidade para sentir o concave do shape nos pés.
              </p>
              <ul className="font-mono text-[11px] text-gray-400 space-y-1 list-disc list-inside">
                <li>Amaciamento imediato no primeiro dia</li>
                <li>Excelente para manobras técnicas e de solo</li>
                <li>Mais leve e flexível</li>
              </ul>
            </div>

            {/* Cupsole */}
            <div className="bg-[#201f1f] border border-[#353534] p-5 rounded space-y-3">
              <div className="flex items-center gap-2">
                <span className="w-3 h-3 rounded-full bg-emerald-400" />
                <h3 className="font-display font-bold text-sm text-white uppercase">
                  Solado Cupsole (Sola Caixa)
                </h3>
              </div>
              <p className="text-gray-300 leading-relaxed">
                Construído em uma peça única de borracha costurada na parte superior, muitas vezes com amortecedores internos em EVA ou bolsas de ar.
              </p>
              <ul className="font-mono text-[11px] text-gray-400 space-y-1 list-disc list-inside">
                <li>Máxima proteção contra calcanhar batido em gaps</li>
                <li>Maior sustentação para o tornozelo</li>
                <li>Estrutura resistente que dura mais tempo</li>
              </ul>
            </div>
          </div>

          {/* Quick FAQ footer note */}
          <div className="mt-8 pt-6 border-t border-[#2a2929] flex flex-col sm:flex-row items-center justify-between gap-4 font-mono text-xs">
            <span className="text-gray-400">
              Dúvidas sobre o tamanho ou caimento do modelo? Fale com nossos atendentes skatistas.
            </span>
            <button
              onClick={() => setActiveTab('catalog')}
              className="text-[#ff544b] hover:text-[#ff3b30] font-bold flex items-center gap-1 uppercase"
            >
              Explorar Todos os Produtos da Loja <ArrowRight className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
