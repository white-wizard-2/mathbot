import type { HintRequest } from "../src/types/hint.js";
import { chatCompletion } from "./omlx.js";

const SYSTEM_PROMPT = `You are MathBot, a warm friend helping a 2–3 year old with a math game on a tablet.

The child picked a wrong answer. Use very simple words — like talking to a toddler.

Write 3 tiny lines (max 6 words each):

Line 1 — What to do (tap pictures, count).
Line 2 — Their wrong pick is not right.
Line 3 — Try again on the screen.

Repeat mistake: repeat line 1 idea, say wrong again, try again.

Rules:
- Max 6 words per line
- Very simple words only
- NEVER say the secret correct answer
- NEVER say any number equal to the secret answer
- No number words for the secret answer
- One emoji on line 1 only
- You MAY say wrong pick and question numbers (1, 2, 3)
- NEVER fingers, hands, toes, or mental math
- Base everything on GAME FACTS`;

const MAX_HINT_ATTEMPTS = 3;
const MAX_HINT_WORDS = 24;

type HintContext = {
  gameLabel: string;
  explainSetup: string;
  tryGuidance: string;
  picked: number;
  correctAnswer: number;
  previousHint?: string;
  isRepeatMistake: boolean;
  wrongAttempts: number[];
};

const FINGER_PATTERN = /\b(finger|fingers|hand|hands|toe|toes)\b/i;

function buildTryGuidance(request: HintRequest): string {
  switch (request.game) {
    case "count":
      return `ALLOWED TRY for line 3 (pick one):
- Tap each picture on the screen and say a number for each tap.
- Count the pictures out loud as you tap them one by one.`;
    case "add":
      return `ALLOWED TRY for line 3 (pick one):
- Tap each picture in the first group and count them.
- Then tap each picture in the second group and keep counting.
- Tap the pictures on the screen one at a time.`;
    case "subtract":
      return `ALLOWED TRY for line 3 (pick one):
- Tap pictures to take some away, then tap what is left and count.
- Tap the ones to take away first, then count the rest on the screen.`;
    case "multiply":
      return `ALLOWED TRY for line 3 (pick one):
- Tap each group of pictures on the screen.
- Count all the pictures together.`;
    case "divide":
      return `ALLOWED TRY for line 3 (pick one):
- Tap one equal group and count the pictures in it.
- Look at the groups on the screen and count one group.`;
  }
}

function getCorrectAnswer(request: HintRequest): number {
  switch (request.game) {
    case "count":
      return request.total;
    case "add":
      return request.a + request.b;
    case "subtract":
      return request.a - request.b;
    case "multiply":
      return request.groups * request.each;
    case "divide":
      return request.total / request.groups;
  }
}

function buildContext(request: HintRequest): HintContext {
  const correctAnswer = getCorrectAnswer(request);

  switch (request.game) {
    case "count":
      return {
        gameLabel: "Count",
        explainSetup: `The child sees ${request.object} pictures on the screen and must count how many there are.`,
        tryGuidance: buildTryGuidance(request),
        picked: request.picked,
        correctAnswer,
        previousHint: request.previousHint,
        isRepeatMistake: request.isRepeatMistake ?? false,
        wrongAttempts: request.wrongAttempts ?? [request.picked],
      };
    case "add":
      return {
        gameLabel: "Add",
        explainSetup: `The question is ${request.a} + ${request.b}. That means ${request.a} things and ${request.b} more things put together. Pictures appear on the screen to tap and count.`,
        tryGuidance: buildTryGuidance(request),
        picked: request.picked,
        correctAnswer,
        previousHint: request.previousHint,
        isRepeatMistake: request.isRepeatMistake ?? false,
        wrongAttempts: request.wrongAttempts ?? [request.picked],
      };
    case "subtract":
      return {
        gameLabel: "Subtract",
        explainSetup: `The question is ${request.a} − ${request.b}. That means start with ${request.a} things and take ${request.b} away. Pictures appear on the screen to tap.`,
        tryGuidance: buildTryGuidance(request),
        picked: request.picked,
        correctAnswer,
        previousHint: request.previousHint,
        isRepeatMistake: request.isRepeatMistake ?? false,
        wrongAttempts: request.wrongAttempts ?? [request.picked],
      };
    case "multiply":
      return {
        gameLabel: "Multiply",
        explainSetup: `The question is ${request.groups} × ${request.each}. That means ${request.groups} equal groups with ${request.each} things in each group. Pictures appear on the screen to tap and count all.`,
        tryGuidance: buildTryGuidance(request),
        picked: request.picked,
        correctAnswer,
        previousHint: request.previousHint,
        isRepeatMistake: request.isRepeatMistake ?? false,
        wrongAttempts: request.wrongAttempts ?? [request.picked],
      };
    case "divide":
      return {
        gameLabel: "Divide",
        explainSetup: `The question is ${request.total} ÷ ${request.groups}. That means ${request.total} things shared equally into ${request.groups} groups. The child must find how many are in each group. Pictures appear on the screen.`,
        tryGuidance: buildTryGuidance(request),
        picked: request.picked,
        correctAnswer,
        previousHint: request.previousHint,
        isRepeatMistake: request.isRepeatMistake ?? false,
        wrongAttempts: request.wrongAttempts ?? [request.picked],
      };
  }
}

function buildUserPrompt(context: HintContext, attempt: number): string {
  const attempts = context.wrongAttempts.join(", ");

  let base = `${context.gameLabel} game.
${context.explainSetup}
Wrong picks so far on this question: ${attempts}
Latest wrong pick: ${context.picked}
Secret answer (NEVER say this): ${context.correctAnswer}`;

  if (context.isRepeatMistake && context.previousHint) {
    base += `\n\nThis is a REPEAT mistake — the child picked ${context.picked} again.
Previous help to repeat in line 1:
"${context.previousHint}"`;
  }

  base += context.isRepeatMistake
    ? "\n\nWrite 3 lines: Repeat previous help, explain why that number is still wrong, then what to try."
    : "\n\nWrite 3 lines: Explain the question, explain why their pick is wrong, then what to try.";

  base += `\n\n${context.tryGuidance}\nNever suggest fingers, hands, or toes.`;

  const retry =
    attempt > 1
      ? "\nDo not reveal the secret number or its word form. Do not suggest fingers, hands, or toes — only tapping pictures on the screen."
      : "";

  return `${base}${retry}`;
}

function trimHint(text: string, lineCount: number): string {
  const cleaned = text.replace(/^["']|["']$/g, "").trim();
  const lines = cleaned
    .split(/\n+/)
    .map((line) => line.trim())
    .filter(Boolean)
    .slice(0, lineCount);

  if (lines.length >= 2) {
    const perLine = Math.floor(MAX_HINT_WORDS / lines.length);
    return lines.map((line) => line.split(/\s+/).slice(0, perLine).join(" ")).join("\n");
  }

  const sentences = cleaned.match(/[^.!?]+[.!?]?/g)?.map((s) => s.trim()).filter(Boolean) ?? [cleaned];
  return sentences
    .slice(0, lineCount)
    .join(" ")
    .split(/\s+/)
    .slice(0, MAX_HINT_WORDS)
    .join(" ");
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

function rejectUnrealisticAdvice(text: string): string {
  if (FINGER_PATTERN.test(text)) {
    throw new Error("Hint suggested unrealistic finger counting");
  }

  return text;
}

export async function generateHint(request: HintRequest): Promise<string> {
  const context = buildContext(request);

  if (context.picked === context.correctAnswer) {
    throw new Error("Picked answer is already correct");
  }

  const lineCount = context.isRepeatMistake && context.previousHint ? 3 : 3;
  let lastError: Error | null = null;

  for (let attempt = 1; attempt <= MAX_HINT_ATTEMPTS; attempt += 1) {
    try {
      const message = await chatCompletion(
        [
          { role: "system", content: SYSTEM_PROMPT },
          { role: "user", content: buildUserPrompt(context, attempt) },
        ],
        { maxTokens: 72, temperature: 0.35 },
      );

      return rejectUnrealisticAdvice(
        scrubAnswerLeak(trimHint(message, lineCount), context.correctAnswer),
      );
    } catch (error) {
      lastError = error instanceof Error ? error : new Error("Hint generation failed");
      if (!lastError.message.includes("leaked") && !lastError.message.includes("unrealistic")) {
        throw lastError;
      }
    }
  }

  throw lastError ?? new Error("Hint generation failed");
}
