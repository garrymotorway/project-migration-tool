import {
  ShortcutCommentModel, ShortcutEpicModel, ShortcutIterationModel, ShortcutLabelModel, ShortcutMemberModel, ShortcutModel, ShortcutProjectsModel, ShortcutStoryModel, ShortcutTaskModel, ShortcutWorkflowModel, ShortcutWorkflowStateModel,
} from '@/models/ShortcutModels';
import { CommonCommentsModelItem, CommonEpicModel, CommonModel } from '@models/CommonModels';
import { SourceMapper } from './Mapper';

function getMemberEmailAddressById(members: ShortcutMemberModel[], id: string): string {
  return members.find((member: ShortcutMemberModel) => member.id === id)?.profile.email_address || id;
}

export function getStateNameFromId(workflows: ShortcutWorkflowModel[], workflowId: number, workflowStateId: number, blocked: boolean, archived: boolean) : string | number {
  const thisWorkflow = workflows.find((workflow: ShortcutWorkflowModel) => workflow.id === workflowId);
  let thisState = thisWorkflow?.states.find((state: ShortcutWorkflowStateModel) => state.id === workflowStateId)?.name;
  if (blocked) {
    thisState = 'Blocked';
  }
  if (archived) {
    thisState = 'Archived';
  }
  return thisState || workflowStateId;
}

function cleanText(text: string | undefined): string | undefined {
  if (!text) {
    return text;
  }
  return text?.replace(/\[@([^\]]+)\]\(([^)]+)\)/ig, '@$1');
}

function getComponents(projectIds: number[], projects: ShortcutProjectsModel[]): string[] {
  return projects
    .filter((project: ShortcutProjectsModel) => projectIds.find((epicProjectId: number) => epicProjectId === project.id))
    .map((project: ShortcutProjectsModel) => project.name);
}

function getEpics({
  stories, epics, members, projects,
}: { stories: ShortcutStoryModel[], epics: ShortcutEpicModel[], members: ShortcutMemberModel[], projects: ShortcutProjectsModel[] }): CommonEpicModel[] {
  return Array.from(new Set(stories.filter((story: ShortcutStoryModel) => story.epic_id).map((story: ShortcutStoryModel) => story.epic_id)))
    .map((epicId: number) => {
      const epicDetails = epics.find((epic: ShortcutEpicModel) => epic.id === epicId);
      if (!epicDetails) {
        throw new Error(`Could not find epic details for epic with id ${epicId}`);
      }
      return {
        id: epicId,
        name: epicDetails.name,
        author: getMemberEmailAddressById(members, epicDetails.requested_by_id),
        created: epicDetails.created_at,
        updated: epicDetails.updated_at,
        status: epicDetails.state,
        components: getComponents(epicDetails.project_ids, projects),
      };
    });
}

export function mapComments(comments: ShortcutCommentModel[], members: ShortcutMemberModel[]): CommonCommentsModelItem[] {
  return comments.filter((comment: ShortcutCommentModel) => comment.text).map((comment: ShortcutCommentModel) => ({
    body: cleanText(comment.text) || '',
    author: getMemberEmailAddressById(members, comment.author_id),
    created: comment.created_at,
  }));
}

export function getTaskCompleted(taskCompleted: boolean, storyCompleted: boolean): boolean {
  return taskCompleted || storyCompleted;
}

export class ShortcutMapper implements SourceMapper<ShortcutModel> {
  async from(data: ShortcutModel): Promise<CommonModel> {
    return {
      epics: getEpics({
        stories: data.stories, members: data.members, epics: data.epics, projects: data.projects,
      }),
      stories: data.stories.map((story: ShortcutStoryModel) => ({
        externalId: story.id,
        // externalId: item.external_id,
        updated: story.updated_at,
        created: story.created_at,
        reporter: getMemberEmailAddressById(data.members, story.requested_by_id),
        comments: mapComments(story.comments, data.members),
        type: story.story_type,
        // status: item.workflow_state_id,
        status: getStateNameFromId(data.workflows, story.workflow_id, story.workflow_state_id, story.blocked || story.blocker, story.archived),
        title: story.name,
        description: cleanText(story.description) || '',
        estimate: story.estimate,
        labels: story.labels?.map((label: ShortcutLabelModel) => label.name),
        tasks: story.tasks.map((task: ShortcutTaskModel) => ({
          id: task.id,
          complete: getTaskCompleted(task.complete, story.completed),
          created: task.created_at,
          updated: task.updated_at,
          reporter: getMemberEmailAddressById(data.members, task.requested_by_id),
          name: task.description,
          description: task.description,
        })),
        epicId: story.epic_id,
        sprintId: story.iteration_id,
        components: getComponents([story.project_id], data.projects),
      })),
      project: {
        name: data.group.name,
        description: cleanText(data.group.description) || '',
        components: data.projects.map((project: ShortcutProjectsModel) => project.name),
      },
      sprints: (Array.from(new Set(data.stories
        .filter((story: ShortcutStoryModel) => story.iteration_id)
        .map((story: ShortcutStoryModel) => story.iteration_id))) as number[])
        .map((iterationId: number) => data.sprints.find((sprint: ShortcutIterationModel) => sprint.id === iterationId) || iterationId)
        .map((sprint: ShortcutIterationModel | number) => {
          if (typeof sprint === 'number') {
            throw new Error(`Shortcut iteration with id ${sprint} not found. This shouldn't happen, so something must have gone wrong with Shortcut data extract.`);
          }
          return {
            id: sprint.id,
            name: sprint.name,
            start: sprint.start_date,
            end: sprint.end_date,
            completed: !!sprint.end_date,
          };
        }),
    };
  }
}
