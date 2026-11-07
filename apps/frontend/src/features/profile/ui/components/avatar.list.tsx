import { Avatar, Title } from "@/shared/ui/kit";
import { IAvatar } from "../../model/types/avatar.types";

interface IProps {
  avatars: IAvatar[];
  handleSelect: (avatarLabel: string) => void;
  isSelected: (avatarLabel: string) => boolean;
  error?: string;
}

export const AvatarList: React.FC<IProps> = (props) => {
  const { avatars, handleSelect, isSelected, error } = props;
  return (
    <div className="flex flex-col gap-4">
      <div className="grid grid-cols-4 gap-4 justify-items-center">
        {avatars.map((avatar) => (
          <button
            key={avatar.label}
            onClick={() => handleSelect(avatar.label)}
            type="button"
            className={`
                cursor-pointer
                relative transition-all duration-300
                ${isSelected(avatar.label) ? "scale-110" : "hover:scale-105"}
                focus:outline-none focus:ring-2 focus:ring-purple-500 focus:ring-offset-2
            `}
            style={{
              boxShadow: isSelected(avatar.label)
                ? `0 0 20px ${avatar.color}60, 0 0 40px ${avatar.color}30`
                : "none",
              borderRadius: "9999px",
            }}
          >
            <Avatar
              size="xl"
              bgColor={avatar.color}
              initials={avatar.emoji}
              className="pointer-events-none"
            />
            {isSelected(avatar.label) && (
              <div className="absolute -bottom-1 -right-1 bg-purple-500 rounded-full p-0.5">
                <svg
                  className="w-3 h-3 text-white"
                  fill="currentColor"
                  viewBox="0 0 20 20"
                >
                  <path
                    fillRule="evenodd"
                    d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z"
                    clipRule="evenodd"
                  />
                </svg>
              </div>
            )}
          </button>
        ))}
      </div>
      {error && (
        <Title
          as="p"
          size="sm"
          weight="normal"
          color="error"
          align="center"
          isError
        >
          {error}
        </Title>
      )}
    </div>
  );
};
