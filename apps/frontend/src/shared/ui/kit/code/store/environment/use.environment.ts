import { ActionDispatch, useContext, useReducer } from "react";
import { environmentContext } from "./environment.provider";
import { EnvironmentAction, IStateProvider } from "./types";
import { environmentReducer, initEnvironment } from "./environment.reducer";

interface UseExplorerReturn extends IStateProvider {
  dispatch: ActionDispatch<[action: EnvironmentAction]> | null;
}

export const useEnvironment = (): UseExplorerReturn => {
  const context = useContext(environmentContext);

  const [environment, dispatch] = useReducer(environmentReducer, null, () =>
    initEnvironment(12, 300),
  );

  if (!context) {
    return {
      ...environment,
      dispatch,
    };
  }

  return { ...context.environment, dispatch: context.dispatch };
};
