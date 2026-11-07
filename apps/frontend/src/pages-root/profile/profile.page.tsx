import { AchievementsData, useGetProfileQuery } from "@/entities/profile";
import { useGetMyStudyQuery } from "@/entities/study";
import { AchievementCarousel } from "@/widgets/achievement-view";
import { AboutView, ProfileView } from "@/widgets/profile-view";
import { StudyList } from "@/widgets/study-view";
import { useRouter } from "next/navigation";

export const ProfilePage = () => {
  const router = useRouter();
  const { data: profile } = useGetProfileQuery(null);
  const { data: study } = useGetMyStudyQuery(null);

  if (!profile?.data || !study?.data) {
    return null;

    // исправить
  }

  return (
    <>
      <ProfileView
        profileDetails={{
          globalRank: 42,
          totalUser: 121,
          profile: profile?.data,
        }}
      />
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 sm:gap-6 mt-5">
        <div className="lg:col-span-2 space-y-4 sm:space-y-6">
          <AboutView profileData={profile.data.data} />
          <AchievementCarousel
            achievements={AchievementsData.map((item) => ({
              ...item,
              isLocked: !profile.data?.achievements?.some(
                (ach) => ach.id === item.id,
              ),
            }))}
            onAllAchievementsLink={() => router.push("/profile/achievements")}
          />
        </div>

        <div className="space-y-4 sm:space-y-6">
          <StudyList list={study.data} />
        </div>
      </div>
    </>
  );
};
