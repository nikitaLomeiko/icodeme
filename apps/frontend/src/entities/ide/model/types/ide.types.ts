import { FileNode } from "@/shared/ui/kit/code/";

export interface IProject {
  _id: string;
  createdAt?: Date;
  updatedAt?: Date;
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
