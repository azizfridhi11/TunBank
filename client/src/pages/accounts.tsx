import { useState, useMemo, useEffect } from "react";
import { LayoutShell } from "@/components/layout-shell";
import { useAccounts, useCreateAccount, useTransactions } from "@/hooks/use-finance";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Skeleton } from "@/components/ui/skeleton";
import {
  Plus,
  Wallet,
  Briefcase,
  PiggyBank,
  Copy,
  Check,
  ArrowUpRight,
  ArrowDownLeft,
  Download,
  Settings as SettingsIcon,
  Sparkles,
  TrendingUp,
  TrendingDown,
  ArrowRightLeft,
  ChevronRight,
} from "lucide-react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { insertAccountSchema, type Account, type Transaction } from "@shared/schema";
import { useTranslation } from "react-i18next";
import { Link } from "wouter";
import { formatCurrency } from "@/lib/utils";
import { useToast } from "@/hooks/use-toast";
import { format } from "date-fns";
import { AreaChart, Area, ResponsiveContainer, Tooltip } from "recharts";

const TYPE_META: Record<string, { label: string; icon: any; gradient: string; tagline: string }> = {
  checking: {
    label: "Checking",
    icon: Wallet,
    gradient: "from-zinc-900 via-zinc-800 to-black dark:from-white dark:via-zinc-100 dark:to-zinc-200",
    tagline: "Daily essentials",
  },
  savings: {
    label: "Savings",
    icon: PiggyBank,
    gradient: "from-emerald-900 via-emerald-700 to-teal-900",
    tagline: "Grow your wealth",
  },
  business: {
    label: "Business",
    icon: Briefcase,
    gradient: "from-amber-900 via-amber-700 to-orange-900",
    tagline: "For your enterprise",
  },
};

const CURRENCY_FLAG: Record<string, string> = { TND: "🇹🇳", USD: "🇺🇸", EUR: "🇪🇺", GBP: "🇬🇧" };

export default function Accounts() {
  const { data: accounts, isLoading } = useAccounts();
  const { data: transactions } = useTransactions();
  const [isOpen, setIsOpen] = useState(false);
  const [selectedId, setSelectedId] = useState<number | null>(null);
  const [filter, setFilter] = useState<"all" | "checking" | "savings" | "business">("all");
  const { t } = useTranslation();

  const filtered = useMemo(() => {
    if (!accounts) return [];
    if (filter === "all") return accounts;
    return accounts.filter((a) => a.type === filter);
  }, [accounts, filter]);

  // Auto-select first account
  useEffect(() => {
    if (filtered.length > 0 && (selectedId === null || !filtered.find((a) => a.id === selectedId))) {
      setSelectedId(filtered[0].id);
    }
  }, [filtered, selectedId]);

  const selected = accounts?.find((a) => a.id === selectedId) ?? null;

  // Stats
  const stats = useMemo(() => {
    const list = accounts ?? [];
    const total = list.reduce((s, a) => s + Number(a.balance), 0);
    const tx = transactions ?? [];
    const inflow = tx
      .filter((t) => t.toAccountId && list.some((a) => a.id === t.toAccountId))
      .reduce((s, t) => s + Number(t.amount), 0);
    const outflow = tx
      .filter((t) => t.fromAccountId && list.some((a) => a.id === t.fromAccountId))
      .reduce((s, t) => s + Number(t.amount), 0);
    return { total, inflow, outflow, count: list.length };
  }, [accounts, transactions]);

  if (isLoading) {
    return (
      <LayoutShell>
        <div className="max-w-6xl mx-auto space-y-6">
          <Skeleton className="h-12 w-48" />
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
            {[0, 1, 2, 3].map((i) => (
              <Skeleton key={i} className="h-20 rounded-2xl" />
            ))}
          </div>
          <Skeleton className="h-96 rounded-3xl" />
        </div>
      </LayoutShell>
    );
  }

  return (
    <LayoutShell>
      <div className="max-w-6xl mx-auto space-y-6">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4">
          <div>
            <h1 className="text-3xl font-bold tracking-tight">{t("Accounts")}</h1>
            <p className="text-muted-foreground mt-1">{t("All your money, one clear view.")}</p>
          </div>
          <Dialog open={isOpen} onOpenChange={setIsOpen}>
            <DialogTrigger asChild>
              <Button size="lg" className="rounded-2xl shadow-lg shadow-primary/20" data-testid="button-open-account">
                <Plus className="w-4 h-4 mr-2" /> {t("Open Account")}
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>{t("Open New Account")}</DialogTitle>
              </DialogHeader>
              <CreateAccountForm onSuccess={() => setIsOpen(false)} />
            </DialogContent>
          </Dialog>
        </div>

        {/* Stats strip */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
          <StatTile
            icon={Wallet}
            label={t("Net Worth")}
            value={formatCurrency(stats.total.toString())}
            color="from-violet-500 to-violet-600"
          />
          <StatTile
            icon={TrendingUp}
            label={t("Total Inflow")}
            value={formatCurrency(stats.inflow.toString())}
            color="from-emerald-500 to-emerald-600"
          />
          <StatTile
            icon={TrendingDown}
            label={t("Total Outflow")}
            value={formatCurrency(stats.outflow.toString())}
            color="from-rose-500 to-rose-600"
          />
          <StatTile
            icon={Sparkles}
            label={t("Accounts")}
            value={stats.count.toString()}
            color="from-amber-500 to-amber-600"
          />
        </div>

        {/* Filter pills */}
        <div className="flex gap-2 overflow-x-auto -mx-1 px-1 pb-1">
          {(["all", "checking", "savings", "business"] as const).map((f) => (
            <button
              key={f}
              onClick={() => setFilter(f)}
              className={`shrink-0 px-4 h-9 rounded-full text-xs font-semibold uppercase tracking-wider transition-all ${
                filter === f
                  ? "bg-primary text-primary-foreground shadow-md"
                  : "bg-muted text-muted-foreground hover:bg-muted/70"
              }`}
              data-testid={`filter-${f}`}
            >
              {t(f === "all" ? "All" : TYPE_META[f]?.label ?? f)}
            </button>
          ))}
        </div>

        {/* Master / Detail layout */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          {/* LEFT — Account list */}
          <div className="lg:col-span-4 space-y-3">
            <h2 className="text-sm font-semibold text-foreground/80 uppercase tracking-wider px-1">
              {t("Your Accounts")} ({filtered.length})
            </h2>

            {filtered.length === 0 ? (
              <div className="bg-card border border-dashed border-border rounded-2xl p-8 text-center">
                <p className="text-sm text-muted-foreground">{t("No accounts in this category.")}</p>
              </div>
            ) : (
              <div className="space-y-2">
                {filtered.map((account) => {
                  const meta = TYPE_META[account.type] ?? TYPE_META.checking;
                  const Icon = meta.icon;
                  const isSelected = selectedId === account.id;
                  return (
                    <button
                      key={account.id}
                      onClick={() => setSelectedId(account.id)}
                      className={`w-full text-left rounded-2xl p-4 border transition-all ${
                        isSelected
                          ? "bg-card border-primary/60 shadow-md ring-1 ring-primary/20"
                          : "bg-card border-border hover:border-primary/30 hover:shadow-sm"
                      }`}
                      data-testid={`account-row-${account.id}`}
                    >
                      <div className="flex items-center gap-3">
                        <div
                          className={`w-11 h-11 rounded-xl bg-gradient-to-br ${meta.gradient} flex items-center justify-center text-white dark:text-zinc-900 shadow-md shrink-0`}
                        >
                          <Icon className="w-5 h-5" />
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center justify-between gap-2">
                            <p className="font-semibold text-sm truncate">{t(meta.label)}</p>
                            <span className="text-[10px] font-mono text-muted-foreground shrink-0">
                              {CURRENCY_FLAG[account.currency] ?? "🌐"} {account.currency}
                            </span>
                          </div>
                          <p className="text-xs text-muted-foreground truncate">
                            •••• {account.accountNumber.slice(-4)}
                          </p>
                          <p className="text-base font-bold tabular-nums mt-1">
                            {formatCurrency(Number(account.balance), account.currency)}
                          </p>
                        </div>
                        <ChevronRight
                          className={`w-4 h-4 transition-transform shrink-0 ${
                            isSelected ? "text-primary translate-x-1" : "text-muted-foreground"
                          }`}
                        />
                      </div>
                    </button>
                  );
                })}

                {/* Add account tile */}
                <button
                  onClick={() => setIsOpen(true)}
                  className="w-full rounded-2xl p-4 border-2 border-dashed border-border hover:border-primary hover:bg-primary/5 transition-all flex items-center gap-3 text-left group"
                  data-testid="button-add-account-tile"
                >
                  <div className="w-11 h-11 rounded-xl bg-muted flex items-center justify-center shrink-0 group-hover:bg-primary/15">
                    <Plus className="w-5 h-5 text-muted-foreground group-hover:text-primary" />
                  </div>
                  <div>
                    <p className="font-semibold text-sm">{t("Open New Account")}</p>
                    <p className="text-xs text-muted-foreground">{t("Checking, Savings or Business")}</p>
                  </div>
                </button>
              </div>
            )}
          </div>

          {/* RIGHT — Detail panel */}
          <div className="lg:col-span-8">
            {selected ? (
              <AccountDetail account={selected} transactions={transactions ?? []} />
            ) : (
              <div className="bg-card border border-border rounded-3xl p-12 text-center">
                <Wallet className="w-12 h-12 mx-auto text-muted-foreground/50 mb-3" />
                <p className="text-muted-foreground">{t("Select an account to see details.")}</p>
              </div>
            )}
          </div>
        </div>
      </div>
    </LayoutShell>
  );
}

function StatTile({ icon: Icon, label, value, color }: { icon: any; label: string; value: string; color: string }) {
  return (
    <div className="bg-card border border-border rounded-2xl p-4 flex items-center gap-3">
      <div className={`w-10 h-10 rounded-xl bg-gradient-to-br ${color} flex items-center justify-center shadow-md shrink-0`}>
        <Icon className="w-5 h-5 text-white" />
      </div>
      <div className="min-w-0">
        <p className="text-[10px] uppercase tracking-wider text-muted-foreground font-medium">{label}</p>
        <p className="text-base font-bold tabular-nums truncate" data-testid={`stat-${label.toLowerCase().replace(/\s+/g, "-")}`}>
          {value}
        </p>
      </div>
    </div>
  );
}

function AccountDetail({ account, transactions }: { account: Account; transactions: Transaction[] }) {
  const { t } = useTranslation();
  const { toast } = useToast();
  const [copied, setCopied] = useState(false);
  const meta = TYPE_META[account.type] ?? TYPE_META.checking;
  const Icon = meta.icon;

  // Transactions for this account
  const accountTx = useMemo(
    () =>
      transactions
        .filter((t) => t.fromAccountId === account.id || t.toAccountId === account.id)
        .sort((a, b) => new Date(b.createdAt!).getTime() - new Date(a.createdAt!).getTime()),
    [transactions, account.id],
  );

  // Build a tiny balance series for the area chart (synthetic from tx history)
  const chart = useMemo(() => {
    const now = Date.now();
    const balance = Number(account.balance);
    const series: { t: number; v: number }[] = [];
    let running = balance;
    const sortedDesc = [...accountTx].sort((a, b) => new Date(b.createdAt!).getTime() - new Date(a.createdAt!).getTime());
    series.push({ t: now, v: running });
    for (const tx of sortedDesc) {
      const isIn = tx.toAccountId === account.id;
      running = isIn ? running - Number(tx.amount) : running + Number(tx.amount);
      series.push({ t: new Date(tx.createdAt!).getTime(), v: running });
      if (series.length >= 30) break;
    }
    return series.reverse().map((p, i) => ({ idx: i, value: Math.max(0, p.v) }));
  }, [accountTx, account.balance]);

  const inflow = accountTx
    .filter((t) => t.toAccountId === account.id)
    .reduce((s, t) => s + Number(t.amount), 0);
  const outflow = accountTx
    .filter((t) => t.fromAccountId === account.id)
    .reduce((s, t) => s + Number(t.amount), 0);

  // Synthetic IBAN
  const iban = `TN59 ${account.accountNumber.padEnd(20, "0").match(/.{1,4}/g)?.slice(0, 5).join(" ")}`;

  const handleCopy = (val: string, label: string) => {
    navigator.clipboard.writeText(val);
    setCopied(true);
    toast({ title: t("Copied"), description: `${label} ${t("copied to clipboard")}` });
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="space-y-4">
      {/* Hero card */}
      <div
        className={`relative rounded-3xl overflow-hidden bg-gradient-to-br ${meta.gradient} text-white dark:text-zinc-900 shadow-2xl shadow-black/20`}
      >
        <div className="absolute -top-20 -right-20 w-72 h-72 bg-white/10 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute -bottom-32 -left-20 w-72 h-72 bg-white/5 rounded-full blur-3xl pointer-events-none" />
        <div
          className="absolute inset-0 opacity-[0.06] pointer-events-none"
          style={{
            backgroundImage:
              "repeating-linear-gradient(115deg, transparent 0, transparent 22px, currentColor 22px, currentColor 23px)",
          }}
        />

        <div className="relative p-6 sm:p-8">
          <div className="flex items-start justify-between mb-6">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 rounded-2xl bg-white/15 dark:bg-black/10 backdrop-blur-sm flex items-center justify-center">
                <Icon className="w-6 h-6" />
              </div>
              <div>
                <p className="text-xs uppercase tracking-[0.25em] opacity-70 font-medium">{t(meta.label)}</p>
                <p className="text-sm opacity-80">{t(meta.tagline)}</p>
              </div>
            </div>
            <span
              className={`px-2.5 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider ${
                account.isActive ? "bg-emerald-400/20 text-emerald-100 dark:text-emerald-700" : "bg-rose-400/20"
              }`}
            >
              {account.isActive ? t("Active") : t("Inactive")}
            </span>
          </div>

          <div className="mb-6">
            <p className="text-xs uppercase tracking-widest opacity-60 mb-2">{t("Available Balance")}</p>
            <h2 className="text-4xl sm:text-5xl font-bold tabular-nums tracking-tight" data-testid={`balance-${account.id}`}>
              {formatCurrency(Number(account.balance), account.currency)}
            </h2>
          </div>

          {/* Inline mini chart */}
          {chart.length > 1 && (
            <div className="h-20 -mx-2">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={chart} margin={{ top: 5, right: 10, bottom: 0, left: 10 }}>
                  <defs>
                    <linearGradient id={`grad-${account.id}`} x1="0" y1="0" x2="0" y2="1">
                      <stop offset="0%" stopColor="currentColor" stopOpacity={0.4} />
                      <stop offset="100%" stopColor="currentColor" stopOpacity={0} />
                    </linearGradient>
                  </defs>
                  <Tooltip
                    contentStyle={{
                      backgroundColor: "rgba(0,0,0,0.85)",
                      border: "none",
                      borderRadius: 12,
                      color: "#fff",
                      fontSize: 11,
                    }}
                    cursor={{ stroke: "currentColor", strokeOpacity: 0.2 }}
                    formatter={(v: any) => formatCurrency(Number(v).toString(), account.currency)}
                    labelFormatter={() => ""}
                  />
                  <Area type="monotone" dataKey="value" stroke="currentColor" strokeWidth={2} fill={`url(#grad-${account.id})`} />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          )}
        </div>
      </div>

      {/* Quick actions */}
      <div className="grid grid-cols-4 gap-2 sm:gap-3">
        {[
          { icon: ArrowUpRight, label: t("Send"), href: "/transfers", color: "from-primary to-primary/70" },
          { icon: ArrowDownLeft, label: t("Receive"), action: () => handleCopy(iban, "IBAN"), color: "from-emerald-500 to-emerald-600" },
          { icon: ArrowRightLeft, label: t("Move"), href: "/transfers", color: "from-violet-500 to-violet-600" },
          { icon: Download, label: t("Statement"), action: () => toast({ title: t("Statement"), description: t("Statement requested. We'll email it shortly.") }), color: "from-blue-500 to-blue-600" },
        ].map((a, i) => {
          const inner = (
            <button
              onClick={a.action}
              className="w-full flex flex-col items-center gap-2 group"
              data-testid={`account-action-${a.label.toLowerCase()}`}
            >
              <div
                className={`w-12 h-12 sm:w-14 sm:h-14 rounded-2xl bg-gradient-to-br ${a.color} flex items-center justify-center shadow-lg shadow-black/10 group-hover:scale-105 group-active:scale-95 transition-transform`}
              >
                <a.icon className="w-5 h-5 sm:w-6 sm:h-6 text-white" />
              </div>
              <span className="text-[11px] sm:text-xs font-medium">{a.label}</span>
            </button>
          );
          return a.href ? (
            <Link key={i} href={a.href}>{inner}</Link>
          ) : (
            <div key={i}>{inner}</div>
          );
        })}
      </div>

      {/* Account info / IBAN */}
      <div className="bg-card border border-border rounded-2xl p-5 space-y-3">
        <h3 className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">{t("Account Details")}</h3>
        <InfoRow
          label={t("Account Number")}
          value={account.accountNumber}
          onCopy={() => handleCopy(account.accountNumber, t("Account Number"))}
          copied={copied}
        />
        <InfoRow
          label={t("IBAN")}
          value={iban}
          mono
          onCopy={() => handleCopy(iban, "IBAN")}
          copied={copied}
        />
        <InfoRow label="SWIFT/BIC" value="TUNBTNTT" mono onCopy={() => handleCopy("TUNBTNTT", "SWIFT")} copied={copied} />
        <InfoRow label={t("Currency")} value={`${CURRENCY_FLAG[account.currency] ?? "🌐"} ${account.currency}`} />
        <InfoRow label={t("Opened")} value={account.createdAt ? format(new Date(account.createdAt), "dd MMM yyyy") : "—"} />
      </div>

      {/* Inflow / Outflow summary */}
      <div className="grid grid-cols-2 gap-3">
        <div className="bg-card border border-border rounded-2xl p-4">
          <div className="flex items-center gap-2 mb-1">
            <div className="w-7 h-7 rounded-lg bg-emerald-500/15 flex items-center justify-center">
              <TrendingUp className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400" />
            </div>
            <span className="text-[11px] uppercase tracking-wider text-muted-foreground font-medium">{t("Money in")}</span>
          </div>
          <p className="text-lg font-bold tabular-nums text-emerald-600 dark:text-emerald-400">
            +{formatCurrency(inflow.toString(), account.currency)}
          </p>
        </div>
        <div className="bg-card border border-border rounded-2xl p-4">
          <div className="flex items-center gap-2 mb-1">
            <div className="w-7 h-7 rounded-lg bg-rose-500/15 flex items-center justify-center">
              <TrendingDown className="w-3.5 h-3.5 text-rose-600 dark:text-rose-400" />
            </div>
            <span className="text-[11px] uppercase tracking-wider text-muted-foreground font-medium">{t("Money out")}</span>
          </div>
          <p className="text-lg font-bold tabular-nums text-rose-600 dark:text-rose-400">
            -{formatCurrency(outflow.toString(), account.currency)}
          </p>
        </div>
      </div>

      {/* Recent activity for this account */}
      <div className="bg-card border border-border rounded-2xl overflow-hidden">
        <div className="flex items-center justify-between px-5 py-4 border-b border-border">
          <h3 className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
            {t("Recent Activity")} ({accountTx.length})
          </h3>
          <Link href="/transfers">
            <Button variant="ghost" size="sm" className="text-xs h-7">
              {t("View All")} <ChevronRight className="w-3 h-3 ml-1" />
            </Button>
          </Link>
        </div>
        <div className="divide-y divide-border">
          {accountTx.length === 0 ? (
            <div className="p-8 text-center text-sm text-muted-foreground">{t("No activity yet on this account.")}</div>
          ) : (
            accountTx.slice(0, 6).map((tx) => {
              const isIn = tx.toAccountId === account.id;
              return (
                <div key={tx.id} className="px-5 py-3 flex items-center gap-3" data-testid={`tx-${tx.id}`}>
                  <div
                    className={`w-9 h-9 rounded-xl flex items-center justify-center shrink-0 ${
                      isIn ? "bg-emerald-500/15 text-emerald-600 dark:text-emerald-400" : "bg-rose-500/15 text-rose-600 dark:text-rose-400"
                    }`}
                  >
                    {isIn ? <ArrowDownLeft className="w-4 h-4" /> : <ArrowUpRight className="w-4 h-4" />}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium truncate">{tx.description ?? t(tx.type)}</p>
                    <p className="text-[11px] text-muted-foreground">
                      {tx.createdAt ? format(new Date(tx.createdAt), "dd MMM · HH:mm") : ""}
                    </p>
                  </div>
                  <div className="text-right">
                    <p
                      className={`text-sm font-bold tabular-nums ${
                        isIn ? "text-emerald-600 dark:text-emerald-400" : "text-foreground"
                      }`}
                    >
                      {isIn ? "+" : "-"}
                      {formatCurrency(tx.amount, account.currency)}
                    </p>
                    <p className="text-[10px] uppercase tracking-wider text-muted-foreground">{t(tx.status)}</p>
                  </div>
                </div>
              );
            })
          )}
        </div>
      </div>
    </div>
  );
}

function InfoRow({
  label,
  value,
  mono,
  onCopy,
  copied,
}: {
  label: string;
  value: string;
  mono?: boolean;
  onCopy?: () => void;
  copied?: boolean;
}) {
  return (
    <div className="flex items-center justify-between gap-3 group">
      <span className="text-xs text-muted-foreground shrink-0">{label}</span>
      <div className="flex items-center gap-2 min-w-0">
        <span className={`text-sm font-medium truncate ${mono ? "font-mono" : ""}`}>{value}</span>
        {onCopy && (
          <button
            onClick={onCopy}
            className="opacity-0 group-hover:opacity-100 transition-opacity p-1 hover:bg-muted rounded-md shrink-0"
            data-testid={`copy-${label.toLowerCase().replace(/\s+/g, "-")}`}
          >
            {copied ? <Check className="w-3.5 h-3.5 text-emerald-500" /> : <Copy className="w-3.5 h-3.5 text-muted-foreground" />}
          </button>
        )}
      </div>
    </div>
  );
}

function CreateAccountForm({ onSuccess }: { onSuccess: () => void }) {
  const { mutate: createAccount, isPending } = useCreateAccount();
  const { t } = useTranslation();
  const form = useForm({
    resolver: zodResolver(insertAccountSchema),
    defaultValues: { type: "checking" as const, currency: "TND", balance: "0", userId: 1, accountNumber: "" },
  });

  const onSubmit = (data: any) => {
    createAccount({ ...data, userId: 1, accountNumber: `AC${Date.now()}` }, { onSuccess });
  };

  return (
    <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
      <div className="space-y-2">
        <Label className="text-xs uppercase tracking-wider text-muted-foreground">{t("Account Type")}</Label>
        <div className="grid grid-cols-3 gap-2">
          {(["checking", "savings", "business"] as const).map((typ) => {
            const meta = TYPE_META[typ];
            const Icon = meta.icon;
            const isActive = form.watch("type") === typ;
            return (
              <button
                key={typ}
                type="button"
                onClick={() => form.setValue("type", typ)}
                className={`p-3 rounded-2xl border-2 text-center transition-all ${
                  isActive ? "border-primary bg-primary/5" : "border-border hover:border-primary/40"
                }`}
                data-testid={`acct-type-${typ}`}
              >
                <div
                  className={`w-9 h-9 mx-auto rounded-xl bg-gradient-to-br ${meta.gradient} flex items-center justify-center mb-1.5 text-white dark:text-zinc-900`}
                >
                  <Icon className="w-4 h-4" />
                </div>
                <p className="text-[11px] font-semibold">{t(meta.label)}</p>
              </button>
            );
          })}
        </div>
      </div>

      <div className="space-y-2">
        <Label className="text-xs uppercase tracking-wider text-muted-foreground">{t("Currency")}</Label>
        <Select onValueChange={(val) => form.setValue("currency", val)} defaultValue="TND">
          <SelectTrigger data-testid="select-currency">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="TND">🇹🇳 TND (د.ت)</SelectItem>
            <SelectItem value="USD">🇺🇸 USD ($)</SelectItem>
            <SelectItem value="EUR">🇪🇺 EUR (€)</SelectItem>
            <SelectItem value="GBP">🇬🇧 GBP (£)</SelectItem>
          </SelectContent>
        </Select>
      </div>

      <div className="space-y-2">
        <Label className="text-xs uppercase tracking-wider text-muted-foreground">{t("Initial Deposit")}</Label>
        <Input type="number" placeholder="0.00" step="0.01" {...form.register("balance")} data-testid="input-deposit" />
      </div>

      <Button type="submit" className="w-full h-11 rounded-2xl" disabled={isPending} data-testid="button-create-account">
        {isPending ? t("Creating...") : t("Open Account")}
      </Button>
    </form>
  );
}
