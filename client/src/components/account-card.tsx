import { Card } from "@/components/ui/card";
import { formatCurrency } from "@/lib/utils";
import { MoreHorizontal, ArrowUpRight, ArrowDownLeft } from "lucide-react";
import type { Account } from "@shared/schema";

interface AccountCardProps {
  account: Account;
  className?: string;
}

export function AccountCard({ account, className }: AccountCardProps) {
  return (
    <Card className={`p-6 relative overflow-hidden group hover:shadow-lg transition-all duration-300 ${className}`}>
      <div className="absolute top-0 right-0 p-4 opacity-0 group-hover:opacity-100 transition-opacity">
        <button className="text-muted-foreground hover:text-foreground">
          <MoreHorizontal className="w-5 h-5" />
        </button>
      </div>
      
      <div className="space-y-4">
        <div>
          <p className="text-sm font-medium text-muted-foreground uppercase tracking-wider">{account.type}</p>
          <h3 className="text-2xl font-bold font-display mt-1 text-foreground">
            {formatCurrency(Number(account.balance), account.currency)}
          </h3>
        </div>

        <div className="flex items-center justify-between pt-4 border-t border-border/50">
          <div className="flex items-center gap-2">
            <div className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
            <span className="text-xs font-medium text-muted-foreground">Active</span>
          </div>
          <span className="text-xs font-mono text-muted-foreground">
            •••• {account.accountNumber.slice(-4)}
          </span>
        </div>
      </div>
      
      {/* Decorative gradient blob */}
      <div className="absolute -bottom-12 -right-12 w-32 h-32 bg-primary/5 rounded-full blur-2xl group-hover:bg-primary/10 transition-colors" />
    </Card>
  );
}
