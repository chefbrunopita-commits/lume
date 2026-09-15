export function cn(...parts: Array<string | false | null | undefined>) {
  return parts.filter(Boolean).join(" ");
}
export function uid() { return crypto.randomUUID(); }
export function titleFromPrompt(text: string) {
  const line = text.trim().split(/\n/)[0] ?? "";
  const compact = line.replace(/\s+/g, " ");
  if (compact.length <= 48) return compact || "Nova conversa";
  return `${compact.slice(0, 45).trimEnd()}…`;
}
