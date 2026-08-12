import { createFileRoute, Link } from "@tanstack/react-router";
import { MeritusLogo } from "@/components/meritus/MeritusLogo";

export const Route = createFileRoute("/refund")({
  component: Refund,
  head: () => ({
    meta: [
      { title: "Refund Policy — Meritus" },
      { name: "description", content: "Meritus's refund policy for Pro and Power subscriptions. 7-day money-back guarantee on first-time subscriptions." },
      { name: "twitter:card", content: "summary" },
      { name: "twitter:title", content: "Refund Policy — Meritus" },
      { name: "twitter:description", content: "Meritus's refund policy for Pro and Power subscriptions. 7-day money-back guarantee on first-time subscriptions." },
    ],
    links: [{ rel: "canonical", href: "https://meritus.co.in/refund" }],
  }),
});

function Refund() {
  return (
    <div className="min-h-screen bg-background">
      <header className="border-b border-border bg-white sticky top-0 z-10">
        <div className="max-w-4xl mx-auto px-6 h-16 flex items-center justify-between">
          <Link to="/"><MeritusLogo size="sm" theme="light" /></Link>
          <Link to="/" className="text-sm text-secondary-text hover:text-body">← Back to home</Link>
        </div>
      </header>

      <main className="max-w-4xl mx-auto px-6 py-12">
        <h1 className="text-3xl font-bold text-body mb-2">Refund Policy</h1>
        <p className="text-secondary-text text-sm mb-10">Last updated: {new Date().toLocaleDateString("en-IN", { day: "numeric", month: "long", year: "numeric" })}</p>

        <div className="space-y-8 text-body">

          <div className="bg-success-light border border-success/20 rounded-xl p-5">
            <p className="font-semibold text-success text-lg mb-1">7-Day Money-Back Guarantee</p>
            <p className="text-success/80 text-sm">Not satisfied within 7 days of your first subscription? We'll refund you — no questions asked.</p>
          </div>

          <section>
            <h2 className="text-xl font-semibold mb-3">Eligible Refunds</h2>
            <ul className="list-disc pl-5 space-y-2 text-secondary-text leading-relaxed">
              <li><strong>First-time subscriptions only:</strong> If you subscribed to Pro or Power for the first time and are not satisfied, request a refund within 7 days of purchase.</li>
              <li><strong>Technical failures:</strong> If you were charged but never received access to paid features due to a platform error, you are eligible for a full refund regardless of timing.</li>
              <li><strong>Duplicate charges:</strong> Accidental double-billing will always be refunded in full.</li>
            </ul>
          </section>

          <section>
            <h2 className="text-xl font-semibold mb-3">Non-Eligible Refunds</h2>
            <ul className="list-disc pl-5 space-y-2 text-secondary-text leading-relaxed">
              <li>Refund requests made after 7 days of the initial purchase.</li>
              <li>Subscription renewal charges (cancel before your renewal date to avoid being charged).</li>
              <li>Partial refunds for unused subscription periods — subscriptions run for the full billing cycle.</li>
              <li>Accounts found to have violated our Terms of Service.</li>
              <li>Mentor session fees once the session has been conducted.</li>
            </ul>
          </section>

          <section>
            <h2 className="text-xl font-semibold mb-3">How to Request a Refund</h2>
            <ol className="list-decimal pl-5 space-y-2 text-secondary-text leading-relaxed">
              <li>Email <a href="mailto:support@meritus.co.in" className="text-primary">support@meritus.co.in</a> with subject: <strong>"Refund Request — [your email]"</strong></li>
              <li>Include your registered email, payment ID (from your receipt), and reason for the refund.</li>
              <li>We will process your request within <strong>2 business days</strong> and initiate the refund via Razorpay.</li>
              <li>Refunds typically appear in your account within <strong>5–7 business days</strong> depending on your bank.</li>
            </ol>
          </section>

          <section>
            <h2 className="text-xl font-semibold mb-3">Cancellations</h2>
            <p className="text-secondary-text leading-relaxed">
              You can cancel your subscription at any time from <strong>Profile → Subscription</strong>.
              Cancellation takes effect at the end of your current billing period — you retain access
              until then. We do not charge cancellation fees.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-semibold mb-3">Contact</h2>
            <p className="text-secondary-text leading-relaxed">
              For refund queries: <a href="mailto:support@meritus.co.in" className="text-primary">support@meritus.co.in</a><br />
              We typically respond within 24 hours on business days (Monday–Saturday, 9am–6pm IST).
            </p>
          </section>

        </div>
      </main>

      <footer className="border-t border-border bg-white mt-16 py-6">
        <div className="max-w-4xl mx-auto px-6 flex flex-wrap gap-4 text-xs text-secondary-text justify-between items-center">
          <span>© {new Date().getFullYear()} Meritus. All rights reserved.</span>
          <div className="flex gap-4">
            <Link to="/privacy" className="hover:text-body">Privacy Policy</Link>
            <Link to="/terms" className="hover:text-body">Terms of Service</Link>
            <Link to="/refund" className="hover:text-body">Refund Policy</Link>
          </div>
        </div>
      </footer>
    </div>
  );
}
