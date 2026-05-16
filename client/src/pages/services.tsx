import { LayoutShell } from "@/components/layout-shell";
import { sounds } from "@/lib/sounds";
import { Phone, Receipt, Send, Download, GraduationCap, Landmark, Scale, ShoppingBag, Loader2, CheckCircle2, ChevronRight } from "lucide-react";
import { useTranslation } from "react-i18next";
import { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useQuery, useMutation } from "@tanstack/react-query";
import { Account } from "@shared/schema";
import { api } from "@shared/routes";
import { useToast } from "@/hooks/use-toast";
import { queryClient } from "@/lib/queryClient";
import { formatCurrency } from "@/lib/utils";
import { useLocation } from "wouter";

// ─── Generic service-payment caller ──────────────────────────────────────────
async function servicePayment(payload: {
  accountId: number;
  serviceType: string;
  amount: string;
  provider?: string;
  reference?: string;
  description?: string;
}) {
  const res = await fetch("/api/service-payment", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(payload),
  });
  if (!res.ok) {
    const err = await res.json();
    throw new Error(err.message || "Payment failed");
  }
  return res.json();
}

// ─── Recharge caller ──────────────────────────────────────────────────────────
async function mobileRecharge(payload: {
  accountId: number;
  provider: string;
  phoneNumber: string;
  amount: string;
}) {
  const res = await fetch("/api/recharge", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(payload),
  });
  if (!res.ok) {
    const err = await res.json();
    throw new Error(err.message || "Recharge failed");
  }
  return res.json();
}

// ─── Shared account picker ────────────────────────────────────────────────────
function AccountPicker({ accounts, value, onChange }: { accounts: Account[]; value: number; onChange: (v: number) => void }) {
  const { t } = useTranslation();
  return (
    <Select onValueChange={(v) => onChange(Number(v))} value={value ? value.toString() : ""}>
      <SelectTrigger>
        <SelectValue placeholder={t("Choisir un compte")} />
      </SelectTrigger>
      <SelectContent>
        {accounts.map((acc) => (
          <SelectItem key={acc.id} value={acc.id.toString()}>
            {acc.type.toUpperCase()} •••{acc.accountNumber.slice(-4)} — {formatCurrency(acc.balance, acc.currency)}
          </SelectItem>
        ))}
      </SelectContent>
    </Select>
  );
}

// ─── Invalidate queries helper ────────────────────────────────────────────────
function invalidateFinance() {
  queryClient.invalidateQueries({ queryKey: [api.accounts.list.path] });
  queryClient.invalidateQueries({ queryKey: [api.transactions.list.path] });
}

type ServiceId = "recharge" | "facture" | "emission" | "encaissement" | "inscription" | "microcredit" | "naf9a" | "paiement";

export default function Services() {
  const { t } = useTranslation();
  const { toast } = useToast();
  const [, navigate] = useLocation();
  const [activeService, setActiveService] = useState<ServiceId | null>(null);

  const { data: accounts = [] } = useQuery<Account[]>({ queryKey: [api.accounts.list.path] });

  const services: { id: ServiceId; icon: any; title: string; subtitle: string; gradient: string }[] = [
    { id: "recharge",      icon: Phone,        title: t("Recharge Téléphonique"), subtitle: "Ooredoo · Orange · Telecom",    gradient: "from-blue-500 to-blue-600" },
    { id: "facture",       icon: Receipt,      title: t("Smart Facture"),          subtitle: "STEG · SONEDE · Topnet · CNSS", gradient: "from-indigo-500 to-indigo-600" },
    { id: "emission",      icon: Send,         title: t("Émission Mandat"),        subtitle: t("Envoyer un mandat"),           gradient: "from-cyan-500 to-cyan-600" },
    { id: "encaissement",  icon: Download,     title: t("Encaissement Mandat"),    subtitle: t("Recevoir un mandat"),          gradient: "from-teal-500 to-teal-600" },
    { id: "inscription",   icon: GraduationCap,title: t("Inscription Élève"),      subtitle: t("Frais scolaires"),             gradient: "from-violet-500 to-violet-600" },
    { id: "microcredit",   icon: Landmark,     title: t("Micro Crédit"),           subtitle: t("Jusqu'à 5 000 DT"),            gradient: "from-amber-500 to-amber-600" },
    { id: "naf9a",         icon: Scale,        title: t("Naf9a"),                  subtitle: t("Paiement de pension"),         gradient: "from-rose-500 to-rose-600" },
    { id: "paiement",      icon: ShoppingBag,  title: t("Paiement Commerçant"),    subtitle: t("Payer chez un commerçant"),    gradient: "from-emerald-500 to-emerald-600" },
  ];

  return (
    <LayoutShell>
      <div className="max-w-4xl mx-auto space-y-8">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">{t("Nos Services")}</h1>
          <p className="text-muted-foreground mt-1">{t("Choisir le service à utiliser")}</p>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4">
          {services.map((svc) => {
            const Icon = svc.icon;
            return (
              <button
                key={svc.id}
                onClick={() => {
                  sounds.tick();
                  if (svc.id === "microcredit") { navigate("/loans"); return; }
                  setActiveService(svc.id);
                }}
                className="group bg-card border border-border rounded-2xl p-5 flex flex-col items-center text-center gap-3 hover:border-primary/40 hover:shadow-md transition-all active:scale-95"
                data-testid={`service-${svc.id}`}
              >
                <div className={`w-14 h-14 rounded-2xl bg-gradient-to-br ${svc.gradient} flex items-center justify-center shadow-lg shadow-black/10 group-hover:scale-105 transition-transform`}>
                  <Icon className="w-7 h-7 text-white" />
                </div>
                <div>
                  <p className="font-semibold text-sm leading-tight">{svc.title}</p>
                  <p className="text-[11px] text-muted-foreground mt-0.5 leading-tight">{svc.subtitle}</p>
                </div>
                <ChevronRight className="w-3.5 h-3.5 text-muted-foreground/50 group-hover:text-primary transition-colors" />
              </button>
            );
          })}
        </div>

        {/* Dialogs */}
        <RechargeDialog open={activeService === "recharge"} onClose={() => setActiveService(null)} accounts={accounts} toast={toast} t={t} />
        <FactureDialog  open={activeService === "facture"}  onClose={() => setActiveService(null)} accounts={accounts} toast={toast} t={t} />
        <EmissionDialog open={activeService === "emission"} onClose={() => setActiveService(null)} accounts={accounts} toast={toast} t={t} />
        <EncaissementDialog open={activeService === "encaissement"} onClose={() => setActiveService(null)} accounts={accounts} toast={toast} t={t} />
        <InscriptionDialog open={activeService === "inscription"} onClose={() => setActiveService(null)} accounts={accounts} toast={toast} t={t} />
        <Naf9aDialog open={activeService === "naf9a"} onClose={() => setActiveService(null)} accounts={accounts} toast={toast} t={t} />
        <PaiementDialog open={activeService === "paiement"} onClose={() => setActiveService(null)} accounts={accounts} toast={toast} t={t} />
      </div>
    </LayoutShell>
  );
}

// ─── Shared dialog props ──────────────────────────────────────────────────────
interface DProps {
  open: boolean;
  onClose: () => void;
  accounts: Account[];
  toast: ReturnType<typeof useToast>["toast"];
  t: (k: string) => string;
}

// ─── 1. Mobile Recharge ───────────────────────────────────────────────────────
function RechargeDialog({ open, onClose, accounts, toast, t }: DProps) {
  const [accountId, setAccountId] = useState(0);
  const [provider, setProvider] = useState("");
  const [phone, setPhone] = useState("");
  const [amount, setAmount] = useState("");

  const { mutate, isPending } = useMutation({
    mutationFn: () => mobileRecharge({ accountId, provider, phoneNumber: phone, amount }),
    onSuccess: () => {
      sounds.recharge();
      toast({ title: t("Success"), description: t("Recharge processed successfully") });
      invalidateFinance();
      onClose();
      setAccountId(0); setProvider(""); setPhone(""); setAmount("");
    },
    onError: (e: Error) => toast({ title: t("Error"), description: e.message, variant: "destructive" }),
  });

  const valid = accountId > 0 && provider && phone.length >= 8 && Number(amount) > 0;

  return (
    <Dialog open={open} onOpenChange={(o) => !o && onClose()}>
      <DialogContent>
        <DialogHeader><DialogTitle className="flex items-center gap-2">📱 {t("Recharge Téléphonique")}</DialogTitle></DialogHeader>
        <div className="space-y-4 mt-2">
          <div className="space-y-1.5">
            <Label>{t("Compte à débiter")}</Label>
            <AccountPicker accounts={accounts} value={accountId} onChange={setAccountId} />
          </div>
          <div className="space-y-1.5">
            <Label>{t("Choisir votre opérateur")}</Label>
            <Select onValueChange={setProvider} value={provider}>
              <SelectTrigger><SelectValue placeholder={t("Sélectionner un opérateur")} /></SelectTrigger>
              <SelectContent>
                <SelectItem value="Ooredoo">🟠 Ooredoo</SelectItem>
                <SelectItem value="Orange">🟠 Orange</SelectItem>
                <SelectItem value="Telecom">🔵 Tunisie Telecom</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <div className="space-y-1.5">
            <Label>{t("Numéro de téléphone")}</Label>
            <Input placeholder="Ex: 22 123 456" value={phone} onChange={(e) => setPhone(e.target.value)} maxLength={12} />
          </div>
          <div className="space-y-1.5">
            <Label>{t("Montant de la recharge (DT)")}</Label>
            <div className="relative">
              <Input type="number" step="0.5" min="1" placeholder="5" value={amount} onChange={(e) => setAmount(e.target.value)} className="pr-12" />
              <span className="absolute right-3 top-1/2 -translate-y-1/2 text-xs text-muted-foreground font-bold">DT</span>
            </div>
            <div className="flex gap-2 flex-wrap">
              {["5", "10", "20", "30", "50"].map((v) => (
                <button key={v} onClick={() => setAmount(v)} className={`px-3 py-1 rounded-full text-xs border transition-all ${amount === v ? "bg-primary text-primary-foreground border-primary" : "border-border hover:border-primary"}`}>{v} DT</button>
              ))}
            </div>
          </div>
          <Button className="w-full" disabled={!valid || isPending} onClick={() => mutate()}>
            {isPending ? <Loader2 className="w-4 h-4 animate-spin mr-2" /> : <CheckCircle2 className="w-4 h-4 mr-2" />}
            {t("Confirmer")}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}

// ─── 2. Smart Facture ─────────────────────────────────────────────────────────
const BILL_PROVIDERS = ["STEG", "SONEDE", "Topnet", "CNSS", "ONAS", "TT Fixe", "Ooredoo Fixe"];

function FactureDialog({ open, onClose, accounts, toast, t }: DProps) {
  const [accountId, setAccountId] = useState(0);
  const [provider, setProvider] = useState("");
  const [reference, setReference] = useState("");
  const [amount, setAmount] = useState("");

  const { mutate, isPending } = useMutation({
    mutationFn: () => servicePayment({
      accountId, serviceType: "bill_payment", amount, provider, reference,
      description: `Facture ${provider} — Réf: ${reference}`,
    }),
    onSuccess: () => {
      sounds.bill();
      toast({ title: t("Succès"), description: t("Facture payée avec succès") });
      invalidateFinance();
      onClose();
      setAccountId(0); setProvider(""); setReference(""); setAmount("");
    },
    onError: (e: Error) => toast({ title: t("Erreur"), description: e.message, variant: "destructive" }),
  });

  const valid = accountId > 0 && provider && reference.length >= 3 && Number(amount) > 0;

  return (
    <Dialog open={open} onOpenChange={(o) => !o && onClose()}>
      <DialogContent>
        <DialogHeader><DialogTitle className="flex items-center gap-2">🧾 {t("Smart Facture")}</DialogTitle></DialogHeader>
        <div className="space-y-4 mt-2">
          <div className="space-y-1.5">
            <Label>{t("Compte à débiter")}</Label>
            <AccountPicker accounts={accounts} value={accountId} onChange={setAccountId} />
          </div>
          <div className="space-y-1.5">
            <Label>{t("Organisme")}</Label>
            <Select onValueChange={setProvider} value={provider}>
              <SelectTrigger><SelectValue placeholder={t("Sélectionner un organisme")} /></SelectTrigger>
              <SelectContent>
                {BILL_PROVIDERS.map((p) => <SelectItem key={p} value={p}>{p}</SelectItem>)}
              </SelectContent>
            </Select>
          </div>
          <div className="space-y-1.5">
            <Label>{t("Référence Facture")}</Label>
            <Input placeholder="Ex: 123456789" value={reference} onChange={(e) => setReference(e.target.value)} />
          </div>
          <div className="space-y-1.5">
            <Label>{t("Montant (DT)")}</Label>
            <div className="relative">
              <Input type="number" step="0.1" min="0.1" placeholder="0.00" value={amount} onChange={(e) => setAmount(e.target.value)} className="pr-12" />
              <span className="absolute right-3 top-1/2 -translate-y-1/2 text-xs text-muted-foreground font-bold">DT</span>
            </div>
          </div>
          <Button className="w-full" disabled={!valid || isPending} onClick={() => mutate()}>
            {isPending ? <Loader2 className="w-4 h-4 animate-spin mr-2" /> : <CheckCircle2 className="w-4 h-4 mr-2" />}
            {t("Payer la facture")}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}

// ─── 3. Émission Mandat ───────────────────────────────────────────────────────
function EmissionDialog({ open, onClose, accounts, toast, t }: DProps) {
  const [accountId, setAccountId] = useState(0);
  const [recipient, setRecipient] = useState("");
  const [cin, setCin] = useState("");
  const [amount, setAmount] = useState("");

  const { mutate, isPending } = useMutation({
    mutationFn: () => servicePayment({
      accountId, serviceType: "mandat_emission", amount,
      provider: "La Poste Tunisienne",
      reference: cin,
      description: `Émission Mandat → ${recipient} (CIN: ${cin})`,
    }),
    onSuccess: () => {
      sounds.coin();
      toast({ title: t("Success"), description: t("Mandat émis avec succès") });
      invalidateFinance();
      onClose();
      setAccountId(0); setRecipient(""); setCin(""); setAmount("");
    },
    onError: (e: Error) => toast({ title: t("Error"), description: e.message, variant: "destructive" }),
  });

  const valid = accountId > 0 && recipient.length >= 3 && cin.length >= 8 && Number(amount) > 0;

  return (
    <Dialog open={open} onOpenChange={(o) => !o && onClose()}>
      <DialogContent>
        <DialogHeader><DialogTitle className="flex items-center gap-2">📤 {t("Émission Mandat")}</DialogTitle></DialogHeader>
        <div className="space-y-4 mt-2">
          <div className="space-y-1.5">
            <Label>{t("Compte à débiter")}</Label>
            <AccountPicker accounts={accounts} value={accountId} onChange={setAccountId} />
          </div>
          <div className="space-y-1.5">
            <Label>{t("Nom du bénéficiaire")}</Label>
            <Input placeholder="Ex: Mohamed Ben Ali" value={recipient} onChange={(e) => setRecipient(e.target.value)} />
          </div>
          <div className="space-y-1.5">
            <Label>{t("CIN du bénéficiaire")}</Label>
            <Input placeholder="Ex: 12345678" value={cin} onChange={(e) => setCin(e.target.value)} maxLength={12} />
          </div>
          <div className="space-y-1.5">
            <Label>{t("Montant (DT)")}</Label>
            <div className="relative">
              <Input type="number" step="1" min="1" max="5000" placeholder="0" value={amount} onChange={(e) => setAmount(e.target.value)} className="pr-12" />
              <span className="absolute right-3 top-1/2 -translate-y-1/2 text-xs text-muted-foreground font-bold">DT</span>
            </div>
          </div>
          <Button className="w-full" disabled={!valid || isPending} onClick={() => mutate()}>
            {isPending ? <Loader2 className="w-4 h-4 animate-spin mr-2" /> : <Send className="w-4 h-4 mr-2" />}
            {t("Envoyer le mandat")}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}

// ─── 4. Encaissement Mandat ───────────────────────────────────────────────────
function EncaissementDialog({ open, onClose, accounts, toast, t }: DProps) {
  const [accountId, setAccountId] = useState(0);
  const [reference, setReference] = useState("");
  const [cin, setCin] = useState("");

  const { mutate, isPending } = useMutation({
    mutationFn: async () => {
      // Encaissement = receive money into account (credit)
      const res = await fetch("/api/service-payment", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          accountId, serviceType: "mandat_encaissement",
          amount: "0.001", // nominal for recording; actual credit handled by agent
          provider: "La Poste Tunisienne", reference, description: `Encaissement Mandat — Réf: ${reference} (CIN: ${cin})`,
        }),
      });
      if (!res.ok) throw new Error((await res.json()).message);
      return res.json();
    },
    onSuccess: () => {
      sounds.coin();
      toast({ title: t("Success"), description: t("Mandat enregistré. Votre solde sera crédité sous peu.") });
      invalidateFinance();
      onClose();
      setAccountId(0); setReference(""); setCin("");
    },
    onError: (e: Error) => toast({ title: t("Error"), description: e.message, variant: "destructive" }),
  });

  const valid = accountId > 0 && reference.length >= 5 && cin.length >= 8;

  return (
    <Dialog open={open} onOpenChange={(o) => !o && onClose()}>
      <DialogContent>
        <DialogHeader><DialogTitle className="flex items-center gap-2">📥 {t("Encaissement Mandat")}</DialogTitle></DialogHeader>
        <div className="space-y-4 mt-2">
          <div className="space-y-1.5">
            <Label>{t("Compte à créditer")}</Label>
            <AccountPicker accounts={accounts} value={accountId} onChange={setAccountId} />
          </div>
          <div className="space-y-1.5">
            <Label>{t("Référence du mandat")}</Label>
            <Input placeholder="Ex: MND-2024-XXXXX" value={reference} onChange={(e) => setReference(e.target.value)} />
          </div>
          <div className="space-y-1.5">
            <Label>{t("Votre CIN")}</Label>
            <Input placeholder="Ex: 12345678" value={cin} onChange={(e) => setCin(e.target.value)} maxLength={12} />
          </div>
          <div className="rounded-xl bg-emerald-500/10 border border-emerald-500/20 p-3 text-sm text-emerald-700 dark:text-emerald-300">
            ✅ {t("Le montant sera crédité automatiquement après vérification.")}
          </div>
          <Button className="w-full" disabled={!valid || isPending} onClick={() => mutate()}>
            {isPending ? <Loader2 className="w-4 h-4 animate-spin mr-2" /> : <Download className="w-4 h-4 mr-2" />}
            {t("Encaisser le mandat")}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}

// ─── 5. Inscription Élève ─────────────────────────────────────────────────────
const SCHOOLS = ["Lycée National", "École Primaire", "Université de Tunis", "ISET", "ESPRIT", "ISG", "SUP'COM", "Autre"];

function InscriptionDialog({ open, onClose, accounts, toast, t }: DProps) {
  const [accountId, setAccountId] = useState(0);
  const [school, setSchool] = useState("");
  const [studentName, setStudentName] = useState("");
  const [level, setLevel] = useState("");
  const [amount, setAmount] = useState("");

  const { mutate, isPending } = useMutation({
    mutationFn: () => servicePayment({
      accountId, serviceType: "inscription", amount,
      provider: school,
      reference: studentName,
      description: `Inscription ${school} — ${studentName} (${level})`,
    }),
    onSuccess: () => {
      sounds.bill();
      toast({ title: t("Success"), description: t("Inscription effectuée avec succès") });
      invalidateFinance();
      onClose();
      setAccountId(0); setSchool(""); setStudentName(""); setLevel(""); setAmount("");
    },
    onError: (e: Error) => toast({ title: t("Error"), description: e.message, variant: "destructive" }),
  });

  const valid = accountId > 0 && school && studentName.length >= 3 && level && Number(amount) > 0;

  return (
    <Dialog open={open} onOpenChange={(o) => !o && onClose()}>
      <DialogContent>
        <DialogHeader><DialogTitle className="flex items-center gap-2">🎓 {t("Inscription Élève")}</DialogTitle></DialogHeader>
        <div className="space-y-4 mt-2">
          <div className="space-y-1.5">
            <Label>{t("Compte à débiter")}</Label>
            <AccountPicker accounts={accounts} value={accountId} onChange={setAccountId} />
          </div>
          <div className="space-y-1.5">
            <Label>{t("Établissement")}</Label>
            <Select onValueChange={setSchool} value={school}>
              <SelectTrigger><SelectValue placeholder={t("Choisir un établissement")} /></SelectTrigger>
              <SelectContent>
                {SCHOOLS.map((s) => <SelectItem key={s} value={s}>{s}</SelectItem>)}
              </SelectContent>
            </Select>
          </div>
          <div className="space-y-1.5">
            <Label>{t("Nom de l'élève")}</Label>
            <Input placeholder="Ex: Ahmed Ben Salem" value={studentName} onChange={(e) => setStudentName(e.target.value)} />
          </div>
          <div className="space-y-1.5">
            <Label>{t("Niveau / Classe")}</Label>
            <Input placeholder="Ex: Terminale A, L3 Info..." value={level} onChange={(e) => setLevel(e.target.value)} />
          </div>
          <div className="space-y-1.5">
            <Label>{t("Montant des frais (DT)")}</Label>
            <div className="relative">
              <Input type="number" step="1" min="1" placeholder="0" value={amount} onChange={(e) => setAmount(e.target.value)} className="pr-12" />
              <span className="absolute right-3 top-1/2 -translate-y-1/2 text-xs text-muted-foreground font-bold">DT</span>
            </div>
          </div>
          <Button className="w-full" disabled={!valid || isPending} onClick={() => mutate()}>
            {isPending ? <Loader2 className="w-4 h-4 animate-spin mr-2" /> : <CheckCircle2 className="w-4 h-4 mr-2" />}
            {t("Payer les frais d'inscription")}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}

// ─── 6. Naf9a ─────────────────────────────────────────────────────────────────
function Naf9aDialog({ open, onClose, accounts, toast, t }: DProps) {
  const [accountId, setAccountId] = useState(0);
  const [beneficiary, setBeneficiary] = useState("");
  const [courtRef, setCourtRef] = useState("");
  const [amount, setAmount] = useState("");

  const { mutate, isPending } = useMutation({
    mutationFn: () => servicePayment({
      accountId, serviceType: "naf9a", amount,
      provider: "Tribunal",
      reference: courtRef,
      description: `Naf9a → ${beneficiary} — Réf tribunal: ${courtRef}`,
    }),
    onSuccess: () => {
      sounds.bill();
      toast({ title: t("Success"), description: t("Paiement Naf9a effectué avec succès") });
      invalidateFinance();
      onClose();
      setAccountId(0); setBeneficiary(""); setCourtRef(""); setAmount("");
    },
    onError: (e: Error) => toast({ title: t("Error"), description: e.message, variant: "destructive" }),
  });

  const valid = accountId > 0 && beneficiary.length >= 3 && courtRef.length >= 3 && Number(amount) > 0;

  return (
    <Dialog open={open} onOpenChange={(o) => !o && onClose()}>
      <DialogContent>
        <DialogHeader><DialogTitle className="flex items-center gap-2">⚖️ {t("Naf9a")}</DialogTitle></DialogHeader>
        <div className="space-y-4 mt-2">
          <div className="space-y-1.5">
            <Label>{t("Compte à débiter")}</Label>
            <AccountPicker accounts={accounts} value={accountId} onChange={setAccountId} />
          </div>
          <div className="space-y-1.5">
            <Label>{t("Nom du bénéficiaire")}</Label>
            <Input placeholder="Ex: Fatma Ben Youssef" value={beneficiary} onChange={(e) => setBeneficiary(e.target.value)} />
          </div>
          <div className="space-y-1.5">
            <Label>{t("Référence jugement / tribunal")}</Label>
            <Input placeholder="Ex: JTF-2024-XXXXX" value={courtRef} onChange={(e) => setCourtRef(e.target.value)} />
          </div>
          <div className="space-y-1.5">
            <Label>{t("Montant mensuel (DT)")}</Label>
            <div className="relative">
              <Input type="number" step="1" min="1" placeholder="0" value={amount} onChange={(e) => setAmount(e.target.value)} className="pr-12" />
              <span className="absolute right-3 top-1/2 -translate-y-1/2 text-xs text-muted-foreground font-bold">DT</span>
            </div>
          </div>
          <Button className="w-full" disabled={!valid || isPending} onClick={() => mutate()}>
            {isPending ? <Loader2 className="w-4 h-4 animate-spin mr-2" /> : <CheckCircle2 className="w-4 h-4 mr-2" />}
            {t("Payer la pension")}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}

// ─── 7. Paiement Commerçant ───────────────────────────────────────────────────
function PaiementDialog({ open, onClose, accounts, toast, t }: DProps) {
  const [accountId, setAccountId] = useState(0);
  const [merchantId, setMerchantId] = useState("");
  const [merchantName, setMerchantName] = useState("");
  const [amount, setAmount] = useState("");

  const { mutate, isPending } = useMutation({
    mutationFn: () => servicePayment({
      accountId, serviceType: "merchant_payment", amount,
      provider: merchantName || merchantId,
      reference: merchantId,
      description: `Paiement commerçant — ${merchantName || merchantId}`,
    }),
    onSuccess: () => {
      sounds.coin();
      toast({ title: t("Success"), description: t("Paiement commerçant effectué avec succès") });
      invalidateFinance();
      onClose();
      setAccountId(0); setMerchantId(""); setMerchantName(""); setAmount("");
    },
    onError: (e: Error) => toast({ title: t("Error"), description: e.message, variant: "destructive" }),
  });

  const valid = accountId > 0 && merchantId.length >= 4 && Number(amount) > 0;

  return (
    <Dialog open={open} onOpenChange={(o) => !o && onClose()}>
      <DialogContent>
        <DialogHeader><DialogTitle className="flex items-center gap-2">🛍️ {t("Paiement Commerçant")}</DialogTitle></DialogHeader>
        <div className="space-y-4 mt-2">
          <div className="space-y-1.5">
            <Label>{t("Compte à débiter")}</Label>
            <AccountPicker accounts={accounts} value={accountId} onChange={setAccountId} />
          </div>
          <div className="space-y-1.5">
            <Label>{t("ID Commerçant / Code TPE")}</Label>
            <Input placeholder="Ex: COM-00123456" value={merchantId} onChange={(e) => setMerchantId(e.target.value)} />
          </div>
          <div className="space-y-1.5">
            <Label>{t("Nom du commerçant (optionnel)")}</Label>
            <Input placeholder="Ex: Carrefour Tunis" value={merchantName} onChange={(e) => setMerchantName(e.target.value)} />
          </div>
          <div className="space-y-1.5">
            <Label>{t("Montant (DT)")}</Label>
            <div className="relative">
              <Input type="number" step="0.01" min="0.01" placeholder="0.00" value={amount} onChange={(e) => setAmount(e.target.value)} className="pr-12" />
              <span className="absolute right-3 top-1/2 -translate-y-1/2 text-xs text-muted-foreground font-bold">DT</span>
            </div>
          </div>
          <Button className="w-full" disabled={!valid || isPending} onClick={() => mutate()}>
            {isPending ? <Loader2 className="w-4 h-4 animate-spin mr-2" /> : <CheckCircle2 className="w-4 h-4 mr-2" />}
            {t("Payer")}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
