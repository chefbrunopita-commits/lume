import { Plus, Settings, Trash2, X } from "lucide-react";
import { LumeMark } from "@/components/chat/lume-mark";
import { useChat } from "@/lib/chat/store";
export function Sidebar() {
  const conversations = useChat((s) => s.conversations);
  const activeId = useChat((s) => s.activeId);
  const sidebarOpen = useChat((s) => s.sidebarOpen);
  const selectChat = useChat((s) => s.selectChat);
  const newChat = useChat((s) => s.newChat);
  const deleteChat = useChat((s) => s.deleteChat);
  const setSidebarOpen = useChat((s) => s.setSidebarOpen);
  const setSettingsOpen = useChat((s) => s.setSettingsOpen);
  const connection = useChat((s) => s.connection);
  const settings = useChat((s) => s.settings);
  const localOn = connection.activeEngine === "local" && connection.status === "online";
  return (
    <>
      {sidebarOpen ? <button type="button" className="fixed inset-0 z-30 bg-bg/60 lg:hidden" aria-label="Fechar menu" onClick={() => setSidebarOpen(false)} /> : null}
      <aside className={`fixed inset-y-0 left-0 z-40 flex w-72 flex-col bg-surface lg:static lg:translate-x-0 ${sidebarOpen ? "translate-x-0" : "-translate-x-full"}`}>
        <div className="flex items-center justify-between px-3 pt-3">
          <div className="flex items-center gap-2 px-2 py-1"><LumeMark className="size-5 text-accent" /><span className="text-sm font-medium">Lume</span></div>
          <button type="button" className="size-9 lg:hidden" aria-label="Fechar" onClick={() => setSidebarOpen(false)}><X className="mx-auto size-4" /></button>
        </div>
        <div className="p-3"><button type="button" className="flex h-11 w-full items-center gap-2 rounded-lg bg-elevated px-4 text-sm" onClick={newChat}><Plus className="size-4" />Nova conversa</button></div>
        <div className="min-h-0 flex-1 overflow-y-auto px-2">
          {conversations.length === 0 ? <p className="px-3 py-6 text-sm text-subtle">As conversas ficam neste aparelho.</p> : conversations.map((c) => (
            <div key={c.id} className="relative">
              <button type="button" onClick={() => selectChat(c.id)} className={`flex w-full flex-col rounded-md px-3 py-2.5 text-left ${c.id === activeId ? "bg-elevated" : "hover:bg-surface-hover"}`}>
                <span className="truncate text-sm">{c.title}</span>
              </button>
              <button type="button" className="absolute top-1 right-1 size-9 text-subtle" aria-label="Apagar" onClick={() => deleteChat(c.id)}><Trash2 className="mx-auto size-3.5" /></button>
            </div>
          ))}
        </div>
        <button type="button" onClick={() => setSettingsOpen(true)} className="m-3 flex items-center gap-3 rounded-lg px-2 py-2 text-left hover:bg-surface-hover">
          <span className={`size-2 rounded-full ${localOn ? "bg-ok" : "bg-subtle"}`} />
          <span className="min-w-0 flex-1"><span className="block truncate text-sm">{localOn ? settings.model : "Conectar Llama"}</span><span className="block text-xs text-subtle">{localOn ? "Rodando neste computador" : "Sem modelo ligado"}</span></span>
          <Settings className="size-4 text-subtle" />
        </button>
      </aside>
    </>
  );
}
