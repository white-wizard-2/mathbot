# MathBot — Fun Math Games for Kids

A playful website with three math games for young learners, inspired by [PBS KIDS Games](https://pbskids.org/games).

## Games

- **Count** — Count cute objects and pick the right number
- **Add** — Add two numbers together
- **Subtract** — Take away and find what's left

## Run locally

```bash
npm install
npm run dev
```

This starts:
- **Web app** at [http://localhost:5174](http://localhost:5174)
- **On your network** at `http://192.168.1.174:5174` (use your machine's IP)
- **API server** at port `3001` (proxied via `/api`)

Other devices on the same Wi‑Fi can open the network URL in a browser.

MathBot hints come from the OMLX LLM backend. Configure with env vars:

```bash
OMLX_URL=http://192.168.1.105:11435
OMLX_MODEL=Qwen3.6-35B-A3B-nvfp4
OMLX_API_KEY=DUMMY
API_HOST=0.0.0.0
API_PORT=3001
WEB_PORT=5174
```

## Scripts

- `npm run dev` — Start development server
- `npm run build` — Production build
- `npm run lint` — ESLint
- `npm run preview` — Preview production build
