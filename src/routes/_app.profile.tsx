import { createFileRoute } from "@tanstack/react-router";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Switch } from "@/components/ui/switch";
import { Slider } from "@/components/ui/slider";
import { Edit2 } from "lucide-react";

export const Route = createFileRoute("/_app/profile")({
  component: Profile,
  head: () => ({
    meta: [
      { title: "Profile — Meritus" },
      { name: "description", content: "Update your profile, subscription, and study preferences." },
      { property: "og:title", content: "Profile — Meritus" },
      { property: "og:description", content: "Update your profile, subscription, and study preferences." },
      { property: "og:url", content: "https://meritusbeta.lovable.app/profile" },
      { property: "og:type", content: "website" },
    ],
    links: [{ rel: "canonical", href: "https://meritusbeta.lovable.app/profile" }],
  }),
});

function Profile() {
  return (
    <div className="max-w-6xl mx-auto grid lg:grid-cols-[300px_1fr] gap-6">
      <aside className="bg-card border border-border rounded-xl p-6 shadow-card text-center h-fit">
        <Avatar className="h-24 w-24 mx-auto">
          <AvatarFallback className="bg-gradient-to-br from-primary to-violet-600 text-white font-bold text-2xl">RK</AvatarFallback>
        </Avatar>
        <h2 className="mt-4 font-bold text-body text-lg">Rahul Kumar</h2>
        <p className="text-sm text-secondary-text">rahul.k@example.com</p>
        <div className="mt-3 inline-flex items-center px-3 py-1 rounded-full bg-primary-light text-primary text-xs font-bold">Free Plan</div>
        <Button variant="outline" className="mt-5 w-full border-primary text-primary hover:bg-primary-light"><Edit2 size={14} className="mr-1.5"/> Edit Profile</Button>
        <div className="mt-6 pt-6 border-t border-border space-y-3 text-sm text-left">
          <div className="flex justify-between"><span className="text-secondary-text">Merit Points</span><span className="font-bold text-gold">2,847</span></div>
          <div className="flex justify-between"><span className="text-secondary-text">Streak</span><span className="font-bold text-orange-600">14 days</span></div>
          <div className="flex justify-between"><span className="text-secondary-text">Global Rank</span><span className="font-bold text-primary">#142</span></div>
        </div>
      </aside>

      <div className="bg-card border border-border rounded-xl p-6 shadow-card">
        <Tabs defaultValue="personal">
          <TabsList className="bg-muted">
            <TabsTrigger value="personal">Personal Info</TabsTrigger>
            <TabsTrigger value="exams">Exam Preferences</TabsTrigger>
            <TabsTrigger value="notifs">Notifications</TabsTrigger>
            <TabsTrigger value="account">Account</TabsTrigger>
          </TabsList>

          <TabsContent value="personal" className="mt-6 space-y-4">
            <div className="grid sm:grid-cols-2 gap-4">
              <div><Label>Full name</Label><Input defaultValue="Rahul Kumar" className="mt-1.5 h-11" /></div>
              <div><Label>Mobile</Label><Input defaultValue="+91 98765 43210" className="mt-1.5 h-11" /></div>
              <div><Label>City</Label><Input defaultValue="Bengaluru" className="mt-1.5 h-11" /></div>
              <div><Label>State</Label><Input defaultValue="Karnataka" className="mt-1.5 h-11" /></div>
              <div><Label>Education</Label><Input defaultValue="Class 12" className="mt-1.5 h-11" /></div>
              <div><Label>User type</Label><Input defaultValue="Student" className="mt-1.5 h-11" /></div>
            </div>
            <Button className="font-semibold">Save changes</Button>
          </TabsContent>

          <TabsContent value="exams" className="mt-6 space-y-5">
            <div>
              <div className="flex justify-between"><Label>Study hours per day</Label><span className="text-sm font-bold text-primary">6 hrs</span></div>
              <Slider defaultValue={[6]} min={1} max={12} step={1} className="mt-3" />
            </div>
            <div>
              <Label>Target exams</Label>
              <div className="mt-2 flex flex-wrap gap-2">
                {["JEE Main", "JEE Advanced", "BITSAT"].map((e) => (
                  <span key={e} className="px-3 py-1.5 rounded-md bg-primary text-white text-sm font-medium">{e}</span>
                ))}
                <button className="px-3 py-1.5 rounded-md border border-dashed border-border text-secondary-text text-sm hover:bg-muted">+ Add exam</button>
              </div>
            </div>
            <Button className="font-semibold">Save preferences</Button>
          </TabsContent>

          <TabsContent value="notifs" className="mt-6 space-y-4">
            {[
              ["Streak reminders", "Daily reminder if you haven't studied"],
              ["Forget-Meter alerts", "When topics drop below 40% retention"],
              ["Test reminders", "Before scheduled mock tests"],
              ["Weekly progress digest", "Every Sunday morning"],
            ].map(([t, d]) => (
              <div key={t} className="flex items-center justify-between p-3 rounded-lg border border-border">
                <div>
                  <div className="font-medium text-body text-sm">{t}</div>
                  <div className="text-xs text-secondary-text">{d}</div>
                </div>
                <Switch defaultChecked />
              </div>
            ))}
          </TabsContent>

          <TabsContent value="account" className="mt-6 space-y-4">
            <div><Label>Current password</Label><Input type="password" className="mt-1.5 h-11" /></div>
            <div className="grid sm:grid-cols-2 gap-4">
              <div><Label>New password</Label><Input type="password" className="mt-1.5 h-11" /></div>
              <div><Label>Confirm</Label><Input type="password" className="mt-1.5 h-11" /></div>
            </div>
            <Button className="font-semibold">Update password</Button>
            <div className="mt-8 pt-6 border-t border-border">
              <h3 className="font-semibold text-danger">Danger zone</h3>
              <p className="text-sm text-secondary-text mt-1">Deleting your account is permanent and cannot be undone.</p>
              <Button variant="outline" className="mt-3 border-danger text-danger hover:bg-danger-light">Delete account</Button>
            </div>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}
