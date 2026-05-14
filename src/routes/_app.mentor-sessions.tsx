import { createFileRoute } from "@tanstack/react-router";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Star, Calendar as CalIcon, Video, Phone } from "lucide-react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { useState } from "react";
import { cn } from "@/lib/utils";

export const Route = createFileRoute("/_app/mentor-sessions")({
  component: Mentors,
  head: () => ({
    meta: [
      { title: "Mentors — Meritus" },
      { name: "description", content: "Book 1-on-1 sessions with toppers who cracked your target exam." },
      { property: "og:title", content: "Mentors — Meritus" },
      { property: "og:description", content: "Book 1-on-1 sessions with toppers who cracked your target exam." },
      { property: "og:url", content: "https://meritusbeta.lovable.app/mentor-sessions" },
      { property: "og:type", content: "website" },
    ],
    links: [{ rel: "canonical", href: "https://meritusbeta.lovable.app/mentor-sessions" }],
  }),
});

const mentors = [
  { name: "Aditya Verma", inst: "IIT Delhi", cleared: "Cleared JEE Advanced 2022 · AIR 142", rating: 4.9, sessions: 48, tags: ["Physics", "Maths", "Problem Solving"], price: 599, bio: "Specialised in mechanics and electrodynamics. Helped 200+ students crack JEE Advanced." },
  { name: "Meera Joshi", inst: "AIIMS Delhi", cleared: "Cleared NEET UG 2021 · AIR 89", rating: 4.8, sessions: 64, tags: ["Biology", "Chemistry"], price: 699, bio: "NEET strategy, NCERT-first approach. Crash-course expert for last-30-day prep." },
  { name: "Karan Bhatia", inst: "IIM Bangalore", cleared: "CAT 2022 · 99.87 %ile", rating: 5.0, sessions: 31, tags: ["VARC", "DILR", "Quant"], price: 899, bio: "Ex-McKinsey. CAT VARC and DI-LR mastery, MBA interview prep." },
  { name: "Anjali Saxena", inst: "LBSNAA", cleared: "UPSC CSE 2022 · AIR 47", rating: 4.9, sessions: 22, tags: ["GS", "Optional", "Essay"], price: 1299, bio: "IAS officer. Mains answer-writing and interview personality development." },
];

function Mentors() {
  return (
    <div className="max-w-6xl mx-auto space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-body">Mentor Sessions</h1>
        <p className="text-sm text-secondary-text mt-1">1-on-1 with toppers who cracked your target exam.</p>
      </div>

      <div className="bg-card border border-border rounded-xl p-4 shadow-card grid sm:grid-cols-4 gap-3">
        <Input placeholder="Filter by exam..." className="h-10" />
        <Input placeholder="Price range" className="h-10" />
        <Input placeholder="Min rating" className="h-10" />
        <Input placeholder="Availability" className="h-10" />
      </div>

      <div className="grid md:grid-cols-2 gap-4">
        {mentors.map((m) => (
          <div key={m.name} className="bg-card border border-border rounded-xl p-5 shadow-card hover:border-indigo-200 hover:shadow-card-hover hover:-translate-y-0.5 transition-all">
            <div className="flex gap-4">
              <Avatar className="h-16 w-16">
                <AvatarFallback className="bg-gradient-to-br from-primary to-violet-600 text-white font-bold text-lg">{m.name.split(" ").map(n=>n[0]).join("")}</AvatarFallback>
              </Avatar>
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 flex-wrap">
                  <h3 className="font-bold text-body">{m.name}</h3>
                  <span className="text-xs px-2 py-0.5 rounded-md bg-primary-light text-primary font-semibold">{m.inst}</span>
                </div>
                <p className="text-xs text-secondary-text mt-1">{m.cleared}</p>
                <div className="mt-2 flex items-center gap-3 text-xs">
                  <span className="inline-flex items-center gap-1 text-gold font-semibold"><Star size={12} className="fill-gold" /> {m.rating}</span>
                  <span className="text-secondary-text">{m.sessions} sessions</span>
                </div>
              </div>
              <div className="text-right shrink-0">
                <div className="font-bold text-body">₹{m.price}</div>
                <div className="text-[11px] text-secondary-text">/ session</div>
              </div>
            </div>
            <p className="mt-4 text-sm text-secondary-text leading-relaxed line-clamp-2">{m.bio}</p>
            <div className="mt-3 flex flex-wrap gap-1.5">
              {m.tags.map((t) => <span key={t} className="text-[11px] font-medium px-2 py-0.5 rounded-full bg-muted text-secondary-text">{t}</span>)}
            </div>
            <div className="mt-4 pt-4 border-t border-border">
              <BookDialog mentor={m.name} price={m.price} />
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

function BookDialog({ mentor, price }: { mentor: string; price: number }) {
  const slots = ["10:00 AM", "11:30 AM", "2:00 PM", "4:30 PM", "6:00 PM", "8:00 PM"];
  const [slot, setSlot] = useState<string | null>(null);
  const [type, setType] = useState<"video" | "voice">("video");
  return (
    <Dialog>
      <DialogTrigger asChild>
        <Button className="w-full bg-teal hover:bg-teal/90 text-white font-semibold">Book Session</Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-lg rounded-xl">
        <DialogHeader><DialogTitle>Book with {mentor}</DialogTitle></DialogHeader>
        <div className="space-y-4">
          <div>
            <label className="text-sm font-medium text-body flex items-center gap-1.5"><CalIcon size={14} /> Date</label>
            <Input type="date" className="mt-1.5 h-10" />
          </div>
          <div>
            <label className="text-sm font-medium text-body">Time slot</label>
            <div className="mt-2 grid grid-cols-3 gap-2">
              {slots.map((s) => (
                <button key={s} onClick={() => setSlot(s)} className={cn("h-9 rounded-md border text-sm font-medium", slot === s ? "border-primary bg-primary text-white" : "border-border hover:border-indigo-200 bg-card")}>{s}</button>
              ))}
            </div>
          </div>
          <div>
            <label className="text-sm font-medium text-body">Session type</label>
            <div className="mt-2 grid grid-cols-2 gap-2">
              <button onClick={() => setType("video")} className={cn("h-10 rounded-md border flex items-center justify-center gap-2 text-sm font-medium", type === "video" ? "border-primary bg-primary-light text-primary" : "border-border")}><Video size={14}/> Video</button>
              <button onClick={() => setType("voice")} className={cn("h-10 rounded-md border flex items-center justify-center gap-2 text-sm font-medium", type === "voice" ? "border-primary bg-primary-light text-primary" : "border-border")}><Phone size={14}/> Voice</button>
            </div>
          </div>
          <div className="flex items-center justify-between pt-3 border-t border-border">
            <div><div className="text-xs text-secondary-text">Total</div><div className="text-xl font-bold text-body">₹{price}</div></div>
            <Button className="font-semibold">Confirm Booking</Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
