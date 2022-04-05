import JIRAMapper, {
  getSprintStatus, generateEpicId, mapTasks, generateIssueId, generateTaskId,
} from '@mappers/JIRAMapper';
import { CommonModel, CommonSprintModel, CommonStoryModelItem } from '@models/CommonModels';
import axios, { AxiosRequestConfig } from 'axios';

jest.mock('axios');
jest.mock('@mappers/SeedUtils', () => ({ getDestSeed: () => 100000 }));

const projectId = 'HOTT';
const boardId = 99;

(axios.get as unknown as jest.Mock).mockImplementation(async (url: string, requestConfig: AxiosRequestConfig) => {
  if (requestConfig.headers?.Authorization !== `Basic ${process.env.PRODUCER_TOKEN}`) {
    throw new Error('Mock threw simulated 401. Token not provided in request');
  }
  if (url === 'https://motorway.atlassian.net/rest/api/3/users/search?&includeInactive=true') {
    return {
      data: [
        { emailAddress: 'luke.skywalker@motorway.co.uk', accountId: 'abc123' },
        { emailAddress: 'john.doe@motorway.co.uk', accountId: 'abc456' },
      ],
    };
  }

  throw new Error(`No mock for URL ${url}`);
});

const data: CommonModel = {
  stories: [{
    externalId: '123',
    status: 'Has been mergeD',
    title: 'Some title',
    description: 'A description with a [link](http://google.com) with screenshot ![Screenshot 2022-03-21 at 14.25.43.png](https://media.app.shortcut.com/api/attachments/files/clubhouse-assets/file.png).',
    comments: [
      {
        body: '[@huwrose](shortcutapp://members/5dc00b1d-aa52-4a44-a0d9-4182ef9f9be6) hello and you [@john](shortcutapp://members/5dc00b1d-aa52-4a44-a0d9-4182ef9f9be7) how are you. Also [@johnSmith](shortcutapp://members/5dc00b1d-aa52-4a44-a0d9-4182ef9f9be8)',
        author: 'luke.skywalker@motorway.co.uk',
        created: '2022-03-22T09:19:57Z',
      },
    ],
    updated: '2022-03-22T09:19:57Z',
    created: '2022-03-21T09:19:57Z',
    reporter: 'John Smith',
    type: 'chore',
    estimate: 5,
    labels: ['mvp'],
    tasks: [{
      id: 1234,
      complete: false,
      created: '2022-03-21T09:19:57Z',
      updated: '2022-03-21T09:19:57Z',
      reporter: 'john.doe@motorway.co.uk',
      name: 'This is a task with a really really really really really really really really really really really really really really really really really really really really really really really really really really really really really really really very really really really really really really really really really really really really\nlong name',
      description: 'This is a task\nwith a second line',
    }],
    epicId: '78393',
    sprintId: 12345,
    components: ['Frontend', 'Phone'],
  }],
  project: {
    name: 'Project Name',
    description: 'Project description with a [link](http://google.com).',
    components: ['Backend', 'Frontend', 'Phone'],
  },
  epics: [
    {
      id: '78393',
      name: 'my epic',
      author: 'john.doe@motorway.co.uk',
      created: '2022-03-21T12:39:57Z',
      updated: '2022-03-21T12:39:57Z',
      status: 'to do',
      components: ['Backend'],
    },
  ],
  sprints: [
    {
      id: 12345,
      name: 'Sprint 12',
      start: '2022-01-01',
      end: '2022-01-15',
      completed: true,
    },
  ],
};

let mappedData: any;
let epic: any;
let story: any;
let task: any;
let link: any;

beforeAll(async () => {
  mappedData = await new JIRAMapper({
    '.*merGeD.*': 'MERGED',
    '.*': 'To Do',
  }, {
    'chore': 'Task',
    'bug': 'Bug',
    'feature': 'Story',
  }, projectId, boardId).to(data);
  [epic, story, task] = mappedData.projects[0].issues;
  [link] = mappedData.links;
});

test('Maps project external ID', () => {
  expect(mappedData.projects[0].id).toEqual(projectId);
});

test('Maps project key', () => {
  expect(mappedData.projects[0].key).toEqual(projectId);
});

test('Maps project name', () => {
  expect(mappedData.projects[0].name).toEqual(data.project.name);
});

test('Maps project description', () => {
  expect(mappedData.projects[0].description).toEqual('Project description with a [link|http://google.com].');
});

test('Maps project components', () => {
  expect(mappedData.projects[0].components).toEqual(data.project.components);
});

test('Maps story title to issue title', () => {
  expect(story.summary).toEqual(data.stories[0].title);
});

test('Maps story components to issue components', () => {
  expect(story.components).toEqual(data.stories[0].components);
});

test('Maps story estimate', () => {
  expect(story.customFieldValues[0].value).toEqual(data.stories[0].estimate);
});

test('Maps story labels', () => {
  expect(story.labels).toBeDefined();
  expect(story.labels).toHaveLength(1);
  expect(story.labels[0]).toEqual(data.stories[0].labels[0]);
});

test('Maps story description to issue description', () => {
  expect(story.description).toEqual('A description with a [link|http://google.com] with screenshot [Screenshot 2022-03-21 at 14.25.43.png|https://media.app.shortcut.com/api/attachments/files/clubhouse-assets/file.png].');
});

test('Maps story external ID to issue external ID', () => {
  expect(story.externalId).toEqual(data.stories[0].externalId);
});

test('Maps story reporter', () => {
  expect(story.reporter).toEqual(data.stories[0].reporter);
});

test('Maps story status', () => {
  expect(story.status).toEqual('MERGED');
});

test('Maps story points', () => {
  const customFieldValue: any = story.customFieldValues.find((item: any) => item.fieldName === 'Story Points');
  expect(customFieldValue).toBeDefined();
  expect(customFieldValue.fieldName).toEqual('Story Points');
  expect(customFieldValue.fieldType).toEqual('com.atlassian.jira.plugin.system.customfieldtypes:float');
  expect(customFieldValue.value).toEqual(5);
});

test('Maps comments', () => {
  expect(story.comments).toBeDefined();
  expect(story.comments[0]).toBeDefined();
  expect(story.comments[0]).toEqual({
    body: '[@huwrose|shortcutapp://members/5dc00b1d-aa52-4a44-a0d9-4182ef9f9be6] hello and you [@john|shortcutapp://members/5dc00b1d-aa52-4a44-a0d9-4182ef9f9be7] how are you. Also [@johnSmith|shortcutapp://members/5dc00b1d-aa52-4a44-a0d9-4182ef9f9be8]',
    author: 'abc123',
    created: data.stories[0].comments[0].created,
  });
});

describe('Tasks', () => {
  let storyWithTasks: CommonStoryModelItem;
  beforeEach(() => {
    storyWithTasks = Object.assign(data.stories[0], {});
  });

  test('Maps tasks and creates the links to parent story', () => {
    expect(task).toEqual({
      status: 'To Do',
      reporter: 'abc456',
      summary: `${data.stories[0].tasks[0].name.substring(0, 252)}...`,
      description: data.stories[0].tasks[0].description,
      issueType: 'Sub-task',
      created: data.stories[0].tasks[0].created,
      updated: data.stories[0].tasks[0].updated,
      externalId: data.stories[0].tasks[0].id?.toString(),
      components: data.stories[0].components,
      key: generateTaskId(+(data.stories[0].tasks[0].id || 0), 'HOTT'),
    });
    expect(link).toEqual({
      name: data.stories[0].tasks[0].description.split('\n')[0],
      sourceId: data.stories[0].tasks[0].id?.toString(),
      destinationId: data.stories[0].externalId,
    });
  });

  test('Ignores tasks with blank names', async () => {
    storyWithTasks.tasks[0].name = '';
    expect(await mapTasks([storyWithTasks], [], 'HABC')).toHaveLength(0);
  });
});

test('Adds epics to issues', () => {
  expect(epic).toBeDefined();
  expect(epic.status).toEqual('To Do');
  expect(epic.key).toEqual(generateEpicId(+data.epics[0].id, projectId));
  expect(epic.reporter).toEqual('abc456');
  expect(epic.summary).toEqual(data.epics[0].name);
  expect(epic.issueType).toEqual('Epic');
  expect(epic.created).toEqual(data.epics[0].created);
  expect(epic.updated).toEqual(data.epics[0].updated);
  expect(epic.externalId).toEqual(data.epics[0].id?.toString());
  expect(epic.customFieldValues).toContainEqual({
    fieldName: 'Epic Name',
    fieldType: 'com.pyxis.greenhopper.jira:gh-epic-label',
    value: data.epics[0].name,
  });
  expect(story.customFieldValues).toContainEqual({
    fieldName: 'Epic Link',
    fieldType: 'com.pyxis.greenhopper.jira:gh-epic-link',
    value: epic.key,
  });
  expect(epic.components).toEqual(data.epics[0].components);
});

test('Links epic to story', () => {
  expect(story.customFieldValues).toContainEqual({
    fieldName: 'Epic Link',
    fieldType: 'com.pyxis.greenhopper.jira:gh-epic-link',
    value: generateEpicId(+data.epics[0].id, projectId),
  });
});

test('Links sprint to story', () => {
  const customFieldValue: any = story.customFieldValues.find((item: any) => item.fieldName === 'Sprint');
  expect(customFieldValue).toBeDefined();
  expect(customFieldValue.fieldName).toEqual('Sprint');
  expect(customFieldValue.fieldType).toEqual('com.pyxis.greenhopper.jira:gh-sprint');
  expect(customFieldValue.value).toEqual([{
    rapidViewId: boardId,
    state: 'CLOSED',
    startDate: data.sprints[0].start,
    endDate: data.sprints[0].end,
    completeDate: data.sprints[0].end,
    name: data.sprints[0].name,
  }]);
});

test('Maps story type', () => {
  expect(mappedData.projects[0].issues[1].issueType).toEqual('Task');
});

describe('Sprint statuses', () => {
  let sprint: CommonSprintModel;
  beforeEach(() => {
    sprint = {
      id: 123,
      name: 'Bla',
      start: '2022-01-02',
      completed: false,
    };
  });

  test('CLOSED if completed is true', () => {
    Object.assign(sprint, { completed: true });
    expect(getSprintStatus(sprint)).toEqual('CLOSED');
  });

  test('CLOSED if end is in the past', () => {
    Object.assign(sprint, { end: '2010-01-01' });
    expect(getSprintStatus(sprint)).toEqual('CLOSED');
  });

  test('FUTURE if start is in the future', () => {
    Object.assign(sprint, { start: '2500-01-01' });
    expect(getSprintStatus(sprint)).toEqual('FUTURE');
  });

  test('ACTIVE if now is within start and end', () => {
    Object.assign(sprint, { start: '1800-01-01', end: '2500-01-01' });
    expect(getSprintStatus(sprint)).toEqual('ACTIVE');
  });
});

describe('getDestSeed', () => {
  test('Generates epic ID', () => {
    const seed = generateEpicId(1, 'HOT');
    expect(seed).toEqual('HOT-150001');
  });

  test('Generates issue ID', () => {
    const seed = generateIssueId(1, 'HOT');
    expect(seed).toEqual('HOT-200001');
  });

  test('Generates task ID', () => {
    const seed = generateTaskId(1, 'HOT');
    expect(seed).toEqual('HOT-300001');
  });

  test('Generates epic ID', () => {
    const seed = generateEpicId(1, 'HOT');
    expect(seed).toEqual('HOT-150001');
  });
});
