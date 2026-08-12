import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Users, Share2, MessageCircle, Send, Copy, Check } from "lucide-react";
import { toast } from "sonner";
import { useAuth } from "@/integrations/external-supabase/auth-context";

export const Route = createFileRoute("/_app/study-groups")({
  component: StudyGroups,
  head: () => ({ meta: [{ title: "Study Groups — Meritus" }] }),
});

const EXAM_OPTIONS = [
  "JEE Main", "JEE Advanced", "NEET UG", "UPSC CSE", "GATE", "CAT", "SSC CGL", "IBPS PO", "CUET",
];

const GROUP_PROMPTS = [
  "📅 Daily study check-in — share what you studied today",
  "❓ Doubt clearing — post questions, solve together",
  "📊 Weekly mock test challenge — compare scores",
  "🔁 Forget-Meter sync — revise the same topics together",
  "🧠 Concept explanations — teach to remember better",
];

function copyToClipboard(text: string) {
  navigator.clipboard.writeText(text).then(() => toast.success("Link copied!")).catch(() => {
    const el = document.createElement("textarea");
    el.value = text;
    document.body.appendChild(el);
    el.select();
    document.execCommand("copy");
    document.body.removeChild(el);
    toast.success("Link copied!");
  });
}

function StudyGroups() {
  const { user } = useAuth();
  const [exam, setExam] = useState("JEE Main");
  const [groupName, setGroupName] = useState("");
  const [generated, setGenerated] = useState(false);
  const [copied, setCopied] = useState(false);

  const firstName = (user?.user_metadata?.full_name as string | undefined)?.split(" ")[0]
    ?? user?.email?.split("@")[0]
    ?? "Student";

  const inviteText = groupName
    ? `📚 Join my "${groupName}" study group on Meritus!\n\nWe're preparing for ${exam} together — daily check-ins, doubt clearing, and weekly mock challenges.\n\n👉 Join Meritus free: https://meritus.co.in\n\nMessage me once you sign up and I'll add you!`
    : `📚 ${firstName} is inviting you to study ${exam} together on Meritus!\n\nAI-powered mock tests, Forget-Meter, and daily study groups.\n\n👉 Join free: https://meritus.co.in`;

  function generate() {
    if (!exam) return toast.error("Pick an exam first");
    setGenerated(true);
  }

  function shareOnWhatsApp() {
    window.open(`https://wa.me/?text=${encodeURIComponent(inviteText)}`, "_blank", "noopener,noreferrer");
    toast.success("Opening WhatsApp!");
  }

  function shareOnTelegram() {
    window.open(`https://t.me/share/url?url=https://meritus.co.in&text=${encodeURIComponent(inviteText)}`, "_blank", "noopener,noreferrer");
    toast.success("Opening Telegram!");
  }

  function handleCopy() {
    copyToClipboard(inviteText);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  }

  return (
    <div className="max-w-3xl mx-auto space-y-6">
      <div className="flex items-center gap-3">
        <div className="h-10 w-10 rounded-lg bg-green-100 text-green-600 flex items-center justify-center">
          <Users size={20} />
        </div>
        <div>
          <h1 className="text-2xl font-bold text-body">Study Groups</h1>
          <p className="text-sm text-secondary-text">
            Invite friends to study together on WhatsApp or Telegram. Accountability makes toppers.
          </p>
        </div>
      </div>

      {/* Create group invite */}
      <div className="bg-card border border-border rounded-xl p-6 shadow-card space-y-4">
        <h2 className="font-semibold text-body">Create a study group invite</h2>

        <div className="grid sm:grid-cols-2 gap-4">
          <div>
            <Label>Exam you're preparing for</Label>
            <select
              value={exam}
              onChange={(e) => setExam(e.target.value)}
              className="mt-1.5 w-full h-11 rounded-md border border-input bg-background px-3 text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
            >
              {EXAM_OPTIONS.map((e) => <option key={e}>{e}</option>)}
            </select>
          </div>
          <div>
            <Label>Group name (optional)</Label>
            <Input
              value={groupName}
              onChange={(e) => setGroupName(e.target.value)}
              placeholder="e.g. JEE Final Push, NEET 2026 Batch"
              className="mt-1.5 h-11"
              maxLength={50}
            />
          </div>
        </div>

        <Button onClick={generate} className="font-semibold gap-2">
          <Users size={15} /> Generate invite
        </Button>

        {generated && (
          <div className="mt-2 space-y-4 border-t border-border pt-4">
            <div>
              <Label className="text-xs text-secondary-text mb-2 block">Your invite message (tap to edit)</Label>
              <textarea
                className="w-full text-sm text-body border border-border rounded-lg p-3 resize-none focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring bg-muted/30"
                rows={6}
                defaultValue={inviteText}
                id="invite-text"
                onChange={(e) => {
                  (window as any).__inviteText = e.target.value;
                }}
              />
            </div>

            <div className="flex flex-wrap gap-2">
              <Button
                className="gap-2 bg-green-600 hover:bg-green-700 text-white"
                onClick={shareOnWhatsApp}
              >
                <MessageCircle size={15} /> Share on WhatsApp
              </Button>
              <Button
                variant="outline"
                className="gap-2 border-blue-400 text-blue-600 hover:bg-blue-50"
                onClick={shareOnTelegram}
              >
                <Send size={15} /> Share on Telegram
              </Button>
              <Button
                variant="outline"
                className="gap-2"
                onClick={handleCopy}
              >
                {copied ? <Check size={15} className="text-success" /> : <Copy size={15} />}
                {copied ? "Copied!" : "Copy text"}
              </Button>
            </div>
          </div>
        )}
      </div>

      {/* Group study tips */}
      <div className="bg-card border border-border rounded-xl p-6 shadow-card">
        <h2 className="font-semibold text-body mb-4">What to do once your group is formed</h2>
        <div className="space-y-3">
          {GROUP_PROMPTS.map((p, i) => (
            <div key={i} className="flex items-start gap-3 p-3 rounded-lg bg-primary-light/40 border border-primary/10">
              <span className="h-6 w-6 rounded-full bg-primary text-white flex items-center justify-center text-xs font-bold shrink-0">
                {i + 1}
              </span>
              <span className="text-sm text-body">{p}</span>
              <button
                className="ml-auto shrink-0 text-secondary-text hover:text-primary transition-colors"
                title="Share this idea"
                onClick={() => {
                  const text = `💡 Study group idea for our ${exam} group:\n\n${p}\n\nLet's do this on Meritus! https://meritus.co.in`;
                  window.open(`https://wa.me/?text=${encodeURIComponent(text)}`, "_blank", "noopener,noreferrer");
                }}
              >
                <Share2 size={14} />
              </button>
            </div>
          ))}
        </div>
      </div>

      {/* Join Meritus Telegram community */}
      <div className="bg-gradient-to-r from-blue-50 to-indigo-50 border border-blue-200 rounded-xl p-5 flex flex-col sm:flex-row items-center justify-between gap-4">
        <div>
          <div className="font-semibold text-blue-800 text-sm flex items-center gap-2">
            <Send size={14} /> Join the Meritus Community on Telegram
          </div>
          <div className="text-blue-600 text-xs mt-1">
            Free mock links, toppers' strategies, doubt clearing — updated daily.
          </div>
        </div>
        <div className="flex flex-wrap gap-2 shrink-0">
          {[
            { label: "JEE", href: "https://t.me/meritusjee" },
            { label: "NEET", href: "https://t.me/meritusneet" },
            { label: "UPSC", href: "https://t.me/meritusupsc" },
          ].map((ch) => (
            <a
              key={ch.label}
              href={ch.href}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-1 px-3 py-1.5 rounded-full bg-blue-600 hover:bg-blue-700 text-white text-xs font-semibold transition-colors"
            >
              <Send size={10} /> {ch.label}
            </a>
          ))}
        </div>
      </div>
    </div>
  );
}
