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
- One emoji at the start is OK

Good examples:
"👆 Count each one!"
"🖐️ Use your fingers!"
"👀 Tap every picture!"`;

type HintContext = {
  gameLabel: string;
  scene: string;
  picked: number;
  correctAnswer: number;
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
      };
    case "add":
      return {
        gameLabel: "Add",
        scene: `${request.a} + ${request.b}`,
        picked: request.picked,
        correctAnswer,
      };
    case "subtract":
      return {
        gameLabel: "Subtract",
        scene: `${request.a} − ${request.b}`,
        picked: request.picked,
        correctAnswer,
      };
  }
}

function buildUserPrompt(context: HintContext): string {
  return `${context.gameLabel}. ${context.scene}. Wrong pick: ${context.picked}. Secret: ${context.correctAnswer}. One tiny hint, max 8 words.`;
}

function trimHint(text: string): string {
  const cleaned = text.replace(/^["']|["']$/g, "").trim();
  const firstChunk = cleaned.split(/[\n.!?]/)[0]?.trim() ?? cleaned;
  const words = firstChunk.split(/\s+/).filter(Boolean).slice(0, 8);
  return words.join(" ");
}

function scrubAnswerLeak(text: string, correctAnswer: number): string {
  const answerPattern = new RegExp(`\\b${correctAnswer}\\b`, "g");
  if (answerPattern.test(text)) {
    throw new Error("Hint leaked the correct answer");
  }
  return text;
}

export async function generateHint(request: HintRequest): Promise<string> {
  const context = buildContext(request);

  if (context.picked === context.correctAnswer) {
    throw new Error("Picked answer is already correct");
  }

  const message = await chatCompletion(
    [
      { role: "system", content: SYSTEM_PROMPT },
      { role: "user", content: buildUserPrompt(context) },
    ],
    { maxTokens: 24, temperature: 0.4 },
  );

  return scrubAnswerLeak(trimHint(message), context.correctAnswer);
}
