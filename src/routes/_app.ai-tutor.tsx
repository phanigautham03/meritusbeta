import { useEffect, useMemo, useRef, useState } from "react";
import { createFileRoute } from "@tanstack/react-router";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Sparkles, Send, Loader2 } from "lucide-react";
import { useAuth } from "@/integrations/external-supabase/auth-context";
import { toast } from "sonner";

export const Route = createFileRoute("/_app/ai-tutor")({
  component: AITutor,
  head: () => ({
    meta: [
      { title: "AI Tutor — Meritus" },
      { name: "description", content: "Ask anything about JEE, NEET, UPSC and 200+ exams. AI-powered tutor that explains concepts and solves problems." },
      { property: "og:title", content: "AI Tutor — Meritus" },
      { property: "og:description", content: "Ask anything about JEE, NEET, UPSC and 200+ exams. AI-powered tutor that explains concepts and solves problems." },
      { property: "og:url", content: "https://meritusbeta.lovable.app/ai-tutor" },
      { property: "og:type", content: "website" },
    ],
    links: [{ rel: "canonical", href: "https://meritusbeta.lovable.app/ai-tutor" }],
  }),
});

type Msg = { role: "user" | "assistant"; content: string };

function AITutor() {
  const { user } = useAuth();
  const firstName = useMemo(() => {
    const meta = (user?.user_metadata ?? {}) as Record<string, unknown>;
    const raw =
      (meta.full_name as string | undefined) ||
      (meta.name as string | undefined) ||
      (user?.email ? user.email.split("@")[0] : "");
    return raw ? raw.split(" ")[0] : "there";
  }, [user]);

  const [messages, setMessages] = useState<Msg[]>([]);
  const [input, setInput] = useState("");
  const [sending, setSending] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    scrollRef.current?.scrollTo({ top: scrollRef.current.scrollHeight, behavior: "smooth" });
  }, [messages, sending]);

  async function send() {
    const text = input.trim();
    if (!text || sending) return;
    const nextHistory = [...messages, { role: "user" as const, content: text }];
    setMessages(nextHistory);
    setInput("");
    setSending(true);
    try {
      const res = await fetch("/api/ai-tutor", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ message: text, conversationHistory: messages }),
      });
      const json = await res.json().catch(() => ({} as any));
      if (!res.ok) {
        toast.error(json?.error ?? "AI tutor failed to reply");
        return;
      }
      const reply = (json.reply ?? "").toString();
      setMessages([...nextHistory, { role: "assistant", content: reply }]);
    } catch (e) {
      toast.error("Network error contacting AI tutor");
    } finally {
      setSending(false);
    }
  }

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      <div className="flex items-center gap-3">
        <div className="h-10 w-10 rounded-lg bg-primary-light text-primary flex items-center justify-center"><Sparkles size={20}/></div>
        <div>
          <h1 className="text-2xl font-bold text-body">AI Tutor</h1>
          <p className="text-sm text-secondary-text">Ask anything about your syllabus. AI-powered.</p>
        </div>
      </div>

      <div className="bg-card border border-border rounded-xl p-6 shadow-card min-h-[400px] flex flex-col">
        <div ref={scrollRef} className="flex-1 space-y-4 overflow-y-auto max-h-[60vh] pr-1">
          <div className="flex gap-3">
            <div className="h-8 w-8 rounded-full bg-primary text-white flex items-center justify-center font-bold text-sm shrink-0">AI</div>
            <div className="rounded-2xl rounded-tl-sm bg-primary-light p-4 text-sm text-body max-w-md whitespace-pre-wrap">
              Hi {firstName} 👋 I can help you understand any concept, solve problems, or build a study strategy. What are we working on today?
            </div>
          </div>

          {messages.map((m, i) => (
            <div key={i} className={`flex gap-3 ${m.role === "user" ? "justify-end" : ""}`}>
              {m.role === "assistant" && (
                <div className="h-8 w-8 rounded-full bg-primary text-white flex items-center justify-center font-bold text-sm shrink-0">AI</div>
              )}
              <div
                className={`rounded-2xl p-4 text-sm max-w-md whitespace-pre-wrap ${
                  m.role === "user"
                    ? "bg-primary text-white rounded-tr-sm"
                    : "bg-primary-light text-body rounded-tl-sm"
                }`}
              >
                {m.content}
              </div>
            </div>
          ))}

          {sending && (
            <div className="flex gap-3">
              <div className="h-8 w-8 rounded-full bg-primary text-white flex items-center justify-center font-bold text-sm shrink-0">AI</div>
              <div className="rounded-2xl rounded-tl-sm bg-primary-light p-4 text-sm text-secondary-text inline-flex items-center gap-2">
                <Loader2 size={14} className="animate-spin" /> Thinking…
              </div>
            </div>
          )}
        </div>
        <form
          className="mt-4 flex gap-2"
          onSubmit={(e) => {
            e.preventDefault();
            send();
          }}
        >
          <Input
            placeholder="Ask about JEE, NEET, UPSC..."
            className="h-11 bg-[#F9FAFB]"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            disabled={sending}
          />
          <Button type="submit" className="h-11" disabled={sending || !input.trim()}>
            {sending ? <Loader2 size={16} className="animate-spin" /> : <Send size={16} />}
          </Button>
        </form>
      </div>
    </div>
  );
}
