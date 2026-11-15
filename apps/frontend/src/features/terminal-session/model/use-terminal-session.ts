"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import {
  useCreateAndRunContainerMutation,
  useCreateTerminalTicketMutation,
  useStopContainerMutation,
} from "@/entities/ide";
import type { IStep, IStudy } from "@/entities/study";
import { isApiError } from "@/shared/api";
import { generateId } from "@/shared/lib";

interface UseTerminalSessionParams {
  step?: IStep;
  study?: IStudy;
}

const getMutationErrorMessage = (error: unknown, fallback: string) =>
  isApiError(error) ? error.data.message : fallback;

export function useTerminalSession({ step, study }: UseTerminalSessionParams) {
  const projectIdRef = useRef(generateId());
  const containerIdRef = useRef<string | null>(null);
  const startedRuntimeRef = useRef<string | null>(null);
  const attemptRef = useRef(0);
  const [retryCount, setRetryCount] = useState(0);
  const [containerId, setContainerId] = useState<string | null>(null);
  const [terminalTicket, setTerminalTicket] = useState<string | null>(null);
  const [terminalError, setTerminalError] = useState<string | null>(null);
  const [isStarting, setIsStarting] = useState(false);
  const [createContainer] = useCreateAndRunContainerMutation();
  const [createTerminalTicket] = useCreateTerminalTicketMutation();
  const [stopContainer] = useStopContainerMutation();

  const updateContainerId = useCallback((id: string | null) => {
    containerIdRef.current = id;
    setContainerId(id);
  }, []);

  useEffect(() => {
    if (!study || step?.type !== "terminal" || !step.id) return;

    const runtimeId = `${study._id}:${step.id}`;
    if (startedRuntimeRef.current === runtimeId) return;
    startedRuntimeRef.current = runtimeId;
    const attempt = ++attemptRef.current;

    const previousContainerId = containerIdRef.current;
    if (previousContainerId) {
      containerIdRef.current = null;
      void stopContainer({ containerId: previousContainerId });
    }
    setContainerId(null);
    setTerminalTicket(null);
    setTerminalError(null);
    setIsStarting(true);

    void createContainer({
      project: {
        _id: projectIdRef.current,
        userId: study.userId,
        meta: {
          name:
            step.settings?.initProject?.name ??
            `terminal-${study._id}-${step.id}`,
          title: step.settings?.initProject?.title ?? step.title,
          subtitle:
            step.settings?.initProject?.subtitle ?? step.description ?? "",
          language: step.settings?.language ?? "bash",
        },
        dir: [],
        createdAt: new Date(),
        updatedAt: new Date(),
      },
      stepId: step.id,
    })
      .then(async (result) => {
        if (attemptRef.current !== attempt) {
          if (result.data?.data?.containerId)
            void stopContainer({ containerId: result.data.data.containerId });
          return;
        }
        if (result.error) {
          setTerminalError(
            getMutationErrorMessage(
              result.error,
              "Не удалось запустить Linux-контейнер.",
            ),
          );
          return;
        }

        const runtime = result.data?.data;
        if (!runtime?.containerId) {
          setTerminalError("Сервер не вернул идентификатор контейнера.");
          return;
        }
        if (startedRuntimeRef.current !== runtimeId) {
          void stopContainer({ containerId: runtime.containerId });
          return;
        }

        updateContainerId(runtime.containerId);
        const ticketResult = await createTerminalTicket({
          containerId: runtime.containerId,
        });
        if (attemptRef.current !== attempt) {
          void stopContainer({ containerId: runtime.containerId });
          return;
        }
        if (ticketResult.error) {
          setTerminalError(
            getMutationErrorMessage(
              ticketResult.error,
              "Не удалось подключить терминал.",
            ),
          );
          await stopContainer({ containerId: runtime.containerId });
          updateContainerId(null);
          return;
        }

        const ticket = ticketResult.data?.data?.ticket;
        if (!ticket) {
          setTerminalError("Сервер не выдал временный билет терминала.");
          await stopContainer({ containerId: runtime.containerId });
          updateContainerId(null);
          return;
        }
        setTerminalTicket(ticket);
      })
      .catch((cause: unknown) => {
        if (attemptRef.current === attempt)
          setTerminalError(
            cause instanceof Error
              ? cause.message
              : "Не удалось запустить Linux-контейнер.",
          );
      })
      .finally(() => {
        if (attemptRef.current === attempt) setIsStarting(false);
      });
  }, [
    createContainer,
    createTerminalTicket,
    step,
    stopContainer,
    study,
    updateContainerId,
    retryCount,
  ]);

  const retry = useCallback(() => {
    attemptRef.current += 1;
    startedRuntimeRef.current = null;
    setRetryCount((count) => count + 1);
  }, []);

  useEffect(() => {
    const stopActiveContainer = () => {
      const currentId = containerIdRef.current;
      if (!currentId) return;
      containerIdRef.current = null;
      void stopContainer({ containerId: currentId, keepalive: true });
    };

    window.addEventListener("pagehide", stopActiveContainer);
    return () => {
      attemptRef.current += 1;
      window.removeEventListener("pagehide", stopActiveContainer);
      const currentId = containerIdRef.current;
      if (!currentId) return;
      containerIdRef.current = null;
      void stopContainer({ containerId: currentId });
    };
  }, [stopContainer]);

  return { containerId, isStarting, terminalError, terminalTicket, retry };
}
