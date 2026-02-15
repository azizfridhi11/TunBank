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

export default function Accounts() {
  const { data: accounts, isLoading } = useAccounts();
  const [isOpen, setIsOpen] = useState(false);

  return (
    <LayoutShell>
      <div className="space-y-8">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-display font-bold">Accounts</h1>
            <p className="text-muted-foreground">Manage your bank accounts and savings.</p>
          </div>
          
          <Dialog open={isOpen} onOpenChange={setIsOpen}>
            <DialogTrigger asChild>
              <Button>
                <Plus className="w-4 h-4 mr-2" /> Open New Account
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Open New Account</DialogTitle>
              </DialogHeader>
              <CreateAccountForm onSuccess={() => setIsOpen(false)} />
            </DialogContent>
          </Dialog>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
          {accounts?.map((account) => (
            <AccountCard key={account.id} account={account} className="min-h-[220px]" />
          ))}
          
          {/* Empty State / Placeholder */}
          <div 
            onClick={() => setIsOpen(true)}
            className="border-2 border-dashed border-border rounded-xl p-8 flex flex-col items-center justify-center text-center cursor-pointer hover:border-primary hover:bg-primary/5 transition-all min-h-[220px] group"
          >
            <div className="w-12 h-12 rounded-full bg-slate-100 flex items-center justify-center mb-4 group-hover:bg-primary/20">
              <Wallet className="w-6 h-6 text-muted-foreground group-hover:text-primary" />
            </div>
            <h3 className="font-semibold text-foreground">Add New Account</h3>
            <p className="text-sm text-muted-foreground mt-1">Savings, Checking, or Business</p>
          </div>
        </div>
      </div>
    </LayoutShell>
  );
}

function CreateAccountForm({ onSuccess }: { onSuccess: () => void }) {
  const { mutate: createAccount, isPending } = useCreateAccount();
  const form = useForm({
    resolver: zodResolver(insertAccountSchema),
    defaultValues: {
      type: "checking",
      currency: "USD",
      balance: "0",
      userId: 1, // Will be overridden by backend or auth context
    }
  });

  const onSubmit = (data: any) => {
    // Generate mock account number
    const mockAccountNumber = Math.floor(1000000000 + Math.random() * 9000000000).toString();
    // In a real app, userId comes from session, handled by backend
    // Here we just pass what the schema needs
    createAccount(
      { ...data, userId: 1 }, // Account number handled by backend usually, or mocked here if schema requires
      { onSuccess }
    );
  };

  return (
    <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
      <div className="space-y-2">
        <Label>Account Type</Label>
        <Select 
          onValueChange={(val) => form.setValue("type", val as any)}
          defaultValue="checking"
        >
          <SelectTrigger>
            <SelectValue placeholder="Select type" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="checking">Checking</SelectItem>
            <SelectItem value="savings">Savings</SelectItem>
            <SelectItem value="business">Business</SelectItem>
          </SelectContent>
        </Select>
      </div>

      <div className="space-y-2">
        <Label>Currency</Label>
        <Select 
          onValueChange={(val) => form.setValue("currency", val)}
          defaultValue="USD"
        >
          <SelectTrigger>
            <SelectValue placeholder="Select currency" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="USD">USD ($)</SelectItem>
            <SelectItem value="EUR">EUR (€)</SelectItem>
            <SelectItem value="GBP">GBP (£)</SelectItem>
          </SelectContent>
        </Select>
      </div>
      
      <div className="space-y-2">
        <Label>Initial Deposit</Label>
        <Input 
          type="number" 
          placeholder="0.00" 
          {...form.register("balance")} 
        />
      </div>

      <Button type="submit" className="w-full" disabled={isPending}>
        {isPending ? "Creating..." : "Create Account"}
      </Button>
    </form>
  );
}
