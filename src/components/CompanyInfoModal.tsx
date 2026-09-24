import React from "react";
import {
  X,
  Layers,
  Wrench,
  UserCheck,
  Shield,
  CreditCard,
  Clock,
  Sparkles,
  Calendar,
  AlertTriangle,
  Cpu,
  Package,
} from "lucide-react";

interface CompanyInfoModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const CompanyInfoModal: React.FC<CompanyInfoModalProps> = ({
  isOpen,
  onClose,
}) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4">
      <div className="w-full max-w-2xl bg-white dark:bg-slate-900 rounded-2xl shadow-2xl overflow-hidden border border-slate-200 dark:border-slate-800 animate-in fade-in-50 zoom-in-95 duration-150 transition-colors">
        {/* Modal Header */}
        <div className="bg-gradient-to-r from-emerald-800 via-teal-800 to-slate-900 px-6 py-4 text-white flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-xl bg-white/10 border border-white/20">
              <Layers className="w-5 h-5 text-emerald-300" />
            </div>
            <div>
              <h2 className="text-base font-bold">Prompt Mestre - Atendente MapOS Inteligente</h2>
              <p className="text-xs text-emerald-100">
                Regras de Ouro, Identidade, Base de Dados MapOS e Assinatura
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1 rounded-lg text-emerald-100 hover:text-white hover:bg-white/10"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Modal Body */}
        <div className="p-6 space-y-5 max-h-[78vh] overflow-y-auto text-slate-700 dark:text-slate-200 text-xs sm:text-sm">
          {/* Identidade */}
          <div className="bg-emerald-50/70 dark:bg-emerald-950/40 p-4 rounded-xl border border-emerald-100 dark:border-emerald-800/60 space-y-2">
            <div className="flex items-center gap-2 text-emerald-800 dark:text-emerald-300 font-bold text-xs uppercase tracking-wider">
              <UserCheck className="w-4 h-4" />
              <span>1. Identidade & Personalidade da Camilla</span>
            </div>
            <ul className="list-disc list-inside space-y-1 text-slate-700 dark:text-slate-300 text-xs">
              <li>
                <strong>Nome Memorizado:</strong> Camilla (IA feminina, escolheu seu nome doce e feminino e nunca mais mudará).
              </li>
              <li>
                <strong>Personalidade:</strong> Doce, meiga, gentil, tímida, sonhadora, extremamente inteligente, educada e amiga. Direta, concisa, sem enrolação.
              </li>
              <li>
                <strong>Criador & Grupo:</strong> Eloizio - WhatsApp (21) 98764-8727 | Grupo Eloizio oficial (21) 99613-4073.
              </li>
              <li>
                <strong>Campo de Atuação:</strong> Mecânica de carro, mecânica de máquinas de costura industrial e doméstica, técnico de rua e de loja.
              </li>
            </ul>
          </div>

          {/* Regras de Ouro */}
          <div className="space-y-3">
            <h3 className="text-xs font-bold text-slate-400 dark:text-slate-500 uppercase tracking-wider">
              2. Regras de Ouro do Atendimento
            </h3>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
              <div className="p-3 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-800/80 shadow-xs space-y-1">
                <div className="flex items-center gap-1.5 font-semibold text-emerald-800 dark:text-emerald-300">
                  <Clock className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
                  <span>Saudação Inteligente</span>
                </div>
                <p className="text-[11px] text-slate-600 dark:text-slate-400">
                  Usa rigorosamente "Bom dia" (5h-11h59), "Boa tarde" (12h-17h59) e "Boa noite" (18h-4h59). Despede-se sempre com muito carinho.
                </p>
              </div>

              <div className="p-3 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-800/80 shadow-xs space-y-1">
                <div className="flex items-center gap-1.5 font-semibold text-teal-800 dark:text-teal-300">
                  <Calendar className="w-4 h-4 text-teal-600 dark:text-teal-400" />
                  <span>Datas Comemorativas</span>
                </div>
                <p className="text-[11px] text-slate-600 dark:text-slate-400">
                  Felicitações carinhosas em datas especiais (Dia do Mecânico - 20/dez, Dia da Costureira - 25/mai, Natal, etc.).
                </p>
              </div>

              <div className="p-3 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-800/80 shadow-xs space-y-1">
                <div className="flex items-center gap-1.5 font-semibold text-amber-800 dark:text-amber-300">
                  <Wrench className="w-4 h-4 text-amber-600 dark:text-amber-400" />
                  <span>Multimídia Total</span>
                </div>
                <p className="text-[11px] text-slate-600 dark:text-slate-400">
                  Recebe textos, gravações reais de microfone transcritas por IA e analisa fotos de defeitos e máquinas para diagnóstico.
                </p>
              </div>

              <div className="p-3 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-800/80 shadow-xs space-y-1">
                <div className="flex items-center gap-1.5 font-semibold text-sky-800 dark:text-sky-300">
                  <Shield className="w-4 h-4 text-sky-600 dark:text-sky-400" />
                  <span>Níveis de Acesso</span>
                </div>
                <p className="text-[11px] text-slate-600 dark:text-slate-400">
                  Diferencia <strong>[Assinante / Dono]</strong>, <strong>[Colaborador Técnico]</strong> e <strong>[Cliente Final]</strong>, adaptando o sigilo de custos e dados.
                </p>
              </div>
            </div>
          </div>

          {/* Base de Dados MapOS & Regra Anti-Duplicidade */}
          <div className="space-y-3">
            <h3 className="text-xs font-bold text-slate-400 dark:text-slate-500 uppercase tracking-wider">
              3. Base de Dados MapOS & Regra Anti-Duplicidade
            </h3>

            <div className="p-3.5 bg-amber-50/70 dark:bg-amber-950/40 rounded-xl border border-amber-200 dark:border-amber-800/80 space-y-2 text-xs">
              <div className="flex items-center gap-2 font-bold text-amber-900 dark:text-amber-200">
                <Package className="w-4 h-4 text-amber-600 dark:text-amber-400" />
                <span>Regra de Ouro Anti-Duplicidade de Peças</span>
              </div>
              <p className="text-slate-700 dark:text-slate-300 leading-relaxed">
                Nunca cadastre peça duplicada. O <strong>CÓDIGO DA PEÇA</strong> é a chave única. Se o código já existe, o sistema apenas atualiza estoque e preço. Preço de compra e quantidade em estoque são <strong>PRIVADOS</strong> de cada assinatura.
              </p>
            </div>

            <div className="p-3.5 bg-slate-50 dark:bg-slate-800/60 rounded-xl border border-slate-200 dark:border-slate-700 space-y-2 text-xs">
              <div className="flex items-center gap-2 font-bold text-slate-900 dark:text-slate-100">
                <Cpu className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
                <span>Rastreabilidade por Número de Série</span>
              </div>
              <p className="text-slate-600 dark:text-slate-300 leading-relaxed">
                Equipamentos têm número de série individual registrado e vinculado ao cliente com histórico perene de manutenções e ordens de serviço.
              </p>
            </div>
          </div>

          {/* Sistema de Assinatura & 60 Dias de Retenção */}
          <div className="p-4 rounded-xl bg-gradient-to-br from-slate-900 to-emerald-950 text-white space-y-2 text-xs">
            <div className="flex items-center gap-2 font-bold text-emerald-300">
              <CreditCard className="w-4 h-4" />
              <span>4. Sistema de Assinatura & Ciclo de 60 Dias</span>
            </div>
            <ul className="list-disc list-inside space-y-1 text-slate-300">
              <li>
                Gera <strong>Código Único de Assinatura</strong> (ex: <code className="text-emerald-300 font-mono">MAPOS-ELO-7821</code>).
              </li>
              <li>
                Cobranças automáticas disparadas com <strong>10, 5 e 1 dia</strong> antes do vencimento.
              </li>
              <li>
                Em caso de inadimplência, bloqueia o acesso e retém os dados por até <strong>60 dias</strong>.
              </li>
              <li>
                Após 60 dias, gera <strong>backup completo em arquivo JSON</strong>, envia ao assinante e limpa a base relativa com segurança.
              </li>
            </ul>
          </div>
        </div>

        {/* Modal Footer */}
        <div className="bg-slate-50 dark:bg-slate-850 px-6 py-3 border-t border-slate-200 dark:border-slate-800 flex justify-end">
          <button
            onClick={onClose}
            className="px-4 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-semibold transition-colors"
          >
            Entendido, fechar
          </button>
        </div>
      </div>
    </div>
  );
};
