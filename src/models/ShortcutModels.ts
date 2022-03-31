export interface ShortcutTaskModel {
  id: number;
  complete: boolean;
  created_at: string;
  updated_at: string;
  requested_by_id: string;
  description: string;
}

export interface ShortcutStoryModel {
  id: string;
  updated_at: string;
  created_at: string;
  comments: ShortcutCommentModel[];
  story_type: string;
  name: string;
  description: string;
  estimate?: number;
  labels: ShortcutLabelModel[];
  tasks: ShortcutTaskModel[];
  workflow_id: number;
  requested_by_id: string;
  workflow_state_id: number;
  epic_id: number;
  iteration_id: number;
  archived: boolean;
  blocked: boolean;
  blocker: boolean;
}

export interface ShortcutLabelModel {
  name: string;
}

export interface ShortcutCommentModel {
  text?: string;
  author_id: string;
  created_at: string;
}

export interface ShortcutEpicModel {
  id: number;
  name: string;
  requested_by_id: string;
  created_at: string;
  updated_at: string;
  state: string;
}

export interface ShortcutMemberModel {
  id: string;
  profile: {
    email_address: string;
  }
}

export interface ShortcutIterationModel {
  end_date: string;
  start_date: string;
  name: string;
  id: number;
}

export interface ShortcutWorkflowModel {
  id: number;
  states: ShortcutWorkflowStateModel[];
}

export interface ShortcutWorkflowStateModel {
  id: number;
  name: string;
}

export interface ShortcutGroup {
  name: string;
  description: string;

}

export interface ShortcutModel {
  sprints: ShortcutIterationModel[];
  group: ShortcutGroup;
  members: ShortcutMemberModel[];
  epics: ShortcutEpicModel[];
  stories: ShortcutStoryModel[];
  workflows: ShortcutWorkflowModel[];
}
