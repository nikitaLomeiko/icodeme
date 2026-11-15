import { achievementsData, useGetProfileQuery } from "@/entities/profile";
import { useGetStudiesQuery } from "@/entities/study";
import { AchievementCarousel } from "@/widgets/achievement-view";
import { AboutView, ProfileView } from "@/widgets/profile-view";
import { StudyList } from "@/widgets/study-view";
import { useRouter } from "next/navigation";
import { useState } from "react";

export const ProfilePage: React.FC = () => {
  const router = useRouter();
  const profileQuery = useGetProfileQuery(null);
  const studiesQuery = useGetStudiesQuery(null);
  const [retrying, setRetrying] = useState(false);
  const profile = profileQuery.data;
  const studies = studiesQuery.data;

  if (profileQuery.isLoading || studiesQuery.isLoading || retrying)
    return (
      <p role="status" className="p-6">
        Загружаем профиль…
      </p>
    );
  if (
    profileQuery.isError ||
    studiesQuery.isError ||
    !profile?.data ||
    !studies?.data
  )
    return (
      <div role="alert" className="p-6">
        Не удалось загрузить профиль.
        <button
          onClick={() => {
            setRetrying(true);
            void Promise.all([
              profileQuery.refetch(),
              studiesQuery.refetch(),
            ]).finally(() => setRetrying(false));
          }}
        >
          Повторить
        </button>
      </div>
    );

  return (
    <>
      <ProfileView
        profileDetails={{
          profile: profile?.data,
        }}
      />
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 sm:gap-6 mt-5">
        <div className="lg:col-span-2 space-y-4 sm:space-y-6">
          <AboutView profileData={profile.data.data} />
          <AchievementCarousel
            achievements={achievementsData.map((item) => ({
              ...item,
              isLocked: !profile.data?.achievements?.some(
                (ach) => ach.id === item.id,
              ),
            }))}
            onAllAchievementsLink={() => router.push("/profile/achievements")}
          />
        </div>

        <div className="space-y-4 sm:space-y-6">
          <StudyList list={studies.data} />
        </div>
      </div>
    </>
  );
};
