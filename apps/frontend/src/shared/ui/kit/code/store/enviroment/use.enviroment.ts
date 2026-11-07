import { ActionDispatch, useContext, useReducer } from "react";
import { enviromentContext } from "./enviroment.provider";
import { EnviromentAction, IStateProvider } from "./types";
import { enviromentReducer, initEnviroment } from "./enviroment.reducer";

interface UseExplorerReturn extends IStateProvider {
  dispatch: ActionDispatch<[action: EnviromentAction]> | null;
}

export const useEnviroment = (): UseExplorerReturn => {
  const context = useContext(enviromentContext);

  const [enviroment, dispatch] = useReducer(enviromentReducer, null, () =>
    initEnviroment(12, 300),
  );

  if (!context) {
    return {
      ...enviroment,
      dispatch,
    };
  }

  return { ...context.enviroment, dispatch: context.dispatch };
};
