import { Avatar, Title } from "@/shared/ui/kit";
import { illustratedAvatars } from "../../model/data/avatar.data";
import { AvatarList } from "../components/avatar.list";

interface AvatarStepProps {
  value: string;
  onChange: (value: string) => void;
  error?: string;
}

export const AvatarStep: React.FC<AvatarStepProps> = ({
  value,
  onChange,
  error,
}) => {
  const handleSelect = (avatarLabel: string) => {
    onChange(avatarLabel);
  };

  const isSelected = (avatarLabel: string) => {
    if (!value) return false;
    return value === avatarLabel;
  };

  const getSelectedAvatar = () => {
    if (!value) return illustratedAvatars[0];

    return (
      illustratedAvatars.find((a) => a.label === value) || illustratedAvatars[0]
    );
  };

  const selectedAvatar = getSelectedAvatar();

  return (
    <div className="flex flex-col gap-8">
      <div className="flex flex-col items-center gap-4">
        <div className="relative group">
          <div className="absolute inset-0 bg-gradient-to-r from-green-500 via-green-500 to-green-500 rounded-full blur-md opacity-70 transition-opacity duration-300" />
          <div className="relative">
            <Avatar
              size="2xl"
              bgColor={selectedAvatar.color}
              initials={selectedAvatar.emoji}
              className="transition-transform duration-300"
            />
          </div>
        </div>
      </div>

      <AvatarList
        avatars={illustratedAvatars}
        handleSelect={handleSelect}
        isSelected={isSelected}
        error={error}
      />
    </div>
  );
};
