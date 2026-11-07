import { BaseEntity } from '@core/types/BaseEntity.abstract';

export interface IProject extends BaseEntity {
  userId: string;
  meta: IProjectMeta;
  dir: FileNode[];
}

export interface IProjectMeta {
  name: string;
  title: string;
  subtitle: string;
  language: string;
}

export interface FileNode {
  id: string;
  name: string;
  type: 'file' | 'folder';
  content: string;
  children: FileNode[];
}

export const ProejctKey = 'projects';
