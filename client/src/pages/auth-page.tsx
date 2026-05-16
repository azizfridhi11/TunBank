import { useState, useEffect } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useLocation } from "wouter";
import { api } from "@shared/routes";
import { insertUserSchema } from "@shared/schema";
import { useLogin, useRegister, useUser } from "@/hooks/use-auth";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Loader2, ShieldCheck, Lock, Landmark, User, Mail, Smartphone, Fingerprint } from "lucide-react";
import logoImg from "@assets/OIP_1771533296748.jpeg";
import { useTranslation } from "react-i18next";
import { sounds } from "@/lib/sounds";

export default function AuthPage() {
  const [_, setLocation] = useLocation();
  const { t } = useTranslation();
  const { data: user, isLoading: isLoadingUser } = useUser();
  const { mutateAsync: login, isPending: isLoginPending } = useLogin();
  const { mutateAsync: register, isPending: isRegisterPending } = useRegister();
  const [activeTab, setActiveTab] = useState("login");

  useEffect(() => {
    if (user) setLocation("/dashboard");
  }, [user, setLocation]);

  if (isLoadingUser || user) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-background">
        <Loader2 className="w-8 h-8 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="min-h-screen w-full relative overflow-hidden bg-gradient-to-br from-zinc-50 via-white to-zinc-100 dark:from-black dark:via-zinc-950 dark:to-zinc-900 flex items-center justify-center p-4 sm:p-6">
      {/* Ambient background blobs */}
      <div className="absolute top-0 -left-40 w-[500px] h-[500px] bg-primary/10 dark:bg-primary/5 rounded-full blur-[140px] pointer-events-none" />
      <div className="absolute bottom-0 -right-40 w-[500px] h-[500px] bg-violet-500/10 dark:bg-violet-500/5 rounded-full blur-[140px] pointer-events-none" />
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[800px] bg-[radial-gradient(circle_at_center,rgba(0,0,0,0.02)_0%,transparent_60%)] dark:bg-[radial-gradient(circle_at_center,rgba(255,255,255,0.02)_0%,transparent_60%)] pointer-events-none" />

      {/* Main unified card */}
      <div className="w-full max-w-[440px] relative z-10">
        {/* Logo + brand */}
        <div className="flex flex-col items-center mb-8">
          <div className="w-16 h-16 rounded-2xl overflow-hidden ring-1 ring-black/10 dark:ring-white/10 shadow-2xl mb-4">
            <img src={logoImg} alt="TunBank" className="w-full h-full object-cover scale-110" />
          </div>
          <h1 className="text-2xl font-bold tracking-tight">TunBank</h1>
          <p className="text-sm text-muted-foreground mt-1">{t("Banking, redefined.")}</p>
        </div>

        {/* Single unified card */}
        <div className="bg-card/80 dark:bg-card/60 backdrop-blur-xl border border-border/60 rounded-3xl shadow-2xl shadow-black/5 dark:shadow-black/40 p-6 sm:p-8">
          <div className="text-center mb-6">
            <h2 className="text-xl font-semibold tracking-tight">
              {activeTab === "login" ? t("Welcome back") : t("Create your account")}
            </h2>
            <p className="text-sm text-muted-foreground mt-1">
              {activeTab === "login" ? t("Sign in to continue to your wallet") : t("Join TunBank in seconds")}
            </p>
          </div>

          <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
            <TabsList className="grid w-full grid-cols-2 h-11 p-1 bg-muted/60 rounded-full mb-6">
              <TabsTrigger
                value="login"
                className="rounded-full text-sm font-medium data-[state=active]:bg-background data-[state=active]:shadow-sm"
                data-testid="tab-login"
              >
                {t("Sign In")}
              </TabsTrigger>
              <TabsTrigger
                value="register"
                className="rounded-full text-sm font-medium data-[state=active]:bg-background data-[state=active]:shadow-sm"
                data-testid="tab-register"
              >
                {t("Register")}
              </TabsTrigger>
            </TabsList>

            <TabsContent value="login" className="mt-0 focus-visible:outline-none">
              <LoginForm
                onSubmit={async (data) => {
                  await login(data);
                  sounds.login();
                  setLocation("/dashboard");
                }}
                isLoading={isLoginPending}
              />
            </TabsContent>

            <TabsContent value="register" className="mt-0 focus-visible:outline-none">
              <RegisterForm
                onSubmit={async (data) => {
                  await register(data);
                  sounds.success();
                  setActiveTab("login");
                }}
                isLoading={isRegisterPending}
              />
            </TabsContent>
          </Tabs>
        </div>

        {/* Trust strip below card — unified, not segmented */}
        <div className="mt-6 flex items-center justify-center gap-5 text-xs text-muted-foreground">
          <div className="flex items-center gap-1.5">
            <ShieldCheck className="w-3.5 h-3.5" />
            <span>{t("256-bit encryption")}</span>
          </div>
          <span className="w-1 h-1 bg-muted-foreground/40 rounded-full" />
          <div className="flex items-center gap-1.5">
            <Fingerprint className="w-3.5 h-3.5" />
            <span>{t("Biometric ready")}</span>
          </div>
        </div>

        <p className="text-center text-xs text-muted-foreground mt-6">
          {t("Need help?")}{" "}
          <Button variant="link" className="p-0 h-auto text-xs font-semibold">
            {t("Contact Support")}
          </Button>
        </p>
      </div>
    </div>
  );
}

function LoginForm({ onSubmit, isLoading }: { onSubmit: (data: any) => Promise<void>; isLoading: boolean }) {
  const { t } = useTranslation();
  const form = useForm({
    resolver: zodResolver(api.auth.login.input),
    defaultValues: { email: "", password: "" },
  });

  return (
    <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
      <div className="space-y-1.5">
        <Label htmlFor="email" className="text-xs font-medium text-muted-foreground ml-1">
          {t("Email Address")}
        </Label>
        <div className="relative">
          <Mail className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
          <Input
            id="email"
            type="email"
            {...form.register("email")}
            placeholder="name@example.com"
            className="pl-11 h-12 bg-muted/40 border-transparent focus:bg-background focus:border-border transition-all rounded-2xl"
            data-testid="input-email"
          />
        </div>
        {form.formState.errors.email && (
          <p className="text-xs text-destructive mt-1 ml-1">{form.formState.errors.email.message}</p>
        )}
      </div>

      <div className="space-y-1.5">
        <div className="flex justify-between items-center ml-1">
          <Label htmlFor="password" className="text-xs font-medium text-muted-foreground">
            {t("Password")}
          </Label>
          <Button variant="link" className="text-xs p-0 h-auto font-medium text-muted-foreground hover:text-primary">
            {t("Forgot?")}
          </Button>
        </div>
        <div className="relative">
          <Lock className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
          <Input
            id="password"
            type="password"
            {...form.register("password")}
            placeholder="••••••••"
            className="pl-11 h-12 bg-muted/40 border-transparent focus:bg-background focus:border-border transition-all rounded-2xl"
            data-testid="input-password"
          />
        </div>
        {form.formState.errors.password && (
          <p className="text-xs text-destructive mt-1 ml-1">{form.formState.errors.password.message}</p>
        )}
      </div>

      <Button
        type="submit"
        className="w-full h-12 rounded-2xl text-sm font-semibold shadow-lg shadow-primary/20 hover:shadow-primary/30 transition-all mt-2"
        disabled={isLoading}
        data-testid="button-login"
      >
        {isLoading ? <Loader2 className="w-5 h-5 animate-spin" /> : t("Sign In")}
      </Button>
    </form>
  );
}

function RegisterForm({ onSubmit, isLoading }: { onSubmit: (data: any) => Promise<void>; isLoading: boolean }) {
  const { t } = useTranslation();
  const form = useForm({
    resolver: zodResolver(insertUserSchema),
    defaultValues: { fullName: "", email: "", password: "" },
  });

  const fields: { name: any; label: string; placeholder: string; icon: any; type?: string }[] = [
    { name: "fullName", label: t("Full Name"), placeholder: "John Doe", icon: User },
    { name: "email", label: t("Email Address"), placeholder: "john@doe.com", icon: Mail, type: "email" },
    { name: "idCardNumber", label: t("ID Card Number"), placeholder: "12345678", icon: Smartphone },
    { name: "bankCardNumber", label: t("Bank Card Number"), placeholder: "4532 **** **** 8899", icon: Landmark },
    { name: "password", label: t("Password"), placeholder: "••••••••", icon: Lock, type: "password" },
  ];

  return (
    <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-3.5">
      {fields.map(({ name, label, placeholder, icon: Icon, type }) => (
        <div key={name} className="space-y-1.5">
          <Label htmlFor={name} className="text-xs font-medium text-muted-foreground ml-1">
            {label}
          </Label>
          <div className="relative">
            <Icon className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
            <Input
              id={name}
              type={type}
              {...form.register(name)}
              placeholder={placeholder}
              className="pl-11 h-12 bg-muted/40 border-transparent focus:bg-background focus:border-border transition-all rounded-2xl"
              data-testid={`input-${name}`}
            />
          </div>
          {form.formState.errors[name] && (
            <p className="text-xs text-destructive mt-1 ml-1">{(form.formState.errors as any)[name]?.message}</p>
          )}
        </div>
      ))}

      <Button
        type="submit"
        className="w-full h-12 rounded-2xl text-sm font-semibold shadow-lg shadow-primary/20 hover:shadow-primary/30 transition-all mt-2"
        disabled={isLoading}
        data-testid="button-register"
      >
        {isLoading ? <Loader2 className="w-5 h-5 animate-spin" /> : t("Create Account")}
      </Button>
    </form>
  );
}
