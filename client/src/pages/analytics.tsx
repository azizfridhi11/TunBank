import { LayoutShell } from "@/components/layout-shell";
import { useQuery } from "@tanstack/react-query";
import { Transaction } from "@shared/schema";
import { api } from "@shared/routes";
import { useTranslation } from "react-i18next";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { PieChart, Pie, Cell, Tooltip, ResponsiveContainer, Legend } from "recharts";
import { formatCurrency } from "@/lib/utils";
import { TrendingDown, TrendingUp, Wallet } from "lucide-react";

// ─── Category Definitions ─────────────────────────────────────────────────────
const CATEGORIES = [
  {
    id: "food",
    emoji: "🍕",
    bg: "bg-orange-100 dark:bg-orange-900/30",
    color: "#f97316",
    keywords: ["restaurant", "food", "meal", "pizza", "coffee", "cafe", "lunch", "dinner", "snack", "burger", "sushi"],
  },
  {
    id: "transport",
    emoji: "🚗",
    bg: "bg-blue-100 dark:bg-blue-900/30",
    color: "#3b82f6",
    keywords: ["transport", "taxi", "uber", "fuel", "gas", "parking", "train", "bus", "metro", "voyage"],
  },
  {
    id: "shopping",
    emoji: "🛍️",
    bg: "bg-purple-100 dark:bg-purple-900/30",
    color: "#a855f7",
    keywords: ["shop", "amazon", "aliexpress", "market", "mall", "store", "buy", "purchase", "order", "jumia"],
  },
  {
    id: "recharge",
    emoji: "📱",
    bg: "bg-green-100 dark:bg-green-900/30",
    color: "#22c55e",
    keywords: ["recharge", "ooredoo", "orange", "telecom", "mobile", "credit"],
  },
  {
    id: "bills",
    emoji: "💡",
    bg: "bg-yellow-100 dark:bg-yellow-900/30",
    color: "#eab308",
    keywords: ["steg", "sonede", "topnet", "facture", "bill", "water", "electricity", "internet", "abonnement"],
  },
  {
    id: "education",
    emoji: "🎓",
    bg: "bg-indigo-100 dark:bg-indigo-900/30",
    color: "#6366f1",
    keywords: ["school", "university", "inscription", "education", "eleve", "student", "cours", "formation"],
  },
  {
    id: "health",
    emoji: "🏥",
    bg: "bg-red-100 dark:bg-red-900/30",
    color: "#ef4444",
    keywords: ["health", "pharmacy", "doctor", "clinic", "hospital", "sante", "medicament", "pharmacie"],
  },
  {
    id: "entertainment",
    emoji: "🎬",
    bg: "bg-pink-100 dark:bg-pink-900/30",
    color: "#ec4899",
    keywords: ["entertainment", "cinema", "netflix", "game", "sport", "loisir", "sortie", "concert"],
  },
  {
    id: "transfer",
    emoji: "💸",
    bg: "bg-teal-100 dark:bg-teal-900/30",
    color: "#14b8a6",
    keywords: ["transfer", "virement", "mandat", "international", "envoi", "send"],
  },
  {
    id: "other",
    emoji: "📦",
    bg: "bg-slate-100 dark:bg-slate-900/30",
    color: "#94a3b8",
    keywords: [],
  },
];

const CATEGORY_LABELS: Record<string, { en: string; fr: string; ar: string; tn: string }> = {
  food:          { en: "Food & Dining",        fr: "Restauration",         ar: "مطاعم وطعام",     tn: "ماكلة ومطاعم" },
  transport:     { en: "Transport",             fr: "Transport",            ar: "تنقل",             tn: "تنقل" },
  shopping:      { en: "Shopping",              fr: "Achats",               ar: "تسوق",             tn: "شري" },
  recharge:      { en: "Mobile Recharge",       fr: "Recharge Mobile",      ar: "شحن هاتف",        tn: "شارج هاتف" },
  bills:         { en: "Bills & Utilities",     fr: "Factures",             ar: "فواتير",           tn: "فواتير" },
  education:     { en: "Education",             fr: "Éducation",            ar: "تعليم",            tn: "تعليم" },
  health:        { en: "Health",                fr: "Santé",                ar: "صحة",              tn: "صحة" },
  entertainment: { en: "Entertainment",         fr: "Divertissement",       ar: "ترفيه",            tn: "ترفيه" },
  transfer:      { en: "Transfers",             fr: "Virements",            ar: "تحويلات",          tn: "تحويلات" },
  other:         { en: "Other",                 fr: "Autre",                ar: "أخرى",             tn: "أخرى" },
};

function getCategoryForTransaction(desc: string): string {
  const lower = desc.toLowerCase();
  for (const cat of CATEGORIES) {
    if (cat.keywords.some(kw => lower.includes(kw))) return cat.id;
  }
  return "other";
}

function getCategoryLabel(id: string, lang: string): string {
  const labels = CATEGORY_LABELS[id];
  if (!labels) return id;
  return (labels as any)[lang] || labels.en;
}

// ─── Custom Tooltip for Pie ────────────────────────────────────────────────────
function CustomTooltip({ active, payload }: any) {
  if (active && payload && payload.length) {
    const d = payload[0].payload;
    return (
      <div className="bg-card border border-border rounded-lg p-3 shadow-lg text-sm">
        <p className="font-semibold">{d.emoji} {d.label}</p>
        <p className="text-primary font-bold">{formatCurrency(d.amount, "TND")}</p>
        <p className="text-muted-foreground">{d.pct.toFixed(1)}% of total</p>
      </div>
    );
  }
  return null;
}

export default function Analytics() {
  const { t, i18n } = useTranslation();
  const lang = ["en", "fr", "ar", "tn"].includes(i18n.language) ? i18n.language : "en";

  const { data: transactions, isLoading } = useQuery<Transaction[]>({
    queryKey: [api.transactions.list.path],
  });

  // Only look at debit / outgoing transactions
  const outgoing = (transactions || []).filter(tx =>
    (tx.type === "debit" || tx.type === "transfer" || tx.type === "recharge" || tx.type === "facture" || tx.type === "withdrawal") && Number(tx.amount) > 0
  );

  // Group by category
  const totalsMap: Record<string, number> = {};
  for (const tx of outgoing) {
    const catId = getCategoryForTransaction(tx.description || "");
    totalsMap[catId] = (totalsMap[catId] || 0) + Number(tx.amount);
  }

  const totalSpent = Object.values(totalsMap).reduce((a, b) => a + b, 0);

  const categorized = CATEGORIES
    .map(cat => ({
      ...cat,
      label: getCategoryLabel(cat.id, lang),
      amount: totalsMap[cat.id] || 0,
      pct: totalSpent > 0 ? ((totalsMap[cat.id] || 0) / totalSpent) * 100 : 0,
    }))
    .filter(c => c.amount > 0)
    .sort((a, b) => b.amount - a.amount);

  const top = categorized[0];

  // Pie chart data
  const pieData = categorized.map(c => ({
    name: c.label,
    value: c.amount,
    emoji: c.emoji,
    label: c.label,
    amount: c.amount,
    pct: c.pct,
    color: c.color,
  }));

  const incomingTotal = (transactions || [])
    .filter(tx => tx.type === "credit" || tx.type === "deposit")
    .reduce((s, tx) => s + Number(tx.amount), 0);

  if (isLoading) {
    return (
      <LayoutShell>
        <div className="space-y-6">
          <Skeleton className="h-10 w-64" />
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <Skeleton className="h-28" />
            <Skeleton className="h-28" />
            <Skeleton className="h-28" />
          </div>
          <Skeleton className="h-80" />
        </div>
      </LayoutShell>
    );
  }

  return (
    <LayoutShell>
      <div className="space-y-8">
        {/* Header */}
        <div>
          <h1 className="text-3xl font-display font-bold text-foreground">
            📊 {t("Smart Spending Analyzer")}
          </h1>
          <p className="text-muted-foreground mt-1">
            {t("Understand where your money goes each month")}
          </p>
        </div>

        {/* Summary Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <Card className="border-none bg-red-50 dark:bg-red-900/20">
            <CardContent className="p-5 flex items-center gap-4">
              <div className="w-12 h-12 rounded-2xl bg-red-100 dark:bg-red-800/40 flex items-center justify-center text-2xl">
                <TrendingDown className="w-6 h-6 text-red-500" />
              </div>
              <div>
                <p className="text-xs text-muted-foreground uppercase tracking-wide">{t("Total Spent")}</p>
                <p className="text-xl font-bold text-red-600 dark:text-red-400">{formatCurrency(totalSpent, "TND")}</p>
              </div>
            </CardContent>
          </Card>

          <Card className="border-none bg-green-50 dark:bg-green-900/20">
            <CardContent className="p-5 flex items-center gap-4">
              <div className="w-12 h-12 rounded-2xl bg-green-100 dark:bg-green-800/40 flex items-center justify-center">
                <TrendingUp className="w-6 h-6 text-green-500" />
              </div>
              <div>
                <p className="text-xs text-muted-foreground uppercase tracking-wide">{t("Total Received")}</p>
                <p className="text-xl font-bold text-green-600 dark:text-green-400">{formatCurrency(incomingTotal, "TND")}</p>
              </div>
            </CardContent>
          </Card>

          <Card className="border-none bg-blue-50 dark:bg-blue-900/20">
            <CardContent className="p-5 flex items-center gap-4">
              <div className="w-12 h-12 rounded-2xl bg-blue-100 dark:bg-blue-800/40 flex items-center justify-center">
                <Wallet className="w-6 h-6 text-blue-500" />
              </div>
              <div>
                <p className="text-xs text-muted-foreground uppercase tracking-wide">{t("Top Category")}</p>
                <p className="text-xl font-bold text-blue-600 dark:text-blue-400">
                  {top ? `${top.emoji} ${top.label}` : "—"}
                </p>
              </div>
            </CardContent>
          </Card>
        </div>

        {categorized.length === 0 ? (
          <Card className="border-dashed">
            <CardContent className="py-20 text-center">
              <div className="text-5xl mb-4">📭</div>
              <h3 className="text-lg font-semibold">{t("No spending data yet")}</h3>
              <p className="text-muted-foreground text-sm mt-1">{t("Make some transactions and come back here to see your analysis")}</p>
            </CardContent>
          </Card>
        ) : (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            {/* Donut Chart */}
            <Card>
              <CardHeader>
                <CardTitle className="text-base font-semibold">{t("Spending Distribution")}</CardTitle>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={300}>
                  <PieChart>
                    <Pie
                      data={pieData}
                      cx="50%"
                      cy="50%"
                      innerRadius={70}
                      outerRadius={110}
                      paddingAngle={3}
                      dataKey="value"
                    >
                      {pieData.map((entry, i) => (
                        <Cell key={i} fill={entry.color} strokeWidth={0} />
                      ))}
                    </Pie>
                    <Tooltip content={<CustomTooltip />} />
                    <Legend
                      formatter={(value) => <span className="text-xs text-foreground">{value}</span>}
                    />
                  </PieChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>

            {/* Category Breakdown */}
            <Card>
              <CardHeader>
                <CardTitle className="text-base font-semibold">{t("Category Breakdown")}</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                {categorized.map((cat) => (
                  <div key={cat.id} className="space-y-1">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <span
                          className={`w-9 h-9 rounded-xl flex items-center justify-center text-lg ${cat.bg}`}
                        >
                          {cat.emoji}
                        </span>
                        <div>
                          <p className="text-sm font-medium text-foreground">{cat.label}</p>
                          <p className="text-xs text-muted-foreground">{cat.pct.toFixed(1)}%</p>
                        </div>
                      </div>
                      <Badge
                        variant="secondary"
                        className="font-mono text-xs"
                        style={{ backgroundColor: `${cat.color}20`, color: cat.color }}
                      >
                        {formatCurrency(cat.amount, "TND")}
                      </Badge>
                    </div>
                    <div className="h-1.5 w-full rounded-full bg-muted overflow-hidden">
                      <div
                        className="h-full rounded-full transition-all duration-500"
                        style={{ width: `${cat.pct}%`, backgroundColor: cat.color }}
                      />
                    </div>
                  </div>
                ))}
              </CardContent>
            </Card>
          </div>
        )}

        {/* Category Cards Grid */}
        {categorized.length > 0 && (
          <div>
            <h2 className="text-lg font-semibold mb-4">{t("Spending by Category")}</h2>
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4">
              {categorized.map((cat) => (
                <Card
                  key={cat.id}
                  className="border-none hover:shadow-md transition-shadow cursor-default"
                  style={{ background: `${cat.color}10` }}
                >
                  <CardContent className="p-4 text-center space-y-2">
                    <div
                      className="w-14 h-14 rounded-2xl flex items-center justify-center text-3xl mx-auto shadow-sm"
                      style={{ backgroundColor: `${cat.color}25` }}
                    >
                      {cat.emoji}
                    </div>
                    <p className="text-xs font-medium text-foreground leading-tight">{cat.label}</p>
                    <p className="font-bold text-sm" style={{ color: cat.color }}>
                      {formatCurrency(cat.amount, "TND")}
                    </p>
                    <div className="text-xs text-muted-foreground">{cat.pct.toFixed(1)}%</div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
        )}
      </div>
    </LayoutShell>
  );
}
