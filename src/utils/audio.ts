/**
 * Utility helpers for Audio (MediaRecorder, Base64 conversion, and Web Speech TTS)
 */

export async function blobToBase64(blob: Blob): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onloadend = () => {
      const result = reader.result as string;
      // Extract base64 portion after comma
      const base64 = result.split(",")[1];
      resolve(base64);
    };
    reader.onerror = reject;
    reader.readAsDataURL(blob);
  });
}

export function speakText(text: string, voiceType: "female" | "male" = "female", onStart?: () => void, onEnd?: () => void) {
  if (typeof window === "undefined" || !("speechSynthesis" in window)) {
    return;
  }

  // Cancel any ongoing speech
  window.speechSynthesis.cancel();

  // Strip internal tags like [ALERTA_ADMIN] or URLs for clean vocalization
  const cleanText = text
    .replace(/\[ALERTA_ADMIN\].*?(\n|$)/g, "")
    .replace(/https?:\/\/\S+/g, "link no chat")
    .trim();

  if (!cleanText) return;

  const utterance = new SpeechSynthesisUtterance(cleanText);
  utterance.lang = "pt-BR";
  utterance.rate = 1.05;
  utterance.pitch = voiceType === "female" ? 1.1 : 0.9;

  // Find pt-BR voice if available
  const voices = window.speechSynthesis.getVoices();
  
  let ptVoice;
  if (voiceType === "female") {
    ptVoice = voices.find((v) => v.lang.startsWith("pt") && (v.name.includes("Luciana") || v.name.includes("Fernanda") || v.name.includes("Francisca") || v.name.toLowerCase().includes("female") || v.name.includes("Google") || v.name.includes("Vitoria") || v.name.includes("Leticia")));
  } else {
    ptVoice = voices.find((v) => v.lang.startsWith("pt") && (v.name.includes("Thiago") || v.name.includes("Antonio") || v.name.includes("Daniel") || v.name.toLowerCase().includes("male")));
  }

  // Fallback to any pt-BR voice
  if (!ptVoice) {
    ptVoice = voices.find((v) => v.lang.startsWith("pt"));
  }

  if (ptVoice) {
    utterance.voice = ptVoice;
  }

  if (onStart) utterance.onstart = onStart;
  if (onEnd) {
    utterance.onend = onEnd;
    utterance.onerror = onEnd;
  }

  window.speechSynthesis.speak(utterance);
}

export function stopSpeaking() {
  if (typeof window !== "undefined" && "speechSynthesis" in window) {
    window.speechSynthesis.cancel();
  }
}
