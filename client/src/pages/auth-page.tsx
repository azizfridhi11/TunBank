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
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Loader2, ShieldCheck } from "lucide-react";

export default function AuthPage() {
  const [_, setLocation] = useLocation();
  const { data: user, isLoading: isLoadingUser } = useUser();
  const { mutateAsync: login, isPending: isLoginPending } = useLogin();
  const { mutateAsync: register, isPending: isRegisterPending } = useRegister();
  const [activeTab, setActiveTab] = useState("login");

  // Redirect if already logged in
  if (user) {
    setLocation("/dashboard");
    return null;
  }

  if (isLoadingUser) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-slate-50">
        <Loader2 className="w-8 h-8 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="min-h-screen flex flex-col md:flex-row bg-slate-50">
      {/* Left Side - Hero */}
      <div className="hidden md:flex flex-col justify-between w-1/2 bg-slate-900 p-12 text-white relative overflow-hidden">
        <div className="relative z-10">
          <div className="flex items-center gap-2 mb-8">
            <div className="w-8 h-8 bg-blue-500 rounded-lg flex items-center justify-center">
              <span className="font-bold text-white">T</span>
            </div>
            <span className="text-xl font-bold tracking-tight">TunBank</span>
          </div>
          <h1 className="text-5xl font-display font-bold mb-6 leading-tight">
            Banking built for <br />
            <span className="text-blue-400">tomorrow's</span> needs.
          </h1>
          <p className="text-slate-400 text-lg max-w-md">
            Experience the future of financial management with seamless transactions, smart insights, and bank-grade security.
          </p>
        </div>
        
        <div className="relative z-10">
          <div className="flex items-center gap-4 text-sm text-slate-400">
            <div className="flex items-center gap-2">
              <ShieldCheck className="w-4 h-4 text-emerald-400" />
              <span>256-bit Encryption</span>
            </div>
            <span>•</span>
            <span>FDIC Insured</span>
          </div>
        </div>

        {/* Abstract shapes */}
        <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-blue-600/20 rounded-full blur-3xl -translate-y-1/2 translate-x-1/2" />
        <div className="absolute bottom-0 left-0 w-[400px] h-[400px] bg-indigo-600/20 rounded-full blur-3xl translate-y-1/3 -translate-x-1/3" />
      </div>

      {/* Right Side - Forms */}
      <div className="flex-1 flex items-center justify-center p-6">
        <div className="w-full max-w-md">
          <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
            <TabsList className="grid w-full grid-cols-2 mb-8">
              <TabsTrigger value="login">Login</TabsTrigger>
              <TabsTrigger value="register">Create Account</TabsTrigger>
            </TabsList>
            
            <TabsContent value="login">
              <LoginForm 
                onSubmit={async (data) => {
                  await login(data);
                  setLocation("/dashboard");
                }} 
                isLoading={isLoginPending} 
              />
            </TabsContent>
            
            <TabsContent value="register">
              <RegisterForm 
                onSubmit={async (data) => {
                  await register(data);
                  setActiveTab("login");
                }} 
                isLoading={isRegisterPending} 
              />
            </TabsContent>
          </Tabs>
        </div>
      </div>
    </div>
  );
}

function LoginForm({ onSubmit, isLoading }: { onSubmit: (data: any) => Promise<void>, isLoading: boolean }) {
  const form = useForm({
    resolver: zodResolver(api.auth.login.input),
  });

  return (
    <Card className="border-0 shadow-xl bg-white/50 backdrop-blur-sm">
      <CardHeader>
        <CardTitle className="text-2xl font-display">Welcome back</CardTitle>
        <CardDescription>Enter your credentials to access your account</CardDescription>
      </CardHeader>
      <form onSubmit={form.handleSubmit(onSubmit)}>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="username">Email or Username</Label>
            <Input id="username" {...form.register("username")} placeholder="john@doe.com" />
            {form.formState.errors.username && <span className="text-xs text-destructive">{form.formState.errors.username.message}</span>}
          </div>
          <div className="space-y-2">
            <Label htmlFor="password">Password</Label>
            <Input id="password" type="password" {...form.register("password")} placeholder="••••••••" />
            {form.formState.errors.password && <span className="text-xs text-destructive">{form.formState.errors.password.message}</span>}
          </div>
        </CardContent>
        <CardFooter>
          <Button type="submit" className="w-full" disabled={isLoading}>
            {isLoading ? <Loader2 className="w-4 h-4 animate-spin mr-2" /> : null}
            Sign In
          </Button>
        </CardFooter>
      </form>
    </Card>
  );
}

function RegisterForm({ onSubmit, isLoading }: { onSubmit: (data: any) => Promise<void>, isLoading: boolean }) {
  const form = useForm({
    resolver: zodResolver(insertUserSchema),
  });

  return (
    <Card className="border-0 shadow-xl bg-white/50 backdrop-blur-sm">
      <CardHeader>
        <CardTitle className="text-2xl font-display">Create an account</CardTitle>
        <CardDescription>Get started with TunBank today</CardDescription>
      </CardHeader>
      <form onSubmit={form.handleSubmit(onSubmit)}>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="fullName">Full Name</Label>
            <Input id="fullName" {...form.register("fullName")} placeholder="John Doe" />
            {form.formState.errors.fullName && <span className="text-xs text-destructive">{form.formState.errors.fullName.message}</span>}
          </div>
          <div className="space-y-2">
            <Label htmlFor="email">Email</Label>
            <Input id="email" type="email" {...form.register("email")} placeholder="john@doe.com" />
            {form.formState.errors.email && <span className="text-xs text-destructive">{form.formState.errors.email.message}</span>}
          </div>
          <div className="space-y-2">
            <Label htmlFor="password">Password</Label>
            <Input id="password" type="password" {...form.register("password")} placeholder="At least 8 characters" />
            {form.formState.errors.password && <span className="text-xs text-destructive">{form.formState.errors.password.message}</span>}
          </div>
        </CardContent>
        <CardFooter>
          <Button type="submit" className="w-full" disabled={isLoading}>
            {isLoading ? <Loader2 className="w-4 h-4 animate-spin mr-2" /> : null}
            Create Account
          </Button>
        </CardFooter>
      </form>
    </Card>
  );
}
