import { Link, Outlet, useLocation } from "react-router-dom";

const NAV_ITEMS = [
  { path: "/", label: "Home", emoji: "🏠" },
  { path: "/count", label: "Count", emoji: "🔢" },
  { path: "/add", label: "Add", emoji: "➕" },
  { path: "/subtract", label: "Subtract", emoji: "➖" },
] as const;

export default function Layout() {
  const location = useLocation();
  const isHome = location.pathname === "/";

  return (
    <div className="flex min-h-screen flex-col">
      <header className="sticky top-0 z-50 border-b-4 border-sky-deep/30 bg-sky-bright px-4 py-3 shadow-md">
        <div className="mx-auto flex max-w-5xl items-center justify-between gap-4">
          <Link
            to="/"
            className="flex items-center gap-2 text-white no-underline transition hover:scale-105"
          >
            <span className="animate-wiggle inline-block text-3xl">🤖</span>
            <span className="text-2xl font-bold tracking-wide drop-shadow-sm md:text-3xl">
              MathBot
            </span>
          </Link>

          {!isHome && (
            <nav className="flex gap-1 md:gap-2">
              {NAV_ITEMS.filter((item) => item.path !== "/").map((item) => {
                const active = location.pathname === item.path;
                return (
                  <Link
                    key={item.path}
                    to={item.path}
                    className={`rounded-full px-3 py-1.5 text-sm font-semibold no-underline transition md:px-4 md:py-2 md:text-base ${
                      active
                        ? "bg-white text-sky-deep shadow-md"
                        : "bg-white/20 text-white hover:bg-white/40"
                    }`}
                  >
                    <span className="mr-1">{item.emoji}</span>
                    {item.label}
                  </Link>
                );
              })}
            </nav>
          )}
        </div>
      </header>

      <main className="mx-auto w-full max-w-5xl flex-1 px-4 py-6 md:py-10">
        <Outlet />
      </main>

      <footer className="border-t-4 border-sky-deep/20 bg-sky-bright/80 px-4 py-4 text-center text-sm font-medium text-white">
        <p>Made with 💛 for curious kids who love to learn!</p>
      </footer>
    </div>
  );
}
