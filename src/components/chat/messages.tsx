import { Copy, RefreshCw } from "lucide-react";
import { useEffect, useRef } from "react";
import { Markdown } from "@/lib/chat/markdown";
import { useActiveConversation, useChat } from "@/lib/chat/store";
export function MessageList() {
  const convo = useActiveConversation();
  const streamingId = useChat((s) => s.streamingId);
  const regenerate = useChat((s) => s.regenerate);
  const bottomRef = useRef<HTMLDivElement>(null);
  useEffect(() => { bottomRef.current?.scrollIntoView({ block: "end" }); }, [convo?.messages, streamingId]);
  if (!convo) return null;
  const lastId = [...convo.messages].reverse().find((m) => m.role === "assistant")?.id;
  return (
    <div className="min-h-0 flex-1 overflow-y-auto">
      <div className="mx-auto flex w-full max-w-3xl flex-col gap-6 px-4 py-8">
        {convo.messages.map((message) => {
          const streaming = message.id === streamingId;
          return (
            <article key={message.id} className={message.role === "user" ? "w-full text-right" : "w-full text-left"}>
              {message.role === "user" ? (
                <div className="inline-block max-w-xl rounded-xl bg-elevated px-4 py-3 text-left whitespace-pre-wrap ring-1 ring-border">{message.content}</div>
              ) : (
                <div>
                  {message.error && !message.content ? <p className="text-danger">{message.error}</p> : streaming ? (message.content ? <p className="whitespace-pre-wrap">{message.content}</p> : <p className="text-sm text-muted">Lume está pensando</p>) : <Markdown content={message.content} />}
                </div>
              )}
              {message.role === "assistant" && !streaming && message.content ? (
                <div className="mt-2 flex gap-1">
                  <button type="button" className="size-9 text-subtle" aria-label="Copiar" onClick={() => void navigator.clipboard.writeText(message.content)}><Copy className="mx-auto size-3.5" /></button>
                  {message.id === lastId ? <button type="button" className="size-9 text-subtle" aria-label="Gerar de novo" onClick={() => void regenerate()}><RefreshCw className="mx-auto size-3.5" /></button> : null}
                </div>
              ) : null}
            </article>
          );
        })}
        <div ref={bottomRef} />
      </div>
    </div>
  );
}
