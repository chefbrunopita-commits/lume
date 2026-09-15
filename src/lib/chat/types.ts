export type ChatMessage = {
  id: string;
  role: "user" | "assistant";
  content: string;
  createdAt: number;
  error?: string;
};

export type Conversation = {
  id: string;
  title: string;
  messages: ChatMessage[];
  createdAt: number;
  updatedAt: number;
};

export type LocalPreset = "ollama" | "lmstudio" | "llamacpp" | "custom";
export type EngineMode = "local" | "cloud";

export type Settings = {
  preferLocal: boolean;
  allowCloudFallback: boolean;
  preset: LocalPreset;
  baseUrl: string;
  model: string;
  temperature: number;
  systemPrompt: string;
  cloudBaseUrl: string;
  cloudModel: string;
  cloudApiKey: string;
};

export type Connection = {
  status: "idle" | "checking" | "online" | "offline";
  models: string[];
  error: string | null;
  activeEngine: EngineMode;
  cloudAvailable: boolean;
  localLabel: string | null;
};

export const PRESET_URLS: Record<Exclude<LocalPreset, "custom">, string> = {
  ollama: "http://127.0.0.1:11434",
  lmstudio: "http://127.0.0.1:1234",
  llamacpp: "http://127.0.0.1:8080",
};

export const PRESET_LABELS: Record<LocalPreset, string> = {
  ollama: "Ollama",
  lmstudio: "LM Studio",
  llamacpp: "llama.cpp",
  custom: "Personalizado",
};

export const DEFAULT_SYSTEM_PROMPT =
  "Você é o Lume, um assistente pessoal que roda no computador do usuário e usa o modelo Llama instalado localmente como fonte de conhecimento. Seja direto, claro e útil. Responda no idioma da pessoa. Se não souber, diga que não sabe em vez de inventar.";

export const DEFAULT_SETTINGS: Settings = {
  preferLocal: true,
  allowCloudFallback: false,
  preset: "ollama",
  baseUrl: PRESET_URLS.ollama,
  model: "llama4",
  temperature: 0.7,
  systemPrompt: DEFAULT_SYSTEM_PROMPT,
  cloudBaseUrl: "",
  cloudModel: "",
  cloudApiKey: "",
};
