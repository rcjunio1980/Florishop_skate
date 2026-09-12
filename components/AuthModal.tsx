'use client';

import React, { useState } from 'react';
import { useStore } from './StoreContext';
import { X, Lock, Mail, User as UserIcon, Phone, MapPin, ShieldAlert, CheckCircle2, ArrowRight, Eye, EyeOff } from 'lucide-react';
import { fetchAddressAndShipping } from '@/lib/shipping';

export const AuthModal: React.FC = () => {
  const {
    authModalOpen,
    authModalMode,
    openAuthModal,
    closeAuthModal,
    login,
    registerUser,
  } = useStore();

  const [activeTab, setActiveTab] = useState<'login' | 'register' | 'admin-login'>(authModalMode || 'login');
  const [showPassword, setShowPassword] = useState(false);

  // Form states
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [name, setName] = useState('');
  const [phone, setPhone] = useState('');
  const [cpf, setCpf] = useState('');

  // Address fields for registration
  const [cep, setCep] = useState('');
  const [street, setStreet] = useState('');
  const [number, setNumber] = useState('');
  const [complement, setComplement] = useState('');
  const [neighborhood, setNeighborhood] = useState('');
  const [city, setCity] = useState('');
  const [state, setState] = useState('');
  const [isLookingUpCep, setIsLookingUpCep] = useState(false);

  const [errorMessage, setErrorMessage] = useState('');
  const [successMessage, setSuccessMessage] = useState('');

  // Sync mode if changed externally during render
  const [prevMode, setPrevMode] = useState(authModalMode);
  if (authModalMode && authModalMode !== prevMode) {
    setPrevMode(authModalMode);
    setActiveTab(authModalMode);
    setErrorMessage('');
    setSuccessMessage('');
  }

  if (!authModalOpen) return null;

  const handleCepLookup = async (cepInput: string) => {
    const cleanCep = cepInput.replace(/\D/g, '');
    setCep(cepInput);
    if (cleanCep.length === 8) {
      setIsLookingUpCep(true);
      try {
        const result = await fetchAddressAndShipping(cleanCep, 100);
        if (result.address) {
          if (result.address.street) setStreet(result.address.street);
          if (result.address.neighborhood) setNeighborhood(result.address.neighborhood);
          if (result.address.city) setCity(result.address.city);
          if (result.address.state) setState(result.address.state);
        }
      } catch (err) {
        console.error('Erro ao consultar CEP:', err);
      } finally {
        setIsLookingUpCep(false);
      }
    }
  };

  const handleLoginSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage('');
    const res = login(email, password);
    if (!res.success) {
      setErrorMessage(res.error || 'Falha ao autenticar.');
    } else {
      setSuccessMessage('Login efetuado com sucesso!');
    }
  };

  const handleAdminLoginSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage('');
    const res = login(email, password);
    if (!res.success) {
      setErrorMessage(res.error || 'Credenciais de administrador inválidas.');
    } else {
      setSuccessMessage('Acesso administrativo concedido!');
    }
  };

  const handleRegisterSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage('');
    const res = registerUser({
      name,
      email,
      password,
      phone,
      cpf,
      address: cep ? {
        cep,
        street,
        number,
        complement,
        neighborhood,
        city,
        state,
      } : undefined,
    });

    if (!res.success) {
      setErrorMessage(res.error || 'Erro ao realizar cadastro.');
    } else {
      setSuccessMessage('Conta criada com sucesso! Você já está conectado.');
    }
  };

  return (
    <div
      onClick={closeAuthModal}
      className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-fadeIn"
    >
      <div
        onClick={(e) => e.stopPropagation()}
        className="relative w-full max-w-lg bg-[#181717] border-2 border-[#5c403c] rounded-lg shadow-2xl overflow-hidden flex flex-col max-h-[90vh]"
      >
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-[#2d2c2c] bg-[#201f1f]">
          <div className="flex items-center gap-2.5">
            {activeTab === 'admin-login' ? (
              <div className="w-8 h-8 rounded bg-[#ff544b]/20 border border-[#ff544b] flex items-center justify-center text-[#ff544b]">
                <Lock className="w-4 h-4" />
              </div>
            ) : (
              <div className="w-8 h-8 rounded bg-[#ff544b]/20 border border-[#ff544b] flex items-center justify-center text-[#ff544b]">
                <UserIcon className="w-4 h-4" />
              </div>
            )}
            <div>
              <h2 className="font-display text-lg font-bold text-white uppercase tracking-tight">
                {activeTab === 'admin-login' ? 'Painel de Administração' : activeTab === 'register' ? 'Criar Conta de Cliente' : 'Acesse sua Conta'}
              </h2>
              <p className="text-[11px] font-mono text-gray-400">
                {activeTab === 'admin-login'
                  ? 'Gestão de estoque e cadastro de usuários'
                  : 'Necessário para fechar pedidos e comprar na loja'}
              </p>
            </div>
          </div>

          <button
            onClick={closeAuthModal}
            className="text-gray-400 hover:text-white p-1 rounded hover:bg-[#2e2d2d] transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Tab Selector */}
        <div className="grid grid-cols-3 border-b border-[#2d2c2c] bg-[#141414] font-mono text-xs">
          <button
            type="button"
            onClick={() => {
              setActiveTab('login');
              setErrorMessage('');
            }}
            className={`py-3 text-center border-b-2 font-bold transition-all uppercase tracking-wider ${
              activeTab === 'login'
                ? 'border-[#ff544b] text-[#ff544b] bg-[#201f1f]'
                : 'border-transparent text-gray-400 hover:text-white'
            }`}
          >
            Entrar
          </button>
          <button
            type="button"
            onClick={() => {
              setActiveTab('register');
              setErrorMessage('');
            }}
            className={`py-3 text-center border-b-2 font-bold transition-all uppercase tracking-wider ${
              activeTab === 'register'
                ? 'border-[#ff544b] text-[#ff544b] bg-[#201f1f]'
                : 'border-transparent text-gray-400 hover:text-white'
            }`}
          >
            Cadastrar
          </button>
          <button
            type="button"
            onClick={() => {
              setActiveTab('admin-login');
              setErrorMessage('');
            }}
            className={`py-3 text-center border-b-2 font-bold transition-all uppercase tracking-wider flex items-center justify-center gap-1.5 ${
              activeTab === 'admin-login'
                ? 'border-[#ff544b] text-[#ff544b] bg-[#201f1f]'
                : 'border-transparent text-gray-400 hover:text-white'
            }`}
          >
            <Lock className="w-3 h-3" />
            Admin
          </button>
        </div>

        {/* Error / Success Feedback */}
        {errorMessage && (
          <div className="mx-6 mt-4 p-3 bg-red-950/70 border border-red-500/50 rounded font-mono text-xs text-red-300 flex items-start gap-2">
            <ShieldAlert className="w-4 h-4 text-red-400 flex-shrink-0 mt-0.5" />
            <span>{errorMessage}</span>
          </div>
        )}

        {successMessage && (
          <div className="mx-6 mt-4 p-3 bg-emerald-950/70 border border-emerald-500/50 rounded font-mono text-xs text-emerald-300 flex items-center gap-2">
            <CheckCircle2 className="w-4 h-4 text-emerald-400 flex-shrink-0" />
            <span>{successMessage}</span>
          </div>
        )}

        {/* Form Content */}
        <div className="p-6 overflow-y-auto space-y-4">
          {/* TAB 1: LOGIN */}
          {activeTab === 'login' && (
            <form onSubmit={handleLoginSubmit} className="space-y-4 font-mono text-xs">
              <div className="bg-[#201f1f] p-3 rounded border border-[#353534] text-gray-300 space-y-1">
                <span className="font-bold text-white flex items-center gap-1.5">
                  <Lock className="w-3.5 h-3.5 text-[#ff544b]" />
                  Acesso Obrigatório para Comprar
                </span>
                <p className="text-[11px] text-gray-400">
                  Para segurança dos pedidos e entregas, é necessário estar autenticado para concluir qualquer compra.
                </p>
              </div>

              <div className="space-y-1.5">
                <label className="text-gray-300 font-bold block uppercase tracking-wider">E-mail</label>
                <div className="relative">
                  <Mail className="w-4 h-4 absolute left-3 top-3 text-gray-500" />
                  <input
                    type="email"
                    required
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="seu.email@exemplo.com"
                    className="w-full bg-[#131313] border border-[#353534] rounded pl-10 pr-3 py-2.5 text-white placeholder-gray-600 focus:outline-none focus:border-[#ff544b]"
                  />
                </div>
              </div>

              <div className="space-y-1.5">
                <div className="flex justify-between items-center">
                  <label className="text-gray-300 font-bold block uppercase tracking-wider">Senha</label>
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="text-gray-400 hover:text-white flex items-center gap-1 text-[10px]"
                  >
                    {showPassword ? <EyeOff className="w-3 h-3" /> : <Eye className="w-3 h-3" />}
                    {showPassword ? 'Ocultar' : 'Ver'}
                  </button>
                </div>
                <div className="relative">
                  <Lock className="w-4 h-4 absolute left-3 top-3 text-gray-500" />
                  <input
                    type={showPassword ? 'text' : 'password'}
                    required
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="••••••••"
                    className="w-full bg-[#131313] border border-[#353534] rounded pl-10 pr-3 py-2.5 text-white placeholder-gray-600 focus:outline-none focus:border-[#ff544b]"
                  />
                </div>
              </div>

              <button
                type="submit"
                className="w-full py-3 bg-[#ff544b] hover:bg-white text-white hover:text-[#ff544b] font-bold text-xs uppercase tracking-wider rounded transition-all flex items-center justify-center gap-2 shadow-lg"
              >
                <span>Entrar na Minha Conta</span>
                <ArrowRight className="w-4 h-4" />
              </button>

              <div className="text-center pt-2">
                <span className="text-gray-400 text-[11px]">Ainda não tem conta? </span>
                <button
                  type="button"
                  onClick={() => setActiveTab('register')}
                  className="text-[#ff544b] font-bold hover:underline text-[11px]"
                >
                  Cadastre-se agora
                </button>
              </div>
            </form>
          )}

          {/* TAB 2: REGISTER */}
          {activeTab === 'register' && (
            <form onSubmit={handleRegisterSubmit} className="space-y-4 font-mono text-xs">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div className="space-y-1.5 sm:col-span-2">
                  <label className="text-gray-300 font-bold block uppercase tracking-wider">
                    Nome Completo *
                  </label>
                  <input
                    type="text"
                    required
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    placeholder="Ex: Pedro Henrique Silva"
                    className="w-full bg-[#131313] border border-[#353534] rounded px-3 py-2.5 text-white placeholder-gray-600 focus:outline-none focus:border-[#ff544b]"
                  />
                </div>

                <div className="space-y-1.5">
                  <label className="text-gray-300 font-bold block uppercase tracking-wider">
                    E-mail *
                  </label>
                  <input
                    type="email"
                    required
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="seu.email@exemplo.com"
                    className="w-full bg-[#131313] border border-[#353534] rounded px-3 py-2.5 text-white placeholder-gray-600 focus:outline-none focus:border-[#ff544b]"
                  />
                </div>

                <div className="space-y-1.5">
                  <label className="text-gray-300 font-bold block uppercase tracking-wider">
                    Senha de Acesso *
                  </label>
                  <input
                    type="password"
                    required
                    minLength={4}
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="Mínimo 4 dígitos"
                    className="w-full bg-[#131313] border border-[#353534] rounded px-3 py-2.5 text-white placeholder-gray-600 focus:outline-none focus:border-[#ff544b]"
                  />
                </div>

                <div className="space-y-1.5">
                  <label className="text-gray-300 font-bold block uppercase tracking-wider">
                    WhatsApp / Telefone
                  </label>
                  <input
                    type="text"
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                    placeholder="(48) 99999-9999"
                    className="w-full bg-[#131313] border border-[#353534] rounded px-3 py-2.5 text-white placeholder-gray-600 focus:outline-none focus:border-[#ff544b]"
                  />
                </div>

                <div className="space-y-1.5">
                  <label className="text-gray-300 font-bold block uppercase tracking-wider">
                    CPF (Opcional)
                  </label>
                  <input
                    type="text"
                    value={cpf}
                    onChange={(e) => setCpf(e.target.value)}
                    placeholder="000.000.000-00"
                    className="w-full bg-[#131313] border border-[#353534] rounded px-3 py-2.5 text-white placeholder-gray-600 focus:outline-none focus:border-[#ff544b]"
                  />
                </div>
              </div>

              {/* Endereço de Entrega (Opcional ou para agilizar) */}
              <div className="border-t border-[#2d2c2c] pt-3 space-y-2">
                <span className="font-bold text-white flex items-center gap-1.5 text-xs">
                  <MapPin className="w-3.5 h-3.5 text-[#ff544b]" />
                  Endereço de Entrega Padrão (Opcional)
                </span>
                <p className="text-[10px] text-gray-400">
                  Preenchendo agora, seu endereço já virá pronto em todas as suas compras.
                </p>

                <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                  <div>
                    <label className="text-[10px] text-gray-400 uppercase">CEP</label>
                    <input
                      type="text"
                      maxLength={9}
                      value={cep}
                      onChange={(e) => handleCepLookup(e.target.value)}
                      placeholder="88000-000"
                      className="w-full bg-[#131313] border border-[#353534] rounded px-2.5 py-1.5 text-white text-xs"
                    />
                    {isLookingUpCep && <span className="text-[9px] text-[#ff544b]">Buscando CEP...</span>}
                  </div>

                  <div className="col-span-2">
                    <label className="text-[10px] text-gray-400 uppercase">Logradouro / Rua</label>
                    <input
                      type="text"
                      value={street}
                      onChange={(e) => setStreet(e.target.value)}
                      placeholder="Rua, Avenida..."
                      className="w-full bg-[#131313] border border-[#353534] rounded px-2.5 py-1.5 text-white text-xs"
                    />
                  </div>

                  <div>
                    <label className="text-[10px] text-gray-400 uppercase">Número</label>
                    <input
                      type="text"
                      value={number}
                      onChange={(e) => setNumber(e.target.value)}
                      placeholder="123"
                      className="w-full bg-[#131313] border border-[#353534] rounded px-2.5 py-1.5 text-white text-xs"
                    />
                  </div>

                  <div>
                    <label className="text-[10px] text-gray-400 uppercase">Complemento</label>
                    <input
                      type="text"
                      value={complement}
                      onChange={(e) => setComplement(e.target.value)}
                      placeholder="Apto, Bloco..."
                      className="w-full bg-[#131313] border border-[#353534] rounded px-2.5 py-1.5 text-white text-xs"
                    />
                  </div>

                  <div>
                    <label className="text-[10px] text-gray-400 uppercase">Bairro</label>
                    <input
                      type="text"
                      value={neighborhood}
                      onChange={(e) => setNeighborhood(e.target.value)}
                      placeholder="Centro"
                      className="w-full bg-[#131313] border border-[#353534] rounded px-2.5 py-1.5 text-white text-xs"
                    />
                  </div>

                  <div>
                    <label className="text-[10px] text-gray-400 uppercase">Cidade</label>
                    <input
                      type="text"
                      value={city}
                      onChange={(e) => setCity(e.target.value)}
                      placeholder="Florianópolis"
                      className="w-full bg-[#131313] border border-[#353534] rounded px-2.5 py-1.5 text-white text-xs"
                    />
                  </div>

                  <div>
                    <label className="text-[10px] text-gray-400 uppercase">Estado (UF)</label>
                    <input
                      type="text"
                      maxLength={2}
                      value={state}
                      onChange={(e) => setState(e.target.value.toUpperCase())}
                      placeholder="SC"
                      className="w-full bg-[#131313] border border-[#353534] rounded px-2.5 py-1.5 text-white text-xs uppercase"
                    />
                  </div>
                </div>
              </div>

              <button
                type="submit"
                className="w-full py-3 bg-[#ff544b] hover:bg-white text-white hover:text-[#ff544b] font-bold text-xs uppercase tracking-wider rounded transition-all flex items-center justify-center gap-2 shadow-lg"
              >
                <span>Criar Conta e Conectar</span>
                <CheckCircle2 className="w-4 h-4" />
              </button>

              <div className="text-center pt-1">
                <span className="text-gray-400 text-[11px]">Já possui cadastro? </span>
                <button
                  type="button"
                  onClick={() => setActiveTab('login')}
                  className="text-[#ff544b] font-bold hover:underline text-[11px]"
                >
                  Faça login aqui
                </button>
              </div>
            </form>
          )}

          {/* TAB 3: ADMIN LOGIN */}
          {activeTab === 'admin-login' && (
            <form onSubmit={handleAdminLoginSubmit} className="space-y-4 font-mono text-xs">
              <div className="bg-[#2a1b1a] border border-[#ff544b]/40 p-3 rounded text-gray-300 space-y-1.5">
                <div className="flex items-center gap-2 text-[#ffb4ab] font-bold text-xs">
                  <ShieldAlert className="w-4 h-4 text-[#ff544b]" />
                  <span>ÁREA RESTRITA DA ADMINISTRAÇÃO</span>
                </div>
                <p className="text-[11px] text-gray-300 leading-relaxed">
                  Ao autenticar como administrador, você terá acesso total à <strong>Gestão de Estoque &amp; Lucro</strong> e à <strong>Gestão de Cadastro de Clientes</strong> da loja.
                </p>
              </div>

              <div className="space-y-1.5">
                <label className="text-gray-300 font-bold block uppercase tracking-wider">E-mail do Administrador</label>
                <div className="relative">
                  <Mail className="w-4 h-4 absolute left-3 top-3 text-gray-500" />
                  <input
                    type="email"
                    required
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="admin@florishop.com.br"
                    className="w-full bg-[#131313] border border-[#353534] rounded pl-10 pr-3 py-2.5 text-white placeholder-gray-600 focus:outline-none focus:border-[#ff544b]"
                  />
                </div>
              </div>

              <div className="space-y-1.5">
                <div className="flex justify-between items-center">
                  <label className="text-gray-300 font-bold block uppercase tracking-wider">Senha do Administrador</label>
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="text-gray-400 hover:text-white flex items-center gap-1 text-[10px]"
                  >
                    {showPassword ? <EyeOff className="w-3 h-3" /> : <Eye className="w-3 h-3" />}
                    {showPassword ? 'Ocultar' : 'Ver'}
                  </button>
                </div>
                <div className="relative">
                  <Lock className="w-4 h-4 absolute left-3 top-3 text-gray-500" />
                  <input
                    type={showPassword ? 'text' : 'password'}
                    required
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="••••••••"
                    className="w-full bg-[#131313] border border-[#353534] rounded pl-10 pr-3 py-2.5 text-white placeholder-gray-600 focus:outline-none focus:border-[#ff544b]"
                  />
                </div>
              </div>

              <button
                type="submit"
                className="w-full py-3 bg-[#ff544b] hover:bg-white text-white hover:text-[#ff544b] font-bold text-xs uppercase tracking-wider rounded transition-all flex items-center justify-center gap-2 shadow-lg"
              >
                <Lock className="w-4 h-4" />
                <span>Entrar como Administrador</span>
              </button>
            </form>
          )}
        </div>
      </div>
    </div>
  );
};
