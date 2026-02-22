import { LayoutShell } from "@/components/layout-shell";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Phone, Receipt, Send, Download, GraduationCap, Landmark, Scale, ShoppingBag } from "lucide-react";
import { useTranslation } from "react-i18next";
import { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useQuery, useMutation } from "@tanstack/react-query";
import { Account } from "@shared/schema";
import { api } from "@shared/routes";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { rechargeSchema } from "@shared/schema";
import { useToast } from "@/hooks/use-toast";
import { queryClient } from "@/lib/queryClient";
import { Loader2 } from "lucide-react";

export default function Services() {
  const { t } = useTranslation();
  const [rechargeOpen, setRechargeOpen] = useState(false);
  const [factureOpen, setFactureOpen] = useState(false);
  const { toast } = useToast();

  const services = [
    { id: "recharge", icon: Phone, title: t("Recharge Téléphonique"), color: "text-blue-500", bgColor: "bg-blue-50" },
    { id: "facture", icon: Receipt, title: t("Smart Facture"), color: "text-indigo-500", bgColor: "bg-indigo-50" },
    { id: "emission", icon: Send, title: t("Émission Mandat"), color: "text-cyan-500", bgColor: "bg-cyan-50" },
    { id: "encaissement", icon: Download, title: t("Encaissement Mandat"), color: "text-sky-500", bgColor: "bg-sky-50" },
    { id: "inscription", icon: GraduationCap, title: t("Inscription Élève"), color: "text-blue-600", bgColor: "bg-blue-100" },
    { id: "microcredit", icon: Landmark, title: t("Micro Crédit"), color: "text-slate-700", bgColor: "bg-slate-100" },
    { id: "naf9a", icon: Scale, title: t("Naf9a"), color: "text-blue-400", bgColor: "bg-blue-50" },
    { id: "paiement", icon: ShoppingBag, title: t("Paiement Commerçant"), color: "text-blue-500", bgColor: "bg-blue-50" },
  ];

  const { data: accounts } = useQuery<Account[]>({ 
    queryKey: [api.accounts.list.path] 
  });

  const form = useForm({
    resolver: zodResolver(rechargeSchema),
    defaultValues: {
      accountId: 0,
      provider: "",
      phoneNumber: "",
      amount: "",
    },
  });

  const rechargeMutation = useMutation({
    mutationFn: async (data: any) => {
      const res = await fetch("/api/recharge", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      });
      if (!res.ok) {
        const err = await res.json();
        throw new Error(err.message || "Recharge failed");
      }
      return res.json();
    },
    onSuccess: () => {
      toast({ title: t("Success"), description: t("Recharge processed successfully") });
      queryClient.invalidateQueries({ queryKey: [api.accounts.list.path] });
      queryClient.invalidateQueries({ queryKey: [api.transactions.list.path] });
      setRechargeOpen(false);
      form.reset();
    },
    onError: (error: Error) => {
      toast({ title: t("Error"), description: error.message, variant: "destructive" });
    },
  });

  const factureForm = useForm({
    resolver: zodResolver(z.object({
      accountId: z.coerce.number().min(1, t("Choisir un compte")),
      provider: z.string().min(1, t("Choisir un organisme")),
      reference: z.string().min(1, t("Référence facture requise")),
      amount: z.string().refine(val => !isNaN(Number(val)) && Number(val) > 0, t("Montant invalide")),
    })),
    defaultValues: {
      accountId: 0,
      provider: "",
      reference: "",
      amount: "",
    },
  });

  const factureMutation = useMutation({
    mutationFn: async (data: any) => {
      const res = await fetch("/api/recharge", { // Reusing same logic for demo/MVP
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ...data, phoneNumber: data.reference, type: "facture" }),
      });
      if (!res.ok) {
        const err = await res.json();
        throw new Error(err.message || "Paiement échoué");
      }
      return res.json();
    },
    onSuccess: () => {
      toast({ title: t("Succès"), description: t("Facture payée avec succès") });
      queryClient.invalidateQueries({ queryKey: [api.accounts.list.path] });
      queryClient.invalidateQueries({ queryKey: [api.transactions.list.path] });
      setFactureOpen(false);
      factureForm.reset();
    },
    onError: (error: Error) => {
      toast({ title: t("Erreur"), description: error.message, variant: "destructive" });
    },
  });

  const onFactureSubmit = (data: any) => {
    factureMutation.mutate(data);
  };

  return (
    <LayoutShell>
      <div className="space-y-8">
        <div className="text-center md:text-left">
          <h1 className="text-3xl font-display font-bold text-foreground">{t("Nos Services")}</h1>
          <p className="text-muted-foreground">{t("Choisir le service à utiliser")}</p>
        </div>

        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 md:gap-6">
          {services.map((service) => (
            <Dialog 
              key={service.id} 
              open={service.id === "recharge" ? rechargeOpen : service.id === "facture" ? factureOpen : false} 
              onOpenChange={(open) => {
                if (service.id === "recharge") setRechargeOpen(open);
                if (service.id === "facture") setFactureOpen(open);
              }}
            >
              <DialogTrigger asChild>
                <Card 
                  className="cursor-pointer hover:shadow-md transition-shadow border-none bg-slate-50/50 dark:bg-slate-900/50"
                  onClick={() => {
                    if (service.id === "recharge") setRechargeOpen(true);
                    if (service.id === "facture") setFactureOpen(true);
                  }}
                >
                  <CardContent className="p-6 flex flex-col items-center text-center space-y-4">
                    <div className={`w-12 h-12 rounded-2xl ${service.bgColor} flex items-center justify-center`}>
                      <service.icon className={`w-6 h-6 ${service.color}`} />
                    </div>
                    <h3 className="font-semibold text-sm md:text-base text-slate-800 dark:text-slate-200">
                      {service.title}
                    </h3>
                  </CardContent>
                </Card>
              </DialogTrigger>
              {service.id === "recharge" && (
                <DialogContent>
                  <DialogHeader>
                    <DialogTitle>{t("Recharge Téléphonique")}</DialogTitle>
                  </DialogHeader>
                  <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
                    <div className="space-y-2">
                      <Label>{t("Compte à débiter")}</Label>
                      <Select onValueChange={(val) => form.setValue("accountId", Number(val))}>
                        <SelectTrigger>
                          <SelectValue placeholder={t("Choisir un compte")} />
                        </SelectTrigger>
                        <SelectContent>
                          {accounts?.map(acc => (
                            <SelectItem key={acc.id} value={acc.id.toString()}>
                              {acc.accountNumber} ({acc.balance} {acc.currency})
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                    <div className="space-y-2">
                      <Label>{t("Choisir votre opérateur")}</Label>
                      <Select onValueChange={(val) => form.setValue("provider", val)}>
                        <SelectTrigger>
                          <SelectValue placeholder={t("Sélectionner un opérateur")} />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="Ooredoo">Ooredoo</SelectItem>
                          <SelectItem value="Orange">Orange</SelectItem>
                          <SelectItem value="Telecom">Tunisie Telecom</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    <div className="space-y-2">
                      <Label>{t("Numéro de téléphone")}</Label>
                      <Input placeholder="Ex: 22 123 456" {...form.register("phoneNumber")} />
                    </div>
                    <div className="space-y-2">
                      <Label>{t("Montant de la recharge (DT)")}</Label>
                      <Input type="number" step="0.1" placeholder="Ex: 5.0" {...form.register("amount")} />
                    </div>
                    <Button type="submit" className="w-full" disabled={rechargeMutation.isPending}>
                      {rechargeMutation.isPending && <Loader2 className="w-4 h-4 animate-spin mr-2" />}
                      {t("Confirmer")}
                    </Button>
                  </form>
                </DialogContent>
              )}
              {service.id === "facture" && (
                <DialogContent>
                  <DialogHeader>
                    <DialogTitle>{t("Smart Facture")}</DialogTitle>
                  </DialogHeader>
                  <form onSubmit={factureForm.handleSubmit(onFactureSubmit)} className="space-y-4">
                    <div className="space-y-2">
                      <Label>{t("Compte à débiter")}</Label>
                      <Select onValueChange={(val) => factureForm.setValue("accountId", Number(val))}>
                        <SelectTrigger>
                          <SelectValue placeholder={t("Choisir un compte")} />
                        </SelectTrigger>
                        <SelectContent>
                          {accounts?.map(acc => (
                            <SelectItem key={acc.id} value={acc.id.toString()}>
                              {acc.accountNumber} ({acc.balance} {acc.currency})
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                    <div className="space-y-2">
                      <Label>{t("Organisme")}</Label>
                      <Select onValueChange={(val) => factureForm.setValue("provider", val)}>
                        <SelectTrigger>
                          <SelectValue placeholder={t("Sélectionner un organisme")} />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="Topnet">Topnet</SelectItem>
                          <SelectItem value="STEG">STEG</SelectItem>
                          <SelectItem value="SONEDE">SONEDE</SelectItem>
                          <SelectItem value="CNSS">CNSS</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    <div className="space-y-2">
                      <Label>{t("Référence Facture")}</Label>
                      <Input placeholder="Ex: 123456789" {...factureForm.register("reference")} />
                    </div>
                    <div className="space-y-2">
                      <Label>{t("Montant (DT)")}</Label>
                      <Input type="number" step="0.1" placeholder="Ex: 50.0" {...factureForm.register("amount")} />
                    </div>
                    <Button type="submit" className="w-full" disabled={factureMutation.isPending}>
                      {factureMutation.isPending && <Loader2 className="w-4 h-4 animate-spin mr-2" />}
                      {t("Payer la facture")}
                    </Button>
                  </form>
                </DialogContent>
              )}
            </Dialog>
          ))}
        </div>
      </div>
    </LayoutShell>
  );
}
