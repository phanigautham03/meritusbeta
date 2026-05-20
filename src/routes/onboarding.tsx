import { useEffect, useMemo, useState } from "react";
import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { toast } from "sonner";
import { Loader2, Check, ArrowLeft } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { cn } from "@/lib/utils";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/integrations/external-supabase/auth-context";

export const Route = createFileRoute("/onboarding")({
  component: Onboarding,
  head: () => ({ meta: [{ title: "Get started — Meritus" }] }),
});

const EXAMS: { name: string; icon: string }[] = [
  { name: "JEE Main", icon: "⚛️" },
  { name: "NEET UG", icon: "🧬" },
  { name: "NEET PG", icon: "🏥" },
  { name: "AIIMS PG", icon: "🔬" },
  { name: "UPSC CSE", icon: "🏛️" },
  { name: "IBPS PO", icon: "🏦" },
  { name: "CAT", icon: "📊" },
  { name: "GATE CSE", icon: "💻" },
  { name: "SSC CGL", icon: "📋" },
];

function Onboarding() {
  const { user, loading: authLoading } = useAuth();
  const nav = useNavigate();
  const [step, setStep] = useState(1);
  const [selected, setSelected] = useState<string[]>([]);
  const [dates, setDates] = useState<Record<string, string>>({});
  const [name, setName] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (!authLoading && !user) nav({ to: "/login" });
  }, [authLoading, user, nav]);

  // Redirect if already onboarded
  useQuery({
    queryKey: ["onboarding-check", user?.id],
    enabled: !!user,
    queryFn: async () => {
      const { data } = await supabase
        .from("profiles")
        .select("onboarding_complete, full_name")
        .eq("id", user!.id)
        .maybeSingle();
      if (data?.onboarding_complete) nav({ to: "/dashboard" });
      if (data?.full_name) setName(data.full_name);
      return data;
    },
  });

  const today = useMemo(() => new Date().toISOString().slice(0, 10), []);

  const toggleExam = (exam: string) => {
    setError(null);
    setSelected((s) => (s.includes(exam) ? s.filter((x) => x !== exam) : [...s, exam]));
  };

  const handleNext = () => {
    if (selected.length === 0) {
      setError("Please select at least one exam");
      return;
    }
    setStep(2);
  };

  const handleSubmit = async () => {
    if (!name.trim()) {
      toast.error("Please enter your name");
      return;
    }
    if (!user) return;
    setSaving(true);
    try {
      const { error: pErr } = await supabase
        .from("profiles")
        .update({ full_name: name.trim(), onboarding_complete: true })
        .eq("id", user.id);
      if (pErr) throw pErr;

      const rows = selected.map((exam) => ({
        user_id: user.id,
        exam_name: exam,
        target_date: dates[exam] || null,
      }));
      if (rows.length) {
        const { error: eErr } = await supabase.from("user_exams").insert(rows);
        if (eErr) throw eErr;
      }
      if (typeof window !== "undefined") sessionStorage.removeItem("welcomed");
      nav({ to: "/dashboard" });
    } catch (e) {
      console.error(e);
      toast.error("Something went wrong — please try again.");
    } finally {
      setSaving(false);
    }
  };

  if (authLoading || !user) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#1E1B4B]">
        <Loader2 className="animate-spin text-white" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#1E1B4B] flex flex-col items-center px-4 py-8 font-sans">
      <div className="flex items-center gap-2 mb-6">
        <div className="h-9 w-9 rounded-md bg-white text-[#1E1B4B] flex items-center justify-center font-bold">M</div>
        <span className="font-bold text-white text-lg">Meritus</span>
      </div>

      <div className="w-full max-w-[560px] bg-white rounded-2xl shadow-2xl p-6 md:p-8 overflow-hidden">
        {/* Progress dots */}
        <div className="flex items-center justify-center gap-2 mb-6">
          {[1, 2].map((n) => (
            <div
              key={n}
              className={cn(
                "h-2 rounded-full transition-all",
                n === step ? "w-8 bg-[#4338CA]" : "w-2 bg-gray-300",
              )}
            />
          ))}
        </div>

        <div className="relative">
          <div
            key={step}
            className="animate-in slide-in-from-right-8 fade-in duration-300"
          >
            {step === 1 && (
              <div>
                <h1 className="text-2xl font-bold text-gray-900">Which exam are you preparing for?</h1>
                <p className="mt-2 text-sm text-gray-600">
                  We'll personalise your question bank and study plan around your exam.
                </p>

                <div className="mt-6 grid grid-cols-2 sm:grid-cols-3 gap-3">
                  {EXAMS.map((e) => {
                    const on = selected.includes(e.name);
                    return (
                      <button
                        key={e.name}
                        type="button"
                        onClick={() => toggleExam(e.name)}
                        className={cn(
                          "relative rounded-xl border-2 p-4 text-left transition-all hover:scale-[1.02]",
                          on
                            ? "border-[#4338CA] bg-[#F5F3FF]"
                            : "border-gray-200 bg-white hover:border-gray-300",
                        )}
                      >
                        {on && (
                          <div className="absolute top-2 right-2 h-5 w-5 rounded-full bg-[#4338CA] text-white flex items-center justify-center">
                            <Check size={12} />
                          </div>
                        )}
                        <div className="text-2xl">{e.icon}</div>
                        <div className={cn("mt-2 text-sm font-semibold", on ? "text-[#4338CA]" : "text-gray-900")}>
                          {e.name}
                        </div>
                      </button>
                    );
                  })}
                </div>

                {error && <p className="mt-3 text-sm text-red-600">{error}</p>}

                <Button
                  onClick={handleNext}
                  disabled={selected.length === 0}
                  className="mt-6 w-full h-12 bg-[#4338CA] hover:bg-[#3730A3] text-white font-semibold text-base"
                >
                  Next →
                </Button>
              </div>
            )}

            {step === 2 && (
              <div>
                <button
                  onClick={() => setStep(1)}
                  className="inline-flex items-center gap-1 text-sm text-gray-500 hover:text-gray-700 mb-3"
                >
                  <ArrowLeft size={14} /> Back
                </button>
                <h1 className="text-2xl font-bold text-gray-900">When is your exam?</h1>
                <p className="mt-2 text-sm text-gray-600">
                  We'll build your Forget-Meter and study reminders around this date.
                </p>

                <div className="mt-6 space-y-4">
                  {selected.map((exam) => (
                    <div key={exam}>
                      <Label className="text-sm font-medium text-gray-700">{exam} target date</Label>
                      <Input
                        type="date"
                        min={today}
                        value={dates[exam] || ""}
                        onChange={(e) =>
                          setDates((d) => ({ ...d, [exam]: e.target.value }))
                        }
                        className="mt-1.5 h-11"
                      />
                    </div>
                  ))}

                  <div className="pt-2">
                    <Label className="text-sm font-medium text-gray-700">Your name</Label>
                    <Input
                      value={name}
                      onChange={(e) => setName(e.target.value)}
                      placeholder="What should we call you?"
                      className="mt-1.5 h-11"
                      required
                    />
                  </div>
                </div>

                <Button
                  onClick={handleSubmit}
                  disabled={saving || !name.trim()}
                  className="mt-6 w-full h-12 bg-[#0D9488] hover:bg-[#0B7E74] text-white font-semibold text-base"
                >
                  {saving ? <Loader2 className="animate-spin" size={18} /> : "Start Learning →"}
                </Button>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}