import { LayoutShell } from "@/components/layout-shell";
import { useQuery } from "@tanstack/react-query";
import { useTranslation } from "react-i18next";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { Gift, Zap, Star, Trophy, CheckCircle2, ArrowRightLeft, Phone, FileText, Wallet, CreditCard } from "lucide-react";
import { formatDistanceToNow } from "date-fns";

// ─── Types ────────────────────────────────────────────────────────────────────
interface Reward { totalPoints: number; tier: string; }
interface RewardEvent { id: number; points: number; action: string; description: string; createdAt: string; }

// ─── Tier Config ──────────────────────────────────────────────────────────────
const TIERS = [
  { id: "bronze",   label: "Bronze",   emoji: "🥉", color: "#b45309", bg: "from-amber-700 to-amber-900",    min: 0,    max: 499,  textColor: "text-amber-700 dark:text-amber-400"  },
  { id: "silver",   label: "Silver",   emoji: "🥈", color: "#9ca3af", bg: "from-slate-400 to-slate-600",    min: 500,  max: 1999, textColor: "text-slate-500 dark:text-slate-300"  },
  { id: "gold",     label: "Gold",     emoji: "🥇", color: "#d97706", bg: "from-yellow-500 to-amber-600",   min: 2000, max: 4999, textColor: "text-yellow-600 dark:text-yellow-400"},
  { id: "platinum", label: "Platinum", emoji: "💎", color: "#7c3aed", bg: "from-violet-500 to-purple-700",  min: 5000, max: 9999, textColor: "text-violet-600 dark:text-violet-400" },
];

const ACTION_ICONS: Record<string, any> = {
  recharge:         Phone,
  bill_payment:     FileText,
  local_transfer:   ArrowRightLeft,
  intl_transfer:    ArrowRightLeft,
  loan_repayment:   CreditCard,
  account_creation: Wallet,
};

const EARN_RULES = [
  { action: "recharge",         points: 20,  icon: Phone,          labelKey: "Mobile Recharge",      color: "bg-green-100 dark:bg-green-900/30",   iconColor: "text-green-600"  },
  { action: "bill_payment",     points: 50,  icon: FileText,       labelKey: "Bill Payment",         color: "bg-yellow-100 dark:bg-yellow-900/30", iconColor: "text-yellow-600" },
  { action: "local_transfer",   points: 10,  icon: ArrowRightLeft, labelKey: "Local Transfer",       color: "bg-blue-100 dark:bg-blue-900/30",     iconColor: "text-blue-600"   },
  { action: "intl_transfer",    points: 30,  icon: ArrowRightLeft, labelKey: "International Transfer",color: "bg-indigo-100 dark:bg-indigo-900/30", iconColor: "text-indigo-600" },
  { action: "loan_repayment",   points: 100, icon: CreditCard,     labelKey: "Loan Repayment",       color: "bg-purple-100 dark:bg-purple-900/30", iconColor: "text-purple-600" },
  { action: "account_creation", points: 25,  icon: Wallet,         labelKey: "Open New Account",     color: "bg-teal-100 dark:bg-teal-900/30",     iconColor: "text-teal-600"   },
];

function TierBadge({ tier }: { tier: string }) {
  const t = TIERS.find(t => t.id === tier) || TIERS[0];
  return (
    <span className={`inline-flex items-center gap-1.5 font-bold ${t.textColor}`}>
      {t.emoji} {t.label}
    </span>
  );
}

export default function Rewards() {
  const { t } = useTranslation();

  const { data: reward, isLoading: loadingReward } = useQuery<Reward>({
    queryKey: ["/api/rewards"],
  });

  const { data: events, isLoading: loadingEvents } = useQuery<RewardEvent[]>({
    queryKey: ["/api/rewards/events"],
  });

  const currentTier = TIERS.find(t => t.id === reward?.tier) || TIERS[0];
  const nextTier = TIERS[TIERS.indexOf(currentTier) + 1] || null;
  const points = reward?.totalPoints ?? 0;
  const progressPct = nextTier
    ? Math.min(100, ((points - currentTier.min) / (nextTier.min - currentTier.min)) * 100)
    : 100;

  return (
    <LayoutShell>
      <div className="space-y-8">
        {/* Header */}
        <div>
          <h1 className="text-3xl font-display font-bold text-foreground flex items-center gap-2">
            <Gift className="w-8 h-8 text-primary" />
            {t("Rewards")}
          </h1>
          <p className="text-muted-foreground mt-1">{t("Earn points for every action you take")}</p>
        </div>

        {/* Main Points Card */}
        {loadingReward ? (
          <Skeleton className="h-52 w-full rounded-3xl" />
        ) : (
          <div className={`relative rounded-3xl p-8 bg-gradient-to-br ${currentTier.bg} text-white overflow-hidden shadow-2xl`}>
            {/* Decorative circles */}
            <div className="absolute top-0 right-0 w-72 h-72 rounded-full bg-white/10 -mr-24 -mt-24" />
            <div className="absolute bottom-0 left-0 w-48 h-48 rounded-full bg-black/10 -ml-16 -mb-16" />

            <div className="relative z-10 flex flex-col md:flex-row md:items-center md:justify-between gap-6">
              <div>
                <p className="text-white/70 text-sm uppercase tracking-widest font-medium mb-1">{t("Your Balance")}</p>
                <div className="flex items-end gap-3">
                  <span className="text-6xl font-black tabular-nums">{points.toLocaleString()}</span>
                  <span className="text-2xl font-bold text-white/80 mb-2">{t("pts")}</span>
                </div>
                <div className="mt-3 flex items-center gap-2 text-white/90">
                  <span className="text-2xl">{currentTier.emoji}</span>
                  <span className="font-semibold text-lg">{currentTier.label} {t("Member")}</span>
                </div>
              </div>

              {/* Progress to next tier */}
              {nextTier && (
                <div className="md:w-72 space-y-2">
                  <div className="flex justify-between text-sm text-white/70">
                    <span>{currentTier.emoji} {currentTier.label}</span>
                    <span>{nextTier.emoji} {nextTier.label}</span>
                  </div>
                  <div className="h-3 rounded-full bg-white/20 overflow-hidden">
                    <div
                      className="h-full rounded-full bg-white transition-all duration-700"
                      style={{ width: `${progressPct}%` }}
                    />
                  </div>
                  <p className="text-center text-sm text-white/80">
                    {nextTier.min - points > 0
                      ? `${(nextTier.min - points).toLocaleString()} ${t("pts to")} ${nextTier.label}`
                      : t("Max tier reached!")}
                  </p>
                </div>
              )}
            </div>
          </div>
        )}

        {/* Tier Progression */}
        <div>
          <h2 className="text-lg font-semibold mb-4">{t("Membership Tiers")}</h2>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {TIERS.map((tier) => {
              const isActive = reward?.tier === tier.id;
              const isPast = TIERS.indexOf(TIERS.find(t => t.id === reward?.tier) || TIERS[0]) > TIERS.indexOf(tier);
              return (
                <Card
                  key={tier.id}
                  className={`border-2 transition-all ${isActive ? "border-primary shadow-lg scale-105" : isPast ? "border-green-500/40 opacity-80" : "border-border opacity-60"}`}
                >
                  <CardContent className="p-4 text-center space-y-1">
                    <div className="text-4xl">{tier.emoji}</div>
                    <p className="font-bold text-foreground">{tier.label}</p>
                    <p className="text-xs text-muted-foreground">
                      {tier.min.toLocaleString()} – {tier.id === "platinum" ? "∞" : tier.max.toLocaleString()} {t("pts")}
                    </p>
                    {(isActive || isPast) && (
                      <Badge variant="secondary" className="text-xs bg-green-100 text-green-700 dark:bg-green-900/40 dark:text-green-400">
                        <CheckCircle2 className="w-3 h-3 mr-1" />
                        {isActive ? t("Current") : t("Achieved")}
                      </Badge>
                    )}
                  </CardContent>
                </Card>
              );
            })}
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* How to Earn */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-base">
                <Zap className="w-5 h-5 text-yellow-500" /> {t("How to Earn Points")}
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              {EARN_RULES.map((rule) => {
                const Icon = rule.icon;
                return (
                  <div key={rule.action} className="flex items-center justify-between p-3 rounded-xl hover:bg-muted/50 transition-colors">
                    <div className="flex items-center gap-3">
                      <div className={`w-9 h-9 rounded-xl flex items-center justify-center ${rule.color}`}>
                        <Icon className={`w-4 h-4 ${rule.iconColor}`} />
                      </div>
                      <p className="text-sm font-medium text-foreground">{t(rule.labelKey)}</p>
                    </div>
                    <Badge variant="secondary" className="font-bold text-primary">
                      +{rule.points} {t("pts")}
                    </Badge>
                  </div>
                );
              })}
            </CardContent>
          </Card>

          {/* Recent Activity */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-base">
                <Star className="w-5 h-5 text-yellow-500" /> {t("Recent Activity")}
              </CardTitle>
            </CardHeader>
            <CardContent>
              {loadingEvents ? (
                <div className="space-y-3">
                  {[1,2,3].map(i => <Skeleton key={i} className="h-12 w-full rounded-xl" />)}
                </div>
              ) : !events || events.length === 0 ? (
                <div className="text-center py-10">
                  <Trophy className="w-12 h-12 text-muted-foreground/30 mx-auto mb-3" />
                  <p className="text-sm text-muted-foreground">{t("No reward activity yet")}</p>
                  <p className="text-xs text-muted-foreground mt-1">{t("Make a transfer or pay a bill to start earning")}</p>
                </div>
              ) : (
                <div className="space-y-2 max-h-80 overflow-y-auto pr-1">
                  {events.slice(0, 20).map((ev) => {
                    const Icon = ACTION_ICONS[ev.action] || Gift;
                    return (
                      <div key={ev.id} className="flex items-center justify-between p-3 rounded-xl bg-muted/40 hover:bg-muted/70 transition-colors">
                        <div className="flex items-center gap-3">
                          <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center">
                            <Icon className="w-4 h-4 text-primary" />
                          </div>
                          <div>
                            <p className="text-xs font-medium text-foreground leading-tight">{ev.description}</p>
                            <p className="text-xs text-muted-foreground">
                              {ev.createdAt ? formatDistanceToNow(new Date(ev.createdAt), { addSuffix: true }) : ""}
                            </p>
                          </div>
                        </div>
                        <span className="text-sm font-bold text-green-600 dark:text-green-400 shrink-0">
                          +{ev.points} {t("pts")}
                        </span>
                      </div>
                    );
                  })}
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </LayoutShell>
  );
}
