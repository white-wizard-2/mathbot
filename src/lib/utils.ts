import { AGE } from "./ageConfig";

export function randomInt(min: number, max: number): number {
  return Math.floor(Math.random() * (max - min + 1)) + min;
}

export function shuffle<T>(array: T[]): T[] {
  const copy = [...array];
  for (let i = copy.length - 1; i > 0; i -= 1) {
    const j = Math.floor(Math.random() * (i + 1));
    [copy[i], copy[j]] = [copy[j], copy[i]];
  }
  return copy;
}

export function pickRandom<T>(items: readonly T[]): T {
  return items[randomInt(0, items.length - 1)];
}

export function buildChoices(correct: number, min: number, max: number): number[] {
  const choices = new Set<number>([correct]);

  while (choices.size < 4) {
    const offset = randomInt(-3, 3);
    const candidate = correct + offset;
    if (candidate >= min && candidate <= max && candidate !== correct) {
      choices.add(candidate);
    } else {
      const fallback = randomInt(min, max);
      if (fallback !== correct) {
        choices.add(fallback);
      }
    }
  }

  return shuffle([...choices]);
}

export const COUNT_OBJECTS = ["🍎", "⭐", "🐸", "🌸", "🎈", "🦋", "🍪", "🐠"] as const;

export const PRAISE = [
  "Yay!",
  "You did it!",
  "Great job!",
  "Super!",
  "Nice one!",
  "Woohoo!",
  "Star!",
] as const;

export function createCountRound() {
  const count = randomInt(1, AGE.maxCount);
  const object = pickRandom(COUNT_OBJECTS);
  const choices = buildChoices(count, AGE.choiceMin, AGE.choiceMax);
  return { object, count, choices };
}

export function createAddRound() {
  const answer = randomInt(2, AGE.maxAddTotal);
  const a = randomInt(1, answer - 1);
  const b = answer - a;
  const choices = buildChoices(answer, AGE.choiceMin, AGE.choiceMax);
  return { a, b, answer, choices, emoji: pickRandom(COUNT_OBJECTS) };
}

export function createSubtractRound() {
  const a = randomInt(2, AGE.maxSubtractStart);
  const b = randomInt(1, Math.min(a - 1, AGE.maxSubtractTake));
  const answer = a - b;
  const choices = buildChoices(answer, AGE.choiceMin, AGE.choiceMax);
  return { a, b, answer, choices, emoji: pickRandom(COUNT_OBJECTS) };
}

const MULTIPLY_ROUNDS = [
  { groups: 2, each: 2, answer: 4 },
  { groups: 2, each: 3, answer: 6 },
  { groups: 3, each: 2, answer: 6 },
] as const;

const DIVIDE_ROUNDS = [
  { total: 4, groups: 2, answer: 2 },
  { total: 6, groups: 2, answer: 3 },
  { total: 6, groups: 3, answer: 2 },
] as const;

export function createMultiplyRound() {
  const base = pickRandom(MULTIPLY_ROUNDS);
  const choices = buildChoices(base.answer, AGE.choiceMin, AGE.choiceMax);
  return { ...base, choices, emoji: pickRandom(COUNT_OBJECTS) };
}

export function createDivideRound() {
  const base = pickRandom(DIVIDE_ROUNDS);
  const choices = buildChoices(base.answer, AGE.choiceMin, AGE.choiceMax);
  return { ...base, choices, emoji: pickRandom(COUNT_OBJECTS) };
}
