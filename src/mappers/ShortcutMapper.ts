import { CommonStoryModel } from '@mappers/CommonModels';

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

export class ShortcutMapper {
  static from(data: any): CommonStoryModel {
    return {
      stories: data.stories.map((item: any) => ({
        externalId: item.id,
        // externalId: item.external_id,
        updated: item.updated_at,
        created: item.created_at,
        reporter: getMemberEmailAddressById(data.members, item.requested_by_id),
        comments: item.comments.map((comment: any) => ({
          body: comment.text,
          author: getMemberEmailAddressById(data.members, comment.author_id),
          created: comment.created_at,
        })),
        type: item.story_type,
        // status: item.workflow_state_id,
        status: getStateNameFromId(data.workflows, item.workflow_id, item.workflow_state_id),
        title: item.name,
        description: item.description,
      })),
      project: {
        name: data.group.name,
        description: data.group.description,
      },
    };
  }

  static to(/* data: CommonStoryModel */): any {
    throw new Error('Not implemented');
  }
}
