import { useState } from "react";
import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Slider } from "@/components/ui/slider";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { GraduationCap, Briefcase, Building2, Search, Sparkles, Check } from "lucide-react";
import { cn } from "@/lib/utils";

export const Route = createFileRoute("/onboarding")({ component: Onboarding });

const allExams = [
  "JEE Main", "JEE Advanced", "NEET UG", "NEET PG", "UPSC CSE", "UPSC CDS",
  "SSC CGL", "SSC CHSL", "IBPS PO", "IBPS Clerk", "SBI PO", "GATE CSE",
  "GATE ECE", "CAT", "XAT", "CUET", "NDA", "RRB NTPC", "RRB JE",
  "Karnataka CET", "Maharashtra CET", "BITSAT",
];

const recs = [
  { name: "JEE Main", match: 94, reason: "Your strong Math + Physics scores and PCM background make this an ideal fit." },
  { name: "BITSAT", match: 88, reason: "Similar prep overlaps with JEE — minimal extra effort, big upside." },
  { name: "GATE CSE", match: 76, reason: "If you're considering engineering postgrad, your aptitude profile aligns well." },
];

function Onboarding() {
  const [step, setStep] = useState(1);
  const [userType, setUserType] = useState("student");
  const [hours, setHours] = useState([6]);
  const [selected, setSelected] = useState<string[]>(["JEE Main"]);
  const [search, setSearch] = useState("");
  const [analysing, setAnalysing] = useState(false);
  const [done, setDone] = useState(false);
  const nav = useNavigate();

  const goto = (s: number) => {
    if (s === 3) {
      setStep(3);
      setAnalysing(true);
      setTimeout(() => { setAnalysing(false); setDone(true); }, 2200);
    } else setStep(s);
  };

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="bg-card border-b border-border">
        <div className="max-w-3xl mx-auto px-6 h-16 flex items-center justify-between">
          <Link to="/" className="flex items-center gap-2">
            <div className="h-9 w-9 rounded-md bg-primary flex items-center justify-center font-bold text-white">M</div>
            <span className="font-bold">Meritus</span>
          </Link>
          <span className="text-sm text-secondary-text">Step {step} of 3</span>
        </div>
        <div className="max-w-3xl mx-auto px-6 pb-4">
          <div className="flex items-center gap-2">
            {[1,2,3].map((n) => (
              <div key={n} className={cn("h-1.5 flex-1 rounded-full", n <= step ? "bg-primary" : "bg-border")} />
            ))}
          </div>
        </div>
      </header>

      <main className="max-w-3xl mx-auto px-6 py-10">
        {step === 1 && (
          <div className="bg-card border border-border rounded-xl p-7 shadow-card">
            <h1 className="text-2xl font-bold text-body">Tell us about yourself</h1>
            <p className="text-sm text-secondary-text mt-1">A few quick details so we can tailor your experience.</p>
            <div className="mt-6 space-y-5">
              <div className="grid sm:grid-cols-2 gap-4">
                <div><Label>Full name</Label><Input defaultValue="Rahul Kumar" className="mt-1.5 h-11" /></div>
                <div><Label>Mobile number</Label><Input placeholder="+91 98765 43210" className="mt-1.5 h-11" /></div>
              </div>

              <div>
                <Label>I am a...</Label>
                <div className="mt-2 grid sm:grid-cols-3 gap-3">
                  {[
                    { id: "student", label: "Student", icon: GraduationCap },
                    { id: "professional", label: "Working Professional", icon: Briefcase },
                    { id: "institute", label: "Institute", icon: Building2 },
                  ].map((o) => {
                    const Icon = o.icon;
                    const active = userType === o.id;
                    return (
                      <button
                        key={o.id}
                        type="button"
                        onClick={() => setUserType(o.id)}
                        className={cn(
                          "rounded-lg border p-4 text-left transition-all",
                          active ? "border-primary bg-primary-light shadow-[0_0_0_2px_rgba(67,56,202,0.15)]" : "border-border hover:border-indigo-200",
                        )}
                      >
                        <Icon size={20} className={active ? "text-primary" : "text-secondary-text"} />
                        <div className="mt-2 text-sm font-semibold text-body">{o.label}</div>
                      </button>
                    );
                  })}
                </div>
              </div>

              <div className="grid sm:grid-cols-2 gap-4">
                <div>
                  <Label>Education level</Label>
                  <Select defaultValue="12th">
                    <SelectTrigger className="mt-1.5 h-11"><SelectValue /></SelectTrigger>
                    <SelectContent>
                      <SelectItem value="10th">Class 10</SelectItem>
                      <SelectItem value="11th">Class 11</SelectItem>
                      <SelectItem value="12th">Class 12</SelectItem>
                      <SelectItem value="ug">Undergraduate</SelectItem>
                      <SelectItem value="pg">Postgraduate</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="grid grid-cols-2 gap-3">
                  <div><Label>City</Label><Input placeholder="Bengaluru" className="mt-1.5 h-11" /></div>
                  <div><Label>State</Label><Input placeholder="Karnataka" className="mt-1.5 h-11" /></div>
                </div>
              </div>

              <div>
                <div className="flex justify-between"><Label>Study hours per day</Label><span className="text-sm font-semibold text-primary">{hours[0]} hrs</span></div>
                <Slider value={hours} onValueChange={setHours} min={1} max={12} step={1} className="mt-3" />
                <div className="flex justify-between text-xs text-muted-text mt-1"><span>1 hr</span><span>12 hrs</span></div>
              </div>
            </div>
            <div className="mt-7 flex justify-end">
              <Button onClick={() => goto(2)} className="h-11 px-6 font-semibold">Continue</Button>
            </div>
          </div>
        )}

        {step === 2 && (
          <div className="bg-card border border-border rounded-xl p-7 shadow-card">
            <h1 className="text-2xl font-bold text-body">Which exams are you preparing for?</h1>
            <p className="text-sm text-secondary-text mt-1">Select all that apply. You can change this later.</p>
            <div className="relative mt-5">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-text" size={16} />
              <Input value={search} onChange={(e) => setSearch(e.target.value)} placeholder="Search exams..." className="pl-9 h-11 bg-[#F9FAFB]" />
            </div>
            <div className="mt-5 flex flex-wrap gap-2">
              {allExams.filter((e) => e.toLowerCase().includes(search.toLowerCase())).map((e) => {
                const on = selected.includes(e);
                return (
                  <button
                    key={e}
                    type="button"
                    onClick={() => setSelected((s) => on ? s.filter((x) => x !== e) : [...s, e])}
                    className={cn(
                      "inline-flex items-center gap-1.5 rounded-md border px-3 py-2 text-sm font-medium transition-colors",
                      on ? "bg-primary text-white border-primary" : "bg-card border-border text-body hover:border-indigo-200 hover:bg-primary-light",
                    )}
                  >
                    {on && <Check size={14} />} {e}
                  </button>
                );
              })}
            </div>
            {selected.length > 0 && (
              <div className="mt-7 rounded-lg bg-primary-light border border-indigo-100 p-4">
                <p className="text-xs font-semibold text-primary uppercase tracking-wide">Optional</p>
                <p className="text-sm text-body mt-1">Add target dates for selected exams to power your countdown and AI plan.</p>
                <div className="mt-3 grid sm:grid-cols-2 gap-3">
                  {selected.slice(0, 4).map((e) => (
                    <div key={e} className="flex items-center gap-2">
                      <span className="text-sm font-medium text-body w-32 truncate">{e}</span>
                      <Input type="date" className="h-10 flex-1 bg-card" />
                    </div>
                  ))}
                </div>
              </div>
            )}
            <div className="mt-7 flex justify-between">
              <Button variant="ghost" onClick={() => goto(1)}>Back</Button>
              <Button onClick={() => goto(3)} className="h-11 px-6 font-semibold" disabled={!selected.length}>Continue</Button>
            </div>
          </div>
        )}

        {step === 3 && (
          <div className="bg-card border border-border rounded-xl p-7 shadow-card">
            <div className="flex items-center gap-2">
              <span className="px-2 py-1 rounded-full bg-gold-light text-gold text-xs font-bold inline-flex items-center gap-1">
                <Sparkles size={12} /> EXAMMATCH AI
              </span>
            </div>
            <h1 className="text-2xl font-bold text-body mt-3">Let AI recommend the best exams for you</h1>
            <p className="text-sm text-secondary-text mt-1">Powered by Claude, tuned for Indian aspirants.</p>

            {analysing && (
              <div className="mt-10 flex flex-col items-center text-center py-10">
                <div className="h-14 w-14 rounded-full border-4 border-primary-light border-t-primary animate-spin" />
                <p className="mt-5 text-sm font-medium text-body">AI is analysing your profile…</p>
                <p className="text-xs text-secondary-text mt-1">This usually takes a few seconds.</p>
              </div>
            )}

            {done && (
              <div className="mt-6 space-y-3">
                {recs.map((r) => (
                  <div key={r.name} className="rounded-xl border border-border bg-card p-5 hover:border-indigo-200 hover:shadow-card-hover transition-all">
                    <div className="flex items-start justify-between gap-4">
                      <div>
                        <div className="flex items-center gap-2">
                          <span className="px-2 py-0.5 rounded-full bg-primary text-white text-xs font-bold">{r.match}% match</span>
                          <h3 className="font-semibold text-body">{r.name}</h3>
                        </div>
                        <p className="mt-2 text-sm text-secondary-text leading-relaxed">{r.reason}</p>
                      </div>
                      <Button variant="outline" size="sm" className="border-primary text-primary hover:bg-primary-light shrink-0">Add</Button>
                    </div>
                  </div>
                ))}
              </div>
            )}

            <div className="mt-8 flex justify-between">
              <Button variant="ghost" onClick={() => goto(2)}>Back</Button>
              <Button onClick={() => nav({ to: "/dashboard" })} className="h-11 px-6 font-semibold" disabled={!done}>Complete Setup</Button>
            </div>
          </div>
        )}
      </main>
    </div>
  );
}
