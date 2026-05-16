import { LayoutShell } from "@/components/layout-shell";
import { sounds } from "@/lib/sounds";
import { useTransactions, useCreateTransaction, useAccounts } from "@/hooks/use-finance";
import { TransactionList } from "@/components/transaction-list";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Loader2, ArrowRight, Building2 } from "lucide-react";
import { useTranslation } from "react-i18next";
import { formatCurrency } from "@/lib/utils";
import { useToast } from "@/hooks/use-toast";

// ─── Local Transfer Schema ────────────────────────────────────────────────────
const localSchema = z.object({
  fromAccountId: z.string().min(1, "Required"),
  toAccountId: z.string().min(1, "Required"),
  amount: z.string().min(1, "Required").refine(v => !isNaN(Number(v)) && Number(v) > 0, "Must be > 0"),
  description: z.string().optional(),
});


export default function Transfers() {
  const { data: transactions } = useTransactions();
  const { data: accounts } = useAccounts();
  const { t } = useTranslation();
  const { toast } = useToast();

  return (
    <LayoutShell>
      <div className="space-y-8">
        <div>
          <h1 className="text-3xl font-display font-bold text-foreground">{t("Transfers")}</h1>
          <p className="text-muted-foreground">{t("Send money between your accounts instantly.")}</p>
        </div>

        <div className="grid lg:grid-cols-5 gap-8">
          {/* Transfer Form – 2 cols */}
          <div className="lg:col-span-2 space-y-4">
            <LocalTransferForm accounts={accounts || []} />
          </div>

          {/* Transaction History – 3 cols */}
          <div className="lg:col-span-3 space-y-4">
            <h2 className="text-xl font-semibold">{t("Transfer History")}</h2>
            <div className="bg-card rounded-xl border border-border p-6">
              <TransactionList transactions={transactions || []} />
            </div>
          </div>
        </div>
      </div>
    </LayoutShell>
  );
}

// ─── Local Transfer Form ──────────────────────────────────────────────────────
function LocalTransferForm({ accounts }: { accounts: any[] }) {
  const { t } = useTranslation();
  const { toast } = useToast();
  const { mutate: createTransaction, isPending } = useCreateTransaction();

  const form = useForm({ resolver: zodResolver(localSchema) });

  const onSubmit = (data: z.infer<typeof localSchema>) => {
    createTransaction({
      fromAccountId: parseInt(data.fromAccountId),
      toAccountId: parseInt(data.toAccountId),
      amount: data.amount,
      type: "transfer",
      description: data.description || t("Local Transfer"),
      status: "completed",
    }, {
      onSuccess: () => {
        sounds.coin();
        toast({ title: t("Success"), description: t("Transfer completed successfully") });
        form.reset();
      },
      onError: (e: any) => {
        toast({ title: t("Error"), description: e.message, variant: "destructive" });
      }
    });
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-base flex items-center gap-2">
          <Building2 className="w-4 h-4 text-primary" />
          {t("Local Transfer")} 🇹🇳→🇹🇳
        </CardTitle>
      </CardHeader>
      <CardContent>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
          <div className="space-y-2">
            <Label>{t("From Account")}</Label>
            <Select onValueChange={v => form.setValue("fromAccountId", v)}>
              <SelectTrigger>
                <SelectValue placeholder={t("Select account")} />
              </SelectTrigger>
              <SelectContent>
                {accounts.map(acc => (
                  <SelectItem key={acc.id} value={acc.id.toString()}>
                    {acc.type.toUpperCase()} •••{acc.accountNumber.slice(-4)} — {formatCurrency(acc.balance, acc.currency)}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            {form.formState.errors.fromAccountId && <p className="text-xs text-destructive">{t("Required")}</p>}
          </div>

          <div className="space-y-2">
            <Label>{t("To Account")}</Label>
            <Select onValueChange={v => form.setValue("toAccountId", v)}>
              <SelectTrigger>
                <SelectValue placeholder={t("Select recipient")} />
              </SelectTrigger>
              <SelectContent>
                {accounts.map(acc => (
                  <SelectItem key={acc.id} value={acc.id.toString()}>
                    {acc.type.toUpperCase()} •••{acc.accountNumber.slice(-4)}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            {form.formState.errors.toAccountId && <p className="text-xs text-destructive">{t("Required")}</p>}
          </div>

          <div className="space-y-2">
            <Label>{t("Amount")} (DT)</Label>
            <div className="relative">
              <Input type="number" step="0.001" placeholder="0.000" {...form.register("amount")} className="pr-12" />
              <span className="absolute right-3 top-1/2 -translate-y-1/2 text-xs text-muted-foreground font-semibold">DT</span>
            </div>
            {form.formState.errors.amount && <p className="text-xs text-destructive">{form.formState.errors.amount.message}</p>}
          </div>

          <div className="space-y-2">
            <Label>{t("Description (Optional)")}</Label>
            <Input placeholder={t("Rent, Groceries, etc.")} {...form.register("description")} />
          </div>

          <Button type="submit" className="w-full" disabled={isPending}>
            {isPending ? <Loader2 className="w-4 h-4 animate-spin mr-2" /> : <ArrowRight className="w-4 h-4 mr-2" />}
            {t("Transfer Funds")}
          </Button>
        </form>
      </CardContent>
    </Card>
  );
}

