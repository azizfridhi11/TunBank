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

type CardVariant = {
  name: string;
  bg: string;
  accent: string;
  text: string;
  subtext: string;
  chip: string;
  shimmer: string;
};

const CARD_VARIANTS: CardVariant[] = [
  {
    // Obsidian — pitch black with copper-rose accents
    name: "Obsidian",
    bg: "bg-[radial-gradient(ellipse_at_top_right,#3a2418_0%,#1a0f0a_45%,#000_100%)]",
    accent: "from-[#d4945a] via-[#a86b3c] to-[#5c3a20]",
    text: "text-white",
    subtext: "text-white/60",
    chip: "from-[#e8c082] via-[#c9985a] to-[#8a6132]",
    shimmer: "from-transparent via-white/10 to-transparent",
  },
  {
    // Carthage Gold — deep ember to molten gold
    name: "Carthage Gold",
    bg: "bg-[radial-gradient(ellipse_at_bottom_left,#8b5e2a_0%,#3d2614_50%,#15090a_100%)]",
    accent: "from-[#fde08a] via-[#d4a047] to-[#7a5219]",
    text: "text-white",
    subtext: "text-amber-100/70",
    chip: "from-[#fde08a] via-[#e0b256] to-[#9a6f24]",
    shimmer: "from-transparent via-amber-200/15 to-transparent",
  },
  {
    // Aurora — dark obsidian with iridescent emerald/violet/rose shimmer
    name: "Aurora",
    bg: "bg-[radial-gradient(ellipse_at_top_left,#1a3a3a_0%,#1f1535_45%,#2a0f2a_75%,#0a050f_100%)]",
    accent: "from-emerald-300 via-violet-400 to-rose-300",
    text: "text-white",
    subtext: "text-white/60",
    chip: "from-amber-200 via-amber-400 to-amber-700",
    shimmer: "from-emerald-300/10 via-violet-300/10 to-rose-300/10",
  },
];

function CreditCardItem({ card }: { card: any }) {
  const { t } = useTranslation();
  const variant = CARD_VARIANTS[card.id % CARD_VARIANTS.length];
  const [revealed, setRevealed] = useState(false);
  const formattedNumber = card.cardNumber.match(/.{1,4}/g)?.join(" ") || card.cardNumber;
  const maskedNumber = `•••• •••• •••• ${card.cardNumber.replace(/\s/g, "").slice(-4)}`;

  return (
    <div className="space-y-3">
      <div
        className={`relative aspect-[1.586/1] rounded-3xl p-6 ${variant.text} ${variant.bg} flex flex-col justify-between overflow-hidden group shadow-2xl shadow-black/30 hover:shadow-black/50 hover:-translate-y-1 transition-all duration-500 ring-1 ring-white/10`}
        data-testid={`card-credit-${card.id}`}
      >
        {/* Holographic accent ribbon (top-right) */}
        <div className={`absolute -top-20 -right-20 w-64 h-64 rounded-full bg-gradient-to-br ${variant.accent} opacity-30 blur-2xl`} />
        {/* Subtle shimmer band */}
        <div className={`absolute inset-0 bg-gradient-to-tr ${variant.shimmer} opacity-60 pointer-events-none`} />
        {/* Etched diagonal lines */}
        <div
          className="absolute inset-0 opacity-[0.08] pointer-events-none"
          style={{
            backgroundImage:
              "repeating-linear-gradient(115deg, transparent 0, transparent 18px, rgba(255,255,255,0.6) 18px, rgba(255,255,255,0.6) 19px)",
          }}
        />
        {/* Embossed monogram watermark */}
        <div className="absolute -bottom-10 -right-4 text-[180px] font-black opacity-[0.06] leading-none select-none pointer-events-none tracking-tighter">
          T
        </div>

        {/* Top row */}
        <div className="relative z-10 flex justify-between items-start">
          <div>
            <p className="text-[10px] uppercase tracking-[0.25em] opacity-70 font-medium">{t("TunBank")}</p>
            <p className="text-base font-semibold mt-0.5 tracking-wide">{variant.name}</p>
          </div>
          {card.isFrozen ? (
            <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-cyan-400/20 backdrop-blur-sm">
              <Snowflake className="w-3.5 h-3.5 text-cyan-300" />
              <span className="text-[10px] uppercase tracking-wider text-cyan-100 font-semibold">{t("Frozen")}</span>
            </div>
          ) : (
            <Wifi className="w-6 h-6 rotate-90 opacity-80" />
          )}
        </div>

        {/* EMV chip */}
        <div className="relative z-10">
          <div
            className={`w-12 h-9 rounded-md bg-gradient-to-br ${variant.chip} relative overflow-hidden ring-1 ring-black/20 shadow-inner`}
          >
            <div className="absolute inset-0.5 grid grid-cols-3 grid-rows-3 gap-px opacity-40">
              {Array(9)
                .fill(0)
                .map((_, i) => (
                  <div key={i} className="bg-black/30 rounded-[1px]" />
                ))}
            </div>
          </div>
        </div>

        {/* Card number */}
        <div className="relative z-10">
          <p
            className="font-mono text-lg sm:text-xl tracking-[0.18em] font-medium drop-shadow-md tabular-nums"
            data-testid={`text-card-number-${card.id}`}
          >
            {revealed ? formattedNumber : maskedNumber}
          </p>
        </div>

        {/* Bottom row */}
        <div className="relative z-10 flex justify-between items-end">
          <div className="space-y-2">
            <div>
              <p className={`text-[9px] uppercase tracking-widest ${variant.subtext} mb-0.5`}>{t("Card Holder")}</p>
              <p className="text-sm font-semibold tracking-wide uppercase">{card.cardHolderName}</p>
            </div>
            <div className="flex items-center gap-3">
              <div>
                <p className={`text-[9px] uppercase tracking-widest ${variant.subtext} mb-0.5`}>{t("Expires")}</p>
                <p className="text-xs font-mono font-semibold">{card.expiryDate}</p>
              </div>
              <div>
                <p className={`text-[9px] uppercase tracking-widest ${variant.subtext} mb-0.5`}>CVV</p>
                <p className="text-xs font-mono font-semibold">{revealed ? card.cvv : "•••"}</p>
              </div>
            </div>
          </div>
          <SiVisa className="w-12 h-12 opacity-95 drop-shadow" />
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
