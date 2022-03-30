export interface CommonProject {
  name: string;
  description: string;
}

export interface CommonStoryModel {
  stories: CommonStoryModelItem[];
  project: CommonProject;
  epics: CommonEpicModel[];
  sprints: CommonSprintModel[];
}

export interface CommonCommentsModelItem {
  body: string;
  author: string;
  created: string;
}

export interface CommonTaskModelItem {
  id?: string | number;
  complete: boolean;
  created: string;
  updated: string;
  reporter: string;
  description: string;
}

export interface CommonStoryModelItem {
  externalId?: string | number;
  status: string | number;
  type: string;
  title: string;
  description: string;
  comments: CommonCommentsModelItem[];
  tasks: CommonTaskModelItem[];
  updated: string;
  created: string;
  reporter: string;
  estimate?: number;
  labels: string[];
  epicId?: string | number;
  sprintId?: string | number;
}

export interface CommonEpicModel {
  id: string | number;
  name: string;
  author: string;
  created: string;
  updated: string;
  status: string | number;
}

export interface CommonSprintModel {
  id: string | number;
  name: string;
  start: string;
  end?: string;
  completed: boolean;
}
