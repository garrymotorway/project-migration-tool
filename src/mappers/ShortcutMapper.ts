import { CommonStoryModel } from '@mappers/CommonModels';

function getMemberNameById(members: any[], id: string) {
  return members
    .find((member: any) => member.id === id)
    .profile.name;
}

export default class {
  static from(data: any): CommonStoryModel {
    return {
      stories: data.stories.map((item: any) => ({
        externalId: item.external_id,
        updated: item.updated_at,
        created: item.created_at,
        reporter: getMemberNameById(data.members, item.requested_by_id),
        comments: item.comments.map((comment: any) => ({
          body: comment.text,
          author: getMemberNameById(data.members, comment.author_id),
          created: comment.created_at,
        })),
        type: item.story_type,
        status: item.workflow_state_id,
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
