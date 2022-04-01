export interface Config {
  source: {
    name: string;
    projectId: string;
  };
  destination: {
    name: string;
    projectId: string;
    boardId?: number;
  }
  statusMap: Record<string, string>;
  issueTypeMap: Record<string, string>;
}
