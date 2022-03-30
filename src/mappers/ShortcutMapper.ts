import {
  ShortcutCommentModel, ShortcutEpicModel, ShortcutIterationModel, ShortcutLabelModel, ShortcutMemberModel, ShortcutModel, ShortcutStoryModel, ShortcutTaskModel, ShortcutWorkflowModel, ShortcutWorkflowStateModel,
} from '@/models/ShortcutModels';
import { CommonCommentsModelItem, CommonEpicModel, CommonStoryModel } from '@models/CommonModels';

function getMemberEmailAddressById(members: ShortcutMemberModel[], id: string): string {
  return members.find((member: ShortcutMemberModel) => member.id === id)?.profile.email_address || id;
}

export function getStateNameFromId(workflows: ShortcutWorkflowModel[], workflowId: number, workflowStateId: number) : string | number {
  const thisWorkflow = workflows.find((workflow: ShortcutWorkflowModel) => workflow.id === workflowId);
  const thisState = thisWorkflow?.states.find((state: ShortcutWorkflowStateModel) => state.id === workflowStateId);
  return thisState?.name || workflowStateId;
}

function cleanText(text: string | undefined): string | undefined {
  if (!text) {
    return text;
  }
  return text?.replace(/\[@([^\]]+)\]\(([^)]+)\)/ig, '@$1');
}

function getEpics({ stories, epics, members }: { stories: ShortcutStoryModel[], epics: ShortcutEpicModel[], members: ShortcutMemberModel[] }): CommonEpicModel[] {
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

export class ShortcutMapper {
  static async from(data: ShortcutModel): Promise<CommonStoryModel> {
    return {
      epics: getEpics({ stories: data.stories, members: data.members, epics: data.epics }),
      stories: data.stories.map((item: ShortcutStoryModel) => ({
        externalId: item.id,
        // externalId: item.external_id,
        updated: item.updated_at,
        created: item.created_at,
        reporter: getMemberEmailAddressById(data.members, item.requested_by_id),
        comments: mapComments(item.comments, data.members),
        type: item.story_type,
        // status: item.workflow_state_id,
        status: getStateNameFromId(data.workflows, item.workflow_id, item.workflow_state_id),
        title: item.name,
        description: cleanText(item.description) || '',
        estimate: item.estimate,
        labels: item.labels?.map((label: ShortcutLabelModel) => label.name),
        tasks: item.tasks.map((task: ShortcutTaskModel) => ({
          id: task.id,
          complete: task.complete,
          created: task.created_at,
          updated: task.updated_at,
          reporter: getMemberEmailAddressById(data.members, task.requested_by_id),
          name: task.description,
          description: task.description,
        })),
        epicId: item.epic_id,
        sprintId: item.iteration_id,
      })),
      project: {
        name: data.group.name,
        description: cleanText(data.group.description) || '',
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

  static async to(/* data: CommonStoryModel */): Promise<any> {
    throw new Error('Not implemented');
  }
}
