import { ActionDispatch, createContext, useReducer } from "react";
import { environmentReducer, initEnvironment } from "./environment.reducer";
import { EnvironmentAction, IStateProvider } from "./types";

interface UseEnvironmentReturn {
  environment: IStateProvider;
  dispatch: ActionDispatch<[action: EnvironmentAction]>;
}

interface IProps {
  children: React.ReactNode;
  fontSize?: number;
  sidebarWidth?: number;
}

export const environmentContext = createContext<UseEnvironmentReturn | null>(
  null,
);

export const EnvironmentProvider: React.FC<IProps> = (props) => {
  const { children, fontSize, sidebarWidth } = props;

  const [environment, dispatch] = useReducer(environmentReducer, null, () =>
    initEnvironment(fontSize, sidebarWidth),
  );

  return (
    <environmentContext.Provider value={{ environment, dispatch }}>
      {children}
    </environmentContext.Provider>
  );
};
