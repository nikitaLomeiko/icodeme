import { EnvironmentAction, IStateProvider } from "./types";

export function initEnvironment(
  fontSize: number = 12,
  sidebarWidth: number = 300,
): IStateProvider {
  return {
    copied: false,
    fontSize: fontSize,
    previewOpen: false,
    showSearch: false,
    sidebarOpen: true,
    sidebarWidth: sidebarWidth,
  };
}

export function environmentReducer(
  state: IStateProvider,
  action: EnvironmentAction,
): IStateProvider {
  switch (action.type) {
    case "TOGGLE_SIDEBAR": {
      return { ...state, sidebarOpen: !state.sidebarOpen };
    }
    case "TOGGLE_SEARCH": {
      return { ...state, showSearch: !state.showSearch };
    }
    case "TOGGLE_COPIED":
      return { ...state, copied: !state.copied };
    case "TOGGLE_PREVIEW":
      return { ...state, previewOpen: !state.previewOpen };
    case "SET_FONT_SIZE":
      return { ...state, fontSize: action.size };
    case "SET_SIDEBAR_WIDTH":
      return { ...state, sidebarWidth: action.width };
    default:
      return state;
  }
}
