'use client';

import React, { useState } from 'react';
import { useStore } from './StoreContext';
import {
  ShoppingCart,
  User,
  Search,
  Menu,
  X,
  PackageCheck,
  LayoutDashboard,
  Users,
  ClipboardList,
  LogOut,
  ShieldCheck,
  Lock,
} from 'lucide-react';

export const Navbar: React.FC = () => {
  const {
    isHydrated,
    cart,
    orders,
    activeTab,
    setActiveTab,
    searchQuery,
    setSearchQuery,
    categoryFilter,
    setCategoryFilter,
    currentUser,
    isAdmin,
    isLoggedIn,
    logout,
    openAuthModal,
  } = useStore();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [isSearchOpen, setIsSearchOpen] = useState(false);
  const [isUserDropdownOpen, setIsUserDropdownOpen] = useState(false);

  const cartItemsCount = isHydrated ? cart.reduce((acc, item) => acc + item.quantity, 0) : 0;

  const handleCategoryNav = (catValue: string) => {
    setCategoryFilter(catValue);
    setActiveTab('catalog');
    setIsMobileMenuOpen(false);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const menuCategories = [
    { label: 'SHAPES', category: 'Decks' },
    { label: 'TRUCKS', category: 'Trucks' },
    { label: 'RODAS', category: 'Wheels' },
    { label: 'TÊNIS', category: 'Tênis' },
    { label: 'VESTUÁRIO', category: 'Apparel' },
    { label: 'HARDWARE', category: 'Hardware' },
  ];

  const isCategoryActive = (category: string) => {
    if (activeTab === 'catalog') {
      return categoryFilter.toLowerCase() === category.toLowerCase();
    }
    if (activeTab === 'tenis' && category.toLowerCase() === 'tênis') {
      return true;
    }
    return false;
  };

  return (
    <header className="sticky top-0 z-50 w-full border-b-2 border-[#5c403c] bg-[#131313]/90 backdrop-blur-md">
      <nav className="flex justify-between items-center px-4 md:px-12 py-3.5 w-full max-w-[1440px] mx-auto">
        {/* Brand */}
        <div className="flex items-center gap-6">
          <button
            onClick={() => {
              setCategoryFilter('Todos');
              setActiveTab('home');
              window.scrollTo({ top: 0, behavior: 'smooth' });
            }}
            className="font-display text-2xl md:text-3xl font-extrabold tracking-tighter text-[#e5e2e1] hover:text-[#ff544b] transition-all duration-200 text-left uppercase"
          >
            FLORISHOP SKATE
          </button>
        </div>

        {/* Desktop Nav Links */}
        <ul className="hidden lg:flex gap-5 items-center">
          {menuCategories.map((item) => (
            <li key={item.label}>
              <button
                onClick={() => handleCategoryNav(item.category)}
                className={`font-mono text-xs uppercase tracking-wider py-1 border-b-2 transition-colors ${
                  isCategoryActive(item.category)
                    ? 'border-[#ff544b] text-[#ff544b] font-bold'
                    : 'border-transparent text-[#e5e2e1] hover:text-[#ff544b] hover:border-[#ff544b]'
                }`}
              >
                {item.label}
              </button>
            </li>
          ))}
          <li>
            <button
              onClick={() => {
                setCategoryFilter('Todos');
                setActiveTab('catalog');
                window.scrollTo({ top: 0, behavior: 'smooth' });
              }}
              className={`font-mono text-xs uppercase tracking-wider px-3 py-1 rounded border transition-colors ${
                activeTab === 'catalog' && categoryFilter === 'Todos'
                  ? 'border-[#ff544b] text-[#ff544b] bg-[#ff544b]/10 font-bold'
                  : 'border-[#353534] text-[#c8c6c5] hover:border-[#ff544b] hover:text-white'
              }`}
            >
              TODOS OS PRODUTOS
            </button>
          </li>

          {/* ADMIN EXCLUSIVE LINKS - Visible ONLY when logged in as administrator */}
          {isAdmin && (
            <>
              <li>
                <button
                  onClick={() => {
                    setActiveTab('admin-stock');
                    window.scrollTo({ top: 0, behavior: 'smooth' });
                  }}
                  className={`font-mono text-xs uppercase tracking-wider px-3 py-1 rounded transition-colors flex items-center gap-1.5 ${
                    activeTab === 'admin-stock'
                      ? 'bg-[#ff544b] text-white font-bold'
                      : 'bg-[#2a1b1a] text-[#ffb4ab] hover:bg-[#ff544b] hover:text-white border border-[#ff544b]/50'
                  }`}
                >
                  <LayoutDashboard className="w-3.5 h-3.5" />
                  GESTÃO DE ESTOQUE
                </button>
              </li>
              <li>
                <button
                  onClick={() => {
                    setActiveTab('admin-orders');
                    window.scrollTo({ top: 0, behavior: 'smooth' });
                  }}
                  className={`font-mono text-xs uppercase tracking-wider px-3 py-1 rounded transition-colors flex items-center gap-1.5 ${
                    activeTab === 'admin-orders'
                      ? 'bg-[#ff544b] text-white font-bold'
                      : 'bg-[#2a1b1a] text-[#ffb4ab] hover:bg-[#ff544b] hover:text-white border border-[#ff544b]/50'
                  }`}
                >
                  <ClipboardList className="w-3.5 h-3.5" />
                  GESTÃO DE PEDIDOS
                  {orders.length > 0 && (
                    <span className="bg-white/20 text-white text-[10px] px-1.5 py-0.2 rounded-full font-bold ml-0.5">
                      {orders.length}
                    </span>
                  )}
                </button>
              </li>
              <li>
                <button
                  onClick={() => {
                    setActiveTab('admin-users');
                    window.scrollTo({ top: 0, behavior: 'smooth' });
                  }}
                  className={`font-mono text-xs uppercase tracking-wider px-3 py-1 rounded transition-colors flex items-center gap-1.5 ${
                    activeTab === 'admin-users'
                      ? 'bg-[#ff544b] text-white font-bold'
                      : 'bg-[#2a1b1a] text-[#ffb4ab] hover:bg-[#ff544b] hover:text-white border border-[#ff544b]/50'
                  }`}
                >
                  <Users className="w-3.5 h-3.5" />
                  GESTÃO DE CADASTROS
                </button>
              </li>
            </>
          )}
        </ul>

        {/* Trailing Actions */}
        <div className="flex items-center gap-2.5 md:gap-3.5 text-[#ffb4ab]">
          {/* Quick Search */}
          <div className="relative">
            {isSearchOpen ? (
              <div className="flex items-center bg-[#201f1f] border border-[#ff544b] rounded px-2 py-1">
                <input
                  type="text"
                  placeholder="Buscar shapes, trucks..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter') {
                      setActiveTab('catalog');
                    }
                  }}
                  autoFocus
                  className="bg-transparent text-xs text-white placeholder-gray-500 focus:outline-none w-36 md:w-48 font-mono"
                />
                <button
                  onClick={() => setIsSearchOpen(false)}
                  className="text-gray-400 hover:text-white ml-1"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>
            ) : (
              <button
                onClick={() => {
                  setIsSearchOpen(true);
                  if (activeTab !== 'catalog') setActiveTab('catalog');
                }}
                title="Buscar no site"
                className="p-1.5 hover:text-white hover:scale-105 transition-all text-[#e5e2e1]"
              >
                <Search className="w-5 h-5" />
              </button>
            )}
          </div>

          {/* User Account / Auth Section */}
          {!isLoggedIn ? (
            <div className="flex items-center gap-1.5">
              <button
                onClick={() => openAuthModal('login')}
                className="flex items-center gap-1.5 px-3 py-1.5 bg-[#201f1f] hover:bg-[#ff544b] hover:text-white border border-[#353534] text-[#e5e2e1] font-mono text-xs uppercase font-bold rounded transition-all shadow-sm"
              >
                <User className="w-4 h-4 text-[#ff544b] group-hover:text-white" />
                <span className="hidden sm:inline">Entrar</span>
              </button>
            </div>
          ) : (
            <div className="relative">
              <button
                onClick={() => setIsUserDropdownOpen(!isUserDropdownOpen)}
                className={`flex items-center gap-1.5 px-2.5 py-1.5 rounded font-mono text-xs transition-colors border ${
                  isAdmin
                    ? 'bg-[#2a1b1a] border-[#ff544b]/60 text-[#ffb4ab]'
                    : 'bg-[#201f1f] border-[#353534] text-white hover:border-[#ff544b]'
                }`}
              >
                {isAdmin ? (
                  <ShieldCheck className="w-4 h-4 text-[#ff544b]" />
                ) : (
                  <User className="w-4 h-4 text-[#ff544b]" />
                )}
                <span className="hidden sm:inline font-bold">
                  {isAdmin ? 'Admin' : currentUser?.name ? currentUser.name.split(' ')[0] : 'Usuário'}
                </span>
              </button>

              {/* User Dropdown Menu */}
              {isUserDropdownOpen && (
                <div
                  onMouseLeave={() => setIsUserDropdownOpen(false)}
                  className="absolute right-0 mt-2 w-56 bg-[#181717] border-2 border-[#5c403c] rounded-lg shadow-2xl py-2 z-50 font-mono text-xs animate-fadeIn"
                >
                  <div className="px-4 py-2 border-b border-[#2a2a2a]">
                    <span className="text-[10px] text-gray-500 uppercase block font-bold">
                      {isAdmin ? 'Modo Administrador' : 'Cliente Conectado'}
                    </span>
                    <span className="text-white font-bold block truncate">{currentUser?.name}</span>
                    <span className="text-[11px] text-gray-400 block truncate">{currentUser?.email}</span>
                  </div>

                  {isAdmin ? (
                    <div className="py-1">
                      <button
                        onClick={() => {
                          setActiveTab('admin-stock');
                          setIsUserDropdownOpen(false);
                        }}
                        className="w-full text-left px-4 py-2 text-gray-300 hover:bg-[#201f1f] hover:text-[#ff544b] flex items-center gap-2"
                      >
                        <LayoutDashboard className="w-4 h-4 text-[#ff544b]" />
                        Gestão de Estoque
                      </button>
                      <button
                        onClick={() => {
                          setActiveTab('admin-orders');
                          setIsUserDropdownOpen(false);
                        }}
                        className="w-full text-left px-4 py-2 text-gray-300 hover:bg-[#201f1f] hover:text-[#ff544b] flex items-center justify-between"
                      >
                        <span className="flex items-center gap-2">
                          <ClipboardList className="w-4 h-4 text-[#ff544b]" />
                          Gestão de Pedidos
                        </span>
                        {orders.length > 0 && (
                          <span className="text-[10px] bg-[#ff544b] text-white px-1.5 py-0.5 rounded-full font-bold">
                            {orders.length}
                          </span>
                        )}
                      </button>
                      <button
                        onClick={() => {
                          setActiveTab('admin-users');
                          setIsUserDropdownOpen(false);
                        }}
                        className="w-full text-left px-4 py-2 text-gray-300 hover:bg-[#201f1f] hover:text-[#ff544b] flex items-center gap-2"
                      >
                        <Users className="w-4 h-4 text-[#ff544b]" />
                        Gestão de Cadastros
                      </button>
                    </div>
                  ) : null}

                  <div className="py-1 border-t border-[#2a2a2a]">
                    <button
                      onClick={() => {
                        setActiveTab('orders-history');
                        setIsUserDropdownOpen(false);
                      }}
                      className="w-full text-left px-4 py-2 text-gray-300 hover:bg-[#201f1f] hover:text-white flex items-center gap-2"
                    >
                      <PackageCheck className="w-4 h-4 text-[#ff544b]" />
                      Meus Pedidos
                    </button>
                    <button
                      onClick={() => {
                        logout();
                        setIsUserDropdownOpen(false);
                      }}
                      className="w-full text-left px-4 py-2 text-red-400 hover:bg-[#2a1a1a] flex items-center gap-2 font-bold"
                    >
                      <LogOut className="w-4 h-4" />
                      Sair da Conta
                    </button>
                  </div>
                </div>
              )}
            </div>
          )}

          {/* Orders History Icon for quick access */}
          <button
            onClick={() => setActiveTab('orders-history')}
            title="Meus Pedidos"
            className={`p-1.5 transition-all ${
              activeTab === 'orders-history' ? 'text-[#ff544b]' : 'text-[#e5e2e1] hover:text-[#ff544b]'
            }`}
          >
            <PackageCheck className="w-5 h-5" />
          </button>

          {/* Cart Icon: Exibido apenas para clientes; administradores não possuem carrinho de compras */}
          {!isAdmin && (
            <button
              onClick={() => {
                if (!isLoggedIn) {
                  openAuthModal('login');
                } else {
                  setActiveTab('checkout');
                }
              }}
              title={isLoggedIn ? 'Ver Carrinho de Compras' : 'Faça login para ver seu carrinho'}
              className="p-1.5 text-[#e5e2e1] hover:text-[#ff544b] transition-all relative"
            >
              <ShoppingCart className="w-5 h-5" />
              {isLoggedIn && cartItemsCount > 0 && (
                <span className="absolute -top-1 -right-1 bg-[#ff544b] text-white text-[10px] font-mono font-bold w-4 h-4 rounded-full flex items-center justify-center">
                  {cartItemsCount}
                </span>
              )}
            </button>
          )}

          {/* Mobile Menu Toggle */}
          <button
            onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
            className="lg:hidden p-1.5 text-[#e5e2e1] hover:text-[#ff544b]"
          >
            {isMobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
          </button>
        </div>
      </nav>

      {/* Mobile Drawer Navigation */}
      {isMobileMenuOpen && (
        <div className="lg:hidden bg-[#1c1b1b] border-b border-[#5c403c] px-6 py-4 flex flex-col gap-3 font-mono text-sm uppercase">
          {/* User status in mobile */}
          <div className="pb-3 border-b border-[#2a2a2a] flex items-center justify-between">
            {isLoggedIn ? (
              <div className="flex items-center justify-between w-full">
                <div>
                  <span className="text-[10px] text-gray-400 block font-normal">Conectado como</span>
                  <span className="font-bold text-white text-xs">{currentUser?.name}</span>
                </div>
                <button
                  onClick={() => {
                    logout();
                    setIsMobileMenuOpen(false);
                  }}
                  className="text-xs text-red-400 flex items-center gap-1 font-bold"
                >
                  <LogOut className="w-3.5 h-3.5" /> Sair
                </button>
              </div>
            ) : (
              <button
                onClick={() => {
                  openAuthModal('login');
                  setIsMobileMenuOpen(false);
                }}
                className="w-full py-2 bg-[#ff544b] text-white rounded font-bold text-xs uppercase flex items-center justify-center gap-2"
              >
                <User className="w-4 h-4" /> Entrar / Criar Conta
              </button>
            )}
          </div>

          {menuCategories.map((item) => (
            <button
              key={item.label}
              onClick={() => handleCategoryNav(item.category)}
              className={`text-left py-1.5 border-b border-[#2a2a2a] flex items-center justify-between transition-colors ${
                isCategoryActive(item.category)
                  ? 'text-[#ff544b] font-bold'
                  : 'text-[#e5e2e1] hover:text-[#ff544b]'
              }`}
            >
              <span>{item.label}</span>
              {item.category === 'Tênis' && (
                <span className="text-[10px] bg-[#ff544b]/20 text-[#ff544b] px-1.5 py-0.5 rounded font-bold">
                  NOVO
                </span>
              )}
            </button>
          ))}
          <button
            onClick={() => {
              setCategoryFilter('Todos');
              setActiveTab('catalog');
              setIsMobileMenuOpen(false);
            }}
            className={`text-left py-2 font-bold transition-colors ${
              activeTab === 'catalog' && categoryFilter === 'Todos'
                ? 'text-[#ff544b]'
                : 'text-[#ffb4ab] hover:text-white'
            }`}
          >
            TODOS OS PRODUTOS (CATÁLOGO)
          </button>

          {/* ADMIN ONLY BUTTONS IN MOBILE */}
          {isAdmin && (
            <div className="pt-2 border-t border-[#353534] space-y-2">
              <span className="text-[10px] text-[#ff544b] font-bold block">PAINEL DO ADMINISTRADOR</span>
              <button
                onClick={() => {
                  setActiveTab('admin-stock');
                  setIsMobileMenuOpen(false);
                }}
                className="w-full text-left bg-[#ff544b] text-white px-3 py-2 rounded font-bold flex items-center gap-2 justify-center text-xs"
              >
                <LayoutDashboard className="w-4 h-4" /> GESTÃO DE ESTOQUE
              </button>
              <button
                onClick={() => {
                  setActiveTab('admin-orders');
                  setIsMobileMenuOpen(false);
                }}
                className={`w-full text-left px-3 py-2 rounded font-bold flex items-center gap-2 justify-center text-xs ${
                  activeTab === 'admin-orders'
                    ? 'bg-[#ff544b] text-white'
                    : 'bg-[#201f1f] border border-[#ff544b]/50 text-[#ffb4ab]'
                }`}
              >
                <ClipboardList className="w-4 h-4 text-[#ff544b]" /> GESTÃO DE PEDIDOS ({orders.length})
              </button>
              <button
                onClick={() => {
                  setActiveTab('admin-users');
                  setIsMobileMenuOpen(false);
                }}
                className="w-full text-left bg-[#201f1f] border border-[#ff544b]/50 text-[#ffb4ab] px-3 py-2 rounded font-bold flex items-center gap-2 justify-center text-xs"
              >
                <Users className="w-4 h-4 text-[#ff544b]" /> GESTÃO DE CADASTROS
              </button>
            </div>
          )}

          {!isAdmin && (
            <div className="pt-2 border-t border-[#2a2a2a]">
              <button
                onClick={() => {
                  openAuthModal('admin-login');
                  setIsMobileMenuOpen(false);
                }}
                className="text-[11px] text-gray-500 hover:text-gray-300 flex items-center gap-1.5"
              >
                <Lock className="w-3.5 h-3.5" /> Acesso Administrativo
              </button>
            </div>
          )}
        </div>
      )}
    </header>
  );
};
