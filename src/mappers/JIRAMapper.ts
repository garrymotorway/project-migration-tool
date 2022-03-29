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

  'Backlog': 'To Do', // Backlog
  'Ready for Development': 'To Do', // Ready for development
  'Blocked': 'BLOCKED', // Blocked
  'In Development': 'In Progress', // In Development
  'Code Review': 'PEER REVIEW', // Code Review
  '.*QA.*': 'TESTING', // Product Review\/QA'
  '.*Merged.*': 'MERGED', // "Ready To Ship\/Merged",
  '.*Shipped.*': 'SHIPPED', // 500000011
  'Ready to Start': 'To Do', // Ready to start
  'In Progress': 'In Progress', // In Progress
  'Peer Review': 'PEER REVIEW', // Peer Review
  'Testing': 'TESTING', // Testing
  'Done': 'Closed', // Done
};

interface MatchResult {
  match: string | undefined;
  nomatch: string | undefined;
}

const findSingleDestinationValueUsingRegexMatching = (map: any, searchFor: string): MatchResult => {
  const match = Object.keys(map).find((key: string) => new RegExp(key, 'i').test(searchFor));
  return {
    match,
    nomatch: match ? undefined : searchFor,
  };
};

const checkMappingIsPossible = (matchResults: MatchResult[], errorMessageHandler: (t: string) => string) => {
  const badItems: any[] = matchResults
    .filter((typeMatchResult: MatchResult) => typeMatchResult.nomatch)
    .map((typeMatchResult: MatchResult) => typeMatchResult.nomatch);
  if (badItems.length) {
    throw new Error(errorMessageHandler(JSON.stringify(badItems)));
  }
};

const findAllDestinationValuesUsingRegexMatching = (stories: any[], map: Record<string, string>, storyItemKey: string): string[] => {
  const storyTypeMatchResults: MatchResult[] = stories.map((story: any) => findSingleDestinationValueUsingRegexMatching(map, story[storyItemKey]));
  checkMappingIsPossible(storyTypeMatchResults, (badTypes: string) => `Could not map the ${storyItemKey}(es) ${badTypes}`);
  return storyTypeMatchResults.map((s: MatchResult) => map[s.match as string]);
};

export default class {
  static from(/* data: any */): CommonStoryModel {
    throw new Error('Not implemented');
  }

  static to(data: CommonStoryModel): any | string {
    const storyStatuses = findAllDestinationValuesUsingRegexMatching(data.stories, shortcutToJIRAStatuses, 'status');
    const storyTypes = findAllDestinationValuesUsingRegexMatching(data.stories, shortcutToJIRATypes, 'type');

    return {
      projects: [{
        id: process.env.PRODUCER_BOARD_ID,
        name: data.project.name,
        key: process.env.PRODUCER_BOARD_ID,
        description: data.project.description,
        type: 'software',
        issues: data.stories.map((story: CommonStoryModelItem, storyIndex: number) => ({
          status: storyStatuses[storyIndex],
          reporter: story.reporter,
          issueType: storyTypes[storyIndex],
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
