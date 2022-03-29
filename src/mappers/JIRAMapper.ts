import {
  CommonCommentsModelItem, CommonEpicModel, CommonStoryModel, CommonStoryModelItem, CommonTaskModelItem,
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

function generateEpicId(epicIndex: number) {
  return `${process.env.PRODUCER_BOARD_ID}-${epicIndex + 1000000}`;
}

function buildCustomFieldValues(story: CommonStoryModelItem, epics: CommonEpicModel[]) {
  const result = [];
  if (story.estimate) {
    result.push({
      fieldName: 'Story Points',
      fieldType: 'com.atlassian.jira.plugin.system.customfieldtypes:float',
      value: story.estimate,
    });
  }
  if (story.epicId) {
    result.push({
      fieldName: 'Epic Link',
      fieldType: 'com.pyxis.greenhopper.jira:gh-epic-link',
      value: generateEpicId(epics.findIndex((epic: CommonEpicModel) => epic.id === story.epicId)),
    });
  }
  return result;
}

function mapIssues(stories: CommonStoryModelItem[], epics: CommonEpicModel[]): any {
  const storyStatuses = findAllDestinationValuesUsingRegexMatching(stories, statusMap, 'status');
  const storyTypes = findAllDestinationValuesUsingRegexMatching(stories, typeMap, 'type');

  const issues = stories.map((story: CommonStoryModelItem, storyIndex: number) => ({
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
    customFieldValues: buildCustomFieldValues(story, epics),
  }));
  return issues;
}

function mapEpics(epics: CommonEpicModel[]): any {
  const epicStatuses = findAllDestinationValuesUsingRegexMatching(epics, statusMap, 'status');

  return epics.map((epic: CommonEpicModel, epicIndex: number) => ({
    status: epicStatuses[epicIndex],
    key: generateEpicId(epicIndex),
    issueType: 'Epic',
    created: epic.created,
    updated: epic.updated,
    summary: epic.name,
    externalId: epic.id,
    reporter: epic.author,
    customFieldValues: [
      {
        fieldName: 'Epic Name',
        fieldType: 'com.pyxis.greenhopper.jira:gh-epic-label',
        value: epic.name,
      },
    ],
  }));
}

function mapTasks(stories: CommonStoryModelItem[]): any | string {
  return stories.flatMap((story: CommonStoryModelItem) => story.tasks)
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
    const epics: any[] = mapEpics(data.epics);
    const issues: any[] = mapIssues(data.stories, data.epics);
    const tasks: any[] = mapTasks(data.stories);

    return {
      links: linkSubtasksToParents(data),
      projects: [{
        id: process.env.PRODUCER_BOARD_ID,
        name: data.project.name,
        key: process.env.PRODUCER_BOARD_ID,
        description: fixLinks(data.project.description),
        type: 'software',
        issues: epics.concat(issues.concat(tasks)),
      }],
    };
  }
}
