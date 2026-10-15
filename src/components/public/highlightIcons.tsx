import {
  Activity,
  Bot,
  BrainCircuit,
  Component,
  Database,
  FlaskConical,
  Gauge,
  Handshake,
  Landmark,
  Megaphone,
  MemoryStick,
  Network,
  Radio,
  Ruler,
  ShieldCheck,
  Smartphone,
  Sparkles,
  Users,
  Zap,
  type LucideIcon,
} from "lucide-react";

// Keys used by ExperienceHighlight.icon (set in prisma/sync-resume.ts)
const ICONS: Record<string, LucideIcon> = {
  activity: Activity,
  bot: Bot,
  brain: BrainCircuit,
  component: Component,
  database: Database,
  flask: FlaskConical,
  gauge: Gauge,
  handshake: Handshake,
  landmark: Landmark,
  megaphone: Megaphone,
  memory: MemoryStick,
  network: Network,
  radio: Radio,
  ruler: Ruler,
  shield: ShieldCheck,
  smartphone: Smartphone,
  users: Users,
  zap: Zap,
};

export function HighlightIcon({ name, className }: { name: string; className?: string }) {
  const Icon = ICONS[name] ?? Sparkles;
  return <Icon className={className} aria-hidden="true" />;
}
