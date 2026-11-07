export type EnviromentAction =
  | { type: "TOGGLE_SIDEBAR" }
  | { type: "SET_SIDEBAR_WIDTH"; width: number }
  | { type: "SET_FONT_SIZE"; size: number }
  | { type: "TOGGLE_SEARCH" }
  | { type: "TOGGLE_COPIED" }
  | { type: "TOGGLE_PREVIEW" };

export interface IStateProvider {
  sidebarOpen: boolean;
  sidebarWidth: number;
  fontSize: number;
  showSearch: boolean;
  copied: boolean;
  previewOpen: boolean;
}
