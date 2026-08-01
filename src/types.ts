export interface Workspace {
  id: string;
  name: string;
  buttons: string[];
}

export interface AppState {
  workspaces: Workspace[];
  activeWorkspaceId: string;
  totalSum: number;
  pressCount: number;
  lastPressTime: number | null;
  lastPressValue: number | null;
}
