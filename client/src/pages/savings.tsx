import { LayoutShell } from "@/components/layout-shell";
import { useQuery, useMutation } from "@tanstack/react-query";
import { useTranslation } from "react-i18next";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Skeleton } from "@/components/ui/skeleton";
import { Plus, Target, Trash2, PiggyBank, CheckCircle2, Calendar, TrendingUp, Loader2 } from "lucide-react";
import { useState } from "react";
import { useForm } from "react-hook-form";
import { useToast } from "@/hooks/use-toast";
import { queryClient } from "@/lib/queryClient";
import { formatCurrency } from "@/lib/utils";
import { Account, SavingsGoal } from "@shared/schema";
import { api } from "@shared/routes";
import { differenceInDays, format } from "date-fns";

// ─── Constants ────────────────────────────────────────────────────────────────
const GOAL_EMOJIS = ["🎯","✈️","🏠","🚗","💍","🎓","🏖️","💻","🎸","⚽","🌍","👶","🏋️","🎁","🛍️","🏦","💰","🎪","🚀","🌟"];
const GOAL_COLORS = [
  "#6366f1","#8b5cf6","#ec4899","#f43f5e","#f97316",
  "#eab308","#22c55e","#14b8a6","#3b82f6","#64748b",
];

// ─── Circular Progress Ring ───────────────────────────────────────────────────
function CircularProgress({ pct, color, size = 96, emoji }: { pct: number; color: string; size?: number; emoji: string }) {
  const r = (size - 10) / 2;
  const circ = 2 * Math.PI * r;
  const filled = Math.min(pct / 100, 1) * circ;

  return (
    <div className="relative flex items-center justify-center" style={{ width: size, height: size }}>
      <svg width={size} height={size} className="-rotate-90">
        <circle cx={size / 2} cy={size / 2} r={r} fill="none" stroke="currentColor" strokeWidth={8} className="text-muted/30" />
        <circle
          cx={size / 2} cy={size / 2} r={r} fill="none"
          stroke={color} strokeWidth={8} strokeLinecap="round"
          strokeDasharray={circ}
          strokeDashoffset={circ - filled}
          style={{ transition: "stroke-dashoffset 0.6s ease" }}
        />
      </svg>
      <span className="absolute text-2xl">{emoji}</span>
    </div>
  );
}

// ─── Goal Card ────────────────────────────────────────────────────────────────
function GoalCard({ goal, onContribute, onDelete }: { goal: SavingsGoal; onContribute: (g: SavingsGoal) => void; onDelete: (id: number) => void }) {
  const { t } = useTranslation();
  const current = Number(goal.currentAmount);
  const target = Number(goal.targetAmount);
  const pct = target > 0 ? Math.min((current / target) * 100, 100) : 0;
  const isComplete = goal.status === "completed" || pct >= 100;
  const daysLeft = goal.targetDate ? differenceInDays(new Date(goal.targetDate), new Date()) : null;

  return (
    <Card
      className="relative overflow-hidden border-none shadow-md hover:shadow-lg transition-all duration-300 group"
      style={{ background: `${goal.color}0d`, borderTop: `3px solid ${goal.color}` }}
    >
      {isComplete && (
        <div className="absolute top-3 right-3 z-10">
          <Badge className="bg-green-500 text-white text-xs font-bold gap-1">
            <CheckCircle2 className="w-3 h-3" /> {t("Completed")}
          </Badge>
        </div>
      )}

      <CardContent className="p-5 space-y-4">
        {/* Top: ring + info */}
        <div className="flex items-center gap-4">
          <CircularProgress pct={pct} color={goal.color} emoji={goal.emoji} size={88} />
          <div className="flex-1 min-w-0">
            <h3 className="font-bold text-foreground text-base leading-tight truncate">{goal.title}</h3>
            <p className="text-2xl font-black mt-1" style={{ color: goal.color }}>{pct.toFixed(0)}%</p>
            <p className="text-xs text-muted-foreground mt-0.5">
              {formatCurrency(current, "TND")} / {formatCurrency(target, "TND")}
            </p>
          </div>
        </div>

        {/* Progress bar */}
        <div className="h-2 rounded-full bg-muted overflow-hidden">
          <div
            className="h-full rounded-full transition-all duration-700"
            style={{ width: `${pct}%`, backgroundColor: goal.color }}
          />
        </div>

        {/* Remaining / date */}
        <div className="flex items-center justify-between text-xs text-muted-foreground">
          <span className="flex items-center gap-1">
            <TrendingUp className="w-3 h-3" />
            {formatCurrency(Math.max(0, target - current), "TND")} {t("remaining")}
          </span>
          {daysLeft !== null && (
            <span className="flex items-center gap-1">
              <Calendar className="w-3 h-3" />
              {daysLeft > 0 ? `${daysLeft} ${t("days left")}` : daysLeft === 0 ? t("Due today") : t("Overdue")}
            </span>
          )}
          {goal.targetDate && (
            <span className="text-xs text-muted-foreground hidden md:block">
              {format(new Date(goal.targetDate), "MMM yyyy")}
            </span>
          )}
        </div>

        {/* Actions */}
        {!isComplete && (
          <Button
            className="w-full h-9 text-sm font-semibold"
            style={{ backgroundColor: goal.color, color: "#fff" }}
            onClick={() => onContribute(goal)}
          >
            <PiggyBank className="w-4 h-4 mr-2" /> {t("Add Savings")}
          </Button>
        )}
        <Button
          variant="ghost"
          size="sm"
          className="w-full h-8 text-xs text-muted-foreground hover:text-destructive hover:bg-destructive/10 opacity-0 group-hover:opacity-100 transition-opacity"
          onClick={() => onDelete(goal.id)}
        >
          <Trash2 className="w-3 h-3 mr-1" /> {t("Delete goal")}
        </Button>
      </CardContent>
    </Card>
  );
}

// ─── Create Goal Form ─────────────────────────────────────────────────────────
function CreateGoalForm({ onSuccess }: { onSuccess: () => void }) {
  const { t } = useTranslation();
  const { toast } = useToast();
  const [selectedEmoji, setSelectedEmoji] = useState("🎯");
  const [selectedColor, setSelectedColor] = useState(GOAL_COLORS[0]);
  const form = useForm({ defaultValues: { title: "", targetAmount: "", targetDate: "" } });

  const createMutation = useMutation({
    mutationFn: async (data: any) => {
      const res = await fetch("/api/savings-goals", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      });
      if (!res.ok) throw new Error((await res.json()).message || "Failed");
      return res.json();
    },
    onSuccess: () => {
      toast({ title: t("Goal created!"), description: t("Start saving towards your goal.") });
      queryClient.invalidateQueries({ queryKey: ["/api/savings-goals"] });
      onSuccess();
    },
    onError: (e: Error) => toast({ title: t("Error"), description: e.message, variant: "destructive" }),
  });

  const onSubmit = (data: any) => {
    if (!data.title || !data.targetAmount) return;
    createMutation.mutate({
      title: data.title,
      emoji: selectedEmoji,
      color: selectedColor,
      targetAmount: data.targetAmount,
      targetDate: data.targetDate || null,
    });
  };

  return (
    <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-5">
      {/* Emoji picker */}
      <div className="space-y-2">
        <Label>{t("Choose an icon")}</Label>
        <div className="grid grid-cols-10 gap-1.5 p-3 bg-muted/40 rounded-xl">
          {GOAL_EMOJIS.map(e => (
            <button key={e} type="button"
              onClick={() => setSelectedEmoji(e)}
              className={`text-xl w-8 h-8 rounded-lg flex items-center justify-center transition-all hover:scale-110 ${selectedEmoji === e ? "bg-primary/20 ring-2 ring-primary" : "hover:bg-muted"}`}
            >{e}</button>
          ))}
        </div>
      </div>

      {/* Color picker */}
      <div className="space-y-2">
        <Label>{t("Goal color")}</Label>
        <div className="flex flex-wrap gap-2">
          {GOAL_COLORS.map(c => (
            <button key={c} type="button"
              onClick={() => setSelectedColor(c)}
              className={`w-7 h-7 rounded-full transition-transform hover:scale-110 ${selectedColor === c ? "ring-2 ring-offset-2 ring-foreground scale-110" : ""}`}
              style={{ backgroundColor: c }}
            />
          ))}
        </div>
      </div>

      {/* Preview */}
      <div className="flex items-center gap-3 p-3 rounded-xl" style={{ background: `${selectedColor}15`, borderLeft: `4px solid ${selectedColor}` }}>
        <span className="text-3xl">{selectedEmoji}</span>
        <div>
          <p className="font-bold text-foreground text-sm">{form.watch("title") || t("Your goal title")}</p>
          <p className="text-xs text-muted-foreground">{form.watch("targetAmount") ? `Target: ${form.watch("targetAmount")} DT` : t("Set a target amount")}</p>
        </div>
      </div>

      <div className="space-y-2">
        <Label>{t("Goal title")}</Label>
        <Input placeholder={t("e.g. Trip to Paris, New car...")} {...form.register("title", { required: true })} />
      </div>

      <div className="space-y-2">
        <Label>{t("Target amount (DT)")}</Label>
        <Input type="number" step="0.001" placeholder="1000.000" {...form.register("targetAmount", { required: true })} />
      </div>

      <div className="space-y-2">
        <Label>{t("Target date (optional)")}</Label>
        <Input type="date" {...form.register("targetDate")} min={new Date().toISOString().split("T")[0]} />
      </div>

      <Button type="submit" className="w-full" disabled={createMutation.isPending}
        style={{ backgroundColor: selectedColor }}>
        {createMutation.isPending && <Loader2 className="w-4 h-4 mr-2 animate-spin" />}
        {t("Create Goal")} {selectedEmoji}
      </Button>
    </form>
  );
}

// ─── Contribute Dialog ────────────────────────────────────────────────────────
function ContributeDialog({ goal, open, onClose }: { goal: SavingsGoal | null; open: boolean; onClose: () => void }) {
  const { t } = useTranslation();
  const { toast } = useToast();
  const [accountId, setAccountId] = useState<number | null>(null);
  const [amount, setAmount] = useState("");

  const { data: accounts } = useQuery<Account[]>({ queryKey: [api.accounts.list.path] });

  const contributeMutation = useMutation({
    mutationFn: async () => {
      const res = await fetch(`/api/savings-goals/${goal!.id}/contribute`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ accountId, amount }),
      });
      if (!res.ok) throw new Error((await res.json()).message || "Failed");
      return res.json();
    },
    onSuccess: () => {
      toast({ title: t("Savings added!"), description: `+${amount} DT → ${goal?.title}` });
      queryClient.invalidateQueries({ queryKey: ["/api/savings-goals"] });
      queryClient.invalidateQueries({ queryKey: [api.accounts.list.path] });
      queryClient.invalidateQueries({ queryKey: [api.transactions.list.path] });
      setAmount("");
      setAccountId(null);
      onClose();
    },
    onError: (e: Error) => toast({ title: t("Error"), description: e.message, variant: "destructive" }),
  });

  if (!goal) return null;

  return (
    <Dialog open={open} onOpenChange={(o) => !o && onClose()}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <span className="text-2xl">{goal.emoji}</span> {goal.title}
          </DialogTitle>
        </DialogHeader>
        <div className="space-y-4">
          <div className="rounded-xl p-4 text-center space-y-1" style={{ background: `${goal.color}15` }}>
            <CircularProgress pct={Number(goal.currentAmount) / Number(goal.targetAmount) * 100} color={goal.color} emoji={goal.emoji} size={80} />
            <p className="text-sm font-medium mt-2">
              <span style={{ color: goal.color }}>{formatCurrency(Number(goal.currentAmount), "TND")}</span>
              <span className="text-muted-foreground"> / {formatCurrency(Number(goal.targetAmount), "TND")}</span>
            </p>
          </div>

          <div className="space-y-2">
            <Label>{t("From account")}</Label>
            <Select onValueChange={(v) => setAccountId(Number(v))}>
              <SelectTrigger><SelectValue placeholder={t("Select account")} /></SelectTrigger>
              <SelectContent>
                {accounts?.map(a => (
                  <SelectItem key={a.id} value={a.id.toString()}>
                    {a.accountNumber} — {formatCurrency(Number(a.balance), "TND")}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label>{t("Amount to save (DT)")}</Label>
            <Input
              type="number" step="0.001" placeholder="100.000"
              value={amount} onChange={(e) => setAmount(e.target.value)}
            />
            <div className="flex gap-2 flex-wrap">
              {[50, 100, 200, 500].map(v => (
                <button key={v} type="button"
                  className="px-3 py-1 text-xs rounded-full border border-border hover:bg-muted transition-colors"
                  onClick={() => setAmount(v.toString())}
                >{v} DT</button>
              ))}
            </div>
          </div>

          <Button
            className="w-full" disabled={contributeMutation.isPending || !accountId || !amount}
            onClick={() => contributeMutation.mutate()}
            style={{ backgroundColor: goal.color }}
          >
            {contributeMutation.isPending && <Loader2 className="w-4 h-4 mr-2 animate-spin" />}
            <PiggyBank className="w-4 h-4 mr-2" /> {t("Save")} {amount ? `${amount} DT` : ""}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}

// ─── Main Page ────────────────────────────────────────────────────────────────
export default function Savings() {
  const { t } = useTranslation();
  const [createOpen, setCreateOpen] = useState(false);
  const [contributeGoal, setContributeGoal] = useState<SavingsGoal | null>(null);
  const { toast } = useToast();

  const { data: goals, isLoading } = useQuery<SavingsGoal[]>({ queryKey: ["/api/savings-goals"] });

  const deleteMutation = useMutation({
    mutationFn: async (id: number) => {
      const res = await fetch(`/api/savings-goals/${id}`, { method: "DELETE" });
      if (!res.ok) throw new Error("Failed to delete");
    },
    onSuccess: () => {
      toast({ title: t("Goal deleted") });
      queryClient.invalidateQueries({ queryKey: ["/api/savings-goals"] });
    },
  });

  const active = goals?.filter(g => g.status === "active") || [];
  const completed = goals?.filter(g => g.status === "completed") || [];
  const totalSaved = goals?.reduce((s, g) => s + Number(g.currentAmount), 0) || 0;
  const totalTarget = goals?.reduce((s, g) => s + Number(g.targetAmount), 0) || 0;

  return (
    <LayoutShell>
      <div className="space-y-8">
        {/* Header */}
        <div className="flex items-start justify-between">
          <div>
            <h1 className="text-3xl font-display font-bold text-foreground flex items-center gap-2">
              <Target className="w-8 h-8 text-primary" /> {t("Savings Goals")}
            </h1>
            <p className="text-muted-foreground mt-1">{t("Set goals, track progress, and celebrate milestones")}</p>
          </div>
          <Dialog open={createOpen} onOpenChange={setCreateOpen}>
            <DialogTrigger asChild>
              <Button className="gap-2">
                <Plus className="w-4 h-4" /> {t("New Goal")}
              </Button>
            </DialogTrigger>
            <DialogContent className="max-h-[90vh] overflow-y-auto">
              <DialogHeader>
                <DialogTitle>{t("Create a Savings Goal")}</DialogTitle>
              </DialogHeader>
              <CreateGoalForm onSuccess={() => setCreateOpen(false)} />
            </DialogContent>
          </Dialog>
        </div>

        {/* Summary cards */}
        {goals && goals.length > 0 && (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <Card className="border-none bg-primary/5">
              <CardContent className="p-5 flex items-center gap-4">
                <div className="w-12 h-12 rounded-2xl bg-primary/10 flex items-center justify-center">
                  <PiggyBank className="w-6 h-6 text-primary" />
                </div>
                <div>
                  <p className="text-xs text-muted-foreground uppercase tracking-wide">{t("Total Saved")}</p>
                  <p className="text-xl font-bold text-primary">{formatCurrency(totalSaved, "TND")}</p>
                </div>
              </CardContent>
            </Card>
            <Card className="border-none bg-green-50 dark:bg-green-900/20">
              <CardContent className="p-5 flex items-center gap-4">
                <div className="w-12 h-12 rounded-2xl bg-green-100 dark:bg-green-800/40 flex items-center justify-center">
                  <CheckCircle2 className="w-6 h-6 text-green-500" />
                </div>
                <div>
                  <p className="text-xs text-muted-foreground uppercase tracking-wide">{t("Goals Achieved")}</p>
                  <p className="text-xl font-bold text-green-600 dark:text-green-400">{completed.length}</p>
                </div>
              </CardContent>
            </Card>
            <Card className="border-none bg-blue-50 dark:bg-blue-900/20">
              <CardContent className="p-5 flex items-center gap-4">
                <div className="w-12 h-12 rounded-2xl bg-blue-100 dark:bg-blue-800/40 flex items-center justify-center">
                  <Target className="w-6 h-6 text-blue-500" />
                </div>
                <div>
                  <p className="text-xs text-muted-foreground uppercase tracking-wide">{t("Active Goals")}</p>
                  <p className="text-xl font-bold text-blue-600 dark:text-blue-400">{active.length}</p>
                </div>
              </CardContent>
            </Card>
          </div>
        )}

        {/* Goal grid */}
        {isLoading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {[1,2,3].map(i => <Skeleton key={i} className="h-72 rounded-2xl" />)}
          </div>
        ) : !goals || goals.length === 0 ? (
          <Card className="border-dashed border-2">
            <CardContent className="py-24 text-center space-y-4">
              <div className="text-6xl">🎯</div>
              <h3 className="text-xl font-semibold">{t("No savings goals yet")}</h3>
              <p className="text-muted-foreground max-w-sm mx-auto">{t("Create your first goal and start saving towards what matters most.")}</p>
              <Button onClick={() => setCreateOpen(true)} className="gap-2">
                <Plus className="w-4 h-4" /> {t("Create first goal")}
              </Button>
            </CardContent>
          </Card>
        ) : (
          <div className="space-y-8">
            {active.length > 0 && (
              <div>
                <h2 className="text-base font-semibold text-muted-foreground mb-4 uppercase tracking-wider">{t("Active Goals")} ({active.length})</h2>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {active.map(goal => (
                    <GoalCard
                      key={goal.id}
                      goal={goal}
                      onContribute={setContributeGoal}
                      onDelete={(id) => deleteMutation.mutate(id)}
                    />
                  ))}
                </div>
              </div>
            )}
            {completed.length > 0 && (
              <div>
                <h2 className="text-base font-semibold text-muted-foreground mb-4 uppercase tracking-wider">🏆 {t("Completed Goals")} ({completed.length})</h2>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 opacity-75">
                  {completed.map(goal => (
                    <GoalCard
                      key={goal.id}
                      goal={goal}
                      onContribute={setContributeGoal}
                      onDelete={(id) => deleteMutation.mutate(id)}
                    />
                  ))}
                </div>
              </div>
            )}
          </div>
        )}
      </div>

      {/* Contribute Dialog */}
      <ContributeDialog
        goal={contributeGoal}
        open={!!contributeGoal}
        onClose={() => setContributeGoal(null)}
      />
    </LayoutShell>
  );
}
