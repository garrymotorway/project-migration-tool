import {
  CommonCommentsModelItem, CommonEpicModel, CommonSprintModel, CommonStoryModel, CommonStoryModelItem, CommonTaskModelItem,
} from '@mappers/CommonModels';
import findAllDestinationValuesUsingRegexMatching from '@mappers/RegexMapperUtils';
import getStatusMap from '@mappers/getStatusMap';
import getTypeMap from '@mappers/getTypeMap';
import axios from 'axios';

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

export function getSprintStatus(sprint: CommonSprintModel) {
  if (sprint.completed || (sprint.end && new Date(sprint.end) < new Date())) {
    return 'CLOSED';
  }
  if (sprint.start && new Date(sprint.start) > new Date()) {
    return 'FUTURE';
  }
  return 'ACTIVE';
}

async function getUsers() : Promise<any[]> {
  return (await axios.get('https://motorway.atlassian.net/rest/api/3/users/search?&includeInactive=true', {
    headers: {
      'Authorization': `Basic ${process.env.PRODUCER_TOKEN}`,
    },
  })).data;
}

function emailToJiraAccountId(users: any[], email: string) {
  const locatedUser = users.find((user: any) => user.emailAddress === email) || users.find((user: any) => user.emailAddress === process.env.DEFAULT_REPORTER);
  return (locatedUser && locatedUser.accountId) || email;
}

function buildCustomFieldValues(story: CommonStoryModelItem, epics: CommonEpicModel[], sprints: CommonSprintModel[]) {
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
  if (story.sprintId) {
    const rapidViewId = parseInt(process.env.PRODUCER_BOARD_RAPID_VIEW_ID || '0', 10);
    if (Number.isNaN(rapidViewId) || rapidViewId < 1) {
      throw new Error('Could not set rapidViewId. Ensure environment variable PRODUCER_BOARD_RAPID_VIEW_ID is set to an integer value.');
    }
    const thisSprint = sprints.find((sprint: CommonSprintModel) => sprint.id === story.sprintId);
    if (!thisSprint) {
      throw new Error(`Could not find sprint data for sprint id ${story.sprintId}`);
    }
    result.push({
      fieldName: 'Sprint',
      fieldType: 'com.pyxis.greenhopper.jira:gh-sprint',
      value: [
        {
          rapidViewId,
          state: getSprintStatus(thisSprint),
          startDate: thisSprint.start,
          endDate: thisSprint.end,
          completeDate: thisSprint.end || undefined,
          name: thisSprint.name,
        },
      ],
    });
  }
  // ToDo try adding sprint
  return result;
}

async function mapIssues(stories: CommonStoryModelItem[], epics: CommonEpicModel[], sprints: CommonSprintModel[], users: any[]): Promise<any> {
  const storyStatuses = findAllDestinationValuesUsingRegexMatching(stories, statusMap, 'status');
  const storyTypes = findAllDestinationValuesUsingRegexMatching(stories, typeMap, 'type');

  const issues = stories.map((story: CommonStoryModelItem, storyIndex: number) => ({
    status: storyStatuses[storyIndex],
    reporter: emailToJiraAccountId(users, story.reporter),
    issueType: storyTypes[storyIndex],
    created: story.created,
    updated: story.updated,
    // resolution: 'Duplicate', // probably not required
    summary: story.title,
    description: fixLinks(story.description),
    externalId: story.externalId,
    comments: story.comments.map((comment: CommonCommentsModelItem) => ({
      body: fixLinks(comment.body),
      author: emailToJiraAccountId(users, comment.author),
      created: comment.created,
    })),
    labels: story.labels,
    customFieldValues: buildCustomFieldValues(story, epics, sprints),
  }));
  return issues;
}

async function mapEpics(epics: CommonEpicModel[], users: any[]): Promise<any> {
  const epicStatuses = findAllDestinationValuesUsingRegexMatching(epics, statusMap, 'status');

  return epics.map((epic: CommonEpicModel, epicIndex: number) => ({
    status: epicStatuses[epicIndex],
    key: generateEpicId(epicIndex),
    issueType: 'Epic',
    created: epic.created,
    updated: epic.updated,
    summary: epic.name,
    externalId: epic.id,
    reporter: emailToJiraAccountId(users, epic.author),
    customFieldValues: [
      {
        fieldName: 'Epic Name',
        fieldType: 'com.pyxis.greenhopper.jira:gh-epic-label',
        value: epic.name,
      },
    ],
  }));
}

async function mapTasks(stories: CommonStoryModelItem[], users: any[]): Promise<any | string> {
  return stories.flatMap((story: CommonStoryModelItem) => story.tasks)
    .map((task: CommonTaskModelItem) => ({
      status: task.complete ? 'Closed' : 'Open',
      reporter: emailToJiraAccountId(users, task.reporter),
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
  static async from(/* data: any */): Promise<CommonStoryModel> {
    throw new Error('Not implemented');
  }

  static async to(data: CommonStoryModel): Promise<any | string> {
    const users: any[] = await getUsers();
    const epics: any[] = await mapEpics(data.epics, users);
    const issues: any[] = await mapIssues(data.stories, data.epics, data.sprints, users);
    const tasks: any[] = await mapTasks(data.stories, users);

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
      /*
      // Hack; if JIRA bulk upload doesn't support sprint import
      // Use to generate curls to create sprints in advance
      sprints: data.sprints.map((sprint: CommonSprintModel) => ({
        'startDate': sprint.start,
        'name': sprint.name,
        'endDate': sprint.end,
        'originBoardId': process.env.PRODUCER_BOARD_ID,
      })),
      */
    };
  }
}
