import { createFileRoute, Link } from "@tanstack/react-router";
import { MeritusLogo } from "@/components/meritus/MeritusLogo";

export const Route = createFileRoute("/terms")({
  component: Terms,
  head: () => ({
    meta: [
      { title: "Terms of Service — Meritus" },
      { name: "description", content: "Read Meritus's terms of service. Understand your rights and responsibilities when using our AI-powered exam preparation platform." },
      { name: "twitter:card", content: "summary" },
      { name: "twitter:title", content: "Terms of Service — Meritus" },
      { name: "twitter:description", content: "Read Meritus's terms of service. Understand your rights and responsibilities when using our AI-powered exam preparation platform." },
    ],
    links: [{ rel: "canonical", href: "https://meritus.co.in/terms" }],
  }),
});

function Terms() {
  return (
    <div className="min-h-screen bg-background">
      <header className="border-b border-border bg-white sticky top-0 z-10">
        <div className="max-w-4xl mx-auto px-6 h-16 flex items-center justify-between">
          <Link to="/"><MeritusLogo size="sm" theme="light" /></Link>
          <Link to="/" className="text-sm text-secondary-text hover:text-body">← Back to home</Link>
        </div>
      </header>

      <main className="max-w-4xl mx-auto px-6 py-12">
        <h1 className="text-3xl font-bold text-body mb-2">Terms of Service</h1>
        <p className="text-secondary-text text-sm mb-10">Last updated: {new Date().toLocaleDateString("en-IN", { day: "numeric", month: "long", year: "numeric" })}</p>

        <div className="prose prose-slate max-w-none space-y-8 text-body">

          <section>
            <h2 className="text-xl font-semibold mb-3">1. Acceptance of Terms</h2>
            <p className="text-secondary-text leading-relaxed">
              By accessing or using Meritus at <strong>meritus.co.in</strong> ("Platform"), you agree to
              be bound by these Terms of Service. If you do not agree, do not use the Platform. These terms
              are governed by the laws of India.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-semibold mb-3">2. Eligibility</h2>
            <p className="text-secondary-text leading-relaxed">
              You must be at least 13 years old to use Meritus. If you are under 18, you confirm that you
              have parental or guardian consent. By using the Platform, you represent that you meet these
              requirements.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-semibold mb-3">3. Your Account</h2>
            <ul className="list-disc pl-5 space-y-2 text-secondary-text leading-relaxed">
              <li>You are responsible for maintaining the confidentiality of your account credentials.</li>
              <li>You are responsible for all activity that occurs under your account.</li>
              <li>Notify us immediately at <a href="mailto:support@meritus.co.in" className="text-primary">support@meritus.co.in</a> if you suspect unauthorised access.</li>
              <li>You may not share your account or transfer it to another person.</li>
              <li>One person may maintain only one free account. Multiple accounts to exploit free-tier limits are prohibited.</li>
            </ul>
          </section>

          <section>
            <h2 className="text-xl font-semibold mb-3">4. Permitted Use</h2>
            <p className="text-secondary-text leading-relaxed mb-3">You may use Meritus solely for personal, non-commercial exam preparation. You must not:</p>
            <ul className="list-disc pl-5 space-y-2 text-secondary-text leading-relaxed">
              <li>Copy, scrape, or reproduce our question bank, AI-generated content, or any Platform content.</li>
              <li>Reverse-engineer, decompile, or attempt to extract source code from the Platform.</li>
              <li>Use automated tools (bots, scripts) to interact with the Platform.</li>
              <li>Share login credentials or allow others to access your account.</li>
              <li>Use the Platform in any way that violates applicable laws or regulations.</li>
              <li>Upload, post, or transmit any harmful, defamatory, or illegal content.</li>
            </ul>
          </section>

          <section>
            <h2 className="text-xl font-semibold mb-3">5. Subscriptions & Payments</h2>
            <ul className="list-disc pl-5 space-y-2 text-secondary-text leading-relaxed">
              <li>Paid plans (Pro, Power) are billed monthly or annually via Razorpay.</li>
              <li>Subscriptions auto-renew unless cancelled before the renewal date.</li>
              <li>You can cancel at any time from your Profile settings.</li>
              <li>All prices are in Indian Rupees (INR) and inclusive of applicable taxes.</li>
              <li>We reserve the right to change pricing with 30 days' notice to active subscribers.</li>
            </ul>
          </section>

          <section>
            <h2 className="text-xl font-semibold mb-3">6. Refund Policy</h2>
            <p className="text-secondary-text leading-relaxed">
              Please see our <Link to="/refund" className="text-primary">Refund Policy</Link> for full details.
              In summary: we offer a 7-day refund on first-time subscriptions if you are not satisfied.
              No refunds after 7 days or on renewal charges.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-semibold mb-3">7. Intellectual Property</h2>
            <p className="text-secondary-text leading-relaxed">
              All content on Meritus — including the question bank, AI-generated explanations, study plans,
              UI designs, logos, and branding — is owned by Meritus and protected under Indian copyright law.
              Your personal study data (answers, scores, notes) remains yours. We do not claim ownership
              of content you create.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-semibold mb-3">8. AI-Generated Content Disclaimer</h2>
            <p className="text-secondary-text leading-relaxed">
              Meritus uses AI to generate explanations, study plans, and recommendations. While we strive
              for accuracy, AI-generated content may occasionally contain errors. We are not liable for
              any inaccuracy in AI-generated content. Always verify critical information from authoritative
              sources. AI content does not constitute professional academic counselling.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-semibold mb-3">9. Limitation of Liability</h2>
            <p className="text-secondary-text leading-relaxed">
              To the maximum extent permitted by Indian law, Meritus is not liable for: indirect, incidental,
              or consequential damages; loss of data; exam results or outcomes; or service interruptions.
              Our total liability in any case is limited to the amount you paid us in the 3 months prior
              to the claim.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-semibold mb-3">10. Termination</h2>
            <p className="text-secondary-text leading-relaxed">
              We reserve the right to suspend or terminate your account if you violate these Terms.
              You may delete your account at any time from Profile settings. Upon termination,
              your right to use the Platform ceases immediately.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-semibold mb-3">11. Governing Law & Disputes</h2>
            <p className="text-secondary-text leading-relaxed">
              These Terms are governed by the laws of India. Any disputes shall be subject to the
              exclusive jurisdiction of the courts in India. We encourage you to contact us first
              at <a href="mailto:support@meritus.co.in" className="text-primary">support@meritus.co.in</a> — most
              issues can be resolved without formal proceedings.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-semibold mb-3">12. Changes to Terms</h2>
            <p className="text-secondary-text leading-relaxed">
              We may update these Terms from time to time. We will notify users of material changes
              via email and by updating the "Last updated" date. Continued use after changes take
              effect constitutes acceptance.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-semibold mb-3">13. Contact</h2>
            <p className="text-secondary-text leading-relaxed">
              Questions about these Terms: <a href="mailto:support@meritus.co.in" className="text-primary">support@meritus.co.in</a><br />
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
