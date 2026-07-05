import { OMLX_STT_MODEL, OMLX_URL } from "./config.js";
import { getOmlxAuthHeaders, matchesModel } from "./omlx.js";

type ModelsResponse = {
  data: Array<{ id: string }>;
};

type TranscriptionResponse = {
  text?: string;
};

let resolvedSttModelId: string | null = null;

export function getResolvedSttModelId(): string | null {
  return resolvedSttModelId;
}

export async function resolveSttModelId(): Promise<string | null> {
  const response = await fetch(`${OMLX_URL}/v1/models`, {
    headers: getOmlxAuthHeaders(),
  });

  if (!response.ok) {
    return null;
  }

  const body = (await response.json()) as ModelsResponse;
  const match = body.data.find((model) => matchesModel(model.id, OMLX_STT_MODEL));

  if (!match) {
    return null;
  }

  resolvedSttModelId = match.id;
  return match.id;
}

export async function transcribeAudio(
  audio: Buffer,
  filename: string,
  mimeType: string,
): Promise<string> {
  const modelId = resolvedSttModelId ?? (await resolveSttModelId());

  if (!modelId) {
    throw new Error(
      `Speech model "${OMLX_STT_MODEL}" is not loaded on OMLX. Add an STT model to use the mic.`,
    );
  }

  const form = new FormData();
  form.append("file", new Blob([audio], { type: mimeType }), filename);
  form.append("model", modelId);
  form.append("language", "en");

  const response = await fetch(`${OMLX_URL}/v1/audio/transcriptions`, {
    method: "POST",
    headers: getOmlxAuthHeaders(),
    body: form,
  });

  if (!response.ok) {
    const detail = await response.text();
    throw new Error(`Speech-to-text failed: ${response.status} ${detail}`);
  }

  const body = (await response.json()) as TranscriptionResponse;
  const text = body.text?.trim();

  if (!text) {
    throw new Error("Could not hear any words. Try speaking again!");
  }

  return text;
}
