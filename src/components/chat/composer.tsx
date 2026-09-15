import { ArrowUp, Square } from "lucide-react";
import { useEffect, useRef, type FormEvent, type KeyboardEvent } from "react";
import { useChat } from "@/lib/chat/store";
export function Composer({ variant = "docked" }: { variant?: "hero" | "docked" }) {
  const send = useChat((s) => s.send);
  const stop = useChat((s) => s.stop);
  const streamingId = useChat((s) => s.streamingId);
  const ref = useRef<HTMLTextAreaElement>(null);
  useEffect(() => { ref.current?.focus(); }, []);
  function submit() {
    const el = ref.current; if (!el || !el.value.trim() || streamingId) return;
    const value = el.value; el.value = ""; el.style.height = "auto"; void send(value);
  }
  function onKeyDown(e: KeyboardEvent<HTMLTextAreaElement>) {
    if (e.key === "Enter" && !e.shiftKey) { e.preventDefault(); submit(); }
  }
  return (
    <form onSubmit={(e: FormEvent) => { e.preventDefault(); submit(); }} className={variant === "hero" ? "mx-auto w-full max-w-2xl" : "mx-auto w-full max-w-3xl px-4 pb-5"}>
      <div className="flex items-end gap-2 rounded-xl bg-surface p-2 ring-1 ring-border">
        <textarea ref={ref} rows={1} placeholder="Pergunte qualquer coisa" onKeyDown={onKeyDown}
          onInput={(e) => { const el = e.currentTarget; el.style.height = "auto"; el.style.height = `${Math.min(el.scrollHeight, 200)}px`; }}
          className="max-h-52 min-h-11 flex-1 resize-none bg-transparent px-3 py-2.5 text-base text-fg placeholder:text-subtle focus:outline-none" />
        {streamingId ? (
          <button type="button" className="mb-1 size-9 rounded-full bg-accent text-accent-fg" aria-label="Parar" onClick={stop}><Square className="mx-auto size-3.5 fill-current" /></button>
        ) : (
          <button type="submit" className="mb-1 size-9 rounded-full bg-accent text-accent-fg" aria-label="Enviar"><ArrowUp className="mx-auto size-4" /></button>
        )}
      </div>
      <p className="mt-2 text-center text-xs text-subtle">Enter envia · Shift+Enter quebra a linha</p>
    </form>
  );
}
