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
- **Web app** at [http://localhost:5173](http://localhost:5173)
- **API server** at [http://localhost:3001](http://localhost:3001) (proxied via `/api`)

MathBot hints come from the OMLX LLM backend. Configure with env vars:

```bash
OMLX_URL=http://192.168.1.105:11435
OMLX_MODEL=Qwen3.6-35B-A3B-nvfp4
OMLX_API_KEY=DUMMY
API_PORT=3001
```

The API loads the model on startup via `GET /v1/models` and a warmup chat request.

## Scripts

- `npm run dev` — Start development server
- `npm run build` — Production build
- `npm run lint` — ESLint
- `npm run preview` — Preview production build
