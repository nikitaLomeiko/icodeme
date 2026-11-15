"use client";

import { Layout } from "@/widgets/layout";
import {
  StepShell,
  StudyStepProvider,
  useStepRouteParams,
  useStudyStep,
} from "@/widgets/step-shell";

interface IProps {
  children: React.ReactNode;
}

const MainLayout: React.FC<IProps> = ({ children }) => {
  const params = useStepRouteParams();
  const { isValid, isLoading, isError, study, step } = useStudyStep(params);

  if (!isValid) return <StepShell message="Некорректная ссылка на шаг." />;

  if (isLoading) return <StepShell loading />;

  if (isError || !study)
    return <StepShell message="Не удалось загрузить план обучения." />;

  if (!step)
    return <StepShell message="Задание для этого шага не найдено." />;

  const studyStep = {
    params,
    isValid,
    isLoading,
    isError,
    study,
    step,
  };
  return (
    <Layout>
      <StudyStepProvider value={studyStep}>
        <StepShell
          title={step.title}
          description={step.description}
          content={step.type === "code" ? step.code : undefined}
          settings={step.settings}
        >
          {children}
        </StepShell>
      </StudyStepProvider>
    </Layout>
  );
};

export default MainLayout;
