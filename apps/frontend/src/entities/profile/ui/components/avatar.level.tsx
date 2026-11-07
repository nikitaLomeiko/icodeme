import { Avatar } from "@/shared/ui/kit";
import { illustratedAvatars } from "../../model";

interface IProps {
  avatar: string;
  experience: number;
  size?: "2xl" | "3xl";
}

export const AvatarLevel: React.FC<IProps> = ({
  experience,
  avatar,
  size = "2xl",
}) => {
  const avatarMeta =
    illustratedAvatars.find((a) => a.label === avatar) ?? illustratedAvatars[0];

  const userLevel = Math.floor(experience / 100) + 1;
  return (
    <div className="relative">
      <div className="relative">
        <Avatar
          initials={avatarMeta.emoji}
          bgColor={avatarMeta.color}
          size={size}
          showDefaultIcon={false}
        />
        <div className="absolute -bottom-2 -right-2 rounded-full bg-gradient-to-br from-[var(--ui-primary)] to-[var(--ui-primary-hover)] border-2 border-[var(--ui-background)] flex items-center justify-center w-8 h-8 text-xs sm:w-10 sm:h-10 sm:text-sm">
          <span className="text-white font-bold">{userLevel}</span>
        </div>
      </div>
    </div>
  );
};
