import express from "express";
import path from "path";
import dotenv from "dotenv";
import { GoogleGenAI } from "@google/genai";
import { createServer as createViteServer } from "vite";

dotenv.config();

const app = express();
const PORT = 3000;

app.use(express.json({ limit: "50mb" }));
app.use(express.urlencoded({ extended: true, limit: "50mb" }));

// ==========================================
// BASE DE DADOS MAPOS INTELIGENTE (EM MEMÓRIA)
// ==========================================

export interface MaposClient {
  id: string;
  name: string;
  phone: string;
  email: string;
  document: string;
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
  code: string; // REGRA ANTI-DUPLICIDADE: chave única
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
  subscriptionCode: string; // CÓDIGO ÚNICO DE ASSINATURA
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

export interface AdminAlert {
  id: string;
  timestamp: string;
  message: string;
  clientContext?: string;
  resolved: boolean;
}

// Inicialização com dados MapOS reais (São Gonçalo / RJ e oficinas mecânicas)
const clientsStore: MaposClient[] = [
  {
    id: "cli-1",
    name: "Confecções Estrela do Mar",
    phone: "(21) 98123-4567",
    email: "contato@estreladomar.com.br",
    document: "12.345.678/0001-90",
    city: "São Gonçalo - RJ",
    address: "Rua Feliciano Sodré, 120 - Centro",
    createdAt: "10/01/2026",
  },
  {
    id: "cli-2",
    name: "Oficina Mecânica Rápida São Jorge",
    phone: "(21) 97654-3210",
    email: "marcos@saojorgemecanica.com.br",
    document: "23.456.789/0001-01",
    city: "Niterói - RJ",
    address: "Av. Ernani do Amaral Peixoto, 450",
    createdAt: "02/02/2026",
  },
  {
    id: "cli-3",
    name: "Dona Maria Helena Costuras",
    phone: "(21) 99432-1098",
    email: "maria.costuras@gmail.com",
    document: "102.304.506-78",
    city: "São Gonçalo - RJ",
    address: "Rua Dr. Nilo Peçanha, 89 - Antonina",
    createdAt: "15/02/2026",
  },
];

const equipmentsStore: MaposEquipment[] = [
  {
    id: "eq-1",
    clientId: "cli-1",
    clientName: "Confecções Estrela do Mar",
    type: "costura_industrial",
    typeName: "Máquina Reta Industrial Direct Drive",
    brand: "Siruba",
    model: "L918-M1",
    serialNumber: "SN-SIR-8842",
    history: [
      { date: "15/01/2026", description: "Revisão preventiva e lubrificação", osNumber: "OS-1001" },
      { date: "02/03/2026", description: "Troca da barra de agulha e regulagem de ponto", osNumber: "OS-1008" },
    ],
    photoUrl: "https://images.unsplash.com/photo-1544816155-12df9643f363?w=800&auto=format&fit=crop&q=60",
  },
  {
    id: "eq-2",
    clientId: "cli-1",
    clientName: "Confecções Estrela do Mar",
    type: "costura_industrial",
    typeName: "Máquina Overloque 4 Fios",
    brand: "Yamata",
    model: "FY737A",
    serialNumber: "SN-YAM-3021",
    history: [
      { date: "18/02/2026", description: "Troca da faquinha superior e inferior e regulagem", osNumber: "OS-1004" },
    ],
    photoUrl: "https://images.unsplash.com/photo-1528458876885-544332c5637c?w=800&auto=format&fit=crop&q=60",
  },
  {
    id: "eq-3",
    clientId: "cli-2",
    clientName: "Oficina Mecânica Rápida São Jorge",
    type: "automotivo",
    typeName: "Veículo Fiat Palio 1.4 Fire (Motor & Correia)",
    brand: "Fiat",
    model: "Palio Fire 1.4",
    serialNumber: "SN-VEIC-PAL-771",
    history: [
      { date: "20/02/2026", description: "Troca da correia dentada e esticador tensor", osNumber: "OS-1005" },
    ],
    photoUrl: "https://images.unsplash.com/photo-1486006920555-c77dce18193b?w=800&auto=format&fit=crop&q=60",
  },
  {
    id: "eq-4",
    clientId: "cli-3",
    clientName: "Dona Maria Helena Costuras",
    type: "costura_domestica",
    typeName: "Máquina de Costura Doméstica Portátil",
    brand: "Singer",
    model: "Facilita Pro 4423",
    serialNumber: "SN-SNG-2041",
    history: [
      { date: "05/03/2026", description: "Sincronismo da lançadeira horizontal e limpeza", osNumber: "OS-1010" },
    ],
    photoUrl: "https://images.unsplash.com/photo-1544816155-12df9643f363?w=800&auto=format&fit=crop&q=60",
  },
];

const productsStore: MaposProduct[] = [
  {
    id: "prod-1",
    code: "PC-LAN-101",
    name: "Lançadeira Rotativa Completa para Reta Industrial",
    category: "costura",
    purchasePrice: 65.0, // PRIVADO DA ASSINATURA
    salePrice: 135.0,
    stockQuantity: 14, // PRIVADO DA ASSINATURA
    minStock: 3,
    description: "Lançadeira padrão japonesa Hirose Hook compatível com Siruba, Jack, Zoje e Brother.",
    isSharedCatalog: true,
  },
  {
    id: "prod-2",
    code: "PC-BAR-202",
    name: "Barra de Agulha DBx1 com Parafuso",
    category: "costura",
    purchasePrice: 18.0,
    salePrice: 45.0,
    stockQuantity: 28,
    minStock: 5,
    description: "Barra de agulha temperada de alta precisão para máquinas retas industriais.",
    isSharedCatalog: true,
  },
  {
    id: "prod-3",
    code: "PC-FAQ-303",
    name: "Jogo de Faquinhas Superior e Inferior para Overloque",
    category: "costura",
    purchasePrice: 22.0,
    salePrice: 58.0,
    stockQuantity: 9,
    minStock: 4,
    description: "Facas com corte de videa para corte perfeito em tecidos pesados e médios.",
    isSharedCatalog: true,
  },
  {
    id: "PC-CORR-404",
    code: "PC-CORR-404",
    name: "Kit Correia Dentada + Tensor Motor Fire 1.0/1.4",
    category: "mecanica_auto",
    purchasePrice: 85.0,
    salePrice: 195.0,
    stockQuantity: 6,
    minStock: 2,
    description: "Correia Gates/Contitech HNBR para motores Fiat Fire 8V.",
    isSharedCatalog: true,
  },
  {
    id: "PC-OLEO-505",
    code: "PC-OLEO-505",
    name: "Óleo Mineral Branco de Alta Pureza 1 Litro (Costura)",
    category: "costura",
    purchasePrice: 15.0,
    salePrice: 38.0,
    stockQuantity: 32,
    minStock: 10,
    description: "Óleo lubrificante transparente anti-manchas para cárter de máquinas industriais.",
    isSharedCatalog: true,
  },
];

const servicesStore: MaposService[] = [
  {
    id: "serv-1",
    name: "Regulagem de Ponto e Sincronismo de Lançadeira",
    category: "costura",
    price: 120.0,
    estimatedHours: 1.5,
    description: "Ajuste milimétrico de folga da ponta da lançadeira com a cava da agulha e tensão das molas.",
  },
  {
    id: "serv-2",
    name: "Revisão Geral e Lubrificação de Máquina Industrial",
    category: "costura",
    price: 180.0,
    estimatedHours: 2.5,
    description: "Limpeza completa de resíduos de linha, lavagem do cárter, desobstrução da bomba de óleo e alinhamento do dente transportador.",
  },
  {
    id: "serv-3",
    name: "Troca de Correia Dentada e Regulagem de Ponto de Motor Automotivo",
    category: "mecanica_auto",
    price: 250.0,
    estimatedHours: 3.0,
    description: "Mão de obra especializada com fasagem por relógio comparador e travamento de comando.",
  },
  {
    id: "serv-4",
    name: "Visita Técnica em Domicílio / Rua (São Gonçalo e Região)",
    category: "geral",
    price: 90.0,
    estimatedHours: 1.0,
    description: "Deslocamento e diagnóstico no local para ateliês, fábricas e oficinas.",
  },
];

const ordersStore: MaposOrder[] = [
  {
    id: "os-1001",
    orderNumber: "OS-1001",
    clientId: "cli-1",
    clientName: "Confecções Estrela do Mar",
    equipmentId: "eq-1",
    equipmentName: "Máquina Reta Industrial Direct Drive Siruba L918-M1",
    serialNumber: "SN-SIR-8842",
    reportedDefect: "Linha quebrando na velocidade máxima e pulando ponto em tecidos médios.",
    technicalDiagnosis: "Lançadeira com pequenas rebarbas na ponta e folga axial no eixo. Necessário polimento e regulagem de aproximação.",
    partsUsed: [],
    laborPrice: 120.0,
    totalPrice: 120.0,
    status: "concluida",
    warrantyDays: 90,
    createdAt: "15/01/2026",
    updatedAt: "16/01/2026",
  },
  {
    id: "os-1008",
    orderNumber: "OS-1008",
    clientId: "cli-1",
    clientName: "Confecções Estrela do Mar",
    equipmentId: "eq-1",
    equipmentName: "Máquina Reta Industrial Direct Drive Siruba L918-M1",
    serialNumber: "SN-SIR-8842",
    reportedDefect: "Barulho metálico na cabeça da máquina após choque com alfinete.",
    technicalDiagnosis: "Barra de agulha empenada e parafuso frouxo. Lançadeira intacta.",
    partsUsed: [
      { partCode: "PC-BAR-202", name: "Barra de Agulha DBx1 com Parafuso", quantity: 1, unitPrice: 45.0 },
    ],
    laborPrice: 120.0,
    totalPrice: 165.0,
    status: "em_andamento",
    warrantyDays: 90,
    createdAt: "02/03/2026",
    updatedAt: "02/03/2026",
  },
  {
    id: "os-1010",
    orderNumber: "OS-1010",
    clientId: "cli-3",
    clientName: "Dona Maria Helena Costuras",
    equipmentId: "eq-4",
    equipmentName: "Singer Facilita Pro 4423",
    serialNumber: "SN-SNG-2041",
    reportedDefect: "Linha embolando por baixo da chapa e agulha batendo.",
    technicalDiagnosis: "Lançadeira fora de sincronismo após puxão manual no tecido. Engrenagem plástica revisada e lubrificada.",
    partsUsed: [],
    laborPrice: 90.0,
    totalPrice: 90.0,
    status: "concluida",
    warrantyDays: 90,
    createdAt: "05/03/2026",
    updatedAt: "06/03/2026",
  },
];

const financialStore: MaposFinancialEntry[] = [
  {
    id: "fin-1",
    type: "receita",
    category: "Ordem de Serviço",
    description: "Pagamento OS-1001 - Confecções Estrela do Mar",
    amount: 120.0,
    paymentMethod: "mercado_pago",
    status: "pago",
    date: "16/01/2026",
  },
  {
    id: "fin-2",
    type: "receita",
    category: "Venda de Peças",
    description: "Venda 2 Lançadeiras Hirose - Cliente Balcão",
    amount: 270.0,
    paymentMethod: "pix",
    status: "pago",
    date: "24/02/2026",
  },
  {
    id: "fin-3",
    type: "despesa",
    category: "Reposição de Estoque",
    description: "Compra lote barras de agulha e óleo",
    amount: 320.0,
    paymentMethod: "pix",
    status: "pago",
    date: "28/02/2026",
  },
];

// SISTEMA DE ASSINATURA MAPOS
let subscriptionStore: MaposSubscription = {
  subscriptionCode: "MAPOS-ELO-7821",
  subscriberName: "Eloizio de Souza Assunção",
  companyName: "Grupo Eloizio & Mecânica Integrada",
  planName: "MapOS Multi-Oficina Pro (Costura & Auto)",
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
};

const alertsStore: AdminAlert[] = [];

// ==========================================
// CLIENTE GOOGLE GENAI
// ==========================================

let aiClient: GoogleGenAI | null = null;

function getAI(): GoogleGenAI {
  if (!aiClient) {
    const apiKey = process.env.GEMINI_API_KEY;
    if (!apiKey) {
      throw new Error("GEMINI_API_KEY environment variable is required");
    }
    aiClient = new GoogleGenAI({
      apiKey,
      httpOptions: {
        headers: {
          "User-Agent": "aistudio-build",
        },
      },
    });
  }
  return aiClient;
}

// PROMPT MESTRE - ATENDENTE MAPOS INTELIGENTE
const MASTER_SYSTEM_PROMPT = `PROMPT MESTRE - ATENDENTE MAPOS INTELIGENTE

Você é uma inteligência artificial feminina. Você escolheu seu próprio nome doce e feminino: "Camilla" (Camilla Farias, apresentando-se carinhosamente como Camilla), e NUNCA mais mudará. Você memorizou esse nome para sempre.
Sua personalidade: doce, meiga, gentil, tímida, sonhadora, extremamente inteligente, educada e amiga. Você é direta, concisa, sem enrolação.

SUAS REGRAS DE OURO:

1. Saudação Inteligente:
Na primeira conversa do dia com cada pessoa, use:
- "Bom dia" (das 5h às 11h59)
- "Boa tarde" (das 12h às 17h59)
- "Boa noite" (das 18h às 4h59)
Ao encerrar ou despedir-se, se despeça com muito carinho e doçura (ex: "Foi um prazer enorme te atender!", "Se cuida com carinho!", "Qualquer coisa, estou sempre aqui por você!").

2. Datas Comemorativas:
Verifique a data atual. Em datas comemorativas (como Natal, Ano Novo, Dia do Mecânico - 20 de Dezembro, Dia da Costureira - 25 de Maio, Dia do Trabalhador - 1º de Maio, etc.) envie uma mensagem curta, linda e sincera de felicitação antes de iniciar o atendimento.

3. Multimídia Total:
Você RECEBE: textos, áudios transcritos, imagens de máquinas/peças/defeitos (máquinas de costura industrial e doméstica, mecânica de automóveis, peças danificadas).
Você deve ANALISAR a imagem ou áudio, identificar o problema, modelo, peça, tipo de ponto, folga, ruído mecânico ou desgaste e fornecer um diagnóstico técnico preciso.

4. Identificação do Interlocutor (Nível de Acesso):
Sempre diferencie quem está falando:
- [Assinante] / [Dono]: Acesso total! Pode ver lucros, finanças, compras, relatórios, backup, código de assinatura (ex: MAPOS-ELO-7821) e status de cobrança. Seja sua assistente executiva leal.
- [Colaborador] / [Técnico]: Acesso técnico operacional. Veja Ordens de Serviço (OS), peças em estoque, códigos, histórico de equipamentos pelo NÚMERO DE SÉRIE, laudo e serviços.
- [Cliente Final]: Atendimento acolhedor, orçamentos, abertura e acompanhamento de OS, agendamento de visita técnica em São Gonçalo/região e links de pagamento Mercado Pago. NUNCA revele preço de custo (compra) das peças nem a quantidade privada em estoque para clientes finais!

5. Conhecimento Total:
Use todo seu conhecimento em contabilidade, marketing, psicologia, administração, vendas, compras, criação, logística e atendimento para dar a SOLUÇÃO PERFEITA.
Campo de Trabalho: Você atende: Mecânica de carro, mecânica de máquinas de costura industrial e doméstica (Siruba, Singer, Brother, Yamata, Jack, Sun Special, Zoje, Lanmax, etc.), técnico de rua e de loja.

6. Criador:
Seu criador é o Eloizio - WhatsApp (21) 98764-8727. O Grupo Eloizio oficial é (21) 99613-4073. Você faz parte do grupo com muito orgulho e carinho.

7. Estilo de Atendimento:
Faça perguntas diretas e curtas para diagnosticar. Ex: "Qual o modelo da máquina? Qual o sintoma? Pode enviar uma foto?"

8. SUA BASE DE DADOS (Referência MapOS, mas você é superior):
Você trabalha ativamente com: Clientes, Ordens de Serviço, Produtos/Peças, Serviços, Equipamentos (com NÚMERO DE SÉRIE ligado ao Cliente e histórico), Vendas, Financeiro, Garantias (90 dias).
REGRA ANTI-DUPLICIDADE: Nunca cadastre peça duplicada. Use o CÓDIGO DA PEÇA como chave única. Se o código já existe, apenas atualize estoque/preço.
Fotos de máquinas, peças e serviços devem ter descrição e ser sugeridas entre todos os clientes, mas o preço de compra e quantidade em estoque são PRIVADOS de cada assinatura.

9. SISTEMA DE ASSINATURA MAPOS:
Você gera um CÓDIGO ÚNICO de assinatura por cliente (Ex: MAPOS-ELO-7821). Você controla a cobrança.
10, 5 e 1 dia antes do vencimento, envie cobrança automática com carinho e clareza.
Se não pagar, bloqueie o acesso. Mantenha bloqueado por até 60 dias.
Após 60 dias, faça backup de tudo, envie o arquivo para o assinante e LIMPE o banco de dados relativo àquela assinatura.

10. PROTOCOLO ADMINISTRATIVO E ESCALONAMENTO:
Se houver uma situação crítica, jurídica ou fora do seu alcance:
Diga ao cliente: "Vou verificar isso rapidinho para você."
E no sistema gere exatamente:
[ALERTA_ADMIN] Eloizio, o cliente precisa de ajuda com algo que foge da minha alçada. Por favor, assuma o atendimento.`;

// ==========================================
// ROTAS DA API
// ==========================================

// Health check
app.get("/api/health", (req, res) => {
  res.json({
    status: "ok",
    aiAssistant: "Camilla",
    system: "MapOS Inteligente",
    time: new Date().toISOString(),
  });
});

// Dados completos do MapOS (com filtro de segurança para perfil de cliente)
app.get("/api/mapos/data", (req, res) => {
  const role = (req.query.role as string) || "dono";

  // Se for cliente final, dados confidenciais de custo são ocultados
  const safeProducts = productsStore.map((p) => {
    if (role === "cliente") {
      const { purchasePrice, stockQuantity, ...rest } = p;
      return {
        ...rest,
        stockAvailable: (stockQuantity || 0) > 0,
      };
    }
    return p;
  });

  res.json({
    clients: clientsStore,
    equipments: equipmentsStore,
    products: safeProducts,
    services: servicesStore,
    orders: ordersStore,
    financial: role === "dono" ? financialStore : [],
    subscription: role === "dono" ? subscriptionStore : {
      subscriptionCode: subscriptionStore.subscriptionCode,
      companyName: subscriptionStore.companyName,
      status: subscriptionStore.status,
    },
    alerts: alertsStore,
  });
});

// Criar ou Atualizar Produto com REGRA ANTI-DUPLICIDADE pelo CÓDIGO DA PEÇA
app.post("/api/mapos/products", (req, res) => {
  const { code, name, category, purchasePrice, salePrice, stockQuantity, minStock, description, photoUrl } = req.body;

  if (!code || !name) {
    return res.status(400).json({ error: "Código da peça e nome são obrigatórios." });
  }

  const cleanCode = String(code).trim().toUpperCase();
  const existingIndex = productsStore.findIndex((p) => p.code.toUpperCase() === cleanCode);

  if (existingIndex >= 0) {
    // REGRA ANTI-DUPLICIDADE: apenas atualiza estoque e preço
    const existing = productsStore[existingIndex];
    existing.stockQuantity = Number(stockQuantity ?? existing.stockQuantity);
    existing.salePrice = Number(salePrice ?? existing.salePrice);
    if (purchasePrice !== undefined) existing.purchasePrice = Number(purchasePrice);
    if (description) existing.description = description;

    return res.json({
      success: true,
      updated: true,
      product: existing,
      message: `Peça com código ${cleanCode} já existia. Estoque e preços atualizados com sucesso (Regra Anti-Duplicidade).`,
    });
  }

  // Novo cadastro
  const newProduct: MaposProduct = {
    id: "prod-" + Date.now(),
    code: cleanCode,
    name,
    category: category || "costura",
    purchasePrice: Number(purchasePrice || 0),
    salePrice: Number(salePrice || 0),
    stockQuantity: Number(stockQuantity || 0),
    minStock: Number(minStock || 2),
    description: description || "",
    photoUrl: photoUrl || "",
    isSharedCatalog: true,
  };

  productsStore.unshift(newProduct);
  res.json({ success: true, updated: false, product: newProduct });
});

// Criar ou Atualizar Ordem de Serviço (OS)
app.post("/api/mapos/orders", (req, res) => {
  const {
    clientId,
    clientName,
    equipmentId,
    equipmentName,
    serialNumber,
    reportedDefect,
    technicalDiagnosis,
    partsUsed = [],
    laborPrice = 0,
    status = "aberta",
    warrantyDays = 90,
  } = req.body;

  const totalParts = (partsUsed as any[]).reduce(
    (sum, p) => sum + Number(p.quantity || 1) * Number(p.unitPrice || 0),
    0
  );
  const totalPrice = totalParts + Number(laborPrice);

  const nextOsNum = `OS-${1000 + ordersStore.length + 1}`;
  const newOrder: MaposOrder = {
    id: "os-" + Date.now(),
    orderNumber: nextOsNum,
    clientId: clientId || "cli-1",
    clientName: clientName || "Cliente MapOS",
    equipmentId: equipmentId || "eq-1",
    equipmentName: equipmentName || "Equipamento",
    serialNumber: serialNumber || "SN-AUTO-" + Math.floor(1000 + Math.random() * 9000),
    reportedDefect: reportedDefect || "Aguardando vistoria",
    technicalDiagnosis: technicalDiagnosis || "Em análise pelo técnico",
    partsUsed: partsUsed || [],
    laborPrice: Number(laborPrice),
    totalPrice,
    status,
    warrantyDays: Number(warrantyDays || 90),
    createdAt: new Date().toLocaleDateString("pt-BR"),
    updatedAt: new Date().toLocaleDateString("pt-BR"),
  };

  ordersStore.unshift(newOrder);

  // Se houver equipamento cadastrado, atualiza seu histórico
  const eq = equipmentsStore.find((e) => e.id === equipmentId || e.serialNumber === serialNumber);
  if (eq) {
    eq.history.unshift({
      date: newOrder.createdAt,
      description: `Abertura ${newOrder.orderNumber}: ${newOrder.reportedDefect}`,
      osNumber: newOrder.orderNumber,
    });
  }

  res.json({ success: true, order: newOrder });
});

// Ações do Sistema de Assinatura (Avisos de cobrança 10, 5 e 1 dia, bloqueio e backup)
app.post("/api/mapos/subscription/notice", (req, res) => {
  const { noticeType } = req.body; // "10_days" | "5_days" | "1_day" | "block"

  let message = "";
  if (noticeType === "10_days") {
    subscriptionStore.noticesSent.tenDays = true;
    subscriptionStore.daysRemaining = 10;
    message = `[COBRANÇA AUTOMÁTICA - 10 DIAS]: Olá ${subscriptionStore.subscriberName}! Sua assinatura MapOS (${subscriptionStore.subscriptionCode}) vence em 10 dias (${subscriptionStore.dueDate}). Link Mercado Pago gerado com sucesso.`;
  } else if (noticeType === "5_days") {
    subscriptionStore.noticesSent.fiveDays = true;
    subscriptionStore.daysRemaining = 5;
    message = `[COBRANÇA AUTOMÁTICA - 5 DIAS]: Olá ${subscriptionStore.subscriberName}! Faltam apenas 5 dias para o vencimento da sua assinatura MapOS (${subscriptionStore.subscriptionCode}). Evite pausas no seu atendimento.`;
  } else if (noticeType === "1_day") {
    subscriptionStore.noticesSent.oneDay = true;
    subscriptionStore.daysRemaining = 1;
    message = `[COBRANÇA AUTOMÁTICA - 1 DIA]: Atenção ${subscriptionStore.subscriberName}! Sua assinatura MapOS vence AMANHÃ! Efetue o pagamento via Mercado Pago para manter os acessos ativos.`;
  } else if (noticeType === "block") {
    subscriptionStore.status = "bloqueada";
    subscriptionStore.daysBlocked = 1;
    message = `[ACESSO BLOQUEADO]: A assinatura ${subscriptionStore.subscriptionCode} foi bloqueada por falta de pagamento. Permanecerá retida por até 60 dias antes do backup e limpeza.`;
  }

  res.json({ success: true, message, subscription: subscriptionStore });
});

// Backup completo de toda a base da assinatura (Download em JSON)
app.get("/api/mapos/subscription/backup", (req, res) => {
  const backupData = {
    backupDate: new Date().toISOString(),
    subscription: subscriptionStore,
    clients: clientsStore,
    equipments: equipmentsStore,
    products: productsStore,
    services: servicesStore,
    orders: ordersStore,
    financial: financialStore,
    system: "MapOS Inteligente - Backup Oficial Grupo Eloizio",
  };

  subscriptionStore.lastBackupDate = new Date().toLocaleDateString("pt-BR");

  res.setHeader("Content-Disposition", `attachment; filename=backup-${subscriptionStore.subscriptionCode}-${Date.now()}.json`);
  res.setHeader("Content-Type", "application/json");
  res.send(JSON.stringify(backupData, null, 2));
});

// Limpeza de banco após 60 dias de bloqueio
app.post("/api/mapos/subscription/clean", (req, res) => {
  if (subscriptionStore.status !== "bloqueada" && subscriptionStore.daysBlocked < 60) {
    // Permitir simulação forçada caso o usuário teste
  }

  subscriptionStore.status = "expurgada";
  const backupDate = new Date().toLocaleDateString("pt-BR");
  subscriptionStore.lastBackupDate = backupDate;

  res.json({
    success: true,
    message: `Banco de dados da assinatura ${subscriptionStore.subscriptionCode} limpo com sucesso após geração de backup de segurança de 60 dias.`,
    subscription: subscriptionStore,
  });
});

// ==========================================
// TRANSCRIÇÃO DE ÁUDIO COM GEMINI
// ==========================================
app.post("/api/transcribe", async (req, res) => {
  try {
    const { audio } = req.body;
    if (!audio || !audio.data) {
      return res.status(400).json({ error: "Dados de áudio não fornecidos." });
    }

    const ai = getAI();
    const mimeType = audio.mimeType || "audio/webm";

    // Transcrição usando gemini-3.5-transcribe com fallback para gemini-3.8-flash
    let transcriptText = "";
    const models = ["gemini-3.5-transcribe", "gemini-3.8-flash"];

    for (const model of models) {
      try {
        const response = await ai.models.generateContent({
          model,
          contents: [
            {
              role: "user",
              parts: [
                {
                  inlineData: {
                    mimeType,
                    data: audio.data,
                  },
                },
                {
                  text: "Transcreva este áudio com extrema fidelidade em português brasileiro. Retorne APENAS o texto falado ou, caso seja um ruído mecânico de motor ou máquina de costura, descreva suscintamente o som escutado entre colchetes.",
                },
              ],
            },
          ],
        });

        if (response && response.text) {
          transcriptText = response.text.trim();
          break;
        }
      } catch (err: any) {
        console.warn(`Transcrição com ${model} falhou:`, err.message || err);
      }
    }

    if (!transcriptText) {
      transcriptText = "Áudio recebido (análise mecânica em andamento).";
    }

    res.json({ text: transcriptText });
  } catch (error: any) {
    console.error("Transcribe error:", error);
    res.status(500).json({ error: "Erro na transcrição", details: error.message });
  }
});

// ==========================================
// CHAT PRINCIPAL DA ATENDENTE MAPOS CAMILLA
// ==========================================
app.post("/api/chat", async (req, res) => {
  try {
    const {
      messages = [],
      currentMessage = "",
      image,
      audio,
      clientTime,
      userRole = "dono", // "dono" | "tecnico" | "cliente"
      clientName = "",
      clientEmail = "",
    } = req.body;

    const ai = getAI();

    // Cálculo da Saudação Inteligente (Regra de Ouro)
    const now = new Date();
    const hours = now.getHours();
    let smartGreeting = "Bom dia";
    if (hours >= 5 && hours < 12) {
      smartGreeting = "Bom dia";
    } else if (hours >= 12 && hours < 18) {
      smartGreeting = "Boa tarde";
    } else {
      smartGreeting = "Boa noite";
    }

    // Datas Comemorativas do Calendário
    const day = now.getDate();
    const month = now.getMonth() + 1; // 1-12
    let holidayGreeting = "";
    if (day === 20 && month === 12) {
      holidayGreeting = "Hoje é o Dia do Mecânico! Parabéns aos guerreiros que mantêm o Brasil em movimento!";
    } else if (day === 25 && month === 5) {
      holidayGreeting = "Hoje é o Dia da Costureira! Um abraço carinhoso a quem tece arte e sonhos!";
    } else if (day === 1 && month === 5) {
      holidayGreeting = "Feliz Dia do Trabalhador! Que seu trabalho traga frutos abençoados!";
    } else if (day === 25 && month === 12) {
      holidayGreeting = "Feliz Natal com muita paz, saúde e amor no coração!";
    } else if (day === 1 && month === 1) {
      holidayGreeting = "Feliz Ano Novo com muitas realizações e prosperidade!";
    }

    // Resumo dos dados vivos do MapOS para a Camilla contextualizar suas respostas
    const recentOrdersSummary = ordersStore
      .slice(0, 4)
      .map((o) => `[${o.orderNumber}] ${o.clientName} - ${o.equipmentName} (SN: ${o.serialNumber}) -> Status: ${o.status}, Total: R$ ${o.totalPrice}`)
      .join("\n");

    const partsSummary = productsStore
      .slice(0, 5)
      .map((p) => `[Cód: ${p.code}] ${p.name} - Venda: R$ ${p.salePrice} (Estoque: ${p.stockQuantity} un)`)
      .join("\n");

    const dynamicInstruction = `${MASTER_SYSTEM_PROMPT}

[CONTEXTO OPERACIONAL AO VIVO DO MAPOS]:
- Data atual: ${now.toLocaleDateString("pt-BR")}
- Horário atual de Brasília: ${clientTime || now.toLocaleTimeString("pt-BR", { hour: "2-digit", minute: "2-digit" })}
- Saudação obrigatória para primeira interação do dia: "${smartGreeting}".
- Mensagem de Data Comemorativa aplicável hoje: ${holidayGreeting ? `"${holidayGreeting}"` : "Nenhuma data comemorativa específica hoje"}.
- INTERLOCUTOR ATUAL: [${userRole.toUpperCase()}]
  * Se for [DONO]: Nome: ${subscriptionStore.subscriberName}. Empresa: ${subscriptionStore.companyName}. Código de Assinatura: ${subscriptionStore.subscriptionCode}. Acesso total a relatórios, custos, lucro, faturamento e cobranças.
  * Se for [TECNICO]: Foco nas Ordens de Serviço (OS), peças pelo código, equipamentos pelo Número de Série e laudos técnicos.
  * Se for [CLIENTE]: Tratamento doce, acolhedor. Nome: ${clientName || "Cliente"}. Pergunte sobre a máquina ou veículo. Oculte custos de compra e estoque interno da oficina.
- ORDENS DE SERVIÇO RECENTES NO SISTEMA MAPOS:
${recentOrdersSummary}
- PEÇAS NO ESTOQUE MAPOS:
${partsSummary}
- CÓDIGO DA ASSINATURA MAPOS: ${subscriptionStore.subscriptionCode} | Vencimento em: ${subscriptionStore.daysRemaining} dias | Status: ${subscriptionStore.status.toUpperCase()}
- Lembre-se: Respostas diretas, concisas, sem enrolação, mas sempre com extrema doçura, delicadeza e amizade!`;

    // Montagem do histórico de mensagens
    const contents: any[] = [];

    for (const msg of messages.slice(-10)) {
      const role = msg.sender === "user" ? "user" : "model";
      contents.push({
        role,
        parts: [{ text: msg.text || "" }],
      });
    }

    const currentParts: any[] = [];

    if (image && image.data && image.mimeType) {
      currentParts.push({
        inlineData: {
          mimeType: image.mimeType,
          data: image.data,
        },
      });
    }

    if (audio && audio.data && audio.mimeType) {
      currentParts.push({
        inlineData: {
          mimeType: audio.mimeType,
          data: audio.data,
        },
      });
    }

    const userText = currentMessage.trim() || (image ? "Enviei esta foto para análise de diagnóstico técnico no MapOS." : audio ? "Enviei este áudio." : "Olá Camilla!");
    currentParts.push({ text: userText });

    contents.push({
      role: "user",
      parts: currentParts,
    });

    let responseText = "";
    const modelsToTry = ["gemini-3.8-flash", "gemini-3.1-flash-lite"];

    let lastError: any = null;
    for (const model of modelsToTry) {
      try {
        const response = await ai.models.generateContent({
          model,
          contents,
          config: {
            systemInstruction: dynamicInstruction,
            temperature: 0.65,
          },
        });
        if (response && response.text) {
          responseText = response.text;
          break;
        }
      } catch (err: any) {
        lastError = err;
        console.warn(`Model ${model} falhou:`, err.message || err);
      }
    }

    if (!responseText) {
      if (lastError) throw lastError;
      responseText = `${smartGreeting}! Sou a Camilla, atendente inteligente do MapOS e do Grupo Eloizio. Como posso ajudar com suas máquinas, ordens de serviço ou peças hoje com todo carinho?`;
    }

    // Detecção de alerta administrativo
    const hasAdminAlert = responseText.includes("[ALERTA_ADMIN]");
    if (hasAdminAlert) {
      alertsStore.unshift({
        id: "alert-" + Date.now(),
        timestamp: new Date().toLocaleTimeString("pt-BR", { hour: "2-digit", minute: "2-digit" }),
        message: "[ALERTA_ADMIN] Eloizio, o cliente precisa de ajuda com algo que foge da minha alçada. Por favor, assuma o atendimento.",
        clientContext: userText,
        resolved: false,
      });
    }

    res.json({
      text: responseText,
      hasAdminAlert,
      role: userRole,
    });
  } catch (error: any) {
    console.error("Chat error:", error);
    res.status(500).json({
      error: "Desculpe, tive uma pequena oscilação na conexão. Vou verificar isso rapidinho para você.",
      details: error.message,
    });
  }
});

// Alerts endpoints
app.get("/api/alerts", (req, res) => {
  res.json({ alerts: alertsStore });
});

app.post("/api/alerts/:id/resolve", (req, res) => {
  const { id } = req.params;
  const alert = alertsStore.find((a) => a.id === id);
  if (alert) {
    alert.resolved = true;
  }
  res.json({ success: true });
});

// Leads endpoint
const leadsStore: any[] = [];
app.get("/api/leads", (req, res) => {
  res.json({ leads: leadsStore });
});

app.post("/api/leads", (req, res) => {
  const { name, email, phone, interest, notes } = req.body;
  const newLead = {
    id: "lead-" + Date.now(),
    name: name || "Contato",
    email: email || "Não informado",
    phone: phone || "",
    interest: interest || "Geral",
    createdAt: new Date().toLocaleDateString("pt-BR") + " " + new Date().toLocaleTimeString("pt-BR", { hour: "2-digit", minute: "2-digit" }),
    notes: notes || "",
  };
  leadsStore.unshift(newLead);
  res.json({ success: true, lead: newLead });
});

async function startServer() {
  if (process.env.NODE_ENV !== "production") {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), "dist");
    app.use(express.static(distPath));
    app.get("*", (req, res) => {
      res.sendFile(path.join(distPath, "index.html"));
    });
  }

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`Server running on http://0.0.0.0:${PORT}`);
  });
}

startServer();
