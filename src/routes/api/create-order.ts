import { createFileRoute } from "@tanstack/react-router";

export const Route = createFileRoute("/api/create-order")({
  server: {
    handlers: {
      POST: async ({ request }) => {
        try {
          const body = (await request.json()) as { plan?: string; billing?: string };
          const plan = body.plan ?? "pro";
          const billing = body.billing ?? "monthly";

          const prices: Record<string, Record<string, number>> = {
            pro:   { monthly: 49900,  annual: 419300  }, // paise
            power: { monthly: 99900,  annual: 839300  },
          };

          const amount = prices[plan]?.[billing] ?? 49900;

          const keyId     = process.env.RAZORPAY_KEY_ID;
          const keySecret = process.env.RAZORPAY_KEY_SECRET;
          if (!keyId || !keySecret) {
            return Response.json({ error: "Razorpay not configured" }, { status: 500 });
          }

          const auth = btoa(`${keyId}:${keySecret}`);
          const res = await fetch("https://api.razorpay.com/v1/orders", {
            method: "POST",
            headers: {
              Authorization: `Basic ${auth}`,
              "Content-Type": "application/json",
            },
            body: JSON.stringify({
              amount,
              currency: "INR",
              receipt: `meritus_${plan}_${Date.now()}`,
              notes: { plan, billing },
            }),
          });

          if (!res.ok) {
            const t = await res.text();
            console.error("Razorpay create-order error:", res.status, t);
            return Response.json({ error: "Failed to create order" }, { status: 502 });
          }

          const order = await res.json();
          return Response.json({ orderId: order.id, amount, currency: "INR", keyId });
        } catch (e) {
          console.error("create-order error", e);
          return Response.json({ error: "Unexpected error" }, { status: 500 });
        }
      },
    },
  },
});
