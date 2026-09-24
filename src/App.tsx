import React, { useState, useEffect, useRef } from "react";
import { Header } from "./components/Header";
import { ChatMessage } from "./components/ChatMessage";
import { ChatInput } from "./components/ChatInput";
import { AlertBanner } from "./components/AlertBanner";
import { LeadsDrawer } from "./components/LeadsDrawer";
import { MaposDrawer } from "./components/MaposDrawer";
import { CompanyInfoModal } from "./components/CompanyInfoModal";
import { ImageZoomModal } from "./components/ImageZoomModal";
import {
  ChatMessage as IChatMessage,
  Lead,
  AdminAlert,
  MaposClient,
  MaposEquipment,
  MaposProduct,
  MaposOrder,
  MaposFinancialEntry,
  MaposSubscription,
  UserRole,
} from "./types";
import { Shield, Layers, Wrench, Cpu, Package, CheckCircle2 } from "lucide-react";

export default function App() {
  const [messages, setMessages] = useState<IChatMessage[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [isAdmin, setIsAdmin] = useState(false);
  const [leads, setLeads] = useState<Lead[]>([]);
  const [alerts, setAlerts] = useState<AdminAlert[]>([]);
  const [isLeadsOpen, setIsLeadsOpen] = useState(false);
  const [isInfoOpen, setIsInfoOpen] = useState(false);
  const [isMaposOpen, setIsMaposOpen] = useState(false);
  const [zoomedImage, setZoomedImage] = useState<string | null>(null);

  // MapOS States
  const [userRole, setUserRole] = useState<UserRole>("dono");
  const [clients, setClients] = useState<MaposClient[]>([]);
  const [equipments, setEquipments] = useState<MaposEquipment[]>([]);
  const [products, setProducts] = useState<MaposProduct[]>([]);
  const [orders, setOrders] = useState<MaposOrder[]>([]);
  const [financial, setFinancial] = useState<MaposFinancialEntry[]>([]);
  const [subscription, setSubscription] = useState<MaposSubscription>({
    subscriptionCode: "MAPOS-ELO-7821",
    subscriberName: "Eloizio de Souza Assunção",
    companyName: "Grupo Eloizio & Mecânica Integrada",
    planName: "MapOS Multi-Oficina Pro",
    monthlyFee: 149.9,
    dueDate: "2026-10-05",
    daysRemaining: 12,
    status: "ativa",
    daysBlocked: 0,
    noticesSent: {
      tenDays: false,
      fiveDays: false,
      oneDay: false,
    },
    lastBackupDate: "2026-09-20",
  });

  // Theme state with localStorage persistence
  const [theme, setTheme] = useState<"light" | "dark">(() => {
    const saved = localStorage.getItem("theme");
    if (saved === "dark" || saved === "light") return saved;
    return typeof window !== "undefined" &&
      window.matchMedia &&
      window.matchMedia("(prefers-color-scheme: dark)").matches
      ? "dark"
      : "light";
  });

  useEffect(() => {
    if (theme === "dark") {
      document.documentElement.classList.add("dark");
    } else {
      document.documentElement.classList.remove("dark");
    }
    localStorage.setItem("theme", theme);
  }, [theme]);

  const toggleTheme = () => {
    setTheme((prev) => (prev === "light" ? "dark" : "light"));
  };

  const [ttsVoice, setTtsVoice] = useState<"female" | "male">(() => {
    return (localStorage.getItem("tts-voice") as "female" | "male") || "female";
  });

  const toggleTtsVoice = () => {
    const next = ttsVoice === "female" ? "male" : "female";
    setTtsVoice(next);
    localStorage.setItem("tts-voice", next);
  };

  const messagesEndRef = useRef<HTMLDivElement | null>(null);

  // Time-of-day greeting calculation (5h-11h59: Bom dia, 12h-17h59: Boa tarde, 18h-4h59: Boa noite)
  const getTimeGreeting = (): string => {
    const hours = new Date().getHours();
    if (hours >= 5 && hours < 12) return "Bom dia";
    if (hours >= 12 && hours < 18) return "Boa tarde";
    return "Boa noite";
  };

  // Fetch live MapOS Database
  const fetchMaposData = async () => {
    try {
      const res = await fetch(`/api/mapos/data?role=${userRole}`);
      const data = await res.json();
      if (data.clients) setClients(data.clients);
      if (data.equipments) setEquipments(data.equipments);
      if (data.products) setProducts(data.products);
      if (data.orders) setOrders(data.orders);
      if (data.financial) setFinancial(data.financial);
      if (data.subscription) setSubscription(data.subscription);
      if (data.alerts) setAlerts(data.alerts);
    } catch (err) {
      console.error("Erro ao carregar banco MapOS:", err);
    }
  };

  // Initialize initial Camilla greeting
  const initChat = () => {
    const greeting = getTimeGreeting();
    const welcomeMessage: IChatMessage = {
      id: "initial-" + Date.now(),
      sender: "camilla",
      text: `${greeting}! Sou a Camilla, sua atendente MapOS inteligente do Grupo Eloizio. Como posso te ajudar hoje com suas máquinas de costura, mecânica de carro, ordens de serviço ou peças? Se quiser, pode me enviar fotos ou áudios que já faço o diagnóstico para você com todo o carinho! ✨`,
      timestamp: new Date().toLocaleTimeString("pt-BR", {
        hour: "2-digit",
        minute: "2-digit",
      }),
    };
    setMessages([welcomeMessage]);
  };

  useEffect(() => {
    initChat();
    fetchMaposData();

    // Fetch leads
    fetch("/api/leads")
      .then((res) => res.json())
      .then((data) => {
        if (data.leads) setLeads(data.leads);
      })
      .catch((err) => console.error("Could not fetch leads:", err));
  }, []);

  // Auto scroll
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, isLoading]);

  const handleSendMessage = async (
    text: string,
    image?: { data: string; mimeType: string; previewUrl: string },
    audio?: { data: string; mimeType: string; duration?: number }
  ) => {
    const now = new Date();
    const timeString = now.toLocaleTimeString("pt-BR", {
      hour: "2-digit",
      minute: "2-digit",
    });

    const userMsg: IChatMessage = {
      id: "user-" + Date.now(),
      sender: "user",
      text,
      timestamp: timeString,
      image,
      audio,
      roleContext: userRole,
      isAdminMessage: isAdmin,
    };

    const newMessages = [...messages, userMsg];
    setMessages(newMessages);
    setIsLoading(true);

    try {
      const greeting = getTimeGreeting();
      const response = await fetch("/api/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          messages: newMessages.map((m) => ({
            sender: m.sender,
            text: m.text,
          })),
          currentMessage: text,
          image: image ? { data: image.data, mimeType: image.mimeType } : undefined,
          audio: audio ? { data: audio.data, mimeType: audio.mimeType } : undefined,
          clientTime: greeting,
          userRole,
          isAdmin,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || "Falha na comunicação com a Camilla");
      }

      const camillaMsg: IChatMessage = {
        id: "camilla-" + Date.now(),
        sender: "camilla",
        text: data.text,
        timestamp: new Date().toLocaleTimeString("pt-BR", {
          hour: "2-digit",
          minute: "2-digit",
        }),
        hasAdminAlert: data.hasAdminAlert,
      };

      setMessages((prev) => [...prev, camillaMsg]);

      // If an alert was generated, update alerts
      if (data.hasAdminAlert) {
        const newAlert: AdminAlert = {
          id: "alert-" + Date.now(),
          timestamp: timeString,
          message:
            "[ALERTA_ADMIN] Eloizio, o cliente precisa de ajuda com algo que foge da minha alçada. Por favor, assuma o atendimento.",
          clientContext: text,
          resolved: false,
        };
        setAlerts((prev) => [newAlert, ...prev]);
      }
    } catch (err: any) {
      console.error("Erro ao enviar mensagem:", err);
      const errorMsg: IChatMessage = {
        id: "error-" + Date.now(),
        sender: "camilla",
        text: "Vou verificar isso rapidinho para você com o maior carinho. Tive uma leve oscilação, mas já estou atenta!",
        timestamp: new Date().toLocaleTimeString("pt-BR", {
          hour: "2-digit",
          minute: "2-digit",
        }),
      };
      setMessages((prev) => [...prev, errorMsg]);
    } finally {
      setIsLoading(false);
    }
  };

  const handleDismissAlert = (id: string) => {
    setAlerts((prev) => prev.filter((a) => a.id !== id));
    fetch(`/api/alerts/${id}/resolve`, { method: "POST" }).catch(() => {});
  };

  // MapOS Actions
  const handleSendSubscriptionNotice = async (
    noticeType: "10_days" | "5_days" | "1_day" | "block"
  ) => {
    try {
      const res = await fetch("/api/mapos/subscription/notice", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ noticeType }),
      });
      const data = await res.json();
      if (data.subscription) {
        setSubscription(data.subscription);
      }
      if (data.message) {
        // Envia mensagem informativa no chat
        const infoMsg: IChatMessage = {
          id: "system-" + Date.now(),
          sender: "camilla",
          text: data.message,
          timestamp: new Date().toLocaleTimeString("pt-BR", {
            hour: "2-digit",
            minute: "2-digit",
          }),
        };
        setMessages((prev) => [...prev, infoMsg]);
      }
    } catch (err) {
      console.error("Erro ao enviar aviso de cobrança:", err);
    }
  };

  const handleTriggerClean = async () => {
    try {
      const res = await fetch("/api/mapos/subscription/clean", { method: "POST" });
      const data = await res.json();
      if (data.subscription) setSubscription(data.subscription);
      alert(data.message || "Limpeza de dados executada após backup.");
    } catch (err) {
      console.error("Erro ao executar limpeza:", err);
    }
  };

  const handleAddProduct = async (productData: Partial<MaposProduct>) => {
    try {
      const res = await fetch("/api/mapos/products", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(productData),
      });
      const data = await res.json();
      if (data.success) {
        fetchMaposData();
        const notificationMsg: IChatMessage = {
          id: "notice-" + Date.now(),
          sender: "camilla",
          text: data.message || `Peça ${productData.name} cadastrada com sucesso!`,
          timestamp: new Date().toLocaleTimeString("pt-BR", {
            hour: "2-digit",
            minute: "2-digit",
          }),
        };
        setMessages((prev) => [...prev, notificationMsg]);
      }
    } catch (err) {
      console.error("Erro ao adicionar produto:", err);
    }
  };

  const handleAddOrder = async (orderData: Partial<MaposOrder>) => {
    try {
      const res = await fetch("/api/mapos/orders", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(orderData),
      });
      const data = await res.json();
      if (data.success) {
        fetchMaposData();
        const notificationMsg: IChatMessage = {
          id: "notice-" + Date.now(),
          sender: "camilla",
          text: `Ordem de Serviço ${data.order.orderNumber} aberta para ${data.order.clientName} (Série: ${data.order.serialNumber}) com valor inicial de R$ ${data.order.totalPrice.toFixed(2)}.`,
          timestamp: new Date().toLocaleTimeString("pt-BR", {
            hour: "2-digit",
            minute: "2-digit",
          }),
        };
        setMessages((prev) => [...prev, notificationMsg]);
      }
    } catch (err) {
      console.error("Erro ao adicionar OS:", err);
    }
  };

  const handleAddManualLead = async (leadData: Omit<Lead, "id" | "createdAt">) => {
    try {
      const res = await fetch("/api/leads", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(leadData),
      });
      const data = await res.json();
      if (data.lead) {
        setLeads((prev) => [data.lead, ...prev]);
      }
    } catch (err) {
      console.error("Erro ao salvar lead:", err);
    }
  };

  const activeAlert = alerts.find((a) => !a.resolved);

  return (
    <div
      className={`flex flex-col h-screen bg-slate-100 dark:bg-slate-950 font-sans text-slate-900 dark:text-slate-100 transition-colors ${
        theme === "dark" ? "dark" : ""
      }`}
    >
      {/* Header */}
      <Header
        leadsCount={leads.length}
        alertsCount={alerts.filter((a) => !a.resolved).length}
        isAdmin={isAdmin}
        isDark={theme === "dark"}
        ttsVoice={ttsVoice}
        userRole={userRole}
        subscriptionCode={subscription.subscriptionCode}
        onToggleAdmin={() => setIsAdmin(!isAdmin)}
        onToggleTheme={toggleTheme}
        onToggleTtsVoice={toggleTtsVoice}
        onChangeUserRole={(role) => {
          setUserRole(role);
          fetchMaposData();
        }}
        onOpenMapos={() => setIsMaposOpen(true)}
        onOpenLeads={() => setIsLeadsOpen(true)}
        onOpenInfo={() => setIsInfoOpen(true)}
        onResetChat={initChat}
      />

      {/* Critical Escalation Banner (if triggered) */}
      {activeAlert && (
        <AlertBanner alert={activeAlert} onDismiss={handleDismissAlert} />
      )}

      {/* Chat Messages Container */}
      <main className="flex-1 overflow-y-auto p-4 sm:p-6 space-y-3 max-w-5xl w-full mx-auto">
        {/* MapOS Welcome Card */}
        <div className="bg-white/80 dark:bg-slate-900/90 backdrop-blur-xs rounded-2xl p-4 border border-emerald-100 dark:border-slate-800 shadow-xs mb-4 text-center max-w-lg mx-auto transition-colors">
          <div className="w-12 h-12 mx-auto mb-2 rounded-2xl bg-gradient-to-tr from-emerald-700 to-teal-600 text-white flex items-center justify-center font-bold text-lg shadow-sm">
            <Layers className="w-6 h-6" />
          </div>
          <h2 className="text-sm font-bold text-slate-800 dark:text-slate-100">
            MapOS Inteligente • Atendente Virtual Camilla
          </h2>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
            Mecânica de Carro & Máquinas de Costura Industrial/Doméstica
          </p>

          <div className="mt-3 flex items-center justify-center gap-2 flex-wrap text-[11px]">
            <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-emerald-50 dark:bg-emerald-950/60 text-emerald-700 dark:text-emerald-300 font-semibold border border-emerald-200 dark:border-emerald-800">
              <CheckCircle2 className="w-3 h-3" />
              Assinatura: {subscription.subscriptionCode}
            </span>
            <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 font-medium">
              Interlocutor: <strong className="uppercase">[{userRole}]</strong>
            </span>
            <button
              onClick={() => setIsMaposOpen(true)}
              className="text-emerald-700 dark:text-emerald-400 font-bold hover:underline"
            >
              Abrir Banco de Dados →
            </button>
          </div>
        </div>

        {/* Message history */}
        {messages.map((msg) => (
          <ChatMessage
            key={msg.id}
            message={msg}
            ttsVoice={ttsVoice}
            onImageClick={(url) => setZoomedImage(url)}
          />
        ))}

        {/* Typing indicator */}
        {isLoading && (
          <div className="flex items-center gap-2 text-xs text-slate-500 dark:text-slate-400 bg-white dark:bg-slate-900 px-3.5 py-2 rounded-2xl w-fit shadow-xs border border-emerald-100 dark:border-slate-800 transition-colors">
            <div className="w-2 h-2 rounded-full bg-emerald-500 animate-bounce" />
            <div
              className="w-2 h-2 rounded-full bg-emerald-500 animate-bounce"
              style={{ animationDelay: "150ms" }}
            />
            <div
              className="w-2 h-2 rounded-full bg-emerald-500 animate-bounce"
              style={{ animationDelay: "300ms" }}
            />
            <span className="ml-1 font-medium text-slate-600 dark:text-slate-300">
              Camilla está analisando e formulando resposta...
            </span>
          </div>
        )}

        <div ref={messagesEndRef} />
      </main>

      {/* Input Area */}
      <ChatInput
        onSendMessage={handleSendMessage}
        isLoading={isLoading}
        isAdmin={isAdmin}
        onToggleAdmin={() => setIsAdmin(!isAdmin)}
      />

      {/* MapOS Complete Drawer */}
      <MaposDrawer
        isOpen={isMaposOpen}
        onClose={() => setIsMaposOpen(false)}
        userRole={userRole}
        onChangeUserRole={(r) => {
          setUserRole(r);
          fetchMaposData();
        }}
        clients={clients}
        equipments={equipments}
        products={products}
        orders={orders}
        financial={financial}
        subscription={subscription}
        onRefreshData={fetchMaposData}
        onSendSubscriptionNotice={handleSendSubscriptionNotice}
        onTriggerClean={handleTriggerClean}
        onAddProduct={handleAddProduct}
        onAddOrder={handleAddOrder}
      />

      {/* Leads Drawer */}
      <LeadsDrawer
        isOpen={isLeadsOpen}
        onClose={() => setIsLeadsOpen(false)}
        leads={leads}
        onAddLead={handleAddManualLead}
      />

      {/* Company Info & System Prompt Specs Modal */}
      <CompanyInfoModal
        isOpen={isInfoOpen}
        onClose={() => setIsInfoOpen(false)}
      />

      {/* Image Zoom Modal */}
      <ImageZoomModal
        imageUrl={zoomedImage}
        onClose={() => setZoomedImage(null)}
      />
    </div>
  );
}
