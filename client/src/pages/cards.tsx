import { LayoutShell } from "@/components/layout-shell";
import { useCards, useCreateCard, useAccounts } from "@/hooks/use-finance";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Plus, Wifi, Eye, EyeOff, Snowflake } from "lucide-react";
import { SiVisa } from "react-icons/si";
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
  const [revealed, setRevealed] = useState(false);
  const formattedNumber = card.cardNumber.match(/.{1,4}/g)?.join(" ") || card.cardNumber;
  const maskedNumber = `•••• •••• •••• ${card.cardNumber.replace(/\s/g, "").slice(-4)}`;

  return (
    <div className="space-y-3">
      <div
        className="relative aspect-[1.586/1] rounded-3xl p-6 text-white flex flex-col justify-between overflow-hidden group shadow-2xl shadow-black/40 hover:shadow-black/60 hover:-translate-y-1 transition-all duration-500 ring-1 ring-white/10"
        style={{
          background:
            "radial-gradient(ellipse at top right, #3d2412 0%, #1c1108 40%, #0a0604 75%, #000 100%)",
        }}
        data-testid={`card-credit-${card.id}`}
      >
        {/* Warm copper/gold ambient glow */}
        <div
          className="absolute -top-24 -right-16 w-72 h-72 rounded-full opacity-50 blur-3xl pointer-events-none"
          style={{ background: "radial-gradient(circle, #d49656 0%, #8a5a26 50%, transparent 80%)" }}
        />
        {/* Bottom-left subtle bronze glow */}
        <div
          className="absolute -bottom-24 -left-16 w-64 h-64 rounded-full opacity-30 blur-3xl pointer-events-none"
          style={{ background: "radial-gradient(circle, #c08047 0%, transparent 70%)" }}
        />
        {/* Etched fine pinstripes — premium foil texture */}
        <div
          className="absolute inset-0 opacity-[0.07] pointer-events-none"
          style={{
            backgroundImage:
              "repeating-linear-gradient(115deg, transparent 0, transparent 22px, rgba(255,220,180,0.8) 22px, rgba(255,220,180,0.8) 23px)",
          }}
        />
        {/* Embossed Carthage column monogram watermark */}
        <div className="absolute -bottom-12 -right-4 text-[200px] font-black opacity-[0.05] leading-none select-none pointer-events-none tracking-tighter font-serif">
          T
        </div>
        {/* Subtle inner border glow */}
        <div className="absolute inset-0 rounded-3xl ring-1 ring-inset ring-amber-200/10 pointer-events-none" />

        {/* Top row — brand */}
        <div className="relative z-10 flex justify-between items-start">
          <div>
            <p
              className="text-[10px] uppercase tracking-[0.3em] font-medium"
              style={{
                background: "linear-gradient(90deg, #fde08a, #d4a047, #c08047)",
                WebkitBackgroundClip: "text",
                WebkitTextFillColor: "transparent",
              }}
            >
              TunBank
            </p>
            <p className="text-[10px] uppercase tracking-[0.25em] text-white/40 mt-0.5">{t("Signature Debit")}</p>
          </div>
          {card.isFrozen ? (
            <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-cyan-400/20 backdrop-blur-sm">
              <Snowflake className="w-3.5 h-3.5 text-cyan-300" />
              <span className="text-[10px] uppercase tracking-wider text-cyan-100 font-semibold">{t("Frozen")}</span>
            </div>
          ) : (
            <Wifi className="w-6 h-6 rotate-90" style={{ color: "#e8c082" }} />
          )}
        </div>

        {/* EMV chip — golden, realistic */}
        <div className="relative z-10">
          <div
            className="w-12 h-9 rounded-md relative overflow-hidden ring-1 ring-black/30 shadow-inner"
            style={{
              background:
                "linear-gradient(135deg, #fde08a 0%, #e0b256 35%, #c9985a 60%, #8a6132 100%)",
            }}
          >
            <div className="absolute inset-0.5 grid grid-cols-3 grid-rows-3 gap-px opacity-50">
              {Array(9)
                .fill(0)
                .map((_, i) => (
                  <div key={i} className="bg-amber-950/40 rounded-[1px]" />
                ))}
            </div>
            {/* horizontal line through chip */}
            <div className="absolute top-1/2 left-0 right-0 h-px bg-amber-950/30" />
            <div className="absolute top-0 bottom-0 left-1/3 w-px bg-amber-950/30" />
            <div className="absolute top-0 bottom-0 left-2/3 w-px bg-amber-950/30" />
          </div>
        </div>

        {/* Card number */}
        <div className="relative z-10">
          <p
            className="font-mono text-lg sm:text-xl tracking-[0.2em] font-medium drop-shadow-md tabular-nums"
            style={{ textShadow: "0 1px 2px rgba(0,0,0,0.5)" }}
            data-testid={`text-card-number-${card.id}`}
          >
            {revealed ? formattedNumber : maskedNumber}
          </p>
        </div>

        {/* Bottom row */}
        <div className="relative z-10 flex justify-between items-end">
          <div className="space-y-2.5">
            <div>
              <p className="text-[9px] uppercase tracking-widest text-amber-100/50 mb-0.5">{t("Card Holder")}</p>
              <p className="text-sm font-semibold tracking-wide uppercase">{card.cardHolderName}</p>
            </div>
            <div className="flex items-center gap-4">
              <div>
                <p className="text-[9px] uppercase tracking-widest text-amber-100/50 mb-0.5">{t("Expires")}</p>
                <p className="text-xs font-mono font-semibold">{card.expiryDate}</p>
              </div>
              <div>
                <p className="text-[9px] uppercase tracking-widest text-amber-100/50 mb-0.5">CVV</p>
                <p className="text-xs font-mono font-semibold">{revealed ? card.cvv : "•••"}</p>
              </div>
            </div>
          </div>
          <SiVisa className="w-14 h-14 drop-shadow" style={{ color: "#fde08a" }} />
        </div>
      </div>

      {/* Reveal toggle below the card */}
      <div className="flex justify-end px-1">
        <button
          onClick={() => setRevealed((v) => !v)}
          className="flex items-center gap-1.5 text-xs text-muted-foreground hover:text-foreground transition-colors"
          data-testid={`button-reveal-${card.id}`}
        >
          {revealed ? <EyeOff className="w-3.5 h-3.5" /> : <Eye className="w-3.5 h-3.5" />}
          {revealed ? t("Hide details") : t("Show details")}
        </button>
      </div>
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
