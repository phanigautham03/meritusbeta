import { createFileRoute } from "@tanstack/react-router";

type Msg = { role: "user" | "assistant"; content: string };

const SYSTEM_PROMPT =
  "You are an expert tutor for Indian competitive exams — JEE, NEET, UPSC, CAT, GATE, IBPS PO, SSC CGL, NEET PG, AIIMS PG. Explain concepts clearly, solve problems step by step, and give exam-specific tips.";

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

          const apiKey = process.env.LOVABLE_API_KEY;
          if (!apiKey) {
            return Response.json(
              { error: "AI is not configured" },
              { status: 500 },
            );
          }

          const res = await fetch(
            "https://ai.gateway.lovable.dev/v1/chat/completions",
            {
              method: "POST",
              headers: {
                Authorization: `Bearer ${apiKey}`,
                "Content-Type": "application/json",
              },
              body: JSON.stringify({
                model: "google/gemini-3-flash-preview",
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
            if (res.status === 402) {
              return Response.json(
                { error: "AI credits exhausted. Please add credits to continue." },
                { status: 402 },
              );
            }
            const t = await res.text();
            console.error("AI gateway error:", res.status, t);
            return Response.json(
              { error: "AI service unavailable" },
              { status: 502 },
            );
          }

          const json = (await res.json()) as {
            choices?: { message?: { content?: string } }[];
          };
          const reply = json.choices?.[0]?.message?.content ?? "";
          return Response.json({ reply });
        } catch (e) {
          console.error("ai-tutor error", e);
          return Response.json({ error: "Unexpected error" }, { status: 500 });
        }
      },
    },
  },
});