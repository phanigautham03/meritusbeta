import { createFileRoute } from "@tanstack/react-router";

type Msg = { role: "user" | "assistant"; content: string };

const SYSTEM_PROMPT =
  "You are an expert tutor for Indian competitive exams — JEE, NEET, UPSC, CAT, GATE, IBPS PO, SSC CGL, NEET PG, AIIMS PG. Explain concepts clearly, solve problems step by step, and give exam-specific tips. Keep answers concise and focused.";

export const Route = createFileRoute("/api/ai-tutor")({
  server: {
    handlers: {
      POST: async ({ request }) => {
        try {
          const body = (await request.json()) as {
            message?: string;
            conversationHistory?: Msg[];
          };
          const message = (body.message ?? "").toString().trim();
          if (!message) {
            return Response.json({ error: "Empty message" }, { status: 400 });
          }
          const history = Array.isArray(body.conversationHistory)
            ? body.conversationHistory
                .filter(
                  (m) =>
                    m &&
                    (m.role === "user" || m.role === "assistant") &&
                    typeof m.content === "string",
                )
                .slice(-20)
            : [];

          // Try Anthropic Claude first, fall back to Lovable AI gateway
          const anthropicKey = process.env.ANTHROPIC_API_KEY;
          const lovableKey = process.env.LOVABLE_API_KEY;

          if (anthropicKey) {
            // Use Anthropic Claude API directly
            const res = await fetch("https://api.anthropic.com/v1/messages", {
              method: "POST",
              headers: {
                "x-api-key": anthropicKey,
                "anthropic-version": "2023-06-01",
                "content-type": "application/json",
              },
              body: JSON.stringify({
                model: "claude-sonnet-4-20250514",
                max_tokens: 1024,
                system: SYSTEM_PROMPT,
                messages: [
                  ...history.map((m) => ({ role: m.role, content: m.content })),
                  { role: "user", content: message },
                ],
              }),
            });

            if (!res.ok) {
              const t = await res.text();
              console.error("Anthropic API error:", res.status, t);
              return Response.json({ error: "AI service error" }, { status: 502 });
            }

            const json = (await res.json()) as {
              content?: { type: string; text: string }[];
            };
            const reply = json.content?.find((c) => c.type === "text")?.text ?? "";
            return Response.json({ reply });
          }

          if (lovableKey) {
            // Fall back to Lovable AI gateway
            const res = await fetch(
              "https://ai.gateway.lovable.dev/v1/chat/completions",
              {
                method: "POST",
                headers: {
                  Authorization: `Bearer ${lovableKey}`,
                  "Content-Type": "application/json",
                },
                body: JSON.stringify({
                  model: "google/gemini-2.5-flash",
                  messages: [
                    { role: "system", content: SYSTEM_PROMPT },
                    ...history,
                    { role: "user", content: message },
                  ],
                }),
              },
            );

            if (!res.ok) {
              if (res.status === 429) {
                return Response.json(
                  { error: "Rate limit exceeded. Please try again in a moment." },
                  { status: 429 },
                );
              }
              const t = await res.text();
              console.error("AI gateway error:", res.status, t);
              return Response.json({ error: "AI service unavailable" }, { status: 502 });
            }

            const json = (await res.json()) as {
              choices?: { message?: { content?: string } }[];
            };
            const reply = json.choices?.[0]?.message?.content ?? "";
            return Response.json({ reply });
          }

          return Response.json(
            { error: "AI is not configured. Please set ANTHROPIC_API_KEY in Lovable environment variables." },
            { status: 500 },
          );
        } catch (e) {
          console.error("ai-tutor error", e);
          return Response.json({ error: "Unexpected error" }, { status: 500 });
        }
      },
    },
  },
});
