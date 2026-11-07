import {
  CodeEnviroment,
  EnviromentProvider,
  FileProvider,
} from "@/shared/ui/kit/code";
import {
  useCreateAndRunContainerMutation,
  useSendInputToContainerMutation,
  useStopContainerMutation,
} from "../api/ide.api";
import { FileNode } from "@/shared/ui/kit/code/types/types";
import { generateId } from "@/shared/lib/utils/generate-id";
import { ITerminalHandle, Modal, Terminal } from "@/shared/ui/kit";
import React, { useEffect, useRef, useState } from "react";
import { isApiError } from "@/shared/api";
import { IProjectMeta } from "../model/types/ide.types";

interface IProps {
  meta: IProjectMeta;
  userId: string;
  initialFiles?: FileNode[];
  className?: string;
  stepId: string;
}

export const IDE: React.FC<IProps> = (props) => {
  const { meta, userId, initialFiles, className, stepId } = props;

  const terminalRef = useRef<ITerminalHandle>(null);
  const [isTerminalOpen, setIsTerminalOpen] = useState(false);
  const [isClossedTerminal, setClosedTerminal] = useState(false);
  const [createContainer, { isLoading: IsLoadingStartContainer, data }] =
    useCreateAndRunContainerMutation();
  const [stopContainer] = useStopContainerMutation();
  const [sendToContainer] = useSendInputToContainerMutation();

  useEffect(() => {
    if (isTerminalOpen) {
      terminalRef.current?.focus();
    }
  }, [isTerminalOpen]);

  const sendMessageProgramClossed = (
    startedAt: string = Date.now().toString(),
  ) => {
    setClosedTerminal(true);
    terminalRef.current?.push([
      `[${startedAt}] Программа завершила свое исполнение`,
    ]);
  };

  const handleTerminalInput = async (input: string) => {
    if (isClossedTerminal) {
      setIsTerminalOpen(false);
      await stopContainer({ containerId: data?.data?.containerId || "" });

      return;
    }

    const result = await sendToContainer({
      containerId: data?.data?.containerId || "",
      input,
    });

    if (result.error && isApiError(result.error)) {
      terminalRef.current?.push([`Ошибка при попытки запустить код`]);
      sendMessageProgramClossed();
      return;
    }

    terminalRef.current?.push([`${result.data?.data?.output}`]);

    if (!result.data?.data?.requiresInput) {
      sendMessageProgramClossed(result.data?.data?.startedAt);
    }
  };

  const handleRun = async (files: FileNode[]) => {
    setIsTerminalOpen(true);
    setClosedTerminal(false);

    terminalRef.current?.push("Загрузка...");

    const result = await createContainer({
      project: {
        _id: generateId(),
        dir: files,
        meta,
        userId,
        createdAt: new Date(),
        updatedAt: new Date(),
      },
      stepId,
    });

    if (result.error && isApiError(result.error)) {
      terminalRef.current?.push([`Ошибка при попытки запустить код`]);
      sendMessageProgramClossed();
      return;
    }

    const terminalResult = result.data?.data;

    terminalRef.current?.push([
      `[${terminalResult?.startedAt}] container id: ${terminalResult?.containerId}`,
      `[${terminalResult?.startedAt}] image name: ${terminalResult?.imageName}`,
      `Результат исполнение кода:`,
      `***`,
      `${terminalResult?.output}`,
    ]);

    if (!terminalResult?.requiresInput) {
      sendMessageProgramClossed(terminalResult?.startedAt);
    }
  };

  return (
    <div>
      <FileProvider initialFileSystem={initialFiles}>
        <EnviromentProvider>
          <CodeEnviroment onRun={handleRun} className={className} />
        </EnviromentProvider>
      </FileProvider>
      <Modal
        isOpen={isTerminalOpen}
        onClose={() => setIsTerminalOpen(false)}
        variant="transparent"
        withAnimation
        closeOnEsc
        blurBackground
        closeOnOverlayClick
        overlayClassName="w-full"
        size="full"
      >
        <Terminal
          ref={terminalRef}
          user="student"
          host="icodeme"
          readonly={IsLoadingStartContainer}
          initialLines={["Загрузка..."]}
          onInput={handleTerminalInput}
        />
      </Modal>
    </div>
  );
};
