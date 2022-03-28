import { CommonCommentsModelItem, CommonStoryModel, CommonStoryModelItem } from '@mappers/CommonModels';

// ToDo: remove hard coding
const shortcutToJIRATypes: Record<string, string> = {
  'chore': 'Task',
  'bug': 'Bug',
  'feature': 'Story',
};

// ToDo: create a workflow_state_id to JIRA status mapping
// Maps a workflow state Id to a JIRA status
const shortcutToJIRAStatuses: Record<string, string> = {
  500000008: 'To Do', // Backlog
  500000007: 'To Do', // Ready for development
  500075423: 'BLOCKED', // Blocked
  500000006: 'In Progress', // In Development
  500000010: 'PEER REVIEW', // Code Review
  500001991: 'TESTING', // Product Review\/QA'
  500000009: 'MERGED', // "Ready To Ship\/Merged",
  500000011: 'SHIPPED', // 500000011
  500090971: 'To Do', // Backlog
  500090972: 'To Do', // Ready to start
  500090977: 'BLOCKED', // Blocked
  500090973: 'In Progress', // In Progress
  500090974: 'PEER REVIEW', // Peer Review
  500090975: 'TESTING', // Testing
  500090978: 'Closed', // Done
  500090979: 'MERGED', // Merged
  500090976: 'SHIPPED', // Shipped
};

function ensureAllStatusesCanBeMapped(stories: CommonStoryModelItem[]) {
  const badStatuses: CommonStoryModelItem[] = stories.filter((story: CommonStoryModelItem) => !shortcutToJIRAStatuses[story.status]);
  if (badStatuses.length) {
    throw new Error(`Could not map the status(es) ${JSON.stringify(badStatuses)}`);
  }
}

export default class {
  static from(/* data: any */): CommonStoryModel {
    throw new Error('Not implemented');
  }

  static to(data: CommonStoryModel): any | string {
    ensureAllStatusesCanBeMapped(data.stories);

    return {
      projects: [{
        id: process.env.PRODUCER_BOARD_ID,
        name: data.project.name,
        key: process.env.PRODUCER_BOARD_ID,
        description: data.project.description,
        type: 'software',
        issues: data.stories.map((story: CommonStoryModelItem) => ({
          status: shortcutToJIRAStatuses[story.status] || '?? UNKNOWN ??',
          reporter: story.reporter,
          // eslint-disable-next-line no-nested-ternary
          issueType: shortcutToJIRATypes[story.type] || 'Story',
          created: story.created,
          updated: story.updated,
          // resolution: 'Duplicate', // probably not required
          summary: story.title,
          description: story.description,
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
