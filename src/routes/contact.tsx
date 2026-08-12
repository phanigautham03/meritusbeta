import { createFileRoute, Link } from "@tanstack/react-router";
import { MeritusLogo } from "@/components/meritus/MeritusLogo";
import { Button } from "@/components/ui/button";
import { Mail, MessageSquare, Building2, Bug, ArrowRight } from "lucide-react";

export const Route = createFileRoute("/contact")({
  component: Contact,
  head: () => ({
    meta: [
      { title: "Contact Meritus — We're Here to Help" },
      { name: "description", content: "Reach the Meritus team for student support, institute partnerships, feedback, or bug reports. We reply to every email." },
      { property: "og:title", content: "Contact Meritus — We're Here to Help" },
      { property: "og:description", content: "Reach the Meritus team for student support, institute partnerships, or feedback. We reply to every email." },
      { property: "og:url", content: "https://meritus.co.in/contact" },
      { property: "og:type", content: "website" },
      { property: "og:image", content: "https://meritus.co.in/og-image.png" },
      { name: "twitter:card", content: "summary" },
      { name: "twitter:title", content: "Contact Meritus" },
      { name: "twitter:description", content: "Reach the Meritus team for student support, institute partnerships, or feedback." },
    ],
    links: [{ rel: "canonical", href: "https://meritus.co.in/contact" }],
    scripts: [
      {
        type: "application/ld+json",
        children: JSON.stringify({
          "@context": "https://schema.org",
          "@type": "ContactPage",
          name: "Contact Meritus",
          url: "https://meritus.co.in/contact",
          description: "Contact the Meritus team for support, partnerships, and feedback.",
          publisher: {
            "@type": "Organization",
            name: "Meritus",
            url: "https://meritus.co.in/",
            email: "hello@meritus.co.in",
          },
        }),
      },
    ],
  }),
});

const channels = [
  {
    icon: MessageSquare,
    color: "bg-primary-light text-primary",
    title: "General enquiries",
    email: "hello@meritus.co.in",
    desc: "Questions about Meritus, your account, features, or anything else — this is your inbox.",
    sla: "Replies within 24 hours",
    cta: "Email us",
  },
  {
    icon: Mail,
    color: "bg-teal-50 text-teal",
    title: "Student support",
    email: "support@meritus.co.in",
    desc: "Stuck on a quiz? Payment issue? Account problem? Our support team has you covered.",
    sla: "Replies within 12 hours",
    cta: "Get support",
  },
  {
    icon: Building2,
    color: "bg-gold-light text-gold",
    title: "Institute partnerships",
    email: "institutes@meritus.co.in",
    desc: "Coaching institute? Want to onboard your students or explore the whitelabelled dashboard? Let's talk.",
    sla: "Replies within 4 business hours",
    cta: "Talk to us",
  },
  {
    icon: Bug,
    color: "bg-danger/10 text-danger",
    title: "Bug reports",
    email: "hello@meritus.co.in",
    desc: "Found something broken? Email us with steps to reproduce and we'll fix it — usually same day.",
    sla: "Critical bugs: same day",
    cta: "Report a bug",
  },
];

function Contact() {
  return (
    <div className="min-h-screen bg-background">
      {/* Nav */}
      <header className="border-b border-border bg-white sticky top-0 z-10">
        <div className="max-w-4xl mx-auto px-6 h-16 flex items-center justify-between">
          <Link to="/"><MeritusLogo size="sm" theme="light" /></Link>
          <div className="flex items-center gap-4">
            <Link to="/about" className="text-sm text-secondary-text hover:text-body">About</Link>
            <Link to="/signup"><Button size="sm">Start free</Button></Link>
          </div>
        </div>
      </header>

      {/* Hero */}
      <section className="bg-gradient-to-br from-navy to-primary text-white py-16 px-6">
        <div className="max-w-3xl mx-auto text-center">
          <h1 className="text-4xl font-bold">We read every email.</h1>
          <p className="mt-4 text-indigo-200 max-w-xl mx-auto">
            We're a small, focused team building something we genuinely believe in.
            Reach us directly — no bots, no ticket queues. A real person will reply.
          </p>
        </div>
      </section>

      {/* Contact channels */}
      <section className="py-16 px-6 max-w-4xl mx-auto">
        <div className="grid md:grid-cols-2 gap-5">
          {channels.map((c) => {
            const Icon = c.icon;
            return (
              <div key={c.title} className="bg-card border border-border rounded-xl p-6 shadow-card">
                <div className={`h-10 w-10 rounded-lg flex items-center justify-center mb-4 ${c.color}`}>
                  <Icon size={20} />
                </div>
                <h2 className="font-semibold text-body">{c.title}</h2>
                <p className="mt-2 text-sm text-secondary-text leading-relaxed">{c.desc}</p>
                <a
                  href={`mailto:${c.email}`}
                  className="mt-3 inline-flex items-center gap-1.5 text-sm font-semibold text-primary hover:underline"
                >
                  {c.email} <ArrowRight size={12} />
                </a>
                <div className="mt-3 text-xs text-secondary-text">{c.sla}</div>
              </div>
            );
          })}
        </div>
      </section>

      {/* WhatsApp CTA */}
      <section className="bg-green-50 border-y border-green-100 py-12 px-6">
        <div className="max-w-3xl mx-auto text-center">
          <h2 className="text-xl font-bold text-green-800">Prefer WhatsApp?</h2>
          <p className="mt-2 text-sm text-green-700">
            For institute inquiries, you can WhatsApp us directly. We're available Mon–Sat, 9am–7pm IST.
          </p>
          <a
            href="https://wa.me/919999999999?text=Hi%20Meritus%20team%2C%20I%20have%20a%20question%20about..."
            target="_blank"
            rel="noopener noreferrer"
          >
            <Button className="mt-5 bg-green-600 hover:bg-green-700 text-white font-semibold gap-2">
              <MessageSquare size={16} /> WhatsApp us — +91 99999 99999
            </Button>
          </a>
        </div>
      </section>

      {/* Feedback CTA */}
      <section className="py-14 px-6 max-w-3xl mx-auto text-center">
        <h2 className="text-xl font-bold text-body">Beta tester? Rate our features.</h2>
        <p className="mt-2 text-sm text-secondary-text">
          We built a dedicated feedback page for beta users — rate each feature, request new ones, and report bugs all in one place.
        </p>
        <Link to="/feedback">
          <Button size="lg" className="mt-5 gap-2">
            Open feedback page <ArrowRight size={16} />
          </Button>
        </Link>
      </section>

      {/* Footer */}
      <footer className="bg-[#0F0D2E] text-indigo-200 px-6 py-8 text-sm">
        <div className="max-w-4xl mx-auto flex flex-col sm:flex-row justify-between items-center gap-4">
          <MeritusLogo size="sm" theme="dark" />
          <div className="flex gap-6 text-xs">
            <Link to="/" className="hover:text-white">Home</Link>
            <Link to="/about" className="hover:text-white">About</Link>
            <Link to="/privacy" className="hover:text-white">Privacy</Link>
            <Link to="/terms" className="hover:text-white">Terms</Link>
          </div>
          <span className="text-xs text-indigo-400">© {new Date().getFullYear()} Meritus · Made in India 🇮🇳</span>
        </div>
      </footer>
    </div>
  );
}
