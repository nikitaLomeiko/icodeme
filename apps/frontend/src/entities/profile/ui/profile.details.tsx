"use client";

import { LanguageList, AvatarLevel, LevelBar, Rating } from "./components";
import { Card, Title } from "@/shared/ui/kit";
import { IProfile } from "../model";
import { FiEdit2 } from "react-icons/fi";
import { FaSignOutAlt } from "react-icons/fa";
import { ProfileDoodle } from "@/shared/ui/profile-doodle";

export interface IProps {
  profile: IProfile;
  onEdit: () => void;
  onLogout: () => void;
  totalUser?: number;
  globalRank?: number;
}

export const ProfileDetails: React.FC<IProps> = (props) => {
  const { profile, onEdit, onLogout, totalUser, globalRank } = props;

  return (
    <Card
      variant="default"
      padding="md"
      radius="md"
      hoverable={false}
      className="relative overflow-hidden shadow-none"
    >
      <ProfileDoodle />
      <div className="relative z-10">
        <div className="relative flex flex-col items-center text-center">
          <div className="relative mb-1 flex h-44 w-52 items-center justify-center">
            <div
              aria-hidden="true"
              className="absolute h-36 w-36 rounded-full bg-[var(--ui-primary)]/10 blur-2xl"
            />
            <AvatarLevel
              avatar={profile.data.avatar}
              experience={profile.level.experience}
              size="3xl"
            />
          </div>

          <div className="mt-4">
            <div className="flex items-center justify-center gap-2">
              <Title
                size="2xl"
                weight="bold"
                className="text-[var(--ui-text)] !my-0"
              >
                {profile.data.name}
              </Title>
              <button
                onClick={onEdit}
                className="rounded-lg p-1 text-[var(--ui-text-secondary)] transition-all hover:text-[var(--ui-primary)]"
              >
                <FiEdit2 size={18} />
              </button>
            </div>

            <div className="mt-1 text-xs font-medium text-[var(--ui-text-muted)]">
              ID: {profile.userId}
            </div>

            <div className="mt-4 inline-flex items-center gap-1.5 rounded-full border border-[var(--ui-primary)]/30 bg-[var(--ui-primary)]/10 px-3 py-1.5 text-sm font-bold text-[var(--ui-primary)]">
              <span aria-hidden="true">✦</span>
              <span>Звание: {profile.data.position}</span>
            </div>
          </div>

          <button
            onClick={onLogout}
            className="absolute right-0 top-0 rounded-lg p-2 text-red-500 transition-all hover:bg-red-500/10"
          >
            <FaSignOutAlt size={20} />
          </button>
        </div>

        <div className="mt-5 p-2 text-center">
          <LanguageList languages={profile.data.chips} />
        </div>

        <div className="flex flex-col lg:flex-row justify-between w-full border-t border-[var(--ui-border)] mt-4 sm:mt-6 pt-4 sm:pt-6 gap-4 sm:gap-6">
          <LevelBar experience={profile.level.experience} />
          {totalUser !== undefined && globalRank !== undefined ? (
            <Rating totalUser={totalUser} globalRank={globalRank} />
          ) : (
            <span className="text-sm text-[var(--ui-text-muted)]">
              Рейтинг пока недоступен
            </span>
          )}
        </div>
      </div>
    </Card>
  );
};
