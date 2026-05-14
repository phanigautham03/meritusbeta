import { createFileRoute } from "@tanstack/react-router";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Sparkles, Send } from "lucide-react";

export const Route = createFileRoute("/_app/ai-tutor")({ component: AITutor });

function AITutor() {
  return (
    <div className="max-w-4xl mx-auto space-y-6">
      <div className="flex items-center gap-3">
        <div className="h-10 w-10 rounded-lg bg-primary-light text-primary flex items-center justify-center"><Sparkles size={20}/></div>
        <div>
          <h1 className="text-2xl font-bold text-body">AI Tutor</h1>
          <p className="text-sm text-secondary-text">Ask anything about your syllabus. Powered by Claude.</p>
        </div>
      </div>

      <div className="bg-card border border-border rounded-xl p-6 shadow-card min-h-[400px] flex flex-col">
        <div className="flex-1 space-y-4">
          <div className="flex gap-3">
            <div className="h-8 w-8 rounded-full bg-primary text-white flex items-center justify-center font-bold text-sm shrink-0">AI</div>
            <div className="rounded-2xl rounded-tl-sm bg-primary-light p-4 text-sm text-body max-w-md">
              Hi Rahul 👋 I can help you understand any concept, solve problems, or build a study strategy. What are we working on today?
            </div>
          </div>
        </div>
        <div className="mt-4 flex gap-2">
          <Input placeholder="Ask about JEE, NEET, UPSC..." className="h-11 bg-[#F9FAFB]" />
          <Button className="h-11"><Send size={16}/></Button>
        </div>
      </div>
    </div>
  );
}
