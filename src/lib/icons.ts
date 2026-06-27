import {
  Award,
  BookOpen,
  Briefcase,
  Calendar,
  CheckCircle2,
  Compass,
  GraduationCap,
  Globe,
  Heart,
  Lightbulb,
  LineChart,
  MapPin,
  MessageCircle,
  Rocket,
  Search,
  ShieldCheck,
  Sparkles,
  Star,
  Target,
  TrendingUp,
  Trophy,
  Users,
  UserCheck,
  Zap,
  type LucideIcon,
} from "lucide-react";

/**
 * Maps CMS-stored icon name strings (free-form, set by editors) to lucide-react
 * components. Unknown / missing names fall back to a neutral default so the UI
 * never breaks on bad data.
 */
const ICON_MAP: Record<string, LucideIcon> = {
  award: Award,
  "book-open": BookOpen,
  book: BookOpen,
  briefcase: Briefcase,
  calendar: Calendar,
  check: CheckCircle2,
  "check-circle": CheckCircle2,
  compass: Compass,
  "graduation-cap": GraduationCap,
  graduation: GraduationCap,
  globe: Globe,
  heart: Heart,
  lightbulb: Lightbulb,
  "line-chart": LineChart,
  "map-pin": MapPin,
  "message-circle": MessageCircle,
  message: MessageCircle,
  rocket: Rocket,
  search: Search,
  "shield-check": ShieldCheck,
  shield: ShieldCheck,
  sparkles: Sparkles,
  star: Star,
  target: Target,
  "trending-up": TrendingUp,
  trophy: Trophy,
  users: Users,
  "user-check": UserCheck,
  zap: Zap,
};

export const DEFAULT_ICON: LucideIcon = Sparkles;

/** Resolve a CMS icon name to a lucide component; never returns undefined. */
export function resolveIcon(name: string | null | undefined): LucideIcon {
  if (!name) return DEFAULT_ICON;
  const key = name.trim().toLowerCase();
  return ICON_MAP[key] ?? DEFAULT_ICON;
}
