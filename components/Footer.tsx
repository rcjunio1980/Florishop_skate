'use client';

import React from 'react';
import { useStore } from './StoreContext';
import { QrCode, CreditCard, Building2, Phone, Instagram, ShieldCheck, Lock } from 'lucide-react';

export const Footer: React.FC = () => {
  const { setActiveTab, setCategoryFilter, openAuthModal } = useStore();

  return (
    <footer className="bg-[#0D0D0D] border-t-2 border-[#5c403c] text-[#c8c6c5] pt-12 pb-8 px-4 md:px-12 font-sans mt-20">
      <div className="max-w-7xl mx-auto grid grid-cols-1 md:grid-cols-4 gap-8 mb-12">
        {/* Col 1: Brand */}
        <div className="space-y-4">
          <button
            onClick={() => {
              setActiveTab('home');
              window.scrollTo({ top: 0, behavior: 'smooth' });
            }}
            className="font-display text-2xl font-extrabold text-white uppercase tracking-tighter hover:text-[#ff544b] transition-colors text-left"
          >
            FLORISHOP SKATE
          </button>
          <p className="font-sans text-xs text-gray-400 leading-relaxed">
            Equipamentos e artigos de skate de alta resistência e streetwear com estilo e atitude.
          </p>
          <div className="flex items-center gap-3 text-white">
            <a href="https://instagram.com" target="_blank" rel="noopener noreferrer" className="p-2 bg-[#201f1f] hover:bg-[#ff544b] rounded transition-colors">
              <Instagram className="w-4 h-4" />
            </a>
            <div className="flex items-center gap-1 font-mono text-[11px] text-[#ffb4ab]">
              <ShieldCheck className="w-4 h-4 text-[#ff544b]" />
              <span>Compra 100% Segura</span>
            </div>
          </div>
        </div>

        {/* Col 2: Categories */}
        <div className="space-y-3 font-mono text-xs">
          <h4 className="font-bold text-white uppercase border-b border-[#2a2a2a] pb-2">Nossas Peças</h4>
          <ul className="space-y-2 text-gray-400">
            {['Decks', 'Trucks', 'Wheels', 'Apparel', 'Hardware', 'Tênis'].map((cat) => (
              <li key={cat}>
                <button
                  onClick={() => {
                    if (cat === 'Tênis') {
                      setActiveTab('tenis');
                    } else {
                      setCategoryFilter(cat);
                      setActiveTab('catalog');
                    }
                    window.scrollTo({ top: 0, behavior: 'smooth' });
                  }}
                  className="hover:text-[#ff544b] transition-colors"
                >
                  {cat === 'Decks' ? 'Shapes & Decks' : cat === 'Tênis' ? 'Tênis (Footwear)' : cat}
                </button>
              </li>
            ))}
          </ul>
        </div>

        {/* Col 3: Payment Accepted (DIRECT REQUIREMENT) */}
        <div className="space-y-3 font-mono text-xs">
          <h4 className="font-bold text-white uppercase border-b border-[#2a2a2a] pb-2">Formas de Pagamento</h4>
          <div className="space-y-2">
            <div className="flex items-center gap-2 bg-[#181717] p-2 border border-[#333] rounded">
              <QrCode className="w-4 h-4 text-[#ff544b]" />
              <span>PIX Instantâneo (-5% OFF)</span>
            </div>
            <div className="flex items-center gap-2 bg-[#181717] p-2 border border-[#333] rounded">
              <CreditCard className="w-4 h-4 text-[#ff544b]" />
              <span>Maquininha (Até 5x Sem Juros)</span>
            </div>
            <div className="flex items-center gap-2 bg-[#181717] p-2 border border-[#333] rounded">
              <Building2 className="w-4 h-4 text-[#ff544b]" />
              <span>Depósito / Transf. Bancária</span>
            </div>
          </div>
        </div>

        {/* Col 4: Contact */}
        <div className="space-y-3 font-mono text-xs">
          <h4 className="font-bold text-white uppercase border-b border-[#2a2a2a] pb-2">Atendimento</h4>
          <a
            href="https://wa.me/5511932299075"
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center gap-2 text-gray-300 hover:text-white transition-colors group"
          >
            <Phone className="w-4 h-4 text-[#ff544b] group-hover:scale-110 transition-transform" />
            <span>(11) 93229-9075 &bull; Whats Direct</span>
          </a>
          <p className="text-xs text-emerald-400 font-bold flex items-center gap-1.5 pt-1">
            <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse"></span>
            Atendimento 24 horas
          </p>
        </div>
      </div>

      <div className="max-w-7xl mx-auto border-t border-[#2a2a2a] pt-6 flex flex-col sm:flex-row justify-between items-center text-xs font-mono text-gray-500 gap-4">
        <p>&copy; 2026 FLORISHOP SKATE &bull; Todos os direitos reservados.</p>
        <div className="flex items-center gap-4 text-[11px]">
          <button
            onClick={() => openAuthModal('admin-login')}
            className="hover:text-gray-300 transition-colors flex items-center gap-1 text-gray-500"
          >
            <Lock className="w-3 h-3 text-[#ff544b]" /> Acesso Administrativo
          </button>
          <span className="text-gray-600">&bull;</span>
          <p className="text-[10px]">Desenvolvido por <span className="text-gray-400 font-semibold">Rubens C. Junior</span></p>
        </div>
      </div>
    </footer>
  );
};
