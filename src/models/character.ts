// ── Equipment ──────────────────────────────────────────────────────────────

export interface EquipmentTooltip {
  type: string;
  value: unknown;
}

export interface Equipment {
  Type: string;
  Name: string;
  Icon: string;
  Grade: string;
  Tooltip: string; // JSON string
}

// ── Engravings ──────────────────────────────────────────────────────────────

export interface Engraving {
  Slot: number;
  Name: string;
  Icon: string;
  Tooltip: string;
}

export interface EngravingEffect {
  Icon: string;
  Name: string;
  Description: string;
  Point: number;
  IsHave: boolean;
}

export interface ArkPassiveEffect {
  Name: string;
  Grade: string;
  Level: number;
  Description: string;
  AbilityStoneLevel: number | null;
}

export interface EngravingsResponse {
  Engravings: Engraving[] | null;
  Effects: EngravingEffect[] | null;
  ArkPassiveEffects: ArkPassiveEffect[] | null;
}

// ── Gems ──────────────────────────────────────────────────────────────────

export interface GemEffect {
  GemSlot: number;
  Name: string;
  Option: string;
  Icon: string;
  Tooltip: string;
}

export interface Gem {
  Slot: number;
  Name: string;
  Icon: string;
  Level: number;
  Grade: string;
  Tooltip: string;
}

export interface GemsResponse {
  Gems: Gem[] | null;
  Effects: { Skills: GemEffect[]; Description: string } | null;
}

// ── Skills ──────────────────────────────────────────────────────────────────

export interface Tripod {
  Tier: number;
  Slot: number;
  Name: string;
  Icon: string;
  Level: number;
  IsSelected: boolean;
  TooltipSuffix: string;
}

export interface Rune {
  Name: string;
  Icon: string;
  Grade: string;
}

export interface Skill {
  Name: string;
  Icon: string;
  Level: number;
  Type: string;
  IsAwakening: boolean;
  Tripods: Tripod[];
  Rune: Rune | null;
  Tooltip: string;
}

// ── Character ──────────────────────────────────────────────────────────────

export interface Character {
  ServerName: string;
  CharacterName: string;
  CharacterLevel: number;
  CharacterClassName: string;
  ItemAvgLevel: string;
}

export interface CharacterProfile {
  CharacterImage: string;
  ExpeditionLevel: 0;
  TownLevel: null;
  TownName: string;
  Title: string;
  GuildMemberGrade: string;
  GuildName: string;
  UsingSkillPoint: 0;
  TotalSkillPoint: 0;
  Stats: [
    {
      Type: string;
      Value: string;
      Tooltip: [string];
    },
  ];
  Tendencies: [
    {
      Type: string;
      Point: 0;
      MaxPoint: 0;
    },
  ];
  CombatPower: string;
  Decorations: {
    Symbol: string;
    Emblems: [string];
  };
  HonorPoint: 0;
  ServerName: string;
  CharacterName: string;
  CharacterLevel: 0;
  CharacterClassName: string;
  ItemAvgLevel: string;
}
