import { createFileRoute } from "@tanstack/react-router";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Crown, Trophy, Flame } from "lucide-react";
import { cn } from "@/lib/utils";

export const Route = createFileRoute("/_app/leaderboard")({ component: Leaderboard });

const top3 = [
  { rank: 2, name: "Aanya Gupta", city: "Delhi", points: 12480, color: "bg-zinc-300 text-zinc-800" },
  { rank: 1, name: "Vivaan Singh", city: "Pune", points: 14920, color: "bg-gold text-white" },
  { rank: 3, name: "Ishaan Mehta", city: "Mumbai", points: 11340, color: "bg-amber-700 text-white" },
];

const board = [
  { rank: 4, name: "Diya Reddy", city: "Hyderabad", points: 10980, streak: 28, exams: 3 },
  { rank: 5, name: "Kabir Sharma", city: "Jaipur", points: 10450, streak: 19, exams: 2 },
  { rank: 6, name: "Saanvi Iyer", city: "Chennai", points: 9870, streak: 22, exams: 4 },
  { rank: 7, name: "Aryan Patel", city: "Ahmedabad", points: 9210, streak: 14, exams: 2 },
  { rank: 142, name: "Rahul Kumar", city: "Bengaluru", points: 2847, streak: 14, exams: 3, you: true },
];

function Leaderboard() {
  return (
    <div className="max-w-6xl mx-auto space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-body">Leaderboard</h1>
        <p className="text-sm text-secondary-text mt-1">Compete with India's top aspirants. Earn merit points for tests, streaks and revisions.</p>
      </div>

      <Tabs defaultValue="week">
        <TabsList className="bg-card border border-border">
          <TabsTrigger value="week">This Week</TabsTrigger>
          <TabsTrigger value="month">This Month</TabsTrigger>
          <TabsTrigger value="all">All Time</TabsTrigger>
          <TabsTrigger value="exam">My Exam</TabsTrigger>
        </TabsList>
      </Tabs>

      {/* podium */}
      <div className="grid grid-cols-3 gap-4 items-end">
        {top3.map((p) => (
          <div key={p.rank} className={cn("bg-card border border-border rounded-xl p-5 text-center shadow-card", p.rank === 1 && "border-gold border-2 scale-105 shadow-card-hover")}>
            <div className={cn("mx-auto h-12 w-12 rounded-full flex items-center justify-center", p.color)}>
              <Crown size={20} />
            </div>
            <Avatar className={cn("mx-auto mt-3", p.rank === 1 ? "h-20 w-20" : "h-14 w-14")}>
              <AvatarFallback className="bg-gradient-to-br from-indigo-400 to-violet-500 text-white font-bold">{p.name.split(" ").map(n=>n[0]).join("")}</AvatarFallback>
            </Avatar>
            <div className="mt-3 font-bold text-body">{p.name}</div>
            <div className="text-xs text-secondary-text">{p.city}</div>
            <div className="mt-3 inline-flex items-center gap-1 px-2.5 py-1 rounded-full bg-gold-light text-gold text-sm font-bold">
              <Trophy size={12} /> {p.points.toLocaleString("en-IN")}
            </div>
            <div className="mt-2 label-caps text-secondary-text">Rank #{p.rank}</div>
          </div>
        ))}
      </div>

      {/* table */}
      <div className="bg-card border border-border rounded-xl shadow-card overflow-hidden">
        <table className="w-full text-sm">
          <thead className="bg-[#F9FAFB] text-secondary-text">
            <tr>
              <th className="text-left px-4 py-3 label-caps">Rank</th>
              <th className="text-left px-4 py-3 label-caps">Aspirant</th>
              <th className="text-right px-4 py-3 label-caps hidden sm:table-cell">Merit Points</th>
              <th className="text-right px-4 py-3 label-caps hidden md:table-cell">Streak</th>
              <th className="text-right px-4 py-3 label-caps hidden md:table-cell">Exams</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-border">
            {board.map((r) => (
              <tr key={r.rank} className={cn("hover:bg-primary-light/40", r.you && "bg-primary-light")}>
                <td className="px-4 py-3 font-bold text-body">#{r.rank}</td>
                <td className="px-4 py-3">
                  <div className="flex items-center gap-3">
                    <Avatar className="h-8 w-8"><AvatarFallback className="bg-gradient-to-br from-indigo-400 to-violet-500 text-white text-xs font-bold">{r.name.split(" ").map(n=>n[0]).join("")}</AvatarFallback></Avatar>
                    <div>
                      <div className="font-medium text-body">{r.name} {r.you && <span className="ml-1 text-xs text-primary font-bold">YOU</span>}</div>
                      <div className="text-xs text-secondary-text">{r.city}</div>
                    </div>
                  </div>
                </td>
                <td className="px-4 py-3 text-right font-bold text-body hidden sm:table-cell">{r.points.toLocaleString("en-IN")}</td>
                <td className="px-4 py-3 text-right hidden md:table-cell"><span className="inline-flex items-center gap-1 text-orange-600 font-semibold"><Flame size={12}/>{r.streak}</span></td>
                <td className="px-4 py-3 text-right text-secondary-text hidden md:table-cell">{r.exams}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
