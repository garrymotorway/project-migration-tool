import { CommonCommentsModelItem, CommonEpicModel, CommonStoryModel } from '@mappers/CommonModels';

function getMemberEmailAddressById(members: any[], id: string) {
  return members
    .find((member: any) => member.id === id)
    ?.profile.email_address;
}

export function getStateNameFromId(workflows: any[], workflowId: number, workflowStateId: number) : string | number {
  const thisWorkflow: any = workflows.find((workflow: any) => workflow.id === workflowId);
  const thisState = thisWorkflow.states.find((state: any) => state.id === workflowStateId) || {};
  return thisState.name || workflowStateId;
}

function cleanText(text: string) {
  return text?.replace(/\[@([^\]]+)\]\(([^)]+)\)/ig, '@$1');
}

function getEpics({ stories, epics, members }: { stories: any[], epics: any[], members: any[] }): CommonEpicModel[] {
  return Array.from(new Set(stories.filter((story: any) => story.epic_id).map((story: any) => story.epic_id)))
    .map((epicId: number) => {
      const epicDetails = epics.find((epic: any) => epic.id === epicId);
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

export function mapComments(comments: any[], members: any[]): CommonCommentsModelItem[] {
  return comments.filter((comment: any) => comment.text).map((comment: any) => ({
    body: cleanText(comment.text),
    author: getMemberEmailAddressById(members, comment.author_id),
    created: comment.created_at,
  }));
}

export class ShortcutMapper {
  static async from(data: any): Promise<CommonStoryModel> {
    return {
      epics: getEpics({ stories: data.stories, members: data.members, epics: data.epics }),
      stories: data.stories.map((item: any) => ({
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
        description: cleanText(item.description),
        estimate: item.estimate,
        labels: item.labels?.map((label: any) => label.name),
        tasks: item.tasks.map((task: any) => ({
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
        description: cleanText(data.group.description),
      },
      sprints: (Array.from(new Set(data.stories
        .filter((story: any) => story.iteration_id)
        .map((story: any) => story.iteration_id))) as number[])
        .map((iterationId: number) => data.sprints.find((sprint: any) => sprint.id === iterationId))
        .map((sprint: any) => ({
          id: sprint.id,
          name: sprint.name,
          start: sprint.start_date,
          end: sprint.end_date,
          completed: !!sprint.end_date,
        })),
    };
  }

  static async to(/* data: CommonStoryModel */): Promise<any> {
    throw new Error('Not implemented');
  }
}
