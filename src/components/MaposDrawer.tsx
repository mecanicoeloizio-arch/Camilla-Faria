import React, { useState } from "react";
import {
  X,
  Wrench,
  Layers,
  Cpu,
  Package,
  Users,
  CreditCard,
  Download,
  AlertTriangle,
  Plus,
  Search,
  CheckCircle2,
  Clock,
  ShieldCheck,
  FileText,
  DollarSign,
  AlertOctagon,
  RefreshCw,
  ExternalLink,
} from "lucide-react";
import {
  MaposClient,
  MaposEquipment,
  MaposProduct,
  MaposOrder,
  MaposFinancialEntry,
  MaposSubscription,
  UserRole,
} from "../types";

interface MaposDrawerProps {
  isOpen: boolean;
  onClose: () => void;
  userRole: UserRole;
  onChangeUserRole: (role: UserRole) => void;
  clients: MaposClient[];
  equipments: MaposEquipment[];
  products: MaposProduct[];
  orders: MaposOrder[];
  financial: MaposFinancialEntry[];
  subscription: MaposSubscription;
  onRefreshData: () => void;
  onSendSubscriptionNotice: (noticeType: "10_days" | "5_days" | "1_day" | "block") => void;
  onTriggerClean: () => void;
  onAddProduct: (prod: Partial<MaposProduct>) => void;
  onAddOrder: (order: Partial<MaposOrder>) => void;
}

export const MaposDrawer: React.FC<MaposDrawerProps> = ({
  isOpen,
  onClose,
  userRole,
  onChangeUserRole,
  clients,
  equipments,
  products,
  orders,
  financial,
  subscription,
  onRefreshData,
  onSendSubscriptionNotice,
  onTriggerClean,
  onAddProduct,
  onAddOrder,
}) => {
  const [activeTab, setActiveTab] = useState<
    "os" | "equipamentos" | "pecas" | "clientes" | "assinatura" | "financeiro"
  >("os");

  const [searchTerm, setSearchTerm] = useState("");
  const [showNewOrderModal, setShowNewOrderModal] = useState(false);
  const [showNewProductModal, setShowNewProductModal] = useState(false);

  // Form states for new product
  const [prodCode, setProdCode] = useState("");
  const [prodName, setProdName] = useState("");
  const [prodCategory, setProdCategory] = useState<"costura" | "mecanica_auto" | "geral">("costura");
  const [prodCost, setProdCost] = useState("45.00");
  const [prodPrice, setProdPrice] = useState("95.00");
  const [prodStock, setProdStock] = useState("10");

  // Form states for new order
  const [osClientId, setOsClientId] = useState(clients[0]?.id || "");
  const [osEquipmentName, setOsEquipmentName] = useState("Máquina Reta Industrial");
  const [osSerial, setOsSerial] = useState("SN-" + Math.floor(1000 + Math.random() * 9000));
  const [osDefect, setOsDefect] = useState("");
  const [osLabor, setOsLabor] = useState("120.00");

  if (!isOpen) return null;

  const handleCreateProduct = (e: React.FormEvent) => {
    e.preventDefault();
    if (!prodCode || !prodName) return;
    onAddProduct({
      code: prodCode.toUpperCase().trim(),
      name: prodName,
      category: prodCategory,
      purchasePrice: parseFloat(prodCost) || 0,
      salePrice: parseFloat(prodPrice) || 0,
      stockQuantity: parseInt(prodStock, 10) || 0,
      minStock: 2,
      description: "Cadastrado via Painel MapOS",
    });
    setProdCode("");
    setProdName("");
    setShowNewProductModal(false);
  };

  const handleCreateOrder = (e: React.FormEvent) => {
    e.preventDefault();
    const client = clients.find((c) => c.id === osClientId) || clients[0];
    onAddOrder({
      clientId: client?.id || "cli-1",
      clientName: client?.name || "Cliente MapOS",
      equipmentName: osEquipmentName,
      serialNumber: osSerial,
      reportedDefect: osDefect || "Aguardando diagnóstico em bancada",
      technicalDiagnosis: "Equipamento recebido para vistoria.",
      laborPrice: parseFloat(osLabor) || 0,
      status: "aberta",
      warrantyDays: 90,
    });
    setOsDefect("");
    setShowNewOrderModal(false);
  };

  const filteredOrders = orders.filter(
    (o) =>
      o.orderNumber.toLowerCase().includes(searchTerm.toLowerCase()) ||
      o.clientName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      o.serialNumber.toLowerCase().includes(searchTerm.toLowerCase()) ||
      o.reportedDefect.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const filteredEquipments = equipments.filter(
    (e) =>
      e.serialNumber.toLowerCase().includes(searchTerm.toLowerCase()) ||
      e.typeName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      e.clientName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      e.brand.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const filteredProducts = products.filter(
    (p) =>
      p.code.toLowerCase().includes(searchTerm.toLowerCase()) ||
      p.name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="fixed inset-0 z-50 overflow-hidden bg-slate-950/60 backdrop-blur-xs flex justify-end">
      <div className="w-full max-w-2xl bg-white dark:bg-slate-900 h-full shadow-2xl flex flex-col border-l border-slate-200 dark:border-slate-800 animate-in slide-in-from-right duration-200">
        {/* Top Header */}
        <div className="px-6 py-4 bg-gradient-to-r from-emerald-800 via-teal-800 to-slate-900 text-white flex items-center justify-between shadow-md">
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-xl bg-white/10 border border-white/20 backdrop-blur-xs">
              <Layers className="w-5 h-5 text-emerald-300" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-base font-bold tracking-tight">Painel MapOS Inteligente</h2>
                <span className="font-mono text-[10px] px-1.5 py-0.5 rounded bg-emerald-500/20 text-emerald-200 border border-emerald-400/30">
                  {subscription.subscriptionCode}
                </span>
              </div>
              <p className="text-xs text-emerald-100/80">
                Grupo Eloizio • Gestão de Máquinas, Peças, OS e Assinaturas
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={onRefreshData}
              title="Atualizar dados"
              className="p-1.5 rounded-lg text-white/70 hover:text-white hover:bg-white/10 transition-colors"
            >
              <RefreshCw className="w-4 h-4" />
            </button>
            <button
              onClick={onClose}
              className="p-1.5 rounded-lg text-white/70 hover:text-white hover:bg-white/10 transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* User Role Switcher Bar */}
        <div className="px-6 py-2.5 bg-slate-100 dark:bg-slate-850 border-b border-slate-200 dark:border-slate-800 flex flex-wrap items-center justify-between gap-2">
          <div className="flex items-center gap-1.5 text-xs text-slate-600 dark:text-slate-300">
            <span className="font-semibold text-slate-700 dark:text-slate-200">Perfil Ativo:</span>
          </div>

          <div className="flex items-center gap-1 bg-white dark:bg-slate-800 p-0.5 rounded-lg border border-slate-300 dark:border-slate-700 text-xs">
            <button
              onClick={() => onChangeUserRole("dono")}
              className={`px-2.5 py-1 rounded-md font-medium transition-all ${
                userRole === "dono"
                  ? "bg-emerald-600 text-white shadow-xs"
                  : "text-slate-600 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white"
              }`}
            >
              [Dono / Assinante]
            </button>
            <button
              onClick={() => onChangeUserRole("tecnico")}
              className={`px-2.5 py-1 rounded-md font-medium transition-all ${
                userRole === "tecnico"
                  ? "bg-teal-600 text-white shadow-xs"
                  : "text-slate-600 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white"
              }`}
            >
              [Colaborador Técnico]
            </button>
            <button
              onClick={() => onChangeUserRole("cliente")}
              className={`px-2.5 py-1 rounded-md font-medium transition-all ${
                userRole === "cliente"
                  ? "bg-sky-600 text-white shadow-xs"
                  : "text-slate-600 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white"
              }`}
            >
              [Cliente Final]
            </button>
          </div>
        </div>

        {/* Tabs Bar */}
        <div className="px-6 pt-3 bg-white dark:bg-slate-900 border-b border-slate-200 dark:border-slate-800 flex items-center gap-2 overflow-x-auto text-xs font-semibold">
          <button
            onClick={() => setActiveTab("os")}
            className={`pb-2.5 px-3 border-b-2 flex items-center gap-1.5 transition-colors whitespace-nowrap ${
              activeTab === "os"
                ? "border-emerald-600 text-emerald-700 dark:text-emerald-400"
                : "border-transparent text-slate-500 hover:text-slate-800 dark:hover:text-slate-200"
            }`}
          >
            <Wrench className="w-3.5 h-3.5" />
            <span>Ordens de Serviço ({orders.length})</span>
          </button>

          <button
            onClick={() => setActiveTab("equipamentos")}
            className={`pb-2.5 px-3 border-b-2 flex items-center gap-1.5 transition-colors whitespace-nowrap ${
              activeTab === "equipamentos"
                ? "border-emerald-600 text-emerald-700 dark:text-emerald-400"
                : "border-transparent text-slate-500 hover:text-slate-800 dark:hover:text-slate-200"
            }`}
          >
            <Cpu className="w-3.5 h-3.5" />
            <span>Nº de Série & Máquinas ({equipments.length})</span>
          </button>

          <button
            onClick={() => setActiveTab("pecas")}
            className={`pb-2.5 px-3 border-b-2 flex items-center gap-1.5 transition-colors whitespace-nowrap ${
              activeTab === "pecas"
                ? "border-emerald-600 text-emerald-700 dark:text-emerald-400"
                : "border-transparent text-slate-500 hover:text-slate-800 dark:hover:text-slate-200"
            }`}
          >
            <Package className="w-3.5 h-3.5" />
            <span>Peças (Anti-Duplicidade)</span>
          </button>

          <button
            onClick={() => setActiveTab("clientes")}
            className={`pb-2.5 px-3 border-b-2 flex items-center gap-1.5 transition-colors whitespace-nowrap ${
              activeTab === "clientes"
                ? "border-emerald-600 text-emerald-700 dark:text-emerald-400"
                : "border-transparent text-slate-500 hover:text-slate-800 dark:hover:text-slate-200"
            }`}
          >
            <Users className="w-3.5 h-3.5" />
            <span>Clientes</span>
          </button>

          <button
            onClick={() => setActiveTab("assinatura")}
            className={`pb-2.5 px-3 border-b-2 flex items-center gap-1.5 transition-colors whitespace-nowrap ${
              activeTab === "assinatura"
                ? "border-emerald-600 text-emerald-700 dark:text-emerald-400"
                : "border-transparent text-slate-500 hover:text-slate-800 dark:hover:text-slate-200"
            }`}
          >
            <CreditCard className="w-3.5 h-3.5" />
            <span>Assinatura & Cobrança</span>
          </button>

          {userRole === "dono" && (
            <button
              onClick={() => setActiveTab("financeiro")}
              className={`pb-2.5 px-3 border-b-2 flex items-center gap-1.5 transition-colors whitespace-nowrap ${
                activeTab === "financeiro"
                  ? "border-emerald-600 text-emerald-700 dark:text-emerald-400"
                  : "border-transparent text-slate-500 hover:text-slate-800 dark:hover:text-slate-200"
              }`}
            >
              <DollarSign className="w-3.5 h-3.5" />
              <span>Financeiro</span>
            </button>
          )}
        </div>

        {/* Search & Actions Bar */}
        <div className="p-4 border-b border-slate-100 dark:border-slate-800 flex items-center justify-between gap-3">
          <div className="relative flex-1">
            <Search className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
            <input
              type="text"
              placeholder="Buscar por OS, cliente, número de série ou código da peça..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-9 pr-3 py-2 text-xs rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-800 dark:text-slate-100 placeholder-slate-400 focus:outline-none focus:border-emerald-500"
            />
          </div>

          {activeTab === "os" && userRole !== "cliente" && (
            <button
              onClick={() => setShowNewOrderModal(true)}
              className="inline-flex items-center gap-1.5 px-3 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-semibold shadow-xs transition-colors shrink-0"
            >
              <Plus className="w-3.5 h-3.5" />
              <span>Nova OS</span>
            </button>
          )}

          {activeTab === "pecas" && userRole !== "cliente" && (
            <button
              onClick={() => setShowNewProductModal(true)}
              className="inline-flex items-center gap-1.5 px-3 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-semibold shadow-xs transition-colors shrink-0"
            >
              <Plus className="w-3.5 h-3.5" />
              <span>Cadastrar Peça</span>
            </button>
          )}
        </div>

        {/* Tab Content */}
        <div className="flex-1 overflow-y-auto p-6 space-y-4">
          {/* TAB 1: ORDENS DE SERVIÇO */}
          {activeTab === "os" && (
            <div className="space-y-4">
              <div className="flex items-center justify-between text-xs text-slate-500 dark:text-slate-400">
                <span>{filteredOrders.length} Ordem(ns) de Serviço encontrada(s)</span>
                <span className="text-[11px] bg-slate-100 dark:bg-slate-800 px-2 py-0.5 rounded">
                  Garantia padrão de 90 dias
                </span>
              </div>

              {filteredOrders.map((order) => {
                const statusColor =
                  order.status === "concluida" || order.status === "faturada"
                    ? "bg-emerald-50 text-emerald-700 border-emerald-200 dark:bg-emerald-950/70 dark:text-emerald-300"
                    : order.status === "em_andamento"
                    ? "bg-amber-50 text-amber-700 border-amber-200 dark:bg-amber-950/70 dark:text-amber-300"
                    : "bg-blue-50 text-blue-700 border-blue-200 dark:bg-blue-950/70 dark:text-blue-300";

                return (
                  <div
                    key={order.id}
                    className="p-4 rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-850 shadow-xs space-y-3"
                  >
                    <div className="flex items-start justify-between gap-2">
                      <div>
                        <div className="flex items-center gap-2">
                          <span className="font-bold text-slate-900 dark:text-slate-100 text-sm">
                            {order.orderNumber}
                          </span>
                          <span className={`px-2 py-0.5 rounded-full text-[10px] font-semibold border ${statusColor}`}>
                            {order.status.toUpperCase()}
                          </span>
                        </div>
                        <p className="text-xs font-medium text-slate-700 dark:text-slate-300 mt-0.5">
                          {order.clientName}
                        </p>
                      </div>

                      <div className="text-right">
                        <span className="text-sm font-bold text-emerald-700 dark:text-emerald-400">
                          R$ {order.totalPrice.toFixed(2)}
                        </span>
                        <p className="text-[10px] text-slate-400">{order.createdAt}</p>
                      </div>
                    </div>

                    <div className="bg-slate-50 dark:bg-slate-800/60 p-3 rounded-xl space-y-1.5 text-xs text-slate-600 dark:text-slate-300">
                      <div className="flex items-center justify-between">
                        <span className="font-medium text-slate-700 dark:text-slate-200">
                          Equipamento:
                        </span>
                        <span>{order.equipmentName}</span>
                      </div>
                      <div className="flex items-center justify-between">
                        <span className="font-medium text-slate-700 dark:text-slate-200">
                          Nº de Série:
                        </span>
                        <span className="font-mono bg-white dark:bg-slate-900 px-1.5 py-0.5 rounded border border-slate-200 dark:border-slate-700 text-[11px] text-slate-800 dark:text-slate-200">
                          {order.serialNumber}
                        </span>
                      </div>
                      <div>
                        <span className="font-medium text-slate-700 dark:text-slate-200">
                          Defeito Relatado:
                        </span>{" "}
                        <span className="italic">"{order.reportedDefect}"</span>
                      </div>
                      {order.technicalDiagnosis && (
                        <div>
                          <span className="font-medium text-slate-700 dark:text-slate-200">
                            Laudo Técnico:
                          </span>{" "}
                          <span>{order.technicalDiagnosis}</span>
                        </div>
                      )}
                    </div>

                    {order.partsUsed && order.partsUsed.length > 0 && (
                      <div className="text-xs border-t border-slate-100 dark:border-slate-800 pt-2 space-y-1">
                        <span className="text-[11px] font-semibold text-slate-500 uppercase tracking-wider">
                          Peças Utilizadas:
                        </span>
                        {order.partsUsed.map((part, idx) => (
                          <div key={idx} className="flex justify-between text-slate-600 dark:text-slate-400 text-[11px]">
                            <span>
                              {part.quantity}x [{part.partCode}] {part.name}
                            </span>
                            <span>R$ {(part.quantity * part.unitPrice).toFixed(2)}</span>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          )}

          {/* TAB 2: EQUIPAMENTOS COM NÚMERO DE SÉRIE */}
          {activeTab === "equipamentos" && (
            <div className="space-y-4">
              <div className="p-3 bg-emerald-50 dark:bg-emerald-950/40 rounded-xl border border-emerald-100 dark:border-emerald-800/60 text-xs text-emerald-900 dark:text-emerald-200">
                <span className="font-semibold">Rastreabilidade Total MapOS:</span> Cada equipamento possui um{" "}
                <strong>Número de Série único</strong> vinculado ao Cliente com histórico perpétuo de revisões.
              </div>

              {filteredEquipments.map((eq) => (
                <div
                  key={eq.id}
                  className="p-4 rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-850 shadow-xs space-y-3"
                >
                  <div className="flex items-start justify-between gap-3">
                    <div>
                      <h3 className="font-bold text-slate-900 dark:text-slate-100 text-sm">
                        {eq.typeName}
                      </h3>
                      <p className="text-xs text-slate-500 dark:text-slate-400">
                        Marca: {eq.brand} • Modelo: {eq.model}
                      </p>
                      <p className="text-xs text-emerald-700 dark:text-emerald-400 font-medium mt-0.5">
                        Proprietário: {eq.clientName}
                      </p>
                    </div>

                    <div className="text-right">
                      <span className="font-mono text-xs font-bold px-2 py-1 rounded bg-slate-100 dark:bg-slate-800 text-slate-800 dark:text-slate-200 border border-slate-300 dark:border-slate-700">
                        {eq.serialNumber}
                      </span>
                    </div>
                  </div>

                  {eq.photoUrl && (
                    <img
                      src={eq.photoUrl}
                      alt={eq.typeName}
                      className="w-full h-36 object-cover rounded-xl border border-slate-200 dark:border-slate-700"
                    />
                  )}

                  <div className="space-y-1.5 text-xs">
                    <span className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider">
                      Histórico de Manutenções:
                    </span>
                    {eq.history.length === 0 ? (
                      <p className="text-slate-400 text-xs">Nenhuma manutenção registrada.</p>
                    ) : (
                      eq.history.map((h, i) => (
                        <div
                          key={i}
                          className="flex items-start gap-2 bg-slate-50 dark:bg-slate-800/60 p-2 rounded-lg text-slate-700 dark:text-slate-300"
                        >
                          <Clock className="w-3.5 h-3.5 text-emerald-600 shrink-0 mt-0.5" />
                          <div className="flex-1">
                            <span className="font-medium text-[11px] text-slate-500 mr-2">{h.date}</span>
                            <span>{h.description}</span>
                          </div>
                          {h.osNumber && (
                            <span className="font-mono text-[10px] bg-emerald-100 dark:bg-emerald-900/60 text-emerald-800 dark:text-emerald-200 px-1 py-0.5 rounded">
                              {h.osNumber}
                            </span>
                          )}
                        </div>
                      ))
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}

          {/* TAB 3: PEÇAS & REGRA ANTI-DUPLICIDADE */}
          {activeTab === "pecas" && (
            <div className="space-y-4">
              <div className="p-3 bg-amber-50 dark:bg-amber-950/40 rounded-xl border border-amber-200 dark:border-amber-800 text-xs text-amber-900 dark:text-amber-200 space-y-1">
                <div className="flex items-center gap-1.5 font-bold">
                  <ShieldCheck className="w-4 h-4 text-amber-600" />
                  <span>REGRA DE OURO ANTI-DUPLICIDADE ATIVA:</span>
                </div>
                <p>
                  Nunca cadastramos peças repetidas. O <strong>CÓDIGO DA PEÇA</strong> é a chave única.
                  Se o código já existir, o sistema apenas atualiza estoque e preço. Os preços de compra e estoque
                  são <strong>PRIVADOS</strong> de cada assinatura!
                </p>
              </div>

              {filteredProducts.map((p) => (
                <div
                  key={p.id}
                  className="p-4 rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-850 shadow-xs space-y-2"
                >
                  <div className="flex items-start justify-between gap-2">
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="font-mono text-xs font-bold px-2 py-0.5 rounded bg-emerald-50 dark:bg-emerald-950/70 text-emerald-800 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-800">
                          {p.code}
                        </span>
                        <span className="text-[10px] font-medium text-slate-500 uppercase">
                          {p.category === "costura"
                            ? "Costura Industrial"
                            : p.category === "mecanica_auto"
                            ? "Mecânica Automotiva"
                            : "Geral"}
                        </span>
                      </div>
                      <h4 className="font-bold text-slate-900 dark:text-slate-100 text-sm mt-1">
                        {p.name}
                      </h4>
                      <p className="text-xs text-slate-500 dark:text-slate-400">{p.description}</p>
                    </div>

                    <div className="text-right shrink-0">
                      <span className="text-sm font-bold text-emerald-600 dark:text-emerald-400">
                        R$ {p.salePrice.toFixed(2)}
                      </span>
                      {userRole !== "cliente" && (
                        <p className="text-[10px] text-slate-400">
                          Custo: R$ {p.purchasePrice.toFixed(2)} (Privado)
                        </p>
                      )}
                    </div>
                  </div>

                  <div className="flex items-center justify-between text-xs pt-2 border-t border-slate-100 dark:border-slate-800">
                    <span className="text-slate-500">
                      Disponibilidade:{" "}
                      <strong className={p.stockQuantity > (p.minStock || 0) ? "text-emerald-600" : "text-amber-600"}>
                        {userRole === "cliente"
                          ? p.stockQuantity > 0
                            ? "Em Estoque"
                            : "Sob Encomenda"
                          : `${p.stockQuantity} unidades`}
                      </strong>
                    </span>
                    <span className="text-[11px] text-slate-400">
                      Catálogo Inteligente Compartilhado
                    </span>
                  </div>
                </div>
              ))}
            </div>
          )}

          {/* TAB 4: CLIENTES */}
          {activeTab === "clientes" && (
            <div className="space-y-4">
              {clients.map((c) => (
                <div
                  key={c.id}
                  className="p-4 rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-850 shadow-xs space-y-2"
                >
                  <div className="flex items-start justify-between">
                    <div>
                      <h4 className="font-bold text-slate-900 dark:text-slate-100 text-sm">{c.name}</h4>
                      <p className="text-xs text-slate-500 dark:text-slate-400">
                        {c.city} • CPF/CNPJ: {c.document}
                      </p>
                    </div>
                    <span className="text-[10px] text-slate-400">{c.createdAt}</span>
                  </div>

                  <div className="flex flex-wrap items-center gap-2 pt-2 text-xs">
                    <a
                      href={`https://wa.me/55${c.phone.replace(/\D/g, "")}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg bg-emerald-50 dark:bg-emerald-950/70 text-emerald-700 dark:text-emerald-300 hover:bg-emerald-100 font-medium"
                    >
                      <span>WhatsApp: {c.phone}</span>
                      <ExternalLink className="w-3 h-3" />
                    </a>
                    <span className="text-slate-500">{c.email}</span>
                  </div>
                </div>
              ))}
            </div>
          )}

          {/* TAB 5: SISTEMA DE ASSINATURA MAPOS */}
          {activeTab === "assinatura" && (
            <div className="space-y-5">
              <div className="p-5 rounded-2xl bg-gradient-to-br from-slate-900 to-emerald-950 text-white shadow-lg space-y-4">
                <div className="flex items-start justify-between">
                  <div>
                    <span className="text-[11px] uppercase tracking-wider text-emerald-300 font-semibold">
                      Sistema Oficial de Assinatura
                    </span>
                    <h3 className="text-lg font-bold mt-0.5">{subscription.companyName}</h3>
                    <p className="text-xs text-slate-300">{subscription.planName}</p>
                  </div>

                  <div className="text-right">
                    <span className="font-mono text-xs px-2.5 py-1 rounded-lg bg-emerald-500/20 text-emerald-300 border border-emerald-400/40 font-bold">
                      {subscription.subscriptionCode}
                    </span>
                    <p className="text-[11px] text-slate-400 mt-1">
                      Status: <strong className="text-emerald-400 uppercase">{subscription.status}</strong>
                    </p>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-3 text-xs bg-white/5 p-3 rounded-xl border border-white/10">
                  <div>
                    <span className="text-slate-400">Vencimento da Mensalidade:</span>
                    <p className="font-bold text-white text-sm">{subscription.dueDate}</p>
                  </div>
                  <div>
                    <span className="text-slate-400">Dias Restantes:</span>
                    <p className="font-bold text-emerald-300 text-sm">
                      {subscription.daysRemaining} dias
                    </p>
                  </div>
                </div>

                {/* Cobrança Automática 10, 5 e 1 dia */}
                <div className="space-y-2 pt-2">
                  <span className="text-xs font-semibold text-slate-300">
                    Disparos Automáticos de Cobrança (Regra de Ouro):
                  </span>
                  <div className="grid grid-cols-3 gap-2">
                    <button
                      onClick={() => onSendSubscriptionNotice("10_days")}
                      className="p-2 rounded-xl bg-white/10 hover:bg-white/20 text-white text-xs text-center border border-white/15 transition-colors"
                    >
                      <div className="font-bold">Aviso 10 Dias</div>
                      <div className="text-[10px] text-emerald-300">
                        {subscription.noticesSent.tenDays ? "Disparado ✓" : "Disparar"}
                      </div>
                    </button>
                    <button
                      onClick={() => onSendSubscriptionNotice("5_days")}
                      className="p-2 rounded-xl bg-white/10 hover:bg-white/20 text-white text-xs text-center border border-white/15 transition-colors"
                    >
                      <div className="font-bold">Aviso 5 Dias</div>
                      <div className="text-[10px] text-emerald-300">
                        {subscription.noticesSent.fiveDays ? "Disparado ✓" : "Disparar"}
                      </div>
                    </button>
                    <button
                      onClick={() => onSendSubscriptionNotice("1_day")}
                      className="p-2 rounded-xl bg-amber-500/20 hover:bg-amber-500/30 text-amber-200 text-xs text-center border border-amber-400/40 transition-colors"
                    >
                      <div className="font-bold">Aviso 1 Dia</div>
                      <div className="text-[10px] text-amber-300">
                        {subscription.noticesSent.oneDay ? "Disparado ✓" : "Disparar"}
                      </div>
                    </button>
                  </div>
                </div>

                {/* Ações de Bloqueio & Backup de 60 dias */}
                <div className="pt-2 flex flex-wrap gap-2">
                  <a
                    href="/api/mapos/subscription/backup"
                    download
                    className="inline-flex items-center gap-1.5 px-3 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-semibold shadow-md transition-colors"
                  >
                    <Download className="w-3.5 h-3.5" />
                    <span>Download Backup Completo (JSON)</span>
                  </a>

                  <button
                    onClick={() => onSendSubscriptionNotice("block")}
                    className="inline-flex items-center gap-1.5 px-3 py-2 rounded-xl bg-red-600/30 hover:bg-red-600/50 text-red-200 border border-red-500/40 text-xs font-semibold transition-colors"
                  >
                    <AlertOctagon className="w-3.5 h-3.5" />
                    <span>Simular Bloqueio por Inadimplência</span>
                  </button>
                </div>
              </div>

              <div className="p-4 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-850 text-xs text-slate-600 dark:text-slate-300 space-y-2">
                <span className="font-bold text-slate-900 dark:text-slate-100">
                  Regras de Retenção & Expurgo (60 Dias):
                </span>
                <p>
                  Caso o assinante não pague, o acesso é mantido bloqueado por até <strong>60 dias</strong>.
                  Após 60 dias, o MapOS gera automaticamente o backup completo dos dados, encaminha para o assinante
                  e limpa o banco de dados daquela assinatura com segurança.
                </p>
                {subscription.lastBackupDate && (
                  <p className="text-[11px] text-slate-400">
                    Último backup oficial registrado: {subscription.lastBackupDate}
                  </p>
                )}
              </div>
            </div>
          )}

          {/* TAB 6: FINANCEIRO */}
          {activeTab === "financeiro" && userRole === "dono" && (
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-3 text-xs">
                <div className="p-3 rounded-xl bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-200 dark:border-emerald-800 text-emerald-900 dark:text-emerald-200">
                  <span className="text-[11px] text-emerald-700 dark:text-emerald-400 font-medium">
                    Total Receitas no Mês
                  </span>
                  <p className="text-lg font-bold">R$ 1.840,00</p>
                </div>
                <div className="p-3 rounded-xl bg-rose-50 dark:bg-rose-950/40 border border-rose-200 dark:border-rose-800 text-rose-900 dark:text-rose-200">
                  <span className="text-[11px] text-rose-700 dark:text-rose-400 font-medium">
                    Despesas de Reposição
                  </span>
                  <p className="text-lg font-bold">R$ 520,00</p>
                </div>
              </div>

              <div className="space-y-2">
                <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider">
                  Movimentações Recentes:
                </span>
                {financial.map((f) => (
                  <div
                    key={f.id}
                    className="p-3 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-850 flex items-center justify-between text-xs"
                  >
                    <div>
                      <p className="font-semibold text-slate-800 dark:text-slate-100">{f.description}</p>
                      <span className="text-[11px] text-slate-400">
                        {f.category} • {f.paymentMethod.toUpperCase()} • {f.date}
                      </span>
                    </div>
                    <span
                      className={`font-bold ${
                        f.type === "receita" ? "text-emerald-600" : "text-rose-600"
                      }`}
                    >
                      {f.type === "receita" ? "+ " : "- "}R$ {f.amount.toFixed(2)}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Modal: Nova OS */}
        {showNewOrderModal && (
          <div className="fixed inset-0 z-60 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4">
            <form
              onSubmit={handleCreateOrder}
              className="w-full max-w-md bg-white dark:bg-slate-900 rounded-2xl p-5 shadow-2xl space-y-3 text-xs"
            >
              <div className="flex items-center justify-between pb-2 border-b border-slate-200 dark:border-slate-800">
                <h3 className="font-bold text-slate-800 dark:text-slate-100 text-sm">
                  Abrir Nova Ordem de Serviço
                </h3>
                <button
                  type="button"
                  onClick={() => setShowNewOrderModal(false)}
                  className="p-1 text-slate-400 hover:text-slate-600"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>

              <div>
                <label className="font-semibold text-slate-700 dark:text-slate-300">Cliente:</label>
                <select
                  value={osClientId}
                  onChange={(e) => setOsClientId(e.target.value)}
                  className="w-full mt-1 p-2 rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-800 dark:text-slate-100"
                >
                  {clients.map((c) => (
                    <option key={c.id} value={c.id}>
                      {c.name} ({c.city})
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="font-semibold text-slate-700 dark:text-slate-300">Equipamento:</label>
                <input
                  type="text"
                  value={osEquipmentName}
                  onChange={(e) => setOsEquipmentName(e.target.value)}
                  className="w-full mt-1 p-2 rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-800 dark:text-slate-100"
                  required
                />
              </div>

              <div>
                <label className="font-semibold text-slate-700 dark:text-slate-300">Número de Série:</label>
                <input
                  type="text"
                  value={osSerial}
                  onChange={(e) => setOsSerial(e.target.value)}
                  className="w-full mt-1 p-2 rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-800 dark:text-slate-100 font-mono"
                  required
                />
              </div>

              <div>
                <label className="font-semibold text-slate-700 dark:text-slate-300">Defeito Relatado:</label>
                <textarea
                  rows={2}
                  value={osDefect}
                  onChange={(e) => setOsDefect(e.target.value)}
                  placeholder="Ex: Pulando ponto e quebrando linha em alta rotação..."
                  className="w-full mt-1 p-2 rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-800 dark:text-slate-100"
                  required
                />
              </div>

              <div>
                <label className="font-semibold text-slate-700 dark:text-slate-300">Valor Mão de Obra (R$):</label>
                <input
                  type="number"
                  value={osLabor}
                  onChange={(e) => setOsLabor(e.target.value)}
                  className="w-full mt-1 p-2 rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-800 dark:text-slate-100"
                />
              </div>

              <div className="pt-2 flex justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setShowNewOrderModal(false)}
                  className="px-3 py-1.5 rounded-lg text-slate-600 hover:bg-slate-100 dark:hover:bg-slate-800"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  className="px-4 py-1.5 rounded-lg bg-emerald-600 hover:bg-emerald-700 text-white font-semibold"
                >
                  Cadastrar OS
                </button>
              </div>
            </form>
          </div>
        )}

        {/* Modal: Nova Peça com Regra Anti-Duplicidade */}
        {showNewProductModal && (
          <div className="fixed inset-0 z-60 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4">
            <form
              onSubmit={handleCreateProduct}
              className="w-full max-w-md bg-white dark:bg-slate-900 rounded-2xl p-5 shadow-2xl space-y-3 text-xs"
            >
              <div className="flex items-center justify-between pb-2 border-b border-slate-200 dark:border-slate-800">
                <div>
                  <h3 className="font-bold text-slate-800 dark:text-slate-100 text-sm">
                    Cadastrar / Atualizar Peça
                  </h3>
                  <span className="text-[10px] text-amber-600 font-medium">
                    Regra Anti-Duplicidade ativada pelo Código
                  </span>
                </div>
                <button
                  type="button"
                  onClick={() => setShowNewProductModal(false)}
                  className="p-1 text-slate-400 hover:text-slate-600"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>

              <div>
                <label className="font-semibold text-slate-700 dark:text-slate-300">
                  Código da Peça (Chave Única):
                </label>
                <input
                  type="text"
                  placeholder="Ex: PC-LAN-101"
                  value={prodCode}
                  onChange={(e) => setProdCode(e.target.value)}
                  className="w-full mt-1 p-2 rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-800 dark:text-slate-100 font-mono uppercase"
                  required
                />
              </div>

              <div>
                <label className="font-semibold text-slate-700 dark:text-slate-300">Nome da Peça:</label>
                <input
                  type="text"
                  placeholder="Ex: Lançadeira Rotativa Hirose Hook"
                  value={prodName}
                  onChange={(e) => setProdName(e.target.value)}
                  className="w-full mt-1 p-2 rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-800 dark:text-slate-100"
                  required
                />
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="font-semibold text-slate-700 dark:text-slate-300">
                    Preço de Custo (Privado R$):
                  </label>
                  <input
                    type="number"
                    value={prodCost}
                    onChange={(e) => setProdCost(e.target.value)}
                    className="w-full mt-1 p-2 rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-800 dark:text-slate-100"
                  />
                </div>
                <div>
                  <label className="font-semibold text-slate-700 dark:text-slate-300">Preço de Venda (R$):</label>
                  <input
                    type="number"
                    value={prodPrice}
                    onChange={(e) => setProdPrice(e.target.value)}
                    className="w-full mt-1 p-2 rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-800 dark:text-slate-100"
                  />
                </div>
              </div>

              <div>
                <label className="font-semibold text-slate-700 dark:text-slate-300">Quantidade em Estoque:</label>
                <input
                  type="number"
                  value={prodStock}
                  onChange={(e) => setProdStock(e.target.value)}
                  className="w-full mt-1 p-2 rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-800 dark:text-slate-100"
                />
              </div>

              <div className="pt-2 flex justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setShowNewProductModal(false)}
                  className="px-3 py-1.5 rounded-lg text-slate-600 hover:bg-slate-100 dark:hover:bg-slate-800"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  className="px-4 py-1.5 rounded-lg bg-emerald-600 hover:bg-emerald-700 text-white font-semibold"
                >
                  Salvar Peça
                </button>
              </div>
            </form>
          </div>
        )}
      </div>
    </div>
  );
};
