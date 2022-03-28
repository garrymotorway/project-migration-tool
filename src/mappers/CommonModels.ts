export interface CommonProject {
  name: string;
  description: string;
}

export interface CommonStoryModel {
  stories: CommonStoryModelItem[];
  project: CommonProject;
}

export interface CommonCommentsModelItem {
  body: string;
  author: string;
  created: string;
}

export interface CommonStoryModelItem {
  externalId?: string | number;
  status: string | number;
  type: string;
  title: string;
  comments: CommonCommentsModelItem[];
  updated: string;
  created: string;
  reporter: string;
}
