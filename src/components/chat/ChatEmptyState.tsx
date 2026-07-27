import { m as motion } from "framer-motion";
import MegsyStar from "@/components/files/MegsyStar";
import { t as uiT, useUserLang } from "@/lib/authI18n";
import { cn } from "@/lib/utils";

export interface ChatEmptyStateProps {
  userName?: string | null;
  /** Visual density. Both variants share the exact same composition. */
  variant?: "mobile" | "desktop";
  className?: string;
}

/**
 * The single chat empty state for every surface.
 *
 * Mobile and desktop render the *same* mark, the same greeting copy and the
 * same typography — only the scale changes. Do not fork this per platform.
 */
export const ChatEmptyState = ({
  userName,
  variant = "mobile",
  className,
}: ChatEmptyStateProps) => {
  const lang = useUserLang();
  const isRtl = lang === "ar" || lang === "ar-eg" || lang === "fa" || lang === "he";
  const firstName = (userName || "").trim().split(/\s+/)[0] || "";

  const hour = new Date().getHours();
  const base =
    hour < 12 ? uiT("goodMorning", lang) : hour < 18 ? uiT("goodAfternoon", lang) : uiT("goodEvening", lang);
  const greeting = firstName ? (isRtl ? `${base}، ${firstName}` : `${base}, ${firstName}`) : base;

  const isDesktop = variant === "desktop";

  return (
    <div
      className={cn(
        "flex flex-col items-center justify-center text-center",
        isDesktop ? "gap-6" : "gap-5",
        className,
      )}
    >
      <div aria-hidden>
        <MegsyStar size={isDesktop ? 84 : 64} static className="text-[var(--megsy-blue)]" />
      </div>

      <motion.h1
        key={firstName || "friend"}
        dir={isRtl ? "rtl" : "ltr"}
        initial={{ opacity: 0, y: 8 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3, ease: "easeOut", delay: 0.08 }}
        className={cn(
          "font-medium tracking-[-0.4px] leading-tight text-foreground",
          isDesktop ? "text-[34px] lg:text-[40px]" : "text-[22px]",
        )}
        style={{
          fontFamily: '"Source Serif 4", "Source Serif Pro", "Tiempos Headline", Georgia, serif',
        }}
      >
        {greeting}
      </motion.h1>
    </div>
  );
};

export default ChatEmptyState;
