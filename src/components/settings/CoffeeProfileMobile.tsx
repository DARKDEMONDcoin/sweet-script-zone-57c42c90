/** @doc Mobile settings — unified clean monochrome layout (tokens only, no media backgrounds). */
import { useEffect, useMemo, useState, type ComponentType } from "react";
import { useNavigate } from "react-router-dom";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useActiveAccount } from "@/hooks/useActiveAccount";
import { t as authT, useUserLang, AVAILABLE_LANGS } from "@/lib/authI18n";
import { goBackOr } from "@/lib/navigation";
import MobilePushShell from "@/components/layout/MobilePushShell";
import OliveAvatar from "@/components/branding/OliveAvatar";
import {
  AccountIcon,
  NotificationsIcon,
  BillingIcon,
  AppearanceIcon,
  LanguageIcon,
  SparkleIcon,
  IntegrationsIcon,
  FAQIcon,
  PrivacyIcon,
  StatusIcon,
  LogoutIcon,
} from "@/components/settings/SettingsIcons";

type Row = {
  icon: ComponentType<{ className?: string }>;
  label: string;
  path?: string;
  onClick?: () => void;
  trailing?: string;
  danger?: boolean;
};
type Group = { title: string; rows: Row[] };

const CoffeeProfileMobile = () => {
  const navigate = useNavigate();
  const account = useActiveAccount();
  const lang = useUserLang();
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [userEmail, setUserEmail] = useState("");

  const userName = account.name || userEmail.split("@")[0] || "User";
  const avatarUrl = account.avatarUrl;

  useEffect(() => {
    let cancelled = false;
    (async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user || cancelled) return;
      setUserEmail(user.email || "");
    })();
    return () => { cancelled = true; };
  }, []);

  const currentLangLabel = useMemo(
    () => AVAILABLE_LANGS.find((l) => l.code === lang)?.native ?? "English",
    [lang],
  );

  const handleLogout = async () => {
    await supabase.auth.signOut();
    navigate("/auth");
  };

  const groups: Group[] = [
    {
      title: authT("settingsAccount"),
      rows: [
        { icon: AccountIcon, label: "Profile", path: "/settings/profile/edit" },
        { icon: NotificationsIcon, label: "Notifications", path: "/settings/notifications" },
        { icon: BillingIcon, label: authT("rowBilling"), path: "/settings/billing" },
      ],
    },
    {
      title: authT("settingsPreferences"),
      rows: [
        { icon: AppearanceIcon, label: authT("rowAppearance"), path: "/settings/customization" },
        {
          icon: LanguageIcon,
          label: authT("rowLanguage"),
          path: "/settings/language",
          trailing: currentLangLabel,
        },
        { icon: SparkleIcon, label: "Capabilities", path: "/settings/capabilities" },
      ],
    },
    {
      title: "Connections",
      rows: [
        { icon: IntegrationsIcon, label: authT("rowIntegrations"), path: "/settings/integrations" },
        { icon: IntegrationsIcon, label: "AI Tools", path: "/settings/pipedream-tools" },
      ],
    },
    {
      title: authT("settingsMore"),
      rows: [
        { icon: FAQIcon, label: authT("rowHelp"), path: "/settings/support" },
        { icon: PrivacyIcon, label: authT("rowPrivacy"), path: "/settings/privacy" },
        { icon: StatusIcon, label: authT("rowStatus"), path: "/settings/system-status" },
      ],
    },
    {
      title: "",
      rows: [
        { icon: LogoutIcon, label: authT("rowLogout"), onClick: handleLogout, danger: true },
      ],
    },
  ];

  return (
    <MobilePushShell open={sidebarOpen} onOpenChange={setSidebarOpen} currentMode="settings">
      <div className="min-h-[100dvh] w-full bg-background text-foreground">
        <div
          className="mx-auto w-full max-w-[430px] px-4 pb-16"
          style={{ paddingTop: "calc(env(safe-area-inset-top, 0px) + 12px)" }}
        >
          {/* Top bar */}
          <div className="relative flex h-11 items-center justify-center">
            <button
              type="button"
              aria-label="Back"
              onClick={() => goBackOr(navigate, "/chat")}
              className="absolute left-0 flex h-9 w-9 items-center justify-center rounded-full border border-border/50 bg-card/60 text-foreground transition-colors active:bg-muted/60"
            >
              <ChevronLeft className="h-5 w-5" strokeWidth={1.8} />
            </button>
            <h1 className="text-[17px] font-semibold tracking-tight">{authT("settingsTitle")}</h1>
          </div>

          {/* Identity */}
          <button
            type="button"
            onClick={() => navigate("/settings/profile/edit")}
            aria-label="Open profile"
            className="mt-6 flex w-full flex-col items-center rounded-2xl px-4 py-4 transition-colors active:bg-muted/40"
          >
            <div className="h-[84px] w-[84px] overflow-hidden rounded-full border border-border/60">
              {avatarUrl ? (
                <img src={avatarUrl} alt="" className="h-full w-full object-cover" />
              ) : (
                <OliveAvatar seed={userEmail || userName} className="h-full w-full" />
              )}
            </div>
            <p className="mt-3 text-[19px] font-semibold tracking-tight text-foreground">{userName}</p>
            <p className="mt-0.5 text-[13px] text-muted-foreground">{userEmail || "—"}</p>
          </button>

          {/* Groups */}
          <div className="mt-6 flex flex-col gap-5">
            {groups.map((group, gIdx) => (
              <section key={group.title || `g${gIdx}`}>
                {group.title && (
                  <h2 className="mb-2 px-1 text-[11px] font-medium uppercase tracking-[0.08em] text-muted-foreground">
                    {group.title}
                  </h2>
                )}
                <div className="overflow-hidden rounded-2xl border border-border/50 bg-card/60">
                  {group.rows.map((row, rIdx) => {
                    const Icon = row.icon;
                    return (
                      <button
                        key={row.label}
                        type="button"
                        onClick={() => (row.onClick ? row.onClick() : row.path && navigate(row.path))}
                        className={[
                          "flex w-full items-center gap-3 px-4 py-3.5 text-left transition-colors active:bg-muted/50",
                          rIdx > 0 ? "border-t border-border/40" : "",
                          row.danger ? "text-destructive" : "text-foreground",
                        ].join(" ")}
                      >
                        <Icon
                          className={`h-[18px] w-[18px] shrink-0 ${row.danger ? "text-destructive" : "text-muted-foreground"}`}
                        />
                        <span className="flex-1 text-[15px] font-medium">{row.label}</span>
                        {row.trailing && (
                          <span className="shrink-0 text-[13px] text-muted-foreground">{row.trailing}</span>
                        )}
                        {!row.danger && (
                          <ChevronRight className="h-4 w-4 shrink-0 text-muted-foreground/60" strokeWidth={1.8} />
                        )}
                      </button>
                    );
                  })}
                </div>
              </section>
            ))}
          </div>
        </div>
      </div>
    </MobilePushShell>
  );
};

export default CoffeeProfileMobile;
