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
  "Amazing!",
  "You got it!",
  "Super star!",
  "Way to go!",
  "Fantastic!",
  "Brilliant!",
  "Awesome job!",
] as const;

export const ENCOURAGE = [
  "Nice try! Let's go again!",
  "Almost! You can do it!",
  "Keep going, you've got this!",
  "Good effort! Try the next one!",
] as const;
