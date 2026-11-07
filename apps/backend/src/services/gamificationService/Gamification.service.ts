// import { Injectable, NotFoundException } from '@nestjs/common';
// import { Db } from 'mongodb';
// import { BaseMongoRepository } from '@core/db';
// import { IProfile, ProfileKey } from '@models/profile';
// import { IServiceResponse } from '@core/types/Response.type';
// import { GamificationError } from './types/Error.types';
// import { IModule } from '@models/study';

// @Injectable()
// export class GamificationService {
//   private repositoryProfile: BaseMongoRepository<IProfile>;

//   constructor(db: Db) {
//     const collectionProfile = db.collection(ProfileKey);
//     this.repositoryProfile = new BaseMongoRepository<IProfile>(
//       collectionProfile,
//     );
//   }

//   async addExperienceByUserId(
//     id: string,
//     experience: number,
//   ): Promise<IServiceResponse<IProfile, GamificationError>> {
//     const profile = await this.repositoryProfile.findOne({ _id: id });

//     if (!profile) {
//       return {
//         success: false,
//         error: GamificationError.PROFILE_NOT_FOUND,
//       };
//     }

//     profile.stats.experience += experience;

//     while (
//       profile.stats.experience >
//       profile.levelPlanJSON[profile.level.positionCount - 1]
//         .experienceToNextLevel
//     ) {
//       profile.level = profile.levelPlanJSON[profile.level.positionCount];
//     }

//     await this.repositoryProfile.update({ _id: id }, { ...profile });

//     return {
//       success: true,
//       data: profile,
//     };
//   }

//   async nextModuleByUserId(
//     id: string,
//   ): Promise<IServiceResponse<IProfile, GamificationError>> {
//     const profile = await this.repositoryProfile.findOne({ _id: id });

//     if (!profile) {
//       return {
//         success: false,
//         error: GamificationError.PROFILE_NOT_FOUND,
//       };
//     }

//     if (profile.study.module + 1 < profile.studyPlanJSON.length) {
//       profile.study.module += 1;
//       profile.study.level = 1;
//       profile.study.step = 1;
//     }

//     await this.repositoryProfile.update({ _id: id }, { ...profile });

//     return {
//       success: true,
//       data: profile,
//     };
//   }

//   async nextLevelByUserId(
//     id: string,
//   ): Promise<IServiceResponse<IProfile, GamificationError>> {
//     const profile = await this.repositoryProfile.findOne({ _id: id });

//     if (
//       !profile ||
//       profile.studyPlanJSON[profile.study.module - 1].levels === undefined
//     ) {
//       return {
//         success: false,
//         error: GamificationError.PROFILE_NOT_FOUND,
//       };
//     }

//     if (
//       profile.study.level + 1 <
//       (profile.studyPlanJSON[profile.study.module - 1].levels?.length || 0)
//     ) {
//       profile.study.level += 1;
//       profile.study.step = 1;
//     }

//     await this.repositoryProfile.update({ _id: id }, { ...profile });

//     return {
//       success: true,
//       data: profile,
//     };
//   }

//   async nextStepByUserId(
//     id: string,
//   ): Promise<IServiceResponse<IProfile, GamificationError>> {
//     const profile = await this.repositoryProfile.findOne({ _id: id });

//     if (!profile) {
//       return {
//         success: false,
//         error: GamificationError.PROFILE_NOT_FOUND,
//       };
//     }

//     const currentModule = profile.studyPlanJSON[profile.study.module - 1];
//     const currentLevel = currentModule?.levels?.[profile.study.level - 1];
//     const stepsLength = currentLevel?.steps?.length ?? 0;

//     if (profile.study.step + 1 < stepsLength) {
//       profile.study.step += 1;
//     }

//     await this.repositoryProfile.update({ _id: id }, { ...profile });

//     return {
//       success: true,
//       data: profile,
//     };
//   }

//   async setLevelPlanByUserId(
//     id: string,
//     plan: IPosition[],
//   ): Promise<IServiceResponse<IProfile, GamificationError>> {
//     const profile = await this.repositoryProfile.findOne({ _id: id });

//     if (!profile) {
//       return {
//         success: false,
//         error: GamificationError.PROFILE_NOT_FOUND,
//       };
//     }

//     profile.levelPlanJSON = plan;

//     await this.repositoryProfile.update({ _id: id }, { ...profile });

//     return {
//       success: true,
//       data: profile,
//     };
//   }

//   async setStudyPlanByUserId(
//     id: string,
//     plan: IModule[],
//   ): Promise<IServiceResponse<IProfile, GamificationError>> {
//     const profile = await this.repositoryProfile.findOne({ _id: id });

//     if (!profile) {
//       return {
//         success: false,
//         error: GamificationError.PROFILE_NOT_FOUND,
//       };
//     }

//     profile.studyPlanJSON = plan;

//     await this.repositoryProfile.update({ _id: id }, { ...profile });

//     return {
//       success: true,
//       data: profile,
//     };
//   }
// }
