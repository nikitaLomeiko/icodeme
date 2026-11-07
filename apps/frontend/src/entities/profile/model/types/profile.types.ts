import { IAchievement } from "./achievement.types";

export interface IProfile {
  _id: string;
  userId: string;
  data: IProfileData;
  level: ILevel;
  achievements: IAchievement[];
  createdAt?: Date;
  updatedAt?: Date;
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

export interface IStats {
  experience: number;
}
