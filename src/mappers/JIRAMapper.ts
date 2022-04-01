import {
  CommonCommentsModelItem, CommonEpicModel, CommonSprintModel, CommonModel, CommonStoryModelItem, CommonTaskModelItem,
} from '@models/CommonModels';
import findAllDestinationValuesUsingRegexMatching from '@mappers/RegexMapperUtils';
import axios from 'axios';
import { DestinationMapper } from './Mapper';

// Ensure [text](url) links are JIRA-formatted
// Images are replaced with links
function fixLinks(text: string) {
  return text?.replace(/!?\[([^\]]+)\]\(([^)]+)\)/ig, '[$1|$2]');
}

export function generateEpicId(epicIndex: number, projectId: string) {
  return `${projectId}-${epicIndex + parseInt(process.env.DEST_SEED || '1000000', 10) + 50000}`;
}

export function generateIssueId(issueIndex: number, projectId: string) {
  return `${projectId}-${issueIndex + parseInt(process.env.DEST_SEED || '1000000', 10) + 100000}`;
}

export function generateTaskId(issueIndex: number, projectId: string) {
  return `${projectId}-${issueIndex + parseInt(process.env.DEST_SEED || '1000000', 10) + 200000}`;
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

function buildCustomFieldValues(story: CommonStoryModelItem, epics: CommonEpicModel[], sprints: CommonSprintModel[], projectId: string, rapidViewId: number) {
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
      value: generateEpicId(+story.epicId, projectId),
    });
  }
  if (story.sprintId) {
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

async function mapIssues(stories: CommonStoryModelItem[], epics: CommonEpicModel[], sprints: CommonSprintModel[], users: any[], statusMap: Record<string, string>, typeMap: Record<string, string>, projectId: string, boardId: number): Promise<any> {
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
    externalId: story.externalId?.toString(),
    comments: story.comments.map((comment: CommonCommentsModelItem) => ({
      body: fixLinks(comment.body),
      author: emailToJiraAccountId(users, comment.author),
      created: comment.created,
    })),
    components: story.components,
    labels: story.labels,
    customFieldValues: buildCustomFieldValues(story, epics, sprints, projectId, boardId),
    key: generateIssueId(parseInt(story?.externalId?.toString() || '0', 10), projectId),
  }));
  return issues;
}

async function mapEpics(epics: CommonEpicModel[], users: any[], statusMap: Record<string, string>, projectId: string): Promise<any> {
  const epicStatuses = findAllDestinationValuesUsingRegexMatching(epics, statusMap, 'status');

  return epics.map((epic: CommonEpicModel, epicIndex: number) => ({
    status: epicStatuses[epicIndex],
    key: generateEpicId(parseInt(epic?.id?.toString() || '0', 10), projectId),
    issueType: 'Epic',
    created: epic.created,
    updated: epic.updated,
    summary: epic.name,
    externalId: epic.id.toString(),
    reporter: emailToJiraAccountId(users, epic.author),
    customFieldValues: [
      {
        fieldName: 'Epic Name',
        fieldType: 'com.pyxis.greenhopper.jira:gh-epic-label',
        value: epic.name,
      },
    ],
    components: epic.components,
  }));
}

const MAX_SUMMARY_LENGTH = 255;
function trimmedSummary(summary: string) {
  return summary.split('\n')[0].replace(new RegExp(`(?<=.{${MAX_SUMMARY_LENGTH - 3},${MAX_SUMMARY_LENGTH - 3}}).*`, ''), '...').replace(/\s+...$/, '...');
  // const regexToFindTheLastSpaceBeforeTheLimitForSummaryAndTrimAllCharactersBeyondIt = new RegExp(`(.{${MAX_SUMMARY_LENGTH},${MAX_SUMMARY_LENGTH}}(?=\\s)|.{1,${MAX_SUMMARY_LENGTH}}(?=\\s)).*`);
  // return summary.split('\n')[0].replace(regexToFindTheLastSpaceBeforeTheLimitForSummaryAndTrimAllCharactersBeyondIt, '$1');
}

async function mapTasks(stories: CommonStoryModelItem[], users: any[], projectId: string): Promise<any | string> {
  return stories.flatMap((story: CommonStoryModelItem) => story.tasks.map((task: CommonTaskModelItem) => ({ story, task })))
    .map(({ task, story }) => ({
      status: task.complete ? 'Done' : 'To Do',
      reporter: emailToJiraAccountId(users, task.reporter),
      issueType: 'Sub-task',
      created: task.created,
      updated: task.updated,
      summary: trimmedSummary(task.name),
      description: task.description,
      externalId: task.id?.toString(),
      key: generateTaskId(parseInt(task?.id?.toString() || '0', 10), projectId),
      components: story.components,
    }));
}

function linkSubtasksToParents(data: CommonModel): any[] {
  return data.stories.flatMap((story: CommonStoryModelItem) => story.tasks.map((task: CommonTaskModelItem) => ({
    sourceId: task.id?.toString(),
    destinationId: story.externalId?.toString(),
    name: trimmedSummary(task.description),
  })));
}

export default class implements DestinationMapper<any> {
  private jiraBoardId: number;

  constructor(private toJIRAStatusMap: Record<string, string>, private toJIRATypeMap: Record<string, string>, private projectId: string, boardId?: number) {
    if (Number.isNaN(boardId) || !boardId || boardId < 1) {
      throw new Error('Could not set Rapid View ID. Ensure destination.boardId is set to an integer value.');
    }
    this.jiraBoardId = boardId;
  }

  get statusMap(): Record<string, string> {
    return this.toJIRAStatusMap;
  }

  async to(data: CommonModel): Promise<any | string> {
    const users: any[] = await getUsers();
    const epics: any[] = await mapEpics(data.epics, users, this.toJIRAStatusMap, this.projectId);
    const issues: any[] = await mapIssues(data.stories, data.epics, data.sprints, users, this.toJIRAStatusMap, this.toJIRATypeMap, this.projectId, this.jiraBoardId);
    const tasks: any[] = await mapTasks(data.stories, users, this.projectId);

    return {
      links: linkSubtasksToParents(data),
      projects: [{
        id: this.projectId,
        name: data.project.name,
        key: this.projectId,
        description: fixLinks(data.project.description),
        type: 'software',
        issues: epics.concat(issues.concat(tasks)),
        components: data.project.components,
      }],
    };
  }
}
