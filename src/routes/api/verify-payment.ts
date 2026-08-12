import { createFileRoute } from "@tanstack/react-router";
import { createClient } from "@supabase/supabase-js";
import { buildUpgradeEmail } from "@/lib/email.functions";

async function hmacSHA256(secret: string, message: string): Promise<string> {
  const enc = new TextEncoder();
  const key = await crypto.subtle.importKey(
    "raw", enc.encode(secret), { name: "HMAC", hash: "SHA-256" }, false, ["sign"]
  );
  const sig = await crypto.subtle.sign("HMAC", key, enc.encode(message));
  return Array.from(new Uint8Array(sig)).map((b) => b.toString(16).padStart(2, "0")).join("");
}

async function sendUpgradeEmail(
  to: string,
  firstName: string,
  plan: "pro" | "power",
  paymentId: string,
  billing: "monthly" | "annual",
  amount: number,
): Promise<void> {
  const apiKey = process.env.RESEND_API_KEY;
  if (!apiKey) { console.warn("[email] RESEND_API_KEY not set"); return; }

  const { subject, html } = buildUpgradeEmail(firstName, plan, paymentId, billing, amount);

  const res = await fetch("https://api.resend.com/emails", {
    method: "POST",
    headers: {
      Authorization: `Bearer ${apiKey}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      from: "Meritus <noreply@meritus.co.in>",
      to: [to],
      subject,
      html,
    }),
  });

  if (!res.ok) console.error("[email] upgrade email failed:", await res.text());
  else console.log("[email] upgrade email sent to", to);
}

export const Route = createFileRoute("/api/verify-payment")({
  server: {
    handlers: {
      POST: async ({ request }) => {
        try {
          const body = (await request.json()) as {
            razorpay_order_id?: string;
            razorpay_payment_id?: string;
            razorpay_signature?: string;
            plan?: string;
            billing?: string;
            userId?: string;
            amount?: number;
          };

          const {
            razorpay_order_id, razorpay_payment_id, razorpay_signature,
            plan, billing, userId, amount,
          } = body;

          if (!razorpay_order_id || !razorpay_payment_id || !razorpay_signature || !userId) {
            return Response.json({ error: "Missing required fields" }, { status: 400 });
          }

          // Verify HMAC signature
          const keySecret = process.env.RAZORPAY_KEY_SECRET;
          if (!keySecret) return Response.json({ error: "Not configured" }, { status: 500 });

          const expected = await hmacSHA256(keySecret, `${razorpay_order_id}|${razorpay_payment_id}`);
          if (expected !== razorpay_signature) {
            return Response.json({ error: "Payment verification failed" }, { status: 400 });
          }

          const supabase = createClient(
            process.env.SUPABASE_URL!,
            process.env.SUPABASE_PUBLISHABLE_KEY!,
          );

          const newPlan = plan === "power" ? "power" : "pro";

          // Update user plan
          const { error: updateError } = await supabase
            .from("profiles")
            .update({ plan: newPlan, updated_at: new Date().toISOString() })
            .eq("id", userId);

          if (updateError) {
            console.error("Supabase update error:", updateError);
            return Response.json({ error: "Failed to upgrade plan" }, { status: 500 });
          }

          // Fetch user profile + email for the receipt email
          const { data: profile } = await supabase
            .from("profiles")
            .select("full_name")
            .eq("id", userId)
            .single();

          const { data: authUser } = await supabase.auth.admin
            ? await supabase.auth.getUser()
            : { data: null };

          // Best-effort: get email from auth user or fallback
          const userEmail = (authUser as any)?.user?.email ?? null;
          const firstName = ((profile?.full_name as string | undefined) ?? "there").split(" ")[0];

          if (userEmail) {
            await sendUpgradeEmail(
              userEmail,
              firstName,
              newPlan as "pro" | "power",
              razorpay_payment_id,
              (billing as "monthly" | "annual") ?? "monthly",
              amount ?? 0,
            ).catch(console.warn);
          }

          return Response.json({
            success: true,
            plan: newPlan,
            paymentId: razorpay_payment_id,
          });
        } catch (e) {
          console.error("verify-payment error", e);
          return Response.json({ error: "Unexpected error" }, { status: 500 });
        }
      },
    },
  },
});
