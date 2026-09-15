import type { ChatMessage, EngineMode, Settings } from "./types";
const PREFERRED_MODELS = ["llama4:scout","llama4:latest","llama4","llama4:maverick","llama3.3","llama3.2","llama3.1","llama3"];
function joinUrl(base: string, path: string) { return `${base.replace(/\/+$/, "")}${path}`; }
export function pickBestModel(names: string[], preferred?: string) {
  if (preferred && names.includes(preferred)) return preferred;
  const lower = names.map((n) => n.toLowerCase());
  for (const want of PREFERRED_MODELS) {
    const idx = lower.findIndex((n) => n === want || n.includes(want));
    if (idx >= 0) return names[idx]!;
  }
  return names.find((n) => n.toLowerCase().includes("llama")) ?? names[0] ?? preferred ?? "llama4";
}
export async function listLocalModels(baseUrl: string, signal?: AbortSignal) {
  const ctrl = signal ?? new AbortController().signal;
  for (const path of ["/v1/models", "/api/tags"]) {
    try {
      const res = await fetch(joinUrl(baseUrl, path), { signal: ctrl });
      if (!res.ok) continue;
      const data = await res.json();
      const names: string[] = [];
      if (Array.isArray(data?.data)) for (const item of data.data) if (item?.id) names.push(String(item.id));
      if (Array.isArray(data?.models)) for (const item of data.models) names.push(String(item.name ?? item.model ?? ""));
      if (names.filter(Boolean).length) return names.filter(Boolean);
    } catch {}
  }
  throw new Error("Nenhum modelo listado");
}
async function parseSse(body: ReadableStream<Uint8Array>, onDelta: (s: string) => void, signal?: AbortSignal) {
  const reader = body.getReader(); const decoder = new TextDecoder(); let buffer = "";
  while (true) {
    if (signal?.aborted) { await reader.cancel().catch(() => {}); throw new DOMException("Aborted", "AbortError"); }
    const { done, value } = await reader.read(); if (done) break;
    buffer += decoder.decode(value, { stream: true });
    const lines = buffer.split("\n"); buffer = lines.pop() ?? "";
    for (const raw of lines) {
      const line = raw.trim(); if (!line || line.startsWith(":")) continue;
      const payload = line.startsWith("data:") ? line.slice(5).trim() : line;
      if (!payload || payload === "[DONE]") continue;
      try {
        const json = JSON.parse(payload);
        const piece = json.choices?.[0]?.delta?.content ?? json.message?.content ?? "";
        if (piece) onDelta(piece);
      } catch {}
    }
  }
}
export async function streamChat(opts: { settings: Settings; history: ChatMessage[]; engine: EngineMode; handlers: { onDelta: (s: string) => void; signal?: AbortSignal } }) {
  const { settings, history, engine, handlers } = opts;
  const system = engine === "local" ? settings.systemPrompt : "Você é o Lume, um assistente pessoal. Seja direto e útil.";
  const messages = [{ role: "system", content: system }, ...history.map((m) => ({ role: m.role, content: m.content }))];
  if (engine === "local") {
    const res = await fetch(joinUrl(settings.baseUrl, "/v1/chat/completions"), {
      method: "POST",
      headers: { "Content-Type": "application/json", Authorization: "Bearer local" },
      body: JSON.stringify({ model: settings.model || "llama4", messages, temperature: settings.temperature, stream: true }),
      signal: handlers.signal,
    });
    if (!res.ok || !res.body) throw new Error(`Llama local retornou ${res.status}`);
    await parseSse(res.body, handlers.onDelta, handlers.signal);
    return;
  }
  if (!settings.cloudBaseUrl || !settings.cloudApiKey) throw new Error("Configure a nuvem nas definições.");
  const res = await fetch(joinUrl(settings.cloudBaseUrl, "/chat/completions"), {
    method: "POST",
    headers: { "Content-Type": "application/json", Authorization: `Bearer ${settings.cloudApiKey}` },
    body: JSON.stringify({ model: settings.cloudModel || "grok-4.5", messages, temperature: settings.temperature, stream: true, max_tokens: 2048 }),
    signal: handlers.signal,
  });
  if (!res.ok || !res.body) throw new Error(`Falha no modo nuvem (${res.status})`);
  await parseSse(res.body, handlers.onDelta, handlers.signal);
}
export function describeLocalError(err: unknown) {
  if (err instanceof DOMException && err.name === "AbortError") return "Tempo esgotado ao falar com o Llama local.";
  const message = err instanceof Error ? err.message : "Falha desconhecida";
  if (/failed to fetch|networkerror|load failed/i.test(message)) return "Não foi possível alcançar o Llama. Confira se o Ollama, o LM Studio ou o llama.cpp está em execução.";
  return message;
}
