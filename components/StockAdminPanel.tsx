'use client';

import React, { useState } from 'react';
import { useStore } from './StoreContext';
import {
  Product,
  calculateSalePriceFromMargin,
  calculateMarginFromSalePrice,
  calculateUnitProfit,
} from '@/lib/skate-store';
import {
  LayoutDashboard,
  DollarSign,
  TrendingUp,
  Package,
  AlertTriangle,
  Plus,
  Edit2,
  Trash2,
  Calculator,
  History,
  RotateCcw,
  Check,
  X,
  Search,
  ArrowUpRight,
  Sparkles,
  Eye,
  Filter,
  CheckCircle2,
  Star,
  ExternalLink,
  Upload,
  ShieldAlert,
  Users,
  ClipboardList,
  Database,
  Copy,
} from 'lucide-react';
import ProductImageUploader from './ProductImageUploader';
import { SupabaseSyncModal } from './SupabaseSyncModal';

const PRESET_IMAGES = [
  {
    label: 'Shape Pro Caveira',
    category: 'Decks',
    url: 'https://lh3.googleusercontent.com/aida-public/AB6AXuDfAUZUZdE_GrI_XZ3Mw6u0nQfx_ifYFGi-mXy1Svr0jL1hT9lU0gSEya_n83GTj6al_pT23g00qj802qDXxR2jLtTSY-BWL2pqhez02cIHNhrSpWBuGcSNsE7J4Mum9Iq-a9Hk1wvqHrTm8T3gUYuRTY24xpZCSHnMClO6h4eRcHRO1GxGdFLyPi5JFcDzrWx80QKTgfp0GJv0X9xep4INPafQK9irO4-kHBMR8i3YnSzWJWaqejb16A',
  },
  {
    label: 'Shape Concrete',
    category: 'Decks',
    url: 'https://lh3.googleusercontent.com/aida-public/AB6AXuCQPrqGOByOI__lr6TW0_2kPRl_5bz1M5PIJpu-r365swaNSsmKoVTaOQfOOLaPV66zZdzzYGVrq06_gGwqa8ihCz9j0kbl3U7767uepASsJSXT_oGtZeKJMaQhIb5ShVJH7ZXSGHlHI4sH_8nBQcaolNX6mn04Qgy-A2-quESi4H0lNQRSTyv-KlpxwgtbIrzUd77DbcLfEZcmcmPm_IlcwlW5Gxm7jO0OjLbzmxa9QCBpxWJcSeTkTw',
  },
  {
    label: 'Trucks Titanium',
    category: 'Trucks',
    url: 'https://lh3.googleusercontent.com/aida-public/AB6AXuBD8nnbw67dCK-36whhcuVpmpHFEHeRDIBEfAqjugpsG1UX7ctlRT9OtqivMZpaV0sQKAQTz2WflhyIdYp-odpDcrSa4kWzk-4KSp-I3Fxq4bLpWgyOdzKtwnLnh0ScyugjHs4o2byPck69FkPdAiJVEdDBuMBZVr4VHcI9A8DRhQV_2pCCUYC-1dY_DYxi5M04zqthxTDRz17meKLeKfQPChRnvalpXMEJ_Jkqdubk3OZXTotcpcswew',
  },
  {
    label: 'Rodas Street 54mm',
    category: 'Wheels',
    url: 'https://lh3.googleusercontent.com/aida-public/AB6AXuDfWJWQ9K6zbmR9_fkpnRV0UOTHoL6k766KS_pGuTFfqJNlm6tGe-UENGlxZKRfDahC0DqmQy2LfF3AJDOZ7DU39t5Rez3sWPNzj7-ctFenCZC0fMIywj6n0SVUTIWOlEemC-Lfdr0V-Wq6jUt2MbbvalwaGfId_j2XmjhvO8JwqCU8coGD-RnIS35g701A3FgZS-EzQv50fYUoauGZAReaNdnm1dNkf5KLvBqznj4PdTSL-3grtM7g0Q',
  },
  {
    label: 'Tênis Vans Skate Old Skool',
    category: 'Tênis',
    url: 'https://lh3.googleusercontent.com/aida-public/AB6AXuA0yP-6d1g4oN8-N5u4tI7nL9qX2rZ4bK3jF6hG5sM8vP0_VansOldSkoolSkateDuraCapBlackWhiteGrip',
  },
  {
    label: 'Camiseta Florishop Heavyweight',
    category: 'Apparel',
    url: 'https://lh3.googleusercontent.com/aida-public/AB6AXuDTj87-5z0f5mR5qM3pQ4sK8wN1xZ7vT9uY2eI5bL8aC4oH_TeeBlackOversizedUrbanSkateHeavyweight',
  },
];

export const StockAdminPanel: React.FC = () => {
  const {
    products,
    stockMovements,
    featuredConfig,
    updateFeaturedSlot,
    resetFeaturedConfig,
    addProduct,
    updateProduct,
    deleteProduct,
    adjustStockQuantity,
    resetToInitialData,
    setActiveTab,
    isAdmin,
    openAuthModal,
    users,
    orders,
  } = useStore();

  const [activeSubTab, setActiveSubTab] = useState<'inventory' | 'featured' | 'calculator' | 'movements'>('inventory');
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategoryFilter, setSelectedCategoryFilter] = useState('Todas');
  const [stockLevelFilter, setStockLevelFilter] = useState<'all' | 'low' | 'out' | 'available'>('all');

  // Featured Products Picker State
  const [pickerSlot, setPickerSlot] = useState<'slot1' | 'slot2' | 'slot3' | null>(null);
  const [pickerSearch, setPickerSearch] = useState('');
  const [pickerCategory, setPickerCategory] = useState('Todas');
  const [destaqueMenuProdId, setDestaqueMenuProdId] = useState<string | null>(null);

  // Modals state
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [isSupabaseModalOpen, setIsSupabaseModalOpen] = useState(false);
  const [editingProduct, setEditingProduct] = useState<Product | null>(null);
  const [productToDelete, setProductToDelete] = useState<Product | null>(null);

  // Toast feedback state
  const [toastMessage, setToastMessage] = useState<string | null>(null);
  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => {
      setToastMessage(null);
    }, 4000);
  };

  // Quick Calculator Subtab State
  const [calcCost, setCalcCost] = useState<number>(100);
  const [calcMargin, setCalcMargin] = useState<number>(100);
  const [calcSalePrice, setCalcSalePrice] = useState<number>(200);

  // New Product Form State
  const [newProdName, setNewProdName] = useState('');
  const [newProdCategory, setNewProdCategory] = useState<Product['category']>('Decks');
  const [newProdBrand, setNewProdBrand] = useState<Product['brand']>('Florishop');
  const [newProdCustomBrand, setNewProdCustomBrand] = useState('');
  const [newProdSku, setNewProdSku] = useState('');
  const [newProdCost, setNewProdCost] = useState<number>(120);
  const [newProdMargin, setNewProdMargin] = useState<number>(100);
  const [newProdSalePrice, setNewProdSalePrice] = useState<number>(240);
  const [newProdStock, setNewProdStock] = useState<number>(10);
  const [newProdImages, setNewProdImages] = useState<string[]>([]);
  const [newProdDescription, setNewProdDescription] = useState('');
  const [newProdBadge, setNewProdBadge] = useState('');
  const [newProdSpecs, setNewProdSpecs] = useState('7-PLY CANADIAN MAPLE, STREET');
  const [newProdSizes, setNewProdSizes] = useState('');
  const [newProdFeatured, setNewProdFeatured] = useState(false);
  const [clonedSourceName, setClonedSourceName] = useState<string | null>(null);

  // Edit Product Form State
  const [editName, setEditName] = useState('');
  const [editCategory, setEditCategory] = useState<Product['category']>('Decks');
  const [editBrand, setEditBrand] = useState<Product['brand']>('Florishop');
  const [editCustomBrand, setEditCustomBrand] = useState('');
  const [editSku, setEditSku] = useState('');
  const [editCost, setEditCost] = useState<number>(0);
  const [editMargin, setEditMargin] = useState<number>(0);
  const [editSalePrice, setEditSalePrice] = useState<number>(0);
  const [editStock, setEditStock] = useState<number>(0);
  const [editImages, setEditImages] = useState<string[]>([]);
  const [editDescription, setEditDescription] = useState('');
  const [editBadge, setEditBadge] = useState('');
  const [editSpecs, setEditSpecs] = useState('');
  const [editSizes, setEditSizes] = useState('');
  const [editFeatured, setEditFeatured] = useState(false);

  // Financial Metrics
  const totalCostValue = products.reduce((acc, p) => acc + p.purchasePrice * p.stockQuantity, 0);
  const totalPotentialRevenue = products.reduce((acc, p) => acc + p.salePrice * p.stockQuantity, 0);
  const totalPotentialProfit = totalPotentialRevenue - totalCostValue;
  const averageMargin =
    products.length > 0
      ? products.reduce((acc, p) => acc + p.profitMargin, 0) / products.length
      : 0;
  const lowStockCount = products.filter((p) => p.stockQuantity > 0 && p.stockQuantity <= 3).length;
  const outOfStockCount = products.filter((p) => p.stockQuantity === 0).length;

  // Filtered Products
  const filteredProducts = products.filter((p) => {
    // Search query
    if (searchTerm.trim()) {
      const q = searchTerm.toLowerCase();
      const matchSearch =
        p.name.toLowerCase().includes(q) ||
        p.sku.toLowerCase().includes(q) ||
        p.category.toLowerCase().includes(q) ||
        p.brand.toLowerCase().includes(q);
      if (!matchSearch) return false;
    }

    // Category filter
    if (selectedCategoryFilter !== 'Todas') {
      if (p.category.toLowerCase() !== selectedCategoryFilter.toLowerCase()) {
        return false;
      }
    }

    // Stock level filter
    if (stockLevelFilter === 'low') {
      return p.stockQuantity > 0 && p.stockQuantity <= 3;
    }
    if (stockLevelFilter === 'out') {
      return p.stockQuantity === 0;
    }
    if (stockLevelFilter === 'available') {
      return p.stockQuantity > 0;
    }

    return true;
  });

  // Open Edit Modal and populate fields
  const handleOpenEditModal = (p: Product) => {
    setEditingProduct(p);
    setEditName(p.name);
    setEditCategory(p.category);
    setEditBrand(p.brand);
    setEditCustomBrand(
      ['Florishop', 'Independent', 'Thunder', 'Venture', 'Spitfire', 'Vans', 'Nike SB', 'Adidas', 'DC Shoes'].includes(p.brand)
        ? ''
        : p.brand
    );
    setEditSku(p.sku);
    setEditCost(p.purchasePrice);
    setEditMargin(p.profitMargin);
    setEditSalePrice(p.salePrice);
    setEditStock(p.stockQuantity);
    setEditImages(p.images && p.images.length > 0 ? p.images : []);
    setEditDescription(p.description || '');
    setEditBadge(p.badge || '');
    setEditSpecs(p.specs ? p.specs.join(', ') : '');
    setEditSizes(p.sizes ? p.sizes.join(', ') : '');
    setEditFeatured(!!p.featured);
  };

  // Submit Edit Form
  const handleSaveEditProduct = (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingProduct) return;

    if (!editName.trim() || !editSku.trim()) {
      alert('Por favor, informe o Nome do produto e o SKU.');
      return;
    }

    const brandToSave = editBrand === 'Outras' && editCustomBrand.trim()
      ? (editCustomBrand.trim() as Product['brand'])
      : editBrand;

    const parsedSpecs = editSpecs
      .split(',')
      .map((s) => s.trim())
      .filter((s) => s.length > 0);

    const parsedSizes = editSizes
      .split(',')
      .map((s) => s.trim())
      .filter((s) => s.length > 0);

    const fallbackImg = 'https://lh3.googleusercontent.com/aida-public/AB6AXuDfAUZUZdE_GrI_XZ3Mw6u0nQfx_ifYFGi-mXy1Svr0jL1hT9lU0gSEya_n83GTj6al_pT23g00qj802qDXxR2jLtTSY-BWL2pqhez02cIHNhrSpWBuGcSNsE7J4Mum9Iq-a9Hk1wvqHrTm8T3gUYuRTY24xpZCSHnMClO6h4eRcHRO1GxGdFLyPi5JFcDzrWx80QKTgfp0GJv0X9xep4INPafQK9irO4-kHBMR8i3YnSzWJWaqejb16A';
    const finalImages = editImages.length > 0 ? editImages : (editingProduct.images.length > 0 ? editingProduct.images : [fallbackImg]);

    updateProduct(editingProduct.id, {
      name: editName.trim(),
      category: editCategory,
      brand: brandToSave,
      sku: editSku.trim(),
      purchasePrice: Number(editCost),
      profitMargin: Number(editMargin),
      salePrice: Number(editSalePrice),
      stockQuantity: Number(editStock),
      images: finalImages,
      description: editDescription.trim(),
      badge: editBadge.trim() || undefined,
      specs: parsedSpecs,
      sizes: parsedSizes.length > 0 ? parsedSizes : undefined,
      featured: editFeatured,
    });

    setEditingProduct(null);
    showToast(`Produto "${editName.trim()}" atualizado com sucesso! (${finalImages.length} fotos salvas)`);
  };

  // Clone/Copy existing product to use as base for new product registration
  const handleCloneProductIntoNew = (p: Product) => {
    let baseSku = p.sku || 'PROD';
    if (baseSku.includes('-COPY')) {
      baseSku = baseSku.replace(/-COPY\d*/g, '');
    }
    const randomSuffix = Math.floor(100 + Math.random() * 900);
    const uniqueSku = `${baseSku}-COPY${randomSuffix}`;

    setNewProdName(`${p.name} (Cópia)`);
    setNewProdCategory(p.category);
    setNewProdBrand(p.brand);
    setNewProdCustomBrand(
      ['Florishop', 'Independent', 'Thunder', 'Venture', 'Spitfire', 'Vans', 'Nike SB', 'Adidas', 'DC Shoes'].includes(p.brand)
        ? ''
        : p.brand
    );
    setNewProdSku(uniqueSku);
    setNewProdCost(p.purchasePrice);
    setNewProdMargin(p.profitMargin);
    setNewProdSalePrice(p.salePrice);
    setNewProdStock(p.stockQuantity || 10);
    setNewProdImages(p.images && p.images.length > 0 ? [...p.images] : []);
    setNewProdDescription(p.description || '');
    setNewProdBadge(p.badge || '');
    setNewProdSpecs(p.specs ? p.specs.join(', ') : '7-PLY CANADIAN MAPLE, STREET');
    setNewProdSizes(p.sizes ? p.sizes.join(', ') : '');
    setNewProdFeatured(false);

    setClonedSourceName(p.name);
    setIsAddModalOpen(true);
    showToast(`Dados de "${p.name}" copiados com sucesso! Altere a foto ou qualquer campo desejado.`);
  };

  const handleResetNewProdForm = () => {
    setNewProdName('');
    setNewProdSku('');
    setNewProdCost(120);
    setNewProdMargin(100);
    setNewProdSalePrice(240);
    setNewProdStock(10);
    setNewProdImages([]);
    setNewProdDescription('');
    setNewProdBadge('');
    setNewProdSpecs('7-PLY CANADIAN MAPLE, STREET');
    setNewProdSizes('');
    setNewProdFeatured(false);
    setNewProdCustomBrand('');
    setClonedSourceName(null);
  };

  // Submit New Product Form
  const handleSaveNewProduct = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newProdName.trim() || !newProdSku.trim()) {
      alert('Preencha o nome do produto e o SKU.');
      return;
    }

    const calculatedSale = newProdSalePrice > 0
      ? newProdSalePrice
      : calculateSalePriceFromMargin(newProdCost, newProdMargin);

    const brandToSave = newProdBrand === 'Outras' && newProdCustomBrand.trim()
      ? (newProdCustomBrand.trim() as Product['brand'])
      : newProdBrand;

    const parsedSpecs = newProdSpecs
      .split(',')
      .map((s) => s.trim())
      .filter((s) => s.length > 0);

    const parsedSizes = newProdSizes
      .split(',')
      .map((s) => s.trim())
      .filter((s) => s.length > 0);

    const defaultImg =
      'https://lh3.googleusercontent.com/aida-public/AB6AXuDfAUZUZdE_GrI_XZ3Mw6u0nQfx_ifYFGi-mXy1Svr0jL1hT9lU0gSEya_n83GTj6al_pT23g00qj802qDXxR2jLtTSY-BWL2pqhez02cIHNhrSpWBuGcSNsE7J4Mum9Iq-a9Hk1wvqHrTm8T3gUYuRTY24xpZCSHnMClO6h4eRcHRO1GxGdFLyPi5JFcDzrWx80QKTgfp0GJv0X9xep4INPafQK9irO4-kHBMR8i3YnSzWJWaqejb16A';

    const finalImages = newProdImages.length > 0 ? newProdImages : [defaultImg];

    addProduct({
      name: newProdName.trim(),
      category: newProdCategory,
      brand: brandToSave,
      sku: newProdSku.trim().toUpperCase(),
      purchasePrice: Number(newProdCost),
      profitMargin: Number(newProdMargin),
      salePrice: Number(calculatedSale),
      stockQuantity: Number(newProdStock),
      images: finalImages,
      description: newProdDescription.trim() || 'Equipamento de alta performance para quem vive o asfalto.',
      specs: parsedSpecs.length > 0 ? parsedSpecs : ['7-PLY MAPLE', 'STREET'],
      sizes: parsedSizes.length > 0 ? parsedSizes : undefined,
      badge: newProdBadge.trim() || undefined,
      featured: newProdFeatured,
    });

    setIsAddModalOpen(false);
    showToast(`Produto "${newProdName.trim()}" cadastrado com sucesso no estoque!`);

    // Reset Form
    handleResetNewProdForm();
  };

  // Confirm Delete Product
  const handleConfirmDelete = () => {
    if (!productToDelete) return;
    const name = productToDelete.name;
    deleteProduct(productToDelete.id);
    setProductToDelete(null);
    showToast(`Produto "${name}" excluído do estoque.`);
  };

  // Resolve current products for Featured Showcase (Slots 1, 2, 3)
  const currentProd1 = products.find((p) => p.id === featuredConfig?.slot1?.productId) || products[0];
  const currentProd2 = products.find((p) => p.id === featuredConfig?.slot2?.productId) || products[1] || products[0];
  const currentProd3 = products.find((p) => p.id === featuredConfig?.slot3?.productId) || products[2] || products[0];

  // Filtered products list for the Product Picker Modal
  const filteredPickerProducts = products.filter((p) => {
    const query = pickerSearch.trim().toLowerCase();
    const matchesSearch =
      query === '' ||
      p.name.toLowerCase().includes(query) ||
      p.sku.toLowerCase().includes(query) ||
      p.brand.toLowerCase().includes(query);
    const matchesCat = pickerCategory === 'Todas' || p.category === pickerCategory;
    return matchesSearch && matchesCat;
  });

  // Admin Guard: If not admin, show restricted screen
  if (!isAdmin) {
    return (
      <div className="max-w-2xl mx-auto px-4 py-20 text-center font-mono">
        <div className="bg-[#181717] border-2 border-red-500/40 p-8 rounded-lg shadow-2xl space-y-6">
          <div className="w-16 h-16 mx-auto rounded-full bg-red-500/10 border border-red-500 flex items-center justify-center text-red-400">
            <ShieldAlert className="w-8 h-8" />
          </div>
          <div className="space-y-2">
            <h1 className="text-2xl font-bold text-white uppercase tracking-tight">
              Acesso Restrito ao Administrador
            </h1>
            <p className="text-xs text-gray-400 max-w-md mx-auto">
              Você precisa estar autenticado com login e senha de administrador para acessar a Gestão de Estoque, Lucros e Margens.
            </p>
          </div>
          <div className="pt-2 flex justify-center gap-3">
            <button
              onClick={() => openAuthModal('admin-login')}
              className="px-6 py-3 bg-[#ff544b] hover:bg-white text-white hover:text-[#ff544b] font-bold text-xs uppercase tracking-wider rounded transition-all"
            >
              Fazer Login de Administrador
            </button>
            <button
              onClick={() => setActiveTab('home')}
              className="px-6 py-3 bg-[#201f1f] border border-[#353534] text-gray-300 hover:text-white font-bold text-xs uppercase tracking-wider rounded transition-all"
            >
              Voltar para a Loja
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 md:px-12 py-10 space-y-8 relative">
      {/* Toast Notification */}
      {toastMessage && (
        <div className="fixed bottom-6 right-6 z-50 bg-[#1e1e1e] border-2 border-[#ff544b] text-white px-5 py-3.5 rounded-lg shadow-2xl flex items-center gap-3 animate-fade-in font-mono text-xs max-w-md">
          <CheckCircle2 className="w-5 h-5 text-[#ff544b] flex-shrink-0" />
          <span className="leading-tight">{toastMessage}</span>
          <button
            onClick={() => setToastMessage(null)}
            className="text-gray-400 hover:text-white ml-auto"
          >
            <X className="w-4 h-4" />
          </button>
        </div>
      )}

      {/* Header Bar */}
      <div className="flex flex-col md:flex-row md:items-center justify-between border-b-2 border-[#5c403c] pb-6 gap-4">
        <div>
          <span className="font-mono text-xs text-[#ff544b] uppercase font-bold tracking-widest block mb-1">
            PAINEL ADMINISTRATIVO &bull; FLORISHOP SKATE
          </span>
          <h1 className="font-display text-3xl md:text-5xl font-extrabold text-white uppercase tracking-tight flex items-center gap-3">
            <LayoutDashboard className="w-8 h-8 text-[#ff544b]" />
            Administração de <span className="text-[#ff544b]">Estoque</span>
          </h1>
          <p className="font-sans text-xs sm:text-sm text-gray-400 mt-1 max-w-2xl">
            Gerencie o catálogo completo com cadastro de novos itens, edição de informações e preços em tempo real, controle de entradas/saídas e exclusão segura.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2.5">
          <button
            onClick={() => setIsSupabaseModalOpen(true)}
            id="btn-supabase-modal-header"
            className="px-4 py-3 bg-[#17231c] border border-[#3ecf8e]/50 text-[#3ecf8e] hover:bg-[#3ecf8e] hover:text-black font-mono text-xs uppercase font-bold rounded transition-all flex items-center gap-2 shadow hover:shadow-[#3ecf8e]/20 active:scale-95"
            title="Ver conexão com Supabase, migrations SQL e sincronização"
          >
            <Database className="w-4 h-4" />
            Supabase &amp; Migrations
          </button>
          <button
            onClick={() => setActiveTab('admin-orders')}
            id="btn-gestao-pedidos-header"
            className="px-4 py-3 bg-[#201f1f] border border-[#353534] text-gray-300 hover:border-[#ff544b] hover:text-white font-mono text-xs uppercase font-bold rounded transition-all flex items-center gap-2 shadow active:scale-95"
          >
            <ClipboardList className="w-4 h-4 text-[#ff544b]" />
            Gestão de Pedidos ({orders.length})
          </button>
          <button
            onClick={() => setActiveTab('admin-users')}
            id="btn-gestao-cadastros-header"
            className="px-4 py-3 bg-[#201f1f] border border-[#353534] text-gray-300 hover:border-[#ff544b] hover:text-white font-mono text-xs uppercase font-bold rounded transition-all flex items-center gap-2 shadow active:scale-95"
          >
            <Users className="w-4 h-4 text-[#ff544b]" />
            Gestão de Cadastros ({users.length})
          </button>
          <button
            onClick={() => setActiveSubTab('featured')}
            id="btn-destaques-header"
            className="px-4 py-3 bg-[#201f1f] border border-amber-500/50 text-amber-400 hover:bg-[#ff544b] hover:text-white hover:border-[#ff544b] font-mono text-xs uppercase font-bold rounded transition-all flex items-center gap-2 shadow hover:shadow-amber-500/20 active:scale-95"
          >
            <Sparkles className="w-4 h-4 text-amber-400" /> Editar Destaques do Mês
          </button>
          <button
            onClick={() => setIsAddModalOpen(true)}
            id="btn-cadastrar-novo-produto"
            className="px-5 py-3 bg-[#ff544b] text-white font-mono text-xs uppercase font-bold rounded hover:bg-white hover:text-black transition-all flex items-center gap-2 shadow-lg hover:shadow-red-500/20 active:scale-95"
          >
            <Plus className="w-4 h-4" /> Cadastrar Novo Produto
          </button>
          <button
            onClick={() => {
              if (confirm('Tem certeza que deseja restaurar o estoque inicial padrão de fábrica? Todas as modificações locais serão redefinidas.')) {
                resetToInitialData();
                showToast('Estoque restaurado para os produtos padrão com sucesso!');
              }
            }}
            title="Restaurar dados padrões de fábrica"
            className="px-3.5 py-3 bg-[#201f1f] border border-[#353534] text-gray-400 font-mono text-xs uppercase hover:text-white hover:border-[#ff544b] rounded transition-colors"
          >
            <RotateCcw className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Financial Overview Metrics Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4">
        <div className="bg-[#181717] border border-[#353534] p-5 rounded space-y-2">
          <span className="font-mono text-[10px] text-gray-400 uppercase font-bold block">
            Custo Total do Estoque
          </span>
          <div className="flex items-center justify-between">
            <span className="font-mono text-xl md:text-2xl font-extrabold text-white">
              R$ {totalCostValue.toFixed(2)}
            </span>
            <DollarSign className="w-5 h-5 text-gray-500" />
          </div>
          <span className="font-mono text-[10px] text-gray-500 block">
            Capital imobilizado em peças
          </span>
        </div>

        <div className="bg-[#181717] border border-[#353534] p-5 rounded space-y-2">
          <span className="font-mono text-[10px] text-gray-400 uppercase font-bold block">
            Faturamento Projetado
          </span>
          <div className="flex items-center justify-between">
            <span className="font-mono text-xl md:text-2xl font-extrabold text-[#ffb4ab]">
              R$ {totalPotentialRevenue.toFixed(2)}
            </span>
            <TrendingUp className="w-5 h-5 text-[#ff544b]" />
          </div>
          <span className="font-mono text-[10px] text-gray-500 block">
            Preço de venda total
          </span>
        </div>

        <div className="bg-[#181717] border border-emerald-500/30 bg-emerald-950/10 p-5 rounded space-y-2">
          <span className="font-mono text-[10px] text-emerald-400 uppercase font-bold block">
            Lucro Bruto Projetado
          </span>
          <div className="flex items-center justify-between">
            <span className="font-mono text-xl md:text-2xl font-extrabold text-emerald-400">
              R$ {totalPotentialProfit.toFixed(2)}
            </span>
            <ArrowUpRight className="w-5 h-5 text-emerald-400" />
          </div>
          <span className="font-mono text-[10px] text-emerald-500/80 block">
            Ganho líquido estimado
          </span>
        </div>

        <div className="bg-[#181717] border border-[#353534] p-5 rounded space-y-2">
          <span className="font-mono text-[10px] text-gray-400 uppercase font-bold block">
            Margem Média da Loja
          </span>
          <div className="flex items-center justify-between">
            <span className="font-mono text-xl md:text-2xl font-extrabold text-[#ff544b]">
              {averageMargin.toFixed(1)}%
            </span>
            <Calculator className="w-5 h-5 text-[#ff544b]" />
          </div>
          <span className="font-mono text-[10px] text-gray-500 block">
            Markup sobre preço de compra
          </span>
        </div>

        <div
          className={`p-5 rounded space-y-2 border transition-all ${
            outOfStockCount > 0
              ? 'bg-red-950/20 border-red-500 text-red-300'
              : lowStockCount > 0
              ? 'bg-amber-950/20 border-amber-500 text-amber-300'
              : 'bg-[#181717] border-[#353534] text-gray-400'
          }`}
        >
          <span className="font-mono text-[10px] uppercase font-bold block">
            Alertas de Reposição
          </span>
          <div className="flex items-center justify-between">
            <span className="font-mono text-xl md:text-2xl font-extrabold">
              {outOfStockCount > 0 ? `${outOfStockCount} esgotado(s)` : `${lowStockCount} baixo(s)`}
            </span>
            <AlertTriangle className="w-5 h-5" />
          </div>
          <span className="font-mono text-[10px] block opacity-80">
            {outOfStockCount > 0 ? `${lowStockCount} itens também com estoque baixo` : 'Necessitam de nova compra'}
          </span>
        </div>
      </div>

      {/* Subtabs Navigation */}
      <div className="flex flex-wrap gap-2 border-b border-[#353534] pb-3 font-mono text-xs uppercase font-bold">
        <button
          onClick={() => setActiveSubTab('inventory')}
          className={`px-4 py-2.5 rounded transition-colors flex items-center gap-2 ${
            activeSubTab === 'inventory'
              ? 'bg-[#ff544b] text-white'
              : 'bg-[#201f1f] text-gray-400 hover:text-white hover:bg-[#2a2a2a]'
          }`}
        >
          <Package className="w-4 h-4" /> Catálogo &amp; Estoque ({products.length})
        </button>
        <button
          onClick={() => setActiveSubTab('featured')}
          className={`px-4 py-2.5 rounded transition-colors flex items-center gap-2 border ${
            activeSubTab === 'featured'
              ? 'bg-[#ff544b] text-white border-[#ff544b]'
              : 'bg-[#201f1f] text-amber-400 border-amber-500/30 hover:text-white hover:bg-[#2a2a2a] hover:border-amber-500'
          }`}
        >
          <Sparkles className="w-4 h-4 text-amber-400" /> Destaques do Mês (3 Produtos)
        </button>
        <button
          onClick={() => setActiveSubTab('calculator')}
          className={`px-4 py-2.5 rounded transition-colors flex items-center gap-2 ${
            activeSubTab === 'calculator'
              ? 'bg-[#ff544b] text-white'
              : 'bg-[#201f1f] text-gray-400 hover:text-white hover:bg-[#2a2a2a]'
          }`}
        >
          <Calculator className="w-4 h-4" /> Simulador de Precificação &amp; Margem
        </button>
        <button
          onClick={() => setActiveSubTab('movements')}
          className={`px-4 py-2.5 rounded transition-colors flex items-center gap-2 ${
            activeSubTab === 'movements'
              ? 'bg-[#ff544b] text-white'
              : 'bg-[#201f1f] text-gray-400 hover:text-white hover:bg-[#2a2a2a]'
          }`}
        >
          <History className="w-4 h-4" /> Histórico de Movimentações ({stockMovements.length})
        </button>
      </div>

      {/* Tab 1: Inventory Table with CRUD */}
      {activeSubTab === 'inventory' && (
        <div className="space-y-4">
          {/* Filters Bar */}
          <div className="bg-[#181717] border border-[#353534] p-4 rounded-lg flex flex-col lg:flex-row items-stretch lg:items-center justify-between gap-3">
            {/* Search Input */}
            <div className="relative flex-1 max-w-md">
              <input
                type="text"
                placeholder="Buscar por nome, SKU, marca..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full bg-[#201f1f] border border-[#353534] text-xs text-white pl-9 pr-3 py-2.5 rounded font-mono focus:outline-none focus:border-[#ff544b]"
              />
              <Search className="w-4 h-4 text-gray-400 absolute left-3 top-3" />
              {searchTerm && (
                <button
                  onClick={() => setSearchTerm('')}
                  className="absolute right-3 top-3 text-gray-400 hover:text-white"
                >
                  <X className="w-3.5 h-3.5" />
                </button>
              )}
            </div>

            {/* Category Filter */}
            <div className="flex flex-wrap items-center gap-2 font-mono text-xs">
              <span className="text-gray-400 text-[11px] flex items-center gap-1">
                <Filter className="w-3 h-3 text-[#ff544b]" /> Categoria:
              </span>
              <select
                value={selectedCategoryFilter}
                onChange={(e) => setSelectedCategoryFilter(e.target.value)}
                className="bg-[#201f1f] border border-[#353534] text-gray-200 text-xs px-2.5 py-2 rounded focus:outline-none focus:border-[#ff544b]"
              >
                <option value="Todas">Todas as Categorias</option>
                <option value="Decks">Decks (Shapes)</option>
                <option value="Trucks">Trucks (Eixos)</option>
                <option value="Wheels">Wheels (Rodas)</option>
                <option value="Tênis">Tênis (Footwear)</option>
                <option value="Apparel">Apparel (Vestuário)</option>
                <option value="Hardware">Hardware (Lixas/Parafusos)</option>
                <option value="Acessórios">Acessórios</option>
              </select>

              {/* Stock Status Filter */}
              <select
                value={stockLevelFilter}
                onChange={(e: any) => setStockLevelFilter(e.target.value)}
                className="bg-[#201f1f] border border-[#353534] text-gray-200 text-xs px-2.5 py-2 rounded focus:outline-none focus:border-[#ff544b]"
              >
                <option value="all">Todos os Níveis</option>
                <option value="available">Em Estoque (&gt;0)</option>
                <option value="low">Estoque Baixo (&le;3)</option>
                <option value="out">Esgotados (0 un)</option>
              </select>
            </div>
          </div>

          {/* Active Filters / Results Count */}
          <div className="flex justify-between items-center px-1 font-mono text-xs text-gray-400">
            <span>
              Exibindo <strong className="text-white">{filteredProducts.length}</strong> de {products.length} produtos cadastrados
            </span>
            {(searchTerm || selectedCategoryFilter !== 'Todas' || stockLevelFilter !== 'all') && (
              <button
                onClick={() => {
                  setSearchTerm('');
                  setSelectedCategoryFilter('Todas');
                  setStockLevelFilter('all');
                }}
                className="text-xs text-[#ff544b] hover:underline"
              >
                Limpar todos os filtros
              </button>
            )}
          </div>

          {/* Product Table */}
          <div className="bg-[#181717] border border-[#353534] rounded-lg overflow-x-auto shadow-xl">
            <table className="w-full text-left font-mono text-xs">
              <thead className="bg-[#201f1f] text-gray-300 uppercase border-b border-[#353534]">
                <tr>
                  <th className="p-3.5">Produto &bull; SKU &bull; Marca</th>
                  <th className="p-3.5">Categoria</th>
                  <th className="p-3.5 text-center">Estoque</th>
                  <th className="p-3.5 text-right">Custo (R$)</th>
                  <th className="p-3.5 text-right">Margem (%)</th>
                  <th className="p-3.5 text-right">Preço Venda (R$)</th>
                  <th className="p-3.5 text-right">Lucro Unit.</th>
                  <th className="p-3.5 text-center min-w-[140px]">Ações</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#2a2a2a] text-gray-200">
                {filteredProducts.length === 0 ? (
                  <tr>
                    <td colSpan={8} className="p-10 text-center text-gray-500 font-mono">
                      Nenhum produto encontrado com os filtros selecionados.
                      <div className="mt-3">
                        <button
                          onClick={() => setIsAddModalOpen(true)}
                          className="px-4 py-2 bg-[#ff544b] text-white font-bold rounded uppercase text-[11px] inline-flex items-center gap-2"
                        >
                          <Plus className="w-3.5 h-3.5" /> Cadastrar este Produto agora
                        </button>
                      </div>
                    </td>
                  </tr>
                ) : (
                  filteredProducts.map((p) => {
                    const unitProfit = calculateUnitProfit(p.purchasePrice, p.salePrice);
                    const isOut = p.stockQuantity === 0;
                    const isLow = p.stockQuantity > 0 && p.stockQuantity <= 3;

                    const isSlot1 = featuredConfig?.slot1?.productId === p.id;
                    const isSlot2 = featuredConfig?.slot2?.productId === p.id;
                    const isSlot3 = featuredConfig?.slot3?.productId === p.id;
                    const isFeaturedSlot = isSlot1 || isSlot2 || isSlot3;

                    return (
                      <tr key={p.id} className="hover:bg-[#201f1f]/70 transition-colors group">
                        <td className="p-3.5">
                          <div className="flex items-center gap-3">
                            <div
                              onClick={() => handleOpenEditModal(p)}
                              className="relative group/thumb cursor-pointer flex-shrink-0"
                              title="Clique para editar produto e alterar foto"
                            >
                              <img
                                src={p.images[0]}
                                alt={p.name}
                                className="w-11 h-11 object-contain bg-[#111] border border-[#333] group-hover/thumb:border-[#ff544b] p-1 rounded transition-colors"
                              />
                              <div className="absolute inset-0 bg-black/60 opacity-0 group-hover/thumb:opacity-100 flex items-center justify-center rounded transition-opacity">
                                <Upload className="w-3.5 h-3.5 text-white" />
                              </div>
                            </div>
                            <div>
                              <div className="flex flex-wrap items-center gap-2">
                                <span className="font-bold text-white block text-sm">{p.name}</span>
                                {isSlot1 && (
                                  <span className="px-2 py-0.5 text-[9px] bg-amber-500/20 text-amber-300 border border-amber-500/50 rounded font-bold uppercase inline-flex items-center gap-1">
                                    <Star className="w-2.5 h-2.5 fill-amber-400 text-amber-400" /> Destaque 1 (Principal)
                                  </span>
                                )}
                                {isSlot2 && (
                                  <span className="px-2 py-0.5 text-[9px] bg-sky-500/20 text-sky-300 border border-sky-500/50 rounded font-bold uppercase inline-flex items-center gap-1">
                                    <Star className="w-2.5 h-2.5 fill-sky-400 text-sky-400" /> Destaque 2 (Sup.)
                                  </span>
                                )}
                                {isSlot3 && (
                                  <span className="px-2 py-0.5 text-[9px] bg-purple-500/20 text-purple-300 border border-purple-500/50 rounded font-bold uppercase inline-flex items-center gap-1">
                                    <Star className="w-2.5 h-2.5 fill-purple-400 text-purple-400" /> Destaque 3 (Inf.)
                                  </span>
                                )}
                                {!isFeaturedSlot && p.featured && (
                                  <span className="px-1.5 py-0.2 text-[9px] bg-[#ff544b]/20 text-[#ff544b] border border-[#ff544b]/40 rounded font-bold uppercase">
                                    Destaque
                                  </span>
                                )}
                              </div>
                              <div className="flex items-center gap-2 mt-0.5">
                                <span className="text-[11px] text-[#ffb4ab] font-semibold">SKU: {p.sku}</span>
                                <span className="text-[11px] text-gray-400">&bull; {p.brand}</span>
                                {p.badge && (
                                  <span className="px-1 py-0.1 text-[9px] bg-[#333] text-gray-300 rounded font-mono">
                                    {p.badge}
                                  </span>
                                )}
                              </div>
                            </div>
                          </div>
                        </td>

                        <td className="p-3.5">
                          <span className="px-2 py-1 bg-[#252424] text-gray-300 border border-[#353534] rounded text-[11px]">
                            {p.category}
                          </span>
                        </td>

                        {/* Stock Quantity with Quick Adjust Controls */}
                        <td className="p-3.5 text-center">
                          <div className="flex items-center justify-center gap-1.5">
                            <button
                              onClick={() => adjustStockQuantity(p.id, -1, 'Ajuste rápido -1 unidade')}
                              title="Diminuir 1 un"
                              disabled={p.stockQuantity <= 0}
                              className="w-6 h-6 bg-[#262525] hover:bg-[#ff544b] disabled:opacity-40 disabled:hover:bg-[#262525] text-white rounded font-bold flex items-center justify-center transition-colors"
                            >
                              -
                            </button>
                            <span
                              className={`min-w-[36px] px-2 py-1 font-bold rounded text-center text-xs ${
                                isOut
                                  ? 'bg-red-950 text-red-300 border border-red-500'
                                  : isLow
                                  ? 'bg-amber-950 text-amber-300 border border-amber-500'
                                  : 'bg-[#222] text-white border border-[#333]'
                              }`}
                            >
                              {p.stockQuantity}
                            </span>
                            <button
                              onClick={() => adjustStockQuantity(p.id, 1, 'Entrada rápida +1 unidade')}
                              title="Adicionar 1 un"
                              className="w-6 h-6 bg-[#262525] hover:bg-emerald-600 text-white rounded font-bold flex items-center justify-center transition-colors"
                            >
                              +
                            </button>
                          </div>
                          {isOut && <span className="text-[10px] text-red-400 block mt-1 font-bold">Esgotado</span>}
                          {isLow && <span className="text-[10px] text-amber-400 block mt-1">Estoque Baixo</span>}
                        </td>

                        {/* Cost Price */}
                        <td className="p-3.5 text-right font-mono text-gray-300">
                          R$ {p.purchasePrice.toFixed(2)}
                        </td>

                        {/* Margin */}
                        <td className="p-3.5 text-right font-mono font-bold text-[#ff544b]">
                          {p.profitMargin.toFixed(1)}%
                        </td>

                        {/* Sale Price */}
                        <td className="p-3.5 text-right font-mono font-bold text-white text-sm">
                          R$ {p.salePrice.toFixed(2)}
                        </td>

                        {/* Unit Profit */}
                        <td className="p-3.5 text-right font-mono font-bold text-emerald-400">
                          + R$ {unitProfit.toFixed(2)}
                        </td>

                        {/* Actions (Destacar, Edit & Delete) */}
                        <td className="p-3.5 text-center">
                          <div className="flex items-center justify-center gap-1.5">
                            {/* Destacar Menu */}
                            <div className="relative">
                              <button
                                type="button"
                                onClick={() => setDestaqueMenuProdId(destaqueMenuProdId === p.id ? null : p.id)}
                                title="Definir posição na Vitrine de Destaques do Mês"
                                className={`p-1.5 px-2 rounded transition-all flex items-center gap-1 text-[11px] font-bold border ${
                                  isFeaturedSlot
                                    ? 'bg-amber-500/20 text-amber-300 border-amber-500/50 hover:bg-amber-500/30'
                                    : 'bg-[#201f1f] text-gray-400 hover:text-amber-400 border-[#353534] hover:border-amber-500/50'
                                }`}
                              >
                                <Star className={`w-3.5 h-3.5 ${isFeaturedSlot ? 'fill-amber-400 text-amber-400' : ''}`} />
                                <span className="hidden xl:inline">Destacar</span>
                              </button>

                              {destaqueMenuProdId === p.id && (
                                <div className="absolute right-0 top-full mt-1.5 z-30 w-60 bg-[#181717] border-2 border-amber-500/50 rounded-lg shadow-2xl p-2 text-left font-mono text-xs space-y-1">
                                  <div className="px-2 py-1 text-[10px] text-gray-400 font-bold uppercase border-b border-[#333]">
                                    Fixar nos Destaques do Mês:
                                  </div>
                                  <button
                                    type="button"
                                    onClick={() => {
                                      updateFeaturedSlot('slot1', { productId: p.id });
                                      setDestaqueMenuProdId(null);
                                      showToast(`"${p.name}" definido como Destaque Principal (Card Grande)!`);
                                    }}
                                    className="w-full text-left px-2.5 py-1.5 rounded hover:bg-[#252424] text-white flex items-center justify-between transition-colors"
                                  >
                                    <span>⭐ 1. Card Grande (Principal)</span>
                                    {isSlot1 && <Check className="w-3.5 h-3.5 text-emerald-400" />}
                                  </button>
                                  <button
                                    type="button"
                                    onClick={() => {
                                      updateFeaturedSlot('slot2', { productId: p.id });
                                      setDestaqueMenuProdId(null);
                                      showToast(`"${p.name}" definido como Destaque Superior Direito!`);
                                    }}
                                    className="w-full text-left px-2.5 py-1.5 rounded hover:bg-[#252424] text-white flex items-center justify-between transition-colors"
                                  >
                                    <span>⭐ 2. Card Superior (Direita)</span>
                                    {isSlot2 && <Check className="w-3.5 h-3.5 text-emerald-400" />}
                                  </button>
                                  <button
                                    type="button"
                                    onClick={() => {
                                      updateFeaturedSlot('slot3', { productId: p.id });
                                      setDestaqueMenuProdId(null);
                                      showToast(`"${p.name}" definido como Destaque Inferior Direito!`);
                                    }}
                                    className="w-full text-left px-2.5 py-1.5 rounded hover:bg-[#252424] text-white flex items-center justify-between transition-colors"
                                  >
                                    <span>⭐ 3. Card Inferior (Direita)</span>
                                    {isSlot3 && <Check className="w-3.5 h-3.5 text-emerald-400" />}
                                  </button>
                                  <div className="pt-1 border-t border-[#333]">
                                    <button
                                      type="button"
                                      onClick={() => {
                                        setDestaqueMenuProdId(null);
                                        setActiveSubTab('featured');
                                      }}
                                      className="w-full text-left px-2 py-1 rounded hover:bg-[#252424] text-amber-400 flex items-center gap-1.5 text-[10px] font-bold uppercase transition-colors"
                                    >
                                      <Sparkles className="w-3 h-3" /> Abrir Editor de Destaques
                                    </button>
                                  </div>
                                </div>
                              )}
                            </div>

                            <button
                              type="button"
                              onClick={() => handleCloneProductIntoNew(p)}
                              title="Copiar dados deste produto para criar um novo cadastro no estoque"
                              className="p-1.5 px-2 bg-[#201f1f] hover:bg-emerald-600 text-emerald-400 hover:text-white border border-emerald-900/60 hover:border-emerald-500 rounded transition-all flex items-center gap-1 text-[11px] font-bold"
                            >
                              <Copy className="w-3.5 h-3.5" />
                              <span>Copiar</span>
                            </button>

                            <button
                              onClick={() => handleOpenEditModal(p)}
                              title="Editar informações do produto"
                              className="p-1.5 px-2 bg-[#201f1f] hover:bg-[#ff544b] text-gray-300 hover:text-white border border-[#353534] hover:border-[#ff544b] rounded transition-all flex items-center gap-1 text-[11px] font-bold"
                            >
                              <Edit2 className="w-3.5 h-3.5" />
                              <span>Editar</span>
                            </button>
                            <button
                              onClick={() => setProductToDelete(p)}
                              title="Excluir produto do catálogo"
                              className="p-1.5 text-gray-500 hover:text-red-400 hover:bg-red-950/40 border border-transparent hover:border-red-500/40 rounded transition-all"
                            >
                              <Trash2 className="w-4 h-4" />
                            </button>
                          </div>
                        </td>
                      </tr>
                    );
                  })
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* ============================================================ */}
      {/* Tab: Editor dos 3 Destaques do Mês                           */}
      {/* ============================================================ */}
      {activeSubTab === 'featured' && (
        <div className="space-y-6">
          {/* Header Card */}
          <div className="bg-[#181717] border border-[#353534] p-6 rounded-lg flex flex-col md:flex-row md:items-center justify-between gap-4 shadow-xl">
            <div className="space-y-1">
              <span className="font-mono text-xs text-[#ff544b] uppercase font-bold tracking-wider flex items-center gap-1.5">
                <Sparkles className="w-4 h-4 text-amber-400" />
                Configuração da Vitrine Principal
              </span>
              <h2 className="font-display text-2xl md:text-3xl font-bold text-white uppercase tracking-tight">
                Editar os 3 Destaques do Mês
              </h2>
              <p className="font-sans text-xs sm:text-sm text-gray-400 max-w-2xl">
                Altere quais produtos aparecem nos 3 blocos em destaque no topo da página inicial do site.
                Você pode trocar o produto de cada posição, personalizar os selos/tags promocionais e os subtítulos.
              </p>
            </div>

            <div className="flex flex-wrap items-center gap-2.5">
              <button
                type="button"
                onClick={() => {
                  setActiveTab('home');
                  setTimeout(() => {
                    const el = document.getElementById('destaques');
                    if (el) el.scrollIntoView({ behavior: 'smooth' });
                  }, 150);
                }}
                className="px-4 py-2.5 bg-[#201f1f] border border-[#353534] text-gray-300 hover:text-white hover:border-[#ff544b] font-mono text-xs uppercase font-bold rounded transition-colors flex items-center gap-2"
              >
                <Eye className="w-4 h-4 text-[#ff544b]" /> Ver no Site
              </button>
              <button
                type="button"
                onClick={() => {
                  if (confirm('Deseja restaurar os 3 destaques para a seleção padrão de fábrica?')) {
                    resetFeaturedConfig();
                    showToast('Destaques restaurados para a configuração padrão!');
                  }
                }}
                title="Restaurar os 3 produtos de destaque padrão"
                className="px-3.5 py-2.5 bg-[#201f1f] border border-[#353534] text-gray-400 hover:text-white rounded transition-colors flex items-center gap-1.5 font-mono text-xs"
              >
                <RotateCcw className="w-4 h-4" /> Restaurar Padrão
              </button>
              <button
                type="button"
                onClick={() => {
                  showToast('Destaques do Mês salvos e publicados com sucesso na loja!');
                }}
                className="px-5 py-2.5 bg-emerald-600 hover:bg-emerald-500 text-white font-mono text-xs uppercase font-bold rounded transition-all flex items-center gap-2 shadow-lg shadow-emerald-950"
              >
                <Check className="w-4 h-4" /> Salvar Destaques
              </button>
            </div>
          </div>

          {/* Helper Banner */}
          <div className="bg-[#201f1f] border-l-4 border-amber-500 p-4 rounded text-xs font-mono text-gray-300 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
            <div>
              <strong className="text-amber-400 uppercase">Estrutura Visual da Vitrine:</strong> O layout da página inicial possui 1 card principal amplo de destaque na esquerda e 2 cards compactos na direita. Qualquer alteração aqui é sincronizada em tempo real.
            </div>
            <span className="text-gray-400 text-[11px] whitespace-nowrap">
              3 produtos ativos
            </span>
          </div>

          {/* 3-Cards Grid Preview & Settings */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Slot 1: Card Grande da Esquerda (col-span-2) */}
            <div className="lg:col-span-2 bg-[#181717] border-2 border-[#333] hover:border-[#ff544b] transition-all p-5 rounded-lg flex flex-col justify-between space-y-4 shadow-xl">
              <div className="flex justify-between items-center border-b border-[#2a2a2a] pb-3">
                <div className="flex items-center gap-2">
                  <span className="w-6 h-6 rounded-full bg-[#ff544b] text-white font-mono font-bold text-xs flex items-center justify-center">
                    1
                  </span>
                  <div>
                    <h4 className="font-mono text-xs font-bold text-white uppercase flex items-center gap-2">
                      Destaque Principal (Card Grande da Esquerda)
                      <span className="px-2 py-0.5 bg-amber-500/20 text-amber-300 border border-amber-500/40 rounded text-[9px]">
                        Slot 1
                      </span>
                    </h4>
                    <span className="text-[10px] font-mono text-gray-400 block">
                      Ocupa 2 colunas da vitrine com foto ampliada, descrição e botão de compra
                    </span>
                  </div>
                </div>
                <button
                  type="button"
                  onClick={() => {
                    setPickerSearch('');
                    setPickerCategory('Todas');
                    setPickerSlot('slot1');
                  }}
                  className="px-3 py-1.5 bg-[#252424] hover:bg-[#ff544b] text-white font-mono text-xs uppercase font-bold rounded border border-[#353534] hover:border-[#ff544b] transition-all flex items-center gap-1.5 shadow"
                >
                  <Search className="w-3.5 h-3.5" /> Trocar Produto
                </button>
              </div>

              {/* Live Preview of Slot 1 */}
              {currentProd1 ? (
                <div className="bg-[#1e1e1e] border border-[#333] rounded p-4 flex flex-col sm:flex-row items-center gap-5">
                  <div className="w-full sm:w-1/2 h-48 bg-[#141414] rounded p-3 flex items-center justify-center relative overflow-hidden border border-[#2a2a2a]">
                    <span className="absolute top-2 left-2 bg-[#ff544b] text-white px-2 py-0.5 font-mono text-[9px] uppercase font-bold rounded shadow">
                      {featuredConfig?.slot1?.customTag || currentProd1.badge || 'Novo Drop'}
                    </span>
                    <img
                      src={currentProd1.images[0]}
                      alt={currentProd1.name}
                      className="h-full max-h-40 object-contain filter drop-shadow-xl"
                    />
                  </div>
                  <div className="w-full sm:w-1/2 space-y-2">
                    <span className="font-mono text-[11px] text-[#ffb4ab] uppercase font-bold block">
                      {featuredConfig?.slot1?.customSubtitle || `${currentProd1.category} • ${currentProd1.brand}`.toUpperCase()}
                    </span>
                    <h3 className="font-display text-lg font-bold text-white uppercase leading-snug">
                      {currentProd1.name}
                    </h3>
                    <p className="text-xs text-gray-400 line-clamp-2">
                      {currentProd1.description}
                    </p>
                    <div className="flex flex-wrap gap-1 mt-1">
                      {currentProd1.specs.map((spec, i) => (
                        <span key={i} className="text-[10px] font-mono bg-[#141414] text-gray-300 px-2 py-0.5 rounded border border-[#2e2e2e]">
                          {spec}
                        </span>
                      ))}
                    </div>
                    <div className="flex items-center justify-between pt-3 border-t border-[#2a2a2a]">
                      <div>
                        <span className="text-[9px] font-mono text-gray-400 block uppercase">Preço de Venda</span>
                        <span className="font-mono text-xl font-bold text-[#ff544b]">
                          R$ {currentProd1.salePrice.toFixed(2)}
                        </span>
                      </div>
                      <span className="font-mono text-xs text-gray-300 bg-[#252424] px-2 py-1 rounded border border-[#333]">
                        Estoque: <strong className="text-white">{currentProd1.stockQuantity} un</strong>
                      </span>
                    </div>
                  </div>
                </div>
              ) : (
                <div className="p-8 text-center text-gray-500 font-mono text-xs bg-[#1e1e1e] rounded">
                  Nenhum produto selecionado para o Slot 1.
                </div>
              )}

              {/* Customizable text tags for Slot 1 */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-2 bg-[#141414] p-4 rounded border border-[#2a2a2a]">
                <div>
                  <label className="font-mono text-[11px] text-gray-300 block mb-1 font-bold">
                    Texto do Selo / Badge (Canto Superior)
                  </label>
                  <input
                    type="text"
                    value={featuredConfig?.slot1?.customTag || ''}
                    placeholder={currentProd1?.badge || 'Ex: NOVO DROP, LANÇAMENTO, PRO'}
                    onChange={(e) => updateFeaturedSlot('slot1', { customTag: e.target.value })}
                    className="w-full bg-[#201f1f] border border-[#353534] text-xs text-white px-3 py-2 rounded font-mono uppercase focus:outline-none focus:border-[#ff544b]"
                  />
                  <span className="text-[10px] text-gray-500 font-mono mt-1 block">
                    Deixe em branco para usar o selo padrão do produto.
                  </span>
                </div>
                <div>
                  <label className="font-mono text-[11px] text-gray-300 block mb-1 font-bold">
                    Texto do Subtítulo / Linha
                  </label>
                  <input
                    type="text"
                    value={featuredConfig?.slot1?.customSubtitle || ''}
                    placeholder="Ex: SHAPE MAPLE CANADENSE"
                    onChange={(e) => updateFeaturedSlot('slot1', { customSubtitle: e.target.value })}
                    className="w-full bg-[#201f1f] border border-[#353534] text-xs text-white px-3 py-2 rounded font-mono uppercase focus:outline-none focus:border-[#ff544b]"
                  />
                  <span className="text-[10px] text-gray-500 font-mono mt-1 block">
                    Deixe em branco para usar categoria e marca padrão.
                  </span>
                </div>
              </div>
            </div>

            {/* Right Column: Slot 2 & Slot 3 */}
            <div className="flex flex-col gap-6">
              {/* Slot 2: Card Superior Direito */}
              <div className="bg-[#181717] border-2 border-[#333] hover:border-[#ff544b] transition-all p-4 rounded-lg space-y-3 shadow-xl">
                <div className="flex justify-between items-center border-b border-[#2a2a2a] pb-2">
                  <div className="flex items-center gap-2">
                    <span className="w-6 h-6 rounded-full bg-[#353534] text-white font-mono font-bold text-xs flex items-center justify-center">
                      2
                    </span>
                    <div>
                      <h4 className="font-mono text-xs font-bold text-white uppercase flex items-center gap-1.5">
                        Destaque Superior (Direita)
                        <span className="px-1.5 py-0.2 bg-sky-500/20 text-sky-300 border border-sky-500/40 rounded text-[9px]">
                          Slot 2
                        </span>
                      </h4>
                    </div>
                  </div>
                  <button
                    type="button"
                    onClick={() => {
                      setPickerSearch('');
                      setPickerCategory('Todas');
                      setPickerSlot('slot2');
                    }}
                    className="px-2.5 py-1 bg-[#252424] hover:bg-[#ff544b] text-white font-mono text-[11px] uppercase font-bold rounded border border-[#353534] hover:border-[#ff544b] transition-all flex items-center gap-1"
                  >
                    <Search className="w-3 h-3" /> Trocar
                  </button>
                </div>

                {currentProd2 ? (
                  <div className="bg-[#1e1e1e] border border-[#333] rounded p-3 flex items-center gap-3">
                    <div className="w-20 h-20 bg-[#141414] rounded p-1.5 flex items-center justify-center relative flex-shrink-0 border border-[#2a2a2a]">
                      <span className="absolute top-1 right-1 bg-[#353534] text-white px-1.5 py-0.2 font-mono text-[8px] uppercase rounded border border-[#444]">
                        {featuredConfig?.slot2?.customTag || currentProd2.badge || currentProd2.specs[0] || 'Titanium'}
                      </span>
                      <img
                        src={currentProd2.images[0]}
                        alt={currentProd2.name}
                        className="h-full max-h-16 object-contain"
                      />
                    </div>
                    <div className="min-w-0 flex-1">
                      <span className="font-mono text-[10px] text-[#ffb4ab] uppercase block truncate font-semibold">
                        {featuredConfig?.slot2?.customSubtitle || `${currentProd2.category} • ${currentProd2.brand}`.toUpperCase()}
                      </span>
                      <h5 className="font-mono text-xs font-bold text-white uppercase truncate">
                        {currentProd2.name}
                      </h5>
                      <span className="font-mono text-sm font-bold text-[#ff544b] block mt-1">
                        R$ {currentProd2.salePrice.toFixed(2)}
                      </span>
                      <span className="font-mono text-[10px] text-gray-400 block mt-0.5">
                        Estoque: {currentProd2.stockQuantity} un
                      </span>
                    </div>
                  </div>
                ) : (
                  <div className="p-4 text-center text-gray-500 font-mono text-xs bg-[#1e1e1e] rounded">
                    Nenhum produto selecionado.
                  </div>
                )}

                <div className="grid grid-cols-2 gap-2 pt-1">
                  <div>
                    <label className="font-mono text-[10px] text-gray-400 block mb-1">
                      Selo Superior (Tag)
                    </label>
                    <input
                      type="text"
                      value={featuredConfig?.slot2?.customTag || ''}
                      placeholder="Ex: TITANIUM"
                      onChange={(e) => updateFeaturedSlot('slot2', { customTag: e.target.value })}
                      className="w-full bg-[#141414] border border-[#353534] text-xs text-white px-2 py-1.5 rounded font-mono uppercase focus:outline-none focus:border-[#ff544b]"
                    />
                  </div>
                  <div>
                    <label className="font-mono text-[10px] text-gray-400 block mb-1">
                      Subtítulo
                    </label>
                    <input
                      type="text"
                      value={featuredConfig?.slot2?.customSubtitle || ''}
                      placeholder="Ex: TRUCKS DE ALTA DENSIDADE"
                      onChange={(e) => updateFeaturedSlot('slot2', { customSubtitle: e.target.value })}
                      className="w-full bg-[#141414] border border-[#353534] text-xs text-white px-2 py-1.5 rounded font-mono uppercase focus:outline-none focus:border-[#ff544b]"
                    />
                  </div>
                </div>
              </div>

              {/* Slot 3: Card Inferior Direito */}
              <div className="bg-[#181717] border-2 border-[#333] hover:border-[#ff544b] transition-all p-4 rounded-lg space-y-3 shadow-xl">
                <div className="flex justify-between items-center border-b border-[#2a2a2a] pb-2">
                  <div className="flex items-center gap-2">
                    <span className="w-6 h-6 rounded-full bg-[#353534] text-white font-mono font-bold text-xs flex items-center justify-center">
                      3
                    </span>
                    <div>
                      <h4 className="font-mono text-xs font-bold text-white uppercase flex items-center gap-1.5">
                        Destaque Inferior (Direita)
                        <span className="px-1.5 py-0.2 bg-purple-500/20 text-purple-300 border border-purple-500/40 rounded text-[9px]">
                          Slot 3
                        </span>
                      </h4>
                    </div>
                  </div>
                  <button
                    type="button"
                    onClick={() => {
                      setPickerSearch('');
                      setPickerCategory('Todas');
                      setPickerSlot('slot3');
                    }}
                    className="px-2.5 py-1 bg-[#252424] hover:bg-[#ff544b] text-white font-mono text-[11px] uppercase font-bold rounded border border-[#353534] hover:border-[#ff544b] transition-all flex items-center gap-1"
                  >
                    <Search className="w-3 h-3" /> Trocar
                  </button>
                </div>

                {currentProd3 ? (
                  <div className="bg-[#1e1e1e] border border-[#333] rounded p-3 flex items-center gap-3">
                    <div className="w-20 h-20 bg-[#141414] rounded p-1.5 flex items-center justify-center relative flex-shrink-0 border border-[#2a2a2a]">
                      <span className="absolute top-1 right-1 bg-[#353534] text-white px-1.5 py-0.2 font-mono text-[8px] uppercase rounded border border-[#444]">
                        {featuredConfig?.slot3?.customTag || currentProd3.badge || currentProd3.specs[0] || '101A Dureza'}
                      </span>
                      <img
                        src={currentProd3.images[0]}
                        alt={currentProd3.name}
                        className="h-full max-h-16 object-contain"
                      />
                    </div>
                    <div className="min-w-0 flex-1">
                      <span className="font-mono text-[10px] text-[#ffb4ab] uppercase block truncate font-semibold">
                        {featuredConfig?.slot3?.customSubtitle || `${currentProd3.category} • ${currentProd3.brand}`.toUpperCase()}
                      </span>
                      <h5 className="font-mono text-xs font-bold text-white uppercase truncate">
                        {currentProd3.name}
                      </h5>
                      <span className="font-mono text-sm font-bold text-[#ff544b] block mt-1">
                        R$ {currentProd3.salePrice.toFixed(2)}
                      </span>
                      <span className="font-mono text-[10px] text-gray-400 block mt-0.5">
                        Estoque: {currentProd3.stockQuantity} un
                      </span>
                    </div>
                  </div>
                ) : (
                  <div className="p-4 text-center text-gray-500 font-mono text-xs bg-[#1e1e1e] rounded">
                    Nenhum produto selecionado.
                  </div>
                )}

                <div className="grid grid-cols-2 gap-2 pt-1">
                  <div>
                    <label className="font-mono text-[10px] text-gray-400 block mb-1">
                      Selo Superior (Tag)
                    </label>
                    <input
                      type="text"
                      value={featuredConfig?.slot3?.customTag || ''}
                      placeholder="Ex: 101A DUREZA"
                      onChange={(e) => updateFeaturedSlot('slot3', { customTag: e.target.value })}
                      className="w-full bg-[#141414] border border-[#353534] text-xs text-white px-2 py-1.5 rounded font-mono uppercase focus:outline-none focus:border-[#ff544b]"
                    />
                  </div>
                  <div>
                    <label className="font-mono text-[10px] text-gray-400 block mb-1">
                      Subtítulo
                    </label>
                    <input
                      type="text"
                      value={featuredConfig?.slot3?.customSubtitle || ''}
                      placeholder="Ex: URETANO HIGH POP"
                      onChange={(e) => updateFeaturedSlot('slot3', { customSubtitle: e.target.value })}
                      className="w-full bg-[#141414] border border-[#353534] text-xs text-white px-2 py-1.5 rounded font-mono uppercase focus:outline-none focus:border-[#ff544b]"
                    />
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Tab 2: Profit Calculator */}
      {activeSubTab === 'calculator' && (
        <div className="bg-[#181717] border border-[#353534] p-8 rounded-lg space-y-6 max-w-3xl mx-auto shadow-2xl">
          <div>
            <span className="font-mono text-xs text-[#ff544b] font-bold uppercase tracking-wider block mb-1">
              FERRAMENTA DE PRECIFICAÇÃO
            </span>
            <h3 className="font-display text-2xl font-extrabold text-white uppercase flex items-center gap-2">
              <Calculator className="w-6 h-6 text-[#ff544b]" />
              Calculadora Automática de Lucro e Margem
            </h3>
            <p className="font-sans text-xs text-gray-400 mt-1">
              Defina o preço de compra e a margem desejada para gerar o preço ideal para venda aos skatistas, garantindo a saúde financeira do seu negócio.
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 bg-[#201f1f] border border-[#353534] p-6 rounded-lg">
            <div>
              <label className="font-mono text-xs text-gray-300 block mb-1.5 font-bold">
                Preço de Custo / Compra (R$):
              </label>
              <input
                type="number"
                step="0.01"
                value={calcCost}
                onChange={(e) => {
                  const val = Number(e.target.value);
                  setCalcCost(val);
                  setCalcSalePrice(calculateSalePriceFromMargin(val, calcMargin));
                }}
                className="w-full bg-[#131313] border border-[#353534] text-sm text-white px-3 py-2.5 rounded font-mono focus:outline-none focus:border-[#ff544b]"
              />
            </div>

            <div>
              <label className="font-mono text-xs text-gray-300 block mb-1.5 font-bold">
                Margem de Lucro Desejada (%):
              </label>
              <input
                type="number"
                step="0.1"
                value={calcMargin}
                onChange={(e) => {
                  const val = Number(e.target.value);
                  setCalcMargin(val);
                  setCalcSalePrice(calculateSalePriceFromMargin(calcCost, val));
                }}
                className="w-full bg-[#131313] border border-[#ff544b] text-sm text-[#ff544b] font-bold px-3 py-2.5 rounded font-mono focus:outline-none focus:border-[#ff544b]"
              />
            </div>
          </div>

          {/* Calculator Output Display */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 bg-[#131313] border-2 border-[#ff544b] p-6 rounded-lg text-center">
            <div>
              <span className="font-mono text-xs text-gray-400 uppercase block">Preço de Venda Sugerido</span>
              <span className="font-mono text-3xl font-extrabold text-white mt-1 block">
                R$ {calcSalePrice.toFixed(2)}
              </span>
            </div>
            <div>
              <span className="font-mono text-xs text-emerald-400 uppercase block">Lucro Bruto Unitário</span>
              <span className="font-mono text-3xl font-extrabold text-emerald-400 mt-1 block">
                + R$ {(calcSalePrice - calcCost).toFixed(2)}
              </span>
            </div>
          </div>
        </div>
      )}

      {/* Tab 3: Movements Log */}
      {activeSubTab === 'movements' && (
        <div className="bg-[#181717] border border-[#353534] p-6 rounded-lg space-y-4 shadow-xl">
          <div className="flex justify-between items-center border-b border-[#353534] pb-3">
            <h3 className="font-mono text-sm font-bold text-white uppercase flex items-center gap-2">
              <History className="w-4 h-4 text-[#ff544b]" />
              Histórico de Entradas, Saídas e Vendas
            </h3>
            <span className="font-mono text-xs text-gray-400">
              Total: {stockMovements.length} registros
            </span>
          </div>

          <div className="space-y-2 max-h-[600px] overflow-y-auto pr-1">
            {stockMovements.length === 0 ? (
              <p className="font-mono text-xs text-gray-500 py-8 text-center">
                Nenhuma movimentação registrada até o momento. Cadastre produtos ou realize vendas para gerar histórico.
              </p>
            ) : (
              stockMovements.map((mov) => (
                <div
                  key={mov.id}
                  className="bg-[#201f1f] border border-[#333] p-3.5 rounded font-mono text-xs flex flex-col sm:flex-row justify-between items-start sm:items-center gap-2 hover:border-[#444] transition-colors"
                >
                  <div className="flex items-center gap-3">
                    <span
                      className={`px-2.5 py-0.5 rounded text-[10px] font-bold uppercase ${
                        mov.type === 'ENTRADA'
                          ? 'bg-emerald-950 text-emerald-300 border border-emerald-500'
                          : mov.type === 'SAÍDA_VENDA'
                          ? 'bg-blue-950 text-blue-300 border border-blue-500'
                          : 'bg-amber-950 text-amber-300 border border-amber-500'
                      }`}
                    >
                      {mov.type.replace('_', ' ')} ({mov.quantity} un)
                    </span>
                    <strong className="text-white text-sm">{mov.productName}</strong>
                  </div>
                  <div className="text-right text-gray-400 text-xs">
                    <span className="text-gray-300 font-semibold">{mov.notes}</span> &bull;{' '}
                    <span className="text-gray-500">{mov.date}</span>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      )}

      {/* ============================================================ */}
      {/* 1. MODAL: CADASTRAR NOVO PRODUTO                             */}
      {/* ============================================================ */}
      {isAddModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/85 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-[#181717] border-2 border-[#ff544b] p-6 sm:p-8 rounded-xl max-w-3xl w-full max-h-[92vh] overflow-y-auto space-y-6 shadow-2xl">
            <div className="flex justify-between items-center border-b border-[#353534] pb-4">
              <div>
                <span className="font-mono text-xs text-[#ff544b] font-bold uppercase block mb-1">
                  NOVO ITEM NO INVENTÁRIO
                </span>
                <h3 className="font-display text-2xl font-bold text-white uppercase flex items-center gap-2">
                  <Plus className="w-5 h-5 text-[#ff544b]" />
                  Cadastrar Produto no Estoque
                </h3>
              </div>
              <button
                onClick={() => setIsAddModalOpen(false)}
                className="text-gray-400 hover:text-white p-1 rounded hover:bg-[#252424]"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSaveNewProduct} className="space-y-5 font-mono text-xs">
              {/* Quick Copy Feature: Clone from existing product */}
              {clonedSourceName ? (
                <div className="bg-emerald-950/40 border border-emerald-500/60 p-3.5 rounded-lg flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 text-emerald-300">
                  <div className="flex items-center gap-2.5">
                    <CheckCircle2 className="w-5 h-5 text-emerald-400 flex-shrink-0" />
                    <div>
                      <span className="font-bold text-white text-xs block">Dados copiados de: &quot;{clonedSourceName}&quot;</span>
                      <span className="text-[11px] text-emerald-300/80">O SKU foi gerado automaticamente como único. Altere a foto, preço ou qualquer detalhe e salve como um novo produto.</span>
                    </div>
                  </div>
                  <button
                    type="button"
                    onClick={handleResetNewProdForm}
                    className="px-2.5 py-1 bg-[#201f1f] hover:bg-[#333] text-gray-300 hover:text-white rounded text-[10px] uppercase font-bold border border-[#353534] transition-colors whitespace-nowrap"
                  >
                    Limpar Cópia
                  </button>
                </div>
              ) : (
                <div className="bg-[#141414] border border-[#333] hover:border-[#ff544b]/50 p-3.5 rounded-lg flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 transition-colors">
                  <div className="flex items-center gap-2.5">
                    <div className="w-7 h-7 rounded-full bg-[#ff544b]/20 border border-[#ff544b]/40 flex items-center justify-center flex-shrink-0">
                      <Copy className="w-3.5 h-3.5 text-[#ff544b]" />
                    </div>
                    <div>
                      <span className="font-bold text-white text-xs block">Copiar produto existente como base:</span>
                      <span className="text-[11px] text-gray-400">Preencha todos os campos e depois só altere a foto, medidas ou valores.</span>
                    </div>
                  </div>
                  <div className="w-full sm:w-auto">
                    <select
                      onChange={(e) => {
                        const prod = products.find((p) => p.id === e.target.value);
                        if (prod) handleCloneProductIntoNew(prod);
                      }}
                      defaultValue=""
                      className="w-full sm:w-64 bg-[#201f1f] border border-[#353534] text-xs text-white px-2.5 py-2 rounded font-mono focus:border-[#ff544b] focus:outline-none"
                    >
                      <option value="" disabled>Selecione para copiar...</option>
                      {products.map((p) => (
                        <option key={p.id} value={p.id}>
                          {p.name} ({p.brand})
                        </option>
                      ))}
                    </select>
                  </div>
                </div>
              )}

              {/* Basic Details */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="text-gray-300 block mb-1 font-bold">Nome do Produto *</label>
                  <input
                    type="text"
                    required
                    placeholder="Ex: Shape Pro Maple Caveira 8.25"
                    value={newProdName}
                    onChange={(e) => setNewProdName(e.target.value)}
                    className="w-full bg-[#201f1f] border border-[#353534] text-white px-3 py-2 rounded focus:border-[#ff544b] focus:outline-none"
                  />
                </div>
                <div>
                  <label className="text-gray-300 block mb-1 font-bold">SKU / Código do Produto *</label>
                  <input
                    type="text"
                    required
                    placeholder="Ex: D-CAVEIRA-825"
                    value={newProdSku}
                    onChange={(e) => setNewProdSku(e.target.value)}
                    className="w-full bg-[#201f1f] border border-[#353534] text-white px-3 py-2 rounded focus:border-[#ff544b] focus:outline-none uppercase"
                  />
                </div>
              </div>

              {/* Category & Brand */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="text-gray-300 block mb-1 font-bold">Categoria *</label>
                  <select
                    value={newProdCategory}
                    onChange={(e: any) => setNewProdCategory(e.target.value)}
                    className="w-full bg-[#201f1f] border border-[#353534] text-white px-3 py-2 rounded focus:border-[#ff544b] focus:outline-none"
                  >
                    <option value="Decks">Decks (Shapes)</option>
                    <option value="Trucks">Trucks (Eixos)</option>
                    <option value="Wheels">Wheels (Rodas)</option>
                    <option value="Tênis">Tênis (Footwear Skate)</option>
                    <option value="Apparel">Apparel (Vestuário)</option>
                    <option value="Hardware">Hardware (Lixas / Parafusos)</option>
                    <option value="Acessórios">Acessórios</option>
                  </select>
                </div>

                <div>
                  <label className="text-gray-300 block mb-1 font-bold">Marca *</label>
                  <select
                    value={newProdBrand}
                    onChange={(e: any) => setNewProdBrand(e.target.value)}
                    className="w-full bg-[#201f1f] border border-[#353534] text-white px-3 py-2 rounded focus:border-[#ff544b] focus:outline-none"
                  >
                    <option value="Florishop">Florishop</option>
                    <option value="Vans">Vans</option>
                    <option value="Nike SB">Nike SB</option>
                    <option value="Adidas">Adidas</option>
                    <option value="DC Shoes">DC Shoes</option>
                    <option value="Independent">Independent</option>
                    <option value="Thunder">Thunder</option>
                    <option value="Venture">Venture</option>
                    <option value="Spitfire">Spitfire</option>
                    <option value="Outras">Outra Marca (Digitar)</option>
                  </select>
                  {newProdBrand === 'Outras' && (
                    <input
                      type="text"
                      placeholder="Nome da Marca"
                      value={newProdCustomBrand}
                      onChange={(e) => setNewProdCustomBrand(e.target.value)}
                      className="w-full mt-2 bg-[#201f1f] border border-[#ff544b] text-white px-3 py-1.5 rounded text-xs"
                    />
                  )}
                </div>
              </div>

              {/* Automatic Margin & Price Calculator Section */}
              <div className="p-4 bg-[#201f1f] border border-[#ff544b]/50 rounded-lg space-y-3">
                <div className="flex items-center justify-between">
                  <span className="font-bold text-[#ffb4ab] uppercase block">
                    Precificação Automática &amp; Rentabilidade:
                  </span>
                  <span className="text-[10px] text-gray-400">
                    Cálculo bidirecional em tempo real
                  </span>
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                  <div>
                    <label className="text-gray-300 block mb-1 font-semibold">Preço de Compra (R$)</label>
                    <input
                      type="number"
                      step="0.01"
                      required
                      value={newProdCost}
                      onChange={(e) => {
                        const val = Number(e.target.value);
                        setNewProdCost(val);
                        setNewProdSalePrice(calculateSalePriceFromMargin(val, newProdMargin));
                      }}
                      className="w-full bg-[#131313] border border-[#353534] text-white px-3 py-2 rounded font-mono font-bold focus:border-[#ff544b]"
                    />
                  </div>
                  <div>
                    <label className="text-[#ff544b] font-bold block mb-1">Margem de Lucro (%)</label>
                    <input
                      type="number"
                      step="0.1"
                      required
                      value={newProdMargin}
                      onChange={(e) => {
                        const val = Number(e.target.value);
                        setNewProdMargin(val);
                        setNewProdSalePrice(calculateSalePriceFromMargin(newProdCost, val));
                      }}
                      className="w-full bg-[#131313] border border-[#ff544b] text-[#ff544b] font-bold px-3 py-2 rounded font-mono focus:border-[#ff544b]"
                    />
                  </div>
                  <div>
                    <label className="text-emerald-400 font-bold block mb-1">Preço Venda Final (R$)</label>
                    <input
                      type="number"
                      step="0.01"
                      required
                      value={newProdSalePrice}
                      onChange={(e) => {
                        const val = Number(e.target.value);
                        setNewProdSalePrice(val);
                        if (newProdCost > 0) {
                          setNewProdMargin(calculateMarginFromSalePrice(newProdCost, val));
                        }
                      }}
                      className="w-full bg-[#131313] border border-emerald-500 text-emerald-400 font-bold px-3 py-2 rounded font-mono"
                    />
                  </div>
                </div>
                <div className="text-right text-[11px] font-mono text-emerald-400">
                  Lucro unitário estimado: <strong>+ R$ {(newProdSalePrice - newProdCost).toFixed(2)}</strong> por peça vendida
                </div>
              </div>

              {/* Stock Quantity & Badge */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="text-gray-300 block mb-1 font-bold">Estoque Inicial (Unidades) *</label>
                  <input
                    type="number"
                    min="0"
                    required
                    value={newProdStock}
                    onChange={(e) => setNewProdStock(Number(e.target.value))}
                    className="w-full bg-[#201f1f] border border-[#353534] text-white px-3 py-2 rounded focus:border-[#ff544b]"
                  />
                </div>
                <div>
                  <label className="text-gray-300 block mb-1">Selo / Badge (Opcional)</label>
                  <input
                    type="text"
                    placeholder="Ex: LANÇAMENTO, PRO SERIES, 101A"
                    value={newProdBadge}
                    onChange={(e) => setNewProdBadge(e.target.value)}
                    className="w-full bg-[#201f1f] border border-[#353534] text-white px-3 py-2 rounded uppercase"
                  />
                </div>
              </div>

              {/* Sizes / Grades */}
              <div>
                <label className="text-gray-300 block mb-1">
                  Grade de Tamanhos / Medidas (Separadas por vírgula)
                </label>
                <input
                  type="text"
                  placeholder="Ex: 38, 39, 40, 41, 42 ou 8.0, 8.25, 8.5 ou P, M, G, GG"
                  value={newProdSizes}
                  onChange={(e) => setNewProdSizes(e.target.value)}
                  className="w-full bg-[#201f1f] border border-[#353534] text-white px-3 py-2 rounded"
                />
                <div className="flex gap-2 mt-1 text-[10px] text-gray-400">
                  <span>Sugestões rápidas:</span>
                  <button
                    type="button"
                    onClick={() => setNewProdSizes('38, 39, 40, 41, 42, 43')}
                    className="text-[#ff544b] hover:underline"
                  >
                    Tênis (38-43)
                  </button>
                  <span>&bull;</span>
                  <button
                    type="button"
                    onClick={() => setNewProdSizes('7.75", 8.0", 8.25", 8.5"')}
                    className="text-[#ff544b] hover:underline"
                  >
                    Shapes (7.75-8.5)
                  </button>
                  <span>&bull;</span>
                  <button
                    type="button"
                    onClick={() => setNewProdSizes('139mm, 149mm')}
                    className="text-[#ff544b] hover:underline"
                  >
                    Trucks (139-149)
                  </button>
                </div>
              </div>

              {/* Product Images with Multi-Upload (10+ photos supported) */}
              <ProductImageUploader
                images={newProdImages}
                onImagesChange={(imgs) => setNewProdImages(imgs)}
                presetImages={PRESET_IMAGES}
                label="Fotos do Produto (Ângulos e Detalhes - Mínimo 10 fotos suportadas)"
                maxImages={15}
              />

              {/* Specs */}
              <div>
                <label className="text-gray-300 block mb-1 font-bold">
                  Especificações Técnicas (Separadas por vírgula)
                </label>
                <input
                  type="text"
                  placeholder="CANADIAN MAPLE, STREET &amp; PARK, POP DURADOURO"
                  value={newProdSpecs}
                  onChange={(e) => setNewProdSpecs(e.target.value)}
                  className="w-full bg-[#201f1f] border border-[#353534] text-white px-3 py-2 rounded uppercase"
                />
              </div>

              {/* Description */}
              <div>
                <label className="text-gray-300 block mb-1">Descrição do Produto</label>
                <textarea
                  rows={3}
                  placeholder="Descreva detalhes de acabamento, materiais e uso recomendado..."
                  value={newProdDescription}
                  onChange={(e) => setNewProdDescription(e.target.value)}
                  className="w-full bg-[#201f1f] border border-[#353534] text-white px-3 py-2 rounded focus:border-[#ff544b]"
                />
              </div>

              {/* Featured Checkbox */}
              <div className="flex items-center gap-2 pt-1">
                <input
                  type="checkbox"
                  id="newProdFeatured"
                  checked={newProdFeatured}
                  onChange={(e) => setNewProdFeatured(e.target.checked)}
                  className="w-4 h-4 accent-[#ff544b] rounded"
                />
                <label htmlFor="newProdFeatured" className="text-gray-300 cursor-pointer select-none">
                  Destacar este produto na página inicial (Vitrine Pro Series)
                </label>
              </div>

              <div className="pt-4 border-t border-[#353534] flex justify-end gap-3">
                <button
                  type="button"
                  onClick={() => setIsAddModalOpen(false)}
                  className="px-4 py-2.5 bg-[#201f1f] text-gray-300 font-bold rounded hover:text-white transition-colors"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  className="px-6 py-2.5 bg-[#ff544b] text-white font-bold uppercase rounded hover:bg-white hover:text-black transition-colors flex items-center gap-2"
                >
                  <Check className="w-4 h-4" /> Salvar e Cadastrar
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ============================================================ */}
      {/* 2. MODAL: EDITAR PRODUTO EXISTENTE                           */}
      {/* ============================================================ */}
      {editingProduct && (
        <div className="fixed inset-0 z-50 bg-black/85 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-[#181717] border-2 border-emerald-500 p-6 sm:p-8 rounded-xl max-w-3xl w-full max-h-[92vh] overflow-y-auto space-y-6 shadow-2xl">
            <div className="flex justify-between items-center border-b border-[#353534] pb-4">
              <div>
                <span className="font-mono text-xs text-emerald-400 font-bold uppercase block mb-1">
                  EDIÇÃO DE INFORMAÇÕES &bull; ID: {editingProduct.id}
                </span>
                <h3 className="font-display text-2xl font-bold text-white uppercase flex items-center gap-2">
                  <Edit2 className="w-5 h-5 text-emerald-400" />
                  Editar Produto no Estoque
                </h3>
              </div>
              <button
                onClick={() => setEditingProduct(null)}
                className="text-gray-400 hover:text-white p-1 rounded hover:bg-[#252424]"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSaveEditProduct} className="space-y-5 font-mono text-xs">
              {/* Basic Details */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="text-gray-300 block mb-1 font-bold">Nome do Produto *</label>
                  <input
                    type="text"
                    required
                    value={editName}
                    onChange={(e) => setEditName(e.target.value)}
                    className="w-full bg-[#201f1f] border border-[#353534] text-white px-3 py-2 rounded focus:border-emerald-500 focus:outline-none"
                  />
                </div>
                <div>
                  <label className="text-gray-300 block mb-1 font-bold">SKU / Código *</label>
                  <input
                    type="text"
                    required
                    value={editSku}
                    onChange={(e) => setEditSku(e.target.value)}
                    className="w-full bg-[#201f1f] border border-[#353534] text-white px-3 py-2 rounded focus:border-emerald-500 focus:outline-none uppercase"
                  />
                </div>
              </div>

              {/* Category & Brand */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="text-gray-300 block mb-1 font-bold">Categoria *</label>
                  <select
                    value={editCategory}
                    onChange={(e: any) => setEditCategory(e.target.value)}
                    className="w-full bg-[#201f1f] border border-[#353534] text-white px-3 py-2 rounded focus:border-emerald-500 focus:outline-none"
                  >
                    <option value="Decks">Decks (Shapes)</option>
                    <option value="Trucks">Trucks (Eixos)</option>
                    <option value="Wheels">Wheels (Rodas)</option>
                    <option value="Tênis">Tênis (Footwear Skate)</option>
                    <option value="Apparel">Apparel (Vestuário)</option>
                    <option value="Hardware">Hardware (Lixas / Parafusos)</option>
                    <option value="Acessórios">Acessórios</option>
                  </select>
                </div>

                <div>
                  <label className="text-gray-300 block mb-1 font-bold">Marca *</label>
                  <select
                    value={['Florishop', 'Independent', 'Thunder', 'Venture', 'Spitfire', 'Vans', 'Nike SB', 'Adidas', 'DC Shoes'].includes(editBrand) ? editBrand : 'Outras'}
                    onChange={(e: any) => setEditBrand(e.target.value)}
                    className="w-full bg-[#201f1f] border border-[#353534] text-white px-3 py-2 rounded focus:border-emerald-500 focus:outline-none"
                  >
                    <option value="Florishop">Florishop</option>
                    <option value="Vans">Vans</option>
                    <option value="Nike SB">Nike SB</option>
                    <option value="Adidas">Adidas</option>
                    <option value="DC Shoes">DC Shoes</option>
                    <option value="Independent">Independent</option>
                    <option value="Thunder">Thunder</option>
                    <option value="Venture">Venture</option>
                    <option value="Spitfire">Spitfire</option>
                    <option value="Outras">Outra Marca (Digitar)</option>
                  </select>
                  {(!['Florishop', 'Independent', 'Thunder', 'Venture', 'Spitfire', 'Vans', 'Nike SB', 'Adidas', 'DC Shoes'].includes(editBrand) || editBrand === 'Outras') && (
                    <input
                      type="text"
                      placeholder="Nome da Marca"
                      value={editCustomBrand}
                      onChange={(e) => setEditCustomBrand(e.target.value)}
                      className="w-full mt-2 bg-[#201f1f] border border-emerald-500 text-white px-3 py-1.5 rounded text-xs"
                    />
                  )}
                </div>
              </div>

              {/* Automatic Margin & Price Calculator Section */}
              <div className="p-4 bg-[#201f1f] border border-emerald-500/40 rounded-lg space-y-3">
                <div className="flex items-center justify-between">
                  <span className="font-bold text-emerald-400 uppercase block">
                    Ajuste de Preços &amp; Margem de Lucro:
                  </span>
                  <span className="text-[10px] text-gray-400">
                    Cálculo automático bidirecional
                  </span>
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                  <div>
                    <label className="text-gray-300 block mb-1 font-semibold">Preço de Compra (R$)</label>
                    <input
                      type="number"
                      step="0.01"
                      required
                      value={editCost}
                      onChange={(e) => {
                        const val = Number(e.target.value);
                        setEditCost(val);
                        setEditSalePrice(calculateSalePriceFromMargin(val, editMargin));
                      }}
                      className="w-full bg-[#131313] border border-[#353534] text-white px-3 py-2 rounded font-mono font-bold focus:border-emerald-500"
                    />
                  </div>
                  <div>
                    <label className="text-[#ff544b] font-bold block mb-1">Margem de Lucro (%)</label>
                    <input
                      type="number"
                      step="0.1"
                      required
                      value={editMargin}
                      onChange={(e) => {
                        const val = Number(e.target.value);
                        setEditMargin(val);
                        setEditSalePrice(calculateSalePriceFromMargin(editCost, val));
                      }}
                      className="w-full bg-[#131313] border border-[#ff544b] text-[#ff544b] font-bold px-3 py-2 rounded font-mono focus:border-emerald-500"
                    />
                  </div>
                  <div>
                    <label className="text-emerald-400 font-bold block mb-1">Preço Venda Final (R$)</label>
                    <input
                      type="number"
                      step="0.01"
                      required
                      value={editSalePrice}
                      onChange={(e) => {
                        const val = Number(e.target.value);
                        setEditSalePrice(val);
                        if (editCost > 0) {
                          setEditMargin(calculateMarginFromSalePrice(editCost, val));
                        }
                      }}
                      className="w-full bg-[#131313] border border-emerald-500 text-emerald-400 font-bold px-3 py-2 rounded font-mono"
                    />
                  </div>
                </div>
                <div className="text-right text-[11px] font-mono text-emerald-400">
                  Lucro unitário estimado: <strong>+ R$ {(editSalePrice - editCost).toFixed(2)}</strong> por peça
                </div>
              </div>

              {/* Stock Quantity & Badge */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="text-gray-300 block mb-1 font-bold">Quantidade Atual em Estoque *</label>
                  <input
                    type="number"
                    min="0"
                    required
                    value={editStock}
                    onChange={(e) => setEditStock(Number(e.target.value))}
                    className="w-full bg-[#201f1f] border border-[#353534] text-white px-3 py-2 rounded focus:border-emerald-500"
                  />
                  {editStock !== editingProduct.stockQuantity && (
                    <span className="text-[10px] text-amber-400 mt-1 block">
                      Atenção: A diferença de {editStock - editingProduct.stockQuantity > 0 ? `+${editStock - editingProduct.stockQuantity}` : `${editStock - editingProduct.stockQuantity}`} unidades será gravada no histórico de movimentações.
                    </span>
                  )}
                </div>
                <div>
                  <label className="text-gray-300 block mb-1">Selo / Badge (Opcional)</label>
                  <input
                    type="text"
                    placeholder="Ex: PRO SERIES, 101A"
                    value={editBadge}
                    onChange={(e) => setEditBadge(e.target.value)}
                    className="w-full bg-[#201f1f] border border-[#353534] text-white px-3 py-2 rounded uppercase"
                  />
                </div>
              </div>

              {/* Sizes */}
              <div>
                <label className="text-gray-300 block mb-1">Grade de Tamanhos (Separadas por vírgula)</label>
                <input
                  type="text"
                  placeholder="Ex: 38, 39, 40, 41, 42 ou 8.0, 8.25, 8.5"
                  value={editSizes}
                  onChange={(e) => setEditSizes(e.target.value)}
                  className="w-full bg-[#201f1f] border border-[#353534] text-white px-3 py-2 rounded"
                />
              </div>

              {/* Product Images with Multi-Upload (10+ photos supported) */}
              <ProductImageUploader
                images={editImages}
                onImagesChange={(imgs) => setEditImages(imgs)}
                presetImages={PRESET_IMAGES}
                label="Fotos do Produto (Ângulos e Detalhes - Mínimo 10 fotos suportadas)"
                maxImages={15}
              />

              {/* Specs */}
              <div>
                <label className="text-gray-300 block mb-1 font-bold">
                  Especificações Técnicas (Separadas por vírgula)
                </label>
                <input
                  type="text"
                  value={editSpecs}
                  onChange={(e) => setEditSpecs(e.target.value)}
                  className="w-full bg-[#201f1f] border border-[#353534] text-white px-3 py-2 rounded uppercase"
                />
              </div>

              {/* Description */}
              <div>
                <label className="text-gray-300 block mb-1">Descrição</label>
                <textarea
                  rows={3}
                  value={editDescription}
                  onChange={(e) => setEditDescription(e.target.value)}
                  className="w-full bg-[#201f1f] border border-[#353534] text-white px-3 py-2 rounded focus:border-emerald-500"
                />
              </div>

              {/* Featured Checkbox */}
              <div className="flex items-center gap-2 pt-1">
                <input
                  type="checkbox"
                  id="editFeatured"
                  checked={editFeatured}
                  onChange={(e) => setEditFeatured(e.target.checked)}
                  className="w-4 h-4 accent-emerald-500 rounded"
                />
                <label htmlFor="editFeatured" className="text-gray-300 cursor-pointer select-none">
                  Destacar este produto na página inicial (Vitrine Pro Series)
                </label>
              </div>

              <div className="pt-4 border-t border-[#353534] flex flex-wrap items-center justify-between gap-3">
                <button
                  type="button"
                  onClick={() => {
                    const prodToClone = editingProduct;
                    setEditingProduct(null);
                    handleCloneProductIntoNew(prodToClone);
                  }}
                  className="px-4 py-2.5 bg-[#201f1f] border border-emerald-500/60 text-emerald-400 hover:bg-emerald-600 hover:text-white font-bold rounded transition-colors flex items-center gap-1.5 uppercase text-xs shadow-sm"
                  title="Copiar os dados deste produto para criar um novo produto no estoque"
                >
                  <Copy className="w-4 h-4" />
                  <span>Copiar como Novo Cadastro</span>
                </button>

                <div className="flex items-center gap-3">
                  <button
                    type="button"
                    onClick={() => setEditingProduct(null)}
                    className="px-4 py-2.5 bg-[#201f1f] text-gray-300 font-bold rounded hover:text-white transition-colors"
                  >
                    Cancelar
                  </button>
                  <button
                    type="submit"
                    className="px-6 py-2.5 bg-emerald-600 text-white font-bold uppercase rounded hover:bg-emerald-500 transition-colors flex items-center gap-2"
                  >
                    <Check className="w-4 h-4" /> Salvar Alterações
                  </button>
                </div>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ============================================================ */}
      {/* 3. MODAL: CONFIRMAR EXCLUSÃO DE PRODUTO                      */}
      {/* ============================================================ */}
      {productToDelete && (
        <div className="fixed inset-0 z-50 bg-black/85 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-[#181717] border-2 border-red-500 p-6 sm:p-7 rounded-xl max-w-md w-full space-y-5 shadow-2xl animate-fade-in font-mono text-xs">
            <div className="flex items-center gap-3 text-red-400">
              <div className="w-10 h-10 rounded-full bg-red-950/60 border border-red-500 flex items-center justify-center flex-shrink-0">
                <AlertTriangle className="w-5 h-5 text-red-400" />
              </div>
              <div>
                <h3 className="font-display text-lg font-bold text-white uppercase">
                  Excluir Produto
                </h3>
                <span className="text-[11px] text-gray-400">
                  Esta ação é irreversível
                </span>
              </div>
            </div>

            <div className="bg-[#201f1f] border border-[#333] p-3.5 rounded-lg flex items-center gap-3.5">
              <img
                src={productToDelete.images[0]}
                alt={productToDelete.name}
                className="w-12 h-12 object-contain bg-[#111] border border-[#444] rounded p-1 flex-shrink-0"
              />
              <div className="min-w-0 flex-1">
                <strong className="text-white block text-sm truncate">{productToDelete.name}</strong>
                <span className="text-gray-400 block text-[11px]">SKU: {productToDelete.sku}</span>
                <span className="text-amber-400 block text-[11px] mt-0.5">
                  Estoque atual: {productToDelete.stockQuantity} unidades
                </span>
              </div>
            </div>

            <p className="text-gray-300 leading-relaxed">
              Tem certeza que deseja remover este produto do estoque da <strong>Florishop Skate</strong>? O produto deixará de aparecer na loja e no catálogo.
            </p>

            <div className="pt-2 flex justify-end gap-2.5">
              <button
                type="button"
                onClick={() => setProductToDelete(null)}
                className="px-4 py-2.5 bg-[#252424] hover:bg-[#333] text-gray-300 font-bold rounded transition-colors"
              >
                Cancelar
              </button>
              <button
                type="button"
                onClick={handleConfirmDelete}
                className="px-5 py-2.5 bg-red-600 hover:bg-red-500 text-white font-bold uppercase rounded flex items-center gap-2 transition-colors"
              >
                <Trash2 className="w-4 h-4" /> Sim, Excluir
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Modal: Product Picker for Featured Showcase Slot */}
      {pickerSlot && (
        <div className="fixed inset-0 z-50 bg-black/85 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-[#181717] border-2 border-[#ff544b] w-full max-w-4xl max-h-[90vh] rounded-lg shadow-2xl flex flex-col font-mono text-xs overflow-hidden">
            {/* Modal Header */}
            <div className="p-4 sm:p-5 border-b border-[#353534] bg-[#201f1f] flex items-center justify-between">
              <div className="space-y-0.5">
                <span className="text-[10px] text-[#ff544b] font-bold uppercase tracking-wider block">
                  Configuração de Vitrine
                </span>
                <h3 className="font-display text-lg sm:text-xl font-bold text-white uppercase flex items-center gap-2">
                  <Star className="w-4 h-4 text-amber-400 fill-amber-400" />
                  {pickerSlot === 'slot1' && 'Selecionar Produto para o Destaque 1 (Card Principal Grande)'}
                  {pickerSlot === 'slot2' && 'Selecionar Produto para o Destaque 2 (Superior Direito)'}
                  {pickerSlot === 'slot3' && 'Selecionar Produto para o Destaque 3 (Inferior Direito)'}
                </h3>
              </div>
              <button
                type="button"
                onClick={() => setPickerSlot(null)}
                className="p-1.5 text-gray-400 hover:text-white rounded hover:bg-[#333]"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Filter Bar in Picker */}
            <div className="p-4 border-b border-[#2e2e2e] bg-[#1a1919] flex flex-col sm:flex-row gap-3 items-stretch sm:items-center justify-between">
              <div className="relative flex-1">
                <input
                  type="text"
                  placeholder="Pesquisar por nome, SKU ou marca..."
                  value={pickerSearch}
                  onChange={(e) => setPickerSearch(e.target.value)}
                  className="w-full bg-[#252424] border border-[#3a3a39] text-xs text-white pl-9 pr-3 py-2 rounded font-mono focus:outline-none focus:border-[#ff544b]"
                  autoFocus
                />
                <Search className="w-4 h-4 text-gray-400 absolute left-3 top-2.5" />
                {pickerSearch && (
                  <button
                    type="button"
                    onClick={() => setPickerSearch('')}
                    className="absolute right-2.5 top-2.5 text-gray-400 hover:text-white"
                  >
                    <X className="w-3.5 h-3.5" />
                  </button>
                )}
              </div>

              <div className="flex items-center gap-1.5 overflow-x-auto pb-1 sm:pb-0">
                {['Todas', 'Decks', 'Trucks', 'Wheels', 'Tênis', 'Apparel', 'Hardware', 'Acessórios'].map((cat) => (
                  <button
                    key={cat}
                    type="button"
                    onClick={() => setPickerCategory(cat)}
                    className={`px-2.5 py-1.5 rounded whitespace-nowrap text-[11px] transition-colors ${
                      pickerCategory === cat
                        ? 'bg-[#ff544b] text-white font-bold'
                        : 'bg-[#252424] text-gray-400 hover:text-white'
                    }`}
                  >
                    {cat}
                  </button>
                ))}
              </div>
            </div>

            {/* Product List */}
            <div className="p-4 overflow-y-auto flex-1 space-y-2 max-h-[55vh]">
              {filteredPickerProducts.length === 0 ? (
                <div className="text-center py-12 text-gray-500 font-mono">
                  Nenhum produto corresponde à busca &quot;{pickerSearch}&quot;.
                </div>
              ) : (
                filteredPickerProducts.map((prod) => {
                  const isCurrentSlot = featuredConfig?.[pickerSlot]?.productId === prod.id;
                  const isOtherSlot1 = pickerSlot !== 'slot1' && featuredConfig?.slot1?.productId === prod.id;
                  const isOtherSlot2 = pickerSlot !== 'slot2' && featuredConfig?.slot2?.productId === prod.id;
                  const isOtherSlot3 = pickerSlot !== 'slot3' && featuredConfig?.slot3?.productId === prod.id;

                  return (
                    <div
                      key={prod.id}
                      onClick={() => {
                        updateFeaturedSlot(pickerSlot, { productId: prod.id });
                        setPickerSlot(null);
                        showToast(`"${prod.name}" selecionado para o Destaque com sucesso!`);
                      }}
                      className={`p-3 rounded-lg border transition-all cursor-pointer flex items-center justify-between gap-4 ${
                        isCurrentSlot
                          ? 'bg-amber-950/30 border-amber-500/80 shadow-md ring-1 ring-amber-500'
                          : 'bg-[#201f1f] border-[#333] hover:border-[#ff544b] hover:bg-[#252424]'
                      }`}
                    >
                      <div className="flex items-center gap-3.5 min-w-0">
                        <img
                          src={prod.images[0]}
                          alt={prod.name}
                          className="w-12 h-12 object-contain bg-[#111] border border-[#3a3a39] p-1 rounded flex-shrink-0"
                        />
                        <div className="min-w-0">
                          <div className="flex items-center gap-2">
                            <h5 className="font-bold text-white text-xs truncate">{prod.name}</h5>
                            {isCurrentSlot && (
                              <span className="px-2 py-0.5 text-[9px] bg-amber-500 text-black font-extrabold rounded uppercase">
                                Selecionado Atualmente
                              </span>
                            )}
                            {isOtherSlot1 && (
                              <span className="px-1.5 py-0.2 text-[9px] bg-gray-800 text-gray-300 rounded">
                                No Destaque 1
                              </span>
                            )}
                            {isOtherSlot2 && (
                              <span className="px-1.5 py-0.2 text-[9px] bg-gray-800 text-gray-300 rounded">
                                No Destaque 2
                              </span>
                            )}
                            {isOtherSlot3 && (
                              <span className="px-1.5 py-0.2 text-[9px] bg-gray-800 text-gray-300 rounded">
                                No Destaque 3
                              </span>
                            )}
                          </div>
                          <div className="flex items-center gap-2 mt-0.5 text-[10px] text-gray-400">
                            <span className="text-[#ffb4ab]">SKU: {prod.sku}</span>
                            <span>&bull;</span>
                            <span>{prod.category}</span>
                            <span>&bull;</span>
                            <span>{prod.brand}</span>
                            <span>&bull;</span>
                            <span className={prod.stockQuantity <= 3 ? 'text-amber-400 font-bold' : 'text-gray-300'}>
                              Estoque: {prod.stockQuantity} un
                            </span>
                          </div>
                        </div>
                      </div>

                      <div className="flex items-center gap-3 flex-shrink-0">
                        <span className="font-mono text-sm font-bold text-white">
                          R$ {prod.salePrice.toFixed(2)}
                        </span>
                        <button
                          type="button"
                          className={`px-3 py-1.5 rounded font-mono text-[11px] font-bold uppercase transition-colors ${
                            isCurrentSlot
                              ? 'bg-amber-500 text-black'
                              : 'bg-[#333] hover:bg-[#ff544b] text-white'
                          }`}
                        >
                          {isCurrentSlot ? 'Manter' : 'Escolher'}
                        </button>
                      </div>
                    </div>
                  );
                })
              )}
            </div>

            {/* Modal Footer */}
            <div className="p-3 border-t border-[#353534] bg-[#201f1f] flex justify-between items-center text-gray-400 text-[11px]">
              <span>Clique no produto desejado para fixá-lo nesta posição de destaque.</span>
              <button
                type="button"
                onClick={() => setPickerSlot(null)}
                className="px-4 py-1.5 bg-[#2a2a2a] hover:bg-[#333] text-white rounded font-bold"
              >
                Fechar
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Modal de Integração Supabase e Migrations */}
      <SupabaseSyncModal
        isOpen={isSupabaseModalOpen}
        onClose={() => setIsSupabaseModalOpen(false)}
      />
    </div>
  );
};
