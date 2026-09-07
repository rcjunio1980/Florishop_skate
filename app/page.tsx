'use client';

import React from 'react';
import { StoreProvider, useStore } from '@/components/StoreContext';
import { Navbar } from '@/components/Navbar';
import { HeroSection } from '@/components/HeroSection';
import { FeaturedSection } from '@/components/FeaturedSection';
import { CategoriesSection } from '@/components/CategoriesSection';
import { ProductCatalog } from '@/components/ProductCatalog';
import { ProductDetailView } from '@/components/ProductDetailView';
import { CartCheckoutModal } from '@/components/CartCheckoutModal';
import { StockAdminPanel } from '@/components/StockAdminPanel';
import { UsersAdminPanel } from '@/components/UsersAdminPanel';
import { OrdersAdminPanel } from '@/components/OrdersAdminPanel';
import { OrdersHistoryModal } from '@/components/OrdersHistoryModal';
import { TenisView } from '@/components/TenisView';
import { Footer } from '@/components/Footer';
import { AuthModal } from '@/components/AuthModal';

function MainContent() {
  const { activeTab } = useStore();

  return (
    <div className="min-h-screen flex flex-col justify-between bg-[#131313] text-[#e5e2e1] relative">
      <div className="texture-overlay" />
      <Navbar />

      <main className="flex-grow">
        {activeTab === 'home' && (
          <>
            <HeroSection />
            <FeaturedSection />
            <CategoriesSection />
            <ProductCatalog />
          </>
        )}

        {activeTab === 'catalog' && <ProductCatalog />}
        {activeTab === 'tenis' && <TenisView />}
        {activeTab === 'detail' && <ProductDetailView />}
        {activeTab === 'checkout' && <CartCheckoutModal />}
        {activeTab === 'admin-stock' && <StockAdminPanel />}
        {activeTab === 'admin-orders' && <OrdersAdminPanel />}
        {activeTab === 'admin-users' && <UsersAdminPanel />}
        {activeTab === 'orders-history' && <OrdersHistoryModal />}
      </main>

      <Footer />
      <AuthModal />
    </div>
  );
}

export default function Home() {
  return (
    <StoreProvider>
      <MainContent />
    </StoreProvider>
  );
}
