export interface ChatMessage {
  id: string;
  sender: "user" | "camilla";
  text: string;
  timestamp: string;
  roleContext?: UserRole;
  image?: {
    data: string; // base64
    mimeType: string;
    previewUrl: string;
  };
  audio?: {
    data: string; // base64
    mimeType: string;
    duration?: number;
  };
  hasAdminAlert?: boolean;
  isAdminMessage?: boolean;
}

export type UserRole = "dono" | "tecnico" | "cliente";

export interface Lead {
  id: string;
  name: string;
  email: string;
  phone?: string;
  interest?: string;
  createdAt: string;
  notes?: string;
}

export interface AdminAlert {
  id: string;
  timestamp: string;
  message: string;
  clientContext?: string;
  resolved: boolean;
}

export type SectorType = "contabilidade" | "cursos" | "maquinas" | "geral";

// Base de Dados MapOS Inteligente
export interface MaposClient {
  id: string;
  name: string;
  phone: string;
  email: string;
  document: string; // CPF ou CNPJ
  city: string;
  address: string;
  createdAt: string;
}

export interface MaposEquipment {
  id: string;
  clientId: string;
  clientName: string;
  type: "costura_industrial" | "costura_domestica" | "automotivo" | "outro";
  typeName: string;
  brand: string;
  model: string;
  serialNumber: string; // Número de série único
  history: Array<{
    date: string;
    description: string;
    osNumber?: string;
  }>;
  photoUrl?: string;
}

export interface MaposProduct {
  id: string;
  code: string; // CÓDIGO DA PEÇA - CHAVE ÚNICA ANTI-DUPLICIDADE
  name: string;
  category: "costura" | "mecanica_auto" | "geral";
  purchasePrice: number; // PRIVADO da assinatura
  salePrice: number;
  stockQuantity: number; // PRIVADO da assinatura
  minStock: number;
  description: string;
  photoUrl?: string;
  isSharedCatalog: boolean;
}

export interface MaposService {
  id: string;
  name: string;
  category: "costura" | "mecanica_auto" | "geral";
  price: number;
  estimatedHours: number;
  description: string;
}

export interface MaposOrder {
  id: string;
  orderNumber: string;
  clientId: string;
  clientName: string;
  equipmentId: string;
  equipmentName: string;
  serialNumber: string;
  reportedDefect: string;
  technicalDiagnosis: string;
  partsUsed: Array<{
    partCode: string;
    name: string;
    quantity: number;
    unitPrice: number;
  }>;
  laborPrice: number;
  totalPrice: number;
  status: "aberta" | "em_andamento" | "aguardando_pecas" | "concluida" | "faturada" | "cancelada";
  warrantyDays: number;
  createdAt: string;
  updatedAt: string;
}

export interface MaposFinancialEntry {
  id: string;
  type: "receita" | "despesa";
  category: string;
  description: string;
  amount: number;
  paymentMethod: "mercado_pago" | "pix" | "dinheiro" | "cartao";
  status: "pago" | "pendente";
  date: string;
}

export interface MaposSubscription {
  subscriptionCode: string; // CÓDIGO ÚNICO DE ASSINATURA (Ex: MAPOS-ELO-7821)
  subscriberName: string;
  companyName: string;
  planName: string;
  monthlyFee: number;
  dueDate: string;
  daysRemaining: number;
  status: "ativa" | "vencendo" | "bloqueada" | "expurgada";
  daysBlocked: number;
  noticesSent: {
    tenDays: boolean;
    fiveDays: boolean;
    oneDay: boolean;
  };
  lastBackupDate?: string;
}
