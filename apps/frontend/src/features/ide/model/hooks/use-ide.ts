"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import type { FileNode } from "@/shared/ui/kit";
import { generateId } from "@/shared/lib";
import { isApiError } from "@/shared/api";
import {
  useCreateAndRunContainerMutation,
  useCreateTerminalTicketMutation,
  useStopContainerMutation,
} from "../../api/ide.api";
import type { IProjectMeta } from "../types/ide.types";

export interface IIdeControllerProps {
  meta: IProjectMeta;
  userId: string;
  stepId: string;
}

const getErrorMessage = (error: unknown, fallback: string) =>
  isApiError(error) ? error.data.message : fallback;

export const useIde = ({ meta, userId, stepId }: IIdeControllerProps) => {
  const projectIdRef = useRef(generateId());
  const activeContainerIdRef = useRef<string | null>(null);
  const [isTerminalVisible, setTerminalVisible] = useState(false);
  const [isStarting, setStarting] = useState(false);
  const [terminalTicket, setTerminalTicket] = useState<string | null>(null);
  const [terminalError, setTerminalError] = useState<string | null>(null);
  const [terminalOutput, setTerminalOutput] = useState("");

  const [createContainer] = useCreateAndRunContainerMutation();
  const [createTerminalTicket] = useCreateTerminalTicketMutation();
  const [stopContainer] = useStopContainerMutation();

  const stopActiveContainer = useCallback(
    (keepalive = false) => {
      const containerId = activeContainerIdRef.current;
      if (!containerId) return;

      activeContainerIdRef.current = null;
      void stopContainer({ containerId, keepalive });
    },
    [stopContainer],
  );

  useEffect(() => {
    const handlePageHide = () => stopActiveContainer(true);

    window.addEventListener("pagehide", handlePageHide);
    return () => {
      window.removeEventListener("pagehide", handlePageHide);
      stopActiveContainer();
    };
  }, [stopActiveContainer]);

  const closeTerminal = useCallback(() => {
    setTerminalVisible(false);
    setTerminalTicket(null);
    stopActiveContainer();
  }, [stopActiveContainer]);

  const handleRun = useCallback(
    async (files: FileNode[]) => {
      setTerminalVisible(true);
      setStarting(true);
      setTerminalTicket(null);
      setTerminalError(null);
      setTerminalOutput("");
      stopActiveContainer();

      const now = new Date();
      const result = await createContainer({
        project: {
          _id: projectIdRef.current,
          dir: files,
          meta,
          userId,
          createdAt: now,
          updatedAt: now,
        },
        stepId,
      });

      if (result.error) {
        setTerminalError(
          getErrorMessage(result.error, "Не удалось запустить контейнер."),
        );
        setStarting(false);
        return;
      }

      const container = result.data?.data;
      if (!container?.containerId) {
        setTerminalError("Сервер не вернул идентификатор контейнера.");
        setStarting(false);
        return;
      }

      const containerId = container.containerId;
      activeContainerIdRef.current = containerId;
      setTerminalOutput(container.output || "No output available");

      if (!container.requiresInput) {
        setStarting(false);
        return;
      }

      const ticketResult = await createTerminalTicket({ containerId });
      if (ticketResult.error) {
        setTerminalError(
          getErrorMessage(
            ticketResult.error,
            "Не удалось подключить терминал.",
          ),
        );
        stopActiveContainer();
        setStarting(false);
        return;
      }

      const ticket = ticketResult.data?.data?.ticket;
      if (!ticket) {
        setTerminalError("Сервер не выдал временный билет терминала.");
        stopActiveContainer();
        setStarting(false);
        return;
      }

      setTerminalTicket(ticket);
      setStarting(false);
    },
    [
      createContainer,
      createTerminalTicket,
      meta,
      stepId,
      stopActiveContainer,
      userId,
    ],
  );

  return {
    isTerminalVisible,
    isStarting,
    terminalTicket,
    terminalOutput,
    terminalError,
    handleRun,
    closeTerminal,
  };
};
