import GameCard from "../components/GameCard";
import { AGE_LABEL } from "../lib/ageConfig";

const GAMES = [
  {
    title: "Count",
    description: "Tap each one. How many?",
    emoji: "🔢",
    color: "grass" as const,
    path: "/count",
  },
  {
    title: "Add",
    description: "Put groups together. How many?",
    emoji: "➕",
    color: "sunshine" as const,
    path: "/add",
  },
  {
    title: "Take away",
    description: "Some go away. How many left?",
    emoji: "➖",
    color: "coral" as const,
    path: "/subtract",
  },
  {
    title: "Groups",
    description: "Groups of things. How many?",
    emoji: "✖️",
    color: "lavender" as const,
    path: "/multiply",
  },
  {
    title: "Share",
    description: "Split equally. How many each?",
    emoji: "➗",
    color: "sky" as const,
    path: "/divide",
  },
];

export default function HomePage() {
  return (
    <div>
      <section className="mb-10 text-center">
        <div className="animate-bounce-in mx-auto mb-4 inline-block text-7xl md:text-8xl">
          🎮
        </div>
        <h1 className="animate-bounce-in text-4xl font-bold text-ink md:text-5xl">
          Pick a game!
        </h1>
        <p
          className="animate-bounce-in mx-auto mt-4 max-w-xl text-lg font-medium text-ink/70 md:text-xl"
          style={{ animationDelay: "100ms", opacity: 0 }}
        >
          Tap and count together — made for little ones ({AGE_LABEL}).
        </p>
      </section>

      <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
        {GAMES.map((game, index) => (
          <GameCard key={game.path} {...game} delay={150 + index * 100} />
        ))}
      </div>

      <section className="mt-12 rounded-3xl border-4 border-sky-deep/30 bg-white/70 p-6 text-center backdrop-blur-sm md:p-8">
        <h2 className="text-2xl font-bold text-sky-deep">How to play</h2>
        <p className="mt-2 text-sm font-medium text-ink/60">
          Sit together and tap each picture out loud.
        </p>
        <div className="mt-6 grid gap-4 text-left sm:grid-cols-3">
          <div className="rounded-2xl bg-grass/15 p-4">
            <span className="text-3xl">👀</span>
            <p className="mt-2 font-semibold text-grass-dark">Look</p>
            <p className="text-sm text-ink/70">See the pictures on screen</p>
          </div>
          <div className="rounded-2xl bg-sunshine/15 p-4">
            <span className="text-3xl">👆</span>
            <p className="mt-2 font-semibold text-sunshine-dark">Tap</p>
            <p className="text-sm text-ink/70">Tap each one and count out loud</p>
          </div>
          <div className="rounded-2xl bg-coral/15 p-4">
            <span className="text-3xl">🎉</span>
            <p className="mt-2 font-semibold text-coral-dark">Pick</p>
            <p className="text-sm text-ink/70">Tap the number you counted</p>
          </div>
        </div>
      </section>
    </div>
  );
}
