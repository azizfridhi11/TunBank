import { LayoutShell } from "@/components/layout-shell";
import { useCards, useCreateCard, useAccounts } from "@/hooks/use-finance";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Plus, Wifi } from "lucide-react";
import { useState } from "react";
import { useForm } from "react-hook-form";
import { useTranslation } from "react-i18next";

export default function Cards() {
  const { data: cards } = useCards();
  const [isOpen, setIsOpen] = useState(false);
  const { t } = useTranslation();

  return (
    <LayoutShell>
      <div className="space-y-8">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-display font-bold">{t("My Cards")}</h1>
            <p className="text-muted-foreground">{t("Manage your physical and virtual cards.")}</p>
          </div>
          
          <Dialog open={isOpen} onOpenChange={setIsOpen}>
            <DialogTrigger asChild>
              <Button>
                <Plus className="w-4 h-4 mr-2" /> {t("Issue New Card")}
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>{t("Issue New Card")}</DialogTitle>
              </DialogHeader>
              <CreateCardForm onSuccess={() => setIsOpen(false)} />
            </DialogContent>
          </Dialog>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {cards?.map((card) => (
            <CreditCardItem key={card.id} card={card} />
          ))}
          
          <div 
            onClick={() => setIsOpen(true)}
            className="h-56 rounded-2xl border-2 border-dashed border-border bg-card flex flex-col items-center justify-center text-center cursor-pointer hover:border-primary hover:bg-primary/5 transition-all group"
          >
            <div className="w-12 h-12 rounded-full bg-background border border-border flex items-center justify-center mb-4 group-hover:border-primary">
              <Plus className="w-6 h-6 text-muted-foreground group-hover:text-primary" />
            </div>
            <h3 className="font-semibold text-foreground">{t("Issue New Card")}</h3>
            <p className="text-sm text-muted-foreground mt-1">{t("Virtual or Physical")}</p>
          </div>
        </div>
      </div>
    </LayoutShell>
  );
}

function CreditCardItem({ card }: { card: any }) {
  const { t } = useTranslation();
  const gradients = [
    "from-slate-900 to-slate-700",
    "from-blue-600 to-blue-800", 
    "from-indigo-600 to-purple-700"
  ];
  const randomGradient = gradients[card.id % gradients.length];

  return (
    <div className={`relative h-56 rounded-2xl p-6 text-white shadow-xl bg-gradient-to-br ${randomGradient} flex flex-col justify-between overflow-hidden group hover:scale-[1.02] transition-transform duration-300`}>
      <div className="flex justify-between items-start z-10">
        <div className="flex items-center gap-2">
           <Wifi className="w-6 h-6 rotate-90" />
           <span className="font-mono text-sm opacity-80">{t("Debit")}</span>
        </div>
        <span className="font-bold text-lg italic">TunBank</span>
      </div>

      <div className="z-10 space-y-4">
        <p className="font-mono text-xl tracking-widest drop-shadow-md">
          {card.cardNumber.match(/.{1,4}/g)?.join(' ') || card.cardNumber}
        </p>
        <div className="flex justify-between items-end">
          <div>
            <p className="text-xs opacity-70 uppercase mb-1">{t("Card Holder")}</p>
            <p className="font-medium tracking-wide uppercase">{card.cardHolderName}</p>
          </div>
          <div className="text-right">
             <p className="text-xs opacity-70 uppercase mb-1">{t("Expires")}</p>
             <p className="font-medium font-mono">{card.expiryDate}</p>
          </div>
        </div>
      </div>
      
      <div className="absolute top-0 right-0 -mr-16 -mt-16 w-64 h-64 rounded-full bg-white/10 blur-3xl" />
      <div className="absolute bottom-0 left-0 -ml-16 -mb-16 w-48 h-48 rounded-full bg-black/10 blur-2xl" />
    </div>
  );
}

function CreateCardForm({ onSuccess }: { onSuccess: () => void }) {
  const { mutate: createCard, isPending } = useCreateCard();
  const { data: accounts } = useAccounts();
  const { t } = useTranslation();
  const form = useForm();

  const onSubmit = (data: any) => {
    const mockCardNumber = Array(16).fill(0).map(() => Math.floor(Math.random() * 10)).join('');
    const mockCvv = Math.floor(100 + Math.random() * 900).toString();
    const expiryDate = "12/28";

    createCard({
      accountId: parseInt(data.accountId),
      cardHolderName: data.cardHolderName,
      cardNumber: mockCardNumber,
      cvv: mockCvv,
      expiryDate: expiryDate,
      isFrozen: false
    }, { onSuccess });
  };

  return (
    <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
      <div className="space-y-2">
        <Label>{t("Link to Account")}</Label>
        <Select onValueChange={(val) => form.setValue("accountId", val)}>
          <SelectTrigger>
            <SelectValue placeholder={t("Select account")} />
          </SelectTrigger>
          <SelectContent>
            {accounts?.map((acc) => (
              <SelectItem key={acc.id} value={acc.id.toString()}>
                {acc.type.toUpperCase()} - ({acc.currency})
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      <div className="space-y-2">
        <Label>{t("Name on Card")}</Label>
        <Input placeholder="JOHN DOE" {...form.register("cardHolderName")} />
      </div>

      <Button type="submit" className="w-full" disabled={isPending}>
        {isPending ? t("Issuing...") : t("Issue Card")}
      </Button>
    </form>
  );
}
