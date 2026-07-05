import type { HintRequest } from "../src/types/hint.js";
import { chatCompletion } from "./omlx.js";

const SYSTEM_PROMPT = `You are MathBot, a friendly robot helping a 5-year-old with a math game.

Give ONE tiny hint when the child is wrong.

Rules:
- Maximum 8 words total
- Use very simple words only
- One short phrase, not a sentence
- Be warm and fun
- Tell HOW to try (count, fingers, dots, look)
- NEVER give the correct answer
- NEVER say any number that is the answer
- Do not use number words for the answer (like five, three)
- One emoji at the start is OK
- Base your hint on the GAME FACTS below (they are always correct)
- If a voice note is included, it is noisy baby speech and may be wrong — use it only as soft extra context, never as the main source

Good examples:
"👆 Count each one!"
"🖐️ Use your fingers!"
"👀 Tap every picture!"`;

const MAX_HINT_ATTEMPTS = 3;

type HintContext = {
  gameLabel: string;
  scene: string;
  picked: number;
  correctAnswer: number;
  spokenText?: string;
};

function getCorrectAnswer(request: HintRequest): number {
  switch (request.game) {
    case "count":
      return request.total;
    case "add":
      return request.a + request.b;
    case "subtract":
      return request.a - request.b;
  }
}

function buildContext(request: HintRequest): HintContext {
  const correctAnswer = getCorrectAnswer(request);

  switch (request.game) {
    case "count":
      return {
        gameLabel: "Count",
        scene: `${request.object} pictures on screen`,
        picked: request.picked,
        correctAnswer,
        spokenText: request.spokenText,
      };
    case "add":
      return {
        gameLabel: "Add",
        scene: `${request.a} + ${request.b}`,
        picked: request.picked,
        correctAnswer,
        spokenText: request.spokenText,
      };
    case "subtract":
      return {
        gameLabel: "Subtract",
        scene: `${request.a} − ${request.b}`,
        picked: request.picked,
        correctAnswer,
        spokenText: request.spokenText,
      };
  }
}

function buildUserPrompt(context: HintContext, attempt: number): string {
  const base = `${context.gameLabel}. ${context.scene}. Wrong pick: ${context.picked}. Secret: ${context.correctAnswer}. One tiny hint, max 8 words.`;

  const voice = context.spokenText
    ? `\nVoice note (noisy baby speech, reference only — may be wrong): "${context.spokenText}"\nStay grounded in the game facts above.`
    : "";

  const retry =
    attempt > 1 ? "\nDo not reveal the secret number or its word form." : "";

  return `${base}${voice}${retry}`;
}

function trimHint(text: string): string {
  const cleaned = text.replace(/^["']|["']$/g, "").trim();
  const firstChunk = cleaned.split(/[\n.!?]/)[0]?.trim() ?? cleaned;
  const words = firstChunk.split(/\s+/).filter(Boolean).slice(0, 8);
  return words.join(" ");
}

const NUMBER_WORDS: Record<number, string[]> = {
  0: ["zero"],
  1: ["one"],
  2: ["two"],
  3: ["three"],
  4: ["four"],
  5: ["five"],
  6: ["six"],
  7: ["seven"],
  8: ["eight"],
  9: ["nine"],
  10: ["ten"],
  11: ["eleven"],
  12: ["twelve"],
  13: ["thirteen"],
  14: ["fourteen"],
  15: ["fifteen"],
  16: ["sixteen"],
  17: ["seventeen"],
  18: ["eighteen"],
};

function scrubAnswerLeak(text: string, correctAnswer: number): string {
  const lower = text.toLowerCase();
  const digitPattern = new RegExp(`\\b${correctAnswer}\\b`);
  if (digitPattern.test(text)) {
    throw new Error("Hint leaked the correct answer");
  }

  for (const word of NUMBER_WORDS[correctAnswer] ?? []) {
    if (new RegExp(`\\b${word}\\b`, "i").test(lower)) {
      throw new Error("Hint leaked the correct answer");
    }
  }

  return text;
}

export async function generateHint(request: HintRequest): Promise<string> {
  const context = buildContext(request);

  if (context.picked === context.correctAnswer) {
    throw new Error("Picked answer is already correct");
  }

  let lastError: Error | null = null;

  for (let attempt = 1; attempt <= MAX_HINT_ATTEMPTS; attempt += 1) {
    try {
      const message = await chatCompletion(
        [
          { role: "system", content: SYSTEM_PROMPT },
          { role: "user", content: buildUserPrompt(context, attempt) },
        ],
        { maxTokens: 24, temperature: 0.4 },
      );

      return scrubAnswerLeak(trimHint(message), context.correctAnswer);
    } catch (error) {
      lastError = error instanceof Error ? error : new Error("Hint generation failed");
      if (!lastError.message.includes("leaked")) {
        throw lastError;
      }
    }
  }

  throw lastError ?? new Error("Hint generation failed");
}
