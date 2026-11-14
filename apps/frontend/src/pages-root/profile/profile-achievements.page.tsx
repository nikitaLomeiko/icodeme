import { achievementsData, useGetProfileQuery } from "@/entities/profile";
import { AchievementList } from "@/widgets/achievement-view";

export const ProfileAchievementsPage: React.FC = () => {
  const { data: profile } = useGetProfileQuery(null);

  if (!profile?.data) {
    return null;
  }

  return (
    <AchievementList
      achievements={achievementsData.map((item) => ({
        ...item,
        isLocked: !profile.data?.achievements?.some(
          (ach) => ach.id === item.id,
        ),
      }))}
    />
  );
};
