import GameCard from "../components/GameCard";

const GAMES = [
  {
    title: "Count",
    description: "Count the cute objects and pick the right number!",
    emoji: "🔢",
    color: "grass" as const,
    path: "/count",
  },
  {
    title: "Add",
    description: "Put numbers together and find the sum!",
    emoji: "➕",
    color: "sunshine" as const,
    path: "/add",
  },
  {
    title: "Subtract",
    description: "Take some away and see what's left!",
    emoji: "➖",
    color: "coral" as const,
    path: "/subtract",
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
          Pick a Game!
        </h1>
        <p
          className="animate-bounce-in mx-auto mt-4 max-w-xl text-lg font-medium text-ink/70 md:text-xl"
          style={{ animationDelay: "100ms", opacity: 0 }}
        >
          Learn math the fun way — count, add, and subtract with friendly games
          made just for you!
        </p>
      </section>

      <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
        {GAMES.map((game, index) => (
          <GameCard key={game.path} {...game} delay={150 + index * 100} />
        ))}
      </div>

      <section className="mt-12 rounded-3xl border-4 border-sky-deep/30 bg-white/70 p-6 text-center backdrop-blur-sm md:p-8">
        <h2 className="text-2xl font-bold text-sky-deep">How to Play</h2>
        <div className="mt-6 grid gap-4 text-left sm:grid-cols-3">
          <div className="rounded-2xl bg-grass/15 p-4">
            <span className="text-3xl">👀</span>
            <p className="mt-2 font-semibold text-grass-dark">Look</p>
            <p className="text-sm text-ink/70">See the objects or numbers on screen</p>
          </div>
          <div className="rounded-2xl bg-sunshine/15 p-4">
            <span className="text-3xl">🤔</span>
            <p className="mt-2 font-semibold text-sunshine-dark">Think</p>
            <p className="text-sm text-ink/70">Count them up or do the math in your head</p>
          </div>
          <div className="rounded-2xl bg-coral/15 p-4">
            <span className="text-3xl">👆</span>
            <p className="mt-2 font-semibold text-coral-dark">Tap</p>
            <p className="text-sm text-ink/70">Pick the answer and collect stars!</p>
          </div>
        </div>
      </section>
    </div>
  );
}
