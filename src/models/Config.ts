export interface SourceConfig {
  name: string;
  projectId: string;
  maxResults?: number;
  batchSize?: number;
}

export interface DestinationConfig {
  name: string;
  projectId: string;
  boardId?: number;
}

export interface Config {
  source: SourceConfig;
  destination: DestinationConfig;
  statusMap: Record<string, string>;
  issueTypeMap: Record<string, string>;
}
