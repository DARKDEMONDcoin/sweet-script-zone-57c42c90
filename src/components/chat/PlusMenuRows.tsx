import { m as motion } from "framer-motion";
import { ChevronRight, type LucideIcon } from "lucide-react";
import { ReactNode } from "react";

const iosSpring = { type: "spring" as const, damping: 22, stiffness: 350 };

export const SectionLabel = ({ children }: { children: ReactNode }) => (
  <div className="px-3 -mb-1 text-[11px] font-semibold tracking-wider uppercase text-muted-foreground">
    {children}
  </div>
);

export const SectionCard = ({ children }: { children: ReactNode }) => (
  <div className="rounded-2xl overflow-hidden border border-border/50 bg-card/60">
    {children}
  </div>
);


export const SheetDivider = () => <div className="h-px bg-border/50 ml-12" />;

interface SheetRowProps {
  Icon?: LucideIcon;
  customIcon?: ReactNode;
  label: string;
  desc?: string;
  badge?: string;
  active?: boolean;
  chevron?: boolean;
  trailing?: ReactNode;
  onClick?: () => void;
  /** kept for backwards compat — ignored (icons are now flat monochrome) */
  accent?: string;
  /** kept for backwards compat — ignored (icons are now flat monochrome) */
  tint?: string;
}

export const SheetRow = ({
  Icon,
  customIcon,
  label,
  desc,
  badge,
  active,
  chevron,
  trailing,
  onClick,
}: SheetRowProps) => (
  <motion.button
    whileTap={{ scale: 0.985 }}
    transition={iosSpring}
    onClick={onClick}
    className="w-full flex items-center gap-3 px-3 py-2.5 text-left transition-colors hover:bg-muted/40 active:bg-muted/60"
  >
    <span className="shrink-0 w-8 h-8 flex items-center justify-center rounded-xl border border-border/50 bg-muted/40 text-foreground">
      {customIcon ? (
        customIcon
      ) : Icon ? (
        <Icon className="w-[18px] h-[18px]" strokeWidth={1.8} />
      ) : null}
    </span>
    <div className="flex-1 min-w-0">
      <div className="flex items-center gap-1.5">
        <span className="text-[14px] font-medium text-foreground leading-tight truncate">
          {label}
        </span>
        {badge && (
          <span className="text-[9px] font-medium px-1.5 py-px rounded-full bg-muted text-muted-foreground border border-border/50 leading-none tracking-wide">
            {badge}
          </span>
        )}
        {active && <span className="w-1.5 h-1.5 rounded-full bg-foreground ml-0.5" />}
      </div>
      {desc && (
        <div className="text-[12px] text-muted-foreground leading-tight mt-0.5 truncate">
          {desc}
        </div>
      )}
    </div>
    {trailing}
    {chevron && !trailing && (
      <ChevronRight className="w-4 h-4 text-muted-foreground shrink-0" strokeWidth={1.8} />
    )}
  </motion.button>
);

interface DesktopRowProps {
  Icon: LucideIcon;
  label: string;
  onClick?: () => void;
  chevron?: boolean;
  /** kept for backwards compat — ignored (icons are now flat monochrome) */
  color?: string;
}

export const DesktopRow = ({ Icon, label, onClick, chevron }: DesktopRowProps) => (
  <button
    onClick={onClick}
    className="w-full flex items-center gap-3 px-2.5 py-2 rounded-xl text-left text-foreground transition-colors hover:bg-muted/40 active:bg-muted/60"
  >
    <Icon className="w-[18px] h-[18px] shrink-0 text-foreground" strokeWidth={1.8} />
    <span className="flex-1 text-[14px] font-medium">{label}</span>
    {chevron && <ChevronRight className="w-4 h-4 text-muted-foreground" strokeWidth={1.8} />}

  </button>
);
