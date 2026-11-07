import {
  selectCurrentPlan,
  selectStudyPlans,
  setStudyView,
} from "@/entities/study";
import { useAppDispatch, useAppSelector } from "@/shared/lib/hooks";
import { useRouter } from "next/navigation";

export const StudyNav = () => {
  const router = useRouter();
  const dispatch = useAppDispatch();

  const selectedStudy = useAppSelector(selectCurrentPlan);
  const studies = useAppSelector(selectStudyPlans);

  const handleSelectedPlan = (id: string) => {
    dispatch(setStudyView({ studyId: id, moduleIndex: 0 }));
    router.push(`/?studyId=${encodeURIComponent(id)}`);
  };

  return (
    <nav aria-label="Планы обучения" className="mb-5 flex flex-wrap gap-2">
      {studies.map((study) => (
        <button
          key={study._id}
          type="button"
          onClick={() => handleSelectedPlan(study._id)}
          aria-pressed={selectedStudy?._id === study._id}
          className={`rounded-lg border px-4 py-2 text-sm font-semibold transition-colors ${
            selectedStudy?._id === study._id
              ? "border-[var(--ui-primary)] bg-[var(--ui-primary)] text-white"
              : "border-[var(--ui-border)] bg-[var(--ui-background-secondary)] text-[var(--ui-text)] hover:border-[var(--ui-primary)]"
          }`}
        >
          {study.title}
        </button>
      ))}
    </nav>
  );
};
