import { createFileRoute } from "@tanstack/react-router";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { useServerFn } from "@tanstack/react-start";
import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Slider } from "@/components/ui/slider";
import { Loader2 } from "lucide-react";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";
import { getMyProfile, updateMyProfile } from "@/lib/data.functions";

export const Route = createFileRoute("/_app/profile")({
  component: Profile,
  head: () => ({
    meta: [
      { title: "Profile — Meritus" },
      { name: "description", content: "Update your profile, subscription, and study preferences." },
    ],
  }),
});

function Profile() {
  const qc = useQueryClient();
  const fetchProfile = useServerFn(getMyProfile);
  const saveProfile = useServerFn(updateMyProfile);
  const { data, isLoading } = useQuery({ queryKey: ["my-profile"], queryFn: () => fetchProfile() });

  const [email, setEmail] = useState<string>("");
  useEffect(() => { supabase.auth.getUser().then(({ data }) => setEmail(data.user?.email ?? "")); }, []);

  const [form, setForm] = useState<any>({});
  useEffect(() => { if (data?.profile) setForm(data.profile); }, [data?.profile]);

  const [saving, setSaving] = useState(false);

  if (isLoading || !data) {
    return <div className="p-8 text-secondary-text"><Loader2 className="animate-spin inline mr-2" size={16}/> Loading profile…</div>;
  }

  const initials = (form.full_name || form.first_name || form.display_name || "?").trim().split(/\s+/).slice(0, 2).map((s: string) => s[0]?.toUpperCase()).join("") || "?";
  const merit = data.streak?.merit_points ?? form.merit_points ?? 0;
  const streak = data.streak?.current_streak ?? 0;
  const planLabel = (form.plan ?? "free").replace(/^./, (c: string) => c.toUpperCase()) + " Plan";

  async function save(patch: any) {
    setSaving(true);
    try { await saveProfile({ data: patch }); toast.success("Saved"); qc.invalidateQueries({ queryKey: ["my-profile"] }); }
    catch (e: any) { toast.error(e.message); }
    finally { setSaving(false); }
  }

  return (
    <div className="max-w-6xl mx-auto grid lg:grid-cols-[300px_1fr] gap-6">
      <aside className="bg-card border border-border rounded-xl p-6 shadow-card text-center h-fit">
        <Avatar className="h-24 w-24 mx-auto">
          <AvatarFallback className="bg-gradient-to-br from-primary to-violet-600 text-white font-bold text-2xl">{initials}</AvatarFallback>
        </Avatar>
        <h2 className="mt-4 font-bold text-body text-lg">{form.full_name || form.first_name || form.display_name || "Unnamed"}</h2>
        <p className="text-sm text-secondary-text">{email || "—"}</p>
        <div className="mt-3 inline-flex items-center px-3 py-1 rounded-full bg-primary-light text-primary text-xs font-bold">{planLabel}</div>
        <div className="mt-6 pt-6 border-t border-border space-y-3 text-sm text-left">
          <div className="flex justify-between"><span className="text-secondary-text">Merit Points</span><span className="font-bold text-gold">{merit.toLocaleString()}</span></div>
          <div className="flex justify-between"><span className="text-secondary-text">Streak</span><span className="font-bold text-orange-600">{streak} days</span></div>
          <div className="flex justify-between"><span className="text-secondary-text">Global Rank</span><span className="font-bold text-primary">{data.rank ? `#${data.rank}` : "—"}</span></div>
        </div>
      </aside>

      <div className="bg-card border border-border rounded-xl p-6 shadow-card">
        <Tabs defaultValue="personal">
          <TabsList className="bg-muted">
            <TabsTrigger value="personal">Personal Info</TabsTrigger>
            <TabsTrigger value="exams">Exam Preferences</TabsTrigger>
            <TabsTrigger value="account">Account</TabsTrigger>
          </TabsList>

          <TabsContent value="personal" className="mt-6 space-y-4">
            <div className="grid sm:grid-cols-2 gap-4">
              <div><Label>Full name</Label><Input value={form.full_name ?? ""} onChange={(e) => setForm({ ...form, full_name: e.target.value })} className="mt-1.5 h-11" /></div>
              <div><Label>Mobile</Label><Input value={form.mobile ?? ""} onChange={(e) => setForm({ ...form, mobile: e.target.value })} className="mt-1.5 h-11" /></div>
              <div><Label>City</Label><Input value={form.city ?? ""} onChange={(e) => setForm({ ...form, city: e.target.value })} className="mt-1.5 h-11" /></div>
              <div><Label>State</Label><Input value={form.state ?? ""} onChange={(e) => setForm({ ...form, state: e.target.value })} className="mt-1.5 h-11" /></div>
              <div><Label>Education</Label><Input value={form.education_level ?? ""} onChange={(e) => setForm({ ...form, education_level: e.target.value })} className="mt-1.5 h-11" /></div>
              <div><Label>User type</Label><Input value={form.user_type ?? ""} onChange={(e) => setForm({ ...form, user_type: e.target.value })} className="mt-1.5 h-11" /></div>
            </div>
            <Button disabled={saving} onClick={() => save({ full_name: form.full_name, mobile: form.mobile, city: form.city, state: form.state, education_level: form.education_level, user_type: form.user_type })} className="font-semibold">{saving ? "Saving…" : "Save changes"}</Button>
          </TabsContent>

          <TabsContent value="exams" className="mt-6 space-y-5">
            <div>
              <div className="flex justify-between"><Label>Study hours per day</Label><span className="text-sm font-bold text-primary">{form.study_hours_per_day ?? 4} hrs</span></div>
              <Slider value={[form.study_hours_per_day ?? 4]} onValueChange={(v) => setForm({ ...form, study_hours_per_day: v[0] })} min={1} max={12} step={1} className="mt-3" />
            </div>
            <Button disabled={saving} onClick={() => save({ study_hours_per_day: form.study_hours_per_day })} className="font-semibold">{saving ? "Saving…" : "Save preferences"}</Button>
            <p className="text-xs text-secondary-text">Manage target exams in the My Exams page.</p>
          </TabsContent>

          <TabsContent value="account" className="mt-6 space-y-4">
            <div><Label>Email</Label><Input value={email} disabled className="mt-1.5 h-11 bg-muted/40" /></div>
            <div className="mt-8 pt-6 border-t border-border">
              <h3 className="font-semibold text-danger">Sign out</h3>
              <p className="text-sm text-secondary-text mt-1">End your session on this device.</p>
              <Button variant="outline" className="mt-3 border-danger text-danger hover:bg-danger-light" onClick={async () => { await supabase.auth.signOut(); window.location.href = "/login"; }}>Sign out</Button>
            </div>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}
