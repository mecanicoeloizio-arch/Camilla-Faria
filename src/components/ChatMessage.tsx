import React, { useState } from "react";
import {
  Volume2,
  VolumeX,
  Sparkles,
  ExternalLink,
  CheckCheck,
  AlertCircle,
  Play,
  Pause,
} from "lucide-react";
import { ChatMessage as IChatMessage } from "../types";
import { speakText, stopSpeaking } from "../utils/audio";

interface ChatMessageProps {
  message: IChatMessage;
  ttsVoice: "female" | "male";
  onImageClick?: (url: string) => void;
}

export const ChatMessage: React.FC<ChatMessageProps> = ({
  message,
  ttsVoice,
  onImageClick,
}) => {
  const isCamilla = message.sender === "camilla";
  const [isPlayingAudio, setIsPlayingAudio] = useState(false);
  const [isSpeakingTTS, setIsSpeakingTTS] = useState(false);

  const handleToggleTTS = () => {
    if (isSpeakingTTS) {
      stopSpeaking();
      setIsSpeakingTTS(false);
    } else {
      setIsSpeakingTTS(true);
      speakText(
        message.text,
        ttsVoice,
        () => setIsSpeakingTTS(true),
        () => setIsSpeakingTTS(false)
      );
    }
  };

  const handleToggleAudio = (audioBase64: string, mimeType: string) => {
    const audioEl = document.getElementById(
      `audio-player-${message.id}`
    ) as HTMLAudioElement;
    if (!audioEl) return;

    if (isPlayingAudio) {
      audioEl.pause();
      setIsPlayingAudio(false);
    } else {
      audioEl.play().catch(console.error);
      setIsPlayingAudio(true);
    }
  };

  // Check if text has admin escalation
  const hasAdminAlert = message.text.includes("[ALERTA_ADMIN]");
  const cleanText = message.text;

  return (
    <div
      className={`flex flex-col my-2 animate-slide-up-fade ${
        isCamilla ? "items-start" : "items-end"
      }`}
    >
      <div
        className={`flex items-end gap-2 max-w-[88%] sm:max-w-[78%] ${
          isCamilla ? "flex-row" : "flex-row-reverse"
        }`}
      >
        {/* Camilla Avatar */}
        {isCamilla && (
          <div className="w-8 h-8 rounded-full bg-gradient-to-br from-emerald-500 to-teal-700 flex items-center justify-center text-white text-xs font-bold shrink-0 mb-1 shadow-xs ring-1 ring-emerald-200">
            CF
          </div>
        )}

        {/* Bubble Box */}
        <div
          className={`rounded-2xl px-4 py-3 shadow-xs relative text-sm leading-relaxed transition-all ${
            isCamilla
              ? "bg-white dark:bg-slate-900 text-slate-800 dark:text-slate-100 border border-emerald-100 dark:border-slate-800 rounded-bl-xs"
              : "bg-emerald-600 text-white rounded-br-xs"
          }`}
        >
          {/* Admin tag badge if sent in admin mode */}
          {message.isAdminMessage && (
            <div className="flex items-center gap-1 text-[11px] font-semibold text-amber-700 dark:text-amber-300 bg-amber-50 dark:bg-amber-950/60 px-2 py-0.5 rounded border border-amber-200 dark:border-amber-800/80 mb-2 w-fit">
              <Sparkles className="w-3 h-3" />
              <span>Comando Executivo [ADMIN]</span>
            </div>
          )}

          {/* Attached Image Preview */}
          {message.image && (
            <div className="mb-2.5 overflow-hidden rounded-lg border border-slate-200/80 dark:border-slate-700 bg-slate-50 dark:bg-slate-800/80 cursor-pointer group">
              <img
                src={
                  message.image.previewUrl ||
                  `data:${message.image.mimeType};base64,${message.image.data}`
                }
                alt="Foto enviada para análise"
                referrerPolicy="no-referrer"
                onClick={() =>
                  onImageClick &&
                  onImageClick(
                    message.image?.previewUrl ||
                      `data:${message.image?.mimeType};base64,${message.image?.data}`
                  )
                }
                className="max-h-60 w-auto rounded-lg object-cover group-hover:opacity-95 transition-opacity"
              />
              <div className="p-1.5 text-[11px] text-slate-500 dark:text-slate-400 flex items-center justify-between">
                <span>Foto para análise técnica / comprovante</span>
                <span className="text-emerald-600 dark:text-emerald-400 font-medium group-hover:underline">
                  Ver foto
                </span>
              </div>
            </div>
          )}

          {/* Attached Audio Preview (Voice note or machine noise) */}
          {message.audio && (
            <div
              className={`mb-2.5 p-2.5 rounded-xl border flex items-center gap-3 ${
                isCamilla
                  ? "bg-slate-50 dark:bg-slate-800/90 border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-200"
                  : "bg-emerald-700/60 border-emerald-500/60 text-white"
              }`}
            >
              <button
                type="button"
                onClick={() =>
                  handleToggleAudio(
                    message.audio!.data,
                    message.audio!.mimeType
                  )
                }
                className={`w-9 h-9 rounded-full flex items-center justify-center shrink-0 transition-transform active:scale-95 ${
                  isCamilla
                    ? "bg-emerald-600 text-white hover:bg-emerald-700"
                    : "bg-white text-emerald-800 hover:bg-emerald-50"
                }`}
              >
                {isPlayingAudio ? (
                  <Pause className="w-4 h-4 fill-current" />
                ) : (
                  <Play className="w-4 h-4 fill-current ml-0.5" />
                )}
              </button>

              <div className="flex-1 min-w-0">
                <div className="flex items-center justify-between text-xs font-medium">
                  <span>Mensagem de Áudio / Som Gravado</span>
                  <span className="text-[11px] opacity-80">
                    {message.audio.duration ? `${message.audio.duration}s` : "Áudio"}
                  </span>
                </div>
                {/* Audio visualizer bar */}
                <div className="flex items-center gap-0.5 mt-1.5 h-3">
                  {[40, 75, 55, 90, 60, 85, 45, 95, 70, 50, 80, 65, 90, 45, 60].map(
                    (height, i) => (
                      <span
                        key={i}
                        className={`w-1 rounded-full transition-all ${
                          isPlayingAudio
                            ? "bg-emerald-400 animate-pulse"
                            : isCamilla
                            ? "bg-slate-300 dark:bg-slate-600"
                            : "bg-emerald-300/70"
                        }`}
                        style={{ height: `${height}%` }}
                      />
                    )
                  )}
                </div>
              </div>

              <audio
                id={`audio-player-${message.id}`}
                src={`data:${message.audio.mimeType};base64,${message.audio.data}`}
                onEnded={() => setIsPlayingAudio(false)}
                className="hidden"
              />
            </div>
          )}

          {/* Message Text with formatting */}
          <div className="whitespace-pre-wrap break-words">
            {hasAdminAlert ? (
              <div className="space-y-2">
                <p>
                  {cleanText.replace(/\[ALERTA_ADMIN\].*?(\n|$)/g, "").trim()}
                </p>
                <div className="mt-2 p-2.5 rounded-lg bg-amber-50 dark:bg-amber-950/60 border border-amber-300 dark:border-amber-800 text-amber-900 dark:text-amber-200 text-xs font-mono">
                  <div className="flex items-center gap-1.5 font-bold text-amber-800 dark:text-amber-300 mb-1">
                    <AlertCircle className="w-4 h-4" />
                    <span>ALERTA ADMINISTRATIVO INTERNO</span>
                  </div>
                  <p className="font-sans text-amber-950 dark:text-amber-100">
                    [ALERTA_ADMIN] Eloizio, o cliente precisa de ajuda com algo que foge da minha alçada. Por favor, assuma o atendimento.
                  </p>
                  <div className="mt-2 pt-1 border-t border-amber-200/80 dark:border-amber-800/80 flex items-center justify-between">
                    <span className="text-[11px] text-amber-700 dark:text-amber-400">WhatsApp Eloizio: 21 987648727</span>
                    <a
                      href={`https://wa.me/5521987648727?text=${encodeURIComponent(
                        "Olá Eloizio, assumindo atendimento escalado pela Camilla."
                      )}`}
                      target="_blank"
                      rel="noreferrer"
                      className="inline-flex items-center gap-1 text-[11px] font-bold text-emerald-700 dark:text-emerald-400 hover:underline"
                    >
                      <ExternalLink className="w-3 h-3" />
                      Acionar WhatsApp
                    </a>
                  </div>
                </div>
              </div>
            ) : (
              cleanText
            )}
          </div>

          {/* Footer of Bubble: Timestamp, TTS, Checks */}
          <div
            className={`flex items-center justify-end gap-2 mt-1.5 text-[10px] select-none ${
              isCamilla ? "text-slate-400 dark:text-slate-500" : "text-emerald-100"
            }`}
          >
            {/* Camilla Voice Readout */}
            {isCamilla && (
              <button
                type="button"
                onClick={handleToggleTTS}
                className="flex items-center gap-1 px-1.5 py-0.5 rounded text-emerald-700 dark:text-emerald-300 bg-emerald-50 dark:bg-emerald-950/70 hover:bg-emerald-100 dark:hover:bg-emerald-900/70 font-medium transition-colors"
                title={isSpeakingTTS ? "Pausar leitura de voz" : "Ouvir a Camilla falar"}
              >
                {isSpeakingTTS ? (
                  <>
                    <VolumeX className="w-3 h-3 text-emerald-700 dark:text-emerald-400 animate-pulse" />
                    <span>Silenciar</span>
                  </>
                ) : (
                  <>
                    <Volume2 className="w-3 h-3 text-emerald-700 dark:text-emerald-400" />
                    <span>Ouvir</span>
                  </>
                )}
              </button>
            )}

            <span>{message.timestamp}</span>

            {!isCamilla && (
              <CheckCheck className="w-3.5 h-3.5 text-emerald-200" />
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
