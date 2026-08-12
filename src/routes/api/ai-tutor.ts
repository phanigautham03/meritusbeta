import { createFileRoute } from "@tanstack/react-router";

type Msg = { role: "user" | "assistant"; content: string };

function buildSystemPrompt(userExams: string[]): string {
  const examList = userExams.length > 0
    ? userExams.join(", ")
    : "JEE, NEET, UPSC, CAT, GATE, IBPS PO, SSC CGL, NEET PG, INICET";
  return `You are an expert tutor specialising in ${examList}. Focus exclusively on topics, concepts, and problems relevant to these exams. If asked about an unrelated exam, politely redirect the student to their chosen exams. Explain concepts clearly, solve problems step by step, and give exam-specific tips. Keep answers concise and focused.`;
}

export const Route = createFileRoute("/api/ai-tutor")({
  server: {
    handlers: {
      POST: async ({ request }) => {
        try {
          const body = (await request.json()) as {
            message?: string;
            conversationHistory?: Msg[];
            userExams?: string[];
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
          const SYSTEM_PROMPT = buildSystemPrompt(Array.isArray(body.userExams) ? body.userExams : []);

          const anthropicKey = process.env.ANTHROPIC_API_KEY;

          if (anthropicKey) {
            const res = await fetch("https://api.anthropic.com/v1/messages", {
              method: "POST",
              headers: {
                "x-api-key": anthropicKey,
                "anthropic-version": "2023-06-01",
                "content-type": "application/json",
              },
              body: JSON.stringify({
                model: "claude-sonnet-4-6",
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

          return Response.json(
            { error: "AI is not configured. Please set ANTHROPIC_API_KEY." },
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
