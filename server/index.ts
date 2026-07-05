import express from "express";
import type { HintRequest } from "../src/types/hint.js";
import { API_PORT, OMLX_MODEL, OMLX_URL } from "./config.js";
import { generateHint } from "./hint.js";
import { getResolvedModelId, initializeOmlx } from "./omlx.js";

const app = express();
app.use(express.json());

app.get("/api/health", (_req, res) => {
  res.json({
    ok: true,
    model: getResolvedModelId(),
    omlxUrl: OMLX_URL,
  });
});

app.post("/api/hint", async (req, res) => {
  const body = req.body as HintRequest;

  if (!body?.game || typeof body.picked !== "number") {
    res.status(400).json({ error: "Invalid hint request" });
    return;
  }

  try {
    const message = await generateHint(body);
    res.json({ message });
  } catch (error) {
    const detail = error instanceof Error ? error.message : "Hint generation failed";
    res.status(502).json({ error: detail });
  }
});

async function start() {
  console.log(`Connecting to OMLX at ${OMLX_URL}...`);
  const modelId = await initializeOmlx();
  console.log(`Model loaded: ${modelId} (matched from ${OMLX_MODEL})`);

  app.listen(API_PORT, () => {
    console.log(`MathBot API listening on http://localhost:${API_PORT}`);
  });
}

start().catch((error) => {
  console.error(error);
  process.exit(1);
});
