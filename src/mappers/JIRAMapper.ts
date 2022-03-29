import {
  CommonCommentsModelItem, CommonStoryModel, CommonStoryModelItem, CommonTaskModelItem,
} from '@mappers/CommonModels';
import findAllDestinationValuesUsingRegexMatching from '@mappers/RegexMapperUtils';
import getStatusMap from '@mappers/getStatusMap';
import getTypeMap from '@mappers/getTypeMap';

const typeMap: Record<string, string> = getTypeMap();
const statusMap: Record<string, string> = getStatusMap();

// Ensure [text](url) links are JIRA-formatted
// Images are replaced with links
function fixLinks(text: string) {
  return text?.replace(/!?\[([^\]]+)\]\(([^)]+)\)/ig, '[$1|$2]');
}

function mapIssues(data: CommonStoryModel): any | string {
  const storyStatuses = findAllDestinationValuesUsingRegexMatching(data.stories, statusMap, 'status');
  const storyTypes = findAllDestinationValuesUsingRegexMatching(data.stories, typeMap, 'type');

  return data.stories.map((story: CommonStoryModelItem, storyIndex: number) => ({
    status: storyStatuses[storyIndex],
    reporter: story.reporter,
    issueType: storyTypes[storyIndex],
    created: story.created,
    updated: story.updated,
    // resolution: 'Duplicate', // probably not required
    summary: story.title,
    description: fixLinks(story.description),
    externalId: story.externalId,
    comments: story.comments.map((comment: CommonCommentsModelItem) => ({
      body: fixLinks(comment.body),
      author: comment.author,
      created: comment.created,
    })),
    labels: story.labels,
    customFieldValues: [
      {
        fieldName: 'Story Points',
        fieldType: 'com.atlassian.jira.plugin.system.customfieldtypes:float',
        value: story.estimate,
      },
    ],
  }));
}

function mapTasks(data: CommonStoryModel): any | string {
  return data.stories.flatMap((story: CommonStoryModelItem) => story.tasks)
    .map((task: CommonTaskModelItem) => ({
      status: task.complete ? 'Closed' : 'Open',
      reporter: task.reporter,
      issueType: 'Sub-task',
      created: task.created,
      updated: task.updated,
      summary: task.description,
      externalId: task.id,
    }));
}

function linkSubtasksToParents(data: CommonStoryModel): any[] {
  return data.stories.flatMap((story: CommonStoryModelItem) => story.tasks.map((task: CommonTaskModelItem) => ({
    sourceId: task.id?.toString(),
    destinationId: story.externalId?.toString(),
    name: task.description,
  })));
}

export default class {
  static from(/* data: any */): CommonStoryModel {
    throw new Error('Not implemented');
  }

  static to(data: CommonStoryModel): any | string {
    const tasks: any[] = mapTasks(data);
    const issues: any[] = mapIssues(data);

    return {
      links: linkSubtasksToParents(data),
      projects: [{
        id: process.env.PRODUCER_BOARD_ID,
        name: data.project.name,
        key: process.env.PRODUCER_BOARD_ID,
        description: fixLinks(data.project.description),
        type: 'software',
        issues: issues.concat(tasks),
      }],
    };
  }
}
