import React from "react";
import {
  Phone,
  Globe,
  Users,
  ShieldCheck,
  Sparkles,
  Info,
  RefreshCw,
  Sun,
  Moon,
  Volume2,
  Layers,
  Wrench,
} from "lucide-react";
import { UserRole } from "../types";

interface HeaderProps {
  leadsCount: number;
  alertsCount: number;
  isAdmin: boolean;
  isDark: boolean;
  ttsVoice: "female" | "male";
  userRole: UserRole;
  subscriptionCode: string;
  onToggleAdmin: () => void;
  onToggleTheme: () => void;
  onToggleTtsVoice: () => void;
  onChangeUserRole: (role: UserRole) => void;
  onOpenMapos: () => void;
  onOpenLeads: () => void;
  onOpenInfo: () => void;
  onResetChat: () => void;
}

export const Header: React.FC<HeaderProps> = ({
  leadsCount,
  alertsCount,
  isAdmin,
  isDark,
  ttsVoice,
  userRole,
  subscriptionCode,
  onToggleAdmin,
  onToggleTheme,
  onToggleTtsVoice,
  onChangeUserRole,
  onOpenMapos,
  onOpenLeads,
  onOpenInfo,
  onResetChat,
}) => {
  return (
    <header className="bg-white dark:bg-slate-900 border-b border-emerald-100 dark:border-slate-800 sticky top-0 z-30 shadow-xs transition-colors">
      <div className="max-w-5xl mx-auto px-4 py-3 flex items-center justify-between gap-3">
        {/* Camilla Profile */}
        <div className="flex items-center gap-3 min-w-0">
          <div className="relative shrink-0">
            <div className="w-11 h-11 rounded-full bg-gradient-to-tr from-emerald-600 via-teal-500 to-emerald-400 flex items-center justify-center text-white font-semibold shadow-sm ring-2 ring-emerald-50 dark:ring-slate-800">
              <span className="text-base tracking-tight">CF</span>
            </div>
            <span
              className="absolute bottom-0 right-0 w-3.5 h-3.5 bg-emerald-500 border-2 border-white dark:border-slate-900 rounded-full shadow-xs"
              title="Online agora"
            />
          </div>

          <div className="min-w-0">
            <div className="flex items-center gap-2">
              <h1 className="text-base font-bold text-slate-800 dark:text-slate-100 tracking-tight truncate">
                Camilla
              </h1>
              <span className="inline-flex items-center gap-0.5 px-2 py-0.5 rounded-full text-[11px] font-medium bg-emerald-50 dark:bg-emerald-950/60 text-emerald-700 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-800/80">
                <ShieldCheck className="w-3 h-3 text-emerald-600 dark:text-emerald-400" />
                Atendente MapOS
              </span>
            </div>
            <p className="text-xs text-slate-500 dark:text-slate-400 truncate flex items-center gap-1.5">
              <span>Máquinas & Auto • Grupo Eloizio</span>
              <span className="text-slate-300 dark:text-slate-600">•</span>
              <span className="font-mono text-[11px] text-emerald-600 dark:text-emerald-400 font-semibold">{subscriptionCode}</span>
            </p>
          </div>
        </div>

        {/* Action Controls */}
        <div className="flex items-center gap-2 shrink-0">
          {/* Painel MapOS Button */}
          <button
            id="open-mapos-btn"
            onClick={onOpenMapos}
            title="Abrir Painel MapOS (Ordens de Serviço, Máquinas, Peças e Assinatura)"
            className="px-2.5 py-1.5 rounded-xl text-xs font-semibold bg-emerald-600 hover:bg-emerald-700 text-white shadow-xs flex items-center gap-1.5 transition-all"
          >
            <Layers className="w-4 h-4 text-emerald-100" />
            <span className="hidden sm:inline">Painel MapOS</span>
          </button>

          {/* Quick Role Selector */}
          <div className="hidden lg:flex items-center bg-slate-100 dark:bg-slate-800 p-0.5 rounded-lg border border-slate-200 dark:border-slate-700 text-xs">
            <button
              onClick={() => onChangeUserRole("dono")}
              className={`px-2 py-1 rounded-md text-[11px] font-medium transition-all ${
                userRole === "dono"
                  ? "bg-emerald-600 text-white shadow-xs font-bold"
                  : "text-slate-600 dark:text-slate-300 hover:text-slate-900"
              }`}
            >
              [Dono]
            </button>
            <button
              onClick={() => onChangeUserRole("tecnico")}
              className={`px-2 py-1 rounded-md text-[11px] font-medium transition-all ${
                userRole === "tecnico"
                  ? "bg-teal-600 text-white shadow-xs font-bold"
                  : "text-slate-600 dark:text-slate-300 hover:text-slate-900"
              }`}
            >
              [Técnico]
            </button>
            <button
              onClick={() => onChangeUserRole("cliente")}
              className={`px-2 py-1 rounded-md text-[11px] font-medium transition-all ${
                userRole === "cliente"
                  ? "bg-sky-600 text-white shadow-xs font-bold"
                  : "text-slate-600 dark:text-slate-300 hover:text-slate-900"
              }`}
            >
              [Cliente]
            </button>
          </div>

          {/* Admin Toggle */}
          <button
            id="toggle-admin-btn"
            onClick={onToggleAdmin}
            title={isAdmin ? "Modo Eloizio Ativo (Desativar)" : "Ativar Modo Eloizio [ADMIN]"}
            className={`px-2.5 py-1.5 rounded-lg text-xs font-medium transition-all flex items-center gap-1.5 border ${
              isAdmin
                ? "bg-amber-500 text-white border-amber-600 shadow-xs"
                : "bg-slate-50 hover:bg-slate-100 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-200 border-slate-200 dark:border-slate-700"
            }`}
          >
            <Sparkles className="w-3.5 h-3.5" />
            <span className="hidden xl:inline">
              {isAdmin ? "[ADMIN] Ativo" : "[ADMIN]"}
            </span>
          </button>

          {/* Theme Toggle Button */}
          <button
            id="theme-toggle-btn"
            onClick={onToggleTheme}
            title={isDark ? "Mudar para modo claro" : "Mudar para modo escuro"}
            aria-label={isDark ? "Mudar para modo claro" : "Mudar para modo escuro"}
            className="p-1.5 rounded-lg text-slate-500 hover:text-slate-800 dark:text-slate-400 dark:hover:text-slate-100 hover:bg-slate-100 dark:hover:bg-slate-800 border border-slate-200 dark:border-slate-700 transition-colors"
          >
            {isDark ? (
              <Sun className="w-4 h-4 text-amber-400" />
            ) : (
              <Moon className="w-4 h-4 text-slate-600" />
            )}
          </button>

          {/* TTS Voice Toggle Button */}
          <button
            id="tts-voice-toggle-btn"
            onClick={onToggleTtsVoice}
            title={ttsVoice === "female" ? "Mudar para voz masculina" : "Mudar para voz feminina"}
            aria-label={ttsVoice === "female" ? "Mudar para voz masculina" : "Mudar para voz feminina"}
            className="hidden sm:flex items-center gap-1.5 px-2 py-1.5 rounded-lg text-xs font-medium text-slate-500 hover:text-slate-800 dark:text-slate-400 dark:hover:text-slate-100 hover:bg-slate-100 dark:hover:bg-slate-800 border border-slate-200 dark:border-slate-700 transition-colors"
          >
            <Volume2 className="w-3.5 h-3.5" />
            <span>Voz: {ttsVoice === "female" ? "Fem" : "Masc"}</span>
          </button>

          {/* Leads Drawer Button */}
          <button
            id="open-leads-btn"
            onClick={onOpenLeads}
            title="Ver Leads e Contatos Registrados"
            className="relative p-1.5 sm:px-2.5 sm:py-1.5 rounded-lg text-xs font-medium bg-slate-50 hover:bg-slate-100 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-200 border border-slate-200 dark:border-slate-700 flex items-center gap-1.5 transition-colors"
          >
            <Users className="w-3.5 h-3.5 text-slate-600 dark:text-slate-300" />
            <span className="hidden md:inline">Leads</span>
            {leadsCount > 0 && (
              <span className="px-1.5 py-0.2 text-[10px] rounded-full bg-emerald-600 text-white font-bold">
                {leadsCount}
              </span>
            )}
          </button>

          {/* Company & Prompt Info */}
          <button
            id="open-info-btn"
            onClick={onOpenInfo}
            title="Diretrizes do Atendimento e Regras MapOS"
            className="p-1.5 rounded-lg text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-100 hover:bg-slate-100 dark:hover:bg-slate-800 border border-slate-200 dark:border-slate-700 transition-colors"
          >
            <Info className="w-4 h-4" />
          </button>

          {/* Reset Chat */}
          <button
            id="reset-chat-btn"
            onClick={onResetChat}
            title="Reiniciar conversa"
            className="p-1.5 rounded-lg text-slate-500 dark:text-slate-400 hover:text-slate-800 dark:hover:text-slate-100 hover:bg-slate-100 dark:hover:bg-slate-800 border border-slate-200 dark:border-slate-700 transition-colors"
          >
            <RefreshCw className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Top Quick Bar for Official Links */}
      <div className="bg-slate-50/80 dark:bg-slate-900/90 border-t border-slate-100 dark:border-slate-800 px-4 py-1.5 text-[11px] text-slate-600 dark:text-slate-300">
        <div className="max-w-5xl mx-auto flex items-center justify-between flex-wrap gap-2">
          <div className="flex items-center gap-3">
            <span className="font-semibold text-slate-700 dark:text-slate-200">MapOS Grupo Eloizio:</span>
            <span className="inline-flex items-center gap-1 text-emerald-700 dark:text-emerald-400">
              <Wrench className="w-3 h-3" />
              Mecânica Auto & Costura
            </span>
            <a
              href="https://wa.me/5521996134073"
              target="_blank"
              rel="noreferrer"
              className="inline-flex items-center gap-1 text-emerald-700 dark:text-emerald-400 hover:underline"
            >
              <Phone className="w-3 h-3" />
              (21) 99613-4073
            </a>
          </div>
          <div className="flex items-center gap-2 text-slate-500 dark:text-slate-400">
            <span>Criador: <strong className="text-slate-700 dark:text-slate-200">Eloizio (21 98764-8727)</strong></span>
            <span className="text-slate-300 dark:text-slate-700">•</span>
            <span>São Gonçalo / RJ</span>
          </div>
        </div>
      </div>
    </header>
  );
};
