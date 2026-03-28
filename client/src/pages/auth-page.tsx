import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useLocation } from "wouter";
import { z } from "zod";
import { api } from "@shared/routes";
import { insertUserSchema } from "@shared/schema";
import { useLogin, useRegister, useUser } from "@/hooks/use-auth";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Loader2, ShieldCheck, Lock, Landmark, User, Mail, Smartphone } from "lucide-react";
import logoImg from "@assets/OIP_1771533296748.jpeg";
import { useTranslation } from "react-i18next";

export default function AuthPage() {
  const [_, setLocation] = useLocation();
  const { t } = useTranslation();
  const { data: user, isLoading: isLoadingUser } = useUser();
  const { mutateAsync: login, isPending: isLoginPending } = useLogin();
  const { mutateAsync: register, isPending: isRegisterPending } = useRegister();
  const [activeTab, setActiveTab] = useState("login");

  if (user) {
    setLocation("/dashboard");
    return null;
  }

  if (isLoadingUser) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-background">
        <Loader2 className="w-8 h-8 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="min-h-screen flex flex-col md:flex-row bg-background font-sans antialiased">
      {/* Left Side - Luxury Banking Hero */}
      <div className="hidden md:flex flex-col justify-between w-7/12 bg-[#0a0a0a] p-16 text-white relative overflow-hidden border-r border-white/5">
        <div className="relative z-10 space-y-12">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl overflow-hidden ring-1 ring-white/20 shadow-2xl">
              <img src={logoImg} alt="TunBank Logo" className="w-full h-full object-cover scale-110" />
            </div>
            <span className="text-2xl font-bold tracking-tighter uppercase font-display">TunBank</span>
          </div>
          
          <div className="space-y-6">
            <h1 className="text-6xl font-extrabold tracking-tight leading-[1.1] max-w-xl">
              Private Banking <br />
              <span className="bg-gradient-to-r from-white via-white to-white/40 bg-clip-text text-transparent">Reimagined for You.</span>
            </h1>
            <p className="text-zinc-400 text-xl max-w-lg font-light leading-relaxed">
              Experience a new standard of financial excellence. Secure, intuitive, and designed for the modern lifestyle.
            </p>
          </div>

          <div className="grid grid-cols-2 gap-8 pt-8">
            <div className="p-6 rounded-2xl bg-white/5 border border-white/10 backdrop-blur-md">
              <ShieldCheck className="w-8 h-8 text-white mb-4" />
              <h3 className="font-bold text-lg mb-1">Military-Grade</h3>
              <p className="text-zinc-500 text-sm">Advanced encryption for absolute peace of mind.</p>
            </div>
            <div className="p-6 rounded-2xl bg-white/5 border border-white/10 backdrop-blur-md">
              <Landmark className="w-8 h-8 text-white mb-4" />
              <h3 className="font-bold text-lg mb-1">Institutional</h3>
              <p className="text-zinc-500 text-sm">Trusted by thousands across the region.</p>
            </div>
          </div>
        </div>
        
        <div className="relative z-10 mt-auto pt-12">
          <div className="flex items-center gap-6 text-sm text-zinc-500 uppercase tracking-widest font-medium">
            <span>ISO 27001 Certified</span>
            <span className="w-1 h-1 bg-zinc-800 rounded-full" />
            <span>Digital Assets Protected</span>
          </div>
        </div>

        <div className="absolute -top-24 -right-24 w-96 h-96 bg-white/5 rounded-full blur-[120px]" />
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-full h-full bg-[radial-gradient(circle_at_center,rgba(255,255,255,0.03)_0%,transparent_70%)]" />
        <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/carbon-fibre.png')] opacity-[0.03] pointer-events-none" />
      </div>

      {/* Right Side */}
      <div className="flex-1 flex items-center justify-center p-8 lg:p-16 bg-background relative">
        <div className="w-full max-w-md space-y-8">
          <div className="text-center md:hidden mb-12">
            <div className="inline-flex items-center gap-2 mb-4">
              <img src={logoImg} alt="Logo" className="w-8 h-8 rounded-lg object-cover" />
              <span className="text-xl font-bold tracking-tight">TunBank</span>
            </div>
          </div>

          <div className="space-y-2 text-center mb-8">
            <h2 className="text-3xl font-bold tracking-tight">{t("Secure Access")}</h2>
            <p className="text-muted-foreground">{t("Welcome to your digital vault")}</p>
          </div>

          <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
            <TabsList className="grid w-full grid-cols-2 h-12 p-1 bg-muted rounded-xl mb-8">
              <TabsTrigger value="login" className="rounded-lg data-[state=active]:bg-background data-[state=active]:shadow-sm">{t("Sign In")}</TabsTrigger>
              <TabsTrigger value="register" className="rounded-lg data-[state=active]:bg-background data-[state=active]:shadow-sm">{t("Register")}</TabsTrigger>
            </TabsList>
            
            <TabsContent value="login" className="mt-0 focus-visible:outline-none">
              <LoginForm 
                onSubmit={async (data) => {
                  await login(data);
                  setLocation("/dashboard");
                }} 
                isLoading={isLoginPending} 
              />
            </TabsContent>
            
            <TabsContent value="register" className="mt-0 focus-visible:outline-none">
              <RegisterForm 
                onSubmit={async (data) => {
                  await register(data);
                  setActiveTab("login");
                }} 
                isLoading={isRegisterPending} 
              />
            </TabsContent>
          </Tabs>

          <p className="text-center text-sm text-muted-foreground pt-8">
            {t("Having trouble logging in?")} <Button variant="link" className="p-0 h-auto font-semibold">{t("Contact Support")}</Button>
          </p>
        </div>
      </div>
    </div>
  );
}

function LoginForm({ onSubmit, isLoading }: { onSubmit: (data: any) => Promise<void>, isLoading: boolean }) {
  const { t } = useTranslation();
  const form = useForm({
    resolver: zodResolver(api.auth.login.input),
    defaultValues: { username: "", password: "" }
  });

  return (
    <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
      <div className="space-y-5">
        <div className="space-y-2">
          <Label htmlFor="username" className="text-xs font-bold uppercase tracking-wider text-muted-foreground ml-1">{t("Email or Username")}</Label>
          <div className="relative">
            <User className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
            <Input 
              id="username" 
              {...form.register("username")} 
              placeholder="name@example.com" 
              className="pl-10 h-12 bg-muted/30 border-muted focus:bg-background transition-all rounded-xl"
            />
          </div>
          {form.formState.errors.username && <p className="text-xs text-destructive mt-1">{form.formState.errors.username.message}</p>}
        </div>
        <div className="space-y-2">
          <div className="flex justify-between items-center ml-1">
            <Label htmlFor="password" className="text-xs font-bold uppercase tracking-wider text-muted-foreground">{t("Password")}</Label>
            <Button variant="link" className="text-xs p-0 h-auto font-medium text-muted-foreground hover:text-primary">{t("Forgot?")}</Button>
          </div>
          <div className="relative">
            <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
            <Input 
              id="password" 
              type="password" 
              {...form.register("password")} 
              placeholder="••••••••" 
              className="pl-10 h-12 bg-muted/30 border-muted focus:bg-background transition-all rounded-xl"
            />
          </div>
          {form.formState.errors.password && <p className="text-xs text-destructive mt-1">{form.formState.errors.password.message}</p>}
        </div>
      </div>
      <Button type="submit" className="w-full h-12 rounded-xl text-base font-bold shadow-lg shadow-primary/10 hover:shadow-primary/20 transition-all" disabled={isLoading}>
        {isLoading ? <Loader2 className="w-5 h-5 animate-spin mr-2" /> : t("Authenticate Securely")}
      </Button>
    </form>
  );
}

function RegisterForm({ onSubmit, isLoading }: { onSubmit: (data: any) => Promise<void>, isLoading: boolean }) {
  const { t } = useTranslation();
  const form = useForm({
    resolver: zodResolver(insertUserSchema),
    defaultValues: { fullName: "", email: "", password: "" }
  });

  return (
    <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
      <div className="space-y-5">
        <div className="space-y-2">
          <Label htmlFor="fullName" className="text-xs font-bold uppercase tracking-wider text-muted-foreground ml-1">{t("Full Name")}</Label>
          <div className="relative">
            <User className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
            <Input 
              id="fullName" 
              {...form.register("fullName")} 
              placeholder="John Doe" 
              className="pl-10 h-12 bg-muted/30 border-muted focus:bg-background transition-all rounded-xl"
            />
          </div>
          {form.formState.errors.fullName && <p className="text-xs text-destructive mt-1">{form.formState.errors.fullName.message}</p>}
        </div>
        <div className="space-y-2">
          <Label htmlFor="email" className="text-xs font-bold uppercase tracking-wider text-muted-foreground ml-1">{t("Email Address")}</Label>
          <div className="relative">
            <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
            <Input 
              id="email" 
              type="email" 
              {...form.register("email")} 
              placeholder="john@doe.com" 
              className="pl-10 h-12 bg-muted/30 border-muted focus:bg-background transition-all rounded-xl"
            />
          </div>
          {form.formState.errors.email && <p className="text-xs text-destructive mt-1">{form.formState.errors.email.message}</p>}
        </div>
        <div className="space-y-2">
          <Label htmlFor="idCard" className="text-xs font-bold uppercase tracking-wider text-muted-foreground ml-1">{t("ID Card Number")}</Label>
          <div className="relative">
            <Smartphone className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
            <Input 
              id="idCard" 
              {...form.register("idCardNumber")} 
              placeholder="12345678" 
              className="pl-10 h-12 bg-muted/30 border-muted focus:bg-background transition-all rounded-xl"
            />
          </div>
          {form.formState.errors.idCardNumber && <p className="text-xs text-destructive mt-1">{form.formState.errors.idCardNumber.message}</p>}
        </div>
        <div className="space-y-2">
          <Label htmlFor="bankCard" className="text-xs font-bold uppercase tracking-wider text-muted-foreground ml-1">{t("Bank Card Number")}</Label>
          <div className="relative">
            <Landmark className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
            <Input 
              id="bankCard" 
              {...form.register("bankCardNumber")} 
              placeholder="4532 **** **** 8899" 
              className="pl-10 h-12 bg-muted/30 border-muted focus:bg-background transition-all rounded-xl"
            />
          </div>
          {form.formState.errors.bankCardNumber && <p className="text-xs text-destructive mt-1">{form.formState.errors.bankCardNumber.message}</p>}
        </div>
        <div className="space-y-2">
          <Label htmlFor="password-reg" className="text-xs font-bold uppercase tracking-wider text-muted-foreground ml-1">{t("Secure Password")}</Label>
          <div className="relative">
            <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
            <Input 
              id="password-reg" 
              type="password" 
              {...form.register("password")} 
              placeholder="••••••••" 
              className="pl-10 h-12 bg-muted/30 border-muted focus:bg-background transition-all rounded-xl"
            />
          </div>
          {form.formState.errors.password && <p className="text-xs text-destructive mt-1">{form.formState.errors.password.message}</p>}
        </div>
      </div>
      <Button type="submit" className="w-full h-12 rounded-xl text-base font-bold shadow-lg shadow-primary/10 hover:shadow-primary/20 transition-all" disabled={isLoading}>
        {isLoading ? <Loader2 className="w-5 h-5 animate-spin mr-2" /> : t("Establish Membership")}
      </Button>
    </form>
  );
}
