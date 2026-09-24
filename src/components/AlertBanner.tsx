import React from "react";
import { AlertTriangle, ExternalLink, X } from "lucide-react";
import { AdminAlert } from "../types";

interface AlertBannerProps {
  alert: AdminAlert;
  onDismiss: (id: string) => void;
}

export const AlertBanner: React.FC<AlertBannerProps> = ({ alert, onDismiss }) => {
  const eloizioWaUrl = `https://wa.me/5521987648727?text=${encodeURIComponent(
    `Olá Eloizio, a Camilla gerou um alerta no sistema de atendimento:\n"${alert.message}"\nContexto: ${alert.clientContext || "Atendimento ao cliente"}`
  )}`;

  return (
    <div className="bg-amber-50 dark:bg-amber-950/70 border-b border-amber-200 dark:border-amber-800 px-4 py-3 text-amber-900 dark:text-amber-200 transition-colors">
      <div className="max-w-5xl mx-auto flex items-start sm:items-center justify-between gap-3">
        <div className="flex items-start gap-2.5">
          <AlertTriangle className="w-5 h-5 text-amber-600 dark:text-amber-400 shrink-0 mt-0.5 sm:mt-0" />
          <div className="text-xs sm:text-sm">
            <span className="font-semibold text-amber-950 dark:text-amber-100">
              Escalonamento Administrativo Ativado:
            </span>{" "}
            <span className="font-mono text-[12px] bg-amber-100/80 dark:bg-amber-900/60 px-1 py-0.5 rounded border border-amber-300/60 dark:border-amber-700/60">
              [ALERTA_ADMIN]
            </span>{" "}
            Eloizio foi notificado para assumir este atendimento crítico.
          </div>
        </div>

        <div className="flex items-center gap-2 shrink-0">
          <a
            id="whatsapp-eloizio-btn"
            href={eloizioWaUrl}
            target="_blank"
            rel="noreferrer"
            className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-semibold shadow-xs transition-colors"
          >
            <ExternalLink className="w-3.5 h-3.5" />
            <span>Falar com Eloizio (CEO)</span>
          </a>
          <button
            onClick={() => onDismiss(alert.id)}
            className="p-1 rounded text-amber-700 dark:text-amber-400 hover:text-amber-900 dark:hover:text-amber-200 hover:bg-amber-100 dark:hover:bg-amber-900/40 transition-colors"
            title="Fechar aviso"
          >
            <X className="w-4 h-4" />
          </button>
        </div>
      </div>
    </div>
  );
};
