import { Composer } from "@/components/chat/composer";
import { LumeMark } from "@/components/chat/lume-mark";
import { useChat } from "@/lib/chat/store";
const SUGGESTIONS = ["O que você consegue fazer neste computador?", "Escreva um e-mail curto e direto", "Explique um conceito difícil com calma", "Ajude-me a estruturar um projeto"];
export function EmptyState() {
  const send = useChat((s) => s.send);
  const connection = useChat((s) => s.connection);
  const settings = useChat((s) => s.settings);
  const label = connection.activeEngine === "local" && connection.status === "online" ? `${settings.model} · ${connection.localLabel ?? "local"}` : connection.cloudAvailable ? "Modo nuvem pronto" : "Aguardando o Llama local";
  return (
    <div className="flex flex-1 flex-col items-center justify-center px-4 pb-8">
      <LumeMark className="mb-6 size-11 text-accent" />
      <h1 className="text-center text-3xl font-medium tracking-tight sm:text-4xl">Em que posso ajudar?</h1>
      <p className="mt-3 text-center text-sm text-muted">{label}</p>
      <div className="mt-8 w-full max-w-2xl"><Composer variant="hero" /></div>
      <div className="mt-5 flex max-w-2xl flex-wrap justify-center gap-2">
        {SUGGESTIONS.map((item) => (
          <button key={item} type="button" onClick={() => void send(item)} className="rounded-xl bg-surface px-3.5 py-2 text-sm text-muted ring-1 ring-border hover:text-fg">{item}</button>
        ))}
      </div>
    </div>
  );
}
