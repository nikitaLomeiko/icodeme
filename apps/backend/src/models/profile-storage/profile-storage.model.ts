import { BaseEntity } from '@core/types/BaseEntity.abstract';

export interface IProfileStorage extends BaseEntity {
  userId: string;
  favorites: IFavorite[];
}

export interface IFavorite {
  documentId: string;
  links: ILineFavorite[];
}

export interface ILineFavorite {
  id: string;
  elementId: string;
  text: string;
  type: string;
  timestamp: number;
  scrollPosition: number;
}

export const ProfileStorageKey = 'profileStorage';
