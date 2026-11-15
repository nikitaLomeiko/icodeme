import { fetchBase, IResponse } from "@/shared/api";
import { createApi } from "@reduxjs/toolkit/query/react";
import { IProject } from "../model/types/ide.types";
import { IContainerResponse } from "../model/types/container.types";

export const ideApi = createApi({
  reducerPath: "ideApi",
  baseQuery: fetchBase,
  endpoints: (build) => ({
    createAndRunContainer: build.mutation<
      IResponse<IContainerResponse>,
      { project: IProject; stepId: string }
    >({
      query: ({ project, stepId }) => ({
        url: "ide/docker/run",
        method: "POST",
        body: {
          project,
          stepId,
        },
      }),
    }),
    sendInputToContainer: build.mutation<
      IResponse<IContainerResponse>,
      { containerId: string; input: string }
    >({
      query: ({ containerId, input }) => ({
        url: "ide/docker/send",
        method: "POST",
        body: { containerId, input },
      }),
    }),
    createTerminalTicket: build.mutation<
      IResponse<{ ticket: string }>,
      { containerId: string }
    >({
      query: ({ containerId }) => ({
        url: "ide/docker/terminal-ticket",
        method: "POST",
        body: { containerId },
      }),
    }),
    stopContainer: build.mutation<
      IResponse<void>,
      { containerId: string; keepalive?: boolean }
    >({
      query: ({ containerId, keepalive }) => ({
        url: "ide/docker/stop",
        method: "POST",
        body: { containerId },
        keepalive,
      }),
    }),
  }),
});

export const {
  useCreateAndRunContainerMutation,
  useSendInputToContainerMutation,
  useCreateTerminalTicketMutation,
  useStopContainerMutation,
} = ideApi;
