"use client";

import { LanguageList, AvatarLevel, LevelBar, Rating } from "./components";
import { Card, Title } from "@/shared/ui/kit";
import { IProfile } from "../model";
import { FiEdit2 } from "react-icons/fi";
import { FaSignOutAlt } from "react-icons/fa";

export interface IProps {
  profile: IProfile;
  onEdit: () => void;
  onLogout: () => void;
  totalUser: number;
  globalRank: number;
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
      <svg
        aria-hidden="true"
        className="pointer-events-none absolute inset-0 h-full w-full text-[var(--ui-text-muted)] opacity-[0.12]"
      >
        <defs>
          <pattern
            id="profile-doodle-pattern"
            width="150"
            height="130"
            patternUnits="userSpaceOnUse"
          >
            <path
              d="M18 27h24a5 5 0 0 1 5 5v13a5 5 0 0 1-5 5H31l-7 6v-6h-6a5 5 0 0 1-5-5V32a5 5 0 0 1 5-5Z"
              fill="none"
              stroke="currentColor"
              strokeWidth="1.5"
            />
            <path
              d="m82 20 3.5 7.5L94 31l-8.5 3.5L82 43l-3.5-8.5L70 31l8.5-3.5L82 20Z"
              fill="none"
              stroke="currentColor"
              strokeWidth="1.5"
            />
            <path
              d="m116 74-10 10 10 10M128 74l10 10-10 10M123 71l-5 26"
              fill="none"
              stroke="currentColor"
              strokeWidth="1.7"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
            <circle
              cx="35"
              cy="101"
              r="12"
              fill="none"
              stroke="currentColor"
              strokeWidth="1.5"
            />
            <ellipse
              cx="35"
              cy="101"
              rx="19"
              ry="6"
              fill="none"
              stroke="currentColor"
              strokeWidth="1.2"
              transform="rotate(-28 35 101)"
            />
            <path
              d="M78 83c-5-7-16 0 0 13 16-13 5-20 0-13Z"
              fill="none"
              stroke="currentColor"
              strokeWidth="1.5"
            />
            <path
              d="M84 111h21M94.5 100.5v21"
              stroke="currentColor"
              strokeWidth="1.5"
              strokeLinecap="round"
            />
          </pattern>
        </defs>
        <rect width="100%" height="100%" fill="url(#profile-doodle-pattern)" />
      </svg>
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
          <Rating totalUser={totalUser} globalRank={globalRank} />
        </div>
      </div>
    </Card>
  );
};
