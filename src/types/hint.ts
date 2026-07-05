export type HintBase = {
  picked: number;
  spokenText?: string;
};

export type HintRequest =
  | (HintBase & { game: "count"; object: string; total: number })
  | (HintBase & { game: "add"; a: number; b: number })
  | (HintBase & { game: "subtract"; a: number; b: number });

export type HintResponse = {
  message: string;
};

export type TranscribeResponse = {
  text: string;
};

export type HealthResponse = {
  ok: boolean;
  model: string;
  sttModel: string | null;
  omlxUrl: string;
};
