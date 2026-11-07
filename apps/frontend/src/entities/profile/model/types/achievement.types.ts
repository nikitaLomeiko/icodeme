export interface IAchievement {
  id: string;
  title: string;
  description: string;
  progress: number;
  maxProgress: number;
  rarity: "common" | "uncommon" | "rare" | "epic" | "legendary";
}

export interface IAchievementUI extends IAchievement {
  icon: React.ReactNode;
  iconColor: string;
  isLocked?: boolean;
}
