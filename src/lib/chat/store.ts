import { create } from "zustand";
import { persist } from "zustand/middleware";
import { titleFromPrompt, uid } from "@/lib/utils";
import { describeLocalError, listLocalModels, pickBestModel, streamChat } from "./engine";
import { DEFAULT_SETTINGS, PRESET_LABELS, PRESET_URLS, type ChatMessage, type Connection, type Conversation, type EngineMode, type Settings } from "./types";

const MAX_CONVERSATIONS = 60;
let abort: AbortController | null = null;
const idle = (): Connection => ({ status: "idle", models: [], error: null, activeEngine: "local", cloudAvailable: false, localLabel: null });

type ChatState = {
  conversations: Conversation[]; activeId: string | null; settings: Settings; connection: Connection;
  streamingId: string | null; settingsOpen: boolean; sidebarOpen: boolean;
  setSettingsOpen: (o: boolean) => void; setSidebarOpen: (o: boolean) => void;
  newChat: () => void; selectChat: (id: string) => void; deleteChat: (id: string) => void;
  patchSettings: (p: Partial<Settings>) => void; setPreset: (p: Settings["preset"]) => void;
  probe: (opts?: { local?: boolean }) => Promise<void>; send: (text: string) => Promise<void>;
  stop: () => void; regenerate: () => Promise<void>;
};

export const useChat = create<ChatState>()(persist((set, get) => ({
  conversations: [], activeId: null, settings: DEFAULT_SETTINGS, connection: idle(),
  streamingId: null, settingsOpen: false, sidebarOpen: false,
  setSettingsOpen: (o) => set({ settingsOpen: o }),
  setSidebarOpen: (o) => set({ sidebarOpen: o }),
  newChat: () => { get().stop(); set({ activeId: null, sidebarOpen: false }); },
  selectChat: (id) => set({ activeId: id, sidebarOpen: false }),
  deleteChat: (id) => set({ conversations: get().conversations.filter((c) => c.id !== id), activeId: get().activeId === id ? null : get().activeId }),
  patchSettings: (p) => set({ settings: { ...get().settings, ...p } }),
  setPreset: (preset) => set({ settings: { ...get().settings, preset, baseUrl: preset === "custom" ? get().settings.baseUrl : PRESET_URLS[preset] } }),
  probe: async () => {
    const { settings } = get();
    set({ connection: { ...get().connection, status: "checking", error: null } });
    const cloudAvailable = Boolean(settings.cloudBaseUrl && settings.cloudApiKey);
    let models: string[] = []; let localError: string | null = null;
    const ctrl = new AbortController(); const t = window.setTimeout(() => ctrl.abort(), 2500);
    try { models = await listLocalModels(settings.baseUrl, ctrl.signal); }
    catch (err) { localError = describeLocalError(err); }
    finally { window.clearTimeout(t); }
    const localOnline = models.length > 0;
    const model = localOnline ? pickBestModel(models, settings.model) : settings.model;
    const activeEngine: EngineMode = settings.preferLocal && localOnline ? "local" : cloudAvailable && settings.allowCloudFallback ? "cloud" : "local";
    set({ settings: { ...get().settings, model }, connection: { status: localOnline ? "online" : "offline", models, error: localOnline ? null : localError, activeEngine, cloudAvailable, localLabel: localOnline ? PRESET_LABELS[settings.preset] : null } });
  },
  send: async (text) => {
    const trimmed = text.trim(); if (!trimmed || get().streamingId) return;
    if (get().connection.status === "idle") await get().probe();
    const now = Date.now();
    const user: ChatMessage = { id: uid(), role: "user", content: trimmed, createdAt: now };
    const asst: ChatMessage = { id: uid(), role: "assistant", content: "", createdAt: now + 1 };
    let { activeId, conversations } = get();
    if (!activeId) {
      const convo: Conversation = { id: uid(), title: titleFromPrompt(trimmed), messages: [user, asst], createdAt: now, updatedAt: now };
      set({ conversations: [convo, ...conversations].slice(0, MAX_CONVERSATIONS), activeId: convo.id, streamingId: asst.id });
    } else {
      set({ conversations: conversations.map((c) => c.id === activeId ? { ...c, messages: [...c.messages, user, asst], updatedAt: now } : c), streamingId: asst.id });
    }
    await runStream(get, set, asst.id);
  },
  stop: () => { abort?.abort(); abort = null; set({ streamingId: null }); },
  regenerate: async () => {
    const { activeId, conversations } = get(); const convo = conversations.find((c) => c.id === activeId); if (!convo || get().streamingId) return;
    const idx = [...convo.messages].map((m, i) => ({ m, i })).reverse().find((x) => x.m.role === "assistant")?.i; if (idx == null) return;
    const reset = { ...convo.messages[idx]!, content: "", error: undefined, createdAt: Date.now() };
    set({ streamingId: reset.id, conversations: conversations.map((c) => c.id === convo.id ? { ...c, messages: c.messages.map((m, i) => i === idx ? reset : m) } : c) });
    await runStream(get, set, reset.id);
  },
}), { name: "lume-chat", partialize: (s) => ({ conversations: s.conversations, activeId: s.activeId, settings: s.settings }) }));

async function runStream(get: () => ChatState, set: (p: Partial<ChatState>) => void, assistantId: string) {
  const { settings, connection, conversations, activeId } = get();
  const convo = conversations.find((c) => c.id === activeId); if (!convo) { set({ streamingId: null }); return; }
  const engine: EngineMode = settings.preferLocal && connection.status === "online" ? "local" : settings.allowCloudFallback && connection.cloudAvailable ? "cloud" : "local";
  const history = convo.messages.filter((m) => m.id !== assistantId && m.content.trim() && !m.error).slice(-24);
  abort?.abort(); abort = new AbortController();
  const patch = (partial: Partial<ChatMessage>) => {
    set({ conversations: get().conversations.map((c) => c.id !== get().activeId ? c : { ...c, messages: c.messages.map((m) => m.id === assistantId ? { ...m, ...partial } : m) }) });
  };
  try {
    let assembled = "";
    await streamChat({ settings, history, engine, handlers: { signal: abort.signal, onDelta: (chunk) => { assembled += chunk; patch({ content: assembled, error: undefined }); } } });
    if (!assembled.trim()) patch({ error: "O modelo respondeu em branco." });
  } catch (err) {
    if (err instanceof DOMException && err.name === "AbortError") return;
    patch({ error: engine === "local" ? describeLocalError(err) : err instanceof Error ? err.message : "Falha ao gerar." });
  } finally {
    if (get().streamingId === assistantId) set({ streamingId: null }); abort = null;
  }
}
export function useActiveConversation() { return useChat((s) => s.conversations.find((c) => c.id === s.activeId) ?? null); }
