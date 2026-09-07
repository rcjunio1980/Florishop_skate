'use client';

import React from 'react';
import { useStore } from './StoreContext';
import { ArrowRight, Flame } from 'lucide-react';

export const HeroSection: React.FC = () => {
  const { setActiveTab, openProductDetail, products } = useStore();

  const handleHeroCta = () => {
    const featuredShape = products.find((p) => p.id === 'prod-1') || products[0];
    if (featuredShape) {
      openProductDetail(featuredShape);
    } else {
      setActiveTab('catalog');
    }
  };

  return (
    <header className="relative w-full min-h-[82vh] flex items-center justify-center overflow-hidden bg-[#0D0D0D] border-b-2 border-[#5c403c]">
      {/* Hero Background Image */}
      <div className="absolute inset-0 z-0">
        <div
          className="bg-cover bg-center w-full h-full opacity-35 filter brightness-75 contrast-125"
          style={{
            backgroundImage: `url('https://lh3.googleusercontent.com/aida-public/AB6AXuBSaUp91RbuON7jWqkN8FdQ3k8If_dAe88TmJThSCcBBZvM4P0TGlB6ODe4RqL2197Or3F2xVt--ib-Ra7s5R_zAUcof1HZcr5FnT98GbmSORD9nkhGfm3sKKWG8E1U6aRkpUZYBPWuZLdtphXJG4sItmbR4MSOWzx81_CiBHIWbpJBX1lP4qY9iKAMKOAH_g7omXp0cT4-nR4YYh_vafDh579LFReykhvc58Eq0rNPTG-Szu1y6Rc7vg')`,
          }}
        />
        <div className="absolute inset-0 bg-gradient-to-t from-[#131313] via-[#131313]/70 to-transparent" />
      </div>

      <div className="relative z-10 flex flex-col items-center text-center px-4 md:px-8 w-full max-w-5xl py-12 gap-6">
        {/* Provided Brand Logo */}
        <div className="w-56 h-56 md:w-72 md:h-72 rounded-full overflow-hidden border-4 border-[#5c403c] bg-[#201f1f] shadow-2xl relative group transform transition-transform hover:scale-105 duration-300">
          <img
            src="https://lh3.googleusercontent.com/aida-public/AB6AXuCkMXdPMpF73lvs04kjj6cjOgP8H5pwHfQJq8dI2EWTH2g0nHv5IR2p8d0a2gC4DYlG2mmv80ZhNmAW052-EZ2LFsc1a3Lz7XNMk7M9i_uAHgF4SUdVlnx2TA5_9HOxyVTJZIknOUec_M9E807QZlEZuaRcflpsHXyYAGWb67U45gogJTISvvrlCfOt6xqA9L_efGKSzXKT2I2pYE09565WIw87Oqw-ysXlYNHmz-Uld64TFdMkausQ_VgKn0VWD5DZQBk"
            alt="Florishop Skate Logo"
            className="w-full h-full object-cover"
          />
          <div className="absolute inset-0 border-2 border-white/10 rounded-full pointer-events-none" />
        </div>

        <div className="flex flex-col items-center gap-3">
          <div className="inline-flex items-center gap-2 px-3 py-1 bg-[#2a2a2a] border border-[#ff544b] text-[#ff544b] font-mono text-xs uppercase rounded">
            <Flame className="w-3.5 h-3.5" />
            Lançamento Pro Series 2026
          </div>
          <h1 className="font-display text-3xl sm:text-5xl md:text-6xl font-extrabold text-white uppercase tracking-tight drop-shadow-xl leading-tight">
            Skate <span className="text-[#ff544b]">-</span> Estilo <span className="text-[#ff544b]">-</span> Atitude
          </h1>
          <p className="font-sans text-base sm:text-lg text-[#c8c6c5] max-w-2xl mt-2 leading-relaxed">
            Equipamentos de alta performance para quem vive o asfalto. Autenticidade, resistência e estilo em cada drop.
          </p>
        </div>

        <button
          onClick={handleHeroCta}
          className="mt-4 px-8 py-4 bg-[#ff544b] text-white font-mono font-bold text-sm uppercase tracking-widest border-2 border-transparent hover:bg-white hover:text-[#ff544b] hover:border-[#ff544b] transition-all duration-300 glow-effect flex items-center gap-2 rounded group"
        >
          GARANTIR MEU SHAPE
          <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
        </button>
      </div>
    </header>
  );
};
