import express from "express";
import multer from "multer";
import type { HintRequest } from "../src/types/hint.js";
import { API_PORT, OMLX_MODEL, OMLX_STT_MODEL, OMLX_URL } from "./config.js";
import { generateHint } from "./hint.js";
import { getResolvedModelId, initializeOmlx } from "./omlx.js";
import { getResolvedSttModelId, resolveSttModelId, transcribeAudio } from "./stt.js";

const app = express();
const upload = multer({
  storage: multer.memoryStorage(),
  limits: { fileSize: 10 * 1024 * 1024 },
});

app.use(express.json());

app.get("/api/health", (_req, res) => {
  res.json({
    ok: true,
    model: getResolvedModelId(),
    sttModel: getResolvedSttModelId(),
    omlxUrl: OMLX_URL,
  });
});

app.post("/api/transcribe", upload.single("audio"), async (req, res) => {
  if (!req.file) {
    res.status(400).json({ error: "Audio file is required" });
    return;
  }

  try {
    const text = await transcribeAudio(
      req.file.buffer,
      req.file.originalname || "recording.webm",
      req.file.mimetype || "audio/webm",
    );
    res.json({ text });
  } catch (error) {
    const detail = error instanceof Error ? error.message : "Transcription failed";
    res.status(502).json({ error: detail });
  }
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

app.use((error: Error, _req: express.Request, res: express.Response, next: express.NextFunction) => {
  console.error(error);
  if (res.headersSent) {
    next(error);
    return;
  }
  res.status(500).json({ error: error.message });
});

async function start() {
  console.log(`Connecting to OMLX at ${OMLX_URL}...`);
  const modelId = await initializeOmlx();
  console.log(`Model loaded: ${modelId} (matched from ${OMLX_MODEL})`);

  const sttModelId = await resolveSttModelId();
  if (sttModelId) {
    console.log(`Speech model ready: ${sttModelId} (matched from ${OMLX_STT_MODEL})`);
  } else {
    console.log(`Speech model not found (${OMLX_STT_MODEL}). Mic input will be unavailable until an STT model is loaded.`);
  }

  app.listen(API_PORT, () => {
    console.log(`MathBot API listening on http://localhost:${API_PORT}`);
  });
}

start().catch((error) => {
  console.error(error);
  process.exit(1);
});
