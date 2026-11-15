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
  const attemptRef = useRef(0);
  const latestInputRef = useRef({ step, study });
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

  const runtimeId =
    study && step?.type === "terminal" && step.id
      ? `${study._id}:${step.id}`
      : null;

  useEffect(() => {
    latestInputRef.current = { step, study };
  }, [step, study]);

  useEffect(() => {
    if (!runtimeId) return;
    const attempt = ++attemptRef.current;
    const isCurrent = () => attemptRef.current === attempt;

    // Strict Mode mounts, cleans up, and mounts effects again in development.
    // Defer the request so the first setup can be cancelled before it starts.
    const launchTimer = window.setTimeout(() => {
      if (!isCurrent()) return;
      const { study, step } = latestInputRef.current;
      if (!study || !step?.id || `${study._id}:${step.id}` !== runtimeId)
        return;
      setContainerId(null);
      setTerminalTicket(null);
      setTerminalError(null);
      setIsStarting(true);
      const now = new Date();
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
          createdAt: now,
          updatedAt: now,
        },
        stepId: step.id,
      })
        .then(async (result) => {
          if (!isCurrent()) {
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
          updateContainerId(runtime.containerId);
          const ticketResult = await createTerminalTicket({
            containerId: runtime.containerId,
          });
          if (!isCurrent()) {
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
          if (isCurrent())
            setTerminalError(
              cause instanceof Error
                ? cause.message
                : "Не удалось запустить Linux-контейнер.",
            );
        })
        .finally(() => {
          if (isCurrent()) setIsStarting(false);
        });
    }, 0);

    return () => {
      window.clearTimeout(launchTimer);
      attemptRef.current += 1;
      const currentId = containerIdRef.current;
      if (!currentId) return;
      containerIdRef.current = null;
      void stopContainer({ containerId: currentId });
    };
  }, [
    createContainer,
    createTerminalTicket,
    stopContainer,
    runtimeId,
    updateContainerId,
    retryCount,
  ]);

  const retry = useCallback(() => {
    setRetryCount((count) => count + 1);
  }, []);

  useEffect(() => {
    const stopActiveContainer = () => {
      attemptRef.current += 1;
      const currentId = containerIdRef.current;
      if (!currentId) return;
      containerIdRef.current = null;
      void stopContainer({ containerId: currentId, keepalive: true });
    };

    window.addEventListener("pagehide", stopActiveContainer);
    return () => {
      window.removeEventListener("pagehide", stopActiveContainer);
    };
  }, [stopContainer]);

  return { containerId, isStarting, terminalError, terminalTicket, retry };
}
