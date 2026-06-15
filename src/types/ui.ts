/* ============================================================
   BioVault UI Type Definitions
   ============================================================ */

export type Vehicle = 'water' | 'milk' | 'coffee' | 'juice' | 'alcohol';

export type Category = 'medicine' | 'supplement' | 'food';

export type Severity = 'warning' | 'critical';

export type ScoreRingSize = 'sm' | 'md' | 'lg';

export type ButtonVariant = 'primary' | 'ghost' | 'danger';
export type ButtonSize = 'sm' | 'md' | 'lg';

export type GlassCardVariant = 'default' | 'elevated' | 'selected';

export interface NavItem {
  label: string;
  href: string;
  icon: string;
}

export interface TimeSlot {
  label: string;
  time: string;
}

export interface QuickAction {
  label: string;
  icon: string;
  color: string;
  bg: string;
  href: string;
}

export interface InsightData {
  icon: string;
  iconBg: string;
  iconColor: string;
  title: string;
  text: string;
}

export interface ProfileData {
  id: string;
  name: string;
  color: string;
  itemCount: number;
  lastActive: string;
}

export interface ConflictData {
  id: string;
  severity: Severity;
  title: string;
  mechanism: string;
  resolution: string;
  items: string[];
}

export interface BoostData {
  id: string;
  label: string;
  mechanism: string;
  items: string[];
}

export interface TimelineItemUI {
  id: string;
  name: string;
  scheduledTime: string;
  vehicle: Vehicle;
  category: Category;
  conflicts?: number;
  isGhost?: boolean;
}

export interface ResolverStep {
  label: string;
  status: 'pending' | 'active' | 'completed' | 'failed';
}
