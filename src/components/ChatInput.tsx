import React, { useState, useRef } from "react";
import {
  Send,
  Image as ImageIcon,
  Mic,
  Square,
  X,
  Sparkles,
  Wrench,
  Cpu,
  Package,
  Layers,
  Bot,
  AlertTriangle,
  FileText,
  Volume2,
  RefreshCw,
} from "lucide-react";
import { blobToBase64 } from "../utils/audio";

interface ChatInputProps {
  onSendMessage: (
    text: string,
    image?: { data: string; mimeType: string; previewUrl: string },
    audio?: { data: string; mimeType: string; duration?: number }
  ) => void;
  isLoading: boolean;
  isAdmin: boolean;
  onToggleAdmin: () => void;
}

export const ChatInput: React.FC<ChatInputProps> = ({
  onSendMessage,
  isLoading,
  isAdmin,
  onToggleAdmin,
}) => {
  const [inputText, setInputText] = useState("");
  const [attachedImage, setAttachedImage] = useState<{
    data: string;
    mimeType: string;
    previewUrl: string;
  } | null>(null);
  const [attachedAudio, setAttachedAudio] = useState<{
    data: string;
    mimeType: string;
    duration?: number;
  } | null>(null);

  const [isTranscribing, setIsTranscribing] = useState(false);

  // Recording states
  const [isRecording, setIsRecording] = useState(false);
  const [recordingSeconds, setRecordingSeconds] = useState(0);
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const audioChunksRef = useRef<Blob[]>([]);
  const timerIntervalRef = useRef<number | null>(null);

  // File input ref
  const fileInputRef = useRef<HTMLInputElement | null>(null);

  // Quick prompts MapOS Inteligente
  const quickPrompts = [
    {
      label: "Máquina de Costura (Cliente)",
      icon: Wrench,
      text: "Olá Camilla! Minha máquina de costura reta industrial está falhando o ponto e arrebentando a linha aqui em São Gonçalo. Pode me ajudar com o diagnóstico?",
    },
    {
      label: "Mecânica Automotiva (Cliente)",
      icon: Wrench,
      text: "Boa tarde Camilla! Meu Palio 1.4 Fire está com chiado agudo na correia e falhando na lenta. Vocês atendem na oficina ou na rua?",
    },
    {
      label: "Consultar OS-1008 (Técnico)",
      icon: Layers,
      text: "Camilla, qual o status atual da OS-1008 da Confecções Estrela do Mar e quais peças foram utilizadas?",
    },
    {
      label: "Consultar Peça (Estoque)",
      icon: Package,
      text: "Camilla, consulte no sistema se temos a peça PC-LAN-101 (Lançadeira Rotativa) em estoque e qual o valor de venda.",
    },
    {
      label: "Série SN-SIR-8842",
      icon: Cpu,
      text: "Camilla, puxe o histórico completo do equipamento com Número de Série SN-SIR-8842.",
    },
    {
      label: "Assinatura MAPOS-ELO-7821",
      icon: FileText,
      text: "Camilla, como está o status da minha assinatura MAPOS-ELO-7821 e quantos dias restam para o vencimento?",
    },
    {
      label: "Você é um robô?",
      icon: Bot,
      text: "Você é um robô?",
    },
    {
      label: "Problema Crítico (Escalonar)",
      icon: AlertTriangle,
      text: "Tenho uma situação jurídica e contábil emergencial de alto risco que precisa de intervenção humana imediata!",
    },
  ];

  // Handle Image Selection
  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!file.type.startsWith("image/")) {
      alert("Por favor selecione um arquivo de imagem válido.");
      return;
    }

    try {
      const base64 = await blobToBase64(file);
      const previewUrl = URL.createObjectURL(file);
      setAttachedImage({
        data: base64,
        mimeType: file.type,
        previewUrl,
      });
    } catch (err) {
      console.error("Erro ao carregar imagem:", err);
    } finally {
      if (fileInputRef.current) fileInputRef.current.value = "";
    }
  };

  // Sample Images for instant testing (Sewing machine defect and Mercado Pago receipt)
  const handleSelectSampleImage = (type: "machine" | "car") => {
    const canvas = document.createElement("canvas");
    canvas.width = 640;
    canvas.height = 480;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    if (type === "machine") {
      ctx.fillStyle = "#f8fafc";
      ctx.fillRect(0, 0, 640, 480);
      ctx.fillStyle = "#0f766e";
      ctx.fillRect(100, 160, 400, 60);
      ctx.fillRect(380, 100, 120, 240);
      ctx.fillRect(80, 320, 480, 40);
      ctx.fillStyle = "#e11d48";
      ctx.fillRect(160, 220, 8, 80);
      ctx.fillStyle = "#334155";
      ctx.font = "bold 20px sans-serif";
      ctx.fillText("Máquina de Costura Reta Industrial - Siruba L918-M1", 70, 80);
      ctx.font = "16px sans-serif";
      ctx.fillStyle = "#dc2626";
      ctx.fillText("Análise Visual MapOS: Ponta da lançadeira danificada / Barra desalinhada", 60, 420);
    } else {
      ctx.fillStyle = "#1e293b";
      ctx.fillRect(0, 0, 640, 480);
      ctx.fillStyle = "#475569";
      ctx.fillRect(140, 140, 360, 200);
      ctx.fillStyle = "#f59e0b";
      ctx.font = "bold 22px sans-serif";
      ctx.fillText("Motor Fiat Fire 1.4 - Diagnóstico Automotivo", 80, 80);
      ctx.fillStyle = "#e2e8f0";
      ctx.font = "16px sans-serif";
      ctx.fillText("Análise Visual MapOS: Correia dentada ressecada e com dentes gastos", 70, 410);
    }

    const dataUrl = canvas.toDataURL("image/png");
    const base64 = dataUrl.split(",")[1];
    setAttachedImage({
      data: base64,
      mimeType: "image/png",
      previewUrl: dataUrl,
    });
  };

  // Sample Sound simulation for machine noise testing
  const handleSelectSampleAudio = (defectType: string) => {
    const audioCtx = new (window.AudioContext || (window as any).webkitAudioContext)();
    const duration = 2.5;
    const sampleRate = audioCtx.sampleRate;
    const buffer = audioCtx.createBuffer(1, sampleRate * duration, sampleRate);
    const data = buffer.getChannelData(0);

    for (let i = 0; i < buffer.length; i++) {
      const t = i / sampleRate;
      const clank = Math.sin(2 * Math.PI * 180 * t) * Math.exp(-((t * 6) % 1) * 8);
      const motorHum = Math.sin(2 * Math.PI * 60 * t) * 0.2;
      const noise = (Math.random() * 2 - 1) * 0.15;
      data[i] = clank * 0.7 + motorHum + noise;
    }

    const wavBlob = audioBufferToWavBlob(buffer);
    blobToBase64(wavBlob).then((base64) => {
      setAttachedAudio({
        data: base64,
        mimeType: "audio/wav",
        duration: 3,
      });
      setInputText((prev) =>
        prev || `Camilla, ouça esse áudio com o barulho mecânico (${defectType}): está com ruído estranho e falhando no funcionamento!`
      );
    });
  };

  function audioBufferToWavBlob(buffer: AudioBuffer): Blob {
    const numOfChan = buffer.numberOfChannels;
    const length = buffer.length * numOfChan * 2 + 44;
    const out = new DataView(new ArrayBuffer(length));
    const channels: Float32Array[] = [];
    let sampleRate = buffer.sampleRate;
    let offset = 0;
    let pos = 0;

    function setUint16(data: number) {
      out.setUint16(pos, data, true);
      pos += 2;
    }
    function setUint32(data: number) {
      out.setUint32(pos, data, true);
      pos += 4;
    }

    setUint32(0x46464952);
    setUint32(length - 8);
    setUint32(0x45564157);
    setUint32(0x20746d66);
    setUint32(16);
    setUint16(1);
    setUint16(numOfChan);
    setUint32(sampleRate);
    setUint32(sampleRate * 2 * numOfChan);
    setUint16(numOfChan * 2);
    setUint16(16);
    setUint32(0x61746164);
    setUint32(length - pos - 4);

    for (let i = 0; i < buffer.numberOfChannels; i++) {
      channels.push(buffer.getChannelData(i));
    }

    while (pos < length) {
      for (let i = 0; i < numOfChan; i++) {
        let sample = Math.max(-1, Math.min(1, channels[i][offset]));
        sample = (0.5 + sample < 0 ? sample * 32768 : sample * 32767) | 0;
        out.setInt16(pos, sample, true);
        pos += 2;
      }
      offset++;
    }

    return new Blob([out], { type: "audio/wav" });
  }

  // Handle Real Microphone Recording
  const startRecording = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      audioChunksRef.current = [];

      const mimeType = MediaRecorder.isTypeSupported("audio/webm;codecs=opus")
        ? "audio/webm;codecs=opus"
        : MediaRecorder.isTypeSupported("audio/mp4")
        ? "audio/mp4"
        : "";

      const options = mimeType ? { mimeType } : undefined;
      const mediaRecorder = new MediaRecorder(stream, options);
      mediaRecorderRef.current = mediaRecorder;

      mediaRecorder.ondataavailable = (event) => {
        if (event.data.size > 0) {
          audioChunksRef.current.push(event.data);
        }
      };

      mediaRecorder.onstop = async () => {
        const audioBlob = new Blob(audioChunksRef.current, {
          type: mediaRecorder.mimeType || "audio/webm",
        });
        const base64 = await blobToBase64(audioBlob);
        setAttachedAudio({
          data: base64,
          mimeType: mediaRecorder.mimeType || "audio/webm",
          duration: recordingSeconds || 1,
        });
        stream.getTracks().forEach((track) => track.stop());
      };

      mediaRecorder.start(250);
      setIsRecording(true);
      setRecordingSeconds(0);

      timerIntervalRef.current = window.setInterval(() => {
        setRecordingSeconds((prev) => prev + 1);
      }, 1000);
    } catch (err: any) {
      console.error("Microphone access denied or error:", err);
      alert("Não foi possível acessar o microfone. Verifique as permissões de áudio do navegador.");
    }
  };

  const stopRecording = () => {
    if (mediaRecorderRef.current && isRecording) {
      mediaRecorderRef.current.stop();
      setIsRecording(false);
      if (timerIntervalRef.current) {
        clearInterval(timerIntervalRef.current);
        timerIntervalRef.current = null;
      }
    }
  };

  // Transcribe audio using backend Gemini API
  const handleTranscribeAudio = async () => {
    if (!attachedAudio) return;
    setIsTranscribing(true);
    try {
      const res = await fetch("/api/transcribe", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ audio: attachedAudio }),
      });
      const data = await res.json();
      if (data && data.text) {
        setInputText((prev) => (prev ? `${prev} ${data.text}` : data.text));
      }
    } catch (err) {
      console.error("Erro na transcrição:", err);
    } finally {
      setIsTranscribing(false);
    }
  };

  const handleSend = () => {
    if (isLoading) return;
    const trimmed = inputText.trim();
    if (!trimmed && !attachedImage && !attachedAudio) return;

    let finalMessage = trimmed;
    if (isAdmin && !finalMessage.startsWith("[ADMIN]")) {
      finalMessage = `[ADMIN] ${finalMessage}`;
    }

    onSendMessage(
      finalMessage,
      attachedImage || undefined,
      attachedAudio || undefined
    );

    setInputText("");
    setAttachedImage(null);
    setAttachedAudio(null);
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  return (
    <div className="bg-white dark:bg-slate-900 border-t border-slate-200 dark:border-slate-800 px-3 sm:px-4 py-2.5 transition-colors">
      <div className="max-w-5xl mx-auto space-y-2">
        {/* Quick Suggestion Pills */}
        <div className="flex items-center gap-1.5 overflow-x-auto pb-1 scrollbar-none text-xs">
          <span className="text-[11px] font-semibold text-slate-400 dark:text-slate-500 shrink-0 select-none mr-1">
            MapOS Rápido:
          </span>
          {quickPrompts.map((item, idx) => {
            const Icon = item.icon;
            return (
              <button
                key={idx}
                type="button"
                onClick={() => setInputText(item.text)}
                className="shrink-0 inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-slate-100 dark:bg-slate-800/90 hover:bg-emerald-50 dark:hover:bg-emerald-950/50 hover:text-emerald-700 dark:hover:text-emerald-300 text-slate-700 dark:text-slate-200 transition-colors border border-slate-200/80 dark:border-slate-700 whitespace-nowrap"
              >
                <Icon className="w-3 h-3 text-emerald-600 dark:text-emerald-400" />
                <span>{item.label}</span>
              </button>
            );
          })}
        </div>

        {/* Multimodal Quick Test Helpers */}
        <div className="flex items-center justify-between flex-wrap gap-2 text-[11px] text-slate-500 dark:text-slate-400 bg-slate-50 dark:bg-slate-900/60 px-2.5 py-1.5 rounded-lg border border-slate-200/60 dark:border-slate-800">
          <div className="flex items-center gap-2 flex-wrap">
            <span className="font-semibold text-slate-600 dark:text-slate-300">Multimídia Total:</span>
            <button
              type="button"
              onClick={() => handleSelectSampleImage("machine")}
              className="px-2 py-0.5 rounded bg-white dark:bg-slate-800 hover:bg-emerald-50 dark:hover:bg-emerald-950/60 text-slate-700 dark:text-slate-200 hover:text-emerald-700 dark:hover:text-emerald-300 border border-slate-200 dark:border-slate-700 transition-colors"
            >
              + Foto: Máquina de Costura (Defeito)
            </button>
            <button
              type="button"
              onClick={() => handleSelectSampleImage("car")}
              className="px-2 py-0.5 rounded bg-white dark:bg-slate-800 hover:bg-emerald-50 dark:hover:bg-emerald-950/60 text-slate-700 dark:text-slate-200 hover:text-emerald-700 dark:hover:text-emerald-300 border border-slate-200 dark:border-slate-700 transition-colors"
            >
              + Foto: Motor Automotivo (Defeito)
            </button>
            <button
              type="button"
              onClick={() => handleSelectSampleAudio("Motor estalando")}
              className="px-2 py-0.5 rounded bg-white dark:bg-slate-800 hover:bg-emerald-50 dark:hover:bg-emerald-950/60 text-slate-700 dark:text-slate-200 hover:text-emerald-700 dark:hover:text-emerald-300 border border-slate-200 dark:border-slate-700 transition-colors"
            >
              + Áudio: Ruído Mecânico
            </button>
          </div>

          <div className="flex items-center gap-1 text-[11px] text-slate-400 dark:text-slate-500">
            <span>Diagnóstico Visual & Auditivo por IA</span>
          </div>
        </div>

        {/* Attached previews (if any) */}
        {(attachedImage || attachedAudio) && (
          <div className="flex items-center gap-2 flex-wrap p-2 rounded-xl bg-emerald-50/80 dark:bg-emerald-950/40 border border-emerald-200 dark:border-emerald-800">
            {attachedImage && (
              <div className="relative inline-flex items-center gap-2 bg-white dark:bg-slate-800 px-2 py-1.5 rounded-lg border border-emerald-200 dark:border-emerald-800 text-xs">
                <img
                  src={attachedImage.previewUrl}
                  alt="Anexo"
                  className="w-8 h-8 rounded object-cover"
                />
                <span className="text-slate-700 dark:text-slate-200 font-medium">Foto Anexada</span>
                <button
                  type="button"
                  onClick={() => setAttachedImage(null)}
                  className="p-0.5 text-slate-400 hover:text-red-600 dark:hover:text-red-400"
                >
                  <X className="w-3.5 h-3.5" />
                </button>
              </div>
            )}

            {attachedAudio && (
              <div className="relative inline-flex items-center gap-2 bg-white dark:bg-slate-800 px-2.5 py-1.5 rounded-lg border border-emerald-200 dark:border-emerald-800 text-xs">
                <div className="w-8 h-8 rounded bg-emerald-600 text-white flex items-center justify-center">
                  <Mic className="w-4 h-4" />
                </div>
                <div>
                  <div className="text-slate-700 dark:text-slate-200 font-medium">Áudio Anexado</div>
                  <div className="text-[10px] text-slate-500 dark:text-slate-400">
                    {attachedAudio.duration} segundos
                  </div>
                </div>

                {/* Transcribe Button */}
                <button
                  type="button"
                  onClick={handleTranscribeAudio}
                  disabled={isTranscribing}
                  className="ml-2 px-2 py-1 rounded bg-emerald-100 dark:bg-emerald-900/60 hover:bg-emerald-200 text-emerald-800 dark:text-emerald-200 text-[11px] font-semibold flex items-center gap-1 transition-colors"
                  title="Transcrever áudio usando Gemini"
                >
                  <Volume2 className="w-3 h-3" />
                  <span>{isTranscribing ? "Transcrevendo..." : "Transcrever"}</span>
                </button>

                <button
                  type="button"
                  onClick={() => setAttachedAudio(null)}
                  className="p-0.5 text-slate-400 hover:text-red-600 dark:hover:text-red-400"
                >
                  <X className="w-3.5 h-3.5" />
                </button>
              </div>
            )}
          </div>
        )}

        {/* Main Input Box */}
        <div className="flex items-end gap-2">
          {/* File attachment hidden input */}
          <input
            ref={fileInputRef}
            type="file"
            accept="image/*"
            onChange={handleFileChange}
            className="hidden"
          />

          {/* Attachment buttons */}
          <div className="flex items-center gap-1 shrink-0 pb-1">
            <button
              type="button"
              onClick={() => fileInputRef.current?.click()}
              title="Anexar foto da máquina, peça ou defeito"
              className="p-2 rounded-xl text-slate-500 dark:text-slate-400 hover:text-emerald-700 dark:hover:text-emerald-300 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
            >
              <ImageIcon className="w-5 h-5" />
            </button>

            {/* Mic recording button */}
            {isRecording ? (
              <button
                type="button"
                onClick={stopRecording}
                title="Parar gravação de áudio"
                className="p-2 rounded-xl bg-red-500 text-white hover:bg-red-600 animate-pulse flex items-center gap-1 text-xs font-semibold px-2.5 transition-colors"
              >
                <Square className="w-4 h-4 fill-current" />
                <span>{recordingSeconds}s</span>
              </button>
            ) : (
              <button
                type="button"
                onClick={startRecording}
                title="Gravar áudio com microfone (Voz ou Ruído de Máquina)"
                className="p-2 rounded-xl text-slate-500 dark:text-slate-400 hover:text-emerald-700 dark:hover:text-emerald-300 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
              >
                <Mic className="w-5 h-5" />
              </button>
            )}
          </div>

          {/* Text Input Area */}
          <div className="relative flex-1">
            <textarea
              value={inputText}
              onChange={(e) => setInputText(e.target.value)}
              onKeyDown={handleKeyDown}
              placeholder={
                isAdmin
                  ? "Modo Eloizio [ADMIN]: digite um comando executivo, consulta técnica ou financeira..."
                  : "Converse com a Camilla (diagnóstico de máquinas, consulta de OS, peças, agendamentos)..."
              }
              rows={1}
              className={`w-full resize-none rounded-2xl px-4 py-2.5 text-sm outline-none transition-all border ${
                isAdmin
                  ? "border-amber-400 focus:border-amber-500 focus:ring-1 focus:ring-amber-500 bg-amber-50/30 dark:bg-amber-950/20"
                  : "border-slate-200 dark:border-slate-700 focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500 bg-white dark:bg-slate-800"
              } text-slate-800 dark:text-slate-100 placeholder-slate-400 max-h-32`}
            />
          </div>

          {/* Send Button */}
          <div className="pb-1 shrink-0">
            <button
              type="button"
              onClick={handleSend}
              disabled={isLoading || (!inputText.trim() && !attachedImage && !attachedAudio)}
              className={`p-2.5 rounded-2xl font-medium transition-all shadow-xs flex items-center justify-center ${
                isLoading || (!inputText.trim() && !attachedImage && !attachedAudio)
                  ? "bg-slate-200 dark:bg-slate-800 text-slate-400 dark:text-slate-600 cursor-not-allowed"
                  : isAdmin
                  ? "bg-amber-500 hover:bg-amber-600 text-white"
                  : "bg-emerald-600 hover:bg-emerald-700 text-white"
              }`}
            >
              {isLoading ? (
                <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
              ) : (
                <Send className="w-5 h-5" />
              )}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
