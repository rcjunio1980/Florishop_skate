'use client';

import React from 'react';
import { useStore } from './StoreContext';
import { ArrowRight } from 'lucide-react';

export const CategoriesSection: React.FC = () => {
  const { setCategoryFilter, setActiveTab } = useStore();

  const handleSelectCategory = (catValue: string) => {
    if (catValue === 'Tênis') {
      setActiveTab('tenis');
    } else {
      setCategoryFilter(catValue);
      setActiveTab('catalog');
    }
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const categories = [
    {
      title: 'Shapes',
      catValue: 'Decks',
      sub: 'Canadense & Marfim',
      bgImg:
        'https://lh3.googleusercontent.com/aida-public/AB6AXuBTLmiMPeH6V4cBksAy9G3jSlis70oee9mtptIepzXCSyxozDFPzH8FOWG1zq7qdteyVnKFU8lY3C4naJHDKet-SLqsul3E-MNfYl4HF5kmdavbNn_RBQsq24_SEJywy6jdSchptC9-ph-29OrlDFs2K_8hEtKt8PF-8e0edPInCNm14weGimYTvwtpXar4rhUCSj3S3b_72WYn3MVUG4ytRZSed0ccbYFH-S4vCAfb8YlNeMWiW92ZpA',
    },
    {
      title: 'Trucks',
      catValue: 'Trucks',
      sub: 'Eixos Hollow & Titânio',
      bgImg:
        'https://lh3.googleusercontent.com/aida-public/AB6AXuAOW3Joj-wpERzZWxKZnAv0btlSBMnGWjRQMYzINz2upASFFaq-GoF2LdQZ5FLcEeFvGmTjEbP8ovfx7xblK4LFx2YImHlMpSeh4_rPlcumB1sfCzWeup9j12K81U5_PrNneTpWbjQvHtXzXpSQHo4hgTLsLBwaTyymycogfRpc_-XV8r18WBrGgnmgRX1Ge1F0BxsPdSR4T1b4PuczH8hjAYeuFW7SWCLjXaffIGbgkMkJPeUPRqMJAQ',
    },
    {
      title: 'Rodas',
      catValue: 'Wheels',
      sub: 'Uretano 99A a 101A',
      bgImg:
        'https://lh3.googleusercontent.com/aida-public/AB6AXuA2DLKDYsvouLtWK8TgfY-4m00CWUW6TYM8HIc-PkKJtOm_vibyyP8BwzL4NnRLOZrDBJZimQ2vE1TfxNAJ1MiTWlB_I6_qv9_0WCJ56Kiay3MKCknnsPq9SQPRakjVjYeZ-lxF750cq9TEm1WUwykUQl1cfaZXzV8d2ra8GJlx5JZgqPfVtId56dssk1byzxI8tNbWVmezsup3y_i2fCxQaz9gux0OxTlF_oOuencc4TtHbKJ7yNXM4A',
    },
    {
      title: 'Tênis',
      catValue: 'Tênis',
      sub: 'Camurça & Grip Vulc',
      bgImg:
        'https://images.unsplash.com/photo-1525966222134-fcfa99b8ae77?w=800&q=80',
    },
    {
      title: 'Vestuário',
      catValue: 'Apparel',
      sub: 'Heavyweight & Hoodies',
      bgImg:
        'https://lh3.googleusercontent.com/aida-public/AB6AXuDEscvCU12F4hLxHd32NRVUdL9fh4iHJXGMjEtuBXb9c06Ym2NEVp91DtnL7QvDJjXE5GaN8wFI_XMtxHeQ5zR-HY6ao_jokl5QEpW3hejzE2PsXJ5wi-UdQa_WXUUQYw3CJugbPNOJUVPde4LAohvMgaYF1H_DNaXmERAFkQmT1KD1K-uxwvTTaAUCUfv9lg1BxTBVsaLJwK_Y7thdX6KHkjaySd2i_Bf-WKMtftAEWhPPjMfnAVks8A',
    },
    {
      title: 'Hardware',
      catValue: 'Hardware',
      sub: 'Lixas, Parafusos & Tools',
      bgImg:
        'https://lh3.googleusercontent.com/aida-public/AB6AXuB2eL2P_5aY3nE5t2E7eYp8UoXz0t1w4Qv7n6Xj-kL9m8Pq5rSt7uVw8xYz1A2b3c4d5e6f7g8h9i0j1k2l3m4n5o6p7q8r9s0t1u2v3w4x5y6z',
    },
  ];

  return (
    <section className="px-4 md:px-12 mx-auto w-full max-w-7xl py-12">
      <h2 className="font-display text-2xl md:text-4xl font-extrabold text-[#e5e2e1] uppercase tracking-tight mb-8 border-b border-[#353534] pb-4">
        Explore as <span className="text-[#ff544b]">Categorias</span>
      </h2>

      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
        {categories.map((cat, index) => (
          <button
            key={cat.title}
            onClick={() => handleSelectCategory(cat.catValue)}
            className={`group relative h-80 overflow-hidden border border-[#333333] hover:border-[#ff544b] transition-all duration-300 flex items-end p-6 rounded ${
              index % 2 === 1 ? 'lg:translate-y-4' : ''
            }`}
          >
            <div className="absolute inset-0 z-0 bg-[#201f1f]">
              <div
                className="w-full h-full bg-cover bg-center opacity-40 group-hover:scale-110 transition-transform duration-700 mix-blend-luminosity filter brightness-75"
                style={{ backgroundImage: `url('${cat.bgImg}')` }}
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black via-black/50 to-transparent" />
            </div>

            <div className="relative z-10 w-full text-left">
              <span className="font-mono text-[11px] text-[#ffb4ab] uppercase tracking-wider block mb-1">
                {cat.sub}
              </span>
              <div className="flex justify-between items-center w-full">
                <h3 className="font-display text-3xl font-extrabold text-white uppercase tracking-tight">
                  {cat.title}
                </h3>
                <ArrowRight className="w-5 h-5 text-[#ff544b] opacity-0 group-hover:opacity-100 group-hover:translate-x-2 transition-all" />
              </div>
              <div className="w-0 h-[2px] bg-[#ff544b] group-hover:w-full transition-all duration-300 mt-2" />
            </div>
          </button>
        ))}
      </div>
    </section>
  );
};
