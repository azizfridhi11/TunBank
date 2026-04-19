import { Link, useLocation } from "wouter";
import { 
  LayoutDashboard, CreditCard, ArrowRightLeft, Settings, 
  LogOut, Wallet, Moon, Sun, Languages, MessageSquare, Palette,
  PieChart, Gift, Target, ShoppingBag
} from "lucide-react";
import { useUser, useLogout } from "@/hooks/use-auth";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { useTranslation } from "react-i18next";
import { useEffect, useState } from "react";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import logoImg from "@assets/OIP_1771533296748.jpeg";
import { sounds } from "@/lib/sounds";

// ─── Accent Color System ───────────────────────────────────────────────────────
const THEME_COLORS = [
  { name: "Default",  hex: "#111111", h: 0,   s: 0,   l: 9,  fgLight: "0 0% 98%", fgDark: "0 0% 9%"  },
  { name: "Red",      hex: "#ef4444", h: 0,   s: 84,  l: 60, fgLight: "0 0% 98%", fgDark: "0 0% 98%" },
  { name: "Orange",   hex: "#f97316", h: 24,  s: 95,  l: 53, fgLight: "0 0% 98%", fgDark: "0 0% 98%" },
  { name: "Amber",    hex: "#f59e0b", h: 38,  s: 92,  l: 50, fgLight: "0 0% 9%",  fgDark: "0 0% 9%"  },
  { name: "Yellow",   hex: "#eab308", h: 45,  s: 93,  l: 47, fgLight: "0 0% 9%",  fgDark: "0 0% 9%"  },
  { name: "Lime",     hex: "#84cc16", h: 83,  s: 81,  l: 44, fgLight: "0 0% 9%",  fgDark: "0 0% 9%"  },
  { name: "Green",    hex: "#22c55e", h: 142, s: 71,  l: 45, fgLight: "0 0% 98%", fgDark: "0 0% 98%" },
  { name: "Teal",     hex: "#14b8a6", h: 174, s: 72,  l: 40, fgLight: "0 0% 98%", fgDark: "0 0% 98%" },
  { name: "Cyan",     hex: "#06b6d4", h: 189, s: 94,  l: 43, fgLight: "0 0% 98%", fgDark: "0 0% 98%" },
  { name: "Blue",     hex: "#3b82f6", h: 217, s: 91,  l: 60, fgLight: "0 0% 98%", fgDark: "0 0% 98%" },
  { name: "Indigo",   hex: "#6366f1", h: 239, s: 84,  l: 67, fgLight: "0 0% 98%", fgDark: "0 0% 98%" },
  { name: "Violet",   hex: "#8b5cf6", h: 263, s: 90,  l: 64, fgLight: "0 0% 98%", fgDark: "0 0% 98%" },
  { name: "Purple",   hex: "#a855f7", h: 270, s: 91,  l: 65, fgLight: "0 0% 98%", fgDark: "0 0% 98%" },
  { name: "Fuchsia",  hex: "#d946ef", h: 292, s: 84,  l: 60, fgLight: "0 0% 98%", fgDark: "0 0% 98%" },
  { name: "Pink",     hex: "#ec4899", h: 330, s: 81,  l: 60, fgLight: "0 0% 98%", fgDark: "0 0% 98%" },
  { name: "Rose",     hex: "#f43f5e", h: 352, s: 95,  l: 61, fgLight: "0 0% 98%", fgDark: "0 0% 98%" },
];

function applyAccentColor(color: typeof THEME_COLORS[0]) {
  const r = document.documentElement;
  const isDark = r.classList.contains("dark");
  const { h, s, l } = color;

  const primary      = `${h} ${s}% ${l}%`;
  const fg           = isDark ? color.fgDark : color.fgLight;

  // Very subtle tinted backgrounds (almost white / almost black)
  const accentLight  = `${h} ${Math.round(s * 0.22)}% 94%`;
  const accentDark   = `${h} ${Math.round(s * 0.18)}% 16%`;
  const accent       = isDark ? accentDark : accentLight;

  // Slightly stronger tint for accent foreground (readable colored text)
  const accentFgL    = `${h} ${Math.round(s * 0.75)}% ${Math.max(l - 32, 18)}%`;
  const accentFgD    = `${h} ${Math.round(s * 0.6)}%  ${Math.min(l + 22, 93)}%`;
  const accentFg     = isDark ? accentFgD : accentFgL;

  // Sidebar background — gentle wash of the accent color
  const sidebarBgL   = `${h} ${Math.round(s * 0.12)}% 97%`;
  const sidebarBgD   = `${h} ${Math.round(s * 0.12)}% 7%`;
  const sidebarBg    = isDark ? sidebarBgD : sidebarBgL;

  // Tinted borders
  const borderL      = `${h} ${Math.round(s * 0.18)}% 87%`;
  const borderD      = `${h} ${Math.round(s * 0.14)}% 19%`;
  const border       = isDark ? borderD : borderL;

  // Tinted card background (very subtle)
  const cardL        = `${h} ${Math.round(s * 0.06)}% 100%`;
  const cardD        = `${h} ${Math.round(s * 0.06)}% 5%`;
  const card         = isDark ? cardD : cardL;

  // Chart colors — the chosen hue with harmonic shifts
  const c1 = `${h} ${s}% ${l}%`;
  const c2 = `${(h + 25) % 360} ${Math.round(s * 0.85)}% ${Math.min(l + 10, 80)}%`;
  const c3 = `${(h + 55) % 360} ${Math.round(s * 0.70)}% ${Math.max(l - 8, 30)}%`;
  const c4 = `${(h + 130) % 360} ${Math.round(s * 0.65)}% ${Math.min(l + 5, 75)}%`;
  const c5 = `${(h + 190) % 360} ${Math.round(s * 0.55)}% ${Math.max(l - 5, 35)}%`;

  // ── Apply all variables ────────────────────────────────────────────
  // Primary action color
  r.style.setProperty("--primary",                  primary);
  r.style.setProperty("--primary-foreground",       fg);
  r.style.setProperty("--ring",                     primary);

  // Accent (hover / selected tint)
  r.style.setProperty("--accent",                   accent);
  r.style.setProperty("--accent-foreground",        accentFg);

  // Card & popover wash
  r.style.setProperty("--card",                     card);
  r.style.setProperty("--card-foreground",          isDark ? "0 0% 98%" : "0 0% 4%");
  r.style.setProperty("--popover",                  card);
  r.style.setProperty("--popover-foreground",       isDark ? "0 0% 98%" : "0 0% 4%");

  // Border & input
  r.style.setProperty("--border",                   border);
  r.style.setProperty("--input",                    border);

  // Sidebar — tinted background + primary brand color
  r.style.setProperty("--sidebar",                  sidebarBg);
  r.style.setProperty("--sidebar-foreground",       isDark ? "0 0% 92%" : "0 0% 20%");
  r.style.setProperty("--sidebar-primary",          primary);
  r.style.setProperty("--sidebar-primary-foreground", fg);
  r.style.setProperty("--sidebar-accent",           accent);
  r.style.setProperty("--sidebar-accent-foreground", accentFg);
  r.style.setProperty("--sidebar-border",           border);
  r.style.setProperty("--sidebar-ring",             primary);

  // Chart colors — full palette derived from the chosen hue
  r.style.setProperty("--chart-1", c1);
  r.style.setProperty("--chart-2", c2);
  r.style.setProperty("--chart-3", c3);
  r.style.setProperty("--chart-4", c4);
  r.style.setProperty("--chart-5", c5);

  localStorage.setItem("tunbank_accent", color.name);
}

export function LayoutShell({ children }: { children: React.ReactNode }) {
  const [location] = useLocation();
  const { data: user } = useUser();
  const { mutate: logout } = useLogout();
  const { t, i18n } = useTranslation();
  const [theme, setTheme] = useState<"light" | "dark">("light");
  const [accentName, setAccentName] = useState("Default");

  useEffect(() => {
    const isDark = document.documentElement.classList.contains("dark");
    setTheme(isDark ? "dark" : "light");
  }, []);

  useEffect(() => {
    document.documentElement.lang = i18n.language;
  }, [i18n.language]);

  // Restore saved accent on mount
  useEffect(() => {
    const saved = localStorage.getItem("tunbank_accent");
    if (saved) {
      const color = THEME_COLORS.find(c => c.name === saved);
      if (color) { applyAccentColor(color); setAccentName(color.name); }
    }
  }, []);

  const toggleTheme = () => {
    sounds.toggle();
    const newTheme = theme === "light" ? "dark" : "light";
    setTheme(newTheme);
    if (newTheme === "dark") {
      document.documentElement.classList.add("dark");
    } else {
      document.documentElement.classList.remove("dark");
    }
    // Re-apply accent after theme change
    const color = THEME_COLORS.find(c => c.name === accentName) || THEME_COLORS[0];
    setTimeout(() => applyAccentColor(color), 10);
  };

  const handleAccent = (color: typeof THEME_COLORS[0]) => {
    sounds.tick();
    applyAccentColor(color);
    setAccentName(color.name);
  };

  const navItems = [
    { href: "/dashboard",  labelKey: "Dashboard",  icon: LayoutDashboard },
    { href: "/accounts",   labelKey: "Accounts",   icon: Wallet },
    { href: "/transfers",  labelKey: "Transfers",  icon: ArrowRightLeft },
    { href: "/services",   labelKey: "Services",   icon: Settings },
    { href: "/cards",      labelKey: "Cards",      icon: CreditCard },
    { href: "/loans",      labelKey: "Loans",      icon: Wallet },
    { href: "/analytics",  labelKey: "Analytics",  icon: PieChart },
    { href: "/rewards",    labelKey: "Rewards",    icon: Gift },
    { href: "/savings",    labelKey: "Savings Goals", icon: Target },
    { href: "/shop",       labelKey: "Shop",          icon: ShoppingBag },
    { href: "/assistant",  labelKey: "Assistant",  icon: MessageSquare },
  ];

  if (!user) return null;

  const currentColor = THEME_COLORS.find(c => c.name === accentName) || THEME_COLORS[0];

  return (
    <div className="min-h-screen bg-background flex">
      {/* Sidebar */}
      <aside className="w-64 bg-sidebar border-r border-border hidden md:flex flex-col fixed h-full z-10">
        <div className="p-6 border-b border-border">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg overflow-hidden flex items-center justify-center">
              <img src={logoImg} alt="TunBank Logo" className="w-full h-full object-cover" />
            </div>
            <span className="font-display font-bold text-xl text-foreground">TunBank</span>
          </div>
        </div>

        <nav className="flex-1 p-4 space-y-1 overflow-y-auto">
          {navItems.map((item) => {
            const isActive = location === item.href;
            const Icon = item.icon;
            return (
              <Link key={item.href} href={item.href}>
                <div
                  onClick={() => { if (!isActive) sounds.tick(); }}
                  className={`
                  flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-all duration-200 cursor-pointer
                  ${isActive 
                    ? "bg-sidebar-accent text-sidebar-accent-foreground" 
                    : "text-muted-foreground hover:bg-sidebar-accent/50 hover:text-foreground"
                  }
                `}>
                  <Icon className={`w-5 h-5 ${isActive ? "text-primary" : "text-muted-foreground"}`} />
                  {t(item.labelKey)}
                </div>
              </Link>
            );
          })}
        </nav>

        <div className="p-4 border-t border-border bg-sidebar-accent/10 space-y-4">
          {/* Controls row */}
          <div className="flex items-center justify-between px-2">
            {/* Theme toggle */}
            <Button variant="ghost" size="icon" onClick={toggleTheme} title={t("Theme")}>
              {theme === "light" ? <Moon className="h-5 w-5" /> : <Sun className="h-5 w-5" />}
            </Button>

            {/* Accent Color Picker */}
            <Popover>
              <PopoverTrigger asChild>
                <Button variant="ghost" size="icon" title="Accent Color" className="relative">
                  <Palette className="h-5 w-5" />
                  {/* Current color dot */}
                  <span
                    className="absolute bottom-1 right-1 w-2 h-2 rounded-full ring-1 ring-white"
                    style={{ backgroundColor: currentColor.hex }}
                  />
                </Button>
              </PopoverTrigger>
              <PopoverContent side="top" align="center" className="w-64 p-3">
                <p className="text-xs font-semibold text-muted-foreground mb-2 uppercase tracking-wider">Accent Color</p>
                <div className="grid grid-cols-8 gap-1.5">
                  {THEME_COLORS.map((color) => (
                    <button
                      key={color.name}
                      onClick={() => handleAccent(color)}
                      title={color.name}
                      className={`
                        w-6 h-6 rounded-full transition-all duration-200 hover:scale-125 focus:outline-none
                        ${accentName === color.name ? "ring-2 ring-offset-2 ring-foreground scale-110" : ""}
                      `}
                      style={{ backgroundColor: color.hex }}
                    />
                  ))}
                </div>
                <p className="text-xs text-center text-muted-foreground mt-2">{currentColor.name}</p>
              </PopoverContent>
            </Popover>

            {/* Language switcher */}
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" size="icon" title={t("Language")}>
                  <Languages className="h-5 w-5" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                <DropdownMenuItem onClick={() => { sounds.tick(); i18n.changeLanguage('en'); }}>English</DropdownMenuItem>
                <DropdownMenuItem onClick={() => { sounds.tick(); i18n.changeLanguage('fr'); }}>Français</DropdownMenuItem>
                <DropdownMenuItem onClick={() => { sounds.tick(); i18n.changeLanguage('ar'); }}>العربية</DropdownMenuItem>
                <DropdownMenuItem onClick={() => { sounds.tick(); i18n.changeLanguage('tn'); }}>🇹🇳 دارجة</DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>

          {/* User info */}
          <div className="flex items-center gap-3 px-2">
            <Avatar className="h-9 w-9 border border-border">
              <AvatarImage src={`https://api.dicebear.com/7.x/initials/svg?seed=${user.fullName}`} />
              <AvatarFallback>{user.fullName.substring(0, 2).toUpperCase()}</AvatarFallback>
            </Avatar>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-semibold truncate text-foreground">{user.fullName}</p>
              <p className="text-xs text-muted-foreground truncate">{user.email}</p>
            </div>
          </div>

          <Button 
            variant="outline" 
            className="w-full justify-start gap-2 text-muted-foreground hover:text-destructive hover:bg-destructive/5 hover:border-destructive/20"
            onClick={() => { sounds.click(); logout(); }}
          >
            <LogOut className="w-4 h-4" />
            {t("Sign Out")}
          </Button>
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 md:ml-64 min-h-screen bg-background">
        <div className="max-w-7xl mx-auto p-4 md:p-8">
          {children}
        </div>
      </main>
    </div>
  );
}
