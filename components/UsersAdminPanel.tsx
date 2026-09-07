'use client';

import React, { useState } from 'react';
import { useStore } from './StoreContext';
import { User, Order } from '@/lib/skate-store';
import {
  Users,
  Search,
  UserPlus,
  ShieldCheck,
  ShieldAlert,
  Edit2,
  Trash2,
  CheckCircle,
  XCircle,
  Eye,
  Mail,
  Phone,
  MapPin,
  Calendar,
  ShoppingBag,
  Package,
  Layers,
  LayoutDashboard,
  Filter,
  X,
  Plus,
  ClipboardList,
  Database
} from 'lucide-react';
import { SupabaseSyncModal } from './SupabaseSyncModal';

export const UsersAdminPanel: React.FC = () => {
  const {
    users,
    orders,
    currentUser,
    isAdmin,
    setActiveTab,
    addUser,
    updateUserStatus,
    updateUserProfile,
    deleteUser,
    openAuthModal,
  } = useStore();

  const [searchTerm, setSearchTerm] = useState('');
  const [roleFilter, setRoleFilter] = useState<'all' | 'customer' | 'admin'>('all');
  const [statusFilter, setStatusFilter] = useState<'all' | 'active' | 'blocked'>('all');
  const [isSupabaseModalOpen, setIsSupabaseModalOpen] = useState(false);

  // Selected user for details modal
  const [viewUser, setViewUser] = useState<User | null>(null);

  // Edit / Add modal
  const [editModalOpen, setEditModalOpen] = useState(false);
  const [editingUserId, setEditingUserId] = useState<string | null>(null);
  const [formName, setFormName] = useState('');
  const [formEmail, setFormEmail] = useState('');
  const [formPassword, setFormPassword] = useState('');
  const [formPhone, setFormPhone] = useState('');
  const [formCpf, setFormCpf] = useState('');
  const [formRole, setFormRole] = useState<'customer' | 'admin'>('customer');
  const [formStatus, setFormStatus] = useState<'active' | 'blocked'>('active');
  const [formCep, setFormCep] = useState('');
  const [formStreet, setFormStreet] = useState('');
  const [formNumber, setFormNumber] = useState('');
  const [formNeighborhood, setFormNeighborhood] = useState('');
  const [formCity, setFormCity] = useState('');
  const [formState, setFormState] = useState('');

  // If not admin, show guard screen
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
              Você precisa estar autenticado com login e senha de administrador para acessar a Gestão de Cadastros de Clientes e Usuários.
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

  // Calculate order stats per user
  const getUserOrders = (user: User): Order[] => {
    return orders.filter(
      (o) =>
        o.userId === user.id ||
        (o.customerEmail && o.customerEmail.toLowerCase() === user.email.toLowerCase())
    );
  };

  const getUserTotalSpent = (user: User): number => {
    const userOrders = getUserOrders(user);
    return userOrders.reduce((sum, o) => sum + (o.total || 0), 0);
  };

  // Filtered users list
  const filteredUsers = users.filter((u) => {
    const matchesSearch =
      u.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      u.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (u.phone && u.phone.includes(searchTerm)) ||
      (u.cpf && u.cpf.includes(searchTerm)) ||
      (u.address?.city && u.address.city.toLowerCase().includes(searchTerm.toLowerCase()));

    const matchesRole = roleFilter === 'all' || u.role === roleFilter;
    const matchesStatus = statusFilter === 'all' || u.status === statusFilter;

    return matchesSearch && matchesRole && matchesStatus;
  });

  const totalUsers = users.length;
  const activeCount = users.filter((u) => u.status === 'active').length;
  const blockedCount = users.filter((u) => u.status === 'blocked').length;
  const customerCount = users.filter((u) => u.role === 'customer').length;

  const handleOpenAddModal = () => {
    setEditingUserId(null);
    setFormName('');
    setFormEmail('');
    setFormPassword('');
    setFormPhone('');
    setFormCpf('');
    setFormRole('customer');
    setFormStatus('active');
    setFormCep('');
    setFormStreet('');
    setFormNumber('');
    setFormNeighborhood('');
    setFormCity('');
    setFormState('');
    setEditModalOpen(true);
  };

  const handleOpenEditModal = (u: User) => {
    setEditingUserId(u.id);
    setFormName(u.name);
    setFormEmail(u.email);
    setFormPassword(u.password || '');
    setFormPhone(u.phone || '');
    setFormCpf(u.cpf || '');
    setFormRole(u.role);
    setFormStatus(u.status);
    setFormCep(u.address?.cep || '');
    setFormStreet(u.address?.street || '');
    setFormNumber(u.address?.number || '');
    setFormNeighborhood(u.address?.neighborhood || '');
    setFormCity(u.address?.city || '');
    setFormState(u.address?.state || '');
    setEditModalOpen(true);
  };

  const handleSaveUser = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formName.trim() || !formEmail.trim()) return;

    const addressData = formCep
      ? {
          cep: formCep,
          street: formStreet,
          number: formNumber,
          neighborhood: formNeighborhood,
          city: formCity,
          state: formState,
        }
      : undefined;

    if (editingUserId) {
      updateUserProfile(editingUserId, {
        name: formName.trim(),
        email: formEmail.trim().toLowerCase(),
        password: formPassword || undefined,
        phone: formPhone,
        cpf: formCpf,
        role: formRole,
        status: formStatus,
        address: addressData,
      });
    } else {
      addUser({
        name: formName.trim(),
        email: formEmail.trim().toLowerCase(),
        password: formPassword || '123456',
        phone: formPhone,
        cpf: formCpf,
        role: formRole,
        status: formStatus,
        address: addressData,
      });
    }

    setEditModalOpen(false);
  };

  const handleDelete = (userId: string, userName: string) => {
    if (confirm(`Tem certeza que deseja remover o cadastro de "${userName}"?`)) {
      deleteUser(userId);
    }
  };

  return (
    <div className="max-w-7xl mx-auto px-4 md:px-12 py-10 space-y-8 font-mono">
      {/* Top Bar with Navigation Tabs between Admin Sections */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b-2 border-[#5c403c] pb-6">
        <div>
          <div className="flex items-center gap-2 text-xs font-bold text-[#ff544b] uppercase tracking-widest mb-1">
            <ShieldCheck className="w-4 h-4" />
            <span>PAINEL ADMINISTRATIVO FLORISHOP</span>
          </div>
          <h1 className="font-display text-3xl md:text-4xl font-extrabold text-white uppercase tracking-tight flex items-center gap-3">
            <Users className="w-8 h-8 text-[#ff544b]" />
            Gestão de <span className="text-[#ff544b]">Cadastros</span>
          </h1>
        </div>

        {/* Quick Admin Navigation Buttons */}
        <div className="flex flex-wrap items-center gap-2 text-xs">
          <button
            onClick={() => setIsSupabaseModalOpen(true)}
            className="px-4 py-2 bg-[#17231c] hover:bg-[#3ecf8e] hover:text-black border border-[#3ecf8e]/50 text-[#3ecf8e] rounded flex items-center gap-2 transition-colors uppercase font-bold"
            title="Ver conexão com Supabase e migrations SQL"
          >
            <Database className="w-4 h-4" />
            Supabase
          </button>

          <button
            onClick={() => setActiveTab('admin-stock')}
            className="px-4 py-2 bg-[#201f1f] hover:bg-[#2d2c2c] border border-[#353534] text-gray-300 hover:text-white rounded flex items-center gap-2 transition-colors uppercase font-bold"
          >
            <LayoutDashboard className="w-4 h-4 text-[#ff544b]" />
            Gestão de Estoque
          </button>

          <button
            onClick={() => setActiveTab('admin-orders')}
            className="px-4 py-2 bg-[#201f1f] hover:bg-[#2d2c2c] border border-[#353534] text-gray-300 hover:text-white rounded flex items-center gap-2 transition-colors uppercase font-bold"
          >
            <ClipboardList className="w-4 h-4 text-[#ff544b]" />
            Gestão de Pedidos ({orders.length})
          </button>

          <button
            onClick={handleOpenAddModal}
            className="px-4 py-2 bg-[#ff544b] hover:bg-white text-white hover:text-[#ff544b] rounded flex items-center gap-2 transition-colors uppercase font-bold shadow-lg"
          >
            <UserPlus className="w-4 h-4" />
            Novo Cadastro
          </button>
        </div>
      </div>

      {/* KPI Stat Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 text-xs">
        <div className="bg-[#181717] border border-[#2d2c2c] p-4 rounded-lg">
          <div className="flex items-center justify-between text-gray-400 mb-1">
            <span>TOTAL CADASTRADOS</span>
            <Users className="w-4 h-4 text-white" />
          </div>
          <span className="text-2xl font-bold text-white block">{totalUsers}</span>
          <span className="text-[10px] text-gray-500 font-mono mt-1 block">
            {customerCount} clientes / {totalUsers - customerCount} administradores
          </span>
        </div>

        <div className="bg-[#181717] border border-[#2d2c2c] p-4 rounded-lg">
          <div className="flex items-center justify-between text-emerald-400 mb-1">
            <span>CLIENTES ATIVOS</span>
            <CheckCircle className="w-4 h-4 text-emerald-400" />
          </div>
          <span className="text-2xl font-bold text-emerald-400 block">{activeCount}</span>
          <span className="text-[10px] text-gray-500 font-mono mt-1 block">
            Habilitados para compras no site
          </span>
        </div>

        <div className="bg-[#181717] border border-[#2d2c2c] p-4 rounded-lg">
          <div className="flex items-center justify-between text-amber-400 mb-1">
            <span>PEDIDOS VINCULADOS</span>
            <Package className="w-4 h-4 text-amber-400" />
          </div>
          <span className="text-2xl font-bold text-white block">{orders.length}</span>
          <span className="text-[10px] text-gray-500 font-mono mt-1 block">
            Vendas registradas no sistema
          </span>
        </div>

        <div className="bg-[#181717] border border-[#2d2c2c] p-4 rounded-lg">
          <div className="flex items-center justify-between text-red-400 mb-1">
            <span>BLOQUEADOS</span>
            <XCircle className="w-4 h-4 text-red-400" />
          </div>
          <span className="text-2xl font-bold text-red-400 block">{blockedCount}</span>
          <span className="text-[10px] text-gray-500 font-mono mt-1 block">
            Acesso suspenso pelo admin
          </span>
        </div>
      </div>

      {/* Filter and Search Bar */}
      <div className="bg-[#181717] border border-[#2d2c2c] p-4 rounded-lg space-y-4">
        <div className="flex flex-col md:flex-row gap-3">
          <div className="relative flex-grow">
            <Search className="w-4 h-4 absolute left-3 top-3 text-gray-500" />
            <input
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="Buscar por nome, e-mail, telefone, CPF ou cidade..."
              className="w-full bg-[#131313] border border-[#353534] rounded pl-10 pr-3 py-2 text-xs text-white placeholder-gray-600 focus:outline-none focus:border-[#ff544b]"
            />
          </div>

          <div className="flex items-center gap-2">
            <select
              value={roleFilter}
              onChange={(e) => setRoleFilter(e.target.value as any)}
              className="bg-[#131313] border border-[#353534] rounded px-3 py-2 text-xs text-gray-300 focus:outline-none focus:border-[#ff544b]"
            >
              <option value="all">Todas as Funções</option>
              <option value="customer">Apenas Clientes</option>
              <option value="admin">Apenas Administradores</option>
            </select>

            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value as any)}
              className="bg-[#131313] border border-[#353534] rounded px-3 py-2 text-xs text-gray-300 focus:outline-none focus:border-[#ff544b]"
            >
              <option value="all">Todos os Status</option>
              <option value="active">Ativos</option>
              <option value="blocked">Bloqueados</option>
            </select>
          </div>
        </div>
      </div>

      {/* Users Table */}
      <div className="bg-[#181717] border border-[#2d2c2c] rounded-lg overflow-hidden shadow-xl">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-[#201f1f] text-gray-400 uppercase border-b border-[#2d2c2c]">
              <tr>
                <th className="p-4">Cliente / Usuário</th>
                <th className="p-4">Contato</th>
                <th className="p-4">Localização / Endereço</th>
                <th className="p-4">Compras</th>
                <th className="p-4">Status</th>
                <th className="p-4 text-right">Ações</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#2a2a2a] text-gray-300">
              {filteredUsers.length === 0 ? (
                <tr>
                  <td colSpan={6} className="p-8 text-center text-gray-500">
                    Nenhum cadastro encontrado para os filtros selecionados.
                  </td>
                </tr>
              ) : (
                filteredUsers.map((u) => {
                  const userOrders = getUserOrders(u);
                  const totalSpent = getUserTotalSpent(u);

                  return (
                    <tr key={u.id} className="hover:bg-[#1d1c1c] transition-colors">
                      {/* Name & Role */}
                      <td className="p-4">
                        <div className="flex items-center gap-2.5">
                          <div
                            className={`w-8 h-8 rounded-full flex items-center justify-center font-bold text-xs uppercase ${
                              u.role === 'admin'
                                ? 'bg-[#ff544b]/20 text-[#ff544b] border border-[#ff544b]'
                                : 'bg-[#2a2a2a] text-gray-300 border border-[#3a3a3a]'
                            }`}
                          >
                            {u.name.substring(0, 2)}
                          </div>
                          <div>
                            <div className="flex items-center gap-2">
                              <span className="font-bold text-white block">{u.name}</span>
                              {u.role === 'admin' && (
                                <span className="bg-[#ff544b]/10 text-[#ff544b] border border-[#ff544b]/30 px-1.5 py-0.5 rounded text-[9px] uppercase font-bold">
                                  ADMIN
                                </span>
                              )}
                            </div>
                            <span className="text-[10px] text-gray-500 block">
                              Cadastro: {new Date(u.createdAt).toLocaleDateString('pt-BR')}
                            </span>
                          </div>
                        </div>
                      </td>

                      {/* Contact */}
                      <td className="p-4 space-y-0.5">
                        <div className="flex items-center gap-1.5 text-gray-300">
                          <Mail className="w-3 h-3 text-gray-500" />
                          <span>{u.email}</span>
                        </div>
                        {u.phone && (
                          <div className="flex items-center gap-1.5 text-gray-400 text-[11px]">
                            <Phone className="w-3 h-3 text-gray-500" />
                            <span>{u.phone}</span>
                          </div>
                        )}
                        {u.cpf && (
                          <span className="text-[10px] text-gray-500 block">CPF: {u.cpf}</span>
                        )}
                      </td>

                      {/* Location */}
                      <td className="p-4 text-gray-400">
                        {u.address ? (
                          <div>
                            <span className="text-white block font-medium">
                              {u.address.city}/{u.address.state}
                            </span>
                            <span className="text-[10px] text-gray-500 block truncate max-w-xs">
                              {u.address.street}, {u.address.number} - CEP {u.address.cep}
                            </span>
                          </div>
                        ) : (
                          <span className="text-gray-600 text-[11px] italic">Sem endereço cadastrado</span>
                        )}
                      </td>

                      {/* Orders & Total Spent */}
                      <td className="p-4">
                        <div className="space-y-0.5">
                          <span className="font-bold text-white block">
                            {userOrders.length} {userOrders.length === 1 ? 'pedido' : 'pedidos'}
                          </span>
                          <span className="text-[11px] text-emerald-400 block font-bold">
                            R$ {totalSpent.toFixed(2)}
                          </span>
                        </div>
                      </td>

                      {/* Status */}
                      <td className="p-4">
                        {u.status === 'active' ? (
                          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded text-[10px] bg-emerald-950 text-emerald-400 border border-emerald-600/40 font-bold uppercase">
                            <CheckCircle className="w-3 h-3" />
                            Ativo
                          </span>
                        ) : (
                          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded text-[10px] bg-red-950 text-red-400 border border-red-600/40 font-bold uppercase">
                            <XCircle className="w-3 h-3" />
                            Bloqueado
                          </span>
                        )}
                      </td>

                      {/* Actions */}
                      <td className="p-4 text-right">
                        <div className="flex items-center justify-end gap-1.5">
                          {/* View details */}
                          <button
                            onClick={() => setViewUser(u)}
                            title="Ver ficha completa do cliente"
                            className="p-1.5 text-gray-400 hover:text-white hover:bg-[#2a2a2a] rounded transition-colors"
                          >
                            <Eye className="w-4 h-4" />
                          </button>

                          {/* Edit */}
                          <button
                            onClick={() => handleOpenEditModal(u)}
                            title="Editar cadastro"
                            className="p-1.5 text-gray-400 hover:text-[#ff544b] hover:bg-[#2a2a2a] rounded transition-colors"
                          >
                            <Edit2 className="w-4 h-4" />
                          </button>

                          {/* Toggle status */}
                          <button
                            onClick={() =>
                              updateUserStatus(
                                u.id,
                                u.status === 'active' ? 'blocked' : 'active'
                              )
                            }
                            title={u.status === 'active' ? 'Bloquear usuário' : 'Desbloquear usuário'}
                            className={`p-1.5 rounded transition-colors ${
                              u.status === 'active'
                                ? 'text-amber-400 hover:bg-amber-950/40'
                                : 'text-emerald-400 hover:bg-emerald-950/40'
                            }`}
                          >
                            {u.status === 'active' ? (
                              <XCircle className="w-4 h-4" />
                            ) : (
                              <CheckCircle className="w-4 h-4" />
                            )}
                          </button>

                          {/* Delete (cannot delete yourself) */}
                          {currentUser?.id !== u.id && (
                            <button
                              onClick={() => handleDelete(u.id, u.name)}
                              title="Excluir cadastro"
                              className="p-1.5 text-gray-400 hover:text-red-400 hover:bg-[#2a2a2a] rounded transition-colors"
                            >
                              <Trash2 className="w-4 h-4" />
                            </button>
                          )}
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

      {/* USER DETAILS MODAL */}
      {viewUser && (
        <div className="fixed inset-0 z-[110] flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm">
          <div className="relative w-full max-w-2xl bg-[#181717] border-2 border-[#5c403c] rounded-lg shadow-2xl overflow-hidden flex flex-col max-h-[90vh]">
            <div className="flex items-center justify-between px-6 py-4 border-b border-[#2d2c2c] bg-[#201f1f]">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-full bg-[#ff544b]/20 border border-[#ff544b] flex items-center justify-center font-bold text-sm text-[#ff544b]">
                  {viewUser.name.substring(0, 2).toUpperCase()}
                </div>
                <div>
                  <h3 className="font-display text-lg font-bold text-white uppercase">
                    {viewUser.name}
                  </h3>
                  <span className="text-[11px] font-mono text-gray-400">
                    ID: {viewUser.id} &bull; Função: {viewUser.role.toUpperCase()}
                  </span>
                </div>
              </div>
              <button
                onClick={() => setViewUser(null)}
                className="text-gray-400 hover:text-white p-1 rounded hover:bg-[#2d2c2c]"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="p-6 overflow-y-auto space-y-6 text-xs font-mono">
              {/* Profile Overview */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 bg-[#201f1f] p-4 rounded border border-[#2d2c2c]">
                <div>
                  <span className="text-gray-500 uppercase text-[10px] block">E-mail de Login</span>
                  <span className="text-white font-bold text-sm">{viewUser.email}</span>
                </div>
                <div>
                  <span className="text-gray-500 uppercase text-[10px] block">Telefone / WhatsApp</span>
                  <span className="text-white font-bold text-sm">{viewUser.phone || 'Não informado'}</span>
                </div>
                <div>
                  <span className="text-gray-500 uppercase text-[10px] block">CPF</span>
                  <span className="text-white">{viewUser.cpf || 'Não cadastrado'}</span>
                </div>
                <div>
                  <span className="text-gray-500 uppercase text-[10px] block">Data de Adesão</span>
                  <span className="text-white">{new Date(viewUser.createdAt).toLocaleString('pt-BR')}</span>
                </div>
                <div>
                  <span className="text-gray-500 uppercase text-[10px] block">Status da Conta</span>
                  <span
                    className={`font-bold ${
                      viewUser.status === 'active' ? 'text-emerald-400' : 'text-red-400'
                    }`}
                  >
                    {viewUser.status === 'active' ? 'ATIVA / LIBERADA' : 'BLOQUEADA'}
                  </span>
                </div>
                <div>
                  <span className="text-gray-500 uppercase text-[10px] block">Total Comprado</span>
                  <span className="text-emerald-400 font-bold text-sm">
                    R$ {getUserTotalSpent(viewUser).toFixed(2)}
                  </span>
                </div>
              </div>

              {/* Endereço */}
              <div className="space-y-2">
                <span className="font-bold text-white uppercase text-xs flex items-center gap-1.5">
                  <MapPin className="w-4 h-4 text-[#ff544b]" />
                  Endereço Cadastrado de Entrega
                </span>
                {viewUser.address ? (
                  <div className="bg-[#141414] border border-[#2d2c2c] p-3 rounded text-gray-300">
                    <p>
                      <strong>{viewUser.address.street}</strong>, nº {viewUser.address.number}
                      {viewUser.address.complement ? ` (${viewUser.address.complement})` : ''}
                    </p>
                    <p className="text-gray-400 text-[11px]">
                      Bairro: {viewUser.address.neighborhood} - {viewUser.address.city}/{viewUser.address.state}
                    </p>
                    <p className="text-gray-400 text-[11px]">CEP: {viewUser.address.cep}</p>
                  </div>
                ) : (
                  <p className="text-gray-500 italic bg-[#141414] p-3 rounded">
                    Nenhum endereço padrão informado pelo cliente ainda.
                  </p>
                )}
              </div>

              {/* Pedidos do Cliente */}
              <div className="space-y-2">
                <span className="font-bold text-white uppercase text-xs flex items-center gap-1.5">
                  <ShoppingBag className="w-4 h-4 text-[#ff544b]" />
                  Histórico de Pedidos ({getUserOrders(viewUser).length})
                </span>
                {getUserOrders(viewUser).length === 0 ? (
                  <p className="text-gray-500 italic bg-[#141414] p-3 rounded">
                    Este cliente ainda não finalizou compras no site.
                  </p>
                ) : (
                  <div className="space-y-2">
                    {getUserOrders(viewUser).map((order) => (
                      <div
                        key={order.id}
                        className="bg-[#141414] border border-[#2d2c2c] p-3 rounded space-y-2"
                      >
                        <div className="flex justify-between items-center">
                          <span className="font-bold text-white">Pedido #{order.id}</span>
                          <span className="text-[#ff544b] font-bold">R$ {order.total.toFixed(2)}</span>
                        </div>
                        <div className="flex justify-between items-center text-[11px] text-gray-400">
                          <span>{order.date}</span>
                          <span className="text-emerald-400 font-bold uppercase">{order.status}</span>
                        </div>
                        <div className="text-[10px] text-gray-500">
                          Método: {order.paymentMethod.toUpperCase()} | Itens: {order.items.length} un
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>

            <div className="px-6 py-4 border-t border-[#2d2c2c] bg-[#201f1f] flex justify-end">
              <button
                onClick={() => setViewUser(null)}
                className="px-5 py-2 bg-[#ff544b] text-white font-bold uppercase text-xs rounded hover:bg-white hover:text-[#ff544b] transition-colors"
              >
                Fechar Ficha
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ADD / EDIT MODAL */}
      {editModalOpen && (
        <div className="fixed inset-0 z-[110] flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm">
          <div className="relative w-full max-w-xl bg-[#181717] border-2 border-[#5c403c] rounded-lg shadow-2xl overflow-hidden flex flex-col max-h-[90vh]">
            <div className="flex items-center justify-between px-6 py-4 border-b border-[#2d2c2c] bg-[#201f1f]">
              <h3 className="font-display text-lg font-bold text-white uppercase">
                {editingUserId ? 'Editar Cadastro de Usuário' : 'Novo Cadastro no Sistema'}
              </h3>
              <button
                onClick={() => setEditModalOpen(false)}
                className="text-gray-400 hover:text-white p-1 rounded hover:bg-[#2d2c2c]"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSaveUser} className="p-6 overflow-y-auto space-y-4 text-xs font-mono">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div className="sm:col-span-2">
                  <label className="text-gray-300 font-bold block mb-1 uppercase">Nome Completo *</label>
                  <input
                    type="text"
                    required
                    value={formName}
                    onChange={(e) => setFormName(e.target.value)}
                    placeholder="Nome do cliente"
                    className="w-full bg-[#131313] border border-[#353534] rounded px-3 py-2 text-white focus:outline-none focus:border-[#ff544b]"
                  />
                </div>

                <div>
                  <label className="text-gray-300 font-bold block mb-1 uppercase">E-mail *</label>
                  <input
                    type="email"
                    required
                    value={formEmail}
                    onChange={(e) => setFormEmail(e.target.value)}
                    placeholder="cliente@email.com"
                    className="w-full bg-[#131313] border border-[#353534] rounded px-3 py-2 text-white focus:outline-none focus:border-[#ff544b]"
                  />
                </div>

                <div>
                  <label className="text-gray-300 font-bold block mb-1 uppercase">
                    {editingUserId ? 'Nova Senha (Opcional)' : 'Senha Inicial *'}
                  </label>
                  <input
                    type="text"
                    value={formPassword}
                    onChange={(e) => setFormPassword(e.target.value)}
                    placeholder={editingUserId ? 'Manter a mesma' : 'Ex: skate123'}
                    className="w-full bg-[#131313] border border-[#353534] rounded px-3 py-2 text-white focus:outline-none focus:border-[#ff544b]"
                  />
                </div>

                <div>
                  <label className="text-gray-300 font-bold block mb-1 uppercase">Telefone</label>
                  <input
                    type="text"
                    value={formPhone}
                    onChange={(e) => setFormPhone(e.target.value)}
                    placeholder="(48) 99999-9999"
                    className="w-full bg-[#131313] border border-[#353534] rounded px-3 py-2 text-white focus:outline-none focus:border-[#ff544b]"
                  />
                </div>

                <div>
                  <label className="text-gray-300 font-bold block mb-1 uppercase">CPF</label>
                  <input
                    type="text"
                    value={formCpf}
                    onChange={(e) => setFormCpf(e.target.value)}
                    placeholder="000.000.000-00"
                    className="w-full bg-[#131313] border border-[#353534] rounded px-3 py-2 text-white focus:outline-none focus:border-[#ff544b]"
                  />
                </div>

                <div>
                  <label className="text-gray-300 font-bold block mb-1 uppercase">Função / Perfil</label>
                  <select
                    value={formRole}
                    onChange={(e) => setFormRole(e.target.value as any)}
                    className="w-full bg-[#131313] border border-[#353534] rounded px-3 py-2 text-white focus:outline-none focus:border-[#ff544b]"
                  >
                    <option value="customer">Cliente Comum</option>
                    <option value="admin">Administrador do Site</option>
                  </select>
                </div>

                <div>
                  <label className="text-gray-300 font-bold block mb-1 uppercase">Status</label>
                  <select
                    value={formStatus}
                    onChange={(e) => setFormStatus(e.target.value as any)}
                    className="w-full bg-[#131313] border border-[#353534] rounded px-3 py-2 text-white focus:outline-none focus:border-[#ff544b]"
                  >
                    <option value="active">Ativo (Pode comprar)</option>
                    <option value="blocked">Bloqueado</option>
                  </select>
                </div>
              </div>

              {/* Endereço */}
              <div className="border-t border-[#2d2c2c] pt-3 space-y-2">
                <span className="font-bold text-white uppercase text-xs">Endereço</span>
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                  <div>
                    <label className="text-[10px] text-gray-400">CEP</label>
                    <input
                      type="text"
                      value={formCep}
                      onChange={(e) => setFormCep(e.target.value)}
                      placeholder="88000-000"
                      className="w-full bg-[#131313] border border-[#353534] rounded px-2.5 py-1.5 text-white text-xs"
                    />
                  </div>
                  <div className="col-span-2">
                    <label className="text-[10px] text-gray-400">Rua / Av.</label>
                    <input
                      type="text"
                      value={formStreet}
                      onChange={(e) => setFormStreet(e.target.value)}
                      placeholder="Rua..."
                      className="w-full bg-[#131313] border border-[#353534] rounded px-2.5 py-1.5 text-white text-xs"
                    />
                  </div>
                  <div>
                    <label className="text-[10px] text-gray-400">Número</label>
                    <input
                      type="text"
                      value={formNumber}
                      onChange={(e) => setFormNumber(e.target.value)}
                      placeholder="123"
                      className="w-full bg-[#131313] border border-[#353534] rounded px-2.5 py-1.5 text-white text-xs"
                    />
                  </div>
                  <div>
                    <label className="text-[10px] text-gray-400">Bairro</label>
                    <input
                      type="text"
                      value={formNeighborhood}
                      onChange={(e) => setFormNeighborhood(e.target.value)}
                      placeholder="Centro"
                      className="w-full bg-[#131313] border border-[#353534] rounded px-2.5 py-1.5 text-white text-xs"
                    />
                  </div>
                  <div>
                    <label className="text-[10px] text-gray-400">Cidade / UF</label>
                    <div className="flex gap-1">
                      <input
                        type="text"
                        value={formCity}
                        onChange={(e) => setFormCity(e.target.value)}
                        placeholder="Cidade"
                        className="w-full bg-[#131313] border border-[#353534] rounded px-2 py-1.5 text-white text-xs"
                      />
                      <input
                        type="text"
                        maxLength={2}
                        value={formState}
                        onChange={(e) => setFormState(e.target.value.toUpperCase())}
                        placeholder="SC"
                        className="w-12 bg-[#131313] border border-[#353534] rounded px-1 text-center py-1.5 text-white text-xs uppercase"
                      />
                    </div>
                  </div>
                </div>
              </div>

              <div className="pt-4 border-t border-[#2d2c2c] flex justify-end gap-3">
                <button
                  type="button"
                  onClick={() => setEditModalOpen(false)}
                  className="px-4 py-2 bg-[#201f1f] text-gray-300 rounded font-bold hover:text-white"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  className="px-6 py-2 bg-[#ff544b] text-white rounded font-bold hover:bg-white hover:text-[#ff544b] transition-colors"
                >
                  {editingUserId ? 'Salvar Alterações' : 'Cadastrar Usuário'}
                </button>
              </div>
            </form>
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
