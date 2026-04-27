import { LayoutShell } from "@/components/layout-shell";
import { useUser } from "@/hooks/use-auth";
import { useAccounts, useTransactions } from "@/hooks/use-finance";
import { TransactionList } from "@/components/transaction-list";
import { Skeleton } from "@/components/ui/skeleton";
import { Button } from "@/components/ui/button";
import {
  ArrowRight,
  ArrowUpRight,
  ArrowDownLeft,
  Plus,
  CreditCard,
  Smartphone,
  Receipt,
  PiggyBank,
  ShoppingBag,
  Eye,
  EyeOff,
} from "lucide-react";
import { Link } from "wouter";
import { AreaChart, Area, XAxis, Tooltip, ResponsiveContainer } from "recharts";
import { useTranslation } from "react-i18next";
import { useState } from "react";
import { formatCurrency } from "@/lib/utils";

export default function Dashboard() {
  const { data: user } = useUser();
  const { data: accounts, isLoading: isLoadingAccounts } = useAccounts();
  const { data: transactions, isLoading: isLoadingTransactions } = useTransactions();
  const { t } = useTranslation();
  const [showBalance, setShowBalance] = useState(true);

  const totalBalance = accounts?.reduce((sum, a) => sum + Number(a.balance), 0) ?? 0;
  const primaryCurrency = accounts?.[0]?.currency ?? "TND";

  const chartData = [
    { name: "Jan", value: 4000 },
    { name: "Feb", value: 3000 },
    { name: "Mar", value: 5000 },
    { name: "Apr", value: 4500 },
    { name: "May", value: 6000 },
    { name: "Jun", value: 5500 },
  ];

  const quickActions = [
    { icon: ArrowUpRight, label: t("Send"), href: "/transfers", color: "from-primary to-primary/70" },
    { icon: ArrowDownLeft, label: t("Receive"), href: "/accounts", color: "from-emerald-500 to-emerald-600" },
    { icon: Smartphone, label: t("Top Up"), href: "/services", color: "from-violet-500 to-violet-600" },
    { icon: Receipt, label: t("Pay Bills"), href: "/services", color: "from-amber-500 to-amber-600" },
    { icon: CreditCard, label: t("Cards"), href: "/cards", color: "from-blue-500 to-blue-600" },
    { icon: PiggyBank, label: t("Savings"), href: "/savings", color: "from-pink-500 to-pink-600" },
    { icon: ShoppingBag, label: t("Shop"), href: "/shop", color: "from-orange-500 to-orange-600" },
    { icon: Plus, label: t("More"), href: "/services", color: "from-zinc-500 to-zinc-600" },
  ];

  return (
    <LayoutShell>
      <div className="max-w-5xl mx-auto space-y-6">
        {/* Greeting */}
        <div>
          <p className="text-sm text-muted-foreground">
            {t("Welcome back")}, <span className="text-foreground font-medium">{user?.fullName?.split(" ")[0]}</span>
          </p>
        </div>

        {/* Unified Hero — Balance + Chart in ONE card */}
        <div className="relative rounded-3xl overflow-hidden bg-gradient-to-br from-zinc-900 via-zinc-900 to-black dark:from-zinc-100 dark:via-white dark:to-zinc-200 text-white dark:text-zinc-900 shadow-2xl shadow-black/20 dark:shadow-black/5">
          {/* Ambient blob */}
          <div className="absolute -top-20 -right-20 w-72 h-72 bg-primary/20 rounded-full blur-3xl pointer-events-none" />
          <div className="absolute -bottom-32 -left-20 w-72 h-72 bg-violet-500/15 rounded-full blur-3xl pointer-events-none" />

          <div className="relative p-6 sm:p-8">
            <div className="flex items-start justify-between mb-6">
              <div>
                <p className="text-xs uppercase tracking-widest opacity-60 mb-2">{t("Total Balance")}</p>
                <div className="flex items-center gap-3">
                  <h1 className="text-4xl sm:text-5xl font-bold tracking-tight tabular-nums" data-testid="text-total-balance">
                    {showBalance
                      ? isLoadingAccounts
                        ? "—"
                        : formatCurrency(totalBalance, primaryCurrency)
                      : "•••••••"}
                  </h1>
                  <button
                    onClick={() => setShowBalance((v) => !v)}
                    className="opacity-60 hover:opacity-100 transition-opacity"
                    data-testid="button-toggle-balance"
                  >
                    {showBalance ? <Eye className="w-5 h-5" /> : <EyeOff className="w-5 h-5" />}
                  </button>
                </div>
                <p className="text-sm opacity-60 mt-2">
                  {accounts?.length ?? 0} {t("active accounts")}
                </p>
              </div>
              <div className="hidden sm:flex flex-col items-end gap-1">
                <span className="text-xs uppercase tracking-widest opacity-60">{t("This month")}</span>
                <span className="text-sm font-semibold text-emerald-400 dark:text-emerald-600">+12.4%</span>
              </div>
            </div>

            {/* Inline chart inside the hero */}
            <div className="h-28 -mx-2 -mb-2">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={chartData} margin={{ top: 10, right: 10, bottom: 0, left: 10 }}>
                  <defs>
                    <linearGradient id="heroGrad" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="0%" stopColor="currentColor" stopOpacity={0.4} />
                      <stop offset="100%" stopColor="currentColor" stopOpacity={0} />
                    </linearGradient>
                  </defs>
                  <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{ fill: "currentColor", fontSize: 10, opacity: 0.5 }} />
                  <Tooltip
                    contentStyle={{
                      backgroundColor: "rgba(0,0,0,0.8)",
                      border: "none",
                      borderRadius: "12px",
                      color: "#fff",
                      fontSize: 12,
                    }}
                    cursor={{ stroke: "currentColor", strokeOpacity: 0.2 }}
                  />
                  <Area type="monotone" dataKey="value" stroke="currentColor" strokeWidth={2.5} fill="url(#heroGrad)" />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          </div>
        </div>

        {/* Quick actions row — unified strip */}
        <div className="grid grid-cols-4 sm:grid-cols-8 gap-2 sm:gap-3">
          {quickActions.map((action) => (
            <Link key={action.label} href={action.href}>
              <button
                className="w-full flex flex-col items-center gap-2 group"
                data-testid={`action-${action.label.toLowerCase().replace(/\s+/g, "-")}`}
              >
                <div
                  className={`w-12 h-12 sm:w-14 sm:h-14 rounded-2xl bg-gradient-to-br ${action.color} flex items-center justify-center shadow-lg shadow-black/10 group-hover:scale-105 group-active:scale-95 transition-transform`}
                >
                  <action.icon className="w-5 h-5 sm:w-6 sm:h-6 text-white" />
                </div>
                <span className="text-[11px] sm:text-xs font-medium text-foreground/80 group-hover:text-foreground">
                  {action.label}
                </span>
              </button>
            </Link>
          ))}
        </div>

        {/* Accounts strip — horizontal, compact, unified */}
        <div>
          <div className="flex items-center justify-between mb-3 px-1">
            <h2 className="text-sm font-semibold text-foreground/80 uppercase tracking-wider">{t("Your Accounts")}</h2>
            <Link href="/accounts">
              <Button variant="ghost" size="sm" className="text-xs h-7" data-testid="link-view-accounts">
                {t("Manage")} <ArrowRight className="w-3 h-3 ml-1" />
              </Button>
            </Link>
          </div>
          <div className="flex gap-3 overflow-x-auto pb-2 -mx-1 px-1 snap-x snap-mandatory">
            {isLoadingAccounts
              ? Array(2)
                  .fill(0)
                  .map((_, i) => <Skeleton key={i} className="h-28 min-w-[260px] rounded-2xl" />)
              : accounts?.map((account) => (
                  <Link key={account.id} href="/accounts">
                    <div
                      className="min-w-[260px] snap-start p-5 rounded-2xl bg-card border border-border hover:border-primary/40 hover:shadow-md transition-all cursor-pointer group"
                      data-testid={`card-account-${account.id}`}
                    >
                      <div className="flex items-center justify-between mb-4">
                        <span className="text-xs font-medium text-muted-foreground uppercase tracking-wider">
                          {account.type}
                        </span>
                        <span className="text-[10px] font-mono text-muted-foreground">
                          •••• {account.accountNumber.slice(-4)}
                        </span>
                      </div>
                      <p className="text-2xl font-bold tabular-nums">
                        {formatCurrency(Number(account.balance), account.currency)}
                      </p>
                      <div className="flex items-center gap-1.5 mt-2">
                        <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
                        <span className="text-[11px] text-muted-foreground">{t("Active")}</span>
                      </div>
                    </div>
                  </Link>
                ))}
          </div>
        </div>

        {/* Recent activity — single unified panel, no side splits */}
        <div className="bg-card border border-border rounded-2xl overflow-hidden">
          <div className="flex items-center justify-between px-5 sm:px-6 py-4 border-b border-border">
            <h2 className="text-sm font-semibold text-foreground/80 uppercase tracking-wider">{t("Recent Activity")}</h2>
            <Link href="/transfers">
              <Button variant="ghost" size="sm" className="text-xs h-7" data-testid="link-view-all-transactions">
                {t("View All")} <ArrowRight className="w-3 h-3 ml-1" />
              </Button>
            </Link>
          </div>
          <div className="px-2 sm:px-3 py-2">
            {isLoadingTransactions ? (
              <div className="space-y-2 p-3">
                {Array(5)
                  .fill(0)
                  .map((_, i) => (
                    <Skeleton key={i} className="h-14 w-full rounded-xl" />
                  ))}
              </div>
            ) : (
              <TransactionList transactions={transactions?.slice(0, 6) || []} />
            )}
          </div>
        </div>
      </div>
    </LayoutShell>
  );
}
