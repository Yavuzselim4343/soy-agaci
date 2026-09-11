export type Gender = 'male' | 'female' | 'other' | 'unspecified';

export interface CardColor {
  background?: string;
  border?: string;
  text?: string;
  badgeBg?: string;
}

export interface Person {
  id: string;
  firstName: string;
  lastName: string;
  gender: Gender;
  role: string; // E.g. "3 çocuk annesi", "Baba", "Doktor", "Ailenin büyüğü"
  nickname?: string;
  birthDate?: string;
  birthPlace?: string;
  deathDate?: string;
  isLiving: boolean;
  description?: string;
  photo?: string; // Data URL or URL or avatar key
  cardColor?: CardColor;
  positionX?: number;
  positionY?: number;
  createdAt: string;
  updatedAt: string;
}

export type LineStyle = 'solid' | 'dashed' | 'dotted';

export type BuiltinRelationshipType =
  | 'spouse'
  | 'child'
  | 'parent'
  | 'sibling'
  | 'grandfather'
  | 'grandmother'
  | 'grandchild'
  | 'uncle'
  | 'aunt'
  | 'nephew_niece'
  | 'cousin'
  | 'step_child'
  | 'step_parent'
  | 'adopted'
  | 'foster'
  | 'other';

export interface RelationshipTypeDefinition {
  id: string;
  name: string;
  label: string;
  color: string;
  lineStyle: LineStyle;
  lineWidth: number;
  isCustom?: boolean;
  inverseType?: string;
  description?: string;
}

export interface Relationship {
  id: string;
  sourcePersonId: string; // Kişi
  targetPersonId: string; // Diğer kişi
  type: string; // 'spouse', 'child', or custom ID
  customLabel?: string;
  color?: string;
  lineStyle?: LineStyle;
  lineWidth?: number;
  opacity?: number;
  notes?: string;
  createdAt: string;
}

export interface TreeSettings {
  theme: 'light' | 'dark' | 'system';
  language: 'tr' | 'en';
  defaultZoom: number;
  layoutDirection: 'TB' | 'LR';
  spouseDistance: number; // default 60px
  siblingDistance: number; // default 50px
  generationDistance: number; // default 170px
  showEdgeLabels: boolean;
  nodeWidth: number;
  nodeHeight: number;
  snapToGrid: boolean;
  backgroundVariant: 'dots' | 'lines' | 'cross' | 'none';
  customStyles: Record<string, {
    color: string;
    lineStyle: LineStyle;
    lineWidth: number;
  }>;
}

export interface FamilyTreeData {
  id: string;
  name: string;
  description?: string;
  persons: Person[];
  relationships: Relationship[];
  customRelationshipTypes: RelationshipTypeDefinition[];
  settings: TreeSettings;
  createdAt: string;
  updatedAt: string;
}

export interface HistoryState {
  past: FamilyTreeData[];
  present: FamilyTreeData;
  future: FamilyTreeData[];
}

