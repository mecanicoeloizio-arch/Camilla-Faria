import React, { useState } from "react";
import {
  X,
  UserPlus,
  Mail,
  Phone,
  Calendar,
  Search,
  Download,
  ExternalLink,
  Users,
} from "lucide-react";
import { Lead } from "../types";

interface LeadsDrawerProps {
  isOpen: boolean;
  onClose: () => void;
  leads: Lead[];
  onAddLead: (lead: Omit<Lead, "id" | "createdAt">) => void;
}

export const LeadsDrawer: React.FC<LeadsDrawerProps> = ({
  isOpen,
  onClose,
  leads,
  onAddLead,
}) => {
  const [searchTerm, setSearchTerm] = useState("");
  const [showAddForm, setShowAddForm] = useState(false);
  const [newName, setNewName] = useState("");
  const [newEmail, setNewEmail] = useState("");
  const [newPhone, setNewPhone] = useState("");
  const [newInterest, setNewInterest] = useState("Máquinas de Costura");

  if (!isOpen) return null;

  const filteredLeads = leads.filter(
    (l) =>
      l.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      l.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (l.phone && l.phone.includes(searchTerm)) ||
      (l.interest && l.interest.toLowerCase().includes(searchTerm.toLowerCase()))
  );

  const handleCreateLead = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newName.trim() && !newEmail.trim()) return;
    onAddLead({
      name: newName.trim() || "Cliente",
      email: newEmail.trim(),
      phone: newPhone.trim(),
      interest: newInterest,
      notes: "Registrado via painel administrativo",
    });
    setNewName("");
    setNewEmail("");
    setNewPhone("");
    setShowAddForm(false);
  };

  const exportCSV = () => {
    if (leads.length === 0) return;
    const headers = "Nome,Email,Telefone,Interesse,Data\n";
    const rows = leads
      .map(
        (l) =>
          `"${l.name}","${l.email}","${l.phone || ""}","${l.interest || ""}","${l.createdAt}"`
      )
      .join("\n");
    const blob = new Blob([headers + rows], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = `leads_grupo_eloizio_${new Date().toISOString().slice(0, 10)}.csv`;
    link.click();
  };

  return (
    <div className="fixed inset-0 z-50 overflow-hidden bg-slate-900/50 backdrop-blur-xs flex justify-end">
      <div className="w-full max-w-md bg-white dark:bg-slate-900 h-full shadow-2xl flex flex-col border-l border-slate-200 dark:border-slate-800 animate-in slide-in-from-right duration-200 transition-colors">
        {/* Header */}
        <div className="px-5 py-4 border-b border-slate-200 dark:border-slate-800 flex items-center justify-between bg-slate-50 dark:bg-slate-850">
          <div className="flex items-center gap-2">
            <Users className="w-5 h-5 text-emerald-600 dark:text-emerald-400" />
            <div>
              <h2 className="text-base font-bold text-slate-800 dark:text-slate-100">
                Leads & Contatos Captados
              </h2>
              <p className="text-xs text-slate-500 dark:text-slate-400">
                {leads.length} registro(s) no sistema
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-slate-400 hover:text-slate-700 dark:hover:text-slate-200 hover:bg-slate-200/60 dark:hover:bg-slate-800 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Action bar: Search + Add */}
        <div className="p-4 border-b border-slate-100 dark:border-slate-800 space-y-3">
          <div className="relative">
            <Search className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
            <input
              type="text"
              placeholder="Buscar por nome, e-mail ou serviço..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-9 pr-3 py-2 text-xs rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-800 dark:text-slate-100 placeholder-slate-400 dark:placeholder-slate-500 focus:outline-none focus:border-emerald-500"
            />
          </div>

          <div className="flex items-center justify-between gap-2">
            <button
              onClick={() => setShowAddForm(!showAddForm)}
              className="inline-flex items-center gap-1.5 text-xs font-semibold px-3 py-1.5 rounded-lg bg-emerald-50 dark:bg-emerald-950/60 text-emerald-700 dark:text-emerald-300 hover:bg-emerald-100 dark:hover:bg-emerald-900/60 border border-emerald-200 dark:border-emerald-800/80 transition-colors"
            >
              <UserPlus className="w-3.5 h-3.5" />
              <span>{showAddForm ? "Fechar formulário" : "Novo Lead Manual"}</span>
            </button>

            {leads.length > 0 && (
              <button
                onClick={exportCSV}
                className="inline-flex items-center gap-1 text-xs text-slate-600 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white px-2 py-1 rounded hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
              >
                <Download className="w-3.5 h-3.5" />
                <span>Exportar CSV</span>
              </button>
            )}
          </div>

          {/* Quick form */}
          {showAddForm && (
            <form
              onSubmit={handleCreateLead}
              className="p-3 bg-slate-50 dark:bg-slate-800/80 rounded-xl border border-slate-200 dark:border-slate-700 space-y-2 text-xs"
            >
              <input
                type="text"
                placeholder="Nome do cliente *"
                value={newName}
                onChange={(e) => setNewName(e.target.value)}
                className="w-full px-2.5 py-1.5 rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-800 dark:text-slate-100"
                required
              />
              <input
                type="email"
                placeholder="E-mail *"
                value={newEmail}
                onChange={(e) => setNewEmail(e.target.value)}
                className="w-full px-2.5 py-1.5 rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-800 dark:text-slate-100"
                required
              />
              <input
                type="tel"
                placeholder="WhatsApp / Telefone"
                value={newPhone}
                onChange={(e) => setNewPhone(e.target.value)}
                className="w-full px-2.5 py-1.5 rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-800 dark:text-slate-100"
              />
              <select
                value={newInterest}
                onChange={(e) => setNewInterest(e.target.value)}
                className="w-full px-2.5 py-1.5 rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-800 dark:text-slate-100"
              >
                <option value="Máquinas de Costura">Máquinas de Costura (São Gonçalo)</option>
                <option value="Elo Contábil Digital">Elo Contábil Digital (100% Online)</option>
                <option value="Cursos Livres">Cursos Livres (100% Online)</option>
                <option value="Outro">Outro</option>
              </select>
              <button
                type="submit"
                className="w-full py-2 bg-emerald-600 hover:bg-emerald-700 text-white font-semibold rounded-lg shadow-xs"
              >
                Salvar Lead
              </button>
            </form>
          )}
        </div>

        {/* Leads List */}
        <div className="flex-1 overflow-y-auto p-4 space-y-3">
          {filteredLeads.length === 0 ? (
            <div className="text-center py-12 px-4 text-slate-400 dark:text-slate-500">
              <Users className="w-10 h-10 mx-auto mb-2 opacity-40 text-emerald-600 dark:text-emerald-400" />
              <p className="text-sm font-medium text-slate-600 dark:text-slate-300">
                Nenhum lead captado ainda
              </p>
              <p className="text-xs text-slate-400 dark:text-slate-500 mt-1 max-w-xs mx-auto">
                Conforme os clientes informam seus dados na conversa com a Camilla, os registros aparecerão aqui automaticamente.
              </p>
            </div>
          ) : (
            filteredLeads.map((lead) => (
              <div
                key={lead.id}
                className="p-3 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-800/80 shadow-xs hover:border-emerald-300 dark:hover:border-emerald-700 transition-colors"
              >
                <div className="flex items-start justify-between gap-2 mb-1.5">
                  <h3 className="font-semibold text-slate-800 dark:text-slate-100 text-sm">
                    {lead.name}
                  </h3>
                  <span className="px-2 py-0.5 rounded-full text-[10px] font-medium bg-emerald-50 dark:bg-emerald-950/70 text-emerald-700 dark:text-emerald-300 border border-emerald-100 dark:border-emerald-800">
                    {lead.interest || "Geral"}
                  </span>
                </div>

                <div className="space-y-1 text-xs text-slate-600 dark:text-slate-300">
                  <div className="flex items-center gap-1.5">
                    <Mail className="w-3.5 h-3.5 text-slate-400 dark:text-slate-500" />
                    <a
                      href={`mailto:${lead.email}`}
                      className="hover:underline text-emerald-700 dark:text-emerald-400"
                    >
                      {lead.email}
                    </a>
                  </div>

                  {lead.phone && (
                    <div className="flex items-center gap-1.5">
                      <Phone className="w-3.5 h-3.5 text-slate-400 dark:text-slate-500" />
                      <a
                        href={`https://wa.me/55${lead.phone.replace(/\D/g, "")}`}
                        target="_blank"
                        rel="noreferrer"
                        className="hover:underline text-emerald-700 dark:text-emerald-400 inline-flex items-center gap-1"
                      >
                        {lead.phone}
                        <ExternalLink className="w-3 h-3 text-slate-400 dark:text-slate-500" />
                      </a>
                    </div>
                  )}

                  <div className="flex items-center gap-1.5 text-[11px] text-slate-400 dark:text-slate-500 pt-1">
                    <Calendar className="w-3 h-3" />
                    <span>{lead.createdAt}</span>
                  </div>
                </div>

                {lead.notes && (
                  <div className="mt-2 text-[11px] text-slate-500 dark:text-slate-400 bg-slate-50 dark:bg-slate-850 p-2 rounded-lg border border-slate-100 dark:border-slate-800 italic">
                    "{lead.notes}"
                  </div>
                )}
              </div>
            ))
          )}
        </div>

        {/* Footer info */}
        <div className="p-3 border-t border-slate-100 dark:border-slate-800 bg-slate-50 dark:bg-slate-850 text-[11px] text-slate-500 dark:text-slate-400 text-center">
          Grupo Eloizio • WhatsApp Oficial: (21) 99613-4073
        </div>
      </div>
    </div>
  );
};
