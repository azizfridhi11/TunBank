import { useState, useMemo } from "react";
import { LayoutShell } from "@/components/layout-shell";
import { sounds } from "@/lib/sounds";
import { useQuery, useMutation } from "@tanstack/react-query";
import { api, buildUrl } from "@shared/routes";
import { Account, Loan } from "@shared/schema";
import { Button } from "@/components/ui/button";
import { formatCurrency } from "@/lib/utils";
import {
  Loader2,
  ArrowRight,
  User,
  Car,
  Home,
  GraduationCap,
  Briefcase,
  Sparkles,
  Calculator,
  Plus,
  Calendar,
  TrendingUp,
  Wallet,
  PiggyBank,
} from "lucide-react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger, DialogDescription } from "@/components/ui/dialog";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Slider } from "@/components/ui/slider";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { useToast } from "@/hooks/use-toast";
import { queryClient } from "@/lib/queryClient";
import { useTranslation } from "react-i18next";
import { format, addMonths } from "date-fns";

const LOAN_TYPES = [
  { value: "personal", label: "Personal", icon: User, rate: 8.5, color: "from-violet-500 to-violet-600" },
  { value: "auto", label: "Auto", icon: Car, rate: 7.0, color: "from-blue-500 to-blue-600" },
  { value: "mortgage", label: "Mortgage", icon: Home, rate: 4.5, color: "from-emerald-500 to-emerald-600" },
  { value: "education", label: "Education", icon: GraduationCap, rate: 5.0, color: "from-amber-500 to-amber-600" },
  { value: "business", label: "Business", icon: Briefcase, rate: 9.0, color: "from-rose-500 to-rose-600" },
  { value: "micro", label: "Micro", icon: Sparkles, rate: 12.0, color: "from-pink-500 to-pink-600" },
] as const;

function getLoanType(type: string) {
  return LOAN_TYPES.find((l) => l.value === type) ?? LOAN_TYPES[0];
}

function calcMonthly(principal: number, annualRate: number, n: number): number {
  if (n <= 0) return 0;
  const r = annualRate / 100 / 12;
  if (r === 0) return principal / n;
  return (principal * r * Math.pow(1 + r, n)) / (Math.pow(1 + r, n) - 1);
}

export default function Loans() {
  const { t } = useTranslation();
  const { data: loans, isLoading } = useQuery<Loan[]>({ queryKey: [api.loans.list.path] });
  const { data: accounts } = useQuery<Account[]>({ queryKey: [api.accounts.list.path] });
  const [applyOpen, setApplyOpen] = useState(false);

  const stats = useMemo(() => {
    const list = loans ?? [];
    const active = list.filter((l) => l.status === "active");
    const totalBorrowed = list.reduce((s, l) => s + Number(l.amount), 0);
    const totalRemaining = active.reduce((s, l) => s + Number(l.remainingBalance), 0);
    const monthlyOutflow = active.reduce((s, l) => s + Number(l.monthlyInstallment), 0);
    return { active: active.length, totalBorrowed, totalRemaining, monthlyOutflow };
  }, [loans]);

  if (isLoading) {
    return (
      <LayoutShell>
        <div className="flex items-center justify-center h-64">
          <Loader2 className="w-8 h-8 animate-spin text-primary" />
        </div>
      </LayoutShell>
    );
  }

  return (
    <LayoutShell>
      <div className="max-w-5xl mx-auto space-y-6">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4">
          <div>
            <h1 className="text-3xl font-bold tracking-tight">{t("Loans")}</h1>
            <p className="text-muted-foreground mt-1">{t("Borrow smart, repay easy.")}</p>
          </div>
          <Dialog open={applyOpen} onOpenChange={setApplyOpen}>
            <DialogTrigger asChild>
              <Button size="lg" className="rounded-2xl shadow-lg shadow-primary/20" data-testid="button-apply-loan">
                <Plus className="w-4 h-4 mr-2" /> {t("Apply for Loan")}
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-lg max-h-[90vh] overflow-y-auto">
              <DialogHeader>
                <DialogTitle>{t("New Loan Application")}</DialogTitle>
                <DialogDescription>{t("Adjust the sliders, see your monthly payment instantly.")}</DialogDescription>
              </DialogHeader>
              <LoanCalculator accounts={accounts ?? []} onSuccess={() => setApplyOpen(false)} />
            </DialogContent>
          </Dialog>
        </div>

        {/* Stats summary */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
          <StatTile
            icon={Wallet}
            label={t("Active Loans")}
            value={stats.active.toString()}
            color="from-violet-500 to-violet-600"
          />
          <StatTile
            icon={TrendingUp}
            label={t("Total Borrowed")}
            value={formatCurrency(stats.totalBorrowed.toString())}
            color="from-blue-500 to-blue-600"
          />
          <StatTile
            icon={PiggyBank}
            label={t("Remaining")}
            value={formatCurrency(stats.totalRemaining.toString())}
            color="from-emerald-500 to-emerald-600"
          />
          <StatTile
            icon={Calendar}
            label={t("Monthly Outflow")}
            value={formatCurrency(stats.monthlyOutflow.toString())}
            color="from-amber-500 to-amber-600"
          />
        </div>

        {/* Loans list */}
        {loans && loans.length === 0 ? (
          <EmptyState onApply={() => setApplyOpen(true)} />
        ) : (
          <div className="space-y-4">
            {loans?.map((loan) => (
              <LoanCard key={loan.id} loan={loan} accounts={accounts ?? []} />
            ))}
          </div>
        )}
      </div>
    </LayoutShell>
  );
}

function StatTile({ icon: Icon, label, value, color }: { icon: any; label: string; value: string; color: string }) {
  return (
    <div className="bg-card border border-border rounded-2xl p-4 flex items-center gap-3">
      <div className={`w-10 h-10 rounded-xl bg-gradient-to-br ${color} flex items-center justify-center shadow-md`}>
        <Icon className="w-5 h-5 text-white" />
      </div>
      <div className="min-w-0">
        <p className="text-[11px] uppercase tracking-wider text-muted-foreground font-medium">{label}</p>
        <p className="text-base font-bold tabular-nums truncate" data-testid={`stat-${label.toLowerCase().replace(/\s+/g, "-")}`}>
          {value}
        </p>
      </div>
    </div>
  );
}

function EmptyState({ onApply }: { onApply: () => void }) {
  const { t } = useTranslation();
  return (
    <div className="bg-card border border-border rounded-3xl p-12 text-center">
      <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-primary/20 to-violet-500/20 flex items-center justify-center mx-auto mb-4">
        <Calculator className="w-8 h-8 text-primary" />
      </div>
      <h3 className="text-lg font-semibold mb-1">{t("No loans yet")}</h3>
      <p className="text-sm text-muted-foreground mb-6 max-w-sm mx-auto">
        {t("Need funds for a car, your studies, a home, or your business? Apply in seconds.")}
      </p>
      <Button onClick={onApply} size="lg" className="rounded-2xl">
        <Plus className="w-4 h-4 mr-2" /> {t("Apply for Loan")}
      </Button>
    </div>
  );
}

function LoanCard({ loan, accounts }: { loan: Loan; accounts: Account[] }) {
  const { t } = useTranslation();
  const { toast } = useToast();
  const [isOpen, setIsOpen] = useState(false);
  const meta = getLoanType(loan.type);
  const Icon = meta.icon;

  const totalRepayment = Number(loan.monthlyInstallment) * loan.durationMonths;
  const remaining = Number(loan.remainingBalance);
  const paid = Math.max(0, totalRepayment - remaining);
  const progress = totalRepayment > 0 ? Math.min(100, (paid / totalRepayment) * 100) : 0;
  const installmentsPaid = Math.min(loan.durationMonths, Math.floor(paid / Number(loan.monthlyInstallment)));
  const installmentsLeft = Math.max(0, loan.durationMonths - installmentsPaid);
  const nextPaymentDate = addMonths(new Date(loan.createdAt ?? Date.now()), installmentsPaid + 1);
  const totalInterest = totalRepayment - Number(loan.amount);

  // Build amortization preview — next 4 upcoming installments
  const upcoming = Array.from({ length: Math.min(4, installmentsLeft) }).map((_, i) => ({
    n: installmentsPaid + i + 1,
    date: addMonths(new Date(loan.createdAt ?? Date.now()), installmentsPaid + i + 1),
    amount: Number(loan.monthlyInstallment),
  }));

  const repaymentSchema = z.object({
    accountId: z.coerce.number().min(1, t("Please select an account")),
    amount: z.coerce.number().min(1, t("Amount must be greater than 0")),
  });

  const form = useForm({
    resolver: zodResolver(repaymentSchema),
    defaultValues: { accountId: 0, amount: Number(loan.monthlyInstallment) },
  });

  const repayMutation = useMutation({
    mutationFn: async (data: any) => {
      const res = await fetch(buildUrl(api.loans.repay.path, { id: loan.id }), {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      });
      if (!res.ok) throw new Error((await res.json()).message || t("Repayment failed"));
      return res.json();
    },
    onSuccess: () => {
      sounds.loan();
      toast({ title: t("Success"), description: t("Payment processed successfully") });
      queryClient.invalidateQueries({ queryKey: [api.loans.list.path] });
      queryClient.invalidateQueries({ queryKey: [api.accounts.list.path] });
      queryClient.invalidateQueries({ queryKey: [api.transactions.list.path] });
      setIsOpen(false);
    },
    onError: (e: Error) => toast({ title: t("Error"), description: e.message, variant: "destructive" }),
  });

  const isActive = loan.status === "active";

  return (
    <div
      className="bg-card border border-border rounded-3xl overflow-hidden hover:shadow-lg transition-shadow"
      data-testid={`card-loan-${loan.id}`}
    >
      {/* Hero bar */}
      <div className="p-5 sm:p-6">
        <div className="flex items-start justify-between gap-4 mb-5">
          <div className="flex items-center gap-3">
            <div className={`w-12 h-12 rounded-2xl bg-gradient-to-br ${meta.color} flex items-center justify-center shadow-lg`}>
              <Icon className="w-6 h-6 text-white" />
            </div>
            <div>
              <h3 className="font-bold text-lg leading-tight">{t(meta.label + " Loan")}</h3>
              <p className="text-xs text-muted-foreground">
                #{loan.id} · {loan.interestRate}% APR · {loan.durationMonths} {t("months")}
              </p>
            </div>
          </div>
          <span
            className={`shrink-0 px-2.5 py-1 rounded-full text-[10px] uppercase tracking-wider font-bold ${
              isActive
                ? "bg-emerald-500/15 text-emerald-700 dark:text-emerald-400"
                : loan.status === "overdue"
                ? "bg-rose-500/15 text-rose-700 dark:text-rose-400"
                : "bg-muted text-muted-foreground"
            }`}
          >
            {t(loan.status)}
          </span>
        </div>

        {/* Progress */}
        <div className="space-y-2 mb-5">
          <div className="flex items-center justify-between text-xs">
            <span className="text-muted-foreground">
              {t("Paid")} <span className="font-semibold text-foreground tabular-nums">{formatCurrency(paid.toString())}</span>
            </span>
            <span className="font-bold tabular-nums" data-testid={`progress-loan-${loan.id}`}>
              {progress.toFixed(0)}%
            </span>
            <span className="text-muted-foreground">
              {t("Total")} <span className="font-semibold text-foreground tabular-nums">{formatCurrency(totalRepayment.toString())}</span>
            </span>
          </div>
          <div className="h-2.5 rounded-full bg-muted overflow-hidden">
            <div
              className={`h-full bg-gradient-to-r ${meta.color} rounded-full transition-all duration-700`}
              style={{ width: `${progress}%` }}
            />
          </div>
          <p className="text-[11px] text-muted-foreground">
            {installmentsPaid} / {loan.durationMonths} {t("installments paid")} · {installmentsLeft} {t("remaining")}
          </p>
        </div>

        {/* Key facts grid */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
          <Fact label={t("Principal")} value={formatCurrency(loan.amount)} />
          <Fact label={t("Remaining")} value={formatCurrency(loan.remainingBalance)} />
          <Fact label={t("Monthly")} value={formatCurrency(loan.monthlyInstallment)} accent />
          <Fact label={t("Interest")} value={formatCurrency(totalInterest.toString())} muted />
        </div>
      </div>

      {/* Amortization & action */}
      {isActive && installmentsLeft > 0 && (
        <div className="border-t border-border bg-muted/20">
          <Tabs defaultValue="schedule" className="w-full">
            <div className="flex items-center justify-between px-5 sm:px-6 pt-3">
              <TabsList className="h-9">
                <TabsTrigger value="schedule" className="text-xs">
                  {t("Schedule")}
                </TabsTrigger>
                <TabsTrigger value="next" className="text-xs">
                  {t("Next Payment")}
                </TabsTrigger>
              </TabsList>
              <Dialog open={isOpen} onOpenChange={setIsOpen}>
                <DialogTrigger asChild>
                  <Button size="sm" className="rounded-xl" data-testid={`button-repay-${loan.id}`}>
                    {t("Repay")} <ArrowRight className="ml-1.5 h-3.5 w-3.5" />
                  </Button>
                </DialogTrigger>
                <DialogContent>
                  <DialogHeader>
                    <DialogTitle>{t("Loan Repayment")}</DialogTitle>
                  </DialogHeader>
                  <form onSubmit={form.handleSubmit((d) => repayMutation.mutate(d))} className="space-y-4">
                    <div className="space-y-2">
                      <Label>{t("Pay From Account")}</Label>
                      <Select onValueChange={(val) => form.setValue("accountId", Number(val))}>
                        <SelectTrigger data-testid="select-repay-account">
                          <SelectValue placeholder={t("Choose an account")} />
                        </SelectTrigger>
                        <SelectContent>
                          {accounts.map((acc) => (
                            <SelectItem key={acc.id} value={acc.id.toString()}>
                              {acc.accountNumber} ({formatCurrency(acc.balance)})
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                      {form.formState.errors.accountId && (
                        <p className="text-xs text-destructive">{form.formState.errors.accountId.message}</p>
                      )}
                    </div>
                    <div className="space-y-2">
                      <Label>{t("Amount")}</Label>
                      <Input type="number" step="0.01" {...form.register("amount")} data-testid="input-repay-amount" />
                      <div className="flex gap-2 flex-wrap">
                        {[
                          { label: t("Monthly"), val: Number(loan.monthlyInstallment) },
                          { label: t("3 months"), val: Number(loan.monthlyInstallment) * 3 },
                          { label: t("Pay off"), val: Number(loan.remainingBalance) },
                        ].map((opt) => (
                          <Button
                            key={opt.label}
                            type="button"
                            variant="outline"
                            size="sm"
                            className="h-7 text-xs rounded-full"
                            onClick={() => form.setValue("amount", opt.val)}
                          >
                            {opt.label}
                          </Button>
                        ))}
                      </div>
                    </div>
                    <Button type="submit" className="w-full" disabled={repayMutation.isPending}>
                      {repayMutation.isPending && <Loader2 className="w-4 h-4 animate-spin mr-2" />}
                      {t("Confirm Payment")}
                    </Button>
                  </form>
                </DialogContent>
              </Dialog>
            </div>
            <TabsContent value="schedule" className="px-5 sm:px-6 pb-5 pt-3 m-0">
              <div className="space-y-1.5">
                {upcoming.length === 0 && (
                  <p className="text-xs text-muted-foreground py-2">{t("No upcoming installments.")}</p>
                )}
                {upcoming.map((u) => (
                  <div
                    key={u.n}
                    className="flex items-center justify-between text-xs py-1.5 px-3 rounded-lg hover:bg-muted/50 transition-colors"
                  >
                    <span className="text-muted-foreground">
                      #{u.n} · {format(u.date, "dd MMM yyyy")}
                    </span>
                    <span className="font-semibold tabular-nums">{formatCurrency(u.amount.toString())}</span>
                  </div>
                ))}
              </div>
            </TabsContent>
            <TabsContent value="next" className="px-5 sm:px-6 pb-5 pt-3 m-0">
              <div className="flex items-center justify-between p-4 rounded-xl bg-background border border-border">
                <div>
                  <p className="text-[10px] uppercase tracking-wider text-muted-foreground font-medium mb-1">
                    {t("Due")}
                  </p>
                  <p className="text-sm font-bold">{format(nextPaymentDate, "EEEE, dd MMM yyyy")}</p>
                </div>
                <div className="text-right">
                  <p className="text-[10px] uppercase tracking-wider text-muted-foreground font-medium mb-1">
                    {t("Amount")}
                  </p>
                  <p className="text-base font-bold tabular-nums">{formatCurrency(loan.monthlyInstallment)}</p>
                </div>
              </div>
            </TabsContent>
          </Tabs>
        </div>
      )}

      {!isActive && (
        <div className="border-t border-border bg-muted/20 px-5 sm:px-6 py-3 text-center">
          <p className="text-xs text-muted-foreground">{t("This loan is")} {t(loan.status)}.</p>
        </div>
      )}
    </div>
  );
}

function Fact({ label, value, accent, muted }: { label: string; value: string; accent?: boolean; muted?: boolean }) {
  return (
    <div className={`p-3 rounded-xl ${accent ? "bg-primary/10" : muted ? "bg-muted/40" : "bg-muted/30"}`}>
      <p className="text-[10px] uppercase tracking-wider text-muted-foreground font-medium mb-1">{label}</p>
      <p className={`text-sm font-bold tabular-nums ${accent ? "text-primary" : ""}`}>{value}</p>
    </div>
  );
}

function LoanCalculator({ accounts, onSuccess }: { accounts: Account[]; onSuccess: () => void }) {
  const { t } = useTranslation();
  const { toast } = useToast();
  const [type, setType] = useState<typeof LOAN_TYPES[number]["value"]>("personal");
  const [amount, setAmount] = useState(5000);
  const [duration, setDuration] = useState(24);
  const [accountId, setAccountId] = useState<string>("");

  const meta = LOAN_TYPES.find((l) => l.value === type)!;
  const monthly = calcMonthly(amount, meta.rate, duration);
  const totalRepay = monthly * duration;
  const totalInterest = totalRepay - amount;

  const applyMutation = useMutation({
    mutationFn: async () => {
      const res = await fetch(api.loans.apply.path, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ type, amount, durationMonths: duration, accountId: Number(accountId) }),
      });
      if (!res.ok) throw new Error((await res.json()).message || t("Application failed"));
      return res.json();
    },
    onSuccess: () => {
      sounds.success();
      toast({
        title: t("Loan Approved!"),
        description: t("Funds disbursed to your account."),
      });
      queryClient.invalidateQueries({ queryKey: [api.loans.list.path] });
      queryClient.invalidateQueries({ queryKey: [api.accounts.list.path] });
      queryClient.invalidateQueries({ queryKey: [api.transactions.list.path] });
      onSuccess();
    },
    onError: (e: Error) => toast({ title: t("Error"), description: e.message, variant: "destructive" }),
  });

  return (
    <div className="space-y-5">
      {/* Type picker */}
      <div className="space-y-2">
        <Label className="text-xs uppercase tracking-wider text-muted-foreground">{t("Loan Type")}</Label>
        <div className="grid grid-cols-3 gap-2">
          {LOAN_TYPES.map((lt) => {
            const Icon = lt.icon;
            const active = type === lt.value;
            return (
              <button
                key={lt.value}
                type="button"
                onClick={() => setType(lt.value)}
                className={`p-3 rounded-2xl border-2 text-center transition-all ${
                  active
                    ? "border-primary bg-primary/5 shadow-sm"
                    : "border-border hover:border-primary/40 bg-card"
                }`}
                data-testid={`type-${lt.value}`}
              >
                <div
                  className={`w-9 h-9 mx-auto rounded-xl bg-gradient-to-br ${lt.color} flex items-center justify-center mb-1.5 ${
                    active ? "shadow-md" : "opacity-80"
                  }`}
                >
                  <Icon className="w-4 h-4 text-white" />
                </div>
                <p className="text-[11px] font-semibold">{t(lt.label)}</p>
                <p className="text-[10px] text-muted-foreground">{lt.rate}%</p>
              </button>
            );
          })}
        </div>
      </div>

      {/* Amount slider */}
      <div className="space-y-2">
        <div className="flex justify-between items-center">
          <Label className="text-xs uppercase tracking-wider text-muted-foreground">{t("Amount")}</Label>
          <span className="text-lg font-bold tabular-nums text-primary" data-testid="calc-amount">
            {formatCurrency(amount.toString())}
          </span>
        </div>
        <Slider
          value={[amount]}
          onValueChange={(v) => setAmount(v[0])}
          min={500}
          max={type === "mortgage" ? 500000 : type === "auto" ? 100000 : 50000}
          step={500}
          className="my-2"
        />
        <div className="flex justify-between text-[10px] text-muted-foreground">
          <span>500</span>
          <span>{type === "mortgage" ? "500K" : type === "auto" ? "100K" : "50K"}</span>
        </div>
      </div>

      {/* Duration slider */}
      <div className="space-y-2">
        <div className="flex justify-between items-center">
          <Label className="text-xs uppercase tracking-wider text-muted-foreground">{t("Duration")}</Label>
          <span className="text-lg font-bold tabular-nums text-primary" data-testid="calc-duration">
            {duration} {t("months")}
          </span>
        </div>
        <Slider
          value={[duration]}
          onValueChange={(v) => setDuration(v[0])}
          min={6}
          max={type === "mortgage" ? 360 : 84}
          step={6}
          className="my-2"
        />
        <div className="flex justify-between text-[10px] text-muted-foreground">
          <span>6m</span>
          <span>{type === "mortgage" ? "30y" : "7y"}</span>
        </div>
      </div>

      {/* Live calculation summary */}
      <div className="rounded-2xl bg-gradient-to-br from-primary/10 via-primary/5 to-transparent border border-primary/20 p-4 space-y-2">
        <div className="flex justify-between items-center">
          <span className="text-xs text-muted-foreground">{t("Monthly Payment")}</span>
          <span className="text-2xl font-bold text-primary tabular-nums" data-testid="calc-monthly">
            {formatCurrency(monthly.toFixed(2))}
          </span>
        </div>
        <div className="flex justify-between text-xs">
          <span className="text-muted-foreground">{t("Total Interest")}</span>
          <span className="font-semibold tabular-nums">{formatCurrency(totalInterest.toFixed(2))}</span>
        </div>
        <div className="flex justify-between text-xs">
          <span className="text-muted-foreground">{t("Total Repayment")}</span>
          <span className="font-semibold tabular-nums">{formatCurrency(totalRepay.toFixed(2))}</span>
        </div>
      </div>

      {/* Disbursement account */}
      <div className="space-y-2">
        <Label className="text-xs uppercase tracking-wider text-muted-foreground">{t("Disburse to Account")}</Label>
        <Select value={accountId} onValueChange={setAccountId}>
          <SelectTrigger data-testid="select-disburse-account">
            <SelectValue placeholder={t("Choose an account")} />
          </SelectTrigger>
          <SelectContent>
            {accounts.map((acc) => (
              <SelectItem key={acc.id} value={acc.id.toString()}>
                {acc.accountNumber} ({formatCurrency(acc.balance)})
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      <Button
        onClick={() => applyMutation.mutate()}
        disabled={!accountId || applyMutation.isPending}
        className="w-full h-12 rounded-2xl text-base font-semibold"
        data-testid="button-confirm-apply"
      >
        {applyMutation.isPending && <Loader2 className="w-4 h-4 animate-spin mr-2" />}
        {t("Apply Now")}
      </Button>
      <p className="text-[10px] text-muted-foreground text-center">
        {t("Funds disburse instantly. APR is fixed for the loan term.")}
      </p>
    </div>
  );
}
