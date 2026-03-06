import { useAuth } from "@/_core/hooks/useAuth";
import { cn } from "@/lib/utils";
import { useLanguage } from "@/contexts/LanguageContext";
import type { Language } from "@/i18n/index";
import { getAdminLayoutCopy, resolveAdminLegend } from "@/lib/dashboardLocale";
import {
  LayoutDashboard,
  Users,
  CreditCard,
  Activity,
  AlertTriangle,
  Flag,
  Search,
  Bell,
  LogOut,
  ChevronDown,
  Menu,
  X,
  Moon,
  Sun,
  Server,
  Settings,
  Wifi,
} from "lucide-react";
import { Link, useLocation } from "wouter";
import { Button } from "./ui/button";
import { Input } from "./ui/input";
import { AnimatePresence, m } from "framer-motion";
import { useMotionCapabilities } from "@/animation/hooks/useMotionCapabilities";
import { hoverLift, tapPress } from "@/animation/config/motionPresets";
import { shouldEnableHoverMotion } from "@/animation/utils/perfGuards";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "./ui/dropdown-menu";
import { useState, createContext, useContext } from "react";

interface ThemeContextType {
  theme: "light" | "dark";
  toggleTheme: () => void;
}

const ThemeContext = createContext<ThemeContextType>({
  theme: "dark",
  toggleTheme: () => { },
});

export const useAdminTheme = () => useContext(ThemeContext);

interface AdminLayoutProps {
  children: React.ReactNode;
}

type NavKey = "dashboard" | "finance" | "users" | "system" | "kommo" | "asaas" | "errors" | "flags" | "settings";

const NAV_ITEMS: Array<{ key: NavKey; href: string; icon: React.ComponentType<{ className?: string }> }> = [
  { key: "dashboard", href: "/admin", icon: LayoutDashboard },
  { key: "finance", href: "/admin/financeiro", icon: CreditCard },
  { key: "users", href: "/admin/usuarios", icon: Users },
  { key: "system", href: "/admin/sistema", icon: Server },
  { key: "kommo", href: "/admin/kommo", icon: Wifi },
  { key: "asaas", href: "/admin/asaas", icon: CreditCard },
  { key: "errors", href: "/admin/erros", icon: AlertTriangle },
  { key: "flags", href: "/admin/flags", icon: Flag },
  { key: "settings", href: "/admin/configuracoes", icon: Settings },
];

const LANGUAGE_OPTIONS: Array<{ code: Language; label: string }> = [
  { code: "pt", label: "PT" },
  { code: "en", label: "EN" },
  { code: "es", label: "ES" },
];

export default function AdminLayout({ children }: AdminLayoutProps) {
  const { user, logout } = useAuth();
  const [location] = useLocation();
  const { language, setLanguage } = useLanguage();
  const copy = getAdminLayoutCopy(language);
  const legend = resolveAdminLegend(language, location);
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [environment, setEnvironment] = useState<"production" | "staging">("production");
  const [theme, setTheme] = useState<"light" | "dark">("dark");
  const motionCaps = useMotionCapabilities();
  const hoverEnabled = shouldEnableHoverMotion(motionCaps);
  const sharedHover = hoverEnabled ? hoverLift(motionCaps.motionLevel) : undefined;
  const sharedTap = tapPress(motionCaps.motionLevel);

  const notifications = [
    { id: 1, type: "warning", time: "2min", title: language === "en" ? "Churn above 5%" : language === "es" ? "Churn arriba de 5%" : "Churn acima de 5%" },
    { id: 2, type: "info", time: "15min", title: language === "en" ? "New user created" : language === "es" ? "Nuevo usuario creado" : "Novo usuario cadastrado" },
    { id: 3, type: "error", time: "1h", title: language === "en" ? "HTTP 500 spikes detected" : language === "es" ? "Picos de error 500 detectados" : "Picos de erro 500 detectados" },
  ];

  const toggleTheme = () => {
    setTheme((prev) => (prev === "dark" ? "light" : "dark"));
  };

  const handleLogout = async () => {
    await logout({ redirectTo: "/" });
  };

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      window.location.href = `/admin/usuarios?search=${encodeURIComponent(searchQuery)}`;
    }
  };

  const sidebarBg = "bg-[#1a1410]";
  const sidebarText = "text-gray-300";
  const sidebarHover = "hover:bg-white/5";
  const accentColor = "bg-[#e67e22]";

  const contentBg = theme === "dark" ? "bg-[#0f0d0a]" : "bg-[#f8f6f3]";
  const contentText = theme === "dark" ? "text-white" : "text-gray-900";
  const contentTextSecondary = theme === "dark" ? "text-gray-400" : "text-gray-600";
  const headerBg = theme === "dark" ? "bg-[#1a1410]/95" : "bg-white/95";
  const borderColor = theme === "dark" ? "border-white/10" : "border-gray-200";
  const inputBg = theme === "dark" ? "bg-white/5" : "bg-gray-100";

  return (
    <ThemeContext.Provider value={{ theme, toggleTheme }}>
      <div className={cn("min-h-screen", contentBg, contentText)}>
        <AnimatePresence>
          {sidebarOpen ? (
            <m.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.2 }}
              className="fixed inset-0 bg-black/50 z-40 lg:hidden"
              onClick={() => setSidebarOpen(false)}
            />
          ) : null}
        </AnimatePresence>

        <m.aside
          layout
          className={cn(
            "fixed top-0 left-0 z-50 h-full w-64 transform transition-transform duration-200 ease-in-out lg:translate-x-0",
            sidebarBg,
            "border-r border-white/5",
            sidebarOpen ? "translate-x-0" : "-translate-x-full",
          )}
        >
          <div className="flex flex-col h-full">
            <div className="flex items-center justify-between h-16 px-4 border-b border-white/5">
              <Link href="/admin" className="flex items-center gap-3">
                <div className="h-9 w-9 rounded-lg bg-[#e67e22] flex items-center justify-center">
                  <span className="text-white font-bold text-sm">GLX</span>
                </div>
                <div className="flex flex-col">
                  <span className="font-semibold text-white text-sm">PERFORMANCE</span>
                  <span className="text-[10px] text-gray-500 uppercase tracking-wider">{copy.panelSubtitle}</span>
                </div>
              </Link>
              <button onClick={() => setSidebarOpen(false)} className={cn("lg:hidden p-1 rounded", sidebarHover, sidebarText)}>
                <X className="h-5 w-5" />
              </button>
            </div>

            <nav className="flex-1 overflow-y-auto py-4 px-3">
              <ul className="space-y-1">
                {NAV_ITEMS.map((item) => {
                  const isActive = location === item.href || (item.href !== "/admin" && location.startsWith(item.href));
                  return (
                    <li key={item.key}>
                      <Link href={item.href}>
                        <m.div
                          layout
                          whileHover={sharedHover}
                          whileTap={sharedTap}
                          className={cn(
                            "flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-all cursor-pointer",
                            isActive
                              ? cn(accentColor, "text-white shadow-lg shadow-orange-500/20")
                              : cn(sidebarText, sidebarHover, "hover:text-white"),
                          )}
                        >
                          <item.icon className="h-5 w-5 flex-shrink-0" />
                          {copy.navigation[item.key]}
                        </m.div>
                      </Link>
                    </li>
                  );
                })}
              </ul>
            </nav>

            <div className="p-4 border-t border-white/5">
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="outline" className="w-full justify-between bg-white/5 border-white/10 text-gray-300 hover:bg-white/10 hover:text-white">
                    <span className="flex items-center gap-2">
                      <span className={cn("h-2 w-2 rounded-full", environment === "production" ? "bg-green-500" : "bg-yellow-500")} />
                      {environment === "production" ? copy.environment.production : copy.environment.staging}
                    </span>
                    <ChevronDown className="h-4 w-4" />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="start" className="w-56">
                  <DropdownMenuItem onClick={() => setEnvironment("production")}>
                    <span className="h-2 w-2 rounded-full bg-green-500 mr-2" />
                    {copy.environment.production}
                  </DropdownMenuItem>
                  <DropdownMenuItem onClick={() => setEnvironment("staging")}>
                    <span className="h-2 w-2 rounded-full bg-yellow-500 mr-2" />
                    {copy.environment.staging}
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </div>

            <div className="p-4 border-t border-white/5 space-y-1">
              <Link href="/">
                <Button variant="ghost" className={cn("w-full justify-start gap-2", sidebarText, sidebarHover, "hover:text-white")}>
                  <LayoutDashboard className="h-4 w-4" />
                  {copy.backToSite}
                </Button>
              </Link>
            </div>

            <div className="p-4 border-t border-white/5">
              <div className="flex items-center gap-3">
                <div className="h-10 w-10 rounded-full bg-[#e67e22]/20 flex items-center justify-center ring-2 ring-[#e67e22]/30">
                  <span className="text-sm font-bold text-[#e67e22]">{user?.name?.charAt(0) || "A"}</span>
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-white truncate">{user?.name || copy.userFallback}</p>
                  <p className="text-xs text-gray-500 truncate">{user?.email || "admin@glx.com"}</p>
                </div>
              </div>
            </div>
          </div>
        </m.aside>

        <div className="lg:pl-64">
          <header className={cn("sticky top-0 z-30 h-16 backdrop-blur-md border-b", headerBg, borderColor)}>
            <div className="flex items-center justify-between h-full px-4 lg:px-6">
              <button onClick={() => setSidebarOpen(true)} className={cn("lg:hidden p-2 rounded-lg", theme === "dark" ? "hover:bg-white/5" : "hover:bg-gray-100")}>
                <Menu className="h-5 w-5" />
              </button>

              <form onSubmit={handleSearch} className="flex-1 max-w-xl mx-4">
                <div className="relative">
                  <Search className={cn("absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4", contentTextSecondary)} />
                  <Input
                    type="search"
                    placeholder={copy.searchPlaceholder}
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className={cn("pl-10 border-0", inputBg, "focus:ring-2 focus:ring-[#e67e22]/50")}
                  />
                </div>
              </form>

              <div className="flex items-center gap-2">
                <div
                  className={cn(
                    "hidden md:flex items-center gap-1 px-2 py-1 rounded-lg border",
                    theme === "dark" ? "border-white/10 bg-white/5" : "border-gray-200 bg-white",
                  )}
                >
                  {LANGUAGE_OPTIONS.map((option) => (
                    <button
                      key={option.code}
                      type="button"
                      onClick={() => setLanguage(option.code)}
                      className={cn(
                        "px-2 py-1 rounded text-[11px] font-semibold transition",
                        language === option.code
                          ? "bg-[#e67e22] text-white"
                          : theme === "dark"
                            ? "text-gray-300 hover:text-white hover:bg-white/10"
                            : "text-gray-600 hover:text-gray-900 hover:bg-gray-100",
                      )}
                    >
                      {option.label}
                    </button>
                  ))}
                </div>

                <Button
                  variant="ghost"
                  size="icon"
                  onClick={toggleTheme}
                  className={theme === "dark" ? "hover:bg-white/5" : "hover:bg-gray-100"}
                >
                  {theme === "dark" ? <Sun className="h-5 w-5" /> : <Moon className="h-5 w-5" />}
                </Button>

                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button variant="ghost" size="icon" className={cn("relative", theme === "dark" ? "hover:bg-white/5" : "hover:bg-gray-100")}>
                      <Bell className="h-5 w-5" />
                      {notifications.length > 0 ? <span className="absolute top-1 right-1 h-2 w-2 rounded-full bg-[#e67e22]" /> : null}
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end" className="w-80">
                    <DropdownMenuLabel>{copy.notificationsTitle}</DropdownMenuLabel>
                    <DropdownMenuSeparator />
                    {notifications.map((notif) => (
                      <DropdownMenuItem key={notif.id} className="flex items-start gap-3 py-3">
                        <span
                          className={cn(
                            "h-2 w-2 rounded-full mt-1.5 flex-shrink-0",
                            notif.type === "error" ? "bg-red-500" : notif.type === "warning" ? "bg-[#e67e22]" : "bg-blue-500",
                          )}
                        />
                        <div className="flex-1">
                          <p className="text-sm font-medium">{notif.title}</p>
                          <p className="text-xs text-muted-foreground">
                            {notif.time} {copy.agoSuffix}
                          </p>
                        </div>
                      </DropdownMenuItem>
                    ))}
                    {notifications.length === 0 ? (
                      <div className="py-4 text-center text-sm text-muted-foreground">{copy.noNotifications}</div>
                    ) : null}
                  </DropdownMenuContent>
                </DropdownMenu>

                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button variant="ghost" className={cn("flex items-center gap-2", theme === "dark" ? "hover:bg-white/5" : "hover:bg-gray-100")}>
                      <div className="h-8 w-8 rounded-full bg-[#e67e22]/20 flex items-center justify-center">
                        <span className="text-sm font-bold text-[#e67e22]">{user?.name?.charAt(0) || "A"}</span>
                      </div>
                      <span className="hidden md:block text-sm">{user?.name || copy.userFallback}</span>
                      <ChevronDown className="h-4 w-4" />
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end" className="w-56">
                    <DropdownMenuLabel>
                      <div className="flex flex-col">
                        <span>{user?.name || copy.userFallback}</span>
                        <span className="text-xs text-muted-foreground">{user?.email}</span>
                      </div>
                    </DropdownMenuLabel>
                    <DropdownMenuSeparator />
                    <DropdownMenuItem asChild>
                      <Link href="/">
                        <span className="cursor-pointer flex items-center gap-2">
                          <LayoutDashboard className="h-4 w-4" />
                          {copy.backToSite}
                        </span>
                      </Link>
                    </DropdownMenuItem>
                    <DropdownMenuSeparator />
                    <DropdownMenuItem onClick={handleLogout} className="text-red-400">
                      <LogOut className="h-4 w-4 mr-2" />
                      {copy.logout}
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              </div>
            </div>
          </header>

          <main className="p-4 lg:p-6">
            <div className={cn("mb-4 rounded-xl border p-4", theme === "dark" ? "border-white/10 bg-[#1a1410]/50" : "border-gray-200 bg-white")}>
              <h2 className={cn("text-base md:text-lg font-semibold", theme === "dark" ? "text-white" : "text-gray-900")}>{legend.title}</h2>
              <p className={cn("text-sm mt-1", theme === "dark" ? "text-gray-400" : "text-gray-600")}>{legend.description}</p>
              <div className="mt-3 grid gap-2 md:grid-cols-3">
                {legend.bullets.map((bullet) => (
                  <div
                    key={bullet}
                    className={cn(
                      "rounded-lg border px-3 py-2 text-xs",
                      theme === "dark" ? "border-white/10 bg-white/5 text-gray-300" : "border-gray-200 bg-gray-50 text-gray-700",
                    )}
                  >
                    {bullet}
                  </div>
                ))}
              </div>
            </div>
            {children}
          </main>
        </div>
      </div>
    </ThemeContext.Provider>
  );
}

