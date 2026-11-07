import { BaseEntity } from '@core/types/BaseEntity.abstract';

export interface IProfile extends BaseEntity {
  userId: string;
  data: IProfileData;
  level: ILevel;
  achievements: IAchievement[];
}

export interface IProfileData {
  avatar: string;
  name: string;
  about: string;
  chips: string[];
  position: string;
}

export interface ILevel {
  experience: number;
  experienceToNextLevel: number;
  currentLevel: number;
}

export interface IAchievement {
  id: string;
  title: string;
  description: string;
  progress: number;
  maxProgress: number;
  rarity: 'common' | 'uncommon' | 'rare' | 'epic' | 'legendary';
}

export const ProfileKey = 'profiles';
