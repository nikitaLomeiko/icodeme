import { Injectable } from '@nestjs/common';
import { Db } from 'mongodb';
import { BaseMongoRepository } from '@core/db';
import { generateId } from '@core/helpers/GenerateId';
import { IServiceResponse } from '@core/types/Response.type';
import { ProjectError } from './types/Error.types';
import { IProject, IProjectMeta, ProejctKey } from '@models/project';

@Injectable()
export class ProjectService {
  private repositoryProject: BaseMongoRepository<IProject>;

  constructor(db: Db) {
    const collectionProject = db.collection(ProejctKey);

    this.repositoryProject = new BaseMongoRepository<IProject>(
      collectionProject,
    );
  }

  async createNewProject(
    userId: string,
    meta: IProjectMeta,
  ): Promise<IServiceResponse<IProject, ProjectError>> {
    const now = new Date();

    const newProject: IProject = {
      _id: generateId(userId),
      userId,
      meta,
      dir: [],
      createdAt: now,
      updatedAt: now,
    };

    await this.repositoryProject.create(newProject);

    return { success: true, data: newProject };
  }

  async getProjectById(
    id: string,
  ): Promise<IServiceResponse<IProject, ProjectError>> {
    const project = await this.repositoryProject.findOne({ _id: id });

    if (!project) {
      return { success: false, error: ProjectError.PROJECT_NOT_FOUND };
    }

    return { success: true, data: project };
  }

  async getAllProjectsByUserId(
    userId: string,
  ): Promise<IServiceResponse<IProject[], ProjectError>> {
    const projects = await this.repositoryProject.find({ userId });

    return { success: true, data: projects || [] };
  }

  async changeProjectById(
    id: string,
    newProject: IProject,
  ): Promise<IServiceResponse<IProject, ProjectError>> {
    const project = await this.repositoryProject.findOne({ _id: id });

    if (!project) {
      return { success: false, error: ProjectError.PROJECT_NOT_FOUND };
    }

    const result = await this.repositoryProject.update(
      { _id: id },
      { ...project, ...newProject },
    );

    if (!result) {
      return { success: false, error: ProjectError.PROJECT_NOT_FOUND };
    }

    return { success: true, data: { ...project, ...newProject } };
  }

  async removeProjectById(
    id: string,
  ): Promise<IServiceResponse<null, ProjectError>> {
    const result = await this.repositoryProject.delete({ _id: id });

    if (!result) {
      return { success: false, error: ProjectError.PROJECT_NOT_FOUND };
    }

    return { success: true };
  }
}
