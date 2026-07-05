import { Link } from "react-router-dom";

type GameCardProps = {
  title: string;
  description: string;
  emoji: string;
  color: "grass" | "sunshine" | "coral" | "lavender";
  path: string;
  delay: number;
};

const COLOR_MAP = {
  grass: {
    bg: "bg-grass",
    border: "border-grass-dark",
    hover: "hover:bg-grass-dark",
  },
  sunshine: {
    bg: "bg-sunshine",
    border: "border-sunshine-dark",
    hover: "hover:bg-sunshine-dark",
  },
  coral: {
    bg: "bg-coral",
    border: "border-coral-dark",
    hover: "hover:bg-coral-dark",
  },
  lavender: {
    bg: "bg-lavender",
    border: "border-lavender-dark",
    hover: "hover:bg-lavender-dark",
  },
} as const;

export default function GameCard({
  title,
  description,
  emoji,
  color,
  path,
  delay,
}: GameCardProps) {
  const colors = COLOR_MAP[color];

  return (
    <Link
      to={path}
      className={`game-card-shadow animate-bounce-in group block rounded-3xl border-4 ${colors.border} ${colors.bg} ${colors.hover} p-6 text-white no-underline transition-all duration-200 md:p-8`}
      style={{ animationDelay: `${delay}ms`, opacity: 0 }}
    >
      <div className="flex flex-col items-center gap-4 text-center">
        <span className="animate-float inline-block text-6xl drop-shadow-lg transition-transform group-hover:scale-110 md:text-7xl">
          {emoji}
        </span>
        <div>
          <h2 className="text-2xl font-bold drop-shadow-sm md:text-3xl">{title}</h2>
          <p className="mt-2 text-base font-medium text-white/90 md:text-lg">
            {description}
          </p>
        </div>
        <span className="mt-2 rounded-full bg-white/25 px-5 py-2 text-lg font-bold backdrop-blur-sm transition group-hover:bg-white/40">
          Play! →
        </span>
      </div>
    </Link>
  );
}
