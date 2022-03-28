import { CommonCommentsModelItem, CommonStoryModel, CommonStoryModelItem } from '@mappers/CommonModels';

// ToDo: remove hard coding
const shortcutToJIRATypes: Record<string, string> = {
  'chore': 'Task',
  'bug': 'Bug',
  'feature': 'Story',
};

//ToDo: create a workflow_state_id to JIRA status mapping

export default class {
  static from(/* data: any */): CommonStoryModel {
    throw new Error('Not implemented');
  }

  static to(data: CommonStoryModel): any | string {
    return {
      projects: [{
        id: process.env.PRODUCER_BOARD_ID,
        name: data.project.name,
        key: process.env.PRODUCER_BOARD_ID,
        description: data.project.description,
        type: 'software',
        issues: data.stories.map((story: CommonStoryModelItem) => ({
          status: story.status,
          reporter: story.reporter,
          // eslint-disable-next-line no-nested-ternary
          issueType: shortcutToJIRATypes[story.type] || 'Story',
          created: story.created,
          updated: story.updated,
          // resolution: 'Duplicate', // probably not required
          summary: story.title,
          externalId: story.externalId,
          comments: story.comments.map((comment: CommonCommentsModelItem) => ({
            body: comment.body,
            author: comment.author,
            created: comment.created,
          })),
        })),
      }],
    };
  }
}
