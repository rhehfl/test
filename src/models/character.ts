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
