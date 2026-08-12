import { createFileRoute, Link } from "@tanstack/react-router";
import { MeritusLogo } from "@/components/meritus/MeritusLogo";

export const Route = createFileRoute("/privacy")({
  component: Privacy,
  head: () => ({
    meta: [
      { title: "Privacy Policy — Meritus" },
      { name: "description", content: "Read Meritus's privacy policy. Learn how we collect, use, and protect your personal data in compliance with Indian data protection laws." },
      { name: "twitter:card", content: "summary" },
      { name: "twitter:title", content: "Privacy Policy — Meritus" },
      { name: "twitter:description", content: "Read Meritus's privacy policy. Learn how we collect, use, and protect your personal data in compliance with Indian data protection laws." },
    ],
    links: [{ rel: "canonical", href: "https://meritus.co.in/privacy" }],
  }),
});

function Privacy() {
  return (
    <div className="min-h-screen bg-background">
      <header className="border-b border-border bg-white sticky top-0 z-10">
        <div className="max-w-4xl mx-auto px-6 h-16 flex items-center justify-between">
          <Link to="/"><MeritusLogo size="sm" theme="light" /></Link>
          <Link to="/" className="text-sm text-secondary-text hover:text-body">← Back to home</Link>
        </div>
      </header>

      <main className="max-w-4xl mx-auto px-6 py-12">
        <h1 className="text-3xl font-bold text-body mb-2">Privacy Policy</h1>
        <p className="text-secondary-text text-sm mb-10">Last updated: {new Date().toLocaleDateString("en-IN", { day: "numeric", month: "long", year: "numeric" })}</p>

        <div className="prose prose-slate max-w-none space-y-8 text-body">

          <section>
            <h2 className="text-xl font-semibold mb-3">1. Who We Are</h2>
            <p className="text-secondary-text leading-relaxed">
              Meritus ("we", "our", "us") is an AI-powered competitive exam preparation platform operated
              at <strong>meritus.co.in</strong>. We help Indian students prepare for JEE, NEET, UPSC,
              GATE, CAT, Banking, SSC and 200+ competitive exams. If you have questions about this policy,
              contact us at <a href="mailto:privacy@meritus.co.in" className="text-primary">privacy@meritus.co.in</a>.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-semibold mb-3">2. Information We Collect</h2>
            <ul className="list-disc pl-5 space-y-2 text-secondary-text leading-relaxed">
              <li><strong>Account information:</strong> Name, email address, and password when you register.</li>
              <li><strong>Profile data:</strong> Education level, city, state, study hours, target exams — collected during onboarding to personalise your experience.</li>
              <li><strong>Usage data:</strong> Mock test attempts, quiz answers, scores, time spent per question, and study session logs.</li>
              <li><strong>Payment data:</strong> We use Razorpay as our payment processor. We do not store your card number or bank details — Razorpay handles all sensitive payment data under PCI-DSS compliance.</li>
              <li><strong>Device & technical data:</strong> IP address, browser type, operating system, and page views collected automatically for analytics and security.</li>
            </ul>
          </section>

          <section>
            <h2 className="text-xl font-semibold mb-3">3. How We Use Your Information</h2>
            <ul className="list-disc pl-5 space-y-2 text-secondary-text leading-relaxed">
              <li>Provide, personalise, and improve our exam prep services.</li>
              <li>Power AI features: ExamMatch, Forget-Meter, AI Study Planner, and AI Tutor.</li>
              <li>Process payments and send receipts.</li>
              <li>Send transactional emails (account confirmation, password reset, payment receipts).</li>
              <li>Send study reminders and performance reports (opt-out available in settings).</li>
              <li>Analyse aggregate usage to improve our question bank and platform.</li>
              <li>Detect and prevent fraud and abuse.</li>
            </ul>
          </section>

          <section>
            <h2 className="text-xl font-semibold mb-3">4. Data Sharing</h2>
            <p className="text-secondary-text leading-relaxed mb-3">We do <strong>not</strong> sell your personal data. We share data only with:</p>
            <ul className="list-disc pl-5 space-y-2 text-secondary-text leading-relaxed">
              <li><strong>Supabase</strong> — our database and authentication provider (servers in EU/US).</li>
              <li><strong>Razorpay</strong> — payment processing (India-based, RBI regulated).</li>
              <li><strong>Anthropic / Google</strong> — AI model providers for generating study content and AI Tutor responses. Only anonymised query content is sent; no personal identifiers.</li>
              <li><strong>Resend</strong> — transactional email delivery.</li>
              <li><strong>PostHog</strong> — anonymised product analytics.</li>
              <li><strong>OneSignal</strong> — push notification delivery.</li>
            </ul>
          </section>

          <section>
            <h2 className="text-xl font-semibold mb-3">5. Data Retention</h2>
            <p className="text-secondary-text leading-relaxed">
              We retain your account data for as long as your account is active. If you delete your account,
              we delete your personal data within 30 days, except where required by law (e.g., payment
              records retained for 7 years under Indian accounting law).
            </p>
          </section>

          <section>
            <h2 className="text-xl font-semibold mb-3">6. Your Rights (DPDP Act, 2023)</h2>
            <p className="text-secondary-text leading-relaxed mb-3">Under India's Digital Personal Data Protection Act, 2023, you have the right to:</p>
            <ul className="list-disc pl-5 space-y-2 text-secondary-text leading-relaxed">
              <li><strong>Access</strong> your personal data we hold.</li>
              <li><strong>Correct</strong> inaccurate data (available in Profile settings).</li>
              <li><strong>Erase</strong> your data — email <a href="mailto:privacy@meritus.co.in" className="text-primary">privacy@meritus.co.in</a>.</li>
              <li><strong>Withdraw consent</strong> for optional processing at any time.</li>
              <li><strong>Nominate</strong> a representative to exercise these rights on your behalf.</li>
            </ul>
          </section>

          <section>
            <h2 className="text-xl font-semibold mb-3">7. Cookies</h2>
            <p className="text-secondary-text leading-relaxed">
              We use strictly necessary cookies for authentication sessions, and optional analytics cookies
              (PostHog). You can disable optional cookies in your browser settings. We do not use
              advertising or tracking cookies.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-semibold mb-3">8. Security</h2>
            <p className="text-secondary-text leading-relaxed">
              All data is transmitted over HTTPS. Passwords are hashed using bcrypt. We use Supabase's
              Row Level Security (RLS) to ensure users can only access their own data. We conduct
              regular security reviews.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-semibold mb-3">9. Children's Privacy</h2>
            <p className="text-secondary-text leading-relaxed">
              Meritus is intended for users aged 13 and above. We do not knowingly collect data from
              children under 13. If you believe a child has provided us with personal data, contact us
              immediately at <a href="mailto:privacy@meritus.co.in" className="text-primary">privacy@meritus.co.in</a>.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-semibold mb-3">10. Changes to This Policy</h2>
            <p className="text-secondary-text leading-relaxed">
              We may update this policy periodically. We will notify registered users of material changes
              via email. Continued use of Meritus after the effective date constitutes acceptance of the
              updated policy.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-semibold mb-3">11. Contact Us</h2>
            <p className="text-secondary-text leading-relaxed">
              For privacy-related questions or requests: <a href="mailto:privacy@meritus.co.in" className="text-primary">privacy@meritus.co.in</a><br />
              Meritus, India
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
