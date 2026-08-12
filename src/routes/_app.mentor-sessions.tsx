import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import { useServerFn } from "@tanstack/react-start";
import { Users, Clock, Star, Sparkles, ArrowRight, Send, GraduationCap, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Link } from "@tanstack/react-router";
import { toast } from "sonner";
import { submitMentorInterest } from "@/lib/data.functions";

export const Route = createFileRoute("/_app/mentor-sessions")({
  component: MentorSessions,
  head: () => ({ meta: [{ title: "Mentors — Meritus" }] }),
});

const upcomingMentorTypes = [
  { icon: "🎯", label: "IIT / JEE Toppers", desc: "AIR < 500 mentors who cracked JEE Advanced" },
  { icon: "🩺", label: "NEET Rankers", desc: "AIIMS & top medical college admits" },
  { icon: "🏛️", label: "UPSC Officers", desc: "IAS / IPS / IFS officers sharing their strategy" },
  { icon: "📊", label: "CAT / MBA Experts", desc: "IIM graduates mentoring for CAT & GD-PI" },
];

type TabType = "student" | "mentor";

function MentorSessions() {
  const submitInterest = useServerFn(submitMentorInterest);
  const [tab, setTab] = useState<TabType>("student");
  const [exam, setExam] = useState("");
  const [message, setMessage] = useState("");
  const [contact, setContact] = useState("");
  const [busy, setBusy] = useState(false);
  const [submitted, setSubmitted] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!exam.trim()) return toast.error("Please enter your exam");
    setBusy(true);
    try {
      await submitInterest({ data: { type: tab, exam: exam.trim(), message: message.trim(), contact: contact.trim() } });
      setSubmitted(true);
      toast.success(tab === "student"
        ? "We'll notify you as soon as a mentor for your exam is available!"
        : "Thanks! We'll be in touch to onboard you as a mentor."
      );
    } catch (e: any) {
      toast.error(e.message ?? "Failed to submit. Try again.");
    } finally {
      setBusy(false);
    }
  }

  return (
    <div className="max-w-4xl mx-auto space-y-8">
      {/* Hero */}
      <div className="text-center py-10 px-6">
        <div className="inline-flex h-20 w-20 items-center justify-center rounded-full bg-primary-light mb-6">
          <Users className="text-primary" size={36} />
        </div>

        <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-gold-light border border-gold/20 text-gold text-xs font-bold mb-4">
          <Clock size={12} /> Coming Soon — Be First in Line
        </div>

        <h1 className="text-3xl md:text-4xl font-bold text-body mt-2">1-on-1 Mentor Sessions</h1>
        <p className="mt-4 text-secondary-text max-w-xl mx-auto text-base leading-relaxed">
          We're handpicking India's top toppers — IIT rankers, AIIMS admits, UPSC officers, and IIM grads — to mentor you personally.
          Register your interest now and get priority access when we launch.
        </p>
      </div>

      {/* Mentor types */}
      <div className="grid sm:grid-cols-2 gap-4">
        {upcomingMentorTypes.map((m) => (
          <div key={m.label} className="flex items-start gap-4 bg-card border border-border rounded-xl p-5 shadow-card">
            <span className="text-2xl shrink-0">{m.icon}</span>
            <div>
              <div className="font-semibold text-body text-sm">{m.label}</div>
              <div className="text-secondary-text text-xs mt-0.5">{m.desc}</div>
            </div>
          </div>
        ))}
      </div>

      {/* What you'll get */}
      <div className="bg-gradient-to-br from-primary-light to-violet-50 border border-primary/20 rounded-2xl p-8">
        <div className="flex items-center gap-2 mb-4">
          <Sparkles size={18} className="text-primary" />
          <span className="font-semibold text-body">What you'll get</span>
        </div>
        <ul className="space-y-3 text-sm text-body grid sm:grid-cols-2 gap-x-6">
          {[
            "45-minute personalised 1-on-1 video session",
            "Exam strategy tailored to your current level",
            "Study plan review and weak spot analysis",
            "Q&A — ask anything directly to a proven topper",
            "Session recording to revisit anytime",
            "WhatsApp follow-up support for 7 days",
          ].map((item) => (
            <li key={item} className="flex items-start gap-2">
              <Star size={14} className="text-gold fill-gold mt-0.5 shrink-0" />
              <span>{item}</span>
            </li>
          ))}
        </ul>
      </div>

      {/* Interest form */}
      <div className="bg-card border border-border rounded-2xl p-6 shadow-card">
        <h2 className="text-lg font-bold text-body mb-1">Register your interest</h2>
        <p className="text-sm text-secondary-text mb-5">
          Whether you need a mentor or want to become one — let us know. We'll reach out personally.
        </p>

        {/* Tabs */}
        <div className="flex gap-2 mb-6">
          <button
            onClick={() => setTab("student")}
            className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
              tab === "student"
                ? "bg-primary text-white"
                : "bg-muted text-secondary-text hover:text-body"
            }`}
          >
            <GraduationCap size={15} /> I want a mentor
          </button>
          <button
            onClick={() => setTab("mentor")}
            className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
              tab === "mentor"
                ? "bg-primary text-white"
                : "bg-muted text-secondary-text hover:text-body"
            }`}
          >
            <Star size={15} /> I want to mentor
          </button>
        </div>

        {submitted ? (
          <div className="text-center py-8">
            <div className="inline-flex h-14 w-14 rounded-full bg-success/10 items-center justify-center mb-3">
              <Star size={24} className="text-success fill-success" />
            </div>
            <h3 className="font-bold text-body text-lg">You're on the list!</h3>
            <p className="text-secondary-text text-sm mt-1 max-w-sm mx-auto">
              {tab === "student"
                ? "We'll match you with a mentor for your exam and notify you when sessions go live."
                : "Our team will review your profile and reach out to onboard you as a Meritus mentor."}
            </p>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-4 max-w-lg">
            <div>
              <Label>{tab === "student" ? "Which exam are you preparing for?" : "Which exam did you crack?"}</Label>
              <Input
                value={exam}
                onChange={(e) => setExam(e.target.value)}
                placeholder={tab === "student" ? "e.g. JEE Advanced, UPSC CSE, NEET UG" : "e.g. JEE Advanced AIR 234, UPSC IAS 2022"}
                className="mt-1.5 h-11"
                required
              />
            </div>
            <div>
              <Label>WhatsApp / email for us to reach you (optional)</Label>
              <Input
                value={contact}
                onChange={(e) => setContact(e.target.value)}
                placeholder="98xxxxxxxx or you@example.com"
                className="mt-1.5 h-11"
              />
            </div>
            <div>
              <Label>Anything else you'd like us to know? (optional)</Label>
              <Textarea
                value={message}
                onChange={(e) => setMessage(e.target.value)}
                placeholder={tab === "student"
                  ? "e.g. I need help with Inorganic Chemistry and revision strategy for the final month."
                  : "e.g. I cleared JEE Adv 2023 AIR 150, currently at IIT Bombay, free on weekends."}
                rows={3}
                className="mt-1.5 resize-none"
              />
            </div>
            <Button type="submit" disabled={busy} className="font-semibold">
              {busy
                ? <><Loader2 size={15} className="animate-spin mr-2" /> Submitting…</>
                : <><Send size={15} className="mr-2" /> Submit interest</>
              }
            </Button>
          </form>
        )}
      </div>

      {/* CTAs */}
      <div className="flex flex-col sm:flex-row gap-3 justify-center pb-4">
        <Link to="/upgrade">
          <Button className="h-11 px-7 font-semibold w-full sm:w-auto">
            Get Pro for priority access <ArrowRight className="ml-2" size={15} />
          </Button>
        </Link>
        <Link to="/dashboard">
          <Button variant="outline" className="h-11 px-7 w-full sm:w-auto">Back to Dashboard</Button>
        </Link>
      </div>
    </div>
  );
}
