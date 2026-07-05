function stripEmoji(text: string): string {
  return text.replace(/\p{Extended_Pictographic}/gu, "").replace(/\s+/g, " ").trim();
}

function pickVoice(): SpeechSynthesisVoice | undefined {
  const voices = window.speechSynthesis.getVoices();
  return (
    voices.find((voice) => voice.lang.startsWith("en") && /samantha|karen|moira|fiona/i.test(voice.name)) ??
    voices.find((voice) => voice.lang.startsWith("en-US")) ??
    voices.find((voice) => voice.lang.startsWith("en"))
  );
}

export function isSpeechSupported(): boolean {
  return "speechSynthesis" in window && "SpeechSynthesisUtterance" in window;
}

export function stopSpeech(): void {
  if (!isSpeechSupported()) return;
  window.speechSynthesis.cancel();
}

export function speak(text: string): void {
  if (!isSpeechSupported()) return;

  const cleaned = stripEmoji(text);
  if (!cleaned) return;

  stopSpeech();

  const utterance = new SpeechSynthesisUtterance(cleaned);
  utterance.rate = 0.88;
  utterance.pitch = 1.08;
  utterance.volume = 1;

  const voice = pickVoice();
  if (voice) {
    utterance.voice = voice;
    utterance.lang = voice.lang;
  } else {
    utterance.lang = "en-US";
  }

  window.speechSynthesis.speak(utterance);
}

if (typeof window !== "undefined" && isSpeechSupported()) {
  window.speechSynthesis.getVoices();
  window.speechSynthesis.onvoiceschanged = () => {
    window.speechSynthesis.getVoices();
  };
}
