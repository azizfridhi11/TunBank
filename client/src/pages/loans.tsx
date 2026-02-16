import { LayoutShell } from "@/components/layout-shell";
import { useUser } from "@/hooks/use-auth";
import { useQuery, useMutation } from "@tanstack/react-query";
import { api, buildUrl } from "@shared/routes";
import { Account, Loan } from "@shared/schema";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { formatCurrency } from "@/lib/utils";
import { Loader2, CreditCard, Wallet, ArrowRight } from "lucide-react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { useToast } from "@/hooks/use-toast";
import { queryClient } from "@/lib/queryClient";
import { useTranslation } from "react-i18next";

export default function Loans() {
  const { t } = useTranslation();
  const { data: loans, isLoading: isLoadingLoans } = useQuery<Loan[]>({ 
    queryKey: [api.loans.list.path] 
  });
  const { data: accounts } = useQuery<Account[]>({ 
    queryKey: [api.accounts.list.path] 
  });

  if (isLoadingLoans) {
    return (
      <LayoutShell>
        <div className="flex items-center justify-center h-64">
          <Loader2 className="w-8 h-8 animate-spin text-primary" />
        </div>
      </LayoutShell>
    );
  }

  return (
    <LayoutShell>
      <div className="space-y-8">
        <div>
          <h1 className="text-3xl font-display font-bold text-foreground">{t("Loan Repayment")}</h1>
          <p className="text-muted-foreground">{t("Manage and pay your loan installments securely.")}</p>
        </div>

        <div className="grid grid-cols-1 gap-6">
          {loans?.length === 0 ? (
            <Card>
              <CardContent className="p-12 text-center">
                <p className="text-muted-foreground">{t("No active loans found.")}</p>
              </CardContent>
            </Card>
          ) : (
            loans?.map((loan) => (
              <LoanCard key={loan.id} loan={loan} accounts={accounts || []} />
            ))
          )}
        </div>
      </div>
    </LayoutShell>
  );
}

function LoanCard({ loan, accounts }: { loan: Loan; accounts: Account[] }) {
  const { t } = useTranslation();
  const { toast } = useToast();
  const [isOpen, setIsOpen] = useState(false);

  const totalRepayment = Number(loan.amount) * (1 + Number(loan.interestRate) / 100);
  const totalInterest = totalRepayment - Number(loan.amount);

  const repaymentSchema = z.object({
    accountId: z.coerce.number().min(1, t("Please select an account")),
    amount: z.coerce.number().min(1, t("Amount must be greater than 0")),
  });

  const form = useForm({
    resolver: zodResolver(repaymentSchema),
    defaultValues: {
      accountId: 0,
      amount: Number(loan.monthlyInstallment),
    },
  });

  const repayMutation = useMutation({
    mutationFn: async (data: any) => {
      const res = await fetch(buildUrl(api.loans.repay.path, { id: loan.id }), {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      });
      if (!res.ok) {
        const err = await res.json();
        throw new Error(err.message || t("Repayment failed"));
      }
      return res.json();
    },
    onSuccess: () => {
      toast({ title: t("Success"), description: t("Payment processed successfully") });
      queryClient.invalidateQueries({ queryKey: [api.loans.list.path] });
      queryClient.invalidateQueries({ queryKey: [api.accounts.list.path] });
      queryClient.invalidateQueries({ queryKey: [api.transactions.list.path] });
      setIsOpen(false);
    },
    onError: (error: Error) => {
      toast({ title: t("Error"), description: error.message, variant: "destructive" });
    },
  });

  const onSubmit = (data: any) => {
    repayMutation.mutate(data);
  };

  return (
    <Card className="overflow-hidden border-border bg-card">
      <CardHeader className="bg-muted/30 pb-6">
        <div className="flex justify-between items-start">
          <div>
            <CardTitle className="text-xl">{t("Personal Loan")}</CardTitle>
            <CardDescription>{t("ID")}: #{loan.id}</CardDescription>
          </div>
          <div className={`px-3 py-1 rounded-full text-xs font-medium ${
            loan.status === 'active' ? 'bg-emerald-100 text-emerald-700' : 'bg-slate-100 text-slate-700'
          }`}>
            {t(loan.status.toUpperCase())}
          </div>
        </div>
      </CardHeader>
      <CardContent className="p-6">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
          <div className="space-y-1">
            <p className="text-sm text-muted-foreground">{t("Loan Amount")}</p>
            <p className="text-xl font-bold">{formatCurrency(loan.amount)}</p>
          </div>
          <div className="space-y-1">
            <p className="text-sm text-muted-foreground">{t("Remaining Balance")}</p>
            <p className="text-xl font-bold">{formatCurrency(loan.remainingBalance)}</p>
          </div>
          <div className="space-y-1">
            <p className="text-sm text-muted-foreground">{t("Monthly Installment")}</p>
            <p className="text-xl font-bold">{formatCurrency(loan.monthlyInstallment)}</p>
          </div>
          <div className="space-y-1">
            <p className="text-sm text-muted-foreground">{t("Interest Rate")}</p>
            <p className="text-xl font-bold">{loan.interestRate}%</p>
          </div>
        </div>

        <div className="mt-6 pt-6 border-t border-border grid grid-cols-1 md:grid-cols-2 gap-8">
          <div className="space-y-1">
            <p className="text-sm text-muted-foreground">{t("Total Interest")}</p>
            <p className="text-lg font-semibold">{formatCurrency(totalInterest.toString())}</p>
          </div>
          <div className="space-y-1">
            <p className="text-sm text-muted-foreground">{t("Total Repayment")}</p>
            <p className="text-lg font-semibold">{formatCurrency(totalRepayment.toString())}</p>
          </div>
        </div>

        <div className="mt-8 flex justify-end">
          <Dialog open={isOpen} onOpenChange={setIsOpen}>
            <DialogTrigger asChild>
              <Button disabled={loan.status !== 'active'}>
                {t("Make Repayment")} <ArrowRight className="ml-2 h-4 w-4" />
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>{t("Loan Repayment")}</DialogTitle>
              </DialogHeader>
              <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
                <div className="space-y-2">
                  <Label>{t("Select Account")}</Label>
                  <Select onValueChange={(val) => form.setValue("accountId", Number(val))}>
                    <SelectTrigger>
                      <SelectValue placeholder={t("Choose an account")} />
                    </SelectTrigger>
                    <SelectContent>
                      {accounts.map(acc => (
                        <SelectItem key={acc.id} value={acc.id.toString()}>
                          {acc.accountNumber} ({formatCurrency(acc.balance)})
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label>{t("Repayment Amount")}</Label>
                  <Input type="number" {...form.register("amount")} />
                </div>
                <Button type="submit" className="w-full" disabled={repayMutation.isPending}>
                  {repayMutation.isPending ? <Loader2 className="w-4 h-4 animate-spin mr-2" /> : null}
                  {t("Confirm Payment")}
                </Button>
              </form>
            </DialogContent>
          </Dialog>
        </div>
      </CardContent>
    </Card>
  );
}

import { useState } from "react";
