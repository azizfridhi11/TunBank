import { format } from "date-fns";
import { ArrowUpRight, ArrowDownLeft, Coffee, ShoppingBag, Landmark } from "lucide-react";
import { formatCurrency } from "@/lib/utils";
import type { Transaction } from "@shared/schema";

export function TransactionList({ transactions }: { transactions: Transaction[] }) {
  if (transactions.length === 0) {
    return (
      <div className="text-center py-12 text-muted-foreground">
        No transactions found.
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {transactions.map((tx) => {
        const isIncoming = tx.type === "deposit" || tx.type === "transfer"; // Simplified logic for demo
        const isPositive = isIncoming; 
        
        return (
          <div 
            key={tx.id} 
            className="flex items-center justify-between p-4 bg-white border border-border rounded-xl hover:border-primary/20 hover:shadow-sm transition-all duration-200"
          >
            <div className="flex items-center gap-4">
              <div className={`
                w-10 h-10 rounded-full flex items-center justify-center
                ${isPositive ? "bg-emerald-50 text-emerald-600" : "bg-rose-50 text-rose-600"}
              `}>
                {isPositive ? <ArrowDownLeft className="w-5 h-5" /> : <ArrowUpRight className="w-5 h-5" />}
              </div>
              <div>
                <p className="font-medium text-foreground">{tx.description || tx.type}</p>
                <p className="text-xs text-muted-foreground">
                  {format(new Date(tx.createdAt || new Date()), "MMM d, yyyy • h:mm a")}
                </p>
              </div>
            </div>
            
            <div className="text-right">
              <span className={`font-semibold ${isPositive ? "text-emerald-600" : "text-foreground"}`}>
                {isPositive ? "+" : "-"}{formatCurrency(Number(tx.amount))}
              </span>
              <p className="text-xs text-muted-foreground capitalize">{tx.status}</p>
            </div>
          </div>
        );
      })}
    </div>
  );
}
