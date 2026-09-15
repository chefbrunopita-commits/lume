import { useEffect, useState } from "react";
import { useChat } from "@/lib/chat/store";
import { PRESET_LABELS, type LocalPreset } from "@/lib/chat/types";
const PRESETS: LocalPreset[] = ["ollama", "lmstudio", "llamacpp", "custom"];
export function SettingsPanel() {
  const open = useChat((s) => s.settingsOpen);
  const setOpen = useChat((s) => s.setSettingsOpen);
  const settings = useChat((s) => s.settings);
  const connection = useChat((s) => s.connection);
  const patchSettings = useChat((s) => s.patchSettings);
  const setPreset = useChat((s) => s.setPreset);
  const probe = useChat((s) => s.probe);
  const [testing, setTesting] = useState(false);
  useEffect(() => { if (open) void probe(); }, [open, probe]);
  if (!open) return null;
  return (
    <div className="fixed inset-0 z-50 flex justify-end">
      <button type="button" className="absolute inset-0 bg-bg/70" aria-label="Fechar" onClick={() => setOpen(false)} />
      <aside className="relative flex h-full w-full max-w-md flex-col bg-surface ring-1 ring-border">
        <div className="flex items-start justify-between px-6 pt-6 pb-4">
          <div><h2 className="text-lg font-medium">Llama local</h2><p className="mt-1 text-sm text-muted">O Lume usa o modelo instalado neste computador.</p></div>
          <button type="button" className="size-9" aria-label="Fechar" onClick={() => setOpen(false)}>×</button>
        </div>
        <div className="flex-1 space-y-4 overflow-y-auto px-6 pb-8">
          <p className="text-sm">{connection.status === "online" ? "Llama encontrado" : connection.error || "Llama ainda não encontrado"}</p>
          <div className="grid grid-cols-2 gap-2">{PRESETS.map((p) => (
            <button key={p} type="button" onClick={() => setPreset(p)} className={`h-11 rounded-md text-sm ${settings.preset === p ? "bg-accent text-accent-fg" : "bg-elevated"}`}>{PRESET_LABELS[p]}</button>
          ))}</div>
          <input className="field" value={settings.baseUrl} onChange={(e) => patchSettings({ baseUrl: e.target.value, preset: "custom" })} />
          <input className="field" value={settings.model} onChange={(e) => patchSettings({ model: e.target.value })} placeholder="llama4" />
          <button type="button" className="h-11 w-full rounded-md bg-accent text-accent-fg" disabled={testing} onClick={async () => { setTesting(true); await probe(); setTesting(false); }}>{testing ? "Testando…" : "Testar conexão"}</button>
          <label className="flex items-center justify-between text-sm">Preferir Llama local<input type="checkbox" checked={settings.preferLocal} onChange={(e) => patchSettings({ preferLocal: e.target.checked })} /></label>
          <label className="flex items-center justify-between text-sm">Usar nuvem se o Llama falhar<input type="checkbox" checked={settings.allowCloudFallback} onChange={(e) => patchSettings({ allowCloudFallback: e.target.checked })} /></label>
          <textarea className="field h-32 py-2" value={settings.systemPrompt} onChange={(e) => patchSettings({ systemPrompt: e.target.value })} />
          <p className="text-xs text-subtle">Nuvem opcional (API compatível com OpenAI)</p>
          <input className="field" placeholder="URL da API" value={settings.cloudBaseUrl} onChange={(e) => patchSettings({ cloudBaseUrl: e.target.value })} />
          <input className="field" placeholder="Modelo" value={settings.cloudModel} onChange={(e) => patchSettings({ cloudModel: e.target.value })} />
          <input className="field" type="password" placeholder="Chave" value={settings.cloudApiKey} onChange={(e) => patchSettings({ cloudApiKey: e.target.value })} />
        </div>
      </aside>
    </div>
  );
}
