"use client";

import React, { useEffect, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useLocale, useTranslations } from "next-intl";
import {
  ChevronLeft,
  ChevronRight,
  Landmark,
  Languages,
  LayoutDashboard,
  LogOut,
  Menu,
  Settings2,
  Tag,
} from "lucide-react";
import { useTheme } from "next-themes";
import { Button } from "@/shared/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuRadioGroup,
  DropdownMenuRadioItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/shared/components/ui/dropdown-menu";
import { Sheet, SheetContent, SheetTrigger } from "@/shared/components/ui/sheet";
import { Switch } from "@/shared/components/ui/switch";
import { Avatar, AvatarFallback } from "@/shared/components/ui/avatar";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/shared/components/ui/tooltip";
import { useAuthStore } from "@/modules/auth";
import { useSidebarCollapse } from "@/shared/hooks/use-sidebar-collapse";
import { cn } from "@/shared/lib/utils";

interface NavItem {
  icon: React.ReactNode;
  label: string;
  href: string;
  requiresAuth?: boolean;
}

type SupportedLocale = "en" | "pt";

function getInitials(name?: string) {
  if (!name) return "U";

  const parts = name.trim().split(/\s+/).filter(Boolean);
  if (parts.length === 0) return "U";

  if (parts.length === 1) {
    return parts[0].slice(0, 2).toUpperCase();
  }

  return `${parts[0][0]}${parts[parts.length - 1][0]}`.toUpperCase();
}

export function Sidebar() {
  const pathname = usePathname();
  const locale = useLocale();
  const t = useTranslations("navigation");
  const tUser = useTranslations("userMenu");
  const router = useRouter();
  const { resolvedTheme, setTheme } = useTheme();
  const { logout, user } = useAuthStore();
  const { isCollapsed, toggle } = useSidebarCollapse();
  const [isOpen, setIsOpen] = useState(false);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  const navItems: NavItem[] = [
    {
      icon: <LayoutDashboard className="h-5 w-5" />,
      label: t("dashboard"),
      href: `/${locale}/dashboard`,
      requiresAuth: true,
    },
    {
      icon: <Landmark className="h-5 w-5" />,
      label: t("accounts"),
      href: `/${locale}/accounts`,
      requiresAuth: true,
    },
    {
      icon: <Tag className="h-5 w-5" />,
      label: t("categories"),
      href: `/${locale}/categories`,
      requiresAuth: true,
    },
    {
      icon: <Settings2 className="h-5 w-5" />,
      label: t("settings"),
      href: `/${locale}/settings`,
      requiresAuth: true,
    },
  ];

  const isActive = (href: string) => {
    return pathname === href || pathname.startsWith(href + "/");
  };

  const buildLocalePath = (nextLocale: SupportedLocale) => {
    const segments = pathname.split("/");

    if (segments.length > 1 && (segments[1] === "pt" || segments[1] === "en")) {
      segments[1] = nextLocale;
      return segments.join("/") || `/${nextLocale}`;
    }

    if (pathname.startsWith("/")) {
      return `/${nextLocale}${pathname}`;
    }

    return `/${nextLocale}/${pathname}`;
  };

  const handleLogout = async () => {
    try {
      await logout();
      router.push(`/${locale}/auth/login`);
    } catch {
      // Error is handled by store
    }
  };

  const isDarkTheme = mounted && resolvedTheme === "dark";

  const NavContent = ({ showCloseOnSelect = false }: { showCloseOnSelect?: boolean }) => {
    const closeSidebarIfNeeded = () => {
      if (showCloseOnSelect) {
        setIsOpen(false);
      }
    };

    return (
      <div className="flex h-full flex-col">
        {/* Brand Header */}
        <div className="relative border-b px-4 py-5">
          <div className="absolute inset-0 bg-linear-to-br from-primary/10 via-transparent to-primary/5" />
          <div className="relative flex items-center gap-3">
            <div className={cn(
              "shrink-0 overflow-hidden rounded-md shadow-sm transition-all",
              isCollapsed ? "h-9 w-9" : "h-10 w-10"
            )}>
              <Image
                src="/logo/controle_certo_logo_colorfull.png"
                alt="ControleCerto"
                width={40}
                height={40}
                className="h-full w-full object-cover"
                priority
              />
            </div>
            {!isCollapsed && (
              <div className="overflow-hidden">
                <p className="text-sm font-semibold leading-tight">ControleCerto</p>
                <p className="text-xs text-muted-foreground">Finance Hub</p>
              </div>
            )}
          </div>
        </div>

        {/* Navigation Items */}
        <div className={cn("flex-1 space-y-2 py-4", isCollapsed ? "px-2" : "px-3")}>
          <TooltipProvider delayDuration={0}>
            {navItems.map((item) => {
              const button = (
                <Link key={item.href} href={item.href} className="block">
                  <Button
                    variant={isActive(item.href) ? "default" : "ghost"}
                    className={cn(
                      "w-full rounded-xl text-sm transition-all",
                      isCollapsed ? "h-11 justify-center px-0" : "h-11 justify-start gap-3",
                      isActive(item.href) &&
                        "bg-primary text-primary-foreground shadow-sm hover:bg-primary"
                    )}
                    onClick={closeSidebarIfNeeded}
                  >
                    {item.icon}
                    {!isCollapsed && <span>{item.label}</span>}
                  </Button>
                </Link>
              );

              if (isCollapsed) {
                return (
                  <Tooltip key={item.href}>
                    <TooltipTrigger asChild>
                      {button}
                    </TooltipTrigger>
                    <TooltipContent side="right">
                      <p>{item.label}</p>
                    </TooltipContent>
                  </Tooltip>
                );
              }

              return button;
            })}
          </TooltipProvider>
        </div>

        {/* Notice Card */}
        {!isCollapsed && (
          <div className="px-4 pb-3">
            <div className="rounded-xl border bg-muted/30 px-3 py-2 text-xs text-muted-foreground">
              Dashboard em evolucao continua.
            </div>
          </div>
        )}

        {/* User Profile Footer */}
        <div className="border-t p-3">
          {isCollapsed ? (
            // Collapsed: Only Avatar with Dropdown
            <TooltipProvider delayDuration={0}>
              <DropdownMenu>
                <Tooltip>
                  <TooltipTrigger asChild>
                    <DropdownMenuTrigger asChild>
                      <Button
                        variant="ghost"
                        className="h-11 w-full rounded-xl px-0"
                      >
                        <Avatar size="lg">
                          <AvatarFallback className="bg-primary/15 text-primary">
                            {getInitials(user?.name)}
                          </AvatarFallback>
                        </Avatar>
                      </Button>
                    </DropdownMenuTrigger>
                  </TooltipTrigger>
                  <TooltipContent side="right">
                    <p>{user?.name || tUser("fallbackName")}</p>
                  </TooltipContent>
                </Tooltip>
                <DropdownMenuContent align="end" side="right" className="w-64">
                  <DropdownMenuLabel>
                    <div className="flex flex-col gap-1">
                      <span className="text-sm font-semibold">{user?.name || tUser("fallbackName")}</span>
                      <span className="text-xs text-muted-foreground">{user?.email || tUser("fallbackEmail")}</span>
                    </div>
                  </DropdownMenuLabel>
                  <DropdownMenuSeparator />

                  <DropdownMenuItem
                    onSelect={(event) => event.preventDefault()}
                    className="flex items-center justify-between gap-3"
                  >
                    <span>{tUser("theme")}</span>
                    <Switch
                      checked={isDarkTheme}
                      onCheckedChange={(checked) => setTheme(checked ? "dark" : "light")}
                      aria-label={tUser("theme")}
                    />
                  </DropdownMenuItem>

                  <DropdownMenuSeparator />
                  <DropdownMenuLabel className="flex items-center gap-2 text-xs text-muted-foreground">
                    <Languages className="h-3.5 w-3.5" />
                    {tUser("language")}
                  </DropdownMenuLabel>
                  <DropdownMenuRadioGroup
                    value={locale}
                    onValueChange={(value) => {
                      if (value !== "pt" && value !== "en") return;

                      closeSidebarIfNeeded();
                      router.push(buildLocalePath(value));
                    }}
                  >
                    <DropdownMenuRadioItem value="pt">
                      {tUser("languagePt")}
                    </DropdownMenuRadioItem>
                    <DropdownMenuRadioItem value="en">
                      {tUser("languageEn")}
                    </DropdownMenuRadioItem>
                  </DropdownMenuRadioGroup>

                  <DropdownMenuSeparator />
                  <DropdownMenuItem
                    onClick={() => {
                      closeSidebarIfNeeded();
                      router.push(`/${locale}/settings`);
                    }}
                  >
                    <Settings2 className="h-4 w-4" />
                    {tUser("moreSettings")}
                  </DropdownMenuItem>
                  <DropdownMenuItem
                    variant="destructive"
                    onClick={async () => {
                      closeSidebarIfNeeded();
                      await handleLogout();
                    }}
                  >
                    <LogOut className="h-4 w-4" />
                    {t("logout")}
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </TooltipProvider>
          ) : (
            // Expanded: Full User Card
            <div className="flex items-center gap-3 rounded-xl border bg-muted/20 px-3 py-2.5">
              <Avatar size="lg" className="shrink-0">
                <AvatarFallback className="bg-primary/15 text-primary">
                  {getInitials(user?.name)}
                </AvatarFallback>
              </Avatar>

              <div className="min-w-0 flex-1">
                <p className="truncate text-sm font-semibold leading-tight">
                  {user?.name || tUser("fallbackName")}
                </p>
                <p className="truncate text-xs text-muted-foreground">
                  {user?.email || tUser("fallbackEmail")}
                </p>
              </div>

              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button
                    variant="ghost"
                    size="icon"
                    className="h-9 w-9 shrink-0 rounded-full"
                  >
                    <Settings2 className="h-4 w-4" />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end" side="top" className="w-64">
                  <DropdownMenuLabel>{tUser("menuTitle")}</DropdownMenuLabel>
                  <DropdownMenuSeparator />

                  <DropdownMenuItem
                    onSelect={(event) => event.preventDefault()}
                    className="flex items-center justify-between gap-3"
                  >
                    <span>{tUser("theme")}</span>
                    <Switch
                      checked={isDarkTheme}
                      onCheckedChange={(checked) => setTheme(checked ? "dark" : "light")}
                      aria-label={tUser("theme")}
                    />
                  </DropdownMenuItem>

                  <DropdownMenuSeparator />
                  <DropdownMenuLabel className="flex items-center gap-2 text-xs text-muted-foreground">
                    <Languages className="h-3.5 w-3.5" />
                    {tUser("language")}
                  </DropdownMenuLabel>
                  <DropdownMenuRadioGroup
                    value={locale}
                    onValueChange={(value) => {
                      if (value !== "pt" && value !== "en") return;

                      closeSidebarIfNeeded();
                      router.push(buildLocalePath(value));
                    }}
                  >
                    <DropdownMenuRadioItem value="pt">
                      {tUser("languagePt")}
                    </DropdownMenuRadioItem>
                    <DropdownMenuRadioItem value="en">
                      {tUser("languageEn")}
                    </DropdownMenuRadioItem>
                  </DropdownMenuRadioGroup>

                  <DropdownMenuSeparator />
                  <DropdownMenuItem
                    onClick={() => {
                      closeSidebarIfNeeded();
                      router.push(`/${locale}/settings`);
                    }}
                  >
                    <Settings2 className="h-4 w-4" />
                    {tUser("moreSettings")}
                  </DropdownMenuItem>
                  <DropdownMenuItem
                    variant="destructive"
                    onClick={async () => {
                      closeSidebarIfNeeded();
                      await handleLogout();
                    }}
                  >
                    <LogOut className="h-4 w-4" />
                    {t("logout")}
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </div>
          )}
        </div>
      </div>
    );
  };

  return (
    <>
      {/* Desktop Sidebar */}
      <aside className={cn(
        "relative hidden h-screen shrink-0 border-r bg-card/70 backdrop-blur supports-backdrop-filter:bg-card/60 sm:sticky sm:top-0 sm:flex sm:flex-col overflow-visible transition-all duration-300",
        isCollapsed ? "sm:w-20" : "sm:w-72"
      )}>
        <NavContent />
        <Button
          type="button"
          variant="outline"
          size="icon"
          onClick={toggle}
          className="absolute top-1/2 -right-3 z-50 h-7 w-7 -translate-y-1/2 rounded-full border bg-background shadow-sm hover:bg-muted"
          aria-label={isCollapsed ? "Expandir sidebar" : "Colapsar sidebar"}
        >
          {isCollapsed ? (
            <ChevronRight className="h-3.5 w-3.5" />
          ) : (
            <ChevronLeft className="h-3.5 w-3.5" />
          )}
        </Button>
      </aside>

      {/* Mobile Sidebar */}
      <div className="fixed left-3 top-3 z-50 sm:hidden">
        <Sheet open={isOpen} onOpenChange={setIsOpen}>
          <SheetTrigger asChild>
            <Button
              variant="ghost"
              size="icon"
              className="h-10 w-10 rounded-full border bg-background/95 shadow-sm backdrop-blur"
            >
              <Menu className="h-6 w-6" />
            </Button>
          </SheetTrigger>
          <SheetContent side="left" className="w-80 p-0">
            <NavContent showCloseOnSelect />
          </SheetContent>
        </Sheet>
      </div>
    </>
  );
}
