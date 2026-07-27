/** @doc Unified monochrome settings icons (lucide, stroke 1.8) — matches the app-wide gray/black system. */
import { type SVGProps, type ComponentType } from "react";
import {
  ChevronLeft,
  ChevronRight,
  User,
  Users,
  CreditCard,
  Sparkles,
  Brain,
  Wand2,
  Palette,
  Bell,
  Plug,
  LifeBuoy,
  HelpCircle,
  Shield,
  Activity,
  LogOut,
  Languages,
  Gift,
  Repeat,
  KeyRound,
} from "lucide-react";

type IconProps = SVGProps<SVGSVGElement>;

const icon =
  (Icon: ComponentType<any>) =>
  (p: IconProps) =>
    <Icon strokeWidth={1.8} {...(p as any)} />;

export const AccountIcon = icon(User);
export const WorkspacesIcon = icon(Users);
export const BillingIcon = icon(CreditCard);
export const AiPersonalizationIcon = icon(Wand2);
export const MemoryIcon = icon(Brain);
export const SkillsIcon = icon(Sparkles);
export const AppearanceIcon = icon(Palette);
export const ThemeIcon = AppearanceIcon;
export const NotificationsIcon = icon(Bell);
export const IntegrationsIcon = icon(Plug);
export const SupportIcon = icon(LifeBuoy);
export const HumanSupportIcon = SupportIcon;
export const AISupportIcon = icon(Wand2);
export const FAQIcon = icon(HelpCircle);
export const PrivacyIcon = icon(Shield);
export const StatusIcon = icon(Activity);
export const LogoutIcon = icon(LogOut);
export const SignOutIcon = LogoutIcon;
export const HelpIcon = SupportIcon;
export const LanguageIcon = icon(Languages);
export const GiftIcon = icon(Gift);
export const SwitchIcon = icon(Repeat);
export const ChevronIcon = icon(ChevronRight);
export const BackIcon = icon(ChevronLeft);
export const SparkleIcon = icon(Sparkles);
export const ApiIcon = icon(KeyRound);
