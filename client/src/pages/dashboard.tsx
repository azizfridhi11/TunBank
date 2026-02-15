import { LayoutShell } from "@/components/layout-shell";
import { useUser } from "@/hooks/use-auth";
import { useAccounts, useTransactions } from "@/hooks/use-finance";
import { AccountCard } from "@/components/account-card";
import { TransactionList } from "@/components/transaction-list";
import { Skeleton } from "@/components/ui/skeleton";
import { Button } from "@/components/ui/button";
import { Plus, ArrowRight } from "lucide-react";
import { Link } from "wouter";
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { useTranslation } from "react-i18next";

export default function Dashboard() {
  const { data: user } = useUser();
  const { data: accounts, isLoading: isLoadingAccounts } = useAccounts();
  const { data: transactions, isLoading: isLoadingTransactions } = useTransactions();
  const { t } = useTranslation();

  // Mock data for chart - in a real app, this would be aggregated from transaction history
  const chartData = [
    { name: 'Jan', value: 4000 },
    { name: 'Feb', value: 3000 },
    { name: 'Mar', value: 5000 },
    { name: 'Apr', value: 4500 },
    { name: 'May', value: 6000 },
    { name: 'Jun', value: 5500 },
  ];

  return (
    <LayoutShell>
      <div className="space-y-8">
        {/* Header */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <h1 className="text-3xl font-display font-bold text-foreground">{t("Dashboard")}</h1>
            <p className="text-muted-foreground">{t("Welcome back")}, {user?.fullName}</p>
          </div>
          <div className="flex gap-3">
            <Link href="/transfers">
              <Button>
                <Plus className="w-4 h-4 mr-2" /> {t("New Transfer")}
              </Button>
            </Link>
          </div>
        </div>

        {/* Accounts Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {isLoadingAccounts ? (
            Array(3).fill(0).map((_, i) => <Skeleton key={i} className="h-48 rounded-xl" />)
          ) : (
            accounts?.slice(0, 3).map((account) => (
              <AccountCard key={account.id} account={account} />
            ))
          )}
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Recent Transactions */}
          <div className="lg:col-span-2 space-y-6">
            <div className="flex items-center justify-between">
              <h2 className="text-xl font-semibold">{t("Recent Transactions")}</h2>
              <Link href="/transfers">
                <Button variant="ghost" className="text-sm">View All <ArrowRight className="w-4 h-4 ml-1" /></Button>
              </Link>
            </div>
            {isLoadingTransactions ? (
              <div className="space-y-4">
                {Array(5).fill(0).map((_, i) => <Skeleton key={i} className="h-16 w-full rounded-xl" />)}
              </div>
            ) : (
              <div className="bg-card rounded-2xl p-6 border border-border shadow-sm">
                <TransactionList transactions={transactions?.slice(0, 5) || []} />
              </div>
            )}
          </div>

          {/* Analytics / Spending */}
          <div className="space-y-6">
            <h2 className="text-xl font-semibold">{t("Cash Flow")}</h2>
            <div className="bg-card rounded-2xl p-6 border border-border shadow-sm h-[400px]">
              <div className="h-full w-full">
                <ResponsiveContainer width="100%" height="100%">
                  <AreaChart data={chartData}>
                    <defs>
                      <linearGradient id="colorValue" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="hsl(var(--primary))" stopOpacity={0.3}/>
                        <stop offset="95%" stopColor="hsl(var(--primary))" stopOpacity={0}/>
                      </linearGradient>
                    </defs>
                    <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="hsl(var(--border))" />
                    <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{fill: 'hsl(var(--muted-foreground))', fontSize: 12}} />
                    <YAxis axisLine={false} tickLine={false} tick={{fill: 'hsl(var(--muted-foreground))', fontSize: 12}} />
                    <Tooltip 
                      contentStyle={{ backgroundColor: 'hsl(var(--popover))', borderColor: 'hsl(var(--border))', color: 'hsl(var(--popover-foreground))' }}
                    />
                    <Area 
                      type="monotone" 
                      dataKey="value" 
                      stroke="hsl(var(--primary))" 
                      strokeWidth={3}
                      fillOpacity={1} 
                      fill="url(#colorValue)" 
                    />
                  </AreaChart>
                </ResponsiveContainer>
              </div>
            </div>
          </div>
        </div>
      </div>
    </LayoutShell>
  );
}
