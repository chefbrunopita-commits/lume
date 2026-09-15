import { Menu, Plus, Settings } from "lucide-react";
import { useEffect } from "react";
import { Composer } from "@/components/chat/composer";
import { EmptyState } from "@/components/chat/empty-state";
import { MessageList } from "@/components/chat/messages";
import { SettingsPanel } from "@/components/chat/settings-panel";
import { Sidebar } from "@/components/chat/sidebar";
import { useActiveConversation, useChat } from "@/lib/chat/store";

export function ChatApp() {
  const convo = useActiveConversation();
  const newChat = useChat((s) => s.newChat);
  const setSidebarOpen = useChat((s) => s.setSidebarOpen);
  const setSettingsOpen = useChat((s) => s.setSettingsOpen);
  const probe = useChat((s) => s.probe);
  const connection = useChat((s) => s.connection);
  const settings = useChat((s) => s.settings);
  useEffect(() => { void probe(); }, [probe]);
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.shiftKey && e.key.toLowerCase() === "o") { e.preventDefault(); newChat(); }
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [newChat]);
  const empty = !convo || convo.messages.length === 0;
  const localOn = connection.activeEngine === "local" && connection.status === "online";
  return (
    <div className="flex h-dvh overflow-hidden bg-bg text-fg">
      <Sidebar />
      <div className="flex min-w-0 flex-1 flex-col">
        <header className="flex h-14 items-center justify-between px-2">
          <div className="flex items-center gap-1">
            <button type="button" className="size-11 text-muted lg:hidden" aria-label="Abrir conversas" onClick={() => setSidebarOpen(true)}><Menu className="mx-auto size-5" /></button>
            <span className="px-2 text-sm text-muted">{localOn ? settings.model : connection.cloudAvailable ? "Nuvem" : "Lume"}</span>
          </div>
          <div className="flex items-center">
            <button type="button" className="size-11" aria-label="Nova conversa" onClick={newChat}><Plus className="mx-auto size-5" /></button>
            <button type="button" className="size-11" aria-label="Configurações" onClick={() => setSettingsOpen(true)}><Settings className="mx-auto size-5" /></button>
          </div>
        </header>
        {empty ? <EmptyState /> : <MessageList />}
        {empty ? null : <Composer />}
      </div>
      <SettingsPanel />
    </div>
  );
}
