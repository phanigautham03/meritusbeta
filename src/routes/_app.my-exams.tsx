import { createFileRoute } from "@tanstack/react-router";
import { Button } from "@/components/ui/button";
import { Plus, X, Calendar } from "lucide-react";
import { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

export const Route = createFileRoute("/_app/my-exams")({
  component: MyExams,
  head: () => ({
    meta: [
      { title: "My Exams — Meritus" },
      { name: "description", content: "Manage every exam you are prepping for in one personalised dashboard." },
      { property: "og:title", content: "My Exams — Meritus" },
      { property: "og:description", content: "Manage every exam you are prepping for in one personalised dashboard." },
      { property: "og:url", content: "https://meritusbeta.lovable.app/my-exams" },
      { property: "og:type", content: "website" },
    ],
    links: [{ rel: "canonical", href: "https://meritusbeta.lovable.app/my-exams" }],
  }),
});

function MyExams() {
  const [exams, setExams] = useState([
    { name: "JEE Main", date: "Apr 2, 2025", days: 47 },
    { name: "JEE Advanced", date: "Jun 17, 2025", days: 124 },
    { name: "BITSAT", date: "Aug 10, 2025", days: 178 },
  ]);

  return (
    <div className="max-w-6xl mx-auto space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-body">My Exams</h1>
          <p className="text-sm text-secondary-text mt-1">Track countdowns and prep progress for every exam.</p>
        </div>
        <Dialog>
          <DialogTrigger asChild>
            <Button className="font-semibold"><Plus size={16} className="mr-1" /> Add Exam</Button>
          </DialogTrigger>
          <DialogContent className="sm:max-w-md rounded-xl">
            <DialogHeader><DialogTitle>Add an exam</DialogTitle></DialogHeader>
            <div className="space-y-4 py-2">
              <div>
                <Label>Search exam</Label>
                <Input placeholder="JEE / NEET / UPSC..." className="mt-1.5 h-11" />
              </div>
              <div>
                <Label>Target date</Label>
                <Input type="date" className="mt-1.5 h-11" />
              </div>
              <Button className="w-full h-11 font-semibold">Add to my exams</Button>
            </div>
          </DialogContent>
        </Dialog>
      </div>

      {exams.length ? (
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
          {exams.map((e) => (
            <div key={e.name} className="bg-card border border-border rounded-xl p-5 shadow-card hover:border-indigo-200 hover:shadow-card-hover hover:-translate-y-0.5 transition-all">
              <div className="flex items-start justify-between">
                <div>
                  <h3 className="font-bold text-body text-lg">{e.name}</h3>
                  <p className="text-sm text-secondary-text mt-1 flex items-center gap-1.5"><Calendar size={14} /> {e.date}</p>
                </div>
                <button
                  onClick={() => setExams((x) => x.filter((a) => a.name !== e.name))}
                  className="p-1 rounded hover:bg-danger-light text-muted-text hover:text-danger"
                  aria-label="Remove"
                >
                  <X size={16} />
                </button>
              </div>
              <div className="mt-5 inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-primary-light text-primary text-sm font-bold">
                {e.days} days left
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="bg-card border border-border rounded-xl p-12 text-center shadow-card">
          <div className="mx-auto h-16 w-16 rounded-full bg-primary-light text-primary flex items-center justify-center">
            <Calendar size={28} />
          </div>
          <h3 className="mt-4 font-semibold text-body">No exams yet</h3>
          <p className="text-sm text-secondary-text mt-1">Add your first exam to start tracking countdowns.</p>
          <Button className="mt-5 font-semibold"><Plus size={16} className="mr-1" /> Add your first exam</Button>
        </div>
      )}
    </div>
  );
}
