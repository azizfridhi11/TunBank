import { useState } from "react";
import { LayoutShell } from "@/components/layout-shell";
import { useAccounts, useCreateAccount } from "@/hooks/use-finance";
import { AccountCard } from "@/components/account-card";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Plus, Wallet } from "lucide-react";
import { z } from "zod";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { insertAccountSchema } from "@shared/schema";
import { useTranslation } from "react-i18next";

export default function Accounts() {
  const { data: accounts, isLoading } = useAccounts();
  const [isOpen, setIsOpen] = useState(false);
  const { t } = useTranslation();

  return (
    <LayoutShell>
      <div className="space-y-8">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-display font-bold">{t("Accounts")}</h1>
            <p className="text-muted-foreground">{t("Manage your bank accounts")}</p>
          </div>
          
          <Dialog open={isOpen} onOpenChange={setIsOpen}>
            <DialogTrigger asChild>
              <Button>
                <Plus className="w-4 h-4 mr-2" /> {t("Open New Account")}
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>{t("Open New Account")}</DialogTitle>
              </DialogHeader>
              <CreateAccountForm onSuccess={() => setIsOpen(false)} />
            </DialogContent>
          </Dialog>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
          {accounts?.map((account) => (
            <AccountCard key={account.id} account={account} className="min-h-[220px]" />
          ))}
          
          <div 
            onClick={() => setIsOpen(true)}
            className="border-2 border-dashed border-border rounded-xl p-8 flex flex-col items-center justify-center text-center cursor-pointer hover:border-primary hover:bg-primary/5 transition-all min-h-[220px] group"
          >
            <div className="w-12 h-12 rounded-full bg-slate-100 dark:bg-slate-800 flex items-center justify-center mb-4 group-hover:bg-primary/20">
              <Wallet className="w-6 h-6 text-muted-foreground group-hover:text-primary" />
            </div>
            <h3 className="font-semibold text-foreground">{t("Add New Account")}</h3>
            <p className="text-sm text-muted-foreground mt-1">{t("Savings, Checking, or Business")}</p>
          </div>
        </div>
      </div>
    </LayoutShell>
  );
}

function CreateAccountForm({ onSuccess }: { onSuccess: () => void }) {
  const { mutate: createAccount, isPending } = useCreateAccount();
  const { t } = useTranslation();
  const form = useForm({
    resolver: zodResolver(insertAccountSchema),
    defaultValues: {
      type: "checking",
      currency: "TND",
      balance: "0",
      userId: 1,
    }
  });

  const onSubmit = (data: any) => {
    createAccount(
      { ...data, userId: 1 },
      { onSuccess }
    );
  };

  return (
    <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
      <div className="space-y-2">
        <Label>{t("Account Type")}</Label>
        <Select 
          onValueChange={(val) => form.setValue("type", val as any)}
          defaultValue="checking"
        >
          <SelectTrigger>
            <SelectValue placeholder={t("Select type")} />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="checking">{t("Checking")}</SelectItem>
            <SelectItem value="savings">{t("Savings")}</SelectItem>
            <SelectItem value="business">{t("Business")}</SelectItem>
          </SelectContent>
        </Select>
      </div>

      <div className="space-y-2">
        <Label>{t("Currency")}</Label>
        <Select 
          onValueChange={(val) => form.setValue("currency", val)}
          defaultValue="TND"
        >
          <SelectTrigger>
            <SelectValue placeholder={t("Select currency")} />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="TND">TND (د.ت)</SelectItem>
            <SelectItem value="USD">USD ($)</SelectItem>
            <SelectItem value="EUR">EUR (€)</SelectItem>
          </SelectContent>
        </Select>
      </div>
      
      <div className="space-y-2">
        <Label>{t("Initial Deposit")}</Label>
        <Input 
          type="number" 
          placeholder="0.00" 
          {...form.register("balance")} 
        />
      </div>

      <Button type="submit" className="w-full" disabled={isPending}>
        {isPending ? t("Creating...") : t("Create Account")}
      </Button>
    </form>
  );
}
