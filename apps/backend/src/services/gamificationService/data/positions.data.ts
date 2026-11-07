import { IPosition } from '@models/study';

export const Positions: Omit<IPosition, 'experienceToNextLevel'>[] = [
  {
    positionName: 'Начинающий',
    positionCount: 1,
  },
  {
    positionName: 'Продвинутый',
    positionCount: 2,
  },
  {
    positionName: 'Стажер',
    positionCount: 3,
  },
  {
    positionName: 'Junior',
    positionCount: 4,
  },
  {
    positionName: 'Junior+',
    positionCount: 5,
  },
  {
    positionName: 'Middle',
    positionCount: 6,
  },
  {
    positionName: 'Middle+',
    positionCount: 7,
  },
  {
    positionName: 'Senior',
    positionCount: 8,
  },
  {
    positionName: 'Senior+',
    positionCount: 9,
  },
  {
    positionName: 'Tech Lead',
    positionCount: 10,
  },
  {
    positionName: 'System Architect',
    positionCount: 11,
  },
  {
    positionName: 'Engineering Manager',
    positionCount: 12,
  },
  {
    positionName: 'CTO',
    positionCount: 13,
  },
  {
    positionName: 'Гугл',
    positionCount: 14,
  },
];
