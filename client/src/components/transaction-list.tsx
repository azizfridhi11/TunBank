import { format } from "date-fns";
import { ArrowUpRight, ArrowDownLeft, Globe } from "lucide-react";
import { formatCurrency, CURRENCY_FLAGS } from "@/lib/utils";
import { useTranslation } from "react-i18next";
import type { Transaction } from "@shared/schema";

export function TransactionList({ transactions }: { transactions: Transaction[] }) {
  const { t } = useTranslation();

  if (transactions.length === 0) {
    return (
      <div className="text-center py-12 text-muted-foreground">
        {t("No transactions yet")}
      </div>
    );
  }

  return (
    <div className="space-y-3">
      {transactions.map((tx) => {
        const isIncoming = tx.type === "deposit";
        const isIntl = !!tx.toCurrency;

        return (
          <div
            key={tx.id}
            className="flex items-center justify-between p-4 bg-card border border-border rounded-xl hover:border-primary/20 hover:shadow-sm transition-all duration-200"
          >
            <div className="flex items-center gap-3">
              <div className={`
                w-10 h-10 rounded-full flex items-center justify-center shrink-0
                ${isIntl ? "bg-blue-50 dark:bg-blue-900/30 text-blue-600" : isIncoming ? "bg-emerald-50 dark:bg-emerald-900/30 text-emerald-600" : "bg-rose-50 dark:bg-rose-900/30 text-rose-600"}
              `}>
                {isIntl ? <Globe className="w-5 h-5" /> : isIncoming ? <ArrowDownLeft className="w-5 h-5" /> : <ArrowUpRight className="w-5 h-5" />}
              </div>
              <div className="min-w-0">
                <p className="font-medium text-foreground truncate max-w-[160px]">
                  {tx.description || tx.type}
                </p>
                <p className="text-xs text-muted-foreground">
                  {format(new Date(tx.createdAt || new Date()), "dd/MM/yyyy · HH:mm")}
                </p>
                {isIntl && tx.toCurrency && (
                  <span className="inline-flex items-center gap-1 text-xs text-blue-600 bg-blue-50 dark:bg-blue-900/30 px-2 py-0.5 rounded-full mt-1">
                    <Globe className="w-3 h-3" />
                    {CURRENCY_FLAGS[tx.toCurrency] || ""} {tx.toCurrency}
                    {tx.convertedAmount && ` · ${formatCurrency(tx.convertedAmount, tx.toCurrency)}`}
                  </span>
                )}
              </div>
            </div>

            <div className="text-right shrink-0">
              <span className={`font-semibold text-sm ${isIncoming ? "text-emerald-600" : "text-foreground"}`}>
                {isIncoming ? "+" : "-"}{formatCurrency(Number(tx.amount), "TND")}
              </span>
              <p className="text-xs text-muted-foreground capitalize">{tx.status}</p>
            </div>
          </div>
        );
      })}
    </div>
  );
}
