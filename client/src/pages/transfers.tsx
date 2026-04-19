import { useState } from "react";
import { LayoutShell } from "@/components/layout-shell";
import { sounds } from "@/lib/sounds";
import { useTransactions, useCreateTransaction, useAccounts } from "@/hooks/use-finance";
import { TransactionList } from "@/components/transaction-list";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Loader2, ArrowRight, Globe, Building2, RefreshCw } from "lucide-react";
import { useTranslation } from "react-i18next";
import { formatCurrency, EXCHANGE_RATES, CURRENCY_FLAGS, CURRENCY_NAMES } from "@/lib/utils";
import { apiRequest } from "@/lib/queryClient";
import { queryClient } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";

// ─── Local Transfer Schema ────────────────────────────────────────────────────
const localSchema = z.object({
  fromAccountId: z.string().min(1, "Required"),
  toAccountId: z.string().min(1, "Required"),
  amount: z.string().min(1, "Required").refine(v => !isNaN(Number(v)) && Number(v) > 0, "Must be > 0"),
  description: z.string().optional(),
});

// ─── International Transfer Schema ───────────────────────────────────────────
const intlSchema = z.object({
  fromAccountId: z.string().min(1, "Required"),
  toCurrency: z.string().min(1, "Required"),
  recipientName: z.string().min(2, "Required"),
  recipientCardNumber: z.string().min(8, "Enter valid card/account number"),
  amount: z.string().min(1, "Required").refine(v => !isNaN(Number(v)) && Number(v) > 0, "Must be > 0"),
  description: z.string().optional(),
});

const DESTINATION_CURRENCIES = ["USD", "EUR", "GBP"];

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
          <p className="text-muted-foreground">{t("Send money locally or internationally with live conversion.")}</p>
        </div>

        <div className="grid lg:grid-cols-5 gap-8">
          {/* Transfer Form – 2 cols */}
          <div className="lg:col-span-2 space-y-4">
            <Tabs defaultValue="local" className="w-full">
              <TabsList className="grid grid-cols-2 w-full mb-4">
                <TabsTrigger value="local" className="gap-2">
                  <Building2 className="w-4 h-4" /> {t("Local")}
                </TabsTrigger>
                <TabsTrigger value="international" className="gap-2">
                  <Globe className="w-4 h-4" /> {t("International")}
                </TabsTrigger>
              </TabsList>

              <TabsContent value="local">
                <LocalTransferForm accounts={accounts || []} />
              </TabsContent>

              <TabsContent value="international">
                <InternationalTransferForm accounts={accounts || []} />
              </TabsContent>
            </Tabs>
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

// ─── International Transfer Form ──────────────────────────────────────────────
function InternationalTransferForm({ accounts }: { accounts: any[] }) {
  const { t } = useTranslation();
  const { toast } = useToast();
  const [isPending, setIsPending] = useState(false);

  const form = useForm({ resolver: zodResolver(intlSchema) });
  const watchAmount = form.watch("amount");
  const watchToCurrency = form.watch("toCurrency");
  const watchFromId = form.watch("fromAccountId");

  const fromAccount = accounts.find(a => a.id.toString() === watchFromId);
  const fromCurrency = fromAccount?.currency || "TND";
  const rate = watchToCurrency ? (EXCHANGE_RATES[fromCurrency]?.[watchToCurrency] || 1) : null;
  const converted = rate && watchAmount && !isNaN(Number(watchAmount))
    ? (Number(watchAmount) * rate).toFixed(2)
    : null;

  const onSubmit = async (data: z.infer<typeof intlSchema>) => {
    setIsPending(true);
    try {
      const res = await apiRequest("POST", "/api/transactions", {
        fromAccountId: parseInt(data.fromAccountId),
        toAccountId: null,
        amount: data.amount,
        type: "transfer",
        status: "completed",
        description: data.description || `${t("International Transfer")} → ${data.toCurrency}`,
        toCurrency: data.toCurrency,
        recipientCardNumber: data.recipientCardNumber,
        recipientName: data.recipientName,
      });
      if (!res.ok) {
        const err = await res.json();
        throw new Error(err.message);
      }
      queryClient.invalidateQueries({ queryKey: ["/api/transactions"] });
      queryClient.invalidateQueries({ queryKey: ["/api/accounts"] });
      toast({
        title: t("Transfer Sent"),
        description: `${formatCurrency(data.amount, fromCurrency)} → ${formatCurrency(converted || "0", data.toCurrency)}`,
      });
      form.reset();
    } catch (e: any) {
      toast({ title: t("Error"), description: e.message, variant: "destructive" });
    } finally {
      setIsPending(false);
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-base flex items-center gap-2">
          <Globe className="w-4 h-4 text-primary" />
          {t("International Transfer")}
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
                    {CURRENCY_FLAGS[acc.currency] || ""} {acc.type.toUpperCase()} •••{acc.accountNumber.slice(-4)} — {formatCurrency(acc.balance, acc.currency)}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            {form.formState.errors.fromAccountId && <p className="text-xs text-destructive">{t("Required")}</p>}
          </div>

          <div className="space-y-2">
            <Label>{t("Destination Currency")}</Label>
            <Select onValueChange={v => form.setValue("toCurrency", v)}>
              <SelectTrigger>
                <SelectValue placeholder={t("Select destination")} />
              </SelectTrigger>
              <SelectContent>
                {DESTINATION_CURRENCIES.map(c => (
                  <SelectItem key={c} value={c}>
                    {CURRENCY_FLAGS[c]} {c} — {CURRENCY_NAMES[c]}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            {form.formState.errors.toCurrency && <p className="text-xs text-destructive">{t("Required")}</p>}
          </div>

          <div className="space-y-2">
            <Label>{t("Recipient Name")}</Label>
            <Input placeholder="John Smith" {...form.register("recipientName")} />
            {form.formState.errors.recipientName && <p className="text-xs text-destructive">{t("Required")}</p>}
          </div>

          <div className="space-y-2">
            <Label>{t("Recipient Card / Account Number")}</Label>
            <Input placeholder="4532 **** **** 1234" {...form.register("recipientCardNumber")} />
            {form.formState.errors.recipientCardNumber && <p className="text-xs text-destructive">{form.formState.errors.recipientCardNumber.message}</p>}
          </div>

          <div className="space-y-2">
            <Label>{t("Amount")} ({fromCurrency})</Label>
            <div className="relative">
              <Input type="number" step="0.001" placeholder="0.000" {...form.register("amount")} className="pr-16" />
              <span className="absolute right-3 top-1/2 -translate-y-1/2 text-xs text-muted-foreground font-semibold">{fromCurrency}</span>
            </div>
            {form.formState.errors.amount && <p className="text-xs text-destructive">{form.formState.errors.amount.message}</p>}
          </div>

          {/* Live Conversion Preview */}
          {rate && converted && watchToCurrency && (
            <div className="rounded-xl bg-primary/5 border border-primary/20 p-4 space-y-2">
              <div className="flex items-center justify-between text-sm">
                <span className="text-muted-foreground">{t("Exchange Rate")}</span>
                <span className="font-mono font-semibold">
                  1 {fromCurrency} = {rate} {watchToCurrency}
                </span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-muted-foreground text-sm">{t("Recipient gets")}</span>
                <span className="text-lg font-bold text-primary flex items-center gap-1">
                  <RefreshCw className="w-3 h-3 animate-spin" style={{ animationDuration: "3s" }} />
                  {CURRENCY_FLAGS[watchToCurrency]} {formatCurrency(converted, watchToCurrency)}
                </span>
              </div>
            </div>
          )}

          <div className="space-y-2">
            <Label>{t("Description (Optional)")}</Label>
            <Input placeholder={t("Rent, Groceries, etc.")} {...form.register("description")} />
          </div>

          <Button type="submit" className="w-full" disabled={isPending}>
            {isPending ? <Loader2 className="w-4 h-4 animate-spin mr-2" /> : <Globe className="w-4 h-4 mr-2" />}
            {t("Send Internationally")}
          </Button>
        </form>
      </CardContent>
    </Card>
  );
}
