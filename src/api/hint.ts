import type { HealthResponse, HintRequest, HintResponse } from "../types/hint";

function errorFromBody(text: string, status: number): string {
  try {
    const body = JSON.parse(text) as { error?: string };
    if (body.error) return body.error;
  } catch {
    /* not json */
  }

  if (status === 500) {
    return "MathBot server is not running. Run npm run dev.";
  }

  return `Request failed (${status})`;
}

export async function fetchHint(payload: HintRequest): Promise<string> {
  const response = await fetch("/api/hint", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(payload),
  });

  const text = await response.text();

  if (!response.ok) {
    throw new Error(errorFromBody(text, response.status));
  }

  const body = JSON.parse(text) as HintResponse;
  return body.message;
}

export async function fetchHealth(): Promise<HealthResponse> {
  const response = await fetch("/api/health");
  if (!response.ok) {
    throw new Error(`Health check failed (${response.status})`);
  }
  return response.json() as Promise<HealthResponse>;
}
