import { AchievementsData, useGetProfileQuery } from "@/entities/profile";
import { AchievementList } from "@/widgets/achievement-view";

export const ProfileAchievementsPage = () => {
  const { data: profile } = useGetProfileQuery(null);

  if (!profile?.data) {
    return null;
  }

  return (
    <AchievementList
      achievements={AchievementsData.map((item) => ({
        ...item,
        isLocked: !profile.data?.achievements?.some(
          (ach) => ach.id === item.id,
        ),
      }))}
    />
  );
};
