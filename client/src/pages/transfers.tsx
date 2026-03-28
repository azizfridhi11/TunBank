import { LayoutShell } from "@/components/layout-shell";
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
import { Loader2 } from "lucide-react";
import { useTranslation } from "react-i18next";

const transferFormSchema = z.object({
  fromAccountId: z.string(),
  toAccountId: z.string(),
  amount: z.string().min(1, "Amount is required"),
  description: z.string().optional(),
});

export default function Transfers() {
  const { data: transactions } = useTransactions();
  const { data: accounts } = useAccounts();
  const { mutate: createTransaction, isPending } = useCreateTransaction();
  const { t } = useTranslation();

  const form = useForm({
    resolver: zodResolver(transferFormSchema),
  });

  const onSubmit = (data: z.infer<typeof transferFormSchema>) => {
    createTransaction({
      fromAccountId: parseInt(data.fromAccountId),
      toAccountId: parseInt(data.toAccountId),
      amount: data.amount,
      type: "transfer",
      description: data.description,
      status: "completed"
    });
    form.reset();
  };

  return (
    <LayoutShell>
      <div className="grid lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2 space-y-6">
          <h1 className="text-3xl font-display font-bold">{t("Transfer History")}</h1>
          <div className="bg-card rounded-xl shadow-sm border border-border p-6">
             <TransactionList transactions={transactions || []} />
          </div>
        </div>

        <div className="space-y-6">
          <h2 className="text-2xl font-display font-bold">{t("New Transfer")}</h2>
          <Card className="border shadow-lg">
            <CardHeader>
              <CardTitle>{t("Move Funds")}</CardTitle>
            </CardHeader>
            <CardContent>
              <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
                <div className="space-y-2">
                  <Label>{t("From Account")}</Label>
                  <Select onValueChange={(val) => form.setValue("fromAccountId", val)}>
                    <SelectTrigger>
                      <SelectValue placeholder={t("Select account")} />
                    </SelectTrigger>
                    <SelectContent>
                      {accounts?.map((acc) => (
                        <SelectItem key={acc.id} value={acc.id.toString()}>
                          {acc.type.toUpperCase()} - {acc.accountNumber.slice(-4)} ({acc.balance} DT)
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  {form.formState.errors.fromAccountId && (
                    <span className="text-xs text-destructive">{t("Required")}</span>
                  )}
                </div>

                <div className="space-y-2">
                  <Label>{t("To Account")}</Label>
                   <Select onValueChange={(val) => form.setValue("toAccountId", val)}>
                    <SelectTrigger>
                      <SelectValue placeholder={t("Select recipient")} />
                    </SelectTrigger>
                    <SelectContent>
                      {accounts?.map((acc) => (
                        <SelectItem key={acc.id} value={acc.id.toString()}>
                           {acc.type.toUpperCase()} - {acc.accountNumber.slice(-4)}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  {form.formState.errors.toAccountId && (
                     <span className="text-xs text-destructive">{t("Required")}</span>
                  )}
                </div>

                <div className="space-y-2">
                  <Label>{t("Amount")}</Label>
                  <Input 
                    type="number" 
                    placeholder="0.00" 
                    {...form.register("amount")} 
                  />
                  {form.formState.errors.amount && (
                    <span className="text-xs text-destructive">{form.formState.errors.amount.message}</span>
                  )}
                </div>
                
                <div className="space-y-2">
                  <Label>{t("Description (Optional)")}</Label>
                  <Input 
                    placeholder={t("Rent, Groceries, etc.")}
                    {...form.register("description")} 
                  />
                </div>

                <Button type="submit" className="w-full" disabled={isPending}>
                  {isPending ? <Loader2 className="w-4 h-4 animate-spin mr-2" /> : null}
                  {t("Transfer Funds")}
                </Button>
              </form>
            </CardContent>
          </Card>
        </div>
      </div>
    </LayoutShell>
  );
}
