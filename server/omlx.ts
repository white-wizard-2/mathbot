import { OMLX_API_KEY, OMLX_MODEL, OMLX_URL } from "./config.js";

type ModelEntry = {
  id: string;
};

type ModelsResponse = {
  data: ModelEntry[];
};

type HealthResponse = {
  default_model?: string;
};

type ChatResponse = {
  choices: Array<{
    message: { content: string };
  }>;
};

let resolvedModelId: string | null = null;

function omlxHeaders(): HeadersInit {
  return {
    "Content-Type": "application/json",
    Authorization: `Bearer ${OMLX_API_KEY}`,
    "x-api-key": OMLX_API_KEY,
  };
}

export function getResolvedModelId(): string {
  if (!resolvedModelId) {
    throw new Error("OMLX model is not loaded yet");
  }
  return resolvedModelId;
}

function matchesModel(id: string, target: string): boolean {
  const normalizedId = id.toLowerCase().replace(/[^a-z0-9]/g, "");
  const normalizedTarget = target.toLowerCase().replace(/[^a-z0-9]/g, "");
  return normalizedId.includes(normalizedTarget) || normalizedTarget.includes(normalizedId);
}

async function resolveFromHealth(): Promise<string> {
  const response = await fetch(`${OMLX_URL}/health`);
  if (!response.ok) {
    throw new Error(`OMLX health request failed: ${response.status}`);
  }

  const body = (await response.json()) as HealthResponse;
  if (!body.default_model) {
    throw new Error("OMLX health response did not include default_model");
  }

  return body.default_model;
}

export async function resolveModelId(): Promise<string> {
  const modelsResponse = await fetch(`${OMLX_URL}/v1/models`, {
    headers: omlxHeaders(),
  });

  if (modelsResponse.ok) {
    const body = (await modelsResponse.json()) as ModelsResponse;
    const match = body.data.find((model) => matchesModel(model.id, OMLX_MODEL));

    if (match) {
      resolvedModelId = match.id;
      return match.id;
    }

    const defaultModel = await resolveFromHealth();
    resolvedModelId = defaultModel;
    return defaultModel;
  }

  const defaultModel = await resolveFromHealth();
  resolvedModelId = defaultModel;
  return defaultModel;
}

export async function warmupModel(modelId: string): Promise<void> {
  const response = await fetch(`${OMLX_URL}/v1/chat/completions`, {
    method: "POST",
    headers: omlxHeaders(),
    body: JSON.stringify({
      model: modelId,
      messages: [{ role: "user", content: "Say hi in one word." }],
      max_tokens: 8,
      temperature: 0.2,
      stream: false,
    }),
  });

  if (!response.ok) {
    const detail = await response.text();
    throw new Error(`OMLX warmup failed: ${response.status} ${detail}`);
  }

  await response.json() as ChatResponse;
}

export async function chatCompletion(
  messages: Array<{ role: string; content: string }>,
  options: { maxTokens?: number; temperature?: number } = {},
): Promise<string> {
  const modelId = getResolvedModelId();
  const response = await fetch(`${OMLX_URL}/v1/chat/completions`, {
    method: "POST",
    headers: omlxHeaders(),
    body: JSON.stringify({
      model: modelId,
      messages,
      max_tokens: options.maxTokens ?? 120,
      temperature: options.temperature ?? 0.8,
      stream: false,
    }),
  });

  if (!response.ok) {
    const detail = await response.text();
    throw new Error(`OMLX chat failed: ${response.status} ${detail}`);
  }

  const body = (await response.json()) as ChatResponse;
  const content = body.choices[0]?.message?.content?.trim();

  if (!content) {
    throw new Error("OMLX returned an empty hint");
  }

  return content;
}

export async function initializeOmlx(): Promise<string> {
  const modelId = await resolveModelId();
  await warmupModel(modelId);
  return modelId;
}
