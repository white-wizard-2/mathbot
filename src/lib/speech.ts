type SpeakMode = "hint" | "praise";

type SpeakOptions = {
  mode?: SpeakMode;
};

const PAUSE_BETWEEN_LINES_MS = 420;
const PAUSE_BETWEEN_SENTENCES_MS = 260;

const PREFERRED_VOICE_NAMES =
  /samantha|karen|moira|fiona|allison|ava|zoe|nicky|tessa|jenny|zira|sara|daniel|victoria|serena|lee|fiona|kate|oliver|enhanced|premium|neural|natural/i;

let voicesReady: Promise<SpeechSynthesisVoice[]> | null = null;
let cachedVoice: SpeechSynthesisVoice | undefined;
let activeSession = 0;

function stripEmoji(text: string): string {
  return text.replace(/\p{Extended_Pictographic}/gu, "").replace(/\s+/g, " ").trim();
}

function scoreVoice(voice: SpeechSynthesisVoice): number {
  let score = 0;

  if (voice.localService) score += 12;
  if (PREFERRED_VOICE_NAMES.test(voice.name)) score += 40;
  if (/premium|enhanced|neural|natural/i.test(voice.name)) score += 24;
  if (voice.lang.startsWith("en-US")) score += 8;
  if (voice.lang.startsWith("en-GB")) score += 4;
  if (voice.lang.startsWith("en")) score += 2;
  if (voice.default) score -= 18;

  return score;
}

function pickVoice(voices: SpeechSynthesisVoice[]): SpeechSynthesisVoice | undefined {
  const englishVoices = voices.filter((voice) => voice.lang.startsWith("en"));
  if (englishVoices.length === 0) return undefined;

  return [...englishVoices].sort((a, b) => scoreVoice(b) - scoreVoice(a))[0];
}

function loadVoices(): Promise<SpeechSynthesisVoice[]> {
  if (!isSpeechSupported()) {
    return Promise.resolve([]);
  }

  const existing = window.speechSynthesis.getVoices();
  if (existing.length > 0) {
    return Promise.resolve(existing);
  }

  return new Promise((resolve) => {
    const finish = () => {
      window.speechSynthesis.onvoiceschanged = null;
      resolve(window.speechSynthesis.getVoices());
    };

    window.speechSynthesis.onvoiceschanged = finish;
    window.setTimeout(finish, 800);
  });
}

function ensureVoicesReady(): Promise<SpeechSynthesisVoice | undefined> {
  if (!isSpeechSupported()) {
    return Promise.resolve(undefined);
  }

  if (cachedVoice) {
    return Promise.resolve(cachedVoice);
  }

  if (!voicesReady) {
    voicesReady = loadVoices();
  }

  return voicesReady.then((voices) => {
    cachedVoice = pickVoice(voices);
    return cachedVoice;
  });
}

function splitForSpeech(text: string, mode: SpeakMode): string[] {
  const cleaned = stripEmoji(text);
  if (!cleaned) return [];

  if (mode === "praise") {
    return [cleaned];
  }

  const lines = cleaned
    .split(/\n+/)
    .map((line) => line.trim())
    .filter(Boolean);

  if (lines.length > 1) {
    return lines;
  }

  return cleaned
    .split(/(?<=[.!?])\s+/)
    .map((part) => part.trim())
    .filter(Boolean);
}

function prosodyForMode(mode: SpeakMode): { rate: number; pitch: number } {
  if (mode === "praise") {
    return { rate: 0.92, pitch: 1.18 };
  }

  return { rate: 0.8, pitch: 1.06 };
}

function delay(ms: number, session: number): Promise<void> {
  return new Promise((resolve) => {
    window.setTimeout(() => {
      if (session === activeSession) {
        resolve();
      }
    }, ms);
  });
}

function speakChunk(
  text: string,
  voice: SpeechSynthesisVoice | undefined,
  mode: SpeakMode,
  session: number,
): Promise<void> {
  return new Promise((resolve) => {
    if (session !== activeSession || !text) {
      resolve();
      return;
    }

    const { rate, pitch } = prosodyForMode(mode);
    const utterance = new SpeechSynthesisUtterance(text);
    utterance.rate = rate;
    utterance.pitch = pitch;
    utterance.volume = 1;

    if (voice) {
      utterance.voice = voice;
      utterance.lang = voice.lang;
    } else {
      utterance.lang = "en-US";
    }

    utterance.onend = () => resolve();
    utterance.onerror = () => resolve();
    window.speechSynthesis.speak(utterance);
  });
}

async function runSpeech(session: number, text: string, options: SpeakOptions): Promise<void> {
  const mode = options.mode ?? "hint";
  const voice = await ensureVoicesReady();
  if (session !== activeSession) return;

  const chunks = splitForSpeech(text, mode);
  if (chunks.length === 0) return;

  const pauseMs = mode === "praise" ? 0 : chunks.length > 1 ? PAUSE_BETWEEN_LINES_MS : PAUSE_BETWEEN_SENTENCES_MS;

  for (let index = 0; index < chunks.length; index += 1) {
    if (session !== activeSession) return;

    await speakChunk(chunks[index], voice, mode, session);
    if (session !== activeSession) return;

    if (index < chunks.length - 1 && pauseMs > 0) {
      await delay(pauseMs, session);
    }
  }
}

export function isSpeechSupported(): boolean {
  return "speechSynthesis" in window && "SpeechSynthesisUtterance" in window;
}

export function stopSpeech(): void {
  if (!isSpeechSupported()) return;
  activeSession += 1;
  window.speechSynthesis.cancel();
}

export function warmupSpeech(): void {
  void ensureVoicesReady();
}

export function speak(text: string, options: SpeakOptions = {}): void {
  if (!isSpeechSupported()) return;

  window.speechSynthesis.cancel();
  const session = ++activeSession;
  void runSpeech(session, text, options);
}
