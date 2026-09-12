'use client';

import React, { useState, useMemo } from 'react';
import { useStore } from './StoreContext';
import { Product } from '@/lib/skate-store';
import {
  Search,
  ShoppingCart,
  Eye,
  Check,
  SlidersHorizontal,
  Sparkles,
  Truck,
  ShieldCheck,
  RefreshCw,
  HelpCircle,
  Flame,
  ArrowRight,
  ChevronLeft,
  ChevronRight,
} from 'lucide-react';

// Card Media Component with Carousel Support for Multiple Photos
const ProductCardMedia: React.FC<{
  product: Product;
  onOpenDetail: (p: Product) => void;
}> = ({ product, onOpenDetail }) => {
  const [currentIdx, setCurrentIdx] = useState(0);
  const images = product.images && product.images.length > 0
    ? product.images
    : ['https://lh3.googleusercontent.com/aida-public/AB6AXuDfAUZUZdE_GrI_XZ3Mw6u0nQfx_ifYFGi-mXy1Svr0jL1hT9lU0gSEya_n83GTj6al_pT23g00qj802qDXxR2jLtTSY-BWL2pqhez02cIHNhrSpWBuGcSNsE7J4Mum9Iq-a9Hk1wvqHrTm8T3gUYuRTY24xpZCSHnMClO6h4eRcHRO1GxGdFLyPi5JFcDzrWx80QKTgfp0GJv0X9xep4INPafQK9irO4-kHBMR8i3YnSzWJWaqejb16A'];

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
      {product.badge && (
        <span className="absolute top-3 left-3 bg-[#ff544b] text-white font-mono text-[10px] uppercase font-bold px-2 py-0.5 rounded z-10 shadow">
          {product.badge}
        </span>
      )}

      <span className="absolute top-3 right-3 bg-[#201f1f]/90 text-gray-300 border border-[#353534] font-mono text-[10px] px-2 py-0.5 rounded z-10 uppercase">
        {product.brand}
      </span>

      {/* Main Image */}
      <img
        key={currentIdx}
        src={images[currentIdx] || images[0]}
        alt={`${product.name} - Foto ${currentIdx + 1}`}
        className="w-full h-full object-contain group-hover/media:scale-105 transition-transform duration-300 rounded animate-fadeIn"
        loading="lazy"
      />

      {/* Hover Overlay Button to open details */}
      <button
        type="button"
        onClick={() => onOpenDetail(product)}
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
            title="Foto anterior"
            className="absolute left-2 top-1/2 -translate-y-1/2 z-20 w-7 h-7 rounded-full bg-black/80 hover:bg-[#ff544b] text-white flex items-center justify-center border border-white/20 transition-all opacity-85 hover:opacity-100 shadow-md hover:scale-110 active:scale-95"
          >
            <ChevronLeft className="w-4 h-4" />
          </button>
          <button
            type="button"
            onClick={handleNext}
            aria-label="Próxima foto"
            title="Próxima foto"
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

export const ProductCatalog: React.FC = () => {
  const {
    products,
    openProductDetail,
    addToCart,
    searchQuery,
    setSearchQuery,
    categoryFilter,
    setCategoryFilter,
    setActiveTab,
  } = useStore();

  const [selectedBrand, setSelectedBrand] = useState<string>('Todas');
  const [selectedSubOption, setSelectedSubOption] = useState<string>('Todos');
  const [sortBy, setSortBy] = useState<'featured' | 'price-asc' | 'price-desc' | 'stock'>('featured');
  const [onlyInStock, setOnlyInStock] = useState(false);
  const [cardSelectedVariants, setCardSelectedVariants] = useState<Record<string, string>>({});
  const [addedFeedback, setAddedFeedback] = useState<string | null>(null);

  // Available brands dynamically computed based on category
  const availableBrands = useMemo(() => {
    const categoryProducts = products.filter((p) => {
      if (categoryFilter === 'Todos' || categoryFilter === '') return true;
      if (categoryFilter.toLowerCase() === 'hardware' || categoryFilter.toLowerCase() === 'acessórios') {
        return p.category.toLowerCase() === 'hardware' || p.category.toLowerCase() === 'acessórios';
      }
      return p.category.toLowerCase() === categoryFilter.toLowerCase();
    });

    const brandsSet = new Set<string>();
    categoryProducts.forEach((p) => {
      if (p.brand) brandsSet.add(p.brand);
    });

    return ['Todas', ...Array.from(brandsSet)];
  }, [products, categoryFilter]);

  // Sub-filter configuration per category
  const subFilterConfig = useMemo(() => {
    switch (categoryFilter) {
      case 'Decks':
        return {
          label: 'LARGURA (POLEGADAS):',
          options: ['Todos', '7.75"', '8.0"', '8.125"', '8.25"', '8.38"', '8.5"'],
        };
      case 'Trucks':
        return {
          label: 'MEDIDA / TRAVE (MM):',
          options: ['Todos', '129mm', '139mm', '144mm', '147mm', '149mm', '159mm'],
        };
      case 'Wheels':
        return {
          label: 'DIÂMETRO / DUREZA:',
          options: ['Todos', '52mm', '53mm', '54mm', '56mm', '99A / 99D', '101A / 101D'],
        };
      case 'Apparel':
        return {
          label: 'TAMANHO:',
          options: ['Todos', 'P', 'M', 'G', 'GG'],
        };
      case 'Hardware':
      case 'Acessórios':
        return {
          label: 'TIPO DE PEÇA:',
          options: ['Todos', 'Lixas', 'Rolamentos', 'Parafusos', 'Ferramentas'],
        };
      case 'Tênis':
        return {
          label: 'NUMERAÇÃO (BR):',
          options: ['Todos', '38', '39', '40', '41', '42', '43', '44'],
        };
      default:
        return {
          label: 'CATEGORIAS:',
          options: ['Todas', 'Shapes', 'Trucks', 'Rodas', 'Tênis', 'Vestuário', 'Hardware'],
        };
    }
  }, [categoryFilter]);

  // Search placeholder per category
  const searchPlaceholder = useMemo(() => {
    switch (categoryFilter) {
      case 'Decks':
        return 'Buscar shape, maple, marfim, 8.25, caveira...';
      case 'Trucks':
        return 'Buscar truck, 139mm, Independent, Thunder, Venture...';
      case 'Wheels':
        return 'Buscar rodas, 52mm, 54mm, Spitfire, conic...';
      case 'Apparel':
        return 'Buscar camiseta, moletom, boné, Independent...';
      case 'Hardware':
      case 'Acessórios':
        return 'Buscar lixa, parafuso, rolamento, Bones Reds, chave T...';
      case 'Tênis':
        return 'Buscar modelo, Vans, Dunk, Busenitz, camurça...';
      default:
        return 'Buscar peças, marcas, SKUs, especificações...';
    }
  }, [categoryFilter]);

  // Category metadata (Title, Badge, Descriptions, Badges)
  const categoryMeta = useMemo(() => {
    switch (categoryFilter) {
      case 'Decks':
        return {
          label: 'Shapes & Decks',
          tag: 'SHAPES',
          subtitle: 'Lâminas selecionadas de Hard Rock Maple canadense e Marfim nobre prensadas a frio com epóxi para pop seco e duradouro.',
          badge: 'MAPLE CANADENSE & MARFIM SELECIONADO',
          resultsLabel: 'shape(s)',
          valueProps: [
            { title: 'Cold-Pressed Epóxi', desc: 'Resistência extrema contra delaminação' },
            { title: 'Concave Calibrado', desc: 'Giro rápido e controle cirúrgico em flips' },
            { title: 'Furação Precisa CNC', desc: 'Encaixe milimétrico para todos os trucks' },
            { title: 'Envio com Lixa Opcional', desc: 'Pronto para montar e ir pra sessão' },
          ],
        };
      case 'Trucks':
        return {
          label: 'Trucks & Eixos',
          tag: 'TRUCKS',
          subtitle: 'Ligas de alumínio 356 T6 e eixos de titânio hollow projetados para moagem pesada em cantoneiras e curvas de resposta instantânea.',
          badge: 'LIGAS 356 T6 & TITÂNIO HOLLOW',
          resultsLabel: 'truck(s)',
          valueProps: [
            { title: 'Kingpin Hollow', desc: 'Redução de peso sem perda de resistência' },
            { title: 'Amortecedores Uretano Pro', desc: 'Retorno imediato nas curvas e manobras' },
            { title: 'Trave Reforçada', desc: 'Deslize suave no concreto e no ferro' },
            { title: 'Garantia de Fábrica', desc: 'Durabilidade extrema aprovada por skatistas' },
          ],
        };
      case 'Wheels':
        return {
          label: 'Rodas de Uretano',
          tag: 'RODAS',
          subtitle: 'Fórmulas anti-flatspot de alta resiliência para velocidade constante, aderência sob medida e slides previsíveis no asfalto e na pista.',
          badge: 'FÓRMULA ANTI-FLATSPOT HIGH REBOUND',
          resultsLabel: 'jogo(s) de rodas',
          valueProps: [
            { title: 'Anti-Flatspot Garantido', desc: 'Uretano que não deforma em powerslides' },
            { title: 'Durezas 99A e 101A/D', desc: 'Velocidade e grip ajustados ao seu piso' },
            { title: 'Cortes Conic & Classic', desc: 'Travamento perfeito nas bordas e cantoneiras' },
            { title: 'Deslize Controlado', desc: 'Mais estabilidade em manobras de borda' },
          ],
        };
      case 'Apparel':
        return {
          label: 'Vestuário & Streetwear',
          tag: 'VESTUÁRIO',
          subtitle: 'Camisetas pesadas de algodão 240g, moletons flanelados 3 cabos e modelagens boxy feitas para aguentar o atrito diário do skate.',
          badge: '100% ALGODÃO HEAVYWEIGHT 240G',
          resultsLabel: 'peça(s) de vestuário',
          valueProps: [
            { title: 'Algodão Heavyweight 240g', desc: 'Tecido denso que não amassa nem esgarça' },
            { title: 'Gola Ribana 3cm', desc: 'Gola pesada reforçada clássica streetwear' },
            { title: '1ª Troca Grátis', desc: 'Errou o tamanho? Trocamos sem complicações' },
            { title: 'Modelagem Boxy', desc: 'Caimento amplo para mobilidade na sessão' },
          ],
        };
      case 'Hardware':
      case 'Acessórios':
        return {
          label: 'Hardware & Acessórios',
          tag: 'HARDWARE',
          subtitle: 'Lixas emborrachadas microperfuradas, rolamentos de alta precisão, parafusos de aço temperado e ferramentas multifuncionais.',
          badge: 'PEÇAS DE PRECISÃO & MONTAGEM',
          resultsLabel: 'item(ns) de hardware',
          valueProps: [
            { title: 'Lixas Anti-Bolha', desc: 'Micro furos que evitam bolhas de ar' },
            { title: 'Rolamentos de Alta Precisão', desc: 'Velocidade máxima e rolagem prolongada' },
            { title: 'Aço Carbono Temperado', desc: 'Parafusos que não espanam nem soltam' },
            { title: 'Pronta Entrega Imediata', desc: 'Despacho rápido em até 24h úteis' },
          ],
        };
      case 'Tênis':
        return {
          label: 'Skate Footwear (Tênis)',
          tag: 'TÊNIS',
          subtitle: 'Construídos em camurça suína reforçada de 1.6mm, solados vulcanizados aderentes e palmilhas de absorção de impacto.',
          badge: 'COLEÇÃO SKATE FOOTWEAR OFICIAL',
          resultsLabel: 'modelo(s) de tênis',
          valueProps: [
            { title: 'Camurça Suína 1.6mm', desc: 'Alta durabilidade no atrito com a lixa' },
            { title: 'Solado Vulcanizado', desc: 'Borracha natural com boardfeel total' },
            { title: '1ª Troca Grátis', desc: 'Errou a numeração? Trocamos fácil' },
            { title: 'Despacho Rápido', desc: 'Pronta entrega com envio em até 24h' },
          ],
        };
      default:
        return {
          label: 'Catálogo Geral & Underground',
          tag: 'CATÁLOGO',
          subtitle: 'Equipamentos legítimos de skate, hardware, vestuário e calçados selecionados por quem vive o skate de verdade.',
          badge: 'ESTOQUE UNDERGROUND COMPLETO',
          resultsLabel: 'produto(s)',
          valueProps: [
            { title: '5% OFF no PIX', desc: 'Desconto automático direto no pagamento' },
            { title: '100% Peças Originais', desc: 'Produtos novos com garantia e procedência' },
            { title: 'Envio para Todo o Brasil', desc: 'Entrega rápida com código de rastreio' },
            { title: 'Suporte de Skatista', desc: 'Tire suas dúvidas técnicas com quem entende' },
          ],
        };
    }
  }, [categoryFilter]);

  // Main Filter Logic
  const filteredProducts = useMemo(() => {
    return products
      .filter((p) => {
        // Category filter
        if (categoryFilter !== 'Todos' && categoryFilter !== '') {
          const isHardwareFilter =
            categoryFilter.toLowerCase() === 'hardware' || categoryFilter.toLowerCase() === 'acessórios';
          const isHardwareProduct =
            p.category.toLowerCase() === 'hardware' || p.category.toLowerCase() === 'acessórios';

          if (isHardwareFilter) {
            if (!isHardwareProduct) return false;
          } else if (p.category.toLowerCase() !== categoryFilter.toLowerCase()) {
            return false;
          }
        }

        // Brand filter
        if (selectedBrand !== 'Todas') {
          if (p.brand.toLowerCase() !== selectedBrand.toLowerCase()) return false;
        }

        // In-stock flag
        if (onlyInStock && p.stockQuantity <= 0) {
          return false;
        }

        // Sub-filter (Sizes, Widths, Hardware Types, Categories)
        if (selectedSubOption !== 'Todos' && selectedSubOption !== 'Todas') {
          if (categoryFilter === 'Decks') {
            const hasSize = p.sizes?.includes(selectedSubOption);
            const inSpecs = p.specs?.some((s) => s.includes(selectedSubOption));
            const inName = p.name.includes(selectedSubOption);
            if (!hasSize && !inSpecs && !inName) return false;
          } else if (categoryFilter === 'Trucks') {
            const optNorm = selectedSubOption.toLowerCase();
            const hasSize = p.sizes?.some((s) => s.toLowerCase().includes(optNorm));
            const inSpecs = p.specs?.some((s) => s.toLowerCase().includes(optNorm));
            const inName = p.name.toLowerCase().includes(optNorm);
            if (!hasSize && !inSpecs && !inName) return false;
          } else if (categoryFilter === 'Wheels') {
            const cleanOpt = selectedSubOption.replace(' / 99D', '').replace(' / 101D', '');
            const inSizes = p.sizes?.some((s) => s.includes(cleanOpt));
            const inSpecs = p.specs?.some((s) => s.includes(cleanOpt));
            const inName = p.name.includes(cleanOpt);
            const inBadge = p.badge?.includes(cleanOpt);
            if (!inSizes && !inSpecs && !inName && !inBadge) return false;
          } else if (categoryFilter === 'Apparel') {
            if (!p.sizes?.includes(selectedSubOption)) return false;
          } else if (categoryFilter === 'Hardware' || categoryFilter === 'Acessórios') {
            const opt = selectedSubOption.toLowerCase();
            const text = `${p.name} ${p.specs?.join(' ')} ${p.description}`.toLowerCase();
            if (opt === 'lixas' && !text.includes('lixa')) return false;
            if (opt === 'rolamentos' && !text.includes('rolamento') && !text.includes('reds') && !text.includes('bearing')) return false;
            if (opt === 'parafusos' && !text.includes('parafuso') && !text.includes('bolt')) return false;
            if (opt === 'ferramentas' && !text.includes('chave') && !text.includes('tool')) return false;
          } else if (categoryFilter === 'Tênis') {
            if (!p.sizes?.includes(selectedSubOption)) return false;
          } else if (categoryFilter === 'Todos') {
            // Mapping category name from 'Shapes', 'Trucks', etc.
            const catMap: Record<string, string> = {
              Shapes: 'Decks',
              Trucks: 'Trucks',
              Rodas: 'Wheels',
              Tênis: 'Tênis',
              Vestuário: 'Apparel',
              Hardware: 'Hardware',
            };
            const mapped = catMap[selectedSubOption];
            if (mapped && p.category.toLowerCase() !== mapped.toLowerCase()) {
              if (mapped === 'Hardware' && p.category.toLowerCase() === 'acessórios') {
                // match
              } else {
                return false;
              }
            }
          }
        }

        // Search query
        if (searchQuery.trim() !== '') {
          const q = searchQuery.toLowerCase();
          const matchName = p.name.toLowerCase().includes(q);
          const matchBrand = p.brand.toLowerCase().includes(q);
          const matchCategory = p.category.toLowerCase().includes(q);
          const matchSku = p.sku.toLowerCase().includes(q);
          const matchSpecs = p.specs?.some((s) => s.toLowerCase().includes(q));
          if (!matchName && !matchBrand && !matchCategory && !matchSku && !matchSpecs) {
            return false;
          }
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
  }, [products, categoryFilter, selectedBrand, onlyInStock, selectedSubOption, searchQuery, sortBy]);

  const handleSelectCardVariant = (productId: string, variant: string) => {
    setCardSelectedVariants((prev) => ({
      ...prev,
      [productId]: variant,
    }));
  };

  const handleAddToCart = (product: Product) => {
    const chosenVariant =
      cardSelectedVariants[product.id] ||
      (product.sizes && product.sizes.length > 0 ? product.sizes[0] : undefined);

    addToCart(product, 1, chosenVariant);

    setAddedFeedback(product.id);
    setTimeout(() => {
      setAddedFeedback(null);
    }, 1800);
  };

  const resetFilters = () => {
    setSelectedBrand('Todas');
    setSelectedSubOption('Todos');
    setSearchQuery('');
    setOnlyInStock(false);
    setSortBy('featured');
  };

  const isFilterActive =
    selectedBrand !== 'Todas' ||
    (selectedSubOption !== 'Todos' && selectedSubOption !== 'Todas') ||
    searchQuery.trim() !== '' ||
    onlyInStock ||
    sortBy !== 'featured';

  return (
    <div className="w-full bg-[#131313] text-[#e5e2e1] min-h-screen">
      {/* Breadcrumb Navigation */}
      <div className="border-b border-[#262525] bg-[#181717]">
        <div className="max-w-[1440px] mx-auto px-4 md:px-12 py-3 flex items-center gap-2 font-mono text-xs text-gray-400">
          <button
            onClick={() => {
              setCategoryFilter('Todos');
              setActiveTab('home');
            }}
            className="hover:text-white transition-colors"
          >
            Início
          </button>
          <span>/</span>
          {categoryFilter !== 'Todos' && (
            <>
              <button
                onClick={() => {
                  setCategoryFilter('Todos');
                  resetFilters();
                }}
                className="hover:text-white transition-colors"
              >
                Catálogo
              </button>
              <span>/</span>
            </>
          )}
          <span className="text-[#ff544b] font-bold">{categoryMeta.label}</span>
        </div>
      </div>

      {/* Hero Banner for Category */}
      <div className="relative border-b border-[#353534] bg-gradient-to-b from-[#1c1b1b] via-[#161515] to-[#131313] py-12 md:py-16 px-4 md:px-12 overflow-hidden">
        <div className="absolute right-0 top-0 bottom-0 w-1/3 opacity-10 pointer-events-none flex items-center justify-center">
          <span className="font-display font-black text-9xl text-white select-none">
            {categoryMeta.tag}
          </span>
        </div>

        <div className="max-w-[1440px] mx-auto relative z-10">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded bg-[#ff544b]/10 border border-[#ff544b]/30 text-[#ff544b] font-mono text-xs font-bold uppercase mb-4 tracking-wider">
            <Sparkles className="w-3.5 h-3.5" />
            {categoryMeta.badge}
          </div>

          <h1 className="font-display text-4xl md:text-6xl font-black uppercase tracking-tight text-white mb-4">
            {categoryMeta.label}
          </h1>

          <p className="text-gray-300 text-sm md:text-base max-w-3xl leading-relaxed mb-8">
            {categoryMeta.subtitle}
          </p>

          {/* 4 Value Badges */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3 md:gap-4 font-mono text-xs">
            <div className="bg-[#201f1f]/80 border border-[#353534] p-3 rounded flex items-center gap-2.5">
              <ShieldCheck className="w-4 h-4 text-[#ff544b] flex-shrink-0" />
              <div>
                <strong className="block text-white">{categoryMeta.valueProps[0].title}</strong>
                <span className="text-gray-400 text-[11px]">{categoryMeta.valueProps[0].desc}</span>
              </div>
            </div>

            <div className="bg-[#201f1f]/80 border border-[#353534] p-3 rounded flex items-center gap-2.5">
              <Flame className="w-4 h-4 text-[#ffb4ab] flex-shrink-0" />
              <div>
                <strong className="block text-white">{categoryMeta.valueProps[1].title}</strong>
                <span className="text-gray-400 text-[11px]">{categoryMeta.valueProps[1].desc}</span>
              </div>
            </div>

            <div className="bg-[#201f1f]/80 border border-[#353534] p-3 rounded flex items-center gap-2.5">
              <RefreshCw className="w-4 h-4 text-[#ff544b] flex-shrink-0" />
              <div>
                <strong className="block text-white">{categoryMeta.valueProps[2].title}</strong>
                <span className="text-gray-400 text-[11px]">{categoryMeta.valueProps[2].desc}</span>
              </div>
            </div>

            <div className="bg-[#201f1f]/80 border border-[#353534] p-3 rounded flex items-center gap-2.5">
              <Truck className="w-4 h-4 text-[#ffb4ab] flex-shrink-0" />
              <div>
                <strong className="block text-white">{categoryMeta.valueProps[3].title}</strong>
                <span className="text-gray-400 text-[11px]">{categoryMeta.valueProps[3].desc}</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Main Content Area */}
      <div className="max-w-[1440px] mx-auto px-4 md:px-12 py-8">
        {/* Dynamic Filter and Control Bar (Matching user screenshot) */}
        <div className="bg-[#181717] border border-[#353534] p-4 md:p-6 rounded mb-8 space-y-4 shadow-lg">
          {/* Top Row: Search | Brand chips | In-Stock checkbox | Sort select */}
          <div className="flex flex-col lg:flex-row gap-4 items-start lg:items-center justify-between">
            {/* Search Input */}
            <div className="relative w-full lg:w-72">
              <Search className="w-4 h-4 text-gray-400 absolute left-3 top-2.5" />
              <input
                type="text"
                placeholder={searchPlaceholder}
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

            {/* Stock checkbox & Sort select */}
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
                className="bg-[#201f1f] border border-[#353534] text-white px-2.5 py-1.5 rounded focus:border-[#ff544b] cursor-pointer"
              >
                <option value="featured">Mais Relevantes</option>
                <option value="price-asc">Menor Preço</option>
                <option value="price-desc">Maior Preço</option>
                <option value="stock">Maior Estoque</option>
              </select>
            </div>
          </div>

          {/* Sub-Filter Row (Sizes / Width / Measurement / Hardware Type) */}
          <div className="pt-3 border-t border-[#2a2929] flex flex-wrap items-center justify-between gap-2 font-mono text-xs">
            <div className="flex flex-wrap items-center gap-2">
              <span className="text-gray-400 mr-2 text-[11px] uppercase font-bold flex items-center gap-1">
                <SlidersHorizontal className="w-3 h-3 text-[#ff544b]" />
                {subFilterConfig.label}
              </span>
              {subFilterConfig.options.map((opt) => (
                <button
                  key={opt}
                  onClick={() => setSelectedSubOption(opt)}
                  className={`min-w-8 h-8 px-2.5 rounded transition-colors flex items-center justify-center font-bold ${
                    selectedSubOption === opt
                      ? 'bg-[#ff544b] text-white'
                      : 'bg-[#201f1f] text-gray-300 hover:bg-[#2c2b2b] border border-[#353534]'
                  }`}
                >
                  {opt}
                </button>
              ))}
            </div>

            {/* Clear filters button */}
            {isFilterActive && (
              <button
                onClick={resetFilters}
                className="text-[11px] text-[#ff544b] hover:underline font-mono"
              >
                Limpar filtros
              </button>
            )}
          </div>
        </div>

        {/* Results Header Count */}
        <div className="flex justify-between items-center mb-6 font-mono text-xs text-gray-400">
          <span>
            Exibindo <strong className="text-white">{filteredProducts.length}</strong> {categoryMeta.resultsLabel}
            {selectedBrand !== 'Todas' && ` da marca ${selectedBrand}`}
            {selectedSubOption !== 'Todos' && selectedSubOption !== 'Todas' && ` no filtro ${selectedSubOption}`}
          </span>
          <span className="text-emerald-400 flex items-center gap-1">
            <Check className="w-3.5 h-3.5" /> Pronta entrega
          </span>
        </div>

        {/* Products Grid */}
        {filteredProducts.length === 0 ? (
          <div className="bg-[#181717] border border-[#353534] rounded p-12 text-center max-w-lg mx-auto space-y-4">
            <HelpCircle className="w-12 h-12 text-gray-500 mx-auto" />
            <h3 className="font-display text-xl uppercase font-bold text-white">
              Nenhum produto encontrado
            </h3>
            <p className="text-gray-400 text-xs font-sans">
              Não encontramos nenhum item com os filtros selecionados. Tente selecionar outra opção ou limpar a busca.
            </p>
            <button
              onClick={resetFilters}
              className="bg-[#ff544b] text-white font-mono text-xs uppercase px-4 py-2 rounded font-bold hover:bg-[#ff3b30] transition-colors"
            >
              Ver todos os modelos
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredProducts.map((p) => {
              const currentChosenVariant =
                cardSelectedVariants[p.id] ||
                (p.sizes && p.sizes.length > 0 ? p.sizes[0] : undefined);
              const isLowStock = p.stockQuantity > 0 && p.stockQuantity <= 5;
              const isOutOfStock = p.stockQuantity <= 0;
              const pixPrice = (p.salePrice * 0.95).toFixed(2);
              const installmentPrice5x = (p.salePrice / 5).toFixed(2);

              return (
                <div
                  key={p.id}
                  className="bg-[#181717] border border-[#353534] hover:border-[#ff544b] rounded flex flex-col justify-between transition-all duration-300 group overflow-hidden"
                >
                  {/* Card Header & Image */}
                  <div>
                    <ProductCardMedia product={p} onOpenDetail={openProductDetail} />

                    {/* Card Body */}
                    <div className="p-5 space-y-3">
                      <div>
                        <div className="flex justify-between items-center">
                          <span className="font-mono text-[10px] text-gray-400 uppercase tracking-wider block">
                            SKU: {p.sku}
                          </span>
                          <span className="font-mono text-[10px] text-[#ffb4ab] uppercase">
                            {p.category}
                          </span>
                        </div>
                        <h3
                          onClick={() => openProductDetail(p)}
                          className="font-display text-lg font-bold uppercase text-white hover:text-[#ff544b] transition-colors cursor-pointer line-clamp-1 mt-0.5"
                        >
                          {p.name}
                        </h3>
                      </div>

                      {/* Specs pills */}
                      <div className="flex flex-wrap gap-1">
                        {p.specs?.slice(0, 2).map((spec, i) => (
                          <span
                            key={i}
                            className="bg-[#201f1f] border border-[#2e2d2d] text-gray-300 font-mono text-[9px] px-2 py-0.5 rounded"
                          >
                            {spec}
                          </span>
                        ))}
                      </div>

                      {/* Variant/Size Selector directly on the card */}
                      {p.sizes && p.sizes.length > 0 && (
                        <div className="pt-2">
                          <span className="font-mono text-[10px] text-gray-400 uppercase font-bold block mb-1.5">
                            {categoryFilter === 'Decks'
                              ? 'Largura do Shape:'
                              : categoryFilter === 'Trucks'
                              ? 'Medida da Trave:'
                              : categoryFilter === 'Wheels'
                              ? 'Diâmetro:'
                              : categoryFilter === 'Tênis'
                              ? 'Numeração (BR):'
                              : 'Tamanho:'}
                          </span>
                          <div className="flex flex-wrap gap-1.5">
                            {p.sizes.map((sz) => (
                              <button
                                key={sz}
                                onClick={() => handleSelectCardVariant(p.id, sz)}
                                className={`text-[11px] font-mono font-bold px-2 py-1 rounded transition-colors ${
                                  currentChosenVariant === sz
                                    ? 'bg-[#ff544b] text-white'
                                    : 'bg-[#201f1f] text-gray-400 hover:text-white border border-[#353534]'
                                }`}
                              >
                                {sz}
                              </button>
                            ))}
                          </div>
                        </div>
                      )}

                      {/* Stock Warning Badge */}
                      <div className="pt-1">
                        {isOutOfStock ? (
                          <span className="text-[11px] font-mono text-red-400 font-bold flex items-center gap-1">
                            ✕ Esgotado no momento
                          </span>
                        ) : isLowStock ? (
                          <span className="text-[11px] font-mono text-amber-400 font-bold flex items-center gap-1">
                            ⚠️ Restam apenas {p.stockQuantity} un em estoque
                          </span>
                        ) : (
                          <span className="text-[11px] font-mono text-emerald-400 flex items-center gap-1">
                            ✓ {p.stockQuantity} unidades disponíveis
                          </span>
                        )}
                      </div>
                    </div>
                  </div>

                  {/* Card Footer / Price & Quick Add */}
                  <div className="p-5 pt-0 border-t border-[#262525] mt-2 space-y-3">
                    <div className="flex justify-between items-end pt-3">
                      <div>
                        <span className="font-mono text-[10px] text-gray-400 block">Preço à vista</span>
                        <div className="flex items-baseline gap-1.5">
                          <span className="font-mono text-xl font-black text-white">
                            R$ {pixPrice}
                          </span>
                          <span className="text-[10px] font-mono bg-emerald-950/80 text-emerald-400 border border-emerald-800/60 px-1 rounded font-bold">
                            -5% PIX
                          </span>
                        </div>
                        <span className="font-mono text-[10px] text-gray-400 block mt-0.5">
                          ou até 5x de R$ {installmentPrice5x} s/ juros
                        </span>
                      </div>
                    </div>

                    <div className="flex gap-2">
                      <button
                        onClick={() => handleAddToCart(p)}
                        disabled={isOutOfStock}
                        className={`flex-1 font-mono text-xs uppercase font-bold py-2.5 px-3 rounded flex items-center justify-center gap-2 transition-colors ${
                          addedFeedback === p.id
                            ? 'bg-emerald-600 text-white'
                            : isOutOfStock
                            ? 'bg-[#252424] text-gray-500 cursor-not-allowed border border-[#353534]'
                            : 'bg-[#ff544b] text-white hover:bg-[#ff3b30]'
                        }`}
                      >
                        {addedFeedback === p.id ? (
                          <>
                            <Check className="w-4 h-4" /> Adicionado!
                          </>
                        ) : isOutOfStock ? (
                          'Sem Estoque'
                        ) : (
                          <>
                            <ShoppingCart className="w-4 h-4" />
                            Comprar {currentChosenVariant ? `(${currentChosenVariant})` : ''}
                          </>
                        )}
                      </button>

                      <button
                        onClick={() => openProductDetail(p)}
                        title="Ver especificações completas"
                        className="p-2.5 bg-[#201f1f] text-gray-300 hover:text-white hover:bg-[#2a2929] border border-[#353534] rounded transition-colors"
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

        {/* Technical Guide Section at the bottom */}
        <div className="mt-16 border-t border-[#353534] pt-12">
          <div className="bg-[#181717] border border-[#353534] rounded-lg p-6 md:p-8">
            <div className="flex items-center gap-2 text-[#ff544b] font-mono text-xs uppercase font-bold mb-2">
              <Sparkles className="w-4 h-4" /> Guia Técnico Florishop Underground
            </div>

            {categoryFilter === 'Decks' && (
              <div>
                <h3 className="font-display text-2xl font-bold uppercase text-white mb-4">
                  Como Escolher a Largura do seu Shape
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6 font-sans text-xs text-gray-300 leading-relaxed">
                  <div className="bg-[#201f1f] p-4 rounded border border-[#2d2c2c]">
                    <strong className="text-white font-mono text-sm block mb-1">7.75&quot; a 8.0&quot; (Street Técnico)</strong>
                    <p>
                      Ideal para quem calça até 39 e busca manobras rápidas de flip. Mais leve para girar, com menor área de pouso.
                    </p>
                  </div>
                  <div className="bg-[#201f1f] p-4 rounded border border-[#2d2c2c]">
                    <strong className="text-white font-mono text-sm block mb-1">8.125&quot; a 8.38&quot; (O Padrão Atual)</strong>
                    <p>
                      A medida mais versátil do skate moderno. Equilibra estabilidade nas bordas, firmeza no corrimão e controle absoluto no pop.
                    </p>
                  </div>
                  <div className="bg-[#201f1f] p-4 rounded border border-[#2d2c2c]">
                    <strong className="text-white font-mono text-sm block mb-1">8.5&quot; ou mais (Bowl, Park & Transição)</strong>
                    <p>
                      Perfeito para quem anda em transições rápidas ou tem pés a partir do 42. Máxima área para travar grinds e voar alto.
                    </p>
                  </div>
                </div>
              </div>
            )}

            {categoryFilter === 'Trucks' && (
              <div>
                <h3 className="font-display text-2xl font-bold uppercase text-white mb-4">
                  Tabela de Compatibilidade: Truck x Shape
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6 font-sans text-xs text-gray-300 leading-relaxed">
                  <div className="bg-[#201f1f] p-4 rounded border border-[#2d2c2c]">
                    <strong className="text-white font-mono text-sm block mb-1">129mm / 139mm</strong>
                    <p>
                      Compatível com shapes de 7.5&quot; até 8.125&quot;. Mantém as rodas alinhadas com a lateral do shape sem sobrar para fora.
                    </p>
                  </div>
                  <div className="bg-[#201f1f] p-4 rounded border border-[#2d2c2c]">
                    <strong className="text-white font-mono text-sm block mb-1">144mm / 147mm / 149mm</strong>
                    <p>
                      O par ideal para shapes 8.25&quot; a 8.5&quot;. Proporciona base firme para manobras de corrimão e curbs sem travar o calçado.
                    </p>
                  </div>
                  <div className="bg-[#201f1f] p-4 rounded border border-[#2d2c2c]">
                    <strong className="text-white font-mono text-sm block mb-1">159mm ou superior</strong>
                    <p>
                      Desenhado para shapes 8.5&quot; até 9.0&quot; e cruisers. Oferece tração e controle inabalável em curvas e altas velocidades.
                    </p>
                  </div>
                </div>
              </div>
            )}

            {categoryFilter === 'Wheels' && (
              <div>
                <h3 className="font-display text-2xl font-bold uppercase text-white mb-4">
                  Entendendo Dureza e Diâmetro das Rodas
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6 font-sans text-xs text-gray-300 leading-relaxed">
                  <div className="bg-[#201f1f] p-4 rounded border border-[#2d2c2c]">
                    <strong className="text-white font-mono text-sm block mb-1">Dureza 99A vs. 101A/101D</strong>
                    <p>
                      As rodas 99A oferecem mais grip e absorção em pisos rugosos ou asfalto de rua. As 101A/101D são mais duras, gerando velocidade explosiva e powerslides perfeitos em pistas de concreto polido.
                    </p>
                  </div>
                  <div className="bg-[#201f1f] p-4 rounded border border-[#2d2c2c]">
                    <strong className="text-white font-mono text-sm block mb-1">Diâmetro (52mm a 56mm)</strong>
                    <p>
                      Rodas menores (52mm - 53mm) aceleram rápido e reduzem o peso para manobras de solo. Rodas maiores (54mm - 56mm) mantêm a inércia por mais tempo e não travam em pedrinhas.
                    </p>
                  </div>
                </div>
              </div>
            )}

            {categoryFilter === 'Apparel' && (
              <div>
                <h3 className="font-display text-2xl font-bold uppercase text-white mb-4">
                  Por que Usar Vestuário Heavyweight no Skate?
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6 font-sans text-xs text-gray-300 leading-relaxed">
                  <div className="bg-[#201f1f] p-4 rounded border border-[#2d2c2c]">
                    <strong className="text-white font-mono text-sm block mb-1">Gramatura 240g de Algodão</strong>
                    <p>
                      Camisetas comuns de 150g rasgam no primeiro contato com a lixa. Nossas peças usam malha encorpada de 240g que amortece quedas e dura anos sem perder a cor.
                    </p>
                  </div>
                  <div className="bg-[#201f1f] p-4 rounded border border-[#2d2c2c]">
                    <strong className="text-white font-mono text-sm block mb-1">Modelagem Boxy Fit</strong>
                    <p>
                      Corte reto com ombros caídos e gola alta de 3cm. Não sobe nos braços durante os movimentos e mantém a estética clássica do skate dos anos 90 e 2000.
                    </p>
                  </div>
                </div>
              </div>
            )}

            {categoryFilter === 'Hardware' && (
              <div>
                <h3 className="font-display text-2xl font-bold uppercase text-white mb-4">
                  Cuidados com Montagem e Manutenção do Skate
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6 font-sans text-xs text-gray-300 leading-relaxed">
                  <div className="bg-[#201f1f] p-4 rounded border border-[#2d2c2c]">
                    <strong className="text-white font-mono text-sm block mb-1">Aperto dos Parafusos</strong>
                    <p>
                      Aperte em cruz (em X) até a cabeça do parafuso afundar levemente na lixa sem esmagar as lâminas de madeira do shape.
                    </p>
                  </div>
                  <div className="bg-[#201f1f] p-4 rounded border border-[#2d2c2c]">
                    <strong className="text-white font-mono text-sm block mb-1">Lubrificação dos Rolamentos</strong>
                    <p>
                      Nunca use WD-40 comum! Use lubrificantes específicos para skate (Speed Cream ou óleo de silicone) para preservar as blindagens e esferas de aço.
                    </p>
                  </div>
                </div>
              </div>
            )}

            {categoryFilter === 'Tênis' && (
              <div>
                <h3 className="font-display text-2xl font-bold uppercase text-white mb-4">
                  Vulcanizado vs. Cupsole: Qual Escolher?
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6 font-sans text-xs text-gray-300 leading-relaxed">
                  <div className="bg-[#201f1f] p-4 rounded border border-[#2d2c2c]">
                    <strong className="text-white font-mono text-sm block mb-1">Solado Vulcanizado (Vulc)</strong>
                    <p>
                      Solado mais flexível e colado a quente. Proporciona o melhor contato e sensibilidade com o skate (boardfeel imediato) desde o primeiro dia de uso.
                    </p>
                  </div>
                  <div className="bg-[#201f1f] p-4 rounded border border-[#2d2c2c]">
                    <strong className="text-white font-mono text-sm block mb-1">Solado Caixa (Cupsole)</strong>
                    <p>
                      Solado de borracha costurado com entressola em EVA. Ideal para quem anda em escadarias e gaps altos, proporcionando absorção máxima de impacto nos calcanhares.
                    </p>
                  </div>
                </div>
              </div>
            )}

            {categoryFilter === 'Todos' && (
              <div>
                <h3 className="font-display text-2xl font-bold uppercase text-white mb-4">
                  Montando seu Skate Completo na Florishop
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6 font-sans text-xs text-gray-300 leading-relaxed">
                  <div className="bg-[#201f1f] p-4 rounded border border-[#2d2c2c]">
                    <strong className="text-white font-mono text-sm block mb-1">1. Escolha a Peça Base</strong>
                    <p>Selecione a largura do shape compatível com seu estilo e calçado (7.75&quot; a 8.5&quot;).</p>
                  </div>
                  <div className="bg-[#201f1f] p-4 rounded border border-[#2d2c2c]">
                    <strong className="text-white font-mono text-sm block mb-1">2. Combine Trucks e Rodas</strong>
                    <p>Certifique-se de que a largura do truck case perfeitamente com a borda do shape.</p>
                  </div>
                  <div className="bg-[#201f1f] p-4 rounded border border-[#2d2c2c]">
                    <strong className="text-white font-mono text-sm block mb-1">3. Finalize com Hardware Pro</strong>
                    <p>Lixas emborrachadas e parafusos de base de 1&quot; para montagem sem folgas.</p>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
